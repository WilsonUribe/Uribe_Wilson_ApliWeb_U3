import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import { registerSW } from './composables/usePwa'
import './styles.css'

createApp(App).use(router).mount('#app')
registerSW()
