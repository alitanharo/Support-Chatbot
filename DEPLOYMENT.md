# Deployment Guide - DISE CX Assistant

This guide covers deploying the DISE CX AI Assistant to Azure.

## Deployment Options

### Option 1: Azure Static Web Apps (Recommended)

Azure Static Web Apps provides automatic deployment from GitHub with built-in CI/CD.

#### Prerequisites

- Azure account with active subscription
- GitHub repository
- Azure CLI installed

#### Steps

1. **Push code to GitHub**

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/dise-cx-ai-assistant.git
git push -u origin main
```

2. **Create Static Web App via Azure Portal**

- Go to Azure Portal → Create a resource
- Search for "Static Web Apps"
- Click Create
- Fill in details:
  - Subscription: Your subscription
  - Resource Group: Create new or use existing
  - Name: `dise-cx-ai-assistant`
  - Region: Choose closest to your users
  - Source: GitHub
  - Organization: Your GitHub username
  - Repository: `dise-cx-ai-assistant`
  - Branch: `main`
  - Build Presets: Next.js
  - App location: `/`
  - API location: (leave empty)
  - Output location: `.next`

3. **Configure Environment Variables**

After deployment, add environment variables:

- Go to your Static Web App in Azure Portal
- Navigate to Configuration → Application settings
- Add the following:

```
FOUNDRY_PROJECT_ENDPOINT=https://dise-cx-ai-poc-foundry.services.ai.azure.com/api/projects/CX-AI-Project
FOUNDRY_API_KEY=your_api_key_here
FOUNDRY_ASSISTANT_ID=asst_ObJnXcqmjc1V9eo742I83MU1
DEBUG=false
NEXT_PUBLIC_APP_NAME=DISE CX AI Assistant
```

4. **Trigger Deployment**

GitHub Actions will automatically deploy on push. To manually trigger:

- Go to your repository on GitHub
- Click Actions tab
- Select the workflow
- Click "Run workflow"

5. **Access Your App**

Your app will be available at: `https://YOUR_APP_NAME.azurestaticapps.net`

---

### Option 2: Azure App Service

Deploy as a Node.js application on Azure App Service.

#### Steps

1. **Build the application**

```bash
npm run build
```

2. **Create App Service via Azure CLI**

```bash
# Login to Azure
az login

# Create resource group
az group create --name dise-cx-ai-rg --location eastus

# Create App Service plan
az appservice plan create \
  --name dise-cx-ai-plan \
  --resource-group dise-cx-ai-rg \
  --sku B1 \
  --is-linux

# Create Web App
az webapp create \
  --name dise-cx-ai-assistant \
  --resource-group dise-cx-ai-rg \
  --plan dise-cx-ai-plan \
  --runtime "NODE:18-lts"
```

3. **Configure App Settings**

```bash
az webapp config appsettings set \
  --name dise-cx-ai-assistant \
  --resource-group dise-cx-ai-rg \
  --settings \
    FOUNDRY_PROJECT_ENDPOINT="https://dise-cx-ai-poc-foundry.services.ai.azure.com/api/projects/CX-AI-Project" \
    FOUNDRY_API_KEY="your_api_key_here" \
    FOUNDRY_ASSISTANT_ID="asst_ObJnXcqmjc1V9eo742I83MU1" \
    DEBUG="false" \
    NEXT_PUBLIC_APP_NAME="DISE CX AI Assistant" \
    SCM_DO_BUILD_DURING_DEPLOYMENT="true"
```

4. **Deploy via Git**

```bash
# Get deployment credentials
az webapp deployment list-publishing-credentials \
  --name dise-cx-ai-assistant \
  --resource-group dise-cx-ai-rg

# Add Azure remote
git remote add azure <deployment-git-url>

# Push to deploy
git push azure main
```

5. **Enable Always On**

```bash
az webapp config set \
  --name dise-cx-ai-assistant \
  --resource-group dise-cx-ai-rg \
  --always-on true
```

---

## Post-Deployment Configuration

### 1. Custom Domain (Optional)

**For Static Web Apps:**

- Go to Azure Portal → Your Static Web App
- Navigate to Custom domains
- Click Add
- Follow the wizard to add your domain
- Add DNS records as instructed

**For App Service:**

```bash
az webapp config hostname add \
  --webapp-name dise-cx-ai-assistant \
  --resource-group dise-cx-ai-rg \
  --hostname yourdomain.com
```

### 2. SSL Certificate

Both Static Web Apps and App Service provide free SSL certificates automatically.

To use a custom certificate:

- Go to TLS/SSL settings
- Upload your certificate
- Bind to your custom domain

### 3. Enable Application Insights

Monitor your application performance:

```bash
az monitor app-insights component create \
  --app dise-cx-ai-insights \
  --location eastus \
  --resource-group dise-cx-ai-rg \
  --application-type web

# Get instrumentation key
az monitor app-insights component show \
  --app dise-cx-ai-insights \
  --resource-group dise-cx-ai-rg \
  --query instrumentationKey
```

