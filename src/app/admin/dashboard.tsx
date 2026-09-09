import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { useRouter } from 'expo-router';
import LandingPage from '../index';

const API_BASE_URL =
    process.env.EXPO_PUBLIC_API_URL ||
    'https://clinica-estetica-backend.onrender.com';

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

type Photo = {
  id: string;
  url: string;
  title: string | null;
  sortOrder: number;
  active: boolean;
};

type PhotoForm = {
  id?: string;
  url: string;
  title: string;
  sortOrder: string;
};

type TrustItem = { icon: string; text: string };
type BenefitItem = { icon: string; text: string };
type IndicationItem = { icon: string; title: string; text: string };
type FaqItem = { question: string; answer: string };

type SiteSettingsForm = {
  aboutText: string;
  address: string;
  whatsapp: string;
  openingHoursText: string;
  instagramUrl: string;
  logoUrl: string;
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroTrustItems: TrustItem[];
  benefitsItems: BenefitItem[];
  indicationsSectionTitle: string;
  indicationsItems: IndicationItem[];
  aboutBadgeText: string;
  aboutPhotoUrl: string;
  treatmentsEyebrow: string;
  treatmentsSectionTitle: string;
  treatmentsSectionSubtitle: string;
  locationSectionTitle: string;
  locationSectionSubtitle: string;
  bookingSectionTitle: string;
  bookingSectionSubtitle: string;
  testimonialsSectionTitle: string;
  testimonialsSectionSubtitle: string;
  faqSectionTitle: string;
  faqSectionSubtitle: string;
  faqItems: FaqItem[];
  footerTagline: string;
  footerContactEmail: string;
  footerCopyrightText: string;
};

// O backend guarda listas (selos de confiança, benefícios, indicações, FAQ)
// como texto JSON. Essas funções convertem pra cá e pra lá, sem nunca quebrar
// a tela se o texto salvo estiver vazio ou corrompido.
function parseJsonArray<T>(json: string | null | undefined, fallback: T[]): T[] {
  if (!json || !json.trim()) return fallback;
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

const stringifyOrNull = (items: unknown[]) =>
    items.length > 0 ? JSON.stringify(items) : null;

type Tab = 'agenda' | 'tratamentos' | 'fotos' | 'site' | 'depoimentos';

const statusLabel: Record<Appointment['status'], string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelado',
  COMPLETED: 'Concluído',
};

const statusColor: Record<Appointment['status'], string> = {
  PENDING: '#B8860B',
  CONFIRMED: '#2E7D32',
  CANCELLED: '#B3261E',
  COMPLETED: '#6D5D75',
};

const todayISO = () => new Date().toISOString().slice(0, 10);

const formatPrice = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

