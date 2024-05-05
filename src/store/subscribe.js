import store  from "../store";
import axios from "axios";

store.subscribe((mutations) => {
    switch(mutations.type) {
        case 'auth/SET_TOKEN':
            if(mutations.payload) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${mutations.payload}`
                localStorage.setItem('token', mutations.payload)
                store.dispatch('auth/user')
            } else {
                axios.defaults.headers.common['Authorization'] = ''
                localStorage.removeItem('token')
            }
            break;
    }
})