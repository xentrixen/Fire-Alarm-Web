<template>
	<div>
		<v-layout class="mb-3" align-center>
			<h1 class="headline font-weight-medium">Fire Stations</h1>
			<v-spacer></v-spacer>
			<v-btn small class="ma-0" color="teal" dark @click="refresh">Refresh</v-btn>
		</v-layout>

		<v-card>
			<v-card-title>
				<span class="font-weight-bold">Fire Station Records</span>
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
							title="Update Record"
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

		<floating-action-button @click.native="showCreateDialog" title="Add New Record"/>

		<v-dialog v-model="createDialog" width="800px">
			<v-card>
				<v-card-title class="grey lighten-4 py-4 title">Create fire station</v-card-title>
				<v-progress-linear class="my-0" :indeterminate="true" height="3" :active="creating"></v-progress-linear>
				<form data-vv-scope="create_form">
					<v-container grid-list-sm class="pa-4">
						<v-text-field
							v-model="newFireStation.name"
							:error-messages="errors.collect('create_form.name')"
							v-validate="'required'"
							data-vv-name="name"
							key="create_form.name"
							label="Name"
							prepend-icon="store_mall_directory"
							@keyup.enter="createFireStation"
						></v-text-field>

						<v-layout>
							<v-flex xs6>
								<v-text-field
									v-model="newFireStation.latitude"
									maxlength="10"
									:error-messages="errors.collect('create_form.latitude')"
									v-validate="'required|min_value:-90|max_value:90|decimal:6'"
									data-vv-name="latitude"
									key="create_form.latitude"
									label="Latitude (Location)"
									prepend-icon="location_on"
									@keyup.enter="createFireStation"
								></v-text-field>
							</v-flex>

							<v-flex xs6>
								<v-text-field
									v-model="newFireStation.longitude"
									maxlength="10"
									:error-messages="errors.collect('create_form.longitude')"
									v-validate="'required|min_value:-180|max_value:180|decimal:6'"
									data-vv-name="longitude"
									key="create_form.longitude"
									label="Longitude (Location)"
									prepend-icon="location_on"
									@keyup.enter="createFireStation"
								></v-text-field>
							</v-flex>
						</v-layout>

						<v-text-field
							v-model="newFireStation.username"
							:error-messages="errors.collect('create_form.username')"
							v-validate="'required'"
							data-vv-name="username"
							key="create_form.username"
							prepend-icon="account_circle"
							label="Username"
							@keyup.enter="createFireStation"
						></v-text-field>

						<v-text-field
							v-model="newFireStation.password"
							:error-messages="errors.collect('create_form.password')"
							v-validate="'required|min:8'"
							data-vv-name="password"
							key="create_form.password"
							prepend-icon="lock"
							label="Password"
							type="password"
							ref="create_form.password"
							@keyup.enter="createFireStation"
						></v-text-field>

						<v-text-field
							v-model="newFireStation.password_confirmation"
							:error-messages="errors.collect('create_form.confirm_password')"
							v-validate="'required|confirmed:create_form.password'"
							data-vv-name="confirm_password"
							key="create_form.confirm_password"
							prepend-icon="lock_open"
							label="Confirm Password"
							type="password"
							@keyup.enter="createFireStation"
						></v-text-field>
					</v-container>

					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn flat color="primary" @click="createDialog = false">Cancel</v-btn>
						<v-btn flat @click="createFireStation" :loading="creating">Save</v-btn>
					</v-card-actions>
				</form>
			</v-card>
		</v-dialog>

		<v-dialog v-model="viewDialog" width="400px">
			<v-card>
				<v-card-title class="grey lighten-4 py-4 title">Fire station information</v-card-title>
				<v-list two-line subheader>
					<v-list-tile v-for="object in viewHeaders" :key="object.text">
						<v-list-tile-content>
							<v-list-tile-title>{{ object.text }}</v-list-tile-title>
							<v-list-tile-sub-title style="white-space: normal">
								{{ getValueFromObject(selected, object.value, object.subvalue) }}
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
				<v-card-title class="grey lighten-4 py-4 title">Update fire station</v-card-title>
				<v-progress-linear class="my-0" :indeterminate="true" height="3" :active="updating"></v-progress-linear>
				<form data-vv-scope="update_form">
					<v-container grid-list-sm class="pa-4">
						<v-text-field
							v-model="updatingFireStation.name"
							:error-messages="errors.collect('update_form.name')"
							v-validate="'required'"
							data-vv-name="name"
							key="update_form.name"
							label="Name"
							prepend-icon="account_box"
							@keyup.enter="updateFireStation"
						></v-text-field>

						<v-layout>
							<v-flex xs6>
								<v-text-field
									v-model="updatingFireStation.latitude"
									maxlength="10"
									:error-messages="errors.collect('update_form.latitude')"
									v-validate="'required|min_value:-90|max_value:90|decimal:6'"
									data-vv-name="latitude"
									key="update_form.latitude"
									label="Latitude (Location)"
									prepend-icon="location_on"
									@keyup.enter="updateFireStation"
								></v-text-field>
							</v-flex>

							<v-flex xs6>
								<v-text-field
									v-model="updatingFireStation.longitude"
									maxlength="10"
									:error-messages="errors.collect('update_form.longitude')"
									v-validate="'required|min_value:-180|max_value:180|decimal:6'"
									data-vv-name="longitude"
									key="update_form.longitude"
									label="Longitude (Location)"
									prepend-icon="location_on"
									@keyup.enter="updateFireStation"
								></v-text-field>
							</v-flex>
						</v-layout>

						<v-text-field
							v-model="updatingFireStation.username"
							:error-messages="errors.collect('update_form.username')"
							v-validate="'required'"
							data-vv-name="username"
							key="update_form.username"
							prepend-icon="account_circle"
							label="Username"
							@keyup.enter="updateFireStation"
						></v-text-field>

						<v-text-field
							v-model="updatingFireStation.password"
							:error-messages="errors.collect('update_form.password')"
							v-validate="'min:8'"
							data-vv-name="password"
							key="update_form.password"
							prepend-icon="lock"
							label="Password"
							type="password"
							ref="update_form.password"
							hint="Leave blank to remain the same"
							persistent-hint
							@keyup.enter="updateFireStation"
						></v-text-field>

						<v-text-field
							v-model="updatingFireStation.password_confirmation"
							:error-messages="errors.collect('update_form.confirm_password')"
							v-validate="{ required: updatingFireStation.password != null && updatingFireStation.password != '', confirmed: 'update_form.password' }"
							data-vv-name="confirm_password"
							key="update_form.confirm_password"
							prepend-icon="lock_open"
							label="Confirm Password"
							type="password"
							persistent-hint
							@keyup.enter="updateFireStation"
						></v-text-field>
					</v-container>

					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn flat color="primary" @click="updateDialog = false">Cancel</v-btn>
						<v-btn flat @click="updateFireStation" :loading="updating">Update</v-btn>
					</v-card-actions>
				</form>
			</v-card>
		</v-dialog>

		<v-dialog v-model="deleteDialog" width="800px">
			<v-card>
				<v-card-title class="grey lighten-4 py-4 title">Confirm delete?</v-card-title>
				<v-progress-linear class="my-0" :indeterminate="true" height="3" :active="deleting"></v-progress-linear>

				<v-container grid-list-sm class="pa-4">
					Are you sure you want to delete this fire station?
				</v-container>

				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn flat color="primary" @click="deleteDialog = false">Cancel</v-btn>
					<v-btn flat @click="deleteFireStation" :loading="deleting">Delete</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
