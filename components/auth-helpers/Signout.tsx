"use client";
import { authClient } from "@/lib/auth-client";

const Signout = () => {
  return (
    <button
      className="text-xs text-gray-400 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-400"
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
