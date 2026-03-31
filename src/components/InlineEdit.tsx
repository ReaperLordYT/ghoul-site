import { useState } from 'react';
import { useStore } from '@/store/useStore';

interface InlineEditProps {
  textKey: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
}

export const InlineEdit = ({ textKey, as: Tag = 'p', className = '' }: InlineEditProps) => {
  const { editMode, texts, updateText } = useStore();
  const [editing, setEditing] = useState(false);
  const value = texts[textKey] || textKey;

  if (editMode && editing) {
    return (
      <input
        className={`bg-primary/20 border border-primary px-2 py-1 text-foreground outline-none font-body ${className}`}
        value={value}
        onChange={(e) => updateText(textKey, e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => e.key === 'Enter' && setEditing(false)}
        autoFocus
      />
    );
  }

  return (
    <Tag
      className={`${className} ${editMode ? 'outline outline-1 outline-primary/40 outline-dashed cursor-pointer hover:outline-primary' : ''}`}
      onClick={() => editMode && setEditing(true)}
    >
      {value}
    </Tag>
  );
};
