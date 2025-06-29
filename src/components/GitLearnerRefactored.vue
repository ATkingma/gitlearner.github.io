<template>
  <div class="git-learner">
    <!-- Toast notifications -->
    <ToastNotifications :toasts="toasts" />

    <!-- Challenge Header -->
    <ChallengeHeader 
      ref="challengeHeaderRef"
      :challenge="currentChallenge"
      :is-completed="isCompleted"
      :show-hints="showHints"
      @check-solution="checkSolution"
      @toggle-hints="showHints = !showHints"
      @reset-challenge="resetChallenge"
    />

    <!-- Main Layout -->
    <div class="main-layout">
      <!-- Top Row: Repository State -->
      <div class="info-row">
        <RepositoryState :git-repo="gitRepo" />
      </div>

      <!-- Graph Row: Visualization and Commit Details -->
      <div class="graph-row">
        <GitGraph 
          ref="gitGraphRef"
          :git-repo="gitRepo" 
          @select-commit="selectCommit" 
        />
        <CommitDetails :selected-commit="selectedCommit" />
      </div>

      <!-- Terminal Section -->
      <div class="terminal-section">
        <div :class="['terminal-row', { 'full-width': currentChallenge?.difficulty !== 'beginner' }]">
          <Terminal 
            ref="terminalRef"
            :console-logs="consoleLogs"
            @execute-command="executeCommandWithLog"
          />

          <!-- Quick Commands (for beginners, next to terminal) -->
          <QuickCommands
            v-if="currentChallenge?.difficulty === 'beginner'"
            @insert-command="insertCommand"
            @insert-random-commit="insertRandomCommit"
            @insert-random-author-commit="insertRandomAuthorCommit"
          />
        </div>
      </div>

      <!-- Side Panels -->
      <div class="side-panels">
        <HintsPanel 
          :show-hints="showHints" 
          :challenge="currentChallenge" 
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { GitChallenge } from '../challenges/git-challenges'
import type { GitRepo, GitCommit, ConsoleLog, Toast } from '../types/git-types'
import { useGitCommands } from '../composables/useGitCommands'

// Import components
import ChallengeHeader from './ChallengeHeader.vue'
import RepositoryState from './RepositoryState.vue'
import GitGraph from './GitGraph.vue'
import CommitDetails from './CommitDetails.vue'
import Terminal from './Terminal.vue'
import QuickCommands from './QuickCommands.vue'
import HintsPanel from './HintsPanel.vue'
import ToastNotifications from './ToastNotifications.vue'

// Component refs
const challengeHeaderRef = ref<InstanceType<typeof ChallengeHeader> | null>(null)
const gitGraphRef = ref<InstanceType<typeof GitGraph> | null>(null)
const terminalRef = ref<InstanceType<typeof Terminal> | null>(null)

const props = defineProps<{
  initialChallenge: GitChallenge
}>()

const emit = defineEmits(['challenge-completed', 'exit'])

// Reactive state
const currentChallenge = ref<GitChallenge>(props.initialChallenge)
const completedChallenges = ref<number[]>(
  JSON.parse(localStorage.getItem('completedChallenges') || '[]')
)
const showHints = ref(false)
const selectedCommit = ref<GitCommit | null>(null)
const toasts = ref<Toast[]>([])
const consoleLogs = ref<ConsoleLog[]>([])

// Git repository state
const gitRepo = ref<GitRepo>({
  currentBranch: 'main',
  commits: [],
  branches: ['main'],
  staged: []
})

// Use git commands composable
const { gitConfig, executeCommandWithLog: executeGitCommand, generateRandomHash } = useGitCommands()

// Computed property for challenge completion status
const isCompleted = computed(() => 
  completedChallenges.value.includes(currentChallenge.value.id)
)

// Watch for challenge changes
watch(() => props.initialChallenge, (newChallenge: GitChallenge) => {
  if (newChallenge) {
    currentChallenge.value = newChallenge
    initializeRepository()
  }
}, { immediate: true })

function initializeRepository() {
  if (!currentChallenge.value || !currentChallenge.value.initialState) {
    console.error('Invalid challenge data:', currentChallenge.value)
    return
  }

  const initial = currentChallenge.value.initialState
  
  if (!initial.branches || initial.branches.length === 0) {
    console.error('Challenge has no branches defined')
    return
  }

  const defaultBranch = initial.branches[0] || 'main'
  const baseTimestamp = 1640995200000
  
  gitRepo.value = {
    currentBranch: defaultBranch,
    commits: (initial.commits || []).map((commit, index) => ({
      oid: commit.id || generateRandomHash(),
      message: commit.message || 'Empty commit',
      author: gitConfig.value['user.name'] || 'Git Learner',
      timestamp: baseTimestamp + (index * 300000),
      branch: commit.branch || defaultBranch
    })),
    branches: [...initial.branches],
    staged: []
  }
  
  nextTick(() => {
    gitGraphRef.value?.updateSvgDimensions()
  })
}

