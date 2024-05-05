<template>
    <div class="grid grid-cols-10 h-full">
        <div class="col-span-8 relative">
            <div id="map" class="w-full h-full"></div>
            <div class="absolute p-3 bg-white z-10 border bottom-0 right-0 m-3">{{info}}</div>
        </div>
        <div class="col-span-2 bg-white p-5 border-l">
            <div class="mb-5">
                <div class="mb-2">No Polisi</div>
                <div ref="elDropDown"  class="relative">
                    <input v-model="form.nopol" @click="showDropdown = !showDropdown" type="text" name="nopol" :class="{'border-red-500': err.nopol}" class="h-9 w-full focus:outline-none cursor-pointer border px-3 bg-gray-100 rounded" placeholder="pilih no polisi kendaraan" readonly>
                    <div v-show="showDropdown" class="absolute w-full bg-white rounded z-10 mt-1 border">
                        <ul class="py-2 shadow-lg">
                            <li v-for="(device, i) in devices" :key="i" @click="onSelectDevice(device)" class="px-5 py-2 hover:bg-gray-100 cursor-pointer" :class="{'bg-blue-500 hover:!bg-blue-500 text-blue-50':form.nopol == device.nopol}">{{device.nopol}}</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="mb-5">
                <div class="mb-2">Mulai :</div>
                <DatePicker v-model="date.start" locale="id" mode="dateTime" is24hr>
                    <template #default="{inputValue, togglePopover}">
                        <div class="relative flex items-center h-9">
                            <input @click="togglePopover" :value="inputValue" type="text" readonly class="h-9 w-72 cursor-pointer border rounded focus:outline-none pl-12 pr-3">
                            <div class="absolute flex bg-gray-100 rounded-l items-center justify-center border h-full w-9"><i class="ph ph-calendar"></i></div>
                        </div>
                    </template>
                </DatePicker>
            </div>
            <div class="mb-5">
                <div class="mb-2">Akhir :</div>
                <DatePicker v-model="date.end" locale="id" mode="dateTime" is24hr>
                    <template #default="{inputValue, togglePopover }">
                        <div class="relative flex items-center h-9">
                            <input @click="togglePopover" :value="inputValue" type="text" readonly class="h-9 w-72 cursor-pointer border rounded focus:outline-none pl-12 pr-3">
                            <div class="absolute flex bg-gray-100 rounded-l items-center justify-center border h-full w-9"><i class="ph ph-calendar"></i></div>
                        </div>
                    </template>
                </DatePicker>
            </div>
            <div class="mb-5">
                <button @click="onProcess" class="h-9 w-full bg-blue-700 text-blue-50 rounded hover:bg-blue-800">Proses</button>
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <button @click="onPlay" class="h-9 w-full bg-blue-700 rounded text-blue-50 flex items-center justify-center"><i class="ph ph-play" style="font-size: 20px"></i></button>
                </div>
                <div>
                    <button class="h-9 w-full bg-blue-700 rounded text-blue-50 flex items-center justify-center"><i class="ph ph-stop" style="font-size: 20px"></i></button>
                </div>
            </div>
        </div>
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
        const start = new Date('2024/04/29 09:18')
        const map = ref(null)
        const devices = ref([])
        const showDropdown = ref(false)
        const form = ref({
            imei: '',
            nopol: ''
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
            features: []
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
            showDropdown.value = false
            err.value.nopol = ''
        }

        const closeDropDown = (e) => {
            if(!elDropDown.value.contains(e.target)) {
                showDropdown.value = false
            }
        }

        const reported = ref(null)
        const onProcess = () => {
            if(!form.value.nopol) {
                err.value.nopol = true
            }
            if(form.value.nopol) {
                axios.get('/reported', {
                    params: {
                        imei: form.value.imei,
                        start: date.value.start,
                        end: date.value.end
                    }
                })
                .then(res => {
                    reported.value = res.data
                    const myLine = []
                    const datas = res.data
                    for(let i = 0; i < datas.length; i++) {
                        const el = datas[i]
                        const latlng = el.latlng.split(',').reverse()
                        myLine.push(latlng)
                    }
                    const line = lineString(myLine)
                    route.features.push(line)
                    point.features.push({
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: myLine[0]
                        },
                        properties: {
                            nopol: form.value.nopol,
                            imei: reported.value[0].imei,
                            ang: reported.value[0].ang
                        }
                    })
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
                })
            }
        }
        const info = ref(null)

        const onPlay = () => {
            const routes = route.features[0].geometry.coordinates
            const myArr = []
            const mySpeed = []
            const myProperties = []
            const arc = []
            const properties = []
          
            for(let i = 0; i < routes.length; i++) {
                    const el = routes[i]
                    const rep = reported.value[i]
                    if(i > 1) {
                        const line = lineString(myArr)
                        const distance = turfLength(line, {units: 'meters'})
                        const timestamp = myProperties[1].ts - myProperties[0].ts
                        const speed = mySpeed[1]
                        const timeSecond = timestamp / 1000
                        const timeDistance = distance / timeSecond
                        const speedDistance = timeDistance / speed

                        console.log(distance, speed, timeSecond)

                        for(let r = 0; r < distance ; r += distance / 100) {
                            var segment = along(line, r, {units: 'meters'})
                            arc.push(segment.geometry.coordinates)
                            properties.push(myProperties[1])
                        }
                    }
                    if(myArr.length == 2) {
                        myProperties.splice(0, 1)
                        mySpeed.splice(0, 1)
                        myArr.splice(0, 1)
                    }
                    
                    myProperties.push({sp: rep.sp, ang: rep.ang, ts: rep.ts})
                    mySpeed.push(rep.sp)
                    myArr.push(el)
                
            }
            const steps = arc.length
            console.log(steps, properties.length)
            var counter = 0
            animate(counter)
            function animate () {
                point.features[0].geometry.coordinates = arc[counter]
                point.features[0].properties.ang = properties[counter].ang;
                info.value = properties[counter]
                map.value.getSource('point').setData(point);

                if (counter < steps) {
                    requestAnimationFrame(animate);
                }
                counter = counter + 1
            }
        }
        return {
            devices,
            elDropDown,
            showDropdown,
            date,
            form,
            err,
            info,
            onSelectDevice,
            onProcess,
            onPlay,
        }
    }
}
</script>