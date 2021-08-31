<template>
  <div>
    <p v-if="this.$parent.loginState.loggedIn">
      You are playing as {{ this.$parent.loginState.name }}
      <a @click="login(this, true)">(logout)</a>
    </p>
    <div v-else>
      <h2>Choose a Name</h2>
      <div class="single-line-input">
        <input v-model="this.$parent.loginState.name" placeholder="Mustacho">
        <button @click="login(false)">
          <img src="@/images/icons/check.svg" alt="Done" class="icon-1em">
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      state: this.$store.state,
    }
  },
  methods: {
    login(logout) {
      if(logout) {
        window.location.reload()
        // socket.emit("logout", null, (err, data) => {
        //   console.log(err)
        //   if(!err) {
        //     this.$parent.loginState.loggedIn = false
        //     this.state.player = null
        //     this.state.game = null
        //   }
        // })
      }
      else {
        socket.emit("login", {
          name: this.$parent.loginState.name
        }, (err, data) => {
          if(!err) {
            this.$parent.loginState.loggedIn = true
            this.$parent.loginState.name = data.name
          }
        })
      }
    },
  },
}
</script>