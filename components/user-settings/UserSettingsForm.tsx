'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Controller, useForm } from 'react-hook-form';
import { useTheme } from 'next-themes';

const formSchema = z.object({
  theme: z.string({
    error: 'Please select a preferred theme.',
  }),
});

async function onSubmit(
  values: z.infer<typeof formSchema>,
  setThemeFunction: (theme: string) => void,
) {
  await fetch('/api/user/settings', {
    method: 'POST',
    body: JSON.stringify(values),
  });
  setThemeFunction(values.theme);
}

export function UserSettingsForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      theme: 'system',
    },
  });
  const { setTheme } = useTheme();

  return (
    <form
      onSubmit={form.handleSubmit((data) => onSubmit(data, setTheme))}
      className="mx-auto max-w-lg space-y-8 border border-border bg-card/50 p-6 sm:p-8"
    >
      <Controller
        control={form.control}
        name="theme"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="settings-theme">Theme</FieldLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="settings-theme" aria-invalid={fieldState.invalid}>
                <SelectValue placeholder="Select a preferred theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <FieldDescription>This is your preferred theme.</FieldDescription>
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
      <Button type="submit" className="button-primary">Save settings</Button>
    </form>
  );
}
