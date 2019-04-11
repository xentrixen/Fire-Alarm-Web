<template>
	<div>
		<v-layout class="mb-3" align-center>
			<h1 class="headline font-weight-medium">Citizen</h1>
			<v-spacer></v-spacer>
			<v-btn small class="ma-0" color="teal" dark @click="refresh">Refresh</v-btn>
		</v-layout>

		<v-card>
			<v-card-title>
				<span class="font-weight-bold">Citizen Records</span>
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
					<td>
						<v-icon
							small
							@click="showDeleteDialog(props.item.id)"
							title="Delete Record"
						>
							delete
						</v-icon>
					</td>
				</template>

				<template slot="no-data">
					<span class="text-xs-center">{{ loading ? 'Loading' : 'No data found' }}</span>
				</template>
			</v-data-table>
		</v-card>

		<v-dialog v-model="deleteDialog" width="800px">
			<v-card>
				<v-card-title class="grey lighten-4 py-4 title">Confirm delete?</v-card-title>
				<v-progress-linear class="my-0" :indeterminate="true" height="3" :active="deleting"></v-progress-linear>

				<v-container grid-list-sm class="pa-4">
					Are you sure you want to delete this citizen?
				</v-container>

				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn flat color="primary" @click="deleteDialog = false">Cancel</v-btn>
					<v-btn flat @click="deleteCitizen" :loading="deleting">Delete</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
export default {
	data() {
		return {
			deleteDialog: false,
			deleteId: null,
			loading: true,
			deleting: false,
			headers: [
				{ text: 'Id', value: 'id' },
				{ text: 'Name', value: 'name' },
				{ text: 'Email', value: 'email' },
				{ text: 'Active', value: 'active', key: null },
				{ text: 'Created At', value: 'created_at', key: null },
				{ text: 'Last Updated At', value: 'updated_at', key: null },
				{ text: 'Actions', sortable: false }
			],
			items: [],
			search: '',
		}
	},
	created() {
		window.axios.get('/citizens')
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

			window.axios.get('/citizens')
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
		showDeleteDialog(id) {
			this.deleteId = id
			this.deleteDialog = true
		},
		deleteCitizen() {
			if(!this.deleting && this.deleteDialog) {
				this.deleting = true
				
				window.axios.delete(`/citizens/${this.deleteId}`)
					.then(response => {
						this.deleteDialog = false
						this.$vueOnToast.pop('success', 'Success', response.data.message)
						this.refresh()
					})
					.catch(error => {
						this.deleteDialog = false
						this.$vueOnToast.pop('error', 'Error', error.response ? error.response.data.message : 'An Error Has Occurred')
					})
					.finally(() => {
						this.deleting = false
					})
			}
		}
	}
}
</script>