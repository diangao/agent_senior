# agent_senior
# Elder Voice Assistant

A voice-based digital service configuration assistant designed for elderly users. This application helps seniors configure and use smart devices through simple voice interactions.

## Features

- 🎤 Voice-based interaction
- 🤖 AI-powered conversation
- 📱 Smart device configuration assistance
- 👥 Family member monitoring
- 📊 Usage analytics
- 🔐 Secure authentication

## Tech Stack

- Next.js 14 with TypeScript
- ElevenLabs for voice processing
- OpenAI GPT-4 for conversation
- Make (Integromat) for automation
- Clerk for authentication
- PostHog for analytics
- React Flow for process visualization
- Tailwind CSS & shadcn/ui for styling

## Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- npm or yarn package manager
- Accounts and API keys for:
  - [Clerk](https://dashboard.clerk.dev/)
  - [ElevenLabs](https://elevenlabs.io/)
  - [OpenAI](https://platform.openai.com/)
  - [PostHog](https://app.posthog.com/)
  - [Make](https://www.make.com/)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/elder-voice-assistant.git
cd elder-voice-assistant
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following content:
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# ElevenLabs
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_api_key

# OpenAI
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Make (Integromat)
NEXT_PUBLIC_MAKE_WEBHOOK_URL=your_make_webhook_url
```

4. Replace all placeholder values in `.env.local` with your actual API keys.

## Development

Run the development server:
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
elder-voice-assistant/
├── src/
│   ├── app/             # Next.js app router files
│   ├── components/      # React components
│   │   ├── ui/         # shadcn UI components
│   │   └── ...         # Custom components
│   └── lib/            # Utility functions and service integrations
├── public/             # Static files
└── ...config files
```

## Service Setup

### Clerk Authentication
1. Create a Clerk application
2. Copy the publishable key and secret key
3. Add sign-in and sign-up URLs in Clerk dashboard

### ElevenLabs
1. Create an ElevenLabs account
2. Generate an API key
3. Select or create a voice profile

### Make (Integromat) Workflows
1. Create the following scenarios:
   - Device connection workflow
   - App registration workflow
   - Family notification workflow
2. Get the webhook URLs for each scenario

### PostHog Setup
1. Create a PostHog project
2. Copy the project API key
3. Configure event tracking

## Deployment

The application can be deployed to Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add all environment variables in Vercel project settings
4. Deploy

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

[MIT License](LICENSE)

## Support

For support, please open an issue in the GitHub repository.