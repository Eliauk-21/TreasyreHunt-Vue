<template>
  <div class="user-management">
    <!-- 登录/注册界面 -->
    <div v-if="!currentUser" class="login-section">
      <div class="login-header">
        <h2><i class="fas fa-user-shield"></i> 冒险者登录</h2>
        <p>登录以保存您的冒险进度和成就</p>
      </div>
      <form class="user-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label><i class="fas fa-user"></i> 用户名:</label>
          <input type="text" v-model="loginForm.username" required placeholder="请输入您的冒险者名称">
        </div>
        <div class="form-group">
          <label><i class="fas fa-key"></i> 密码:</label>
          <input type="password" v-model="loginForm.password" required placeholder="请输入您的秘密咒语">
        </div>
        <button type="submit" class="action-button primary">
          <i class="fas fa-sign-in-alt"></i> 进入冒险世界
        </button>
      </form>
      
      <div class="register-prompt">
        <div class="divider">
          <span>新冒险者？</span>
        </div>
        <button class="action-button secondary" @click="showRegister = true">
          <i class="fas fa-user-plus"></i> 注册新账号
        </button>
      </div>
    </div>
    
    <!-- 个人资料界面 -->
    <div v-else class="profile-section">
      <div class="profile-header">
        <div class="user-avatar">
          <i class="fas fa-user-circle"></i>
          <div class="avatar-badge" v-if="gameStats.locationsCompleted >= 5">
            <i class="fas fa-crown"></i>
          </div>
        </div>
        <div class="user-info">
          <h2>{{ currentUser.username }}</h2>
          <p class="user-title">{{ getUserTitle() }}</p>
          <div class="user-meta">
            <span><i class="fas fa-calendar"></i> 加入时间: {{ currentUser.joinDate || '未知' }}</span>
            <span><i class="fas fa-envelope"></i> {{ currentUser.email || '未设置邮箱' }}</span>
          </div>
        </div>
        <div class="profile-actions">
          <button class="action-button secondary" @click="showEditProfile = true">
            <i class="fas fa-edit"></i> 编辑资料
          </button>
        </div>
      </div>
      
      <!-- 核心统计数据 -->
      <div class="core-stats">
        <h3><i class="fas fa-chart-line"></i> 核心数据</h3>
        <div class="stats-grid">
          <div class="stat-card primary">
            <div class="stat-icon"><i class="fas fa-trophy"></i></div>
            <div class="stat-value">{{ gameStats.puzzlesSolved || 0 }}</div>
            <div class="stat-label">解谜总数</div>
            <div class="stat-trend">+{{ Math.floor(gameStats.puzzlesSolved / 10) }} 今日</div>
          </div>
          
          <div class="stat-card success">
            <div class="stat-icon"><i class="fas fa-map-marker-alt"></i></div>
            <div class="stat-value">{{ gameStats.locationsCompleted || 0 }}/6</div>
            <div class="stat-label">完成地点</div>
            <div class="progress-bar small">
              <div class="progress" :style="{ width: (gameStats.locationsCompleted / 6) * 100 + '%' }"></div>
            </div>
          </div>
          
          <div class="stat-card info">
            <div class="stat-icon"><i class="fas fa-eye"></i></div>
            <div class="stat-value">{{ gameStats.totalLocationsVisited || 0 }}</div>
            <div class="stat-label">探索地点</div>
            <div class="stat-trend">{{ Math.round((gameStats.totalLocationsVisited / 6) * 100) }}% 完成度</div>
          </div>
          
          <div class="stat-card warning">
            <div class="stat-icon"><i class="fas fa-lightbulb"></i></div>
            <div class="stat-value">{{ gameStats.hintsUsed || 0 }}</div>
            <div class="stat-label">使用提示</div>
            <div class="stat-trend">智慧寻求者</div>
          </div>
        </div>
      </div>
      
      <!-- 挑战类型统计 -->
      <div class="challenge-stats">
        <h3><i class="fas fa-puzzle-piece"></i> 挑战类型统计</h3>
        <div class="challenge-grid">
          <div v-for="type in challengeTypes" :key="type.id" class="challenge-card">
            <div class="challenge-header">
              <span :class="['challenge-icon', type.class]">
                <i :class="getChallengeIcon(type.id)"></i>
              </span>
              <div class="challenge-info">
                <div class="challenge-name">{{ type.name }}</div>
                <div class="challenge-count">{{ getChallengeCount(type.id) }} 次挑战</div>
              </div>
            </div>
            <div class="progress-bar">
              <div 
                class="progress" 
                :class="type.class"
                :style="{ width: getChallengePercentage(type.id) + '%' }"
              ></div>
            </div>
            <div class="challenge-percentage">{{ getChallengePercentage(type.id) }}%</div>
          </div>
        </div>
      </div>
      
      <!-- 冒险历程 -->
      <div class="adventure-journey" v-if="adventurePath && adventurePath.length > 0">
        <div class="journey-header">
          <h3><i class="fas fa-route"></i> 冒险历程</h3>
          <div class="journey-summary">
            <span class="completion-rate">完成率: {{ getCompletionRate() }}%</span>
            <span class="total-locations">已访问: {{ adventurePath.length }} 个地点</span>
          </div>
        </div>
        <div class="journey-timeline">
          <div 
            v-for="(step, index) in adventurePath" 
            :key="index" 
            :class="['timeline-item', { completed: step.completed, current: isCurrentStep(step) }]"
          >
            <div class="timeline-marker">
              <i v-if="step.completed" class="fas fa-check"></i>
              <i v-else-if="isCurrentStep(step)" class="fas fa-play"></i>
              <i v-else class="fas fa-clock"></i>
            </div>
            <div class="timeline-content">
              <div class="location-info">
                <div class="location-name">{{ getLocationName(step.location) }}</div>
                <div class="timeline-time">{{ step.timestamp }}</div>
              </div>
              <div :class="['completion-status', step.completed ? 'completed' : 'pending']">
                {{ step.completed ? '挑战成功' : '进行中' }}
              </div>
            </div>
            <div class="timeline-connector" v-if="index < adventurePath.length - 1"></div>
          </div>
        </div>
        
        <!-- 冒险路径总结 -->
        <div class="path-summary">
          <h4><i class="fas fa-map-signs"></i> 冒险路径总结</h4>
          <div class="path-visual">
            <div class="path-string">{{ getAdventurePathString() }}</div>
            <div class="path-stats">
              <div class="path-stat">
                <i class="fas fa-flag-checkered"></i>
                <span>已完成: {{ getCompletedCount() }}/{{ adventurePath.length }}</span>
              </div>
              <div class="path-stat">
                <i class="fas fa-star"></i>
                <span>进度: {{ getCompletionRate() }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="no-adventure">
        <div class="no-adventure-icon">
          <i class="fas fa-compass"></i>
        </div>
        <h3>尚未开始冒险</h3>
        <p>开始您的神秘岛探险之旅吧！</p>
        <button class="action-button primary" @click="$emit('start-adventure')">
          <i class="fas fa-play"></i> 开始第一次冒险
        </button>
      </div>
    </div>
    
    <!-- 注册模态框 -->
    <div v-if="showRegister" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2><i class="fas fa-user-plus"></i> 注册新冒险者</h2>
          <button class="close-btn" @click="showRegister = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form class="user-form" @submit.prevent="handleRegister">
          <div class="form-group">
            <label><i class="fas fa-user"></i> 用户名:</label>
            <input type="text" v-model="registerForm.username" required placeholder="创建您的冒险者名称">
          </div>
          <div class="form-group">
            <label><i class="fas fa-envelope"></i> 邮箱:</label>
            <input type="email" v-model="registerForm.email" required placeholder="用于找回密码">
          </div>
          <div class="form-group">
            <label><i class="fas fa-key"></i> 密码:</label>
            <input type="password" v-model="registerForm.password" required placeholder="设置安全密码">
          </div>
          <div class="form-group">
            <label><i class="fas fa-key"></i> 确认密码:</label>
            <input type="password" v-model="registerForm.confirmPassword" required placeholder="再次输入密码">
          </div>
          <div class="form-actions">
            <button type="submit" class="action-button primary">
              <i class="fas fa-user-plus"></i> 注册并开始冒险
            </button>
            <button type="button" class="action-button secondary" @click="showRegister = false">
              <i class="fas fa-arrow-left"></i> 返回登录
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 编辑资料模态框 -->
    <div v-if="showEditProfile" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2><i class="fas fa-edit"></i> 编辑个人资料</h2>
          <button class="close-btn" @click="showEditProfile = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form class="user-form" @submit.prevent="updateProfile">
          <div class="form-group">
            <label><i class="fas fa-user"></i> 用户名:</label>
            <input type="text" v-model="profileForm.username" required>
          </div>
          <div class="form-group">
            <label><i class="fas fa-envelope"></i> 邮箱:</label>
            <input type="email" v-model="profileForm.email" placeholder="请输入邮箱地址">
          </div>
          <div class="form-group">
            <label><i class="fas fa-lock"></i> 新密码:</label>
            <input type="password" v-model="profileForm.newPassword" placeholder="留空则不修改密码">
          </div>
          <div class="form-actions">
            <button type="submit" class="action-button primary">
              <i class="fas fa-save"></i> 保存更改
            </button>
            <button type="button" class="action-button secondary" @click="showEditProfile = false">
              <i class="fas fa-times"></i> 取消
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserProfile',
  props: {
    currentUser: Object,
    gameStats: Object,
    adventurePath: Array
  },
  emits: ['update-profile', 'login', 'start-adventure'],
  data() {
    return {
      showRegister: false,
      showEditProfile: false,
      loginForm: {
        username: '',
        password: ''
      },
      registerForm: {
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      profileForm: {
        username: '',
        email: '',
        newPassword: ''
      },
      challengeTypes: [
        { id: 'riddle', name: '智慧谜语', class: 'type-riddle' },
        { id: 'poem', name: '古诗鉴赏', class: 'type-poem' },
        { id: 'culture', name: '文化常识', class: 'type-culture' },
        { id: 'judgment', name: '判断正误', class: 'type-judgment' },
        { id: 'trivia', name: '知识问答', class: 'type-trivia' }
      ],
      locationNames: {
        library: "古老图书馆",
        temple: "神秘神庙",
        cave: "黑暗洞穴",
        mountain: "危险山脉",
        ruins: "古代遗迹",
        treasure: "宝藏密室"
      }
    }
  },
  watch: {
    currentUser: {
      handler(newUser) {
        if (newUser) {
          this.profileForm = { ...newUser }
        }
      },
      immediate: true
    }
  },
  methods: {
    handleLogin() {
      if (this.loginForm.username && this.loginForm.password) {
        const userData = {
          username: this.loginForm.username,
          email: `${this.loginForm.username}@example.com`,
          joinDate: new Date().toLocaleDateString('zh-CN')
        }
        this.$emit('login', userData)
        this.loginForm = { username: '', password: '' }
      }
    },
    
    handleRegister() {
      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        alert('两次输入的密码不一致！')
        return
      }
      
      const userData = {
        username: this.registerForm.username,
        email: this.registerForm.email,
        joinDate: new Date().toLocaleDateString('zh-CN')
      }
      this.$emit('login', userData)
      this.showRegister = false
      this.registerForm = { username: '', email: '', password: '', confirmPassword: '' }
    },
    
    updateProfile() {
      this.$emit('update-profile', this.profileForm)
      this.showEditProfile = false
      alert('资料更新成功！')
    },
    
    getLocationName(locationId) {
      return this.locationNames[locationId] || locationId
    },
    
    getAdventurePathString() {
      if (!this.adventurePath || this.adventurePath.length === 0) {
        return '尚未开始冒险'
      }
      return this.adventurePath.map(step => this.getLocationName(step.location)).join(' → ')
    },
    
    getCompletionRate() {
      if (!this.adventurePath || this.adventurePath.length === 0) return 0
      const completed = this.adventurePath.filter(step => step.completed).length
      return Math.round((completed / this.adventurePath.length) * 100)
    },

    getCompletedCount() {
      if (!this.adventurePath) return 0
      return this.adventurePath.filter(step => step.completed).length
    },
    
    getChallengeCount(type) {
      // 模拟数据，实际应该从游戏数据中获取
      const baseCount = this.gameStats.puzzlesSolved || 0
      const counts = {
        riddle: Math.floor(baseCount * 0.3) + 1,
        poem: Math.floor(baseCount * 0.2) + 1,
        culture: Math.floor(baseCount * 0.25) + 1,
        judgment: Math.floor(baseCount * 0.15) + 1,
        trivia: Math.floor(baseCount * 0.1) + 1
      }
      return counts[type] || 0
    },
    
    getChallengePercentage(type) {
      const total = Object.values(this.getChallengeCounts()).reduce((a, b) => a + b, 0)
      if (total === 0) return 0
      return Math.round((this.getChallengeCount(type) / total) * 100)
    },
    
    getChallengeCounts() {
      return {
        riddle: this.getChallengeCount('riddle'),
        poem: this.getChallengeCount('poem'),
        culture: this.getChallengeCount('culture'),
        judgment: this.getChallengeCount('judgment'),
        trivia: this.getChallengeCount('trivia')
      }
    },

    getChallengeIcon(type) {
      const icons = {
        riddle: 'fas fa-question-circle',
        poem: 'fas fa-feather-alt',
        culture: 'fas fa-landmark',
        judgment: 'fas fa-balance-scale',
        trivia: 'fas fa-brain'
      }
      return icons[type] || 'fas fa-puzzle-piece'
    },

    isCurrentStep(step) {
      return !step.completed && this.adventurePath && 
             this.adventurePath[this.adventurePath.length - 1] === step
    },

    getUserTitle() {
      const completed = this.gameStats.locationsCompleted || 0
      if (completed >= 6) return '🏆 传奇冒险家'
      if (completed >= 5) return '👑 宝藏猎人'
      if (completed >= 3) return '⭐ 智慧探索者'
      if (completed >= 1) return '🔍 新手冒险家'
      return '🌱 初出茅庐'
    }
  }
}
</script>

