# Git & IntelliJ Interview Guide

---

## 1. Git Fundamentals & Object Model

### Concept Brief

Git stores commits as snapshots of files referenced by SHA hashes. Three major areas: working tree, staging area (index), and repository. Objects include blobs, trees, commits, and annotated tags.

### Why It Matters

- **Confidence**: Understand what `git add`/`git commit` actually do.
- **Recovery**: Use hashes and reflog to restore lost work.
- **Collaboration**: Explain Git internals during interviews and code reviews.

### Practical Walkthrough

```bash
# Inspect object types
git cat-file -t HEAD
git cat-file -p HEAD^{tree}

# Stage specific hunks
git add -p src/main/java/com/bhopal/orders/OrderService.java

# View reflog for lost commits
git reflog show --date=iso
```

### Follow-Up Questions

- How does Git differ from centralized VCS (SVN) at the storage level?
- When would you use `git stash` vs feature branches?
- How do you recover a commit that was reset or amended?

---

## 2. Branching Strategy & Commit Hygiene

### Concept Brief

Branch naming conventions, short-lived branches, atomic commits, and commit message standards keep history readable and auditable.

### Why It Matters

- **Traceability**: Link Bhopal work to Jira tickets easily.
- **Reviewability**: Focused commits simplify diff reviews.
- **Automation**: Semantic commits power changelog generation.

### Practical Walkthrough

```text
feature/BHOPAL-123-loyalty-upgrade
fix/BHOPAL-404-hotfix
release/bhopal-2025-11
```

```text
BHOPAL-123: add loyalty accrual endpoint

- add controller with validation
- cover service with unit tests

Impact: Backend
Tests: Unit, Integration
```

### Follow-Up Questions

- What criteria determine commit granularity?
- How do you enforce naming conventions (hooks, templates)?
- When do you squash commits vs preserve them?

---

## 3. Advanced Git Workflows (Rebase, Squash, Cherry-Pick)

### Concept Brief

Interactive rebase refines history, squashing condenses commits, and cherry-pick replays changes onto other branches (hotfixes).

### Why It Matters

- **Clarity**: Maintain clean history for Bhopal release audits.
- **Recovery**: Move critical fixes to release branches quickly.
- **Consistency**: Align with trunk-based or GitFlow workflows.

### Practical Walkthrough

```bash
git fetch origin
git rebase -i origin/main
# pick, squash, reword commits

# Cherry-pick hotfix onto release
git checkout release/bhopal-2025-11
git cherry-pick a1b2c3d4
```

### Follow-Up Questions

- How do you resolve conflicts during rebase while preserving context?
- When is `git merge --no-ff` preferable to rebase?
- How do you recover from a failed rebase using reflog?

---

## 4. Git Hooks, Automation & Quality Gates

### Concept Brief

Client-side hooks (pre-commit, pre-push) and server-side hooks enforce standards (linting, commit messages, secret scans) before changes leave the machine.

### Why It Matters

- **Quality**: Catch lint/test failures before CI.
- **Security**: Prevent secrets from leaving laptops.
- **Consistency**: Standardize commit messages for Bhopal squads.

### Practical Walkthrough

```bash
# .git/hooks/pre-commit
#!/bin/sh
mvn -pl bhopal-services -am test || exit 1

# .git/hooks/commit-msg
PATTERN='^(BHOPAL|OPS)-[0-9]+: '
MSG=$(cat "$1")
if ! echo "$MSG" | grep -Eq "$PATTERN"; then
  echo "Commit message must start with BHOPAL-123: ..."
  exit 1
fi
```

### Follow-Up Questions

- How do you distribute hooks (Husky, Lefthook, custom scripts)?
- When do you rely on server-side hooks or CI checks instead?
- How do you bypass hooks for emergency hotfixes safely?

---

## 5. Monorepos, Submodules & Git LFS

### Concept Brief

Monorepos house multiple projects in one repo; submodules link external repos; Git LFS handles large binaries by storing pointers in Git.

### Why It Matters

- **Alignment**: Bhopal platform may centralize microservices.
- **Performance**: Manage large files (assets, models) efficiently.
- **Dependency Management**: Keep shared libraries in sync.

### Practical Walkthrough

```bash
# Add submodule
git submodule add https://github.com/org/shared-lib libs/shared

git lfs install
git lfs track "*.psd"
```

### Follow-Up Questions

