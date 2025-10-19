<template>
  <header class="game-header">
    <h1><i class="fas fa-map"></i> 神秘岛寻宝大冒险</h1>
    <div class="game-controls">
      <button class="control-btn" @click="$emit('toggle-mute')">
        <i :class="muted ? 'fas fa-volume-mute' : 'fas fa-volume-up'"></i>
      </button>
      <button class="control-btn" @click="$emit('save-game')">
        <i class="fas fa-save"></i>
      </button>
      <button class="control-btn" @click="$emit('reset-game')">
        <i class="fas fa-redo"></i>
      </button>
      <button v-if="currentUser" class="control-btn" @click="$emit('logout')">
        <i class="fas fa-sign-out-alt"></i>
      </button>
    </div>
  </header>
</template>

<script>
export default {
  name: 'GameHeader',
  props: {
    currentUser: Object,
    muted: Boolean
  },
  emits: ['toggle-mute', 'save-game', 'reset-game', 'logout']
}
</script>

<style scoped>
/* 样式已经在主CSS文件中定义 */
</style>