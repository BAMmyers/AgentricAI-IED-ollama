#!/bin/bash
# AgentricAI Auto-Sync Script (Bash/Linux/Mac)
# Watches for file changes and auto-commits/pushes to GitHub
#
# Usage:
#   ./scripts/auto-sync.sh              # Watch mode (continuous)
#   ./scripts/auto-sync.sh --once       # Single sync
#   ./scripts/auto-sync.sh --interval 60 # Custom interval (seconds)

INTERVAL=30
BRANCH="main"
ONCE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --once)
            ONCE=true
            shift
            ;;
        --interval)
            INTERVAL="$2"
            shift 2
            ;;
        --branch)
            BRANCH="$2"
            shift 2
            ;;
        *)
            shift
            ;;
    esac
done

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
GRAY='\033[0;90m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Navigate to repo root
cd "$(dirname "$0")/.." || exit

echo -e "${CYAN}"
cat << "EOF"
    _                    _        _        _    ___ 
   / \   __ _  ___ _ __ | |_ _ __(_) ___  / \  |_ _|
  / _ \ / _` |/ _ \ '_ \| __| '__| |/ __| / _ \  | | 
 / ___ \ (_| |  __/ | | | |_| |  | | (__ / ___ \ | | 
/_/   \_\__, |\___|_| |_|\__|_|  |_|\___/_/   \_\___|
        |___/                                        
                    Auto-Sync v1.0
EOF
echo -e "${NC}"

sync_repo() {
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    CHANGES=$(git status --porcelain 2>/dev/null)
    
    if [ -n "$CHANGES" ]; then
        echo -e "${GRAY}[$TIMESTAMP]${NC} ${YELLOW}Changes detected...${NC}"
        
        # Show what changed
        echo "$CHANGES" | while read -r line; do
            STATUS="${line:0:2}"
            FILE="${line:3}"
            case "$STATUS" in
                "M ")  echo -e "  ${YELLOW}Modified:${NC} $FILE" ;;
                "A ")  echo -e "  ${GREEN}Added:${NC}    $FILE" ;;
                "D ")  echo -e "  ${RED}Deleted:${NC}  $FILE" ;;
                "??")  echo -e "  ${CYAN}New:${NC}      $FILE" ;;
                *)     echo -e "  Changed:  $FILE" ;;
            esac
        done
        
        # Stage all changes
        git add -A
        
        # Generate commit message
        FILE_COUNT=$(echo "$CHANGES" | wc -l | tr -d ' ')
        COMMIT_MSG="auto-sync: $FILE_COUNT file(s) updated at $TIMESTAMP"
        
        # Check for specific patterns
        if echo "$CHANGES" | grep -qE "agentRoster|agents"; then
            COMMIT_MSG="agents: Updated agent roster - $TIMESTAMP"
        elif echo "$CHANGES" | grep -q "output/"; then
            COMMIT_MSG="output: New workflow output - $TIMESTAMP"
        elif echo "$CHANGES" | grep -q "README"; then
            COMMIT_MSG="docs: Updated README - $TIMESTAMP"
        elif echo "$CHANGES" | grep -qE "\.tsx?$"; then
            COMMIT_MSG="feat: Code updates - $TIMESTAMP"
        fi
        
        # Commit
        git commit -m "$COMMIT_MSG"
        
        if [ $? -eq 0 ]; then
            echo -e "${GRAY}[$TIMESTAMP]${NC} ${GREEN}Committed:${NC} $COMMIT_MSG"
            echo -e "${GRAY}[$TIMESTAMP]${NC} ${CYAN}Pushing to origin/$BRANCH...${NC}"
            
            git push origin "$BRANCH" 2>&1
            
            if [ $? -eq 0 ]; then
                echo -e "${GRAY}[$TIMESTAMP]${NC} ${GREEN}Pushed successfully!${NC}"
            else
                echo -e "${GRAY}[$TIMESTAMP]${NC} ${RED}Push failed. Will retry...${NC}"
            fi
        fi
    else
        echo -e "${GRAY}[$TIMESTAMP] No changes detected.${NC}"
    fi
}

# Pull latest first
echo -e "${CYAN}Pulling latest from origin/$BRANCH...${NC}"
git pull origin "$BRANCH" 2>&1
echo ""

if [ "$ONCE" = true ]; then
    sync_repo
    echo -e "\n${GREEN}Done!${NC}"
else
    echo -e "${MAGENTA}Watching for changes every $INTERVAL seconds...${NC}"
    echo -e "${GRAY}Press Ctrl+C to stop.${NC}\n"
    
    while true; do
        sync_repo
        sleep "$INTERVAL"
    done
fi
