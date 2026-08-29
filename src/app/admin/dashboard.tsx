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

<<<<<<< HEAD
=======
type Treatment = {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  active: boolean;
};

type TreatmentForm = {
  id?: string;
  name: string;
  description: string;
  price: string;
  durationMinutes: string;
};

type Tab = 'agenda' | 'tratamentos' | 'depoimentos';

>>>>>>> 2bb19bc9058a26f9db4821d75b54ddac3ea543a6
const statusLabel: Record<Appointment['status'], string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelado',
  COMPLETED: 'Concluído',
};

const statusColor: Record<Appointment['status'], string> = {
<<<<<<< HEAD
  PENDING: '#b8860b',
  CONFIRMED: '#2e7d32',
  CANCELLED: '#b3261e',
  COMPLETED: '#555',
=======
  PENDING: '#B8860B',
  CONFIRMED: '#2E7D32',
  CANCELLED: '#B3261E',
  COMPLETED: '#6D5D75',
>>>>>>> 2bb19bc9058a26f9db4821d75b54ddac3ea543a6
};

const todayISO = () => new Date().toISOString().slice(0, 10);

<<<<<<< HEAD
export default function AdminDashboard() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
=======
const formatPrice = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function AdminDashboard() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [tab, setTab] = useState<Tab>('agenda');

  // --- Agenda ---
>>>>>>> 2bb19bc9058a26f9db4821d75b54ddac3ea543a6
  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [date, setDate] = useState(todayISO());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

<<<<<<< HEAD
=======
  // --- Depoimentos ---
>>>>>>> 2bb19bc9058a26f9db4821d75b54ddac3ea543a6
  const [pendingTestimonials, setPendingTestimonials] = useState<Testimonial[]>([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const [testimonialsError, setTestimonialsError] = useState<string | null>(null);
  const [moderatingId, setModeratingId] = useState<number | null>(null);

<<<<<<< HEAD
  // Guarda de rota: sem token, manda pro login.
=======
  // --- Tratamentos ---
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [treatmentsLoading, setTreatmentsLoading] = useState(true);
  const [treatmentsError, setTreatmentsError] = useState<string | null>(null);
  const [treatmentForm, setTreatmentForm] = useState<TreatmentForm | null>(null);
  const [savingTreatment, setSavingTreatment] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

>>>>>>> 2bb19bc9058a26f9db4821d75b54ddac3ea543a6
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('admin_jwt_token') : null;
    if (!saved) {
      router.replace('/admin');
      return;
    }
    setToken(saved);
  }, []);

<<<<<<< HEAD
=======
  useEffect(() => {
    const checkWidth = () => setIsMobile(window.innerWidth < 720);
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

>>>>>>> 2bb19bc9058a26f9db4821d75b54ddac3ea543a6
  const handleLogout = () => {
    window.localStorage.removeItem('admin_jwt_token');
    router.replace('/admin');
  };

<<<<<<< HEAD
=======
  // ---------- Agenda ----------
>>>>>>> 2bb19bc9058a26f9db4821d75b54ddac3ea543a6
  const loadAppointments = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
<<<<<<< HEAD
      // A profissional é única no MVP — pega o id dela via endpoint público.
=======
>>>>>>> 2bb19bc9058a26f9db4821d75b54ddac3ea543a6
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
<<<<<<< HEAD
          `${API_BASE_URL}/api/admin/appointments?professionalId=${profId}&date=${date}`,
          { headers: { Authorization: `Bearer ${token}` } }
=======
        `${API_BASE_URL}/api/admin/appointments?professionalId=${profId}&date=${date}`,
        { headers: { Authorization: `Bearer ${token}` } }
>>>>>>> 2bb19bc9058a26f9db4821d75b54ddac3ea543a6
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
<<<<<<< HEAD
    loadAppointments();
  }, [loadAppointments]);

=======
    if (tab === 'agenda') loadAppointments();
  }, [tab, loadAppointments]);

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

  // ---------- Depoimentos ----------
>>>>>>> 2bb19bc9058a26f9db4821d75b54ddac3ea543a6
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
<<<<<<< HEAD
    loadPendingTestimonials();
  }, [loadPendingTestimonials]);
=======
    if (tab === 'depoimentos') loadPendingTestimonials();
  }, [tab, loadPendingTestimonials]);
>>>>>>> 2bb19bc9058a26f9db4821d75b54ddac3ea543a6

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

