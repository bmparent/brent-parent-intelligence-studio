type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  summary: string;
  align?: 'left' | 'center';
  id?: string;
  titleAs?: 'h1' | 'h2';
};

export function SectionHeader({ eyebrow, title, summary, align = 'left', id, titleAs = 'h2' }: SectionHeaderProps) {
  const TitleTag = titleAs;

  return (
    <div className={`section-header section-header--${align}`} data-reveal>
      <p className="eyebrow">{eyebrow}</p>
      <TitleTag id={id}>{title}</TitleTag>
      <p>{summary}</p>
    </div>
  );
}
