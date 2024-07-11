<template>
    <div class="grid grid-cols-9 h-full">
        <div class="col-span-2 h-full bg-white border-r">
            <div class="flex flex-col h-full flex-grow">
                <div class="p-5">
                    <input type="text" name="search" class="h-11 border rounded w-full px-3">
                </div>
                <div class="flex flex-row items-center justify-between mx-5 mb-5 border-b-4 relative">
                    <div ref="tabAll" @click="onTab('all')" class="w-full text-center pb-3 cursor-pointer hover:text-yellow-500 transition-all duration-300">Semua ({{onlineStatus + offlineStatus}})</div>
                    <div ref="tabOnline" @click="onTab('online')" class="w-full text-center pb-3 cursor-pointer hover:text-yellow-500 transition-all duration-300">Online ({{onlineStatus}})</div>
                    <div ref="tabOffline" @click="onTab('offline')" class="w-full text-center pb-3 cursor-pointer hover:text-yellow-500 transition-all duration-300">Offline ({{offlineStatus}})</div>
                    <div ref="activeTab" class="absolute border-b-4 border-yellow-500 w-full rounded-full -bottom-1"></div>
                </div>
                <ul class="overflow-scroll flex-grow h-32">
                    <li v-for="(device, i) in dataDevices" :key="i" @click="onTrack(i)" class="px-5 py-2 hover:bg-gray-100 cursor-pointer">
                        <div class="flex items-center justify-between">
                            <div>
                                <div>{{device.nopol}}</div>
                                <div class="text-xs text-gray-400">{{device.merk}}</div>
                            </div>
                            <div v-if="device.current" class="flex items-center space-x-2">
                                <i :class="[device.current.ignition ? 'text-blue-500': 'text-gray-300']" class="ph ph-engine"></i>
                                <i :class="[!device.current.movement && !device.current.ignition ? 'text-red-500': 'text-gray-400']" class="ph ph-letter-circle-p"></i>
                                <i :class="[device.isOnline ? 'text-green-500':'text-gray-300']" class="ph ph-broadcast"></i>
                            </div>
                        </div>
                    </li>
                </ul>
                <div class="bg-blue-500 p-5">
                    <div v-for="i in 1" :key="i"></div>
                </div>
            </div>
        </div>
        <div class="col-span-7 bg-blue-300 relative">
            <div id="map" class="w-full h-full"></div>
            <transition enter-active-class="animate__animated animate__backInRight animate__faster" leave-active-class="animate__animated animate__backOutRight animate__faster">
                <div v-if="showDetail" class="absolute bg-gray-700 m-2 w-64 right-0 bottom-0 rounded-t z-10 text-gray-200">
                    <div class="relative">
                        <button @click="onCloseTrack" class="absolute p-2 -top-0 right-0 text-red-500"><i class="ph ph-x-circle"></i></button>
                        <div class="p-5">
                            <div class="text-center">
                                <div class="text-center text-xl font-semibold">{{detailData.nopol}}</div>
                                <div>{{detailData.merk}}</div>
                            </div>
                            <div class="border-y my-3">
                                <div class="text-center">{{getTimeDate(detailData.current.ts).date}}</div>
                                <div class="text-center font-mono">{{getTimeDate(detailData.current.ts).time}}</div>
                            </div>
                            <div class="mb-5 text-center -mx-5 leading-none grid grid-cols-2 divide-x divide-gray-600">
                                <div class="flex flex-col items-end justify-center pr-5">
                                    <div>
                                        <div class="text-2xl">{{detailData.current.engineRPM}}</div>
                                        <div class="text-right">RPM</div>
                                    </div>
                                </div>
                                <div>
                                    <div class="text-5xl leading-none font-semibold font-mono">{{detailData.current.vehicleSpeed}}</div>
                                    <div class="text-xs text-gray-400">Km/Jam</div>
                                    <div class="text-xs text-gray-400">Kecepatan</div>
                                </div>
                            </div>
                            <div class="mb-5 font-light text-xs">
                                <table class="w-full">
                                    <tbody class="divide-y divide-gray-600">
                                        <tr>
                                            <td>Mesin</td>
                                            <td>: {{detailData.current.ignition ? 'On':'Off'}}</td>
                                        </tr>
                                        <tr>
                                            <td>Oli level</td>
                                            <td class="flex items-center space-x-1"><span>: </span> <svg :class="[detailData.current.oilLevel ? ' stroke-red-500 fill-red-500': 'stroke-green-500 fill-green-500']" fill="#000000" width="20px" height="20px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M 11 9 L 11 11 L 13 11 L 13 13 L 7.5625 13 L 5.84375 10.4375 L 5.53125 10 L 1 10 L 1 15.6875 L 6 17.6875 L 6 25 L 20.53125 25 L 20.8125 24.5625 L 29.5 12 L 31 12 L 31 10 L 27.65625 10 L 27.40625 10.1875 L 21 15 L 21 13 L 15 13 L 15 11 L 17 11 L 17 9 Z M 3 12 L 4.4375 12 L 6 14.34375 L 6 15.5 L 3 14.3125 Z M 25.78125 13.9375 L 19.5 23 L 8 23 L 8 15 L 19 15 L 19 19 L 20.59375 17.8125 Z M 29.5 16 C 29.5 16 28 18.671875 28 19.5 C 28 20.328125 28.671875 21 29.5 21 C 30.328125 21 31 20.328125 31 19.5 C 31 18.671875 29.5 16 29.5 16 Z"/></svg>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="width: 35%">Odometer</td>
                                            <td>: {{detailData.current.totalMileage / 1000}} Km</td>
                                        </tr>
                                        <tr>
                                            <td style="width: 35%">Suhu mesin</td>
                                            <td>: {{detailData.current.engineTemperature * 0.1}} ℃</td>
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
                                            <td>: {{detailData.current.gsmSignal}}</td>
                                        </tr>
                                        <tr>
                                            <td>Koordinat</td>
                                            <td>: {{getLngLat(detailData.current.latlng).lat}}</td>
                                        </tr>
                                        <tr>
                                            <td></td>
                                            <td>: {{getLngLat(detailData.current.latlng).lng}}</td>
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
                </div>
            </transition>
        </div>
    </div>
