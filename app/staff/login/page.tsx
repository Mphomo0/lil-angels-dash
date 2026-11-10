"use client";
import { useRouter } from "next/navigation";
import { Eye, ShieldCheck, UserRound } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { useRole } from "@/lib/role";
import type { Role } from "@/lib/types";

export default function StaffLogin() {
  const { setRole } = useRole();
  const router = useRouter();
  const signIn = (r: Role) => {
    setRole(r);
    router.push("/staff");
  };
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-md flex-col gap-6 rounded-3xl border border-border bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center gap-2 text-center">
          <Logo className="text-[0.95rem]" />
          <h1 className="mt-2 text-2xl font-semibold">Staff sign in</h1>
          <p className="text-sm text-muted-foreground">
            This is a demo, so there&apos;s no password. Choose a role to see what each person can access.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button size="lg" onClick={() => signIn("admin")} className="justify-start">
            <ShieldCheck aria-hidden /> Sign in as Admin
          </Button>
          <p className="-mt-1 pl-2 text-xs text-muted-foreground">Principal / office: sees everything, including health detail, documents and ID numbers.</p>
          <Button size="lg" variant="outline" onClick={() => signIn("staff")} className="justify-start">
            <UserRound aria-hidden /> Sign in as Staff
          </Button>
          <p className="-mt-1 pl-2 text-xs text-muted-foreground">Teachers: see contact and emergency info only. Medical detail and documents are hidden.</p>
        </div>
        <p className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">
          <Eye className="size-3.5 shrink-0" aria-hidden /> In production this becomes a real login (Auth.js or Clerk) with two-factor authentication.
        </p>
      </div>
    </main>
  );
}
