import colors from 'vuetify/es5/util/colors'

export default {
    theme: {
        primary: colors.red.lighten1,
        secondary: colors.red.darken1,
        accent: colors.teal.base
    },
    options: {
        minifyTheme: function (css) {
            return css.replace(/[\s|\r\n|\r|\n]/g, '')
        }
    }
}