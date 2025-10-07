#!/bin/bash

# Install Python dependencies for the rubric evaluator

echo "Installing Python dependencies for RL-GYM Rubric Evaluator..."

# Check if pip is available
if ! command -v pip3 &> /dev/null; then
    echo "Error: pip3 is not installed. Please install Python 3 with pip."
    exit 1
fi

# Install openai package
echo "Installing openai package..."
pip3 install openai

# Verify installation
echo "Verifying installation..."
python3 -c "import openai; print('OpenAI package installed successfully!')"

echo "Dependencies installed successfully!"
echo ""
echo "To use LLM evaluation, you'll need to:"
echo "1. Get an OpenAI API key from https://platform.openai.com/api-keys"
echo "2. Set it as an environment variable: export OPENAI_API_KEY='your-key-here'"
echo "3. Or pass it directly to the script with --openai-key parameter"
