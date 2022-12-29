const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const InternalServerError = require("../exceptions/InternalServerError");
const NotFound = require("../exceptions/NotFound");
const {NotFoundError} = require("@prisma/client/runtime");
const BadRequest = require("../exceptions/BadRequest");


const prisma = new PrismaClient();

module.exports.createUser = async (userData) => {
    const salt = await bcrypt.genSalt(10);
    userData.password = await bcrypt.hash(userData.password, salt);

    try {
        await prisma.User.create({
            data: {
                ...userData
            }
        });
        return {message: "Successful registration!"};
    } catch (exception) {
        console.log(exception);
        switch (exception.meta.target){
            case "User_username_key": throw new InternalServerError(["The username is already taken."]);
            case "User_email_key": throw new InternalServerError(["The email is already in use."]);
        }
        throw new InternalServerError("Something went wrong during signup.");
    } finally {
        await prisma.$disconnect();
    }
}

module.exports.getUserByUsername = async (username) => {
    try {
        return await prisma.User.findUniqueOrThrow({
            where: {
                username: username,
            }
        })
    } catch (exception) {
        if(exception instanceof NotFoundError){
            throw new NotFound(["Invalid username or password."])
        }
        throw new InternalServerError("Something went wrong during login.");
    }
}

module.exports.getUploadedRecipeCountById = async (userId) => {
    let recipeCount = 0;

    try {
        recipeCount = await prisma.Recipe.count({
            where: {
                userId: userId,
            }
        })
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }

    return recipeCount;
}

module.exports.createGroupForCurrentUser = async (name, userId) => {
    try {
        return await prisma.RecipeGroup.create({
            data: {
                name: name,
                userId: userId,
            }
        })
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

module.exports.getUserById = async (userId) => {
    try {
        return await prisma.User.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                username: true,
                email: true,
                firstname: true,
                lastname: true,
                profilepicture: true,
                emailValidated: true,
                difficultyPref: true,
                costPref: true,
            }
        })
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

module.exports.getUsersAllRecipesWithCommentsById = async (userId) => {
    try {
        return await prisma.Comment.findMany({
            where: {
                userId: userId,
            },
            select: {
                recipeId: true,
            }
        })
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

module.exports.getUsersAllRecipeIds = async (userId) => {
    try {
        return await prisma.Recipe.findMany({
            where: {
                userId: userId,
            },
            select: {
                id: true,
            }
        })
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

module.exports.getAllGroupsOfUserById = async (userId) => {
    try {
        return await prisma.RecipeGroup.findMany({
            where: {
                userId: userId,
            },
            select: {
                id: true,
                name: true,
            },
        })
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

module.exports.getAllGroupsOfFavouriteById = async (recipeId, userId) => {
    try {
        return await prisma.RecipeInGroup.findMany({
            where: {
                recipeId: recipeId,
                recipeGroup: {
                    userId: userId,
                }
            },
            select: {
                recipeGroup: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
            }
        })
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

module.exports.addRecipeToGroup = async (data) => {
    try {
        return await prisma.RecipeInGroup.create({
            data: {
                ...data
            }
        })
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

module.exports.editNameOfGroup = async (groupId, newName, userId) => {
    try {
        let updatedCount = await prisma.RecipeGroup.updateMany({
            where: {
                id: groupId,
                userId: userId,
            },
            data: {
                name: newName,
            }
        });

        if(updatedCount.count === 0){
            throw new BadRequest(["No group updated. You may not be authorized to make this change."])
        }
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

module.exports.deleteGroup = async (groupId, userId) => {
    try {
        let deletedCount = await prisma.RecipeGroup.deleteMany({
            where: {
                id: groupId,
                userId: userId,
            },
        });

        if(deletedCount.count === 0){
            throw new BadRequest(["No group deleted. You may not be authorized to make this change."])
        }
    } catch (error) {
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

module.exports.deleteRecipeFromGroup = async (groupId, recipeId, userId) => {
    try {
        let deletedCount = await prisma.RecipeInGroup.deleteMany({
            where: {
                groupId: groupId,
                recipeId: recipeId,
                recipeGroup: {
                    userId: userId,
                }
            },
        });

        if(deletedCount.count === 0){
            throw new BadRequest(["No recipe deleted from group. You may not be authorized to make this change."])
        }
    } catch (error) {
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

module.exports.deleteRecipeFromGroups = async (recipeId, userGroupIds) => {
    try {
        await prisma.RecipeInGroup.deleteMany({
            where: {
                recipeId: recipeId,
                groupId: {
                    in: userGroupIds,
                }
            }
        })
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

module.exports.getAllRecipeCardsOfGroup = async (sortBy, groupId, page, userId) => {
    let orderBy = {};

    if(sortBy === "nameAsc"){
        orderBy = {
            recipe: {
                name: "asc"
            }
        }
    } else if (sortBy === "nameDesc"){
        orderBy = {
            recipe: {
                name: "desc"
            }
        }
    } else if (sortBy === "uploadedAsc"){
        orderBy = {
            recipe: {
                uploaded: "asc"
            }
        }
    } else if (sortBy === "uploadedDesc"){
        orderBy = {
            recipe: {
                uploaded: "desc"
            }
        }
    } else if (sortBy === "addedToGroupAsc"){
        orderBy = {
            added: "asc"
        }
    } else if (sortBy === "addedToGroupDesc"){
        orderBy = {
            added: "desc"
        }
    }

    try {
        return await prisma.RecipeInGroup.findMany({
            skip: (page - 1) * 10,
            take: 10,
            where: {
                groupId: groupId,
                recipeGroup: {
                    userId: userId,
                }
            },
            select: {
                recipe: {
                    select: {
                        id: true,
                        name: true,
                        uploaded: true,
                        photo: true,
                    }
                }
            },
            orderBy: orderBy
        });
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}


module.exports.getRecipeCountOfGroup = async (groupId, userId) => {
    let recipeCount = 0;

    try {
        recipeCount = await prisma.RecipeInGroup.count({
            where: {
                groupId: groupId,
                recipeGroup:{
                    userId: userId,
                },
            }
        })
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }

    return recipeCount;
}