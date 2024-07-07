<template>
    <div class="p-5">
        <div class="text-2xl font-semibold mb-5">Laporan perjalanan</div>
        <div class="flex items-end space-x-5 mb-5">
            <div class="w-72">
                <div class="mb-2">No Polisi <span class="text-red-500">*</span></div>
                <div ref="elDropDown"  class="relative">
                    <input v-model="form.nopol" @click="showDropdown = !showDropdown" type="text" name="nopol" :class="{'border-red-500': err.nopol}" class="h-9 w-full bg-white focus:outline-none cursor-pointer border px-3 rounded" placeholder="Pilih no polisi kendaraan" readonly>
                    <div v-show="showDropdown" class="absolute w-full bg-white rounded z-10 mt-1 border">
                        <ul class="py-2 shadow-lg">
                            <li v-for="(device, i) in devices" :key="i" @click="onSelectDevice(device)" class="px-5 py-2 hover:bg-gray-100 cursor-pointer" :class="{'bg-blue-500 hover:!bg-blue-500 text-blue-50':form.nopol == device.nopol}">{{device.nopol}}</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="w-72">
                <div class="mb-2">Mulai :</div>
                <div class="grid grid-cols-5 gap-1">
                    <div class="col-span-3">
                        <DatePicker v-model="date.start" locale="id" mode="date" is24hr :max-date="new Date()">
                            <template #default="{inputValue, togglePopover}">
                                <div class="relative flex items-center h-9">
                                    <input @click="togglePopover" :value="inputValue" type="text" readonly class="h-9 cursor-pointer border rounded focus:outline-none w-full pl-12">
                                    <div class="absolute flex bg-gray-100 rounded-l items-center justify-center border h-full w-9"><i class="ph ph-calendar"></i></div>
                                </div>
                            </template>
                        </DatePicker>
                    </div>
                    <div class="col-span-2">
                        <DatePicker v-model="date.start" locale="id" mode="Time" hide-time-header is24hr :max-date="new Date()">
                            <template #default="{inputValue, togglePopover}">
                                <div class="relative flex items-center h-9">
                                    <input @click="togglePopover" :value="inputValue" type="text" readonly class="h-9 cursor-pointer border rounded focus:outline-none w-full pl-12 pr-3">
                                    <div class="absolute flex bg-gray-100 rounded-l items-center justify-center border h-full w-9"><i class="ph ph-clock"></i></div>
                                </div>
                            </template>
                        </DatePicker>   
                    </div>
                </div>
            </div>
            <div class="w-72">
                <div class="mb-2">Akhir :</div>
                <div class="grid grid-cols-5 gap-1">
                    <div class="col-span-3">
                        <DatePicker v-model="date.end" locale="id" mode="date" is24hr :max-date="new Date()">
                            <template #default="{inputValue, togglePopover }">
                                <div class="relative flex items-center h-9">
                                    <input @click="togglePopover" :value="inputValue" type="text" readonly class="h-9 cursor-pointer border rounded focus:outline-none w-full pl-12 pr-3">
                                    <div class="absolute flex bg-gray-100 rounded-l items-center justify-center border h-full w-9"><i class="ph ph-calendar"></i></div>
                                </div>
                            </template>
                        </DatePicker>
                    </div>
                    <div class="col-span-2">
                        <DatePicker v-model="date.end" locale="id" mode="time" is24hr :max-date="new Date()">
                            <template #default="{inputValue, togglePopover }">
                                <div class="relative flex items-center h-9">
                                    <input @click="togglePopover" :value="inputValue" type="text" readonly class="h-9 cursor-pointer border rounded focus:outline-none w-full pl-12 pr-3">
                                    <div class="absolute flex bg-gray-100 rounded-l items-center justify-center border h-full w-9"><i class="ph ph-clock"></i></div>
                                </div>
                            </template>
                        </DatePicker>
                    </div>
                </div>
            </div>
            <div class=" w-36">
                <button @click="onProcess" class="h-9 w-full text-blue-50 rounded" :class="[isLoading ? 'bg-blue-400': 'bg-blue-700 hover:bg-blue-800']" :disabled="isLoading">
                    Proses
                </button>
            </div>
            <div class=" w-36">
                <button @click="onDownload" class="h-9 w-full text-blue-50 rounded" :class="[isLoading ? 'bg-green-400': 'bg-green-700 hover:bg-green-800']" :disabled="isLoading">
                    Unduh
                </button>
            </div>
        </div>
        <div ref="table" class="w-full rounded overflow-hidden bg-white overflow-y-auto" style="height: 600px;">
            <table class="w-full">
                <thead>
                    <th class="bg-gray-900 p-3 py-3 text-gray-50 sticky top-0">Tanggal</th>
                    <th class="bg-gray-900 p-3 py-3 text-gray-50 sticky top-0 text-center">Mesin</th>
                    <th class="bg-gray-900 p-3 py-3 text-gray-50 sticky top-0 text-center">RPM</th>
                    <th class="bg-gray-900 p-3 py-3 text-gray-50 sticky top-0 text-center">Kecepatan</th>
                    <th class="bg-gray-900 p-3 py-3 text-gray-50 sticky top-0 text-center">Suhu mesin</th>
                    <th class="bg-gray-900 p-3 py-3 text-gray-50 sticky top-0 text-center">Odometer</th>
                    <th class="bg-gray-900 p-3 py-3 text-gray-50 sticky top-0 text-center">Oli Level</th>
                    <th class="bg-gray-900 p-3 py-3 text-gray-50 sticky top-0">Koordinat (LatLng)</th>
                </thead>
                <tbody class=" w-full divide-y">
                    <tr class="divide-y" v-for="(report, i) in reports" :key="i">
                        <td class="p-3">{{ getTimeDate(report.ts) }}</td>
                        <td class="p-3 text-center">{{ report.ignition ? "On":"Off" }}</td>
                        <td class="p-3 text-center">{{ report.engineRPM}}</td>
                        <td class="p-3 text-center">{{ report.vehicleSpeed}}</td>
                        <td class="p-3 text-center">{{ (report.engineTemperature * 0.1).toFixed(0)}}</td>
                        <td class="p-3 text-center">{{ report.totalMileage/1000}}</td>
                        <td class="p-3 text-center">
                            <i v-if="report.oilLevel" class="ph ph-seal-warning text-red-600"></i>
                            <i v-else class="ph ph-seal-check text-green-600"></i>
                        </td>
                        <td class="p-3">{{ report.latlng}}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <transition enter-active-class="animate__animated animate__fadeIn animate__faster">
            <div v-show="isLoading" class="absolute bg-gray-400 inset-0 bg-opacity-50 flex items-center justify-center">
                <div class="loader"></div>
            </div>
        </transition>
        <div v-if="reports.length > 12" class="fixed bottom-3 right-3">
            <button @click="onScrollToTop" class=" h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center text-blue-50"><i class="ph ph-arrow-up"></i></button>
        </div>
    </div>
