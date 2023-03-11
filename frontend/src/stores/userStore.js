import {defineStore} from "pinia";

/**
 * Global store for logged in status and user data.
 */
export const useUserStore = defineStore("user", {
    state: () => {
        return {
            loggedIn: false,
            user: null,
        }
    },

    actions: {
        login(){
            this.loggedIn = true;
        },

        logout(){
            this.loggedIn = false;
            this.user = null;
        },

        setUser(user){
            this.user = user;
        }
    }
})