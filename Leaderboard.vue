<template>
  <div class="leaderboard-page">
    <div class="leaderboard-header">
      <div class="header-content">
        <h1><i class="fas fa-trophy"></i> 冒险者排行榜</h1>
        <p>看看谁是最智慧的冒险家！</p>
      </div>
      <div class="header-stats">
        <div class="header-stat">
          <div class="stat-number">{{ totalPlayers }}</div>
          <div class="stat-label">总玩家</div>
        </div>
        <div class="header-stat">
          <div class="stat-number">{{ averageScore }}</div>
          <div class="stat-label">平均积分</div>
        </div>
        <div class="header-stat">
          <div class="stat-number">{{ completionRate }}%</div>
          <div class="stat-label">平均完成率</div>
        </div>
      </div>
    </div>
    
    <div class="leaderboard-filters">
      <div class="filter-group">
        <span class="filter-label">排序方式:</span>
        <div class="filter-buttons">
          <button 
            v-for="filter in filters" 
            :key="filter.id"
            :class="['filter-btn', { active: currentFilter === filter.id }]"
            @click="currentFilter = filter.id"
          >
            <i :class="filter.icon"></i>
            {{ filter.name }}
          </button>
        </div>
      </div>
      <div class="search-box">
        <i class="fas fa-search search-icon"></i>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="搜索玩家..." 
          class="search-input"
        >
      </div>
    </div>
    
    <div class="leaderboard-content">
      <!-- 前三名奖台 -->
      <div class="podium-section" v-if="topThree.length > 0">
        <h2 class="section-title"><i class="fas fa-crown"></i> 荣耀殿堂</h2>
        <div class="podium-container">
          <div class="podium">
            <div 
              v-for="user in topThree" 
              :key="user.rank"
              :class="['podium-item', `rank-${user.rank}`]"
            >
              <div class="podium-medal">
                <i :class="getRankIcon(user.rank)"></i>
              </div>
              <div class="podium-rank">{{ user.rank }}</div>
              <div class="podium-avatar">
                <i class="fas fa-user-circle"></i>
                <div class="avatar-badge" v-if="user.rank === 1">
                  <i class="fas fa-crown"></i>
                </div>
              </div>
              <div class="podium-user">
                <div class="username">{{ user.username }}</div>
                <div class="user-title">{{ getUserTitle(user) }}</div>
              </div>
              <div class="podium-score">
                <div class="score-value">{{ user.score }}</div>
                <div class="score-label">积分</div>
              </div>
              <div class="podium-stats">
                <div class="stat">
                  <i class="fas fa-flag-checkered"></i>
                  {{ user.completed }}/6 地点
                </div>
                <div class="path-preview" :title="user.path">
                  {{ truncatePath(user.path, 25) }}
                </div>
              </div>
              <div class="podium-badge" v-if="user.rank === 1">
                传奇冒险家
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 排行榜列表 -->
      <div class="leaderboard-list">
        <h2 class="section-title"><i class="fas fa-list-ol"></i> 排行榜</h2>
        <div class="table-container">
          <table class="leaderboard-table">
            <thead>
              <tr>
                <th class="rank-col">排名</th>
                <th class="player-col">玩家</th>
                <th class="score-col">积分</th>
                <th class="progress-col">进度</th>
                <th class="challenges-col">挑战类型</th>
                <th class="path-col">冒险路径</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="user in filteredUsers" 
                :key="user.rank"
                :class="['rank-row', `rank-${user.rank}`, { current: user.isCurrentUser }]"
              >
                <td class="rank-cell">
                  <div class="rank-display">
                    <span class="rank-number">{{ user.rank }}</span>
                    <span v-if="user.rank <= 3" class="rank-medal">
                      {{ ['🥇', '🥈', '🥉'][user.rank - 1] }}
                    </span>
                  </div>
                </td>
                <td class="player-cell">
                  <div class="player-info">
                    <div class="player-avatar">
                      <i class="fas fa-user-circle"></i>
                      <div class="online-indicator" v-if="user.isOnline"></div>
                    </div>
                    <div class="player-details">
                      <div class="username">{{ user.username }}</div>
                      <div class="player-meta">
                        <span class="join-date">{{ user.joinDate || '新冒险者' }}</span>
                        <span class="player-level" v-if="user.level">Lv.{{ user.level }}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="score-cell">
                  <div class="score-display">
                    <div class="score-value">{{ user.score }}</div>
                    <div class="score-change" :class="getScoreChangeClass(user.scoreChange)">
                      <i :class="getScoreChangeIcon(user.scoreChange)"></i>
                      {{ Math.abs(user.scoreChange) }}
                    </div>
                  </div>
                </td>
                <td class="progress-cell">
                  <div class="progress-display">
                    <div class="progress-info">
                      <span class="progress-text">{{ user.completed }}/6 地点</span>
                      <span class="progress-percent">{{ Math.round((user.completed / 6) * 100) }}%</span>
                    </div>
                    <div class="progress-bar">
                      <div 
                        class="progress" 
                        :style="{ width: (user.completed / 6) * 100 + '%' }"
                        :class="getProgressClass(user.completed)"
                      ></div>
                    </div>
                  </div>
                </td>
                <td class="challenges-cell">
                  <div class="challenge-tags">
                    <span 
                      v-for="challenge in user.challenges" 
                      :key="challenge"
                      :class="['challenge-tag', `type-${challenge}`]"
                      :title="getChallengeName(challenge)"
                    >
                      {{ getChallengeAbbr(challenge) }}
                    </span>
                  </div>
                </td>
                <td class="path-cell">
                  <div class="path-display" :title="user.path">
                    <i class="fas fa-route path-icon"></i>
                    <span class="path-text">{{ truncatePath(user.path, 20) }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-if="filteredUsers.length === 0" class="no-results">
          <i class="fas fa-search"></i>
          <h3>未找到匹配的玩家</h3>
          <p>尝试调整搜索条件或筛选器</p>
        </div>
      </div>
      
      <!-- 当前用户排名卡片 -->
      <div v-if="currentUserRank" class="current-user-card">
        <div class="card-header">
          <h3><i class="fas fa-user"></i> 我的排名</h3>
          <div class="rank-badge">第 {{ currentUserRank.rank }} 名</div>
        </div>
        <div class="card-content">
          <div class="user-main">
            <div class="user-avatar">
              <i class="fas fa-user-circle"></i>
            </div>
            <div class="user-details">
              <div class="username">{{ currentUserRank.username }}</div>
              <div class="user-title">{{ getUserTitle(currentUserRank) }}</div>
            </div>
          </div>
          <div class="user-stats">
            <div class="user-stat">
              <div class="stat-value">{{ currentUserRank.score }}</div>
              <div class="stat-label">积分</div>
            </div>
            <div class="user-stat">
              <div class="stat-value">{{ currentUserRank.completed }}/6</div>
              <div class="stat-label">完成地点</div>
            </div>
            <div class="user-stat">
              <div class="stat-value">{{ Math.round((currentUserRank.completed / 6) * 100) }}%</div>
              <div class="stat-label">进度</div>
            </div>
          </div>
          <div class="user-path">
            <i class="fas fa-map-marker-alt"></i>
            {{ currentUserRank.path }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- 统计信息面板 -->
    <div class="stats-panel">
      <h3><i class="fas fa-chart-bar"></i> 社区统计</h3>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-users"></i></div>
          <div class="stat-content">
            <div class="stat-value">{{ totalPlayers }}</div>
            <div class="stat-label">活跃冒险者</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-puzzle-piece"></i></div>
          <div class="stat-content">
            <div class="stat-value">{{ totalPuzzlesSolved }}</div>
            <div class="stat-label">总解谜数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-treasure-chest"></i></div>
          <div class="stat-content">
            <div class="stat-value">{{ treasureCompletions }}</div>
            <div class="stat-label">宝藏达成</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-clock"></i></div>
          <div class="stat-content">
            <div class="stat-value">{{ averagePlayTime }}</div>
            <div class="stat-label">平均游戏时间</div>
          </div>
        </div>
      </div>
      
      <!-- 挑战类型分布 -->
      <div class="challenge-distribution">
        <h4>挑战类型分布</h4>
        <div class="distribution-chart">
          <div 
            v-for="type in challengeDistribution" 
            :key="type.name"
            class="distribution-item"
            :style="{ flex: type.percentage }"
            :title="`${type.name}: ${type.percentage}%`"
          >
            <div class="distribution-bar" :class="type.class"></div>
            <div class="distribution-label">{{ type.name }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Leaderboard',
  props: {
    users: Array
  },
  data() {
    return {
      currentFilter: 'score',
      searchQuery: '',
      filters: [
        { id: 'score', name: '按积分', icon: 'fas fa-star' },
        { id: 'completion', name: '按完成度', icon: 'fas fa-flag-checkered' },
        { id: 'progress', name: '按进度', icon: 'fas fa-chart-line' },
        { id: 'recent', name: '按活跃度', icon: 'fas fa-clock' }
      ],
      challengeNames: {
        riddle: '智慧谜语',
        poem: '古诗鉴赏', 
        culture: '文化常识',
        judgment: '判断正误',
        trivia: '知识问答'
      }
    }
  },
  computed: {
    sortedUsers() {
      let users = [...this.generateSampleUsers()]
      switch (this.currentFilter) {
        case 'completion':
          return users.sort((a, b) => b.completed - a.completed)
        case 'progress':
          return users.sort((a, b) => (b.completed / 6) - (a.completed / 6))
        case 'recent':
          return users.sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive))
        default:
          return users.sort((a, b) => b.score - a.score)
      }
    },
    
    filteredUsers() {
      if (!this.searchQuery) {
        return this.sortedUsers.filter(user => user.rank > 3) // 排除前三名（已经在奖台显示）
      }
      return this.sortedUsers.filter(user => 
        user.username.toLowerCase().includes(this.searchQuery.toLowerCase()) &&
        user.rank > 3
      )
    },
    
    topThree() {
      return this.sortedUsers.slice(0, 3)
    },
    
    currentUserRank() {
      // 模拟当前用户数据
      return {
        rank: 2,
        username: '智慧探索者',
        score: 1200,
        completed: 4,
        path: '图书馆 → 神庙 → 洞穴 → 山脉',
        isCurrentUser: true,
        joinDate: '2024-01-15',
        level: 3
      }
    },
    
    totalPlayers() {
      return this.sortedUsers.length
    },
    
    averageScore() {
      const total = this.sortedUsers.reduce((sum, user) => sum + user.score, 0)
      return Math.round(total / this.sortedUsers.length)
    },
    
    completionRate() {
      const totalCompletion = this.sortedUsers.reduce((sum, user) => sum + (user.completed / 6), 0)
      return Math.round((totalCompletion / this.sortedUsers.length) * 100)
    },
    
    totalPuzzlesSolved() {
      return this.sortedUsers.reduce((sum, user) => sum + user.puzzlesSolved, 0)
    },
    
    treasureCompletions() {
      return this.sortedUsers.filter(user => user.completed >= 6).length
    },
    
    averagePlayTime() {
      return '2.5小时'
    },
    
    challengeDistribution() {
      return [
        { name: '谜语', percentage: 25, class: 'type-riddle' },
        { name: '古诗', percentage: 20, class: 'type-poem' },
        { name: '文化', percentage: 18, class: 'type-culture' },
        { name: '判断', percentage: 22, class: 'type-judgment' },
        { name: '常识', percentage: 15, class: 'type-trivia' }
      ]
    }
  },
  methods: {
    generateSampleUsers() {
      const sampleUsers = [
        { rank: 1, username: '传奇冒险王', score: 1800, completed: 6, puzzlesSolved: 12, 
          path: '图书馆→神庙→洞穴→山脉→遗迹→宝藏', challenges: ['riddle', 'poem', 'culture'], 
          joinDate: '2024-01-01', level: 5, isOnline: true, scoreChange: 45, lastActive: new Date() },
        { rank: 2, username: '智慧探索者', score: 1200, completed: 4, puzzlesSolved: 8,
          path: '图书馆→神庙→洞穴→山脉', challenges: ['judgment', 'trivia'], 
          joinDate: '2024-01-15', level: 3, isOnline: true, scoreChange: 12, lastActive: new Date() },
        { rank: 3, username: '古迹研究者', score: 950, completed: 4, puzzlesSolved: 7,
          path: '图书馆→遗迹→洞穴→神庙', challenges: ['culture', 'poem'], 
          joinDate: '2024-01-20', level: 3, isOnline: false, scoreChange: -8, lastActive: new Date(Date.now() - 86400000) },
        { rank: 4, username: '山脉征服者', score: 800, completed: 3, puzzlesSolved: 6,
          path: '图书馆→山脉→洞穴', challenges: ['judgment', 'riddle'], 
          joinDate: '2024-02-01', level: 2, isOnline: true, scoreChange: 25, lastActive: new Date() },
        { rank: 5, username: '神秘旅人', score: 700, completed: 3, puzzlesSolved: 5,
          path: '神庙→洞穴→遗迹', challenges: ['poem', 'culture'], 
          joinDate: '2024-02-05', level: 2, isOnline: false, scoreChange: 0, lastActive: new Date(Date.now() - 172800000) },
        { rank: 6, username: '新手冒险家', score: 500, completed: 2, puzzlesSolved: 3,
          path: '图书馆→神庙', challenges: ['trivia'], 
          joinDate: '2024-02-10', level: 1, isOnline: true, scoreChange: 30, lastActive: new Date() }
      ]
      
      // 添加更多示例用户
      for (let i = 7; i <= 20; i++) {
        sampleUsers.push({
          rank: i,
          username: `冒险者${i}`,
          score: Math.floor(Math.random() * 500) + 200,
          completed: Math.floor(Math.random() * 3) + 1,
          puzzlesSolved: Math.floor(Math.random() * 4) + 2,
          path: ['图书馆', '神庙', '洞穴', '山脉', '遗迹'][Math.floor(Math.random() * 3) + 1] + '→...',
          challenges: ['riddle', 'poem', 'culture', 'judgment', 'trivia'].slice(0, Math.floor(Math.random() * 3) + 1),
          joinDate: `2024-0${Math.floor(Math.random() * 2) + 1}-${Math.floor(Math.random() * 28) + 1}`,
          level: Math.floor(Math.random() * 3) + 1,
          isOnline: Math.random() > 0.7,
          scoreChange: Math.floor(Math.random() * 60) - 20,
          lastActive: new Date(Date.now() - Math.random() * 604800000) // 7天内
        })
      }
      
      return sampleUsers
    },
    
    getRankIcon(rank) {
      const icons = {
        1: 'fas fa-crown',
        2: 'fas fa-medal',
        3: 'fas fa-award'
      }
      return icons[rank] || 'fas fa-user'
    },
    
    truncatePath(path, length) {
      if (!path) return ''
      if (path.length > length) {
        return path.substring(0, length - 3) + '...'
      }
      return path
    },
    
    getChallengeName(type) {
      return this.challengeNames[type] || type
    },
    
    getChallengeAbbr(type) {
      const abbrs = {
        riddle: '谜',
        poem: '诗', 
        culture: '文',
        judgment: '判',
        trivia: '识'
      }
      return abbrs[type] || type.charAt(0)
    },
    
    getUserTitle(user) {
      const completed = user.completed || 0
      if (completed >= 6) return '🏆 传奇冒险家'
      if (completed >= 5) return '👑 宝藏猎人' 
      if (completed >= 3) return '⭐ 智慧探索者'
      if (completed >= 1) return '🔍 新手冒险家'
      return '🌱 初出茅庐'
    },
    
    getProgressClass(completed) {
      if (completed >= 6) return 'progress-master'
      if (completed >= 4) return 'progress-advanced'
      if (completed >= 2) return 'progress-intermediate'
      return 'progress-beginner'
    },
    
    getScoreChangeClass(change) {
      if (change > 0) return 'positive'
      if (change < 0) return 'negative'
      return 'neutral'
    },
    
    getScoreChangeIcon(change) {
      if (change > 0) return 'fas fa-arrow-up'
      if (change < 0) return 'fas fa-arrow-down'
      return 'fas fa-minus'
    }
  }
}
</script>

