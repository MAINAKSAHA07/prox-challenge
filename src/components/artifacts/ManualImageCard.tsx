"use client";

import Image from "next/image";

export function ManualImageCard({
  title,
  imagePath,
  page,
  caption,
}: {
  title: string;
  imagePath: string;
  page?: number;
  caption?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between gap-2">
        <h4 className="text-sm font-semibold">{title}</h4>
        {page != null && (
          <span className="text-xs text-zinc-500 whitespace-nowrap">p.{page}</span>
        )}
      </div>
      <div className="relative rounded-lg overflow-hidden border border-zinc-800 bg-black">
        <Image
          src={imagePath}
          alt={title}
          width={800}
          height={600}
          className="w-full h-auto object-contain max-h-[420px]"
          unoptimized={imagePath.endsWith(".webp")}
        />
      </div>
      {caption && <p className="text-xs text-zinc-500">{caption}</p>}
    </div>
  );
}
