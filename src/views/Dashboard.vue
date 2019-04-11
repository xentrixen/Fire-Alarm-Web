<template>
	<v-app>
		<toast-container :toastConfig="{ positionClass: 'vot-bottom-left' }"></toast-container>
		
		<v-navigation-drawer
				:clipped="$vuetify.breakpoint.lgAndUp"
				fixed
				app
				v-model="drawer"
				width="250"
			>
			<v-list>
				<v-list-tile v-for="(item, index) in items" :key="index" :to="{name: item.route}">
					<v-list-tile-action>
						<v-icon>{{ item.icon }}</v-icon>
					</v-list-tile-action>
					<v-list-tile-content>
						<v-list-tile-title>
							{{ item.text }}
						</v-list-tile-title>
					</v-list-tile-content>
				</v-list-tile>
			</v-list>
		</v-navigation-drawer>

		<v-toolbar
			clipped-left
			color="primary"
			dark
			app
			fixed
		>
			<v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
			<v-toolbar-title>BFP Fire Alarm System</v-toolbar-title>
			<v-spacer></v-spacer>
			<span class="hidden-xs-only">Welcome Administrator</span>
			<v-toolbar-items dense>
				<v-menu offset-y left>
					<v-btn slot="activator" flat icon>
						<v-icon class="hidden-xs-only">arrow_drop_down</v-icon>
						<v-icon class="hidden-sm-and-up">more_vert</v-icon>
					</v-btn>
					<v-list dense>
						<v-list-tile @click="logout">
							<v-list-tile-action>
								<v-icon>exit_to_app</v-icon>
							</v-list-tile-action>
							<v-list-tile-content>
								<v-list-tile-title>Sign Out</v-list-tile-title>
							</v-list-tile-content>
						</v-list-tile>
					</v-list>
				</v-menu>
			</v-toolbar-items>
		</v-toolbar>

		<v-content>
			<v-container fluid>
				<router-view></router-view>
			</v-container>
		</v-content>
	</v-app>
</template>

<script>
export default {
	data() {
		return {
			drawer: null,
			items: [
				{ icon: 'people', text: 'Citizen', route: 'Citizen' },
				{ icon: 'contacts', text: 'Fire Stations', route: 'Fire Stations' },
				{ icon: 'history', text: 'Login History', route: 'Login History' },
			]
		}
	},
	created() {
		const token = localStorage.getItem('access_token')
		if (token) {
			window.axios.defaults.headers.common['Authorization'] = 'Bearer ' + token
		}
	},
	mounted() {
		if(this.$store.state.successMessage) {
			this.$vueOnToast.pop('success', 'Success', this.$store.state.successMessage)
		}
	},
	methods: {
		logout() {
			this.$store.dispatch('destroyToken')
				.then(response => {
					this.$store.commit('setSuccessMessage', response.data.message)
				})
				.catch(() => {
					this.$store.commit('setSuccessMessage', 'Logout Successful')
				})
				.finally(() => {
					this.$router.push({ name: 'Login' })
				})
		}
	}
}
</script>