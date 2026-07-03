import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import {
  getClinicDataSnapshot,
  loadAppointments,
  refreshAppointments,
  subscribeClinicData,
} from '../lib/clinicDataStore';

function useClinicDataTick() {
  const [, setTick] = useState(0);
  useEffect(() => subscribeClinicData(() => setTick((n) => n + 1)), []);
}

export const useAppointments = () => {
  useClinicDataTick();

  useEffect(() => {
    void loadAppointments();
  }, []);

  const snap = getClinicDataSnapshot();

  const createAppointment = useCallback(
    async (
      patient: string,
      starts_at: string,
      duration: string,
      additional_notes?: string
    ) => {
      const trimmed = additional_notes?.trim();
      await apiService.createAppointment({
        patient,
        starts_at,
        duration,
        ...(trimmed ? { additional_notes: trimmed } : {}),
      });
      await refreshAppointments();
    },
    []
  );

  const updateAppointmentStatus = useCallback(
    async (
      id: string,
      status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
    ) => {
      await apiService.updateAppointmentStatus(id, status);
      await refreshAppointments();
    },
    []
  );

  const deleteAppointment = useCallback(async (id: string) => {
    await apiService.deleteAppointment(id);
    await refreshAppointments();
  }, []);

  return {
    appointments: snap.appointments,
    count: snap.appointmentsCount,
    loading: snap.appointmentsLoading,
    error: snap.appointmentsError,
    refetch: () => refreshAppointments(),
    createAppointment,
    updateAppointmentStatus,
    deleteAppointment,
  };
};
