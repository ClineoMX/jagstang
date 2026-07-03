import { useEffect, useState } from 'react';
import type { NoteTemplate } from '../types';
import { mockNoteTemplates, mockWellnessNoteTemplates } from './mockData';

/**
 * Pequeño store en memoria para las plantillas del doctor mientras no exista
 * persistencia en backend. Permite que la lista (`/library/templates`) y el
 * editor (`/library/templates/:id`) compartan estado al ser rutas distintas.
 *
 * Selecciona el set inicial según el rol (WELLNESS vs el resto), igual que la
 * lógica anterior en `DoctorProfile`.
 */

type Role = string | undefined;

let currentRole: Role = undefined;
let store: NoteTemplate[] = [];
const subscribers = new Set<(items: NoteTemplate[]) => void>();

function isWellnessRole(role: Role): boolean {
  return (role ?? '').toUpperCase() === 'WELLNESS';
}

function ensureRoleInitialized(role: Role) {
  if (currentRole === role && store.length > 0) return;
  currentRole = role;
  store = isWellnessRole(role)
    ? [...mockWellnessNoteTemplates]
    : [...mockNoteTemplates];
}

function emit() {
  for (const sub of subscribers) sub(store);
}

export function useTemplates(role: Role): NoteTemplate[] {
  ensureRoleInitialized(role);
  const [items, setItems] = useState<NoteTemplate[]>(store);
  useEffect(() => {
    ensureRoleInitialized(role);
    setItems(store);
    const sub = (next: NoteTemplate[]) => setItems([...next]);
    subscribers.add(sub);
    return () => {
      subscribers.delete(sub);
    };
  }, [role]);
  return items;
}

export function getTemplate(id: string): NoteTemplate | undefined {
  return store.find((t) => t.id === id);
}

export function addTemplate(template: NoteTemplate) {
  store = [...store, template];
  emit();
}

export function updateTemplate(template: NoteTemplate) {
  store = store.map((t) => (t.id === template.id ? template : t));
  emit();
}

export function deleteTemplate(id: string) {
  store = store.filter((t) => t.id !== id);
  emit();
}
