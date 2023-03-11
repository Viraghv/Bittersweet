const weeklyMenuRepository = require('../repositories/weeklyMenuRepository');
const userService = require("./userService");
const recipeRepository = require("../repositories/recipeRepository");
const InternalServerError = require("../exceptions/InternalServerError");
const BadRequest = require("../exceptions/BadRequest");
const NotFound = require("../exceptions/NotFound");

/**
 * Service function for generating weekly menu by week for user.
 * Generates weekly menu of given week for user based on their preferences, while trying to avoid the repetition
 * of recommended recipes.
 * @param userId userId od user
 * @param nextWeek week to generate (0: this week, 1: next week)
 * @returns generated weekly menu as array of weekly menu item objects
 */
module.exports.generateWeekForUser = async (userId, nextWeek) => {
    try {
        // is nextWeek attribute either 0 or 1
        if(nextWeek !== 0 && nextWeek !== 1){
            throw new BadRequest("'nextWeek' parameter can only be 0 or 1.")
        }

        // get user
        let user = await userService.getUserById(userId);

        if(!user){
            throw new BadRequest("User does not exist.")
        }

        // convert user allergies array to a more intuitive form
        let userAllergies = [];
        for (let i = 0; i < user.allergies.length; i++) {
            userAllergies.push(user.allergies[i].id);
        }
        user.allergies = userAllergies;

        // get recipeIds of recipes user asked not to recommend
        let userDontRecommendRecipeIds = await this.getAllDontRecommendRecipesOfUser(userId);

        // get recipeIds of recipes fitting the user's preferences
        let recipeIds = await recipeRepository.getRecipeIdsByUserPreference(user);

        // calculate recipeIds by meal that fit preferences and are not among the recipes not to recommend
        let breakfastIds = [];
        let lunchIds = [];
        let dinnerIds = [];
        let dessertIds = [];

        // go through all breakfasts fitting preferences
        for (let i = 0; i < recipeIds.breakfast.length; i++) {
            // if not among recipes not to recommend, put in breakfastIds array
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

        let recommendations = []; // array storing generated recommendations

        // generate for every meal of every day
        for (let day = 0; day <= 6; day++) {
            for (let meal = 1; meal <= 3; meal++) {
                let recommendedRecipe = null;

                // if the meal is breakfast
                if(meal === 1) {
                    // if there are no more different recipes to recommend, reset breakfastIds array
                    if(breakfastIds.length === 0){
                        breakfastIds = recipeIds.breakfast;
                    }

                    // if the day is not Monday
                    if(day !== 0 ) {
                        // get already generated meals of the previous day
                        let previousBreakfast = recommendations[(day-1) * 3].recipeId
                        let previousLunch = recommendations[(day-1) * 3 + 1].recipeId
                        let previousDinner = recommendations[(day-1) * 3 + 2].recipeId
                        let breakfastIdsCopy = breakfastIds.slice()  //copy by value

                        // delete meals of the previous day from copied array
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

                        // if there are any recipes left, pick one randomly from them to recommend
                        if(breakfastIdsCopy.length > 0){
                            recommendedRecipe = breakfastIdsCopy[Math.floor(Math.random() * breakfastIdsCopy.length)] || null;
                        // if there are no recipes left, pick one from the original array to recommend
                        } else {
                            recommendedRecipe = breakfastIds[Math.floor(Math.random() * breakfastIds.length)] || null;

                        }
                    // if the day is Monday, pick randomly from fitting breakfasts
                    } else {
                        recommendedRecipe = breakfastIds[Math.floor(Math.random() * breakfastIds.length)] || null;
                    }
                // if the meal is lunch
                } else if(meal === 2) {
                    // if there are no more different recipes to recommend, reset lunchIds array
                    if(lunchIds.length === 0){
                        lunchIds = recipeIds.lunch;
                    }

                    // if there is more than one recipe in array, remove that day's recommended breakfast from it
                    if(lunchIds.length > 1) {
                        lunchIds = lunchIds.filter(e => e !== recommendations[day * 3 + meal - 2].recipeId);
                    }

                    // if the day is not Monday
                    if(day !== 0 ) {
                        // get already generated meals of the previous day
                        let previousBreakfast = recommendations[(day-1) * 3].recipeId
                        let previousLunch = recommendations[(day-1) * 3 + 1].recipeId
                        let previousDinner = recommendations[(day-1) * 3 + 2].recipeId
                        let lunchIdsCopy = lunchIds.slice()  //copy by value

                        // delete meals of the previous day from copied array
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

                        // if there are any recipes left, pick one randomly from them to recommend
                        if(lunchIdsCopy.length > 0){
                            recommendedRecipe = lunchIdsCopy[Math.floor(Math.random() * lunchIdsCopy.length)] || null;
                        // if there are no recipes left, pick one from the original array to recommend
                        } else {
                            recommendedRecipe = lunchIds[Math.floor(Math.random() * lunchIds.length)] || null;

                        }
                    // if the day is Monday, pick randomly from fitting lunches
                    } else {
                        recommendedRecipe = lunchIds[Math.floor(Math.random() * lunchIds.length)] || null;
                    }
                // if the meal is dinner
                } else if(meal === 3) {
                    // if there are no more different recipes to recommend, reset dinnerIds array
                    if(dinnerIds.length === 0){
                        dinnerIds = recipeIds.dinner;
                    }

                    // if there is more than one recipe in array, remove that day's recommended lunch from it
                    if(dinnerIds.length > 1) {
                        dinnerIds = dinnerIds.filter(e => e !== recommendations[day * 3 + meal - 2].recipeId);
                    }
                    // if there is more than one recipe in array, remove that day's recommended breakfast from it
                    if(dinnerIds.length > 1) {
                        dinnerIds = dinnerIds.filter(e => e !== recommendations[day * 3 + meal - 3].recipeId);
                    }

                    // if the day is not Monday
                    if(day !== 0 ) {
                        // get already generated meals of the previous day
                        let previousBreakfast = recommendations[(day-1) * 3].recipeId
                        let previousLunch = recommendations[(day-1) * 3 + 1].recipeId
                        let previousDinner = recommendations[(day-1) * 3 + 2].recipeId
                        let dinnerIdsCopy = dinnerIds.slice()  //copy by value

                        // delete meals of the previous day from copied array
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

                        // if there are any recipes left, pick one randomly from them to recommend
                        if(dinnerIdsCopy.length > 0){
                            recommendedRecipe = dinnerIdsCopy[Math.floor(Math.random() * dinnerIdsCopy.length)] || null;
                        // if there are no recipes left, pick one from the original array to recommend
                        } else {
                            recommendedRecipe = dinnerIds[Math.floor(Math.random() * dinnerIds.length)] || null;

                        }
                    // if the day is Monday, pick randomly from fitting dinners
                    } else {
                        recommendedRecipe = dinnerIds[Math.floor(Math.random() * dinnerIds.length)] || null;
                    }
                }

                // push recommended recipe with the day and meal into recommendations array
                recommendations.push({
                    recipeId: recommendedRecipe,
                    day: day,
                    meal: meal,
                });

                // remove recommended recipe's recipeId from recipe options of every meal (to avoid repetition)
                breakfastIds = breakfastIds.filter(e => e !== recommendedRecipe);
                lunchIds = lunchIds.filter(e => e !== recommendedRecipe);
                dinnerIds = dinnerIds.filter(e => e !== recommendedRecipe);
                dessertIds = dessertIds.filter(e => e !== recommendedRecipe);

            }
        }

        // dessert recommendation
        for (let i = 4; i < 6; i++) {
            let recommendedRecipe = null;

            // if there are no more different recipes to recommend, reset dessertIds array
            if(dessertIds.length === 0){
                dessertIds = recipeIds.dessert;
            }

            // randomly pick one dessert to recommend
            recommendedRecipe = dessertIds[Math.floor(Math.random() * dessertIds.length)] || null;
            // remove recommended dessert's recipeId from dessert options (to avoid repetition)
            dessertIds = dessertIds.filter(e => e !== recommendedRecipe);

            // push recommended recipe with the meal into recommendations array, day is set null because dessert is
            // not recommended daily, but weekly
            recommendations.push({
                recipeId: recommendedRecipe,
                day: null,
                meal: i,
            });
        }

        // store recommendations in the database
        let createCount = await weeklyMenuRepository.setItemsOfWeek(userId, nextWeek, recommendations);

        // if the number of records added were not 23, then not recommendations were successfully saved
        if (createCount.count !== 23){
            throw new InternalServerError(["Something went wrong during weekly menu generation."])
        }

        return recommendations;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

/**
 * Service function for generating one new recipe for user's weekly menu instead of the already existing one
 * by weeklyMenuItemId.
 * Generates one meal for user based on their preferences that's different from the currently recommended one.
 * @param userId userId of user
 * @param data data object of weekly menu item to replace
 * @returns error message if there is no fitting recipe to recommend
 */
module.exports.generateOneForUser = async (userId, data) => {
    try {
        // get user
        let user = await userService.getUserById(userId);

        if(!user){
            throw new BadRequest("User does not exist.")
        }

        // convert user allergies array to a more intuitive form
        let userAllergies = [];
        for (let i = 0; i < user.allergies.length; i++) {
            userAllergies.push(user.allergies[i].id);
        }
        user.allergies = userAllergies;

        // get recipeIds of recipes user asked not to recommend
        let userDontRecommendRecipeIds = await this.getAllDontRecommendRecipesOfUser(userId);

        // get recipeIds of recipes fitting the user's preferences
        let recipeIds = await recipeRepository.getRecipeIdsByUserPreference(user);

        // calculate recipeIds by meal that fit preferences and are not among the recipes not to recommend
        let breakfastIds = [];
        let lunchIds = [];
        let dinnerIds = [];
        let dessertIds = [];

        // go through all breakfasts fitting preferences
        for (let i = 0; i < recipeIds.breakfast.length; i++) {
            // if not among recipes not to recommend, put in breakfastIds array
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

        // if the meal is breakfast
        if(data.meal === 1) {
            //pick one randomly from breakfasts to recommend
            recommendedRecipe = breakfastIds[Math.floor(Math.random() * breakfastIds.length)] || null;

            // if there is more than one recipe to recommend, pick randomly until it's different from the currently
            // recommended one
            if(breakfastIds.length > 1) {
                while(recommendedRecipe === data.currentRecipeId) {
                    recommendedRecipe = breakfastIds[Math.floor(Math.random() * breakfastIds.length)] || null;
                }
            // if there is no other recipe to recommend, set recommended recipe for meal as null, and send back an error
            } else {
                await weeklyMenuRepository.updateOneForUserByItemId(userId, data.itemId, null);
                return new NotFound(["Sorry, there are no other recipes to recommend."]);
            }
        // if the meal is lunch
        } else if(data.meal === 2) {
            //pick one randomly from lunches to recommend
            recommendedRecipe = lunchIds[Math.floor(Math.random() * lunchIds.length)] || null;

            // if there is more than one recipe to recommend, pick randomly until it's different from the currently
            // recommended one
            if(lunchIds.length > 1) {
                while(recommendedRecipe === data.currentRecipeId) {
                    recommendedRecipe = lunchIds[Math.floor(Math.random() * lunchIds.length)] || null;
                }
            // if there is no other recipe to recommend, set recommended recipe for meal as null, and send back an error
            } else {
                await weeklyMenuRepository.updateOneForUserByItemId(userId, data.itemId, null);
                return new NotFound(["Sorry, there are no other recipes to recommend."]);
            }
        // if the meal is dinner
        } else if(data.meal === 3) {
            //pick one randomly from dinners to recommend
            recommendedRecipe = dinnerIds[Math.floor(Math.random() * dinnerIds.length)] || null;

            // if there is more than one recipe to recommend, pick randomly until it's different from the currently
            // recommended one
            if(dinnerIds.length > 1) {
                while(recommendedRecipe === data.currentRecipeId) {
                    recommendedRecipe = dinnerIds[Math.floor(Math.random() * dinnerIds.length)] || null;
                }
            // if there is no other recipe to recommend, set recommended recipe for meal as null, and send back an error
            } else {
                await weeklyMenuRepository.updateOneForUserByItemId(userId, data.itemId, null);
                return new NotFound(["Sorry, there are no other recipes to recommend."]);
            }
        // if the meal is dessert
        } else if(data.meal === 4 || data.meal === 5){
            //pick one randomly from desserts to recommend
            recommendedRecipe = dessertIds[Math.floor(Math.random() * dessertIds.length)] || null;

            // if there is more than one recipe to recommend, pick randomly until it's different from the currently
            // recommended one
            if(dessertIds.length > 1) {
                while(recommendedRecipe === data.currentRecipeId) {
                    recommendedRecipe = dessertIds[Math.floor(Math.random() * dessertIds.length)] || null;
                }
            // if there is no other recipe to recommend, set recommended recipe for meal as null, and send back an error
            } else {
                await weeklyMenuRepository.updateOneForUserByItemId(userId, data.itemId, null);
                return new NotFound(["Sorry, there are no other recipes to recommend."]);
            }
        }

        // update recommended recipe to the new one in the database
        await weeklyMenuRepository.updateOneForUserByItemId(userId, data.itemId, recommendedRecipe);

    } catch (error) {
        console.log(error);
        throw error;
    }
}

/**
 * Service function for generating one new recipe for user's weekly menu by week, day, and meal.
 * Generates one meal for user to the given week, day, and meal, based on their preferences.
 * @param userId userId of user
 * @param data object containing the week, day, and meal to regenerate
 * @returns error message if there is no fitting recipe to recommend
 */
module.exports.generateOneByMealForUser = async (userId, data) => {
    try {
        // get user
        let user = await userService.getUserById(userId);

        if(!user){
            throw new BadRequest("User does not exist.")
        }

        // convert user allergies array to a more intuitive form
        let userAllergies = [];
        for (let i = 0; i < user.allergies.length; i++) {
            userAllergies.push(user.allergies[i].id);
        }
        user.allergies = userAllergies;

        // get recipeIds of recipes user asked not to recommend
        let userDontRecommendRecipeIds = await this.getAllDontRecommendRecipesOfUser(userId);

        // get recipeIds of recipes fitting the user's preferences
        let recipeIds = await recipeRepository.getRecipeIdsByUserPreference(user);

        // calculate recipeIds by meal that fit preferences and are not among the recipes not to recommend
        let breakfastIds = [];
        let lunchIds = [];
        let dinnerIds = [];
        let dessertIds = [];

        // go through all breakfasts fitting preferences
        for (let i = 0; i < recipeIds.breakfast.length; i++) {
            // if not among recipes not to recommend, put in breakfastIds array
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

        // if the meal is breakfast
        if(data.meal === 1) {
            // if there is no recipe to recommend, set recommended recipe for meal as null, and send back an error
            if(breakfastIds.length === 0){
                await weeklyMenuRepository.setOneOfCurrentUserByMeal(userId, data, null);
                return new NotFound(["Sorry, there are no recipes to recommend."]);
            //pick one randomly from breakfasts to recommend
            } else {
                recommendedRecipe = breakfastIds[Math.floor(Math.random() * breakfastIds.length)] || null;
            }
        // if the meal is lunch
        } else if(data.meal === 2) {
            // if there is no recipe to recommend, set recommended recipe for meal as null, and send back an error
            if(lunchIds.length === 0){
                await weeklyMenuRepository.setOneOfCurrentUserByMeal(userId, data, null);
                return new NotFound(["Sorry, there are no recipes to recommend."]);
            // pick one randomly from lunches to recommend
            } else {
                recommendedRecipe = lunchIds[Math.floor(Math.random() * lunchIds.length)] || null;
            }
        // if the meal is dinner
        } else if(data.meal === 3) {
            // if there is no recipe to recommend, set recommended recipe for meal as null, and send back an error
            if(dinnerIds.length === 0){
                await weeklyMenuRepository.setOneOfCurrentUserByMeal(userId, data, null);
                return new NotFound(["Sorry, there are no recipes to recommend."]);
            // pick one randomly from dinners to recommend
            } else {
                recommendedRecipe = dinnerIds[Math.floor(Math.random() * dinnerIds.length)] || null;
            }
        // if the meal is dessert
        } else if(data.meal === 4 || data.meal === 5){
            // if there is no recipe to recommend, set recommended recipe for meal as null, and send back an error
            if(dessertIds.length === 0){
                await weeklyMenuRepository.setOneOfCurrentUserByMeal(userId, data, null);
                return new NotFound(["Sorry, there are no recipes to recommend."]);

            // pick one randomly from dinners to recommend
            } else {
                recommendedRecipe = dessertIds[Math.floor(Math.random() * dessertIds.length)] || null;
            }
        }
        data.recipeId = recommendedRecipe;

        // insert new recommendation to the database
        await weeklyMenuRepository.setOneOfCurrentUserByMeal(userId, data);

    } catch (error) {
        console.log(error);
        throw error;
    }
}

/**
 * Service function for putting a specific recipe on the weekly menu of user.
 * Validates input before calling repository.
 * @param userId userId of user
 * @param itemData object containing which recipe to set to which week, day, and meal
 */
module.exports.setOneOfCurrentUser = async (userId, itemData) => {
    try {
        // is the nextWeek value a boolean
        if(typeof itemData.nextWeek !== 'boolean') {
            throw new BadRequest(["The 'nextWeek' value must be Boolean."])
        }

        // is the day value between 0 and 6
        if(itemData.meal !== 0){
            if(itemData.day < 0 || itemData.day > 6) {
                throw new BadRequest(["Day must be a 0-6 value."]);
            }
        }

        // is the meal value between 0 and 5
        if(itemData.meal < 0 || itemData.meal > 5) {
            throw new BadRequest(["Meal must be a 0-5 value."]);
        }

        // is the unsetByUser value a boolean
        if(typeof itemData.unsetByUser !== 'boolean') {
            throw new BadRequest(["The 'unsetByUser' value must be Boolean."])
        }

        // if the recipe is being set as dessert, the day can only be set to null
        if((itemData.meal === 4 || itemData.meal === 5) && itemData.day !== null) {
            throw new BadRequest(["Dessert meal can't be assigned to a day."])
        }

        await weeklyMenuRepository.setOneOfCurrentUserByMeal(userId, itemData);

    } catch (error) {
        console.log(error);
        throw error;
    }
}

/**
 * Service function for getting weekly menu recipe cards of user by week.
 * After calling repository, converts recipe time to hour and minutes, and other attributes to the desired format.
 * @param userId userId of user
 * @param nextWeek week to get (0: this week, 1: next week)
 * @returns recipeCards of user's weekly menu from the given week
 */
module.exports.getRecipeCardsOfUser = async (userId, nextWeek) => {
    try {
        let recipeCards = [];

        recipeCards = await weeklyMenuRepository.getRecipeCardsOfUser(userId, nextWeek);

        for (let i = 0; i < recipeCards.length; i++) {
            if(recipeCards[i].recipe){
                // convert time to hour and minutes
                recipeCards[i].recipe.hour = Math.floor(recipeCards[i].recipe.minute / 60);
                recipeCards[i].recipe.minute = recipeCards[i].recipe.minute % 60;

                // convert recipe difficulty to a more intuitive form
                if(recipeCards[i].recipe.difficulty) {
                    recipeCards[i].recipe.difficulty = recipeCards[i].recipe.difficulty.name;
                }

                // convert recipe cost to a more intuitive form
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

/**
 * Service function for setting recipe as "Don't recommend" for user.
 * @param userId userId of user
 * @param recipeId recipeId of recipe to set
 * @returns created new record as object
 */
module.exports.setDontRecommendForUser = async (userId, recipeId) => {
    try {
        return await weeklyMenuRepository.setDontRecommendForUser(userId, recipeId);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

/**
 * Service function for getting all "Don't recommend" recipe recipeIds of user.
 * Converts received data to the desired format.
 * @param userId userId of user
 * @returns recipeIds of recipes user set as "Don't recommend"
 */
module.exports.getAllDontRecommendRecipesOfUser = async (userId) => {
    try {
        let recipeIds = [];

        recipeIds = await weeklyMenuRepository.getAllDontRecommendRecipesOfUser(userId);

        // convert recipeIds array to a more intuitive form
        for (let i = 0; i < recipeIds.length; i++) {
            recipeIds[i] = recipeIds[i].recipeId;
        }

        return recipeIds;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

/**
 * Service function for getting all "Don't recommend" recipes of user by page.
 * Converts received data to the desired format.
 * @param userId userId of user
 * @param page page to get
 * @returns array of all "Don't recommend" recipe cards of user for given page
 */
module.exports.getAllDontRecommendRecipeCardsOfCurrentUser = async (userId, page) => {
    try {
        let recipeCards = [];

        recipeCards = await weeklyMenuRepository.getAllDontRecommendRecipeCardsOfCurrentUser(userId, page);

        // convert recipeCards array to a more intuitive form
        for (let i = 0; i < recipeCards.length; i++) {
            recipeCards[i] = recipeCards[i].recipe;
        }

        return recipeCards;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

/**
 * Service function for getting count of user's all "Don't recommend" recipes.
 * @param userId userId of user
 * @returns count of user's all "Don't recommend" recipes
 */
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

/**
 * Service function for removing recipe from user's "Don't recommend" recipes.
 * @param userId userId of user
 * @param recipeId recipeId of recipe to remove
 * @returns number of records deleted
 */
module.exports.deleteDontRecommendOfUser = async (userId, recipeId) => {
    try {
        return await weeklyMenuRepository.deleteDontRecommendOfUser(userId, recipeId);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

/**
 * Scheduled function for generating a new weekly menu for the next week on every monday for every verified user.
 */
module.exports.generateWeeklyMenuScheduled = async () => {
    try {
        await weeklyMenuRepository.makeNextWeekThisWeek();

        let allUserIds = await userService.getAllVerifiedUserIds();

        for (let i = 0; i < allUserIds.length; i++) {
            await this.generateWeekForUser(allUserIds[i], 1);
        }

        console.log("Generating weekly menu job finished.");

    } catch (error) {
        console.log(error);
        throw error;
    }
}

