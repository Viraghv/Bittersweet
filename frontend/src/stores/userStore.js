import {defineStore} from "pinia";

export const useUserStore = defineStore("user", {
    state: () => {
        return {
            loggedIn: false,
        }
    },

    actions: {
        login(){
            this.loggedIn = true;
        },

        logout(){
            this.loggedIn = false;
        }
    }
})