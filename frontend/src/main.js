import { createApp } from 'vue'
import '/style.scss'
import App from './App.vue'
import * as bootstrap from 'bootstrap'
import router from "./router/index.js";
import axios from "axios";
import vueAxios from "vue-axios";
import vueCookies from "vue3-cookies";

const app = createApp(App)
    .use(router)
    .use(vueAxios, axios)
    .use(vueCookies, {expireTimes: "1d"})


app.config.globalProperties.$requestURL = import.meta.env.VITE_REQUEST_URL
app.mount('#app')