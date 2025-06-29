<template>
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
              @click="$emit('select-commit', commit)"
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
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import type { GitRepo, GitCommit, VisualCommit, BranchPath } from '../types/git-types'

const graphContainer = ref<HTMLElement | null>(null)

const props = defineProps<{
  gitRepo: GitRepo
}>()

const emit = defineEmits<{
  'select-commit': [commit: GitCommit]
}>()

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

// Computed properties for graph visualization
const visualCommits = computed(() => {
  const commitsByBranch: Record<string, GitCommit[]> = {}
  
  // Group commits by branch
  props.gitRepo.commits.forEach(commit => {
    if (!commitsByBranch[commit.branch]) {
      commitsByBranch[commit.branch] = []
    }
    commitsByBranch[commit.branch].push(commit)
  })
  
  // Sort commits by timestamp for proper x positioning
  const sortedCommits = [...props.gitRepo.commits].sort((a, b) => a.timestamp - b.timestamp)
  
  return sortedCommits.map((commit, index) => {
    const branchIndex = props.gitRepo.branches.indexOf(commit.branch)
    const baseY = 60 + (branchIndex * 70)
    
    // Add some vertical variation for visual appeal
    const yOffset = commit.message.includes('Merge') ? -10 : 0
    
    return {
      ...commit,
      x: 80 + (index * 120), // Increased spacing for better line visibility
      y: baseY + yOffset,
      color: branchColors[commit.branch] || branchColors.feature
    } as VisualCommit
  })
})

const branchPaths = computed(() => {
  const paths: BranchPath[] = []
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

function updateSvgDimensions() {
  if (graphContainer.value) {
    const commitCount = props.gitRepo.commits.length
    const branchCount = props.gitRepo.branches.length
    
    // Calculate width based on commits (with increased spacing)
    svgWidth.value = Math.max(600, 160 + (commitCount * 120))
    
    // Calculate height based on branches (with increased spacing)
    svgHeight.value = Math.max(200, 120 + (branchCount * 70))
  }
}

// Watch for changes in git repo to update dimensions
watch(() => [props.gitRepo.commits.length, props.gitRepo.branches.length], () => {
  updateSvgDimensions()
}, { flush: 'post' })

onMounted(() => {
  updateSvgDimensions()
  window.addEventListener('resize', updateSvgDimensions)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateSvgDimensions)
})

defineExpose({
  updateSvgDimensions
})
</script>

<style scoped>
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

.branch-line.branch-out {
  stroke-dasharray: 4,2;
  animation: dashBranchOut 18s linear infinite;
  opacity: 0.8;
  stroke-width: 2 !important;
  filter: drop-shadow(0 0 1px rgba(0,0,0,0.4));
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

@keyframes dashBranch {
  to {
    stroke-dashoffset: -120;
  }
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
</style>
