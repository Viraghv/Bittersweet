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

        let recommendations = [];

        for (let day = 0; day <= 6; day++) {
            for (let meal = 1; meal <= 3; meal++) {
                let recommendedRecipe = null;

                if(meal === 1) {
                    if(breakfastIds.length === 0){
                        breakfastIds = recipeIds.breakfast;
                    }

                    if(day !== 0 ) {
                        let previousBreakfast = recommendations[(day-1) * 3].recipeId
                        let previousLunch = recommendations[(day-1) * 3 + 1].recipeId
                        let previousDinner = recommendations[(day-1) * 3 + 2].recipeId
                        let breakfastIdsCopy = breakfastIds.slice()  //copy by value

                        let index = breakfastIdsCopy.indexOf(previousBreakfast);
                        if (index !== -1) {
                            breakfastIdsCopy.splice(index, 1);
                        }
                        index = breakfastIdsCopy.indexOf(previousLunch);
                        if (index !== -1) {
                            breakfastIdsCopy.splice(index, 1);
                        }
                        index = breakfastIdsCopy.indexOf(previousDinner);
                        if (index !== -1) {
                            breakfastIdsCopy.splice(index, 1);
                        }

                        if(breakfastIdsCopy.length > 0){
                            recommendedRecipe = breakfastIdsCopy[Math.floor(Math.random() * breakfastIdsCopy.length)] || null;
                        } else {
                            recommendedRecipe = breakfastIds[Math.floor(Math.random() * breakfastIds.length)] || null;

                        }
                    } else {
                        recommendedRecipe = breakfastIds[Math.floor(Math.random() * breakfastIds.length)] || null;
                    }
                } else if(meal === 2) {
                    if(lunchIds.length === 0){
                        lunchIds = recipeIds.lunch;
                    }

                    if(lunchIds.length > 1) {
                        lunchIds = lunchIds.filter(e => e !== recommendations[day * 3 + meal - 2].recipeId);
                    }

                    if(day !== 0 ) {
                        let previousBreakfast = recommendations[(day-1) * 3].recipeId
                        let previousLunch = recommendations[(day-1) * 3 + 1].recipeId
                        let previousDinner = recommendations[(day-1) * 3 + 2].recipeId
                        let lunchIdsCopy = lunchIds.slice()  //copy by value

                        let index = lunchIdsCopy.indexOf(previousBreakfast);
                        if (index !== -1) {
                            lunchIdsCopy.splice(index, 1);
                        }
                        index = lunchIdsCopy.indexOf(previousLunch);
                        if (index !== -1) {
                            lunchIdsCopy.splice(index, 1);
                        }
                        index = lunchIdsCopy.indexOf(previousDinner);
                        if (index !== -1) {
                            lunchIdsCopy.splice(index, 1);
                        }

                        if(lunchIdsCopy.length > 0){
                            recommendedRecipe = lunchIdsCopy[Math.floor(Math.random() * lunchIdsCopy.length)] || null;
                        } else {
                            recommendedRecipe = lunchIds[Math.floor(Math.random() * lunchIds.length)] || null;

                        }
                    } else {
                        recommendedRecipe = lunchIds[Math.floor(Math.random() * lunchIds.length)] || null;
                    }
                } else if(meal === 3) {
                    if(dinnerIds.length === 0){
                        dinnerIds = recipeIds.dinner;
                    }

                    if(dinnerIds.length > 1) {
                        dinnerIds = dinnerIds.filter(e => e !== recommendations[day * 3 + meal - 2].recipeId);
                    }

                    if(dinnerIds.length > 1) {
                        dinnerIds = dinnerIds.filter(e => e !== recommendations[day * 3 + meal - 3].recipeId);
                    }

                    if(day !== 0 ) {
                        let previousBreakfast = recommendations[(day-1) * 3].recipeId
                        let previousLunch = recommendations[(day-1) * 3 + 1].recipeId
                        let previousDinner = recommendations[(day-1) * 3 + 2].recipeId
                        let dinnerIdsCopy = dinnerIds.slice()  //copy by value

                        let index = dinnerIdsCopy.indexOf(previousBreakfast);
                        if (index !== -1) {
                            dinnerIdsCopy.splice(index, 1);
                        }
                        index = dinnerIdsCopy.indexOf(previousLunch);
                        if (index !== -1) {
                            dinnerIdsCopy.splice(index, 1);
                        }
                        index = dinnerIdsCopy.indexOf(previousDinner);
                        if (index !== -1) {
                            dinnerIdsCopy.splice(index, 1);
                        }

                        if(dinnerIdsCopy.length > 0){
                            recommendedRecipe = dinnerIdsCopy[Math.floor(Math.random() * dinnerIdsCopy.length)] || null;
                        } else {
                            recommendedRecipe = dinnerIds[Math.floor(Math.random() * dinnerIds.length)] || null;

                        }
                    } else {
                        recommendedRecipe = dinnerIds[Math.floor(Math.random() * dinnerIds.length)] || null;
                    }
                }

                recommendations.push({
                    recipeId: recommendedRecipe,
                    day: day,
                    meal: meal,
                });

                breakfastIds = breakfastIds.filter(e => e !== recommendedRecipe);
                lunchIds = lunchIds.filter(e => e !== recommendedRecipe);
                dinnerIds = dinnerIds.filter(e => e !== recommendedRecipe);
                dessertIds = dessertIds.filter(e => e !== recommendedRecipe);

            }
        }

        for (let i = 0; i < 2; i++) {
            let recommendedRecipe = null;

            if(dessertIds.length === 0){
                dessertIds = recipeIds.dessert;
            }

            recommendedRecipe = dessertIds[Math.floor(Math.random() * dessertIds.length)] || null;
            dessertIds = dessertIds.filter(e => e !== recommendedRecipe);

            recommendations.push({
                recipeId: recommendedRecipe,
                day: null,
                meal: 0,
            });
        }

        let createCount = await weeklyMenuRepository.setItemsOfWeek(userId, nextWeek, recommendations);

        if (createCount.count !== 23){
            throw new InternalServerError(["Something went wrong during weekly menu generation."])
        }

        return recommendations;
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


        let recommendedRecipe = null;

        if(data.meal === 1) {
            recommendedRecipe = breakfastIds[Math.floor(Math.random() * breakfastIds.length)] || null;

            if(breakfastIds.length > 1) {
                while(recommendedRecipe === data.currentRecipeId) {
                    recommendedRecipe = breakfastIds[Math.floor(Math.random() * breakfastIds.length)] || null;
                }
            } else {
                await weeklyMenuRepository.updateOneForUser(userId, data.itemId, null);
                return new NotFound(["Sorry, there are no other recipes to recommend."]);
            }
        } else if(data.meal === 2) {
            recommendedRecipe = lunchIds[Math.floor(Math.random() * lunchIds.length)] || null;

            if(lunchIds.length > 1) {
                while(recommendedRecipe === data.currentRecipeId) {
                    recommendedRecipe = lunchIds[Math.floor(Math.random() * lunchIds.length)] || null;
                }
            } else {
                await weeklyMenuRepository.updateOneForUser(userId, data.itemId, null);
                return new NotFound(["Sorry, there are no other recipes to recommend."]);
            }
        } else if(data.meal === 3) {
            recommendedRecipe = dinnerIds[Math.floor(Math.random() * dinnerIds.length)] || null;

            if(dinnerIds.length > 1) {
                while(recommendedRecipe === data.currentRecipeId) {
                    recommendedRecipe = dinnerIds[Math.floor(Math.random() * dinnerIds.length)] || null;
                }
            } else {
                await weeklyMenuRepository.updateOneForUser(userId, data.itemId, null);
                return new NotFound(["Sorry, there are no other recipes to recommend."]);
            }
        } else if(data.meal === 0){
            recommendedRecipe = dessertIds[Math.floor(Math.random() * dessertIds.length)] || null;

            if(dessertIds.length > 1) {
                while(recommendedRecipe === data.currentRecipeId) {
                    recommendedRecipe = dessertIds[Math.floor(Math.random() * dessertIds.length)] || null;
                }
            } else {
                await weeklyMenuRepository.updateOneForUser(userId, data.itemId, null);
                return new NotFound(["Sorry, there are no other recipes to recommend."]);
            }
        }

        await weeklyMenuRepository.updateOneForUser(userId, data.itemId, recommendedRecipe);

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

module.exports.getAllDontRecommendRecipeCardsOfCurrentUser = async (userId, page) => {
    try {
        let recipeCards = [];

        recipeCards = await weeklyMenuRepository.getAllDontRecommendRecipeCardsOfCurrentUser(userId, page);

        for (let i = 0; i < recipeCards.length; i++) {
            recipeCards[i] = recipeCards[i].recipe;
        }

        return recipeCards;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

module.exports.getAllDontRecommendRecipeCardsCountOfCurrentUser = async (userId) => {
    try {
        let recipeCardsCount = 0;

        recipeCardsCount = await weeklyMenuRepository.getAllDontRecommendRecipeCardsCountOfCurrentUser(userId);

        return recipeCardsCount;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

module.exports.deleteDontRecommendOfCurrentUser = async (userId, recipeId) => {
    try {
        return await weeklyMenuRepository.deleteDontRecommendOfCurrentUser(userId, recipeId);
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

