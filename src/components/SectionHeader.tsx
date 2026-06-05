type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  summary: string;
  align?: 'left' | 'center';
  id?: string;
};

export function SectionHeader({ eyebrow, title, summary, align = 'left', id }: SectionHeaderProps) {
  return (
    <div className={`section-header section-header--${align}`} data-reveal>
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id}>{title}</h2>
      <p>{summary}</p>
    </div>
  );
}
