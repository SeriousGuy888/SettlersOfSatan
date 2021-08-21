const vueApp = {
  data() {
    return {
      loginState: {
        loggedIn: false,
        name: "",
      },
      creatingLobbyName: "",
      joiningLobbyCode: "",
      openLobbies: null,
      userIsHost: false,
      playerListModal: {
        show: false,
        data: {},
      },
      lobbyState: {}, // handles joining and leaving
      lobby: null, // the actual lobby data
      game: null,
      player: null,
    }
  },
  mounted() {
    socket.on("lobby_update", data => this.lobby = data)
    socket.on("host_change", data => {
      if(data.lostHost) this.userIsHost = false
      if(data.gainedHost) this.userIsHost = true
    })
    socket.on("game_update", data => {
      if(this.lobby.inGame) this.game = data
    })
    socket.on("player_update", data => {
      if(this.lobby.inGame) this.player = data
    })
  },
  methods: {
    login,
    joinLobby,
    createLobby,
    refreshOpenLobbies,
    leaveLobby,
    editLobbySetting,
    toggleModal,
    kickPlayer,
  },
}

Vue
  .createApp(vueApp)
  .mount("#vue")