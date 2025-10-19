<template>
  <div class="map-container">
    <!-- 地图标题和说明 -->
    <div class="map-header">
      <h2><i class="fas fa-map-marked-alt"></i> 神秘岛探险地图</h2>
      <p>自由探索前五个地点！完成所有前五个地点后解锁宝藏密室。</p>
      <div class="exploration-info">
        <div class="info-item">
          <i class="fas fa-unlock"></i>
          <span>前五个地点可直接探索</span>
        </div>
        <div class="info-item">
          <i class="fas fa-treasure-chest"></i>
          <span>完成前五个地点解锁宝藏密室</span>
        </div>
      </div>
    </div>

    <!-- 岛屿地图 -->
    <div class="island-map">
      <!-- 连接线（显示到宝藏密室的连接） -->
      <div 
        v-for="connection in activeConnections" 
        :key="`${connection.from}-${connection.to}`"
        class="connection-line"
        :style="getConnectionStyle(connection.from, connection.to)"
        :class="{ active: isConnectionActive(connection) }"
      ></div>

      <!-- 地图位置 -->
      <div
        v-for="location in locations"
        :key="location.id"
        :class="[
          'map-location',
          location.id,
          {
            locked: !isLocationUnlocked(location.id),
            completed: completedLocations.includes(location.id),
            visited: visitedLocations.has(location.id),
            available: isLocationUnlocked(location.id) && !completedLocations.includes(location.id)
          }
        ]"
        @click="onLocationClick(location)"
        :style="location.position"
      >
        <div class="location-icon">{{ location.icon }}</div>
        <div class="location-info">
          <div class="location-name">{{ location.name }}</div>
          <div class="location-status">
            <span v-if="completedLocations.includes(location.id)" class="status-completed">
              <i class="fas fa-check"></i> 已完成
            </span>
            <span v-else-if="visitedLocations.has(location.id)" class="status-visited">
              <i class="fas fa-play"></i> 进行中
            </span>
            <span v-else-if="isLocationUnlocked(location.id)" class="status-available">
              <i class="fas fa-star"></i> 可探索
            </span>
            <span v-else class="status-locked">
              <i class="fas fa-lock"></i> 未解锁
            </span>
          </div>
        </div>

        <!-- 挑战类型标签 -->
        <div class="floating-tags">
          <span
            v-for="challenge in getChallengeTypes(location.id)"
            :key="challenge.name"
            :class="['challenge-tag', challenge.class]"
          >
            {{ challenge.name }}
          </span>
        </div>

        <!-- 解锁要求提示 -->
        <div v-if="!isLocationUnlocked(location.id)" class="unlock-requirement">
          {{ getUnlockRequirement(location.id) }}
        </div>
      </div>
    </div>

    <!-- 当前可选路径 -->
    <div v-if="availableLocations.length > 0" class="available-paths">
      <h4><i class="fas fa-route"></i> 当前可选路径</h4>
      <div class="path-options">
        <div
          v-for="location in availableLocations"
          :key="location.id"
          class="path-option"
          @click="onLocationClick(location)"
        >
          <div class="path-icon">{{ location.icon }}</div>
          <div class="path-info">
            <div class="path-name">{{ location.name }}</div>
            <div class="path-description">{{ location.description }}</div>
            <div class="path-challenges">
              <span
                v-for="challenge in getChallengeTypes(location.id)"
                :key="challenge.name"
                :class="['challenge-badge', challenge.class]"
              >
                {{ challenge.name }}
              </span>
            </div>
          </div>
          <div class="path-action">
            <button class="action-button small">
              <i class="fas fa-play"></i> 开始冒险
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 地图图例 -->
    <div class="map-legend">
      <h4><i class="fas fa-key"></i> 地图图例</h4>
      <div class="legend-items">
        <div class="legend-item">
          <div class="legend-color available"></div>
          <span>可探索</span>
        </div>
        <div class="legend-item">
          <div class="legend-color visited"></div>
          <span>进行中</span>
        </div>
        <div class="legend-item">
          <div class="legend-color completed"></div>
          <span>已完成</span>
        </div>
        <div class="legend-item">
          <div class="legend-color locked"></div>
          <span>未解锁</span>
        </div>
      </div>
    </div>

    <!-- 游戏统计 -->
    <div class="game-stats">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-trophy"></i></div>
          <div class="stat-value">{{ score }}</div>
          <div class="stat-label">冒险积分</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-brain"></i></div>
          <div class="stat-value">{{ wisdom }}</div>
          <div class="stat-label">智慧值</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-map-marker-alt"></i></div>
          <div class="stat-value">{{ visitedLocations.size }}/6</div>
          <div class="stat-label">探索地点</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-flag-checkered"></i></div>
          <div class="stat-value">{{ completedLocations.length }}/6</div>
          <div class="stat-label">完成挑战</div>
        </div>
      </div>

      <!-- 进度条 -->
      <div class="progress-section">
        <div class="progress-label">
          <span>总体进度</span>
          <span>{{ Math.round(progress) }}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress" :style="{ width: progress + '%' }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GameMap',
  props: {
    completedLocations: Array,
    score: Number,
    wisdom: Number,
    visitedLocations: Set
  },
  emits: ['start-location'],
  data() {
    return {
      locations: [
        { 
          id: 'library', 
          name: '古老图书馆', 
          icon: '📚', 
          description: '解密古籍中的智慧谜题',
          challenges: ['riddle', 'poem'],
          position: { top: '30%', left: '20%' }
        },
        { 
          id: 'temple', 
          name: '神秘神庙', 
          icon: '🏛️', 
          description: '挑战古老的机关谜题',
          challenges: ['judgment', 'culture'],
          position: { top: '20%', left: '60%' }
        },
        { 
          id: 'cave', 
          name: '黑暗洞穴', 
          icon: '🕳️', 
          description: '在黑暗中寻找真理之光',
          challenges: ['trivia', 'poem'],
          position: { top: '50%', left: '15%' }
        },
        { 
          id: 'mountain', 
          name: '危险山脉', 
          icon: '⛰️', 
          description: '攀登智慧的高峰',
          challenges: ['judgment', 'culture'],
          position: { top: '40%', left: '75%' }
        },
        { 
          id: 'ruins', 
          name: '古代遗迹', 
          icon: '🏺', 
          description: '解读失落的文明密码',
          challenges: ['riddle', 'trivia'],
          position: { top: '70%', left: '50%' }
        },
        { 
          id: 'treasure', 
          name: '宝藏密室', 
          icon: '💎', 
          description: '最终智慧的考验 - 需要完成前五个地点才能进入', 
          isTreasure: true,
          challenges: ['culture', 'riddle'],
          position: { top: '60%', left: '35%' }
        }
      ],
      challengeTypes: {
        riddle: { name: '谜语', class: 'type-riddle' },
        poem: { name: '古诗', class: 'type-poem' },
        culture: { name: '文化', class: 'type-culture' },
        judgment: { name: '判断', class: 'type-judgment' },
        trivia: { name: '常识', class: 'type-trivia' }
      },
      connections: [
        { from: 'library', to: 'treasure' },
        { from: 'temple', to: 'treasure' },
        { from: 'cave', to: 'treasure' },
        { from: 'mountain', to: 'treasure' },
        { from: 'ruins', to: 'treasure' }
      ]
    }
  },
  computed: {
    progress() {
      return (this.completedLocations.length / this.locations.length) * 100
   },
    availableLocations() {
      return this.locations.filter(location => 
        this.isLocationUnlocked(location.id) && 
        !this.completedLocations.includes(location.id)
      )
    },
    activeConnections() {
      return this.connections.filter(connection => 
        this.isLocationUnlocked(connection.from) && this.isLocationUnlocked(connection.to)
      )
    }
  },
  methods: {
    isLocationUnlocked(locationId) {
      const unlockConditions = {
        library: () => true,
        temple: () => true,
        cave: () => true,
        mountain: () => true,
        ruins: () => true,
        treasure: () => this.completedLocations.length >= 5 // 需要完成前五个地点
      }
      
      return unlockConditions[locationId] ? unlockConditions[locationId]() : false
    },

    getChallengeTypes(locationId) {
      const location = this.locations.find(loc => loc.id === locationId)
      return location ? location.challenges.map(type => this.challengeTypes[type]) : []
    },
    
    onLocationClick(location) {
      if (this.isLocationUnlocked(location.id)) {
        this.$emit('start-location', location.id)
      }
    },

    getConnectionStyle(fromId, toId) {
      const fromLoc = this.locations.find(loc => loc.id === fromId)
      const toLoc = this.locations.find(loc => loc.id === toId)
      
      if (!fromLoc || !toLoc) return {}
      
      const fromX = parseFloat(fromLoc.position.left)
      const fromY = parseFloat(fromLoc.position.top)
      const toX = parseFloat(toLoc.position.left)
      const toY = parseFloat(toLoc.position.top)
      
      const dx = toX - fromX
      const dy = toY - fromY
      const length = Math.sqrt(dx * dx + dy * dy)
      const angle = Math.atan2(dy, dx) * 180 / Math.PI
      
      return {
        left: `${fromX}%`,
        top: `${fromY}%`,
        width: `${length}%`,
        transform: `rotate(${angle}deg)`
      }
    },

    isConnectionActive(connection) {
      return this.visitedLocations.has(connection.from) && this.visitedLocations.has(connection.to)
    },

    getUnlockRequirement(locationId) {
      const requirements = {
        library: "可直接探索",
        temple: "可直接探索",
        cave: "可直接探索",
        mountain: "可直接探索",
        ruins: "可直接探索",
        treasure: "完成前五个地点后解锁"
      }
      return requirements[locationId] || "完成前置任务"
    }
  }
}
</script>

