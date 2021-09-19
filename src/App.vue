<template>
  <Title />
  <Login />
  <JoinLobby v-if="loginState.loggedIn && !state.lobby"/>
  <Lobby
    v-if="loginState.loggedIn && state.lobby"
    ref="lobby"
    :printToChat="printToChat"
  />
  <Modal ref="modal" :title="modal.title">
    {{ modal.message }}
    <template v-if="modal.reloadButton" v-slot:buttons>
      <button @click="reload()">Reload</button>
    </template>
  </Modal>
  <SoundEffects />
</template>

<script>
import Title from "@/components/Title.vue"
import Login from "@/components/Login.vue"
import JoinLobby from "@/components/JoinLobby.vue"
import Lobby from "@/components/lobby/Lobby.vue"
import Modal from "@/components/ui/Modal.vue"
import SoundEffects from "@/components/SoundEffects.vue"

import { useStore } from "vuex"

export default {
  name: "App",
  components: {
    Title,
    Login,
    JoinLobby,
    Lobby,
    Modal,
    SoundEffects,
  },
  data() {
    return {
      state: this.$store.state,
      loginState: {
        loggedIn: false,
        name: "",
      },
      modal: {
        title: "Alert",
        message: "",
        reloadButton: false,
      },
    }
  },
  methods: {
    printToChat(lines) {
      this.$refs?.lobby?.$refs?.chat?.print(lines)
    },
    showModal(title, msg, reloadButton) {
      this.modal.title = title
      this.modal.message = msg
      this.modal.reloadButton = !!reloadButton
      this.$refs.modal.visible = true
    },
    reload() {
      window.location.reload()
    },
  },
  setup() {
    const store = useStore()
    store.state.prefs = JSON.parse(localStorage.getItem("prefs")) || {}
  },
  mounted() {
    const state = this.state

    socket.on("kicked_from_lobby", data => {
      state.lobby = null
      state.playerId = null
      if(data.notification) {
        this.showModal("Kicked From Lobby", data.notification)
      }
    })
    socket.on("lobby_update", data => state.lobby = data)
    socket.on("member_update", data => state.member = data)
    socket.on("game_started_update", data => {
      if(!data.started) {
        delete state.game
      }
    })
    socket.on("game_update", data => {
      if(state.lobby.inGame) {
        state.game = data
      }
    })
    socket.on("player_update", data => {
      if(state.lobby.inGame) {
        state.playerPrev = state.player
        state.player = data
      }
    })
    

    socket.on("disconnect", () => {
      this.showModal("Disconnected", "You were disconnected from game server. Reload to reconnect.", true)
    })
  },
}
</script>