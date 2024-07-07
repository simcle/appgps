<template>
	<div class="content-wrapper">
		<div v-if="user" class="h-14 w-full flex items-center bg-white border-b">
			<div class="text-blue-700 px-5 text-2xl font-bold">GPS TRACK</div>
			<ul class="h-full flex items-center font-semibold">
				<li class="h-full">
					<router-link to="/" class="px-5 h-full flex items-center"><i class="ph ph-gps-fix mr-3"></i> Pelacakan</router-link>
				</li>
				<li class="h-full">
					<router-link to="/laporan" class="px-5 h-full flex items-center"><i class="ph ph-file mr-3"></i> Laproan</router-link>
				</li>
				<li class="h-full">
					<router-link to="/riwayat" class="px-5 h-full flex items-center"><i class="ph ph-clock-counter-clockwise mr-3"></i> Riwayat</router-link>
				</li>
				<li class="h-full">
					<router-link to="/perangkat" class="px-5 h-full flex items-center"><i class="ph ph-device-tablet-speaker mr-3"></i> Perangkat</router-link>
				</li>
			</ul>
			<div class="ml-auto mx-5 h-full relative">
				<drop-down-menu :right="true" class="h-full">
					<button class="h-full flex items-center px-5 hover:bg-gray-100"><i class="ph ph-user-circle mr-2" style="font-size: 30px"></i> {{user.name}}</button>
					<template #dropdown>
						<ul class="text-gray-600 w-44">
							<li>
								<a href="#" class="px-3 py-3 hover:bg-gray-100 leading-none flex items-center space-x-3">
									<i class="ph ph-user-circle"></i> <span>Akun saya</span>
								</a>
							</li>
							<li>
								<a @click="signOut" href="$" class="px-3 py-3 hover:bg-gray-100 leading-none flex items-center space-x-3">
									<i class="ph ph-sign-out"></i> <span>Keluar</span>
								</a>
							</li>
						</ul>
					</template>
				</drop-down-menu>
			</div>
		</div>
		<div class="content-inner flex-1">
			<router-view v-slot="{ Component }">
				<transition name="fade" mode="out-in">
					<component :is="Component" />
				</transition>
			</router-view>
		</div>
	</div>
</template>

<script>
import DropDownMenu from './components/DropDownMenu.vue'
import {mapGetters, mapActions} from 'vuex'
export default {

	components: {DropDownMenu},
	computed: {
		...mapGetters({
			user: 'auth/user'
		})
	},
	methods: {
		...mapActions({
			logout: 'auth/logout'
		}),
		async signOut () {
			const token = localStorage.getItem('refreshToken')
			await this.logout(token)
			.then(() => {
				this.$router.push('/login')
			})
		}
	}
}

</script>