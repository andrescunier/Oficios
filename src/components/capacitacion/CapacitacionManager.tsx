import React, { useEffect, useState } from 'react';
import { Loader2, Plus, Trash2, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  capacitacionService,
  type CapacitacionProvider,
} from '@/services/capacitacionService';
import type { CapacitacionBlock } from '@/utils/capacitacionEmbeds';
import type { ProviderTask } from '@/services/taskService';
import { CapacitacionContent } from '@/components/capacitacion/CapacitacionContent';

type BlockDraft = CapacitacionBlock & { key: string };

const newKey = () => `b-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const emptyText = (): BlockDraft => ({ key: newKey(), type: 'text', title: '', body: '' });
const emptyVideo = (): BlockDraft => ({
  key: newKey(),
  type: 'video',
  title: '',
  url: '',
  provider: 'youtube',
});
const emptyIframe = (): BlockDraft => ({
  key: newKey(),
  type: 'iframe',
  title: '',
  url: '',
  minHeight: 480,
});
const emptyChecklist = (): BlockDraft => ({
  key: newKey(),
  type: 'checklist',
  title: '',
  items: [''],
});

interface CapacitacionManagerProps {
  onCreated?: (created: ProviderTask[]) => void;
}

export const CapacitacionManager: React.FC<CapacitacionManagerProps> = ({ onCreated }) => {
  const [providers, setProviders] = useState<CapacitacionProvider[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [assignAll, setAssignAll] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [blocks, setBlocks] = useState<BlockDraft[]>([emptyText(), emptyVideo()]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingProviders(true);
      try {
        const rows = await capacitacionService.listProviders();
        if (!cancelled) setProviders(rows);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'No se pudieron cargar proveedores');
        }
      } finally {
        if (!cancelled) setLoadingProviders(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleProvider = (userId: string) => {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  const updateBlock = (key: string, patch: Partial<CapacitacionBlock>) => {
    setBlocks((prev) =>
      prev.map((block) => (block.key === key ? ({ ...block, ...patch, key } as BlockDraft) : block)),
    );
  };

  const removeBlock = (key: string) => {
    setBlocks((prev) => prev.filter((block) => block.key !== key));
  };

  const toPayloadBlocks = (): CapacitacionBlock[] => {
    return blocks
      .map((block) => {
        const { key: _key, ...rest } = block;
        if (rest.type === 'checklist') {
          return {
            ...rest,
            items: (rest.items || []).map((item) => item.trim()).filter(Boolean),
          };
        }
        if (rest.type === 'text') {
          return { ...rest, body: (rest.body || '').trim() };
        }
        if (rest.type === 'video' || rest.type === 'iframe') {
          return { ...rest, url: (rest.url || '').trim() };
        }
        return rest;
      })
      .filter((block) => {
        if (block.type === 'text') return Boolean(block.body);
        if (block.type === 'video' || block.type === 'iframe') return Boolean(block.url);
        if (block.type === 'checklist') return (block.items || []).length > 0;
        return false;
      });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title.trim()) {
      setError('El título es obligatorio');
      return;
    }
    if (!assignAll && selectedIds.length === 0) {
      setError('Elegí al menos un proveedor o marcá “asignar a todos”');
      return;
    }

    setSaving(true);
    try {
      const created = await capacitacionService.create({
        title: title.trim(),
        description: description.trim() || undefined,
        due_at: dueAt ? new Date(dueAt).toISOString() : undefined,
        content_blocks: toPayloadBlocks(),
        assigned_to_user_ids: assignAll ? [] : selectedIds,
        assign_to_all_suppliers: assignAll,
      });
      setSuccess(`Se crearon ${created.length} capacitación(es).`);
      setTitle('');
      setDescription('');
      setDueAt('');
      setAssignAll(false);
      setSelectedIds([]);
      setBlocks([emptyText(), emptyVideo()]);
      setShowForm(false);
      onCreated?.(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la capacitación');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Gestionar capacitaciones
          </h2>
          <p className="text-sm text-muted-foreground">
            Cargá título, video/iframe, texto y checklist, y asignalas a proveedores.
          </p>
        </div>
        {!showForm && (
          <Button type="button" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva capacitación
          </Button>
        )}
      </div>

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nueva capacitación</CardTitle>
            <CardDescription>
              YouTube, Vimeo o formularios de Google. Se crea una tarea por proveedor asignado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="cap-title">Título</Label>
                  <Input
                    id="cap-title"
                    value={title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                    placeholder="Ej: Seguridad y trato al cliente"
                    required
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="cap-desc">Descripción corta</Label>
                  <Textarea
                    id="cap-desc"
                    value={description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Qué van a aprender"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cap-due">Vence</Label>
                  <Input
                    id="cap-due"
                    type="date"
                    value={dueAt}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDueAt(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setBlocks((b) => [...b, emptyText()])}>
                    + Texto
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setBlocks((b) => [...b, emptyVideo()])}>
                    + Video
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setBlocks((b) => [...b, emptyIframe()])}>
                    + Iframe / form
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setBlocks((b) => [...b, emptyChecklist()])}>
                    + Checklist
                  </Button>
                </div>

                {blocks.map((block) => (
                  <div key={block.key} className="rounded-md border p-3 space-y-2 bg-muted/20">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium capitalize">{block.type}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBlock(block.key)}
                        aria-label="Quitar bloque"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Título del bloque (opcional)"
                      value={block.title || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateBlock(block.key, { title: e.target.value })}
                    />
                    {block.type === 'text' && (
                      <Textarea
                        rows={3}
                        placeholder="Contenido"
                        value={block.body || ''}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateBlock(block.key, { body: e.target.value })}
                      />
                    )}
                    {(block.type === 'video' || block.type === 'iframe') && (
                      <Input
                        placeholder={
                          block.type === 'video'
                            ? 'URL YouTube o Vimeo'
                            : 'URL Google Forms / Drive embed'
                        }
                        value={block.url || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateBlock(block.key, { url: e.target.value })}
                      />
                    )}
                    {block.type === 'checklist' && (
                      <Textarea
                        rows={4}
                        placeholder="Un ítem por línea"
                        value={(block.items || []).join('\n')}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          updateBlock(block.key, {
                            items: e.target.value.split('\n'),
                          })
                        }
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label>Asignar a proveedores</Label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={assignAll}
                    onChange={(e) => setAssignAll(e.target.checked)}
                  />
                  Asignar a todos los proveedores activos
                </label>
                {!assignAll && (
                  <div className="max-h-48 overflow-y-auto rounded-md border p-2 space-y-1">
                    {loadingProviders ? (
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Cargando proveedores…
                      </p>
                    ) : providers.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No hay proveedores registrados.</p>
                    ) : (
                      providers.map((provider) => (
                        <label
                          key={provider.user_id}
                          className="flex items-start gap-2 text-sm py-1 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            className="mt-1"
                            checked={selectedIds.includes(provider.user_id)}
                            onChange={() => toggleProvider(provider.user_id)}
                          />
                          <span>
                            <span className="font-medium">{provider.name}</span>
                            <span className="text-muted-foreground"> · {provider.email}</span>
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                )}
              </div>

              {toPayloadBlocks().length > 0 && (
                <div className="rounded-md border p-3">
                  <p className="text-sm font-medium mb-2">Vista previa</p>
                  <CapacitacionContent
                    metadata={{ content_blocks: toPayloadBlocks() }}
                    description={null}
                  />
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Publicar capacitación'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving}
                  onClick={() => {
                    setShowForm(false);
                    setError(null);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
