<template>
  <div class="container">
    <!-- 音频控制器 -->
    <AudioController 
      :current-track="currentTrack"
      :is-playing="isMusicPlaying"
      :muted="muted"
      :volume="volume"
      @toggle-play="toggleMusic"
      @toggle-mute="toggleMute"
      @volume-change="updateVolume"
    />

    <!-- 消息系统 -->
    <MessageSystem :messages="messages" @remove-message="removeMessage" />

    <GameHeader 
      :currentUser="currentUser"
      :muted="muted"
      @toggle-mute="toggleMute"
      @save-game="saveGame"
      @reset-game="resetGame"
      @logout="logout"
    />
    
    <div class="game-nav">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        :class="['nav-button', { active: currentTab === tab.id }]"
        @click="switchTab(tab.id)"
      >
        <i :class="tab.icon"></i> {{ tab.name }}
      </button>
    </div>
    
    <!-- 冒险地图 -->
    <div v-if="currentTab === 'map'">
      <!-- 冒险路径显示 -->
      <div v-if="adventurePath.length > 0" class="adventure-path">
        <h3><i class="fas fa-route"></i> 我的冒险路径</h3>
        <div class="path-steps">
          <div v-for="(step, index) in adventurePath" :key="index" class="path-step">
            <div :class="['step-location', { completed: step.completed }]">
              {{ locationNames[step.location] }}
              <span v-if="step.completed" class="completed-badge">✓</span>
            </div>
            <span v-if="index < adventurePath.length - 1" class="step-connector">→</span>
          </div>
        </div>
      </div>

      <GameMap 
        :completedLocations="gameData.completedLocations"
        :score="gameData.score"
        :wisdom="gameData.wisdom"
        :visitedLocations="visitedLocations"
        @start-location="startLocation"
      />
    </div>
    
    <!-- 谜题场景 -->
    <div v-else-if="currentTab === 'puzzle' && currentLocation">
      <PuzzleScene 
        :location="currentLocation"
        :puzzle="currentPuzzle"
        :questions-answered="getQuestionsAnswered(currentLocation)"
        @answer-selected="checkAnswer"
        @return-to-map="returnToMap"
        @complete-location="completeLocation"
      />
    </div>
    
    <!-- 个人资料 -->
    <div v-else-if="currentTab === 'profile'">
      <UserProfile 
        :currentUser="currentUser"
        :gameStats="gameData.gameStats"
        :adventurePath="adventurePath"
        @update-profile="updateProfile"
        @login="login"
      />
    </div>
    
    <!-- 排行榜 -->
    <div v-else-if="currentTab === 'leaderboard'">
      <Leaderboard :users="leaderboard" />
    </div>
  </div>
</template>

<script>
import GameHeader from './components/GameHeader.vue'
import GameMap from './components/GameMap.vue'
import PuzzleScene from './components/PuzzleScene.vue'
import UserProfile from './components/UserProfile.vue'
import Leaderboard from './components/Leaderboard.vue'
import AudioController from './components/AudioController.vue'
import MessageSystem from './components/MessageSystem.vue'

