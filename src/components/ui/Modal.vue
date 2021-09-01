<template>
  <div class="modal" v-if="visible">
    <div class="modal-content">
      <span @click="visible = false" class="modal-close">×</span>

      <h3 class="modal-title">{{ title }}</h3>
      <p><slot></slot></p>
      <div class="modal-buttons">
        <slot name="buttons"></slot>
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
}
</script>