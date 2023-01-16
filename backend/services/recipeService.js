const recipeRepository = require('../repositories/recipeRepository');
const BadRequest = require("../exceptions/BadRequest");
const {compareSync} = require("bcrypt");
const fs = require("fs");


module.exports.createOne = async (recipeData, userId) => {
    let errors = [];

    if(!recipeData.name?.trim()  || !recipeData.description?.trim()){
        errors.push("Please fill in all necessary fields (name, image, description, ingredient names, steps).");
    }

    if(!recipeData.ingredients || recipeData.ingredients?.length === 0){
        errors.push("Please list the necessary ingredients.");
    } else {
        for(const ingredient of recipeData.ingredients){
            if(!ingredient.name?.trim()){
                errors.push("Please give the name of every ingredient.");
                break;
            }
            if(ingredient.name?.trim().length > 100){
                errors.push("Ingredient name can't be longer than 100 characters.");
                break;
            }

        }
    }

    if(!recipeData.steps || recipeData.steps?.length === 0){
        errors.push("Please list the necessary steps.");
    } else {
        for(const step of recipeData.steps){
            if(!step.number || step.number < 0){
                errors.push("Please provide a valid number to every step.");
                break;
            }
            if(!step.content?.trim()){
                errors.push("Please provide the description of every step.");
                break;
            }
            if(step.content?.trim().length > 1000){
                errors.push("Step description can't be longer than 1000 characters.");
                break;
            }

        }
    }

    if(recipeData.name?.trim().length > 100){
        errors.push("Recipe name can't be longer than 100 characters.");
    }

    if(recipeData.description?.trim().length > 1000){
        errors.push("Recipe description can't be longer than 1000 characters.");
    }


    if((recipeData.timeHour && recipeData.timeHour !== Math.floor(recipeData.timeHour)) ||
        (recipeData.timeMinute && recipeData.timeMinute !== Math.floor(recipeData.timeMinute)) ||
        (recipeData.portions && recipeData.portions !== Math.floor(recipeData.portions)) ||
        (recipeData.calories && recipeData.calories !== Math.floor(recipeData.calories))){

        errors.push("Please only enter whole numbers in the 'Additional information' section.");
    }

    if(recipeData.difficulty){
        recipeData.difficulty = Number(recipeData.difficulty);
    }

    if(recipeData.cost){
        recipeData.cost = Number(recipeData.cost);
    }

    if(recipeData.ingredients && recipeData.ingredients?.length !== 0){
        for (let i = 0; i < recipeData.ingredients.length; i++) {
            recipeData.ingredients[i].unit = Number(recipeData.ingredients[i].unit);
        }
    }

    if(errors.length > 0){
        throw new BadRequest(errors);
    }


    if(recipeData.timeHour){
        if(!recipeData.timeMinute) {
            recipeData.timeMinute = 0;
        }

        recipeData.timeMinute += recipeData.timeHour * 60
    }

    try {
        return recipeRepository.createOneRecipe(recipeData, userId);
    } catch (exception){
        throw exception
    }

}

module.exports.uploadImage = async (image, recipeId) => {
    try {
        return recipeRepository.uploadImage(image, Number(recipeId));
    } catch (exception){
        console.log(exception);
        throw exception
    }
}

