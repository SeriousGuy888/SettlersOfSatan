<template>
  <div>
    <div class="row-layout">
      <div class="column-layout">
        <h2>Create a Lobby</h2>
        <p>Choose a name for your lobby.</p>
        <div class="single-line-input">
          <input v-model="creatingLobbyName" placeholder="Epic Gamer Momebt">
          <button @click="createLobby(creatingLobbyName)">
            <img src="/images/icons/plus.svg" alt="Create" class="icon-1em">
          </button>
        </div>
      </div>
      <div class="column-layout">
        <h2>Join a Lobby</h2>
        <p>Enter a lobby code.</p>
        <div class="single-line-input">
          <input v-model="joiningLobbyCode" placeholder="MURDER" style="text-transform: uppercase;">
          <button @click="joinLobby(joiningLobbyCode)">
            <img src="/images/icons/plus.svg" alt="Join" class="icon-1em">
          </button>
        </div>
      </div>
    </div>
    <div class="row-layout">
      <div class="column-layout">
        <div class="single-line-layout">
          <h2>Open Lobbies</h2>
          <button @click="refreshOpenLobbies(this)" :disabled="disableOpenLobbiesButton">
            <img src="/images/icons/refresh.svg" alt="Refresh" class="icon-1em">
            Refresh
          </button>
        </div>

        <div class="flex-layout-grid" v-if="openLobbies.length">
          <div 
            v-for="loopLobby in openLobbies"
            :key="loopLobby"
            class="list-entry"
          >
            <div class="list-entry-title">
              <h3>{{ loopLobby.name }}</h3>
              <button @click="joinLobby(loopLobby.code)">Join</button>
            </div>
            <p>Code: <code>{{ loopLobby.code }}</code></p>
            <p>Players: <code>{{ loopLobby.playerCount }}/{{ loopLobby.maxPlayerCount }}</code></p>
          </div>
        </div>
        <div v-else>
          <p>No open lobbies that are queueing for a game right now :(</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      state: this.$store.state,
      creatingLobbyName: "",
      joiningLobbyCode: "",
      openLobbies: [],
      disableOpenLobbiesButton: false,
    }
  },
  methods: {
    enterLobbyCallback(err, data) {
      if(err) alert(err)
      else {
        this.state.playerId = data.playerId
        window.location.hash = ""
      }
    },
    joinLobby(code) {
      socket.emit("join_lobby", { code }, this.enterLobbyCallback)
    },
    createLobby(name) {
      socket.emit("create_lobby", { name }, this.enterLobbyCallback)
    },
    refreshOpenLobbies() {
      // make it look like the button is loading for a bit of time just because
      this.disableOpenLobbiesButton = true
      setTimeout(() => { this.disableOpenLobbiesButton = false }, 300)

      socket.emit("get_lobbies", { max: 9 }, (err, data) => {
        if(err) alert(err)
        else {
          const { lobbies } = data
          this.openLobbies = lobbies
        }
      })
    }
  },
  mounted() {
    this.refreshOpenLobbies()
    
    const hash = window.location.hash.slice(1)
    const lobbyCode = hash.replace(/lobby=/i, "")
    if(lobbyCode) this.joinLobby(lobbyCode)
  }
}
</script>