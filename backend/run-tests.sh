#!/bin/bash

# Manual test execution script
# This script allows manual testing with various options

set -e  # Exit on error

BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  Backend Test Runner${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Navigate to backend directory
cd "$BACKEND_DIR"

# Function to run tests
run_tests() {
  echo -e "${YELLOW}Running tests...${NC}"
  npm test
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    return 0
  else
    echo -e "${RED}❌ Some tests failed!${NC}"
    return 1
  fi
}

# Function to run tests with coverage
run_coverage() {
  echo -e "${YELLOW}Running tests with coverage...${NC}"
  npm run test:coverage
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Coverage tests passed!${NC}"
    echo -e "${BLUE}Opening coverage report...${NC}"
    
    # Open coverage report based on OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
      open coverage/lcov-report/index.html
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
      xdg-open coverage/lcov-report/index.html 2>/dev/null || echo "Coverage report: coverage/lcov-report/index.html"
    else
      echo "Coverage report: coverage/lcov-report/index.html"
    fi
    return 0
  else
    echo -e "${RED}❌ Coverage tests failed!${NC}"
    return 1
  fi
}

# Function to run tests in watch mode
run_watch() {
  echo -e "${YELLOW}Running tests in watch mode...${NC}"
  echo -e "${BLUE}Press 'q' to quit${NC}"
  npm run test:watch
}

# Function to run specific test file
run_specific() {
  local test_file=$1
  echo -e "${YELLOW}Running specific test: $test_file${NC}"
  npm test -- "$test_file"
}

# Function to clear cache
clear_cache() {
  echo -e "${YELLOW}Clearing Jest cache...${NC}"
  npx jest --clearCache
  echo -e "${GREEN}✅ Cache cleared!${NC}"
}

# Main menu
show_menu() {
  echo ""
  echo "Select test option:"
  echo "1) Run all tests"
  echo "2) Run tests with coverage"
  echo "3) Run tests in watch mode"
  echo "4) Run specific test file"
  echo "5) Clear Jest cache"
  echo "6) Run CI tests"
  echo "0) Exit"
  echo ""
  read -p "Enter your choice: " choice
  
  case $choice in
    1)
      run_tests
      ;;
    2)
      run_coverage
      ;;
    3)
      run_watch
      ;;
    4)
      echo ""
      echo "Available test files:"
      find src/tests -name "*.test.ts" -type f
      echo ""
      read -p "Enter test file path: " test_file
      run_specific "$test_file"
      ;;
    5)
      clear_cache
      ;;
    6)
      echo -e "${YELLOW}Running CI tests...${NC}"
      npm run test:ci
      ;;
    0)
      echo -e "${BLUE}Exiting...${NC}"
      exit 0
      ;;
    *)
      echo -e "${RED}Invalid option!${NC}"
      show_menu
      ;;
  esac
}

# Check if argument is provided
if [ $# -eq 0 ]; then
  show_menu
else
  case $1 in
    "test")
      run_tests
      ;;
    "coverage")
      run_coverage
      ;;
    "watch")
      run_watch
      ;;
    "clear")
      clear_cache
      ;;
    "ci")
      npm run test:ci
      ;;
    *)
      echo -e "${RED}Unknown command: $1${NC}"
      echo "Usage: ./run-tests.sh [test|coverage|watch|clear|ci]"
      exit 1
      ;;
  esac
fi
