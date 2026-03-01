# AgentricAI Quick Push Script
# Repository: https://github.com/BAMmyers/AgentricAI-IED-ollama.git
#
# Usage:
#   .\scripts\quick-push.ps1                    # Auto-generate commit message
#   .\scripts\quick-push.ps1 "Custom message"   # Use custom message
#   .\scripts\quick-push.ps1 -Init              # Initialize repo connection

param(
    [string]$Message = "",
    [switch]$Init = $false
)

$RepoUrl = "https://github.com/BAMmyers/AgentricAI-IED-ollama.git"
$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot

Write-Host "`n🚀 AgentricAI Quick Push`n" -ForegroundColor Cyan

# Initialize repo if requested
if ($Init) {
    Write-Host "🔧 Initializing repository connection..." -ForegroundColor Yellow
    
    # Check if git is initialized
    if (-not (Test-Path ".git")) {
        git init
        Write-Host "   ✓ Git initialized" -ForegroundColor Green
    }
    
    # Check/set remote
    $remote = git remote get-url origin 2>$null
    if (-not $remote) {
        git remote add origin $RepoUrl
        Write-Host "   ✓ Remote added: $RepoUrl" -ForegroundColor Green
    } elseif ($remote -ne $RepoUrl) {
        git remote set-url origin $RepoUrl
        Write-Host "   ✓ Remote updated: $RepoUrl" -ForegroundColor Green
    } else {
        Write-Host "   ✓ Remote already configured" -ForegroundColor Green
    }
    
    # Set branch
    git branch -M main 2>$null
    Write-Host "   ✓ Branch set to main" -ForegroundColor Green
    Write-Host ""
}

# Check for changes
$changes = git status --porcelain

if (-not $changes) {
    Write-Host "✓ No changes to commit.`n" -ForegroundColor Yellow
    exit 0
}

# Count changes by type
$modified = ($changes | Select-String "^ M|^M ").Count
$added = ($changes | Select-String "^A |^\?\?").Count
$deleted = ($changes | Select-String "^D |^ D").Count
$total = ($changes -split "`n").Count

Write-Host "📦 Changes:" -ForegroundColor White
Write-Host "   Modified: $modified | Added: $added | Deleted: $deleted | Total: $total" -ForegroundColor DarkGray
Write-Host ""

# Show file list
$changes -split "`n" | ForEach-Object {
    if ($_.Length -gt 2) {
        $status = $_.Substring(0, 2).Trim()
        $file = $_.Substring(3)
        switch ($status) {
            "M"  { Write-Host "   📝 $file" -ForegroundColor Yellow }
            "A"  { Write-Host "   ➕ $file" -ForegroundColor Green }
            "D"  { Write-Host "   ❌ $file" -ForegroundColor Red }
            "??" { Write-Host "   🆕 $file" -ForegroundColor Cyan }
            default { Write-Host "   📄 $file" -ForegroundColor White }
        }
    }
}
Write-Host ""

# Generate smart commit message if not provided
if (-not $Message) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
    
    if ($changes -match "hiveMind|hiveExecutor|orchestrat") {
        $Message = "feat(hive): Updated Hive Mind orchestration"
    } elseif ($changes -match "agentRoster|agents") {
        $Message = "feat(agents): Updated agent roster"
    } elseif ($changes -match "test-suite|test-output") {
        $Message = "test: Updated test suite and results"
    } elseif ($changes -match "output/") {
        $Message = "output: New workflow outputs"
    } elseif ($changes -match "README|CHANGELOG|docs") {
        $Message = "docs: Updated documentation"
    } elseif ($changes -match "TeamPanel|Sidebar|OutputPanel|MemoryPanel") {
        $Message = "ui: Updated components"
    } elseif ($changes -match "database|memory|knowledge") {
        $Message = "feat(db): Updated database/memory system"
    } elseif ($changes -match "\.tsx$") {
        $Message = "feat: Component updates ($total files)"
    } elseif ($changes -match "\.ts$") {
        $Message = "feat: Code updates ($total files)"
    } else {
        $Message = "update: $total file(s) modified"
    }
}

Write-Host "💬 Commit: $Message" -ForegroundColor Green
Write-Host ""

# Stage all changes
Write-Host "📤 Staging changes..." -ForegroundColor DarkGray
git add -A

# Commit
Write-Host "📝 Committing..." -ForegroundColor DarkGray
git commit -m $Message

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Commit failed.`n" -ForegroundColor Red
    exit 1
}

# Push
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor DarkGray
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "   $RepoUrl`n" -ForegroundColor DarkGray
} else {
    Write-Host "`n⚠️  Push failed. Trying to set upstream..." -ForegroundColor Yellow
    git push --set-upstream origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Successfully pushed to GitHub!" -ForegroundColor Green
    } else {
        Write-Host "`n❌ Push failed. Check your credentials and connection." -ForegroundColor Red
        Write-Host "   Try: git push -u origin main`n" -ForegroundColor DarkGray
        exit 1
    }
}
