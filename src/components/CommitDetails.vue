<template>
  <div class="commit-details-panel card">
    <div class="panel-header">
      <h3>🔍 Commit Details</h3>
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
</template>

<script setup lang="ts">
import type { GitCommit } from '../types/git-types'

defineProps<{
  selectedCommit: GitCommit | null
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

/* Responsive Design */
@media (max-width: 768px) {
  .commit-details-panel {
    min-height: auto;
  }
}
</style>
