import {createRouter, createWebHistory} from "vue-router";

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
        component: () => import('@/views/UploadRecipe.vue')
    }
]

export default createRouter({
    history: createWebHistory(),
    routes
})