module.exports.editRecipeOfUser = async (recipeId, recipeData, userId) => {
    try {

        if(recipeData.timeHour){
            if(!recipeData.timeMinute) {
                recipeData.timeMinute = 0;
            }

            recipeData.timeMinute += recipeData.timeHour * 60
        }

        return await recipeRepository.editRecipeOfUser(recipeId, recipeData, userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }
}

module.exports.deleteRecipeOfUser = async (recipeId, userId) => {
    try {
        const directory = "./uploads/recipe_images/"

        fs.readdir(directory, (err, files) => {
            files.forEach(file => {
                if(file.split('.')[0] === String(recipeId)){
                    fs.unlinkSync(directory + file);
                }
            });
        });

        return await recipeRepository.deleteRecipeOfUser(recipeId, userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }
}

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

module.exports.getRecipeById = async (recipeId) => {
    try {
        let recipe = await recipeRepository.getRecipeById(recipeId);

        recipe.categories = [];

        recipe.difficulty = recipe.difficulty ? recipe.difficulty.name : null;
        recipe.cost = recipe.cost ? recipe.cost.name : null;

        recipe.hour = Math.floor(recipe.minute / 60);
        recipe.minute = recipe.minute % 60;

        for (let i = 0; i < recipe.recipeCategories.length; i++) {
            recipe.categories.push({
                name: recipe.recipeCategories[i].recipeCategory.name,
                primary: recipe.recipeCategories[i].primary,
            });
        }
        delete recipe.recipeCategories;

        for (let i = 0; i < recipe.diets.length; i++) {
            recipe.diets[i] = recipe.diets[i].diet.name;
        }

        for (let i = 0; i < recipe.allergens.length; i++) {
            recipe.allergens[i] = recipe.allergens[i].allergen.name;
        }

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

module.exports.getAllRecpieCardsWithPagination = async (page) => {
    let recipes = [];

    try {
        recipes = await recipeRepository.getAllRecpieCardsWithPagination(page);
    } catch (exception) {
        console.log(exception);
        throw exception
    }

    for (let i = 0; i < recipes.length; i++) {
        recipes[i].hour = Math.floor(recipes[i].minute / 60);
        recipes[i].minute = recipes[i].minute % 60;

        if(recipes[i].difficulty) {
            recipes[i].difficulty = recipes[i].difficulty.name;
        }

        if(recipes[i].recipeCategories[0]){
            recipes[i].type = recipes[i].recipeCategories[0].recipeCategory.name;
            delete recipes[i].recipeCategories;
        }
    }

    return recipes;
}

module.exports.getFilteredRecipeCards = async (sortBy, page, searchData) => {
    let response = {};

    if(searchData.filters.timeFrom.hour){
        if(!searchData.filters.timeFrom.minute) {
            searchData.filters.timeFrom.minute = 0;
        }

        searchData.filters.timeFrom.minute += searchData.filters.timeFrom.hour * 60
    }

    if(searchData.filters.timeTo.hour){
        if(!searchData.filters.timeTo.minute) {
            searchData.filters.timeTo.minute = 0;
        }

        searchData.filters.timeTo.minute += searchData.filters.timeTo.hour * 60
    }

    try {
        response = await recipeRepository.getFilteredRecipeCards(sortBy, page, searchData);
    } catch (exception) {
        console.log(exception);
        throw exception
    }

    for (let i = 0; i < response.recipes.length; i++) {
        response.recipes[i].hour = Math.floor(response.recipes[i].minute / 60);
        response.recipes[i].minute = response.recipes[i].minute % 60;

        if(response.recipes[i].difficulty) {
            response.recipes[i].difficulty = response.recipes[i].difficulty.name;
        }

        if(response.recipes[i].recipeCategories[0]){
            response.recipes[i].type = response.recipes[i].recipeCategories[0].recipeCategory.name;
            delete response.recipes[i].recipeCategories;
        }
    }

    return response;
}

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

module.exports.addComment = async (commentData, userId) => {
    let errors = [];

    if(!commentData.rating){
        errors.push("Please rate the recipe.");
    }

    if(commentData.rating < 1 || commentData.rating > 5) {
        errors.push("Rating must be between 1-5 stars.");
    }

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

module.exports.editComment = async (commentData) => {
    let errors = [];

    if(!commentData.rating){
        errors.push("Please rate the recipe.");
    }

    if(commentData.rating < 1 || commentData.rating > 5) {
        errors.push("Rating must be between 1-5 stars.");
    }

    if(commentData.content?.trim().length > 300){
        errors.push("Content of comment can't be longer than 300 characters.");
    }

    if(errors.length > 0){
        throw new BadRequest(errors);
    }

    try {
        return await recipeRepository.editComment(commentData);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

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

module.exports.getAllUnits = async () => {
    let units = [];
    units = await recipeRepository.getAllUnits();

    return units;
}

module.exports.getAllDifficulties = async () => {
    let difficulties = [];
    difficulties = await recipeRepository.getAllDifficulties();

    return difficulties;
}

module.exports.getAllCategories = async () => {
    let categories = [];
    categories = await recipeRepository.getAllCategories();

    return categories;
}

module.exports.getAllDiets = async () => {
    let diets = [];
    diets = await recipeRepository.getAllDiets();

    return diets;
}

module.exports.getAllAllergens = async () => {
    let allergens = [];
    allergens = await recipeRepository.getAllAllergens();

    return allergens;
}

module.exports.getAllCosts = async () => {
    let costs = [];
    costs = await recipeRepository.getAllCosts();

    return costs;
}