# Calvin - Calendar Agent

An intelligent calendar management application that integrates with Google Calendar.

## ⚠️ AI Disclaimer

This application uses artificial intelligence to analyze and provide insights about your calendar events. Please note:

- **AI-generated content may contain inaccuracies** - Always verify important information independently
- **Recommendations are suggestions only** - Use your own judgment when making scheduling decisions
- **Data interpretation may vary** - The AI's understanding of context may differ from your intent
- **Not a substitute for professional advice** - For critical scheduling or time management needs, consult appropriate professionals

By using this application, you acknowledge that AI-generated insights are provided "as-is" and should be used as supplementary information rather than definitive guidance.

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/calvin.git
cd calvin
npm install
```

### 2. Set Environment Variables

Create a `.env.local` file in the root directory:

```env
# Google OAuth (get these from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# NextAuth
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# OpenAI
OPENAI_API_KEY=your-openai-api-key-here
```

To generate a secret for `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

### 3. Run the Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
