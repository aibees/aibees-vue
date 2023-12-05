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
    logined(state) {
      if(state.user['id'] != null && state.user['userName'] != null && state.user['userToken'] != null) {
        return state.user;
      } else {
        return null;
      }
    }
  },
  mutations: {
    setUser(state, _user) {
        state.user = _user;
        console.log("mutated : ");
        console.log(state.user);
    }
  },
  plugins: [
    createPersistedState()
  ]
});