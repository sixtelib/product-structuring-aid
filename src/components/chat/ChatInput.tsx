import { Send } from "lucide-react";

export type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onEnvoyer: () => void;
  isLoading: boolean;
  placeholder?: string;
};

export function ChatInput({
  value,
  onChange,
  onEnvoyer,
  isLoading,
  placeholder = "Décrivez votre situation…",
}: ChatInputProps) {
  return (
    <form
      className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3"
      onSubmit={(e) => {
        e.preventDefault();
        onEnvoyer();
      }}
    >
      <textarea
        rows={1}
        style={{ resize: "none" }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="flex-1 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm outline-none placeholder:text-muted-foreground shadow-sm focus:border-[#5B50F0]/40 focus:ring-2 focus:ring-[#5B50F0]/10"
      />
      <button
        type="submit"
        disabled={isLoading || !value.trim()}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#5B50F0] text-white transition-colors hover:bg-[#4B41D5] disabled:opacity-60"
        aria-label="Envoyer"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
}
