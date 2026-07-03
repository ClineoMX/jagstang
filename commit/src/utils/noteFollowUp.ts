import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { NoteFollowUpRef, NoteType } from '../types';

export function getNoteTypeLabel(type: string): string {
  switch (type as NoteType) {
    case 'interrogation':
      return 'Interrogatorio';
    case 'evolution':
      return 'Nota de evolución';
    case 'exploration':
      return 'Exploración física';
    case 'psychology-interrogation':
      return 'Psicología · Historia clínica inicial';
    case 'psychology-evolution':
      return 'Psicología · Nota de sesión';
    case 'document':
      return 'Documento';
    case 'custom':
      return 'Nota personalizada';
    default:
      return 'Nota';
  }
}

function formatFollowUpDate(iso: string): string {
  try {
    const d = parseISO(iso);
    if (isNaN(d.getTime())) return iso.slice(0, 10);
    return format(d, "d 'de' MMM yyyy", { locale: es });
  } catch {
    return iso.slice(0, 10);
  }
}

/** Normalizes list/detail `is_follow_up_of` (object or legacy id string). */
export function parseFollowUpFromApi(
  raw: unknown
): NoteFollowUpRef | undefined {
  if (!raw) return undefined;
  if (typeof raw === 'string') {
    return { id: raw, noteType: '', title: '', customDate: '' };
  }
  if (typeof raw === 'object' && raw !== null && 'id' in raw) {
    const o = raw as Record<string, unknown>;
    return {
      id: String(o.id),
      noteType: String(o.note_type ?? o.noteType ?? ''),
      title: String(o.title ?? ''),
      customDate: String(o.custom_date ?? o.customDate ?? ''),
    };
  }
  return undefined;
}

export function getFollowUpParentId(ref: NoteFollowUpRef): string {
  return ref.id;
}

/** e.g. "Nota de evolución: 4 de jun 2026 2/3" */
export function formatFollowUpChainLabel(
  ref: NoteFollowUpRef,
  chainIndex: number,
  chainTotal: number
): string {
  const typeLabel = getNoteTypeLabel(ref.noteType);
  const dateLabel = ref.customDate
    ? formatFollowUpDate(ref.customDate)
    : '—';
  return `${typeLabel}: ${dateLabel} ${chainIndex}/${chainTotal}`;
}

/** Root note in a chain (no parent reference on this note). */
export function formatFollowUpChainRootLabel(
  chainIndex: number,
  chainTotal: number
): string {
  return `Seguimiento · ${chainIndex}/${chainTotal}`;
}
