window.axios = require('axios');
window.axios.defaults.baseURL = 'https://fire-alarm-api.herokuapp.com/'
window.axios.defaults.headers.common = {'Accept': "application/json"}