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
                hour: recipeData.timeHour ? recipeData.timeHour : null,
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

module.exports.getAllRecpieCardsWithPagination = async (page) => {
    let recipes = [];
    try {
        recipes = await prisma.Recipe.findMany({
            skip: (page - 1) * 12,
            take: 12,
            select: {
                id: true,
                name: true,
                hour: true,
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

module.exports.editComment = async (commentData) => {
    try {
        return await prisma.Comment.update({
            where: {
                id: commentData.id
            },
            data: {
                content: commentData.content,
                rating: commentData.rating,
            }
        })
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