</template>

<script>
import 'mapbox-gl/dist/mapbox-gl.css'
import mapboxgl from 'mapbox-gl'
import { reactive, ref } from '@vue/reactivity'
import { computed, onMounted, onUnmounted } from '@vue/runtime-core'
import iconCar from '../assets/car.png'
import { io } from 'socket.io-client'
import axios from 'axios'
import along from '@turf/along'
import {lineString} from '@turf/helpers'
export default {
    setup () {
        const tabAll = ref(null)
        const tabOnline = ref(null)
        const tabOffline = ref(null)
        const activeTab = ref(null)
        const map = ref(null)
        const socket = io(import.meta.env.VITE_API_URL)
        const geojson = reactive({
            type: 'FeatureCollection',
            features: []
        })

        onMounted(() => {
            activeTab.value.style.width = tabAll.value.clientWidth+'px'
            mapboxgl.accessToken = 'pk.eyJ1IjoibmVuZGkiLCJhIjoiY2t4cTQweHg3NzEwaDJvbXVud2RsbWxwNiJ9.C080KdMXt4y_4oSjHaMnmw';
			map.value = new mapboxgl.Map({
				container: 'map', // container ID
				style: 'mapbox://styles/mapbox/streets-v12', // style URL
				center: [ 108.281535, -6.859855], // starting position [lng, lat]
				zoom: 9.3, // starting zoom
				attributionControl: false
			});
            map.value.addControl(new mapboxgl.NavigationControl())
            map.value.on('load', () => {
                map.value.loadImage(iconCar, (err, image) => {
                    if(err) throw err
                    map.value.addImage('icon-car', image)

                    map.value.addSource('point', {
                        type: 'geojson',
                        data: geojson
                    });
                    map.value.addLayer({
                        id: 'points',
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
                    
                    getData()
                })
            })
        })
        onUnmounted(() => {
            socket.close()
            cancelAnimationFrame(mayReq.value)
        })

        const devices = ref([])
        const onlineStatus = ref(0)
        const offlineStatus = ref(0)
        const getData = () => {
            axios.get('/devices')
            .then(res => {
                devices.value = res.data
                const datas = res.data
                const coordinates = []
                let coordinate = []
                let ang = 0
                const arrLength = geojson.features.length
                geojson.features.splice(0, arrLength)
                for(let i = 0; i < datas.length; i++) {
                    const el = datas[i]
                    if(el.current.latlng) {
                        const latlng = el.current.latlng.split(',')
                        coordinate = [parseFloat(latlng[1]), parseFloat(latlng[0])]
                        coordinates.push(coordinate)
                        ang = el.current.ang
                    }
                    geojson.features.push({
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: coordinate
                        },
                        properties: {
                            nopol: el.nopol,
                            imei: el.imei,
                            ang: ang
                        }
                    })
                }
                
                map.value.getSource('point').setData(geojson)
                const bounds = new mapboxgl.LngLatBounds(
                    coordinates[0],
                    coordinates[0]
                )
                for (const coord of coordinates) {
                    bounds.extend(coord);
                }
                map.value.fitBounds(bounds, {
                    speed: 5,
                    padding: {top: 60, bottom: 60, left: 60, right: 60}
                });
            })
            axios.get('/devices/status')
            .then(res => {
                const data = res.data
                onlineStatus.value = data.find(obj => {
                    return obj._id == true
                }).count || 0
                offlineStatus.value = data.find(obj => {
                    return obj._id == false
                }).count || 0
            })
            onLoadScoket()
        }
        const onLoadScoket = () => {
            socket.on('data', (data) => {
                let index = devices.value.findIndex(obj => obj.imei == data.imei)
                if(index > -1) {
                    devices.value[index].current.totalOdometer = data.totalOdometer,
                    devices.value[index].current.gsmSignal = data.gsmSignal,
                    devices.value[index].current.externalVoltage = data.externalVoltage,
                    devices.value[index].current.batteryVoltage = data.batteryVoltage,
                    devices.value[index].current.batteryCurrent = data.batteryCurrent,
                    devices.value[index].current.gnssStatus = data.gnssStatus,
                    devices.value[index].current.vehicleSpeed = data.vehicleSpeed,
                    devices.value[index].current.engineRPM = data.engineRPM,
                    devices.value[index].current.totalMileage = data.totalMileage,
                    devices.value[index].current.doorStatus = data.doorStatus,
                    devices.value[index].current.engineWorktime = data.engineWorktime,
                    devices.value[index].current.engineTemperature = data.engineTemperature,
                    devices.value[index].current.oilLevel = data.oilLevel,
                    devices.value[index].current.sleepMode = data.sleepMode,
                    devices.value[index].current.ignition = data.ignition,
                    devices.value[index].current.movement = data.movement,
                    devices.value[index].current.ts = data.ts,
                    devices.value[index].current.latlng = data.latlng,
                    devices.value[index].current.ang = data.ang,
                    devices.value[index].current.sp = data.sp
                    if(!isTracking.value) {
                        index = geojson.features.findIndex(obj => obj.properties.imei == data.imei)
                        if(index > -1) {
                            const latlng = data.latlng.split(',')
                            const coordinate = [parseFloat(latlng[1]), parseFloat(latlng[0])]
                            geojson.features[index].geometry.coordinates = coordinate
                            geojson.features[index].properties.ang = data.ang
                            map.value.getSource('point').setData(geojson)  
                        }
                    }
                }
            })
        }

        const isTracking = ref(false)
        const showDetail = ref(false)
        const detailData = ref(null)
        const mayReq = ref(null)
        const myLine = ref([])

        const onTrack = (i) => {
            const device = devices.value[i]
            detailData.value = device
            let latlng = device.current.latlng.split(',')
            let newPoint = [parseFloat(latlng[1]), parseFloat(latlng[0])]
            let index = geojson.features.findIndex(obj => obj.properties.imei == device.imei)
            geojson.features[index].geometry.coordinates = newPoint
            const imei = device.imei
            myLine.value = []
            myLine.value.push(newPoint)
           
            map.value.flyTo({
                center: newPoint,
                zoom: 16.5,
                speed: 2,
            });
           
            map.value.getSource('point').setData(geojson) 
            socket.removeAllListeners()
            onLoadScoket()
            showDetail.value = false
            cancelAnimationFrame(mayReq.value)
            
            map.value.once('moveend', () => {
                showDetail.value = true
                map.value.easeTo({
                    padding: {
                        right: 100
                    }
                })
                socket.on(imei, (data) => {
                    detailData.value.current = data
                    let index = geojson.features.findIndex(obj => obj.properties.imei == imei)
                    if(index > -1) {
                        latlng = data.latlng.split(',')
                        newPoint = [parseFloat(latlng[1]), parseFloat(latlng[0])]
                        if(myLine.value.length == 2) {
                            myLine.value.splice(0, 1)
                        }
                        myLine.value.push(newPoint)
                        let step = 0
                        geojson.features[index].properties.ang = data.ang
                        
                        if(step == 0) {
                            cancelAnimationFrame(mayReq.value)
                        }
                        const line = lineString(myLine.value)
                        mayReq.value = requestAnimationFrame(animate)
                        const kph = 60; // 600km/h
                        let distance = 0;
                        function animate (timestamp) {
                            step += 1
                        
                            const movingInMeters = ((kph / 60 / 60 / 1000) * step) * 1000;
                            
                            distance = distance + movingInMeters
                            const options = {units: 'meters'};
                            const movedPoint = along(line,distance , options);
                           
                            const position = movedPoint.geometry.coordinates
                            
                            geojson.features[index].geometry.coordinates = position
                            map.value.flyTo({
                                center: position,
                                speed: 1000
                            });
                            map.value.getSource('point').setData(geojson)  
                            mayReq.value = requestAnimationFrame(animate)
                        }
                    } 
                })
            })
            isTracking.value = true
        }
        const onCloseTrack = () => {
            socket.removeAllListeners()
            cancelAnimationFrame(mayReq.value)
            onLoadScoket()
            isTracking.value = false
            showDetail.value = false
            getData()
        }
        const getTimeDate = (d) => {
            const date = new Date(d)
            const days = ['Minggu','Senin', 'Selasa', 'Rabu', 'Kmis', 'Jumat', 'Sabtu']
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
            let coordinates = latlng.split(',')
            coordinates = {
                lat: coordinates[0],
                lng: coordinates[1]
            }
            return coordinates
        }


        const filterDevice = ref('all')
        const dataDevices = computed(() => {
            if(filterDevice.value == 'all') {
                return devices.value
            }
            if(filterDevice.value == 'online') {
                return devices.value.filter(obj => obj.isOnline == true)
            }
            if(filterDevice.value == 'offline') {
                return devices.value.filter(obj => obj.isOnline == false)
            }
        })
        const onTab = (val) => {
            switch (val) {
                case 'all': 
                    activeTab.value.style.width = tabAll.value.clientWidth+'px'
                    activeTab.value.style.left = tabAll.value.getBoundingClientRect().left-20+'px'
                    filterDevice.value = val
                    break;
                case 'online': 
                    activeTab.value.style.width = tabOnline.value.clientWidth+'px'
                    activeTab.value.style.left = tabOnline.value.getBoundingClientRect().left-20+'px'
                    filterDevice.value = val
                    break;
                case 'offline': 
                    activeTab.value.style.width = tabOffline.value.clientWidth+'px'
                    activeTab.value.style.left = tabOffline.value.getBoundingClientRect().left-20+'px'
                    filterDevice.value = val
                    break;
            }
        }
        return {
            tabAll,
            tabOnline,
            tabOffline,
            activeTab,
            devices,
            onlineStatus,
            offlineStatus,
            showDetail,
            detailData,
            dataDevices,
            onTab,
            onTrack,
            onCloseTrack,
            getTimeDate,
            getLngLat,
        }
    }
}
</script>

<style>
	.mapboxgl-ctrl-logo {
		display: none !important;
	}
	.mapboxgl-popup-close-button {
        padding-right: 5px;
        padding-left: 5px;
		display: none;
    }
   
</style>