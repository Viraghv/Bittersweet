import {createRouter, createWebHistory} from "vue-router";

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
        name: "ShoppingList",
        path: "/shopping-list",
        component: () => import('@/views/ShoppingList.vue'),
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
        path: "/upload_recipe/:recipeID?",
        props: true,
        component: () => import('@/views/UploadRecipe.vue'),
        //userLoggedInNavGuard
    },
]

export default createRouter({
    history: createWebHistory(),
    routes
})