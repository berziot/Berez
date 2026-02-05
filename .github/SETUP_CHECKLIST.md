# GitHub Actions Setup Checklist

Follow these steps to enable automatic backend deployment.

## ☑️ Setup Checklist

### 1. Create AWS IAM User
- [ ] Go to AWS Console → IAM → Users → **Add User**
- [ ] User name: `github-actions-berez`
- [ ] Access type: **Programmatic access** (Access key)
- [ ] Click **Next: Permissions**

### 2. Attach Policies
- [ ] Attach these managed policies:
  - [ ] `AWSLambda_FullAccess`
  - [ ] `IAMFullAccess`
  - [ ] `AmazonS3FullAccess`
  - [ ] `AmazonAPIGatewayAdministrator`
  - [ ] `CloudFormationFullAccess`
- [ ] Click **Next** through tags
- [ ] Click **Create user**

### 3. Save Credentials
- [ ] **Download CSV** or copy credentials:
  - Access Key ID: `AKIA...`
  - Secret Access Key: `wJalrXUtn...` (⚠️ only shown once!)
- [ ] Store securely (password manager)

### 4. Add GitHub Secrets
- [ ] Go to your GitHub repo
- [ ] Click **Settings** tab
- [ ] Sidebar: **Secrets and variables** → **Actions**
- [ ] Click **New repository secret**

**Secret 1:**
- [ ] Name: `AWS_ACCESS_KEY_ID`
- [ ] Value: Paste your AWS access key ID
- [ ] Click **Add secret**

**Secret 2:**
- [ ] Name: `AWS_SECRET_ACCESS_KEY`
- [ ] Value: Paste your AWS secret access key
- [ ] Click **Add secret**

### 5. Test Deployment
- [ ] Make a small change to `backend/README.md`
- [ ] Commit and push:
  ```bash
  git add backend/README.md
  git commit -m "test: trigger deployment"
  git push origin main
  ```
- [ ] Go to **Actions** tab in GitHub
- [ ] Watch the **Deploy Backend to AWS** workflow run
- [ ] Wait ~3-5 minutes for completion
- [ ] Look for ✅ green checkmark

### 6. Verify API
- [ ] Copy API endpoint from workflow summary
- [ ] Test health endpoint:
  ```bash
  curl https://[your-api-url]/health
  ```
- [ ] Should return: `{"status":"healthy","environment":"prod"}`

## ✅ Done!

Your backend now deploys automatically on every push to `main`!

## 🔧 Troubleshooting

**If step 5 fails:**
1. Click on the failed workflow in Actions tab
2. Expand the failed step to see error message
3. Common issues:
   - **Access Denied**: Check IAM policy attachments (step 2)
   - **Invalid credentials**: Verify GitHub secrets (step 4)
   - **Stack exists**: Delete existing stack or run manual deploy first

**Need help?** See [DEPLOYMENT_SETUP.md](DEPLOYMENT_SETUP.md) for detailed troubleshooting.

## 📚 Next Steps

- [ ] Update frontend `NEXT_PUBLIC_API_URL` on Vercel (already done if you followed earlier setup)
- [ ] Set up Slack/email notifications for deployment failures (optional)
- [ ] Create staging environment workflow for `develop` branch (optional)

## 🔒 Security Reminder

- ✅ Never commit AWS credentials to git
- ✅ Use IAM user (not root account)
- ✅ Rotate access keys every 90 days
- ✅ Review CloudWatch logs periodically
