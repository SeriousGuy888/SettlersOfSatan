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
      lobbyState: {},

    }
  },
  mounted() {
    
  },
  methods: {
    login,
    joinLobby,
    createLobby,
    refreshOpenLobbies,
    leaveLobby,
  },
}

Vue
  .createApp(vueApp)
  .mount("#vue")