# Setup Instructions - Azure Authentication Required

## ⚠️ Important: Azure Login Required

Your chat application is now configured to use the **official Azure AI Projects SDK** with proper Microsoft Entra ID authentication.

### Current Status

✅ **Implementation Complete:**
- Azure SDK packages installed
- Client code updated to use `DefaultAzureCredential`
- TypeScript errors resolved
- Dev server running on http://localhost:3004

⏳ **Waiting For:**
- Azure CLI login completion

### Steps to Complete Setup

#### 1. Complete Azure Login (Currently In Progress)

The Azure CLI is prompting you to select a subscription. In the terminal running `az login`:

```
Select a subscription and tenant (Type a number or Enter for no changes):
```

**Action Required:**
- Type `2` and press Enter to select "Dise-Dev" subscription
- OR just press Enter to use the default (marked with *)

#### 2. Verify Login

After login completes, verify it worked:

```bash
az account show
```

You should see your subscription details.

#### 3. Test the Application

Once logged in:

1. Open http://localhost:3004 in your browser
2. Type a test message: "Hello, who are you?"
3. Click Send
4. Wait for your Foundry agent to respond

### How the Authentication Works

**DefaultAzureCredential** tries authentication methods in this order:

1. ✅ **Environment Variables** (Azure environment)
2. ✅ **Workload Identity** (Azure Kubernetes)
3. ✅ **Managed Identity** (Azure VM/App Service)
4. ✅ **Azure CLI** (Local development - what we're using now)
5. ✅ **Azure PowerShell**
6. ✅ **Interactive Browser** (fallback)

For local development, it uses your Azure CLI login (#4).

### What If It Still Doesn't Work?

If you get authentication errors after logging in:

#### Option A: Grant Permissions

Your Azure account might need specific permissions on the Foundry resource:

1. Go to Azure Portal
2. Navigate to your Foundry resource
3. Go to "Access Control (IAM)"
4. Add role assignment:
   - Role: **Cognitive Services OpenAI User** or **Cognitive Services User**
   - Assign to: Your Azure account

#### Option B: Use Service Principal

For production or if personal account doesn't work:

1. Create a Service Principal:
```bash
az ad sp create-for-rbac --name "dise-cx-ai-assistant" --role "Cognitive Services OpenAI User" --scopes /subscriptions/f1f59f7b-e82f-4899-93c8-b60f0595001b/resourceGroups/AI-POC/providers/Microsoft.CognitiveServices/accounts/Dise-CX-AI-POC-Foundry
```

2. Set environment variables in `.env.local`:
```env
AZURE_TENANT_ID=your_tenant_id
AZURE_CLIENT_ID=your_client_id
AZURE_CLIENT_SECRET=your_client_secret
```

`DefaultAzureCredential` will automatically use these if present.

### Troubleshooting

#### Error: "Access Denied"
- **Solution**: Add permissions in Azure Portal (see Option A above)

#### Error: "No credential found"
- **Solution**: Make sure `az login` completed successfully
- Try: `az account show` to verify

#### Error: "Property does not exist"
- **Solution**: Restart the dev server after login:
  - Stop: Ctrl+C
  - Start: `npm run dev`

### Testing Checklist

Once authentication works:

- [ ] Message sends without errors
- [ ] Agent responds correctly
- [ ] Debug panel shows successful run
- [ ] Thread ID is preserved between messages
- [ ] Voice features still work
- [ ] Error handling displays properly

### Next Steps After Testing

1. **If it works**: Deploy to Azure (see DEPLOYMENT.md)
2. **If it fails**: Share the exact error message from:
   - Browser console
   - Terminal output
   - Debug panel

---

## Quick Reference

**Azure Login:**
```bash
az login
```

**Check Login:**
```bash
az account show
```

**Start Dev Server:**
```bash
npm run dev
```

**Test URL:**
http://localhost:3004

**Your Configuration:**
- Endpoint: `https://dise-cx-ai-poc-foundry.services.ai.azure.com/api/projects/CX-AI-Project`
- Agent ID: `asst_ObJnXcqmjc1V9eo742I83MU1`
- Subscription: `Dise-Dev (f1f59f7b-e82f-4899-93c8-b60f0595001b)`
