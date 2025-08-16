// react-stream-ai-assistant/src/App.tsx
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth, useUser } from "@clerk/clerk-react";
import { AuthenticatedApp } from "@/components/authenticated-app";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState } from "react";
import { User } from "stream-chat";
import { Button } from "./components/ui/button";
import { LoadingScreen } from "./components/loading-screen";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// This component handles fetching the Stream token after a user signs in with Clerk
const ChatWithClerkAuth = () => {
  const { getToken } = useAuth();
  const { user: clerkUser } = useUser();
  const [streamUser, setStreamUser] = useState<User | null>(null);
  const [streamToken, setStreamToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchStreamToken = async () => {
      if (!clerkUser) return;

      try {
        const clerkToken = await getToken();
        if (!clerkToken) {
            console.error("Clerk token not available");
            return;
        }

        const response = await fetch(`${backendUrl}/token`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${clerkToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to get Stream token from backend');
        }

        const { token } = await response.json();
        
        const userForStream: User = {
            id: clerkUser.id,
            name: clerkUser.fullName || clerkUser.username || 'User',
            image: clerkUser.imageUrl,
        };

        setStreamUser(userForStream);
        setStreamToken(token);

      } catch (error) {
        console.error("Error fetching Stream token:", error);
      }
    };

    fetchStreamToken();
  }, [clerkUser, getToken]);

  // Clerk's <UserButton /> will handle the sign-out logic
  const handleLogout = () => {
    // This function can be left empty or used for any extra cleanup if needed
  };

  if (!streamUser || !streamToken) {
    return <LoadingScreen />;
  }
  
  return <AuthenticatedApp user={streamUser} token={streamToken} onLogout={handleLogout} />;
}

// A simple welcome page for logged-out users
const WelcomePage = () => (
    <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Welcome to the AI Chat App</h1>
            <p className="text-muted-foreground mb-6">Please sign in to continue</p>
            <SignInButton mode="modal">
                <Button>Sign In</Button>
            </SignInButton>
        </div>
    </div>
);

function App() {
  return (
    <div className="h-screen bg-background">
      {/* The UserButton provides a profile menu with a sign-out option */}
      <div className="absolute top-4 right-4 z-50">
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>

      <SignedIn>
        <ChatWithClerkAuth />
      </SignedIn>
      <SignedOut>
        <WelcomePage />
      </SignedOut>

      <Toaster />
    </div>
  );
}

export default App;