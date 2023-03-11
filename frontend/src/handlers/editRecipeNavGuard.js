import {useUserStore} from "@/stores/userStore.js";
import axios from "axios";

/**
 * Nav guard for recipe editing.
 * If user is not the uploader of the recipe and not an admin either, redirects to homepage.
 * @param to to object
 * @param from from object
 * @param next next object
 */
export const beforeRouteEnter = async (to, from, next) => {
    if(!useUserStore().loggedIn) {
        next({name: 'Home'})
    } else if (!to.params.recipeID){
        next()
    } else {
        const admin = await initAdmin();

        const recipeId = Number(to.params.recipeID);
        const userRecipes = await initRecipeIds();

        if(!(admin || userRecipes.includes(recipeId))){
            next({name: 'Home'})

        } else {
            next()
        }
    }
}

/**
 * Gets if current user is admin.
 * @returns current user admin value
 */
async function initAdmin(){
    try {
        const response = await axios.get('/user/isAdmin');
        return response.data
    } catch (error) {
        console.log(error.response.data);
    }
}

/**
 * Gets recipeIds of current user's uploaded recipes.
 * @returns recipeIds of current user's uploaded recipes
 */
async function initRecipeIds(){
    try {
        const response = await axios.get('/user/currentUserAllRecipeIds');
        return response.data;
    } catch (error) {
        console.log(error.response.data);
    }
}

