<template>
    <div class="grid grid-cols-9 h-full">
        <div class="col-span-7 relative flex items-center justify-center">
            <div id="map" class="w-full h-full"></div>
            <transition enter-active-class="animate__animated animate__fadeIn animate__faster">
                <div v-show="isLoading" class="absolute bg-gray-400 inset-0 bg-opacity-50 flex items-center justify-center">
                    <div class="loader"></div>
                </div>
            </transition>
        </div>
        <div class="col-span-2 bg-white p-5 border-l">
            <div class="mb-5">
                <div class="mb-2">No Polisi <span class="text-red-500">*</span></div>
                <div ref="elDropDown"  class="relative">
                    <input v-model="form.nopol" @click="showDropdown = !showDropdown" type="text" name="nopol" :class="{'border-red-500': err.nopol}" class="h-9 w-full focus:outline-none cursor-pointer border px-3 bg-gray-100 rounded" placeholder="Pilih no polisi kendaraan" readonly>
                    <div v-show="showDropdown" class="absolute w-full bg-white rounded z-10 mt-1 border">
                        <ul class="py-2 shadow-lg">
                            <li v-for="(device, i) in devices" :key="i" @click="onSelectDevice(device)" class="px-5 py-2 hover:bg-gray-100 cursor-pointer" :class="{'bg-blue-500 hover:!bg-blue-500 text-blue-50':form.nopol == device.nopol}">{{device.nopol}}</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="mb-5">
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
            <div class="mb-5">
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
            <div class="mb-5">
                <button @click="onProcess" class="h-9 w-full text-blue-50 rounded" :class="[isLoading ? 'bg-blue-400': 'bg-blue-700 hover:bg-blue-800']" :disabled="isLoading">
                    Proses
                </button>
            </div>
            <div v-if="reported.length > 0">
                <div class="relative">
                    <div class="p-5">
                        <div class="text-center">
                            <div class="text-center text-xl font-semibold">{{detailData.nopol}}</div>
                            <div>{{detailData.merk}}</div>
                        </div>
                        <div class="border-y my-3">
                            <div class="text-center">{{getTimeDate(detailData.ts).date}}</div>
                            <div class="text-center font-mono">{{getTimeDate(detailData.ts).time}}</div>
                        </div>
                        <div class="mb-5 text-center -mx-5 leading-none grid grid-cols-2 divide-x divide-gray-600">
                            <div class="flex flex-col items-end justify-center pr-5">
                                <div>
                                    <div class="text-2xl">{{detailData.engineRPM}}</div>
                                    <div class="text-right">RPM</div>
                                </div>
                            </div>
                            <div>
                                <div class="text-5xl leading-none font-semibold font-mono">{{detailData.sp}}</div>
                                <div class="text-xs text-gray-400">Km/Jam</div>
                            </div>
                        </div>
                        <div class="mb-5 font-light text-xs">
                            <table class="w-full">
                                <tbody class="divide-y divide-gray-600">
                                    <tr>
                                        <td>Mesin</td>
                                        <td>: {{detailData.ignition ? 'On':'Off'}}</td>
                                    </tr>
                                    <tr>
                                        <td style="width: 35%">Oli level</td>
                                        <td class="flex items-center space-x-1"><span>: </span> <svg :class="[detailData.oilLevel ? ' stroke-red-500 fill-red-500': 'stroke-green-500 fill-green-500']" fill="#000000" width="20px" height="20px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M 11 9 L 11 11 L 13 11 L 13 13 L 7.5625 13 L 5.84375 10.4375 L 5.53125 10 L 1 10 L 1 15.6875 L 6 17.6875 L 6 25 L 20.53125 25 L 20.8125 24.5625 L 29.5 12 L 31 12 L 31 10 L 27.65625 10 L 27.40625 10.1875 L 21 15 L 21 13 L 15 13 L 15 11 L 17 11 L 17 9 Z M 3 12 L 4.4375 12 L 6 14.34375 L 6 15.5 L 3 14.3125 Z M 25.78125 13.9375 L 19.5 23 L 8 23 L 8 15 L 19 15 L 19 19 L 20.59375 17.8125 Z M 29.5 16 C 29.5 16 28 18.671875 28 19.5 C 28 20.328125 28.671875 21 29.5 21 C 30.328125 21 31 20.328125 31 19.5 C 31 18.671875 29.5 16 29.5 16 Z"/></svg>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="width: 35%">Odometer</td>
                                        <td>: {{detailData.totalMileage / 1000 || 0}} Km</td>
                                    </tr>
                                    <tr>
                                        <td style="width: 35%">Suhu mesin</td>
                                        <td>: {{detailData.engineTemperature * 0.1 || 0}} ℃</td>
                                    </tr>
                                    <tr>
                                        <td>GPS imei</td>
                                        <td>: {{detailData.imei}}</td>
                                    </tr>
                                    <tr>
                                        <td>GSM no</td>
                                        <td>: {{detailData.gsm}}</td>
                                    </tr>
                                    <tr>
                                        <td>GSM signal</td>
                                        <td>: {{detailData.gsmSignal}}</td>
                                    </tr>
                                    <tr>
                                        <td>Koordinat</td>
                                        <td>: {{getLngLat(detailData.latlng).lat}}</td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td>: {{getLngLat(detailData.latlng).lng}}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <!-- <div class="grid grid-cols-2 gap-2">
                            <div>
                                <button class="bg-green-500 h-9 px-2 text-green-50 w-full rounded">Mesin On</button>
                            </div>
                            <div>
                                <button class="bg-red-500 h-9 px-2 text-green-50 w-full rounded">Mesin Off</button>
                            </div>
                        </div> -->
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <button @click="onPlay" :class="{'bg-green-500': playPause}" class="h-9 w-full bg-blue-700 rounded text-blue-50 flex items-center justify-center">
                            <i v-if="!playPause" class="ph ph-play" style="font-size: 20px"></i>
                            <i v-if="playPause" class="ph ph-pause" style="font-size: 20px"></i>
                        </button>
                    </div>
                    <div>
                        <button class="h-9 w-full bg-blue-700 rounded text-blue-50 flex items-center justify-center"><i class="ph ph-stop" style="font-size: 20px"></i></button>
                    </div>
                </div>
            </div>
        </div>
        <transition enter-active-class="animate__animated animate__fadeIn animate__faster">
            <div v-if="isPopup" class="fixed inset-0 bg-gray-800 bg-opacity-55 flex items-center justify-center">
                <div class=" w-3/12 p-5 bg-white rounded shadow-lg border flex items-center flex-col">
                    <div class="text-center font-semibold text-lg">Tidak ada data yang ditemukan</div>
                    <button @click="isPopup = false" class="h-9 bg-blue-500 text-blue-50 rounded px-5 mt-5 hover:bg-blue-600">OK</button>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
