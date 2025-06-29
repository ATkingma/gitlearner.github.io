<template>
  <div class="toasts">
    <div 
      v-for="toast in toasts" 
      :key="toast.id"
      :class="['toast', toast.type]"
    >
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Toast } from '../types/git-types'

defineProps<{
  toasts: Toast[]
}>()
</script>

<style scoped>
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
</style>