function executeCommandWithLog(command: string) {
  executeGitCommand(command, gitRepo.value, consoleLogs.value)
  
  // Update graph dimensions after command execution
  nextTick(() => {
    gitGraphRef.value?.updateSvgDimensions()
  })
}

function insertCommand(command: string) {
  terminalRef.value?.insertCommand(command)
}

function insertRandomCommit() {
  const randomHash = generateRandomHash()
  insertCommand(`git commit -m "Feature ${randomHash}"`)
}

function insertRandomAuthorCommit() {
  const randomHash = generateRandomHash()
  insertCommand(`git commit -m "Fix issue" --author="Developer ${randomHash}"`)
}

function selectCommit(commit: GitCommit) {
  selectedCommit.value = commit
}

function resetChallenge() {
  consoleLogs.value = []
  selectedCommit.value = null
  showHints.value = false
  
  initializeRepository()
  
  showToast('Challenge reset! 🔄', 'info')
  
  nextTick(() => {
    if (challengeHeaderRef.value?.challengeHeader) {
      challengeHeaderRef.value.challengeHeader.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    } else {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      })
    }
  })
}

function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  const id = Date.now()
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 3000)
}

function checkSolution() {
  // Check if the current challenge is completed based on repository state
  const target = currentChallenge.value.targetState
  let isComplete = false
  
  // Check if we have the required number of commits
  if (gitRepo.value.commits.length >= target.commits.length) {
    isComplete = true
    
    // Check if we have the required branches
    for (const targetBranch of target.branches) {
      if (!gitRepo.value.branches.includes(targetBranch)) {
        isComplete = false
        break
      }
    }
    
    // Check if we have commits with similar messages
    if (isComplete && target.commits.length > 0) {
      const lastCommit = gitRepo.value.commits[gitRepo.value.commits.length - 1]
      const targetCommit = target.commits[target.commits.length - 1]
      
      // Simple check: if the last commit message contains key words from target
      const targetWords = targetCommit.message.toLowerCase().split(' ')
      const commitWords = lastCommit.message.toLowerCase().split(' ')
      const hasMatchingWords = targetWords.some(word => commitWords.includes(word))
      
      if (!hasMatchingWords && target.commits.length === 1) {
        // For single commit challenges, be more lenient
        isComplete = gitRepo.value.commits.length > 0
      }
    }
  }
  
  if (isComplete && !completedChallenges.value.includes(currentChallenge.value.id)) {
    completedChallenges.value.push(currentChallenge.value.id)
    localStorage.setItem('completedChallenges', JSON.stringify(completedChallenges.value))
    emit('challenge-completed', currentChallenge.value.id)
    showToast('Great work! Challenge completed! 🎉', 'success')
    
    setTimeout(() => {
      emit('exit')
    }, 2000)
  } else if (isComplete) {
    showToast('Challenge already completed! 👍', 'info')
  } else {
    showToast('Not quite there yet. Keep trying! 💪', 'error')
  }
}
</script>

<style scoped>
/* Git Learner Modern Design System */
.git-learner {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  color: #333;
}

/* Main Layout */
.main-layout {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto auto auto;
  gap: 20px;
  min-height: 600px;
}

.info-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.graph-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  min-height: 400px;
}

.terminal-section {
  grid-column: 1 / -1;
}

.terminal-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  min-height: 450px;
}

.terminal-row.full-width {
  grid-template-columns: 1fr;
}

.side-panels {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .main-layout {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .graph-row {
    grid-template-columns: 1fr;
  }
  
  .terminal-row {
    grid-template-columns: 1fr;
  }
  
  .side-panels {
    grid-template-columns: 1fr 1fr;
    gap: 15px;
  }
}

@media (max-width: 768px) {
  .git-learner {
    padding: 10px;
  }
  
  .info-row {
    grid-template-columns: 1fr;
  }
  
  .graph-row {
    grid-template-columns: 1fr;
  }
  
  .terminal-row {
    grid-template-columns: 1fr;
  }
  
  .side-panels {
    grid-template-columns: 1fr;
  }
}
</style>
