<template>
  <div class="message-system">
    <div 
      v-for="message in messages" 
      :key="message.id"
      :class="['message', message.type]"
    >
      <div class="message-header">
        <i :class="getMessageIcon(message.type)" class="message-icon"></i>
        <span class="message-title">{{ message.title }}</span>
      </div>
      <div class="message-content" v-if="message.content">
        {{ message.content }}
      </div>
      <button class="close-btn" @click="$emit('remove-message', message.id)">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MessageSystem',
  props: {
    messages: Array
  },
  emits: ['remove-message'],
  methods: {
    getMessageIcon(type) {
      const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
      }
      return icons[type] || 'fas fa-info-circle'
    }
  }
}
</script>

<style scoped>
.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.close-btn:hover {
  opacity: 1;
}
</style>