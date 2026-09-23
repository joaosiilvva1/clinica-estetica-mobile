import React, { useState, useEffect } from 'react';

type TrustItem = { icon: string; text: string };
type BenefitItem = { icon: string; text: string };
type IndicationItem = { icon: string; title: string; text: string };
type FaqItem = { question: string; answer: string };

type SiteSettings = {
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
    faqSectionTitle: string;
    faqSectionSubtitle: string;
    faqItems: FaqItem[];
    footerTagline: string;
    footerContactEmail: string;
    footerCopyrightText: string;
};

// Faz o parse de um campo JSON vindo do backend (armazenado como texto).
// Se vier vazio, inválido ou de um formato inesperado, cai no valor padrão —
// assim o site nunca quebra por causa de um texto salvo errado no admin.
function parseJsonArray<T>(json: string | null | undefined, fallback: T[]): T[] {
    if (!json || !json.trim()) return fallback;
    try {
        const parsed = JSON.parse(json);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
    } catch {
        return fallback;
    }
}


const defaultFaqItems: FaqItem[] = [
    { question: 'A limpeza de pele profunda dói?', answer: 'Utilizamos técnicas modernas, emoliência adequada e muita delicadeza para garantir que a remoção de cravos e impurezas seja o mais confortável possível para você.' },
    { question: 'De quanto em quanto tempo devo fazer a limpeza de pele?', answer: 'A frequência ideal varia conforme a necessidade da sua pele. Na avaliação, a Maria orienta o intervalo mais adequado para o seu caso.' },
    { question: 'Os produtos utilizados dão alergia?', answer: 'Os produtos e protocolos são escolhidos de acordo com as necessidades de cada pele. Caso você tenha alergias ou sensibilidades conhecidas, informe isso no agendamento.' },
    { question: 'Gestante pode fazer limpeza de pele?', answer: 'Alguns cuidados podem ser adaptados durante a gestação. Antes do procedimento, informe a equipe para confirmar quais produtos e técnicas são adequados para você.' },
    { question: 'Quais formas de pagamento são aceitas?', answer: 'Consulte as formas de pagamento disponíveis diretamente pelo WhatsApp da clínica.' },
    { question: 'Como funciona o cancelamento ou a remarcação?', answer: 'Para cancelar ou remarcar seu horário, entre em contato pelo WhatsApp da clínica assim que possível para que a equipe possa orientar você.' },
    { question: 'O que acontece se eu me atrasar?', answer: 'Em caso de atraso, avise pelo WhatsApp. Dependendo do tempo disponível no dia, o atendimento poderá precisar ser ajustado ou remarcado.' },
    { question: 'Preciso fazer alguma preparação antes do procedimento?', answer: 'As orientações podem variar conforme o tratamento. Depois do agendamento, a equipe pode orientar os cuidados específicos para o seu atendimento.' },
    { question: 'Quanto tempo dura cada tratamento?', answer: 'A duração aproximada aparece na descrição de cada tratamento. Ela pode variar conforme o protocolo e as necessidades da pele.' },
    { question: 'Preciso fazer avaliação antes?', answer: 'Nem todo tratamento exige uma avaliação separada. Em caso de dúvida sobre o procedimento mais indicado, fale com a Maria pelo WhatsApp antes do agendamento.' },
    { question: 'Onde fica a clínica?', answer: 'Estamos na R. Izaura da Silva Camargo, 27, Jardim São Paulo, Taboão da Serra - SP. Na seção Onde Estamos você também pode abrir a rota no Google Maps.' },
];

function mergeFaqItems(items: FaqItem[]): FaqItem[] {
    const existingQuestions = new Set(items.map((item) => item.question.trim().toLowerCase()));
    return [
        ...items,
        ...defaultFaqItems.filter((item) => !existingQuestions.has(item.question.trim().toLowerCase())),
    ];
}

const defaultSiteSettings: SiteSettings = {
    aboutText:
        'Esteticista formada e apaixonada por elevar a autoestima de cada cliente através de cuidados personalizados e resultados reais.\n' +
        'Trabalho focada na saúde da sua pele, utilizando protocolos modernos, dermocosméticos de alta tecnologia e seguindo as mais rigorosas normas de biossegurança.\n' +
        'Meu objetivo é proporcionar a melhor experiência em estética na região do Taboão da Serra, unindo eficácia técnica a um ambiente acolhedor de relaxamento profundo 💜',
    address:
        'R. Izaura da Silva Camargo, 27\nJardim Sao Paulo, Taboão da Serra - SP\nCEP: 06767-310',
    whatsapp: '5511916224612',
    openingHoursText:
        'Domingos e Segundas com hora marcada para garantir sua exclusividade.',
    instagramUrl: 'https://www.instagram.com/yasmimlopes_estetica/',
    logoUrl: '/logo.jpg.jpeg',
    heroEyebrow: 'Realce sua beleza natural',
    heroTitle: 'Sua melhor versão começa aqui',
    heroSubtitle:
        'Tratamentos faciais personalizados em Taboão da Serra, com atendimento acolhedor, protocolos cuidadosos e foco nas necessidades da sua pele.',
    heroTrustItems: [
        { icon: '🛡️', text: 'Procedimentos seguros' },
        { icon: '🤝', text: 'Atendimento personalizado' },
        { icon: '✨', text: 'Protocolos personalizados' },
    ],
    benefitsItems: [
        { icon: '⭐', text: 'Atendimento Exclusivo e Personalizado' },
        { icon: '🛡️', text: 'Dermocosméticos de Alta Qualidade' },
        { icon: '💬', text: 'Agendamento online e confirmação via WhatsApp' },
    ],
    indicationsSectionTitle: 'Nossos tratamentos são ideais para quem busca:',
    indicationsItems: [
        { icon: '✨', title: 'Remoção de Cravos e Acne', text: 'Extração segura e profunda para desobstruir os poros e prevenir inflamações.' },
        { icon: '💧', title: 'Controle de Oleosidade', text: 'Equilíbrio perfeito da derme, acabando com o excesso de brilho e pele engordurada.' },
        { icon: '🌸', title: 'Renovação Celular', text: 'Remoção de células mortas, devolvendo a maciez e clareando levemente a pele.' },
        { icon: '💆‍♀️', title: 'Hidratação e Viço (Glow)', text: 'Tratamentos intensivos que combatem o ressecamento, deixando a pele iluminada.' },
    ],
    aboutBadgeText: 'Sua Esteticista',
    aboutPhotoUrl: '/fotosobre.jpg.jpeg',
    treatmentsEyebrow: 'Nossos tratamentos',
    treatmentsSectionTitle: 'Cuidados para realçar sua beleza',
    treatmentsSectionSubtitle: 'Procedimentos faciais personalizados para suas necessidades',
    locationSectionTitle: 'Onde Estamos',
    locationSectionSubtitle: 'Sua clínica de estética bem pertinho de você em Taboão da Serra.',
    bookingSectionTitle: 'Agende seu Atendimento',
    bookingSectionSubtitle: 'Preencha seus dados para solicitar o horário. Depois do envio, você poderá confirmar os detalhes pelo WhatsApp.',
    faqSectionTitle: 'Perguntas Frequentes',
    faqSectionSubtitle: 'Tire suas principais dúvidas sobre os nossos tratamentos.',
    faqItems: defaultFaqItems,
    footerTagline: 'Excelência, tecnologia e amor em cada detalhe do cuidado estético na região de Taboão da Serra.',
    footerContactEmail: 'contato@mariayasmimestetica.com.br',
    footerCopyrightText: '© 2026 Maria Yasmim Lopes Estética. Todos os direitos reservados.',
};

type EditSectionKey =
    | 'hero'
    | 'photos'
    | 'benefits'
    | 'indications'
    | 'about'
    | 'treatments'
    | 'location'
    | 'faq'
    | 'footer';

type LandingPageProps = {
    // Quando true, o site é renderizado com lápis de edição sobre cada seção
    // (usado pelo painel administrativo, que reaproveita esta mesma página).
    editable?: boolean;
    onEditSection?: (section: EditSectionKey) => void;
    // Empurra o header fixo (e a barra flutuante do WhatsApp) para baixo, para
    // abrir espaço pra barra do admin quando esta página é usada no painel.
    topOffset?: number;
};

