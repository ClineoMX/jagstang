import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { Patient } from '../types';
import { mockPatients, getPatientById } from '../data/mockData';
import { USE_API } from '../config/api';

interface UsePatientsOptions {
  useApi?: boolean;
}

/**
 * Hook para gestionar pacientes
 * Usa la configuración USE_API por defecto, pero puede ser sobrescrito
 */
export const usePatients = (options: UsePatientsOptions = {}) => {
  const useApi = options.useApi ?? USE_API;
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      setError(null);
      try {
        if (useApi) {
          const response = await apiService.listPatients();
          // Transformar respuesta de API a formato del frontend
          const transformedPatients: Patient[] = response.results.map((p) => ({
            id: p.id,
            firstName: p.name,
            lastName: p.lastname,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
          setPatients(transformedPatients);
        } else {
          // Usar mock data
          setPatients(mockPatients);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar pacientes');
        // Fallback a mock data en caso de error
        if (useApi) {
          setPatients(mockPatients);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [useApi]);

  return { patients, loading, error, refetch: () => {} };
};

/**
 * Hook para obtener un paciente específico
 */
export const usePatient = (patientId: string | undefined, options: UsePatientsOptions = {}) => {
  const useApi = options.useApi ?? USE_API;
  const [patient, setPatient] = useState<Patient | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      return;
    }

    const fetchPatient = async () => {
      setLoading(true);
      setError(null);
      try {
        if (useApi) {
          const [patientData, profileData] = await Promise.all([
            apiService.getPatient(patientId),
            apiService.getPatientProfile(patientId).catch(() => null),
          ]);

          // Transformar datos de API
          const transformedPatient: Patient = {
            id: patientData.id,
            firstName: patientData.name,
            lastName: patientData.lastname,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...(profileData && {
              email: profileData.email,
              phone: profileData.phone,
              dateOfBirth: profileData.birthdate,
              gender: profileData.gender?.toLowerCase() as any,
              bloodType: profileData.blood_type as any,
              address: profileData.address,
              city: profileData.city,
              state: profileData.state,
              zipCode: profileData.zip_code,
              curp: profileData.citizen_id,
              rfc: profileData.tax_id,
              socialSecurityNumber: profileData.ssn,
              insuranceProvider: profileData.insurance_provider,
              insuranceNumber: profileData.insurance_number,
            }),
          };

          setPatient(transformedPatient);
          setProfile(profileData);
        } else {
          // Usar mock data
          const mockPatient = getPatientById(patientId);
          setPatient(mockPatient || null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar paciente');
        // Fallback a mock data
        if (useApi) {
          const mockPatient = getPatientById(patientId);
          setPatient(mockPatient || null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [patientId, useApi]);

  return { patient, profile, loading, error };
};

