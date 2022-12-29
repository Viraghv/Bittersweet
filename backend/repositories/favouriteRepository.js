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
