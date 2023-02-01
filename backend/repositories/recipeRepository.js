const { PrismaClient } = require('@prisma/client')
const InternalServerError = require("../exceptions/InternalServerError");
const {session} = require("../session/sessionStorage");
const HttpException = require("../exceptions/HttpException");
const BadRequest = require("../exceptions/BadRequest");
const fs = require("fs");

const prisma = new PrismaClient();


module.exports.createOneRecipe = async (recipeData, userId) => {
    let newRecipe;

    try {
        newRecipe = await prisma.Recipe.create({
            data: {
                name: recipeData.name,
                description: recipeData.description,
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

        if(Array.isArray(recipeData.diets)){
            for (let i = 0; i < recipeData.diets.length; i++) {
                await prisma.RecipeInDiet.create({
                    data: {
                        dietId: recipeData.diets[i],
                        recipeId: newRecipe.id,
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
            try{
                await prisma.Recipe.delete({
                    where: {
                        id: newRecipe.id
                    }
                })
            } catch (exception) {
                console.log(exception);
                throw new InternalServerError(["Something went wrong!"]);
            }

        }

        throw new InternalServerError(["Something went wrong during the creation of the recipe."]);
    } finally {
        await prisma.$disconnect();
    }

}

module.exports.uploadImage = async (image, recipeId) => {
    try{
        await prisma.Recipe.updateMany({
            where: {
                id: recipeId,
            },
            data: {
                photo: image.filename
            }
        })

    } catch (error) {
        console.log(error);

        const directory = "./uploads/recipe_images/"
        fs.readdir(directory, (err, files) => {
            files.forEach(file => {
                if(file.split('.')[0] === String(recipeId)){
                    fs.unlinkSync(directory + file);
                }
            });
        });

        throw new InternalServerError(["Something went wrong during the creation of the recipe."]);
    } finally {
        await prisma.$disconnect();
    }

}

module.exports.editRecipeOfUser = async (recipeId, recipeData, userId) => {
    let updatedCount;

    try {
        updatedCount = await prisma.Recipe.updateMany({
            where: {
                id: recipeId,
                userId: userId,
            },

            data: {
                name: recipeData.name,
                description: recipeData.description,
                minute: recipeData.timeMinute ? recipeData.timeMinute : null,
                difficultyId: recipeData.difficulty ? recipeData.difficulty : null,
                costId: recipeData.cost ? recipeData.cost : null,
                calories: recipeData.calories ? recipeData.calories : null,
                portions: recipeData.portions ? recipeData.portions : null,
                lastModified: new Date(Date.now()),
            }
        });


        await prisma.Ingredient.deleteMany({
            where: {
                recipeId: recipeId,
            }
        });

        let ingerdientsArray = [];
        for(const ingredient of recipeData.ingredients) {
            ingerdientsArray.push({
                name: ingredient.name,
                amount: ingredient.amount ? ingredient.amount : null,
                recipeId: recipeId,
                unitId: ingredient.unit ? ingredient.unit : null,
            });
        }

        await  prisma.Ingredient.createMany({
            data: ingerdientsArray,
        })


        await prisma.Step.deleteMany({
            where: {
                recipeId: recipeId,
            }
        });

        let stepsArray = [];
        for(const step of recipeData.steps){
           stepsArray.push({
               number: step.number,
               content: step.content,
               recipeId: recipeId
           })
        }

        await prisma.Step.createMany({
            data: stepsArray
        });



        await prisma.RecipeInCategory.deleteMany({
            where: {
                recipeId: recipeId,
            }
        });

        if(Array.isArray(recipeData.categories)){
            let categoriesArray = [];

            for(const category of recipeData.categories){
                categoriesArray.push({
                    categoryId: category.category,
                    recipeId: recipeId,
                    primary: category.primary
                });
            }

            await prisma.RecipeInCategory.createMany({
                data: categoriesArray,
            })
        }

        await prisma.RecipeInDiet.deleteMany({
            where: {
                recipeId: recipeId,
            }
        });

        if(Array.isArray(recipeData.diets)){
            let dietsArray = [];

            for (let i = 0; i < recipeData.diets.length; i++) {
                dietsArray.push({
                    dietId: recipeData.diets[i],
                    recipeId: recipeId,
                });
            }

            await prisma.RecipeInDiet.createMany({
                data: dietsArray,
            })
        }

        await prisma.AllergenInRecipe.deleteMany({
            where: {
                recipeId: recipeId,
            }
        });

        if(Array.isArray(recipeData.allergens)){
            let allergiesArray = [];

            for (let i = 0; i < recipeData.allergens.length; i++) {
               allergiesArray.push({
                   allergenId: recipeData.allergens[i],
                   recipeId: recipeId,
               });
            }

            await prisma.AllergenInRecipe.createMany({
                data: allergiesArray,
            })
        }

        return updatedCount;

    } catch (exception) {
        console.log(exception);
        throw new InternalServerError(["Something went wrong during editing the recipe."]);
    } finally {
        await prisma.$disconnect();
    }
}

module.exports.deleteRecipeOfUser = async (recipeId, userId) => {
    let deletedRecipeCount = 0;

    try {
        deletedRecipeCount = await prisma.Recipe.deleteMany({
            where: {
                id: recipeId,
                userId: userId,
            }
        });

        if (deletedRecipeCount.count === 0){
            throw new BadRequest(["Recipe not deleted. You may not be authorized to make this change."])
        }
    } catch (error) {
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

module.exports.getAllRecipeCount = async () => {
    let recipeCount = 0;

    try {
        recipeCount = await prisma.Recipe.count();
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }

    return recipeCount;
}

module.exports.getRecipeById = async (recipeId) => {
    let recipe;

    try {
        recipe = await prisma.Recipe.findUnique({
            where: {
                id: recipeId,
            },
            select: {
                name: true,
                description: true,
                minute: true,
                recipeCategories: {
                  include: {
                      recipeCategory: {
                          select: {
                              name: true,
                          }
                      },
                  }
                },
                difficulty: {
                    select: {
                        name: true,
                    }
                },
                cost: {
                    select: {
                        name: true,
                    }
                },
                portions: true,
                calories: true,
                photo: true,
                uploaded: true,
                lastModified: true,
                steps: {
                    select: {
                        number: true,
                        content: true,
                    }
                },
                ingredients: {
                    select: {
                        name: true,
                        amount: true,
                        unitId: true,
                        unit: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
                diets: {
                    include: {
                        diet: {
                            select: {
                                name: true,
                            }
                        },
                    }
                },
                allergens: {
                    include: {
                        allergen: {
                            select: {
                                name: true,
                            }
                        },
                    }
                },
                user: {
                    select: {
                        id: true,
                        username: true,
                        profilepicture: true,
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

    return recipe;
}

module.exports.getAllRecpieCardsWithPagination = async (page) => {
    let recipes = [];
    try {
        recipes = await prisma.Recipe.findMany({
            skip: (page - 1) * 12,
            take: 12,
            select: {
                id: true,
                name: true,
                minute: true,
                difficulty: {
                    select: {
                        name: true,
                    }
                },
                recipeCategories: {
                    where: {
                        primary: true,
                    },
                    include: {
                        recipeCategory: {
                            select: {
                                name: true,
                            }
                        },
                    }
                },
                photo: true,
            },
            orderBy: {
                uploaded: 'desc',
            }
        })
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }

    return recipes;
}

module.exports.getFilteredRecipeCards = async (sortBy, page, searchData) => {
    let orderBy = {};

    switch (sortBy) {
        case "nameAsc":  orderBy = {name: "asc"}; break;
        case "nameDesc":  orderBy = {name: "desc"}; break;
        case "uploadedAsc":  orderBy = {uploaded: "asc"}; break;
        case "uploadedDesc":  orderBy = {uploaded: "desc"}; break;
        case "timeAsc":  orderBy = {minute: "asc"}; break;
        case "timeDesc":  orderBy = {minute: "desc"}; break;
        case "caloriesAsc":  orderBy = {calories: "asc"}; break;
        case "caloriesDesc":  orderBy = {calories: "desc"}; break;
        case "portionsAsc":  orderBy = {portions: "asc"}; break;
        case "portionsDesc":  orderBy = {portions: "desc"}; break;
        case "difficultyAsc": orderBy = {
            difficulty: {
                level: "asc"
            }
        }; break;
        case "difficultyDesc": orderBy = {
            difficulty: {
                level: "desc"
            }
        }; break;
        case "costAsc": orderBy = {
            cost: {
                level: "asc"
            }
        }; break;
        case "costDesc": orderBy = {
            cost: {
                level: "desc"
            }
        }; break;
    }

    let filters = {};

    filters.name = {
        contains: searchData.search,
    }

    if(searchData.filters.timeFrom.minute || searchData.filters.timeTo.minute){
        filters.minute = {};
    }

    if(searchData.filters.timeFrom.minute){
        filters.minute.gte = searchData.filters.timeFrom.minute
    }

    if(searchData.filters.timeTo.minute){
        filters.minute.lte = searchData.filters.timeTo.minute
    }

    if(searchData.filters.excludeAllergens.length > 0){
        filters.allergens = {
            every: {
                allergenId: {
                    notIn: searchData.filters.excludeAllergens,
                }
            }
        }
    }

    if(searchData.filters.difficulties.length > 0) {
        filters.difficultyId = {
            in: searchData.filters.difficulties,
        }
    }

    if(searchData.filters.costs.length > 0) {
        filters.costId = {
            in: searchData.filters.costs,
        }
    }

    if(searchData.filters.categories.length > 0){
        filters.recipeCategories = {
            some: {
                categoryId: {
                    in: searchData.filters.categories,
                }
            }
        }
    }

    if(searchData.filters.diets.length > 0){
        filters.diets = {
            some: {
                dietId: {
                    in: searchData.filters.diets,
                }
            }
        }
    }

    if(searchData.filters.caloriesFrom || searchData.filters.caloriesTo) {
        filters.calories = {};
    }

    if(searchData.filters.caloriesFrom){
        filters.calories.gte = searchData.filters.caloriesFrom
    }

    if(searchData.filters.caloriesTo){
        filters.calories.lte = searchData.filters.caloriesTo
    }

    if(searchData.filters.portions){
        filters.portions = {
            equals: searchData.filters.portions,
        }
    }

    let recipes = [];
    let recipeCount = null;

    try {
        recipes = await prisma.Recipe.findMany({
            skip: (page - 1) * 12,
            take: 12,

            where: filters,

            select: {
                id: true,
                name: true,
                minute: true,
                difficulty: {
                    select: {
                        name: true,
                    }
                },
                recipeCategories: {
                    where: {
                        primary: true,
                    },
                    include: {
                        recipeCategory: {
                            select: {
                                name: true,
                            }
                        },
                    }
                },
                photo: true,
            },
            orderBy: orderBy
        });

        recipeCount = await prisma.Recipe.count({
           where: filters,
        });

    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }

    let response = {};
    response.recipes = recipes;
    response.recipeCount = recipeCount;

    return response;
}

module.exports.getRecipeIdsByUserPreference = async (user) => {
    let recipeIds = {};
    let preferences = {};

    if(user.allergies.length > 0){
        preferences.allergens = {
            every: {
                allergenId: {
                    notIn: user.allergies,
                }
            }
        }
    }

    if(user.diet){
        preferences.diets = {
            some: {
                dietId: user.diet.id,
            }
        }
    }

    if(user.difficultyPref){
        preferences.difficulty = {
            level: {
                lte: user.difficultyPref.level,
            }
        }
    }

    if(user.costPref){
        preferences.cost = {
            level: {
                lte: user.costPref.level,
            }
        }
    }

    try {
        preferences.recipeCategories = {
            some: {
                categoryId: 1, //breakfast
            }
        }

        recipeIds.breakfast = await prisma.Recipe.findMany({
            where: preferences,
            select: {
                id: true,
            }
        });

        preferences.recipeCategories = {
            some: {
                categoryId: 2, //lunch
            }
        }

        recipeIds.lunch = await prisma.Recipe.findMany({
            where: preferences,
            select: {
                id: true,
            }
        });

        preferences.recipeCategories = {
            some: {
                categoryId: 3, //dinner
            }
        }

        recipeIds.dinner = await prisma.Recipe.findMany({
            where: preferences,
            select: {
                id: true,
            }
        });

        preferences.recipeCategories = {
            some: {
                categoryId: 4, //dessert
            }
        }

        recipeIds.dessert = await prisma.Recipe.findMany({
            where: preferences,
            select: {
                id: true,
            }
        });


    } catch (error) {
        throw error;
    } finally {
        await prisma.$disconnect();
    }

    return recipeIds;
}

module.exports.getCommentsByRecipeId = async (recipeId, page) => {
    let comments = [];
    try {
        comments = await prisma.Comment.findMany({
            skip: (page - 1) * 5,
            take: 5,
            where: {
                recipeId: recipeId
            },
            select: {
                content: true,
                rating: true,
                uploaded: true,
                user: {
                    select: {
                        id: true,
                        username: true,
                        profilepicture: true,
                    }
                }

            },
            orderBy: {
                uploaded: 'desc',
            }
        })
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }

    return comments;
}

module.exports.getCommentCountById = async (recipeId) => {
    let commentCount = 0;

    try {
        commentCount = await prisma.Comment.count({
            where: {
                recipeId: recipeId,
            }
        })
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }

    return commentCount;
}

module.exports.getAverageRatingById = async (recipeId) => {
    let averageRating = 0;

    try {
        averageRating = await prisma.Comment.aggregate({
            _avg: {
                rating: true,
            },
            where: {
                recipeId: recipeId,
            }
        })
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }

    return averageRating._avg.rating;
}

module.exports.addComment = async (commentData, userId) => {
    try {
        return await prisma.Comment.create({
            data: {
                content: commentData.content,
                rating: commentData.rating,
                recipeId: commentData.recipeId,
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

module.exports.editComment = async (commentId, commentData, userId) => {
    let editCount = 0;

    try {
        editCount = await prisma.Comment.updateMany({
            where: {
                id: commentId,
                userId: userId,
            },
            data: {
                content: commentData.content,
                rating: commentData.rating,
            }
        });

        if (editCount.count === 0){
            throw new BadRequest(["Comment not edited. You may not be authorized to make this change."])
        }

        return editCount;
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

module.exports.getCommentByUserAndRecipeId = async (recipeId, userId) => {
    try {
        return  await prisma.Comment.findMany({
            where: {
                recipeId: recipeId,
                userId: userId,
            },
            select: {
                id: true,
                content: true,
                rating: true,
            }
        })
    } catch (error){
        console.log(error);
        throw error;
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

module.exports.getAllDiets = async () => {
    let diets = [];
    try {
        diets = await prisma.Diet.findMany({
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

    return diets;
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

module.exports.addUnit = async (unitName) => {
    try {
        return await prisma.Unit.create({
            data: {
                name: unitName.trim(),
            }
        });
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }

}

module.exports.editUnit = async (unitId, unitName) => {
    try {
        return await prisma.Unit.update({
            where: {
                id: unitId,
            },
            data: {
                name: unitName.trim(),
            }
        });
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }

}

module.exports.deleteUnit = async (unitId) => {
    try {
        await prisma.Unit.delete({
            where: {
                id: unitId,
            },
        });
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }

}

module.exports.addCategory = async (categoryName) => {
    try {
        return await prisma.RecipeCategory.create({
            data: {
                name: categoryName.trim(),
            }
        });
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }

}

module.exports.editCategory = async (categoryId, categoryName) => {
    try {
        return await prisma.RecipeCategory.update({
            where: {
                id: categoryId,
            },
            data: {
                name: categoryName.trim(),
            }
        });
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }

}

module.exports.deleteCategory = async (categoryId) => {
    try {
        await prisma.RecipeCategory.delete({
            where: {
                id: categoryId,
            },
        });
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }

}

module.exports.addDiet = async (dietName) => {
    try {
        return await prisma.Diet.create({
            data: {
                name: dietName.trim(),
            }
        });
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }

}

module.exports.editDiet = async (dietId, dietName) => {
    try {
        return await prisma.Diet.update({
            where: {
                id: dietId,
            },
            data: {
                name: dietName.trim(),
            }
        });
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

module.exports.deleteDiet = async (dietId) => {
    try {
        await prisma.Diet.delete({
            where: {
                id: dietId,
            },
        });
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

module.exports.addAllergen = async (allergenName) => {
    try {
        return await prisma.Allergen.create({
            data: {
                name: allergenName.trim(),
            }
        });
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }

}

module.exports.editAllergen = async (allergenId, allergenName) => {
    try {
        return await prisma.Allergen.update({
            where: {
                id: allergenId,
            },
            data: {
                name: allergenName.trim(),
            }
        });
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

module.exports.deleteAllergen = async (allergenId) => {
    try {
        await prisma.Allergen.delete({
            where: {
                id: allergenId,
            },
        });
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
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

module.exports.getAllRecipes = async (sortBy, page, searchData) => {
    let orderBy = {};

    switch (sortBy) {
        case "idAsc":  orderBy = {id: "asc"}; break;
        case "idDesc":  orderBy = {id: "desc"}; break;
        case "nameAsc":  orderBy = {name: "asc"}; break;
        case "nameDesc":  orderBy = {name: "desc"}; break;
        case "uploadedAsc":  orderBy = {uploaded: "asc"}; break;
        case "uploadedDesc":  orderBy = {uploaded: "desc"}; break;
        case "lastModifiedAsc":  orderBy = {lastModified: "asc"}; break;
        case "lastModifiedDesc":  orderBy = {lastModified: "desc"}; break;
        case "usernameAsc": orderBy = {
            user: {
                username: "asc"
            }
        }; break;
        case "usernameDesc": orderBy = {
            user: {
                username: "desc"
            }
        }; break;

    }

    try {
        return  await prisma.Recipe.findMany({
            skip: (page - 1) * 25,
            take: 25,

            where: {
                id: {
                    equals: searchData.id ? Number(searchData.id) : undefined,
                },
                name: {
                    contains: searchData.name,
                },
                user: {
                    username: {
                        contains: searchData.username,
                    }
                },
            },

            orderBy: orderBy,

            select: {
                id: true,
                name: true,
                uploaded: true,
                lastModified: true,
                user: {
                    select: {
                        username: true,
                    }
                }
            },
        })
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

module.exports.getAllAdminPageRecipesCount = async (searchData) => {
    try {
        return  await prisma.Recipe.count({
            where: {
                id: {
                    equals: searchData.id ? Number(searchData.id) : undefined,
                },
                name: {
                    contains: searchData.name,
                },
                user: {
                    username: {
                        contains: searchData.username,
                    }
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

module.exports.editRecipeAdmin = async (recipeId, recipeData) => {
    let updatedCount;

    try {
        updatedCount = await prisma.Recipe.updateMany({
            where: {
                id: recipeId,
            },

            data: {
                name: recipeData.name,
                description: recipeData.description,
                minute: recipeData.timeMinute ? recipeData.timeMinute : null,
                difficultyId: recipeData.difficulty ? recipeData.difficulty : null,
                costId: recipeData.cost ? recipeData.cost : null,
                calories: recipeData.calories ? recipeData.calories : null,
                portions: recipeData.portions ? recipeData.portions : null,
                lastModified: new Date(Date.now()),
            }
        });


        await prisma.Ingredient.deleteMany({
            where: {
                recipeId: recipeId,
            }
        });

        let ingerdientsArray = [];
        for(const ingredient of recipeData.ingredients) {
            ingerdientsArray.push({
                name: ingredient.name,
                amount: ingredient.amount ? ingredient.amount : null,
                recipeId: recipeId,
                unitId: ingredient.unit ? ingredient.unit : null,
            });
        }

        await  prisma.Ingredient.createMany({
            data: ingerdientsArray,
        })


        await prisma.Step.deleteMany({
            where: {
                recipeId: recipeId,
            }
        });

        let stepsArray = [];
        for(const step of recipeData.steps){
            stepsArray.push({
                number: step.number,
                content: step.content,
                recipeId: recipeId
            })
        }

        await prisma.Step.createMany({
            data: stepsArray
        });



        await prisma.RecipeInCategory.deleteMany({
            where: {
                recipeId: recipeId,
            }
        });

        if(Array.isArray(recipeData.categories)){
            let categoriesArray = [];

            for(const category of recipeData.categories){
                categoriesArray.push({
                    categoryId: category.category,
                    recipeId: recipeId,
                    primary: category.primary
                });
            }

            await prisma.RecipeInCategory.createMany({
                data: categoriesArray,
            })
        }

        await prisma.RecipeInDiet.deleteMany({
            where: {
                recipeId: recipeId,
            }
        });

        if(Array.isArray(recipeData.diets)){
            let dietsArray = [];

            for (let i = 0; i < recipeData.diets.length; i++) {
                dietsArray.push({
                    dietId: recipeData.diets[i],
                    recipeId: recipeId,
                });
            }

            await prisma.RecipeInDiet.createMany({
                data: dietsArray,
            })
        }

        await prisma.AllergenInRecipe.deleteMany({
            where: {
                recipeId: recipeId,
            }
        });

        if(Array.isArray(recipeData.allergens)){
            let allergiesArray = [];

            for (let i = 0; i < recipeData.allergens.length; i++) {
                allergiesArray.push({
                    allergenId: recipeData.allergens[i],
                    recipeId: recipeId,
                });
            }

            await prisma.AllergenInRecipe.createMany({
                data: allergiesArray,
            })
        }

        return updatedCount;

    } catch (exception) {
        console.log(exception);
        throw new InternalServerError(["Something went wrong during editing the recipe."]);
    } finally {
        await prisma.$disconnect();
    }
}

module.exports.deleteRecipeAdmin = async (recipeId) => {
    try {
        await prisma.Recipe.delete({
            where: {
                id: recipeId,
            }
        });
    } catch (error) {
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

module.exports.getAllComments = async (sortBy, page, searchData) => {
    let orderBy = {};

    switch (sortBy) {
        case "idAsc":  orderBy = {id: "asc"}; break;
        case "idDesc":  orderBy = {id: "desc"}; break;
        case "ratingAsc":  orderBy = {rating: "asc"}; break;
        case "ratingDesc":  orderBy = {rating: "desc"}; break;
        case "uploadedAsc":  orderBy = {uploaded: "asc"}; break;
        case "uploadedDesc":  orderBy = {uploaded: "desc"}; break;
        case "recipeIdAsc":  orderBy = {recipeId: "asc"}; break;
        case "recipeIdDesc":  orderBy = {recipeId: "desc"}; break;
        case "usernameAsc": orderBy = {
            user: {
                username: "asc"
            }
        }; break;
        case "usernameDesc": orderBy = {
            user: {
                username: "desc"
            }
        }; break;

    }

    try {
        return  await prisma.Comment.findMany({
            skip: (page - 1) * 25,
            take: 25,

            where: {
                id: {
                    equals: searchData.id ? Number(searchData.id) : undefined,
                },
                content: {
                    contains: searchData.content,
                },
                user: {
                    username: {
                        contains: searchData.username,
                    }
                },
                recipeId: {
                    equals: searchData.recipeId ? Number(searchData.recipeId) : undefined,
                }
            },

            orderBy: orderBy,

            select: {
                id: true,
                content: true,
                rating: true,
                uploaded: true,
                recipeId: true,
                user: {
                    select: {
                        username: true,
                    }
                }
            },
        })
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

module.exports.getAllAdminPageCommentsCount = async (searchData) => {
    try {
        return  await prisma.Comment.count({
            where: {
                id: {
                    equals: searchData.id ? Number(searchData.id) : undefined,
                },
                content: {
                    contains: searchData.content,
                },
                user: {
                    username: {
                        contains: searchData.username,
                    }
                },
                recipeId: {
                    equals: searchData.recipeId ? Number(searchData.recipeId) : undefined,
                }
            },
        })
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

module.exports.editCommentAdmin = async (commentId, commentData) => {
    try {
        await prisma.Comment.update({
            where: {
                id: commentId,
            },
            data: {
                content: commentData.content,
                rating: commentData.rating,
            }
        });
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

module.exports.deleteCommentAdmin = async (commentId) => {
    try {
        await prisma.Comment.delete({
            where: {
                id: commentId,
            },
        });
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

module.exports.getRankedCategories = async (page) => {
    try {
        return await prisma.RecipeCategory.findMany({
            skip: (page - 1) * 25,
            take: 25,

            where: {
                deactivated: false,
            },

            select: {
                id: true,
                name: true,
                _count: {
                    select: {
                        recipes: true
                    }
                },
            },

            orderBy: {
                recipes: {
                    _count: 'desc',
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