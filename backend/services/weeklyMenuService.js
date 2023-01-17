const weeklyMenuRepository = require('../repositories/weeklyMenuRepository');
const userService = require("./userService");
const recipeRepository = require("../repositories/recipeRepository");
const InternalServerError = require("../exceptions/InternalServerError");
const BadRequest = require("../exceptions/BadRequest");
const NotFound = require("../exceptions/NotFound");

module.exports.generateWeekForUser = async (userId, nextWeek) => {
    try {
        if(nextWeek !== 0 && nextWeek !== 1){
            throw new BadRequest("'nextWeek' parameter can only be 0 or 1.")
        }

        let user = await userService.getUserById(userId);

        if(!user){
            throw new BadRequest("User does not exist.")
        }

        let userAllergies = [];

        for (let i = 0; i < user.allergies.length; i++) {
            userAllergies.push(user.allergies[i].id);
        }

        user.allergies = userAllergies;

        let userDontRecommendRecipeIds = await this.getAllDontRecommendRecipesOfUser(userId);

        let recipeIds = await recipeRepository.getRecipeIdsByUserPreference(user);

        let breakfastIds = [];
        let lunchIds = [];
        let dinnerIds = [];
        let dessertIds = [];

        for (let i = 0; i < recipeIds.breakfast.length; i++) {
            if(!userDontRecommendRecipeIds.includes(recipeIds.breakfast[i].id)){
                breakfastIds.push(recipeIds.breakfast[i].id)
            }
        }
        recipeIds.breakfast = breakfastIds;

        for (let i = 0; i < recipeIds.lunch.length; i++) {
            if(!userDontRecommendRecipeIds.includes(recipeIds.lunch[i].id)) {
                lunchIds.push(recipeIds.lunch[i].id)
            }
        }
        recipeIds.lunch = lunchIds;

        for (let i = 0; i < recipeIds.dinner.length; i++) {
            if(!userDontRecommendRecipeIds.includes(recipeIds.dinner[i].id)) {
                dinnerIds.push(recipeIds.dinner[i].id)
            }
        }
        recipeIds.dinner = dinnerIds;

        for (let i = 0; i < recipeIds.dessert.length; i++) {
            if(!userDontRecommendRecipeIds.includes(recipeIds.dessert[i].id)) {
                dessertIds.push(recipeIds.dessert[i].id)
            }
        }
        recipeIds.dessert = dessertIds;

        let recommandations = [];

        for (let day = 0; day <= 6; day++) {
            for (let meal = 1; meal <= 3; meal++) {
                let recommandedRecipe = null;

                if(meal === 1) {
                    if(breakfastIds.length === 0){
                        breakfastIds = recipeIds.breakfast;
                    }
                    recommandedRecipe = breakfastIds[Math.floor(Math.random() * breakfastIds.length)] || null;
                } else if(meal === 2) {
                    if(lunchIds.length === 0){
                        lunchIds = recipeIds.lunch;
                    }

                    if(lunchIds.length > 1) {
                        lunchIds = lunchIds.filter(e => e !== recommandations[day * 3 + meal - 2].recipeId);
                    }

                    recommandedRecipe = lunchIds[Math.floor(Math.random() * lunchIds.length)] || null;
                } else if(meal === 3) {
                    if(dinnerIds.length === 0){
                        dinnerIds = recipeIds.dinner;
                    }

                    if(dinnerIds.length > 1) {
                        dinnerIds = dinnerIds.filter(e => e !== recommandations[day * 3 + meal - 2].recipeId);
                    }

                    if(dinnerIds.length > 1) {
                        dinnerIds = dinnerIds.filter(e => e !== recommandations[day * 3 + meal - 3].recipeId);
                    }

                    recommandedRecipe = dinnerIds[Math.floor(Math.random() * dinnerIds.length)] || null;
                }

                recommandations.push({
                    recipeId: recommandedRecipe,
                    day: day,
                    meal: meal,
                });

                breakfastIds = breakfastIds.filter(e => e !== recommandedRecipe);
                lunchIds = lunchIds.filter(e => e !== recommandedRecipe);
                dinnerIds = dinnerIds.filter(e => e !== recommandedRecipe);
                dessertIds = dessertIds.filter(e => e !== recommandedRecipe);

            }
        }

        for (let i = 0; i < 2; i++) {
            let recommandedRecipe = null;

            if(dessertIds.length === 0){
                dessertIds = recipeIds.dessert;
            }

            recommandedRecipe = dessertIds[Math.floor(Math.random() * dessertIds.length)] || null;
            dessertIds = dessertIds.filter(e => e !== recommandedRecipe);

            recommandations.push({
                recipeId: recommandedRecipe,
                day: null,
                meal: 0,
            });
        }

        let createCount = await weeklyMenuRepository.setItemsOfWeek(userId, nextWeek, recommandations);

        if (createCount.count !== 23){
            throw new InternalServerError(["Something went wrong during weekly menu generation."])
        }

        return recommandations;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

module.exports.generateOneForUser = async (userId, data) => {
    try {
        let user = await userService.getUserById(userId);

        if(!user){
            throw new BadRequest("User does not exist.")
        }

        let userAllergies = [];

        for (let i = 0; i < user.allergies.length; i++) {
            userAllergies.push(user.allergies[i].id);
        }

        user.allergies = userAllergies;

        let userDontRecommendRecipeIds = await this.getAllDontRecommendRecipesOfUser(userId);

        let recipeIds = await recipeRepository.getRecipeIdsByUserPreference(user);

        let breakfastIds = [];
        let lunchIds = [];
        let dinnerIds = [];
        let dessertIds = [];

        for (let i = 0; i < recipeIds.breakfast.length; i++) {
            if(!userDontRecommendRecipeIds.includes(recipeIds.breakfast[i].id)){
                breakfastIds.push(recipeIds.breakfast[i].id)
            }
        }
        recipeIds.breakfast = breakfastIds;

        for (let i = 0; i < recipeIds.lunch.length; i++) {
            if(!userDontRecommendRecipeIds.includes(recipeIds.lunch[i].id)) {
                lunchIds.push(recipeIds.lunch[i].id)
            }
        }
        recipeIds.lunch = lunchIds;

        for (let i = 0; i < recipeIds.dinner.length; i++) {
            if(!userDontRecommendRecipeIds.includes(recipeIds.dinner[i].id)) {
                dinnerIds.push(recipeIds.dinner[i].id)
            }
        }
        recipeIds.dinner = dinnerIds;

        for (let i = 0; i < recipeIds.dessert.length; i++) {
            if(!userDontRecommendRecipeIds.includes(recipeIds.dessert[i].id)) {
                dessertIds.push(recipeIds.dessert[i].id)
            }
        }
        recipeIds.dessert = dessertIds;


        let recommandedRecipe = null;

        if(data.meal === 1) {
            recommandedRecipe = breakfastIds[Math.floor(Math.random() * breakfastIds.length)] || null;

            if(breakfastIds.length > 1) {
                while(recommandedRecipe === data.currentRecipeId) {
                    recommandedRecipe = breakfastIds[Math.floor(Math.random() * breakfastIds.length)] || null;
                }
            } else {
                throw new NotFound(["There are no other recipes to recommend."]);
            }
        } else if(data.meal === 2) {
            recommandedRecipe = lunchIds[Math.floor(Math.random() * lunchIds.length)] || null;

            if(lunchIds.length > 1) {
                while(recommandedRecipe === data.currentRecipeId) {
                    recommandedRecipe = lunchIds[Math.floor(Math.random() * lunchIds.length)] || null;
                }
            } else {
                throw new NotFound(["There are no other recipes to recommend."]);
            }
        } else if(data.meal === 3) {
            recommandedRecipe = dinnerIds[Math.floor(Math.random() * dinnerIds.length)] || null;

            if(dinnerIds.length > 1) {
                while(recommandedRecipe === data.currentRecipeId) {
                    recommandedRecipe = dinnerIds[Math.floor(Math.random() * dinnerIds.length)] || null;
                }
            } else {
                throw new NotFound(["There are no other recipes to recommend."]);
            }
        } else if(data.meal === 0){
            recommandedRecipe = dessertIds[Math.floor(Math.random() * dessertIds.length)] || null;

            if(dessertIds.length > 1) {
                while(recommandedRecipe === data.currentRecipeId) {
                    recommandedRecipe = dessertIds[Math.floor(Math.random() * dessertIds.length)] || null;
                }
            } else {
                throw new NotFound(["There are no other recipes to recommend."]);
            }
        }

        await weeklyMenuRepository.updateOneForUser(userId, data.itemId, recommandedRecipe);

    } catch (error) {
        console.log(error);
        throw error;
    }
}

module.exports.setDontRecommendForUser = async (userId, recipeId) => {
    try {
        return await weeklyMenuRepository.setDontRecommendForUser(userId, recipeId);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

module.exports.getAllDontRecommendRecipesOfUser = async (userId) => {
    try {
        let recipeIds = [];

        recipeIds = await weeklyMenuRepository.getAllDontRecommendRecipesOfUser(userId);

        for (let i = 0; i < recipeIds.length; i++) {
            recipeIds[i] = recipeIds[i].recipeId;
        }

        return recipeIds;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

module.exports.getRecipeCardsOfUser = async (userId, nextWeek) => {
    try {
        let recipeCards = [];

        recipeCards = await weeklyMenuRepository.getRecipeCardsOfUser(userId, nextWeek);

        for (let i = 0; i < recipeCards.length; i++) {
            if(recipeCards[i].recipe){
                recipeCards[i].recipe.hour = Math.floor(recipeCards[i].recipe.minute / 60);
                recipeCards[i].recipe.minute = recipeCards[i].recipe.minute % 60;

                if(recipeCards[i].recipe.difficulty) {
                    recipeCards[i].recipe.difficulty = recipeCards[i].recipe.difficulty.name;
                }

                if(recipeCards[i].recipe.cost) {
                    recipeCards[i].recipe.cost = recipeCards[i].recipe.cost.name;
                }
            }
        }

        return recipeCards;
    } catch (error) {
        console.log(error);
        throw error;
    }
}



module.exports.generateWeeklyMenuScheduled = async () => {
    try {
        await weeklyMenuRepository.makeNextWeekThisWeek();

        let allUserIds = await userService.getAllUserIds();

        for (let i = 0; i < allUserIds.length; i++) {
            await this.generateWeekForUser(allUserIds[i], 1);
        }

        console.log("Generating weekly menu job finished.");

    } catch (error) {
        console.log(error);
        throw error;
    }
}

