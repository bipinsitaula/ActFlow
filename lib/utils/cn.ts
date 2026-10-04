export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