// Revela um bloco suavemente quando ele entra na viewport (usado nas seções
// abaixo da dobra: faixa de confiança, benefícios, etc). Dispara uma vez só.
function useInView<T extends HTMLElement>(threshold = 0.15) {
    const ref = React.useRef<T | null>(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (typeof IntersectionObserver === 'undefined') {
            setInView(true);
            return;
        }
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.disconnect();
                }
            },
            { threshold }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);
    return [ref, inView] as const;
}

// Painel que revela seu conteúdo (fade + leve subida) assim que entra na tela,
// usando o useInView acima — que já é confiável neste projeto porque usa
// IntersectionObserver (não depende de escutar o evento de scroll, que neste
// app pode não disparar do jeito esperado). Como é um componente próprio,
// cada item de uma lista pode chamar o hook sem violar as regras dos hooks.
function RevealPanel({ children, minHeight }: { children: (inView: boolean) => React.ReactNode; minHeight?: string }) {
    const [ref, inView] = useInView<HTMLDivElement>(0.18);
    return (
        <div ref={ref} style={{ minHeight, display: 'flex', alignItems: 'center' }}>
            {children(inView)}
        </div>
    );
}

// Estilo "Apple" de rolagem: em vez de disparar uma animação uma única vez
// (como o useInView acima), este hook devolve um progresso contínuo de 0 a 1
// enquanto o elemento atravessa a tela. Isso permite amarrar escala/opacidade
// diretamente à posição do scroll, dando a sensação de controle direto — o
// mesmo mecanismo usado nas páginas de produto da Apple (ex: AirPods Pro).
function useScrollProgress<T extends HTMLElement>() {
    const ref = React.useRef<T | null>(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        let ticking = false;
        const measure = () => {
            const rect = el.getBoundingClientRect();
            const vh = window.innerHeight || 1;
            // 0  -> elemento ainda não tocou a base da tela (chegando por baixo)
            // 1  -> elemento já percorreu toda a viewport (saindo por cima)
            const total = rect.height + vh;
            const traveled = vh - rect.top;
            const p = Math.min(1, Math.max(0, traveled / total));
            setProgress(p);
            ticking = false;
        };

        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(measure);
        };

        measure();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, []);

    return [ref, progress] as const;
}

// Interpola entre "from" e "to" conforme o progresso (0 a 1), suavizado com
// uma curva ease-out simples para não parecer linear/mecânico.
function scrollLerp(progress: number, from: number, to: number) {
    const eased = 1 - Math.pow(1 - progress, 2);
    return from + (to - from) * eased;
}

function EditPencil({ label, onClick, style }: { label: string; onClick: () => void; style?: React.CSSProperties }) {
    return (
        <button
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClick();
            }}
            title={`Editar: ${label}`}
            style={{
                position: 'absolute',
                top: 14,
                right: 14,
                zIndex: 40,
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: '2px solid #FFF',
                backgroundColor: '#A259C4',
                color: '#FFF',
                fontSize: 15,
                cursor: 'pointer',
                boxShadow: '0 3px 10px rgba(45,21,55,0.4)',
                ...style,
            }}
        >
            ✏️
        </button>
    );
}

