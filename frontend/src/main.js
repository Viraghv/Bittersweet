import { createApp } from 'vue'
import '/style.scss'
import App from './App.vue'
import * as bootstrap from 'bootstrap'
import router from "./router/index.js";

createApp(App).use(router).mount('#app')
