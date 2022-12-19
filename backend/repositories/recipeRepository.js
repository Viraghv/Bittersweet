const { PrismaClient } = require('@prisma/client')
const InternalServerError = require("../exceptions/InternalServerError");
const {session} = require("../session/sessionStorage");
const HttpException = require("../exceptions/HttpException");

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

module.exports.uploadImage = async (image, recipeId, errors) => {
    try{
        if(errors.length === 0){
            await prisma.Recipe.update({
                where: {
                    id: recipeId
                },
                data: {
                    photo: image.filename
                }
            })
        } else {
            throw errors;
        }
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
                hour: true,
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