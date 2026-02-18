import { X } from "lucide-react";
import { Input } from "@/shared/ui/input";

type Props = {
  defaultValue?: string;
  onDebouncedChange: (next: string) => void;

  placeholder?: string;
  className?: string;
  inputClassName?: string;
  clearAriaLabel?: string;

  debounceMs?: number;
};

export function ProductsSearchInput({
  defaultValue = "",
  onDebouncedChange,
  placeholder = "Search...",
  className,
  inputClassName,
  clearAriaLabel = "Clear search",
  debounceMs = 350,
}: Props) {
  // store timer id on window to avoid refs/state/effects
  const timerKey = "__products_search_input_timer__";

  function schedule(next: string) {
    // @ts-expect-error attach to window
    const prev = window[timerKey] as number | undefined;
    if (prev) window.clearTimeout(prev);

    // @ts-expect-error attach to window
    window[timerKey] = window.setTimeout(() => onDebouncedChange(next), debounceMs);
  }

  return (
    <div className={["relative", className].filter(Boolean).join(" ")}>
      <Input
        placeholder={placeholder}
        defaultValue={defaultValue}
        onChange={(e) => schedule(e.target.value)}
        className={["h-10 pr-9", inputClassName].filter(Boolean).join(" ")}
      />

      {!!defaultValue && (
        <button
          type="button"
          onClick={() => {
            onDebouncedChange("");
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label={clearAriaLabel}
          title="Clear"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
