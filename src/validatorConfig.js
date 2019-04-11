import Vue from 'vue'
import VeeValidate, { Validator } from 'vee-validate'

Vue.use(VeeValidate)

const dictionary = {
    en: {
        attributes: {
            cellphone_number: 'cellphone number',
            conveyance_type: 'conveyance type',
            plate_number: 'plate number',
            license_number: 'license number',
            meat_type: 'meat type',
            stall_number: 'stall number',
            email: 'email address',
            confirm_password: 'confirm password',
            area_assigned: 'area assigned',
            job_description: 'job description',
            butcher_id: 'butcher',
            supplier_id: 'supplier',
            stallholder_id: 'stall holder',
            corral_id: 'corral',
            conveyor_id: 'conveyor',
            guard_id: 'guard'
        }
    }
};

Validator.localize(dictionary);