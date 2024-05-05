import axios from "axios";

export default {
    namespaced: true,
    state: {
        token: null,
        user: null
    },
    getters: {
        token (state) {
            return state.token
        },
        user (state) {
            return state.user
        }
    },
    mutations: {
        SET_TOKEN (state, value) {
            state.token = value;
        },
        SET_USER (state, value) {
            state.user = value
        }
    },
    actions: {
        async login ({commit}, credential) {
            await axios.post('auth/login', credential)
            .then(res => {
                commit('SET_TOKEN', res.data.accessToken)
                commit('SET_USER', res.data.user)
            })
        },
        async user ({commit}) {
            await axios.get('auth/me')
            .then(res => {
                commit('SET_USER', res.data)
            })
        },
        async logout ({commit}, token) {
            try {
                await axios.delete('auth/logout', {
                    data: {
                        token: token
                    }
                })
                .then(() => {
                    commit('SET_TOKEN', null)
                    commit('SET_USER', null)
                })
            } catch (err) {
                commit('SET_TOKEN', null)
                commit('SET_USER', null)
            }
        }
    }
}