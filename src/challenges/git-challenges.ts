export interface GitChallenge {
  id: number;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
  initialState: {
    branches: string[];
    commits: {
      branch: string;
      message: string;
      id?: string;
      parent?: string;
    }[];
  };
  targetState: {
    branches: string[];
    commits: {
      branch: string;
      message: string;
      parent?: string;
      id?: string;
    }[];
  };
  hints: string[];
  solution: string[];
}

export const gitChallenges: GitChallenge[] = [
  {
    id: 1,
    title: 'Your First Commit',
    description: 'Create your first commit in the main branch to start your Git journey.',
    difficulty: 'beginner',
    initialState: {
      branches: ['main'],
      commits: []
    },
    targetState: {
      branches: ['main'],
      commits: [
        { branch: 'main', message: 'Initial commit' }
      ]
    },
    hints: [
      'Use git commit -m "message" to create a commit',
      'Make sure to stage your changes first with git add'
    ],
    solution: [
      'git add .',
      'git commit -m "Commit"'
    ]
  },
  {
    id: 2,
    title: 'Branching Out',
    description: 'Create a new feature branch and make a commit in it.',
    difficulty: 'beginner',
    initialState: {
      branches: ['main'],
      commits: [
        { branch: 'main', message: 'Initial commit', id: 'initial' }
      ]
    },
    targetState: {
      branches: ['main', 'feature'],
      commits: [
        { branch: 'main', message: 'Initial commit', id: 'initial' },
        { branch: 'feature', message: 'Add new feature', parent: 'initial' }
      ]
    },
    hints: [
      'Use git branch to create a new branch',
      'Use git checkout to switch to the new branch',
      'Or use git checkout -b to do both in one command'
    ],
    solution: [
      'git checkout -b feature',
      'git commit -m "Add new feature"'
    ]
  },
  {
    id: 3,
    title: 'Merging Changes',
    description: 'Merge your feature branch back into main.',
    difficulty: 'intermediate',
    initialState: {
      branches: ['main', 'feature'],
      commits: [
        { branch: 'main', message: 'Initial commit', id: 'initial' },
        { branch: 'feature', message: 'Add new feature', id: 'feature', parent: 'initial' }
      ]
    },
    targetState: {
      branches: ['main', 'feature'],
      commits: [
        { branch: 'main', message: 'Initial commit', id: 'initial' },
        { branch: 'feature', message: 'Add new feature', id: 'feature', parent: 'initial' },
        { branch: 'main', message: 'Merge feature into main', parent: 'feature' }
      ]
    },
    hints: [
      'First switch back to the main branch',
      'Then use git merge to bring in changes from feature'
    ],
    solution: [
      'git checkout main',
      'git merge feature'
    ]  },
  {
    id: 4,
    title: 'Resolving Conflicts',
    description: 'Learn how to handle merge conflicts between branches.',
    difficulty: 'advanced',
    initialState: {
      branches: ['main', 'feature'],
      commits: [
        { branch: 'main', message: 'Initial commit', id: 'initial' },
        { branch: 'main', message: 'Update main file', id: 'main-update', parent: 'initial' },
        { branch: 'feature', message: 'Add new feature', id: 'feature', parent: 'initial' }
      ]
    },
    targetState: {
      branches: ['main', 'feature'],
      commits: [
        { branch: 'main', message: 'Initial commit', id: 'initial' },
        { branch: 'main', message: 'Update main file', id: 'main-update', parent: 'initial' },
        { branch: 'feature', message: 'Add new feature', id: 'feature', parent: 'initial' },
        { branch: 'main', message: 'Merge and resolve conflicts', parent: 'feature' }
      ]
    },
    hints: [
      'Switch to the main branch first',
      'Use git merge to start merging feature branch',
      'Resolve any conflicts that arise',
      'Complete the merge with a commit'
    ],
    solution: [
      'git checkout main',
      'git merge feature',
      'git add .',
      'git commit -m "Merge and resolve conflicts"'
    ]
  },
  {
    id: 5,
    title: 'Rebase Operation',
    description: 'Learn how to rebase your feature branch onto main.',
    difficulty: 'advanced',
    initialState: {
      branches: ['main', 'feature'],
      commits: [
        { branch: 'main', message: 'Initial commit', id: 'initial' },
        { branch: 'main', message: 'Update documentation', id: 'main-update', parent: 'initial' },
        { branch: 'feature', message: 'Start new feature', id: 'feature-start', parent: 'initial' },
        { branch: 'feature', message: 'Complete feature', id: 'feature-complete', parent: 'feature-start' }
      ]
    },
    targetState: {
      branches: ['main', 'feature'],
      commits: [
        { branch: 'main', message: 'Initial commit', id: 'initial' },
        { branch: 'main', message: 'Update documentation', id: 'main-update', parent: 'initial' },
        { branch: 'feature', message: 'Start new feature', id: 'feature-start', parent: 'main-update' },
        { branch: 'feature', message: 'Complete feature', id: 'feature-complete', parent: 'feature-start' }
      ]
    },
    hints: [
      'Make sure you are on the feature branch',
      'Use git rebase to move your changes on top of main',
      'The command is: git rebase main'
    ],
    solution: [
      'git checkout feature',
      'git rebase main'
    ]
  },
  {
    id: 6,
    title: 'Custom Author Challenge',
    description: 'Make commits with different author names using the --author flag.',
    difficulty: 'intermediate',
    initialState: {
      branches: ['main'],
      commits: [
        { branch: 'main', message: 'Initial commit', id: 'initial' }
      ]
    },
    targetState: {
      branches: ['main'],
      commits: [
        { branch: 'main', message: 'Initial commit', id: 'initial' },
        { branch: 'main', message: 'Feature by Alice' },
        { branch: 'main', message: 'Bugfix by Bob' }
      ]
    },
    hints: [
      'Use --author flag to specify a custom author',
      'Format: git commit -m "message" --author="Name <email>"',
      'You can also use git config user.name to set the default author'
    ],
    solution: [
      'git add .',
      'git commit -m "Feature by Alice" --author="Alice"',
      'git add .',
      'git commit -m "Bugfix by Bob" --author="Bob"'
    ]
  },
  {
    id: 7,
    title: 'Multi-Branch Workflow',
    description: 'Create multiple feature branches and merge them strategically.',
    difficulty: 'intermediate',
    initialState: {
      branches: ['main'],
      commits: [
        { branch: 'main', message: 'Initial project setup', id: 'initial' }
      ]
    },
    targetState: {
      branches: ['main', 'auth', 'ui'],
      commits: [
        { branch: 'main', message: 'Initial project setup', id: 'initial' },
        { branch: 'auth', message: 'Add authentication system' },
        { branch: 'ui', message: 'Create user interface' },
        { branch: 'main', message: 'Merge auth into main' },
        { branch: 'main', message: 'Merge ui into main' }
      ]
    },
    hints: [
      'Create two branches: auth and ui',
      'Make commits in each branch',
      'Merge both branches back to main',
      'Use git checkout -b to create and switch to new branches'
    ],
    solution: [
      'git checkout -b auth',
      'git add .',
      'git commit -m "Add authentication system"',
      'git checkout main',
      'git merge auth',
      'git checkout -b ui',
      'git add .',
      'git commit -m "Create user interface"',
      'git checkout main',
      'git merge ui'
    ]
  },
  {
    id: 8,
    title: 'Complex Merge Strategy',
    description: 'Practice merging specific branches into target branches using merge...into syntax.',
    difficulty: 'advanced',
    initialState: {
      branches: ['main', 'develop', 'feature'],
      commits: [
        { branch: 'main', message: 'Production ready', id: 'prod' },
        { branch: 'develop', message: 'Development base', id: 'dev' },
        { branch: 'feature', message: 'New awesome feature', id: 'feat' }
      ]
    },
    targetState: {
      branches: ['main', 'develop', 'feature'],
      commits: [
        { branch: 'main', message: 'Production ready', id: 'prod' },
        { branch: 'develop', message: 'Development base', id: 'dev' },
        { branch: 'feature', message: 'New awesome feature', id: 'feat' },
        { branch: 'develop', message: 'Merge feature into develop' },
        { branch: 'main', message: 'Merge develop into main' }
      ]
    },
    hints: [
      'Use the "merge...into" syntax to merge into specific branches',
      'First merge feature into develop',
      'Then merge develop into main',
      'Syntax: git merge <source-branch> into <target-branch>'
    ],
    solution: [
      'git merge feature into develop',
      'git merge develop into main'
    ]
  },
  {
    id: 9,
    title: 'Git Configuration Master',
    description: 'Set up your Git identity and commit with proper author information.',
    difficulty: 'beginner',
    initialState: {
      branches: ['main'],
      commits: []
    },
    targetState: {
      branches: ['main'],
      commits: [
        { branch: 'main', message: 'Configure Git identity' },
        { branch: 'main', message: 'First configured commit' }
      ]
    },
    hints: [
      'Use git config user.name to set your name',
      'Use git config user.email to set your email',
      'Then make commits that will use your configured identity',
      'You can check config with git config --list'
    ],
    solution: [
      'git config user.name "Your Name"',
      'git config user.email "your.email@example.com"',
      'git add .',
      'git commit -m "Configure Git identity"',
      'git add .',
      'git commit -m "First configured commit"'
    ]
  },
  {
    id: 10,
    title: 'Remote Repository Simulation',
    description: 'Practice pushing and pulling from a remote repository (simulated).',
    difficulty: 'intermediate',
    initialState: {
      branches: ['main'],
      commits: [
        { branch: 'main', message: 'Local development', id: 'local' }
      ]
    },
    targetState: {
      branches: ['main'],
      commits: [
        { branch: 'main', message: 'Local development', id: 'local' },
        { branch: 'main', message: 'Feature ready for remote' },
        { branch: 'main', message: 'After push and pull cycle' }
      ]
    },
    hints: [
      'Make a commit that represents work ready to push',
      'Use git push origin main to push to remote',
      'Use git pull origin main to sync from remote',
      'Make another commit to complete the cycle'
    ],
    solution: [
      'git add .',
      'git commit -m "Feature ready for remote"',
      'git push origin main',
      'git pull origin main',
      'git add .',
      'git commit -m "After push and pull cycle"'
    ]
  },
  {
    id: 11,
    title: 'Branch Cleanup Expert',
    description: 'Create, use, and clean up branches after merging.',
    difficulty: 'intermediate',
    initialState: {
      branches: ['main'],
      commits: [
        { branch: 'main', message: 'Starting point', id: 'start' }
      ]
    },
    targetState: {
      branches: ['main'],
      commits: [
        { branch: 'main', message: 'Starting point', id: 'start' },
        { branch: 'main', message: 'Merge temporary-feature into main' }
      ]
    },
    hints: [
      'Create a temporary feature branch',
      'Make a commit in the feature branch',
      'Merge it back to main',
      'Delete the feature branch after merging',
      'Use git branch -d to delete a branch'
    ],
    solution: [
      'git checkout -b temporary-feature',
      'git add .',
      'git commit -m "Temporary feature work"',
      'git checkout main',
      'git merge temporary-feature',
      'git branch -d temporary-feature'
    ]
  },
  {
    id: 12,
    title: 'Rebase vs Merge Master',
    description: 'Demonstrate the difference between rebase and merge workflows.',
    difficulty: 'advanced',
    initialState: {
      branches: ['main', 'feature-rebase', 'feature-merge'],
      commits: [
        { branch: 'main', message: 'Base commit', id: 'base' },
        { branch: 'main', message: 'Main development', id: 'main-dev' },
        { branch: 'feature-rebase', message: 'Rebase feature', id: 'rebase-feat' },
        { branch: 'feature-merge', message: 'Merge feature', id: 'merge-feat' }
      ]
    },
    targetState: {
      branches: ['main', 'feature-rebase', 'feature-merge'],
      commits: [
        { branch: 'main', message: 'Base commit', id: 'base' },
        { branch: 'main', message: 'Main development', id: 'main-dev' },
        { branch: 'feature-rebase', message: 'Rebased feature work' },
        { branch: 'feature-merge', message: 'Merge feature', id: 'merge-feat' },
        { branch: 'main', message: 'Merge feature-merge into main' }
      ]
    },
    hints: [
      'First rebase feature-rebase onto main',
      'Then merge feature-merge into main using regular merge',
      'This shows both rebase and merge strategies',
      'Rebase creates a linear history, merge preserves branch history'
    ],
    solution: [
      'git checkout feature-rebase',
      'git rebase main',
      'git add .',
      'git commit -m "Rebased feature work"',
      'git checkout main',
      'git merge feature-merge'
    ]
  },

  // Master Challenges
  {
    id: 13,
    title: 'Complex Multi-Branch Workflow',
    description: 'Master GitFlow methodology with features, hotfixes, and releases.',
    difficulty: 'master',
    initialState: {
      branches: ['main', 'develop'],
      commits: [
        { branch: 'main', message: 'Initial release v1.0.0' },
        { branch: 'develop', message: 'Start development v1.1.0' }
      ]
    },
    targetState: {
      branches: ['main', 'develop', 'feature/auth', 'feature/ui', 'hotfix/critical', 'release/v1.1.0'],
      commits: [
        { branch: 'main', message: 'Initial release v1.0.0' },
        { branch: 'develop', message: 'Start development v1.1.0' },
        { branch: 'feature/auth', message: 'Add authentication system' },
        { branch: 'feature/ui', message: 'Redesign user interface' },
        { branch: 'develop', message: 'Merge feature/auth into develop' },
        { branch: 'develop', message: 'Merge feature/ui into develop' },
        { branch: 'hotfix/critical', message: 'Fix security vulnerability' },
        { branch: 'main', message: 'Merge hotfix/critical into main' },
        { branch: 'develop', message: 'Merge hotfix/critical into develop' },
        { branch: 'release/v1.1.0', message: 'Prepare release v1.1.0' },
        { branch: 'release/v1.1.0', message: 'Update version numbers' },
        { branch: 'main', message: 'Merge release/v1.1.0 into main' },
        { branch: 'develop', message: 'Merge release/v1.1.0 into develop' }
      ]
    },
    hints: [
      'Follow GitFlow: feature branches from develop, hotfix from main',
      'Create feature/auth and feature/ui branches from develop',
      'Merge completed features back to develop',
      'Create hotfix/critical from main for urgent fixes',
      'Merge hotfix to both main and develop',
      'Create release branch when features are ready',
      'Merge release to both main and develop when complete'
    ],
    solution: [
      'git checkout develop',
      'git checkout -b feature/auth',
      'git add .',
      'git commit -m "Add authentication system"',
      'git checkout develop',
      'git checkout -b feature/ui',
      'git add .',
      'git commit -m "Redesign user interface"',
      'git checkout develop',
      'git merge feature/auth',
      'git merge feature/ui',
      'git checkout main',
      'git checkout -b hotfix/critical',
      'git add .',
      'git commit -m "Fix security vulnerability"',
      'git checkout main',
      'git merge hotfix/critical',
      'git checkout develop',
      'git merge hotfix/critical',
      'git checkout -b release/v1.1.0',
      'git add .',
      'git commit -m "Prepare release v1.1.0"',
      'git add .',
      'git commit -m "Update version numbers"',
      'git checkout main',
      'git merge release/v1.1.0',
      'git checkout develop',
      'git merge release/v1.1.0'
    ]
  },

  {
    id: 14,
    title: 'Advanced Cherry-Pick and Conflict Resolution',
    description: 'Cherry-pick commits between branches and handle conflicts.',
    difficulty: 'master',
    initialState: {
      branches: ['main', 'feature-a', 'feature-b'],
      commits: [
        { branch: 'main', message: 'Base application structure' },
        { branch: 'feature-a', message: 'Add user management' },
        { branch: 'feature-a', message: 'Fix user validation bug' },
        { branch: 'feature-a', message: 'Add user roles feature' },
        { branch: 'feature-b', message: 'Add payment system' },
        { branch: 'feature-b', message: 'Add payment validation' }
      ]
    },
    targetState: {
      branches: ['main', 'feature-a', 'feature-b', 'hotfix-validation'],
      commits: [
        { branch: 'main', message: 'Base application structure' },
        { branch: 'feature-a', message: 'Add user management' },
        { branch: 'feature-a', message: 'Fix user validation bug' },
        { branch: 'feature-a', message: 'Add user roles feature' },
        { branch: 'feature-b', message: 'Add payment system' },
        { branch: 'feature-b', message: 'Add payment validation' },
        { branch: 'hotfix-validation', message: 'Fix user validation bug' },
        { branch: 'hotfix-validation', message: 'Fix payment validation bug' },
        { branch: 'main', message: 'Merge validation fixes' },
        { branch: 'feature-a', message: 'Merge validation fixes from main' },
        { branch: 'feature-b', message: 'Merge validation fixes from main' }
      ]
    },
    hints: [
      'Create a hotfix branch from main to collect critical fixes',
      'Use cherry-pick to get specific validation fixes from both feature branches',
      'The validation fixes are the 2nd commit in feature-a and 2nd commit in feature-b',
      'Merge the hotfix back to main and then to both feature branches',
      'This simulates taking specific fixes without merging entire features'
    ],
    solution: [
      'git checkout main',
      'git checkout -b hotfix-validation',
      'git log --oneline feature-a',
      'git cherry-pick <fix-user-validation-commit>',
      'git log --oneline feature-b', 
      'git cherry-pick <fix-payment-validation-commit>',
      'git checkout main',
      'git merge hotfix-validation',
      'git checkout feature-a',
      'git merge main',
      'git checkout feature-b',
      'git merge main'
    ]
  },

  // Expert Challenges
  {
    id: 15,
    title: 'Interactive Rebase and History Rewriting',
    description: 'Rewrite Git history with interactive rebase.',
    difficulty: 'expert',
    initialState: {
      branches: ['main'],
      commits: [
        { branch: 'main', message: 'Initial project setup' },
        { branch: 'main', message: 'WIP: adding feature' },
        { branch: 'main', message: 'Fix typo' },
        { branch: 'main', message: 'Add more feature code' },
        { branch: 'main', message: 'Another small fix' },
        { branch: 'main', message: 'Complete feature implementation' },
        { branch: 'main', message: 'Update documentation' }
      ]
    },
    targetState: {
      branches: ['main'],
      commits: [
        { branch: 'main', message: 'Initial project setup' },
        { branch: 'main', message: 'Implement user authentication feature' },
        { branch: 'main', message: 'Update documentation' }
      ]
    },
    hints: [
      'Use interactive rebase to clean up the messy commit history',
      'Squash related commits into meaningful commits',
      'The WIP, fix typo, and small fix commits should be combined',
      'Rewrite commit messages to be more descriptive',
      'This simulates cleaning up feature branch history before merging'
    ],
    solution: [
      'git log --oneline',
      'git rebase -i HEAD~6',
      '# In the interactive rebase editor:',
      '# - Keep the first commit as "pick"',
      '# - Squash WIP, fix typo, add more code, and small fix into one commit',
      '# - Edit the combined commit message to "Implement user authentication feature"',
      '# - Keep the documentation commit separate',
      'git add .',
      'git commit -m "Implement user authentication feature"'
    ]
  },

  {
    id: 16,
    title: 'Complex Merge Conflict Resolution Workflow',
    description: 'Resolve conflicts across multiple team branches.',
    difficulty: 'expert',
    initialState: {
      branches: ['main', 'frontend-team', 'backend-team', 'devops-team'],
      commits: [
        { branch: 'main', message: 'Project foundation' },
        { branch: 'frontend-team', message: 'Update package.json dependencies' },
        { branch: 'frontend-team', message: 'Add React components' },
        { branch: 'backend-team', message: 'Update package.json with server deps' },
        { branch: 'backend-team', message: 'Add API endpoints' },
        { branch: 'devops-team', message: 'Update package.json with build tools' },
        { branch: 'devops-team', message: 'Add Docker configuration' }
      ]
    },
    targetState: {
      branches: ['main', 'frontend-team', 'backend-team', 'devops-team', 'integration'],
      commits: [
        { branch: 'main', message: 'Project foundation' },
        { branch: 'frontend-team', message: 'Update package.json dependencies' },
        { branch: 'frontend-team', message: 'Add React components' },
        { branch: 'backend-team', message: 'Update package.json with server deps' },
        { branch: 'backend-team', message: 'Add API endpoints' },
        { branch: 'devops-team', message: 'Update package.json with build tools' },
        { branch: 'devops-team', message: 'Add Docker configuration' },
        { branch: 'integration', message: 'Merge frontend changes' },
        { branch: 'integration', message: 'Resolve package.json conflicts with backend' },
        { branch: 'integration', message: 'Resolve package.json conflicts with devops' },
        { branch: 'integration', message: 'Final integration testing' },
        { branch: 'main', message: 'Merge integration branch' }
      ]
    },
    hints: [
      'Create an integration branch to merge all team branches',
      'Each team modified package.json - conflicts are expected',
      'Merge teams one by one, resolving conflicts carefully',
      'Start with frontend, then backend, then devops',
      'Each merge will likely conflict on package.json',
      'Create a commit after resolving each set of conflicts',
      'Finally merge the clean integration branch to main'
    ],
    solution: [
      'git checkout main',
      'git checkout -b integration',
      'git merge frontend-team',
      'git add .',
      'git commit -m "Merge frontend changes"',
      'git merge backend-team',
      '# Resolve package.json conflicts manually',
      'git add package.json',
      'git commit -m "Resolve package.json conflicts with backend"',
      'git merge devops-team',
      '# Resolve package.json conflicts manually again',
      'git add package.json', 
      'git commit -m "Resolve package.json conflicts with devops"',
      'git add .',
      'git commit -m "Final integration testing"',
      'git checkout main',
      'git merge integration'
    ]
  }
];
