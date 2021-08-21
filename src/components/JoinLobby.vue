<template>
  <div>
    <div class="row-layout">
      <div class="column-layout">
        <h2>Create a Lobby</h2>
        <p>Choose a name for your lobby.</p>
        <div class="single-line-input">
          <input v-model="creatingLobbyName" placeholder="Epic Gamer Momebt">
          <button @click="createLobby(creatingLobbyName)">
            <img src="@/images/icons/plus.svg" alt="Create" class="icon-1em">
          </button>
        </div>
      </div>
      <div class="column-layout">
        <h2>Join a Lobby</h2>
        <p>Enter a lobby code.</p>
        <div class="single-line-input">
          <input v-model="joiningLobbyCode" placeholder="MURDER" style="text-transform: uppercase;">
          <button @click="joinLobby(joiningLobbyCode)">
            <img src="@/images/icons/plus.svg" alt="Join" class="icon-1em">
          </button>
        </div>
      </div>
    </div>
    <div class="row-layout">
      <div class="column-layout">
        <h2>Open Lobbies</h2>
        <button @click="refreshOpenLobbies(this)">
          <img src="@/images/icons/refresh.svg" alt="Refresh" class="icon-1em">
          Refresh
        </button>

        <div class="flex-layout-grid">
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
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      creatingLobbyName: "",
      joiningLobbyCode: "",
      openLobbies: null,
    }
  },
  methods: {
    joinLobby(code) {
      socket.emit("join_lobby", { code }, (err, data) => {
        if(err) notifyUser(err)
        else this.$parent.lobbyState = data
      })
    },
    createLobby(name) {
      socket.emit("create_lobby", { name }, (err, data) => {
        if(err) notifyUser(err)
        else this.$parent.lobbyState = data
      })
    },
    refreshOpenLobbies(self) {
      socket.emit("get_lobbies", { max: 9 }, (err, data) => {
        if(err) notifyUser(err)
        else {
          const { lobbies } = data
          this.openLobbies = lobbies
        }
      })
    }
  }
}
</script>