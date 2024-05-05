import { createApp } from 'vue'
import router from './router'
import store from './store'
import axios from 'axios'
import './store/subscribe'
import '@phosphor-icons/web/regular'

import './style.css'
import 'animate.css'
import App from './App.vue'

axios.defaults.baseURL = import.meta.env.VITE_API_URL

axios.interceptors.response.use(
    response => {
        return response
    },
    async err => {
        const {response: {status}} = err
        if(status == 403) {
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            store.commit('auth/SET_TOKEN', null)
            router.push('/login')
        }
        return Promise.reject(err)
    }
)
store.commit('auth/SET_TOKEN', localStorage.getItem('token'))
createApp(App).use(store).use(router).mount('#app')
