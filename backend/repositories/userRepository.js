const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const InternalServerError = require("../exceptions/InternalServerError");
const NotFound = require("../exceptions/NotFound");
const {NotFoundError} = require("@prisma/client/runtime");


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