<<<<<<< HEAD
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
=======
  // ---------- Tratamentos ----------
  const loadTreatments = useCallback(async () => {
    if (!token) return;
    setTreatmentsLoading(true);
    setTreatmentsError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/treatments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) {
        handleLogout();
        return;
      }
      if (!res.ok) throw new Error();
      const data: Treatment[] = await res.json();
      setTreatments(data);
    } catch {
      setTreatmentsError('Não foi possível carregar os tratamentos.');
    } finally {
      setTreatmentsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (tab === 'tratamentos') loadTreatments();
  }, [tab, loadTreatments]);

  const openNewTreatmentForm = () => {
    setTreatmentForm({ name: '', description: '', price: '', durationMinutes: '' });
  };

  const openEditTreatmentForm = (t: Treatment) => {
    setTreatmentForm({
      id: t.id,
      name: t.name,
      description: t.description ?? '',
      price: String(t.price),
      durationMinutes: String(t.durationMinutes),
    });
  };

  const saveTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !treatmentForm) return;

    const price = Number(treatmentForm.price.replace(',', '.'));
    const durationMinutes = Number(treatmentForm.durationMinutes);

    if (!treatmentForm.name.trim() || !price || price <= 0 || !durationMinutes || durationMinutes <= 0) {
      setTreatmentsError('Preencha nome, preço e duração corretamente antes de salvar.');
      return;
    }

    setSavingTreatment(true);
    setTreatmentsError(null);
    try {
      const isEdit = !!treatmentForm.id;
      const res = await fetch(
        isEdit
          ? `${API_BASE_URL}/api/admin/treatments/${treatmentForm.id}`
          : `${API_BASE_URL}/api/admin/treatments`,
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            name: treatmentForm.name.trim(),
            description: treatmentForm.description.trim(),
            price,
            durationMinutes,
          }),
        }
      );
      if (!res.ok) throw new Error();
      const saved: Treatment = await res.json();
      setTreatments((prev) =>
        isEdit ? prev.map((t) => (t.id === saved.id ? saved : t)) : [...prev, saved]
      );
      setTreatmentForm(null);
    } catch {
      setTreatmentsError('Não foi possível salvar o tratamento. Confira os dados e tente de novo.');
    } finally {
      setSavingTreatment(false);
    }
  };

  const toggleTreatmentActive = async (t: Treatment) => {
    if (!token) return;
    setTogglingId(t.id);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/treatments/${t.id}/status?active=${!t.active}`,
        { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error();
      const updated: Treatment = await res.json();
      setTreatments((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    } catch {
      setTreatmentsError('Não foi possível alterar o status desse tratamento.');
    } finally {
      setTogglingId(null);
    }
  };

  if (!token) return null;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'agenda', label: 'Agenda' },
    { key: 'tratamentos', label: 'Tratamentos' },
    { key: 'depoimentos', label: 'Depoimentos' },
  ];

  return (
    <div style={styles.wrapper}>
      <header style={styles.header}>
        <h1 style={styles.title}>Painel Administrativo</h1>
        <button onClick={handleLogout} style={styles.logoutButton}>Sair</button>
      </header>

      <nav style={styles.tabBar}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{ ...styles.tabButton, ...(tab === t.key ? styles.tabButtonActive : {}) }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'agenda' && (
        <section>
          <div style={styles.controls}>
            <label style={styles.label}>Data</label>
            <input
>>>>>>> 2bb19bc9058a26f9db4821d75b54ddac3ea543a6
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={styles.dateInput}
<<<<<<< HEAD
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
=======
            />
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}

          {loading ? (
            <p style={styles.info}>Carregando...</p>
          ) : appointments.length === 0 ? (
            <p style={styles.info}>Nenhum agendamento para essa data.</p>
          ) : (
            <div style={{ ...styles.list, ...(isMobile ? {} : styles.listGrid) }}>
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
        </section>
      )}

      {tab === 'tratamentos' && (
        <section>
          {treatmentsError && <div style={styles.errorBox}>{treatmentsError}</div>}

          {!treatmentForm && (
            <button onClick={openNewTreatmentForm} style={styles.primaryButton}>
              + Novo tratamento
            </button>
          )}

          {treatmentForm && (
            <form onSubmit={saveTreatment} style={styles.form}>
              <h3 style={styles.formTitle}>
                {treatmentForm.id ? 'Editar tratamento' : 'Novo tratamento'}
              </h3>

              <label style={styles.label}>Nome</label>
              <input
                type="text"
                value={treatmentForm.name}
                onChange={(e) => setTreatmentForm({ ...treatmentForm, name: e.target.value })}
                style={styles.input}
                required
              />

              <label style={styles.label}>Descrição</label>
              <textarea
                value={treatmentForm.description}
                onChange={(e) => setTreatmentForm({ ...treatmentForm, description: e.target.value })}
                style={{ ...styles.input, minHeight: 80, fontFamily: 'inherit', resize: 'vertical' as const }}
              />

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' as const }}>
                <div style={{ flex: '1 1 140px' }}>
                  <label style={styles.label}>Preço (R$)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={treatmentForm.price}
                    onChange={(e) => setTreatmentForm({ ...treatmentForm, price: e.target.value })}
                    style={styles.input}
                    placeholder="120.00"
                    required
                  />
                </div>
                <div style={{ flex: '1 1 140px' }}>
                  <label style={styles.label}>Duração (min)</label>
                  <input
                    type="number"
                    value={treatmentForm.durationMinutes}
                    onChange={(e) => setTreatmentForm({ ...treatmentForm, durationMinutes: e.target.value })}
                    style={styles.input}
                    placeholder="60"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" disabled={savingTreatment} style={styles.primaryButton}>
                  {savingTreatment ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  type="button"
                  onClick={() => setTreatmentForm(null)}
                  style={styles.secondaryButton}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {treatmentsLoading ? (
            <p style={styles.info}>Carregando...</p>
          ) : treatments.length === 0 ? (
            <p style={styles.info}>Nenhum tratamento cadastrado ainda.</p>
          ) : (
            <div style={{ ...styles.list, ...(isMobile ? {} : styles.listGrid), marginTop: 20 }}>
              {treatments.map((t) => (
                <div key={t.id} style={styles.card}>
                  <div style={styles.cardTop}>
                    <strong style={styles.time}>{t.name}</strong>
                    <span
                      style={{
                        ...styles.badge,
                        background: t.active ? '#2E7D32' : '#8A8A8A',
                      }}
                    >
                      {t.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  {!!t.description && <p style={styles.detail}>{t.description}</p>}
                  <p style={styles.detail}>
                    {formatPrice(t.price)} · {t.durationMinutes} min
                  </p>
                  <div style={styles.actions}>
                    <button onClick={() => openEditTreatmentForm(t)} style={styles.actionButton}>
                      Editar
                    </button>
                    <button
                      onClick={() => toggleTreatmentActive(t)}
                      disabled={togglingId === t.id}
                      style={{
                        ...styles.actionButton,
                        borderColor: t.active ? '#B3261E' : '#2E7D32',
                        color: t.active ? '#B3261E' : '#2E7D32',
                      }}
                    >
                      {togglingId === t.id ? '...' : t.active ? 'Desativar' : 'Ativar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === 'depoimentos' && (
        <section>
          {testimonialsError && <div style={styles.errorBox}>{testimonialsError}</div>}

          {testimonialsLoading ? (
            <p style={styles.info}>Carregando...</p>
          ) : pendingTestimonials.length === 0 ? (
            <p style={styles.info}>Nenhum depoimento aguardando aprovação.</p>
          ) : (
            <div style={{ ...styles.list, ...(isMobile ? {} : styles.listGrid) }}>
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
                      style={{ ...styles.actionButton, borderColor: '#2E7D32', color: '#2E7D32' }}
                    >
                      {moderatingId === t.id ? '...' : 'Aprovar'}
                    </button>
                    <button
                      onClick={() => rejectTestimonial(t.id)}
                      disabled={moderatingId === t.id}
                      style={{ ...styles.actionButton, borderColor: '#B3261E', color: '#B3261E' }}
                    >
                      {moderatingId === t.id ? '...' : 'Rejeitar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
>>>>>>> 2bb19bc9058a26f9db4821d75b54ddac3ea543a6
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    minHeight: '100vh',
<<<<<<< HEAD
    background: '#f7f4f9',
    fontFamily: 'Montserrat, sans-serif',
    padding: 24,
    maxWidth: 720,
    margin: '0 auto',
=======
    background: '#FAF9F6',
    fontFamily: "'Montserrat', sans-serif",
    padding: 24,
    maxWidth: 960,
    margin: '0 auto',
    boxSizing: 'border-box',
>>>>>>> 2bb19bc9058a26f9db4821d75b54ddac3ea543a6
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
<<<<<<< HEAD
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
=======
    flexWrap: 'wrap',
    gap: 10,
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    color: '#2D1537',
    margin: 0,
    fontSize: 26,
  },
  logoutButton: {
    padding: '8px 16px',
    borderRadius: 20,
    border: '1px solid #A259C4',
    background: 'transparent',
    color: '#A259C4',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
  },
  tabBar: {
    display: 'flex',
    gap: 8,
    marginBottom: 28,
    overflowX: 'auto',
    paddingBottom: 4,
  },
  tabButton: {
    padding: '10px 20px',
    borderRadius: 20,
    border: '1px solid #E8D7F1',
    background: '#FFF',
    color: '#6D5D75',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  tabButtonActive: {
    background: '#2D1537',
    borderColor: '#2D1537',
    color: '#FFF',
>>>>>>> 2bb19bc9058a26f9db4821d75b54ddac3ea543a6
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
<<<<<<< HEAD
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
=======
    color: '#5A4A60',
    fontWeight: 600,
  },
  dateInput: {
    padding: '8px 12px',
    borderRadius: 10,
    border: '1px solid #D4A5E0',
    fontSize: 14,
  },
  input: {
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid #D4A5E0',
    fontSize: 15,
    fontFamily: 'inherit',
    color: '#2D1537',
    background: '#FAF9F6',
    width: '100%',
    boxSizing: 'border-box',
    marginBottom: 4,
  },
  info: {
    color: '#6D5D75',
    textAlign: 'center',
    marginTop: 30,
  },
  errorBox: {
    background: '#FDECEA',
    color: '#B3261E',
    padding: '10px 12px',
    borderRadius: 10,
>>>>>>> 2bb19bc9058a26f9db4821d75b54ddac3ea543a6
    fontSize: 13,
    marginBottom: 16,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
<<<<<<< HEAD
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: 16,
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
=======
  listGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 14,
  },
  card: {
    background: '#FFF',
    borderRadius: 16,
    padding: 18,
    border: '1px solid #F0E4F5',
    boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
>>>>>>> 2bb19bc9058a26f9db4821d75b54ddac3ea543a6
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
<<<<<<< HEAD
  },
  time: {
    fontSize: 16,
    color: '#3d1f4a',
=======
    gap: 8,
  },
  time: {
    fontSize: 16,
    color: '#2D1537',
    fontFamily: "'Playfair Display', serif",
>>>>>>> 2bb19bc9058a26f9db4821d75b54ddac3ea543a6
  },
  badge: {
    color: '#fff',
    fontSize: 11,
<<<<<<< HEAD
    fontWeight: 600,
    padding: '3px 10px',
    borderRadius: 999,
    textTransform: 'uppercase',
=======
    fontWeight: 700,
    padding: '3px 10px',
    borderRadius: 999,
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
>>>>>>> 2bb19bc9058a26f9db4821d75b54ddac3ea543a6
  },
  clientName: {
    margin: '4px 0 0',
    fontWeight: 600,
    fontSize: 15,
<<<<<<< HEAD
    color: '#222',
  },
  detail: {
    margin: '2px 0',
    color: '#666',
=======
    color: '#2D1537',
  },
  detail: {
    margin: '2px 0',
    color: '#6D5D75',
>>>>>>> 2bb19bc9058a26f9db4821d75b54ddac3ea543a6
    fontSize: 14,
  },
  whatsapp: {
    fontSize: 13,
<<<<<<< HEAD
    color: '#2e7d32',
=======
    color: '#2E7D32',
>>>>>>> 2bb19bc9058a26f9db4821d75b54ddac3ea543a6
    textDecoration: 'none',
  },
  notes: {
    fontSize: 13,
<<<<<<< HEAD
    color: '#888',
=======
    color: '#8A7A8F',
>>>>>>> 2bb19bc9058a26f9db4821d75b54ddac3ea543a6
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
<<<<<<< HEAD
    borderRadius: 6,
    border: '1px solid #ccc',
    background: '#fafafa',
    cursor: 'pointer',
  },
};
=======
    borderRadius: 8,
    border: '1px solid #D4A5E0',
    background: '#FAF9F6',
    color: '#2D1537',
    cursor: 'pointer',
    fontWeight: 600,
  },
  primaryButton: {
    padding: '12px 22px',
    borderRadius: 24,
    border: 'none',
    background: '#2D1537',
    color: '#FFF',
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    marginBottom: 20,
  },
  secondaryButton: {
    padding: '12px 22px',
    borderRadius: 24,
    border: '1px solid #D4A5E0',
    background: '#FFF',
    color: '#6D5D75',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    background: '#FFF',
    padding: 24,
    borderRadius: 16,
    border: '1px solid #F0E4F5',
    marginBottom: 24,
  },
  formTitle: {
    fontFamily: "'Playfair Display', serif",
    color: '#2D1537',
    margin: '0 0 8px',
    fontSize: 18,
  },
};

      -- teste commit
>>>>>>> 2bb19bc9058a26f9db4821d75b54ddac3ea543a6
