import {createRouter, createWebHistory} from "vue-router";
import {useUserStore} from "@/stores/userStore.js";


const loggedInNavigationGuard = (to, from, next) => {
    if (!useUserStore().loggedIn){
        next({
            name: 'Home',
            replace: true
        })
    } else {
        next()
    }
}

const routes = [
    {
        name: "Home",
        path: "/",
        component: () => import('@/views/Home'),
    },
    {
        name: "Favourites",
        path: "/favourites",
        component: () => import('@/views/Favourites.vue'),
        //userLoggedInNavGuard
    },
    {
        name: "Profile",
        path: "/profile",
        component: () => import('@/views/Profile'),
        //userLoggedInNavGuard
    },
    {
        name: "Recipe",
        path: "/recipe/:recipeID",
        props: true,
        component: () => import('@/views/Recipe.vue'),
    },
    {
        name: "UploadRecipe",
        path: "/upload_recipe",
        component: () => import('@/views/UploadRecipe.vue'),
        //userLoggedInNavGuard
    },
]

export default createRouter({
    history: createWebHistory(),
    routes
})