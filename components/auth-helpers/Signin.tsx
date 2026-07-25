"use client";

import {authClient} from "@/lib/auth-client";
import BrandIcon from "@/components/BrandIcon";

const handleSignIn = async () => {
    await authClient.signIn.social({
        provider: "google",
        callbackURL: "/admin",
    });
};

const Signin = () => {
    return (
        <button
            onClick={handleSignIn}
            className="button-primary"
        >
            <BrandIcon brand="google" className="mr-2 inline size-5 text-white" />
            <span className="text-lg text-white">Sign In with Google</span>
        </button>
    );
};

export default Signin;
