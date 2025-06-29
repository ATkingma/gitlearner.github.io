<template>
  <div class="challenge-header" ref="challengeHeader">
    <div class="challenge-info">
      <h1 class="challenge-title">{{ challenge?.title || 'Loading...' }}</h1>
      <div class="challenge-meta">
        <DifficultyBadge v-if="challenge" :difficulty="challenge.difficulty" />
        <div class="meta-badge time">
          ⏱️ 5 min
        </div>
      </div>
      <p class="challenge-description">{{ challenge?.description || 'Loading challenge...' }}</p>
    </div>
    <div class="challenge-actions">
      <button 
        @click="$emit('check-solution')" 
        :class="['action-btn', 'btn', isCompleted ? 'btn-success' : 'btn-primary']" 
        :disabled="isCompleted"
      >
        <span>{{ isCompleted ? '✓' : '🔍' }}</span>
        {{ isCompleted ? 'Completed!' : 'Check Solution' }}
      </button>
      <button @click="$emit('toggle-hints')" class="action-btn btn btn-secondary">
        <span>💡</span>
        {{ showHints ? 'Hide Hints' : 'Show Hints' }}
      </button>
      <button @click="$emit('reset-challenge')" class="action-btn btn btn-reset">
        <span>🔄</span>
        Reset
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { GitChallenge } from '../challenges/git-challenges'
import DifficultyBadge from './DifficultyBadge.vue'

const challengeHeader = ref<HTMLElement | null>(null)

defineProps<{
  challenge: GitChallenge | null
  isCompleted: boolean
  showHints: boolean
}>()

defineEmits<{
  'check-solution': []
  'toggle-hints': []
  'reset-challenge': []
}>()

defineExpose({
  challengeHeader
})
</script>

<style scoped>
/* Challenge Header */
.challenge-header {
  text-align: center;
  margin-bottom: 30px;
  background: var(--color-card-bg);
  color: var(--color-text);
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  backdrop-filter: blur(20px);
}

.challenge-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 15px 0;
  background: var(--color-text);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.challenge-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.meta-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.8);
  color: #666;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.challenge-description {
  font-size: 1.1rem;
  color: #666;
  line-height: 1.6;
  margin: 0 0 20px 0;
}

.challenge-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

/* Button System */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-primary {
  background: #2196F3;
  color: white;
}

.btn-secondary {
  background: #4CAF50;
  color: white;
}

.btn-success {
  background: #22c55e;
  color: white;
}

.btn-reset {
  background: #9E9E9E;
  color: white;
}

.action-btn {
  min-width: 120px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .challenge-actions {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
  }
}
</style>
