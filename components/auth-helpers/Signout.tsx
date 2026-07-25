"use client";
import { authClient } from "@/lib/auth-client";

const Signout = () => {
  return (
    <button
      className="button-quiet mt-4"
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
