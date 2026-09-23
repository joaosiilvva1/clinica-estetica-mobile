import React, { useState, useEffect } from 'react';
import { requestChatReply, getQuickChatReply, CHAT_TIMEOUT_MS } from '../utils/clinicChat';

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
    { question: 'A limpeza de pele profunda dói?', answer: 'A sensibilidade varia de pessoa para pessoa. Algumas extrações podem causar incômodo; a Maria conduz as etapas com cuidado e você pode avisá-la se precisar de uma pausa.' },
    { question: 'De quanto em quanto tempo devo fazer a limpeza de pele?', answer: 'A frequência ideal varia conforme a necessidade da sua pele. Na avaliação, a Maria orienta o intervalo mais adequado para o seu caso.' },
    { question: 'Os produtos utilizados dão alergia?', answer: 'Algumas peles podem reagir a cosméticos. Avise antes do atendimento sobre alergias, sensibilidades ou ativos em uso para que os produtos e as etapas sejam avaliados com essa informação.' },
    { question: 'Gestante pode fazer limpeza de pele?', answer: 'Durante a gestação, produtos e etapas precisam ser avaliados individualmente. Avise a Maria antes de agendar e confirme com seu obstetra quais cuidados são adequados. Se não houver confirmação, o procedimento deve ser adiado.' },
    { question: 'O que está incluído no protocolo de R$ 130?', answer: 'O valor de R$ 130 cobre as três etapas na mesma sessão: limpeza de pele profunda, massagem facial relaxante e hidratação facial Glow. A duração aproximada é de 120 minutos, e as etapas são ajustadas às necessidades da pele no dia.' },
    { question: 'Como posso agendar um horário?', answer: 'Agende pelo WhatsApp da Maria. Os atendimentos são aos domingos e às segundas-feiras, com hora marcada; consulte a disponibilidade diretamente com ela.' },
    { question: 'Quais formas de pagamento são aceitas?', answer: 'Consulte as formas de pagamento disponíveis diretamente pelo WhatsApp da clínica.' },
    { question: 'Como funciona o cancelamento ou a remarcação?', answer: 'Para cancelar ou remarcar seu horário, entre em contato pelo WhatsApp da clínica assim que possível para que a equipe possa orientar você.' },
    { question: 'O que acontece se eu me atrasar?', answer: 'Em caso de atraso, avise pelo WhatsApp. Dependendo do tempo disponível no dia, o atendimento poderá precisar ser ajustado ou remarcado.' },
    { question: 'O que devo fazer antes do procedimento?', answer: 'As orientações podem variar conforme o tratamento. Depois do agendamento, a equipe pode orientar os cuidados específicos para o seu atendimento.' },
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
        'Atendimento com hora marcada aos domingos e segundas, em uma agenda planejada para oferecer atenção individualizada, conforto e cuidado em cada sessão.',
    instagramUrl: 'https://www.instagram.com/yasmimlopes_estetica/',
    logoUrl: '/logo-maria-yasmim-estetica-taboao-da-serra.jpg',
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
    aboutPhotoUrl: '/maria-yasmim-esteticista-taboao-da-serra.jpg',
    treatmentsEyebrow: 'Nossos tratamentos',
    treatmentsSectionTitle: 'Cuidados para realçar sua beleza',
    treatmentsSectionSubtitle: 'Procedimentos faciais personalizados para suas necessidades',
    locationSectionTitle: 'Onde Estamos',
    locationSectionSubtitle: 'Sua clínica de estética bem pertinho de você em Taboão da Serra.',
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
    const [isMobile, setIsMobile] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [heroParallax, setHeroParallax] = useState({ x: 0, y: 0 });
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [chatOpen, setChatOpen] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const [chatElapsed, setChatElapsed] = useState(0);
    const [chatError, setChatError] = useState<string | null>(null);
    const [lastChatQuestion, setLastChatQuestion] = useState('');
    const chatRequest = React.useRef<AbortController | null>(null);
    const chatBottom = React.useRef<HTMLDivElement | null>(null);
    useEffect(() => () => { chatRequest.current?.abort(); }, []);

    const [chatMessages, setChatMessages] = useState<{
        role: 'user' | 'assistant';
        text: string;
        action?: { href: string; label: string };
        source?: { href: string; label: string };
    }[]>([
        { role: 'assistant', text: 'Olá! 👋 Sou a assistente virtual da Maria Yasmim Lopes Estética. Como posso ajudar?' }
    ]);

    const defaultTreatments = [
        { id: '1', name: 'Limpeza de Pele Profunda + Massagem Facial Relaxante + Hidratação Facial Glow', description: 'Remoção de impurezas, cravos e células mortas, devolvendo o viço e a saúde da pele.', price: 130, durationMinutes: 120 }
    ];

    const [treatments, setTreatments] = useState<
        { id: string; name: string; description: string; price: number; durationMinutes: number }[]
    >(defaultTreatments);

    useEffect(() => {
        document.title = 'Maria Yasmim Lopes Estética | Taboão da Serra';
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute('content', 'Limpeza de pele profunda, massagem facial e hidratação Glow em Taboão da Serra. Atendimento personalizado com hora marcada.');

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

      .myl-booking-button:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(137,62,181,.32) !important; }
      @media (prefers-reduced-motion: reduce) { .myl-booking-button { transition: none !important; transform: none !important; } }
      .myl-booking-button:focus-visible { outline: 3px solid #4A155E; outline-offset: 4px; }
      .myl-floating-whatsapp:focus-visible { outline: 3px solid #2D1537; outline-offset: 4px; }
      @media (max-width: 800px) {
        .myl-booking-grid { grid-template-columns: minmax(0, 1fr) !important; }
        .myl-booking-grid { padding: 28px 20px !important; gap: 32px !important; border-radius: 30px !important; }
        .myl-booking-photo { width: 100%; max-width: 400px; margin: 0 auto; }
        .myl-booking-content { padding: 0 4px 8px !important; }
      }

      @media (max-width: 720px) {
        .myl-mobile-action { width: 100%; justify-content: center; }
        .myl-floating-whatsapp { width: 58px !important; height: 58px !important; right: 16px !important; bottom: max(16px, env(safe-area-inset-bottom)) !important; }
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
        { id: '1', title: 'Limpeza de pele para acne', url: '/limpeza-de-pele-acne-taboao-da-serra.jpg' },
        { id: '2', title: 'Atendimento estético facial', url: '/atendimento-estetico-facial-taboao-da-serra.jpg' },
        { id: '3', title: 'Cuidado facial personalizado', url: '/cuidado-facial-personalizado-taboao-da-serra.jpg' },
        { id: '4', title: 'Tratamento facial na clínica', url: '/tratamento-facial-na-clinica-taboao-da-serra.jpg' },
        { id: '5', title: 'Cuidado com a pele', url: '/cuidado-com-a-pele-atendimento-estetico.jpg' },
        { id: '6', title: 'Máscara facial em atendimento estético', url: '/mascara-facial-tratamento-estetico-taboao-da-serra.jpg' },
        { id: '7', title: 'Aplicação de máscara facial', url: '/aplicacao-de-mascara-facial-taboao-da-serra.jpg' },
        { id: '8', title: 'Cuidado facial personalizado', url: '/cuidado-facial-em-clinica-taboao-da-serra.jpg' },
        { id: '9', title: 'Detalhe de tratamento facial', url: '/detalhe-de-tratamento-facial-taboao-da-serra.jpg' },
        { id: '10', title: 'Cuidado com a pele em atendimento facial', url: '/pele-durante-atendimento-facial-taboao-da-serra.jpg' },
        { id: '11', title: 'Detalhe de cuidado facial', url: '/detalhe-cuidado-facial-taboao-da-serra.jpg' },
        { id: '12', title: 'Atendimento estético personalizado', url: '/atendimento-estetico-com-hora-marcada-taboao-da-serra.jpg' },
        { id: '13', title: 'Cuidado facial personalizado', url: '/procedimento-facial-personalizado-taboao-da-serra.jpg' },
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

    }, []);

    useEffect(() => {
        chatBottom.current?.scrollIntoView({ block: 'nearest' });
    }, [chatMessages, chatLoading, chatError, chatOpen]);

    const whatsappDigits = (siteSettings.whatsapp || defaultSiteSettings.whatsapp).replace(/\D/g, '');
    const buildWhatsAppLink = (message = 'Olá Maria, vi o site e gostaria de agendar uma avaliação.') =>
        `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(message)}`;
    const bookingWhatsAppLink = buildWhatsAppLink('Olá Maria, vi o site e gostaria de agendar um horário.');

    const sendChatMessage = async (e?: React.FormEvent, question = chatInput, retry = false) => {
        e?.preventDefault();
        const message = question.trim();
        if (!message || chatRequest.current) return;
        if (!retry) setChatMessages(prev => [...prev, { role: 'user', text: message }]);
        setChatInput('');
        setChatError(null);
        setLastChatQuestion(message);
        const quickReply = getQuickChatReply(message, {
            ...siteSettings,
            whatsappUrl: bookingWhatsAppLink,
            treatments,
        });
        if (quickReply) {
            setChatMessages(prev => [...prev, { role: 'assistant', ...quickReply }]);
            return;
        }
        const controller = new AbortController();
        chatRequest.current = controller;
        setChatLoading(true);
        setChatElapsed(0);
        const startedAt = Date.now();
        const intervalId = setInterval(() => setChatElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);
        let timedOut = false;
        const timeoutId = setTimeout(() => { timedOut = true; controller.abort(); }, CHAT_TIMEOUT_MS);
        try {
            const reply = await requestChatReply(API_BASE_URL, message, controller.signal);
            if (!controller.signal.aborted) setChatMessages(prev => [...prev, { role: 'assistant', text: reply }]);
        } catch {
            if (!controller.signal.aborted || timedOut) {
                setChatError(timedOut
                    ? 'O assistente demorou mais que o esperado. Você pode tentar novamente ou falar com a Maria pelo WhatsApp.'
                    : 'O assistente está indisponível no momento. As informações rápidas abaixo continuam disponíveis. Para outras dúvidas, fale com a Maria pelo WhatsApp.');
            } else {
                setChatError('Espera cancelada. Você pode tentar novamente ou falar com a Maria pelo WhatsApp.');
            }
        } finally {
            clearTimeout(timeoutId);
            clearInterval(intervalId);
            if (chatRequest.current === controller) {
                chatRequest.current = null;
                setChatLoading(false);
            }
        }
    };

    const scrollToBooking = () => {
        document.getElementById('agendamento')?.scrollIntoView({ behavior: 'smooth' });
    };

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };
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
            <a href={buildWhatsAppLink()} target="_blank" rel="noopener noreferrer" aria-label="Falar com a Maria pelo WhatsApp" title="Agendar pelo WhatsApp" className="myl-floating-whatsapp" style={styles.floatingWhatsApp}>
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
                                <img
                                    src={photos[currentSlide].url}
                                    alt={photos[currentSlide].title}
                                    loading={currentSlide === 0 ? 'eager' : 'lazy'}
                                    decoding="async"
                                    onError={(event) => {
                                        const image = event.currentTarget;
                                        image.onerror = null;
                                        image.src = defaultPhotos[0].url;
                                    }}
                                    style={styles.carouselImage}
                                />
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
                                        {item.name.toLowerCase().includes('limpeza de pele profunda') && item.name.toLowerCase().includes('massagem facial') && item.name.toLowerCase().includes('hidratação facial glow') && (
                                            <p style={{ color: '#5A4A60', backgroundColor: '#F4ECF7', border: '1px solid #E8D7F1', borderRadius: '14px', padding: '13px 16px', fontSize: '14px', lineHeight: 1.65, maxWidth: '440px', margin: '0 0 22px' }}>
                                                As três etapas estão incluídas no mesmo atendimento e no valor do protocolo completo.
                                            </p>
                                        )}
                                        <div style={{ display: 'flex', gap: '22px', marginBottom: '28px' }}>
                                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#6D5D75' }}>
                                                <b style={{ color: '#2D1537', fontWeight: 700 }}>R$ {item.price}</b>
                                            </span>
                                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#6D5D75' }}>
                                                <b style={{ color: '#2D1537', fontWeight: 700 }}>{item.durationMinutes} min</b>
                                            </span>
                                        </div>
                                        <button onClick={scrollToBooking} className="myl-btn-primary" style={styles.primaryActionButton}>
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

            {/* Agendamento manual pelo WhatsApp */}
            <section id="agendamento" aria-labelledby="booking-title" style={{ ...styles.bookingSection, scrollMarginTop: topOffset + 100 }}>
                <div className="myl-booking-grid" style={styles.bookingGrid}>
                    <div className="myl-booking-photo" style={styles.bookingPhotoWrap}>
                        <img
                            src="/atendimento-estetico-com-hora-marcada-taboao-da-serra.jpg"
                            alt="Cuidado facial com máscara e faixa lilás na clínica Maria Yasmim Lopes Estética"
                            loading="lazy"
                            decoding="async"
                            width={960}
                            height={1280}
                            style={styles.bookingPhoto}
                        />
                    </div>
                    <div className="myl-booking-content" style={styles.bookingContent}>
                        <span style={styles.bookingEyebrow}>AGENDAMENTO <span aria-hidden="true" style={{ width: 36, height: 1, backgroundColor: '#B997CD' }} /></span>
                        <h2 id="booking-title" style={styles.bookingTitle}>Seu momento de cuidado começa aqui.</h2>
                        <p style={styles.bookingDescription}>
                            Tratamentos faciais pensados para cuidar da sua pele com atenção, conforto e atendimento personalizado.
                        </p>
                        <ul style={styles.bookingDetails}>
                            <li style={styles.bookingDetail}><span style={styles.bookingIcon}><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg></span> Taboão da Serra</li>
                            <li style={styles.bookingDetail}><span style={styles.bookingIcon}><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg></span> Atendimento com hora marcada</li>
                        </ul>
                        <a href={bookingWhatsAppLink} target="_blank" rel="noopener noreferrer" className="myl-booking-button" style={styles.bookingButton}>
                            <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M21 11.5a9 9 0 0 1-13.3 7.9L3 21l1.5-4.6A9 9 0 1 1 21 11.5Z" /><path d="M8 7.5c-.8 1.5.2 3.8 2 5.6s4.1 2.8 5.6 2l1-1.5-2.5-1.4-1 1c-1.4-.5-2.5-1.6-3-3l1-1L9.5 6.8Z" /></svg>
                            Agendar pelo WhatsApp
                        </a>
                        <p style={styles.bookingNote}>Combine seu horário diretamente com a Maria pelo WhatsApp.</p>
                    </div>
                </div>
            </section>

            {/* Galeria / Instagram */}
            <section id="instagram" style={styles.gallerySection}>
                <div style={styles.sectionHeader}>
                    <span style={styles.eyebrowCentered}>Conheça nosso trabalho</span>
                    <h2 style={styles.sectionTitle}>Estética, cuidado e resultados em cada detalhe</h2>
                    <p style={styles.sectionSubtitle}>Veja registros de atendimentos e cuidados faciais da clínica. No Instagram, acompanhe novas publicações e novidades.</p>
                </div>
                <div style={{ ...styles.galleryGrid, gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))' }}>
                    {[
                        { src: '/detalhe-cuidado-facial-taboao-da-serra.jpg', alt: 'Detalhe de cuidado facial durante atendimento' },
                        { src: '/cuidado-facial-em-clinica-taboao-da-serra.jpg', alt: 'Cliente recebendo atendimento estético facial' },
                        { src: '/procedimento-facial-personalizado-taboao-da-serra.jpg', alt: 'Cuidado facial personalizado na clínica' },
                        { src: '/mascara-facial-tratamento-estetico-taboao-da-serra.jpg', alt: 'Máscara facial preparada para atendimento estético' },
                        { src: '/aplicacao-de-mascara-facial-taboao-da-serra.jpg', alt: 'Aplicação de cuidados faciais durante atendimento' },
                        { src: '/detalhe-de-tratamento-facial-taboao-da-serra.jpg', alt: 'Detalhe de tratamento facial personalizado' },
                    ].map((image, index) => (
                        <img
                            key={image.src}
                            src={image.src}
                            alt={image.alt}
                            loading="lazy"
                            decoding="async"
                            onError={(event) => {
                                const imageElement = event.currentTarget;
                                imageElement.onerror = null;
                                imageElement.src = '/mascara-facial-tratamento-estetico-taboao-da-serra.jpg';
                            }}
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
                        Abrir perfil no Instagram {instagramHandle}
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
                <div role="dialog" aria-label="Assistente virtual da clínica" style={styles.chatPanel}>
                    <div style={styles.chatHeader}>
                        <strong>Assistente virtual</strong>
                        <button onClick={() => setChatOpen(false)} aria-label="Fechar assistente" style={styles.chatClose}>×</button>
                    </div>
                    <div role="log" aria-label="Conversa" aria-live="polite" style={styles.chatMessages}>
                        {chatMessages.map((m, i) => <div key={i} style={m.role === 'user' ? styles.chatUserMessage : styles.chatBotMessage}>
                            <span>{m.text}</span>
                            {m.action && <a href={m.action.href} target="_blank" rel="noopener noreferrer" style={styles.chatReplyLink}>{m.action.label} ↗</a>}
                            {m.source && <a href={m.source.href} target="_blank" rel="noopener noreferrer" style={styles.chatSourceLink}>{m.source.label} ↗</a>}
                        </div>)}
                        {chatLoading && <div style={styles.chatBotMessage}>
                            <div role="status">{chatElapsed < 15 ? 'Buscando sua resposta…' : 'Ainda aguardando. No primeiro acesso, o serviço pode levar mais tempo para iniciar.'}</div>
                            <div aria-live="off" style={{ fontSize: '12px', marginTop: '8px', color: '#6D5D75' }}>Tempo de espera: {chatElapsed}s · limite de {CHAT_TIMEOUT_MS / 1000}s</div>
                            <button type="button" onClick={() => chatRequest.current?.abort()} style={styles.chatTextButton}>Cancelar espera</button>
                        </div>}
                        {chatError && <div role="alert" style={styles.chatBotMessage}>{chatError}<br /><button type="button" onClick={() => sendChatMessage(undefined, lastChatQuestion, true)} style={styles.chatTextButton}>Tentar novamente</button></div>}
                        <div ref={chatBottom} />
                    </div>
                    <div style={styles.chatQuickActions}>
                        {[
                            { label: 'Agendar', question: 'Como faço para agendar?' },
                            { label: 'Limpeza de pele', question: 'O que é a limpeza de pele?' },
                            { label: 'Massagem facial', question: 'O que é a massagem facial?' },
                            { label: 'Hidratação', question: 'Como funciona a hidratação facial?' },
                            { label: 'Preparo', question: 'Como me preparo antes do procedimento?' },
                            { label: 'Pós-procedimento', question: 'Quais cuidados ter depois do procedimento?' },
                            { label: 'Valores e duração', question: 'Quais são os valores e a duração?' },
                            { label: 'Localização', question: 'Onde fica a clínica?' },
                            { label: 'Horários', question: 'Quais são os horários de atendimento?' },
                        ].map(({ label, question }) => <button key={label} type="button" disabled={chatLoading} onClick={() => sendChatMessage(undefined, question)} style={{ ...styles.chatQuickButton, opacity: chatLoading ? .5 : 1 }}>{label}</button>)}
                    </div>
                    <a href={bookingWhatsAppLink} target="_blank" rel="noopener noreferrer" style={styles.chatWhatsapp}>Falar com a Maria pelo WhatsApp ↗</a>
                    <form onSubmit={sendChatMessage} style={styles.chatForm}>
                        <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} aria-label="Sua mensagem" maxLength={1500} placeholder="Digite sua mensagem..." style={styles.chatInput} />
                        <button type="submit" disabled={chatLoading || !chatInput.trim()} style={{ ...styles.chatSend, opacity: chatLoading || !chatInput.trim() ? .5 : 1 }}>Enviar</button>
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
    chatPanel: { position: 'fixed' as const, bottom: '100px', left: '16px', width: '370px', maxWidth: 'calc(100vw - 32px)', height: '560px', maxHeight: 'calc(100dvh - 120px)', boxSizing: 'border-box' as const, backgroundColor: '#FFF', borderRadius: '18px', boxShadow: '0 10px 35px rgba(0,0,0,0.22)', zIndex: 10000, display: 'flex', flexDirection: 'column' as const, overflow: 'hidden', border: '1px solid #E8D7F1' },
    chatHeader: { backgroundColor: '#A259C4', color: '#FFF', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    chatClose: { background: 'transparent', border: 'none', color: '#FFF', fontSize: '26px', cursor: 'pointer' },
    chatMessages: { flex: 1, minHeight: 0, overflowY: 'auto' as const, padding: '14px', display: 'flex', flexDirection: 'column' as const, gap: '10px', backgroundColor: '#FAF9F6' },
    chatUserMessage: { alignSelf: 'flex-end', backgroundColor: '#A259C4', color: '#FFF', padding: '10px 12px', borderRadius: '14px 14px 3px 14px', maxWidth: '80%', whiteSpace: 'pre-wrap' as const },
    chatBotMessage: { alignSelf: 'flex-start', backgroundColor: '#EEE8F1', color: '#2D1537', padding: '10px 12px', borderRadius: '14px 14px 14px 3px', maxWidth: '80%', whiteSpace: 'pre-wrap' as const, display: 'flex', flexDirection: 'column' as const, gap: '8px' },
    chatReplyLink: { alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', minHeight: '40px', marginTop: '3px', padding: '0 14px', borderRadius: '20px', backgroundColor: '#8739A8', color: '#FFF', fontSize: '12px', fontWeight: '600', textDecoration: 'none' },
    chatSourceLink: { alignSelf: 'flex-start', color: '#644276', fontSize: '11px', lineHeight: 1.5, textDecoration: 'underline', overflowWrap: 'anywhere' as const },
    chatTextButton: { border: 'none', background: 'transparent', color: '#71358F', textDecoration: 'underline', padding: '10px 0', fontFamily: 'inherit', cursor: 'pointer', minHeight: '44px' },
    chatQuickActions: { display: 'flex', gap: '6px', flexWrap: 'wrap' as const, padding: '8px 10px 0' },
    chatQuickButton: { border: '1px solid #E8D7F1', backgroundColor: '#FAF7FC', color: '#603574', borderRadius: '18px', padding: '8px 10px', fontSize: '12px', minHeight: '40px', cursor: 'pointer' },
    chatWhatsapp: { color: '#71358F', fontSize: '12px', textAlign: 'center' as const, padding: '10px', textDecoration: 'none', lineHeight: 1.5 },
    chatForm: { display: 'flex', gap: '8px', padding: '10px', borderTop: '1px solid #E8D7F1' },
    chatInput: { flex: 1, minWidth: 0, padding: '10px', border: '1px solid #D8C4E2', borderRadius: '20px', outline: 'none' },
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
    bookingSection: { position: 'relative' as const, isolation: 'isolate' as const, padding: '90px 20px', maxWidth: '1200px', margin: '0 auto' },
    bookingGrid: { position: 'relative' as const, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', alignItems: 'center', gap: 'clamp(28px, 4vw, 56px)', padding: 'clamp(28px, 4vw, 48px)', borderRadius: '40px', background: 'linear-gradient(120deg, rgba(255,255,255,.64), rgba(242,229,249,.6))', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,.9)', boxShadow: '0 16px 44px -20px rgba(77,35,96,.18), inset 0 0 0 1px rgba(232,215,241,.35)' },
    bookingPhotoWrap: { position: 'relative' as const, aspectRatio: '9 / 10', minWidth: 0, width: '100%', maxWidth: '440px', margin: '0 auto' },
    bookingPhoto: { position: 'absolute' as const, inset: 0, width: '100%', height: '100%', objectFit: 'cover' as const, objectPosition: 'center', display: 'block', borderRadius: '24px', boxShadow: '0 16px 38px rgba(58,28,70,.16)' },
    bookingContent: { display: 'flex', flexDirection: 'column' as const, justifyContent: 'center', alignItems: 'flex-start', minWidth: 0 },
    bookingEyebrow: { display: 'flex', alignItems: 'center', gap: '14px', color: '#805197', fontSize: '11px', fontWeight: '600', letterSpacing: '3px', marginBottom: '22px' },
    bookingTitle: { fontFamily: "'Playfair Display', serif", fontSize: 'clamp(32px, 3.6vw, 48px)', fontWeight: '500', lineHeight: 1.15, letterSpacing: '-.8px', color: '#2D1537', margin: '0 0 22px' },
    bookingDescription: { fontSize: '15px', lineHeight: 1.85, color: '#65566C', margin: '0 0 26px' },
    bookingDetails: { listStyle: 'none', padding: 0, margin: '0 0 30px', display: 'flex', flexDirection: 'column' as const, gap: '12px', color: '#4A3B50', fontSize: '13px', lineHeight: 1.6 },
    bookingDetail: { display: 'flex', alignItems: 'center', gap: '12px' },
    bookingIcon: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', flexShrink: 0, borderRadius: '50%', color: '#87569F', backgroundColor: 'rgba(255,255,255,.6)', border: '1px solid rgba(183,148,200,.24)' },
    bookingButton: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxSizing: 'border-box' as const, width: '100%', minHeight: '60px', padding: '16px 18px', borderRadius: '32px', background: 'linear-gradient(110deg, #9144B8, #7733A0)', color: '#FFF', textDecoration: 'none', fontSize: '14px', fontWeight: '600', lineHeight: 1.5, textAlign: 'center' as const, boxShadow: '0 8px 24px rgba(137,62,181,.25), inset 0 1px 0 rgba(255,255,255,.2)', transition: 'transform .25s ease, box-shadow .25s ease' },
    bookingNote: { fontSize: '11px', lineHeight: 1.8, color: '#73627C', margin: '16px 0 0', textAlign: 'center' as const, width: '100%' },
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
};
