import type { Metadata } from "next";
import { RegistrationWizard } from "@/components/register/wizard";

export const metadata: Metadata = { title: "Register your child – Lil Angels (concept demo)" };

export default function RegisterPage() {
  return <RegistrationWizard />;
}
