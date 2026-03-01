# AgentricAI Auto-Sync Script (PowerShell)
# Watches for file changes and auto-commits/pushes to GitHub
#
# Usage: 
#   .\scripts\auto-sync.ps1              # Watch mode (continuous)
#   .\scripts\auto-sync.ps1 -Once        # Single sync
#   .\scripts\auto-sync.ps1 -Interval 60 # Custom interval (seconds)

param(
    [switch]$Once,
    [int]$Interval = 30,
    [string]$Branch = "main"
)

$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot

Write-Host @"

    _                    _        _        _    ___ 
   / \   __ _  ___ _ __ | |_ _ __(_) ___  / \  |_ _|
  / _ \ / _` |/ _ \ '_ \| __| '__| |/ __| / _ \  | | 
 / ___ \ (_| |  __/ | | | |_| |  | | (__ / ___ \ | | 
/_/   \_\__, |\___|_| |_|\__|_|  |_|\___/_/   \_\___|
        |___/                                        
                    Auto-Sync v1.0

"@ -ForegroundColor Cyan

function Get-GitStatus {
    $status = git status --porcelain 2>$null
    return $status
}

function Sync-Repository {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $changes = Get-GitStatus
    
    if ($changes) {
        Write-Host "[$timestamp] " -NoNewline -ForegroundColor DarkGray
        Write-Host "Changes detected..." -ForegroundColor Yellow
        
        # Show what changed
        $changes -split "`n" | ForEach-Object {
            $status = $_.Substring(0, 2).Trim()
            $file = $_.Substring(3)
            switch ($status) {
                "M"  { Write-Host "  Modified: $file" -ForegroundColor Yellow }
                "A"  { Write-Host "  Added:    $file" -ForegroundColor Green }
                "D"  { Write-Host "  Deleted:  $file" -ForegroundColor Red }
                "??" { Write-Host "  New:      $file" -ForegroundColor Cyan }
                default { Write-Host "  Changed:  $file" -ForegroundColor White }
            }
        }
        
        # Stage all changes
        git add -A
        
        # Generate commit message
        $fileCount = ($changes -split "`n").Count
        $commitMsg = "auto-sync: $fileCount file(s) updated at $timestamp"
        
        # Check for specific file patterns to make better commit messages
        if ($changes -match "agentRoster|agents") {
            $commitMsg = "agents: Updated agent roster - $timestamp"
        } elseif ($changes -match "output/") {
            $commitMsg = "output: New workflow output - $timestamp"
        } elseif ($changes -match "README") {
            $commitMsg = "docs: Updated README - $timestamp"
        } elseif ($changes -match "\.tsx?$") {
            $commitMsg = "feat: Code updates - $timestamp"
        }
        
        # Commit
        git commit -m $commitMsg
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[$timestamp] " -NoNewline -ForegroundColor DarkGray
            Write-Host "Committed: $commitMsg" -ForegroundColor Green
            
            # Push
            Write-Host "[$timestamp] " -NoNewline -ForegroundColor DarkGray
            Write-Host "Pushing to origin/$Branch..." -ForegroundColor Cyan
            
            git push origin $Branch 2>&1 | Out-Null
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "[$timestamp] " -NoNewline -ForegroundColor DarkGray
                Write-Host "Pushed successfully!" -ForegroundColor Green
            } else {
                Write-Host "[$timestamp] " -NoNewline -ForegroundColor DarkGray
                Write-Host "Push failed. Will retry..." -ForegroundColor Red
            }
        }
    } else {
        Write-Host "[$timestamp] " -NoNewline -ForegroundColor DarkGray
        Write-Host "No changes detected." -ForegroundColor DarkGray
    }
}

# Pull latest first
Write-Host "Pulling latest from origin/$Branch..." -ForegroundColor Cyan
git pull origin $Branch 2>&1 | Out-Null
Write-Host ""

if ($Once) {
    Sync-Repository
    Write-Host "`nDone!" -ForegroundColor Green
} else {
    Write-Host "Watching for changes every $Interval seconds..." -ForegroundColor Magenta
    Write-Host "Press Ctrl+C to stop.`n" -ForegroundColor DarkGray
    
    while ($true) {
        Sync-Repository
        Start-Sleep -Seconds $Interval
    }
}
