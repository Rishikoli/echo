import Link from "next/link";
import { Brain } from "lucide-react";

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-32 h-[36rem] w-[36rem] rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--color-brand-200), transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-24 h-[30rem] w-[30rem] rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--color-sage-100), transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -left-16 h-64 w-64 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--color-blush-200), transparent 70%)" }}
      />

      <div className="relative min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-xl text-center">
          <div className="inline-flex items-center gap-2.5 mb-10">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-md shadow-brand-900/20">
              <Brain size={16} strokeWidth={2} />
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-foreground">ECHO</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-5 leading-[1.1]">
            A living Digital Twin
            <br />
            for dementia care.
          </h1>

          <p className="text-lg text-foreground/70 mb-3">Understand. Trace. Remember. Explore.</p>
          <p className="text-sm text-foreground/50 max-w-md mx-auto mb-12 leading-relaxed">
            ECHO compares new observations against a person&rsquo;s own history — never a generic
            population average — and explains what changed, when it changed, and how confident it is.
          </p>

          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-6 py-3 shadow-lg shadow-brand-900/15 transition-colors"
          >
            Enter Patient Twin
          </Link>

          <p className="text-[11px] text-foreground/35 mt-14">
            Demo patient and data are entirely synthetic. ECHO is not an autonomous diagnostic system.
          </p>
        </div>
      </div>
    </div>
  );
}
