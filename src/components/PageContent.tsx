import React from 'react';

interface PageContentProps {
  content: string | null | undefined;
  loading?: boolean;
}

// Renders admin-authored plain text (from a Textarea, no HTML) as paragraphs,
// splitting on blank lines and preserving single line breaks within each.
const PageContent: React.FC<PageContentProps> = ({ content, loading }) => {
  if (loading) {
    return <p className="text-muted-foreground">Loading…</p>;
  }
  if (!content) {
    return null;
  }

  const paragraphs = content.split(/\n\s*\n/);

  return (
    <div className="space-y-4 text-muted-foreground leading-relaxed">
      {paragraphs.map((paragraph, i) => (
        <p key={i}>
          {paragraph.split('\n').map((line, j, arr) => (
            <React.Fragment key={j}>
              {line}
              {j < arr.length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>
      ))}
    </div>
  );
};

export default PageContent;
