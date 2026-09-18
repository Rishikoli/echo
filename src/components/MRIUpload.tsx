"use client";

import { useState } from "react";
import { Scan, UploadCloud } from "lucide-react";
import Card from "./Card";

interface ImageMeta {
  url: string;
  name: string;
  sizeKb: number;
  width: number;
  height: number;
}

export default function MRIUpload() {
  const [meta, setMeta] = useState<ImageMeta | null>(null);

  function handleFile(file: File) {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setMeta({ url, name: file.name, sizeKb: Math.round(file.size / 102.4) / 10, width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = url;
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-400">
          <Scan size={17} />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-foreground">MRI scan</h2>
          <p className="text-xs text-foreground/45">Upload a scan image to attach it to the Twin</p>
        </div>
      </div>

      <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border-soft py-8 cursor-pointer hover:border-brand-300 transition-colors">
        <UploadCloud size={22} className="text-foreground/35" />
        <span className="text-sm text-foreground/60">{meta?.name ?? "Click to choose a scan image"}</span>
        <span className="text-[11px] text-foreground/35">JPEG or PNG — preview only</span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </label>

      <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 px-3.5 py-2.5 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
        Real MRI segmentation (hippocampal volume, ventricle size, etc.) is not implemented in this demo — ECHO
        never invents patient facts. This upload shows the intended interaction and file handling only; it
        does not analyze the scan. The mock MRI feature snapshots elsewhere in the app are pre-computed demo
        data, unrelated to whatever you upload here.
      </div>

      {meta && (
        <div className="space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={meta.url} alt="Uploaded scan preview" className="w-full rounded-xl border border-border-soft max-h-64 object-contain bg-surface-muted" />
          <div className="grid grid-cols-3 gap-3">
            <Stat label="File" value={meta.name} />
            <Stat label="Size" value={`${meta.sizeKb} KB`} />
            <Stat label="Dimensions" value={`${meta.width}×${meta.height}`} />
          </div>
        </div>
      )}
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-muted px-3 py-2.5 min-w-0">
      <div className="text-[11px] text-foreground/45">{label}</div>
      <div className="text-sm font-semibold text-foreground truncate" title={value}>
        {value}
      </div>
    </div>
  );
}
