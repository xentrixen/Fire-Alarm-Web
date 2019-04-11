import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    token: localStorage.getItem('access_token') || null,
		successMessage: '',
  },
  getters: {
		loggedIn(state) {
			return state.token !== null
		},
	},
  mutations: {
    retrieveToken(state, token) {
			state.token = token
		},
		destroyToken(state) {
			state.token = null
		},
		setSuccessMessage(state, message) {
			state.successMessage = message
		},
  },
  actions: {
		retrieveToken(context, credentials) {
			return new Promise((resolve, reject) => {
				window.axios.post('/auth/login', {
					email: credentials.email,
					password: credentials.password,
					type: 'admin'
				})
					.then(response => {
						const token = response.data.access_token

						localStorage.setItem('access_token', token)
						context.commit('retrieveToken', token)
						resolve(response)
					})
					.catch(error => {
						reject(error)
					})
			})
		},
		destroyToken(context) {
			if(context.getters.loggedIn) {
				return new Promise((resolve, reject) => {
					window.axios.post('/auth/logout')
						.then(response => {
							localStorage.removeItem('access_token')
							context.commit('destroyToken')
							resolve(response)
						})
						.catch(error => {
							localStorage.removeItem('access_token')
							context.commit('destroyToken')
							reject(error)
						})
				})
			}
		}
	}
})
