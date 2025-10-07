# User Guide: AI Agent Training Platform

## Overview

RL Gyms are designed to help you train and test computer use agents (AI assistants) on real-world web applications. The system provides a comprehensive environment where your AI agents can learn to interact with complex user interfaces, complete tasks, and receive automated feedback on their performance.

## How It Works

### 1. **Training Environment**
- The platform simulates real-world applications (like e-commerce, food delivery, etc.)
- Your AI agent interacts with these applications just like a human user would
- The agent learns to navigate, click, type, and complete various tasks

### 2. **Success Measurement (Verifiers)**
- **Verifiers** are automated tests that check if your AI agent completed tasks correctly
- They verify specific outcomes like:
  - Did the agent add the right items to a cart?
  - Did it navigate to the correct store?
  - Did it complete the checkout process properly?
- Verifiers provide instant feedback on your agent's performance

### 3. **How to Use Verifiers**

#### **View All Available Tasks**
- Navigate to `/verify` to see a dashboard of all available training tasks
- Each task shows its description and current status
- Click "Run" to execute a specific task

#### **Test Individual Tasks**
- Go to `/verify/[task-id]` to test a specific task
- The system will:
  - Show you what the task expects
  - Run the verifier automatically
  - Display detailed results (passed/failed)
  - Show execution time and debugging information

## Getting Started

1. **Explore the Application**: First, interact with the main application to understand its features
2. **Check Available Tasks**: Visit `/verify` to see what tasks your agent can be trained on
3. **Run a Test**: Select a task and see how the verification system works
4. **Review Results**: Understand what the verifier checked and whether it passed or failed

## Demo Video

Watch our [Loom video](link-to-loom-video) to see a complete walkthrough of:
- How to run a training trajectory
- How to execute and interpret verifier results
- Best practices for agent training

## Important Note

**This platform is for demonstration purposes only.** In production deployments, training environments are distributed as containerized Docker packages containing:
- Hundreds of training tasks
- Verifiers with varying complexity levels
- Advanced model-breaking scenarios for OpenAI and Claude operators
- Comprehensive testing suites for enterprise-grade AI agent training

## Support

For questions or to learn more about our enterprise AI agent training solutions, please contact our sales team.

---

*This platform demonstrates the power of automated AI agent training and verification in real-world scenarios.*
