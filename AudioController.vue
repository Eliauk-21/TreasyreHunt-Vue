<template>
  <div class="audio-controller">
    <div class="audio-info">
      <div class="current-track">
        <i class="fas fa-music"></i> {{ currentTrack }}
      </div>
      <div class="track-location" v-if="currentLocation">
        {{ currentLocation }}
      </div>
    </div>
    
    <div class="audio-controls">
      <button class="audio-btn" @click="$emit('toggle-play')" :title="isPlaying ? '暂停背景音乐' : '播放背景音乐'">
        <i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
      </button>

      <button class="audio-btn" @click="$emit('toggle-mute')" :title="muted ? '取消静音' : '静音背景音乐'">
        <i :class="muted ? 'fas fa-volume-mute' : 'fas fa-volume-up'"></i>
      </button>
      
      <div class="volume-control">
        <i class="fas fa-volume-down volume-icon"></i>
        <input 
          type="range" 
          class="volume-slider" 
          min="0" 
          max="1" 
          step="0.1" 
          :value="volume"
          @input="$emit('volume-change', parseFloat($event.target.value))"
          title="音量调节"
        >
        <i class="fas fa-volume-up volume-icon"></i>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AudioController',
  props: {
    currentTrack: String,
    currentLocation: String,
    isPlaying: Boolean,
    muted: Boolean,
    volume: Number
  },
  emits: ['toggle-play', 'toggle-mute', 'volume-change']
}
</script>

<style scoped>
.volume-icon {
  color: #fdbb2d;
  font-size: 0.9rem;
}
</style>