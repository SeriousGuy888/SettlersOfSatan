<template>
  <button @click="toggle" class="collapsible" :class="{ 'collapsible-active': open }">{{ title }}</button>
  <slot v-if="open"></slot>
</template>

<script>
export default {
  props: {
    title: String,
    startOpen: Boolean, 
  },
  data() {
    return {
      open: false
    }
  },
  methods: {
    toggle() {
      this.open = !this.open
    }
  },
  mounted() {
    this.open = this.startOpen
  },
}
</script>