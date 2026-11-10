import Link from "next/link";
import { ArrowRight, ClipboardList, LayoutDashboard, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";
import { CENTRE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-5 py-10 sm:py-16">
      <header className="flex flex-col items-center gap-4 text-center">
        <Logo className="text-3xl sm:text-4xl" />
        <p className="font-script text-xl text-muted-foreground">{CENTRE.tagline}</p>
        <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground">{CENTRE.levels}</p>
      </header>

      <section className="grid gap-5 md:grid-cols-2" aria-label="Choose where to go">
        <div className="flex flex-col gap-4 rounded-3xl border-2 border-green/40 bg-white p-7 shadow-sm">
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-green-soft text-green-ink">
            <ClipboardList aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold tracking-wide text-pink-ink uppercase">For parents</p>
            <h1 className="mt-1 text-3xl font-semibold text-green-ink">Register your little angel</h1>
            <p className="mt-2 text-muted-foreground">
              Fill in our application form online, on your phone or computer. It takes about 15 minutes and you can
              save and come back later.
            </p>
          </div>
          <Link href="/register" className={cn(buttonVariants({ size: "lg" }), "mt-auto self-start")}>
            Start registration <ArrowRight aria-hidden />
          </Link>
        </div>

        <div className="flex flex-col gap-4 rounded-3xl border-2 border-blue/40 bg-white p-7 shadow-sm">
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-blue-soft text-blue-ink">
            <LayoutDashboard aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold tracking-wide text-blue-ink uppercase">For Lil Angels staff</p>
            <h2 className="mt-1 text-3xl font-semibold">Registrations dashboard</h2>
            <p className="mt-2 text-muted-foreground">
              See new applications, manage the waitlist, check documents and keep notes on every child.
            </p>
          </div>
          <Link href="/staff/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "mt-auto self-start")}>
            Staff sign in <ArrowRight aria-hidden />
          </Link>
        </div>
      </section>

      <footer className="grid gap-4 rounded-3xl bg-muted/70 p-6 text-sm sm:grid-cols-3">
        {CENTRE.sites.map((s) => (
          <div key={s.id} className="flex gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0 text-pink-ink" aria-hidden />
            <div>
              <p className="font-semibold">{s.name}</p>
              <p className="text-muted-foreground">{s.address}</p>
              <p className="text-muted-foreground">
                <Phone className="mr-1 inline size-3.5" aria-hidden />
                {s.tel}
                {s.cell ? ` · ${s.cell}` : ""}
              </p>
            </div>
          </div>
        ))}
        <div className="flex gap-2">
          <Mail className="mt-0.5 size-4 shrink-0 text-pink-ink" aria-hidden />
          <div>
            <p className="font-semibold">Email</p>
            <p className="text-muted-foreground">{CENTRE.email}</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
