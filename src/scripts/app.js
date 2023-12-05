import { createApp } from 'vue'
import App from '../components/App.vue'
const app = createApp(App)

// ===== global axios =====
import axios from 'axios';

const axiosInstance = axios.create({
    
})
app.provide('$axios', axiosInstance)
// ========================

// ===== vuex store Add =====
import store from './store';
app.use(store);
// ===========================

// ===== FontAwesomeIcon Add =====
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faMagnifyingGlass, faXmark, faDownload, faPen, faTrash, faUpload, faBars, faSave, faCircleXmark } from "@fortawesome/free-solid-svg-icons";

library.add(faMagnifyingGlass, faXmark, faDownload, faPen, faTrash, faUpload, faBars, faSave, faCircleXmark);
app.component("font-awesome-icons", FontAwesomeIcon)
// ===============================

// ===== Router Resigrer =====
import { setRouterToApp } from './router'
app.use(setRouterToApp())
// ===========================

export default app
