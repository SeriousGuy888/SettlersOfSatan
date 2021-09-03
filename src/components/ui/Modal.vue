<template>
  <transition name="modal-bounce">
    <div class="modal-backdrop" v-if="visible" @click.self="close()">
      <div class="modal-window">
        <span @click="close()" class="modal-close">×</span>

        <h3 v-if="title" class="modal-title">{{ title }}</h3>
        <p><slot></slot></p>
        <div class="modal-buttons">
          <slot name="buttons">
            <button @click="close()">Okay</button>
          </slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    title: String,
  },
  data() {
    return {
      visible: false,
    }
  },
  methods: {
    close() {
      this.visible = false
    },
  }
}
</script>

<style>
  .modal-backdrop {
    position: fixed;
    z-index: 1;
    left: -50%;
    top: -50%;
    width: 200%;
    height: 200%;
    overflow: auto;
    background-color: #0008;
  }

  .modal-window {
    background-color: var(--theme-bg);
    border: 3px solid var(--theme-border);
    margin: 20% auto;
    padding: 1em 2em 1.5em;
    border-radius: 10px;
    width: calc(max(50vw, 300px));
  }

  .modal-close {
    color: #aaa;
    float: right;
    font-size: 24px;
    font-weight: bold;
  }
  .modal-close:hover,
  .modal-close:focus {
    color: black;
    text-decoration: none;
    cursor: pointer;
  }

  .modal-buttons {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 5px;
  }

  .modal-buttons button {
    flex: 1 0 45%;
  }

  /* thieved from https://v3.vuejs.org/guide/transitions-enterleave.html#css-animations lol */
  .modal-bounce-enter-active { animation: modal-bounce 300ms ease-out both; }
  .modal-bounce-leave-active { animation: modal-bounce 300ms reverse ease-in both; }
  @keyframes modal-bounce {
    0% { transform: scale(0.95); background-color: transparent; }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); background-color: #0008; }
  }
</style>