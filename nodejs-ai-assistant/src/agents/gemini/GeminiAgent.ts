import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Channel, DefaultGenerics, Event, StreamChat } from "stream-chat";
import type { AIAgent } from "../types";

export class GeminiAgent implements AIAgent {
  private genAI: GoogleGenerativeAI;
  private lastInteractionTs = Date.now();

  constructor(
    readonly chatClient: StreamChat,
    readonly channel: Channel
  ) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Google Gemini API key is required in .env file");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  dispose = async () => {
    this.chatClient.off("message.new", this.handleMessage);
    await this.chatClient.disconnectUser();
  };

  get user() {
    return this.chatClient.user;
  }

  getLastInteraction = (): number => this.lastInteractionTs;

  init = async () => {
    this.chatClient.on("message.new", this.handleMessage);
  };

  private getWritingAssistantPrompt = (context?: string): string => {
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return `You are an expert AI Writing Assistant. Your primary purpose is to be a collaborative writing partner. Today's date is ${currentDate}.
    **Writing Context**: ${context || "General writing assistance."}
    **Crucial Instructions**: Be direct and production-ready. Use clear formatting. Never begin responses with phrases like "Here's the edit:", "Here are the changes:", or similar introductory statements. Provide responses directly and professionally without unnecessary preambles.`;
  };

  private handleMessage = async (e: Event<DefaultGenerics>) => {
    if (!e.message || e.message.ai_generated) {
      return;
    }

    const message = e.message.text;
    if (!message) return;

    this.lastInteractionTs = Date.now();

    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const { message: channelMessage } = await this.channel.sendMessage({
      text: "",
      ai_generated: true,
    });

    await this.channel.sendEvent({
        type: "ai_indicator.update",
        ai_state: "AI_STATE_THINKING",
        cid: channelMessage.cid,
        message_id: channelMessage.id,
    });

    try {
        const result = await model.generateContentStream(message);
        
        await this.channel.sendEvent({
            type: "ai_indicator.update",
            ai_state: "AI_STATE_GENERATING",
            cid: channelMessage.cid,
            message_id: channelMessage.id,
        });

        let fullText = "";
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          fullText += chunkText;
          // Stream the partial update to the channel
          await this.chatClient.partialUpdateMessage(channelMessage.id, {
            set: { text: fullText },
          });
        }

        await this.channel.sendEvent({
            type: "ai_indicator.clear",
            cid: channelMessage.cid,
            message_id: channelMessage.id,
        });

    } catch (error) {
        console.error("Error generating content with Gemini:", error);
        await this.channel.sendEvent({
            type: "ai_indicator.update",
            ai_state: "AI_STATE_ERROR",
            cid: channelMessage.cid,
            message_id: channelMessage.id,
        });
        await this.chatClient.partialUpdateMessage(channelMessage.id, {
            set: {
                text: "Sorry, an error occurred while generating the response.",
            },
        });
    }
  };
}