export default function LandingPage({ editable = false, onEditSection, topOffset = 0 }: LandingPageProps = {}) {
    const editSection = (section: EditSectionKey) => onEditSection?.(section);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings);
    const [formData, setFormData] = useState({
        name: '',
        whatsapp: '',
        treatmentId: '',
        date: '',
        time: ''
    });
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [lastWhatsappLink, setLastWhatsappLink] = useState<string | null>(null);
    const [whatsappBlocked, setWhatsappBlocked] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [heroParallax, setHeroParallax] = useState({ x: 0, y: 0 });
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [dateError, setDateError] = useState<string | null>(null);
    const [chatOpen, setChatOpen] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
        { role: 'assistant', text: 'Olá! 👋 Sou a assistente virtual da Maria Yasmim Lopes Estética. Como posso ajudar?' }
    ]);

    const availableTimeSlots = [
        '09:00', '11:00', '14:00', '16:00', '18:00'
    ];

    const [professionalId, setProfessionalId] = useState<string | null>(null);
    const [professionalLoadFailed, setProfessionalLoadFailed] = useState(false);

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
        style.innerHTML = `
      html { scroll-behavior: smooth; }

      @keyframes mylFadeUp { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes mylFadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes mylFloat { 0%, 100% { transform: translateY(0) translateX(0); } 50% { transform: translateY(-16px) translateX(6px); } }
      @keyframes mylScrollCue { 0%, 100% { transform: translateY(0); opacity: 0.4; } 50% { transform: translateY(8px); opacity: 1; } }

      .myl-fade-up { opacity: 0; animation: mylFadeUp 0.9s cubic-bezier(.16,.84,.44,1) forwards; }
      .myl-fade-in { opacity: 0; animation: mylFadeIn 1.1s ease forwards; }
      .myl-float { animation: mylFloat 9s ease-in-out infinite; }
      .myl-scroll-cue { animation: mylScrollCue 2s ease-in-out infinite; }

      .myl-navbar { transition: background-color .4s ease, box-shadow .4s ease, backdrop-filter .4s ease, border-color .4s ease; }
      .myl-navbar.myl-scrolled { background-color: rgba(250,249,246,0.82) !important; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); box-shadow: 0 8px 30px rgba(45,21,55,0.1); border-bottom-color: rgba(232,215,241,0.6) !important; }

      .myl-btn-primary { transition: transform .35s cubic-bezier(.2,.8,.2,1), box-shadow .35s ease; }
      .myl-btn-primary:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 12px 26px rgba(74,21,94,0.35); }
      .myl-btn-secondary { transition: transform .35s cubic-bezier(.2,.8,.2,1), background-color .35s ease; }
      .myl-btn-secondary:hover { transform: translateY(-2px); background-color: rgba(45,21,55,0.05); }

      .myl-card-hover { transition: transform .4s cubic-bezier(.2,.8,.2,1), box-shadow .4s ease, border-color .4s ease; }
      .myl-card-hover:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(45,21,55,0.14); border-color: rgba(162,89,196,0.4); }

      @media (max-width: 720px) {
        .myl-mobile-action { width: 100%; justify-content: center; }
      }

      @media (max-width: 760px) {
        .myl-navbar nav { gap: 14px !important; }
      }

      @media (max-width: 700px) {
      }

      @media (prefers-reduced-motion: reduce) {
        .myl-fade-up, .myl-fade-in, .myl-float, .myl-scroll-cue { animation: none !important; opacity: 1 !important; transform: none !important; }
      }
    `;
        document.head.appendChild(style);

        const checkWidth = () => setIsMobile(window.innerWidth < 720);
        checkWidth();
        window.addEventListener('resize', checkWidth);

        const onScroll = () => setIsScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => {
            window.removeEventListener('resize', checkWidth);
            window.removeEventListener('scroll', onScroll);
        };
    }, []);

    // Parallax bem sutil do hero: só reage ao mouse em telas maiores (desktop),
    // no touch não faz sentido e no mobile o brief pede pra desativar esse tipo de efeito.
    const handleHeroMouseMove = (e: React.MouseEvent<HTMLElement>) => {
        if (isMobile) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        setHeroParallax({ x, y });
    };
    const resetHeroParallax = () => setHeroParallax({ x: 0, y: 0 });

    const [heroMediaRef, heroScrollProgress] = useScrollProgress<HTMLDivElement>();
    const [trustBarRef, trustBarInView] = useInView<HTMLElement>();
    const [aboutRef, aboutInView] = useInView<HTMLElement>();
    const [aboutTilt, setAboutTilt] = useState({ x: 0, y: 0 });
    const handleAboutMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isMobile) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        setAboutTilt({ x, y });
    };
    const resetAboutTilt = () => setAboutTilt({ x: 0, y: 0 });

    const defaultPhotos = [
        { id: '1', title: 'Cuidado e Confiança', url: '/foto1.jpg.jpeg' },
        { id: '2', title: 'Beleza Natural', url: '/foto2.jpg.jpeg' },
        { id: '3', title: 'Limpeza de Pele Profunda', url: '/foto3.jpg.jpeg' },
        { id: '4', title: 'Rejuvenescimento Facial', url: '/foto4.jpg.jpeg' },
        { id: '5', title: 'Hidratação e Glow', url: '/foto5.jpg.jpeg' },
        { id: '6', title: 'Tratamento Especializado', url: '/foto6.jpg.jpeg' },
        { id: '7', title: 'Cuidado Personalizado', url: '/foto7.jpg.jpeg' },
        { id: '8', title: 'Técnica de Cuidado Facial', url: '/foto8.jpg.jpeg' },
        { id: '9', title: 'Técnica Refinada', url: '/foto9.jpg.jpeg' },
        { id: '10', title: 'Transformação e Autoestima', url: '/foto10.jpg.jpeg' },
        { id: '11', title: 'Detalhes do Procedimento', url: '/foto11.jpg' },
        { id: '12', title: 'Atendimento Facial', url: '/foto12.jpg' },
        { id: '13', title: 'Cuidado Personalizado', url: '/foto13.jpg' },
    ];

    const [photos, setPhotos] = useState(defaultPhotos);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % photos.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [photos.length]);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % photos.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + photos.length) % photos.length);

    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://clinica-estetica-backend.onrender.com';

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/treatments/public`)
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data) && data.length > 0) {
                    setTreatments(data);
                }
            })
            .catch(() => {});

        // Fotos e textos/contatos do site agora são editáveis pela Maria no painel
        // admin. Se a API falhar ou não tiver nada cadastrado ainda, mantemos os
        // valores padrão acima como fallback — o site nunca fica quebrado.
        fetch(`${API_BASE_URL}/api/photos/public`)
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data) && data.length > 0) {
                    const apiPhotos = data.map((p: any) => ({
                        id: p.id,
                        title: p.title || '',
                        url: p.url,
                    }));

                    // Mantém as fotos cadastradas no painel e adiciona as novas
                    // fotos locais que ainda não existirem no banco.
                    const mergedPhotos = [...apiPhotos, ...defaultPhotos].filter((photo, index, all) => {
                        return all.findIndex((item) => item.url === photo.url) === index;
                    });

                    setPhotos(mergedPhotos);
                }
            })
            .catch(() => {});

        fetch(`${API_BASE_URL}/api/site-settings/public`)
            .then((res) => res.json())
            .then((data) => {
                if (data && typeof data === 'object') {
                    const str = (value: any, fallback: string) =>
                        typeof value === 'string' && value.trim() ? value : fallback;

                    setSiteSettings((prev) => ({
                        aboutText: str(data.aboutText, prev.aboutText),
                        address: str(data.address, prev.address),
                        whatsapp: str(data.whatsapp, prev.whatsapp),
                        openingHoursText: str(data.openingHoursText, prev.openingHoursText),
                        instagramUrl: str(data.instagramUrl, prev.instagramUrl),
                        logoUrl: str(data.logoUrl, prev.logoUrl),
                        heroEyebrow: str(data.heroEyebrow, prev.heroEyebrow),
                        heroTitle: str(data.heroTitle, prev.heroTitle),
                        heroSubtitle: str(data.heroSubtitle, prev.heroSubtitle),
                        heroTrustItems: parseJsonArray<TrustItem>(data.heroTrustItemsJson, prev.heroTrustItems),
                        benefitsItems: parseJsonArray<BenefitItem>(data.benefitsItemsJson, prev.benefitsItems),
                        indicationsSectionTitle: str(data.indicationsSectionTitle, prev.indicationsSectionTitle),
                        indicationsItems: parseJsonArray<IndicationItem>(data.indicationsItemsJson, prev.indicationsItems),
                        aboutBadgeText: str(data.aboutBadgeText, prev.aboutBadgeText),
                        aboutPhotoUrl: str(data.aboutPhotoUrl, prev.aboutPhotoUrl),
                        treatmentsEyebrow: str(data.treatmentsEyebrow, prev.treatmentsEyebrow),
                        treatmentsSectionTitle: str(data.treatmentsSectionTitle, prev.treatmentsSectionTitle),
                        treatmentsSectionSubtitle: str(data.treatmentsSectionSubtitle, prev.treatmentsSectionSubtitle),
                        locationSectionTitle: str(data.locationSectionTitle, prev.locationSectionTitle),
                        locationSectionSubtitle: str(data.locationSectionSubtitle, prev.locationSectionSubtitle),
                        bookingSectionTitle: str(data.bookingSectionTitle, prev.bookingSectionTitle),
                        bookingSectionSubtitle: str(data.bookingSectionSubtitle, prev.bookingSectionSubtitle),
                        faqSectionTitle: str(data.faqSectionTitle, prev.faqSectionTitle),
                        faqSectionSubtitle: str(data.faqSectionSubtitle, prev.faqSectionSubtitle),
                        faqItems: mergeFaqItems(parseJsonArray<FaqItem>(data.faqItemsJson, prev.faqItems)),
                        footerTagline: str(data.footerTagline, prev.footerTagline),
                        footerContactEmail: str(data.footerContactEmail, prev.footerContactEmail),
                        footerCopyrightText: str(data.footerCopyrightText, prev.footerCopyrightText),
                    }));
                }
            })
            .catch(() => {});

        // A instância free do Render "dorme" com inatividade: a primeira requisição depois
        // disso pode levar até ~50s ou falhar por timeout enquanto o serviço acorda. Por isso
        // tentamos algumas vezes com espera crescente antes de desistir — nunca inventamos um
        // id de profissional falso, porque isso só adia o erro real pra hora de agendar.
        const loadProfessional = (attempt = 1) => {
            fetch(`${API_BASE_URL}/api/professionals/public`)
                .then((res) => res.json())
                .then((data) => {
                    const id = data?.[0]?.id;
                    if (id) {
                        setProfessionalId(id);
                        setProfessionalLoadFailed(false);
                    } else if (attempt < 4) {
                        setTimeout(() => loadProfessional(attempt + 1), attempt * 4000);
                    } else {
                        setProfessionalLoadFailed(true);
                    }
                })
                .catch(() => {
                    if (attempt < 4) {
                        setTimeout(() => loadProfessional(attempt + 1), attempt * 4000);
                    } else {
                        setProfessionalLoadFailed(true);
                    }
                });
        };
        loadProfessional();
    }, []);

    useEffect(() => {
        if (!formData.date || !formData.treatmentId || !professionalId || dateError) {
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
    }, [formData.date, formData.treatmentId, professionalId, slotsRefreshKey, dateError]);

    const sendChatMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const message = chatInput.trim();
        if (!message || chatLoading) return;
        setChatMessages(prev => [...prev, { role: 'user', text: message }]);
        setChatInput('');
        setChatLoading(true);

        // O backend gratuito (Render) "dorme" com inatividade: a primeira mensagem depois
        // disso pode demorar bastante para acordar o servidor. Damos um tempo generoso antes
        // de desistir, para não travar o "Digitando..." pra sempre nem desistir cedo demais.
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        try {
            const response = await fetch(`${API_BASE_URL}/api/chat/public`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message }),
                signal: controller.signal
            });
            if (!response.ok) throw new Error('Erro no chatbot');
            const data = await response.json();
            setChatMessages(prev => [...prev, { role: 'assistant', text: data.reply || 'Não consegui responder agora.' }]);
        } catch (err: any) {
            const timedOut = err?.name === 'AbortError';
            setChatMessages(prev => [...prev, {
                role: 'assistant',
                text: timedOut
                    ? 'O assistente está demorando para responder (o servidor pode estar iniciando). Tente novamente em alguns segundos.'
                    : 'Desculpe, não consegui me conectar agora. Tente novamente em alguns instantes.'
            }]);
        } finally {
            clearTimeout(timeoutId);
            setChatLoading(false);
        }
    };

    const slotToEpochMs = (dateStr: string, timeStr: string) =>
        new Date(`${dateStr}T${timeStr}:00-03:00`).getTime();

    const freeSlotsMs = new Set(freeSlots.map((iso) => new Date(iso).getTime()));

    const handleFormChange = (field: keyof typeof formData) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedDate = e.target.value;
        if (!selectedDate) {
            setFormData((prev) => ({ ...prev, date: '', time: '' }));
            setDateError(null);
            return;
        }

        // Salva a data independentemente do dia, para não bugar o celular
        setFormData((prev) => ({ ...prev, date: selectedDate, time: '' }));

        const [year, month, day] = selectedDate.split('-');
        const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
        const dayOfWeek = dateObj.getDay();

        if (dayOfWeek !== 0 && dayOfWeek !== 1) {
            setDateError('Atendimentos apenas aos Domingos e Segundas. Por favor, escolha outra data.');
        } else {
            setDateError(null);
        }
    };

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

        if (!professionalId) {
            alert(
                'Ainda estamos carregando os dados da clínica (o servidor pode estar ' +
                'acordando após um período parado). Aguarde alguns segundos e tente novamente.'
            );
            return;
        }

        setSubmitting(true);

        try {
            const scheduledAt = `${formData.date}T${formData.time}:00-03:00`;
            const response = await fetch(`${API_BASE_URL}/api/appointments/public`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientName: formData.name,
                    clientWhatsapp: formData.whatsapp.replace(/\D/g, ''),
                    professionalId: professionalId,
                    treatmentId: formData.treatmentId,
                    scheduledAt
                }),
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText || 'Não foi possível concluir o agendamento no servidor.');
            }

            setFormSubmitted(true);

            // Avisa a Maria no WhatsApp com os dados do agendamento. Como isso roda depois de um
            // await, alguns navegadores bloqueiam a abertura automática (não é mais um clique
            // "direto"); por isso guardamos o link e também deixamos um botão manual na tela de
            // sucesso como fallback garantido.
            const treatmentName = treatments.find(t => t.id === formData.treatmentId)?.name ?? 'Tratamento';
            const [year, month, day] = formData.date.split('-');
            const whatsappMessage =
                `Novo agendamento recebido!\n\n` +
                `Cliente: ${formData.name}\n` +
                `WhatsApp: ${formData.whatsapp}\n` +
                `Tratamento: ${treatmentName}\n` +
                `Data: ${day}/${month}/${year} às ${formData.time}`;
            const link = `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(whatsappMessage)}`;
            setLastWhatsappLink(link);

            const popup = window.open(link, '_blank');
            if (!popup) {
                setWhatsappBlocked(true);
            }
        } catch (error: any) {
            console.error("Erro no agendamento:", error);
            const msg = error.message === 'Failed to fetch'
                ? 'Erro de conexão ou CORS bloqueado no backend.'
                : error.message;
            setBookingError(msg);
            alert(`Ops! Algo deu errado ao tentar agendar:\n\n${msg}\n\nVerifique as configurações de CORS no seu Spring Boot.`);
            setSlotsRefreshKey((k) => k + 1);
        } finally {
            setSubmitting(false);
        }
    };

    const todayStr = new Date().toISOString().split('T')[0];

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const whatsappDigits = (siteSettings.whatsapp || defaultSiteSettings.whatsapp).replace(/\D/g, '');
    const buildWhatsAppLink = (message = 'Olá Maria, vi o site e gostaria de agendar uma avaliação.') =>
        `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(message)}`;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteSettings.address.replace(/\n/g, ', '))}`;
    const aboutParagraphs = siteSettings.aboutText.split('\n').filter((p) => p.trim());
    const addressLines = siteSettings.address.split('\n').filter((l) => l.trim());
    const instagramHandle = (() => {
        try {
            const path = new URL(siteSettings.instagramUrl).pathname.replace(/\//g, '');
            return path ? `@${path}` : siteSettings.instagramUrl;
        } catch {
            return siteSettings.instagramUrl;
        }
    })();

    return (
        <div id="inicio" style={styles.container}>

            {/* Botão Flutuante do WhatsApp */}
            <a href={buildWhatsAppLink()} target="_blank" rel="noreferrer" aria-label="Falar com a Maria pelo WhatsApp" style={styles.floatingWhatsApp}>
                <svg width="35" height="35" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
            </a>

            {/* Header Fixo — transparente no topo, ganha vidro fosco ao rolar */}
            <header className={`myl-navbar${isScrolled ? ' myl-scrolled' : ''}`} style={{ ...styles.header, top: topOffset }}>
                <div style={styles.headerContent}>
                    <a href="#inicio" style={styles.logoContainer}>
                        <img src={siteSettings.logoUrl} alt="Logo Maria Yasmim Lopes" loading="eager" decoding="async" style={styles.logoCircle} />
                        <span style={styles.logoTextBlock}>
                <span style={{ ...styles.logoText, fontSize: isMobile ? '13px' : '18px' }}>Maria Yasmim Lopes</span>
                <span style={styles.logoSubtext}>Estética</span>
              </span>
                    </a>
                    {!isMobile && (
                        <nav style={styles.nav}>
                            <a href="#inicio" style={styles.navLink}>Início</a>
                            <a href="#sobre" style={styles.navLink}>Sobre</a>
                            <a href="#tratamentos" style={styles.navLink}>Tratamentos</a>
                            <a href="#contato" style={styles.navLink}>Contato</a>
                        </nav>
                    )}
                    {!editable && (
                        <a href="#agendamento" className="myl-btn-primary" style={{ ...styles.primaryButton, padding: isMobile ? '7px 12px' : '11px 22px', fontSize: isMobile ? '11px' : '14px' }}>
                            {isMobile ? 'Agendar' : '📱 Agendar Avaliação'}
                        </a>
                    )}
                </div>
            </header>

            {/* Hero Section */}
            <section
                style={{ ...styles.hero, position: 'relative' as const, overflow: 'hidden' }}
                onMouseMove={handleHeroMouseMove}
                onMouseLeave={resetHeroParallax}
            >
                {editable && <EditPencil label="Início (título e texto)" onClick={() => editSection('hero')} />}

                {/* Elementos decorativos flutuando bem devagar, só de fundo */}
                <div className="myl-float" style={{ position: 'absolute', top: '8%', left: '-6%', width: '260px', height: '260px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,175,120,0.25), transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' as const }} />
                <div className="myl-float" style={{ position: 'absolute', bottom: '4%', right: '-4%', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(162,89,196,0.18), transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' as const, animationDelay: '2.5s' }} />

                <div style={styles.heroGrid}>
                    <div className="myl-fade-up" style={styles.heroTextCol}>
                        <span style={styles.eyebrow}>{siteSettings.heroEyebrow}</span>
                        <h1 style={styles.heroTitle}>{siteSettings.heroTitle}</h1>
                        <p style={styles.heroText}>
                            {siteSettings.heroSubtitle}
                        </p>

                        <div style={styles.heroActions}>
                            <a href={buildWhatsAppLink()} target="_blank" rel="noreferrer" className="myl-btn-primary" style={styles.primaryActionButton}>
                                Agendar via WhatsApp
                            </a>
                            <a href="#tratamentos" className="myl-btn-secondary" style={styles.secondaryActionButton}>
                                Ver Tratamentos
                            </a>
                        </div>

                        <div style={styles.trustRow}>
                            {siteSettings.heroTrustItems.map((item, index) => (
                                <div key={index} style={styles.trustItem}>
                                    <span style={styles.trustIcon}>{item.icon}</span>
                                    <span>{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div ref={heroMediaRef} className="myl-fade-up" style={{ ...styles.heroPhotoCol, position: 'relative' as const, animationDelay: '0.15s' }}>
                        {editable && (
                            <EditPencil
                                label="Fotos"
                                onClick={() => editSection('photos')}
                                style={{ top: -12, right: -12 }}
                            />
                        )}
                        <div
                            style={{
                                ...styles.carouselContainer,
                                // Mecanismo estilo Apple: a foto entra ligeiramente maior e desfocada
                                // de escala/opacidade, e se "assenta" suavemente conforme o scroll avança —
                                // continuamente amarrado à posição da tela, não um gatilho único.
                                transform: `translate(${heroParallax.x * 8}px, ${heroParallax.y * 8 + scrollLerp(heroScrollProgress, 26, 0)}px) scale(${scrollLerp(heroScrollProgress, 0.94, 1)})`,
                                opacity: scrollLerp(heroScrollProgress, 0.55, 1),
                                transition: 'transform 0.25s ease-out',
                            }}
                        >
                            <button onClick={prevSlide} style={styles.carouselBtnLeft} aria-label="Foto anterior">&#10094;</button>
                            <div style={styles.carouselSlide}>
                                <img src={photos[currentSlide].url} alt={photos[currentSlide].title} loading={currentSlide === 0 ? 'eager' : 'lazy'} decoding="async" style={styles.carouselImage} />
                            </div>
                            <button onClick={nextSlide} style={styles.carouselBtnRight} aria-label="Próxima foto">&#10095;</button>
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
                    </div>
                </div>

                {!isMobile && (
                    <div
                        className="myl-scroll-cue"
                        style={{ position: 'absolute', bottom: '18px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '6px', color: '#8A6A94', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase' as const, pointerEvents: 'none' as const }}
                    >
                        <span>role</span>
                        <span style={{ width: '1px', height: '26px', backgroundColor: '#C9A6D6' }} />
                    </div>
                )}
            </section>

            {/* Faixa de Benefícios */}
            <section ref={trustBarRef} style={{ ...styles.benefitsBar, position: 'relative' as const }}>
                {editable && <EditPencil label="Benefícios" onClick={() => editSection('benefits')} />}
                {siteSettings.benefitsItems.map((item, index) => (
                    <React.Fragment key={index}>
                        <div
                            className={trustBarInView ? 'myl-fade-up' : ''}
                            style={{ ...styles.benefitItem, opacity: trustBarInView ? undefined : 0, animationDelay: `${index * 0.12}s` }}
                        >
                            {item.icon} <strong>{item.text}</strong>
                        </div>
                        {index < siteSettings.benefitsItems.length - 1 && (
                            <span style={{ width: '1px', height: '18px', background: 'linear-gradient(to bottom, transparent, rgba(250,249,246,0.35), transparent)' }} />
                        )}
                    </React.Fragment>
                ))}
            </section>

            {/* Indicações — cada benefício é um painel grande que revela (fade + leve
                subida) conforme entra na tela, alternando foto de lado. Sem sticky/fixed:
                fluxo normal do documento, então nunca sobrepõe a seção seguinte. */}
            <section style={{ position: 'relative' as const, backgroundColor: '#2D1537', padding: isMobile ? '70px 0' : '110px 0' }}>
                {editable && <EditPencil label="Indicações" onClick={() => editSection('indications')} />}
                <div style={{ textAlign: 'center' as const, padding: '0 24px', marginBottom: isMobile ? '30px' : '50px' }}>
                    <span style={{ ...styles.eyebrowCentered, color: '#D4AF78' }}>{siteSettings.indicationsSectionTitle}</span>
                </div>
                {siteSettings.indicationsItems.map((item, i) => {
                    const src = photos.length ? photos[i % photos.length].url : undefined;
                    const reverse = !isMobile && i % 2 === 1;
                    return (
                        <RevealPanel key={i} minHeight={isMobile ? undefined : '72vh'}>
                            {(inView) => (
                                <div
                                    className={inView ? 'myl-fade-up' : ''}
                                    style={{
                                        opacity: inView ? undefined : 0,
                                        width: '100%', maxWidth: '1320px', margin: '0 auto',
                                        padding: isMobile ? '0 24px' : '0 6vw',
                                        display: 'flex',
                                        flexDirection: (isMobile ? 'column' : (reverse ? 'row-reverse' : 'row')) as 'column' | 'row' | 'row-reverse',
                                        alignItems: 'center',
                                        gap: isMobile ? '26px' : '6vw',
                                        marginBottom: isMobile ? '46px' : '0',
                                    }}
                                >
                                    {src && (
                                        <div style={{ flex: isMobile ? undefined : '0 0 44%', width: isMobile ? '100%' : undefined, position: 'relative' as const, aspectRatio: isMobile ? '16/11' : '4/5', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 30px 60px -18px rgba(0,0,0,0.4)' }}>
                                            <img src={src} alt={item.title} style={{ position: 'absolute' as const, inset: 0, width: '100%', height: '100%', objectFit: 'cover' as const }} />
                                            <div style={{ position: 'absolute' as const, inset: 0, background: 'linear-gradient(200deg, rgba(45,21,55,0) 55%, rgba(45,21,55,0.35))' }} />
                                        </div>
                                    )}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? '54px' : '110px', color: 'rgba(250,249,246,0.14)', fontWeight: 600, lineHeight: 1, marginBottom: '6px' }}>
                                            {String(i + 1).padStart(2, '0')}
                                        </div>
                                        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? '28px' : '48px', color: '#FAF9F6', fontWeight: 600, lineHeight: 1.12, marginBottom: '16px' }}>
                                            {item.title}
                                        </h3>
                                        <p style={{ color: 'rgba(250,249,246,0.65)', fontSize: isMobile ? '15px' : '17px', lineHeight: 1.75, maxWidth: '440px' }}>
                                            {item.text}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </RevealPanel>
                    );
                })}
            </section>


            {/* About Section — composição de foto grande + cartão de texto sobrepondo por
                cima (sem sticky: aqui isso já causou bugs de sobreposição neste projeto,
                então a foto fica no fluxo normal e só o cartão sobrepõe com margem negativa). */}
            <section id="sobre" ref={aboutRef} style={{ position: 'relative' as const, maxWidth: '1000px', margin: '0 auto', padding: isMobile ? '140px 20px 20px' : '150px 20px 20px' }}>
                {editable && <EditPencil label="Sobre" onClick={() => editSection('about')} />}

                <div
                    onMouseMove={handleAboutMouseMove}
                    onMouseLeave={resetAboutTilt}
                >
                    <img
                        src={siteSettings.aboutPhotoUrl}
                        alt="Maria Yasmim Lopes"
                        style={{
                            width: '100%',
                            height: isMobile ? '420px' : '620px',
                            objectFit: 'cover' as const,
                            borderRadius: '28px',
                            boxShadow: '0 25px 55px rgba(45,21,55,0.22)',
                            display: 'block',
                            transform: `scale(1.02) rotateX(${aboutTilt.y * -2}deg) rotateY(${aboutTilt.x * 2}deg)`,
                            transition: 'transform 0.2s ease-out',
                        }}
                    />
                </div>


                <div
                    className={aboutInView ? 'myl-fade-up' : ''}
                    style={{
                        position: 'relative' as const,
                        zIndex: 2,
                        marginTop: isMobile ? '-70px' : '-120px',
                        marginLeft: isMobile ? 0 : '60px',
                        backgroundColor: '#FAF9F6',
                        borderRadius: '24px',
                        padding: isMobile ? '28px 24px' : '44px 44px 30px',
                        boxShadow: '0 20px 50px rgba(45,21,55,0.14)',
                        border: '1px solid #F0E4F5',
                        opacity: aboutInView ? undefined : 0,
                        animationDelay: '0.15s',
                    }}
                >
                    <span style={styles.badge}>{siteSettings.aboutBadgeText}</span>
                    <h2 style={styles.aboutTitle}>Maria Yasmim Lopes</h2>
                    {aboutParagraphs.map((paragraph, index) => (
                        <p key={index} style={styles.aboutParagraph}>
                            {paragraph}
                        </p>
                    ))}
                    <div style={styles.aboutChipsRow}>
                        <span style={styles.aboutChip}>{siteSettings.aboutBadgeText}</span>
                        <span style={styles.aboutChip}>Atendimento personalizado</span>
                        <span style={styles.aboutChip}>Taboão da Serra • SP</span>
                    </div>

                    {/* Blocos extras: é essa altura a mais no card de texto que dá "espaço de
                        rolagem" pra foto ficar presa por mais tempo antes de soltar. */}
                    <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column' as const, gap: '18px' }}>
                        {[
                            { icon: '🎓', title: 'Formação sólida', text: 'Cursos e atualizações constantes em estética facial avançada.' },
                            { icon: '🧴', title: 'Produtos selecionados', text: 'Dermocosméticos de alta performance, escolhidos protocolo a protocolo.' },
                            { icon: '💬', title: 'Escuta de verdade', text: 'Cada atendimento parte do que a sua pele precisa, não de um pacote fechado.' },
                            { icon: '🛡️', title: 'Biossegurança', text: 'Protocolos rigorosos de higiene em cada etapa do atendimento.' },
                        ].map((item, index) => (
                            <div key={index} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '20px' }}>{item.icon}</span>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 700, color: '#2D1537', fontSize: '15px' }}>{item.title}</p>
                                    <p style={{ margin: '4px 0 0 0', color: '#6D5D75', fontSize: '14px', lineHeight: 1.5 }}>{item.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Treatments Section — mesmo padrão de painéis empilhados com revelação
                ao entrar na tela, sem sticky/fixed. */}
            <section id="tratamentos" style={{ position: 'relative' as const, backgroundColor: '#FAF9F6', padding: isMobile ? '70px 0 40px' : '110px 0 60px' }}>
                {editable && <EditPencil label="Tratamentos" onClick={() => editSection('treatments')} />}
                <div style={{ ...styles.sectionHeader, padding: '0 24px' }}>
                    <span style={styles.eyebrowCentered}>{siteSettings.treatmentsEyebrow}</span>
                    <h2 style={styles.sectionTitle}>{siteSettings.treatmentsSectionTitle}</h2>
                    <p style={styles.sectionSubtitle}>{siteSettings.treatmentsSectionSubtitle}</p>
                </div>
                {treatments.map((item, i) => {
                    const src = photos.length ? photos[i % photos.length].url : undefined;
                    const reverse = !isMobile && i % 2 === 1;
                    return (
                        <RevealPanel key={item.id} minHeight={isMobile ? undefined : '72vh'}>
                            {(inView) => (
                                <div
                                    className={inView ? 'myl-fade-up' : ''}
                                    style={{
                                        opacity: inView ? undefined : 0,
                                        width: '100%', maxWidth: '1320px', margin: '0 auto',
                                        padding: isMobile ? '0 24px' : '0 6vw',
                                        display: 'flex',
                                        flexDirection: (isMobile ? 'column' : (reverse ? 'row-reverse' : 'row')) as 'column' | 'row' | 'row-reverse',
                                        alignItems: 'center',
                                        gap: isMobile ? '26px' : '6vw',
                                        marginBottom: isMobile ? '46px' : '0',
                                    }}
                                >
                                    {src && (
                                        <div style={{ flex: isMobile ? undefined : '0 0 48%', width: isMobile ? '100%' : undefined, position: 'relative' as const, aspectRatio: isMobile ? '16/11' : '4/5', borderRadius: '26px', overflow: 'hidden', boxShadow: '0 40px 80px -20px rgba(45,21,55,0.28)' }}>
                                            <img src={src} alt={item.name} loading="lazy" decoding="async" style={{ position: 'absolute' as const, inset: 0, width: '100%', height: '100%', objectFit: 'cover' as const }} />
                                            <div style={{ position: 'absolute' as const, inset: 0, background: 'linear-gradient(200deg, rgba(45,21,55,0) 55%, rgba(45,21,55,0.3))' }} />
                                        </div>
                                    )}
                                    <div style={{ flex: 1 }}>
                                        <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase' as const, color: '#A259C4', marginBottom: '6px', display: 'block' }}>
                                            {siteSettings.treatmentsEyebrow}
                                        </span>
                                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? '48px' : '100px', color: 'rgba(45,21,55,0.08)', fontWeight: 600, lineHeight: 1, marginBottom: '4px' }}>
                                            {String(i + 1).padStart(2, '0')}
                                        </div>
                                        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? '28px' : '48px', color: '#2D1537', fontWeight: 600, lineHeight: 1.1, marginBottom: '18px' }}>
                                            {item.name}
                                        </h3>
                                        <p style={{ color: '#5A4A60', fontSize: isMobile ? '15px' : '17px', lineHeight: 1.75, maxWidth: '440px', marginBottom: '22px' }}>
                                            {item.description}
                                        </p>
                                        <div style={{ display: 'flex', gap: '22px', marginBottom: '28px' }}>
                                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#6D5D75' }}>
                                                <b style={{ color: '#2D1537', fontWeight: 700 }}>R$ {item.price}</b>
                                            </span>
                                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#6D5D75' }}>
                                                <b style={{ color: '#2D1537', fontWeight: 700 }}>{item.durationMinutes} min</b>
                                            </span>
                                        </div>
                                        <button onClick={() => handleSelectTreatmentAndBook(item.id)} className="myl-btn-primary" style={styles.primaryActionButton}>
                                            Agendar este tratamento
                                        </button>
                                    </div>
                                </div>
                            )}
                        </RevealPanel>
                    );
                })}
            </section>


            {/* Localização Atualizada */}
            <section id="localizacao" style={{ ...styles.locationSection, position: 'relative' as const }}>
                {editable && <EditPencil label="Localização" onClick={() => editSection('location')} />}
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>{siteSettings.locationSectionTitle}</h2>
                    <p style={styles.sectionSubtitle}>{siteSettings.locationSectionSubtitle}</p>
                </div>
                <div style={styles.locationGrid}>
                    <div style={styles.locationInfo}>
                        <h3 style={{...styles.cardTitle, marginBottom: '20px'}}>Nosso Espaço</h3>
                        <p style={styles.locationAddressText}>
                            <strong>Endereço:</strong><br/>
                            {addressLines.map((line, index) => (
                                <React.Fragment key={index}>
                                    {line}
                                    {index < addressLines.length - 1 && <br/>}
                                </React.Fragment>
                            ))}
                        </p>
                        <p style={styles.locationAddressText}>
                            <strong>Atendimento:</strong><br/>
                            {siteSettings.openingHoursText}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '10px', marginTop: '15px' }}>
                            <a href={buildWhatsAppLink('Olá Maria, encontrei a clínica pelo site e gostaria de tirar uma dúvida.')} target="_blank" rel="noreferrer" style={{...styles.primaryActionButton, padding: '12px 25px', fontSize: '14px'}}>
                                Falar pelo WhatsApp
                            </a>
                            <a href={mapsUrl} target="_blank" rel="noreferrer" style={{...styles.secondaryActionButton, padding: '12px 20px', fontSize: '14px'}}>
                                Como chegar no Google Maps
                            </a>
                        </div>
                    </div>
                    <div style={styles.locationMapWrapper}>
                        <iframe
                            title="Mapa de Localização"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3656.7029671607525!2d-46.77740262451388!3d-23.57500587879109!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce55a90d96a60d%3A0x6a05e26716c526d1!2sR.%20Izaura%20da%20Silva%20Camargo%2C%2027%20-%20Jardim%20S%C3%A3o%20Paulo%2C%20Tabo%C3%A3o%20da%20Serra%20-%20SP%2C%2006767-310!5e0!3m2!1spt-BR!2sbr!4v1723427300000"
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

            {/* Booking Section */}
            <section id="agendamento" style={styles.bookingSection}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>{siteSettings.bookingSectionTitle}</h2>
                    <p style={styles.sectionSubtitle}>
                        {siteSettings.bookingSectionSubtitle}
                    </p>
                </div>

                {formSubmitted ? (
                    <div style={styles.bookingSuccess}>
                        <h3 style={{ color: '#3D1A4C', fontFamily: "'Playfair Display', serif", marginBottom: '10px' }}>Agendamento Realizado com Sucesso! 💜</h3>
                        <p style={styles.bookingSuccessText}>
                            Seus dados foram salvos e enviados para a nossa equipe. Entraremos em contato em breve para confirmar os detalhes.
                        </p>

                        {lastWhatsappLink && (
                            <a
                                href={lastWhatsappLink}
                                target="_blank"
                                rel="noreferrer"
                                style={{ ...styles.primaryButton, display: 'inline-block', marginBottom: '14px' }}
                            >
                                {whatsappBlocked ? 'Avisar Maria no WhatsApp' : 'Reenviar aviso no WhatsApp'}
                            </a>
                        )}

                        <br />
                        <button onClick={() => setFormSubmitted(false)} style={styles.bookingResetLink}>
                            Fazer novo agendamento
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleBookingSubmit} style={styles.bookingForm}>

                        <div style={styles.scarcityAlert}>
                            ✨ <strong>Atenção:</strong> Atendimentos exclusivos aos Domingos e Segundas. Vagas limitadas.
                        </div>

                        {professionalLoadFailed && (
                            <div style={styles.scarcityAlert}>
                                ⚠️ Não conseguimos carregar os dados da clínica agora. Recarregue a
                                página em alguns instantes — o servidor pode estar iniciando após um
                                período sem uso.
                            </div>
                        )}

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
                                onChange={handleDateChange}
                                style={styles.bookingInput}
                            />
                            {/* Se a data for inválida (terça a sábado), mostra o texto em vermelho e desabilita o resto */}
                            {dateError && <p style={styles.bookingErrorText}>{dateError}</p>}
                        </div>

                        {!formData.treatmentId && formData.date && !dateError && (
                            <p style={styles.bookingErrorText}>Escolha o tratamento antes de ver os horários.</p>
                        )}

                        {formData.date && formData.treatmentId && !dateError && (
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
                            onClick={(e) => {
                                if (!formData.time) {
                                    e.preventDefault();
                                    alert('Por favor, clique em um dos horários disponíveis antes de confirmar o agendamento.');
                                }
                            }}
                            disabled={submitting || !!dateError}
                            style={{
                                ...styles.bookingSubmitButton,
                                opacity: (submitting || !!dateError) ? 0.6 : 1,
                                cursor: (submitting || !!dateError) ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {submitting ? 'Enviando agendamento...' : 'Confirmar Agendamento'}
                        </button>
                    </form>
                )}
            </section>

            {/* Galeria / Instagram */}
            <section id="instagram" style={styles.gallerySection}>
                <div style={styles.sectionHeader}>
                    <span style={styles.eyebrowCentered}>Conheça nosso trabalho</span>
                    <h2 style={styles.sectionTitle}>Estética, cuidado e resultados em cada detalhe</h2>
                    <p style={styles.sectionSubtitle}>Acompanhe mais conteúdos e novidades no Instagram da clínica.</p>
                </div>
                <div style={{ ...styles.galleryGrid, gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))' }}>
                    {[
                        { src: '/foto11.jpg', alt: 'Detalhe do procedimento facial' },
                        { src: '/foto12.jpg', alt: 'Atendimento estético facial' },
                        { src: '/foto13.jpg', alt: 'Cuidado facial personalizado' },
                        { src: '/foto6.jpg.jpeg', alt: 'Aplicação de cuidados faciais' },
                        { src: '/foto7.jpg.jpeg', alt: 'Tratamento facial' },
                        { src: '/foto9.jpg.jpeg', alt: 'Momento de cuidado estético' },
                    ].map((image, index) => (
                        <img
                            key={image.src}
                            src={image.src}
                            alt={image.alt}
                            loading="lazy"
                            decoding="async"
                            style={{ ...styles.galleryImage, height: isMobile ? '180px' : '250px', animationDelay: `${index * 0.05}s` }}
                        />
                    ))}
                </div>
                <div style={styles.galleryCta}>
                    <a
                        href={siteSettings.instagramUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="myl-btn-primary"
                        style={styles.primaryActionButton}
                    >
                        Ver Instagram {instagramHandle}
                    </a>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" style={{ ...styles.faqSection, position: 'relative' as const }}>
                {editable && <EditPencil label="Perguntas frequentes" onClick={() => editSection('faq')} />}
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>{siteSettings.faqSectionTitle}</h2>
                    <p style={styles.sectionSubtitle}>{siteSettings.faqSectionSubtitle}</p>
                </div>
                <div style={styles.faqContainer}>
                    {siteSettings.faqItems.map((faq, index) => (
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

            <button onClick={() => setChatOpen(!chatOpen)} style={styles.chatButton} aria-label="Abrir chatbot">💬</button>
            {chatOpen && (
                <div style={styles.chatPanel}>
                    <div style={styles.chatHeader}>
                        <strong>Assistente virtual</strong>
                        <button onClick={() => setChatOpen(false)} style={styles.chatClose}>×</button>
                    </div>
                    <div style={styles.chatMessages}>
                        {chatMessages.map((m, i) => <div key={i} style={m.role === 'user' ? styles.chatUserMessage : styles.chatBotMessage}>{m.text}</div>)}
                        {chatLoading && <div style={styles.chatBotMessage}>Digitando...</div>}
                    </div>
                    <form onSubmit={sendChatMessage} style={styles.chatForm}>
                        <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Digite sua mensagem..." style={styles.chatInput} />
                        <button type="submit" disabled={chatLoading} style={styles.chatSend}>Enviar</button>
                    </form>
                </div>
            )}

            {/* Footer */}
            <footer id="contato" style={{ ...styles.footer, position: 'relative' as const }}>
                {editable && <EditPencil label="Rodapé" onClick={() => editSection('footer')} />}
                <div style={styles.footerContent}>
                    <div>
                        <h3 style={styles.footerTitle}>Maria Yasmim Lopes</h3>
                        <p style={styles.footerTextDesc}>{siteSettings.footerTagline}</p>
                    </div>
                    <div style={styles.footerContact}>
                        <p style={{ fontWeight: 'bold', color: '#FFF' }}>Contato:</p>
                        <p>{siteSettings.whatsapp}</p>
                        <p>{siteSettings.footerContactEmail}</p>
                        <p style={{ marginTop: '10px' }}>
                            <a href={siteSettings.instagramUrl} target="_blank" rel="noreferrer" style={styles.footerInstagramLink}>
                                {instagramHandle}
                            </a>
                        </p>
                    </div>
                </div>
                <div style={styles.footerBottom}>
                    <p>{siteSettings.footerCopyrightText}</p>
                </div>
            </footer>
        </div>
    );
}

const styles = {
    container: { fontFamily: "'Montserrat', sans-serif", backgroundColor: '#FAF9F6', color: '#2D1537', minHeight: '100vh', margin: 0, padding: 0 },
    chatButton: { position: 'fixed' as const, bottom: '30px', left: '30px', width: '58px', height: '58px', borderRadius: '50%', border: 'none', backgroundColor: '#A259C4', color: '#FFF', fontSize: '24px', cursor: 'pointer', zIndex: 9999, boxShadow: '0 6px 16px rgba(0,0,0,0.2)' },
    chatPanel: { position: 'fixed' as const, bottom: '100px', left: '30px', width: '350px', maxWidth: 'calc(100vw - 30px)', height: '480px', backgroundColor: '#FFF', borderRadius: '18px', boxShadow: '0 10px 35px rgba(0,0,0,0.22)', zIndex: 10000, display: 'flex', flexDirection: 'column' as const, overflow: 'hidden', border: '1px solid #E8D7F1' },
    chatHeader: { backgroundColor: '#A259C4', color: '#FFF', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    chatClose: { background: 'transparent', border: 'none', color: '#FFF', fontSize: '26px', cursor: 'pointer' },
    chatMessages: { flex: 1, overflowY: 'auto' as const, padding: '14px', display: 'flex', flexDirection: 'column' as const, gap: '10px', backgroundColor: '#FAF9F6' },
    chatUserMessage: { alignSelf: 'flex-end', backgroundColor: '#A259C4', color: '#FFF', padding: '10px 12px', borderRadius: '14px 14px 3px 14px', maxWidth: '80%', whiteSpace: 'pre-wrap' as const },
    chatBotMessage: { alignSelf: 'flex-start', backgroundColor: '#EEE8F1', color: '#2D1537', padding: '10px 12px', borderRadius: '14px 14px 14px 3px', maxWidth: '80%', whiteSpace: 'pre-wrap' as const },
    chatForm: { display: 'flex', gap: '8px', padding: '10px', borderTop: '1px solid #E8D7F1' },
    chatInput: { flex: 1, padding: '10px', border: '1px solid #D8C4E2', borderRadius: '20px', outline: 'none' },
    chatSend: { border: 'none', backgroundColor: '#A259C4', color: '#FFF', borderRadius: '18px', padding: '0 14px', cursor: 'pointer' },
    floatingWhatsApp: { position: 'fixed' as const, bottom: '30px', right: '30px', backgroundColor: '#25D366', color: '#FFF', borderRadius: '50%', width: '65px', height: '65px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(37,211,102,0.4)', zIndex: 9999, transition: 'transform 0.3s', cursor: 'pointer' },
    header: { boxSizing: 'border-box' as const, position: 'fixed' as const, top: 0, left: 0, width: '100%', backgroundColor: 'transparent', borderBottom: '1px solid transparent', zIndex: 1000, padding: '16px 20px' },
    headerContent: { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    logoContainer: { display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' as const },
    logoCircle: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#A259C4', objectFit: 'cover' as const },
    logoTextBlock: { display: 'flex', flexDirection: 'column' as const, lineHeight: 1.2 },
    logoText: { fontWeight: 'bold', color: '#3D1A4C', fontFamily: "'Playfair Display', serif" },
    logoSubtext: { fontSize: '10px', fontWeight: '600', color: '#A259C4', letterSpacing: '2px', textTransform: 'uppercase' as const },
    nav: { display: 'flex', gap: '30px' },
    navLink: { textDecoration: 'none', color: '#2D1537', fontWeight: '500', fontSize: '15px' },
    primaryButton: { backgroundColor: '#A259C4', color: '#FFF', padding: '8px 16px', borderRadius: '25px', textDecoration: 'none', fontWeight: '600', fontSize: '13px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', whiteSpace: 'nowrap' as const },
    hero: { padding: '130px 20px 70px 20px', background: 'linear-gradient(to bottom, #F3E6F8, #FAF9F6)' },
    heroGrid: { maxWidth: '1500px', margin: '0 auto', display: 'flex', flexWrap: 'wrap-reverse' as const, gap: '50px', alignItems: 'center' },
    heroTextCol: { flex: '1 1 420px', maxWidth: '520px', textAlign: 'left' as const },
    heroPhotoCol: { flex: '1.3 1 480px', maxWidth: '1000px', display: 'flex' },
    eyebrow: { color: '#A259C4', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' as const, letterSpacing: '2px', display: 'inline-block', marginBottom: '16px' },
    eyebrowCentered: { color: '#A259C4', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' as const, letterSpacing: '2px', display: 'inline-block', marginBottom: '10px' },
    badge: { backgroundColor: '#E3C2F0', color: '#4A155E', padding: '8px 18px', borderRadius: '25px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' as const, display: 'inline-block', marginBottom: '20px', letterSpacing: '1px' },
    heroTitle: { fontSize: '46px', fontWeight: '700', color: '#2D1537', marginBottom: '18px', lineHeight: 1.15, fontFamily: "'Playfair Display', serif" },
    heroText: { fontSize: '17px', color: '#5A4A60', marginBottom: '30px', lineHeight: 1.6, maxWidth: '520px' },
    primaryActionButton: { display: 'inline-block', backgroundColor: '#A259C4', color: '#FFF', padding: '15px 30px', borderRadius: '30px', textDecoration: 'none', fontWeight: '600', fontSize: '15px', boxShadow: '0 4px 10px rgba(162,89,196,0.35)', transition: 'transform 0.2s', whiteSpace: 'nowrap' as const },
    secondaryActionButton: { display: 'inline-block', backgroundColor: 'transparent', color: '#2D1537', padding: '15px 30px', borderRadius: '30px', textDecoration: 'none', fontWeight: '600', fontSize: '15px', border: '1.5px solid #2D1537', whiteSpace: 'nowrap' as const },
    heroActions: { display: 'flex', gap: '15px', flexWrap: 'wrap' as const, alignItems: 'center', marginBottom: '35px' },
    trustRow: { display: 'flex', gap: '28px', flexWrap: 'wrap' as const },
    trustItem: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: '#4A3B50' },
    trustIcon: { fontSize: '16px' },
    carouselContainer: { position: 'relative' as const, width: '100%', margin: '0 auto', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 45px rgba(45,21,55,0.2)', backgroundColor: '#2D1537' },
    carouselSlide: { position: 'relative' as const, width: '100%', aspectRatio: '6 / 5', maxHeight: '560px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    carouselImage: { position: 'relative' as const, width: '100%', height: '100%', objectFit: 'cover' as const, objectPosition: 'center' as const, zIndex: 2 },
    carouselCaption: { position: 'absolute' as const, bottom: 0, left: 0, width: '100%', backgroundColor: 'rgba(45, 21, 55, 0.85)', color: '#fff', padding: '12px', fontSize: '15px', fontWeight: 'bold', zIndex: 5 },
    carouselBtnLeft: { position: 'absolute' as const, top: '50%', left: '15px', transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '38px', height: '38px', cursor: 'pointer', zIndex: 10, fontSize: '16px' },
    carouselBtnRight: { position: 'absolute' as const, top: '50%', right: '15px', transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '38px', height: '38px', cursor: 'pointer', zIndex: 10, fontSize: '16px' },
    dotsContainer: { display: 'flex', justifyContent: 'center', gap: '8px', padding: '10px', backgroundColor: '#FAF9F6' },
    dot: { width: '10px', height: '10px', borderRadius: '50%', cursor: 'pointer', transition: 'background-color 0.3s' },
    statsGrid: { display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' as const, maxWidth: '850px', margin: '0 auto' },
    statCard: { backgroundColor: '#FFF', border: '1px solid #E8D7F1', padding: '15px 30px', borderRadius: '14px', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', flex: '1 1 200px' },
    statNumber: { fontSize: '24px', marginBottom: '4px' },
    statLabel: { fontSize: '13px', color: '#6D5D75', fontWeight: '600' },
    benefitsBar: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '40px', flexWrap: 'wrap' as const, backgroundColor: '#2D1537', color: '#FAF9F6', padding: '20px', fontSize: '14px', textAlign: 'center' as const },
    benefitItem: { display: 'flex', alignItems: 'center', gap: '8px' },
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
    // Composição editorial assimétrica (item 7 do redesign): foto grande com o
    // texto avançando por cima dela, em vez de duas colunas simétricas.
    aboutGridEditorial: { display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(280px, 0.85fr)', alignItems: 'start', gap: '0px' },
    aboutPhotoWrap: { gridColumn: '1 / 2', gridRow: '1 / 2' },
    aboutPhotoEditorial: { width: '100%', height: '640px', objectFit: 'cover' as const, borderRadius: '28px', boxShadow: '0 25px 55px rgba(45,21,55,0.22)', display: 'block' },
    aboutTextEditorial: { gridColumn: '2 / 3', gridRow: '1 / 2', alignSelf: 'center', backgroundColor: '#FAF9F6', borderRadius: '24px', padding: '44px 38px', marginLeft: '-70px', boxShadow: '0 20px 50px rgba(45,21,55,0.12)', border: '1px solid #F0E4F5', zIndex: 2, position: 'relative' as const },
    aboutChipsRow: { display: 'flex', flexWrap: 'wrap' as const, gap: '10px', marginTop: '22px' },
    aboutChip: { fontSize: '12px', fontWeight: '600', color: '#4A155E', backgroundColor: '#F3E6F8', padding: '7px 14px', borderRadius: '20px', letterSpacing: '0.3px' },
    aboutText: { flex: '1 1 400px' },
    aboutTitle: { fontSize: '36px', fontWeight: '700', color: '#2D1537', marginBottom: '20px', fontFamily: "'Playfair Display', serif" },
    aboutParagraph: { fontSize: '16px', color: '#5A4A60', lineHeight: 1.8, marginBottom: '16px' },
    section: { padding: '80px 20px', maxWidth: '1200px', margin: '0 auto' },
    sectionHeader: { textAlign: 'center' as const, marginBottom: '50px' },
    sectionTitle: { fontSize: '36px', fontWeight: '700', color: '#2D1537', marginBottom: '12px', fontFamily: "'Playfair Display', serif" },
    sectionSubtitle: { fontSize: '16px', color: '#6D5D75' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' },
    card: { backgroundColor: '#FFF', padding: '35px', borderRadius: '20px', border: '1px solid #E8D7F1', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', textAlign: 'left' as const, display: 'flex', flexDirection: 'column' as const, justifyContent: 'space-between' },
    cardIconCircle: { width: '54px', height: '54px', borderRadius: '50%', backgroundColor: '#F3E6F8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '18px' },
    cardTitle: { fontSize: '22px', fontWeight: 'bold', color: '#2D1537', marginBottom: '12px', fontFamily: "'Playfair Display', serif" },
    cardText: { fontSize: '15px', color: '#6D5D75', lineHeight: 1.6, marginBottom: '20px' },
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
    bookingSubmitButton: { backgroundColor: '#2D1537', color: '#FFF', padding: '16px 30px', borderRadius: '30px', border: 'none', fontWeight: 'bold', fontSize: '16px', marginTop: '10px', boxShadow: '0 4px 12px rgba(45,21,55,0.2)' },
    bookingSuccess: { textAlign: 'center' as const, backgroundColor: '#F3E6F8', borderRadius: '16px', padding: '30px' },
    bookingSuccessText: { fontSize: '16px', color: '#3D1A4C', lineHeight: 1.6, marginBottom: '16px' },
    bookingErrorText: { fontSize: '14px', color: '#B3261E', marginTop: '4px' },
    bookingResetLink: { background: 'none', border: 'none', color: '#A259C4', fontWeight: 'bold', textDecoration: 'underline', cursor: 'pointer', fontSize: '14px' },
    gallerySection: { padding: '80px 20px', maxWidth: '1200px', margin: '0 auto' },
    galleryGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px', marginTop: '30px' },
    galleryImage: { width: '100%', height: '250px', objectFit: 'cover' as const, borderRadius: '18px', boxShadow: '0 8px 20px rgba(45,21,55,0.08)', backgroundColor: '#F3E6F8' },
    galleryCta: { display: 'flex', justifyContent: 'center', marginTop: '28px' },
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
};git add src/app/index.tsx
git commit -m "feat: fotos novas"