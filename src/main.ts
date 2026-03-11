import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import Nora from '@primeuix/themes/nora'
import './assets/main.css'
import App from './App.vue'

const app = createApp(App)

app.use(PrimeVue, {
  theme: {
    preset: Nora,
    options: {
      darkModeSelector: '.dark',
      cssLayer: {
        name: 'primevue',
        order: 'theme, base, primevue',
      },
    },
  },
})

app.mount('#app')
