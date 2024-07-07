import { createWebHistory, createRouter } from "vue-router";
import store from "../store";
const routes = [
    {
        path: '/',
        name: 'Beranda',
        component: () => import('../view/tracking.vue'),
        meta: {
            auth: true
        }
    },
    {
        path: '/perangkat',
        name: 'Perangkat',
        component: () => import('../view/perangkat.vue'),
        meta: {
            auth: true
        }
    },
    {
        path: '/riwayat',
        name: 'Riwayat',
        component: () => import('../view/riwayat.vue'),
        meta: {
            auth: true
        }
    },
    {
        path: '/laporan',
        name: 'Laporan',
        component: () => import('../view/laporan.vue'),
        meta: {
            auth: true
        }
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../view/login.vue')
    }
]

const router = createRouter({
    linkActiveClass: 'active',
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    if(to.meta.auth && !token) next({name: 'Login'})
    else if(!to.meta.auth && token) next({name: 'Beranda'})
    else next()
})

export default router;