const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient();

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