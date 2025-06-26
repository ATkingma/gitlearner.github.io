<template>
  <div class="git-learner">
    <!-- Toast notifications -->
    <div class="toasts">
      <div 
        v-for="toast in toasts" 
        :key="toast.id"
        :class="['toast', toast.type]"
      >
        {{ toast.message }}
      </div>
    </div>

    <!-- Challenge Header -->
    <div class="challenge-header" ref="challengeHeader">
      <div class="challenge-info">
        <h1 class="challenge-title">{{ currentChallenge?.title || 'Loading...' }}</h1>
        <div class="challenge-meta">
          <DifficultyBadge v-if="currentChallenge" :difficulty="currentChallenge.difficulty" />
          <div class="meta-badge time">
            ⏱️ 5 min
          </div>
        </div>
        <p class="challenge-description">{{ currentChallenge?.description || 'Loading challenge...' }}</p>
      </div>
      <div class="challenge-actions">
        <button 
          @click="checkSolution" 
          :class="['action-btn', 'btn', isCompleted ? 'btn-success' : 'btn-primary']" 
          :disabled="isCompleted"
        >
          <span>{{ isCompleted ? '✓' : '🔍' }}</span>
          {{ isCompleted ? 'Completed!' : 'Check Solution' }}
        </button>
        <button @click="showHints = !showHints" class="action-btn btn btn-secondary">
          <span>💡</span>
          {{ showHints ? 'Hide Hints' : 'Show Hints' }}
        </button>
        <button @click="resetChallenge" class="action-btn btn btn-reset">
          <span>🔄</span>
          Reset
        </button>
      </div>
    </div>

    <!-- Main Layout -->
    <div class="main-layout">
      <!-- Top Row: Challenge Info and Repository State -->
      <div class="info-row">
        <!-- Repository State Panel -->
        <div class="state-panel card">
          <div class="panel-header">
            <h3>📊 Repository State</h3>
          </div>
          <div class="state-grid">
            <div class="state-item">
              <div class="state-label">Branch</div>
              <div class="state-value current-branch">{{ gitRepo.currentBranch || 'None' }}</div>
            </div>
            <div class="state-item">
              <div class="state-label">Commits</div>
              <div class="state-value">{{ gitRepo.commits.length }}</div>
            </div>
            <div class="state-item">
              <div class="state-label">Branches</div>
              <div class="state-value">{{ gitRepo.branches.length }}</div>
            </div>
            <div class="state-item">
              <div class="state-label">Staged</div>
              <div class="state-value">{{ gitRepo.staged.length }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Graph Row: Visualization and Commit Details -->
      <div class="graph-row">
        <!-- Git Graph Visualization -->
        <div class="visualization-panel card">
          <div class="panel-header">
            <h3>🌳 Repository Graph</h3>
            <div class="graph-controls">
              <div class="branch-selector">
                <label>Current Branch: </label>
                <span class="current-branch-name">{{ gitRepo.currentBranch || 'main' }}</span>
              </div>
            </div>
          </div>
          
          <div class="graph-container" ref="graphContainer">
            <svg :width="svgWidth" :height="svgHeight" class="git-graph">
              <!-- Branch lines -->
              <g class="branch-lines">
                <path
                  v-for="(path, index) in branchPaths"
                  :key="`path-${index}`"
                  :d="path.d"
                  :stroke="path.color"
                  :stroke-width="path.type === 'merge' ? '2' : path.type === 'branch-out' ? '2' : '3'"
                  :stroke-dasharray="path.type === 'merge' ? '3,3' : path.type === 'branch-out' ? '4,2' : '5,5'"
                  fill="none"
                  :class="['branch-line', path.type]"
                />
              </g>
              
              <!-- Commit dots -->
              <g class="commits">
                <g v-for="commit in visualCommits" :key="commit.oid" class="commit-group">
                  <circle
                    :cx="commit.x"
                    :cy="commit.y"
                    :r="8"
                    :fill="commit.color"
                    :stroke="commit.branch === gitRepo.currentBranch ? '#333' : '#666'"
                    :stroke-width="commit.branch === gitRepo.currentBranch ? '3' : '1'"
                    class="commit-circle"
                    @click="selectCommit(commit)"
                  />
                  <text
                    :x="commit.x"
                    :y="commit.y - 15"
                    text-anchor="middle"
                    class="commit-hash"
                    font-size="10"
                  >
                    {{ commit.oid.substr(0, 7) }}
                  </text>
                  <text
                    :x="commit.x"
                    :y="commit.y + 25"
                    text-anchor="middle"
                    class="commit-message"
                    font-size="11"
                  >
                    {{ commit.message.length > 15 ? commit.message.substr(0, 15) + '...' : commit.message }}
                  </text>
                </g>
              </g>
            </svg>
            
            <!-- Empty state -->
            <div v-if="gitRepo.commits.length === 0" class="graph-empty">
              <div class="empty-icon">📭</div>
              <h4>No commits yet</h4>
              <p>Execute git commands to see your repository graph</p>
            </div>
          </div>
        </div>

        <!-- Commit Details Panel (right of graph) -->
        <div class="commit-details-panel card">
          <div class="panel-header">
            <h3>� Commit Details</h3>
          </div>
          <div v-if="selectedCommit" class="commit-info">
            <div class="commit-detail-item">
              <strong>Hash:</strong>
              <span class="commit-hash-detail">{{ selectedCommit.oid }}</span>
            </div>
            <div class="commit-detail-item">
              <strong>Message:</strong>
              <span class="commit-message-detail">{{ selectedCommit.message }}</span>
            </div>
            <div class="commit-detail-item">
              <strong>Branch:</strong>
              <span class="commit-branch-detail">{{ selectedCommit.branch }}</span>
            </div>
            <div class="commit-detail-item">
              <strong>Author:</strong>
              <span>{{ selectedCommit.author }}</span>
            </div>
            <div class="commit-detail-item">
              <strong>Date:</strong>
              <span>{{ new Date(selectedCommit.timestamp).toLocaleString() }}</span>
            </div>
            <div v-if="selectedCommit.mergeFrom" class="commit-detail-item">
              <strong>Merged From:</strong>
              <span class="merge-branch">{{ selectedCommit.mergeFrom }}</span>
            </div>
            <div v-if="selectedCommit.mergeInto" class="commit-detail-item">
              <strong>Merged Into:</strong>
              <span class="merge-branch">{{ selectedCommit.mergeInto }}</span>
            </div>
            <div v-if="selectedCommit.branchedFrom" class="commit-detail-item">
              <strong>Branched From:</strong>
              <span class="branch-source">{{ selectedCommit.branchedFrom }}</span>
            </div>
            <div v-if="selectedCommit.mergeFrom || selectedCommit.mergeInto" class="merge-info">
              <span class="merge-badge">MERGE COMMIT</span>
            </div>
            <div v-if="selectedCommit.branchedFrom" class="branch-info">
              <span class="branch-badge">BRANCH COMMIT</span>
            </div>
          </div>
          <div v-else class="no-commit-selected">
            <div class="selection-prompt">
              <div class="prompt-icon">👆</div>
              <h4>Select a Commit</h4>
              <p>Click on any commit dot in the graph above to see its details here.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Terminal Section -->
      <div class="terminal-section">
        <div :class="['terminal-row', { 'full-width': currentChallenge?.difficulty !== 'beginner' }]">
          <!-- Terminal -->
          <div class="terminal-container card">
            <div class="panel-header terminal-header">
              <div class="terminal-title">
                <span>⚡</span>
                <span>Git Terminal</span>
              </div>
              <div class="terminal-controls">
                <div class="terminal-control close"></div>
                <div class="terminal-control minimize"></div>
                <div class="terminal-control maximize"></div>
              </div>
            </div>

            <div class="terminal-body" ref="terminalBody">
              <div class="command-history">
                <div 
                  v-for="(log, index) in consoleLogs" 
                  :key="index"
                  :class="['history-entry', log.type]"
                >
                  <div v-if="log.type === 'input'" class="command-line">
                    <span class="prompt">git-learner:~/challenge$</span> 
                    <span class="command">{{ log.message.replace('$ ', '') }}</span>
                  </div>
                  <div v-else class="output">{{ log.message }}</div>
                </div>
              </div>
              
              <div class="input-line">
                <span class="prompt">git-learner:~/challenge$</span>
                <input 
                  ref="terminalInput"
                  v-model="userCommand" 
                  @keydown="handleKeyDown"
                  placeholder="Type your git command..."
                  class="command-input"
                  autocomplete="off"
                  spellcheck="false"
                />
              </div>
            </div>
          </div>

          <!-- Quick Commands (for beginners, next to terminal) -->
          <div v-if="currentChallenge?.difficulty === 'beginner'" class="quick-commands-sidebar card">
            <div class="panel-header">
              <h3>⚡ Quick Commands</h3>
            </div>
            <div class="commands-grid">
              <button @click="insertCommand('git init')" class="command-btn btn">
                <span class="cmd-icon">🎯</span>
                <div class="cmd-details">
                  <div class="cmd-text">git init</div>
                  <div class="cmd-desc">Initialize repository</div>
                </div>
              </button>
              <button @click="insertCommand('git add .')" class="command-btn btn">
                <span class="cmd-icon">📋</span>
                <div class="cmd-details">
                  <div class="cmd-text">git add .</div>
                  <div class="cmd-desc">Stage all files</div>
                </div>
              </button>
              <button @click="insertCommand('git commit -m &quot;Initial commit&quot;')" class="command-btn btn">
                <span class="cmd-icon">💾</span>
                <div class="cmd-details">
                  <div class="cmd-text">git commit</div>
                  <div class="cmd-desc">Commit changes</div>
                </div>
              </button>
              <button @click="insertCommand('git status')" class="command-btn btn">
                <span class="cmd-icon">📊</span>
                <div class="cmd-details">
                  <div class="cmd-text">git status</div>
                  <div class="cmd-desc">Check status</div>
                </div>
              </button>
              <button @click="insertCommand('git branch')" class="command-btn btn">
                <span class="cmd-icon">🌿</span>
                <div class="cmd-details">
                  <div class="cmd-text">git branch</div>
                  <div class="cmd-desc">List branches</div>
                </div>
              </button>
              <button @click="insertCommand(`git checkout -b feature-${Date.now().toString().slice(-4)}`)" class="command-btn btn">
                <span class="cmd-icon">🔀</span>
                <div class="cmd-details">
                  <div class="cmd-text">git checkout -b</div>
                  <div class="cmd-desc">Create new branch</div>
                </div>
              </button>
              <button @click="insertCommand('git merge feature')" class="command-btn btn">
                <span class="cmd-icon">🔄</span>
                <div class="cmd-details">
                  <div class="cmd-text">git merge</div>
                  <div class="cmd-desc">Merge branch</div>
                </div>
              </button>
              <button @click="insertCommand('git merge feature into main')" class="command-btn btn">
                <span class="cmd-icon">🔀</span>
                <div class="cmd-details">
                  <div class="cmd-text">git merge ... into ...</div>
                  <div class="cmd-desc">Merge into specific branch</div>
                </div>
              </button>
              <button @click="insertCommand('git log --oneline --graph')" class="command-btn btn">
                <span class="cmd-icon">📊</span>
                <div class="cmd-details">
                  <div class="cmd-text">git log --graph</div>
                  <div class="cmd-desc">Show commit graph</div>
                </div>
              </button>
              <button @click="insertCommand('git push origin main')" class="command-btn btn">
                <span class="cmd-icon">⬆️</span>
                <div class="cmd-details">
                  <div class="cmd-text">git push origin</div>
                  <div class="cmd-desc">Push to remote</div>
                </div>
              </button>
              <button @click="insertCommand('git pull origin main')" class="command-btn btn">
                <span class="cmd-icon">⬇️</span>
                <div class="cmd-details">
                  <div class="cmd-text">git pull origin</div>
                  <div class="cmd-desc">Pull from remote</div>
                </div>
              </button>
              <button @click="insertRandomCommit" class="command-btn btn">
                <span class="cmd-icon">🎲</span>
                <div class="cmd-details">
                  <div class="cmd-text">git commit (random)</div>
                  <div class="cmd-desc">Commit with random ID</div>
                </div>
              </button>
              <button @click="insertCommand('git config user.name &quot;Your Name&quot;')" class="command-btn btn">
                <span class="cmd-icon">👤</span>
                <div class="cmd-details">
                  <div class="cmd-text">git config user.name</div>
                  <div class="cmd-desc">Set author name</div>
                </div>
              </button>
              <button @click="insertCommand('git show HEAD')" class="command-btn btn">
                <span class="cmd-icon">🔍</span>
                <div class="cmd-details">
                  <div class="cmd-text">git show</div>
                  <div class="cmd-desc">Show commit details</div>
                </div>
              </button>
              <button @click="insertCommand('git rebase main')" class="command-btn btn">
                <span class="cmd-icon">🔧</span>
                <div class="cmd-details">
                  <div class="cmd-text">git rebase</div>
                  <div class="cmd-desc">Rebase onto branch</div>
                </div>
              </button>
              <button @click="insertRandomAuthorCommit" class="command-btn btn">
                <span class="cmd-icon">👨‍💻</span>
                <div class="cmd-details">
                  <div class="cmd-text">git commit --author</div>
                  <div class="cmd-desc">Commit with custom author</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Side Panels -->
      <div class="side-panels">
        <!-- Hints -->
        <div v-if="showHints && currentChallenge" class="hints-panel card">
          <div class="panel-header">
            <h3>💡 Hints</h3>
          </div>
          <div class="hints-list">
            <div v-for="(hint, index) in currentChallenge.hints" :key="index" class="hint-item">
              <div class="hint-number">{{ index + 1 }}</div>
              <div class="hint-text">{{ hint }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import type { GitChallenge } from '../challenges/git-challenges'
import DifficultyBadge from './DifficultyBadge.vue'

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ConsoleLog {
  message: string;
  type: 'input' | 'output' | 'error';
}

interface GitCommit {
  oid: string;
  message: string;
  author: string;
  timestamp: number;
  branch: string;
  mergeFrom?: string; // For merge commits - which branch was merged
  mergeInto?: string; // For merge commits - which branch it was merged into
  branchedFrom?: string; // For branch commits - which branch this was created from
  parentCommit?: string; // The commit this was based on
}

interface GitRepo {
  currentBranch: string;
  commits: GitCommit[];
  branches: string[];
  staged: string[];
}

const toasts = ref<Toast[]>([])
const consoleLogs = ref<ConsoleLog[]>([])
const terminalInput = ref<HTMLInputElement | null>(null)
const terminalBody = ref<HTMLElement | null>(null)
const graphContainer = ref<HTMLElement | null>(null)
const challengeHeader = ref<HTMLElement | null>(null)

const props = defineProps<{
  initialChallenge: GitChallenge
}>()

const emit = defineEmits(['challenge-completed', 'exit'])

const currentChallenge = ref<GitChallenge>(props.initialChallenge)
const userCommand = ref('')
const completedChallenges = ref<number[]>(
  JSON.parse(localStorage.getItem('completedChallenges') || '[]')
)
const showHints = ref(false)
const selectedCommit = ref<GitCommit | null>(null)

// SVG dimensions
const svgWidth = ref(800)
const svgHeight = ref(200)

// Branch colors
const branchColors: Record<string, string> = {
  main: '#2196F3',
  master: '#2196F3',
  develop: '#4CAF50',
  feature: '#FF9800',
  hotfix: '#F44336',
  release: '#9C27B0'
}

// Git repository state
const gitRepo = ref<GitRepo>({
  currentBranch: 'main',
  commits: [],
  branches: ['main'],
  staged: []
})

// Git configuration
const gitConfig = ref<Record<string, string>>({
  'user.name': 'Git Learner',
  'user.email': 'learner@gitlearner.com'
})

// Computed property for challenge completion status
const isCompleted = computed(() => 
  completedChallenges.value.includes(currentChallenge.value.id)
)

// Computed properties for graph visualization
const visualCommits = computed(() => {
  const commitsByBranch: Record<string, GitCommit[]> = {}
  
  // Group commits by branch
  gitRepo.value.commits.forEach(commit => {
    if (!commitsByBranch[commit.branch]) {
      commitsByBranch[commit.branch] = []
    }
    commitsByBranch[commit.branch].push(commit)
  })
  
  // Sort commits by timestamp for proper x positioning
  const sortedCommits = [...gitRepo.value.commits].sort((a, b) => a.timestamp - b.timestamp)
  
  return sortedCommits.map((commit, index) => {
    const branchIndex = gitRepo.value.branches.indexOf(commit.branch)
    const baseY = 60 + (branchIndex * 70)
    
    // Add some vertical variation for visual appeal
    const yOffset = commit.message.includes('Merge') ? -10 : 0
    
    return {
      ...commit,
      x: 80 + (index * 120), // Increased spacing for better line visibility
      y: baseY + yOffset,
      color: branchColors[commit.branch] || branchColors.feature
    }
  })
})

const branchPaths = computed(() => {
  const paths: Array<{d: string, color: string, type: 'branch' | 'merge' | 'branch-out'}> = []
  const branchCommits: Record<string, typeof visualCommits.value> = {}
  
  // Group commits by branch
  visualCommits.value.forEach(commit => {
    if (!branchCommits[commit.branch]) {
      branchCommits[commit.branch] = []
    }
    branchCommits[commit.branch].push(commit)
  })
  
  // Create paths for each branch (main branch lines)
  Object.keys(branchCommits).forEach(branch => {
    const commits = branchCommits[branch].sort((a, b) => a.timestamp - b.timestamp)
    if (commits.length > 1) {
      let pathData = `M ${commits[0].x} ${commits[0].y}`
      for (let i = 1; i < commits.length; i++) {
        pathData += ` L ${commits[i].x} ${commits[i].y}`
      }
      paths.push({
        d: pathData,
        color: branchColors[branch] || branchColors.feature,
        type: 'branch'
      })
    }
  })
  
  // Add branch-out lines (when creating new branches)
  const sortedCommits = [...visualCommits.value].sort((a, b) => a.timestamp - b.timestamp)
  sortedCommits.forEach((commit, index) => {
    // Check if this commit was branched from another branch
    if (commit.branchedFrom && commit.parentCommit) {
      // Find the parent commit it was branched from
      const parentCommit = visualCommits.value.find(c => c.oid === commit.parentCommit)
      
      if (parentCommit) {
        // Create branch-out line with curve from parent commit to this commit
        const deltaX = commit.x - parentCommit.x
        
        // Control points for smooth curve
        const controlX1 = parentCommit.x + deltaX * 0.5
        const controlY1 = parentCommit.y
        const controlX2 = commit.x - deltaX * 0.3
        const controlY2 = commit.y
        
        // Use cubic bezier for smooth branch-out line
        const pathData = `M ${parentCommit.x} ${parentCommit.y} C ${controlX1} ${controlY1} ${controlX2} ${controlY2} ${commit.x} ${commit.y}`
        
        paths.push({
          d: pathData,
          color: branchColors[commit.branch] || branchColors.feature,
          type: 'branch-out'
        })
      }
    } else {
      // Fallback: Check if this commit starts a new branch (legacy logic)
      const previousCommits = sortedCommits.slice(0, index)
      const isNewBranch = !previousCommits.some(prev => prev.branch === commit.branch)
      
      if (isNewBranch && commit.branch !== 'main' && commit.branch !== 'master') {
        // Find the parent commit (usually the last commit on main/master before this branch was created)
        const parentCommit = previousCommits
          .filter(prev => prev.branch === 'main' || prev.branch === 'master')
          .pop()
        
        if (parentCommit) {
          // Create branch-out line with curve
          const midX = (parentCommit.x + commit.x) / 2
          const midY = (parentCommit.y + commit.y) / 2
          const pathData = `M ${parentCommit.x} ${parentCommit.y} Q ${midX} ${midY} ${commit.x} ${commit.y}`
          
          paths.push({
            d: pathData,
            color: branchColors[commit.branch] || branchColors.feature,
            type: 'branch-out'
          })
        }
      }
    }
    
    // Handle merge commits with metadata
    if (commit.mergeFrom && commit.mergeInto) {
      // Find the last commit on the merged branch before this merge
      const mergedCommit = [...sortedCommits]
        .reverse()
        .find(c => c.branch === commit.mergeFrom && c.timestamp < commit.timestamp && !c.mergeFrom)
      
      if (mergedCommit) {
        // Create merge line with smooth curve
        const deltaX = commit.x - mergedCommit.x
        
        // Control points for smooth curve
        const controlX1 = mergedCommit.x + deltaX * 0.3
        const controlY1 = mergedCommit.y
        const controlX2 = commit.x - deltaX * 0.3
        const controlY2 = commit.y
        
        // Use cubic bezier for smooth merge line
        const pathData = `M ${mergedCommit.x} ${mergedCommit.y} C ${controlX1} ${controlY1} ${controlX2} ${controlY2} ${commit.x} ${commit.y}`
        
        paths.push({
          d: pathData,
          color: branchColors[commit.mergeFrom] || branchColors.feature,
          type: 'merge'
        })
      }
    } else if (commit.message.toLowerCase().includes('merge branch')) {
      // Fallback for commits without metadata - parse message
      const mergeBranchMatch = commit.message.match(/merge branch '(\w+)'(?:\s+into\s+(\w+))?/i)
      if (mergeBranchMatch) {
        const mergedBranch = mergeBranchMatch[1]
        const targetBranch = mergeBranchMatch[2] || commit.branch
        
        // Find the last commit on the merged branch before this merge
        const mergedCommit = [...sortedCommits]
          .reverse()
          .find(c => c.branch === mergedBranch && c.timestamp < commit.timestamp)
        
        if (mergedCommit && targetBranch === commit.branch) {
          // Create merge line with smooth curve
          const deltaX = commit.x - mergedCommit.x
          
          // Control points for smooth curve
          const controlX1 = mergedCommit.x + deltaX * 0.3
          const controlY1 = mergedCommit.y
          const controlX2 = commit.x - deltaX * 0.3
          const controlY2 = commit.y
          
          // Use cubic bezier for smooth merge line
          const pathData = `M ${mergedCommit.x} ${mergedCommit.y} C ${controlX1} ${controlY1} ${controlX2} ${controlY2} ${commit.x} ${commit.y}`
          
          paths.push({
            d: pathData,
            color: branchColors[mergedBranch] || branchColors.feature,
            type: 'merge'
          })
        }
      }
    }
  })
  
  return paths
})

watch(() => props.initialChallenge, (newChallenge: GitChallenge) => {
  if (newChallenge) {
    currentChallenge.value = newChallenge
    initializeRepository()
  }
}, { immediate: true })

onMounted(() => {
  updateSvgDimensions()
  window.addEventListener('resize', updateSvgDimensions)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateSvgDimensions)
})

function updateSvgDimensions() {
  if (graphContainer.value) {
    const commitCount = gitRepo.value.commits.length
    const branchCount = gitRepo.value.branches.length
    
    // Calculate width based on commits (with increased spacing)
    svgWidth.value = Math.max(600, 160 + (commitCount * 120))
    
    // Calculate height based on branches (with increased spacing)
    svgHeight.value = Math.max(200, 120 + (branchCount * 70))
  }
}

function generateCommitId(): string {
  return generateRandomHash()
}

function generateRandomHash(): string {
  const chars = '0123456789abcdef'
  let hash = ''
  for (let i = 0; i < 7; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)]
  }
  return hash
}

