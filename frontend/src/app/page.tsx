import { redirect } from "next/navigation";

export default function Home() {
  // Por ahora siempre lleva a login
  redirect("/login");
}