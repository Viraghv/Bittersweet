import {createRouter, createWebHistory} from "vue-router";

const routes = [
    {
        name: "Home",
        path: "/",
        component: () => import('@/views/Home'),
    },
    {
        name: "SearchRecipe",
        path: "/search/:filters",
        component: () => import('@/views/SearchRecipe'),
        props: true,
    },
    {
        name: "WeeklyMenu",
        path: "/weekly-menu/:nextWeek",
        component: () => import('@/views/WeeklyMenu.vue'),
        props: true,
        //userLoggedInNavGuard
    },
    {
        name: "DontRecommendRecipes",
        path: "/weekly-menu/dont-recommend",
        component: () => import('@/views/DontRecommendRecipes.vue'),
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
    {
        name: "RecipesAdmin",
        path: "/admin/recipes",
        component: () => import('@/views/admin/RecipesAdmin.vue'),
        //userLoggedInAndAdminNavGuard
    },
    {
        name: "CommentsAdmin",
        path: "/admin/comments",
        component: () => import('@/views/admin/CommentsAdmin.vue'),
        //userLoggedInAndAdminNavGuard
    },
    {
        name: "UnitsAdmin",
        path: "/admin/units",
        component: () => import('@/views/admin/UnitsAdmin.vue'),
        //userLoggedInAndAdminNavGuard
    },
    {
        name: "DietsAdmin",
        path: "/admin/diets",
        component: () => import('@/views/admin/DietsAdmin.vue'),
        //userLoggedInAndAdminNavGuard
    },
    {
        name: "AllergensAdmin",
        path: "/admin/allergens",
        component: () => import('@/views/admin/AllergensAdmin.vue'),
        //userLoggedInAndAdminNavGuard
    },
    {
        name: "CategoriesAdmin",
        path: "/admin/categories",
        component: () => import('@/views/admin/CategoriesAdmin.vue'),
        //userLoggedInAndAdminNavGuard
    },
    {
        name: "StatisticsAdmin",
        path: "/admin/statistics",
        component: () => import('@/views/admin/StatisticsAdmin.vue'),
        //userLoggedInAndAdminNavGuard
    },
    {
        name: "UsersRankingAdmin",
        path: "/admin/statistics/ranking/users",
        component: () => import('@/views/admin/UsersRankingAdmin.vue'),
        //userLoggedInAndAdminNavGuard
    },
    {
        name: "CategoriesRankingAdmin",
        path: "/admin/statistics/ranking/categories",
        component: () => import('@/views/admin/CategoriesRankingAdmin.vue'),
        //userLoggedInAndAdminNavGuard
    },
]

export default createRouter({
    history: createWebHistory(),
    routes
})