const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const InternalServerError = require("../exceptions/InternalServerError");
const NotFound = require("../exceptions/NotFound");
const {NotFoundError} = require("@prisma/client/runtime");
const BadRequest = require("../exceptions/BadRequest");
const fs = require("fs");

const prisma = new PrismaClient();

/**
 * Repository function for registering a new user.
 * Hashes the user's password and inserts new record into the User table.
 * @param userData registration data of new user
 * @returns new user record as object
 */
module.exports.createUser = async (userData) => {
    // hash password
    const salt = await bcrypt.genSalt(10);
    userData.password = await bcrypt.hash(userData.password, salt);

    try {
        return await prisma.User.create({
            data: {
                ...userData
            }
        });
    } catch (exception) {
        console.log(exception);
        switch (exception.meta.target){
            case "User_username_key": throw new BadRequest(["The username is already taken."]);
            case "User_email_key": throw new BadRequest(["The email is already in use."]);
        }
        throw new InternalServerError("Something went wrong during signup.");
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * Repository function for verifying email of user by their generated JWT.
 * Sets user's emailVerified attribute to true in the User table.
 * @param userId userId of user
 */
module.exports.verifyEmailByUserId = async (userId) => {
    try {
        await prisma.User.update({
            where: {
                id: userId,
            },
            data: {
                emailVerified: true,
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
 * Repository function for generating new password for user and sending it to their email address.
 * Hashes the new password and updates it in user's record
 * @param email email of user
 * @param newPassword new password to set for user
 */
module.exports.updatePassword = async (email, newPassword) => {
    // hash password
    const salt = await bcrypt.genSalt(10);
    newPassword = await bcrypt.hash(newPassword, salt);

    try {
        await prisma.User.update({
            where: {
                email: email,
            },
            data: {
                password: newPassword,
            }
        });
    } catch (error) {
        if (error.meta.cause === "Record to update not found."){
            throw new NotFound(["There is no user with this email."]);
        }

        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * Deletes user by userId if user's email is unverified from User table.
 * @param userId userId of user to delete
 */
module.exports.deleteUnverifiedUserById = async (userId) => {
    try {
        await prisma.User.deleteMany({
            where: {
                id: userId,
                emailVerified: false,
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
 * Repository function for logging in as an existing user.
 * Gets user with a matching username from the User table, if it exists.
 * @param username username of user to get
 * @returns record of user as object
 */
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

/**
 * Repository function for getting user's uploaded recipe count by userId.
 * Gets count of recipes with a matching userId.
 * @param userId userId of user
 * @returns number of given user's uploaded recipes
 */
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

/**
 * Repository function for getting data of user by userId.
 * Gets user with a matching userId from the User table.
 * @param userId userId of user to get
 * @returns  user data of given user
 */
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
                emailVerified: true,
                difficultyPref: true,
                costPref: true,
                diet: true,
                joined: true,
                allergies: {
                    include: {
                        allergen: {
                            select: {
                                id: true,
                                name: true,
                            },
                        }
                    }
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

/**
 * Repository function for getting admin attribute of user.
 * Gets admin attribute of user with a matching userId from the User table.
 * @param userId userId of user
 * @returns admin attribute of given user
 */
module.exports.isAdmin = async (userId) => {
    try {
        return await prisma.User.findUnique({
            where: {
                id: userId,
            },
            select: {
                admin: true,
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
 * Repository function for changing password of user.
 * Gets hashed password of user with a matching userId form the User table.
 * @param userId userId of user
 * @returns hashed password of user
 */
module.exports.getUserPasswordById = async (userId) => {
    let user;

    try {
        user = await prisma.User.findUnique({
            where: {
                id: userId,
            },
            select: {
                password: true,
            }
        })

        return user.password;
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * Repository function for getting all recipeIds that user has commented on.
 * Gets all recipeId of comments with a matching userId from Comment table.
 * @param userId userId of user
 * @returns recipeId of recipes the user has commented on
 */
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

/**
 * Repository function for getting all recipeIds of recipes uploaded by user.
 * Gets recipeId of all recipes with a matching userId from Recipe table.
 * @param userId userId of user
 * @returns recipeId of recipes uploaded by the user
 */
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

/**
 * Repository function for getting all recipe cards of recipes uploaded by user, sorted and paginated.
 * Gets given page of recipe cards with a matching userId from Recipe table, sorted.
 * @param userId userId of user
 * @param sortBy sort cards by (options: nameAsc, nameDesc, uploadedAsc, uploadedDesc)
 * @param page page to get
 * @returns user's recipe cards of given page
 */
module.exports.getUsersAllRecipeCards = async (userId, sortBy, page) => {
    // construct order by object for prisma
    let orderBy = {};
    if(sortBy === "nameAsc"){
        orderBy = {
            name: "asc"
        }
    } else if (sortBy === "nameDesc"){
        orderBy = {
            name: "desc"
        }
    } else if (sortBy === "uploadedAsc"){
        orderBy = {
            uploaded: "asc"
        }
    } else if (sortBy === "uploadedDesc") {
        orderBy = {
            uploaded: "desc"
        }
    }

    try {
        return await prisma.Recipe.findMany({
            skip: (page - 1) * 10,
            take: 10,
            where: {
                userId: userId,
            },
            select: {
                id: true,
                name: true,
                uploaded: true,
                photo: true,
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
 * Repository function for getting count of all verified users.
 * Gets count of all users with their emailVerified attribute set to true in the User table.
 * @returns number of all verified users
 */
module.exports.getAllVerifiedUserCount = async () => {
    let userCount = 0;

    try {
        userCount = await prisma.User.count({
            where: {
                emailVerified: true,
            },
        });
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }

    return userCount;
}

/**
 * Repository function for changing password of user.
 * Hashes the new password and updates it in user's record in the User table.
 * @param newPassword new password to set for user
 * @param userId userId of user
 */
module.exports.changePassword = async (newPassword, userId) => {
    // hash password
    const salt = await bcrypt.genSalt(10);
    newPassword = await bcrypt.hash(newPassword, salt);

    try {
        let updatedCount = await prisma.User.update({
            where: {
                id: userId,
            },
            data: {
                password: newPassword,
            }
        });

        if(updatedCount.count === 0){
            throw new BadRequest(["Changing password failed."])
        }
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * Repository function for editing profile data of user.
 * Updates record of user with a matching userId in the User table to the given values.
 * @param userData object containing the data of the edited user
 * @param userId userId of user
 */
module.exports.editProfileOfUser = async (userData, userId) => {
    try {
        // construct data object for prisma
        let dataObject = {
            username: userData.username.trim(),
            firstname: userData.firstname ? userData.firstname.trim() : null,
            lastname: userData.lastname ? userData.lastname.trim() : null,
        }

        if(userData.deletePfp){
            dataObject.profilepicture = null;
        }

        await prisma.User.update({
            where: {
                id: userId
            },
            data: dataObject,
        });
    } catch (error) {
        console.log(error);
        switch (error.meta.target){
            case "User_username_key": throw new InternalServerError(["The username is already taken."]);
            case "User_email_key": throw new InternalServerError(["The email is already in use."]);
        }
        throw new InternalServerError("Something went wrong during profile editing.");
    }
}

/**
 * Repository function for editing profile of user by userId as admin.
 * Updates record of user with a matching userId in the User table to the given values.
 * Can update the email address of the user as well.
 * @param userData object containing the data of the edited user
 * @param userId userId of user
 */
module.exports.editProfileAdmin = async (userData, userId) => {
    try {
        let dataObject = {
            username: userData.username.trim(),
            email: userData.email.trim(),
            firstname: userData.firstname ? userData.firstname.trim() : null,
            lastname: userData.lastname ? userData.lastname.trim() : null,
        }

        if(userData.deletePfp){
            dataObject.profilepicture = null;
        }

        await prisma.User.update({
            where: {
                id: userId
            },
            data: dataObject,
        });
    } catch (error) {
        console.log(error);
        switch (error.meta.target){
            case "User_username_key": throw new InternalServerError(["The username is already taken."]);
            case "User_email_key": throw new InternalServerError(["The email is already in use."]);
        }
        throw new InternalServerError("Something went wrong during profile editing.");
    }
}

/**
 * Repository function for uploading profile picture for user.
 * Updates the profilepicture attribute of user with a matching userId to the given filename in the User table.
 * If database update was not successful, deletes image of the given filename.
 * @param image profile picture filename
 * @param userId userId of user
 */
module.exports.uploadImage = async (image, userId) => {
    try{
        await prisma.User.update({
            where: {
                id: userId
            },
            data: {
                profilepicture: image.filename
            }
        })

    } catch (error) {
        console.log(error);

        // delete image
        const directory = "./uploads/pfps/"
        fs.readdir(directory, (err, files) => {
            files.forEach(file => {
                if(file.split('.')[0] === String(userId)){
                    fs.unlinkSync(directory + file);
                }
            });
        });

        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * Repository function for editing weekly menu preferences of user.
 * Updates user's preferences in the UserAllergy and User tables.
 * @param prefData object of user's edited preferences
 * @param userId userId of user
 * @returns {Promise<void>}
 */
module.exports.editPreferencesOfUser = async (prefData, userId) => {
    // construct data object for prisma
    let userAllergies = [];
    for (let i = 0; i < prefData.allergies.length; i++) {
        userAllergies.push({
           userId: userId,
           allergenId: prefData.allergies[i],
        });
    }

    try {
        // delete user allergies
        await prisma.UserAllergy.deleteMany({
            where: {
                userId: userId,
            }
        });

        // insert new user allergies
        await prisma.UserAllergy.createMany({
            data: userAllergies,
        });

        // update difficulty, cost, and diet user preferences
         await prisma.User.update({
            where: {
                id: userId,
            },
            data: {
                difficultyId: prefData.difficultyId ? Number(prefData.difficultyId) : null,
                costId: prefData.costId ? Number(prefData.costId) : null,
                dietId: prefData.dietId ? Number(prefData.dietId) : null,
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
 * Gets every verified user's userId from the User table.
 * @returns every verified user's userId as an array of objects
 */
module.exports.getAllVerifiedUserIds = async () => {
    try {
        return  await prisma.User.findMany({
            where: {
                emailVerified: true,
            },
            select: {
                id: true,
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
 * Repository function for getting all users as admin, filtered, sorted, and paginated.
 * Queries all users of given page, sorted and filtered based on the sortBy and searchData objects.
 * @param sortBy sort cards by (options: idAsc, idDesc, usernameAsc, usernameDesc, emailAsc, emailDesc, joinedAsc,
 * joinedDesc, statusAsc, statusDesc)
 * @param page page to get
 * @param searchData object containing the set filter options (search by id, username, or email)
 * @returns filtered user objects of given page, sorted
 */
module.exports.getAllUsers = async (sortBy, page, searchData) => {
    // construct orderBy object for prisma
    let orderBy = {};
    switch (sortBy) {
        case "idAsc":  orderBy = {id: "asc"}; break;
        case "idDesc":  orderBy = {id: "desc"}; break;
        case "usernameAsc":  orderBy = {username: "asc"}; break;
        case "usernameDesc":  orderBy = {username: "desc"}; break;
        case "emailAsc":  orderBy = {email: "asc"}; break;
        case "emailDesc":  orderBy = {email: "desc"}; break;
        case "joinedAsc":  orderBy = {joined: "asc"}; break;
        case "joinedDesc":  orderBy = {joined: "desc"}; break;
        case "statusAsc":
            orderBy = [
                {
                    admin: "asc",
                },
                {
                    emailVerified: "asc",
                }
            ]; break;
        case "statusDesc":  orderBy = orderBy = [
            {
                admin: "desc",
            },
            {
                emailVerified: "desc",
            }
        ]; break;

    }

    try {
        return  await prisma.User.findMany({
            skip: (page - 1) * 25,
            take: 25,

            where: {
                id: {
                    equals: searchData.id ? Number(searchData.id) : undefined,
                },
                username: {
                    contains: searchData.username,
                },
                email: {
                    contains: searchData.email,
                },
            },

            orderBy: orderBy,

            select: {
                id: true,
                username: true,
                email: true,
                joined: true,
                admin: true,
                emailVerified: true,
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
 * Repository function for getting number of all registered users as admin.
 * Gets number of users fitting the given filters.
 * @param searchData object containing the set filter options
 * @returns count of all registered users fitting the set filters
 */
module.exports.getAllUsersCount = async (searchData) => {
    try {
        return  await prisma.User.count({
            where: {
                id: {
                    equals: searchData.id ? Number(searchData.id) : undefined,
                },
                username: {
                    contains: searchData.username,
                },
                email: {
                    contains: searchData.email,
                },
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
 * Repository function for setting verified attribute of user by userId as admin.
 * Updates emailVerified attribute of user with fitting userId in User table.
 * If emailVerified attribute is set to false, the admin attribute also gets set to false.
 * @param verified verified value to set (boolean)
 * @param userId userId of user
 */
module.exports.setVerified = async (verified, userId) => {
    // construct data object for prisma
    let dataObj = {
        emailVerified: Boolean(verified)
    }

    if(!dataObj.emailVerified){
        dataObj.admin = false;
    }

    try {
        await prisma.User.update({
            where: {
                id: userId,
            },
            data: dataObj,
        });
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * Repository function for setting admin attribute of user by userId as admin.
 * Updates admin attribute of user with fitting userId in User table.
 * The emailVerified attribute is always set to true, regardless of admin value.
 * @param admin admin value set (boolean)
 * @param userId userId of user
 */
module.exports.setAdmin = async (admin, userId) => {
    try {
        await prisma.User.update({
            where: {
                id: userId,
            },
            data: {
                emailVerified: true,
                admin: Boolean(admin),
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
 * Repository function for deleting user by userId.
 * Deletes user with a matching userId from the User table.
 * @param userId userId of user to delete
 * @returns user record that was deleted as object
 */
module.exports.deleteUserById = async (userId) => {
    try {
        return await prisma.User.delete({
            where: {
                id: userId,
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
 * Repository function for getting user ranking as admin.
 * Gets all verified users from the User table and the number of recipes and comments they have written so far.
 * @returns all verified users and the number of recipes and comments they have written
 */
module.exports.getRankedUsers = async () => {
    try {
        return await prisma.User.findMany({
            where: {
                emailVerified: true,
            },

            select: {
                id: true,
                username: true,
                joined: true,
                _count: {
                    select: {
                        recipes: true,
                        comments: true,
                    }
                },
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
 * Deletes every unverified user from the User table whose account has been created more than 15 minutes ago.
 * @returns number of users deleted
 */
module.exports.deleteOldUnverifiedUsers = async () => {
    try {
        return await prisma.User.deleteMany({
            where: {
                emailVerified: false,
                joined: {
                    lte: new Date(Date.now() - 15 * 60000), //15 minutes ago
                }
            }
        });
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}