# GitHub Configuration

This directory contains GitHub-specific configuration files for the Berez project.

## 📁 Contents

### `workflows/deploy-backend.yml`
GitHub Actions workflow for automatic backend deployment to AWS Lambda.

**Triggers**: On push to `main`/`master` branch with changes in `backend/`

**What it does**:
1. Builds Lambda package with SAM CLI
2. Deploys to AWS (Lambda + API Gateway + S3)
3. Updates CloudFormation stack
4. Displays deployment summary

**Setup required**: See [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)

### `DEPLOYMENT_SETUP.md`
Complete guide for setting up automatic AWS deployment via GitHub Actions.

**Covers**:
- Creating AWS IAM user
- Setting up GitHub Secrets
- Troubleshooting deployment issues
- Security best practices
- Multiple environment setup

### `SETUP_CHECKLIST.md`
Quick step-by-step checklist for first-time setup.

**Use this** if you want a simple, checkbox-style guide to get started quickly.

## 🚀 Quick Start

**To enable automatic backend deployment:**

1. Read [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)
2. Follow the 6 steps
3. Push code to `main` → automatic deployment! ⚡

**Total setup time**: ~10 minutes

## 📚 Learn More

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/)
- [Backend README](../backend/README.md)
