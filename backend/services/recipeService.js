const recipeRepository = require('../repositories/recipeRepository');
const BadRequest = require("../exceptions/BadRequest");
const {compareSync} = require("bcrypt");


module.exports.createOne = async (recipeData, userId) => {
    //console.log(recipeData);

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
            if(step.content?.trim().length > 100){
                errors.push("Step description can't be longer than 100 characters.");
                break;
            }

        }
    }

    if(recipeData.name?.trim().length > 100){
        errors.push("Recipe name can't be longer than 100 characters.");
    }

    if(recipeData.description?.trim().length > 300){
        errors.push("Recipe description can't be longer than 300 characters.");
    }


    if((recipeData.timeHour && recipeData.timeHour !== Math.floor(recipeData.timeHour)) ||
        (recipeData.timeMinute && recipeData.timeMinute !== Math.floor(recipeData.timeMinute)) ||
        (recipeData.portions && recipeData.portions !== Math.floor(recipeData.portions)) ||
        (recipeData.calories && recipeData.calories !== Math.floor(recipeData.calories))){

        errors.push("Please only enter whole numbers in the 'Additional information' section.");
    }

    if(recipeData.difficulty){
        recipeData.difficulty = Number(recipeData.difficulty);
        if (!Number.isInteger(recipeData.difficulty) || recipeData.difficulty <= 0){
            errors.push("Difficulty must be a valid number.");
        }
    }

    if(recipeData.cost){
        recipeData.cost = Number(recipeData.cost);

        if (!Number.isInteger(recipeData.cost) || recipeData.cost <= 0){
            errors.push("Cost must be a valid number.");
        }
    }

    if(recipeData.ingredients && recipeData.ingredients?.length !== 0){
        for (let i = 0; i < recipeData.ingredients.length; i++) {
            recipeData.ingredients[i].unit = Number(recipeData.ingredients[i].unit);
        }
    }

    if(errors.length > 0){
        throw new BadRequest(errors);
    }

    //console.log(recipeData);

    try {
        return recipeRepository.createOneRecipe(recipeData, userId);
    } catch (exception){
        throw exception
    }

}

module.exports.uploadImage = async (image, recipeId) => {
    const allowedTypes = ["image/jpeg", "image/png"];

    if(!allowedTypes.includes(image.mimetype)){
        throw new BadRequest(["Incorrect file type."])
    }

    try {
        return recipeRepository.uploadImage(image.filename, Number(recipeId));
    } catch (exception){
        throw exception
    }
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