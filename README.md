# Calvin - Calendar Agent

An intelligent calendar management application that integrates with Google Calendar and provides AI-powered scheduling assistance.

## Features

- Google OAuth authentication with calendar access
- Clean, responsive UI built with Next.js and Tailwind CSS
- Secure session management with NextAuth.js

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd calvin
npm install
```

### 2. Configure Google OAuth

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API and Gmail API
4. Create OAuth 2.0 credentials:
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
   - Set application type to "Web application"
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Copy the Client ID and Client Secret

### 3. Environment Variables

Update the `.env.local` file with your Google OAuth credentials:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# NextAuth Configuration
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=http://localhost:3000
```

Generate a random secret for `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
src/
├── app/
│   ├── api/auth/[...nextauth]/route.ts  # NextAuth API routes
│   ├── layout.tsx                       # Root layout with SessionProvider
│   └── page.tsx                         # Landing page with auth flow
├── components/
│   ├── Dashboard.tsx                    # Post-authentication dashboard
│   └── SignInButton.tsx                 # Google sign-in button
├── auth.ts                              # NextAuth configuration
└── types/
    └── next-auth.d.ts                   # TypeScript declarations
```

## Technologies Used

- **Next.js 15** - React framework with App Router
- **NextAuth.js v5** - Authentication library
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type safety
- **Google APIs** - Calendar and Gmail integration

## Required Scopes

The application requests the following Google OAuth scopes:

- `openid`, `email`, `profile` - Basic user information
- `https://www.googleapis.com/auth/calendar.readonly` - Read calendar events
- `https://www.googleapis.com/auth/calendar.events` - Create/modify calendar events
- `https://www.googleapis.com/auth/gmail.compose` - Draft emails

## Next Steps

- Implement calendar data fetching and display
- Add chat interface for AI agent interaction
- Integrate with AI language model for intelligent responses
- Add meeting analytics and insights