function generateTimestamp(): number {
  const baseTimestamp = 1640995200000
  const currentCount = gitRepo.value.commits.length
  return baseTimestamp + (currentCount * 300000)
}

function parseAuthor(command: string): string {
  // Check for --author flag
  const authorMatch = command.match(/--author[=\s]+"([^"]+)"/i) || command.match(/--author[=\s]+([^\s]+)/i)
  if (authorMatch) {
    return authorMatch[1]
  }
  
  // Use configured user.name
  return gitConfig.value['user.name'] || 'Git Learner'
}

function parseEmail(command: string): string {
  // Extract email from --author if provided
  const authorMatch = command.match(/--author[=\s]+"[^<]*<([^>]+)>"/i)
  if (authorMatch) {
    return authorMatch[1]
  }
  
  // Use configured user.email
  return gitConfig.value['user.email'] || 'learner@gitlearner.com'
}

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
  
  setTimeout(() => {
    updateSvgDimensions()
  }, 0)
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    executeCommand()
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    // TODO: Navigate to previous command
  } else if (event.key === 'ArrowDown') {
    event.preventDefault()
    // TODO: Navigate to next command
  } else if (event.key === 'Tab') {
    event.preventDefault()
    // TODO: Add tab completion for git commands
  }
}

function executeCommand() {
  const command = userCommand.value.trim()
  if (!command) return
  
  executeCommandWithLog(command)
  
  // Auto-scroll terminal to bottom
  setTimeout(() => {
    if (terminalBody.value) {
      terminalBody.value.scrollTop = terminalBody.value.scrollHeight
    }
  }, 100)
}

