import { ArrowUp } from "lucide-react";

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
      className="mt-3"
      onSubmit={(e) => {
        e.preventDefault();
        onEnvoyer();
      }}
    >
      <div className="flex items-center gap-2 rounded-[24px] border border-solid border-[#E5E7EB] bg-[#F8F9FF] px-4 py-[10px]">
        <textarea
          rows={1}
          style={{ resize: "none" }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="min-h-0 flex-1 border-0 bg-transparent py-0.5 text-[14px] text-foreground outline-none placeholder:text-[#9CA3AF] focus:ring-0"
        />
        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          className="inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-[#5B50F0] text-white transition-colors hover:bg-[#4B41D5] disabled:opacity-60"
          aria-label="Envoyer"
        >
          <ArrowUp className="h-4 w-4 stroke-[2.5]" aria-hidden />
        </button>
      </div>
    </form>
  );
}
