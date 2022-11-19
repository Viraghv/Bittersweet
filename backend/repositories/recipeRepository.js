const { PrismaClient } = require('@prisma/client')
const InternalServerError = require("../exceptions/InternalServerError");
const {session} = require("../session/sessionStorage");

const prisma = new PrismaClient();


module.exports.createOneRecipe = async (recipeData, userId) => {
    let newRecipe;
    try {
        newRecipe = await prisma.Recipe.create({
            data: {
                name: recipeData.name,
                description: recipeData.description,
                hour: recipeData.timeHour ? recipeData.timeHour : null,
                minute: recipeData.timeMinute ? recipeData.timeMinute : null,
                difficultyId: recipeData.difficulty ? recipeData.difficulty : null,
                costId: recipeData.cost ? recipeData.cost : null,
                calories: recipeData.calories ? recipeData.calories : null,
                portions: recipeData.portions ? recipeData.portions : null,
                photo: "default",
                userId: userId
            }
        });

        for(const ingredient of recipeData.ingredients){
            await  prisma.Ingredient.create({
                data: {
                    name: ingredient.name,
                    amount: ingredient.amount ? ingredient.amount : null,
                    recipeId: newRecipe.id,
                    unitId: ingredient.unit ? ingredient.unit : null,
                }
            })
        }

        for(const step of recipeData.steps){
            await prisma.Step.create({
                data: {
                    number: step.number,
                    content: step.content,
                    recipeId: newRecipe.id
                }
            })
        }

        if(Array.isArray(recipeData.categories)){
            for(const oneCategory of recipeData.categories){
                await prisma.RecipeInCategory.create({
                    data: {
                        categoryId: oneCategory.category,
                        recipeId: newRecipe.id,
                        primary: oneCategory.primary
                    }
                })
            }
        }

        if(Array.isArray(recipeData.allergens)){
            for (let i = 0; i < recipeData.allergens.length; i++) {
                await prisma.AllergenInRecipe.create({
                    data: {
                        allergenId: recipeData.allergens[i],
                        recipeId: newRecipe.id,
                    }
                })
            }
        }

        return newRecipe.id;

    } catch (exception) {
        console.log(exception);

        if(newRecipe){
            await prisma.Recipe.delete({
                where: {
                    id: newRecipe.id
                }
            })
        }

        throw new InternalServerError(["Something went wrong during the creation of the recipe."]);
    } finally {
        await prisma.$disconnect();
    }

}

module.exports.uploadImage = async (filename, recipeId) => {
    try{
        await prisma.Recipe.update({
            where: {
                id: recipeId
            },
            data: {
                photo: filename
            }
        })
    } catch (error) {
        console.log(error);


        try{
            await prisma.Recipe.delete({
                where: {
                    id: recipeId
                }
            })
        } catch (error){
            console.log(error);
            throw new InternalServerError(["Something went wrong!"]);
        }

        throw new InternalServerError(["Something went wrong during the creation of the recipe."]);
    } finally {
        await prisma.$disconnect();
    }

}

module.exports.getAllUnits = async () => {
    let units = [];
    try {
        units = await prisma.Unit.findMany({
            select: {
                id: true,
                name: true,
            }
        })
    } catch (error){
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }

    return units;
}

module.exports.getAllDifficulties = async () => {
    let difficulties = [];
    try {
        difficulties = await prisma.Difficulty.findMany({
            orderBy: [
                {
                    id: 'asc',
                }
            ],
            select: {
                id: true,
                name: true,
            }
        })
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }

    return difficulties;
}

module.exports.getAllCategories = async () => {
    let categories = [];
    try {
        categories = await prisma.RecipeCategory.findMany({
            select: {
                id: true,
                name: true,
            }
        })
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }

    return categories;
}

module.exports.getAllAllergens = async () => {
    let allergens = [];
    try {
        allergens = await prisma.Allergen.findMany({
            select: {
                id: true,
                name: true,
            }
        })
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }

    return allergens;
}

module.exports.getAllCosts = async () => {
    let costs = [];
    try {
        costs = await prisma.Cost.findMany({
            orderBy: [
                {
                    id: 'asc',
                }
            ],
            select: {
                id: true,
                name: true,
            }
        })
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }

    return costs;
}