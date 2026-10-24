"use client";

import { useState } from "react";
import {authClient} from "@/lib/auth-client";
import BrandIcon from "@/components/BrandIcon";

const Signin = () => {
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string>();

    // Each sign-in request replaces the OAuth state cookie, so a second click
    // would invalidate the first redirect. Stay disabled until the browser leaves.
    const handleSignIn = async () => {
        if (pending) return;
        setPending(true);
        setError(undefined);
        try {
            const result = await authClient.signIn.social({
                provider: "google",
                callbackURL: "/admin",
            });
            if (result.error) throw result.error;
        } catch {
            setError("Sign-in could not be started. Please try again.");
            setPending(false);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={handleSignIn}
                disabled={pending}
                aria-busy={pending}
                className="button-primary disabled:cursor-wait disabled:opacity-70"
            >
                <BrandIcon brand="google" className="mr-2 inline size-5" />
                <span className="text-lg">{pending ? "Redirecting to Google…" : "Sign In with Google"}</span>
            </button>
            {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
        </>
    );
};

export default Signin;
