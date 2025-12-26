import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { MedicalNote, NoteCompletenessAnalysis } from '../types';
import { getNotesByPatientId } from '../data/mockData';
import { USE_API } from '../config/api';

interface UseNotesOptions {
  useApi?: boolean;
}

/**
 * Hook para gestionar notas médicas de un paciente
 * Usa la configuración USE_API por defecto, pero puede ser sobrescrito
 */
export const useNotes = (patientId: string | undefined, options: UseNotesOptions = {}) => {
  const useApi = options.useApi ?? USE_API;
  const [notes, setNotes] = useState<MedicalNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      return;
    }

    const fetchNotes = async () => {
      setLoading(true);
      setError(null);
      try {
        if (useApi) {
          const response = await apiService.listNotes(patientId);
          // Transformar respuesta de API a formato del frontend
          const transformedNotes: MedicalNote[] = response.results.map((n) => ({
            id: n.id,
            patientId,
            doctorId: '', // TODO: obtener del contexto de auth
            title: n.title,
            type: n.type as any,
            content: n.content,
            status: n.is_signed ? 'signed' : 'draft',
            isSigned: n.is_signed,
            signedAt: n.signed_at,
            signedBy: n.signed_by,
            createdAt: n.created_at,
            updatedAt: n.updated_at,
          }));
          setNotes(transformedNotes);
        } else {
          // Usar mock data
          setNotes(getNotesByPatientId(patientId));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar notas');
        // Fallback a mock data
        if (useApi) {
          setNotes(getNotesByPatientId(patientId));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [patientId, useApi]);

  const createNote = async (data: {
    title: string;
    content: string;
    type: string;
  }) => {
    if (!patientId) throw new Error('Patient ID is required');
    
    if (useApi) {
      try {
        const newNote = await apiService.createNote(patientId, data);
        // Recargar notas
        const response = await apiService.listNotes(patientId);
        const transformedNotes: MedicalNote[] = response.results.map((n) => ({
          id: n.id,
          patientId,
          doctorId: '',
          title: n.title,
          type: n.type as any,
          content: n.content,
          status: n.is_signed ? 'signed' : 'draft',
          isSigned: n.is_signed,
          signedAt: n.signed_at,
          signedBy: n.signed_by,
          createdAt: n.created_at,
          updatedAt: n.updated_at,
        }));
        setNotes(transformedNotes);
        return {
          ...newNote,
          status: 'draft' as const,
          isSigned: false,
        };
      } catch (err) {
        throw err;
      }
    } else {
      // Mock: crear nota localmente
      const mockNote: MedicalNote = {
        id: `note-${Date.now()}`,
        patientId,
        doctorId: '',
        title: data.title,
        type: data.type as any,
        content: data.content,
        status: 'draft',
        isSigned: false,
        hash: `mock-hash-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setNotes([mockNote, ...notes]);
      return mockNote;
    }
  };

  const signNote = async (noteId: string) => {
    if (!patientId) throw new Error('Patient ID is required');
    
    if (useApi) {
      try {
        await apiService.signNote(patientId, noteId);
        // Recargar notas
        const response = await apiService.listNotes(patientId);
        const transformedNotes: MedicalNote[] = response.results.map((n) => ({
          id: n.id,
          patientId,
          doctorId: '',
          title: n.title,
          type: n.type as any,
          content: n.content,
          status: n.is_signed ? 'signed' : 'draft',
          isSigned: n.is_signed,
          signedAt: n.signed_at,
          signedBy: n.signed_by,
          createdAt: n.created_at,
          updatedAt: n.updated_at,
        }));
        setNotes(transformedNotes);
      } catch (err) {
        throw err;
      }
    } else {
      // Mock: firmar nota localmente
      setNotes(
        notes.map((n) =>
          n.id === noteId
            ? {
                ...n,
                status: 'signed',
                isSigned: true,
                signedAt: new Date().toISOString(),
                signedBy: 'Dr. María García López',
              }
            : n
        )
      );
    }
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

    if (useApi) {
      try {
        await apiService.updateNote(patientId, noteId, data);
        // Recargar notas
        const response = await apiService.listNotes(patientId);
        const transformedNotes: MedicalNote[] = response.results.map((n) => ({
          id: n.id,
          patientId,
          doctorId: '',
          title: n.title,
          type: n.type as any,
          content: n.content,
          status: n.is_signed ? 'signed' : 'draft',
          isSigned: n.is_signed,
          signedAt: n.signed_at,
          signedBy: n.signed_by,
          createdAt: n.created_at,
          updatedAt: n.updated_at,
        }));
        setNotes(transformedNotes);
      } catch (err) {
        throw err;
      }
    } else {
      // Mock: actualizar nota localmente
      setNotes(
        notes.map((n) =>
          n.id === noteId
            ? {
                ...n,
                ...data,
                status: 'draft',
                updatedAt: new Date().toISOString(),
                hash: `mock-hash-${Date.now()}`,
              }
            : n
        )
      );
    }
  };

  const getNoteCompleteness = async (
    noteId: string,
    noteContent?: string,
    noteType?: string
  ): Promise<NoteCompletenessAnalysis> => {
    if (!patientId) throw new Error('Patient ID is required');

    if (useApi) {
      try {
        return await apiService.getNoteCompleteness(patientId, noteId);
      } catch (err) {
        throw err;
      }
    } else {
      // Mock: retornar análisis mock
      // Si se proporciona contenido directamente, usarlo; si no, buscar en notes
      let note: MedicalNote | undefined;
      let content = noteContent;
      let type = noteType;
      
      if (content && type) {
        // Usar contenido proporcionado directamente
      } else {
        // Buscar en el array de notas
        note = notes.find((n) => n.id === noteId);
        if (!note) {
          // Si no se encuentra, intentar con un pequeño delay para dar tiempo a que se actualice
          await new Promise(resolve => setTimeout(resolve, 100));
          note = notes.find((n) => n.id === noteId);
        }
        if (!note) {
          throw new Error('Note not found');
        }
        content = note.content;
        type = note.type;
      }

      // Mock analysis based on note type and content
      const contentToAnalyze = content || '';
      return {
        completeness_score: 75,
        reasoning: {
          has_diagnostic_impression: contentToAnalyze.includes('Diagnóstico') || contentToAnalyze.includes('Impresión')
            ? 'Diagnóstico presente en la nota'
            : 'Falta incluir diagnóstico o impresión clínica',
          has_disease_evolution: contentToAnalyze.includes('Evolución')
            ? 'Evolución de la enfermedad documentada'
            : 'Falta documentar la evolución de la enfermedad',
          has_physical_exam: contentToAnalyze.includes('Exploración') || contentToAnalyze.includes('Física')
            ? 'Exploración física documentada'
            : 'Falta incluir exploración física',
          has_treatment_plan: contentToAnalyze.includes('Tratamiento') || contentToAnalyze.includes('Plan')
            ? 'Plan de tratamiento presente'
            : 'Falta incluir plan de tratamiento',
          has_vital_signs: contentToAnalyze.includes('Vitales') || contentToAnalyze.includes('Presión') || contentToAnalyze.includes('Temperatura')
            ? 'Signos vitales documentados'
            : 'Faltan signos vitales',
        },
      };
    }
  };

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    signNote,
    getNoteCompleteness,
  };
};