- What trade-offs exist between multi-repo and monorepo strategies?
- How do you update submodules atomically?
- When should you choose Git LFS vs object storage (S3, Artifactory)?

---

## 6. Conflict Resolution & Rebase Strategies

### Concept Brief

Advanced conflict handling uses rerere (`reuse recorded resolution`), IntelliJ’s merge tools, and conflict checklists to avoid regressions.

### Why It Matters

- **Speed**: Resolve Bhopal release conflicts quickly.
- **Accuracy**: Prevent accidental code loss.
- **Knowledge Sharing**: Document recurring conflict patterns.

### Practical Walkthrough

```bash
git config --global rerere.enabled true
git rebase origin/main
# Resolve conflicts in IntelliJ merge window
```

### Follow-Up Questions

- How do you manage conflicts in binary files or generated assets?
- When would you abort a rebase and fall back to merge?
- How do you coach teams to avoid conflict-prone patterns?

---

## 7. Release Management, Tags & Semantic Versioning

### Concept Brief

Tags mark releases; semantic versioning communicates change impact; signed tags (`-s`) provide authenticity.

### Why It Matters

- **Traceability**: Identify Bhopal releases deployed to production.
- **Automation**: Drive release notes and deployment pipelines.
- **Compliance**: Signed tags satisfy audit requirements.

### Practical Walkthrough

```bash
# Create signed tag
git tag -s v2025.11.0 -m "Bhopal November release"
git push origin v2025.11.0
```

### Follow-Up Questions

- How do you generate changelogs automatically from commits?
- When do you use lightweight tags vs annotated vs signed?
- How do you roll back a release while preserving history?

---

## 8. Pull Request Hygiene & Code Review Workflow

### Concept Brief

Structured PRs include checklists, linked tickets, testing evidence, screenshots, and rollback plans.

### Why It Matters

- **Review Efficiency**: Focused diffs accelerate approvals.
- **Knowledge Sharing**: PR descriptions document decisions.
- **Risk Mitigation**: Rollback plan ready before merge.

### Practical Walkthrough

```text
PR Checklist
- [ ] Linked Jira (BHOPAL-123)
- [ ] Added/updated tests
- [ ] Screenshots/logs attached
- [ ] Rollback plan documented
```

### Follow-Up Questions

- How do you enforce PR size limits or diff thresholds?
- What metrics track review turnaround and rework rates?
- How do you document rollback strategies within PR templates?

---

## 9. CI/CD Integration & Quality Gates

### Concept Brief

Git events trigger pipelines (Jenkins, GitHub Actions) that build, test, run quality gates, and deploy artifacts.

### Why It Matters

- **Automation**: Every Bhopal push exercises the same checks.
- **Visibility**: Status checks block merges until green.
- **Audit**: Pipelines log build provenance for compliance.

### Practical Walkthrough

```yaml
name: Bhopal CI
on:
  push:
    branches: ["main", "release/**"]
  pull_request:
    branches: ["main"]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: 17
      - run: mvn clean verify -Pbhopal
      - run: mvn sonar:sonar -DskipTests
```

### Follow-Up Questions

- How do you enforce branch protection and required status checks?
- What caching strategies speed up Maven/Gradle builds in CI?
- How do you integrate Jira/Slack notifications with pipeline outcomes?

---

## 10. IntelliJ Project Setup & Settings Sync

### Concept Brief

Configure IntelliJ SDKs, project structure, code styles, and share settings via Settings Repository or IDE Sync.

### Why It Matters

- **Consistency**: Bhopal developers share identical formatter rules.
- **Onboarding**: New hires clone settings and start shipping quickly.
- **Reliability**: Prevent mysterious build issues due to mismatched SDKs.

### Practical Walkthrough

- Set Project SDK (17) and language level.
- Share `.editorconfig` and code style via `File > Manage IDE Settings > Export`.
- Enable Settings Sync (2024.x) for keymaps, inspections, live templates.

### Follow-Up Questions

- How do you manage per-project JDK vs global JDK settings?
- When do you use `.editorconfig` vs IntelliJ XML code styles?
- How do you share Run/Debug configurations with the team?

---

## 11. IntelliJ Navigation & Productivity Shortcuts

### Concept Brief

Leverage navigation (`Search Everywhere`, `Recent Files`, `Navigate to Test`), multi-cursor editing, scratch files, and the HTTP client.

