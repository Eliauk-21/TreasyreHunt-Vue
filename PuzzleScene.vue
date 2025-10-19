<template>
  <div>
    <button class="back-button" @click="returnToMap">
      <i class="fas fa-arrow-left"></i> 返回地图
    </button>
    
    <div :class="['scene-background', location + '-bg']"></div>
    
    <div class="enhanced-scene-content">
      <!-- 场景标题和进度 -->
      <div class="scene-header">
        <h2>{{ locationNames[location] }}</h2>
        <div class="scene-progress">
          <div class="progress-info">
            题目进度: {{ questionsAnswered + 1 }}/{{ totalQuestions }}
          </div>
          <div class="progress-bar small">
            <div class="progress" :style="{ width: progressPercentage + '%' }"></div>
          </div>
        </div>
      </div>
      
      <!-- 题目类型标识 -->
      <div class="question-type-indicator">
        <span :class="['question-type', typeClass]">
          <i :class="getQuestionTypeIcon(puzzle.type)"></i> {{ questionTypeText }}
        </span>
      </div>
      
      <div class="puzzle-container">
        <!-- 地点完成提示 -->
        <div v-if="isLocationCompleted" class="completion-message">
          <div class="completion-icon">
            <i class="fas fa-trophy"></i>
          </div>
          <h3>恭喜！你完成了{{ locationNames[location] }}！</h3>
          <p>你已经成功通过了这个地点的所有挑战</p>
          <button class="action-button" @click="returnToMap">
            <i class="fas fa-map"></i> 返回地图继续冒险
          </button>
        </div>

        <!-- 答题反馈 -->
        <div v-else-if="showFeedback" class="answer-feedback" :class="feedbackClass">
          <div class="feedback-icon">
            <i :class="feedbackIcon"></i>
          </div>
          <div class="feedback-title">{{ feedbackTitle }}</div>
          <div class="feedback-explanation" v-if="puzzle.explanation">
            {{ puzzle.explanation }}
          </div>
          
          <div class="feedback-actions">
            <button v-if="isCorrect && hasMoreQuestions" class="action-button" @click="nextQuestion">
              下一题
            </button>
            <button v-else-if="isCorrect" class="action-button" @click="completeLocation">
              完成地点
            </button>
            <button v-else class="action-button" @click="retryQuestion">
              再试一次
            </button>
          </div>
        </div>

        <!-- 题目内容 -->
        <div v-else>
          <!-- 谜语题目 -->
          <div v-if="puzzle.type === 'riddle'" class="puzzle-question riddle-question">
            <div class="question-icon"><i class="fas fa-question-circle"></i></div>
            <div class="question-text">{{ puzzle.question }}</div>
          </div>
          
          <!-- 古诗题目 -->
          <div v-else-if="puzzle.type === 'poem'" class="poem-question">
            <div class="poem-title"><i class="fas fa-feather-alt"></i> 古诗填空</div>
            <div class="poem-content">
              <div class="poem-line" v-for="(line, index) in getPoemLines()" :key="index">
                {{ line }}
              </div>
            </div>
            <div class="poem-author" v-if="puzzle.author">
              —— {{ puzzle.author }}
            </div>
          </div>
          
          <!-- 判断正误题目 -->
          <div v-else-if="puzzle.type === 'judgment'" class="judgment-question">
            <div class="question-icon"><i class="fas fa-balance-scale"></i></div>
            <div class="question-text">{{ puzzle.question }}</div>
          </div>
          
          <!-- 文化常识题目 -->
          <div v-else-if="puzzle.type === 'culture'" class="culture-question">
            <div class="question-icon"><i class="fas fa-landmark"></i></div>
            <div class="question-text">{{ puzzle.question }}</div>
            <div v-if="puzzle.fact" class="culture-fact">
              <i class="fas fa-lightbulb"></i> {{ puzzle.fact }}
            </div>
          </div>
          
          <!-- 常识题目 -->
          <div v-else class="puzzle-question">
            <div class="question-icon"><i class="fas fa-brain"></i></div>
            <div class="question-text">{{ puzzle.question }}</div>
          </div>
          
          <!-- 选项区域 -->
          <div v-if="puzzle.type !== 'judgment'" class="puzzle-options">
            <div 
              v-for="(option, index) in puzzle.options"
              :key="index"
              class="puzzle-option"
              @click="selectOption(index)"
            >
              <span class="option-number">{{ String.fromCharCode(65 + index) }}</span>
              <span class="option-text">{{ option }}</span>
            </div>
          </div>
          
          <!-- 判断正误选项 -->
          <div v-else class="judgment-options">
            <div 
              class="judgment-option true"
              @click="selectOption(0)"
            >
              <i class="fas fa-check"></i> 
              <span>正确</span>
            </div>
            <div 
              class="judgment-option false"
              @click="selectOption(1)"
            >
              <i class="fas fa-times"></i> 
              <span>错误</span>
            </div>
          </div>
          
          <!-- 提示和说明 -->
          <div class="puzzle-actions">
            <button class="action-button secondary" @click="showHint">
              <i class="fas fa-lightbulb"></i> 获取提示
            </button>
            <button class="action-button secondary" @click="showExplanation" v-if="puzzle.explanation">
              <i class="fas fa-info-circle"></i> 查看解析
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PuzzleScene',
  props: {
    location: String,
    puzzle: Object,
    questionsAnswered: Number
  },
  emits: ['answer-selected', 'return-to-map', 'complete-location'],
  data() {
    return {
      showFeedback: false,
      isCorrect: false,
      selectedAnswer: null,
      isLocationCompleted: false,
      locationNames: {
        library: "古老图书馆",
        temple: "神秘神庙",
        cave: "黑暗洞穴",
        mountain: "危险山脉",
        ruins: "古代遗迹",
        treasure: "宝藏密室"
      },
      questionTypes: {
        riddle: { text: '智慧谜语', class: 'type-riddle', icon: 'fas fa-question-circle' },
        poem: { text: '古诗鉴赏', class: 'type-poem', icon: 'fas fa-feather-alt' },
        culture: { text: '文化常识', class: 'type-culture', icon: 'fas fa-landmark' },
        judgment: { text: '判断正误', class: 'type-judgment', icon: 'fas fa-balance-scale' },
        trivia: { text: '知识问答', class: 'type-trivia', icon: 'fas fa-brain' }
      },
      // 每个地点的题目数量
      locationQuestionCounts: {
        library: 2,
        temple: 2,
        cave: 2,
        mountain: 2,
        ruins: 2,
        treasure: 2
      }
    }
  },
  computed: {
    questionTypeText() {
      return this.questionTypes[this.puzzle.type]?.text || '未知类型'
    },
    typeClass() {
      return this.questionTypes[this.puzzle.type]?.class || ''
    },
    feedbackClass() {
      return this.isCorrect ? 'feedback-correct' : 'feedback-incorrect'
    },
    feedbackIcon() {
      return this.isCorrect ? 'fas fa-check-circle' : 'fas fa-times-circle'
    },
    feedbackTitle() {
      return this.isCorrect ? '回答正确！' : '回答错误'
    },
    totalQuestions() {
      return 1 // 每个地点只需回答1个题目
    },
    progressPercentage() {
      return this.questionsAnswered * 100 // 直接显示完成百分比
    },
    hasMoreQuestions() {
      return false // 每个地点只有1个题目
    }
  },
  methods: {
    selectOption(index) {
      if (this.showFeedback || this.isLocationCompleted) return
      
      this.selectedAnswer = index
      this.isCorrect = index === this.puzzle.answer
      this.showFeedback = true
      
      // 发送答案选择事件
      this.$emit('answer-selected', index)
    },
    
    nextQuestion() {
      this.showFeedback = false
      this.selectedAnswer = null
      // 父组件会提供新的题目
    },
    
    retryQuestion() {
      this.showFeedback = false
      this.selectedAnswer = null
    },
    
    completeLocation() {
      this.isLocationCompleted = true
      this.$emit('complete-location')
    },
    
    returnToMap() {
      this.$emit('return-to-map')
    },
    
    showHint() {
      const hints = {
        riddle: "仔细思考每个选项的象征意义，谜语往往有深层的含义...",
        poem: "回忆经典古诗的完整内容，注意诗句的韵律和意境...",
        culture: "考虑相关的历史文化背景，中国的传统文化源远流长...",
        judgment: "分析陈述的历史准确性，注意细节和常识...",
        trivia: "运用你的常识知识，结合生活经验和学习积累..."
      }
      alert(hints[this.puzzle.type] || "仔细思考，答案就在眼前！")
    },
    
    showExplanation() {
      if (this.puzzle.explanation) {
        alert(`题目解析：\n\n${this.puzzle.explanation}`)
      }
    },
    
    getPoemLines() {
      if (this.puzzle.type === 'poem') {
        return this.puzzle.question.split('，').join('，\n').split('。').join('。\n').split('\n')
      }
      return []
    },
    
    getQuestionTypeIcon(type) {
      return this.questionTypes[type]?.icon || 'fas fa-question'
    }
  }
}
</script>

<style scoped>
.scene-progress {
  margin-top: 15px;
  text-align: center;
}

.progress-info {
  color: #bdc3c7;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.progress-bar.small {
  height: 6px;
  background: #1e3a5f;
  border-radius: 3px;
  overflow: hidden;
  max-width: 200px;
  margin: 0 auto;
}

.completion-message {
  text-align: center;
  padding: 40px 20px;
}

.completion-icon {
  font-size: 4rem;
  color: #f1c40f;
  margin-bottom: 20px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.completion-message h3 {
  color: #fdbb2d;
  margin-bottom: 15px;
  font-size: 1.8rem;
}

.completion-message p {
  color: #bdc3c7;
  margin-bottom: 30px;
  font-size: 1.1rem;
}

.feedback-actions {
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .scene-progress {
    margin-top: 10px;
  }
  
  .completion-message {
    padding: 20px 10px;
  }
  
  .completion-icon {
    font-size: 3rem;
  }
  
  .completion-message h3 {
    font-size: 1.5rem;
  }
}
</style>