const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient();

module.exports.setItemsOfWeek = async (userId, nextWeek, items) => {
    try {
        for (let i = 0; i < items.length; i++) {
            items[i].userId = userId;
            items[i].nextWeek = Boolean(nextWeek);
        }

        await prisma.WeeklyMenuItem.deleteMany({
            where: {
                userId: userId,
                nextWeek: Boolean(nextWeek),
            }
        });

        return await prisma.WeeklyMenuItem.createMany({
            data: items,
        });
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

module.exports.updateOneForUser = async (userId, itemId, recipeId) => {
    try {
        return prisma.WeeklyMenuItem.updateMany({
            where: {
                id: itemId,
                userId: userId,
            },
            data: {
                recipeId: recipeId,
            }
        });

    } catch (error) {
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

module.exports.setDontRecommendForUser = async (userId, recipeId) => {
    try {
       return prisma.DontRecommend.create({
           data: {
               userId: userId,
               recipeId: recipeId,
           }
       });

    } catch (error) {
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

module.exports.getAllDontRecommendRecipesOfUser = async (userId) => {
    try {
        return prisma.DontRecommend.findMany({
            where: {
                userId: userId,
            },
            select: {
                recipeId: true,
            },
        });

    } catch (error) {
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

module.exports.getAllDontRecommendRecipeCardsOfCurrentUser = async (userId, page) => {
    try {
        return prisma.DontRecommend.findMany({
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
                },
            },

            orderBy: {
                timeOfAction: 'desc',
            }
        });

    } catch (error) {
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

module.exports.getAllDontRecommendRecipeCardsCountOfCurrentUser = async (userId) => {
    try {
        return prisma.DontRecommend.count({
            where: {
                userId: userId,
            },
        });
    } catch (error) {
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

module.exports.deleteDontRecommendOfCurrentUser = async (userId, recipeId) => {
    try {
        return prisma.DontRecommend.deleteMany({
            where: {
                userId: userId,
                recipeId: recipeId,
            },
        });

    } catch (error) {
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

module.exports.getRecipeCardsOfUser = async (userId, nextWeek) => {
    try {
        return prisma.WeeklyMenuItem.findMany({
            where: {
                userId: userId,
                nextWeek: Boolean(nextWeek),
            },
            select: {
                id: true,
                day: true,
                meal: true,
                recipe: {
                    select: {
                        id: true,
                        name: true,
                        minute: true,
                        difficulty: true,
                        cost: true,
                        portions: true,
                        calories: true,
                        photo: true,
                        ingredients: {
                            select: {
                                name: true,
                                amount: true,
                                unitId: true,
                            }
                        },
                    },
                }

            },
        });

    } catch (error) {
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

module.exports.makeNextWeekThisWeek = async () => {
    try {
        await prisma.WeeklyMenuItem.deleteMany({
          where: {
              nextWeek: false,
          },
        });

        await prisma.WeeklyMenuItem.updateMany({
            where: {
                nextWeek: true,
            },
            data: {
                nextWeek: false,
            },
        })

    } catch (error) {
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

