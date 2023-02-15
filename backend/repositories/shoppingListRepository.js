const { PrismaClient } = require('@prisma/client')
const BadRequest = require("../exceptions/BadRequest");

const prisma = new PrismaClient();

module.exports.getUserListById = async (userId) => {
    try {
        return await prisma.ShoppingListCategory.findMany({
            where: {
                userId: userId
            },

            select: {
                id: true,
                name: true,
                shoppingListItems: {
                    select: {
                        id: true,
                        name: true,
                        amount: true,
                        done: true,
                        unit: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
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

module.exports.addCategory = async (name, userId) => {
    try {
        return await prisma.ShoppingListCategory.create({
            data: {
                name: name,
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

module.exports.addItems = async (categoryId, items) => {
    for (let i = 0; i < items.length; i++) {
        items[i].categoryId = categoryId;
    }

    try {
        return await prisma.ShoppingListItem.createMany({
            data: [
                ...items,
            ]
        });
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

module.exports.editCategoryById = async (categoryId, name, userId) => {
    try {
        let updatedCount = await prisma.ShoppingListCategory.updateMany({
            where: {
                id: categoryId,
                userId: userId,
            },
            data: {
                name: name,
            }
        });

        if(updatedCount.count === 0){
            throw new BadRequest(["No category updated. You may not be authorized to make this change."])
        }
    } catch (error) {
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

module.exports.setItemDoneById = async (categoryId, done, userId) => {
    try {
        let updatedCount = await prisma.ShoppingListItem.updateMany({
            where: {
                id: categoryId,
                shoppingListCategory: {
                    userId: userId,
                }
            },
            data: {
                done: done,
            }
        });
    } catch (error) {
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

module.exports.deleteCategoryById = async (categoryId, userId) => {
    try {
        let deletedCount = await prisma.ShoppingListCategory.deleteMany({
            where: {
                id: categoryId,
                userId: userId,
            },
        });

        if(deletedCount.count === 0){
            throw new BadRequest(["No category deleted. You may not be authorized to make this change."])
        }
    } catch (error) {
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

module.exports.deleteAllCategoriesOfUser = async (userId) => {
    try {
        await prisma.ShoppingListCategory.deleteMany({
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


module.exports.deleteAllDoneItemsOfUser = async (userId) => {
    try {
        await prisma.ShoppingListItem.deleteMany({
            where: {
                done: true,
                shoppingListCategory: {
                    userId: userId,
                }
            },
        });
    } catch (error) {
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}