<style scoped>
.leaderboard-page {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.leaderboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #2a4a7a;
}

.header-content h1 {
  color: #fdbb2d;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-content p {
  color: #bdc3c7;
  font-size: 1.1rem;
}

.header-stats {
  display: flex;
  gap: 30px;
}

.header-stat {
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #fdbb2d;
  margin-bottom: 5px;
}

.stat-label {
  color: #bdc3c7;
  font-size: 0.9rem;
}

.leaderboard-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  gap: 20px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 15px;
}

.filter-label {
  color: #bdc3c7;
  font-weight: bold;
}

.filter-buttons {
  display: flex;
  gap: 10px;
}

.filter-btn {
  background: linear-gradient(135deg, #2a4a7a, #3a5a8a);
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.filter-btn.active {
  background: linear-gradient(135deg, #fdbb2d, #ff8c00);
  color: #1a2a6c;
}

.filter-btn:hover:not(.active) {
  background: linear-gradient(135deg, #3a5a9a, #4a6a9a);
}

.search-box {
  position: relative;
  min-width: 250px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #bdc3c7;
}

.search-input {
  width: 100%;
  padding: 10px 15px 10px 35px;
  border-radius: 10px;
  border: 2px solid #2a4a7a;
  background: rgba(21, 38, 66, 0.8);
  color: white;
  font-size: 0.9rem;
}

.search-input:focus {
  outline: none;
  border-color: #fdbb2d;
}

.leaderboard-content {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.podium-section {
  margin-bottom: 0;
}

.section-title {
  color: #fdbb2d;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.podium-container {
  width: 100%;
  overflow: hidden;
}

.podium {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 20px;
  padding: 40px 20px;
  background: linear-gradient(135deg, rgba(21, 38, 66, 0.8), rgba(42, 74, 122, 0.6));
  border-radius: 20px;
  border: 2px solid #fdbb2d;
  min-height: 300px;
  position: relative;
}

.podium-item {
  text-align: center;
  padding: 30px 20px;
  border-radius: 15px;
  min-width: 220px;
  max-width: 280px;
  position: relative;
  transition: all 0.3s ease;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 280px;
}

.podium-item.rank-1 {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  order: 2;
  height: 320px;
  transform: translateY(-20px);
  z-index: 3;
}

.podium-item.rank-2 {
  background: linear-gradient(135deg, #c0c0c0, #e8e8e8);
  order: 1;
  height: 280px;
  z-index: 2;
}

.podium-item.rank-3 {
  background: linear-gradient(135deg, #cd7f32, #e9b076);
  order: 3;
  height: 260px;
  z-index: 1;
}

.podium-medal {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.podium-item.rank-1 .podium-medal { color: #1a2a6c; }
.podium-item.rank-2 .podium-medal { color: #1a2a6c; }
.podium-item.rank-3 .podium-medal { color: #1a2a6c; }

.podium-rank {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 15px;
}

.podium-item.rank-1 .podium-rank { color: #1a2a6c; }
.podium-item.rank-2 .podium-rank { color: #1a2a6c; }
.podium-item.rank-3 .podium-rank { color: #1a2a6c; }

.podium-avatar {
  position: relative;
  font-size: 3rem;
  margin-bottom: 15px;
}

.podium-item.rank-1 .podium-avatar { color: #1a2a6c; }
.podium-item.rank-2 .podium-avatar { color: #1a2a6c; }
.podium-item.rank-3 .podium-avatar { color: #1a2a6c; }

.avatar-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
  color: white;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  border: 2px solid white;
}

.podium-user .username {
  font-weight: bold;
  margin-bottom: 5px;
  font-size: 1.1rem;
  line-height: 1.2;
}

.podium-item.rank-1 .podium-user .username { color: #1a2a6c; }
.podium-item.rank-2 .podium-user .username { color: #1a2a6c; }
.podium-item.rank-3 .podium-user .username { color: #1a2a6c; }

.user-title {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 10px;
  line-height: 1.2;
}

.podium-score {
  margin: 10px 0;
}

.score-value {
  font-size: 1.5rem;
  font-weight: bold;
  line-height: 1.2;
}

.podium-item.rank-1 .score-value { color: #1a2a6c; }
.podium-item.rank-2 .score-value { color: #1a2a6c; }
.podium-item.rank-3 .score-value { color: #1a2a6c; }

.score-label {
  font-size: 0.8rem;
  color: #666;
  line-height: 1.2;
}

.podium-stats {
  margin-top: 10px;
  font-size: 0.8rem;
  line-height: 1.3;
}

.podium-stats .stat {
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.path-preview {
  margin-top: 5px;
  font-size: 0.7rem;
  opacity: 0.8;
  line-height: 1.2;
  word-break: break-word;
}

.podium-badge {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
  color: white;
  padding: 5px 10px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: bold;
  white-space: nowrap;
}

.leaderboard-list {
  margin-bottom: 0;
}

.table-container {
  overflow-x: auto;
  background: linear-gradient(135deg, rgba(21, 38, 66, 0.8), rgba(42, 74, 122, 0.6));
  border-radius: 15px;
  border: 1px solid #2a4a7a;
  margin-top: 20px;
}

.leaderboard-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.leaderboard-table th {
  background: linear-gradient(135deg, #2a4a7a, #3a5a8a);
  color: #fdbb2d;
  padding: 15px;
  text-align: left;
  font-weight: bold;
  border-bottom: 2px solid #fdbb2d;
}

.leaderboard-table td {
  padding: 15px;
  border-bottom: 1px solid #2a4a7a;
}

.rank-row:hover {
  background: rgba(253, 187, 45, 0.1);
}

.rank-row.current {
  background: linear-gradient(135deg, rgba(253, 187, 45, 0.2), rgba(255, 140, 0, 0.1));
  border-left: 4px solid #fdbb2d;
}

.rank-row.rank-1,
.rank-row.rank-2,
.rank-row.rank-3 {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), transparent);
}

.rank-cell {
  width: 80px;
}

.rank-display {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rank-number {
  font-weight: bold;
  font-size: 1.1rem;
  min-width: 25px;
}

.rank-medal {
  font-size: 1.2rem;
}

.player-cell {
  min-width: 200px;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.player-avatar {
  position: relative;
  font-size: 2.5rem;
  color: #fdbb2d;
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  background: #2ecc71;
  border-radius: 50%;
  border: 2px solid #1a2a6c;
}

.player-details {
  flex: 1;
}

.username {
  font-weight: bold;
  color: #fdbb2d;
  margin-bottom: 3px;
}

.player-meta {
  display: flex;
  gap: 10px;
  font-size: 0.8rem;
  color: #bdc3c7;
}

.player-level {
  background: #3498db;
  color: white;
  padding: 1px 6px;
  border-radius: 8px;
  font-size: 0.7rem;
}

.score-cell {
  width: 100px;
}

.score-display {
  text-align: center;
}

.score-value {
  font-size: 1.3rem;
  font-weight: bold;
  color: #fdbb2d;
  margin-bottom: 3px;
}

.score-change {
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
}

.score-change.positive {
  color: #2ecc71;
}

.score-change.negative {
  color: #e74c3c;
}

.score-change.neutral {
  color: #bdc3c7;
}

.progress-cell {
  min-width: 150px;
}

.progress-display {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.progress-text {
  color: #bdc3c7;
}

.progress-percent {
  color: #fdbb2d;
  font-weight: bold;
}

.progress-bar {
  height: 6px;
  background: #1e3a5f;
  border-radius: 3px;
  overflow: hidden;
}

.progress {
  height: 100%;
  border-radius: 3px;
  transition: width 0.8s ease;
}

.progress-beginner { background: #3498db; }
.progress-intermediate { background: #9b59b6; }
.progress-advanced { background: #f39c12; }
.progress-master { background: #2ecc71; }

.challenges-cell {
  min-width: 120px;
}

.challenge-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.challenge-tag {
  padding: 3px 6px;
  border-radius: 8px;
  font-size: 0.7rem;
  color: white;
  min-width: 20px;
  text-align: center;
}

.challenge-tag.type-riddle { background: #e74c3c; }
.challenge-tag.type-poem { background: #9b59b6; }
.challenge-tag.type-culture { background: #f39c12; }
.challenge-tag.type-judgment { background: #d35400; }
.challenge-tag.type-trivia { background: #1abc9c; }

.path-cell {
  min-width: 150px;
}

.path-display {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #bdc3c7;
  font-size: 0.9rem;
}

.path-icon {
  color: #fdbb2d;
}

.no-results {
  text-align: center;
  padding: 60px 20px;
  color: #bdc3c7;
}

.no-results i {
  font-size: 3rem;
  margin-bottom: 15px;
  color: #2a4a7a;
}

.no-results h3 {
  color: #fdbb2d;
  margin-bottom: 10px;
}

.current-user-card {
  background: linear-gradient(135deg, rgba(253, 187, 45, 0.1), rgba(255, 140, 0, 0.05));
  border-radius: 15px;
  border: 2px solid #fdbb2d;
  padding: 25px;
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-header h3 {
  color: #fdbb2d;
  display: flex;
  align-items: center;
  gap: 10px;
}

.rank-badge {
  background: linear-gradient(135deg, #fdbb2d, #ff8c00);
  color: #1a2a6c;
  padding: 8px 15px;
  border-radius: 20px;
  font-weight: bold;
}

.card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 30px;
}

.user-main {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
}

.user-avatar {
  font-size: 3rem;
  color: #fdbb2d;
}

.user-details .username {
  font-size: 1.3rem;
  color: #fdbb2d;
  margin-bottom: 5px;
}

.user-title {
  color: #bdc3c7;
  font-size: 0.9rem;
}

.user-stats {
  display: flex;
  gap: 30px;
  flex: 2;
  justify-content: center;
}

.user-stat {
  text-align: center;
}

.user-stat .stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #fdbb2d;
  margin-bottom: 5px;
}

.user-stat .stat-label {
  color: #bdc3c7;
  font-size: 0.8rem;
}

.user-path {
  flex: 2;
  text-align: center;
  color: #bdc3c7;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 0.9rem;
}

.stats-panel {
  background: linear-gradient(135deg, rgba(21, 38, 66, 0.8), rgba(42, 74, 122, 0.6));
  border-radius: 15px;
  padding: 25px;
  border: 1px solid #2a4a7a;
  margin-top: 40px;
}

.stats-panel h3 {
  color: #fdbb2d;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: rgba(21, 38, 66, 0.6);
  border-radius: 10px;
  border: 1px solid #2a4a7a;
}

.stat-icon {
  font-size: 2rem;
  color: #fdbb2d;
}

.stat-content .stat-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #fdbb2d;
  margin-bottom: 5px;
}

.stat-content .stat-label {
  color: #bdc3c7;
  font-size: 0.9rem;
}

.challenge-distribution h4 {
  color: #fdbb2d;
  margin-bottom: 15px;
}

.distribution-chart {
  display: flex;
  height: 40px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #2a4a7a;
}

.distribution-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.distribution-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.8;
}

.distribution-bar.type-riddle { background: #e74c3c; }
.distribution-bar.type-poem { background: #9b59b6; }
.distribution-bar.type-culture { background: #f39c12; }
.distribution-bar.type-judgment { background: #d35400; }
.distribution-bar.type-trivia { background: #1abc9c; }

.distribution-label {
  position: relative;
  color: white;
  font-size: 0.8rem;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
  z-index: 1;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .leaderboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
  
  .header-stats {
    width: 100%;
    justify-content: space-around;
  }
  
  .podium {
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 30px 20px;
    min-height: auto;
  }
  
  .podium-item {
    width: 100%;
    max-width: 400px;
    height: auto !important;
    transform: none !important;
    min-height: 200px;
  }
  
  .card-content {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .user-stats {
    width: 100%;
    justify-content: space-around;
  }
}

@media (max-width: 768px) {
  .leaderboard-page {
    padding: 10px;
  }
  
  .leaderboard-filters {
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 30px;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  
  .filter-buttons {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .search-box {
    min-width: auto;
  }
  
  .podium {
    padding: 20px 15px;
    gap: 15px;
  }
  
  .podium-item {
    padding: 20px 15px;
    min-width: auto;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .distribution-label {
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .podium {
    padding: 15px 10px;
  }
  
  .podium-item {
    padding: 15px 10px;
  }
  
  .leaderboard-table th,
  .leaderboard-table td {
    padding: 10px 8px;
    font-size: 0.8rem;
  }
  
  .player-info {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
  
  .user-stats {
    flex-direction: column;
    gap: 15px;
  }
  
  .card-content {
    gap: 15px;
  }
}
</style>