import {createRouter, createWebHistory} from "vue-router";
import {useUserStore} from "@/stores/userStore.js";

const routes = [
    {
        name: "Home",
        path: "/",
        component: () => import('@/views/Home')
    },
    {
        name: "Profile",
        path: "/profile",
        component: () => import('@/views/Profile')
    },
    {
        name: "UploadRecipe",
        path: "/upload_recipe",
        component: () => import('@/views/UploadRecipe.vue'),
        beforeEnter: (to, from, next) => {
            if (!useUserStore().loggedIn){
                next({
                    path: '/',
                    replace: true
                })
            } else {
                next()
            }
        }
    }
]

export default createRouter({
    history: createWebHistory(),
    routes
})