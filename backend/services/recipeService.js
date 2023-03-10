const recipeRepository = require('../repositories/recipeRepository');
const BadRequest = require("../exceptions/BadRequest");
const fs = require("fs");

/**
 * Validates data fields of recipe.
 * @param recipeData data object of recipe
 */
function validateRecipe(recipeData) {
    let errors = [];

    // is every mandatory field filled
    if(!recipeData.name?.trim()  || !recipeData.description?.trim()){
        errors.push("Please fill in all necessary fields (name, image, description, ingredient names, steps).");
    }

    // is there at least one ingredient listed
    if(!recipeData.ingredients || recipeData.ingredients?.length === 0){
        errors.push("Please list the necessary ingredients.");
    } else {
        for(const ingredient of recipeData.ingredients){
            // does every ingredient have a name
            if(!ingredient.name?.trim()){
                errors.push("Please give the name of every ingredient.");
                break;
            }

            // is ingredient name longer than 100 characters
            if(ingredient.name?.trim().length > 100){
                errors.push("Ingredient name can't be longer than 100 characters.");
                break;
            }

        }
    }

    // is there at least one step listed
    if(!recipeData.steps || recipeData.steps?.length === 0){
        errors.push("Please list the necessary steps.");
    } else {
        for(const step of recipeData.steps){
            // does every step have a number
            if(!step.number || step.number < 0){
                errors.push("Please provide a valid number to every step.");
                break;
            }

            // does every step have a content
            if(!step.content?.trim()){
                errors.push("Please provide the description of every step.");
                break;
            }

            // is the content longer than 1000 characters
            if(step.content?.trim().length > 1000){
                errors.push("Step description can't be longer than 1000 characters.");
                break;
            }

        }
    }

    // is the recipe name longer than 100 characters
    if(recipeData.name?.trim().length > 100){
        errors.push("Recipe name can't be longer than 100 characters.");
    }

    // is the recipe description longer than 1000 characters
    if(recipeData.description?.trim().length > 1000){
        errors.push("Recipe description can't be longer than 1000 characters.");
    }

    // are there only whole numbers in the hour, minute, portions, and calories fields
    if((recipeData.timeHour && recipeData.timeHour !== Math.floor(recipeData.timeHour)) ||
        (recipeData.timeMinute && recipeData.timeMinute !== Math.floor(recipeData.timeMinute)) ||
        (recipeData.portions && recipeData.portions !== Math.floor(recipeData.portions)) ||
        (recipeData.calories && recipeData.calories !== Math.floor(recipeData.calories))){

        errors.push("Please only enter whole numbers in the 'Additional information' section.");
    }

    if(errors.length > 0){
        throw new BadRequest(errors);
    }
}

/**
 * Convert data values of recipe.
 * @param recipeData data object of recipe
 */
function convertRecipeData(recipeData){
    // convert difficultyId to number
    if(recipeData.difficulty){
        recipeData.difficulty = Number(recipeData.difficulty);
    }

    // convert costId to number
    if(recipeData.cost){
        recipeData.cost = Number(recipeData.cost);
    }

    // convert unitId of every ingredient to number
    if(recipeData.ingredients && recipeData.ingredients?.length !== 0){
        for (let i = 0; i < recipeData.ingredients.length; i++) {
            recipeData.ingredients[i].unit = Number(recipeData.ingredients[i].unit);
        }
    }

    // convert time to minutes
    if(recipeData.timeHour){
        if(!recipeData.timeMinute) {
            recipeData.timeMinute = 0;
        }

        recipeData.timeMinute += recipeData.timeHour * 60
    }
}

/**
 * Service function for creating new recipe for a user.
 * Validates new recipe data and converts values before calling repository.
 * @param recipeData object containing the data of the new recipe
 * @param userId userId of uploader user
 * @returns recipeId of new recipe
 */
module.exports.createOne = async (recipeData, userId) => {
    try {
        validateRecipe(recipeData);
        convertRecipeData(recipeData);

        return recipeRepository.createOneRecipe(recipeData, userId);
    } catch (exception){
        throw exception
    }

}

