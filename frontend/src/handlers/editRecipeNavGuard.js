import {useUserStore} from "@/stores/userStore.js";
import axios from "axios";

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

async function initAdmin(){
    try {
        const response = await axios.get('/user/isAdmin');
        return response.data
    } catch (error) {
        console.log(error.response.data);
    }
}

async function initRecipeIds(){
    try {
        const response = await axios.get('/user/currentUserAllRecipeIds');
        return response.data;
    } catch (error) {
        console.log(error.response.data);
    }
}

