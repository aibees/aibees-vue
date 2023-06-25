import { createStore } from "vuex";
import createPersistedState from 'vuex-persistedstate'

// session store
export default createStore({
  state: {
    user: {
        id: null,
        userName: null,
        userToken: null
    }
  },
  getters: {

  },
  mutations: {
    setUser(state, _user) {
        state.user = _user;
    }
  },
  plugins: [
    createPersistedState()
  ]
});