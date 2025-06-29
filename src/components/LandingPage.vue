<template>
  <div class="landing-page">
    <header>
      <h1>Git Learning Platform</h1>
      <p class="subtitle">Master Git through interactive challenges</p>
    </header>

    <DifficultyFilter v-model="selectedDifficulty" />

    <div class="challenge-grid">
      <div 
        v-for="challenge in filteredChallenges" 
        :key="challenge.id"
        class="challenge-card"
        :class="{
          'completed': isCompleted(challenge.id)
        }"
        @click="selectChallenge(challenge)"
      >
        <div class="card-content">
          <div class="card-header">
            <DifficultyBadge :difficulty="challenge.difficulty" />
          </div>
          <h3>{{ challenge.title }}</h3>
          <p>{{ challenge.description }}</p>
          <div class="card-footer">
            <span v-if="isCompleted(challenge.id)" class="completion-status">
              ✓ Completed
            </span>
            <button v-else class="start-button">Start Challenge</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { gitChallenges } from '../challenges/git-challenges'
import type { GitChallenge } from '../challenges/git-challenges'
import DifficultyFilter from './DifficultyFilter.vue'
import DifficultyBadge from './DifficultyBadge.vue'

const emit = defineEmits(['select-challenge'])

// Load progress from localStorage
const completedChallenges = ref<number[]>(
  JSON.parse(localStorage.getItem('completedChallenges') || '[]')
)

const selectedDifficulty = ref<string | null>(null)

const filteredChallenges = computed(() => {
  if (!selectedDifficulty.value) return gitChallenges
  return gitChallenges.filter(challenge => 
    challenge.difficulty.toLowerCase() === selectedDifficulty.value?.toLowerCase()
  )
})

function isCompleted(challengeId: number): boolean {
  return completedChallenges.value.includes(challengeId)
}

function selectChallenge(challenge: GitChallenge) {
  emit('select-challenge', challenge)
}
</script>

<style scoped>
.landing-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

header {
  text-align: center;
  margin-bottom: 3rem;
}

.subtitle {
  color: var(--color-subtitle);
  font-size: 1.2rem;
  transition: color 0.3s ease;
}

.challenge-grid {
  display: grid;
  grid-template-columns: repeat(3, 320px);
  gap: 2rem;
  padding: 1rem;
  justify-content: start;
  align-content: start;
}

.challenge-card {
  background-color: var(--color-card-bg);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px var(--color-card-shadow);
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
  outline: none;
  color: var(--color-card-text);
  width: 320px;
  max-width: 320px;
  height: 280px;
}

.challenge-card:focus {
  outline: none;
}

.challenge-card:hover:not(.locked) {
  transform: translateY(-4px);
  box-shadow: 0 4px 8px var(--color-card-hover-shadow);
}

.card-content {
  padding: 1.5rem;
  transition: background-color 0.3s ease;
  border-radius: 8px;
  color: var(--color-card-text);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 0.5rem;
}

.card-content h3 {
  color: var(--color-card-text);
  margin: 1rem 0 0.5rem 0;
}

.card-content p {
  color: var(--color-card-desc);
  margin: 0.5rem 0 1rem 0;
  flex-grow: 1;
}

/* Challenge completion states */
.challenge-card.completed {
  border: 2px solid var(--color-success);
}

.challenge-card.locked {
  opacity: 0.7;
  cursor: not-allowed;
}

.completion-status {
  font-weight: 500;
  color: var(--color-success);
}

.card-footer {
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
}

.start-button {
  background: var(--color-success);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.start-button:hover {
  background: var(--color-success-hover);
}

/* Responsive design for challenge grid */
@media (max-width: 1200px) {
  .challenge-grid {
    grid-template-columns: repeat(2, 320px);
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .challenge-grid {
    grid-template-columns: 320px;
    justify-content: center;
    gap: 1.5rem;
    padding: 0.5rem;
  }
}

@media (max-width: 360px) {
  .challenge-grid {
    grid-template-columns: 1fr;
    padding: 0.5rem;
  }
  
  .challenge-card {
    width: 100%;
    max-width: 100%;
    min-width: 280px;
  }
}
</style>
