<template>
  <div id="lobby-chat-container">
    <h3>Chat</h3>
    <div id="lobby-chat-messages">
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
            <div v-for="i in 3" :key="i" :class="`chat-podium-${i}`">
              <h4>{{ line.podium[i].name }}</h4>
              <p> {{ line.podium[i].points }} VP</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="single-line-input">
      <input placeholder="Send a message">
      <button>
        <img src="@/images/icons/check.svg" alt="Send" class="icon-1em">
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      messages: []
    }
  },
  methods: {
    print(lines) {
      if(this.messages.length > 250) this.messages.shift()
      this.messages.push(lines)
    },
    getDieSrc(die) {
      return require(`@/images/dice/${die}.svg`)
    },
  },
}
</script>