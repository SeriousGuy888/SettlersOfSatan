<template>
  <div class="modal-backdrop" v-if="visible" @click.self="close()">
    <div class="modal-content">
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
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: black;
    background-color: #00000066;
  }

  .modal-content {
    background-color: var(--theme-bg);
    margin: 15% auto;
    padding: 1em 2em 1.5em;
    border-radius: 10px;
    width: 40%;
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
</style>