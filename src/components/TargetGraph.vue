<template>
  <div class="target-graph" ref="graphContainer">
    <!-- Graph will be rendered here by gitgraph-js -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { createGitgraph } from '@gitgraph/js'
import type { GitChallenge } from '../challenges/git-challenges'

const props = defineProps<{
  targetState: GitChallenge['targetState']
}>()

const graphContainer = ref<HTMLElement | null>(null)
let gitgraph: any = null

onMounted(() => {
  if (graphContainer.value) {
    initializeGitGraph()
  }
})

watch(() => props.targetState, () => {
  if (graphContainer.value) {
    // Clear previous graph
    graphContainer.value.innerHTML = ''
    initializeGitGraph()
  }
}, { deep: true })

function initializeGitGraph() {
  if (!graphContainer.value) return

  // Initialize gitgraph with basic styling
  gitgraph = createGitgraph(graphContainer.value)

  // Create branches and commits from targetState
  const branches: { [key: string]: any } = {}
  
  // Create all branches first
  props.targetState.branches.forEach(branchName => {
    if (branchName === 'main') {
      branches[branchName] = gitgraph.branch(branchName)
    } else {
      // Other branches will be created when needed
      branches[branchName] = null
    }
  })

  // Create commits in order
  props.targetState.commits.forEach(commit => {
    // Create branch if it doesn't exist
    if (!branches[commit.branch]) {
      branches[commit.branch] = gitgraph.branch(commit.branch)
    }

    // If this commit has a parent, merge from that branch
    if (commit.parent) {
      const parentBranch = Object.entries(branches).find(([, branch]) => 
        branch && branch.commits.some((c: any) => c.hash === commit.parent)
      )?.[1]

      if (parentBranch) {
        branches[commit.branch].merge(parentBranch, commit.message)
      }
    } else {
      // Regular commit
      branches[commit.branch].commit(commit.message)
    }
  })
}
</script>

<style scoped>
.target-graph {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  min-height: 200px;
}
</style>