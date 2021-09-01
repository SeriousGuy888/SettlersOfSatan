import { createApp } from "vue"
import { createStore } from "vuex"

import App from "./App.vue"
import "./styles/main.css"
import "./styles/global.css"
import "./styles/theme.css"
import "./styles/animations.css"
import "./styles/card.css"
import "./styles/center_column.css"
import "./styles/collapsible.css"
import "./styles/columns.css"
import "./styles/honeycomb.css"
import "./styles/layouts.css"

const store = createStore({
  state() {
    return {
      lobby: null,
      game: null,
      player: null,
    }
  },
})

const app = createApp(App)
app.use(store)
app.mount("#app")