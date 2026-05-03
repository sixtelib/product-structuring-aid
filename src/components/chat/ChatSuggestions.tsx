export type ChatSuggestionsProps = {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  /** Libellé affiché sur la pill (par défaut = suggestion). */
  getDisplayText?: (suggestion: string) => string;
  /** Pills principales (bordure violette) vs secondaires (gris). */
  variant?: "primary" | "secondary";
};

export function ChatSuggestions({ suggestions, onSelect, getDisplayText, variant = "secondary" }: ChatSuggestionsProps) {
  const label = getDisplayText ?? ((s: string) => s);
  if (suggestions.length === 0) return null;

  const pillClass =
    variant === "primary"
      ? "rounded-[20px] border-[1.5px] border-solid border-[#5B50F0] bg-transparent px-[13px] py-[5px] text-[12px] font-medium text-[#5B50F0] transition-colors hover:bg-[#5B50F0]/5"
      : "rounded-[20px] border border-solid border-[#E5E7EB] bg-transparent px-[13px] py-[5px] text-[12px] font-medium text-[#6B7280] transition-colors hover:bg-[#F9FAFB]";

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {suggestions.map((s) => (
        <button key={s} type="button" onClick={() => onSelect(s)} className={pillClass}>
          {label(s)}
        </button>
      ))}
    </div>
  );
}
