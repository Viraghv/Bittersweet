import { createApp } from 'vue'
import '/style.scss'
import App from './App.vue'
import * as bootstrap from 'bootstrap'
import router from "./router/index.js";
import axios from "axios";
import vueAxios from "vue-axios";
import vueCookies from "vue3-cookies";
import {createPinia} from "pinia";
import {useUserStore} from "@/stores/userStore.js";


function getCookieByName(name){
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function setCookie(name, value, expirationDate) {
    document.cookie = `${name}=${value}; Expires=${expirationDate}; Path=/;`;
}

function deleteCookie(name) {
    document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
}

function tokenSoonExpires() {
    const tokenExpirationDate = Date.parse(decodeURIComponent(getCookieByName("tokenExpiration")));
    const presentDate = new Date(Date.now());

    if(isNaN(tokenExpirationDate)){
        throw "User is not logged in";
    }

    return tokenExpirationDate - presentDate < 60*60*1000;
}

axios.defaults.baseURL = import.meta.env.VITE_REQUEST_URL;
axios.defaults.withCredentials = true;
axios.defaults.headers.common["Authorization"] = getCookieByName("sessionToken") ?? "";


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

app.mount('#app')

