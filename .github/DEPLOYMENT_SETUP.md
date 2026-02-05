# GitHub Actions Deployment Setup

This guide explains how to set up automatic deployment for the Berez backend using GitHub Actions.

## Overview

The backend automatically deploys to AWS Lambda whenever you push changes to the `backend/` directory on the `main` or `master` branch.

**Workflow file**: `.github/workflows/deploy-backend.yml`

## Prerequisites

1. AWS account with programmatic access
2. GitHub repository with admin access
3. AWS SAM CLI knowledge (for troubleshooting)

## Setup Instructions

### 1. Create AWS IAM User for GitHub Actions

Create a dedicated IAM user with minimal required permissions:

```bash
# Login to AWS Console
# Go to IAM > Users > Add User

User name: github-actions-berez
Access type: Programmatic access (Access key)
```

### 2. Attach Required Policies

Attach these AWS managed policies to the user:
- `AWSLambda_FullAccess`
- `IAMFullAccess` (for creating Lambda execution roles)
- `AmazonS3FullAccess`
- `AmazonAPIGatewayAdministrator`
- `CloudFormationFullAccess`

Or create a custom policy with these permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudformation:*",
        "lambda:*",
        "apigateway:*",
        "s3:*",
        "iam:CreateRole",
        "iam:DeleteRole",
        "iam:GetRole",
        "iam:PassRole",
        "iam:AttachRolePolicy",
        "iam:DetachRolePolicy",
        "iam:PutRolePolicy",
        "iam:DeleteRolePolicy"
      ],
      "Resource": "*"
    }
  ]
}
```

### 3. Save Access Keys

After creating the user, **save the credentials**:
- Access Key ID: `AKIA...`
- Secret Access Key: `wJalrXUtn...` (shown only once!)

⚠️ **Important**: Never commit these keys to git!

### 4. Add GitHub Secrets

Go to your GitHub repository:

1. Navigate to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add the following secrets:

| Secret Name | Value | Example |
|-------------|-------|---------|
| `AWS_ACCESS_KEY_ID` | Your AWS access key ID | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret access key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |

### 5. Verify Setup

Test the deployment:

1. Make a small change to any file in `backend/` (e.g., add a comment)
2. Commit and push:
   ```bash
   git add backend/
   git commit -m "test: trigger deployment"
   git push origin main
   ```
3. Go to **Actions** tab in GitHub to watch the deployment
4. Deployment takes ~3-5 minutes

### 6. Manual Trigger (Optional)

You can also trigger deployment manually:

1. Go to **Actions** tab
2. Click **Deploy Backend to AWS** workflow
3. Click **Run workflow** button
4. Select branch and click **Run workflow**

## Workflow Details

### Triggers

The workflow runs when:
- ✅ Push to `main` or `master` branch
- ✅ Changes in `backend/` directory
- ✅ Changes in the workflow file itself
- ✅ Manual trigger via GitHub UI

### Steps

1. **Checkout code** - Downloads repository
2. **Setup Python 3.11** - Installs Python runtime
3. **Setup AWS SAM CLI** - Installs deployment tool
4. **Configure AWS** - Authenticates with AWS using secrets
5. **Generate JWT Secret** - Creates secure token signing key
6. **Build** - Packages Lambda function with dependencies
7. **Deploy** - Updates CloudFormation stack on AWS
8. **Get API URL** - Retrieves deployed endpoint
9. **Summary** - Displays deployment info

### Deployment Time

- First deployment: ~5-8 minutes (creates all resources)
- Subsequent deployments: ~2-3 minutes (updates only)

### Cost

GitHub Actions is **free** for:
- Public repositories (unlimited minutes)
- Private repositories (2000 minutes/month)

Each deployment uses ~3-5 minutes, so:
- Public repo: Unlimited deployments
- Private repo: ~400-600 deployments/month free

## Monitoring

### View Deployment Logs

1. Go to repository **Actions** tab
2. Click on the latest workflow run
3. Expand each step to see detailed logs

### Check Deployment Status

After deployment, the summary shows:
```
✅ Backend Deployment Successful

API Endpoint: https://abc123.execute-api.eu-west-1.amazonaws.com/prod
Environment: Production (eu-west-1)
Commit: 1a2b3c4d...
```

### Test API

```bash
# Health check
curl https://[your-api-url]/health

