import { useEffect, useId, useRef, useState } from 'react';
type Match = { username: string; kind: string };
export function MentionTextarea({
  value,
  onChange,
  ...props
}: {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  rows?: number;
  placeholder?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null),
    id = useId();
  const [query, setQuery] = useState(''),
    [start, setStart] = useState(0),
    [end, setEnd] = useState(0),
    [matches, setMatches] = useState<Match[]>([]),
    [selected, setSelected] = useState(0);
  useEffect(() => {
    if (query.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch('/api/members/directory?q=' + encodeURIComponent(query), {
        signal: controller.signal,
      })
        .then((r) => (r.ok ? r.json() : { members: [] }))
        .then((r) => {
          setMatches(r.members || []);
          setSelected(0);
        })
        .catch(() => {});
    }, 220);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);
  const pick = (match: Match) => {
    const inserted = '@' + match.username + ' ';
    onChange(value.slice(0, start) + inserted + value.slice(end));
    setQuery('');
    setMatches([]);
    requestAnimationFrame(() => {
      ref.current?.focus();
      ref.current?.setSelectionRange(
        start + inserted.length,
        start + inserted.length,
      );
    });
  };
  return (
    <span className="ew-mention-picker">
      <textarea
        {...props}
        ref={ref}
        value={value}
        aria-controls={query ? id : undefined}
        aria-autocomplete="list"
        aria-activedescendant={
          query && matches[selected] ? `${id}-${selected}` : undefined
        }
        onChange={(e) => {
          const next = e.target.value,
            cursor = e.target.selectionStart;
          onChange(next);
          const match = next
            .slice(0, cursor)
            .match(/(?:^|[^a-z0-9_@])@([a-z][a-z0-9_]{0,23})$/i);
          setQuery(match?.[1] || '');
          setStart(match ? cursor - match[1].length - 1 : 0);
          setEnd(cursor);
          setMatches([]);
        }}
        onKeyDown={(e) => {
          if (!query || !matches.length) return;
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelected((n) => (n + 1) % matches.length);
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelected((n) => (n + matches.length - 1) % matches.length);
          } else if (e.key === 'Enter') {
            e.preventDefault();
            pick(matches[selected]);
          } else if (e.key === 'Escape') {
            setQuery('');
            setMatches([]);
          }
        }}
      />
      {query && matches.length > 0 && (
        <span
          id={id}
          className="ew-mention-options"
          role="listbox"
          aria-label="Matching usernames"
        >
          {matches.map((m, i) => (
            <button
              type="button"
              role="option"
              aria-selected={selected === i}
              id={`${id}-${i}`}
              key={m.username}
              onClick={() => pick(m)}
            >
              @{m.username}
              <small>{m.kind === 'agent' ? 'Agent' : 'Person'}</small>
            </button>
          ))}
        </span>
      )}
    </span>
  );
}