function insertCommand(command: string) {
  userCommand.value = command
  if (terminalInput.value) {
    terminalInput.value.focus()
  }
}

function insertRandomCommit() {
  const randomHash = generateRandomHash()
  insertCommand(`git commit -m "Feature ${randomHash}"`)
}

function insertRandomAuthorCommit() {
  const randomHash = generateRandomHash()
  insertCommand(`git commit -m "Fix issue" --author="Developer ${randomHash}"`)
}

function resetChallenge() {
  consoleLogs.value = []
  userCommand.value = ''
  selectedCommit.value = null
  showHints.value = false
  
  initializeRepository()
  
  showToast('Challenge reset! 🔄', 'info')
  
  setTimeout(() => {
    if (challengeHeader.value) {
      challengeHeader.value.scrollIntoView({
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
  }, 100)
}

function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  const id = Date.now()
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 3000)
}

function executeCommandWithLog(command: string) {
  // Add command to console
  consoleLogs.value.push({
    message: `$ ${command}`,
    type: 'input'
  })
  
  try {
    // Parse command properly
    const trimmedCommand = command.trim()
    const parts = trimmedCommand.split(/\s+/)
    const baseCommand = parts[0]
    
    // Handle non-git commands
    if (baseCommand !== 'git') {
      consoleLogs.value.push({
        message: `bash: ${baseCommand}: command not found`,
        type: 'error'
      })
      return
    }
    
    // Handle git help commands first (before other parsing)
    if (trimmedCommand === 'git --help' || trimmedCommand === 'git help') {
      showGitHelp()
      return
    }
    
    if (trimmedCommand.startsWith('git help ')) {
      const helpTopic = trimmedCommand.replace('git help ', '').trim()
      showGitHelp(helpTopic)
      return
    }
    
    // Now handle regular git commands
    const gitCommand = parts[1]
    
    // Handle git commands with proper parsing
    if (gitCommand === 'commit') {
      if (gitRepo.value.staged.length === 0) {
        consoleLogs.value.push({
          message: 'Error: No changes staged for commit',
          type: 'error'
        })
        return
      }
      
      const message = trimmedCommand.includes('-m') 
        ? trimmedCommand.split('-m')[1].trim().replace(/["']/g, '')
        : 'New commit'
      
      const author = parseAuthor(trimmedCommand)
      
      const newCommit: GitCommit = {
        oid: generateCommitId(),
        message,
        author,
        timestamp: generateTimestamp(),
        branch: gitRepo.value.currentBranch
      }
      
      gitRepo.value.commits.push(newCommit)
      gitRepo.value.staged = []
      
      consoleLogs.value.push({
        message: `[${gitRepo.value.currentBranch} ${newCommit.oid}] ${message}`,
        type: 'output'
      })
      
      updateSvgDimensions()
    } else if (trimmedCommand.startsWith('git checkout -b')) {
      const branchName = trimmedCommand.split('git checkout -b')[1].trim()
      if (!gitRepo.value.branches.includes(branchName)) {
        gitRepo.value.branches.push(branchName)
        
        // Add color for new branch if not exists
        if (!branchColors[branchName]) {
          const colors = ['#E91E63', '#673AB7', '#3F51B5', '#00BCD4', '#009688', '#795548']
          branchColors[branchName] = colors[Math.floor(Math.random() * colors.length)]
        }
        
        // Find the last commit on the current branch to base the new branch from
        const currentBranchCommits = gitRepo.value.commits.filter(c => c.branch === gitRepo.value.currentBranch)
        let baseCommit = null
        
        if (currentBranchCommits.length > 0) {
          // Get the most recent commit on current branch
          baseCommit = currentBranchCommits.reduce((latest, commit) => 
            commit.timestamp > latest.timestamp ? commit : latest
          )
        }
        
        // Create initial commit on new branch, branching from current branch
        const branchCommit: GitCommit = {
          oid: generateCommitId(),
          message: `Branch from ${gitRepo.value.currentBranch}`,
          author: gitConfig.value['user.name'] || 'Git Learner',
          timestamp: generateTimestamp(),
          branch: branchName,
          // Mark this as a branch point for visualization
          branchedFrom: gitRepo.value.currentBranch,
          parentCommit: baseCommit?.oid
        }
        gitRepo.value.commits.push(branchCommit)
        
        // Switch to the new branch
        const previousBranch = gitRepo.value.currentBranch
        gitRepo.value.currentBranch = branchName
        
        consoleLogs.value.push({
          message: `Switched to a new branch '${branchName}' (branched from '${previousBranch}')`,
          type: 'output'
        })
      } else {
        consoleLogs.value.push({
          message: `fatal: A branch named '${branchName}' already exists.`,
          type: 'error'
        })
        return
      }
      
      updateSvgDimensions()
    } else if (trimmedCommand.startsWith('git checkout')) {
      const branchName = trimmedCommand.split('git checkout')[1].trim()
      if (gitRepo.value.branches.includes(branchName)) {
        gitRepo.value.currentBranch = branchName
        consoleLogs.value.push({
          message: `Switched to branch '${branchName}'`,
          type: 'output'
        })
      } else {
        consoleLogs.value.push({
          message: `Error: pathspec '${branchName}' did not match any file(s) known to git`,
          type: 'error'
        })
      }
    } else if (trimmedCommand.startsWith('git merge')) {
      const parts = trimmedCommand.split(' ')
      let sourceBranch = parts[2] // branch to merge from
      let targetBranch = gitRepo.value.currentBranch // default to current branch
      
      // Check for "into" syntax: git merge feature into main
      const intoIndex = parts.indexOf('into')
      if (intoIndex !== -1 && parts[intoIndex + 1]) {
        targetBranch = parts[intoIndex + 1]
        // Switch to target branch first
        if (gitRepo.value.branches.includes(targetBranch)) {
          gitRepo.value.currentBranch = targetBranch
          consoleLogs.value.push({
            message: `Switched to branch '${targetBranch}'`,
            type: 'output'
          })
        } else {
          consoleLogs.value.push({
            message: `Error: branch '${targetBranch}' not found.`,
            type: 'error'
          })
          return
        }
      }
      
      if (!sourceBranch) {
        consoleLogs.value.push({
          message: `Error: merge requires a branch name`,
          type: 'error'
        })
        return
      }
      
      if (gitRepo.value.branches.includes(sourceBranch)) {
        if (sourceBranch === targetBranch) {
          consoleLogs.value.push({
            message: `Already up to date.`,
            type: 'output'
          })
        } else {
          // Check if there are any commits on the branch to merge
          const branchCommits = gitRepo.value.commits.filter(c => c.branch === sourceBranch)
          if (branchCommits.length === 0) {
            consoleLogs.value.push({
              message: `error: merge: ${sourceBranch} - not something we can merge`,
              type: 'error'
            })
            return
          }
          
          // Check if the branches have diverged
          const targetCommits = gitRepo.value.commits.filter(c => c.branch === targetBranch)
          const lastTargetCommit = targetCommits[targetCommits.length - 1]
          const lastSourceCommit = branchCommits[branchCommits.length - 1]
          
          // Create merge commit
          const mergeCommit: GitCommit = {
            oid: generateCommitId(),
            message: `Merge branch '${sourceBranch}' into ${targetBranch}`,
            author: gitConfig.value['user.name'] || 'Git Learner',
            timestamp: generateTimestamp(),
            branch: targetBranch,
            mergeFrom: sourceBranch, // Add merge metadata
            mergeInto: targetBranch
          }
          gitRepo.value.commits.push(mergeCommit)
          
          // Show merge statistics
          const addedCommits = branchCommits.filter(bc => 
            !targetCommits.some(tc => tc.oid === bc.oid)
          ).length
          
          consoleLogs.value.push({
            message: `Merge made by the 'ort' strategy.
Merging:
  ${lastSourceCommit?.oid.substr(0, 7) || 'unknown'} ${lastSourceCommit?.message || ''}
  ${lastTargetCommit?.oid.substr(0, 7) || 'unknown'} ${lastTargetCommit?.message || ''}
found ${addedCommits} commit(s) from '${sourceBranch}' to merge into '${targetBranch}'.`,
            type: 'output'
          })
        }
        
        updateSvgDimensions()
      } else {
        consoleLogs.value.push({
          message: `Error: merge: ${sourceBranch} - not something we can merge`,
          type: 'error'
        })
      }
    } else if (trimmedCommand.startsWith('git rebase')) {
      const branchName = trimmedCommand.split('git rebase')[1].trim()
      if (gitRepo.value.branches.includes(branchName)) {
        if (branchName === gitRepo.value.currentBranch) {
          consoleLogs.value.push({
            message: `Current branch ${gitRepo.value.currentBranch} is up to date.`,
            type: 'output'
          })
        } else {
          // Simulate rebase by creating a new commit that represents the rebased state
          const rebaseCommit: GitCommit = {
            oid: generateCommitId(),
            message: `Rebased ${gitRepo.value.currentBranch} onto ${branchName}`,
            author: gitConfig.value['user.name'] || 'Git Learner',
            timestamp: generateTimestamp(),
            branch: gitRepo.value.currentBranch
          }
          gitRepo.value.commits.push(rebaseCommit)
          consoleLogs.value.push({
            message: `Successfully rebased and updated refs/heads/${gitRepo.value.currentBranch}.`,
            type: 'output'
          })
          updateSvgDimensions()
        }
      } else {
        consoleLogs.value.push({
          message: `Error: invalid upstream ${branchName}`,
          type: 'error'
        })
      }
    } else if (trimmedCommand === 'git init') {
      gitRepo.value = {
        currentBranch: 'main',
        commits: [],
        branches: ['main'],
        staged: []
      }
      consoleLogs.value.push({
        message: 'Initialized empty Git repository in /challenge/.git/',
        type: 'output'
      })
      
      updateSvgDimensions()
    } else if (trimmedCommand === 'git add .' || trimmedCommand === 'git add -A') {
      gitRepo.value.staged = ['file1.txt', 'file2.txt']
      consoleLogs.value.push({
        message: 'Changes staged for commit',
        type: 'output'
      })
    } else if (trimmedCommand.startsWith('git add ')) {
      // Handle git add with specific files
      const files = trimmedCommand.split('git add ')[1].trim()
      if (files) {
        gitRepo.value.staged = files.split(' ').filter(f => f.trim())
        consoleLogs.value.push({
          message: `Staged files: ${files}`,
          type: 'output'
        })
      } else {
        consoleLogs.value.push({
          message: 'Nothing specified, nothing added.',
          type: 'output'
        })
      }
    } else if (trimmedCommand === 'git status') {
      let statusOutput = `On branch ${gitRepo.value.currentBranch}\n`
      if (gitRepo.value.staged.length > 0) {
        statusOutput += '\nChanges to be committed:\n'
        gitRepo.value.staged.forEach(file => {
          statusOutput += `\t${file}\n`
        })
      } else {
        statusOutput += 'nothing to commit, working tree clean'
      }
      consoleLogs.value.push({
        message: statusOutput,
        type: 'output'
      })
    } else if (trimmedCommand === 'git branch' || (trimmedCommand.startsWith('git branch ') && !trimmedCommand.includes('-d'))) {
      const parts = trimmedCommand.split(' ')
      const branchName = parts.length > 2 ? parts[2].trim() : ''
      
      if (!branchName) {
        // List branches
        let branchOutput = ''
        gitRepo.value.branches.forEach(branch => {
          if (branch === gitRepo.value.currentBranch) {
            branchOutput += `* ${branch}\n`
          } else {
            branchOutput += `  ${branch}\n`
          }
        })
        consoleLogs.value.push({
          message: branchOutput.trim(),
          type: 'output'
        })
      } else {
        // Create branch without switching to it
        if (!gitRepo.value.branches.includes(branchName)) {
          gitRepo.value.branches.push(branchName)
          
          // Add color for new branch if not exists
          if (!branchColors[branchName]) {
            const colors = ['#E91E63', '#673AB7', '#3F51B5', '#00BCD4', '#009688', '#795548']
            branchColors[branchName] = colors[Math.floor(Math.random() * colors.length)]
          }
          
          consoleLogs.value.push({
            message: `Created branch '${branchName}' (based on '${gitRepo.value.currentBranch}')`,
            type: 'output'
          })
          
          updateSvgDimensions()
        } else {
          consoleLogs.value.push({
            message: `fatal: A branch named '${branchName}' already exists.`,
            type: 'error'
          })
        }
      }
    } else if (trimmedCommand.startsWith('git branch -d')) {
      const branchName = trimmedCommand.split('git branch -d')[1].trim()
      if (branchName === gitRepo.value.currentBranch) {
        consoleLogs.value.push({
          message: `error: Cannot delete branch '${branchName}' checked out at`,
          type: 'error'
        })
      } else if (gitRepo.value.branches.includes(branchName)) {
        gitRepo.value.branches = gitRepo.value.branches.filter(b => b !== branchName)
        consoleLogs.value.push({
          message: `Deleted branch ${branchName}`,
          type: 'output'
        })
        updateSvgDimensions()
      } else {
        consoleLogs.value.push({
          message: `error: branch '${branchName}' not found.`,
          type: 'error'
        })
      }
    } else if (trimmedCommand.startsWith('git push')) {
      // Simulate push operation
      const parts = trimmedCommand.split(' ')
      const remote = parts[2] || 'origin'
      const branch = parts[3] || gitRepo.value.currentBranch
      
      consoleLogs.value.push({
        message: `To ${remote}
 * [new branch]      ${branch} -> ${branch}`,
        type: 'output'
      })
    } else if (trimmedCommand.startsWith('git pull')) {
      // Simulate pull operation
      const parts = trimmedCommand.split(' ')
      const remote = parts[2] || 'origin'
      const branch = parts[3] || gitRepo.value.currentBranch
      
      consoleLogs.value.push({
        message: `From ${remote}
 * branch            ${branch}     -> FETCH_HEAD
Already up to date.`,
        type: 'output'
      })
    } else if (trimmedCommand.startsWith('git fetch')) {
      // Simulate fetch operation
      consoleLogs.value.push({
        message: `remote: Enumerating objects: 3, done.
remote: Counting objects: 100% (3/3), done.
remote: Total 3 (delta 0), reused 0 (delta 0), pack-reused 0`,
        type: 'output'
      })
    } else if (trimmedCommand.startsWith('git diff')) {
      // Simulate diff output
      if (gitRepo.value.staged.length > 0) {
        consoleLogs.value.push({
          message: `diff --git a/file1.txt b/file1.txt
index 1234567..abcdefg 100644
--- a/file1.txt
+++ b/file1.txt
@@ -1,3 +1,4 @@
 line 1
 line 2
+new line
 line 3`,
          type: 'output'
        })
      } else {
        consoleLogs.value.push({
          message: ``,
          type: 'output'
        })
      }
    } else if (trimmedCommand.startsWith('git config')) {
      // Handle git config commands
      const configParts = trimmedCommand.split(/\s+/)
      
      if (configParts.length >= 3) {
        const action = configParts[2]
        
        if (action === '--list' || action === '-l') {
          // List all configuration
          let configOutput = ''
          Object.entries(gitConfig.value).forEach(([key, value]) => {
            configOutput += `${key}=${value}\n`
          })
          consoleLogs.value.push({
            message: configOutput.trim() || 'No configuration found',
            type: 'output'
          })
        } else if (action === '--global' || action === '--local') {
          // Set configuration (git config --global user.name "Name")
          if (configParts.length >= 5) {
            const key = configParts[3]
            const value = configParts.slice(4).join(' ').replace(/["']/g, '')
            gitConfig.value[key] = value
            consoleLogs.value.push({
              message: `Configuration set: ${key} = ${value}`,
              type: 'output'
            })
          } else {
            consoleLogs.value.push({
              message: 'Usage: git config --global <key> <value>',
              type: 'error'
            })
          }
        } else if (configParts.length >= 4) {
          // Direct config set (git config user.name "Name")
          const key = action
          const value = configParts.slice(3).join(' ').replace(/["']/g, '')
          gitConfig.value[key] = value
          consoleLogs.value.push({
            message: `Configuration set: ${key} = ${value}`,
            type: 'output'
          })
        } else {
          // Get configuration value
          const key = action
          const value = gitConfig.value[key]
          if (value) {
            consoleLogs.value.push({
              message: value,
              type: 'output'
            })
          } else {
            consoleLogs.value.push({
              message: `No configuration found for key: ${key}`,
              type: 'error'
            })
          }
        }
      } else {
        consoleLogs.value.push({
          message: 'Usage: git config [--global|--local] <key> [<value>] or git config --list',
          type: 'error'
        })
      }
    } else if (trimmedCommand.startsWith('git log')) {
      if (gitRepo.value.commits.length === 0) {
        consoleLogs.value.push({
          message: 'fatal: your current branch \'main\' does not have any commits yet',
          type: 'error'
        })
      } else {
        let logOutput = ''
        
        if (trimmedCommand.includes('--oneline') && trimmedCommand.includes('--graph')) {
          // Generate a simple text-based graph
          const sortedCommits = [...gitRepo.value.commits].sort((a, b) => b.timestamp - a.timestamp)
          sortedCommits.forEach((commit, index) => {
            const isMerge = commit.mergeFrom || commit.message.toLowerCase().includes('merge')
            const isFirstCommit = index === sortedCommits.length - 1
            
            let graphSymbol = '* '
            if (isMerge) {
              graphSymbol = '*   '
            } else if (!isFirstCommit) {
              graphSymbol = '| * '
            }
            
            let commitLine = `${graphSymbol}${commit.oid.substr(0, 7)} ${commit.message}`
            if (commit.mergeFrom) {
              commitLine += ` (${commit.mergeFrom} → ${commit.mergeInto})`
            }
            logOutput += `${commitLine}\n`
            
            if (isMerge && index < sortedCommits.length - 1) {
              logOutput += '|\\  \n'
              if (commit.mergeFrom) {
                logOutput += `| * [${commit.mergeFrom}] merged\n`
              }
            }
          })
        } else if (trimmedCommand.includes('--oneline')) {
          // Simple oneline format
          gitRepo.value.commits.slice().reverse().forEach(commit => {
            logOutput += `${commit.oid.substr(0, 7)} ${commit.message}\n`
          })
        } else {
          // Full log format
          gitRepo.value.commits.slice().reverse().forEach(commit => {
            logOutput += `commit ${commit.oid}\n`
            logOutput += `Author: ${commit.author}\n`
            logOutput += `Date: ${new Date(commit.timestamp).toLocaleString()}\n\n`
            logOutput += `    ${commit.message}\n\n`
          })
        }
        
        consoleLogs.value.push({
          message: logOutput.trim(),
          type: 'output'
        })
      }
    } else if (trimmedCommand.startsWith('git show')) {
      // Handle git show command
      if (gitRepo.value.commits.length === 0) {
        consoleLogs.value.push({
          message: 'fatal: bad default revision \'HEAD\'',
          type: 'error'
        })
      } else {
        const parts = trimmedCommand.split(' ')
        let commitToShow = gitRepo.value.commits[gitRepo.value.commits.length - 1] // Default to latest commit
        
        if (parts.length > 2) {
          // Find specific commit by hash
          const hash = parts[2]
          const foundCommit = gitRepo.value.commits.find(c => c.oid.startsWith(hash))
          if (foundCommit) {
            commitToShow = foundCommit
          } else {
            consoleLogs.value.push({
              message: `fatal: ambiguous argument '${hash}': unknown revision or path not in the working tree.`,
              type: 'error'
            })
            return
          }
        }
        
        let showOutput = `commit ${commitToShow.oid}\n`
        showOutput += `Author: ${commitToShow.author} <${parseEmail('')}>\n`
        showOutput += `Date: ${new Date(commitToShow.timestamp).toLocaleString()}\n\n`
        showOutput += `    ${commitToShow.message}\n`
        
        if (commitToShow.mergeFrom) {
          showOutput += `\nMerge: ${commitToShow.mergeFrom} → ${commitToShow.mergeInto}\n`
        }
        if (commitToShow.branchedFrom) {
          showOutput += `\nBranched from: ${commitToShow.branchedFrom}\n`
        }
        
        consoleLogs.value.push({
          message: showOutput,
          type: 'output'
        })
      }
    } else if (trimmedCommand.startsWith('git')) {
      consoleLogs.value.push({
        message: `git: '${trimmedCommand.split(' ')[1] || ''}' is not a git command. See 'git --help'.`,
        type: 'error'
      })
    } else {
      consoleLogs.value.push({
        message: `bash: ${trimmedCommand}: command not found`,
        type: 'error'
      })
    }
  } catch (error) {
    consoleLogs.value.push({
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      type: 'error'
    })
  }
  
  userCommand.value = ''
}

function showGitHelp(command?: string) {
  if (command) {
    // Show help for specific command
    const helpTexts: Record<string, string> = {
      'commit': `git-commit - Record changes to the repository

SYNOPSIS
       git commit [-m <msg>] [--author=<author>]

DESCRIPTION
       Create a new commit containing the current contents of the index and the given log message describing the changes.

OPTIONS
       -m <msg>, --message=<msg>
           Use the given <msg> as the commit message.
       
       --author=<author>
           Override the commit author. Format: "Name <email>" or "Name"

EXAMPLES
       git commit -m "Initial commit"
       git commit -m "Fix bug" --author="John Doe"
       git commit -m "Feature" --author="Jane Smith <jane@example.com>"`,

      'add': `git-add - Add file contents to the index

SYNOPSIS
       git add [--] <pathspec>...
       git add . 

DESCRIPTION
       This command updates the index using the current content found in the working tree, to prepare the content staged for the next commit.

OPTIONS
       .   Add all files in the current directory and subdirectories

EXAMPLES
       git add .
       git add file1.txt file2.txt`,

      'checkout': `git-checkout - Switch branches or restore working tree files

SYNOPSIS
       git checkout <branch>
       git checkout -b <new-branch>

DESCRIPTION
       Updates files in the working tree to match the version in the index or the specified tree.

OPTIONS
       -b <new-branch>
           Create a new branch and switch to it

EXAMPLES
       git checkout main
       git checkout -b feature-branch`,

      'merge': `git-merge - Join two or more development histories together

SYNOPSIS
       git merge <branch>
       git merge <source-branch> into <target-branch>

DESCRIPTION
       Incorporates changes from the named commits into the current branch.

EXAMPLES
       git merge feature-branch
       git merge feature into main`,

      'branch': `git-branch - List, create, or delete branches

SYNOPSIS
       git branch [<branchname>]
       git branch -d <branchname>

DESCRIPTION
       If no arguments are given, existing branches are listed.

OPTIONS
       -d <branchname>
           Delete a branch

EXAMPLES
       git branch
       git branch new-feature
       git branch -d old-feature`,

      'status': `git-status - Show the working tree status

SYNOPSIS
       git status

DESCRIPTION
       Displays paths that have differences between the index file and the current HEAD commit.

EXAMPLES
       git status`,

      'log': `git-log - Show commit logs

SYNOPSIS
       git log [--oneline] [--graph]

DESCRIPTION
       Shows the commit logs.

OPTIONS
       --oneline
           Show each commit on a single line
       --graph
           Draw a text-based graphical representation

EXAMPLES
       git log
       git log --oneline
       git log --oneline --graph`,

      'init': `git-init - Create an empty Git repository

SYNOPSIS
       git init

DESCRIPTION
       This command creates an empty Git repository.

EXAMPLES
       git init`,

      'rebase': `git-rebase - Reapply commits on top of another base tip

SYNOPSIS
       git rebase <branch>

DESCRIPTION
       Forward-port local commits to the updated upstream head.

EXAMPLES
       git rebase main`,

      'config': `git-config - Get and set repository or global options

SYNOPSIS
       git config [--global|--local] <key> [<value>]
       git config --list

DESCRIPTION
       Get and set configuration options for Git.

OPTIONS
       --global
           Use global config file
       --local  
           Use repository config file
       --list
           Show all configuration

EXAMPLES
       git config user.name "Your Name"
       git config user.email "your.email@example.com"
       git config --global user.name "Global Name"
       git config --list`,

      'show': `git-show - Show various types of objects

SYNOPSIS
       git show [<commit>]

DESCRIPTION
       Shows one or more objects (blobs, trees, tags and commits).

EXAMPLES
       git show
       git show HEAD
       git show <commit-hash>`
    }

    const helpText = helpTexts[command]
    if (helpText) {
      consoleLogs.value.push({
        message: helpText,
        type: 'output'
      })
    } else {
      consoleLogs.value.push({
        message: `No manual entry for git-${command}`,
        type: 'error'
      })
    }
  } else {
    // Show general git help
    consoleLogs.value.push({
      message: `usage: git [--version] [--help] [-C <path>] [-c <name>=<value>]
           [--exec-path[=<path>]] [--html-path] [--man-path] [--info-path]
           [-p | --paginate | -P | --no-pager] [--no-replace-objects] [--bare]
           [--git-dir=<path>] [--work-tree=<path>] [--namespace=<name>]
           [--super-prefix=<path>] [--config-env=<name>=<envvar>]
           <command> [<args>]

These are common Git commands used in various situations:

start a working area (see also: git help tutorial)
   init       Create an empty Git repository

work on the current change (see also: git help everyday)
   add        Add file contents to the index
   status     Show the working tree status
   diff       Show changes between commits, commit and working tree, etc
   commit     Record changes to the repository

grow, mark and tweak your common history
   branch     List, create, or delete branches
   checkout   Switch branches or restore working tree files
   merge      Join two or more development histories together
   rebase     Reapply commits on top of another base tip
   log        Show commit logs

examine the history and state (see also: git help revisions)
   show       Show various types of objects
   config     Set and get repository or global options

collaborate (see also: git help workflows)
   fetch      Download objects and refs from another repository
   pull       Fetch from and integrate with another repository or a local branch
   push       Update remote refs along with associated objects

'git help -a' and 'git help -g' list available subcommands and some
concept guides. See 'git help <command>' or 'git help <concept>'
to read about a specific subcommand or concept.`,
      type: 'output'
    })
  }
}

function selectCommit(commit: GitCommit) {
  selectedCommit.value = commit
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

/* Card Component */
.card {
  background: var(--color-card-bg);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  backdrop-filter: blur(20px);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.panel-header {
  color: var(--color-text);
  background: var(--header-bg);
  padding: 20px;
  border-bottom: 1px solid rgba(0,0,0,0.1);
}

.panel-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-text);
}

/* Visualization Panel */
.visualization-panel {
  min-height: 400px;
}

.graph-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
}

.branch-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.current-branch-name {
  background: #2196F3;
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.graph-container {
  padding: 20px;
  overflow-x: auto;
  min-height: 300px;
}

.git-graph {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-card-bg);
  min-width: 600px;
}

.commit-circle {
  cursor: pointer;
  transition: all 0.2s ease;
}

.commit-circle:hover {
  r: 10;
  filter: brightness(1.2);
}

.commit-hash {
  font-family: 'Courier New', monospace;
  font-weight: bold;
  fill: var(--color-text);
}

.commit-message {
  color: var(--color-text);
  font-size: 11px;
  max-width: 80px;
  fill: var(--color-text);
}

.branch-line {
  stroke-dasharray: 5,5;
  animation: dash 20s linear infinite;
  opacity: 0.8;
}

.branch-line.merge {
  stroke-dasharray: 2,4;
  animation: dashMerge 15s linear infinite;
  opacity: 0.9;
  stroke-width: 3 !important;
  filter: drop-shadow(0 0 2px rgba(0,0,0,0.3));
}

.branch-line.branch {
  stroke-dasharray: 8,4;
  animation: dashBranch 25s linear infinite;
  opacity: 0.7;
}

@keyframes dash {
  to {
    stroke-dashoffset: -100;
  }
}

@keyframes dashMerge {
  to {
    stroke-dashoffset: -60;
  }
}

.branch-line.branch-out {
  stroke-dasharray: 4,2;
  animation: dashBranchOut 18s linear infinite;
  opacity: 0.8;
  stroke-width: 2 !important;
  filter: drop-shadow(0 0 1px rgba(0,0,0,0.4));
}

@keyframes dashBranchOut {
  to {
    stroke-dashoffset: -72;
  }
}

.graph-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 250px;
  color: #999;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 15px;
}

.graph-empty h4 {
  margin: 0 0 10px 0;
  color: #666;
}

.graph-empty p {
  margin: 0;
  color: #999;
}

/* Controls Panel */
.controls-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* State Panel */
.state-panel {
  width: 100%;
}

.state-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  padding: 20px;
}

.state-item {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 8px;
  padding: 20px 15px;
  text-align: center;
  transition: all 0.2s ease;
}

.state-item:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.state-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 5px;
}

.state-value {
  font-family: 'Courier New', monospace;
  font-size: 1.4rem;
  font-weight: 700;
  color: #333;
}

.current-branch {
  color: #1e7521;
}

/* Terminal */
.terminal-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Quick Commands Sidebar */
.quick-commands-sidebar {
  width: 100%;
  max-height: 450px;
  overflow-y: auto;
}

.quick-commands-sidebar .commands-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  padding: 15px;
}

.quick-commands-sidebar .command-btn {
  padding: 10px 12px;
  font-size: 0.85rem;
}

.quick-commands-sidebar .cmd-text {
  font-size: 0.8rem;
}

.quick-commands-sidebar .cmd-desc {
  font-size: 0.75rem;
}

.terminal-header {
  background: #2d3748;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.terminal-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'Courier New', monospace;
  font-weight: 600;
}

.terminal-controls {
   display: flex;
  gap: 8px;
}

.terminal-control {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
}

.terminal-control.close { background: #ff5f57; }
.terminal-control.minimize { background: #ffbd2e; }
.terminal-control.maximize { background: #28ca42; }

.terminal-body {
  background: #1a202c;
  color: #e2e8f0;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  padding: 20px;
  flex: 1;
  overflow-y: auto;
  min-height: 385px;
  max-height: 385px;
}

.command-history {
  margin-bottom: 15px;
}

.history-entry {
  margin-bottom: 5px;
  line-height: 1.4;
}

.command-line {
  color: #68d391;
}

.prompt {
  color: #68d391;
  font-weight: bold;
  user-select: none;
}

.command {
  color: #e2e8f0;
}

.output {
  color: #a0aec0;
  white-space: pre-wrap;
  margin-left: 20px;
}

.history-entry.error .output {
  color: #fc8181;
}

.input-line {
  display: flex;
  align-items: center;
  gap: 10px;
}

.command-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #e2e8f0;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.command-input::placeholder {
  color: #718096;
}

/* Quick Commands */
.commands-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  padding: 20px;
}

.command-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 8px;
  color: #333;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.command-btn:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.cmd-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.cmd-details {
  flex: 1;
}

.cmd-text {
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 2px;
}

.cmd-desc {
  font-size: 0.8rem;
  color: #666;
}

/* Hints Panel */
.hints-panel {
  margin-top: 20px;
}

.hints-list {
  padding: 20px;
  background: rgba(255, 248, 220, 0.8);
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.hint-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 15px;
}

.hint-item:last-child {
  margin-bottom: 0;
}

.hint-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #ff9800;
  color: white;
  border-radius: 50%;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
}

.hint-text {
  color: #333;
  line-height: 1.5;
  font-size: 0.9rem;
}

/* Commit Details Panel */
.commit-details-panel {
  min-height: 400px;
  width: 100%;
}

.commit-info {
  padding: 20px;
}

.commit-detail-item {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.commit-detail-item strong {
  color: var(--color-text);
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.commit-hash-detail {
  font-family: 'Courier New', monospace;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  color: var(--color-text);
  border: 1px solid #e0e0e0;
}

.commit-message-detail {
  background: rgba(33, 150, 243, 0.1);
  padding: 8px 12px;
  border-radius: 6px;
  border-left: 3px solid #2196F3;
  font-weight: 500;
  line-height: 1.4;
}

.commit-branch-detail {
  background: #4CAF50;
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 600;
  font-family: 'Courier New', monospace;
  display: inline-block;
  width: fit-content;
}

.merge-branch {
  background: #ff9800;
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 600;
  font-family: 'Courier New', monospace;
  display: inline-block;
  width: fit-content;
}

.branch-source {
  background: #9c27b0;
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 600;
  font-family: 'Courier New', monospace;
  display: inline-block;
  width: fit-content;
}

.branch-info {
  margin-top: 15px;
  text-align: center;
}

.branch-badge {
  display: inline-block;
  background: linear-gradient(135deg, #9c27b0, #7b1fa2);
  color: white;
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  box-shadow: 0 2px 8px rgba(156, 39, 176, 0.3);
}

.no-commit-selected {
  padding: 20px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.selection-prompt {
  text-align: center;
  color: var(--color-text);
}

.prompt-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.selection-prompt h4 {
  margin: 0 0 10px 0;
  color: var(--color-text);
  font-size: 1.2rem;
}

.selection-prompt p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
  color: #999;
}

.merge-badge {
  display: inline-block;
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

/* Toast Notifications */
.toasts {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
}

.toast {
  background: white;
  border-radius: 8px;
  padding: 15px 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  border-left: 4px solid;
  animation: slideInRight 0.3s ease-out;
  font-weight: 500;
}

.toast.success {
  border-left-color: #22c55e;
  background: #f0f9ff;
  color: #065f46;
}

.toast.error {
  border-left-color: #ef4444;
  background: #fef2f2;
  color: #991b1b;
}

.toast.info {
  border-left-color: #3b82f6;
  background: #eff6ff;
  color: #1e40af;
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
  
  .commit-details-panel {
    width: 100%;
  }
  
  .terminal-row {
    grid-template-columns: 1fr;
  }
  
  .quick-commands-sidebar {
    width: 100%;
    max-height: 300px;
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
  
  .commit-details-panel {
    width: 100%;
    min-height: auto;
  }
  
  .terminal-row {
    grid-template-columns: 1fr;
  }
  
  .quick-commands-sidebar {
    width: 100%;
    max-height: 250px;
  }
  
  .side-panels {
    grid-template-columns: 1fr;
  }
  
  .state-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .challenge-actions {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
  }
  
}

/* Animations */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Scrollbar Styling */
.terminal-body::-webkit-scrollbar {
  width: 8px;
}

.terminal-body::-webkit-scrollbar-track {
  background: #2d3748;
}

.terminal-body::-webkit-scrollbar-thumb {
  background: #4a5568;
  border-radius: 4px;
}

.terminal-body::-webkit-scrollbar-thumb:hover {
  background: #718096;
}
</style>
