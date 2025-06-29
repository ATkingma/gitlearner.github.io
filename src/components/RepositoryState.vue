<template>
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
</template>

<script setup lang="ts">
import type { GitRepo } from '../types/git-types'

defineProps<{
  gitRepo: GitRepo
}>()
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

/* Responsive Design */
@media (max-width: 768px) {
  .state-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
