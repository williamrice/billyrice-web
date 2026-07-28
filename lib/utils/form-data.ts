export function getFormString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

export function requireFormString(formData: FormData, key: string, message: string) {
  const value = getFormString(formData, key);
  if (!value) throw new Error(message);
  return value;
}
