import {createRouter, createWebHistory} from "vue-router";

const routes = [
    {
        name: "Home",
        path: "/",
        component: () => import('@/views/Home'),
    },
    {
        name: "SearchRecipe",
        path: "/search/:searchTerm?",
        component: () => import('@/views/SearchRecipe'),
        props: true,
    },
    {
        name: "WeeklyMenu",
        path: "/weeklyMenu/:nextWeek",
        component: () => import('@/views/WeeklyMenu.vue'),
        props: true,
        //userLoggedInNavGuard
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
    {
        name: "EmailVerification",
        path: "/verification/:token?",
        props: true,
        component: () => import('@/views/EmailVerification.vue'),
    },

    {
        name: "UsersAdmin",
        path: "/admin/users",
        component: () => import('@/views/admin/UsersAdmin.vue'),
        //userLoggedInAndAdminNavGuard
    },
]

export default createRouter({
    history: createWebHistory(),
    routes
})