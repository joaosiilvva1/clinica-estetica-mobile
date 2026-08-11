import React, { useState, useEffect } from 'react';

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [formData, setFormData] = useState({ name: '', whatsapp: '', treatment: '', preferredTime: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Fotos reais da clínica, servidas de mobile/public/
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

  const handleFormChange = (field: keyof typeof formData) => (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message =
        `Olá! Gostaria de agendar uma avaliação.\n\n` +
        `Nome: ${formData.name}\n` +
        `WhatsApp: ${formData.whatsapp}\n` +
        `Tratamento de interesse: ${formData.treatment}\n` +
        `Horário preferido: ${formData.preferredTime}`;

    const url = `https://wa.me/5511916224612?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setFormSubmitted(true);
  };

  const treatments = [
    { id: 1, title: 'Limpeza de Pele', description: 'Renovação celular profunda com extração e hidratação.' },
    { id: 2, title: 'Hidratação Facial', description: 'Devolve o viço, maciez e luminosidade natural da derme.' }
  ];

  const [testimonials, setTestimonials] = useState<
      { id: string; clientName: string; rating: number; comment: string }[]
  >([]);
  const [testimonialForm, setTestimonialForm] = useState({ clientName: '', rating: 5, comment: '' });
  const [testimonialSubmitted, setTestimonialSubmitted] = useState(false);
  const [testimonialError, setTestimonialError] = useState<string | null>(null);

  const API_BASE_URL = 'http://localhost:8080';

  // Busca os depoimentos do banco de dados (Spring Boot + PostgreSQL)
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/testimonials/public`)
        .then((res) => res.json())
        .then((data) => setTestimonials(data))
        .catch(() => {
          // Falha silenciosa caso o backend esteja fora do ar
        });
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

  return (
      <div id="inicio" style={styles.container}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <a href="#inicio" style={styles.logoContainer}>
              <img src="/logo.jpg.jpeg" alt="Logo Maria Yasmim Lopes" style={styles.logoCircle} />
              <span style={styles.logoText}>Maria Yasmim Lopes</span>
            </a>
            <nav style={styles.nav}>
              <a href="#inicio" style={styles.navLink}>Início</a>
              <a href="#tratamentos" style={styles.navLink}>Tratamentos</a>
              <a href="#depoimentos" style={styles.navLink}>Depoimentos</a>
            </nav>
            <a href="#agendamento" style={styles.primaryButton}>
              Agendar Avaliação
            </a>
          </div>
        </header>

        {/* Hero Section */}
        <section style={styles.hero}>
          <div style={styles.heroContent}>
            <span style={styles.badge}>Estética Avançada e Personalizada</span>
            <h1 style={styles.heroTitle}>A Sua Jornada de Beleza Começa Aqui</h1>
            <p style={styles.heroText}>
              Realce sua essência natural com tratamentos estéticos exclusivos projetados para cuidar da sua pele e elevar a sua autoestima.
            </p>

            {/* Carrossel de Fotos */}
            <div style={styles.carouselContainer}>
              <button onClick={prevSlide} style={styles.carouselBtnLeft}>&#10094;</button>
              <div style={styles.carouselSlide}>
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
              <a href="https://wa.me/5511916224612" target="_blank" rel="noreferrer" style={styles.whatsappButton}>
                Falar no WhatsApp
              </a>
              <a href="https://www.instagram.com/yasmimlopes_estetica/" target="_blank" rel="noreferrer" style={styles.instagramButton}>
                Instagram
              </a>
            </div>
          </div>
        </section>

        {/* Treatments Section */}
        <section id="tratamentos" style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Nossos Tratamentos</h2>
            <p style={styles.sectionSubtitle}>Procedimentos de alta performance voltados para o cuidado completo da sua pele.</p>
          </div>
          <div style={styles.grid}>
            {treatments.map((item) => (
                <div key={item.id} style={styles.card}>
                  <h3 style={styles.cardTitle}>{item.title}</h3>
                  <p style={styles.cardText}>{item.description}</p>
                </div>
            ))}
          </div>
        </section>

        {/* Booking Section */}
        <section id="agendamento" style={styles.bookingSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Agende sua Avaliação</h2>
            <p style={styles.sectionSubtitle}>
              Preencha seus dados — vamos abrir o WhatsApp com tudo pronto, só confirmar o envio.
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
                    value={formData.treatment}
                    onChange={handleFormChange('treatment')}
                    style={styles.bookingInput}
                >
                  <option value="" disabled>Selecione o tratamento</option>
                  {treatments.map((t) => (
                      <option key={t.id} value={t.title}>{t.title}</option>
                  ))}
                </select>
                <input
                    type="text"
                    placeholder="Dia e horário preferidos (ex: terça à tarde)"
                    required
                    value={formData.preferredTime}
                    onChange={handleFormChange('preferredTime')}
                    style={styles.bookingInput}
                />
                <button type="submit" style={styles.bookingSubmitButton}>
                  Enviar pelo WhatsApp
                </button>
              </form>
          )}
        </section>

        {/* Testimonials Section (Visual Google) */}
        <section id="depoimentos" style={styles.testimonialsSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>O Que Dizem Nossas Clientes</h2>
            <p style={styles.sectionSubtitle}>Histórias reais de transformação e cuidado personalizado.</p>
          </div>

          {/* Cards de Depoimentos puxados do Banco */}
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

          {/* Formulário de Envio de Depoimento */}
          <div style={styles.testimonialFormWrapper}>
            {testimonialSubmitted ? (
                <p style={styles.bookingSuccessText}>
                  Obrigada pelo seu depoimento! Ele já foi publicado com sucesso.
                </p>
            ) : (
                <form onSubmit={handleTestimonialSubmit} style={styles.bookingForm}>
                  <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2D1537', marginBottom: '15px' }}>Deixe seu depoimento</h3>
                  <input
                      type="text"
                      placeholder="Seu nome"
                      required
                      value={testimonialForm.clientName}
                      onChange={(e) => setTestimonialForm((p) => ({ ...p, clientName: e.target.value }))}
                      style={styles.bookingInput}
                  />
                  <div style={styles.starPicker}>
                    {[1, 2, 3, 4, 5].map((n) => (
                        <span
                            key={n}
                            onClick={() => setTestimonialForm((p) => ({ ...p, rating: n }))}
                            style={{ ...styles.starPickerStar, opacity: n <= testimonialForm.rating ? 1 : 0.35 }}
                        >
                        ★
                      </span>
                    ))}
                  </div>
                  <textarea
                      placeholder="Conte como foi sua experiência"
                      required
                      value={testimonialForm.comment}
                      onChange={(e) => setTestimonialForm((p) => ({ ...p, comment: e.target.value }))}
                      style={{ ...styles.bookingInput, minHeight: '90px', fontFamily: 'inherit' }}
                  />
                  {testimonialError && <p style={{ color: 'red', fontSize: '13px' }}>{testimonialError}</p>}
                  <button type="submit" style={styles.bookingSubmitButton}>Enviar depoimento</button>
                </form>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer id="contato" style={styles.footer}>
          <div style={styles.footerContent}>
            <div>
              <h3 style={styles.footerTitle}>Maria Yasmim Lopes</h3>
              <p style={styles.footerTextDesc}>Excelência, técnica e amor em cada detalhe do cuidado estético.</p>
            </div>
            <div style={styles.footerContact}>
              <p style={{ fontWeight: 'bold', color: '#FFF' }}>Contato:</p>
              <p>(11) 91622-4612</p>
              <p>contato@mariayasmimestetica.com.br</p>
              <p>
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
  container: { fontFamily: 'sans-serif', backgroundColor: '#FAF9F6', color: '#2D1537', minHeight: '100vh', margin: 0, padding: 0 },
  header: { position: 'fixed' as const, top: 0, left: 0, width: '100%', backgroundColor: 'rgba(250, 249, 246, 0.95)', borderBottom: '1px solid #E8D7F1', zIndex: 1000, padding: '10px 30px' },
  headerContent: { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logoContainer: { display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' as const },
  logoCircle: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#A259C4', objectFit: 'cover' as const },
  logoText: { fontSize: '18px', fontWeight: 'bold', color: '#3D1A4C' },
  nav: { display: 'flex', gap: '30px' },
  navLink: { textDecoration: 'none', color: '#2D1537', fontWeight: '500', fontSize: '15px' },
  primaryButton: { backgroundColor: '#A259C4', color: '#FFF', padding: '10px 20px', borderRadius: '25px', textDecoration: 'none', fontWeight: '500', fontSize: '14px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
  hero: { padding: '150px 20px 80px 20px', background: 'linear-gradient(to bottom, #F3E6F8, #FAF9F6)', textAlign: 'center' as const },
  heroContent: { maxWidth: '800px', margin: '0 auto' },
  badge: { backgroundColor: '#E3C2F0', color: '#4A155E', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' as const, display: 'inline-block', marginBottom: '15px' },
  heroTitle: { fontSize: '38px', fontWeight: 'bold', color: '#2D1537', marginBottom: '15px', lineHeight: 1.2 },
  heroText: { fontSize: '16px', color: '#5A4A60', marginBottom: '25px', lineHeight: 1.5 },

  carouselContainer: { position: 'relative' as const, maxWidth: '650px', margin: '0 auto 30px auto', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,0.12)', backgroundColor: '#fff' },
  carouselSlide: { position: 'relative' as const, width: '100%', height: '350px' },
  carouselImage: { width: '100%', height: '100%', objectFit: 'cover' as const },
  carouselCaption: { position: 'absolute' as const, bottom: 0, left: 0, width: '100%', backgroundColor: 'rgba(45, 21, 55, 0.75)', color: '#fff', padding: '12px', fontSize: '15px', fontWeight: 'bold' },
  carouselBtnLeft: { position: 'absolute' as const, top: '50%', left: '15px', transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '35px', height: '35px', cursor: 'pointer', zIndex: 10, fontSize: '16px' },
  carouselBtnRight: { position: 'absolute' as const, top: '50%', right: '15px', transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '35px', height: '35px', cursor: 'pointer', zIndex: 10, fontSize: '16px' },
  dotsContainer: { display: 'flex', justifyContent: 'center', gap: '8px', padding: '10px', backgroundColor: '#FAF9F6' },
  dot: { width: '10px', height: '10px', borderRadius: '50%', cursor: 'pointer', transition: 'background-color 0.3s' },

  whatsappButton: { backgroundColor: '#2D1537', color: '#FFF', padding: '14px 28px', borderRadius: '30px', textDecoration: 'none', fontWeight: 'bold', fontSize: '16px', display: 'inline-block', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' },
  heroActions: { display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' as const },
  instagramButton: { backgroundColor: '#FFF', color: '#2D1537', padding: '14px 28px', borderRadius: '30px', textDecoration: 'none', fontWeight: 'bold', fontSize: '16px', display: 'inline-block', border: '2px solid #A259C4', boxShadow: '0 4px 10px rgba(0,0,0,0.08)' },
  section: { padding: '80px 20px', maxWidth: '1200px', margin: '0 auto' },
  sectionHeader: { textAlign: 'center' as const, marginBottom: '50px' },
  sectionTitle: { fontSize: '32px', fontWeight: 'bold', color: '#2D1537', marginBottom: '10px' },
  sectionSubtitle: { fontSize: '16px', color: '#6D5D75' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' },
  card: { backgroundColor: '#FFF', padding: '30px', borderRadius: '16px', border: '1px solid #F0E4F5', boxShadow: '0 2px 5px rgba(0,0,0,0.03)', textAlign: 'left' as const },
  cardTitle: { fontSize: '20px', fontWeight: 'bold', color: '#2D1537', marginBottom: '12px' },
  cardText: { fontSize: '14px', color: '#6D5D75', lineHeight: 1.5 },
  testimonialsSection: { padding: '80px 20px', backgroundColor: '#F8F2FB' },
  testimonialFormWrapper: { maxWidth: '480px', margin: '50px auto 0 auto', backgroundColor: '#FFF', borderRadius: '16px', padding: '30px', border: '1px solid #E8D7F1' },
  starPicker: { display: 'flex', gap: '6px', fontSize: '26px' },
  starPickerStar: { color: '#A259C4', cursor: 'pointer', transition: 'opacity 0.2s' },

  bookingSection: { padding: '80px 20px', maxWidth: '600px', margin: '0 auto' },
  bookingForm: { display: 'flex', flexDirection: 'column' as const, gap: '14px' },
  bookingInput: { padding: '14px 16px', borderRadius: '10px', border: '1px solid #D4A5E0', fontSize: '15px', fontFamily: 'inherit', color: '#2D1537', backgroundColor: '#FFF' },
  bookingSubmitButton: { backgroundColor: '#2D1537', color: '#FFF', padding: '14px 28px', borderRadius: '30px', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '8px' },
  bookingSuccess: { textAlign: 'center' as const, backgroundColor: '#F3E6F8', borderRadius: '16px', padding: '30px' },
  bookingSuccessText: { fontSize: '15px', color: '#3D1A4C', lineHeight: 1.6, marginBottom: '16px' },
  bookingResetLink: { background: 'none', border: 'none', color: '#A259C4', fontWeight: 'bold', textDecoration: 'underline', cursor: 'pointer', fontSize: '14px' },

  footerInstagramLink: { color: '#D4A5E0', textDecoration: 'none' },

  googleReviewCard: { backgroundColor: '#FFF', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' as const, textAlign: 'left' as const },
  reviewHeader: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' },
  avatar: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#A259C4', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px' },
  clientNameGoogle: { fontWeight: 'bold', color: '#2D1537', fontSize: '16px', margin: '0 0 5px 0' },
  starsContainer: { fontSize: '14px' },
  googleReviewText: { fontSize: '15px', color: '#4A4A4A', lineHeight: 1.6, margin: 0 },

  footer: { backgroundColor: '#2D1537', color: '#FAF9F6', padding: '60px 20px 20px 20px', textAlign: 'left' as const },
  footerContent: { maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px', borderBottom: '1px solid #4A155E', paddingBottom: '40px' },
  footerTitle: { fontSize: '22px', fontWeight: 'bold', color: '#E3C2F0', marginBottom: '12px' },
  footerTextDesc: { fontSize: '14px', color: '#D4A5E0', lineHeight: 1.5 },
  footerContact: { fontSize: '14px', color: '#D4A5E0', lineHeight: 1.6 },
  footerBottom: { maxWidth: '1200px', margin: '30px auto 0 auto', textAlign: 'center' as const, fontSize: '12px', color: '#A259C4' }
};