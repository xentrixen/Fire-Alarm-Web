<template>
	<div>
		<v-layout class="mb-3" align-center>
			<h1 class="headline font-weight-medium">Login History</h1>
			<v-spacer></v-spacer>
			<v-btn small class="ma-0" color="teal" dark @click="refresh">Refresh</v-btn>
		</v-layout>

		<v-card>
			<v-card-title>
				<span class="font-weight-bold">Login History Records</span>
				<v-spacer></v-spacer>
				<v-text-field
					v-model="search"
					class="ma-0 pa-0"
					append-icon="search"
					label="Search"
					single-line
					hide-details
				></v-text-field>
			</v-card-title>

			<v-data-table
				:headers="headers"
				:items="items"
				class="elevation-1"
				:loading="loading"
				:search="search"
				>
				<template slot="items" slot-scope="props">
					<td v-for="item in filteredHeaders" :key="item.value" @click="showViewDialog(props.item)">
						{{ getValueFromObject(props.item, item.value) }}
					</td>
				</template>

				<template slot="no-data">
					<span class="text-xs-center">{{ loading ? 'Loading' : 'No data found' }}</span>
				</template>
			</v-data-table>
		</v-card>
	</div>
</template>

<script>
export default {
	data() {
		return {
			loading: true,
			headers: [
				{ text: 'Id', value: 'id' },
				{ text: 'Name', value: 'name' },
				{ text: 'Email', value: 'email' },
				{ text: 'Logged In At', value: 'created_at', key: null },
			],
			items: [],
			search: '',
		}
	},
	created() {
		window.axios.get('/login-histories')
			.then(response => {
				this.items = response.data
			})
			.catch(error => {
				this.$vueOnToast.pop('error', 'Error', error.response ? error.response.data.message : 'An Error Has Occurred')
			})
			.finally(() => {
				this.loading = false
			})
	},
	computed: {
		filteredHeaders() {
			return this.headers.filter(object => {
				return object.value
			})
		}
	},
	methods: {
		getValueFromObject(object, path) {
			let returnValue = object
			for(let i = 0, array = path.split('.'), length = array.length; i < length; i++) {
				if(returnValue != null) {
					returnValue = returnValue[array[i]]
				}
			}

			return returnValue
		},
		refresh() {
			this.items = []
			this.loading = true

			window.axios.get('/login-histories')
				.then(response => {
					this.items = response.data
				})
				.catch(error => {
					this.$vueOnToast.pop('error', 'Error', error.response ? error.response.data.message : 'An Error Has Occurred')
				})
				.finally(() => {
					this.loading = false
				})
		}
	}
}
</script>