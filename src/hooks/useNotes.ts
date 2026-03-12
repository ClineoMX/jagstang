import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { MedicalNote, NoteCompletenessAnalysis } from '../types';

export const useNotes = (patientId: string | undefined) => {
  const [notes, setNotes] = useState<MedicalNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const transformNotes = (results: any[], pid: string): MedicalNote[] =>
    results.map((n) => ({
      id: n.id,
      patientId: pid,
      doctorId: '',
      title: n.title || `${n.note_type || n.type || 'Nota'} - ${n.created_at?.slice(0, 10) || ''}`,
      type: (n.note_type || n.type) as any,
      content: n.content || '',
      status: (n.status === 'signed' || n.is_signed) ? 'signed' : 'draft',
      isSigned: n.status === 'signed' || n.is_signed,
      signedAt: n.signed_at,
      signedBy: n.signed_by,
      createdAt: n.created_at,
      updatedAt: n.updated_at,
    }));

  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchNotes = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.listNotes(patientId);
        if (controller.signal.aborted) return;
        const transformed = transformNotes(response.results, patientId);
        transformed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setNotes(transformed);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'Error al cargar notas');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchNotes();
    return () => controller.abort();
  }, [patientId]);

  const reloadNotes = async () => {
    if (!patientId) return;
    const response = await apiService.listNotes(patientId);
    const transformed = transformNotes(response.results, patientId);
    transformed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setNotes(transformed);
  };

  const createNote = async (data: {
    content: string;
    type: string;
    title?: string;
    files?: File[];
  }) => {
    if (!patientId) throw new Error('Patient ID is required');

    const newNote = await apiService.createNote(patientId, {
      content: data.content,
      note_type: data.type,
      title: data.title,
      files: data.files,
    });
    await reloadNotes();
    return {
      id: newNote.id,
      status: 'draft' as const,
      isSigned: false,
      created_at: newNote.created_at,
      note_type: newNote.note_type,
      title: newNote.title,
    };
  };

  const signNote = async (noteId: string, save_anyway = false) => {
    if (!patientId) throw new Error('Patient ID is required');
    await apiService.signNote(patientId, noteId, save_anyway);
    await reloadNotes();
  };

  const updateNote = async (
    noteId: string,
    data: {
      title?: string;
      content?: string;
      type?: string;
    }
  ) => {
    if (!patientId) throw new Error('Patient ID is required');
    await apiService.updateNote(patientId, noteId, data);
    await reloadNotes();
  };

  const getNoteAnalysis = async (noteId: string): Promise<NoteCompletenessAnalysis> => {
    if (!patientId) throw new Error('Patient ID is required');
    return await apiService.getNoteAnalysis(patientId, noteId);
  };

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    signNote,
    getNoteAnalysis,
  };
};
