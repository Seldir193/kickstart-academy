export default function SectionHead(props: {
  title: string;
  meta: string;
  pending?: boolean;
}) {
  const { title, meta, pending } = props;
  const root = pending
    ? "news-admin__pending-head"
    : "news-admin__section-head";
  const titleClass = pending
    ? "news-admin__pending-title"
    : "news-admin__section-title";
  const metaClass = pending
    ? "news-admin__pending-meta"
    : "news-admin__section-meta";
  return (
    <div className={root}>
      <div className={titleClass}>{title}</div>
      <div className={metaClass}>{meta}</div>
    </div>
  );
}
