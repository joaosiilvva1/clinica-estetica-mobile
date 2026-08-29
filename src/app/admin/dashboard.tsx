import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://clinica-estetica-backend.onrender.com';

type Appointment = {
  id: string;
  clientName: string;
  clientWhatsapp: string;
  treatmentName: string;
  scheduledAt: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes?: string;
};

type Testimonial = {
  id: number;
  clientName: string;
  rating: number;
  comment: string;
};

const statusLabel: Record<Appointment['status'], string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelado',
  COMPLETED: 'Concluído',
};

const statusColor: Record<Appointment['status'], string> = {
  PENDING: '#b8860b',
  CONFIRMED: '#2e7d32',
  CANCELLED: '#b3261e',
  COMPLETED: '#555',
};

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function AdminDashboard() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [date, setDate] = useState(todayISO());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [pendingTestimonials, setPendingTestimonials] = useState<Testimonial[]>([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const [testimonialsError, setTestimonialsError] = useState<string | null>(null);
  const [moderatingId, setModeratingId] = useState<number | null>(null);

  // Guarda de rota: sem token, manda pro login.
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('admin_jwt_token') : null;
    if (!saved) {
      router.replace('/admin');
      return;
    }
    setToken(saved);
  }, []);

  const handleLogout = () => {
    window.localStorage.removeItem('admin_jwt_token');
    router.replace('/admin');
  };

  const loadAppointments = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      // A profissional é única no MVP — pega o id dela via endpoint público.
      let profId = professionalId;
      if (!profId) {
        const profRes = await fetch(`${API_BASE_URL}/api/professionals/public`);
        const profData = await profRes.json();
        profId = profData?.[0]?.id ?? null;
        if (!profId) {
          setError('Nenhuma profissional cadastrada.');
          setLoading(false);
          return;
        }
        setProfessionalId(profId);
      }

      const res = await fetch(
          `${API_BASE_URL}/api/admin/appointments?professionalId=${profId}&date=${date}`,
          { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 401 || res.status === 403) {
        handleLogout();
        return;
      }
      if (!res.ok) throw new Error();

      const data: Appointment[] = await res.json();
      data.sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
      setAppointments(data);
    } catch {
      setError('Não foi possível carregar os agendamentos. O servidor pode estar iniciando — tente novamente em instantes.');
    } finally {
      setLoading(false);
    }
  }, [token, date, professionalId]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const loadPendingTestimonials = useCallback(async () => {
    if (!token) return;
    setTestimonialsLoading(true);
    setTestimonialsError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/testimonials/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) {
        handleLogout();
        return;
      }
      if (!res.ok) throw new Error();
      const data: Testimonial[] = await res.json();
      setPendingTestimonials(data);
    } catch {
      setTestimonialsError('Não foi possível carregar os depoimentos pendentes.');
    } finally {
      setTestimonialsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadPendingTestimonials();
  }, [loadPendingTestimonials]);

  const approveTestimonial = async (id: number) => {
    if (!token) return;
    setModeratingId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/testimonials/${id}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setPendingTestimonials((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setTestimonialsError('Não foi possível aprovar esse depoimento.');
    } finally {
      setModeratingId(null);
    }
  };

  const rejectTestimonial = async (id: number) => {
    if (!token) return;
    setModeratingId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/testimonials/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setPendingTestimonials((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setTestimonialsError('Não foi possível rejeitar esse depoimento.');
    } finally {
      setModeratingId(null);
    }
  };

  const updateStatus = async (id: string, status: Appointment['status']) => {
    if (!token) return;
    setUpdatingId(id);
    try {
      const res = await fetch(
          `${API_BASE_URL}/api/admin/appointments/${id}/status?status=${status}`,
          { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error();
      const updated: Appointment = await res.json();
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch {
      setError('Não foi possível atualizar o status desse agendamento.');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatTime = (iso: string) =>
      new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });

  if (!token) return null;

  return (
      <div style={styles.wrapper}>
        <header style={styles.header}>
          <h1 style={styles.title}>Agenda</h1>
          <button onClick={handleLogout} style={styles.logoutButton}>Sair</button>
        </header>

        <div style={styles.controls}>
          <label style={styles.label}>Data</label>
          <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={styles.dateInput}
          />
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {loading ? (
            <p style={styles.info}>Carregando...</p>
        ) : appointments.length === 0 ? (
            <p style={styles.info}>Nenhum agendamento para essa data.</p>
        ) : (
            <div style={styles.list}>
              {appointments.map((a) => (
                  <div key={a.id} style={styles.card}>
                    <div style={styles.cardTop}>
                      <strong style={styles.time}>{formatTime(a.scheduledAt)}</strong>
                      <span style={{ ...styles.badge, background: statusColor[a.status] }}>
                  {statusLabel[a.status]}
                </span>
                    </div>
                    <p style={styles.clientName}>{a.clientName}</p>
                    <p style={styles.detail}>{a.treatmentName}</p>
                    <a
                        href={`https://wa.me/${a.clientWhatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        style={styles.whatsapp}
                    >
                      WhatsApp: {a.clientWhatsapp}
                    </a>
                    {a.notes && <p style={styles.notes}>Obs: {a.notes}</p>}

                    <div style={styles.actions}>
                      {(['CONFIRMED', 'COMPLETED', 'CANCELLED'] as const)
                          .filter((s) => s !== a.status)
                          .map((s) => (
                              <button
                                  key={s}
                                  onClick={() => updateStatus(a.id, s)}
                                  disabled={updatingId === a.id}
                                  style={styles.actionButton}
                              >
                                {updatingId === a.id ? '...' : statusLabel[s]}
                              </button>
                          ))}
                    </div>
                  </div>
              ))}
            </div>
        )}

        <header style={{ ...styles.header, marginTop: 40 }}>
          <h1 style={styles.title}>Depoimentos pendentes</h1>
        </header>

        {testimonialsError && <div style={styles.error}>{testimonialsError}</div>}

        {testimonialsLoading ? (
            <p style={styles.info}>Carregando...</p>
        ) : pendingTestimonials.length === 0 ? (
            <p style={styles.info}>Nenhum depoimento aguardando aprovação.</p>
        ) : (
            <div style={styles.list}>
              {pendingTestimonials.map((t) => (
                  <div key={t.id} style={styles.card}>
                    <div style={styles.cardTop}>
                      <strong style={styles.time}>{t.clientName}</strong>
                      <span style={styles.time}>{'⭐'.repeat(t.rating)}</span>
                    </div>
                    <p style={styles.detail}>{t.comment}</p>
                    <div style={styles.actions}>
                      <button
                          onClick={() => approveTestimonial(t.id)}
                          disabled={moderatingId === t.id}
                          style={{ ...styles.actionButton, borderColor: '#2e7d32', color: '#2e7d32' }}
                      >
                        {moderatingId === t.id ? '...' : 'Aprovar'}
                      </button>
                      <button
                          onClick={() => rejectTestimonial(t.id)}
                          disabled={moderatingId === t.id}
                          style={{ ...styles.actionButton, borderColor: '#b3261e', color: '#b3261e' }}
                      >
                        {moderatingId === t.id ? '...' : 'Rejeitar'}
                      </button>
                    </div>
                  </div>
              ))}
            </div>
        )}
      </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    minHeight: '100vh',
    background: '#f7f4f9',
    fontFamily: 'Montserrat, sans-serif',
    padding: 24,
    maxWidth: 720,
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'Playfair Display, serif',
    color: '#3d1f4a',
    margin: 0,
  },
  logoutButton: {
    padding: '8px 16px',
    borderRadius: 8,
    border: '1px solid #6b2d7a',
    background: 'transparent',
    color: '#6b2d7a',
    cursor: 'pointer',
    fontSize: 13,
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    color: '#555',
  },
  dateInput: {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #ddd',
    fontSize: 14,
  },
  info: {
    color: '#777',
    textAlign: 'center',
    marginTop: 40,
  },
  error: {
    background: '#fdecea',
    color: '#b3261e',
    padding: '10px 12px',
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 16,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: 16,
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  time: {
    fontSize: 16,
    color: '#3d1f4a',
  },
  badge: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 600,
    padding: '3px 10px',
    borderRadius: 999,
    textTransform: 'uppercase',
  },
  clientName: {
    margin: '4px 0 0',
    fontWeight: 600,
    fontSize: 15,
    color: '#222',
  },
  detail: {
    margin: '2px 0',
    color: '#666',
    fontSize: 14,
  },
  whatsapp: {
    fontSize: 13,
    color: '#2e7d32',
    textDecoration: 'none',
  },
  notes: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 4,
  },
  actions: {
    display: 'flex',
    gap: 8,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  actionButton: {
    padding: '6px 12px',
    fontSize: 12,
    borderRadius: 6,
    border: '1px solid #ccc',
    background: '#fafafa',
    cursor: 'pointer',
  },
};
