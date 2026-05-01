# AI Demo Portal

An Entra ID-authenticated portal for showcasing AI demos, built on Azure Static Web Apps + Python Azure Functions + Cosmos DB.

## Prerequisites

- Azure subscription
- Azure CLI (`az`)
- Azure Functions Core Tools v4 (`func`)
- Node.js 20+
- Python 3.11+
- Azure Static Web Apps CLI (`npm install -g @azure/static-web-apps-cli`)

---

## One-Time Azure Setup

### 1. Create resource group and deploy infrastructure

```bash
az group create --name rg-demosite --location eastus2

az deployment group create --resource-group rg-demosite --template-file infra/main bicep --parameters infra/main.parameters.json
```

Note the outputs: `swaHostname`, `functionAppName`, `cosmosAccountName`.

### 2. Register an Entra ID application

```bash
SWA_URL=https://<swaHostname>   # from output above

az ad app create --display-name "AI Demo Portal" --web-redirect-uris "${SWA_URL}/.auth/login/aad/callback" --sign-in-audience AzureADMyOrg

# Grab the app ID
APP_ID=$(az ad app list --display-name "AI Demo Portal" --query "[0].appId" -o tsv)

# Create a client secret
SECRET=$(az ad app credential reset --id $APP_ID --query password -o tsv)

echo "Client ID: $APP_ID"
echo "Client Secret: $SECRET"
```

### 3. Configure SWA application settings

In the Azure Portal → Static Web Apps → `demosite-swa` → Configuration:

| Name | Value |
|---|---|
| `AZURE_CLIENT_ID` | `<APP_ID from step 2>` |
| `AZURE_CLIENT_SECRET` | `<SECRET from step 2>` |

Also update `staticwebapp.config.json` → replace `AZURE_TENANT_ID` with your actual tenant ID:

```bash
az account show --query tenantId -o tsv
```

### 4. Connect GitHub repo for CI/CD

In the Azure Portal → Static Web Apps → `demosite-swa` → Manage deployment token.
Copy the token and add it as a GitHub Actions secret named `AZURE_STATIC_WEB_APPS_API_TOKEN` in your repo settings.

### 5. Assign yourself as Admin

In the Azure Portal → Static Web Apps → `demosite-swa` → Role Management → Invite.
Enter your email and assign the role `admin`.

---

## Local Development

### Start the Python API

```bash
cd api
cp local.settings.json.example local.settings.json
# Edit local.settings.json and fill in COSMOS_CONNECTION_STRING

func start
```

### Start the frontend

```bash
cd frontend
npm install
npm run dev
```

### Or use SWA CLI (emulates auth locally)

```bash
swa start http://localhost:5173 --api-location api
# Open http://localhost:4280
```

---

## Project Structure

```
DemoSite/
├── frontend/          React + TypeScript + Vite + Fluent UI v9
├── api/               Python Azure Functions v2
├── infra/             Bicep infrastructure
├── staticwebapp.config.json   SWA routing + auth + roles
└── .github/workflows/ GitHub Actions CI/CD
```

---

## Adding Demos

Sign in as an admin, click **Admin** in the nav bar, then **Add Demo**. Fill in:
- **Title** — short, descriptive name
- **Description** — 2-3 sentences on what the demo showcases
- **Category** — select or create one
- **Demo URL** — live link to the running demo
- **Repo URL** — GitHub link (optional)
- **Thumbnail URL** — image URL (optional; falls back to a gradient)
- **Tags** — comma-separated keywords for search
- **Featured** — pin to the top of the gallery

No deployment required — changes appear instantly.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Fluent UI v9 |
| Hosting | Azure Static Web Apps (Free tier) |
| Auth | Entra ID via SWA built-in provider |
| Admin roles | SWA custom role `admin` |
| API | Python 3.11, Azure Functions v2 |
| Database | Azure Cosmos DB NoSQL (Free tier) |
| Storage | Azure Blob Storage (thumbnails) |
| CI/CD | GitHub Actions |
| IaC | Bicep |
