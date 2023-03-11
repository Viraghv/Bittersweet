import {useUserStore} from "@/stores/userStore.js";

/**
 * Nav guard for pages requiring a logged-in user.
 * Redirects to homepage is user is not logged in.
 * @param to to object
 * @param from from object
 * @param next next object
 */
export const beforeRouteEnter = (to, from, next) => {
    if(!useUserStore().loggedIn) {
        next({name: 'Home'})
    } else {
        next()
    }
}