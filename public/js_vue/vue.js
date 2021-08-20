const vueApp = {
  data() {
    return {
      loginState: {
        loggedIn: false,
        name: "",
      },
    }
  },
  mounted() {
    setInterval(() => {
      this.counter++
    }, 1000)
  },
  methods: {
    login(logout) {

      if(logout) {
        socket.emit("logout", null, (err, data) => {
          console.log(err)
          if(!err) this.loginState.loggedIn = false
        })
      }
      else {
        socket.emit("login", {
          name: this.loginState.name
        }, (err, data) => {
          if(!err) {
            this.loginState.loggedIn = true
            this.loginState.name = data.name
          }
        })
      }
    }
  },
}

Vue
  .createApp(vueApp)
  .mount("#vue")