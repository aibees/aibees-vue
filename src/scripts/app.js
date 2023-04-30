import { createApp } from 'vue'
import App from '../components/App.vue'

const app = createApp(App)

// ===== global axios =====
import axios from 'axios';

const axiosInstance = axios.create({
    
})
app.provide('$axios', axiosInstance)
// ========================

// ===== FontAwesomeIcon Add =====
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faMagnifyingGlass, faXmark, faDownload, faPen, faTrash } from "@fortawesome/free-solid-svg-icons";

library.add(faMagnifyingGlass, faXmark, faDownload, faPen, faTrash);
app.component("font-awesome-icons", FontAwesomeIcon)
// ===============================

// ===== Router Resigrer =====
import { setRouterToApp } from './router'
app.use(setRouterToApp())
// ===========================

export default app
