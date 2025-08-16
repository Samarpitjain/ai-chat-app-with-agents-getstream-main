// react-stream-ai-assistant/src/providers/chat-provider.tsx
import { ReactNode } from "react";
import { User } from "stream-chat";
import { Chat, useCreateChatClient } from "stream-chat-react";
import { LoadingScreen } from "../components/loading-screen";
import { useTheme } from "../hooks/use-theme";

interface ChatProviderProps {
  user: User;
  token: string; // We will now pass the token directly
  children: ReactNode;
}

const apiKey = import.meta.env.VITE_STREAM_API_KEY as string;

export const ChatProvider = ({ user, token, children }: ChatProviderProps) => {
  const { theme } = useTheme();

  const client = useCreateChatClient({
    apiKey,
    tokenOrProvider: token, // Use the token passed as a prop
    userData: user,
  });

  if (!client) {
    return <LoadingScreen />;
  }

  return (
    <Chat
      client={client}
      theme={
        theme === "dark" ? "str-chat__theme-dark" : "str-chat__theme-light"
      }
    >
      {children}
    </Chat>
  );
};