const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient();

/**
 * Repository function for generating weekly menu by week for user.
 * Deletes the given week's weekly menu items for user and inserts the new ones.
 * @param userId userId of user
 * @param nextWeek week to insert (0: this week, 1: next week)
 * @param items array of item objects to insert
 * @returns inserted weekly menu as array of weekly menu item objects
 */
module.exports.setItemsOfWeek = async (userId, nextWeek, items) => {
    try {
        // construct data object for prisma
        for (let i = 0; i < items.length; i++) {
            items[i].userId = userId;
            items[i].nextWeek = Boolean(nextWeek);
        }

        // delete given week's weekly menu
        await prisma.WeeklyMenuItem.deleteMany({
            where: {
                userId: userId,
                nextWeek: Boolean(nextWeek),
            }
        });

        // insert new menu items
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

/**
 * Repository function for generating one new recipe for user's weekly menu instead of the already existing one
 * by weeklyMenuItemId.
 * Updates an already existing weekly menu item by itemId to be connected to a different recipe.
 * @param userId userId of user
 * @param itemId itemId of weeklyMenuItem to update
 * @param recipeId recipeId of recipe to change recommendation to
 */
module.exports.updateOneForUserByItemId = async (userId, itemId, recipeId) => {
    try {
        await prisma.WeeklyMenuItem.updateMany({
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

/**
 * Repository function for generating one new recipe for user's weekly menu by week, day, and meal.
 * Updates weekly menu item by userId, nextWeek, day, and meal attributes.
 * @param userId userId of user
 * @param itemData object containing the week, day, meal, recipeId, and unsetByUser attributes
 */
module.exports.setOneOfCurrentUserByMeal = async (userId, itemData) => {
    try {
        await prisma.WeeklyMenuItem.updateMany({
            where: {
                userId: userId,
                nextWeek: Boolean(itemData.nextWeek),
                day: itemData.day !== null ? Number(itemData.day) : null,
                meal: Number(itemData.meal),
            },
            data: {
                recipeId: itemData.recipeId ? Number(itemData.recipeId) : null,
                unsetByUser: Boolean(itemData.unsetByUser),
            }
        });

    } catch (error) {
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * Repository function for getting weekly menu recipe cards of user by week.
 * Gets recipe cards from the WeeklyMenuItem table with a matching userId and nextWeek attribute.
 * @param userId userId of user
 * @param nextWeek week to get (0: this week, 1: next week)
 * @returns recipeCards of user's weekly menu from the given week
 */
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
                unsetByUser: true,
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

/**
 * Repository function for setting recipe as "Don't recommend" for user.
 * Inserts new record to the DontRecommend table with given userId and recipeId.
 * @param userId userId of user
 * @param recipeId recipeId of recipe to set
 * @returns created new record as object
 */
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

/**
 * Function for getting recipeIds of all recipes in user's "Don't recommend" list.
 * Gets all recipeIds from the DontRecommend table with a matching userId.
 * @param userId userId of user
 * @returns array of recipeIds of all recipes in user's "Don't recommend" list
 */
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

/**
 * Repository function for getting all "Don't recommend" recipes of user by page.
 * Gets all recipes of user's "Don't recommend" recipes by given page.
 * @param userId userId of user
 * @param page page to get
 * @returns array of all "Don't recommend" recipe cards of user for given page
 */
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

/**
 * Repository function for getting count of user's all "Don't recommend" recipes.
 * Gets count of records from the DontRecommend table with a matching userId.
 * @param userId userId of user
 * @returns count of user's all "Don't recommend" recipes
 */
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

/**
 * Repository function for removing recipe from user's "Don't recommend" recipes.
 * Deletes record from the DontRecommend table with a matching userId and recipeId.
 * @param userId userId of user
 * @param recipeId recipeId of recipe to remove
 * @returns number of records deleted
 */
module.exports.deleteDontRecommendOfUser = async (userId, recipeId) => {
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

/**
 * Updates the WeeklyMenuItem table so every user's weekly menu for "this week" is deleted, and the
 * "next week" items are changed to "this week".
 */
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

