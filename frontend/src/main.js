import { createApp } from 'vue'
import '/style.scss'
import App from './App.vue'
import * as bootstrap from 'bootstrap'
import router from "./router/index.js";
import axios from "axios";
import vueAxios from "vue-axios";

createApp(App)
    .use(router)
    .use(vueAxios, axios)
    .mount('#app')
