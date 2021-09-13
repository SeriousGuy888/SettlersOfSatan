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
          <input v-model="joiningLobbyCode" @input="updateJoinLobbyButton" placeholder="MURDER" style="text-transform: uppercase;">
          <button @click="joinLobby(joiningLobbyCode, true)" :disabled="joinLobbyExistsNot" title="Join as spectator">
            <img src="/images/icons/spectate.svg" alt="Spectate" class="icon-1em">
          </button>
          <button @click="joinLobby(joiningLobbyCode)" :disabled="joinLobbyExistsNot || joinLobbyFullOrStarted" title="Join lobby">
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

        <div id="open-lobbies-grid" v-if="openLobbies.length">
          <div 
            v-for="loopLobby in openLobbies"
            :key="loopLobby"
            class="list-entry"
          >
            <div class="list-entry-title">
              <h3>{{ loopLobby.name }}</h3>
              <button @click="joinLobby(loopLobby.code)">
                <img :src="`/images/icons/plus.svg`" alt="" class="icon-1em" > Join
              </button>
              <button @click="joinLobby(loopLobby.code, true)">
                <img :src="`/images/icons/spectate.svg`" alt="" class="icon-1em" > Spectate
              </button>
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
      joinLobbyExistsNot: true,
      joinLobbyFullOrStarted: false,
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
    joinLobby(code, spectator) {
      socket.emit("join_lobby", { code, spectator }, this.enterLobbyCallback)
    },
    createLobby(name) {
      socket.emit("create_lobby", { name }, this.enterLobbyCallback)
    },
    updateJoinLobbyButton() {
      socket.emit("get_lobby", { code: this.joiningLobbyCode }, (err, data) => {
        if(err) console.log(err)
        else {
          this.joinLobbyExistsNot = !data
          this.joinLobbyFullOrStarted = data ? (data.inGame || data.playerCount >= data.maxPlayerCount) : false
        }
      })
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
    
    const hash = decodeURI(window.location.hash.slice(1))
    let joinData
    try {
      joinData = JSON.parse(hash)
    } catch {
      console.log("failed to parse lobbyjoin string")
    }
    
    if(joinData) this.joinLobby(joinData.lobby, joinData.spectate)
  }
}
</script>

<style scoped>
#open-lobbies-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-auto-rows: 1fr;
}
</style>