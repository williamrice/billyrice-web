'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group';
import Script from 'next/script';
import LinkButton from '../MainButton';

const formSchema = z.object({
  name: z
    .string()
    .min(4, 'Name must be at least 4 characters.')
    .max(32, 'Name must be at most 32 characters.'),
  email: z.email('Invalid email address.'),
  message: z.string(),
});

export function ContactForm() {
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    // @ts-expect-error - grecaptcha is loaded by the Script component and is not available at compile time
    grecaptcha.enterprise.ready(async () => {
      // @ts-expect-error - grecaptcha is loaded by the Script component and is not available at compile time
      const token = await grecaptcha.enterprise.execute(recaptchaSiteKey, {
        action: 'contact_form_submit',
      });
      const response = await fetch('/api/contact-form-submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, recaptchaToken: token }),
      });
      if (response.ok) {
        console.log('Email sent successfully!');
      } else {
        console.error('Failed to send email:', response.statusText);
        form.setError('form', {
          type: 'server',
          message: `Failed to submit form. Please try again later. -- ${response.statusText}`,
        });
      }
    });
  }

  if (form.formState.isSubmitSuccessful) {
    return (
      <Card>
        <CardHeader className="flex flex-col w-full sm:max-w-2xl gap-2">
          <CardTitle className="mb-2">Thank you for reaching out!</CardTitle>
          <CardDescription>
            I appreciate you taking the time to contact me. I&apos;ll get back to you
            as soon as possible.
          </CardDescription>
          <CardFooter className="p-0">
            <LinkButton type="primary" text="Go Back Home" link="/" />
          </CardFooter>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Script
        src={`https://www.google.com/recaptcha/enterprise.js?render=${recaptchaSiteKey}`}
        strategy="afterInteractive"
      />
      <Card className="w-full border-border bg-card/60 shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl tracking-tight">Send a message</CardTitle>
          <CardDescription>
            Share enough context for me to understand what you are working through.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="form-rhf-contact" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-contact-name">
                      Name
                    </FieldLabel>
                    <Input
                      {...field}
                      id="form-rhf-contact-name"
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-contact-email">
                      Email
                    </FieldLabel>
                    <Input
                      {...field}
                      id="form-rhf-contact-email"
                      aria-invalid={fieldState.invalid}
                      autoComplete="email"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="message"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-contact-message">
                      Message
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupTextarea
                        {...field}
                        id="form-rhf-contact-message"
                        placeholder="Your message..."
                        rows={6}
                        className="min-h-24 resize-none"
                        aria-invalid={fieldState.invalid}
                      />
                      <InputGroupAddon align="block-end">
                        <InputGroupText className="tabular-nums">
                          {field.value.length}/1000 characters
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Field orientation="horizontal">
            <Button
              className="button-quiet mt-0"
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Reset
            </Button>
            <Button
              className="button-primary mt-0"
              type="submit"
              form="form-rhf-contact"
            >
              Submit
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </>
  );
}
