import { createApp } from "vue"
import { createStore } from "vuex"

import App from "./Home.vue"

const store = createStore({
  state() {
    return {
      lobby: null,
      member: null,
      game: null,
      player: null,
      prefs: {},
    }
  },
})

const app = createApp(App)
app.use(store)
app.mount("#app")