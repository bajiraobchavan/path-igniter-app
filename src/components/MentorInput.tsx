import { useState } from "react";
import { Mic, ArrowUp } from "lucide-react";
import { toast } from "sonner";

export function MentorInput() {
  const [value, setValue] = useState("");
  const [listening, setListening] = useState(false);

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
      className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2"
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Ask your mentor..."
        className="h-9 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
      <button
        type="button"
        onClick={startVoice}
        aria-label="Voice input"
        className={`grid size-8 place-items-center rounded-full transition-colors hover:bg-secondary ${
          listening ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <Mic className="size-4" />
      </button>
      <button
        type="submit"
        aria-label="Send"
        className="grid size-8 place-items-center rounded-full bg-secondary text-foreground transition-colors hover:bg-accent"
      >
        <ArrowUp className="size-4" />
      </button>
    </form>
  );
}
