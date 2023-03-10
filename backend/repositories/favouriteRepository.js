const { PrismaClient } = require('@prisma/client')
const BadRequest = require("../exceptions/BadRequest");

const prisma = new PrismaClient();

/**
 * Repository function for adding recipe by recipeId to user's favourites.
 * Adds record of recipeId and userId to Favourite table.
 * @param recipeId recipeId of recipe
 * @param userId userId of user
 * @returns created favourite record as object
 */
module.exports.addById = async (recipeId, userId) => {
    try {
       return await prisma.Favourite.create({
            data: {
                recipeId: recipeId,
                userId: userId,
            }
        });
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * Repository function for deleting recipe by recipeId from user's favourites.
 * Deletes record that matches recipeId and userId from Favourites table.
 * @param recipeId recipeId of recipe
 * @param userId userId of user
 * @returns number of records deleted (0-1)
 */
module.exports.deleteById = async (recipeId, userId) => {
    try {
        return await prisma.Favourite.deleteMany({
            where: {
                recipeId: recipeId,
                userId: userId,
            }
        });
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * Repository function for getting all favourite recipeIds of user.
 * Queries all recipeIds of records from Favourite table that match the userId.
 * @param userId userId of user
 * @returns array of recipeIds as objects
 */
module.exports.getAllUserFavourites = async (userId) => {
    try {
        return await prisma.Favourite.findMany({
           where: {
               userId: userId,
           },
           select: {
               recipeId: true,
           }
        });
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * Repository function for getting all favourite recipe cards of user, sorted, by page.
 * Queries all favourite recipes of user.
 * @param page page to get
 * @param sortBy sort cards by (options: nameAsc, nameDesc, uploadedAsc, uploadedDesc, addedToFavouritesAsc, addedToFavouritesDesc)
 * @param userId userId of user
 * @returns array of objects containing recipe card objects
 */
module.exports.getAllUserFavouriteCards = async (page, sortBy, userId) => {
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
    } else if (sortBy === "addedToFavouritesAsc"){
        orderBy = {
            added: "asc"
        }
    } else if (sortBy === "addedToFavouritesDesc"){
        orderBy = {
            added: "desc"
        }
    }

    try {
        return await prisma.Favourite.findMany({
            skip: (page - 1) * 10,
            take: 10,
            where: {
                userId: userId,
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

/**
 * Repository function for getting the count of user's all favourites.
 * Queries the count of records in the Favourite table with a matching userId.
 * @param userId userId of user
 * @returns count of user's favourite recipes
 */
module.exports.getAllUserFavouriteCount = async (userId) => {
    let favouritesCount = 0;

    try {
        favouritesCount = await prisma.Favourite.count({
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

    return favouritesCount;
}

/**
 * Repository function for creating a new group for a user.
 * Creates new record in RecipeGroup table, with the given name and userId.
 * @param name name of new group
 * @param userId userId of user
 * @returns created new group record as object
 */
module.exports.createGroupForUser = async (name, userId) => {
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

/**
 * Repository function for editing group of user by groupId.
 * Updates name of group in RecipeGroup table matching the groupId and userId.
 * @param groupId groupId of group to be edited
 * @param newName new name of the group
 * @param userId userId of the group's user
 */
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

/**
 * Repository function for deleting group of user by groupId.
 * Deletes record from RecipeGroup table matching the groupId and userId.
 * @param groupId groupId of group to be deleted
 * @param userId userId of the group's user
 * @returns {Promise<void>}
 */
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

/**
 * Repository function for getting all groups of user.
 * Queries all the records from the RecipeGroup table matching the userId.
 * @param userId userId of user
 * @returns array of user's groups as objects
 */
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

/**
 * Repository function for getting all of a user's groups that a recipe is in by recipeId.
 * Queries all groups that are connected to the recipeId and userId.
 * @param recipeId recipeId of recipe
 * @param userId userId of user
 * @returns array of object containing groups as objects that the recipe is in
 */
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

/**
 * Repository function for adding recipe to group by groupId and recipeId.
 * Creates record in RecipeInGroup table with groupId and recipeId.
 * @param data object that contains the groupId and recipeId
 * @returns the created new record as an object
 */
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

/**
 * Repository function for deleting recipe from group by groupId and recipeId.
 * Deletes record from the RecipeInGroup table matching the groupId, recipeId, and connecting to the userId.
 * @param groupId groupId of group to be deleted from
 * @param recipeId recipeId of recipe to be deleted from group
 * @param userId userId of the group's user
 */
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

/**
 * Repository function for getting all recipe cards of group by groupId, sorted, by page.
 * Queries given page of recipe card data from the group matching the groupId, if group matches userId.
 * @param sortBy sort cards by (options: nameAsc, nameDesc, uploadedAsc, uploadedDesc, addedToGroupAsc, addedToGroupDesc)
 * @param groupId groupId of group
 * @param page page to get
 * @param userId userId of group's user
 * @returns array of objects containing group's recipe cards as objects
 */
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

/**
 * Repository function for getting count of recipes in group by groupId.
 * Queries count of RecipeInGroup table records matching the groupId and connecting to the userId.
 * @param groupId groupId of group
 * @param userId userId of group's user
 * @returns count of recipes in the group
 */
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

/**
 * Repository function for deleting recipe by recipeId from current user's favourites.
 * Deletes records from RecipeInGroup table if the recipeId matches and the groupId is in the userGroupIds array.
 * @param recipeId recipeId of recipe
 * @param userGroupIds array of groupIds of user's groups
 */
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