import 'mapbox-gl/dist/mapbox-gl.css'
import mapboxgl from 'mapbox-gl'
import { reactive, ref } from '@vue/reactivity'
import { onMounted, onUnmounted } from '@vue/runtime-core'
import axios from 'axios'
import { DatePicker } from 'v-calendar'
import 'v-calendar/style.css';
import {lineString} from '@turf/helpers'
import turfLength from '@turf/length'
import along from '@turf/along'
import iconCar from '../assets/car.png'
export default {
    components: {DatePicker},
    setup () {
        const start = new Date()
        start.setHours(0, 0, 0)
        const map = ref(null)
        const devices = ref([])
        const showDropdown = ref(false)
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
        const elDropDown = ref(null)
        const route = reactive({
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        coordinates: [0, 0],
                        type: 'LineString'
                    },
                }
            ]
        })
        const point = reactive({
            type: 'FeatureCollection',
            features: []
        })
        onMounted (() => {
            document.addEventListener('click', closeDropDown)
            mapboxgl.accessToken = 'pk.eyJ1IjoibmVuZGkiLCJhIjoiY2t4cTQweHg3NzEwaDJvbXVud2RsbWxwNiJ9.C080KdMXt4y_4oSjHaMnmw';
            map.value = new mapboxgl.Map({
                container: 'map', // container ID
                style: 'mapbox://styles/mapbox/streets-v12', // style URL
                center: [ 108.281535, -6.859855], // starting position [lng, lat]
                zoom: 9.3, // starting zoom
                attributionControl: false
            });
            map.value.on('load', () => {
                map.value.loadImage(iconCar, (err, image) => {
                    map.value.addImage('icon-car', image)
                    map.value.addSource('route', {
                        type: 'geojson',
                        data: route
                    });
                    map.value.addSource('point', {
                        type: 'geojson',
                        data: point
                    });
                    map.value.addLayer({
                        id: 'route',
                        type: 'line',
                        source: 'route',
                        layout: {
                            'line-join': 'round',
                            'line-cap': 'round'
                        },
                        paint: {
                            'line-color': '#001eac',
                            'line-width': 5
                        }
                    })
                    map.value.addLayer({
                        id: 'point',
                        type: 'symbol',
                        source: 'point', // reference the data source
                        layout: {
                            'icon-image': 'icon-car', // reference the image
                            'icon-size': 0.06,
                            'icon-allow-overlap': true,
                            'icon-rotate': ['get', 'ang'],
                            'text-field': ['get', 'nopol'],
                            'text-variable-anchor': ['top'],
                            'text-radial-offset': 2,
                            'text-justify': 'center',
                            'text-size': 12,
                            'text-font': ["Open Sans Bold","Arial Unicode MS Bold"],
                            'text-allow-overlap':true,
                        }
                    });
                })
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

        const onSelectDevice = (device) => {
            form.value.nopol = device.nopol
            form.value.imei = device.imei
            form.value.gsm = device.gsm
            showDropdown.value = false
            err.value.nopol = ''
        }

        const closeDropDown = (e) => {
            if(!elDropDown.value.contains(e.target)) {
                showDropdown.value = false
            }
        }

        const reported = ref([])
        const isLoading = ref(false)
        const isPopup = ref(false)

        const detailData = ref({
            nopol: '',
            imei: '',
            gsm: '',
            gsmSignal: '',
            vehicleSpeed: '',
            engineRPM: '',
            totalMileage: '',
            engineTemperature: '',
            oilLevel: '',
            ignition: '',
            totalOdometer: '',
            ang: '',
            ts: '',
            sp: '',
            latlng: ''
        })

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
                    isLoading.value =false
                    reported.value = res.data
                    const myLine = []
                    const datas = res.data
                    if(datas.length > 0) {
                        detailData.value.nopol = form.value.nopol
                        detailData.value.imei = form.value.imei
                        detailData.value.gsm = form.value.gsm
                        detailData.value.ts = datas[0].ts
                        detailData.value.sp = datas[0].sp
                        detailData.value.latlng = datas[0].latlng
                        route.features[0].geometry.coordinates = [0, 0]
                        for(let i = 0; i < datas.length; i++) {
                            const el = datas[i]
                            const latlng = el.latlng.split(',').reverse()
                            myLine.push(latlng)
                        }
                        if(myLine.length > 0) {
                            const line = lineString(myLine)
                            route.features[0] = line
                            point.features[0] = {
                                type: 'Feature',
                                geometry: {
                                    type: 'Point',
                                    coordinates: myLine[0]
                                },
                                properties: {}
                            }
                            map.value.getSource('route').setData(route)
                            map.value.getSource('point').setData(point)
                            const coordinates = route.features[0].geometry.coordinates
                            const bounds = new mapboxgl.LngLatBounds(
                                coordinates[0],
                                coordinates[0]
                            )
                            for (const coord of coordinates) {
                                bounds.extend(coord);
                            }
                            map.value.fitBounds(bounds, {
                                padding: {top: 30, bottom: 70, left: 90, right: 90}
                            });
                            onSetupRoute()
                        }
                    } else {
                        isPopup.value = true
                    }
                })
            }
        }

        const myArr = []
        const myProperties = []
        const arc = []
        const properties = []
        const onSetupRoute = () => {
            const routes = route.features[0].geometry.coordinates
            for(let i = 0; i < routes.length; i++) {
                    const el = routes[i]
                    const rep = reported.value[i]
                    if(i > 1) {
                        const line = lineString(myArr)
                        const distance = turfLength(line, {units: 'meters'})
                        for(let r = 0; r < distance ; r += distance / 100) {
                            var segment = along(line, r, {units: 'meters'})
                            arc.push(segment.geometry.coordinates)
                            properties.push(myProperties[1])
                        }
                    }
                    if(myArr.length == 2) {
                        myProperties.splice(0, 1)
                        myArr.splice(0, 1)
                    }
                    
                    myProperties.push({
                        totalOdometer: rep.totalOdometer, 
                        gsmSignal: rep.gsmSignal, 
                        vehicleSpeed: rep.vehicleSpeed,
                        engineRPM: rep.engineRPM,
                        totalMileage: rep.totalMileage,
                        engineTemperature: rep.engineTemperature,
                        oilLevel: rep.oilLevel,
                        ignition: rep.ignition, 
                        latlng: rep.latlng, 
                        sp: rep.sp, 
                        ang: rep.ang, 
                        ts: rep.ts
                    })
                    myArr.push(el)   
            }
            
        }

        var counter = 0
        const myReq = ref(null)
        const playPause = ref(false)
        const onPlay = () => {
            playPause.value = !playPause.value
            if(playPause.value) {
                animate(counter)
            } else {
                cancelAnimationFrame(myReq.value)
            }
        }
        function animate () {
            const steps = arc.length
            point.features[0].geometry.coordinates = arc[counter]
            point.features[0].properties.ang = properties[counter].ang;
            detailData.value.totalOdometer = properties[counter].totalOdometer
            detailData.value.gsmSignal = properties[counter].gsmSignal
            detailData.value.vehicleSpeed = properties[counter].vehicleSpeed
            detailData.value.engineRPM = properties[counter].engineRPM
            detailData.value.totalMileage = properties[counter].totalMileage
            detailData.value.engineTemperature = properties[counter].engineTemperature
            detailData.value.oilLevel = properties[counter].oilLevel
            detailData.value.ignition = properties[counter].ignition
            detailData.value.latlng = properties[counter].latlng
            detailData.value.sp = properties[counter].sp
            detailData.value.ts = properties[counter].ts
            map.value.getSource('point').setData(point);
            if (counter < steps) {
                myReq.value = requestAnimationFrame(animate);
            } else {
                console.log('hallo')
            }
            counter = counter + 1
        }
        const getTimeDate = (d) => {
            const date = new Date(d)
            const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kmis', 'Jumat', 'Sabtu']
            const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
            const day = days[date.getDay()]
            let D = date.getDate()
            const month = months[date.getMonth()]
            const year = date.getFullYear()
            let H = date.getHours()
            let M = date.getMinutes()
            let I = date.getSeconds()
            D = checkTime(D)
            H = checkTime(H)
            M = checkTime(M)
            I = checkTime(I)
            function checkTime (i) {
                if(i < 10) {
                    i = `0${i}`
                }
                return i
            }
            var timestamp = {
                date: `${day}, ${D} ${month} ${year}`,
                time: `${H}:${M}:${I}`
            }
            return timestamp
        }
        const getLngLat = (latlng) => {
            let coordinates = {
                lat: 0,
                lng: 0
            }
            if(latlng) {
                coordinates = latlng.split(',')
                coordinates = {
                    lat: coordinates[0],
                    lng: coordinates[1]
                }
            }
            return coordinates
        }
        return {
            devices,
            elDropDown,
            showDropdown,
            date,
            form,
            err,
            detailData,
            isLoading,
            isPopup,
            reported,
            playPause,
            onSelectDevice,
            onProcess,
            onPlay,
            getTimeDate,
            getLngLat
        }
    }
}
</script>