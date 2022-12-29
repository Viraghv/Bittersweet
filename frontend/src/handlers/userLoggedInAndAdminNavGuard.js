import {useUserStore} from "@/stores/userStore.js";

export const beforeRouteEnter = (to, from, next) => {
    if(!useUserStore().loggedIn  && useUserStore().user?.admin) {
        next({name: 'Home'})
    } else {
        next()
    }
}