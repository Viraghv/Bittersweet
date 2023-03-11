import {useUserStore} from "@/stores/userStore.js";
import axios from "axios";

/**
 * Nav guard for admin pages.
 * Redirects to homepage if user is not a logged in admin.
 * @param to to object
 * @param from from object
 * @param next next object
 */
export const beforeRouteEnter = async (to, from, next) => {
    if(!useUserStore().loggedIn) {
        next({name: 'Home'})
    } else {
        const response = await initAdmin();
        const admin = response.data;

        if(!admin){
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
        return await axios.get('/user/isAdmin');
    } catch (error) {
        console.log(error.response.data);
    }
}