/**
 * Service function for uploading new image for recipe by recipeId.
 * Updates the recipe's image filename to the newly uploaded one.
 * @param image filename of the new recipe image
 * @param recipeId recipeId of recipe
 */
module.exports.uploadImage = async (image, recipeId) => {
    try {
        await recipeRepository.uploadImage(image, Number(recipeId));
    } catch (exception){
        console.log(exception);
        throw exception
    }
}

/**
 * Service function for editing recipe of a user by recipeId.
 * Validates recipe data and converts values before calling repository.
 * @param recipeId recipeId of recipe
 * @param recipeData object containing the data of the edited recipe
 * @param userId userId of recipe's original uploader
 * @returns count of updated recipes (0-1)
 */
module.exports.editRecipeOfUser = async (recipeId, recipeData, userId) => {
    try {
        validateRecipe(recipeData);
        convertRecipeData(recipeData);

        return await recipeRepository.editRecipeOfUser(recipeId, recipeData, userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }
}

/**
 * Service function for deleting recipe of a user by recipeId.
 * Deletes recipe image before calling repository.
 * @param recipeId recipeId of recipe to be deleted
 * @param userId userId of recipe's original uploader
 */
module.exports.deleteRecipeOfUser = async (recipeId, userId) => {
    try {
        const directory = "./uploads/recipe_images/"

        // delete image that has the recipeId as its name
        fs.readdir(directory, (err, files) => {
            files.forEach(file => {
                if(file.split('.')[0] === String(recipeId)){
                    fs.unlinkSync(directory + file);
                }
            });
        });

        await recipeRepository.deleteRecipeOfUser(recipeId, userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }
}
/**
 * Service function for getting a recipe by recipeId.
 * Converts data to the desired format after receiving the recipe data from the repository.
 * @param recipeId recipeId of recipe
 * @returns data object of recipe matching the recipeId
 */
module.exports.getRecipeById = async (recipeId) => {
    try {
        // get recipe
        let recipe = await recipeRepository.getRecipeById(recipeId);

        recipe.categories = [];

        // if there is no difficulty or cost, their name should be null
        recipe.difficulty = recipe.difficulty ? recipe.difficulty.name : null;
        recipe.cost = recipe.cost ? recipe.cost.name : null;

        // convert time back to hour and minutes
        recipe.hour = Math.floor(recipe.minute / 60);
        recipe.minute = recipe.minute % 60;

        // convert recipe category array to a more intuitive form
        for (let i = 0; i < recipe.recipeCategories.length; i++) {
            recipe.categories.push({
                name: recipe.recipeCategories[i].recipeCategory.name,
                primary: recipe.recipeCategories[i].primary,
            });
        }
        delete recipe.recipeCategories;

        // convert diets array to a more intuitive form
        for (let i = 0; i < recipe.diets.length; i++) {
            recipe.diets[i] = recipe.diets[i].diet.name;
        }
        // convert allergens array to a more intuitive form
        for (let i = 0; i < recipe.allergens.length; i++) {
            recipe.allergens[i] = recipe.allergens[i].allergen.name;
        }

        // convert ingredients array to a more intuitive form
        for (let i = 0; i < recipe.ingredients.length; i++) {
            if(recipe.ingredients[i].unit){
                recipe.ingredients[i].unit = recipe.ingredients[i].unit.name;
            }
        }

        return recipe;

    } catch (exception){
        console.log(exception);
        throw exception
    }
}

/**
 * Service function for getting the count of all recipes.
 * @returns count of all recipes
 */
module.exports.getAllRecipeCount = async () => {
    let recipeCount;

    try {
        recipeCount = await recipeRepository.getAllRecipeCount();
    } catch (exception) {
        console.log(exception);
        throw exception
    }

    return recipeCount;
}

/**
 * Service function for getting all recipe cards, paginated.
 * Converts recipe card data to the desired format after receiving the recipe data from the repository.
 * @param page page to get
 * @returns recipe cards of given page
 */
module.exports.getAllRecipeCardsWithPagination = async (page) => {
    let recipes = [];

    try {
        recipes = await recipeRepository.getAllRecipeCardsWithPagination(page);
    } catch (exception) {
        console.log(exception);
        throw exception
    }

    for (let i = 0; i < recipes.length; i++) {
        // convert time back to hour and minutes
        recipes[i].hour = Math.floor(recipes[i].minute / 60);
        recipes[i].minute = recipes[i].minute % 60;

        // convert difficulty object to difficulty name string
        if(recipes[i].difficulty) {
            recipes[i].difficulty = recipes[i].difficulty.name;
        }

        // convert category object to category name string
        if(recipes[i].recipeCategories[0]){
            recipes[i].type = recipes[i].recipeCategories[0].recipeCategory.name;
            delete recipes[i].recipeCategories;
        }
    }

    return recipes;
}

/**
 * Service function for getting filtered recipe cards, sorted, paginated.
 * Converts filter data before and recipe cards data after calling repository.
 * @param sortBy sort cards by (options: nameAsc, nameDesc, uploadedAsc, uploadedDesc, timeAsc, timeDesc, caloriesAsc,
 * caloriesDesc, portionsAsc, portionsDesc, difficultyAsc, difficultyDesc, costAsc, costDesc)
 * @param page page to get
 * @param searchData object containing the set filter options
 * @returns filtered recipe cards of given page, and count of all filtered recipe cards
 */
module.exports.getFilteredRecipeCards = async (sortBy, page, searchData) => {
    let recipeCards = [];

    // convert 'from' time to minutes
    if(searchData.filters.timeFrom.hour){
        if(!searchData.filters.timeFrom.minute) {
            searchData.filters.timeFrom.minute = 0;
        }

        searchData.filters.timeFrom.minute += searchData.filters.timeFrom.hour * 60
    }

    // convert 'to' time to minutes
    if(searchData.filters.timeTo.hour){
        if(!searchData.filters.timeTo.minute) {
            searchData.filters.timeTo.minute = 0;
        }

        searchData.filters.timeTo.minute += searchData.filters.timeTo.hour * 60
    }

    try {
        // get recipe cards
        recipeCards = await recipeRepository.getFilteredRecipeCards(sortBy, page, searchData);
    } catch (exception) {
        console.log(exception);
        throw exception
    }

    for (let i = 0; i < recipeCards.recipes.length; i++) {
        // convert time back to hour and minutes
        recipeCards.recipes[i].hour = Math.floor(recipeCards.recipes[i].minute / 60);
        recipeCards.recipes[i].minute = recipeCards.recipes[i].minute % 60;

        // convert difficulty object to difficulty name string
        if(recipeCards.recipes[i].difficulty) {
            recipeCards.recipes[i].difficulty = recipeCards.recipes[i].difficulty.name;
        }

        // convert category object to category name string
        if(recipeCards.recipes[i].recipeCategories[0]){
            recipeCards.recipes[i].type = recipeCards.recipes[i].recipeCategories[0].recipeCategory.name;
            delete recipeCards.recipes[i].recipeCategories;
        }
    }

    return recipeCards;
}

/**
 * Service function for getting comments by recipeId, paginated.
 * @param recipeId recipeId of recipe to get comments of
 * @param page page to get
 * @returns comments of recipe on given page
 */
module.exports.getCommentsByRecipeId = async (recipeId, page) => {
    let comments = [];

    try {
        comments = await recipeRepository.getCommentsByRecipeId(recipeId, page);
    } catch (exception) {
        console.log(exception);
        throw exception;
    }

    return comments;
}

/**
 * Service function for getting comment count of recipe by recipeId.
 * @param recipeId recipeId of recipe
 * @returns comment count of given recipe
 */
module.exports.getCommentCountById = async (recipeId) => {
    let commentCount;

    try {
        commentCount = await recipeRepository.getCommentCountById(recipeId);
    } catch (exception) {
        console.log(exception);
        throw exception;
    }

    return commentCount;
}

/**
 * Service function for getting average rating of recipe by recipeId.
 * @param recipeId recipeId of recipe
 * @returns average rating of given recipe
 */
module.exports.getAverageRatingById = async (recipeId) => {
    let averageRating;

    try {
        averageRating = await recipeRepository.getAverageRatingById(recipeId);
    } catch (exception) {
        console.log(exception);
        throw exception;
    }

    return averageRating;
}

/**
 * Service function for adding comment by user to recipe.
 * Validates new comment data fields before calling repository.
 * @param commentData data object of new comment
 * @param userId userId of uploader
 * @returns new comment record as object
 */
module.exports.addComment = async (commentData, userId) => {
    let errors = [];

    // does the comment have a rating set
    if(!commentData.rating){
        errors.push("Please rate the recipe.");
    }

    // is the rating between 1 and 5
    if(commentData.rating < 1 || commentData.rating > 5) {
        errors.push("Rating must be between 1-5 stars.");
    }

    // is the content of the comment longer than 300 characters
    if(commentData.content?.trim().length > 300){
        errors.push("Content of comment can't be longer than 300 characters.");
    }

    if(errors.length > 0){
        throw new BadRequest(errors);
    }

    try {
       return await recipeRepository.addComment(commentData, userId);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

/**
 * Service function for editing comment of user by commentId.
 * Validates comment data fields before calling repository.
 * @param commentId commentId of comment to be edited
 * @param commentData data object of edited comment
 * @param userId userId of comment uploader
 * @returns number of edited comments (0-1)
 */
module.exports.editComment = async (commentId, commentData, userId) => {
    let errors = [];

    // does the comment have a rating set
    if(!commentData.rating){
        errors.push("Please rate the recipe.");
    }

    // is the rating between 1 and 5
    if(commentData.rating < 1 || commentData.rating > 5) {
        errors.push("Rating must be between 1-5 stars.");
    }

    // is the content of the comment longer than 300 characters
    if(commentData.content?.trim().length > 300){
        errors.push("Content of comment can't be longer than 300 characters.");
    }

    if(errors.length > 0){
        throw new BadRequest(errors);
    }

    try {
        return await recipeRepository.editComment(commentId, commentData, userId);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

/**
 * Service function for deleting comment of user by commentId.
 * @param commentId commentId of comment to be deleted
 * @param userId userId of comment uploader
 */
module.exports.deleteComment = async (commentId, userId) => {
    try {
        await recipeRepository.deleteComment(commentId, userId);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

/**
 * Service function for getting comment of given user by recipeId.
 * @param recipeId recipeId of recipe the comment is on
 * @param userId userId of comment uploader
 * @returns comment of user on given recipe
 */
module.exports.getCommentByUserAndRecipeId = async (recipeId, userId) => {
    let comment;

    try {
        comment = await recipeRepository.getCommentByUserAndRecipeId(recipeId, userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }

    return comment;
}

/**
 * Service function for getting all difficulty levels.
 * @returns all difficulty levels
 */
module.exports.getAllDifficulties = async () => {
    let difficulties = [];

    try {
        difficulties = await recipeRepository.getAllDifficulties();
    } catch (exception) {
        console.log(exception);
        throw exception
    }

    return difficulties;
}

/**
 * Service function for getting all cost levels.
 * @returns all cost levels
 */
module.exports.getAllCosts = async () => {
    let costs = [];

    try {
        costs = await recipeRepository.getAllCosts();
    } catch (error){
        console.log(error);
        throw error;
    }

    return costs;
}

/**
 * Service function for getting all units.
 * @returns all units
 */
module.exports.getAllUnits = async () => {
    let units = [];

    try {
        units = await recipeRepository.getAllUnits();
    } catch (exception) {
        console.log(exception);
        throw exception
    }

    return units;
}

/**
 * Service function for getting all recipe categories.
 * @returns all recipe categories
 */
module.exports.getAllCategories = async () => {
    let categories = [];

    try {
        categories = await recipeRepository.getAllCategories();
    } catch (exception) {
        console.log(exception);
        throw exception
    }

    return categories;
}

/**
 * Service function for getting all diets.
 * @returns all diets
 */
module.exports.getAllDiets = async () => {
    let diets = [];

    try {
        diets = await recipeRepository.getAllDiets();
    } catch (exception) {
        console.log(exception);
        throw exception
    }

    return diets;
}

/**
 * Service function for getting all allergens.
 * @returns all allergens
 */
module.exports.getAllAllergens = async () => {
    let allergens = [];

    try {
        allergens = await recipeRepository.getAllAllergens();
    } catch (exception) {
        console.log(exception);
        throw exception
    }

    return allergens;
}

/**
 * Service function for adding a new unit.
 * Validates name of new unit before calling repository.
 * @param unitName name of new unit
 * @returns created new unit record as object
 */
module.exports.addUnit = async (unitName) => {
    let errors = [];

    // is the unit name provided
    if(!unitName){
        errors.push("Please provide the unit name.");
    }

    // is the unit name longer than 30 characters
    if(unitName.trim().length > 30){
        errors.push("Unit name can't be longer than 30 characters.");
    }

    if(errors.length > 0){
        throw new BadRequest(errors);
    }

    try {
        return await recipeRepository.addUnit(unitName);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

/**
 * Service function for editing a unit by unitId.
 * Validates new name of unit before calling repository.
 * @param unitId unitId of unit to be edited
 * @param unitName new name of the unit
 * @returns edited unit record as object
 */
module.exports.editUnit = async (unitId, unitName) => {
    let errors = [];

    // is the unit name provided
    if(!unitName){
        errors.push("Please provide the unit name.");
    }

    // is the unit name longer than 30 characters
    if(unitName.trim().length > 30){
        errors.push("Unit name can't be longer than 30 characters.");
    }

    if(errors.length > 0){
        throw new BadRequest(errors);
    }

    try {
        return await recipeRepository.editUnit(unitId, unitName);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

/**
 * Service function for deleting unit by unitId.
 * @param unitId unitId of unit to be deleted
 */
module.exports.deleteUnit = async (unitId) => {
    try {
        await recipeRepository.deleteUnit(unitId);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

/**
 * Service function for adding a new recipe category.
 * Validates name of new category before calling repository.
 * @param categoryName name of new category
 * @returns created new category record as object
 */
module.exports.addCategory = async (categoryName) => {
    let errors = [];

    // is the category name provided
    if(!categoryName){
        errors.push("Please provide the category name.");
    }

    // is the category name longer than 50 characters
    if(categoryName.trim().length > 50){
        errors.push("Category name can't be longer than 50 characters.");
    }

    if(errors.length > 0){
        throw new BadRequest(errors);
    }

    try {
        return await recipeRepository.addCategory(categoryName);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

/**
 * Service function for editing recipe category by categoryId.
 * @param categoryId categoryId of category to be edited
 * @param categoryName new name of category
 * @returns edited category record as object
 */
module.exports.editCategory = async (categoryId, categoryName) => {
    let errors = [];

    // is the category name provided
    if(!categoryName){
        errors.push("Please provide the category name.");
    }

    // is the category name longer than 50 characters
    if(categoryName.trim().length > 50){
        errors.push("Category name can't be longer than 50 characters.");
    }

    if(errors.length > 0){
        throw new BadRequest(errors);
    }

    try {
        return await recipeRepository.editCategory(categoryId, categoryName);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

/**
 * Service function for deleting recipe category by categoryId.
 * @param categoryId categoryId of category to be deleted
 */
module.exports.deleteCategory = async (categoryId) => {
    try {
        await recipeRepository.deleteCategory(categoryId);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

/**
 * Service function for getting ranked categories, paginated.
 * @param page page to get
 * @returns array of categories, in ranked order
 */
module.exports.getRankedCategories = async (page) => {
    let rankedCategories = [];

    try {
        rankedCategories = await recipeRepository.getRankedCategories(page);
    } catch (error) {
        console.log(error);
        throw error;
    }

    return rankedCategories;
}

/**
 * Service function for getting count of all recipe categories.
 * @returns count of all recipe categories
 */
module.exports.getCategoriesCount = async () => {
    let categoriesCount = null;

    try {
        categoriesCount = await recipeRepository.getCategoriesCount();
    } catch (error) {
        console.log(error);
        throw error;
    }

    return categoriesCount;
}

/**
 * Service function for adding a new diet.
 * Validates name of new diet before calling repository.
 * @param dietName name of new diet
 * @returns created new diet record as object
 */
module.exports.addDiet = async (dietName) => {
    let errors = [];

    // is the diet name provided
    if(!dietName){
        errors.push("Please provide the diet name.");
    }

    // is the diet name longer than 50 characters
    if(dietName.trim().length > 50){
        errors.push("Diet name can't be longer than 50 characters.");
    }

    if(errors.length > 0){
        throw new BadRequest(errors);
    }

    try {
        return await recipeRepository.addDiet(dietName);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

/**
 * Service function for editing diet by dietId.
 * @param dietId dietId of diet to be edited
 * @param dietName new name of diet
 * @returns edited diet record as object
 */
module.exports.editDiet = async (dietId, dietName) => {
    let errors = [];

    // is the diet name provided
    if(!dietName){
        errors.push("Please provide the diet name.");
    }

    // is the diet name longer than 50 characters
    if(dietName.trim().length > 50){
        errors.push("Diet name can't be longer than 50 characters.");
    }

    if(errors.length > 0){
        throw new BadRequest(errors);
    }

    try {
        return await recipeRepository.editDiet(dietId, dietName);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

/**
 * Service function for deleting diet by dietId.
 * @param dietId dietId of diet to be deleted
 */
module.exports.deleteDiet = async (dietId) => {
    try {
        await recipeRepository.deleteDiet(dietId);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

/**
 * Service function for adding a new allergen.
 * Validates name of new allergen before calling repository.
 * @param allergenName name of new allergen
 * @returns created new allergen record as object
 */
module.exports.addAllergen = async (allergenName) => {
    let errors = [];

    // is the allergen name provided
    if(!allergenName){
        errors.push("Please provide the allergen name.");
    }

    // is the allergen name longer than 50 characters
    if(allergenName.trim().length > 50){
        errors.push("Allergen name can't be longer than 50 characters.");
    }

    if(errors.length > 0){
        throw new BadRequest(errors);
    }

    try {
        return await recipeRepository.addAllergen(allergenName);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

/**
 * Service function for editing allergen by allergenId.
 * @param allergenId allergenId of allergen to be edited
 * @param allergenName new name of allergen
 * @returns edited allergen record as object
 */
module.exports.editAllergen = async (allergenId, allergenName) => {
    let errors = [];

    // is the allergen name provided
    if(!allergenName){
        errors.push("Please provide the allergen name.");
    }

    // is the allergen name longer than 50 characters
    if(allergenName.trim().length > 50){
        errors.push("Allergen name can't be longer than 50 characters.");
    }

    if(errors.length > 0){
        throw new BadRequest(errors);
    }

    try {
        return await recipeRepository.editAllergen(allergenId, allergenName);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

/**
 * Service function for deleting allergen by allergenId.
 * @param allergenId allergenId of allergen to be deleted
 */
module.exports.deleteAllergen = async (allergenId) => {
    try {
        await recipeRepository.deleteAllergen(allergenId);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

/**
 * Service function for getting all recipes, sorted, filtered, and paginated.
 * Converts data to desired format after receiving the recipe data from the repository.
 * @param sortBy sort recipes by (options: idAsc, idDesc,  nameAsc, nameDesc, uploadedAsc, uploadedDesc, lastModifiedAsc,
 * lastModifiedDesc, usernameAsc, usernameDesc)
 * @param page page to get
 * @param searchData object containing the set filter options (search by id, name, or username)
 * @returns sorted and filtered recipes of given page
 */
module.exports.getAllRecipes = async (sortBy, page, searchData) => {
    let recipes;

    try {
        recipes = await recipeRepository.getAllRecipes(sortBy, page, searchData);

        // convert user objects to a string of their username
        for (let i = 0; i < recipes.length; i++) {
            recipes[i].user = recipes[i].user.username;
        }

    } catch (exception) {
        console.log(exception);
        throw exception
    }

    return recipes;
}

/**
 * Service function for getting the count of all filtered recipes as admin.
 * @param searchData object containing the set filter options
 * @returns count of all recipes matching the set filters
 */
module.exports.getAllAdminPageRecipesCount = async (searchData) => {
    let recipesCount;

    try {
        recipesCount = await recipeRepository.getAllAdminPageRecipesCount(searchData);
    } catch (exception) {
        console.log(exception);
        throw exception
    }

    return recipesCount;
}

/**
 * Service function for editing recipe by recipeId as admin.
 * Validates recipe data and converts values before calling repository.
 * @param recipeId recipeId of recipe
 * @param recipeData object containing the data of the edited recipe
 * @returns count of updated recipes (0-1)
 */
module.exports.editRecipeAdmin = async (recipeId, recipeData) => {
    try {
        validateRecipe(recipeData);
        convertRecipeData(recipeData);

        return await recipeRepository.editRecipeAdmin(recipeId, recipeData);
    } catch (exception) {
        console.log(exception);
        throw exception
    }
}

/**
 * Service function for deleting recipe by recipeId as admin.
 * Deletes recipe image before calling repository.
 * @param recipeId recipeId of recipe to be deleted
 */
module.exports.deleteRecipeAdmin = async (recipeId) => {
    try {
        const directory = "./uploads/recipe_images/"

        // delete image that has the recipeId as its name
        fs.readdir(directory, (err, files) => {
            files.forEach(file => {
                if(file.split('.')[0] === String(recipeId)){
                    fs.unlinkSync(directory + file);
                }
            });
        });

        await recipeRepository.deleteRecipeAdmin(recipeId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }
}

/**
 * Service function for getting all comments as admin, sorted, paginated.
 * @param sortBy sort comments by (options: idAsc, idDesc, ratingAsc, ratingDesc, uploadedAsc, uploadedDesc, recipeIdAsc,
 * recipeIdDesc, usernameAsc, usernameDesc)
 * @param page page to get
 * @param searchData object containing the set filter options
 * @returns sorted and filtered comments of given page
 */
module.exports.getAllComments = async (sortBy, page, searchData) => {
    let comments;

    try {
        comments = await recipeRepository.getAllComments(sortBy, page, searchData);

        for (let i = 0; i < comments.length; i++) {
            comments[i].user = comments[i].user.username;
        }

    } catch (exception) {
        console.log(exception);
        throw exception
    }

    return comments;
}

/**
 * Service function for getting the count of all filtered comments as admin.
 * @param searchData object containing the set filter options
 * @returns count of all comments matching the set filters
 */
module.exports.getAllAdminPageCommentsCount = async (searchData) => {
    let commentsCount;

    try {
        commentsCount = await recipeRepository.getAllAdminPageCommentsCount(searchData);
    } catch (exception) {
        console.log(exception);
        throw exception
    }

    return commentsCount;
}

/**
 * Service function for editing comment by commentId as admin.
 * Validates comment data fields before calling repository.
 * @param commentId commentId of comment to be edited
 * @param commentData data object of edited comment
 */
module.exports.editCommentAdmin = async (commentId, commentData) => {
    let errors = [];

    // does the comment have a rating set
    if(!commentData.rating){
        errors.push("Please rate the recipe.");
    }

    // is the rating between 1 and 5
    if(commentData.rating < 1 || commentData.rating > 5) {
        errors.push("Rating must be between 1-5 stars.");
    }

    // is the content of the comment longer than 300 characters
    if(commentData.content?.trim().length > 300){
        errors.push("Content of comment can't be longer than 300 characters.");
    }

    if(errors.length > 0){
        throw new BadRequest(errors);
    }

    try {
        await recipeRepository.editCommentAdmin(commentId, commentData);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

/**
 * Service function for deleting comment by commentId as admin.
 * @param commentId commentId of comment to be deleted
 */
module.exports.deleteCommentAdmin = async (commentId) => {
    try {
        await recipeRepository.deleteCommentAdmin(commentId);
    } catch (error) {
        console.log(error);
        throw error;
    }
}
