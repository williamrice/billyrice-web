'use client';
import { useForm } from 'react-hook-form';
import SubmitButton from './SubmitButton';
import { useState } from 'react';
import { Copy, Check, Loader2 } from 'lucide-react';

type Inputs = {
  title: string;
  message: string;
};

const SecretMessageForm = () => {
  const secretHostName = process.env.NEXT_PUBLIC_SECRETMESSAGE_HOSTNAME;

  const [url, setUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (formData: Inputs) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${secretHostName}/api/Secret`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error('Failed to add secret message');
      }
      const data = await response.json();
      setUrl(data.url);
    } catch (error) {
      console.error('Error adding secret message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>();

  const handleCopy = async () => {
    if (url) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative space-y-6 border border-border bg-card/50 p-6 md:p-8"
      >
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/90 backdrop-blur-sm">
            <div className="flex flex-col items-center space-y-3">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Creating your secret message...</p>
            </div>
          </div>
        )}
        <div className="space-y-2">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-foreground"
          >
            Title
          </label>
          <input
            {...register('title', { required: true })}
            id="title"
            type="text"
            placeholder="Enter a title for your message"
            className="min-h-12 w-full border border-input bg-background px-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:opacity-50"
            disabled={isLoading}
          />
          {errors.title && (
            <p className="text-red-600 text-sm">Title is required</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="message"
            className="block text-sm font-medium text-foreground"
          >
            Message
          </label>
          <textarea
            {...register('message', { required: true })}
            id="message"
            rows={6}
            placeholder="Enter your secret message"
            className="w-full resize-none border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:opacity-50"
            disabled={isLoading}
          />
          {errors.message && (
            <p className="text-red-600 text-sm">Message is required</p>
          )}
        </div>

        <div className="pt-4">
          <SubmitButton loading={isLoading} />
        </div>
      </form>

      {url && (
        <div className="mt-8 border border-border bg-card/50 p-6 md:p-8">
          <h3 className="mb-4 text-xl font-medium text-foreground">
            Your Secret Message Link
          </h3>
          <div className="flex items-center space-x-2 border border-border bg-background p-3">
            <p className="flex-1 truncate text-muted-foreground">{url}</p>
            <button
              onClick={handleCopy}
              className="grid size-11 place-items-center hover:bg-accent"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="size-5 text-primary" />
              ) : (
                <Copy className="size-5 text-muted-foreground" />
              )}
            </button>
          </div>
          <div className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
            <p>
              ⚠️ This link will only work once. Do not test it or the message
              will be permanently deleted.
            </p>
            <p>
              Share this link with others to allow them to view your secret
              message.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecretMessageForm;
