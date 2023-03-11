import { createApp } from 'vue'
import '/style.scss'
import App from './App.vue'
import router from "./router/index.js";
import axios from "axios";
import vueAxios from "vue-axios";
import vueCookies from "vue3-cookies";
import {createPinia} from "pinia";
import {useUserStore} from "@/stores/userStore.js";
import VueAwesomePaginate from "vue-awesome-paginate";
import "vue-awesome-paginate/dist/style.css";

/**
 * Gets cookie value by cookie name.
 * @param name cookie name
 * @returns cookie value
 */
function getCookieByName(name){
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

/**
 * Sets cookie with given name, value, and expiration date.
 * @param name cookie name
 * @param value cookie value
 * @param expirationDate expiration date of cookie
 */
function setCookie(name, value, expirationDate) {
    document.cookie = `${name}=${value}; Expires=${expirationDate}; Path=/;`;
}

/**
 * Deletes cookie by name.
 * @param name cookie name
 */
function deleteCookie(name) {
    document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
}

/**
 * Function that checks if session token is about to expire.
 * @returns true if session token expires in less than an hour
 */
function tokenSoonExpires() {
    const tokenExpirationDate = Date.parse(decodeURIComponent(getCookieByName("tokenExpiration")));
    const presentDate = new Date(Date.now());

    if(isNaN(tokenExpirationDate)){
        throw "User is not logged in";
    }

    return tokenExpirationDate - presentDate < 60*60*1000;
}

// configure axios
axios.defaults.baseURL = import.meta.env.VITE_REQUEST_URL;
axios.defaults.withCredentials = true;
axios.defaults.headers.common["Authorization"] = getCookieByName("sessionToken") ?? "";

// log out user if token has expired
axios.interceptors.response.use(
    response => response,
    error => {
    if (error.response.status === 401){
        deleteCookie("sessionToken");
        deleteCookie("tokenExpiration");
        axios.defaults.headers.common["Authorization"] = "";

        const store = useUserStore();
        store.logout();
    }
    return Promise.reject(error);
});

// refresh session token if it's about to expire
axios.interceptors.request.use(
    async (config) => {
        try {
            if(config.url !== "/user/refreshToken" && tokenSoonExpires()) {
                const {data: {newExpirationDate}} = await axios.get("/user/refreshToken");
                const newExpirationDateUTCString = new Date(newExpirationDate).toUTCString();

                const sessionToken = getCookieByName("sessionToken");
                setCookie("sessionToken", sessionToken, newExpirationDateUTCString);
                setCookie("tokenExpiration", newExpirationDate, newExpirationDateUTCString);
            }
        } catch (error) {}

        return config;
    },
    error => Promise.reject(error)
)

const pinia = createPinia();

const app = createApp(App)
    .use(router)
    .use(vueAxios, axios)
    .use(vueCookies)
    .use(pinia)
    .use(VueAwesomePaginate)


app.mount('#app')

