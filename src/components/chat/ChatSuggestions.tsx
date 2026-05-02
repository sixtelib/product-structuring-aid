export type ChatSuggestionsProps = {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  /** Libellé affiché sur la pill (par défaut = suggestion). */
  getDisplayText?: (suggestion: string) => string;
};

export function ChatSuggestions({ suggestions, onSelect, getDisplayText }: ChatSuggestionsProps) {
  const label = getDisplayText ?? ((s: string) => s);
  if (suggestions.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-2 px-1 pb-2">
      {suggestions.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onSelect(s)}
          className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
        >
          {label(s)}
        </button>
      ))}
    </div>
  );
}
