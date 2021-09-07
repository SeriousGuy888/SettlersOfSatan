<template>
  <transition name="sidebar-backdrop-fade">
    <div class="sidebar-backdrop" @click.self="this.open = false" v-if="open"></div>
  </transition>
  <transition name="sidebar-slide">
    <div v-if="open" class="sidebar-panel">
      <slot></slot>
    </div>
  </transition>
</template>

<script>
export default {
  data() {
    return {
      open: false,
    }
  },
}
</script>

<style>
.sidebar-backdrop {
  background-color: #0008;
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
}
.sidebar-panel {
  overflow-y: auto;
  background-color: var(--theme-bg);
  border-right: 3px solid var(--theme-border);
  position: fixed;
  left: 0;
  top: 0;
  height: 100%;
  z-index: 5;
  padding: 1rem 2rem;
  width: calc(min(300px, 60%));
  text-align: left;
}

.sidebar-panel img {
  width: 90%;
}

.sidebar-slide-enter-active { animation: sidebar-slide 250ms ease-out both; }
.sidebar-slide-leave-active { animation: sidebar-slide 250ms reverse ease-in both; }
@keyframes sidebar-slide {
  0% { transform: translate(-100%); }
  100% { transform: translate(0); }
}

.sidebar-backdrop-fade-enter-active { animation: fade 100ms ease-out both; }
.sidebar-backdrop-fade-leave-active { animation: fade 100ms reverse ease-in both; }
</style>