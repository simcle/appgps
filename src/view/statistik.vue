<template>
    <div class="p-5">
        <div class="text-2xl font-semibold mb-5">Statistik jarak tempuh</div>
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

            <div>
                <div class="mb-2">Mulai :</div>
                <DatePicker v-model="date.start" locale="id" mode="date" is24hr :max-date="new Date()">
                    <template #default="{inputValue, togglePopover}">
                        <div class="relative flex items-center h-9">
                            <input @click="togglePopover" :value="inputValue" type="text" readonly class="h-9 cursor-pointer border rounded focus:outline-none w-full pl-12">
                            <div class="absolute flex bg-gray-100 rounded-l items-center justify-center border h-full w-9"><i class="ph ph-calendar"></i></div>
                        </div>
                    </template>
                </DatePicker>
            </div>

            <div>
                <div class="mb-2">Akhir :</div>
                <DatePicker v-model="date.end" locale="id" mode="date" :min-date="date.start" :max-date="new Date()">
                    <template #default="{inputValue, togglePopover }">
                        <div class="relative flex items-center h-9">
                            <input @click="togglePopover" :value="inputValue" type="text" readonly class="h-9 cursor-pointer border rounded focus:outline-none w-full pl-12 pr-3">
                            <div class="absolute flex bg-gray-100 rounded-l items-center justify-center border h-full w-9"><i class="ph ph-calendar"></i></div>
                        </div>
                    </template>
                </DatePicker>
            </div>

            <div class=" w-36">
                <button @click="onProcess" class="h-9 w-full text-blue-50 rounded" :class="[isLoading ? 'bg-blue-400': 'bg-blue-700 hover:bg-blue-800']" :disabled="isLoading">
                    Proses
                </button>
            </div>

            <div class=" w-36">
                <button @click="onDownload" class="h-9 w-full text-blue-50 rounded" :class="[isLoading ? 'bg-green-400': 'bg-green-700 hover:bg-green-800']" :disabled="isLoading">
                    Unduh PNG
                </button>
            </div>

        </div>

        <div id="my-node" class="grid grid-cols-7 bg-white border rounded overflow-hidden">
            <div class="col-span-5 p-5" style="min-height: 500px;">
                <canvas id="chart"></canvas>
            </div>
            <div class="col-span-2 bg-blue-800 p-5">
                <div class="text-center text-blue-50 text-2xl font-semibold mb-5">Ringkasan</div>
                <div class="text-center mb-10">
                    <div class="text-lg text-blue-50 font-semibold leading-none">{{ noPol }}</div>
                    <div class=" text-xs text-blue-300">No Polisi</div>
                </div>
                <div class="grid grid-cols-2 text-blue-50">
                    <div class="flex items-center justify-center border border-blue-300 p-3 border-r-0 rounded-l space-x-5">
                        <div>
                            <i class="ph ph-calendar text-blue-400" style="font-size: 45px;"></i>
                        </div>
                        <div>
                            <div class="text-lg">{{ dateStart }}</div>
                            <div class="text-blue-200 text-xs">Mulai</div>
                        </div>
                    </div>
                    <div class="flex items-center justify-center border border-blue-300 p-3 rounded-r space-x-5">
                        <div>
                            <i class="ph ph-calendar text-blue-400" style="font-size: 45px;"></i>
                        </div>
                        <div>
                            <div class="text-lg">{{ dateEnd }}</div>
                            <div class="text-blue-200 text-xs">Akhir</div>
                        </div>
                    </div>
                </div>
                <div class="border-b py-5 border-blue-300">
                    <div class="text-center text-blue-200 mb-1">Total jarak tempuh</div>
                    <div class="text-center">
                        <div class="text-5xl font-semibold text-blue-50">{{ totalMileage }} <span class="text-sm font-normal">Km</span></div>
                    </div>
                </div>
                <div class="border-b py-5 border-blue-300">
                    <div class="text-center text-blue-200 mb-1">Rata-rata laju kecepatan kendaraan</div>
                    <div class="text-center">
                        <div class="text-5xl font-semibold text-blue-50">{{ averageSpeed.toFixed(2) }} <span class="text-sm font-normal">Km/jam</span></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import { DatePicker } from 'v-calendar'
import 'v-calendar/style.css';
import chartJS from 'chart.js/auto'
import * as htmlToImage from 'html-to-image';
import download from 'downloadjs'
export default {
    components: {DatePicker},
    setup () {
        const devices = ref([])
        const start = new Date()
        const day = start.getDate() - 6
        start.setDate(day)
        start.setHours(0, 0, 0)
        const endDate = new Date()
        endDate.setHours(23, 59, 59)

        const form = ref({
            imei: '',
            nopol: '',
            gsm: '',
        })
        const err = ref({
            nopol: ''
        })

        const date = ref({
            start: start,
            end: endDate
        })
        var chart;
        onMounted(() => {
            const myChart = document.getElementById("chart")
            myChart.height = 100%
            document.addEventListener('click', closeDropDown)
            chart = new chartJS(myChart, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [
                        {
                            data: []
                        }
                    ]
                },
                options: {
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: (contex) => {
                                    let label = contex.dataset.label || ''
                                    label = `${contex.parsed.y} Km`
                                    return label
                                },
                                labelColor: (context) => {
                                    console.log(context)
                                    return ' '
                                }
                            }
                        }
                    }
                }
            })
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
        const dateStart = ref('--/--/----')
        const dateEnd = ref('--/--/----')
        const totalMileage = ref(0)
        const averageSpeed = ref(0)
        const noPol = ref('- ---- ---')
        const onProcess = () => {
            dateStart.value = '--/--/----'
            dateEnd.value  = '--/--/----'
            totalMileage.value = 0
            averageSpeed.value = 0.0
            noPol.value = '- ---- ---'
            if(!form.value.nopol) {
                err.value.nopol = true
            }
            if(form.value.nopol) {
                isLoading.value = true
                axios.get('/reported/statistics', {
                    params: {
                        imei: form.value.imei,
                        start: date.value.start,
                        end: date.value.end
                    }
                })
                .then(res => {
                    isLoading.value = false
                    const data = res.data
                    chart.data.labels = []
                    chart.data.datasets[0].data = []
                    const dataLength = data.length
                    const totalSpeed = ref(0)
                    let mileageValue = 0
                    for(let i = 0; i < dataLength; i++) {
                        const el = data[i]
                        totalMileage.value += el.mileage
                        totalSpeed.value += el.averageSpeed
                        chart.data.labels.push(el._id)
                        chart.data.datasets[0].data.push(el.mileage)
                        if(el.mileage) {
                            mileageValue += 1
                        }
                    }
                    chart.update()
                    noPol.value = form.value.nopol
                    averageSpeed.value = totalSpeed.value / mileageValue || 0
                    dateStart.value = data[0]._id
                    dateEnd.value = data[dataLength - 1]._id
                })
            }
        }
        const onDownload = () => {
            var node = document.getElementById('my-node')
            htmlToImage.toPng(node)
            .then((dataUrl) => {
              console.log(dataUrl)
              download(dataUrl, 'statistik-perjalanan.png')
            })
        }
        return {
            dateStart,
            dateEnd,
            noPol,
            totalMileage,
            averageSpeed,
            devices,
            elDropDown,
            showDropdown,
            date,
            form,
            err,
            isLoading,
            closeDropDown,
            onSelectDevice,
            onProcess,
            onDownload
        }
    }
}
</script>