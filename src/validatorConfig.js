import Vue from 'vue'
import VeeValidate, { Validator } from 'vee-validate'

Vue.use(VeeValidate)

const dictionary = {
    en: {
        attributes: {
            confirm_password: 'confirm password',
        }
    }
};

Validator.localize(dictionary);