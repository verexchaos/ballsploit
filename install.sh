#!/bin/bash

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;36m'
YELLOW='\033[0;33m'
PURPLE='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m'

if [ "$EUID" -ne 0 ]; then
    echo -e "${YELLOW}${BOLD}Requesting administrator privileges...${NC}"
    sudo "$0" "$@"
    exit $?
fi

clear
echo -e "${PURPLE}${BOLD}"
echo -e "╭────────────────────────────────────────╮"
echo -e "│           BALLSPLOIT SETUP            │"
echo -e "╰────────────────────────────────────────╯${NC}"

function spinner() {
    local pid=$1
    local delay=0.1
    local spinstr='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
    while [ "$(ps a | awk '{print $1}' | grep $pid)" ]; do
        local temp=${spinstr#?}
        printf " %c  " "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        echo -ne "\r"
        sleep $delay
    done
    echo -ne "\r\033[K"
}

TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR" || exit 1

echo -e "\n${BLUE}${BOLD}⌛ Downloading BallSploit...${NC}"
curl -L -o BallSploit.zip https://github.com/verexchaos/ballsploit/releases/download/BallSploit/BallSploit.zip -# 

if [ $? -ne 0 ]; then
    echo -e "\n${RED}${BOLD}✖ Download failed. Check your connection and try again.${NC}"
    rm -rf "$TEMP_DIR"
    exit 1
fi

echo -e "\n${BLUE}${BOLD}📦 Extracting files...${NC}"
unzip -q BallSploit.zip & spinner $!

APP_PATH=$(find . -name "BallSploit.app" -type d | grep -v "__MACOSX" | head -1)

if [ -z "$APP_PATH" ]; then
    echo -e "\n${RED}${BOLD}✖ Could not locate BallSploit.app in the package.${NC}"
    rm -rf "$TEMP_DIR"
    exit 1
fi

echo -e "\n${BLUE}${BOLD}🚀 Installing BallSploit...${NC}"

if [ -d "/Applications/BallSploit.app" ]; then
    echo -e "   ${YELLOW}Removing previous version...${NC}"
    rm -rf "/Applications/BallSploit.app"
fi

cp -R "$APP_PATH" /Applications/

if [ $? -ne 0 ]; then
    echo -e "\n${RED}${BOLD}✖ Installation failed. Please try again.${NC}"
    rm -rf "$TEMP_DIR"
    exit 1
fi

cd || exit 1
rm -rf "$TEMP_DIR"

echo -e "\n${GREEN}${BOLD}✅ INSTALLATION COMPLETE${NC}"
echo -e "\n${PURPLE}BallSploit is ready in your Applications folder!${NC}"

exit 0
