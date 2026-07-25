"use client";
import React, { useState } from "react";
import Header from "./Header";
import { SecretMessage } from "@/lib/types";
import { Copy, Check } from "lucide-react";

interface Props {
  secretMessage: SecretMessage | null;
}

const SecretMessageView = ({ secretMessage }: Props) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (secretMessage) {
      await navigator.clipboard.writeText(secretMessage.message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div>
      <Header>
        <div className="h-full flex flex-col items-center justify-center">
          <h1 className="lg:text-6xl text-4xl font-bold text-center text-white">
            Secret Message View
          </h1>
        </div>
      </Header>
      <div className="site-shell py-20 sm:py-28">
        <div className="mx-auto max-w-3xl">
          <div className="border border-border bg-card/50 p-6 md:p-8">
            {secretMessage ? (
              <div className="space-y-6">
                <div>
                  <h2 className="mb-3 text-2xl font-medium text-foreground">
                    {secretMessage.title}
                  </h2>
                  <div className="border border-border bg-background p-4">
                    <div className="flex justify-between items-start gap-4">
                      <p className="flex-1 whitespace-pre-wrap leading-7 text-muted-foreground">
                        {secretMessage.message}
                      </p>
                      <button
                        onClick={handleCopy}
                        className="grid size-11 shrink-0 place-items-center hover:bg-accent"
                        title="Copy message"
                      >
                        {copied ? (
                          <Check className="size-5 text-primary" />
                        ) : (
                          <Copy className="size-5 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="border border-primary/30 bg-primary/5 p-4">
                  <p className="text-sm text-primary">
                    ⚠️ This message will be permanently deleted after viewing.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-lg text-muted-foreground">
                  No secret message found. The message has been viewed already
                  or you have the wrong link.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecretMessageView;
