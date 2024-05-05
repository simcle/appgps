<template>
    <div class="h-full p-5">
        <div class="grid grid-cols-3 items-center mb-5">
            <div class="font-semibold text-lg">Perangakt</div>
            <div class="text-center">
                <input type="text" name="search" class="h-9 border rounded px-3 min-w-96" placeholder="Cari perngkat" autocomplete="off">
            </div>
            <div class="text-right">
                <button @click="modal = true" class="bg-blue-500 h-9 rounded px-5 text-blue-50">Tambah perangkat</button>
            </div>
        </div>
        <div class="rounded overflow-hidden bg-white">
            <table class="w-full"> 
                <thead class="border border-gray-900">
                    <th class="bg-gray-900 text-gray-50 p-3">No POL</th>
                    <th class="bg-gray-900 text-gray-50 p-3">IMEI</th>
                    <th class="bg-gray-900 text-gray-50 p-3">No GSM</th>
                    <th class="bg-gray-900 text-gray-50 p-3">Merk</th>
                    <th class="bg-gray-900 text-gray-50 p-3 text-center" style="width: 7%">Aksi</th>
                </thead>
                <tbody class="divide-y border">
                    <tr v-for="(device, i) in devices" :key="i">
                        <td class="p-3">{{device.nopol}}</td>
                        <td class="p-3">{{device.imei}}</td>
                        <td class="p-3">{{device.gsm}}</td>
                        <td class="p-3">{{device.merk}}</td>
                        <td class="p-3 text-center">
                            <button @click="onEdit(device)" class="hover:text-blue-500"><i class="ph ph-pencil"></i></button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <modal :show="modal">
            <div class=" w-2/6 bg-white rounded border">
                <div class="flex items-center justify-between px-5 py-2.5 border-b">
                    <div class="text-lg font-semibold">{{modalTitle}}</div>
                    <button @click="modal=false" class="flex items-center text-red-500"><i class="ph ph-x-circle"></i></button>
                </div>
                <form @submit.prevent="onSubmit">
                    <div class="p-5">
                        <div class="mb-5">
                        <div class="mb-5">
                            <div class="mb-1">No Polisi</div>
                            <input v-model="form.nopol" type="text" name="no_polisi" class="h-9 w-full rounded border px-3" placeholder="no polisi kendaraan" autocomplete="off">
                        </div>
                        <div class="mb-1">IMEI <span class="text-red-500">*</span></div>
                            <input v-model="form.imei" @keydown="error.imei = ''" type="text" name="imei" :class="{'border-red-500': error.imei}" class="h-9 w-full rounded border px-3" placeholder="imei perangkat" autocomplete="off">
                        </div>
                        <div class="mb-5">
                            <div class="mb-1">No GSM</div>
                            <input v-model="form.gsm" type="text" name="no_gsm" class="h-9 w-full rounded border px-3" placeholder="no gsm perangkat" autocomplete="off">
                        </div>
                        <div class="mb-5">
                            <div class="mb-1">Merk kendaraan</div>
                            <input v-model="form.merk" type="text" name="merk_kendaraan" class="h-9 w-full rounded border px-3" placeholder="merk kendaraan" autocomplete="off">
                        </div>
                        <div class="text-right space-x-2">
                            <button @click="modal=false" type="button" class="bg-white h-9 rounded px-5 border">Batal</button>
                            <button type="submit" class="bg-blue-500 text-blue-50 h-9 rounded px-5 border">Simpan</button>
                        </div>
                    </div>
                </form>
            </div>
        </modal>
    </div>
</template>

<script>
import { ref } from '@vue/reactivity'
import Modal from '../components/Modal.vue'
import axios from 'axios'
import { onMounted, watch } from '@vue/runtime-core'
export default {
    components: {Modal},

    setup () {

        onMounted(() => {
            getData()
        })
        const devices = ref([])
        const getData = () => {
            axios.get('/devices')
            .then(res => {
                devices.value = res.data
            })
        }
        const modal = ref(false)
        const modalTitle = ref('Tambah perangkat')
        watch(modal, (value) => {
            if(!value) {
                modalTitle.value = 'Tambah perangkat'
                form.value = {
                    imei: '',
                    gsm: '',
                    nopol: '',
                    merk: ''
                }
            }
        })
        const form = ref({
            imei: '',
            gsm: '',
            nopol: '',
            merk: ''
        })
        const error = ref({
            imei: ''
        })
        const onEdit = (val) => {
            modalTitle.value = 'Ubah perangkat'
            form.value = {
                _id: val._id,
                imei: val.imei,
                gsm: val.gsm,
                nopol: val.nopol,
                merk: val.merk
            }
            modal.value = true
        }
        const onSubmit = () => {
            if(!form.value.imei) {
                error.value.imei = 'imei perangkat harus diisi!'
            }
            if(form.value.imei) {
                if(modalTitle.value == 'Tambah perangkat') {
                    axios.post('/devices', form.value)
                    .then(() => {
                        modal.value = false
                        getData()
                    })
                } else {
                    axios.put('/devices', form.value)
                    .then(() => {
                        modal.value = false
                        getData()
                    })
                }
            }
        }
        return {
            modal,
            modalTitle,
            devices,
            form,
            error,
            onSubmit,
            onEdit
        }
    }
}
</script>