### Why It Matters

- **Speed**: Jump between Bhopal modules instantly.
- **Context**: Scratch files for SQL/snippet experimentation.
- **Testing**: HTTP client sends API calls without leaving IDE.

### Practical Walkthrough

- `Shift` twice (Search Everywhere).
- `⌘E` (Recent Files), `⌘⇧E` (Recent Locations).
- `⌥Enter` (context actions), `⌘⌥L` (Reformat).
- `.http` file request:
  ```
  ### Get Bhopal order
  GET http://localhost:8080/bhopal/orders/ORD-123
  Authorization: Bearer {{token}}
  ```

### Follow-Up Questions

- How do you customize keymaps for pair programming or different OSes?
- When do you use IntelliJ HTTP client vs Postman or curl?
- How do you automate repetitive edits with macros or structural replace?

---

## 12. IntelliJ Inspections, Refactoring & Code Analysis

### Concept Brief

Inspections flag potential issues; refactoring tools rename, extract, inline, and restructure code safely. Custom inspection profiles align teams.

### Why It Matters

- **Quality**: Catch nullability/threading issues before reviews.
- **Safety**: Automated refactors prevent manual mistakes.
- **Standards**: Custom rules enforce Bhopal coding conventions.

### Practical Walkthrough

- Enable `Probable bugs`, `Threading issues`, `Java 17 migration` inspections.
- Use structural search & replace to update logging patterns.
- Apply `⌘⌥M` (Extract Method), `⇧F6` (Rename with usages).

### Follow-Up Questions

- How do you export/import inspection profiles across teams?
- What’s your workflow for large-scale refactors (preview, analyze impact)?
- How do you integrate inspection command-line tools into CI?

---

## 13. IntelliJ Debugging, Profiling & Productivity Plugins

### Concept Brief

The debugger supports conditional breakpoints, watches, eval expressions, and hot reload. Plugins like Async Profiler, Key Promoter X, Presentation Assistant boost productivity.

### Why It Matters

- **Diagnostics**: Reproduce Bhopal bugs quickly.
- **Performance**: Profile CPU/memory without leaving IDE.
- **Learning**: Discover shortcuts and keep pair sessions effective.

### Practical Walkthrough

- Conditional breakpoint: `order.getRegion().equals("Bhopal")`.
- Evaluate Expression (`⌘F8`) to test alternative code.
- Attach Async Profiler: `Run > Record CPU and Memory Allocation`.

### Follow-Up Questions

- How do you debug asynchronous code or lambdas effectively?
- When do you use hot-swap vs full redeploy?
- Which plugins are essential vs optional for your workflow?

---

## 14. IntelliJ VCS Integration & Code Review

### Concept Brief

IntelliJ’s Git integration handles commits, diffs, log graphs, cherry-pick, and built-in code review (GitHub, GitLab).

### Why It Matters

- **Convenience**: Manage Git without leaving IDE.
- **Visualization**: Graph view clarifies branching history.
- **Review**: Inline comments and merge requests inside IDE.

### Practical Walkthrough

- `⌘9` (Version Control tool window).
- `⌘K` (Commit), `⌘⇧K` (Push).
- Compare branches (`Git > Compare with Branch...`).
- GitHub plugin: open PR, view checks, comment inline.

### Follow-Up Questions

- When do you prefer CLI vs IntelliJ for Git operations?
- How do you manage large diffs or binary merges in IDE?
- What review workflows does IntelliJ support for GitHub/GitLab/Bitbucket?

---

### Quick References

- **Git essentials**: Understand object model, reflog, worktree, bisect.
- **Workflow**: Use short-lived branches, semantic commits, automate hooks.
- **Releases**: Tag with semantic versions, sign tags, generate changelogs.
- **Automation**: Integrate CI/CD, protect branches, auto-transition Jira issues.
- **Monorepos**: Manage submodules/LFS wisely, monitor repo size.
- **IntelliJ setup**: Sync settings, share run configs, enforce code styles.
- **Navigation**: Master Search Everywhere, recent files, HTTP client, scratch.
- **Analysis**: Customize inspections, run structural search/replace, use refactorings.
- **Debugging**: Conditional breakpoints, eval expressions, async profiling.
- **VCS**: Stage hunks, visualize history, review PRs inside IDE.

This concludes the expanded Git & IntelliJ interview pack for Bhopal delivery teams.\*\*\*