export default {
  name: 'App',
  components: {
    GameHeader,
    GameMap,
    PuzzleScene,
    UserProfile,
    Leaderboard,
    AudioController,
    MessageSystem
  },
  data() {
    return {
      currentTab: 'map',
      currentUser: null,
      currentLocation: null,
      currentPuzzle: null,
      muted: false, // 只控制背景音乐
      volume: 0.5,
      isMusicPlaying: false,
      currentAudio: null,
      currentTrack: '背景音乐',
      messages: [],
      gameData: {
        score: 0,
        wisdom: 70,
        completedLocations: [],
        gameStats: {
          puzzlesSolved: 0,
          locationsCompleted: 0,
          timePlayed: 0,
          hintsUsed: 0,
          totalLocationsVisited: 0
        },
        // 简化：每个地点只需回答1个题目
        locationProgress: {
          library: { completed: false },
          temple: { completed: false },
          cave: { completed: false },
          mountain: { completed: false },
          ruins: { completed: false },
          treasure: { completed: false }
        }
      },
      visitedLocations: new Set(),
      adventurePath: [],
      leaderboard: [],
      tabs: [
        { id: 'map', name: '冒险地图', icon: 'fas fa-map' },
        { id: 'profile', name: '个人资料', icon: 'fas fa-user' },
        { id: 'leaderboard', name: '排行榜', icon: 'fas fa-trophy' }
      ],
      locationNames: {
        library: "古老图书馆",
        temple: "神秘神庙",
        cave: "黑暗洞穴",
        mountain: "危险山脉",
        ruins: "古代遗迹",
        treasure: "宝藏密室"
      },
      locationMusic: {
        library: { name: '图书馆氛围音乐', file: '/audio/library.mp3' },
        temple: { name: '神庙神秘音乐', file: '/audio/temple.mp3' },
        cave: { name: '洞穴探险音乐', file: '/audio/cave.mp3' },
        mountain: { name: '山脉壮丽音乐', file: '/audio/mountain.mp3' },
        ruins: { name: '遗迹古老音乐', file: '/audio/ruins.mp3' },
        treasure: { name: '宝藏辉煌音乐', file: '/audio/treasure.mp3' }
      },
      backgroundAudio: null, // 单独的背景音乐实例
      sceneAudio: null // 单独的场景音乐实例
    }
  },
  methods: {
    // 标签切换
    switchTab(tabId) {
      this.currentTab = tabId
      
      // 根据标签切换音乐
      if (tabId === 'map') {
        this.playBackgroundMusic()
      } else if (tabId === 'puzzle' && this.currentLocation) {
        this.playLocationMusic(this.currentLocation)
      } else {
        this.playBackgroundMusic()
      }
    },

    startLocation(location) {
      this.currentLocation = location
      this.currentPuzzle = this.getRandomPuzzle(location)
      this.currentTab = 'puzzle'
      
      // 记录访问
      this.visitedLocations.add(location)
      this.gameData.gameStats.totalLocationsVisited = this.visitedLocations.size
      
      // 添加到冒险路径（如果不在路径中）
      if (!this.adventurePath.some(step => step.location === location)) {
        this.adventurePath.push({
          location: location,
          completed: false,
          timestamp: new Date().toLocaleTimeString()
        })
      }
      
      // 停止背景音乐，播放场景音乐
      this.stopBackgroundMusic()
      this.playLocationMusic(location)
      
      this.showMessage('info', '冒险开始！', `你进入了${this.locationNames[location]}，准备好接受挑战了吗？`)
    },
    
    returnToMap() {
      this.currentTab = 'map'
      this.currentLocation = null
      this.currentPuzzle = null
      this.stopLocationMusic()
      this.playBackgroundMusic()
    },
    
    checkAnswer(selectedIndex) {
      const isCorrect = selectedIndex === this.currentPuzzle.answer
      
      if (isCorrect) {
        this.handleCorrectAnswer()
      } else {
        this.handleIncorrectAnswer()
      }
    },
    
    handleCorrectAnswer() {
      this.gameData.score += 100
      this.gameData.wisdom += 5
      this.gameData.gameStats.puzzlesSolved++
      
      // 如果是宝藏密室，播放特殊音效
      if (this.currentLocation === 'treasure') {
        this.playTreasureSound()
      } else {
        this.playSuccessSound()
      }
      
      this.saveGame()
      
      this.showMessage('success', '回答正确！', 
        `获得 100 积分！智慧 +5\n${this.currentPuzzle.explanation || ''}`)
    },

    completeLocation() {
      if (this.currentLocation && !this.gameData.completedLocations.includes(this.currentLocation)) {
        this.gameData.completedLocations.push(this.currentLocation)
        this.gameData.gameStats.locationsCompleted++
        this.gameData.locationProgress[this.currentLocation].completed = true
        
        // 更新冒险路径完成状态
        const pathStep = this.adventurePath.find(step => step.location === this.currentLocation)
        if (pathStep) {
          pathStep.completed = true
        }
        
        this.saveGame()
        
        // 特殊提示：当完成第五个地点时
        if (this.gameData.completedLocations.length === 5) {
          this.showMessage('success', '里程碑达成！', 
            '恭喜！你已经完成了所有前五个地点，宝藏密室现在对你开放了！')
        }
        
        // 检查是否有新解锁的地点
        this.checkNewUnlocks()
        
        this.showMessage('success', '地点完成！', 
          `恭喜你完成了${this.locationNames[this.currentLocation]}的挑战！`)
      }
    },
    
    handleIncorrectAnswer() {
      this.gameData.wisdom -= 10
      if (this.gameData.wisdom < 0) this.gameData.wisdom = 0
      
      this.playErrorSound()
      
      this.showMessage('error', '回答错误', 
        `智慧 -10\n正确答案是：${this.currentPuzzle.options[this.currentPuzzle.answer]}\n${this.currentPuzzle.explanation || ''}`)
      
      this.saveGame()
    },
    
    checkNewUnlocks() {
      // 检查宝藏密室是否新解锁
      if (this.gameData.completedLocations.length >= 5 && 
          !this.visitedLocations.has('treasure') &&
          !this.gameData.completedLocations.includes('treasure')) {
        this.showMessage('success', '宝藏密室解锁！', 
          '恭喜！你已经完成了所有前五个地点，现在可以进入宝藏密室寻找最终的宝藏了！')
      }
      
      const newlyUnlocked = Object.keys(this.locationNames).filter(location => 
        this.isLocationUnlocked(location) && 
        !this.visitedLocations.has(location) &&
        !this.gameData.completedLocations.includes(location)
      )
      
      if (newlyUnlocked.length > 0) {
        newlyUnlocked.forEach(location => {
          if (location !== 'treasure') { // 宝藏密室的提示已经单独处理
            this.showMessage('warning', '新地点解锁！', 
              `${this.locationNames[location]} 现在可以探索了！`)
          }
        })
      }
    },
    
    isLocationUnlocked(locationId) {
      const unlockConditions = {
        library: () => true, // 图书馆直接解锁
        temple: () => true, // 神庙直接解锁
        cave: () => true, // 洞穴直接解锁
        mountain: () => true, // 山脉直接解锁
        ruins: () => true, // 遗迹直接解锁
        treasure: () => this.gameData.completedLocations.length >= 5 // 宝藏密室需要完成所有前五个地点
      }
      
      return unlockConditions[locationId] ? unlockConditions[locationId]() : false
    },
    
    getRandomPuzzle(location) {
      const puzzles = {
        library: [
          {
            type: 'riddle',
            question: "我说话但没有嘴，我流动但没有水，我奔跑但没有腿。我是什么？",
            options: ["时间", "河流", "风", "思想"],
            answer: 2,
            explanation: "风虽然无形，但能发出声音，能够流动，能够快速移动。"
          },
          {
            type: 'poem',
            question: "补全古诗：床前明月光，__________",
            options: ["疑是地上霜", "举头望明月", "低头思故乡", "明月几时有"],
            answer: 0,
            explanation: "出自李白《静夜思》：床前明月光，疑是地上霜。举头望明月，低头思故乡。"
          },
          {
            type: 'riddle', 
            question: "什么东西越洗越脏？",
            options: ["水", "衣服", "思想", "空气"],
            answer: 0,
            explanation: "水在清洗其他物品时会变脏。"
          }
        ],
        temple: [
          {
            type: 'judgment',
            question: "判断正误：长城是在秦朝时期一次性修建完成的。",
            options: ["正确", "错误"],
            answer: 1,
            explanation: "错误。长城是在多个朝代陆续修建的，秦朝只是连接了各国的长城。"
          },
          {
            type: 'culture',
            question: "中国的四大发明不包括以下哪一项？",
            options: ["造纸术", "指南针", "印刷术", "瓷器"],
            answer: 3,
            explanation: "四大发明是造纸术、指南针、火药、印刷术。瓷器虽然重要，但不属于四大发明。"
          }
        ],
        cave: [
          {
            type: 'trivia',
            question: "世界上使用人数最多的语言是？",
            options: ["英语", "汉语", "西班牙语", "印地语"],
            answer: 1,
            explanation: "汉语是世界上使用人数最多的语言，其次是英语和西班牙语。"
          },
          {
            type: 'poem',
            question: "补全古诗：__________，春风不度玉门关。",
            options: ["黄河远上白云间", "羌笛何须怨杨柳", "白日依山尽", "葡萄美酒夜光杯"],
            answer: 1,
            explanation: "出自王之涣《凉州词》：羌笛何须怨杨柳，春风不度玉门关。"
          }
        ],
        mountain: [
          {
            type: 'judgment',
            question: "判断正误：珠穆朗玛峰是世界上海拔最高的山峰。",
            options: ["正确", "错误"],
            answer: 0,
            explanation: "正确。珠穆朗玛峰海拔8848.86米，是世界最高峰。"
          },
          {
            type: 'culture',
            question: "中国传统节日端午节是为了纪念谁？",
            options: ["屈原", "孔子", "李白", "秦始皇"],
            answer: 0,
            explanation: "端午节是为了纪念爱国诗人屈原。"
          }
        ],
        ruins: [
          {
            type: 'riddle',
            question: "什么东西有头有尾，但没有身体？",
            options: ["硬币", "蛇", "故事", "河流"],
            answer: 0,
            explanation: "硬币有正反面（头尾），但没有真正的身体。"
          },
          {
            type: 'trivia',
            question: "中国的首都是？",
            options: ["上海", "广州", "北京", "深圳"],
            answer: 2,
            explanation: "北京是中国的首都。"
          }
        ],
        treasure: [
          {
            type: 'culture',
            question: "以下哪部不是中国四大名著？",
            options: ["《红楼梦》", "《西游记》", "《水浒传》", "《金瓶梅》"],
            answer: 3,
            explanation: "四大名著是《红楼梦》、《西游记》、《水浒传》、《三国演义》。"
          },
          {
            type: 'riddle',
            question: "什么东西打破了才能用？",
            options: ["鸡蛋", "记录", "沉默", "规则"],
            answer: 0,
            explanation: "鸡蛋需要打破才能使用。"
          }
        ]
      }
      
      const locationPuzzles = puzzles[location] || puzzles.library
      // 随机选择一个题目
      const randomIndex = Math.floor(Math.random() * locationPuzzles.length)
      return locationPuzzles[randomIndex]
    },

    getQuestionsAnswered(location) {
      return this.gameData.locationProgress[location]?.completed ? 1 : 0
    },
    
    // 音频控制方法
    async playBackgroundMusic() {
      // 停止场景音乐
      this.stopLocationMusic()
      
      // 如果背景音乐已经在播放，只需调整静音状态
      if (this.backgroundAudio) {
        this.backgroundAudio.muted = this.muted
        this.currentAudio = this.backgroundAudio
        this.isMusicPlaying = !this.backgroundAudio.paused
        this.currentTrack = '背景音乐'
        if (this.backgroundAudio.paused) {
          await this.backgroundAudio.play()
        }
        return
      }
      
      try {
        this.backgroundAudio = new Audio('/audio/background.mp3')
        this.backgroundAudio.loop = true
        this.backgroundAudio.volume = this.volume
        this.backgroundAudio.muted = this.muted // 只在这里应用静音
        await this.backgroundAudio.play()
        this.currentAudio = this.backgroundAudio
        this.isMusicPlaying = true
        this.currentTrack = '背景音乐'
      } catch (error) {
        console.log('背景音乐播放失败:', error)
        this.isMusicPlaying = false
      }
    },
    
    async playLocationMusic(location) {
      // 停止背景音乐
      this.stopBackgroundMusic()
      
      const musicInfo = this.locationMusic[location]
      if (musicInfo) {
        try {
          // 如果场景音乐已经在播放，先停止
          if (this.sceneAudio) {
            this.sceneAudio.pause()
            this.sceneAudio.currentTime = 0
          }
          
          this.sceneAudio = new Audio(musicInfo.file)
          this.sceneAudio.loop = true
          this.sceneAudio.volume = this.volume
          this.sceneAudio.muted = false // 场景音乐不受静音影响
          await this.sceneAudio.play()
          this.currentAudio = this.sceneAudio
          this.isMusicPlaying = true
          this.currentTrack = musicInfo.name
        } catch (error) {
          console.log('场景音乐播放失败:', error)
          // 如果场景音乐播放失败，播放背景音乐
          this.playBackgroundMusic()
        }
      }
    },
    
    stopBackgroundMusic() {
      if (this.backgroundAudio && !this.backgroundAudio.paused) {
        this.backgroundAudio.pause()
      }
    },
    
    stopLocationMusic() {
      if (this.sceneAudio && !this.sceneAudio.paused) {
        this.sceneAudio.pause()
        this.sceneAudio.currentTime = 0
      }
    },
    
    async toggleMusic() {
      if (this.isMusicPlaying) {
        // 停止当前播放的音乐
        if (this.currentAudio) {
          this.currentAudio.pause()
          this.isMusicPlaying = false
        }
      } else {
        // 根据当前标签决定播放什么音乐
        if (this.currentTab === 'puzzle' && this.currentLocation) {
          await this.playLocationMusic(this.currentLocation)
        } else {
          await this.playBackgroundMusic()
        }
      }
    },
    
    toggleMute() {
      this.muted = !this.muted
      console.log('静音状态:', this.muted)
      
      // 只对背景音乐应用静音
      if (this.backgroundAudio) {
        this.backgroundAudio.muted = this.muted
        console.log('背景音乐静音状态:', this.backgroundAudio.muted)
      }
      
      // 如果当前正在播放背景音乐，更新当前音频的静音状态
      if (this.currentAudio === this.backgroundAudio) {
        this.currentAudio.muted = this.muted
      }
      
      // 强制重新播放背景音乐以确保静音状态生效
      if (this.currentTab === 'map' && this.backgroundAudio) {
        this.playBackgroundMusic()
      }
    },
    
    updateVolume(volume) {
      this.volume = volume
      // 更新所有音频的音量
      if (this.backgroundAudio) {
        this.backgroundAudio.volume = volume
      }
      if (this.sceneAudio) {
        this.sceneAudio.volume = volume
      }
      if (this.currentAudio) {
        this.currentAudio.volume = volume
      }
    },
    
    playSuccessSound() {
      try {
        const audio = new Audio('/audio/success.mp3')
        audio.volume = this.volume
        audio.play()
      } catch (error) {
        console.log('成功音效播放失败:', error)
      }
    },

    playTreasureSound() {
      try {
        const audio = new Audio('/audio/treasure.mp3')
        audio.volume = this.volume
        audio.play()
      } catch (error) {
        console.log('宝藏音效播放失败:', error)
      }
    },
    
    playErrorSound() {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime)
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
        
        oscillator.start()
        oscillator.stop(audioContext.currentTime + 0.5)
      } catch (error) {
        console.log('错误音效播放失败:', error)
      }
    },
    
    // 消息系统方法
    showMessage(type, title, content, duration = 5000) {
      const id = Date.now() + Math.random()
      const message = {
        id,
        type,
        title,
        content,
        duration
      }
      
      this.messages.push(message)
      
      // 自动移除消息
      setTimeout(() => {
        this.removeMessage(id)
      }, duration)
    },
    
    removeMessage(id) {
      this.messages = this.messages.filter(msg => msg.id !== id)
    },
    
    saveGame() {
      const saveData = {
        ...this.gameData,
        visitedLocations: Array.from(this.visitedLocations),
        adventurePath: this.adventurePath
      }
      localStorage.setItem('treasureGame', JSON.stringify(saveData))
    },
    
    resetGame() {
      if (confirm('确定要重新开始游戏吗？所有进度都将丢失！')) {
        this.gameData = {
          score: 0,
          wisdom: 70,
          completedLocations: [],
          gameStats: {
            puzzlesSolved: 0,
            locationsCompleted: 0,
            timePlayed: 0,
            hintsUsed: 0,
            totalLocationsVisited: 0
          },
          locationProgress: {
            library: { completed: false },
            temple: { completed: false },
            cave: { completed: false },
            mountain: { completed: false },
            ruins: { completed: false },
            treasure: { completed: false }
          }
        }
        this.visitedLocations.clear()
        this.adventurePath = []
        localStorage.removeItem('treasureGame')
        this.showMessage('info', '游戏重置', '冒险重新开始！')
      }
    },
    
    login(userData) {
      this.currentUser = userData
      this.loadUserGameData()
      this.showMessage('success', '登录成功', `欢迎回来，${userData.username}！`)
    },
    
    logout() {
      this.currentUser = null
      this.currentTab = 'map'
      this.showMessage('info', '已退出登录', '期待再次冒险！')
    },
    
    updateProfile(userData) {
      this.currentUser = { ...this.currentUser, ...userData }
    },
    
    loadUserGameData() {
      const savedData = localStorage.getItem('treasureGame')
      if (savedData) {
        const data = JSON.parse(savedData)
        this.gameData = {
          ...this.gameData,
          ...data,
          // 确保 locationProgress 存在
          locationProgress: data.locationProgress || this.gameData.locationProgress
        }
        this.visitedLocations = new Set(data.visitedLocations || [])
        this.adventurePath = data.adventurePath || []
      }
    },
    
    updateLeaderboard() {
      if (this.currentUser) {
        this.leaderboard = [
          { rank: 1, username: '冒险王', score: 1500, completed: 6, path: '图书馆→神庙→洞穴→山脉→遗迹→宝藏' },
          { rank: 2, username: this.currentUser.username, score: this.gameData.score, completed: this.gameData.completedLocations.length, path: this.getAdventurePathString() },
          { rank: 3, username: '智慧之星', score: 800, completed: 4, path: '图书馆→洞穴→山脉→遗迹' }
        ]
      }
    },
    
    getAdventurePathString() {
      return this.adventurePath.map(step => this.locationNames[step.location]).join(' → ')
    }
  },
  
  async mounted() {
    this.loadUserGameData()
    this.updateLeaderboard()
    
    // 自动播放背景音乐（需要用户交互）
    const enableAudio = () => {
      if (!this.isMusicPlaying && this.currentTab === 'map') {
        this.playBackgroundMusic()
      }
      document.removeEventListener('click', enableAudio)
    }
    document.addEventListener('click', enableAudio)
    
    // 显示欢迎消息
    setTimeout(() => {
      this.showMessage('info', '欢迎来到神秘岛！', 
        '前五个地点可以自由探索！完成所有前五个地点后，宝藏密室将对你开放！')
    }, 1000)
  }
}
</script>