<style scoped>
.user-management {
  min-height: 100vh;
}

.login-section {
  max-width: 400px;
  margin: 0 auto;
  padding: 40px 20px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  color: #fdbb2d;
  margin-bottom: 10px;
}

.login-header p {
  color: #bdc3c7;
  font-size: 0.9rem;
}

.user-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: #fdbb2d;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-group input {
  padding: 12px 15px;
  border-radius: 10px;
  border: 2px solid #2a4a7a;
  background: rgba(21, 38, 66, 0.8);
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #fdbb2d;
  box-shadow: 0 0 10px rgba(253, 187, 45, 0.3);
}

.register-prompt {
  margin-top: 30px;
  text-align: center;
}

.divider {
  display: flex;
  align-items: center;
  margin: 20px 0;
  color: #bdc3c7;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #2a4a7a;
}

.divider span {
  padding: 0 15px;
  font-size: 0.9rem;
}

.profile-section {
  padding: 20px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
  padding: 30px;
  background: linear-gradient(135deg, rgba(21, 38, 66, 0.9), rgba(42, 74, 122, 0.8));
  border-radius: 20px;
  border: 2px solid #fdbb2d;
}

.user-avatar {
  position: relative;
  font-size: 4rem;
  color: #fdbb2d;
}

.avatar-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #1a2a6c;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  border: 2px solid #1a2a6c;
}

