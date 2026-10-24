"use client";
import { authClient } from "@/lib/auth-client";

const Signout = () => {
  return (
    <button
      className="text-xs text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      onClick={() =>
        authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              window.location.href = "/";
            },
          },
        })
      }
    >
      Sign Out
    </button>
  );
};

export default Signout;
