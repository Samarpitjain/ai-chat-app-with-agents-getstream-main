// nodejs-ai-assistant/src/index.ts

import { Clerk, ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import cors from "cors";
import "dotenv/config";
import express, { Request, Response } from "express";
import { createAgent } from "./agents/createAgent";
import { AgentPlatform, AIAgent } from "./agents/types";
import { apiKey, serverClient } from "./serverClient";

// Extend Express Request type to include the 'auth' property
// This is the key fix for the TypeScript errors.
declare global {
  namespace Express {
    interface Request {
      auth: {
        userId: string;
      };
    }
  }
}

const clerk = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });
const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

const aiAgentCache = new Map<string, AIAgent>();
const pendingAiAgents = new Set<string>();

const inactivityThreshold = 480 * 60 * 1000;
setInterval(async () => {
  const now = Date.now();
  for (const [userId, aiAgent] of aiAgentCache) {
    if (now - aiAgent.getLastInteraction() > inactivityThreshold) {
      console.log(`Disposing AI Agent due to inactivity: ${userId}`);
      await disposeAiAgent(aiAgent);
      aiAgentCache.delete(userId);
    }
  }
}, 5000);

app.get("/", (req, res) => {
  res.json({
    message: "AI Writing Assistant Server is running",
    apiKey: apiKey,
    activeAgents: aiAgentCache.size,
  });
});

// Use ClerkExpressRequireAuth middleware and handle the request
app.post("/token", ClerkExpressRequireAuth(), async (req: Request, res: Response) => {
  try {
    // Get the user ID from the authenticated request
    const { userId } = req.auth;
    const clerkUser = await clerk.users.getUser(userId);

    if (!clerkUser) {
      return res.status(404).json({ error: "Clerk user not found" });
    }

    // Use the Clerk User ID as the Stream User ID
    const streamUserId = clerkUser.id;

    // Ensure the user exists in Stream
    await serverClient.upsertUser({
      id: streamUserId,
      name: clerkUser.firstName || clerkUser.username || "User",
      image: clerkUser.imageUrl,
    });

    const token = serverClient.createToken(streamUserId);
    res.json({ token });

  } catch (error) {
    console.error("Error generating Stream token:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});


// --- The rest of your endpoints remain unchanged ---

app.post("/start-ai-agent", async (req, res) => {
    const { channel_id, channel_type = "messaging" } = req.body;
    console.log(`[API] /start-ai-agent called for channel: ${channel_id}`);

    if (!channel_id) {
        res.status(400).json({ error: "Missing required fields" });
        return;
    }

    const user_id = `ai-bot-${channel_id.replace(/[!]/g, "")}`;

    try {
        if (!aiAgentCache.has(user_id) && !pendingAiAgents.has(user_id)) {
            console.log(`[API] Creating new agent for ${user_id}`);
            pendingAiAgents.add(user_id);

            await serverClient.upsertUser({
                id: user_id,
                name: "AI Writing Assistant",
            });

            const channel = serverClient.channel(channel_type, channel_id);
            await channel.addMembers([user_id]);

            const agent = await createAgent(
                user_id,
                AgentPlatform.OPENAI, 
                channel_type,
                channel_id
            );

            await agent.init();

            if (aiAgentCache.has(user_id)) {
                await agent.dispose();
            } else {
                aiAgentCache.set(user_id, agent);
            }
        } else {
            console.log(`AI Agent ${user_id} already started or is pending.`);
        }

        res.json({ message: "AI Agent started", data: [] });
    } catch (error) {
        const errorMessage = (error as Error).message;
        console.error("Failed to start AI Agent", errorMessage);
        res.status(500).json({ error: "Failed to start AI Agent", reason: errorMessage });
    } finally {
        pendingAiAgents.delete(user_id);
    }
});

app.post("/stop-ai-agent", async (req, res) => {
    const { channel_id } = req.body;
    console.log(`[API] /stop-ai-agent called for channel: ${channel_id}`);
    const user_id = `ai-bot-${channel_id.replace(/[!]/g, "")}`;
    try {
        const aiAgent = aiAgentCache.get(user_id);
        if (aiAgent) {
            console.log(`[API] Disposing agent for ${user_id}`);
            await disposeAiAgent(aiAgent);
            aiAgentCache.delete(user_id);
        } else {
            console.log(`[API] Agent for ${user_id} not found in cache.`);
        }
        res.json({ message: "AI Agent stopped", data: [] });
    } catch (error) {
        const errorMessage = (error as Error).message;
        console.error("Failed to stop AI Agent", errorMessage);
        res.status(500).json({ error: "Failed to stop AI Agent", reason: errorMessage });
    }
});

app.get("/agent-status", (req, res) => {
    const { channel_id } = req.query;
    if (!channel_id || typeof channel_id !== "string") {
        return res.status(400).json({ error: "Missing channel_id" });
    }
    const user_id = `ai-bot-${channel_id.replace(/[!]/g, "")}`;
    console.log(`[API] /agent-status called for channel: ${channel_id} (user: ${user_id})`);

    if (aiAgentCache.has(user_id)) {
        res.json({ status: "connected" });
    } else if (pendingAiAgents.has(user_id)) {
        res.json({ status: "connecting" });
    } else {
        res.json({ status: "disconnected" });
    }
});

async function disposeAiAgent(aiAgent: AIAgent) {
    await aiAgent.dispose();
    if (!aiAgent.user) {
        return;
    }
    await serverClient.deleteUser(aiAgent.user.id, {
        hard_delete: true,
    });
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});