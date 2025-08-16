import { StreamChat } from "stream-chat";
import { apiKey, serverClient } from "../serverClient";
import { GeminiAgent } from "./gemini/GeminiAgent"; // We will create this file next
import { AgentPlatform, AIAgent } from "./types";

export const createAgent = async (
  user_id: string,
  platform: AgentPlatform,
  channel_type: string,
  channel_id: string
): Promise<AIAgent> => {
  const token = serverClient.createToken(user_id);
  // This is the client for the AI bot user
  const chatClient = new StreamChat(apiKey, undefined, {
    allowServerSideConnect: true,
  });

  await chatClient.connectUser({ id: user_id }, token);
  const channel = chatClient.channel(channel_type, channel_id);
  await channel.watch();

  // We are now defaulting to the GeminiAgent
  switch (platform) {
    case AgentPlatform.WRITING_ASSISTANT:
    case AgentPlatform.OPENAI: // Keep this for compatibility, but it will now point to Gemini
      return new GeminiAgent(chatClient, channel);
    default:
      throw new Error(`Unsupported agent platform: ${platform}`);
  }
};