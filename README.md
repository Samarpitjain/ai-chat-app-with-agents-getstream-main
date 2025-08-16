Of course. Here is a fully updated `README.md` file that reflects all the changes we've made, including the switch to the Gemini API and the addition of Clerk for authentication.

-----

# AI Chat App with Clerk, Google Gemini & Stream

A modern, full-stack AI-powered chat application built with a robust tech stack including **Stream Chat** for real-time messaging, **Google's Gemini API** for intelligent responses, and **Clerk** for secure and seamless user authentication.

## 🚀 Features

  - **Complete Authentication**: Full sign-up, sign-in, and user management powered by [Clerk](https://clerk.com/).
  - **Real-time Chat**: Scalable and reliable chat powered by [GetStream.io](https://getstream.io).
  - **AI Writing Assistant**: **Google Gemini API** integration for fast, context-aware content generation.
  - **Modern UI**: Beautiful and responsive React interface built with Tailwind CSS and shadcn/ui.
  - **Agent Management**: Dynamic AI agent lifecycle management on the backend.
  - **Dark/Light Mode**: Theme support that respects user system preferences.

## 🏗️ Architecture

### Backend (`nodejs-ai-assistant/`)

  - **Node.js/Express**: Handles API requests and business logic.
  - **Clerk**: Manages user authentication and session verification.
  - **Stream Chat SDK**: Handles server-side chat functionality.
  - **Google Gemini API**: Connects to Google's generative models for AI responses.

### Frontend (`react-stream-ai-assistant/`)

  - **React & Vite**: A fast and powerful frontend stack.
  - **Clerk React**: Provides pre-built UI components and hooks for a seamless authentication experience.
  - **Stream Chat React**: Offers rich, pre-built components for the chat interface.
  - **Tailwind CSS + shadcn/ui**: For a modern, utility-first design system.

## 📋 Prerequisites

  - **Node.js**: Version 20 or higher.
  - **Package Manager**: `npm` or `yarn`.
  - **GetStream.io Account**: A free tier is available.
  - **Google AI Studio Account**: To get a free Gemini API key.
  - **Clerk Account**: A free tier is available for developers.

## 🛠️ Setup Instructions

### 1\. Clone the Repository

```bash
git clone https://github.com/Samarpitjain/ai-chat-app-with-agents-getstream-main
cd ai-chat-app-with-agents-getstream-main
```

### 2\. Backend Setup (`nodejs-ai-assistant/`)

Navigate to the backend directory:

```bash
cd nodejs-ai-assistant
```

**Install dependencies:**

```bash
npm install
```

**Create and configure your environment file:**

Copy the example file (`.env.example`) to create your own local configuration (`.env`).

```bash
cp .env.example .env
```

Now, open the `.env` file and add your secret keys:

```env
# GetStream credentials - From https://getstream.io/dashboard
STREAM_API_KEY=your_stream_api_key_here
STREAM_API_SECRET=your_stream_api_secret_here

# Google Gemini API key - From https://ai.google.dev/aistudio
GEMINI_API_KEY=your_gemini_api_key_here

# Clerk Secret Key - From your Clerk Dashboard
CLERK_SECRET_KEY=your_clerk_secret_key_here
```

### 3\. Frontend Setup (`react-stream-ai-assistant/`)

Navigate to the frontend directory:

```bash
cd ../react-stream-ai-assistant
```

**Install dependencies:**

```bash
npm install
```

**Create and configure your environment file:**

```bash
cp .env.example .env
```

Open the `.env` file and add your public keys:

```env
# Stream Chat public API Key
VITE_STREAM_API_KEY=your_stream_api_key_here

# Clerk Publishable Key - From your Clerk Dashboard
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here

# Backend URL for local development
VITE_BACKEND_URL=http://localhost:3000
```

## 🚀 Running the Application Locally

You will need to run two separate terminal processes.

**1. Start the Backend Server:**

In the `nodejs-ai-assistant` directory, run:

```bash
npm run dev
```

The backend server will start on `http://localhost:3000`.

**2. Start the Frontend Application:**

In the `react-stream-ai-assistant` directory, run:

```bash
npm run dev
```

The frontend will be available at `http://localhost:8080`.

## 部署

This application uses a professional hybrid deployment strategy, leveraging the best platform for each part of the stack.

### Backend Deployment (on Render)

Render is ideal for hosting our Node.js server.

1.  **Create a "New Web Service"** on the [Render Dashboard](https://dashboard.render.com/).
2.  Connect your GitHub repository.
3.  Configure the service:
      - **Root Directory**: `nodejs-ai-assistant`
      - **Build Command**: `npm install && tsc`
      - **Start Command**: `node dist/index.js`
      - **Plan**: Select the **Free** tier.
4.  **Add Environment Variables**: In the "Environment" tab, add your `STREAM_API_KEY`, `STREAM_API_SECRET`, `GEMINI_API_KEY`, and `CLERK_SECRET_KEY`.
5.  Deploy the service and **copy the public URL** it provides.

### Frontend Deployment (on Vercel)

Vercel is optimized for hosting fast frontends.

1.  **Update Backend URL**: Before deploying, ensure the `VITE_BACKEND_URL` in your local `react-stream-ai-assistant/.env` file points to your live Render backend URL. Commit and push this change to GitHub.
2.  **Create a "New Project"** on the [Vercel Dashboard](https://vercel.com/dashboard).
3.  Import your GitHub repository.
4.  Configure the project:
      - **Framework Preset**: Should auto-detect **Vite**.
      - **Root Directory**: `react-stream-ai-assistant`.
5.  **Add Environment Variables**:
      - `VITE_STREAM_API_KEY`: Your public Stream API key.
      - `VITE_CLERK_PUBLISHABLE_KEY`: Your public Clerk key.
      - `VITE_BACKEND_URL`: The full URL of your deployed Render backend.
6.  Click **"Deploy"**.

## 📚 Technologies Used

### Backend

  - **Node.js** & **Express**
  - **Clerk** (Authentication & User Management)
  - **Stream Chat** (Real-time Messaging)
  - **Google Gemini** (AI Language Model)
  - **TypeScript**

### Frontend

  - **React** & **Vite**
  - **TypeScript**
  - **Clerk React** (Auth Components & Hooks)
  - **Stream Chat React** (Chat UI Components)
  - **Tailwind CSS** & **shadcn/ui**

## 🤝 Contributing

1.  Fork the repository.
2.  Create a feature branch.
3.  Make your changes and test them.
4.  Submit a pull request for review.

## 📄 License

This project is licensed under the MIT License.