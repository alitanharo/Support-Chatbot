# support Assistant

A production-ready AI chatbot POC for the Content Management System, powered by Microsoft Azure Foundry.

## Features

### Core Functionality
-  **AI Agent Integration** - Connected to Azure Foundry with custom tools and knowledge base
-  **Text Chat** - Full markdown support with typing indicators
-  **Voice Input** - Speech-to-text dictation
-   **Voice Output** - Text-to-speech for agent responses
-  **Conversation History** - Auto-saves conversations with load/delete functionality
-  **Thread Persistence** - Maintains conversation context
-  **Error Handling** - User-friendly error messages with toast notifications
-  **Debug Panel** - For troubleshooting and monitoring
-  **Responsive Design** - Works on desktop, tablet, and mobile

### Technical Stack
- **Frontend**: React 18 + TypeScript + Next.js 14
- **UI**: Tailwind CSS + shadcn/ui components
- **Backend**: Next.js API Routes
- **AI**: Azure AI Projects SDK
- **Authentication**: Microsoft Entra ID (DefaultAzureCredential)
- **Voice**: Web Speech API (browser-based)

## Quick Start

### Prerequisites
- Node.js 18+ installed
- Azure CLI installed and authenticated (`az login`)
- Access to Azure Foundry project

### Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:
```env
FOUNDRY_PROJECT_ENDPOINT=your_project_endpoint
FOUNDRY_API_KEY=your_api_key
FOUNDRY_ASSISTANT_ID=your_assistant_id
DEBUG=false
```

3. **Run development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

4. **Build for production:**
```bash
npm run build
npm start
```

## Usage

### Text Chat
1. Type your message in the input box
2. Press Enter or click Send button
3. Agent responds with relevant information

### Voice Input
1. Click the microphone icon
2. Speak your message
3. Click again to stop and send

### Voice Output
1. Toggle "Read Aloud" in the sidebar
2. Agent responses will be spoken automatically

### Conversation History
- Conversations auto-save after each exchange
- Click "Recent Chats" in sidebar to view history
- Click any conversation to switch to it
- Hover and click trash icon to delete

## Configuration

### Azure Foundry Setup
Required environment variables:
- `FOUNDRY_PROJECT_ENDPOINT` - Your Foundry project API endpoint
- `FOUNDRY_API_KEY` - Project API key (keep secret!)
- `FOUNDRY_ASSISTANT_ID` - Your agent/assistant ID

### Authentication
The app uses **Microsoft Entra ID** authentication:
- **Local Development**: Uses `az login` credentials
- **Production**: Uses Azure Managed Identity

No additional authentication setup required!

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions to:
- Azure App Service
- Azure Static Web Apps
- Azure Container Apps

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/chat/          # Backend API route
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/
│   ├── chat/              # Chat UI components
│   ├── layout/            # Layout components (sidebar, debug)
│   └── ui/                # Reusable UI components
├── lib/
│   ├── foundry/           # Azure Foundry client
│   ├── voice/             # Voice features (STT/TTS/VAD)
│   ├── storage.ts         # LocalStorage utilities
│   └── utils.ts           # Helper functions
└── types/                 # TypeScript type definitions
```

## Troubleshooting

### Common Issues

**Agent not responding:**
- Check environment variables are set correctly
- Verify Azure CLI is authenticated (`az login`)
- Check Azure permissions (Cognitive Services OpenAI User role)

**Voice not working:**
- Use Chrome or Edge browser
- Allow microphone permissions
- Check browser console for errors








