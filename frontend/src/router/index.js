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
    }
]

export default createRouter({
    history: createWebHistory(),
    routes
})