<style scoped>
.exploration-info {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #bdc3c7;
  font-size: 0.9rem;
}

.info-item i {
  color: #fdbb2d;
}

.available-paths {
  background: linear-gradient(135deg, rgba(21, 38, 66, 0.9), rgba(42, 74, 122, 0.8));
  padding: 25px;
  border-radius: 20px;
  border: 2px solid #2ecc71;
  margin: 30px 0;
}

.available-paths h4 {
  color: #2ecc71;
  margin-bottom: 20px;
  text-align: center;
}

.path-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.path-option {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(21, 38, 66, 0.7), rgba(42, 74, 122, 0.6));
  border-radius: 15px;
  border: 1px solid #2a4a7a;
  cursor: pointer;
  transition: all 0.3s ease;
}

.path-option:hover {
  border-color: #fdbb2d;
  transform: translateX(10px);
  background: linear-gradient(135deg, rgba(21, 38, 66, 0.8), rgba(42, 74, 122, 0.7));
}

.path-icon {
  font-size: 2.5rem;
  min-width: 60px;
  text-align: center;
}

.path-info {
  flex: 1;
}

.path-name {
  font-weight: bold;
  color: #fdbb2d;
  font-size: 1.2rem;
  margin-bottom: 5px;
}

.path-description {
  color: #bdc3c7;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.path-challenges {
  display: flex;
  gap: 8px;
}

.challenge-badge {
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 0.7rem;
  color: white;
}

.action-button.small {
  padding: 10px 20px;
  font-size: 0.9rem;
}

.unlock-requirement {
  position: absolute;
  bottom: -25px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(231, 76, 60, 0.9);
  color: white;
  padding: 3px 8px;
  border-radius: 8px;
  font-size: 0.7rem;
  white-space: nowrap;
  backdrop-filter: blur(5px);
}

.connection-line.active {
  background: linear-gradient(90deg, #2ecc71, #fdbb2d);
  box-shadow: 0 0 10px rgba(46, 204, 113, 0.5);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .path-option {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }
  
  .exploration-info {
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }
  
  .path-action {
    width: 100%;
  }
  
  .action-button.small {
    width: 100%;
  }
}
</style>