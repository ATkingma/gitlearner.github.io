<template>
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
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import type { ConsoleLog } from '../types/git-types'

const terminalInput = ref<HTMLInputElement | null>(null)
const terminalBody = ref<HTMLElement | null>(null)
const userCommand = ref('')

defineProps<{
  consoleLogs: ConsoleLog[]
}>()

const emit = defineEmits<{
  'execute-command': [command: string]
}>()

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
  
  emit('execute-command', command)
  userCommand.value = ''
  
  // Auto-scroll terminal to bottom
  nextTick(() => {
    if (terminalBody.value) {
      terminalBody.value.scrollTop = terminalBody.value.scrollHeight
    }
  })
}

function insertCommand(command: string) {
  userCommand.value = command
  // Removed auto-focus to prevent unwanted focus behavior when starting challenges
}

defineExpose({
  insertCommand,
  terminalInput
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

/* Terminal */
.terminal-container {
  flex: 1;
  display: flex;
  flex-direction: column;
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
