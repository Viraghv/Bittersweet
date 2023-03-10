const { PrismaClient } = require('@prisma/client')
const InternalServerError = require("../exceptions/InternalServerError");
const BadRequest = require("../exceptions/BadRequest");
const fs = require("fs");

const prisma = new PrismaClient();

/**
 * Repository function for creating new recipe for a user.
 * Inserts the received data to the Recipe, Ingredient, Step, RecipeInCategory, RecipeInDiet, and AllergenInRecipe tables.
 * If an insert encounters an error, it deletes the already created recipe, so everything already inserted gets deleted with it.
 * @param recipeData object containing the data of the new recipe
 * @param userId userId of uploader user
 * @returns recipeId of new recipe
 */
module.exports.createOneRecipe = async (recipeData, userId) => {
    let newRecipe;

    try {
        //insert recipe
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

        // insert ingredients
        let ingerdientsArray = [];
        for(const ingredient of recipeData.ingredients) {
            ingerdientsArray.push({
                name: ingredient.name,
                amount: ingredient.amount ? ingredient.amount : null,
                recipeId: newRecipe.id,
                unitId: ingredient.unit ? ingredient.unit : null,
            });
        }

        await  prisma.Ingredient.createMany({
            data: ingerdientsArray,
        })

        // insert steps
        let stepsArray = [];
        for(const step of recipeData.steps){
            stepsArray.push({
                number: step.number,
                content: step.content,
                recipeId: newRecipe.id,
            })
        }

        await prisma.Step.createMany({
            data: stepsArray
        });

        // insert category connections
        if(Array.isArray(recipeData.categories)){
            let categoriesArray = [];

            for(const category of recipeData.categories){
                categoriesArray.push({
                    categoryId: category.category,
                    recipeId: newRecipe.id,
                    primary: category.primary
                });
            }

            await prisma.RecipeInCategory.createMany({
                data: categoriesArray,
            })
        }

        // insert diet connections
        if(Array.isArray(recipeData.diets)){
            let dietsArray = [];

            for (let i = 0; i < recipeData.diets.length; i++) {
                dietsArray.push({
                    dietId: recipeData.diets[i],
                    recipeId: newRecipe.id,
                });
            }

            await prisma.RecipeInDiet.createMany({
                data: dietsArray,
            })
        }

        // insert allergen connections
        if(Array.isArray(recipeData.allergens)){
            let allergiesArray = [];

            for (let i = 0; i < recipeData.allergens.length; i++) {
                allergiesArray.push({
                    allergenId: recipeData.allergens[i],
                    recipeId: newRecipe.id,
                });
            }

            await prisma.AllergenInRecipe.createMany({
                data: allergiesArray,
            })
        }

        return newRecipe.id;

    } catch (exception) {
        console.log(exception);

        // if recipe was already created, delete it
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
/**
 * Repository function for uploading new image for recipe by recipeId.
 * Updates the recipe's image filename to the newly uploaded one. If there is an error during the update, the message
 * gets deleted from the recipe_images directory.
 * @param image filename of the new recipe image
 * @param recipeId recipeId of recipe
 */
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

/**
 * Repository function for editing recipe of a user by recipeId.
 * Updates the received data in the Recipe, Ingredient, Step, RecipeInCategory, RecipeInDiet, and AllergenInRecipe tables.
 * @param recipeId recipeId of recipe
 * @param recipeData object containing the data of the edited recipe
 * @param userId userId of recipe's original uploader
 * @returns count of updated recipes (0-1)
 */
module.exports.editRecipeOfUser = async (recipeId, recipeData, userId) => {
    let updatedCount;

    try {

        // update recipe
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

        // delete all ingredients
        await prisma.Ingredient.deleteMany({
            where: {
                recipeId: recipeId,
            }
        });

        // insert new ingredients
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

        // delete all steps
        await prisma.Step.deleteMany({
            where: {
                recipeId: recipeId,
            }
        });

        // insert new steps
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


        // delete all category connections
        await prisma.RecipeInCategory.deleteMany({
            where: {
                recipeId: recipeId,
            }
        });

        // insert new category connections
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

        // delete all diet connections
        await prisma.RecipeInDiet.deleteMany({
            where: {
                recipeId: recipeId,
            }
        });

        // insert new diet connections
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

        // delete all allergen connections
        await prisma.AllergenInRecipe.deleteMany({
            where: {
                recipeId: recipeId,
            }
        });

        // insert new allergen connections
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

/**
 * Repository function for deleting recipe of a user by recipeId.
 * Deletes record from Recipe table matching recipeId and userId.
 * @param recipeId recipeId of recipe to be deleted
 * @param userId userId of recipe's original uploader
 */
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

/**
 * Repository function for getting a recipe by recipeId.
 * Gets all data about recipe, including data from connecting tables.
 * @param recipeId recipeId of recipe
 * @returns data object of recipe matching the recipeId
 */
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

/**
 * Repository function for getting the count of all recipes.
 * @returns count of all recipes
 */
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
/**
 * Repository function for getting all recipe cards, paginated.
 * Gets all recipe card data of given page, ordered by upload time, descending.
 * @param page page to get
 * @returns recipe cards of given page
 */
module.exports.getAllRecipeCardsWithPagination = async (page) => {
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

/**
 * Repository function for getting filtered recipe cards, sorted, paginated.
 * Constructs orderBy and filter objects before executing prisma query.
 * @param sortBy sort cards by (options: nameAsc, nameDesc, uploadedAsc, uploadedDesc, timeAsc, timeDesc, caloriesAsc,
 * caloriesDesc, portionsAsc, portionsDesc, difficultyAsc, difficultyDesc, costAsc, costDesc)
 * @param page page to get
 * @param searchData object containing the set filter options
 * @returns filtered recipe cards of given page, and count of all filtered recipe cards
 */
module.exports.getFilteredRecipeCards = async (sortBy, page, searchData) => {
    // construct order by object for prisma
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

    // construct filters object for prisma
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
        // query matching recipe cards of page
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

        // query all matching recipe cards count
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

/**
 * Gets recipeIds that fit the given user's weekly menu preferences (exclude allergens, match diet, max difficulty, max cost).
 * Separates breakfast, lunch, dinner, and dessert recipeIds.
 * @param user user object containing user's preferences
 * @returns object containing the recipeIds fitting the user preferences, separated by meal
 */
module.exports.getRecipeIdsByUserPreference = async (user) => {
    let recipeIds = {};
    let preferences = {};

    // construct preferences object for filtering in prisma
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
        // get fitting breakfast recipeIds
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

        // get fitting lunch recipeIds
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

        // get fitting dinner recipeIds
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

        // get fitting dessert recipeIds
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

/**
 * Repository function for getting comments by recipeId, paginated.
 * Gets all comments of recipe on the given page ordered by upload time, descending,
 * including uploader user's username and profile picture.
 * @param recipeId recipeId of recipe to get comments of
 * @param page page to get
 * @returns comments of recipe on given page
 */
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

/**
 * Repository function for getting comment count of recipe by recipeId.
 * Gets the number of comments on the given recipe.
 * @param recipeId recipeId of recipe
 * @returns comment count of given recipe
 */
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

/**
 * Repository function for getting average rating of recipe by recipeId.
 * @param recipeId recipeId of recipe
 * @returns average rating of given recipe
 */
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

/**
 * Repository function for adding comment by user to recipe.
 * Inserts record to Comment table, connected to the given user and recipe.
 * @param commentData data object of new comment
 * @param userId userId of uploader
 * @returns new comment record as object
 */
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

/**
 * Repository function for editing comment of user by commentId.
 * Updates record in Comment table matching the commentId and userId.
 * @param commentId commentId of comment to be edited
 * @param commentData data object of edited comment
 * @param userId userId of comment uploader
 * @returns number of edited comments (0-1)
 */
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

/**
 * Repository function for deleting comment of user by commentId.
 * Deletes record from Comment table matching commentId and userId.
 * @param commentId commentId of comment to be deleted
 * @param userId userId of comment uploader
 */
module.exports.deleteComment = async (commentId, userId) => {
    try {
        await prisma.Comment.deleteMany({
            where: {
                id: commentId,
                userId: userId,
            },
        });
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * Repository function for getting comment of given user by recipeId.
 * @param recipeId recipeId of recipe the comment is on
 * @param userId userId of comment uploader
 * @returns comment of user on given recipe
 */
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

/**
 * Repository function for getting all difficulty levels.
 * @returns all difficulty levels
 */
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

/**
 * Repository function for getting all cost levels.
 * @returns all cost levels
 */
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

/**
 * Repository function for getting all units.
 * @returns all units
 */
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

/**
 * Repository function for getting all recipe categories.
 * @returns all recipe categories
 */
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

/**
 * Repository function for getting all diets.
 * @returns all diets
 */
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

/**
 * Repository function for getting all allergens.
 * @returns all allergens
 */
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

/**
 * Repository function for adding a new unit.
 * Insert new record into Unit table with given name.
 * @param unitName name of new unit
 * @returns created new unit record as object
 */
module.exports.addUnit = async (unitName) => {
    try {
        return await prisma.Unit.create({
            data: {
                name: unitName.trim(),
            }
        });
    } catch (error) {
        console.log(error);

        if(error.meta.target === "Unit_name_key") {
            throw new InternalServerError(["This unit already exists."])
        }

        throw new InternalServerError(("Something went wrong during creating this unit."));
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * Repository function for editing a unit by unitId.
 * Updates the given unit's name in the Unit table.
 * @param unitId unitId of unit to be edited
 * @param unitName new name of the unit
 * @returns edited unit record as object
 */
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

        if(error.meta.target === "Unit_name_key") {
            throw new InternalServerError(["This unit already exists."])
        }

        throw new InternalServerError(("Something went wrong during editing this unit."));
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * Repository function for deleting unit by unitId.
 * Deletes given unit from Unit table.
 * @param unitId unitId of unit to be deleted
 */
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

/**
 * Repository function for adding a new recipe category.
 * Insert new record into RecipeCategory table with given name.
 * @param categoryName name of new category
 * @returns created new category record as object
 */
module.exports.addCategory = async (categoryName) => {
    try {
        return await prisma.RecipeCategory.create({
            data: {
                name: categoryName.trim(),
            }
        });
    } catch (error) {
        console.log(error);

        if(error.meta.target === "RecipeCategory_name_key") {
            throw new InternalServerError(["This category already exists."])
        }

        throw new InternalServerError(("Something went wrong during creating this category."));
    } finally {
        await prisma.$disconnect();
    }

}

/**
 * Repository function for editing a recipe category by categoryId.
 * Updates the given category's name in the RecipeCategory table.
 * @param categoryId categoryId of category to be edited
 * @param categoryName new name of the category
 * @returns edited category record as object
 */
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

        if(error.meta.target === "RecipeCategory_name_key") {
            throw new InternalServerError(["This category already exists."])
        }

        throw new InternalServerError(("Something went wrong during editing this category."));
    } finally {
        await prisma.$disconnect();
    }

}

/**
 * Repository function for deleting category by categoryId.
 * Deletes given category from RecipeCategory table.
 * @param categoryId categoryId of category to be deleted
 */
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

/**
 * Repository function for getting ranked categories, paginated.
 * Gets all categories of given page, ordered descending by the number of recipes they are connected to.
 * @param page page to get
 * @returns array of categories, in ranked order
 */
module.exports.getRankedCategories = async (page) => {
    try {
        return await prisma.RecipeCategory.findMany({
            skip: (page - 1) * 25,
            take: 25,

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

/**
 * Repository function for getting count of all recipe categories.
 * @returns count of all recipe categories
 */
module.exports.getCategoriesCount = async () => {
    try {
        return await prisma.RecipeCategory.count();
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * Repository function for adding a new diet.
 * Insert new record into Diet table with given name.
 * @param dietName name of new diet
 * @returns created new diet record as object
 */
module.exports.addDiet = async (dietName) => {
    try {
        return await prisma.Diet.create({
            data: {
                name: dietName.trim(),
            }
        });
    } catch (error) {
        console.log(error);

        if(error.meta.target === "Diet_name_key") {
            throw new InternalServerError(["This diet already exists."])
        }

        throw new InternalServerError(("Something went wrong during creating this diet."));
    } finally {
        await prisma.$disconnect();
    }

}

/**
 * Repository function for editing a diet by dietId.
 * Updates the given diet's name in the Diet table.
 * @param dietId dietId of diet to be edited
 * @param dietName new name of the diet
 * @returns edited diet record as object
 */
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

        if(error.meta.target === "Diet_name_key") {
            throw new InternalServerError(["This diet already exists."])
        }

        throw new InternalServerError(("Something went wrong during editing this diet."));
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * Repository function for deleting diet by dietId.
 * Deletes given diet from Diet table.
 * @param dietId dietId of diet to be deleted
 */
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
/**
 * Repository function for adding a new allergen.
 * Insert new record into Allergen table with given name.
 * @param allergenName name of new allergen
 * @returns created new allergen record as object
 */
module.exports.addAllergen = async (allergenName) => {
    try {
        return await prisma.Allergen.create({
            data: {
                name: allergenName.trim(),
            }
        });
    } catch (error) {
        console.log(error);

        if(error.meta.target === "Allergen_name_key") {
            throw new InternalServerError(["This allergen already exists."])
        }

        throw new InternalServerError(("Something went wrong during creating this allergen."));
    } finally {
        await prisma.$disconnect();
    }

}

/**
 * Repository function for editing an allergen by allergenId.
 * Updates the given allergen's name in the Allergen table.
 * @param allergenId allergenId of allergen to be edited
 * @param allergenName new name of the allergen
 * @returns edited allergen record as object
 */
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

        if(error.meta.target === "Allergen_name_key") {
            throw new InternalServerError(["This allergen already exists."])
        }

        throw new InternalServerError(("Something went wrong during editing this allergen."));
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * Repository function for deleting allergen by allergenId.
 * Deletes given allergen from Allergen table.
 * @param allergenId allergenId of allergen to be deleted
 */
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

/**
 * Repository function for getting all recipes, sorted, filtered, and paginated.
 * Queries all recipes of given page, sorted and filtered based on the sortBy and searchData objects.
 * @param sortBy sort recipes by (options: idAsc, idDesc,  nameAsc, nameDesc, uploadedAsc, uploadedDesc, lastModifiedAsc,
 * lastModifiedDesc, usernameAsc, usernameDesc)
 * @param page page to get
 * @param searchData object containing the set filter options (search by id, name, or username)
 * @returns sorted and filtered recipes of given page
 */
module.exports.getAllRecipes = async (sortBy, page, searchData) => {
    // construct order by object for prisma
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

/**
 * Repository function for getting the count of all recipes as admin.
 * Gets number of recipes fitting the given filters.
 * @param searchData object containing the set filter options (search by id, name, or username)
 * @returns count of all recipes matching the set filters
 */
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

/**
 * Repository function for editing recipe by recipeId as admin.
 * Updates matching records based on the received data in the Recipe, Ingredient, Step, RecipeInCategory, RecipeInDiet, and AllergenInRecipe tables.
 * @param recipeId recipeId of recipe
 * @param recipeData object containing the data of the edited recipe
 * @returns count of updated recipes (0-1)
 */
module.exports.editRecipeAdmin = async (recipeId, recipeData) => {
    let updatedCount;

    try {
        // update recipe
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

        // delete all ingredients
        await prisma.Ingredient.deleteMany({
            where: {
                recipeId: recipeId,
            }
        });

        // insert new ingredients
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

        // delete all steps
        await prisma.Step.deleteMany({
            where: {
                recipeId: recipeId,
            }
        });

        // insert new steps
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


        // delete all category connections
        await prisma.RecipeInCategory.deleteMany({
            where: {
                recipeId: recipeId,
            }
        });

        // insert new category connections
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

        // delete all diet connections
        await prisma.RecipeInDiet.deleteMany({
            where: {
                recipeId: recipeId,
            }
        });

        // insert new diet connections
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

        // delete all allergen connections
        await prisma.AllergenInRecipe.deleteMany({
            where: {
                recipeId: recipeId,
            }
        });

        // insert new allergen connections
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

/**
 * Repository function for deleting recipe by recipeId as admin.
 * Deletes recipe matching recipeId from Recipe table.
 * @param recipeId recipeId of recipe to be deleted
 */
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

/**
 * Repository function for getting all comments as admin, sorted, paginated.
 * Queries all comments of given page, sorted and filtered based on the sortBy and searchData objects.
 * @param sortBy sort comments by (options: idAsc, idDesc, ratingAsc, ratingDesc, uploadedAsc, uploadedDesc, recipeIdAsc,
 * recipeIdDesc, usernameAsc, usernameDesc)
 * @param page page to get
 * @param searchData  object containing the set filter options (search by id, content, username, and recipeId)
 * @returns sorted and filtered comments of given page
 */
module.exports.getAllComments = async (sortBy, page, searchData) => {
    // construct order by object for prisma
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

/**
 * Repository function for getting the count of all filtered comments as admin.
 * Gets number of comments fitting the given filters.
 * @param searchData object containing the set filter options (search by id, content, username, and recipeId)
 * @returns count of all comments matching the set filters
 */
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

/**
 * Repository function for editing comment by commentId as admin.
 * Updates matching record based on the received data in the Comment table.
 * @param commentId commentId of comment to be edited
 * @param commentData data object of edited comment
 */
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

/**
 * Repository function for deleting comment by commentId as admin.
 * Deletes record matching commentId in Comment table.
 * @param commentId commentId of comment to be deleted
 */
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