const { PrismaClient } = require('@prisma/client')
const InternalServerError = require("../exceptions/InternalServerError");

const prisma = new PrismaClient();

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

module.exports.getallUserFavourites = async (userId) => {
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