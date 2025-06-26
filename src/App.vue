<script setup lang="ts">
import { ref, onMounted } from 'vue'
import LandingPage from './components/LandingPage.vue'
import GitLearner from './components/GitLearner.vue'
import type { GitChallenge } from './challenges/git-challenges'

const selectedChallenge = ref<GitChallenge | null>(null)
const isDarkMode = ref(true) // Default to dark mode

onMounted(() => {
  // Load dark mode preference from localStorage, default to true (dark mode) if not set
  const savedTheme = localStorage.getItem('darkMode')
  if (savedTheme !== null) {
    isDarkMode.value = JSON.parse(savedTheme)
  } else {
    // Set default dark mode and save it to localStorage
    isDarkMode.value = true
    localStorage.setItem('darkMode', JSON.stringify(true))
  }
  updateTheme()
})

function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value
  localStorage.setItem('darkMode', JSON.stringify(isDarkMode.value))
  updateTheme()
}

function updateTheme() {
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark', 'theme-dark')
    document.body.classList.add('dark', 'theme-dark')
  } else {
    document.documentElement.classList.remove('dark', 'theme-dark')
    document.body.classList.remove('dark', 'theme-dark')
  }
}

function startChallenge(challenge: GitChallenge) {
  selectedChallenge.value = challenge
}

function goToLanding() {
  selectedChallenge.value = null
}

function onChallengeCompleted(challengeId: number) {
  // Save progress to localStorage
  const completed = JSON.parse(localStorage.getItem('completedChallenges') || '[]')
  if (!completed.includes(challengeId)) {
    completed.push(challengeId)
    localStorage.setItem('completedChallenges', JSON.stringify(completed))
  }
}
</script>

<template>
  <div class="app" :class="{ 'dark': isDarkMode }">
    <!-- Dark Mode Toggle -->
    <div class="theme-toggle">
      <span class="theme-label">☀️</span>
      <label class="toggle-switch">
        <input 
          type="checkbox" 
          :checked="isDarkMode" 
          @change="toggleDarkMode"
        >
        <span class="slider"></span>
      </label>
      <span class="theme-label">🌙</span>
    </div>

    <nav v-if="selectedChallenge" class="navigation">
      <button class="back-button" @click="goToLanding">
        ← Back to Challenges
      </button>
    </nav>
    <main>
      <LandingPage 
        v-if="!selectedChallenge"
        @select-challenge="startChallenge"
      />
      <GitLearner
        v-else
        :key="selectedChallenge.id"
        :initial-challenge="selectedChallenge"
        @challenge-completed="onChallengeCompleted"
        @exit="goToLanding"
      />
    </main>
  </div>
</template>

<style scoped>
/* App-level CSS variables */
.app {
  /* Light theme colors */
  --app-bg: #f5f7fa;
  --app-text: inherit;
  --nav-bg: white;
  --nav-shadow: rgba(0, 0, 0, 0.1);
  --theme-toggle-bg: rgba(255, 255, 255, 0.9);
  --back-button-color: #2196F3;
  --back-button-hover-bg: #e3f2fd;
  --toggle-bg: #ccc;
  --toggle-active: #2196F3;
  
  width: 100%;
  min-height: 100vh;
  height: 100vh;
  background-color: var(--app-bg);
  color: var(--app-text);
  transition: background-color 0.3s ease;
  border: none;
  outline: none;
  margin: 0;
  padding: 0;
}

/* Dark theme variable overrides */
.app.dark {
  --app-bg: #1a1a1a;
  --app-text: #e4e4e7;
  --nav-bg: #262626;
  --nav-shadow: rgba(0, 0, 0, 0.3);
  --theme-toggle-bg: rgba(26, 26, 26, 0.9);
  --back-button-hover-bg: #1e40af;
}

/* Theme Toggle */
.theme-toggle {
  position: fixed;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 1000;
  background: var(--theme-toggle-bg);
  color: var(--app-text);
  padding: 0.5rem 1rem;
  border-radius: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.theme-label {
  font-size: 1.2rem;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--toggle-bg);
  transition: 0.3s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--toggle-active);
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.navigation {
  padding: 1rem 2rem;
  background: var(--nav-bg);
  box-shadow: 0 1px 2px var(--nav-shadow);
  transition: background-color 0.3s ease;
}

.back-button {
  background: none;
  border: none;
  color: var(--back-button-color);
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.back-button:hover {
  background: var(--back-button-hover-bg);
  color: white;
}

main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* Clean focus state management */
.app .focus-clean,
.app .focus-clean:focus,
.app .focus-clean:focus-visible {
  outline: none;
  box-shadow: none;
  border-color: transparent;
}

/* Apply clean focus to all interactive elements by default */
.app *:focus,
.app *:focus-visible {
  outline: none;
  box-shadow: none;
}

/* Specific input focus handling */
.app input:focus {
  border-color: transparent;
  box-shadow: none;
}
</style>
