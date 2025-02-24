import { createApp } from 'vue'
import App from '../components/App.vue'
const app = createApp(App)

// ===== global axios =====
import axios from 'axios';

const axiosInstance = axios.create({
    
})
app.provide('$axios', axiosInstance)
// ========================

// ===== pinia store Add =====
import { createPinia } from 'pinia';
import piniaPersist from 'pinia-plugin-persistedstate';
const pinia = createPinia();
pinia.use(piniaPersist)
app.use(pinia);
// ===========================

// ===== FontAwesomeIcon Add =====
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faMagnifyingGlass, faXmark, faDownload, faPen, faTrash, faUpload, faBars, faSave, faCircleXmark, faCaretLeft, faCaretRight } from "@fortawesome/free-solid-svg-icons";

library.add(faMagnifyingGlass, faXmark, faDownload, faPen, faTrash, faUpload, faBars, faSave, faCircleXmark, faCaretLeft, faCaretRight);
app.component("font-awesome-icons", FontAwesomeIcon)
// ===============================

// ===== Router Resigrer =====
import { setRouterToApp } from './router'
app.use(setRouterToApp())
// ===========================

// ===== Event Bus =====
import mitt from 'mitt';
const emitter = new mitt();
app.provide('emitter', emitter);
// =====================

export default app
