import { useState, useRef } from "react";
import { Mic, ArrowUp, Volume2 } from "lucide-react";
import { toast } from "sonner";

const MENTOR_GREETING = "hiii , How can help you genus !!";

function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    toast.error("Speech synthesis isn't supported in this browser.");
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1.05;
  utterance.lang = "en-US";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export function MentorInput() {
  const [value, setValue] = useState("");
  const [listening, setListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const startVoice = () => {
    const SR =
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
        .SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;

    if (!SR) {
      toast.error("Voice input isn't supported in this browser.");
      return;
    }

    const recognition = new (SR as new () => {
      lang: string;
      start: () => void;
      onresult: (e: { results: Array<Array<{ transcript: string }>> }) => void;
      onerror: () => void;
      onend: () => void;
    })();
    recognition.lang = "en-US";
    recognition.onresult = (e) => setValue(e.results?.[0]?.[0]?.transcript ?? "");
    recognition.onerror = () => toast.error("Couldn't hear that.");
    recognition.onend = () => setListening(false);
    setListening(true);
    recognition.start();
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!value.trim()) return;
        toast("Your mentor will answer once AI is connected.");
        setValue("");
      }}
      className="gradient-hot rounded-3xl p-1"
    >
      <div className="flex flex-col items-center gap-4 rounded-[22px] bg-card/95 px-5 py-6 text-center backdrop-blur-sm">
        <p className="text-sm font-medium text-card-foreground">Ask your AI mentor anything</p>

        <button
          type="button"
          onClick={startVoice}
          aria-label="Voice input"
          className={`grid size-20 place-items-center rounded-full bg-secondary transition-all hover:scale-105 active:scale-95 ${
            listening ? "text-primary ring-2 ring-primary ring-offset-2 ring-offset-card" : "text-muted-foreground"
          }`}
        >
          <Mic className="size-9" />
        </button>

        <div className="flex w-full max-w-xs items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-2">
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ask your mentor..."
            className="h-9 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            aria-label="Send"
            className="grid size-8 place-items-center rounded-full bg-secondary text-foreground transition-colors hover:bg-accent"
          >
            <ArrowUp className="size-4" />
          </button>
        </div>
      </div>
    </form>
  );
}