# Should return:
# {"status":"healthy","environment":"prod","is_lambda":true}
```

## Troubleshooting

### Deployment Failed: Access Denied

**Cause**: IAM user doesn't have required permissions

**Fix**: 
1. Go to AWS Console → IAM → Users → github-actions-berez
2. Verify attached policies
3. Add missing permissions

### Deployment Failed: Stack Already Exists

**Cause**: Stack exists but GitHub Actions can't access it

**Fix**:
```bash
# Option 1: Delete and recreate
aws cloudformation delete-stack --stack-name berez-api-prod

# Option 2: Update via local SAM CLI first
cd backend
sam deploy --profile my-dev-profile
```

### Deployment Timeout

**Cause**: Lambda package too large or slow build

**Fix**: 
- Check `backend/requirements.txt` for unnecessary dependencies
- Ensure Docker is running on GitHub Actions (already configured)

### Wrong AWS Region

**Cause**: Workflow uses hardcoded `eu-west-1` region

**Fix**: Edit `.github/workflows/deploy-backend.yml`:
```yaml
aws-region: us-east-1  # Change to your region
```

## Security Best Practices

### ✅ Do
- Use dedicated IAM user for GitHub Actions
- Use least-privilege IAM policies
- Rotate access keys every 90 days
- Monitor CloudWatch logs for unauthorized access
- Use GitHub environment secrets for production

### ❌ Don't
- Don't use your personal AWS account root credentials
- Don't commit AWS credentials to git
- Don't share GitHub secrets between projects
- Don't grant `AdministratorAccess` policy

## Environment Variables

The workflow automatically sets:
- `Environment=prod`
- `JWTSecretKey` (auto-generated each deployment)
- `FrontendURL=https://berez.vercel.app`

To change frontend URL, edit the workflow:
```yaml
--parameter-overrides \
  "FrontendURL=https://your-domain.com"
```

## Multiple Environments

To deploy to dev/staging:

1. Create new workflow file: `.github/workflows/deploy-backend-dev.yml`
2. Change stack name: `berez-api-dev`
3. Change trigger branch: `develop`
4. Update environment parameter: `Environment=dev`

## Rollback

If deployment breaks production:

### Option 1: Revert Git Commit
```bash
git revert HEAD
git push origin main
# Automatic deployment will restore previous version
```

### Option 2: Manual Rollback
```bash
# Get previous stack changeset
aws cloudformation list-change-sets \
  --stack-name berez-api-prod \
  --query 'Summaries[1].ChangeSetId'

# Rollback to previous state
aws cloudformation execute-change-set \
  --change-set-name [previous-changeset-id]
```

### Option 3: Redeploy Old Commit
```bash
# Find working commit
git log --oneline

# Deploy specific commit
git checkout [old-commit-hash]
git push origin main --force
# Wait for deployment to complete
```

## Notifications

### Add Slack Notifications

Add this step to workflow:
```yaml
- name: Notify Slack
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    webhook: ${{ secrets.SLACK_WEBHOOK_URL }}
    payload: |
      {
        "text": "❌ Backend deployment failed: ${{ github.event.head_commit.message }}"
      }
```

### Add Email Notifications

GitHub automatically sends email notifications for failed workflows to repository admins.

Configure in: **Settings** → **Notifications** → **Actions**

## FAQ

**Q: How do I know if deployment succeeded?**  
A: Check the Actions tab - green checkmark = success, red X = failure

**Q: Can I deploy to multiple AWS accounts?**  
A: Yes, create separate workflows with different AWS credentials secrets

**Q: How do I skip deployment for a commit?**  
A: Add `[skip ci]` or `[ci skip]` to your commit message

**Q: Can I test deployment before it goes live?**  
A: Yes, use manual trigger and watch logs before merging to main

**Q: How do I update environment variables?**  
A: Edit the workflow file's `--parameter-overrides` section

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS SAM CLI Reference](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-command-reference.html)
- [AWS IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [Berez Backend README](../backend/README.md)

## Support

If you encounter issues:
1. Check GitHub Actions logs
2. Check AWS CloudWatch logs
3. Review this guide's troubleshooting section
4. Open a GitHub issue with error details
