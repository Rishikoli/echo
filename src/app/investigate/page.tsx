import InvestigationPanel from "@/components/InvestigationPanel";

export default function InvestigatePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">Investigate</h1>
        <p className="text-sm text-foreground/55 mt-2 leading-relaxed">
          Gemini orchestrates the Twin&rsquo;s tools to answer questions grounded in this patient&rsquo;s own
          data — never a generic chatbot response.
        </p>
      </header>
      <InvestigationPanel />
    </div>
  );
}
