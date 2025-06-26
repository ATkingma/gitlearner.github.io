<template>
  <span class="difficulty-badge" :class="difficulty">
    <span class="icon">{{ icon }}</span>
    {{ difficulty }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master'
}>()

const icon = computed(() => {
  switch (props.difficulty) {
    case 'beginner': return '🌱'
    case 'intermediate': return '🚀'
    case 'advanced': return '⭐'
    case 'expert': return '🏆'
    case 'master': return '👑'
  }
})
</script>

<style scoped>
.difficulty-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: capitalize;
}

.icon {
  font-size: 1.1em;
}

.beginner {
  background: var(--color-beginner);
  color: white;
}

.intermediate {
  background: var(--color-intermediate);
  color: white;
}

.advanced {
  background: var(--color-advanced);
  color: white;
}

.expert {
  background: var(--color-expert);
  color: white;
}

.master {
  background: var(--color-master);
  color: white;
}
</style>
