<template>
  <div>
    <h2>Choose a Name</h2>
    <div class="single-line-input">
      <input v-model="this.$parent.loginState.name" placeholder="Mustacho">
      <button @click="login(false)">
        <img src="@/images/icons/check.svg" alt="Done" class="icon-1em">
      </button>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    login(logout) {
      if(logout) {
        socket.emit("logout", null, (err, data) => {
          console.log(err)
          if(!err) this.$parent.loginState.loggedIn = false
        })
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