export default function AdminDashboard() {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [tab, setTab] = useState<Tab>('agenda');

  // Agenda
  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [date, setDate] = useState(todayISO());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Depoimentos
  const [pendingTestimonials, setPendingTestimonials] = useState<Testimonial[]>(
      []
  );
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const [testimonialsError, setTestimonialsError] = useState<string | null>(
      null
  );
  const [moderatingId, setModeratingId] = useState<number | null>(null);

  // Tratamentos
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [treatmentsLoading, setTreatmentsLoading] = useState(true);
  const [treatmentsError, setTreatmentsError] = useState<string | null>(null);
  const [treatmentForm, setTreatmentForm] =
      useState<TreatmentForm | null>(null);
  const [savingTreatment, setSavingTreatment] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fotos
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photosLoading, setPhotosLoading] = useState(true);
  const [photosError, setPhotosError] = useState<string | null>(null);
  const [photoForm, setPhotoForm] = useState<PhotoForm | null>(null);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [photoBusyId, setPhotoBusyId] = useState<string | null>(null);

  // Site (configurações / textos institucionais)
  const [siteForm, setSiteForm] = useState<SiteSettingsForm | null>(null);
  const [siteLoading, setSiteLoading] = useState(true);
  const [siteError, setSiteError] = useState<string | null>(null);
  const [siteSaved, setSiteSaved] = useState(false);
  const [savingSite, setSavingSite] = useState(false);

  useEffect(() => {
    // Carrega as mesmas fontes da marca usadas no site público, para o
    // painel ficar visualmente consistente com o que a cliente vê.
    if (typeof document === 'undefined') return;
    const linkFont = document.createElement('link');
    linkFont.href =
        'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400&display=swap';
    linkFont.rel = 'stylesheet';
    document.head.appendChild(linkFont);
  }, []);

  useEffect(() => {
    const saved =
        typeof window !== 'undefined'
            ? window.localStorage.getItem('admin_jwt_token')
            : null;

    if (!saved) {
      router.replace('/admin');
      return;
    }

    setToken(saved);
  }, [router]);

  useEffect(() => {
    const checkWidth = () => {
      setIsMobile(window.innerWidth < 720);
    };

    checkWidth();

    window.addEventListener('resize', checkWidth);

    return () => {
      window.removeEventListener('resize', checkWidth);
    };
  }, []);

  const handleLogout = () => {
    window.localStorage.removeItem('admin_jwt_token');
    router.replace('/admin');
  };

  // =========================
  // AGENDA
  // =========================

  const loadAppointments = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      let profId = professionalId;

      if (!profId) {
        const profRes = await fetch(
            `${API_BASE_URL}/api/professionals/public`
        );

        if (!profRes.ok) {
          throw new Error();
        }

        const profData = await profRes.json();

        profId = profData?.[0]?.id ?? null;

        if (!profId) {
          setError('Nenhuma profissional cadastrada.');
          return;
        }

        setProfessionalId(profId);
      }

      const res = await fetch(
          `${API_BASE_URL}/api/admin/appointments?professionalId=${profId}&date=${date}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
      );

      if (res.status === 401 || res.status === 403) {
        handleLogout();
        return;
      }

      if (!res.ok) {
        throw new Error();
      }

      const data: Appointment[] = await res.json();

      data.sort((a, b) =>
          a.scheduledAt.localeCompare(b.scheduledAt)
      );

      setAppointments(data);
    } catch {
      setError(
          'Não foi possível carregar os agendamentos. O servidor pode estar iniciando — tente novamente em instantes.'
      );
    } finally {
      setLoading(false);
    }
  }, [token, date, professionalId]);

  useEffect(() => {
    if (tab === 'agenda') {
      loadAppointments();
    }
  }, [tab, loadAppointments]);

  const updateStatus = async (
      id: string,
      status: Appointment['status']
  ) => {
    if (!token) return;

    setUpdatingId(id);

    try {
      const res = await fetch(
          `${API_BASE_URL}/api/admin/appointments/${id}/status?status=${status}`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
      );

      if (res.status === 401 || res.status === 403) {
        handleLogout();
        return;
      }

      if (!res.ok) {
        throw new Error();
      }

      const updated: Appointment = await res.json();

      setAppointments((prev) =>
          prev.map((a) => (a.id === id ? updated : a))
      );
    } catch {
      setError('Não foi possível atualizar o status desse agendamento.');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatTime = (iso: string) =>
      new Date(iso).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo',
      });

  // =========================
  // DEPOIMENTOS
  // =========================

  const loadPendingTestimonials = useCallback(async () => {
    if (!token) return;

    setTestimonialsLoading(true);
    setTestimonialsError(null);

    try {
      const res = await fetch(
          `${API_BASE_URL}/api/admin/testimonials/pending`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
      );

      if (res.status === 401 || res.status === 403) {
        handleLogout();
        return;
      }

      if (!res.ok) {
        throw new Error();
      }

      const data: Testimonial[] = await res.json();

      setPendingTestimonials(data);
    } catch {
      setTestimonialsError(
          'Não foi possível carregar os depoimentos pendentes.'
      );
    } finally {
      setTestimonialsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (tab === 'depoimentos') {
      loadPendingTestimonials();
    }
  }, [tab, loadPendingTestimonials]);

  const approveTestimonial = async (id: number) => {
    if (!token) return;

    setModeratingId(id);

    try {
      const res = await fetch(
          `${API_BASE_URL}/api/admin/testimonials/${id}/approve`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
      );

      if (res.status === 401 || res.status === 403) {
        handleLogout();
        return;
      }

      if (!res.ok) {
        throw new Error();
      }

      setPendingTestimonials((prev) =>
          prev.filter((testimonial) => testimonial.id !== id)
      );
    } catch {
      setTestimonialsError(
          'Não foi possível aprovar esse depoimento.'
      );
    } finally {
      setModeratingId(null);
    }
  };

  const rejectTestimonial = async (id: number) => {
    if (!token) return;

    setModeratingId(id);

    try {
      const res = await fetch(
          `${API_BASE_URL}/api/admin/testimonials/${id}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
      );

      if (res.status === 401 || res.status === 403) {
        handleLogout();
        return;
      }

      if (!res.ok) {
        throw new Error();
      }

      setPendingTestimonials((prev) =>
          prev.filter((testimonial) => testimonial.id !== id)
      );
    } catch {
      setTestimonialsError(
          'Não foi possível rejeitar esse depoimento.'
      );
    } finally {
      setModeratingId(null);
    }
  };

  // =========================
  // TRATAMENTOS
  // =========================

  const loadTreatments = useCallback(async () => {
    if (!token) return;

    setTreatmentsLoading(true);
    setTreatmentsError(null);

    try {
      const res = await fetch(
          `${API_BASE_URL}/api/admin/treatments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
      );

      if (res.status === 401 || res.status === 403) {
        handleLogout();
        return;
      }

      if (!res.ok) {
        throw new Error();
      }

      const data: Treatment[] = await res.json();

      setTreatments(data);
    } catch {
      setTreatmentsError(
          'Não foi possível carregar os tratamentos.'
      );
    } finally {
      setTreatmentsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (tab === 'tratamentos') {
      loadTreatments();
    }
  }, [tab, loadTreatments]);

  const openNewTreatmentForm = () => {
    setTreatmentForm({
      name: '',
      description: '',
      price: '',
      durationMinutes: '',
    });
  };

  const openEditTreatmentForm = (treatment: Treatment) => {
    setTreatmentForm({
      id: treatment.id,
      name: treatment.name,
      description: treatment.description ?? '',
      price: String(treatment.price),
      durationMinutes: String(treatment.durationMinutes),
    });
  };

  const saveTreatment = async (
      event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!token || !treatmentForm) return;

    const price = Number(
        treatmentForm.price.replace(',', '.')
    );

    const durationMinutes = Number(
        treatmentForm.durationMinutes
    );

    if (
        !treatmentForm.name.trim() ||
        !price ||
        price <= 0 ||
        !durationMinutes ||
        durationMinutes <= 0
    ) {
      setTreatmentsError(
          'Preencha nome, preço e duração corretamente antes de salvar.'
      );
      return;
    }

    setSavingTreatment(true);
    setTreatmentsError(null);

    try {
      const isEdit = Boolean(treatmentForm.id);

      const res = await fetch(
          isEdit
              ? `${API_BASE_URL}/api/admin/treatments/${treatmentForm.id}`
              : `${API_BASE_URL}/api/admin/treatments`,
          {
            method: isEdit ? 'PUT' : 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              name: treatmentForm.name.trim(),
              description: treatmentForm.description.trim(),
              price,
              durationMinutes,
            }),
          }
      );

      if (res.status === 401 || res.status === 403) {
        handleLogout();
        return;
      }

      if (!res.ok) {
        throw new Error();
      }

      const saved: Treatment = await res.json();

      setTreatments((prev) =>
          isEdit
              ? prev.map((treatment) =>
                  treatment.id === saved.id
                      ? saved
                      : treatment
              )
              : [...prev, saved]
      );

      setTreatmentForm(null);
    } catch {
      setTreatmentsError(
          'Não foi possível salvar o tratamento. Confira os dados e tente de novo.'
      );
    } finally {
      setSavingTreatment(false);
    }
  };

  const toggleTreatmentActive = async (
      treatment: Treatment
  ) => {
    if (!token) return;

    setTogglingId(treatment.id);

    try {
      const res = await fetch(
          `${API_BASE_URL}/api/admin/treatments/${treatment.id}/status?active=${!treatment.active}`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
      );

      if (res.status === 401 || res.status === 403) {
        handleLogout();
        return;
      }

      if (!res.ok) {
        throw new Error();
      }

      const updated: Treatment = await res.json();

      setTreatments((prev) =>
          prev.map((item) =>
              item.id === updated.id
                  ? updated
                  : item
          )
      );
    } catch {
      setTreatmentsError(
          'Não foi possível alterar o status desse tratamento.'
      );
    } finally {
      setTogglingId(null);
    }
  };

  // Exclusão definitiva. Só é chamada pelo botão "Excluir", que só aparece
  // quando o tratamento já está inativo (ver JSX abaixo) — mas o backend
  // também recusa se, por algum motivo, chegar ativo aqui.
  const deleteTreatment = async (treatment: Treatment) => {
    if (!token) return;

    const confirmed = window.confirm(
        `Excluir "${treatment.name}" definitivamente? Isso também apaga TODOS os agendamentos (passados e futuros) vinculados a esse tratamento. Essa ação não pode ser desfeita.`
    );
    if (!confirmed) return;

    setDeletingId(treatment.id);

    try {
      const res = await fetch(
          `${API_BASE_URL}/api/admin/treatments/${treatment.id}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
      );

      if (res.status === 401 || res.status === 403) {
        handleLogout();
        return;
      }

      if (!res.ok) {
        throw new Error();
      }

      setTreatments((prev) => prev.filter((item) => item.id !== treatment.id));
    } catch {
      setTreatmentsError(
          'Não foi possível excluir esse tratamento. Confira se ele já está inativo e tente de novo.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =========================
  // FOTOS
  // =========================

  const loadPhotos = useCallback(async () => {
    if (!token) return;

    setPhotosLoading(true);
    setPhotosError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/photos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        handleLogout();
        return;
      }

      if (!res.ok) {
        throw new Error();
      }

      const data: Photo[] = await res.json();
      setPhotos(data);
    } catch {
      setPhotosError('Não foi possível carregar as fotos.');
    } finally {
      setPhotosLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (tab === 'fotos') {
      loadPhotos();
    }
  }, [tab, loadPhotos]);

  const openNewPhotoForm = () => {
    setPhotoForm({ url: '', title: '', sortOrder: String(photos.length) });
  };

  const openEditPhotoForm = (photo: Photo) => {
    setPhotoForm({
      id: photo.id,
      url: photo.url,
      title: photo.title ?? '',
      sortOrder: String(photo.sortOrder),
    });
  };

  const savePhoto = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token || !photoForm) return;

    if (!photoForm.url.trim()) {
      setPhotosError('Cole o link da imagem antes de salvar.');
      return;
    }

    setSavingPhoto(true);
    setPhotosError(null);

    try {
      const isEdit = Boolean(photoForm.id);

      const res = await fetch(
          isEdit
              ? `${API_BASE_URL}/api/admin/photos/${photoForm.id}`
              : `${API_BASE_URL}/api/admin/photos`,
          {
            method: isEdit ? 'PUT' : 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              url: photoForm.url.trim(),
              title: photoForm.title.trim(),
              sortOrder: photoForm.sortOrder
                  ? Number(photoForm.sortOrder)
                  : undefined,
            }),
          }
      );

      if (res.status === 401 || res.status === 403) {
        handleLogout();
        return;
      }

      if (!res.ok) {
        throw new Error();
      }

      const saved: Photo = await res.json();

      setPhotos((prev) => {
        const next = isEdit
            ? prev.map((p) => (p.id === saved.id ? saved : p))
            : [...prev, saved];
        return [...next].sort((a, b) => a.sortOrder - b.sortOrder);
      });

      setPhotoForm(null);
    } catch {
      setPhotosError(
          'Não foi possível salvar a foto. Confira o link e tente de novo.'
      );
    } finally {
      setSavingPhoto(false);
    }
  };

  const togglePhotoActive = async (photo: Photo) => {
    if (!token) return;

    setPhotoBusyId(photo.id);

    try {
      const res = await fetch(
          `${API_BASE_URL}/api/admin/photos/${photo.id}/status?active=${!photo.active}`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
      );

      if (res.status === 401 || res.status === 403) {
        handleLogout();
        return;
      }

      if (!res.ok) {
        throw new Error();
      }

      const updated: Photo = await res.json();

      setPhotos((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
      );
    } catch {
      setPhotosError('Não foi possível alterar o status dessa foto.');
    } finally {
      setPhotoBusyId(null);
    }
  };

  const deletePhoto = async (photo: Photo) => {
    if (!token) return;

    setPhotoBusyId(photo.id);

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/photos/${photo.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        handleLogout();
        return;
      }

      if (!res.ok) {
        throw new Error();
      }

      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    } catch {
      setPhotosError('Não foi possível remover essa foto.');
    } finally {
      setPhotoBusyId(null);
    }
  };

  // =========================
  // SITE (textos e contato)
  // =========================

  const loadSiteSettings = useCallback(async () => {
    if (!token) return;

    setSiteLoading(true);
    setSiteError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/site-settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        handleLogout();
        return;
      }

      if (!res.ok) {
        throw new Error();
      }

      const data = await res.json();

      setSiteForm({
        aboutText: data.aboutText ?? '',
        address: data.address ?? '',
        whatsapp: data.whatsapp ?? '',
        openingHoursText: data.openingHoursText ?? '',
        instagramUrl: data.instagramUrl ?? '',
        logoUrl: data.logoUrl ?? '',
        heroEyebrow: data.heroEyebrow ?? '',
        heroTitle: data.heroTitle ?? '',
        heroSubtitle: data.heroSubtitle ?? '',
        heroTrustItems: parseJsonArray<TrustItem>(data.heroTrustItemsJson, []),
        benefitsItems: parseJsonArray<BenefitItem>(data.benefitsItemsJson, []),
        indicationsSectionTitle: data.indicationsSectionTitle ?? '',
        indicationsItems: parseJsonArray<IndicationItem>(data.indicationsItemsJson, []),
        aboutBadgeText: data.aboutBadgeText ?? '',
        aboutPhotoUrl: data.aboutPhotoUrl ?? '',
        treatmentsEyebrow: data.treatmentsEyebrow ?? '',
        treatmentsSectionTitle: data.treatmentsSectionTitle ?? '',
        treatmentsSectionSubtitle: data.treatmentsSectionSubtitle ?? '',
        locationSectionTitle: data.locationSectionTitle ?? '',
        locationSectionSubtitle: data.locationSectionSubtitle ?? '',
        bookingSectionTitle: data.bookingSectionTitle ?? '',
        bookingSectionSubtitle: data.bookingSectionSubtitle ?? '',
        testimonialsSectionTitle: data.testimonialsSectionTitle ?? '',
        testimonialsSectionSubtitle: data.testimonialsSectionSubtitle ?? '',
        faqSectionTitle: data.faqSectionTitle ?? '',
        faqSectionSubtitle: data.faqSectionSubtitle ?? '',
        faqItems: parseJsonArray<FaqItem>(data.faqItemsJson, []),
        footerTagline: data.footerTagline ?? '',
        footerContactEmail: data.footerContactEmail ?? '',
        footerCopyrightText: data.footerCopyrightText ?? '',
      });
    } catch {
      setSiteError('Não foi possível carregar as informações do site.');
    } finally {
      setSiteLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (tab === 'site') {
      loadSiteSettings();
    }
  }, [tab, loadSiteSettings]);

  const saveSiteSettings = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token || !siteForm) return;

    setSavingSite(true);
    setSiteError(null);
    setSiteSaved(false);

    try {
      const payload = {
        aboutText: siteForm.aboutText,
        address: siteForm.address,
        whatsapp: siteForm.whatsapp,
        openingHoursText: siteForm.openingHoursText,
        instagramUrl: siteForm.instagramUrl,
        logoUrl: siteForm.logoUrl,
        heroEyebrow: siteForm.heroEyebrow,
        heroTitle: siteForm.heroTitle,
        heroSubtitle: siteForm.heroSubtitle,
        heroTrustItemsJson: stringifyOrNull(siteForm.heroTrustItems),
        benefitsItemsJson: stringifyOrNull(siteForm.benefitsItems),
        indicationsSectionTitle: siteForm.indicationsSectionTitle,
        indicationsItemsJson: stringifyOrNull(siteForm.indicationsItems),
        aboutBadgeText: siteForm.aboutBadgeText,
        aboutPhotoUrl: siteForm.aboutPhotoUrl,
        treatmentsEyebrow: siteForm.treatmentsEyebrow,
        treatmentsSectionTitle: siteForm.treatmentsSectionTitle,
        treatmentsSectionSubtitle: siteForm.treatmentsSectionSubtitle,
        locationSectionTitle: siteForm.locationSectionTitle,
        locationSectionSubtitle: siteForm.locationSectionSubtitle,
        bookingSectionTitle: siteForm.bookingSectionTitle,
        bookingSectionSubtitle: siteForm.bookingSectionSubtitle,
        testimonialsSectionTitle: siteForm.testimonialsSectionTitle,
        testimonialsSectionSubtitle: siteForm.testimonialsSectionSubtitle,
        faqSectionTitle: siteForm.faqSectionTitle,
        faqSectionSubtitle: siteForm.faqSectionSubtitle,
        faqItemsJson: stringifyOrNull(siteForm.faqItems),
        footerTagline: siteForm.footerTagline,
        footerContactEmail: siteForm.footerContactEmail,
        footerCopyrightText: siteForm.footerCopyrightText,
      };

      const res = await fetch(`${API_BASE_URL}/api/admin/site-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401 || res.status === 403) {
        handleLogout();
        return;
      }

      if (!res.ok) {
        throw new Error();
      }

      const data = await res.json();

      setSiteForm({
        aboutText: data.aboutText ?? '',
        address: data.address ?? '',
        whatsapp: data.whatsapp ?? '',
        openingHoursText: data.openingHoursText ?? '',
        instagramUrl: data.instagramUrl ?? '',
        logoUrl: data.logoUrl ?? '',
        heroEyebrow: data.heroEyebrow ?? '',
        heroTitle: data.heroTitle ?? '',
        heroSubtitle: data.heroSubtitle ?? '',
        heroTrustItems: parseJsonArray<TrustItem>(data.heroTrustItemsJson, []),
        benefitsItems: parseJsonArray<BenefitItem>(data.benefitsItemsJson, []),
        indicationsSectionTitle: data.indicationsSectionTitle ?? '',
        indicationsItems: parseJsonArray<IndicationItem>(data.indicationsItemsJson, []),
        aboutBadgeText: data.aboutBadgeText ?? '',
        aboutPhotoUrl: data.aboutPhotoUrl ?? '',
        treatmentsEyebrow: data.treatmentsEyebrow ?? '',
        treatmentsSectionTitle: data.treatmentsSectionTitle ?? '',
        treatmentsSectionSubtitle: data.treatmentsSectionSubtitle ?? '',
        locationSectionTitle: data.locationSectionTitle ?? '',
        locationSectionSubtitle: data.locationSectionSubtitle ?? '',
        bookingSectionTitle: data.bookingSectionTitle ?? '',
        bookingSectionSubtitle: data.bookingSectionSubtitle ?? '',
        testimonialsSectionTitle: data.testimonialsSectionTitle ?? '',
        testimonialsSectionSubtitle: data.testimonialsSectionSubtitle ?? '',
        faqSectionTitle: data.faqSectionTitle ?? '',
        faqSectionSubtitle: data.faqSectionSubtitle ?? '',
        faqItems: parseJsonArray<FaqItem>(data.faqItemsJson, []),
        footerTagline: data.footerTagline ?? '',
        footerContactEmail: data.footerContactEmail ?? '',
        footerCopyrightText: data.footerCopyrightText ?? '',
      });
      setSiteSaved(true);
      setTimeout(() => setSiteSaved(false), 3000);
    } catch {
      setSiteError('Não foi possível salvar as alterações. Tente novamente.');
    } finally {
      setSavingSite(false);
    }
  };

  // Helpers genéricos para editar as listas (selos, benefícios, indicações, FAQ)
  // dentro do formulário do site sem repetir a mesma lógica de add/editar/remover
  // quatro vezes.
  const updateListItem = <K extends keyof SiteSettingsForm>(
      key: K,
      index: number,
      patch: Partial<SiteSettingsForm[K] extends (infer U)[] ? U : never>
  ) => {
    if (!siteForm) return;
    const list = siteForm[key] as unknown as any[];
    const updated = list.map((item, i) => (i === index ? { ...item, ...patch } : item));
    setSiteForm({ ...siteForm, [key]: updated });
  };

  const addListItem = <K extends keyof SiteSettingsForm>(key: K, emptyItem: any) => {
    if (!siteForm) return;
    const list = siteForm[key] as unknown as any[];
    setSiteForm({ ...siteForm, [key]: [...list, emptyItem] });
  };

  const removeListItem = <K extends keyof SiteSettingsForm>(key: K, index: number) => {
    if (!siteForm) return;
    const list = siteForm[key] as unknown as any[];
    setSiteForm({ ...siteForm, [key]: list.filter((_, i) => i !== index) });
  };

  // =========================
  // MODO EDIÇÃO — agora o admin renderiza o site de verdade (LandingPage)
  // e abre uma gaveta lateral com os formulários já existentes de cada aba.
  // =========================
  const [editMode, setEditMode] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Altura real da barra do admin (medida, não fixa — ela quebra em 2 linhas
  // em telas estreitas). Precisa estar aqui em cima, ANTES do `if (!token)`
  // abaixo: hooks não podem ficar depois de um return condicional, senão o
  // número de hooks muda entre renders e o React quebra (erro #310).
  const ADMIN_BAR_HEIGHT = 56;
  const adminBarRef = useRef<HTMLElement>(null);
  const [adminBarHeight, setAdminBarHeight] = useState(ADMIN_BAR_HEIGHT);

  useLayoutEffect(() => {
    const measure = () => {
      if (adminBarRef.current) {
        const measured = adminBarRef.current.getBoundingClientRect().height;
        if (measured > 0) setAdminBarHeight(measured);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [isMobile, editMode]);

  const sectionToTab: Record<string, Tab> = {
    hero: 'site',
    photos: 'fotos',
    benefits: 'site',
    indications: 'site',
    about: 'site',
    treatments: 'tratamentos',
    location: 'site',
    testimonials: 'depoimentos',
    faq: 'site',
    footer: 'site',
  };

  const openDrawer = (targetTab: Tab) => {
    setTab(targetTab);
    setDrawerOpen(true);
    setEditMode(true);
  };

  const closeDrawer = () => setDrawerOpen(false);

  const handleEditSection = (section: string) => {
    openDrawer(sectionToTab[section] ?? 'site');
  };

  if (!token) {
    return null;
  }

  const tabs: {
    key: Tab;
    label: string;
  }[] = [
    {
      key: 'agenda',
      label: 'Agenda',
    },
    {
      key: 'tratamentos',
      label: 'Tratamentos',
    },
    {
      key: 'fotos',
      label: 'Fotos',
    },
    {
      key: 'site',
      label: 'Site',
    },
    {
      key: 'depoimentos',
      label: 'Depoimentos',
    },
  ];

  return (
      <div style={styles.pageBackground}>
        {/* Barra fixa do admin, por cima do site real */}
        <header ref={adminBarRef} style={{ ...styles.adminBar, height: 'auto', minHeight: ADMIN_BAR_HEIGHT }}>
          <div
              style={{
                ...styles.adminBarContent,
                ...(isMobile ? { flexWrap: 'wrap' as const, height: 'auto', padding: '10px 16px', rowGap: 8 } : {}),
              }}
          >
            <div style={styles.adminBarBrand}>
              <img src="/logo.jpg.jpeg" alt="Logo Maria Yasmim Lopes" style={styles.adminBarLogo} />
              <span style={styles.logoTextBlock}>
                <span style={styles.adminBarTitle}>Maria Yasmim Lopes</span>
                {/* Some no modo estreito: era o segundo maior motivo do wrap
                    forçar o botão "Sair" pra fora da tela. */}
                {!isMobile && (
                    <span style={styles.adminBarSubtitle}>Painel Administrativo</span>
                )}
              </span>
            </div>

            <div
                style={{
                  ...styles.adminBarActions,
                  ...(isMobile ? { flexWrap: 'wrap' as const, width: '100%', justifyContent: 'flex-start' as const } : {}),
                }}
            >
              <button
                  onClick={() => setEditMode((v) => !v)}
                  title="Editar site"
                  style={{
                    ...styles.adminBarButton,
                    ...(editMode ? styles.adminBarButtonActive : {}),
                  }}
              >
                {isMobile
                    ? (editMode ? '✓' : '✏️')
                    : (editMode ? '✓ Editando' : '✏️ Editar site')}
              </button>
              <button onClick={() => openDrawer('agenda')} title="Agenda" style={styles.adminBarButton}>
                {isMobile ? '📅' : '📅 Agenda'}
              </button>
              <button onClick={handleLogout} title="Sair" style={styles.logoutButton}>
                {isMobile ? '⏻' : 'Sair'}
              </button>
            </div>
          </div>
        </header>

        {/* O site de verdade, exatamente como a cliente vê — com lápis de edição quando o modo edição está ligado.
            topOffset é medido de verdade (ref abaixo), porque em telas estreitas a barra quebra em 2 linhas
            e a altura fixa de ADMIN_BAR_HEIGHT deixaria de bater com a altura real. */}
        <LandingPage editable={editMode} onEditSection={handleEditSection} topOffset={adminBarHeight} />

        {/* Painel lateral: abre ao clicar em um lápis de alguma seção ou no botão "Agenda" */}
        {drawerOpen && <div style={styles.drawerOverlay} onClick={closeDrawer} />}
        <aside
            style={{
              ...styles.drawer,
              transform: drawerOpen ? 'translateX(0)' : 'translateX(100%)',
            }}
        >
          <div style={styles.drawerHeader}>
            <strong>Editar site</strong>
            <button onClick={closeDrawer} style={styles.drawerCloseButton} aria-label="Fechar">×</button>
          </div>
          <div style={styles.drawerBody}>
            <div style={{ ...styles.wrapper, padding: '20px 20px 40px', maxWidth: '100%' }}>
              <nav style={styles.tabBar}>
                {tabs.map((item) => (
                    <button
                        key={item.key}
                        onClick={() => setTab(item.key)}
                        style={{
                          ...styles.tabButton,
                          ...(tab === item.key
                              ? styles.tabButtonActive
                              : {}),
                        }}
                    >
                      {item.label}
                    </button>
                ))}
              </nav>

              {/* =========================
          AGENDA
      ========================= */}

              {tab === 'agenda' && (
                  <section>
                    <div style={styles.controls}>
                      <label style={styles.label}>
                        Data
                      </label>

                      <input
                          type="date"
                          value={date}
                          onChange={(event) =>
                              setDate(event.target.value)
                          }
                          style={styles.dateInput}
                      />
                    </div>

                    {error && (
                        <div style={styles.errorBox}>
                          {error}
                        </div>
                    )}

                    {loading ? (
                        <p style={styles.info}>
                          Carregando...
                        </p>
                    ) : appointments.length === 0 ? (
                        <p style={styles.info}>
                          Nenhum agendamento para essa data.
                        </p>
                    ) : (
                        <div
                            style={{
                              ...styles.list,
                              ...(isMobile
                                  ? {}
                                  : styles.listGrid),
                            }}
                        >
                          {appointments.map((appointment) => (
                              <div
                                  key={appointment.id}
                                  style={styles.card}
                              >
                                <div style={styles.cardTop}>
                                  <strong style={styles.time}>
                                    {formatTime(
                                        appointment.scheduledAt
                                    )}
                                  </strong>

                                  <span
                                      style={{
                                        ...styles.badge,
                                        background:
                                            statusColor[
                                                appointment.status
                                                ],
                                      }}
                                  >
                      {
                        statusLabel[
                            appointment.status
                            ]
                      }
                    </span>
                                </div>

                                <p style={styles.clientName}>
                                  {appointment.clientName}
                                </p>

                                <p style={styles.detail}>
                                  {appointment.treatmentName}
                                </p>

                                <a
                                    href={`https://wa.me/${appointment.clientWhatsapp.replace(
                                        /\D/g,
                                        ''
                                    )}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={styles.whatsapp}
                                >
                                  WhatsApp:{' '}
                                  {appointment.clientWhatsapp}
                                </a>

                                {appointment.notes && (
                                    <p style={styles.notes}>
                                      Obs: {appointment.notes}
                                    </p>
                                )}

                                <div style={styles.actions}>
                                  {(
                                      [
                                        'CONFIRMED',
                                        'COMPLETED',
                                        'CANCELLED',
                                      ] as const
                                  )
                                      .filter(
                                          (status) =>
                                              status !==
                                              appointment.status
                                      )
                                      .map((status) => (
                                          <button
                                              key={status}
                                              onClick={() =>
                                                  updateStatus(
                                                      appointment.id,
                                                      status
                                                  )
                                              }
                                              disabled={
                                                  updatingId ===
                                                  appointment.id
                                              }
                                              style={
                                                styles.actionButton
                                              }
                                          >
                                            {updatingId ===
                                            appointment.id
                                                ? '...'
                                                : statusLabel[status]}
                                          </button>
                                      ))}
                                </div>
                              </div>
                          ))}
                        </div>
                    )}
                  </section>
              )}

              {/* =========================
          TRATAMENTOS
      ========================= */}

              {tab === 'tratamentos' && (
                  <section>
                    {treatmentsError && (
                        <div style={styles.errorBox}>
                          {treatmentsError}
                        </div>
                    )}

                    {!treatmentForm && (
                        <button
                            onClick={openNewTreatmentForm}
                            style={styles.primaryButton}
                        >
                          + Novo tratamento
                        </button>
                    )}

                    {treatmentForm && (
                        <form
                            onSubmit={saveTreatment}
                            style={styles.form}
                        >
                          <h3 style={styles.formTitle}>
                            {treatmentForm.id
                                ? 'Editar tratamento'
                                : 'Novo tratamento'}
                          </h3>

                          <label style={styles.label}>
                            Nome
                          </label>

                          <input
                              type="text"
                              value={treatmentForm.name}
                              onChange={(event) =>
                                  setTreatmentForm({
                                    ...treatmentForm,
                                    name: event.target.value,
                                  })
                              }
                              style={styles.input}
                              required
                          />

                          <label style={styles.label}>
                            Descrição
                          </label>

                          <textarea
                              value={
                                treatmentForm.description
                              }
                              onChange={(event) =>
                                  setTreatmentForm({
                                    ...treatmentForm,
                                    description:
                                    event.target.value,
                                  })
                              }
                              style={{
                                ...styles.input,
                                minHeight: 80,
                                fontFamily: 'inherit',
                                resize: 'vertical',
                              }}
                          />

                          <div
                              style={{
                                display: 'flex',
                                gap: 12,
                                flexWrap: 'wrap',
                              }}
                          >
                            <div
                                style={{
                                  flex: '1 1 140px',
                                }}
                            >
                              <label style={styles.label}>
                                Preço (R$)
                              </label>

                              <input
                                  type="text"
                                  inputMode="decimal"
                                  value={
                                    treatmentForm.price
                                  }
                                  onChange={(event) =>
                                      setTreatmentForm({
                                        ...treatmentForm,
                                        price:
                                        event.target.value,
                                      })
                                  }
                                  style={styles.input}
                                  placeholder="120.00"
                                  required
                              />
                            </div>

                            <div
                                style={{
                                  flex: '1 1 140px',
                                }}
                            >
                              <label style={styles.label}>
                                Duração (min)
                              </label>

                              <input
                                  type="number"
                                  value={
                                    treatmentForm.durationMinutes
                                  }
                                  onChange={(event) =>
                                      setTreatmentForm({
                                        ...treatmentForm,
                                        durationMinutes:
                                        event.target.value,
                                      })
                                  }
                                  style={styles.input}
                                  placeholder="60"
                                  required
                              />
                            </div>
                          </div>

                          <div
                              style={{
                                display: 'flex',
                                gap: 10,
                                marginTop: 8,
                                flexWrap: 'wrap',
                              }}
                          >
                            <button
                                type="submit"
                                disabled={savingTreatment}
                                style={styles.primaryButton}
                            >
                              {savingTreatment
                                  ? 'Salvando...'
                                  : 'Salvar'}
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setTreatmentForm(null)
                                }
                                style={
                                  styles.secondaryButton
                                }
                            >
                              Cancelar
                            </button>
                          </div>
                        </form>
                    )}

                    {treatmentsLoading ? (
                        <p style={styles.info}>
                          Carregando...
                        </p>
                    ) : treatments.length === 0 ? (
                        <p style={styles.info}>
                          Nenhum tratamento cadastrado ainda.
                        </p>
                    ) : (
                        <div
                            style={{
                              ...styles.list,
                              ...(isMobile
                                  ? {}
                                  : styles.listGrid),
                              marginTop: 20,
                            }}
                        >
                          {treatments.map(
                              (treatment) => (
                                  <div
                                      key={treatment.id}
                                      style={styles.card}
                                  >
                                    <div style={styles.cardTop}>
                                      <strong style={styles.time}>
                                        {treatment.name}
                                      </strong>

                                      <span
                                          style={{
                                            ...styles.badge,
                                            background:
                                                treatment.active
                                                    ? '#2E7D32'
                                                    : '#8A8A8A',
                                          }}
                                      >
                        {treatment.active
                            ? 'Ativo'
                            : 'Inativo'}
                      </span>
                                    </div>

                                    {!!treatment.description && (
                                        <p style={styles.detail}>
                                          {
                                            treatment.description
                                          }
                                        </p>
                                    )}

                                    <p style={styles.detail}>
                                      {formatPrice(
                                          treatment.price
                                      )}{' '}
                                      ·{' '}
                                      {
                                        treatment.durationMinutes
                                      }{' '}
                                      min
                                    </p>

                                    <div style={styles.actions}>
                                      <button
                                          onClick={() =>
                                              openEditTreatmentForm(
                                                  treatment
                                              )
                                          }
                                          style={
                                            styles.actionButton
                                          }
                                      >
                                        Editar
                                      </button>

                                      <button
                                          onClick={() =>
                                              toggleTreatmentActive(
                                                  treatment
                                              )
                                          }
                                          disabled={
                                              togglingId ===
                                              treatment.id
                                          }
                                          style={{
                                            ...styles.actionButton,
                                            borderColor:
                                                treatment.active
                                                    ? '#B3261E'
                                                    : '#2E7D32',
                                            color:
                                                treatment.active
                                                    ? '#B3261E'
                                                    : '#2E7D32',
                                          }}
                                      >
                                        {togglingId ===
                                        treatment.id
                                            ? '...'
                                            : treatment.active
                                                ? 'Desativar'
                                                : 'Ativar'}
                                      </button>

                                      {!treatment.active && (
                                          <button
                                              onClick={() =>
                                                  deleteTreatment(
                                                      treatment
                                                  )
                                              }
                                              disabled={
                                                  deletingId ===
                                                  treatment.id
                                              }
                                              style={{
                                                ...styles.actionButton,
                                                borderColor: '#B3261E',
                                                color: '#B3261E',
                                                backgroundColor: 'rgba(179,38,30,0.06)',
                                              }}
                                          >
                                            {deletingId === treatment.id
                                                ? '...'
                                                : 'Excluir'}
                                          </button>
                                      )}
                                    </div>
                                  </div>
                              )
                          )}
                        </div>
                    )}
                  </section>
              )}

              {/* =========================
          FOTOS
      ========================= */}

              {tab === 'fotos' && (
                  <section>
                    {photosError && (
                        <div style={styles.errorBox}>{photosError}</div>
                    )}

                    <p style={styles.helperText}>
                      As fotos ativas aparecem no carrossel da página inicial, na
                      ordem definida abaixo. Cole o link de uma imagem já publicada
                      na internet (por exemplo, um link do Google Drive, Imgur ou
                      Instagram) — ainda não é possível enviar o arquivo direto do
                      computador ou celular por aqui.
                    </p>

                    {!photoForm && (
                        <button
                            onClick={openNewPhotoForm}
                            style={styles.primaryButton}
                        >
                          + Nova foto
                        </button>
                    )}

                    {photoForm && (
                        <form onSubmit={savePhoto} style={styles.form}>
                          <h3 style={styles.formTitle}>
                            {photoForm.id ? 'Editar foto' : 'Nova foto'}
                          </h3>

                          <label style={styles.label}>Link da imagem</label>
                          <input
                              type="text"
                              value={photoForm.url}
                              onChange={(event) =>
                                  setPhotoForm({ ...photoForm, url: event.target.value })
                              }
                              style={styles.input}
                              placeholder="https://..."
                              required
                          />

                          {photoForm.url.trim() && (
                              <img
                                  src={photoForm.url}
                                  alt="Pré-visualização"
                                  style={styles.photoPreview}
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                                  }}
                              />
                          )}

                          <label style={styles.label}>Título / legenda (opcional)</label>
                          <input
                              type="text"
                              value={photoForm.title}
                              onChange={(event) =>
                                  setPhotoForm({ ...photoForm, title: event.target.value })
                              }
                              style={styles.input}
                              placeholder="Ex: Limpeza de Pele Profunda"
                          />

                          <label style={styles.label}>Ordem de exibição</label>
                          <input
                              type="number"
                              value={photoForm.sortOrder}
                              onChange={(event) =>
                                  setPhotoForm({
                                    ...photoForm,
                                    sortOrder: event.target.value,
                                  })
                              }
                              style={styles.input}
                              placeholder="0"
                          />

                          <div
                              style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}
                          >
                            <button
                                type="submit"
                                disabled={savingPhoto}
                                style={styles.primaryButton}
                            >
                              {savingPhoto ? 'Salvando...' : 'Salvar'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setPhotoForm(null)}
                                style={styles.secondaryButton}
                            >
                              Cancelar
                            </button>
                          </div>
                        </form>
                    )}

                    {photosLoading ? (
                        <p style={styles.info}>Carregando...</p>
                    ) : photos.length === 0 ? (
                        <p style={styles.info}>Nenhuma foto cadastrada ainda.</p>
                    ) : (
                        <div
                            style={{
                              ...styles.photoGrid,
                              marginTop: 20,
                            }}
                        >
                          {photos.map((photo) => (
                              <div key={photo.id} style={styles.card}>
                                <img
                                    src={photo.url}
                                    alt={photo.title ?? ''}
                                    style={styles.photoThumb}
                                />

                                <div style={styles.cardTop}>
                                  <strong style={styles.clientName}>
                                    {photo.title || '(sem título)'}
                                  </strong>

                                  <span
                                      style={{
                                        ...styles.badge,
                                        background: photo.active ? '#2E7D32' : '#8A8A8A',
                                      }}
                                  >
                        {photo.active ? 'Ativa' : 'Inativa'}
                      </span>
                                </div>

                                <p style={styles.detail}>Ordem: {photo.sortOrder}</p>

                                <div style={styles.actions}>
                                  <button
                                      onClick={() => openEditPhotoForm(photo)}
                                      style={styles.actionButton}
                                  >
                                    Editar
                                  </button>

                                  <button
                                      onClick={() => togglePhotoActive(photo)}
                                      disabled={photoBusyId === photo.id}
                                      style={{
                                        ...styles.actionButton,
                                        borderColor: photo.active ? '#B3261E' : '#2E7D32',
                                        color: photo.active ? '#B3261E' : '#2E7D32',
                                      }}
                                  >
                                    {photoBusyId === photo.id
                                        ? '...'
                                        : photo.active
                                            ? 'Desativar'
                                            : 'Ativar'}
                                  </button>

                                  <button
                                      onClick={() => deletePhoto(photo)}
                                      disabled={photoBusyId === photo.id}
                                      style={{
                                        ...styles.actionButton,
                                        borderColor: '#B3261E',
                                        color: '#B3261E',
                                      }}
                                  >
                                    Excluir
                                  </button>
                                </div>
                              </div>
                          ))}
                        </div>
                    )}
                  </section>
              )}

              {/* =========================
          SITE (textos e contato)
      ========================= */}

              {tab === 'site' && (
                  <section>
                    {siteError && <div style={styles.errorBox}>{siteError}</div>}

                    {siteLoading || !siteForm ? (
                        <p style={styles.info}>Carregando...</p>
                    ) : (
                        <form onSubmit={saveSiteSettings} style={styles.form}>

                          <p style={styles.helperText}>
                            Tudo que aparece na página do site (textos, selos, cards, perguntas
                            frequentes, rodapé) pode ser editado aqui. Deixe um campo em branco
                            para usar o texto padrão. Imagens são links (cole o endereço de uma
                            imagem já publicada na internet).
                          </p>

                          {/* --- Cabeçalho --- */}
                          <h3 style={styles.formTitle}>Cabeçalho</h3>

                          <label style={styles.label}>Link do logo</label>
                          <input
                              type="text"
                              value={siteForm.logoUrl}
                              onChange={(event) => setSiteForm({ ...siteForm, logoUrl: event.target.value })}
                              style={styles.input}
                              placeholder="/logo.jpg.jpeg"
                          />

                          {/* --- Hero (topo do site) --- */}
                          <h3 style={styles.formTitle}>Topo do site (Hero)</h3>

                          <label style={styles.label}>Frase de destaque (acima do título)</label>
                          <input
                              type="text"
                              value={siteForm.heroEyebrow}
                              onChange={(event) => setSiteForm({ ...siteForm, heroEyebrow: event.target.value })}
                              style={styles.input}
                              placeholder="Realce sua beleza natural"
                          />

                          <label style={styles.label}>Título principal</label>
                          <input
                              type="text"
                              value={siteForm.heroTitle}
                              onChange={(event) => setSiteForm({ ...siteForm, heroTitle: event.target.value })}
                              style={styles.input}
                              placeholder="Sua melhor versão começa aqui"
                          />

                          <label style={styles.label}>Subtítulo</label>
                          <textarea
                              value={siteForm.heroSubtitle}
                              onChange={(event) => setSiteForm({ ...siteForm, heroSubtitle: event.target.value })}
                              style={{ ...styles.input, minHeight: 70, fontFamily: 'inherit', resize: 'vertical' }}
                          />

                          <label style={styles.label}>Selos de confiança (ícone + texto)</label>
                          <div style={styles.list}>
                            {siteForm.heroTrustItems.map((item, index) => (
                                <div key={index} style={styles.listItemRow}>
                                  <input
                                      type="text"
                                      value={item.icon}
                                      onChange={(e) => updateListItem('heroTrustItems', index, { icon: e.target.value })}
                                      style={styles.iconInput}
                                      placeholder="🛡️"
                                  />
                                  <input
                                      type="text"
                                      value={item.text}
                                      onChange={(e) => updateListItem('heroTrustItems', index, { text: e.target.value })}
                                      style={{ ...styles.input, marginBottom: 0, flex: 1 }}
                                      placeholder="Procedimentos seguros"
                                  />
                                  <button
                                      type="button"
                                      onClick={() => removeListItem('heroTrustItems', index)}
                                      style={styles.removeButton}
                                  >
                                    Remover
                                  </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addListItem('heroTrustItems', { icon: '⭐', text: '' })}
                                style={styles.secondaryButton}
                            >
                              + Adicionar selo
                            </button>
                          </div>

                          {/* --- Faixa de benefícios --- */}
                          <h3 style={styles.formTitle}>Faixa de benefícios</h3>
                          <p style={styles.helperText}>Aparece como uma faixa escura logo abaixo do topo.</p>

                          <div style={styles.list}>
                            {siteForm.benefitsItems.map((item, index) => (
                                <div key={index} style={styles.listItemRow}>
                                  <input
                                      type="text"
                                      value={item.icon}
                                      onChange={(e) => updateListItem('benefitsItems', index, { icon: e.target.value })}
                                      style={styles.iconInput}
                                      placeholder="⭐"
                                  />
                                  <input
                                      type="text"
                                      value={item.text}
                                      onChange={(e) => updateListItem('benefitsItems', index, { text: e.target.value })}
                                      style={{ ...styles.input, marginBottom: 0, flex: 1 }}
                                      placeholder="Atendimento Exclusivo e Personalizado"
                                  />
                                  <button
                                      type="button"
                                      onClick={() => removeListItem('benefitsItems', index)}
                                      style={styles.removeButton}
                                  >
                                    Remover
                                  </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addListItem('benefitsItems', { icon: '⭐', text: '' })}
                                style={styles.secondaryButton}
                            >
                              + Adicionar item
                            </button>
                          </div>

                          {/* --- Indicações --- */}
                          <h3 style={styles.formTitle}>Seção "Indicações" (cards de quem se beneficia)</h3>

                          <label style={styles.label}>Título da seção</label>
                          <input
                              type="text"
                              value={siteForm.indicationsSectionTitle}
                              onChange={(event) => setSiteForm({ ...siteForm, indicationsSectionTitle: event.target.value })}
                              style={styles.input}
                              placeholder="Nossos tratamentos são ideais para quem busca:"
                          />

                          <label style={styles.label}>Cards (ícone + título + texto)</label>
                          <div style={styles.list}>
                            {siteForm.indicationsItems.map((item, index) => (
                                <div key={index} style={styles.listItemBox}>
                                  <div style={styles.listItemRow}>
                                    <input
                                        type="text"
                                        value={item.icon}
                                        onChange={(e) => updateListItem('indicationsItems', index, { icon: e.target.value })}
                                        style={styles.iconInput}
                                        placeholder="✨"
                                    />
                                    <input
                                        type="text"
                                        value={item.title}
                                        onChange={(e) => updateListItem('indicationsItems', index, { title: e.target.value })}
                                        style={{ ...styles.input, marginBottom: 0, flex: 1 }}
                                        placeholder="Título do card"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeListItem('indicationsItems', index)}
                                        style={styles.removeButton}
                                    >
                                      Remover
                                    </button>
                                  </div>
                                  <textarea
                                      value={item.text}
                                      onChange={(e) => updateListItem('indicationsItems', index, { text: e.target.value })}
                                      style={{ ...styles.input, minHeight: 55, marginTop: 8, marginBottom: 0, fontFamily: 'inherit', resize: 'vertical' }}
                                      placeholder="Descrição do card"
                                  />
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addListItem('indicationsItems', { icon: '✨', title: '', text: '' })}
                                style={styles.secondaryButton}
                            >
                              + Adicionar card
                            </button>
                          </div>

                          {/* --- Sobre --- */}
                          <h3 style={styles.formTitle}>Sobre</h3>

                          <label style={styles.label}>Selo acima do nome (ex: "Sua Esteticista")</label>
                          <input
                              type="text"
                              value={siteForm.aboutBadgeText}
                              onChange={(event) => setSiteForm({ ...siteForm, aboutBadgeText: event.target.value })}
                              style={styles.input}
                          />

                          <label style={styles.label}>Link da foto da seção "Sobre"</label>
                          <input
                              type="text"
                              value={siteForm.aboutPhotoUrl}
                              onChange={(event) => setSiteForm({ ...siteForm, aboutPhotoUrl: event.target.value })}
                              style={styles.input}
                              placeholder="https://..."
                          />
                          {siteForm.aboutPhotoUrl.trim() && (
                              <img
                                  src={siteForm.aboutPhotoUrl}
                                  alt="Pré-visualização"
                                  style={styles.photoPreview}
                                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                              />
                          )}

                          <label style={styles.label}>Texto "Sobre" (um parágrafo por linha)</label>
                          <textarea
                              value={siteForm.aboutText}
                              onChange={(event) =>
                                  setSiteForm({ ...siteForm, aboutText: event.target.value })
                              }
                              style={{ ...styles.input, minHeight: 140, fontFamily: 'inherit', resize: 'vertical' }}
                          />

                          {/* --- Tratamentos (cabeçalho da seção) --- */}
                          <h3 style={styles.formTitle}>Seção "Tratamentos" (cabeçalho)</h3>
                          <p style={styles.helperText}>
                            Os tratamentos em si (nome, preço, descrição) são editados na aba
                            "Tratamentos".
                          </p>

                          <label style={styles.label}>Frase de destaque</label>
                          <input
                              type="text"
                              value={siteForm.treatmentsEyebrow}
                              onChange={(event) => setSiteForm({ ...siteForm, treatmentsEyebrow: event.target.value })}
                              style={styles.input}
                              placeholder="Nossos tratamentos"
                          />

                          <label style={styles.label}>Título da seção</label>
                          <input
                              type="text"
                              value={siteForm.treatmentsSectionTitle}
                              onChange={(event) => setSiteForm({ ...siteForm, treatmentsSectionTitle: event.target.value })}
                              style={styles.input}
                              placeholder="Cuidados para realçar sua beleza"
                          />

                          <label style={styles.label}>Subtítulo da seção</label>
                          <input
                              type="text"
                              value={siteForm.treatmentsSectionSubtitle}
                              onChange={(event) => setSiteForm({ ...siteForm, treatmentsSectionSubtitle: event.target.value })}
                              style={styles.input}
                              placeholder="Procedimentos faciais personalizados para suas necessidades"
                          />

                          {/* --- Localização --- */}
                          <h3 style={styles.formTitle}>Seção "Onde Estamos"</h3>

                          <label style={styles.label}>Título da seção</label>
                          <input
                              type="text"
                              value={siteForm.locationSectionTitle}
                              onChange={(event) => setSiteForm({ ...siteForm, locationSectionTitle: event.target.value })}
                              style={styles.input}
                          />

                          <label style={styles.label}>Subtítulo da seção</label>
                          <input
                              type="text"
                              value={siteForm.locationSectionSubtitle}
                              onChange={(event) => setSiteForm({ ...siteForm, locationSectionSubtitle: event.target.value })}
                              style={styles.input}
                          />

                          <label style={styles.label}>Endereço (uma linha por parte)</label>
                          <textarea
                              value={siteForm.address}
                              onChange={(event) =>
                                  setSiteForm({ ...siteForm, address: event.target.value })
                              }
                              style={{ ...styles.input, minHeight: 80, fontFamily: 'inherit', resize: 'vertical' }}
                              placeholder={'Rua Exemplo, 123\nBairro, Cidade - UF\nCEP: 00000-000'}
                          />

                          <label style={styles.label}>Horário de atendimento</label>
                          <input
                              type="text"
                              value={siteForm.openingHoursText}
                              onChange={(event) =>
                                  setSiteForm({
                                    ...siteForm,
                                    openingHoursText: event.target.value,
                                  })
                              }
                              style={styles.input}
                          />

                          {/* --- Agendamento --- */}
                          <h3 style={styles.formTitle}>Seção "Agendamento" (cabeçalho)</h3>

                          <label style={styles.label}>Título da seção</label>
                          <input
                              type="text"
                              value={siteForm.bookingSectionTitle}
                              onChange={(event) => setSiteForm({ ...siteForm, bookingSectionTitle: event.target.value })}
                              style={styles.input}
                          />

                          <label style={styles.label}>Subtítulo da seção</label>
                          <input
                              type="text"
                              value={siteForm.bookingSectionSubtitle}
                              onChange={(event) => setSiteForm({ ...siteForm, bookingSectionSubtitle: event.target.value })}
                              style={styles.input}
                          />

                          {/* --- Depoimentos (cabeçalho) --- */}
                          <h3 style={styles.formTitle}>Seção "Depoimentos" (cabeçalho)</h3>
                          <p style={styles.helperText}>
                            Os depoimentos em si são aprovados na aba "Depoimentos".
                          </p>

                          <label style={styles.label}>Título da seção</label>
                          <input
                              type="text"
                              value={siteForm.testimonialsSectionTitle}
                              onChange={(event) => setSiteForm({ ...siteForm, testimonialsSectionTitle: event.target.value })}
                              style={styles.input}
                          />

                          <label style={styles.label}>Subtítulo da seção</label>
                          <input
                              type="text"
                              value={siteForm.testimonialsSectionSubtitle}
                              onChange={(event) => setSiteForm({ ...siteForm, testimonialsSectionSubtitle: event.target.value })}
                              style={styles.input}
                          />

                          {/* --- FAQ --- */}
                          <h3 style={styles.formTitle}>Perguntas Frequentes</h3>

                          <label style={styles.label}>Título da seção</label>
                          <input
                              type="text"
                              value={siteForm.faqSectionTitle}
                              onChange={(event) => setSiteForm({ ...siteForm, faqSectionTitle: event.target.value })}
                              style={styles.input}
                          />

                          <label style={styles.label}>Subtítulo da seção</label>
                          <input
                              type="text"
                              value={siteForm.faqSectionSubtitle}
                              onChange={(event) => setSiteForm({ ...siteForm, faqSectionSubtitle: event.target.value })}
                              style={styles.input}
                          />

                          <label style={styles.label}>Perguntas e respostas</label>
                          <div style={styles.list}>
                            {siteForm.faqItems.map((item, index) => (
                                <div key={index} style={styles.listItemBox}>
                                  <div style={styles.listItemRow}>
                                    <input
                                        type="text"
                                        value={item.question}
                                        onChange={(e) => updateListItem('faqItems', index, { question: e.target.value })}
                                        style={{ ...styles.input, marginBottom: 0, flex: 1 }}
                                        placeholder="Pergunta"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeListItem('faqItems', index)}
                                        style={styles.removeButton}
                                    >
                                      Remover
                                    </button>
                                  </div>
                                  <textarea
                                      value={item.answer}
                                      onChange={(e) => updateListItem('faqItems', index, { answer: e.target.value })}
                                      style={{ ...styles.input, minHeight: 70, marginTop: 8, marginBottom: 0, fontFamily: 'inherit', resize: 'vertical' }}
                                      placeholder="Resposta"
                                  />
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addListItem('faqItems', { question: '', answer: '' })}
                                style={styles.secondaryButton}
                            >
                              + Adicionar pergunta
                            </button>
                          </div>

                          {/* --- Rodapé / Contato --- */}
                          <h3 style={styles.formTitle}>Rodapé e contato</h3>

                          <label style={styles.label}>Frase do rodapé</label>
                          <textarea
                              value={siteForm.footerTagline}
                              onChange={(event) => setSiteForm({ ...siteForm, footerTagline: event.target.value })}
                              style={{ ...styles.input, minHeight: 60, fontFamily: 'inherit', resize: 'vertical' }}
                          />

                          <label style={styles.label}>Texto de direitos autorais</label>
                          <input
                              type="text"
                              value={siteForm.footerCopyrightText}
                              onChange={(event) => setSiteForm({ ...siteForm, footerCopyrightText: event.target.value })}
                              style={styles.input}
                          />

                          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            <div style={{ flex: '1 1 200px' }}>
                              <label style={styles.label}>WhatsApp</label>
                              <input
                                  type="text"
                                  value={siteForm.whatsapp}
                                  onChange={(event) =>
                                      setSiteForm({ ...siteForm, whatsapp: event.target.value })
                                  }
                                  style={styles.input}
                                  placeholder="(11) 91622-4612"
                              />
                            </div>

                            <div style={{ flex: '1 1 200px' }}>
                              <label style={styles.label}>E-mail de contato</label>
                              <input
                                  type="text"
                                  value={siteForm.footerContactEmail}
                                  onChange={(event) => setSiteForm({ ...siteForm, footerContactEmail: event.target.value })}
                                  style={styles.input}
                                  placeholder="contato@..."
                              />
                            </div>

                            <div style={{ flex: '1 1 200px' }}>
                              <label style={styles.label}>Link do Instagram</label>
                              <input
                                  type="text"
                                  value={siteForm.instagramUrl}
                                  onChange={(event) =>
                                      setSiteForm({
                                        ...siteForm,
                                        instagramUrl: event.target.value,
                                      })
                                  }
                                  style={styles.input}
                                  placeholder="https://www.instagram.com/..."
                              />
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: 10, marginTop: 8, alignItems: 'center', position: 'sticky', bottom: 0, background: '#FAF9F6', padding: '12px 0' }}>
                            <button
                                type="submit"
                                disabled={savingSite}
                                style={styles.primaryButton}
                            >
                              {savingSite ? 'Salvando...' : 'Salvar alterações'}
                            </button>

                            {siteSaved && (
                                <span style={{ color: '#2E7D32', fontSize: 13, fontWeight: 600 }}>
                      Salvo com sucesso ✓
                    </span>
                            )}
                          </div>
                        </form>
                    )}
                  </section>
              )}

              {/* =========================
          DEPOIMENTOS
      ========================= */}

              {tab === 'depoimentos' && (
                  <section>
                    {testimonialsError && (
                        <div style={styles.errorBox}>
                          {testimonialsError}
                        </div>
                    )}

                    {testimonialsLoading ? (
                        <p style={styles.info}>
                          Carregando...
                        </p>
                    ) : pendingTestimonials.length === 0 ? (
                        <p style={styles.info}>
                          Nenhum depoimento aguardando
                          aprovação.
                        </p>
                    ) : (
                        <div
                            style={{
                              ...styles.list,
                              ...(isMobile
                                  ? {}
                                  : styles.listGrid),
                            }}
                        >
                          {pendingTestimonials.map(
                              (testimonial) => (
                                  <div
                                      key={testimonial.id}
                                      style={styles.card}
                                  >
                                    <div style={styles.cardTop}>
                                      <strong style={styles.time}>
                                        {
                                          testimonial.clientName
                                        }
                                      </strong>

                                      <span style={styles.time}>
                        {'⭐'.repeat(
                            testimonial.rating
                        )}
                      </span>
                                    </div>

                                    <p style={styles.detail}>
                                      {testimonial.comment}
                                    </p>

                                    <div style={styles.actions}>
                                      <button
                                          onClick={() =>
                                              approveTestimonial(
                                                  testimonial.id
                                              )
                                          }
                                          disabled={
                                              moderatingId ===
                                              testimonial.id
                                          }
                                          style={{
                                            ...styles.actionButton,
                                            borderColor:
                                                '#2E7D32',
                                            color: '#2E7D32',
                                          }}
                                      >
                                        {moderatingId ===
                                        testimonial.id
                                            ? '...'
                                            : 'Aprovar'}
                                      </button>

                                      <button
                                          onClick={() =>
                                              rejectTestimonial(
                                                  testimonial.id
                                              )
                                          }
                                          disabled={
                                              moderatingId ===
                                              testimonial.id
                                          }
                                          style={{
                                            ...styles.actionButton,
                                            borderColor:
                                                '#B3261E',
                                            color: '#B3261E',
                                          }}
                                      >
                                        {moderatingId ===
                                        testimonial.id
                                            ? '...'
                                            : 'Rejeitar'}
                                      </button>
                                    </div>
                                  </div>
                              )
                          )}
                        </div>
                    )}
                  </section>
              )}
            </div>
          </div>
        </aside>
      </div>
  );
}

const styles: {
  [key: string]: React.CSSProperties;
} = {
  pageBackground: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom, #F3E6F8, #FAF9F6)',
    fontFamily: "'Montserrat', sans-serif",
  },

  // --- Header: réplica exata do header do site público (mesma logo,
  // mesma tipografia, mesmo fundo fixo), só trocando o menu e o botão. ---
  siteHeader: {
    boxSizing: 'border-box',
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    backgroundColor: '#FAF9F6',
    borderBottom: '1px solid #E8D7F1',
    zIndex: 1000,
    padding: '12px 20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },

  siteHeaderContent: {
    maxWidth: 1200,
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },

  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },

  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    objectFit: 'cover',
  },

  logoTextBlock: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: 1.2,
  },

  logoText: {
    fontWeight: 'bold',
    color: '#3D1A4C',
    fontFamily: "'Playfair Display', serif",
    fontSize: 18,
  },

  logoSubtext: {
    fontSize: 10,
    fontWeight: 600,
    color: '#A259C4',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  headerAdminLabel: {
    fontWeight: 600,
    fontSize: 14,
    color: '#2D1537',
  },

  logoutButton: {
    backgroundColor: '#A259C4',
    color: '#FFF',
    padding: '9px 20px',
    borderRadius: 25,
    border: 'none',
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    whiteSpace: 'nowrap',
  },

  // --- Conteúdo abaixo do header fixo ---
  wrapper: {
    padding: '108px 24px 40px',
    maxWidth: 960,
    margin: '0 auto',
    boxSizing: 'border-box',
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
  },

  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },

  label: {
    fontSize: 13,
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
    fontSize: 13,
    marginBottom: 16,
  },

  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginBottom: 16,
  },

  listItemRow: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },

  listItemBox: {
    background: '#FAF9F6',
    border: '1px solid #E8D7F1',
    borderRadius: 12,
    padding: 12,
  },

  iconInput: {
    padding: '12px 10px',
    borderRadius: 10,
    border: '1px solid #D4A5E0',
    fontSize: 15,
    fontFamily: 'inherit',
    color: '#2D1537',
    background: '#FAF9F6',
    width: 56,
    textAlign: 'center',
    boxSizing: 'border-box',
  },

  removeButton: {
    background: '#FDECEA',
    color: '#B3261E',
    border: '1px solid #F3C6C2',
    borderRadius: 10,
    padding: '10px 12px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },

  listGrid: {
    display: 'grid',
    gridTemplateColumns:
        'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 14,
  },

  card: {
    background: '#FFF',
    borderRadius: 16,
    padding: 18,
    border: '1px solid #F0E4F5',
    boxShadow:
        '0 4px 15px rgba(0,0,0,0.03)',
  },

  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },

  time: {
    fontSize: 16,
    color: '#2D1537',
    fontFamily:
        "'Playfair Display', serif",
  },

  badge: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 700,
    padding: '3px 10px',
    borderRadius: 999,
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },

  clientName: {
    margin: '4px 0 0',
    fontWeight: 600,
    fontSize: 15,
    color: '#2D1537',
  },

  detail: {
    margin: '8px 0',
    color: '#6D5D75',
    fontSize: 14,
  },

  whatsapp: {
    fontSize: 13,
    color: '#2E7D32',
    textDecoration: 'none',
  },

  notes: {
    fontSize: 13,
    color: '#8A7A8F',
    fontStyle: 'italic',
    marginTop: 8,
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
    marginBottom: 20,
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
    fontFamily:
        "'Playfair Display', serif",
    color: '#2D1537',
    margin: '0 0 8px',
    fontSize: 18,
  },

  helperText: {
    color: '#6D5D75',
    fontSize: 13,
    marginBottom: 16,
    maxWidth: 640,
    lineHeight: 1.5,
  },

  photoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 14,
  },

  photoThumb: {
    width: '100%',
    height: 140,
    objectFit: 'cover',
    borderRadius: 10,
    marginBottom: 10,
    background: '#F0E4F5',
  },

  photoPreview: {
    width: '100%',
    maxHeight: 220,
    objectFit: 'cover',
    borderRadius: 10,
    marginBottom: 4,
    background: '#F0E4F5',
  },

  // --- Barra fixa do admin (por cima do site real) ---
  adminBar: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: 56,
    backgroundColor: '#2D1537',
    zIndex: 2000,
    boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
    boxSizing: 'border-box',
  },
  adminBarContent: {
    maxWidth: 1200,
    margin: '0 auto',
    height: '100%',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  adminBarBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  adminBarLogo: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    objectFit: 'cover',
  },
  adminBarTitle: {
    color: '#FFF',
    fontWeight: 700,
    fontSize: 14,
    fontFamily: "'Playfair Display', serif",
  },
  adminBarSubtitle: {
    color: '#D4A5E0',
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  adminBarActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  adminBarButton: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    color: '#FFF',
    border: '1px solid rgba(255,255,255,0.3)',
    padding: '8px 14px',
    borderRadius: 20,
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  adminBarButtonActive: {
    backgroundColor: '#A259C4',
    borderColor: '#A259C4',
  },

  // --- Gaveta lateral de edição ---
  drawerOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(45,21,55,0.35)',
    zIndex: 2998,
  },
  drawer: {
    position: 'fixed',
    top: 0,
    right: 0,
    height: '100vh',
    width: 440,
    maxWidth: '100vw',
    backgroundColor: '#FAF9F6',
    boxShadow: '-8px 0 30px rgba(0,0,0,0.2)',
    zIndex: 2999,
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.25s ease',
  },
  drawerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 20px',
    borderBottom: '1px solid #E8D7F1',
    backgroundColor: '#FFF',
    color: '#2D1537',
    fontFamily: "'Playfair Display', serif",
    fontSize: 18,
  },
  drawerCloseButton: {
    background: 'none',
    border: 'none',
    fontSize: 26,
    lineHeight: 1,
    color: '#2D1537',
    cursor: 'pointer',
  },
  drawerBody: {
    flex: 1,
    overflowY: 'auto',
  },
};
