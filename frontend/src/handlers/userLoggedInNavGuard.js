import {useUserStore} from "@/stores/userStore.js";

export const beforeRouteEnter = (to, from, next) => {
    if(!useUserStore().loggedIn) {
        next({name: 'Home'})
    } else {
        next()
    }
}