import FloatingActionButton from '@/components/FloatingActionButton.vue'

export default {
	data() {
		return {
			selected: {},
			viewDialog: false,
			createDialog: false,
			updateDialog: false,
			deleteDialog: false,
			updateId: null,
			deleteId: null,
			loading: true,
			creating: false,
			updating: false,
			deleting: false,
			headers: [
				{ text: 'Id', value: 'id' },
				{ text: 'Name', value: 'name' },
				{ text: 'Latitude (degrees)', value: 'latitude' },
				{ text: "Longitude (degrees)", value: 'longitude' },
				{ text: 'Username', value: 'username' },
				{ text: 'Created At', value: 'created_at', key: null },
				{ text: 'Last Updated At', value: 'updated_at', key: null, hideInTable: true },
				{ text: 'Actions', sortable: false }
			],
			items: [],
			search: '',
			newFireStation: {},
			updatingFireStation: {},
		}
	},
	created() {
		window.axios.get('/fire-stations')
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

			window.axios.get('/fire-stations')
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
		showCreateDialog() {
			this.newFireStation = {}
			this.$validator.reset()
			this.createDialog = true
		},
		createFireStation() {
			if(!this.creating && this.createDialog) {
				this.$validator.validateAll("create_form")
					.then(result => {
						if(result) {
							this.creating = true
							
							window.axios.post('/fire-stations', this.newFireStation)
								.then(response => {
									this.createDialog = false
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
									this.creating = false
								})
						}
					})
			}
		},
		showUpdateDialog(id) {
			const rawCurrentFireStation = this.items.find(object => object.id === id)

			const currentFireStation = this.headers.reduce((object, currentObject) => {
				if(currentObject.value && currentObject.value != 'id') {
					if(currentObject.key) {
						object[currentObject.key] = this.getValueFromObject(rawCurrentFireStation, currentObject.path, null, false)			
					} else {
						object[currentObject.value] = this.getValueFromObject(rawCurrentFireStation, currentObject.value, null, false)			
					}
				}
				return object
			}, {})

			this.updateId = id
			this.updatingFireStation = currentFireStation
			this.$validator.reset()
			this.updateDialog = true
		},
		updateFireStation() {
			if(!this.updating && this.updateDialog) {
				this.$validator.validateAll("update_form")
					.then(result => {
						if(result) {
							this.updating = true

							const data = {}
							Object.keys(this.updatingFireStation).forEach((key) => {
								const value = this.updatingFireStation[key]
								value != '' ? data[key] = value : null
							});

							window.axios.put(`/fire-stations/${this.updateId}`, data)
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
		deleteFireStation() {
			if(!this.deleting && this.deleteDialog) {
				this.deleting = true
				
				window.axios.delete(`/fire-stations/${this.deleteId}`)
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
	},
	components: {
		FloatingActionButton
	}
}
</script>
