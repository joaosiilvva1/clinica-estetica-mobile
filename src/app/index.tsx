import React, { useState, useEffect } from 'react';

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    treatmentId: '',
    date: '',
    time: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const availableTimeSlots = [
    '09:00', '10:00', '11:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const [professionalId, setProfessionalId] = useState<string | null>(null);

  const defaultTreatments = [
    { id: '1', name: 'Limpeza de Pele Profunda', description: 'Remoção de impurezas, cravos e células mortas, devolvendo o viço e a saúde da pele.', price: 120, durationMinutes: 60 },
    { id: '2', name: 'Massagem Facial Relaxante', description: 'Estimula a circulação, alivia as tensões do rosto e promove um relaxamento profundo.', price: 90, durationMinutes: 45 },
    { id: '3', name: 'Hidratação Facial Glow', description: 'Tratamento intensivo para devolver a luminosidade, maciez e umidade natural da pele.', price: 100, durationMinutes: 50 }
  ];

  const [treatments, setTreatments] = useState<
      { id: string; name: string; description: string; price: number; durationMinutes: number }[]
  >(defaultTreatments);

  const [freeSlots, setFreeSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [slotsRefreshKey, setSlotsRefreshKey] = useState(0);

  useEffect(() => {
    document.title = 'Maria Yasmim Lopes | Especialista em Limpeza de Pele em Taboão da Serra';
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', 'Clínica de estética especializada em limpeza de pele profunda, controle de acne, oleosidade e hidratação facial na região de Taboão da Serra.');

    const linkFont = document.createElement('link');
    linkFont.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400&display=swap';
    linkFont.rel = 'stylesheet';
    document.head.appendChild(linkFont);

    const style = document.createElement('style');
    style.innerHTML = `html { scroll-behavior: smooth; }`;
    document.head.appendChild(style);

    const checkWidth = () => setIsMobile(window.innerWidth < 720);
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  const photos = [
    { id: 1, title: 'Cuidado e Confiança', url: '/foto1.jpg.jpeg' },
    { id: 2, title: 'Beleza Natural', url: '/foto2.jpg.jpeg' },
    { id: 3, title: 'Limpeza de Pele Profunda', url: '/foto3.jpg.jpeg' },
    { id: 4, title: 'Rejuvenescimento Facial', url: '/foto4.jpg.jpeg' },
    { id: 5, title: 'Hidratação e Glow', url: '/foto5.jpg.jpeg' },
    { id: 6, title: 'Tratamento Especializado', url: '/foto6.jpg.jpeg' },
    { id: 7, title: 'Cuidado Personalizado', url: '/foto7.jpg.jpeg' },
    { id: 8, title: 'Resultados Reais', url: '/foto8.jpg.jpeg' },
    { id: 9, title: 'Técnica Refinada', url: '/foto9.jpg.jpeg' },
    { id: 10, title: 'Transformação e Autoestima', url: '/foto10.jpg.jpeg' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % photos.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [photos.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % photos.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + photos.length) % photos.length);

  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/treatments/public`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setTreatments(data);
          }
        })
        .catch(() => {});

    fetch(`${API_BASE_URL}/api/professionals/public`)
        .then((res) => res.json())
        .then((data) => setProfessionalId(data?.[0]?.id ?? 'default-pro'))
        .catch(() => setProfessionalId('default-pro'));
  }, []);

  useEffect(() => {
    if (!formData.date || !formData.treatmentId || !professionalId) {
      setFreeSlots([]);
      return;
    }
    setSlotsLoading(true);
    setBookingError(null);
    fetch(
        `${API_BASE_URL}/api/appointments/public/available-slots?professionalId=${professionalId}&treatmentId=${formData.treatmentId}&date=${formData.date}`
    )
        .then((res) => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then((data: string[]) => setFreeSlots(data))
        .catch(() => {
          setFreeSlots(availableTimeSlots.map(t => `${formData.date}T${t}:00-03:00`));
        })
        .finally(() => setSlotsLoading(false));
  }, [formData.date, formData.treatmentId, professionalId, slotsRefreshKey]);

  const slotToEpochMs = (dateStr: string, timeStr: string) =>
      new Date(`${dateStr}T${timeStr}:00-03:00`).getTime();

  const freeSlotsMs = new Set(freeSlots.map((iso) => new Date(iso).getTime()));

  const handleFormChange = (field: keyof typeof formData) => (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // Função para selecionar o tratamento clicado e rolar a tela direto para o formulário
  const handleSelectTreatmentAndBook = (treatmentId: string) => {
    setFormData((prev) => ({ ...prev, treatmentId }));
    const bookingSection = document.getElementById('agendamento');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);
    const activeProfId = professionalId || 'default-pro';
    setSubmitting(true);
    try {
      const scheduledAt = `${formData.date}T${formData.time}:00-03:00`;
      await fetch(`${API_BASE_URL}/api/appointments/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: formData.name,
          clientWhatsapp: formData.whatsapp.replace(/\D/g, ''),
          professionalId: activeProfId,
          treatmentId: formData.treatmentId,
          scheduledAt
        }),
      }).catch(() => {});

      const selectedTreatment = treatments.find((t) => t.id === formData.treatmentId);
      const message =
          `Olá! Gostaria de confirmar meu agendamento.\n\n` +
          `Nome: ${formData.name}\n` +
          `WhatsApp: ${formData.whatsapp}\n` +
          `Tratamento: ${selectedTreatment?.name ?? ''}\n` +
          `Data: ${formData.date}\n` +
          `Horário: ${formData.time}`;

      const url = `https://wa.me/5511916224612?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
      setFormSubmitted(true);
    } catch (error: any) {
      setBookingError(error.message || 'Não foi possível agendar agora. Tente novamente.');
      setFormData((p) => ({ ...p, time: '' }));
      setSlotsRefreshKey((k) => k + 1);
    } finally {
      setSubmitting(false);
    }
  };

  const [testimonials, setTestimonials] = useState<
      { id: string; clientName: string; rating: number; comment: string }[]
  >([]);
  const [testimonialForm, setTestimonialForm] = useState({ clientName: '', rating: 5, comment: '' });
  const [testimonialSubmitted, setTestimonialSubmitted] = useState(false);
  const [testimonialError, setTestimonialError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/testimonials/public`)
        .then((res) => res.json())
        .then((data) => setTestimonials(data))
        .catch(() => {});
  }, []);

  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestimonialError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/testimonials/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testimonialForm),
      });
      if (!res.ok) throw new Error('Falha ao enviar depoimento');
      setTestimonialSubmitted(true);
    } catch {
      setTestimonialError('Não foi possível enviar agora. Tente novamente em instantes.');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqData = [
    { question: "A limpeza de pele profunda dói?", answer: "Utilizamos técnicas modernas, emoliência adequada e muita delicadeza para garantir que a remoção de cravos e impurezas seja o mais confortável possível para você." },
    { question: "De quanto em quanto tempo devo fazer a limpeza de pele?", answer: "O ideal é realizar o procedimento a cada 30 ou 40 dias, acompanhando o ciclo natural de renovação celular da sua pele, mantendo-a sempre viçosa e saudável." },
    { question: "Os produtos utilizados dão alergia?", answer: "Trabalhamos exclusivamente com dermocosméticos de alta qualidade e hipoalergênicos, garantindo segurança e eficácia em cada protocolo." },
    { question: "Gestante pode fazer limpeza de pele?", answer: "Sim! Com as devidas adaptações de produtos, as gestantes podem e devem cuidar da pele, além de aproveitarem nossos protocolos de relaxamento facial." }
  ];

  return (
      <div id="inicio" style={styles.container}>

        {/* Barra de Aviso de Vagas no Topo */}
        <div style={styles.topBarNotice}>
          ✨ <strong>Agenda de Agosto aberta em Taboão da Serra</strong> — Garanta seu horário com antecedência!
        </div>

        {/* Botão Flutuante do WhatsApp */}
        <a href="https://wa.me/5511916224612" target="_blank" rel="noreferrer" style={styles.floatingWhatsApp}>
          <svg width="35" height="35" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
        </a>

        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <a href="#inicio" style={styles.logoContainer}>
              <img src="/logo.jpg.jpeg" alt="Logo Maria Yasmim Lopes" style={styles.logoCircle} />
              <span style={{ ...styles.logoText, fontSize: isMobile ? '14px' : '18px' }}>Maria Yasmim Lopes</span>
            </a>
            {!isMobile && (
                <nav style={styles.nav}>
                  <a href="#inicio" style={styles.navLink}>Início</a>
                  <a href="#sobre" style={styles.navLink}>Sobre</a>
                  <a href="#tratamentos" style={styles.navLink}>Tratamentos</a>
                  <a href="#localizacao" style={styles.navLink}>Local</a>
                  <a href="#faq" style={styles.navLink}>Dúvidas</a>
                </nav>
            )}
            <a href="#agendamento" style={{ ...styles.primaryButton, padding: isMobile ? '8px 12px' : '10px 20px', fontSize: isMobile ? '12px' : '14px' }}>
              {isMobile ? 'Agendar' : 'Agendar Procedimento'}
            </a>
          </div>
        </header>

        {/* Hero Section */}
        <section style={styles.hero}>
          <div style={styles.heroContent}>
            <span style={styles.badge}>Clínica de Estética em Taboão da Serra</span>
            <h1 style={styles.heroTitle}>Especialista em Limpeza de Pele e Cuidados Faciais</h1>
            <p style={styles.heroText}>
              Realce sua essência natural com tratamentos de alta performance. Renove sua pele, recupere sua autoestima e desfrute de um momento único de cuidado e bem-estar.
            </p>

            <div style={styles.carouselContainer}>
              <button onClick={prevSlide} style={styles.carouselBtnLeft}>&#10094;</button>
              <div style={styles.carouselSlide}>
                <div
                    style={{
                      ...styles.carouselBgBlur,
                      backgroundImage: `url(${photos[currentSlide].url})`
                    }}
                />
                <img src={photos[currentSlide].url} alt={photos[currentSlide].title} style={styles.carouselImage} />
                <div style={styles.carouselCaption}>{photos[currentSlide].title}</div>
              </div>
              <button onClick={nextSlide} style={styles.carouselBtnRight}>&#10095;</button>

              <div style={styles.dotsContainer}>
                {photos.map((_, index) => (
                    <span
                        key={index}
                        style={{
                          ...styles.dot,
                          backgroundColor: currentSlide === index ? '#A259C4' : '#D4A5E0'
                        }}
                        onClick={() => setCurrentSlide(index)}
                    />
                ))}
              </div>
            </div>

            <div style={styles.heroActions}>
              <a href="#agendamento" style={styles.primaryActionButton}>
                Ver Tratamentos e Agendar
              </a>
            </div>
          </div>
        </section>

        {/* Faixa de Benefícios Rápidos / Selos de Segurança */}
        <section style={styles.benefitsBar}>
          <div style={styles.benefitItem}>⭐ <strong>Atendimento Exclusivo</strong> e Personalizado</div>
          <div style={styles.benefitItem}>🛡️ <strong>Dermocosméticos</strong> de Alta Qualidade</div>
          <div style={styles.benefitItem}>💬 <strong>Agendamento Prático</strong> via WhatsApp</div>
        </section>

        {/* Indicações / Dores do Cliente */}
        <section style={styles.indicationsSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Nossos tratamentos são ideais para quem busca:</h2>
          </div>
          <div style={styles.indicationsGrid}>
            <div style={styles.indicationCard}>
              <div style={styles.indicationIcon}>✨</div>
              <h4 style={styles.indicationTitle}>Remoção de Cravos e Acne</h4>
              <p style={styles.indicationText}>Extração segura e profunda para desobstruir os poros e prevenir inflamações.</p>
            </div>
            <div style={styles.indicationCard}>
              <div style={styles.indicationIcon}>💧</div>
              <h4 style={styles.indicationTitle}>Controle de Oleosidade</h4>
              <p style={styles.indicationText}>Equilíbrio perfeito da derme, acabando com o excesso de brilho e pele engordurada.</p>
            </div>
            <div style={styles.indicationCard}>
              <div style={styles.indicationIcon}>🌸</div>
              <h4 style={styles.indicationTitle}>Renovação Celular</h4>
              <p style={styles.indicationText}>Remoção de células mortas, devolvendo a maciez e clareando levemente a pele.</p>
            </div>
            <div style={styles.indicationCard}>
              <div style={styles.indicationIcon}>💆‍♀️</div>
              <h4 style={styles.indicationTitle}>Hidratação e Viço (Glow)</h4>
              <p style={styles.indicationText}>Tratamentos intensivos que combatem o ressecamento, deixando a pele iluminada.</p>
            </div>
          </div>
        </section>

        {/* About Section com Gatilhos de Autoridade */}
        <section id="sobre" style={styles.aboutSection}>
          <div style={styles.aboutGrid}>
            <div style={styles.aboutPhotos}>
              <img src="/fotosobre.jpg.jpeg" alt="Maria Yasmim Lopes" style={styles.aboutPhotoMain} />
            </div>
            <div style={styles.aboutText}>
              <span style={styles.badge}>Sua Esteticista</span>
              <h2 style={styles.aboutTitle}>Maria Yasmim Lopes</h2>
              <p style={styles.aboutParagraph}>
                Esteticista formada e apaixonada por elevar a autoestima de cada cliente através de cuidados personalizados e resultados reais.
              </p>
              <p style={styles.aboutParagraph}>
                Trabalho focada na saúde da sua pele, utilizando protocolos modernos, <strong>dermocosméticos de alta tecnologia</strong> e seguindo as mais rigorosas normas de <strong>biossegurança</strong>.
              </p>
              <p style={styles.aboutParagraph}>
                Meu objetivo é proporcionar a melhor experiência em estética na região do Taboão da Serra, unindo eficácia técnica a um ambiente acolhedor de relaxamento profundo 💜
              </p>
            </div>
          </div>
        </section>

        {/* Treatments Section com Botão Direto para Agendar */}
        <section id="tratamentos" style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Procedimentos Exclusivos</h2>
            <p style={styles.sectionSubtitle}>Protocolos de alta performance voltados para as necessidades únicas do seu rosto.</p>
          </div>
          <div style={styles.grid}>
            {treatments.map((item) => (
                <div key={item.id} style={styles.card}>
                  <h3 style={styles.cardTitle}>{item.name}</h3>
                  <p style={styles.cardText}>{item.description}</p>
                  <button
                      onClick={() => handleSelectTreatmentAndBook(item.id)}
                      style={styles.cardSelectButton}
                  >
                    Quero este tratamento &rarr;
                  </button>
                </div>
            ))}
          </div>
        </section>

        {/* Localização para SEO Local */}
        <section id="localizacao" style={styles.locationSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Onde Estamos</h2>
            <p style={styles.sectionSubtitle}>Sua clínica de estética bem pertinho de você em Taboão da Serra.</p>
          </div>
          <div style={styles.locationGrid}>
            <div style={styles.locationInfo}>
              <h3 style={{...styles.cardTitle, marginBottom: '20px'}}>Nosso Espaço</h3>
              <p style={styles.locationAddressText}>
                <strong>Endereço:</strong><br/>
                Taboão da Serra, SP <br/>
                <span style={{fontSize: '13px', color: '#888'}}>(Atualize com o endereço completo, ex: Rua Exemplo, 123 - Bairro)</span>
              </p>
              <p style={styles.locationAddressText}>
                <strong>Atendimento:</strong><br/>
                Com hora marcada para garantir sua exclusividade.
              </p>
              <a href="https://wa.me/5511916224612" target="_blank" rel="noreferrer" style={{...styles.primaryActionButton, marginTop: '15px', padding: '12px 25px', fontSize: '14px'}}>
                Enviar Mensagem
              </a>
            </div>
            <div style={styles.locationMapWrapper}>
              <iframe
                  title="Mapa de Localização"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d58485.49574187255!2d-46.82845187640243!3d-23.628860299999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce54238e4df5e5%3A0xc39f28d8b1e4c700!2sTabo%C3%A3o%20da%20Serra%2C%20SP!5e0!3m2!1spt-BR!2sbr!4v1699999999999!5m2!1spt-BR!2sbr"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </section>

        {/* Booking Section com Gatilho de Escassez */}
        <section id="agendamento" style={styles.bookingSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Agende seu Atendimento</h2>
            <p style={styles.sectionSubtitle}>
              Garanta seu horário de forma rápida e prática.
            </p>
          </div>

          {formSubmitted ? (
              <div style={styles.bookingSuccess}>
                <p style={styles.bookingSuccessText}>
                  Prontinho! Abrimos o WhatsApp com sua solicitação — é só tocar em <strong>enviar</strong> lá pra confirmar com a Maria Yasmim.
                </p>
                <button onClick={() => setFormSubmitted(false)} style={styles.bookingResetLink}>
                  Preencher novo agendamento
                </button>
              </div>
          ) : (
              <form onSubmit={handleBookingSubmit} style={styles.bookingForm}>

                <div style={styles.scarcityAlert}>
                  ✨ <strong>Atenção:</strong> Realizamos um número limitado de atendimentos diários para garantir excelência e exclusividade. Garanta seu horário com antecedência.
                </div>

                <input
                    type="text"
                    placeholder="Seu nome"
                    required
                    value={formData.name}
                    onChange={handleFormChange('name')}
                    style={styles.bookingInput}
                />
                <input
                    type="tel"
                    placeholder="Seu WhatsApp (com DDD)"
                    required
                    value={formData.whatsapp}
                    onChange={handleFormChange('whatsapp')}
                    style={styles.bookingInput}
                />
                <select
                    required
                    value={formData.treatmentId}
                    onChange={handleFormChange('treatmentId')}
                    style={styles.bookingInput}
                >
                  <option value="" disabled>Selecione o tratamento desejado</option>
                  {treatments.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>

                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>Selecione a data:</label>
                  <input
                      type="date"
                      required
                      min={todayStr}
                      value={formData.date}
                      onChange={handleFormChange('date')}
                      style={styles.bookingInput}
                  />
                </div>

                {!formData.treatmentId && formData.date && (
                    <p style={styles.bookingErrorText}>Escolha o tratamento antes de ver os horários.</p>
                )}
                {formData.date && formData.treatmentId && (
                    <div style={styles.fieldGroup}>
                      <label style={styles.fieldLabel}>Selecione o horário disponível:</label>
                      {slotsLoading ? (
                          <p style={styles.sectionSubtitle}>Carregando horários...</p>
                      ) : (
                          <div style={styles.timeSlotsGrid}>
                            {availableTimeSlots.map((slot) => {
                              const isBusy = freeSlots.length > 0 && !freeSlotsMs.has(slotToEpochMs(formData.date, slot));
                              const isSelected = formData.time === slot;

                              return (
                                  <button
                                      key={slot}
                                      type="button"
                                      disabled={isBusy}
                                      onClick={() => setFormData((p) => ({ ...p, time: slot }))}
                                      style={{
                                        ...styles.slotButton,
                                        ...(isBusy ? styles.slotBusy : {}),
                                        ...(isSelected ? styles.slotSelected : {})
                                      }}
                                  >
                                    {slot} {isBusy ? '(Ocupado)' : ''}
                                  </button>
                              );
                            })}
                          </div>
                      )}
                    </div>
                )}

                {bookingError && <p style={styles.bookingErrorText}>{bookingError}</p>}

                <button
                    type="submit"
                    disabled={!formData.time || submitting}
                    style={{
                      ...styles.bookingSubmitButton,
                      opacity: formData.time && !submitting ? 1 : 0.6,
                      cursor: formData.time && !submitting ? 'pointer' : 'not-allowed'
                    }}
                >
                  {submitting ? 'Confirmando...' : 'Agendar via WhatsApp'}
                </button>
              </form>
          )}
        </section>

        {/* Testimonials Section */}
        <section id="depoimentos" style={styles.testimonialsSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Depoimentos Reais</h2>
            <p style={styles.sectionSubtitle}>Veja o que nossas clientes dizem sobre a experiência.</p>
          </div>

          {testimonials.length > 0 && (
              <div style={styles.grid}>
                {testimonials.map((t) => (
                    <div key={t.id} style={styles.googleReviewCard}>
                      <div style={styles.reviewHeader}>
                        <div style={styles.avatar}>
                          {t.clientName ? t.clientName.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div>
                          <h4 style={styles.clientNameGoogle}>{t.clientName}</h4>
                          <div style={styles.starsContainer}>
                            {'⭐'.repeat(t.rating)}
                          </div>
                        </div>
                      </div>
                      <p style={styles.googleReviewText}>{t.comment}</p>
                    </div>
                ))}
              </div>
          )}
        </section>

        {/* FAQ (Perguntas Frequentes) */}
        <section id="faq" style={styles.faqSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Perguntas Frequentes</h2>
            <p style={styles.sectionSubtitle}>Tire suas principais dúvidas sobre os nossos tratamentos.</p>
          </div>
          <div style={styles.faqContainer}>
            {faqData.map((faq, index) => (
                <div key={index} style={styles.faqItem} onClick={() => toggleFaq(index)}>
                  <div style={styles.faqQuestionHeader}>
                    <h4 style={styles.faqQuestionText}>{faq.question}</h4>
                    <span style={styles.faqIcon}>{openFaq === index ? '−' : '+'}</span>
                  </div>
                  {openFaq === index && (
                      <p style={styles.faqAnswerText}>{faq.answer}</p>
                  )}
                </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer id="contato" style={styles.footer}>
          <div style={styles.footerContent}>
            <div>
              <h3 style={styles.footerTitle}>Maria Yasmim Lopes</h3>
              <p style={styles.footerTextDesc}>Excelência, tecnologia e amor em cada detalhe do cuidado estético na região de Taboão da Serra.</p>
            </div>
            <div style={styles.footerContact}>
              <p style={{ fontWeight: 'bold', color: '#FFF' }}>Contato:</p>
              <p>(11) 91622-4612</p>
              <p>contato@mariayasmimestetica.com.br</p>
              <p style={{ marginTop: '10px' }}>
                <a href="https://www.instagram.com/yasmimlopes_estetica/" target="_blank" rel="noreferrer" style={styles.footerInstagramLink}>
                  @yasmimlopes_estetica
                </a>
              </p>
            </div>
          </div>
          <div style={styles.footerBottom}>
            <p>&copy; 2026 Maria Yasmim Lopes Estética. Todos os direitos reservados.</p>
          </div>
        </footer>
      </div>
  );
}

const styles = {
  container: { fontFamily: "'Montserrat', sans-serif", backgroundColor: '#FAF9F6', color: '#2D1537', minHeight: '100vh', margin: 0, padding: 0 },

  // Barra de Aviso no Topo
  topBarNotice: { backgroundColor: '#3D1A4C', color: '#FAF9F6', padding: '10px 20px', textAlign: 'center' as const, fontSize: '13px', fontWeight: '500', position: 'relative' as const, zIndex: 1001 },

  floatingWhatsApp: { position: 'fixed' as const, bottom: '30px', right: '30px', backgroundColor: '#25D366', color: '#FFF', borderRadius: '50%', width: '65px', height: '65px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(37,211,102,0.4)', zIndex: 9999, transition: 'transform 0.3s', cursor: 'pointer' },

  header: { boxSizing: 'border-box' as const, position: 'fixed' as const, top: '37px', left: 0, width: '100%', backgroundColor: 'rgba(250, 249, 246, 0.95)', borderBottom: '1px solid #E8D7F1', zIndex: 1000, padding: '10px 30px' },
  headerContent: { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logoContainer: { display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' as const },
  logoCircle: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#A259C4', objectFit: 'cover' as const },
  logoText: { fontSize: '18px', fontWeight: 'bold', color: '#3D1A4C', fontFamily: "'Playfair Display', serif" },
  nav: { display: 'flex', gap: '30px' },
  navLink: { textDecoration: 'none', color: '#2D1537', fontWeight: '500', fontSize: '15px' },
  primaryButton: { backgroundColor: '#A259C4', color: '#FFF', padding: '10px 20px', borderRadius: '25px', textDecoration: 'none', fontWeight: '500', fontSize: '14px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },

  hero: { padding: '160px 20px 80px 20px', background: 'linear-gradient(to bottom, #F3E6F8, #FAF9F6)', textAlign: 'center' as const },
  heroContent: { maxWidth: '850px', margin: '0 auto' },
  badge: { backgroundColor: '#E3C2F0', color: '#4A155E', padding: '8px 18px', borderRadius: '25px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' as const, display: 'inline-block', marginBottom: '20px', letterSpacing: '1px' },
  heroTitle: { fontSize: '42px', fontWeight: '700', color: '#2D1537', marginBottom: '15px', lineHeight: 1.2, fontFamily: "'Playfair Display', serif" },
  heroText: { fontSize: '17px', color: '#5A4A60', marginBottom: '35px', lineHeight: 1.6 },

  primaryActionButton: { display: 'inline-block', backgroundColor: '#2D1537', color: '#FFF', padding: '15px 35px', borderRadius: '30px', textDecoration: 'none', fontWeight: '600', fontSize: '16px', boxShadow: '0 4px 10px rgba(0,0,0,0.15)', transition: 'transform 0.2s' },
  heroActions: { display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' as const, alignItems: 'center' },

  // Faixa de Benefícios Rápidos
  benefitsBar: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '40px', flexWrap: 'wrap' as const, backgroundColor: '#2D1537', color: '#FAF9F6', padding: '20px', fontSize: '14px', textAlign: 'center' as const },
  benefitItem: { display: 'flex', alignItems: 'center', gap: '8px' },

  carouselContainer: { position: 'relative' as const, maxWidth: '650px', margin: '0 auto 40px auto', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 12px 30px rgba(0,0,0,0.15)', backgroundColor: '#2D1537' },
  carouselSlide: { position: 'relative' as const, width: '100%', height: '380px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  carouselBgBlur: { position: 'absolute' as const, top: 0, left: 0, width: '100%', height: '100%', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(15px) brightness(0.5)', transform: 'scale(1.1)', zIndex: 1 },
  carouselImage: { position: 'relative' as const, height: '100%', maxWidth: '100%', objectFit: 'contain' as const, zIndex: 2 },
  carouselCaption: { position: 'absolute' as const, bottom: 0, left: 0, width: '100%', backgroundColor: 'rgba(45, 21, 55, 0.85)', color: '#fff', padding: '12px', fontSize: '15px', fontWeight: 'bold', zIndex: 5 },
  carouselBtnLeft: { position: 'absolute' as const, top: '50%', left: '15px', transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '35px', height: '35px', cursor: 'pointer', zIndex: 10, fontSize: '16px' },
  carouselBtnRight: { position: 'absolute' as const, top: '50%', right: '15px', transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '35px', height: '35px', cursor: 'pointer', zIndex: 10, fontSize: '16px' },
  dotsContainer: { display: 'flex', justifyContent: 'center', gap: '8px', padding: '10px', backgroundColor: '#FAF9F6' },
  dot: { width: '10px', height: '10px', borderRadius: '50%', cursor: 'pointer', transition: 'background-color 0.3s' },

  indicationsSection: { padding: '60px 20px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' as const },
  indicationsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '25px', marginTop: '40px' },
  indicationCard: { backgroundColor: '#FFF', padding: '30px 20px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid #F0E4F5' },
  indicationIcon: { fontSize: '32px', marginBottom: '15px' },
  indicationTitle: { fontSize: '18px', fontWeight: '700', color: '#2D1537', marginBottom: '10px', fontFamily: "'Playfair Display', serif" },
  indicationText: { fontSize: '14px', color: '#6D5D75', lineHeight: 1.5 },

  aboutSection: { padding: '80px 20px', maxWidth: '1200px', margin: '0 auto' },
  aboutGrid: { display: 'flex', flexWrap: 'wrap' as const, gap: '60px', alignItems: 'center' },
  aboutPhotos: { flex: '1 1 400px', display: 'flex', flexDirection: 'column' as const, gap: '14px' },
  aboutPhotoMain: { width: '100%', height: '550px', objectFit: 'cover' as const, borderRadius: '20px', boxShadow: '0 12px 30px rgba(0,0,0,0.1)' },
  aboutText: { flex: '1 1 400px' },
  aboutTitle: { fontSize: '36px', fontWeight: '700', color: '#2D1537', marginBottom: '20px', fontFamily: "'Playfair Display', serif" },
  aboutParagraph: { fontSize: '16px', color: '#5A4A60', lineHeight: 1.8, marginBottom: '16px' },

  section: { padding: '80px 20px', maxWidth: '1200px', margin: '0 auto' },
  sectionHeader: { textAlign: 'center' as const, marginBottom: '50px' },
  sectionTitle: { fontSize: '36px', fontWeight: '700', color: '#2D1537', marginBottom: '12px', fontFamily: "'Playfair Display', serif" },
  sectionSubtitle: { fontSize: '16px', color: '#6D5D75' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' },

  card: { backgroundColor: '#FFF', padding: '35px', borderRadius: '20px', border: '1px solid #E8D7F1', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', textAlign: 'left' as const, display: 'flex', flexDirection: 'column' as const, justifyContent: 'space-between' },
  cardTitle: { fontSize: '22px', fontWeight: 'bold', color: '#2D1537', marginBottom: '12px', fontFamily: "'Playfair Display', serif" },
  cardText: { fontSize: '15px', color: '#6D5D75', lineHeight: 1.6, marginBottom: '20px' },

  // Botão direto nos cards de tratamentos
  cardSelectButton: { backgroundColor: '#F3E6F8', color: '#4A155E', border: 'none', padding: '10px 18px', borderRadius: '20px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', alignSelf: 'flex-start', transition: 'background-color 0.2s' },

  locationSection: { padding: '80px 20px', maxWidth: '1000px', margin: '0 auto' },
  locationGrid: { display: 'flex', flexWrap: 'wrap' as const, gap: '30px', backgroundColor: '#FFF', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 25px rgba(0,0,0,0.05)', border: '1px solid #F0E4F5' },
  locationInfo: { flex: '1 1 300px', padding: '40px' },
  locationAddressText: { fontSize: '15px', color: '#5A4A60', lineHeight: 1.6, marginBottom: '20px' },
  locationMapWrapper: { flex: '1 1 400px', minHeight: '300px', width: '100%' },

  bookingSection: { padding: '80px 20px', maxWidth: '650px', margin: '0 auto' },
  bookingForm: { display: 'flex', flexDirection: 'column' as const, gap: '16px', backgroundColor: '#FFF', padding: '40px', borderRadius: '20px', boxShadow: '0 8px 25px rgba(0,0,0,0.05)', border: '1px solid #F0E4F5' },

  scarcityAlert: { backgroundColor: '#FFF3E0', color: '#E65100', padding: '15px', borderRadius: '10px', fontSize: '14px', lineHeight: 1.5, borderLeft: '4px solid #FF9800', marginBottom: '10px' },

  bookingInput: { padding: '15px 18px', borderRadius: '10px', border: '1px solid #D4A5E0', fontSize: '15px', fontFamily: 'inherit', color: '#2D1537', backgroundColor: '#FAF9F6', width: '100%', boxSizing: 'border-box' as const, transition: 'border-color 0.2s' },
  fieldGroup: { display: 'flex', flexDirection: 'column' as const, gap: '8px', textAlign: 'left' as const },
  fieldLabel: { fontSize: '14px', fontWeight: '600', color: '#2D1537' },
  timeSlotsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px', marginTop: '5px' },
  slotButton: { padding: '12px', borderRadius: '8px', border: '1px solid #A259C4', backgroundColor: '#FFF', color: '#A259C4', fontWeight: 'bold' as const, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' },
  slotBusy: { backgroundColor: '#F0F0F0', borderColor: '#DDD', color: '#A0A0A0', cursor: 'not-allowed', textDecoration: 'line-through' },
  slotSelected: { backgroundColor: '#A259C4', color: '#FFF' },
  bookingSubmitButton: { backgroundColor: '#2D1537', color: '#FFF', padding: '16px 30px', borderRadius: '30px', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '10px', boxShadow: '0 4px 12px rgba(45,21,55,0.2)' },
  bookingSuccess: { textAlign: 'center' as const, backgroundColor: '#F3E6F8', borderRadius: '16px', padding: '30px' },
  bookingSuccessText: { fontSize: '16px', color: '#3D1A4C', lineHeight: 1.6, marginBottom: '16px' },
  bookingErrorText: { fontSize: '14px', color: '#B3261E', marginTop: '4px' },
  bookingResetLink: { background: 'none', border: 'none', color: '#A259C4', fontWeight: 'bold', textDecoration: 'underline', cursor: 'pointer', fontSize: '14px' },

  testimonialsSection: { padding: '80px 20px', backgroundColor: '#F8F2FB' },
  googleReviewCard: { backgroundColor: '#FFF', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' as const, textAlign: 'left' as const },
  reviewHeader: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' },
  avatar: { width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#A259C4', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px' },
  clientNameGoogle: { fontWeight: 'bold', color: '#2D1537', fontSize: '17px', margin: '0 0 5px 0' },
  starsContainer: { fontSize: '15px' },
  googleReviewText: { fontSize: '15px', color: '#4A4A4A', lineHeight: 1.7, margin: 0 },

  faqSection: { padding: '80px 20px', maxWidth: '800px', margin: '0 auto' },
  faqContainer: { display: 'flex', flexDirection: 'column' as const, gap: '15px' },
  faqItem: { backgroundColor: '#FFF', borderRadius: '12px', border: '1px solid #E8D7F1', padding: '20px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' },
  faqQuestionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestionText: { fontSize: '16px', fontWeight: '600', color: '#2D1537', margin: 0 },
  faqIcon: { fontSize: '24px', color: '#A259C4', fontWeight: 'bold' },
  faqAnswerText: { fontSize: '15px', color: '#6D5D75', lineHeight: 1.6, margin: '15px 0 0 0', paddingTop: '15px', borderTop: '1px solid #F0E4F5' },

  footer: { backgroundColor: '#2D1537', color: '#FAF9F6', padding: '70px 20px 30px 20px', textAlign: 'left' as const },
  footerContent: { maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '50px', borderBottom: '1px solid #4A155E', paddingBottom: '40px' },
  footerTitle: { fontSize: '24px', fontWeight: 'bold', color: '#E3C2F0', marginBottom: '15px', fontFamily: "'Playfair Display', serif" },
  footerTextDesc: { fontSize: '15px', color: '#D4A5E0', lineHeight: 1.6 },
  footerContact: { fontSize: '15px', color: '#D4A5E0', lineHeight: 1.7 },
  footerInstagramLink: { color: '#FFF', textDecoration: 'none', fontWeight: 'bold' },
  footerBottom: { maxWidth: '1200px', margin: '30px auto 0 auto', textAlign: 'center' as const, fontSize: '13px', color: '#A259C4' }
};