<template>
  <div class="difficulty-filter">
      <button 
      class="filter-button all" 
      :class="{ active: !modelValue }"
      @click="$emit('update:modelValue', null)"
    >
      All Levels
    </button>
    <button 
      v-for="difficulty in difficulties" 
      :key="difficulty"
      :class="['filter-button', difficulty.toLowerCase(), { active: modelValue === difficulty }]"
      @click="$emit('update:modelValue', difficulty)"
    >
      {{ difficulty }}
    </button>
  </div>
</template>

<script setup lang="ts">
const difficulties = ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master']

defineProps<{
  modelValue: string | null
}>()

defineEmits<{
  'update:modelValue': [value: string | null]
}>()
</script>

<style scoped>
.difficulty-filter {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
  margin: 2rem 0;
}

.filter-button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-card-border);
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  opacity: 0.7;
  background: var(--color-card-bg);
  color: var(--color-card-text);
  box-shadow: 0 2px 4px var(--color-card-shadow);
}

.filter-button:hover {
  opacity: 1;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px var(--color-card-hover-shadow);
}

.filter-button.active {
  opacity: 1;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px var(--color-card-hover-shadow);
  border-color: var(--color-success);
}

.filter-button.beginner {
  background: var(--color-card-bg);
  color: var(--color-beginner);
  border-color: var(--color-beginner);
}

.filter-button.beginner.active {
  background: var(--color-beginner);
  color: white;
}

.filter-button.intermediate {
  background: var(--color-card-bg);
  color: var(--color-intermediate);
  border-color: var(--color-intermediate);
}

.filter-button.intermediate.active {
  background: var(--color-intermediate);
  color: white;
}

.filter-button.advanced {
  background: var(--color-card-bg);
  color: var(--color-advanced);
  border-color: var(--color-advanced);
}

.filter-button.advanced.active {
  background: var(--color-advanced);
  color: white;
}

.filter-button.expert {
  background: var(--color-card-bg);
  color: var(--color-expert);
  border-color: var(--color-expert);
}

.filter-button.expert.active {
  background: var(--color-expert);
  color: white;
}

.filter-button.master {
  background: var(--color-card-bg);
  color: var(--color-master);
  border-color: var(--color-master);
}

.filter-button.master.active {
  background: var(--color-master);
  color: white;
}

.filter-button.all {
  background: var(--color-card-bg);
  color: var(--color-success);
  border-color: var(--color-success);
}

.filter-button.all.active {
  background: var(--color-success);
  color: white;
}
</style>
