---
"@ai-hero/sandcastle": patch
---

Serialize concurrent git worktree mutations to stop parallel runs deleting each other's worktrees.

`git worktree` add/remove/prune mutate the shared `.git/worktrees/` admin tree and are not safe to run concurrently on one repo. With parallel `createSandbox()` callers (or a dispose racing a sibling's create), one caller's `pruneStale` treats another's in-flight `git worktree add` as stale and removes its admin dir, breaking that sibling mid-run with `fatal: not a git repository: .git/worktrees/<name>`. Fixes mattpocock/sandcastle#849, related to #642.

`WorktreeManager.create`, `remove`, and `pruneStale` now run under a single in-process permit. The guarded git ops are milliseconds long; the expensive `onSandboxReady` hooks run outside the lock, so sandbox-setup concurrency is preserved.
