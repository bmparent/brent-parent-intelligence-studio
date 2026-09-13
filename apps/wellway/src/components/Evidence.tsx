import type { EvidenceRecord } from "../lib/types";
export function SupportingRecords({
  ids,
  records,
}: {
  ids: string[];
  records: EvidenceRecord[];
}) {
  const selected = ids
    .map((id) => records.find((r) => r.id === id))
    .filter((r): r is EvidenceRecord => !!r);
  if (!selected.length) return null;
  return (
    <details className="supporting-records">
      <summary>Inspect supporting records ({selected.length})</summary>
      <ul className="source-list">
        {selected.map((r) => (
          <li key={r.id}>
            <strong>
              {r.date || "Current context"} · {r.sourceId}
            </strong>
            <p>{r.text}</p>
            <small>{r.id}</small>
            {r.recordedAt && (
              <small>
                Scenario reading: {r.recordedAt} · Stored/imported:{" "}
                {r.importedAt}
              </small>
            )}
            {!!r.sourceIds?.length && (
              <details>
                <summary>Read the {r.sourceIds.length} dated inputs</summary>
                <ul>
                  {r.sourceIds.map((id) => {
                    const item = records.find((x) => x.id === id);
                    return item ? (
                      <li key={id}>
                        <strong>{item.date}</strong> · {item.text}
                        <small>
                          {item.id} · {item.sourceId}
                        </small>
                        {item.recordedAt && (
                          <small>
                            Scenario reading: {item.recordedAt} ·
                            Stored/imported: {item.importedAt}
                          </small>
                        )}
                      </li>
                    ) : null;
                  })}
                </ul>
              </details>
            )}
          </li>
        ))}
      </ul>
    </details>
  );
}
