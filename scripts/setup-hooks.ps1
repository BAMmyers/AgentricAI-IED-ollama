# AgentricAI - Setup Git Hooks
# Creates a pre-push hook that runs build before pushing
#
# Usage: .\scripts\setup-hooks.ps1

$RepoRoot = Split-Path -Parent $PSScriptRoot
$HooksDir = Join-Path $RepoRoot ".git\hooks"

Write-Host "`n Setting up Git hooks...`n" -ForegroundColor Cyan

# Create pre-push hook
$prePushHook = @'
#!/bin/sh
# AgentricAI Pre-Push Hook
# Runs build before allowing push to ensure code compiles

echo ""
echo "Running pre-push build check..."
echo ""

npm run build

if [ $? -ne 0 ]; then
    echo ""
    echo "Build failed! Push aborted."
    echo "Fix the errors and try again."
    echo ""
    exit 1
fi

echo ""
echo "Build successful! Proceeding with push..."
echo ""
'@

$prePushPath = Join-Path $HooksDir "pre-push"
$prePushHook | Out-File -FilePath $prePushPath -Encoding utf8 -NoNewline

Write-Host " Created: .git/hooks/pre-push" -ForegroundColor Green
Write-Host "   - Runs 'npm run build' before each push" -ForegroundColor Gray
Write-Host "   - Prevents pushing broken code`n" -ForegroundColor Gray

# Create post-commit hook for logging
$postCommitHook = @'
#!/bin/sh
# AgentricAI Post-Commit Hook
# Logs commits for debugging

COMMIT_MSG=$(git log -1 --pretty=%B)
COMMIT_HASH=$(git log -1 --pretty=%h)
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$TIMESTAMP] Committed: $COMMIT_HASH - $COMMIT_MSG" >> .git/commit-log.txt
'@

$postCommitPath = Join-Path $HooksDir "post-commit"
$postCommitHook | Out-File -FilePath $postCommitPath -Encoding utf8 -NoNewline

Write-Host " Created: .git/hooks/post-commit" -ForegroundColor Green
Write-Host "   - Logs all commits to .git/commit-log.txt`n" -ForegroundColor Gray

Write-Host " Git hooks installed successfully!`n" -ForegroundColor Cyan
