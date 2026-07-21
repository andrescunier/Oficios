import React, { useState } from 'react';
import { CheckSquare, Square } from 'lucide-react';
import {
  getCapacitacionBlocks,
  toSafeEmbedUrl,
  type CapacitacionBlock,
} from '@/utils/capacitacionEmbeds';

interface CapacitacionContentProps {
  metadata?: Record<string, unknown> | null;
  description?: string | null;
}

const EmbedFrame: React.FC<{ block: Extract<CapacitacionBlock, { type: 'video' | 'iframe' }> }> = ({
  block,
}) => {
  const provider = block.type === 'video' ? block.provider : undefined;
  const safe = toSafeEmbedUrl(block.url, provider);
  if (!safe) {
    return (
      <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
        Este enlace no está permitido. Solo se pueden embeber fuentes validadas por OficiosHub.
      </p>
    );
  }
  const minHeight = block.type === 'iframe' && block.minHeight ? block.minHeight : 360;
  return (
    <div className="overflow-hidden rounded-lg border bg-black/5">
      {block.title ? (
        <p className="border-b bg-muted/40 px-3 py-2 text-sm font-medium">{block.title}</p>
      ) : null}
      <div className="relative w-full" style={{ minHeight }}>
        <iframe
          title={block.title || 'Contenido de capacitación'}
          src={safe.src}
          className="absolute inset-0 h-full w-full"
          style={{ minHeight }}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
          allowFullScreen
        />
      </div>
    </div>
  );
};

const ChecklistBlock: React.FC<{ block: Extract<CapacitacionBlock, { type: 'checklist' }> }> = ({
  block,
}) => {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  return (
    <div className="rounded-lg border p-3">
      {block.title ? <p className="mb-2 text-sm font-semibold">{block.title}</p> : null}
      <ul className="space-y-2">
        {block.items.map((item, index) => {
          const on = Boolean(checked[index]);
          return (
            <li key={`${item}-${index}`}>
              <button
                type="button"
                className="flex w-full items-start gap-2 rounded-md px-1 py-1 text-left text-sm hover:bg-muted/50"
                onClick={() => setChecked((prev) => ({ ...prev, [index]: !on }))}
              >
                {on ? <CheckSquare className="mt-0.5 h-4 w-4 text-primary" /> : <Square className="mt-0.5 h-4 w-4 text-muted-foreground" />}
                <span className={on ? 'line-through text-muted-foreground' : ''}>{item}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export const CapacitacionContent: React.FC<CapacitacionContentProps> = ({
  metadata,
  description,
}) => {
  const blocks = getCapacitacionBlocks(metadata);
  if (blocks.length === 0) {
    if (!description) return null;
    return <p className="whitespace-pre-wrap text-sm text-gray-700">{description}</p>;
  }

  return (
    <div className="space-y-4">
      {description ? (
        <p className="whitespace-pre-wrap text-sm text-gray-700">{description}</p>
      ) : null}
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;
        if (block.type === 'text') {
          return (
            <div key={key} className="space-y-1">
              {block.title ? <p className="text-sm font-semibold">{block.title}</p> : null}
              <p className="whitespace-pre-wrap text-sm text-gray-700">{block.body}</p>
            </div>
          );
        }
        if (block.type === 'checklist') {
          return <ChecklistBlock key={key} block={block} />;
        }
        return <EmbedFrame key={key} block={block} />;
      })}
    </div>
  );
};

export default CapacitacionContent;
