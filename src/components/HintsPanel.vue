<template>
  <div v-if="showHints && challenge" class="hints-panel card">
    <div class="panel-header">
      <h3>💡 Hints</h3>
    </div>
    <div class="hints-list">
      <div v-for="(hint, index) in challenge.hints" :key="index" class="hint-item">
        <div class="hint-number">{{ index + 1 }}</div>
        <div class="hint-text">{{ hint }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GitChallenge } from '../challenges/git-challenges'

defineProps<{
  showHints: boolean
  challenge: GitChallenge | null
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
</style>