</template>

<script>
import { onMounted, onUnmounted, ref } from 'vue'
import axios from 'axios'
import { DatePicker } from 'v-calendar'
import 'v-calendar/style.css';
export default {
    components: { DatePicker },
    setup () {
        const table = ref(null)
        const start = new Date()
        start.setHours(0, 0, 0)
        const devices = ref([])
        const form = ref({
            imei: '',
            nopol: '',
            gsm: ''
        })
        const err = ref({
            nopol: ''
        })

        const date = ref({
            start: start,
            end: new Date()
        })
        onMounted(() => {
            document.addEventListener('click', closeDropDown)
            getDevices()
        })
        onUnmounted(() => {
            document.removeEventListener('click', closeDropDown)
        })
        const getDevices = () => {
            axios.get('/devices')
            .then(res => {
                devices.value = res.data
            })
        }
        
        const showDropdown = ref(false)
        const elDropDown = ref(null)
        const closeDropDown = (e) => {
            if(!elDropDown.value.contains(e.target)) {
                showDropdown.value = false
            }
        }

        const onSelectDevice = (device) => {
            form.value.nopol = device.nopol
            form.value.imei = device.imei
            form.value.gsm = device.gsm
            showDropdown.value = false
            err.value.nopol = ''
        }

        const isLoading = ref(false)
        const reports = ref([])
        const onProcess = () => {
            if(!form.value.nopol) {
                err.value.nopol = true
            }
            if(form.value.nopol) {
                isLoading.value = true
                axios.get('/reported', {
                    params: {
                        imei: form.value.imei,
                        start: date.value.start,
                        end: date.value.end
                    }
                })
                .then(res => {
                    isLoading.value = false
                    reports.value = res.data
                })
            }
        }
        const onDownload = () => {
            if(!form.value.nopol) {
                err.value.nopol = true
            }
            if(form.value.nopol) {
                isLoading.value = true
                axios.get('/reported/download', {
                    params: {
                        imei: form.value.imei,
                        start: date.value.start,
                        end: date.value.end
                    },
                    responseType: 'blob'
                })
                .then(response => {
                    isLoading.value = false
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', 'laporan.xlsx');
                    document.body.appendChild(link);
                    link.click();
                })
            }
        }
        const getTimeDate = (d) => {
            console.log(d)
            const date = new Date(d)
            let D = date.getDate()
            let m = date.getMonth() + 1
            let y = date.getFullYear()
            let H = date.getHours()
            let M = date.getMinutes()
            let I = date.getSeconds()
            D = checkTime(D)
            m = checkTime(m)
            H = checkTime(H)
            M = checkTime(M)
            I = checkTime(I)
            function checkTime (i) {
                if(i < 10) {
                    i = `0${i}`
                }
                return i
            }
            var timestamp = `${D}/${m}/${y} ${H}:${M}:${I}` 
            return timestamp
        }
        const onScrollToTop = () => {
            console.log(table.value)
            table.value.scrollTo({top:0, behavior: 'smooth'})
        }
        return {
            table,
            devices,
            elDropDown,
            showDropdown,
            date,
            form,
            err,
            isLoading,
            reports,
            closeDropDown,
            onSelectDevice,
            onProcess,
            getTimeDate,
            onDownload,
            onScrollToTop
        }
    }
}
</script>