.user-info {
  flex: 1;
}

.user-info h2 {
  color: #fdbb2d;
  margin-bottom: 5px;
}

.user-title {
  color: #bdc3c7;
  font-size: 1.1rem;
  margin-bottom: 10px;
}

.user-meta {
  display: flex;
  gap: 20px;
  font-size: 0.9rem;
  color: #bdc3c7;
}

.user-meta span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.core-stats {
  margin-bottom: 40px;
}

.core-stats h3 {
  color: #fdbb2d;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  background: linear-gradient(135deg, rgba(21, 38, 66, 0.9), rgba(42, 74, 122, 0.8));
  padding: 25px;
  border-radius: 15px;
  border: 2px solid;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.stat-card.primary { border-color: #3498db; }
.stat-card.success { border-color: #2ecc71; }
.stat-card.info { border-color: #9b59b6; }
.stat-card.warning { border-color: #f39c12; }

.stat-icon {
  font-size: 2.5rem;
  margin-bottom: 15px;
}

.stat-card.primary .stat-icon { color: #3498db; }
.stat-card.success .stat-icon { color: #2ecc71; }
.stat-card.info .stat-icon { color: #9b59b6; }
.stat-card.warning .stat-icon { color: #f39c12; }

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-card.primary .stat-value { color: #3498db; }
.stat-card.success .stat-value { color: #2ecc71; }
.stat-card.info .stat-value { color: #9b59b6; }
.stat-card.warning .stat-value { color: #f39c12; }

.stat-label {
  color: #bdc3c7;
  margin-bottom: 10px;
}

.stat-trend {
  font-size: 0.8rem;
  color: #95a5a6;
  margin-top: 5px;
}

.challenge-stats {
  margin-bottom: 40px;
}

.challenge-stats h3 {
  color: #fdbb2d;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.challenge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.challenge-card {
  background: linear-gradient(135deg, rgba(21, 38, 66, 0.8), rgba(42, 74, 122, 0.6));
  padding: 20px;
  border-radius: 15px;
  border: 1px solid #2a4a7a;
}

.challenge-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.challenge-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.challenge-icon.type-riddle { background: #e74c3c; }
.challenge-icon.type-poem { background: #9b59b6; }
.challenge-icon.type-culture { background: #f39c12; }
.challenge-icon.type-judgment { background: #d35400; }
.challenge-icon.type-trivia { background: #1abc9c; }

.challenge-info {
  flex: 1;
}

.challenge-name {
  font-weight: bold;
  color: #fdbb2d;
  margin-bottom: 5px;
}

.challenge-count {
  font-size: 0.9rem;
  color: #bdc3c7;
}

.challenge-percentage {
  text-align: right;
  font-size: 0.9rem;
  color: #fdbb2d;
  margin-top: 5px;
  font-weight: bold;
}

.adventure-journey {
  margin-bottom: 40px;
}

.journey-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.journey-header h3 {
  color: #fdbb2d;
  display: flex;
  align-items: center;
  gap: 10px;
}

.journey-summary {
  display: flex;
  gap: 20px;
  font-size: 0.9rem;
}

.completion-rate {
  color: #2ecc71;
  font-weight: bold;
}

.total-locations {
  color: #3498db;
}

.journey-timeline {
  position: relative;
  margin: 30px 0;
  padding-left: 40px;
}

.journey-timeline::before {
  content: '';
  position: absolute;
  left: 20px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, #fdbb2d, #2a4a7a);
}

.timeline-item {
  position: relative;
  margin-bottom: 25px;
  display: flex;
  align-items: flex-start;
}

.timeline-marker {
  position: absolute;
  left: -40px;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #2a4a7a, #3a5a8a);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #fdbb2d;
  z-index: 2;
}

.timeline-item.completed .timeline-marker {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  border-color: #2ecc71;
}

.timeline-item.current .timeline-marker {
  background: linear-gradient(135deg, #3498db, #2980b9);
  border-color: #3498db;
  animation: pulse 2s infinite;
}

.timeline-content {
  background: linear-gradient(135deg, rgba(21, 38, 66, 0.7), rgba(42, 74, 122, 0.5));
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #2a4a7a;
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.location-info {
  flex: 1;
}

.location-name {
  font-weight: bold;
  color: #fdbb2d;
  margin-bottom: 5px;
  font-size: 1.1rem;
}

.timeline-time {
  font-size: 0.8rem;
  color: #bdc3c7;
}

.completion-status {
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: bold;
}

.completion-status.completed {
  background: #27ae60;
  color: white;
}

.completion-status.pending {
  background: #3498db;
  color: white;
}

.timeline-connector {
  position: absolute;
  left: -20px;
  bottom: -25px;
  width: 2px;
  height: 25px;
  background: #2a4a7a;
}

.path-summary {
  background: linear-gradient(135deg, rgba(253, 187, 45, 0.1), rgba(255, 140, 0, 0.05));
  border-radius: 15px;
  border: 1px solid #fdbb2d;
  padding: 25px;
  margin-top: 30px;
}

.path-summary h4 {
  color: #fdbb2d;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.path-visual {
  text-align: center;
}

.path-string {
  font-size: 1.2rem;
  color: #fdbb2d;
  margin: 15px 0;
  font-weight: bold;
  line-height: 1.6;
}

.path-stats {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 15px;
}

.path-stat {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #bdc3c7;
  font-size: 0.9rem;
}

.no-adventure {
  text-align: center;
  padding: 60px 20px;
  color: #bdc3c7;
}

.no-adventure-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  color: #2a4a7a;
}

.no-adventure h3 {
  color: #fdbb2d;
  margin-bottom: 10px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: linear-gradient(135deg, rgba(21, 38, 66, 0.95), rgba(42, 74, 122, 0.9));
  border-radius: 20px;
  border: 3px solid #fdbb2d;
  padding: 30px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.modal-header h2 {
  color: #fdbb2d;
  display: flex;
  align-items: center;
  gap: 10px;
}

.close-btn {
  background: none;
  border: none;
  color: #bdc3c7;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:hover {
  color: #fdbb2d;
  background: rgba(253, 187, 45, 0.1);
}

.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.form-actions .action-button {
  flex: 1;
}

.action-button.primary {
  background: linear-gradient(135deg, #fdbb2d, #ff8c00);
  color: #1a2a6c;
}

.action-button.secondary {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
}

.progress-bar.small {
  height: 6px;
  background: #1e3a5f;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 8px;
}

.progress {
  height: 100%;
  border-radius: 3px;
  transition: width 0.8s ease;
}

.progress.type-riddle { background: #e74c3c; }
.progress.type-poem { background: #9b59b6; }
.progress.type-culture { background: #f39c12; }
.progress.type-judgment { background: #d35400; }
.progress.type-trivia { background: #1abc9c; }

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
  
  .user-meta {
    flex-direction: column;
    gap: 10px;
  }
  
  .journey-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .path-stats {
    flex-direction: column;
    gap: 10px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .timeline-content {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
}
</style>