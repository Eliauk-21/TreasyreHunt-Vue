<template>
  <div 
    :class="['location-card', { 
      'treasure-room': location.isTreasure, 
      'locked': !unlocked,
      'visited': visited,
      'completed': completed
    }]"
    @click="handleClick"
  >
    <div class="location-icon">{{ location.icon }}</div>
    <h3>{{ location.name }}</h3>
    <p>{{ location.description }}</p>
    
    <!-- 挑战类型标签 -->
    <div class="challenge-tags">
      <span 
        v-for="challenge in challengeTypes" 
        :key="challenge.name"
        :class="['challenge-tag', challenge.class]"
      >
        {{ challenge.name }}
      </span>
    </div>
    
    <!-- 状态标识 -->
    <div class="status-indicators">
      <div v-if="completed" class="completion-badge">
        {{ location.isTreasure ? '🏆' : '✓' }}
      </div>
      <div v-else-if="visited" class="visited-badge">
        <i class="fas fa-eye"></i>
      </div>
      
      <div v-if="!unlocked" class="lock-icon">🔒</div>
    </div>

    <!-- 访问次数 -->
    <div v-if="visited && !completed" class="visit-count">
      挑战中...
    </div>
  </div>
</template>

<script>
export default {
  name: 'LocationCard',
  props: {
    location: Object,
    completed: Boolean,
    visited: Boolean,
    unlocked: Boolean,
    challengeTypes: Array
  },
  methods: {
    handleClick() {
      if (this.unlocked) {
        this.$emit('location-click', this.location)
      }
    }
  }
}
</script>

<style scoped>
.challenge-tags {
  display: flex;
  gap: 5px;
  margin: 10px 0;
  justify-content: center;
  flex-wrap: wrap;
}

.challenge-tag {
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 0.7rem;
  color: white;
}

.status-indicators {
  position: absolute;
  top: 15px;
  right: 15px;
  display: flex;
  gap: 5px;
}

.visited-badge {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}

.visit-count {
  position: absolute;
  bottom: 15px;
  left: 15px;
  font-size: 0.8rem;
  color: #bdc3c7;
}

.location-card.visited {
  border-color: #3498db;
}

.location-card.visited:hover {
  border-color: #3498db;
  box-shadow: 0 20px 40px rgba(52, 152, 219, 0.4);
}

.location-card.completed {
  border-color: #2ecc71;
}

.location-card.completed:hover {
  border-color: #2ecc71;
  box-shadow: 0 20px 40px rgba(46, 204, 113, 0.4);
}
</style>