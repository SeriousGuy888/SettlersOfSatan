<template>
  <div id="lobby-chat-container">
    <h3>Chat</h3>
    <div ref="messagesContainer" id="lobby-chat-messages">
      <div v-for="message in messages" :key="message">
        <div v-for="line in message" :key="line" class="chat-message-content">
          <p
            v-if="line.text"
            :style="`
              font-weight: ${line.style?.bold ? 'bold' : 'normal'};
              font-style: ${line.style?.italic ? 'italic' : 'normal'};
              color: ${line.style?.colour};
            `"
          >{{ line.text }}</p>
          <div v-if="line.dice" class="chat-message-dice">
            <img v-for="die in line.dice" :key="die" :src="getDieSrc(die)" :alt="die">
          </div>
          <div v-if="line.podium" class="chat-podium">
            <div v-for="(elem, ind) in line.podium" :key="elem" :class="`chat-podium-${ind + 1}`">
              <h4>{{ elem.name }}</h4>
              <p> {{ elem.points }} VP</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="single-line-input">
      <input v-on:keyup.enter="sendChat()" v-model="chatInput" placeholder="Send a message">
      <button @click="sendChat()">
        <img src="/images/icons/check.svg" alt="Send" class="icon-1em">
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      messages: [],
      chatInput: "",
    }
  },
  methods: {
    print(lines) {
      if(this.messages.length > 250) this.messages.shift()
      this.messages.push(lines)

      const container = this.$refs.messagesContainer
      if(container.scrollTop + container.clientHeight === container.scrollHeight) {
        this.$nextTick(() => {
          container.scrollTop = container.scrollHeight
        })
      }
    },
    getDieSrc(die) {
      return `/images/dice/${die}.svg`
    },
    sendChat() {
      if(!this.chatInput.trim()) return

      socket.emit("send_chat", {
        content: this.chatInput
      }, (err, _) => {
        if(err) this.print([{
          text: err,
          style: { colour: "red", italic: true }
        }])
      })
      this.chatInput = ""
    },
  },
}
</script>