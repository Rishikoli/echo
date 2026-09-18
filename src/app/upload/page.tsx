import SpeechUpload from "@/components/SpeechUpload";
import MRIUpload from "@/components/MRIUpload";

export default function UploadPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">Upload</h1>
        <p className="text-sm text-foreground/55 mt-2 max-w-2xl leading-relaxed">
          Try the intended data-ingestion interactions directly. Speech is analyzed for real, in your
          browser; the MRI upload shows the interaction without pretending to run a clinical pipeline that
          isn&rsquo;t built.
        </p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SpeechUpload />
        <MRIUpload />
      </div>
    </div>
  );
}
