<template>
    <div class="inset-0 fixed bg-gray-100 flex items-center justify-center">
        <div class="bg-white w-80 p-5 border rounded">
            <div class="text-center my-5"><i class="ph ph-user-circle" style="font-size:90px"></i></div>
            <div class="text-center font-semibold text-xl mb-5">MASUK</div>
            <form @submit.prevent="onSubmit">
                <div class="mb-5">
                    <input v-model="form.email" type="email" name="email" :class="{'border-red-500': err.email}" class="h-11 w-full rounded border px-3" placeholder="email">
                </div>
                <div class="mb-5">
                    <input v-model="form.password" type="password" name="password" :class="{'border-red-500': err.password}" class="h-11 w-full rounded border px-3" placeholder="sandi">
                </div>
                <div class="mb-10">
                    <button class="h-11 bg-blue-500 w-full text-blue-50 rounded hover:bg-blue">Masuk</button>
                </div>
            </form>
        </div>
        <div v-show="isLoading" class="fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center">
            <div class="loader"></div>
        </div>
    </div>
</template>

<script>
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { reactive, ref } from '@vue/reactivity'
export default {
    setup () {
        const store = useStore()
        const router = useRouter()
        const isLoading = ref(false)
        const form = reactive({
            email: 'nendisofiandy84@gmail.com',
            password: 'pwlan123'
        })
        const err = reactive({
            email: '',
            password: ''
        })
        const onSubmit = () => {
            if(!form.email) {
                err.email = 'Email harus diisi!'
            }
            if(!form.password) {
                err.password = 'Sandi harus diisi'
            }
            if(form.email && form.password) {
                isLoading.value = true
                store.dispatch('auth/login', form)
                .then(() => {
                    isLoading.value = false
                    router.push('/')
                })
                .catch(error => {
                    const errResponse = error.response.data
                    if(errResponse == 'Akun tidak ditemukan') {
                        err.email = errResponse
                    } else {
                        err.password = errResponse
                    }
                })
            }
        }

        return {
            form,
            err,
            isLoading,
            onSubmit,
        }
    }
}
</script>