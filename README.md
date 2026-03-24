# NeuroVerse

NeuroVerse is an immersive, VR-ready smart education platform built with React, Vite, Tailwind CSS, Framer Motion, React Three Fiber, Firebase, and AI-powered tutoring.

## Features

- Futuristic landing page with animated neon visuals
- Login and signup flow using Firebase Auth or local demo auth fallback
- Dashboard with XP, levels, badges, and progress tracking
- Interactive 3D Solar System scene with clickable planets
- AI tutor chat and AI-powered quiz generator
- Firebase or local fallback persistence for profile, scores, progress, and quiz history
- Experience Mode button for fullscreen immersion

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
cp .env.example .env
```

3. Add your Firebase client config and either `GEMINI_API_KEY` or `OPENAI_API_KEY`.

4. Start the app and local API server:

```bash
npm run dev
```

5. Open `http://localhost:5173`.

## Environment Notes

- If Firebase variables are omitted, NeuroVerse uses local browser storage so the demo flow still works.
- If no AI key is provided, the server returns graceful demo responses and sample quizzes.
- Gemini is used first when `GEMINI_API_KEY` is present.

## Demo Flow

1. Log in or create an account.
2. Open the dashboard and review your progress.
3. Enter the learning scene.
4. Click a planet in the 3D Solar System.
5. Ask the AI tutor a question.
6. Generate and submit a quiz.
7. Return to the dashboard to see XP and badge updates.
