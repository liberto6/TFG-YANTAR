import { redirect } from "next/navigation";

export default function HomePage() {
  // In production this would check auth state and restaurant context
  // to redirect to the appropriate route group.
  // For now, redirect to the customer-facing menu.
  redirect("/menu");
}
