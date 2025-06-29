<template>
  <div class="quick-commands-sidebar card">
    <div class="panel-header">
      <h3>⚡ Quick Commands</h3>
    </div>
    <div class="commands-grid">
      <button @click="$emit('insert-command', 'git init')" class="command-btn btn">
        <span class="cmd-icon">🎯</span>
        <div class="cmd-details">
          <div class="cmd-text">git init</div>
          <div class="cmd-desc">Initialize repository</div>
        </div>
      </button>
      <button @click="$emit('insert-command', 'git add .')" class="command-btn btn">
        <span class="cmd-icon">📋</span>
        <div class="cmd-details">
          <div class="cmd-text">git add .</div>
          <div class="cmd-desc">Stage all files</div>
        </div>
      </button>
      <button @click="$emit('insert-command', 'git commit -m &quot;Initial commit&quot;')" class="command-btn btn">
        <span class="cmd-icon">💾</span>
        <div class="cmd-details">
          <div class="cmd-text">git commit</div>
          <div class="cmd-desc">Commit changes</div>
        </div>
      </button>
      <button @click="$emit('insert-command', 'git status')" class="command-btn btn">
        <span class="cmd-icon">📊</span>
        <div class="cmd-details">
          <div class="cmd-text">git status</div>
          <div class="cmd-desc">Check status</div>
        </div>
      </button>
      <button @click="$emit('insert-command', 'git branch')" class="command-btn btn">
        <span class="cmd-icon">🌿</span>
        <div class="cmd-details">
          <div class="cmd-text">git branch</div>
          <div class="cmd-desc">List branches</div>
        </div>
      </button>
      <button @click="$emit('insert-command', `git checkout -b feature-${Date.now().toString().slice(-4)}`)" class="command-btn btn">
        <span class="cmd-icon">🔀</span>
        <div class="cmd-details">
          <div class="cmd-text">git checkout -b</div>
          <div class="cmd-desc">Create new branch</div>
        </div>
      </button>
      <button @click="$emit('insert-command', 'git merge feature')" class="command-btn btn">
        <span class="cmd-icon">🔄</span>
        <div class="cmd-details">
          <div class="cmd-text">git merge</div>
          <div class="cmd-desc">Merge branch</div>
        </div>
      </button>
      <button @click="$emit('insert-command', 'git merge feature into main')" class="command-btn btn">
        <span class="cmd-icon">🔀</span>
        <div class="cmd-details">
          <div class="cmd-text">git merge ... into ...</div>
          <div class="cmd-desc">Merge into specific branch</div>
        </div>
      </button>
      <button @click="$emit('insert-command', 'git log --oneline --graph')" class="command-btn btn">
        <span class="cmd-icon">📊</span>
        <div class="cmd-details">
          <div class="cmd-text">git log --graph</div>
          <div class="cmd-desc">Show commit graph</div>
        </div>
      </button>
      <button @click="$emit('insert-command', 'git push origin main')" class="command-btn btn">
        <span class="cmd-icon">⬆️</span>
        <div class="cmd-details">
          <div class="cmd-text">git push origin</div>
          <div class="cmd-desc">Push to remote</div>
        </div>
      </button>
      <button @click="$emit('insert-command', 'git pull origin main')" class="command-btn btn">
        <span class="cmd-icon">⬇️</span>
        <div class="cmd-details">
          <div class="cmd-text">git pull origin</div>
          <div class="cmd-desc">Pull from remote</div>
        </div>
      </button>
      <button @click="$emit('insert-random-commit')" class="command-btn btn">
        <span class="cmd-icon">🎲</span>
        <div class="cmd-details">
          <div class="cmd-text">git commit (random)</div>
          <div class="cmd-desc">Commit with random ID</div>
        </div>
      </button>
      <button @click="$emit('insert-command', 'git config user.name &quot;Your Name&quot;')" class="command-btn btn">
        <span class="cmd-icon">👤</span>
        <div class="cmd-details">
          <div class="cmd-text">git config user.name</div>
          <div class="cmd-desc">Set author name</div>
        </div>
      </button>
      <button @click="$emit('insert-command', 'git show HEAD')" class="command-btn btn">
        <span class="cmd-icon">🔍</span>
        <div class="cmd-details">
          <div class="cmd-text">git show</div>
          <div class="cmd-desc">Show commit details</div>
        </div>
      </button>
      <button @click="$emit('insert-command', 'git rebase main')" class="command-btn btn">
        <span class="cmd-icon">🔧</span>
        <div class="cmd-details">
          <div class="cmd-text">git rebase</div>
          <div class="cmd-desc">Rebase onto branch</div>
        </div>
      </button>
      <button @click="$emit('insert-random-author-commit')" class="command-btn btn">
        <span class="cmd-icon">👨‍💻</span>
        <div class="cmd-details">
          <div class="cmd-text">git commit --author</div>
          <div class="cmd-desc">Commit with custom author</div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  'insert-command': [command: string]
  'insert-random-commit': []
  'insert-random-author-commit': []
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

/* Quick Commands Sidebar */
.quick-commands-sidebar {
  width: 100%;
  max-height: 450px;
  overflow-y: auto;
}

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

/* Responsive adjustments for sidebar */
@media (max-width: 1200px) {
  .quick-commands-sidebar {
    max-height: 300px;
  }
  
  .commands-grid .command-btn {
    padding: 10px 12px;
    font-size: 0.85rem;
  }
  
  .cmd-text {
    font-size: 0.8rem;
  }
  
  .cmd-desc {
    font-size: 0.75rem;
  }
}

@media (max-width: 768px) {
  .quick-commands-sidebar {
    max-height: 250px;
  }
}
</style>
