<template>
	<div>
		<v-layout class="mb-3" align-center>
			<h1 class="headline font-weight-medium">Fire Reports</h1>
			<v-spacer></v-spacer>
			<v-btn small class="ma-0" color="teal" dark @click="refresh">Refresh</v-btn>
		</v-layout>

		<v-card>
			<v-card-title>
				<span class="font-weight-bold">Fire Report Records</span>
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
				:headers="tableHeaders"
				:items="items"
				class="elevation-1"
				:loading="loading"
				:search="search"
				>
				<template slot="items" slot-scope="props">
					<td v-for="item in filteredHeaders" :key="item.value" @click="showViewDialog(props.item)">{{ getValueFromObject(props.item, item.value) }}</td>
					<td>
						<v-icon
							small
							class="mr-2"
							@click="showUpdateDialog(props.item.id)"
							title="Update Level of Fire"
						>
							edit
						</v-icon>
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

		<v-dialog v-model="viewDialog" width="400px">
			<v-card>
				<v-card-title class="grey lighten-4 py-4 title">Fire report information</v-card-title>
				<v-list two-line subheader>
					<v-list-tile v-for="object in viewHeaders" :key="object.text">
						<v-list-tile-content>
							<v-list-tile-title>{{ object.text }}</v-list-tile-title>
							<v-list-tile-sub-title style="white-space: normal">
								<template v-if="!object.isImage">
									{{ getValueFromObject(selected, object.value, object.subvalue) }}
								</template>

								<img v-else :src="getValueFromObject(selected, object.value)" style="max-width:100%">
							</v-list-tile-sub-title>
						</v-list-tile-content>
					</v-list-tile>
				</v-list>

				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn flat color="primary" @click="viewDialog = false">Close</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<v-dialog v-model="updateDialog" width="800px">
			<v-card>
				<v-card-title class="grey lighten-4 py-4 title">Update fire report</v-card-title>
				<v-progress-linear class="my-0" :indeterminate="true" height="3" :active="updating"></v-progress-linear>
				<form data-vv-scope="update_form">
					<v-container grid-list-sm class="pa-4">
						<v-select
							v-model="updatingFireReport.level_of_fire"
							:error-messages="errors.collect('update_form.level_of_fire')"
							v-validate="'required'"
							data-vv-name="level_of_fire"
							key="update_form.level_of_fire"
							:items="['First Alarm', 'Second Alarm', 'Third Alarm', 'General Alarm']"
							prepend-icon="warning"
							menu-props="auto"
							label="Level of Fire"
						></v-select>
					</v-container>

					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn flat color="primary" @click="updateDialog = false">Cancel</v-btn>
						<v-btn flat @click="updateFireReport" :loading="updating">Update</v-btn>
					</v-card-actions>
				</form>
			</v-card>
		</v-dialog>

		<v-dialog v-model="deleteDialog" width="800px">
			<v-card>
				<v-card-title class="grey lighten-4 py-4 title">Confirm delete?</v-card-title>
				<v-progress-linear class="my-0" :indeterminate="true" height="3" :active="deleting"></v-progress-linear>

				<v-container grid-list-sm class="pa-4">
					Are you sure you want to delete this fire report?
				</v-container>

				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn flat color="primary" @click="deleteDialog = false">Cancel</v-btn>
					<v-btn flat @click="deleteFireReport" :loading="deleting">Delete</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
export default {
	data() {
		return {
			selected: {},
			viewDialog: false,
			updateDialog: false,
			deleteDialog: false,
			updateId: null,
			deleteId: null,
			loading: true,
			updating: false,
			deleting: false,
			headers: [
				{ text: 'Id', value: 'id' },
				{ text: 'Latitude (degrees)', value: 'latitude', key: null },
				{ text: 'Longitude (degrees)', value: 'longitude', key: null },
				{ text: 'Reporter\'s Name', value: 'reporter_name', key: null },
				{ text: 'Reporter\'s Email', value: 'reporter_email', key: null },
				{ text: 'Reported On', value: 'created_at', key: null },
				{ text: 'Level of Fire', value: 'level_of_fire' },
				{ text: 'Image', value: 'image', key: null, hideInTable: true, isImage: true },
				{ text: 'Actions', sortable: false }
			],
			items: [],
			search: '',
			newFireReport: {},
			updatingFireReport: {},
		}
	},
	created() {
		window.axios.get('/fire-reports')
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
	watch: {
		viewDialog(value) {
			!value ? this.selected = {} : null
		}
	},
	computed: {
		tableHeaders() {
			return this.headers.filter(object => {
				return object.hideInTable !== true
			})
		},
		filteredHeaders() {
			return this.headers.filter(object => {
				return object.value && object.hideInTable !== true
			})
		},
		viewHeaders() {
			return this.headers.filter(object => {
				return object.value
			})
		}	
	},
	methods: {
		getValueFromObject(object, path, subpath, join = true) {
			let returnValue = object
			for(let i = 0, array = path.split('.'), length = array.length; i < length; i++) {
				if(returnValue != null) {
					returnValue = returnValue[array[i]]
				}
			}

			if(returnValue != null || subpath == null) {
				return join && Array.isArray(returnValue) ? returnValue.join(", ") : returnValue
			}

			returnValue = object
			for(let i = 0, array = subpath.split('.'), length = array.length; i < length; i++) {
				if(returnValue != null) {
					returnValue = returnValue[array[i]]
				}
			}
			return join && Array.isArray(returnValue) ? returnValue.join(", ") : returnValue
		},
		refresh() {
			this.items = []
			this.loading = true

			window.axios.get('/fire-reports')
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
		showViewDialog(object) {
			this.selected = object
			this.viewDialog = true
		},
		showUpdateDialog(id) {
			const rawCurrentFireReport = this.items.find(object => object.id === id)

			const currentFireReport = this.headers.reduce((object, currentObject) => {
				if(currentObject.value && currentObject.value != 'id') {
					if(currentObject.key) {
						object[currentObject.key] = this.getValueFromObject(rawCurrentFireReport, currentObject.path, null, false)			
					} else {
						object[currentObject.value] = this.getValueFromObject(rawCurrentFireReport, currentObject.value, null, false)			
					}
				}
				return object
			}, {})

			this.updateId = id
			this.updatingFireReport = currentFireReport
			this.$validator.reset()
			this.updateDialog = true
		},
		updateFireReport() {
			if(!this.updating && this.updateDialog) {
				this.$validator.validateAll("update_form")
					.then(result => {
						if(result) {
							this.updating = true

							const data = {}
							Object.keys(this.updatingFireReport).forEach((key) => {
								const value = this.updatingFireReport[key]
								value != '' ? data[key] = value : null
							});

							window.axios.put(`/fire-reports/${this.updateId}`, data)
								.then(response => {
									this.updateDialog = false
									this.$vueOnToast.pop('success', 'Success', response.data.message)
									this.refresh()
								})
								.catch(error => {
									if(error.response && "errors" in error.response.data) {
										const errors = error.response.data.errors
	
										for(const messages of Object.values(errors)) {
											for(const message of messages) {
												this.$vueOnToast.pop('error', 'Error', message)
											}
										}
									} else {
										this.$vueOnToast.pop('error', 'Error', error.response ? error.response.data.message : 'An Error Has Occurred')
									}
								})
								.finally(() => {
									this.updating = false
								})
						}
					})
			}
		},
		showDeleteDialog(id) {
			this.deleteId = id
			this.deleteDialog = true
		},
		deleteFireReport() {
			if(!this.deleting && this.deleteDialog) {
				this.deleting = true
				
				window.axios.delete(`/fire-reports/${this.deleteId}`)
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
