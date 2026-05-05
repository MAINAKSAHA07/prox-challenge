import { ChatExperience } from "@/components/ChatExperience";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#141414]">
      <header className="shrink-0 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur px-4 py-3 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-sm font-semibold tracking-tight text-zinc-100 truncate">
            WeldPilot
          </h1>
          <p className="text-[11px] text-zinc-500 truncate">
            Vulcan OmniPro 220 · multimodal support
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] rounded-full border border-orange-900/60 bg-orange-950/40 px-2.5 py-1 text-orange-400">
            Manual-grounded
          </span>
        </div>
      </header>
      <ChatExperience />
    </div>
  );
}