Add to environment variables:
```
APPLICATIONINSIGHTS_CONNECTION_STRING=your_connection_string
```

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `FOUNDRY_PROJECT_ENDPOINT` | Foundry project endpoint | `https://xxx.services.ai.azure.com/api/projects/XXX` |
| `FOUNDRY_API_KEY` | API authentication key | `your_secret_key` |
| `FOUNDRY_ASSISTANT_ID` | Assistant/agent ID | `asst_xxxxxxxxxxxxx` |
| `DEBUG` | Enable debug mode | `false` (production), `true` (dev) |
| `NEXT_PUBLIC_APP_NAME` | Application display name | `DISE CX AI Assistant` |

---

## Monitoring & Logging

### View Logs (App Service)

```bash
# Stream logs
az webapp log tail \
  --name dise-cx-ai-assistant \
  --resource-group dise-cx-ai-rg

# Download logs
az webapp log download \
  --name dise-cx-ai-assistant \
  --resource-group dise-cx-ai-rg \
  --log-file logs.zip
```

### View Logs (Static Web Apps)

- Go to Azure Portal → Your Static Web App
- Navigate to Application Insights
- Click Logs
- Query application logs

---

## Scaling

### Static Web Apps

Automatic scaling is built-in. No configuration needed.

### App Service

Scale vertically (change plan):
```bash
az appservice plan update \
  --name dise-cx-ai-plan \
  --resource-group dise-cx-ai-rg \
  --sku S1
```

Scale horizontally (add instances):
```bash
az appservice plan update \
  --name dise-cx-ai-plan \
  --resource-group dise-cx-ai-rg \
  --number-of-workers 3
```

---

## Troubleshooting

### Deployment Fails

1. Check build logs in GitHub Actions or Azure deployment center
2. Verify all environment variables are set
3. Ensure Node.js version matches (18+)
4. Check for build errors locally first

### Application Not Loading

1. Check application logs
2. Verify environment variables are correct
3. Test Foundry endpoint connectivity
4. Check API key is valid

### API Errors

1. Enable DEBUG mode temporarily
2. Check debug panel in the app
3. Verify Foundry endpoint is accessible from Azure
4. Check API quotas and limits

### Voice Features Not Working

Voice features work in the browser and don't require server-side configuration. 
Ensure:
- Users are on Chrome/Edge
- HTTPS is enabled (required for microphone access)
- Users have granted microphone permissions

---

## Security Best Practices

1. **Never commit secrets**
   - Use environment variables
   - Keep `.env.local` out of version control

2. **Use Azure Key Vault** (Optional but recommended)
   ```bash
   # Create Key Vault
   az keyvault create \
     --name dise-cx-ai-vault \
     --resource-group dise-cx-ai-rg \
     --location eastus
   
   # Store secrets
   az keyvault secret set \
     --vault-name dise-cx-ai-vault \
     --name foundry-api-key \
     --value "your_api_key"
   ```

3. **Enable Managed Identity**
   - For App Service, enable managed identity
   - Grant Key Vault access
   - Reference secrets from Key Vault

4. **Restrict CORS** (if needed)
   - Configure allowed origins
   - Limit to your domains only

5. **Monitor and Alert**
   - Set up Application Insights
   - Create alerts for errors
   - Monitor API usage

---

## Continuous Deployment

### GitHub Actions (Automatic)

When using Static Web Apps, GitHub Actions is automatically configured.

The workflow file is created at `.github/workflows/azure-static-web-apps-*.yml`

### Manual Workflow

If using App Service, create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Azure App Service

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Deploy to Azure
      uses: azure/webapps-deploy@v2
      with:
        app-name: dise-cx-ai-assistant
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: .
```

---

## Cost Estimation

### Static Web Apps
- Free tier: $0/month (100GB bandwidth, limited)
- Standard tier: ~$9/month + bandwidth

### App Service
- Basic B1: ~$13/month
- Standard S1: ~$70/month
- Premium P1V2: ~$146/month

### Additional Costs
- Application Insights: ~$2-10/month
- Custom domain SSL: Free with App Service

---

## Support

For deployment issues:
1. Check Azure Status page
2. Review deployment logs
3. Contact Azure Support
4. Reach out to development team

---

## Maintenance

### Regular Updates

```bash
# Update dependencies
npm update

# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

### Backup Strategy

1. **Code**: Stored in GitHub
2. **Configurations**: Document all environment variables
3. **Logs**: Exported to Application Insights
4. **Chat Data**: Stored in user's browser (localStorage)

---

## Rollback Procedure

### Static Web Apps
- Go to Deployments in Azure Portal
- Select previous deployment
- Click "Reactivate"

### App Service
```bash
# Swap deployment slots
az webapp deployment slot swap \
  --name dise-cx-ai-assistant \
  --resource-group dise-cx-ai-rg \
  --slot staging \
  --target-slot production
```

Or rollback via Git:
```bash
git revert HEAD
git push azure main
```

---

## Checklist

Before deploying to production:

- [ ] Environment variables configured
- [ ] Build succeeds locally
- [ ] All tests pass
- [ ] API endpoints tested
- [ ] Voice features tested in target browsers
- [ ] Mobile responsive design verified
- [ ] Debug mode disabled (DEBUG=false)
- [ ] SSL certificate configured
- [ ] Custom domain setup (if applicable)
- [ ] Monitoring enabled
- [ ] Backup strategy in place
- [ ] Documentation updated

---

**Deployment Date**: _________________

**Deployed By**: _________________

**Production URL**: _________________
