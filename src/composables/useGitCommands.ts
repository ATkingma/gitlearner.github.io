import { ref } from 'vue'
import type { GitRepo, GitCommit, ConsoleLog } from '../types/git-types'

export function useGitCommands() {
  // Git configuration
  const gitConfig = ref<Record<string, string>>({
    'user.name': 'Git Learner',
    'user.email': 'learner@gitlearner.com'
  })

  function generateRandomHash(): string {
    const chars = '0123456789abcdef'
    let hash = ''
    for (let i = 0; i < 7; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)]
    }
    return hash
  }

  function generateTimestamp(commitCount: number): number {
    const baseTimestamp = 1640995200000
    return baseTimestamp + (commitCount * 300000)
  }

  function parseAuthor(command: string): string {
    // Check for --author flag
    const authorMatch = command.match(/--author[=\s]+"([^"]+)"/i) || command.match(/--author[=\s]+([^\s]+)/i)
    if (authorMatch) {
      return authorMatch[1]
    }
    
    // Use configured user.name
    return gitConfig.value['user.name'] || 'Git Learner'
  }

  function parseEmail(command: string): string {
    // Extract email from --author if provided
    const authorMatch = command.match(/--author[=\s]+"[^<]*<([^>]+)>"/i)
    if (authorMatch) {
      return authorMatch[1]
    }
    
    // Use configured user.email
    return gitConfig.value['user.email'] || 'learner@gitlearner.com'
  }

  function executeCommandWithLog(
    command: string, 
    gitRepo: GitRepo, 
    consoleLogs: ConsoleLog[]
  ): void {
    // Add command to console
    consoleLogs.push({
      message: `$ ${command}`,
      type: 'input'
    })
    
    try {
      // Parse command properly
      const trimmedCommand = command.trim()
      const parts = trimmedCommand.split(/\s+/)
      const baseCommand = parts[0]
      
      // Handle non-git commands
      if (baseCommand !== 'git') {
        consoleLogs.push({
          message: `bash: ${baseCommand}: command not found`,
          type: 'error'
        })
        return
      }
      
      // Handle git help commands first (before other parsing)
      if (trimmedCommand === 'git --help' || trimmedCommand === 'git help') {
        showGitHelp(consoleLogs)
        return
      }
      
      if (trimmedCommand.startsWith('git help ')) {
        const helpTopic = trimmedCommand.replace('git help ', '').trim()
        showGitHelp(consoleLogs, helpTopic)
        return
      }
      
      // Now handle regular git commands
      const gitCommand = parts[1]
      
      // Handle git commands with proper parsing
      if (gitCommand === 'commit') {
        handleCommitCommand(trimmedCommand, gitRepo, consoleLogs)
      } else if (trimmedCommand.startsWith('git checkout -b')) {
        handleCheckoutNewBranch(trimmedCommand, gitRepo, consoleLogs)
      } else if (trimmedCommand.startsWith('git checkout')) {
        handleCheckout(trimmedCommand, gitRepo, consoleLogs)
      } else if (trimmedCommand.startsWith('git merge')) {
        handleMerge(trimmedCommand, gitRepo, consoleLogs)
      } else if (trimmedCommand.startsWith('git rebase')) {
        handleRebase(trimmedCommand, gitRepo, consoleLogs)
      } else if (trimmedCommand === 'git init') {
        handleInit(gitRepo, consoleLogs)
      } else if (trimmedCommand === 'git add .' || trimmedCommand === 'git add -A') {
        handleAddAll(gitRepo, consoleLogs)
      } else if (trimmedCommand.startsWith('git add ')) {
        handleAdd(trimmedCommand, gitRepo, consoleLogs)
      } else if (trimmedCommand === 'git status') {
        handleStatus(gitRepo, consoleLogs)
      } else if (trimmedCommand === 'git branch' || (trimmedCommand.startsWith('git branch ') && !trimmedCommand.includes('-d'))) {
        handleBranch(trimmedCommand, gitRepo, consoleLogs)
      } else if (trimmedCommand.startsWith('git branch -d')) {
        handleDeleteBranch(trimmedCommand, gitRepo, consoleLogs)
      } else if (trimmedCommand.startsWith('git push')) {
        handlePush(trimmedCommand, gitRepo, consoleLogs)
      } else if (trimmedCommand.startsWith('git pull')) {
        handlePull(trimmedCommand, gitRepo, consoleLogs)
      } else if (trimmedCommand.startsWith('git fetch')) {
        handleFetch(consoleLogs)
      } else if (trimmedCommand.startsWith('git diff')) {
        handleDiff(gitRepo, consoleLogs)
      } else if (trimmedCommand.startsWith('git config')) {
        handleConfig(trimmedCommand, gitConfig, consoleLogs)
      } else if (trimmedCommand.startsWith('git log')) {
        handleLog(trimmedCommand, gitRepo, consoleLogs)
      } else if (trimmedCommand.startsWith('git show')) {
        handleShow(trimmedCommand, gitRepo, consoleLogs)
      } else if (trimmedCommand.startsWith('git')) {
        consoleLogs.push({
          message: `git: '${trimmedCommand.split(' ')[1] || ''}' is not a git command. See 'git --help'.`,
          type: 'error'
        })
      } else {
        consoleLogs.push({
          message: `bash: ${trimmedCommand}: command not found`,
          type: 'error'
        })
      }
    } catch (error) {
      consoleLogs.push({
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error'
      })
    }
  }

  function handleCommitCommand(command: string, gitRepo: GitRepo, consoleLogs: ConsoleLog[]): void {
    if (gitRepo.staged.length === 0) {
      consoleLogs.push({
        message: 'Error: No changes staged for commit',
        type: 'error'
      })
      return
    }
    
    const message = command.includes('-m') 
      ? command.split('-m')[1].trim().replace(/["']/g, '')
      : 'New commit'
    
    const author = parseAuthor(command)
    
    const newCommit: GitCommit = {
      oid: generateRandomHash(),
      message,
      author,
      timestamp: generateTimestamp(gitRepo.commits.length),
      branch: gitRepo.currentBranch
    }
    
    gitRepo.commits.push(newCommit)
    gitRepo.staged = []
    
    consoleLogs.push({
      message: `[${gitRepo.currentBranch} ${newCommit.oid}] ${message}`,
      type: 'output'
    })
  }

  function handleCheckoutNewBranch(command: string, gitRepo: GitRepo, consoleLogs: ConsoleLog[]): void {
    const branchName = command.split('git checkout -b')[1].trim()
    if (!gitRepo.branches.includes(branchName)) {
      gitRepo.branches.push(branchName)
      
      // Find the last commit on the current branch to base the new branch from
      const currentBranchCommits = gitRepo.commits.filter(c => c.branch === gitRepo.currentBranch)
      let baseCommit = null
      
      if (currentBranchCommits.length > 0) {
        baseCommit = currentBranchCommits.reduce((latest, commit) => 
          commit.timestamp > latest.timestamp ? commit : latest
        )
      }
      
      // Create initial commit on new branch, branching from current branch
      const branchCommit: GitCommit = {
        oid: generateRandomHash(),
        message: `Branch from ${gitRepo.currentBranch}`,
        author: gitConfig.value['user.name'] || 'Git Learner',
        timestamp: generateTimestamp(gitRepo.commits.length),
        branch: branchName,
        branchedFrom: gitRepo.currentBranch,
        parentCommit: baseCommit?.oid
      }
      gitRepo.commits.push(branchCommit)
      
      const previousBranch = gitRepo.currentBranch
      gitRepo.currentBranch = branchName
      
      consoleLogs.push({
        message: `Switched to a new branch '${branchName}' (branched from '${previousBranch}')`,
        type: 'output'
      })
    } else {
      consoleLogs.push({
        message: `fatal: A branch named '${branchName}' already exists.`,
        type: 'error'
      })
    }
  }

  function handleCheckout(command: string, gitRepo: GitRepo, consoleLogs: ConsoleLog[]): void {
    const branchName = command.split('git checkout')[1].trim()
    if (gitRepo.branches.includes(branchName)) {
      gitRepo.currentBranch = branchName
      consoleLogs.push({
        message: `Switched to branch '${branchName}'`,
        type: 'output'
      })
    } else {
      consoleLogs.push({
        message: `Error: pathspec '${branchName}' did not match any file(s) known to git`,
        type: 'error'
      })
    }
  }

  function handleMerge(command: string, gitRepo: GitRepo, consoleLogs: ConsoleLog[]): void {
    const parts = command.split(' ')
    let sourceBranch = parts[2]
    let targetBranch = gitRepo.currentBranch
    
    const intoIndex = parts.indexOf('into')
    if (intoIndex !== -1 && parts[intoIndex + 1]) {
      targetBranch = parts[intoIndex + 1]
      if (gitRepo.branches.includes(targetBranch)) {
        gitRepo.currentBranch = targetBranch
        consoleLogs.push({
          message: `Switched to branch '${targetBranch}'`,
          type: 'output'
        })
      } else {
        consoleLogs.push({
          message: `Error: branch '${targetBranch}' not found.`,
          type: 'error'
        })
        return
      }
    }
    
    if (!sourceBranch) {
      consoleLogs.push({
        message: `Error: merge requires a branch name`,
        type: 'error'
      })
      return
    }
    
    if (gitRepo.branches.includes(sourceBranch)) {
      if (sourceBranch === targetBranch) {
        consoleLogs.push({
          message: `Already up to date.`,
          type: 'output'
        })
      } else {
        const branchCommits = gitRepo.commits.filter(c => c.branch === sourceBranch)
        if (branchCommits.length === 0) {
          consoleLogs.push({
            message: `Error: branch '${sourceBranch}' has no commits to merge`,
            type: 'error'
          })
          return
        }
        
        const targetCommits = gitRepo.commits.filter(c => c.branch === targetBranch)
        const lastTargetCommit = targetCommits[targetCommits.length - 1]
        const lastSourceCommit = branchCommits[branchCommits.length - 1]
        
        const mergeCommit: GitCommit = {
          oid: generateRandomHash(),
          message: `Merge branch '${sourceBranch}' into ${targetBranch}`,
          author: gitConfig.value['user.name'] || 'Git Learner',
          timestamp: generateTimestamp(gitRepo.commits.length),
          branch: targetBranch,
          mergeFrom: sourceBranch,
          mergeInto: targetBranch
        }
        gitRepo.commits.push(mergeCommit)
        
        const addedCommits = branchCommits.filter(bc => 
          !targetCommits.some(tc => tc.oid === bc.oid)
        ).length
        
        consoleLogs.push({
          message: `Merge made by the 'ort' strategy.
Merging:
  ${lastSourceCommit?.oid.substr(0, 7) || 'unknown'} ${lastSourceCommit?.message || ''}
  ${lastTargetCommit?.oid.substr(0, 7) || 'unknown'} ${lastTargetCommit?.message || ''}
found ${addedCommits} commit(s) from '${sourceBranch}' to merge into '${targetBranch}'.`,
          type: 'output'
        })
      }
    } else {
      consoleLogs.push({
        message: `Error: merge: ${sourceBranch} - not something we can merge`,
        type: 'error'
      })
    }
  }

  function handleRebase(command: string, gitRepo: GitRepo, consoleLogs: ConsoleLog[]): void {
    const branchName = command.split('git rebase')[1].trim()
    if (gitRepo.branches.includes(branchName)) {
      if (branchName === gitRepo.currentBranch) {
        consoleLogs.push({
          message: `Current branch ${gitRepo.currentBranch} is up to date.`,
          type: 'output'
        })
      } else {
        const rebaseCommit: GitCommit = {
          oid: generateRandomHash(),
          message: `Rebased ${gitRepo.currentBranch} onto ${branchName}`,
          author: gitConfig.value['user.name'] || 'Git Learner',
          timestamp: generateTimestamp(gitRepo.commits.length),
          branch: gitRepo.currentBranch
        }
        gitRepo.commits.push(rebaseCommit)
        consoleLogs.push({
          message: `Successfully rebased and updated refs/heads/${gitRepo.currentBranch}.`,
          type: 'output'
        })
      }
    } else {
      consoleLogs.push({
        message: `Error: invalid upstream ${branchName}`,
        type: 'error'
      })
    }
  }

  function handleInit(gitRepo: GitRepo, consoleLogs: ConsoleLog[]): void {
    gitRepo.currentBranch = 'main'
    gitRepo.commits = []
    gitRepo.branches = ['main']
    gitRepo.staged = []
    
    consoleLogs.push({
      message: 'Initialized empty Git repository in /challenge/.git/',
      type: 'output'
    })
  }

  function handleAddAll(gitRepo: GitRepo, consoleLogs: ConsoleLog[]): void {
    gitRepo.staged = ['file1.txt', 'file2.txt']
    consoleLogs.push({
      message: 'Changes staged for commit',
      type: 'output'
    })
  }

  function handleAdd(command: string, gitRepo: GitRepo, consoleLogs: ConsoleLog[]): void {
    const files = command.split('git add ')[1].trim()
    if (files) {
      gitRepo.staged = files.split(' ').filter(f => f.trim())
      consoleLogs.push({
        message: `Staged files: ${files}`,
        type: 'output'
      })
    } else {
      consoleLogs.push({
        message: 'Nothing specified, nothing added.',
        type: 'output'
      })
    }
  }

  function handleStatus(gitRepo: GitRepo, consoleLogs: ConsoleLog[]): void {
    let statusOutput = `On branch ${gitRepo.currentBranch}\n`
    if (gitRepo.staged.length > 0) {
      statusOutput += '\nChanges to be committed:\n'
      gitRepo.staged.forEach(file => {
        statusOutput += `\t${file}\n`
      })
    } else {
      statusOutput += 'nothing to commit, working tree clean'
    }
    consoleLogs.push({
      message: statusOutput,
      type: 'output'
    })
  }

  function handleBranch(command: string, gitRepo: GitRepo, consoleLogs: ConsoleLog[]): void {
    const parts = command.split(' ')
    const branchName = parts.length > 2 ? parts[2].trim() : ''
    
    if (!branchName) {
      let branchOutput = ''
      gitRepo.branches.forEach(branch => {
        if (branch === gitRepo.currentBranch) {
          branchOutput += `* ${branch}\n`
        } else {
          branchOutput += `  ${branch}\n`
        }
      })
      consoleLogs.push({
        message: branchOutput.trim(),
        type: 'output'
      })
    } else {
      if (!gitRepo.branches.includes(branchName)) {
        gitRepo.branches.push(branchName)
        consoleLogs.push({
          message: `Created branch '${branchName}' (based on '${gitRepo.currentBranch}')`,
          type: 'output'
        })
      } else {
        consoleLogs.push({
          message: `fatal: A branch named '${branchName}' already exists.`,
          type: 'error'
        })
      }
    }
  }

  function handleDeleteBranch(command: string, gitRepo: GitRepo, consoleLogs: ConsoleLog[]): void {
    const branchName = command.split('git branch -d')[1].trim()
    if (branchName === gitRepo.currentBranch) {
      consoleLogs.push({
        message: `error: Cannot delete branch '${branchName}' checked out at`,
        type: 'error'
      })
    } else if (gitRepo.branches.includes(branchName)) {
      gitRepo.branches = gitRepo.branches.filter(b => b !== branchName)
      consoleLogs.push({
        message: `Deleted branch ${branchName}`,
        type: 'output'
      })
    } else {
      consoleLogs.push({
        message: `error: branch '${branchName}' not found.`,
        type: 'error'
      })
    }
  }

  function handlePush(command: string, gitRepo: GitRepo, consoleLogs: ConsoleLog[]): void {
    const parts = command.split(' ')
    const remote = parts[2] || 'origin'
    const branch = parts[3] || gitRepo.currentBranch
    
    consoleLogs.push({
      message: `To ${remote}
 * [new branch]      ${branch} -> ${branch}`,
      type: 'output'
    })
  }

  function handlePull(command: string, gitRepo: GitRepo, consoleLogs: ConsoleLog[]): void {
    const parts = command.split(' ')
    const remote = parts[2] || 'origin'
    const branch = parts[3] || gitRepo.currentBranch
    
    consoleLogs.push({
      message: `From ${remote}
 * branch            ${branch}     -> FETCH_HEAD
Already up to date.`,
      type: 'output'
    })
  }

  function handleFetch(consoleLogs: ConsoleLog[]): void {
    consoleLogs.push({
      message: `remote: Enumerating objects: 3, done.
remote: Counting objects: 100% (3/3), done.
remote: Total 3 (delta 0), reused 0 (delta 0), pack-reused 0`,
      type: 'output'
    })
  }

  function handleDiff(gitRepo: GitRepo, consoleLogs: ConsoleLog[]): void {
    if (gitRepo.staged.length > 0) {
      consoleLogs.push({
        message: `diff --git a/file1.txt b/file1.txt
index 1234567..abcdefg 100644
--- a/file1.txt
+++ b/file1.txt
@@ -1,3 +1,4 @@
 line 1
 line 2
+new line
 line 3`,
        type: 'output'
      })
    } else {
      consoleLogs.push({
        message: ``,
        type: 'output'
      })
    }
  }

  function handleConfig(command: string, gitConfig: any, consoleLogs: ConsoleLog[]): void {
    const configParts = command.split(/\s+/)
    
    if (configParts.length >= 3) {
      const action = configParts[2]
      
      if (action === '--list' || action === '-l') {
        let configOutput = ''
        Object.entries(gitConfig.value).forEach(([key, value]) => {
          configOutput += `${key}=${value}\n`
        })
        consoleLogs.push({
          message: configOutput.trim() || 'No configuration found',
          type: 'output'
        })
      } else if (action === '--global' || action === '--local') {
        if (configParts.length >= 5) {
          const key = configParts[3]
          const value = configParts.slice(4).join(' ').replace(/["']/g, '')
          gitConfig.value[key] = value
          consoleLogs.push({
            message: `Configuration set: ${key} = ${value}`,
            type: 'output'
          })
        } else {
          consoleLogs.push({
            message: 'Usage: git config --global <key> <value>',
            type: 'error'
          })
        }
      } else if (configParts.length >= 4) {
        const key = action
        const value = configParts.slice(3).join(' ').replace(/["']/g, '')
        gitConfig.value[key] = value
        consoleLogs.push({
          message: `Configuration set: ${key} = ${value}`,
          type: 'output'
        })
      } else {
        const key = action
        const value = gitConfig.value[key]
        if (value) {
          consoleLogs.push({
            message: value,
            type: 'output'
          })
        } else {
          consoleLogs.push({
            message: `No configuration found for key: ${key}`,
            type: 'error'
          })
        }
      }
    } else {
      consoleLogs.push({
        message: 'Usage: git config [--global|--local] <key> [<value>] or git config --list',
        type: 'error'
      })
    }
  }

  function handleLog(command: string, gitRepo: GitRepo, consoleLogs: ConsoleLog[]): void {
    if (gitRepo.commits.length === 0) {
      consoleLogs.push({
        message: 'fatal: your current branch \'main\' does not have any commits yet',
        type: 'error'
      })
    } else {
      let logOutput = ''
      
      if (command.includes('--oneline') && command.includes('--graph')) {
        const sortedCommits = [...gitRepo.commits].sort((a, b) => b.timestamp - a.timestamp)
        sortedCommits.forEach((commit, index) => {
          const isMerge = commit.mergeFrom || commit.message.toLowerCase().includes('merge')
          const isFirstCommit = index === sortedCommits.length - 1
          
          let graphSymbol = '* '
          if (isMerge) {
            graphSymbol = '*   '
          } else if (!isFirstCommit) {
            graphSymbol = '| * '
          }
          
          let commitLine = `${graphSymbol}${commit.oid.substr(0, 7)} ${commit.message}`
          if (commit.mergeFrom) {
            commitLine += ` (${commit.mergeFrom} → ${commit.mergeInto})`
          }
          logOutput += `${commitLine}\n`
          
          if (isMerge && index < sortedCommits.length - 1) {
            logOutput += '|\\  \n'
            if (commit.mergeFrom) {
              logOutput += `| * ${commit.mergeFrom} commit\n`
            }
          }
        })
      } else if (command.includes('--oneline')) {
        gitRepo.commits.slice().reverse().forEach(commit => {
          logOutput += `${commit.oid.substr(0, 7)} ${commit.message}\n`
        })
      } else {
        gitRepo.commits.slice().reverse().forEach(commit => {
          logOutput += `commit ${commit.oid}\n`
          logOutput += `Author: ${commit.author}\n`
          logOutput += `Date: ${new Date(commit.timestamp).toLocaleString()}\n\n`
          logOutput += `    ${commit.message}\n\n`
        })
      }
      
      consoleLogs.push({
        message: logOutput.trim(),
        type: 'output'
      })
    }
  }

  function handleShow(command: string, gitRepo: GitRepo, consoleLogs: ConsoleLog[]): void {
    if (gitRepo.commits.length === 0) {
      consoleLogs.push({
        message: 'fatal: bad default revision \'HEAD\'',
        type: 'error'
      })
    } else {
      const parts = command.split(' ')
      let commitToShow = gitRepo.commits[gitRepo.commits.length - 1]
      
      if (parts.length > 2) {
        const hash = parts[2]
        const foundCommit = gitRepo.commits.find(c => c.oid.startsWith(hash))
        if (foundCommit) {
          commitToShow = foundCommit
        } else {
          consoleLogs.push({
            message: `fatal: ambiguous argument '${hash}': unknown revision or path not in the working tree.`,
            type: 'error'
          })
          return
        }
      }
      
      let showOutput = `commit ${commitToShow.oid}\n`
      showOutput += `Author: ${commitToShow.author} <${parseEmail('')}>\n`
      showOutput += `Date: ${new Date(commitToShow.timestamp).toLocaleString()}\n\n`
      showOutput += `    ${commitToShow.message}\n`
      
      if (commitToShow.mergeFrom) {
        showOutput += `\nMerge: ${commitToShow.mergeFrom} → ${commitToShow.mergeInto}\n`
      }
      if (commitToShow.branchedFrom) {
        showOutput += `\nBranched from: ${commitToShow.branchedFrom}\n`
      }
      
      consoleLogs.push({
        message: showOutput,
        type: 'output'
      })
    }
  }

  function showGitHelp(consoleLogs: ConsoleLog[], command?: string): void {
    if (command) {
      const helpTexts: Record<string, string> = {
        'commit': `git-commit - Record changes to the repository

SYNOPSIS
       git commit [-m <msg>] [--author=<author>]

DESCRIPTION
       Create a new commit containing the current contents of the index and the given log message describing the changes.

OPTIONS
       -m <msg>, --message=<msg>
           Use the given <msg> as the commit message.
       
       --author=<author>
           Override the commit author. Format: "Name <email>" or "Name"

EXAMPLES
       git commit -m "Initial commit"
       git commit -m "Fix bug" --author="John Doe"
       git commit -m "Feature" --author="Jane Smith <jane@example.com>"`,

        'add': `git-add - Add file contents to the index

SYNOPSIS
       git add [--] <pathspec>...
       git add . 

DESCRIPTION
       This command updates the index using the current content found in the working tree, to prepare the content staged for the next commit.

OPTIONS
       .   Add all files in the current directory and subdirectories

EXAMPLES
       git add .
       git add file1.txt file2.txt`,

        'checkout': `git-checkout - Switch branches or restore working tree files

SYNOPSIS
       git checkout <branch>
       git checkout -b <new-branch>

DESCRIPTION
       Updates files in the working tree to match the version in the index or the specified tree.

OPTIONS
       -b <new-branch>
           Create a new branch and switch to it

EXAMPLES
       git checkout main
       git checkout -b feature-branch`,

        'merge': `git-merge - Join two or more development histories together

SYNOPSIS
       git merge <branch>
       git merge <source-branch> into <target-branch>

DESCRIPTION
       Incorporates changes from the named commits into the current branch.

EXAMPLES
       git merge feature-branch
       git merge feature into main`,

        'branch': `git-branch - List, create, or delete branches

SYNOPSIS
       git branch [<branchname>]
       git branch -d <branchname>

DESCRIPTION
       If no arguments are given, existing branches are listed.

OPTIONS
       -d <branchname>
           Delete a branch

EXAMPLES
       git branch
       git branch new-feature
       git branch -d old-feature`,

        'status': `git-status - Show the working tree status

SYNOPSIS
       git status

DESCRIPTION
       Displays paths that have differences between the index file and the current HEAD commit.

EXAMPLES
       git status`,

        'log': `git-log - Show commit logs

SYNOPSIS
       git log [--oneline] [--graph]

DESCRIPTION
       Shows the commit logs.

OPTIONS
       --oneline
           Show each commit on a single line
       --graph
           Draw a text-based graphical representation

EXAMPLES
       git log
       git log --oneline
       git log --oneline --graph`,

        'init': `git-init - Create an empty Git repository

SYNOPSIS
       git init

DESCRIPTION
       This command creates an empty Git repository.

EXAMPLES
       git init`,

        'rebase': `git-rebase - Reapply commits on top of another base tip

SYNOPSIS
       git rebase <branch>

DESCRIPTION
       Forward-port local commits to the updated upstream head.

EXAMPLES
       git rebase main`,

        'config': `git-config - Get and set repository or global options

SYNOPSIS
       git config [--global|--local] <key> [<value>]
       git config --list

DESCRIPTION
       Get and set configuration options for Git.

OPTIONS
       --global
           Use global config file
       --local  
           Use repository config file
       --list
           Show all configuration

EXAMPLES
       git config user.name "Your Name"
       git config user.email "your.email@example.com"
       git config --global user.name "Global Name"
       git config --list`,

        'show': `git-show - Show various types of objects

SYNOPSIS
       git show [<commit>]

DESCRIPTION
       Shows one or more objects (blobs, trees, tags and commits).

EXAMPLES
       git show
       git show HEAD
       git show <commit-hash>`
      }

      const helpText = helpTexts[command]
      if (helpText) {
        consoleLogs.push({
          message: helpText,
          type: 'output'
        })
      } else {
        consoleLogs.push({
          message: `No manual entry for git-${command}`,
          type: 'error'
        })
      }
    } else {
      consoleLogs.push({
        message: `usage: git [--version] [--help] [-C <path>] [-c <name>=<value>]
           [--exec-path[=<path>]] [--html-path] [--man-path] [--info-path]
           [-p | --paginate | -P | --no-pager] [--no-replace-objects] [--bare]
           [--git-dir=<path>] [--work-tree=<path>] [--namespace=<name>]
           [--super-prefix=<path>] [--config-env=<name>=<envvar>]
           <command> [<args>]

These are common Git commands used in various situations:

start a working area (see also: git help tutorial)
   init       Create an empty Git repository

work on the current change (see also: git help everyday)
   add        Add file contents to the index
   status     Show the working tree status
   diff       Show changes between commits, commit and working tree, etc
   commit     Record changes to the repository

grow, mark and tweak your common history
   branch     List, create, or delete branches
   checkout   Switch branches or restore working tree files
   merge      Join two or more development histories together
   rebase     Reapply commits on top of another base tip
   log        Show commit logs

examine the history and state (see also: git help revisions)
   show       Show various types of objects
   config     Set and get repository or global options

collaborate (see also: git help workflows)
   fetch      Download objects and refs from another repository
   pull       Fetch from and integrate with another repository or a local branch
   push       Update remote refs along with associated objects

'git help -a' and 'git help -g' list available subcommands and some
concept guides. See 'git help <command>' or 'git help <concept>'
to read about a specific subcommand or concept.`,
        type: 'output'
      })
    }
  }

  return {
    gitConfig,
    executeCommandWithLog,
    generateRandomHash,
    parseAuthor,
    parseEmail
  }
}
