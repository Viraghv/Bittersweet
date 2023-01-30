import {useUserStore} from "@/stores/userStore.js";
import axios from "axios";

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

async function initAdmin(){
    try {
        return await axios.get('/user/isAdmin');
    } catch (error) {
        console.log(error.response.data);
    }
}

