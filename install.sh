#!/bin/bash

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m'

if [ "$EUID" -ne 0 ]; then
    echo -e "${YELLOW}Requesting administrator privileges...${NC}"
    sudo "$0" "$@"
    exit $?
fi

clear
echo -e "${BLUE}┌────────────────────────────────────────┐"
echo -e "│         BallSploit Installer          │"
echo -e "└────────────────────────────────────────┘${NC}"
echo

TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR" || exit 1

echo -e "${YELLOW}[1/4]${NC} Downloading BallSploit..."
curl -L -o BallSploit.zip https://github.com/verexchaos/ballsploit/releases/download/Stable/BallSploit.zip -#

if [ $? -ne 0 ]; then
    echo -e "\n${RED}✗ Download failed. Check your internet connection.${NC}"
    rm -rf "$TEMP_DIR"
    exit 1
fi

echo -e "${YELLOW}[2/4]${NC} Extracting files..."
unzip -q BallSploit.zip

# List contents to debug
echo -e "${YELLOW}Looking for BallSploit.app...${NC}"
find . -type d -name "*.app" -ls

# Handle possibly nested structure more carefully
APP_PATH=$(find . -name "BallSploit.app" -type d | grep -v "__MACOSX" | head -1)

if [ -z "$APP_PATH" ]; then
    echo -e "\n${RED}✗ Could not find BallSploit.app in archive.${NC}"
    echo -e "${YELLOW}Contents of extracted archive:${NC}"
    ls -la
    rm -rf "$TEMP_DIR"
    exit 1
fi

echo -e "${YELLOW}[3/4]${NC} Installing to Applications folder..."
echo -e "Found app at: ${APP_PATH}"

if [ -d "/Applications/BallSploit.app" ]; then
    echo -e "Removing previous installation..."
    rm -rf "/Applications/BallSploit.app"
fi

echo -e "Moving app to Applications..."
cp -R "$APP_PATH" /Applications/

if [ $? -ne 0 ]; then
    echo -e "\n${RED}✗ Installation failed due to permission issues.${NC}"
    rm -rf "$TEMP_DIR"
    exit 1
fi

echo -e "${YELLOW}[4/4]${NC} Finalizing installation..."
cd || exit 1
rm -rf "$TEMP_DIR"

echo
echo -e "${GREEN}┌────────────────────────────────────────┐"
echo -e "│       Installation Successful!        │"
echo -e "└────────────────────────────────────────┘${NC}"
echo
echo -e "${BLUE}BallSploit is now available in your Applications folder.${NC}"
echo

exit 0
