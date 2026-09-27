import { imageDimensions } from '../utils/imageDimensions';
import React, { useState, useEffect } from 'react';
import { requestChatReply, getQuickChatReply, CHAT_TIMEOUT_MS } from '../utils/clinicChat';


function SiteImage({ src, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
    const dimensions = src ? imageDimensions[src] : undefined;
    // Preserve original photo detail while deferring images below the fold.
    return <img loading="lazy" decoding="async" {...props} src={src}
        width={props.width ?? dimensions?.width} height={props.height ?? dimensions?.height} />;
}

function GalleryPhoto({ src, alt, children }: { src: string; alt: string; children: React.ReactNode }) {
    const dialog = React.useRef<HTMLDialogElement>(null);
    const [open, setOpen] = useState(false);
    useEffect(() => {
        if (!open) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        dialog.current?.showModal();
        return () => { document.body.style.overflow = previous; };
    }, [open]);
    return <>
        <button type="button" className="myl-photo-open" aria-label={`Ampliar foto: ${alt}`} onClick={() => setOpen(true)}>{children}</button>
        {open && <dialog ref={dialog} className="myl-photo-dialog" aria-label={alt} onClose={() => setOpen(false)} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
            <button type="button" className="myl-photo-close" autoFocus onClick={() => dialog.current?.close()}>Fechar ×</button>
            <img src={src} alt={alt} />
            <p>{alt}</p>
        </dialog>}
    </>;
}

const landingStyles = `
      html { scroll-behavior: smooth; }
      .myl-photo-open { display:block; width:100%; height:100%; border:0; padding:0; background:transparent; cursor:zoom-in; }
      .myl-photo-open:focus-visible { outline:3px solid #87569F; outline-offset:-4px; }
      .myl-gallery-card figcaption { pointer-events:none; }
      .myl-photo-dialog { position:fixed; inset:0; width:min(92vw,960px); max-width:92vw; max-height:92dvh; box-sizing:border-box; padding:56px 16px 16px; border:0; border-radius:20px; background:#FAF9F6; color:#2D1537; }
      .myl-photo-dialog::backdrop { background:rgba(22,12,28,.85); }
      .myl-gallery-card .myl-photo-dialog img { width:100%; height:70dvh; object-fit:contain; }
      .myl-photo-dialog p { margin:12px 0 0; text-align:center; font-size:14px; }
      .myl-photo-close { position:absolute; right:14px; top:10px; min-height:40px; padding:8px 16px; border:1px solid #DCC8E6; border-radius:22px; background:#fff; color:#4A155E; font:600 14px/1.4 sans-serif; cursor:pointer; }
      a[href*="wa.me"]:not([title]) { background:#A259C4 !important; border-radius:28px !important; }
      .myl-care-guide-result a[href*="wa.me"] { background:transparent !important; box-shadow:none !important; color:#754386; }
      @media(max-width:720px) { .myl-hero { padding:100px 18px 40px !important; } .myl-hero h1 { font-size:36px !important; } .myl-hero-grid { gap:28px !important; } }


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

      .myl-gallery-card { position: relative; isolation: isolate; aspect-ratio: 1 / 1; overflow: hidden; margin: 0; border-radius: 22px; background: #F1E9F2; box-shadow: 0 12px 28px rgba(45,21,55,.09); }
      .myl-gallery-card::after { content: ''; position: absolute; inset: 35% 0 0; z-index: 0; background: linear-gradient(180deg, transparent, rgba(28,13,34,.62)); pointer-events: none; }
      .myl-gallery-card img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform .65s cubic-bezier(.2,.8,.2,1); }
      .myl-gallery-card:hover img { transform: none; }
      .myl-gallery-card figcaption { position: absolute; inset: auto 15px 15px; z-index: 1; display: flex; justify-content: flex-start; }
      .myl-gallery-card figcaption span { padding: 8px 12px; border: 1px solid rgba(255,255,255,.4); border-radius: 999px; color: #fff; background: rgba(45,21,55,.3); backdrop-filter: blur(9px); -webkit-backdrop-filter: blur(9px); font-size: 12px; font-weight: 600; letter-spacing: .2px; }
      .myl-instagram-link { display: inline-flex; align-items: center; gap: 13px; min-height: 64px; padding: 10px 17px; border: 1px solid #E8D9EA; border-radius: 20px; color: #4A3151; background: rgba(255,255,255,.84); box-shadow: 0 8px 24px rgba(45,21,55,.07); text-decoration: none; transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease; }
      .myl-instagram-link > svg { flex: 0 0 auto; color: #A34A9D; }
      .myl-instagram-link > span:nth-child(2) { display: flex; flex-direction: column; gap: 3px; text-align: left; }
      .myl-instagram-link small { color: #826E88; font-size: 11px; }
      .myl-instagram-link strong { color: #38223F; font-size: 14px; font-weight: 700; }
      .myl-instagram-arrow { margin-left: 5px; color: #87569F; font-size: 19px; }
      .myl-instagram-link:hover { transform: translateY(-2px); border-color: #D9BBDD; box-shadow: 0 12px 28px rgba(45,21,55,.12); }
      @media (max-width: 720px) { .myl-gallery-grid { gap: 11px !important; } .myl-gallery-card { border-radius: 15px; } .myl-gallery-card figcaption { inset: auto 8px 8px; } .myl-gallery-card figcaption span { padding: 6px 9px; font-size: 10px; } }

      .myl-faq-item summary { list-style:none; cursor:pointer; min-height:44px; gap:16px; }
      .myl-faq-item summary::-webkit-details-marker { display:none; }
      .myl-faq-symbol::before { content:'+'; }
      .myl-faq-item[open] .myl-faq-symbol::before { content:'−'; }
      .myl-faq-item summary:focus-visible,.myl-more-faqs:focus-visible { outline:3px solid #87569F; outline-offset:4px; }
      .myl-more-faqs { display:block; margin:24px auto 0; padding:13px 22px; border:1px solid #DCC8E6; border-radius:24px; background:#fff; color:#754386; font:600 15px/1.5 'Montserrat',sans-serif; cursor:pointer; }
      @media (max-width:720px), (prefers-reduced-motion:reduce) {
        .myl-fade-up,.myl-float,.myl-gallery-card { animation:none !important; opacity:1 !important; transform:none !important; }
        .myl-float { display:none; }
        html { scroll-behavior:auto; }
      }
      .myl-faq-grid { display: grid !important; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: start; gap: 15px; }
      @media (max-width: 760px) { .myl-faq-grid { grid-template-columns: minmax(0, 1fr); } }
      @media (prefers-reduced-motion: reduce) { .myl-gallery-card img, .myl-instagram-link { transition: none !important; } }

      .myl-gallery-track { display:flex; gap:16px; overflow-x:auto; overscroll-behavior-inline:contain; scroll-snap-type:x mandatory; scrollbar-width:none; margin-top:30px; padding:6px 2px 18px; }
      .myl-gallery-track::-webkit-scrollbar { display:none; }
      .myl-gallery-card { flex:0 0 calc((100% - 32px) / 3); aspect-ratio:3 / 4; scroll-snap-align:start; }
      .myl-gallery-controls { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-top:2px; color:#826E88; font-size:13px; }
      .myl-gallery-controls > div { display:flex; gap:9px; }
      .myl-gallery-controls button { width:44px; height:44px; border:1px solid #E4D4E8; border-radius:50%; color:#4A3151; background:#fff; font-size:26px; line-height:1; cursor:pointer; transition:background .2s ease,transform .2s ease; }
      .myl-gallery-controls button:hover { background:#F3E6F8; transform:translateY(-1px); }
      .myl-featured-treatment { display:grid; grid-template-columns:minmax(0,.92fr) minmax(0,1.08fr); width:calc(100% - 48px); max-width:1120px; min-height:420px; margin:0 auto 64px; overflow:hidden; border:1px solid #E8D7F1; border-radius:30px; background:linear-gradient(125deg,#fff 0%,#FBF7FC 100%); box-shadow:0 22px 55px rgba(45,21,55,.09); }
      .myl-featured-treatment-photo { position:relative; min-height:420px; overflow:hidden; background:#EFE6F1; }
      .myl-featured-treatment-photo::after { content:''; position:absolute; inset:45% 0 0; background:linear-gradient(180deg,transparent,rgba(36,17,44,.44)); }
      .myl-featured-treatment-photo img { display:block; width:100%; height:100%; min-height:420px; object-fit:contain; }
      .myl-featured-treatment-photo > span { position:absolute; z-index:1; left:24px; bottom:22px; padding:9px 13px; border:1px solid rgba(255,255,255,.45); border-radius:999px; color:#fff; background:rgba(45,21,55,.35); backdrop-filter:blur(8px); font-size:12px; font-weight:600; }
      .myl-featured-treatment-content { display:flex; flex-direction:column; justify-content:center; padding:clamp(28px,5vw,58px); }
      .myl-featured-eyebrow { color:#87569F; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; }
      .myl-featured-treatment h2,.myl-featured-treatment h3,.myl-care-guide h2 { margin:12px 0; color:#2D1537; font:600 clamp(30px,3vw,42px)/1.15 'Playfair Display',Georgia,serif; }
      .myl-featured-treatment-content > p { margin:0; color:#6D5D75; font-size:15px; line-height:1.75; }
      .myl-featured-includes { margin-top:16px; padding:12px 14px; border-left:3px solid #B997CD; color:#4C3A52; background:#F5EDF7; font-size:13px; line-height:1.6; }
      .myl-featured-meta { display:flex; flex-wrap:wrap; gap:32px; margin:22px 0; }
      .myl-featured-meta span { display:flex; flex-direction:column; gap:5px; }
      .myl-featured-meta small { color:#806F85; font-size:11px; }
      .myl-featured-meta strong { color:#2D1537; font-size:18px; }
      .myl-care-guide { padding:56px 20px; background:linear-gradient(145deg,#F9F5FA,#FBF9F7); }
      .myl-care-guide-inner { max-width:980px; margin:0 auto; text-align:center; }
      .myl-care-guide h2 { margin:12px 0; }
      .myl-care-guide-intro { margin:0 auto 26px; max-width:620px; color:#6D5D75; line-height:1.7; }
      .myl-care-guide-options { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; }
      .myl-care-guide-option { display:flex; align-items:center; gap:12px; min-height:62px; padding:12px 16px; border:1px solid #E8D7F1; border-radius:16px; color:#4C3A52; background:#fff; text-align:left; font-family:inherit; font-size:14px; font-weight:600; line-height:1.35; cursor:pointer; box-shadow:0 5px 18px rgba(45,21,55,.04); transition:border-color .2s ease,background .2s ease,transform .2s ease; }
      .myl-care-guide-option > span:first-child { color:#A259C4; font-size:20px; }
      .myl-care-guide-option:hover,.myl-care-guide-option.is-selected { border-color:#A259C4; background:#FBF5FC; transform:translateY(-1px); }
      .myl-guide-chevron { margin-left:auto; color:#A259C4; font-size:21px; }
      .myl-care-guide-option { align-items:flex-start; padding:24px 20px; border-radius:22px; }
      .myl-guide-icon { flex-shrink:0; }
      .myl-guide-copy { display:flex; flex-direction:column; gap:10px; }
      .myl-guide-copy strong { font-size:16px; color:#392040; }
      .myl-guide-copy small { font-size:15px; font-weight:400; line-height:1.65; color:#6D5D75; }
      .myl-care-guide-option:focus-visible { outline:3px solid #87569F; outline-offset:4px; }
      .myl-featured-steps { display:grid; gap:13px; margin:22px 0 0; padding:0; list-style:none; }
      .myl-featured-steps li { display:flex; gap:12px; align-items:flex-start; color:#6D5D75; font-size:14px; line-height:1.6; }
      .myl-featured-steps li > span { display:grid; place-items:center; width:28px; height:28px; flex-shrink:0; border-radius:50%; background:#EDE0F3; color:#754386; font-weight:700; font-size:12px; }
      .myl-featured-steps strong { display:block; color:#392040; font-size:15px; }
      .myl-featured-treatment-content > p { font-size:16px; }
      .myl-featured-includes { border-radius:0 12px 12px 0; font-size:14px; }
      .myl-featured-meta { padding-top:20px; border-top:1px solid #E8D7F1; margin-bottom:0; }
      .myl-featured-meta small { font-size:13px; }
      .myl-care-guide-result { font-size:16px; border:1px solid #E8D7F1; }
      .myl-care-guide-result { min-height:60px; margin:18px auto 0; max-width:700px; padding:16px 20px; border-radius:18px; color:#6D5D75; background:rgba(255,255,255,.78); text-align:left; font-size:14px; line-height:1.65; }
      .myl-care-guide-result > p { margin:0; }
      .myl-care-guide-result > strong { color:#2D1537; }
      .myl-care-guide-result > a { display:inline-flex; margin-top:8px; color:#754386; font-weight:700; text-decoration:underline; text-underline-offset:3px; }
      @media (max-width:820px) { .myl-featured-treatment { width:calc(100% - 40px); margin:0 auto 48px; grid-template-columns:1fr; } .myl-featured-treatment-photo { min-height:0; height:auto; aspect-ratio:3 / 4; max-height:520px; } .myl-featured-treatment-photo img { min-height:0; height:100%; } .myl-care-guide-options { grid-template-columns:1fr; } }
      @media (max-width:720px) { .myl-gallery-track { gap:11px; } .myl-gallery-card { flex-basis:82%; border-radius:15px; } .myl-featured-treatment { width:calc(100% - 32px); margin:0 auto 40px; border-radius:22px; }  .myl-featured-meta { gap:24px; } .myl-care-guide { padding:58px 18px; } }
      @media (prefers-reduced-motion:reduce) { .myl-gallery-controls button,.myl-care-guide-option { transition:none !important; } }


      .myl-featured-meta { background:#F0E3F5; border:1px solid #DFCAE8; border-radius:18px; padding:20px; gap:24px; }
      .myl-featured-meta strong { font-size:clamp(22px,2.4vw,30px); }
      .myl-mobile-contact { display:none; }
      @media (max-width:720px) {
        .myl-page { padding-bottom:calc(82px + env(safe-area-inset-bottom)) !important; }
        .myl-floating-whatsapp,.myl-chat-launcher,.myl-header-booking { display:none !important; }
        .myl-mobile-contact { display:flex; position:fixed; bottom:0; left:0; right:0; z-index:9999; padding:12px 16px calc(12px + env(safe-area-inset-bottom)); gap:10px; background:#fff; border-top:1px solid #E8D7F1; box-shadow:0 -4px 20px rgba(45,21,55,.06); }
        .myl-mobile-contact button,.myl-mobile-contact a { display:flex; justify-content:center; align-items:center; min-height:46px; padding:0 14px; border-radius:14px; font:600 14px/1.4 'Montserrat',sans-serif; text-decoration:none; }
        .myl-mobile-contact button { border:1px solid #DCC8E6; background:#fff; color:#754386; cursor:pointer; }
        .myl-mobile-contact a { flex:1; background:#754386; color:#fff; }
        .myl-chat-panel { bottom:calc(84px + env(safe-area-inset-bottom)) !important; max-height:calc(100dvh - 170px - env(safe-area-inset-bottom)) !important; }
      }
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

type TrustItem = { icon: string; text: string };
type BenefitItem = { icon: string; text: string };
type IndicationItem = { icon: string; title: string; text: string };
type FaqItem = { question: string; answer: string };
type GuideChoice = { id: string; icon: string; label: string; summary: string; response: string; whatsappMessage: string };

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
        'Sou Maria Yasmim Lopes, esteticista em Taboão da Serra.\n' +
        'Antes de cada sessão, conversamos sobre suas necessidades, sensibilidade e rotina de produtos para orientar o atendimento.',
    address:
        'R. Izaura da Silva Camargo, 27\nJardim São Paulo, Taboão da Serra - SP\nCEP: 06767-310',
    whatsapp: '5511916224612',
    openingHoursText:
        'Domingos e segundas-feiras, com hora marcada.',
    instagramUrl: 'https://www.instagram.com/yasmimlopes_estetica/',
    logoUrl: '/logo-maria-yasmim-estetica-taboao-da-serra.jpg',
    heroEyebrow: 'Realce sua beleza natural',
    heroTitle: 'Sua melhor versão começa aqui',
    heroSubtitle:
        'Limpeza de pele, massagem facial e hidratação Glow em Taboão da Serra. Atendimento com hora marcada.',
    heroTrustItems: [
        { icon: '🛡️', text: 'Cuidados com biossegurança' },
        { icon: '🤝', text: 'Atendimento personalizado' },
        { icon: '✨', text: 'Cuidado em cada etapa' },
    ],
    benefitsItems: [
        { icon: '⭐', text: 'Atendimento com hora marcada' },
        { icon: '🛡️', text: 'Dermocosméticos de Alta Qualidade' },
        { icon: '💬', text: 'Agendamento diretamente com a Maria pelo WhatsApp' },
    ],
    indicationsSectionTitle: 'Nossos tratamentos são ideais para quem busca:',
    indicationsItems: [
        { icon: '✨', title: 'Remoção de Cravos e Acne', text: 'Cuidados para ajudar a desobstruir os poros e reduzir o acúmulo de impurezas.' },
        { icon: '💧', title: 'Controle de Oleosidade', text: 'Cuidados personalizados para ajudar a equilibrar a oleosidade da pele.' },
        { icon: '🌸', title: 'Renovação Celular', text: 'Esfoliação e cuidados para renovar a superfície da pele e deixá-la mais macia.' },
        { icon: '💆‍♀️', title: 'Hidratação e Viço (Glow)', text: 'Hidratação facial para ajudar a manter a pele macia e com aparência iluminada.' },
    ],
    aboutBadgeText: 'Sua Esteticista',
    aboutPhotoUrl: '/maria-yasmim-esteticista-taboao-da-serra.jpg',
    treatmentsEyebrow: 'Nossos tratamentos',
    treatmentsSectionTitle: 'Cuidados para realçar sua beleza',
    treatmentsSectionSubtitle: 'Conheça o que está incluído na sua sessão',
    locationSectionTitle: 'Onde Estamos',
    locationSectionSubtitle: 'Sua clínica de estética bem pertinho de você em Taboão da Serra.',
    faqSectionTitle: 'Perguntas Frequentes',
    faqSectionSubtitle: 'Tire suas principais dúvidas sobre os nossos tratamentos.',
    faqItems: defaultFaqItems,
    footerTagline: 'Estética facial em Taboão da Serra. Um momento de cuidado para você.',
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
function useInView<T extends HTMLElement>(_threshold = 0.15) {
    const ref = React.useRef<T | null>(null);
    // Conteúdo visível desde o primeiro render, sem aguardar a rolagem.
    return [ref, true] as const;
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
        if (window.matchMedia('(max-width: 720px), (prefers-reduced-motion: reduce)').matches) return;
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
    const [showMoreFaqs, setShowMoreFaqs] = useState(false);
    const [guideChoice, setGuideChoice] = useState<GuideChoice | null>(null);
    const galleryTrackRef = React.useRef<HTMLDivElement | null>(null);
    const [chatOpen, setChatOpen] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [showChatSuggestions, setShowChatSuggestions] = useState(true);
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
        { id: '1', name: 'Limpeza de Pele Profunda + Massagem Facial Relaxante + Hidratação Facial Glow', description: 'Remoção de impurezas, cravos e células mortas, com massagem facial e hidratação para cuidar da pele.', price: 130, durationMinutes: 120 }
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
        { id: '6', title: 'Máscara facial em atendimento estético', url: '/mascara-facial-tratamento-estetico-taboao-da-serra.jpg' },
        { id: '7', title: 'Aplicação de máscara facial', url: '/aplicacao-de-mascara-facial-taboao-da-serra.jpg' },
        { id: '12', title: 'Atendimento estético personalizado', url: '/atendimento-estetico-com-hora-marcada-taboao-da-serra.jpg' },
    ];


    const [photos, setPhotos] = useState(defaultPhotos);

    const swipeStart = React.useRef<{ x: number; y: number } | null>(null);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % photos.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + photos.length) % photos.length);
    const scrollGallery = (direction: -1 | 1) => {
        const track = galleryTrackRef.current;
        const card = track?.querySelector<HTMLElement>('.myl-gallery-card');
        if (!track || !card) return;
        const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 16;
        track.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior: 'smooth' });
    };

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

                    setPhotos([...defaultPhotos, ...mergedPhotos].filter((photo, index, all) => all.findIndex(item => item.url === photo.url) === index).slice(0, 6));
                    setCurrentSlide(0);
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
    }, [chatMessages, chatLoading, chatError, chatOpen, showChatSuggestions]);

    const whatsappDigits = (siteSettings.whatsapp || defaultSiteSettings.whatsapp).replace(/\D/g, '');
    const buildWhatsAppLink = (message = 'Olá Maria, vi o site e gostaria de agendar um horário.') =>
        `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(message)}`;
    const bookingWhatsAppLink = buildWhatsAppLink('Olá Maria, vi o site e gostaria de agendar um horário.');

    const sendChatMessage = async (e?: React.FormEvent, question = chatInput, retry = false) => {
        e?.preventDefault();
        const message = question.trim();
        if (!message || chatRequest.current) return;
        setShowChatSuggestions(false);
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

    const priorityQuestions = [
        'A limpeza de pele profunda dói?',
        'De quanto em quanto tempo devo fazer a limpeza de pele?',
        'O que devo fazer antes do procedimento?',
        'Quanto tempo dura cada tratamento?',
        'Quais formas de pagamento são aceitas?',
    ];
    const priorityFaqs = priorityQuestions.map(question => siteSettings.faqItems.find(item => item.question === question) ?? defaultFaqItems.find(item => item.question === question)!).filter(Boolean);
    const extraFaqs = siteSettings.faqItems.filter(item => !priorityQuestions.includes(item.question));
    const renderFaq = (faq: FaqItem) => (
        <details key={faq.question} className="myl-faq-item" style={styles.faqItem}>
            <summary style={styles.faqQuestionHeader}>
                <span style={styles.faqQuestionText}>{faq.question}</span>
                <span className="myl-faq-symbol" aria-hidden="true" style={styles.faqIcon} />
            </summary>
            <p style={styles.faqAnswerText}>{faq.answer}</p>
        </details>
    );
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteSettings.address.replace(/\n/g, ', '))}`;
    const mapsEmbedUrl = siteSettings.address === defaultSiteSettings.address
        ? 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3655.582538606046!2d-46.7894929!3d-23.619300199999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce54f4e5ddcecb%3A0xf43ac75af56369ec!2sR.%20Izaura%20da%20Silva%20Camargo%2C%2027%20-%20Jardim%20Sao%20Paulo%2C%20Tabo%C3%A3o%20da%20Serra%20-%20SP%2C%2006767-310!5e0!3m2!1spt-BR!2sbr!4v1790507571952!5m2!1spt-BR!2sbr'
        : `https://www.google.com/maps?q=${encodeURIComponent(siteSettings.address.replace(/\n/g, ', '))}&z=16&hl=pt-BR&output=embed`;
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
    const featuredTreatment = treatments.find((item) => item.name.toLowerCase().includes('limpeza de pele'));

    return (
        <div id="inicio" className="myl-page" style={styles.container}>
            <style>{landingStyles}</style>

            {/* Botão Flutuante do WhatsApp */}
            <a href={buildWhatsAppLink()} target="_blank" rel="noopener noreferrer" aria-label="Falar com a Maria pelo WhatsApp" title="Agendar pelo WhatsApp" className="myl-floating-whatsapp" style={styles.floatingWhatsApp}>
                <svg width="35" height="35" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
            </a>

            {/* Header Fixo — transparente no topo, ganha vidro fosco ao rolar */}
            <header className={`myl-navbar${isScrolled ? ' myl-scrolled' : ''}`} style={{ ...styles.header, top: topOffset }}>
                <div style={styles.headerContent}>
                    <a href="#inicio" style={styles.logoContainer}>
                        <SiteImage src={siteSettings.logoUrl} alt="Logo Maria Yasmim Lopes" sizes="50px" loading="eager" decoding="async" style={styles.logoCircle} />
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
                        <a href={bookingWhatsAppLink} target="_blank" rel="noopener noreferrer" className="myl-btn-primary myl-header-booking" style={{ ...styles.primaryButton, padding: isMobile ? '7px 12px' : '11px 22px', fontSize: isMobile ? '11px' : '14px' }}>
                            Agendar pelo WhatsApp
                        </a>
                    )}
                </div>
            </header>

            {/* Hero Section */}
            <section
                className="myl-hero" style={{ ...styles.hero, position: 'relative' as const, overflow: 'hidden' }}
                onMouseMove={handleHeroMouseMove}
                onMouseLeave={resetHeroParallax}
            >
                {editable && <EditPencil label="Início (título e texto)" onClick={() => editSection('hero')} />}

                {/* Elementos decorativos flutuando bem devagar, só de fundo */}
                <div className="myl-float" style={{ position: 'absolute', top: '8%', left: '-6%', width: '260px', height: '260px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,175,120,0.25), transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' as const }} />
                <div className="myl-float" style={{ position: 'absolute', bottom: '4%', right: '-4%', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(162,89,196,0.18), transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' as const, animationDelay: '2.5s' }} />

                <div className="myl-hero-grid" style={styles.heroGrid}>
                    <div className="myl-fade-up" style={styles.heroTextCol}>
                        <span style={styles.eyebrow}>{siteSettings.heroEyebrow}</span>
                        <h1 style={styles.heroTitle}>{siteSettings.heroTitle}</h1>
                        <p style={styles.heroText}>
                            {siteSettings.heroSubtitle}
                        </p>

                        <div style={styles.heroActions}>
                            <a href={buildWhatsAppLink()} target="_blank" rel="noreferrer" className="myl-btn-primary" style={styles.primaryActionButton}>
                                Agendar pelo WhatsApp
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
                                transform: isMobile ? 'none' : `translate(${heroParallax.x * 8}px, ${heroParallax.y * 8 + scrollLerp(heroScrollProgress, 26, 0)}px) scale(${scrollLerp(heroScrollProgress, 0.94, 1)})`,
                                opacity: 1,
                                transition: 'transform 0.25s ease-out',
                            }}
                        >
                            <button onClick={prevSlide} style={styles.carouselBtnLeft} aria-label="Foto anterior">&#10094;</button>
                            <div style={{ ...styles.carouselSlide, touchAction: 'pan-y' }}
                                onTouchStart={event => { const touch = event.touches[0]; swipeStart.current = { x: touch.clientX, y: touch.clientY }; }}
                                onTouchEnd={event => { const start = swipeStart.current; swipeStart.current = null; if (!start) return; const touch = event.changedTouches[0]; const dx = touch.clientX - start.x; const dy = touch.clientY - start.y; if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) { dx < 0 ? nextSlide() : prevSlide(); } }}
                                onTouchCancel={() => { swipeStart.current = null; }}>
                                <SiteImage
                                    src={photos[currentSlide].url}
                                    alt={photos[currentSlide].title}
                                    loading="eager"
                                    fetchPriority={currentSlide === 0 ? 'high' : 'auto'}
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
                                    <button type="button" aria-label={`Ver foto ${index + 1}`} aria-pressed={currentSlide === index}
                                        key={index}
                                        style={{
                                            ...styles.dot, border: 0, padding: 0,
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
                                        <div style={{ flex: isMobile ? undefined : '0 0 44%', width: isMobile ? '100%' : undefined, position: 'relative' as const, aspectRatio: '3/4', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 30px 60px -18px rgba(0,0,0,0.4)' }}>
                                            <SiteImage src={src} alt={item.title} style={{ position: 'absolute' as const, inset: 0, width: '100%', height: '100%', objectFit: 'cover' as const }} />
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
            <section id="sobre" ref={aboutRef} style={{ position: 'relative' as const, maxWidth: '1000px', margin: '0 auto', padding: isMobile ? '56px 20px 20px' : '150px 20px 20px' }}>
                {editable && <EditPencil label="Sobre" onClick={() => editSection('about')} />}

                <div
                    onMouseMove={handleAboutMouseMove}
                    onMouseLeave={resetAboutTilt}
                >
                    <SiteImage
                        src={siteSettings.aboutPhotoUrl}
                        alt="Maria Yasmim Lopes"
                        style={{
                            width: '100%',
                            height: 'auto',
                            maxWidth: '465px',
                            margin: '0 auto',
                            objectFit: 'cover' as const,
                            borderRadius: '28px',
                            boxShadow: '0 25px 55px rgba(45,21,55,0.22)',
                            display: 'block',
                            transform: `rotateX(${aboutTilt.y * -2}deg) rotateY(${aboutTilt.x * 2}deg)`,
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
                        <span style={styles.aboutChip}>Estética facial</span>
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
                {featuredTreatment && (
                    <article aria-labelledby="featured-treatment-title" className="myl-featured-treatment">
                        <div className="myl-featured-treatment-photo">
                            <SiteImage src="/limpeza-de-pele-acne-taboao-da-serra.jpg" alt="Atendimento de limpeza de pele na clínica" loading="lazy" decoding="async" />
                            <span>Protocolo completo</span>
                        </div>
                        <div className="myl-featured-treatment-content">
                            <span className="myl-featured-eyebrow">Cuidado facial completo</span>
                            <h3 id="featured-treatment-title">Limpeza de pele profunda</h3>
                            <p>As etapas são ajustadas à avaliação e à sensibilidade da sua pele.</p>
                            <div className="myl-featured-meta">
                                <span><small>Protocolo completo</small><strong>{featuredTreatment.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></span>
                                <span><small>Reserve aproximadamente</small><strong>{featuredTreatment.durationMinutes} minutos</strong></span>
                            </div>
                            <ol className="myl-featured-steps" aria-label="O que está incluído na sessão">
                                <li><span>01</span><div><strong>Limpeza de pele profunda</strong>Remoção de cravos e impurezas.</div></li>
                                <li><span>02</span><div><strong>Massagem facial relaxante</strong>Uma pausa para relaxar.</div></li>
                                <li><span>03</span><div><strong>Hidratação facial Glow</strong>Para finalizar o cuidado com a pele.</div></li>
                            </ol>
                        </div>
                    </article>
                )}
                {treatments.filter((item) => item !== featuredTreatment).map((item, i) => {
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
                                        <div style={{ flex: isMobile ? undefined : '0 0 48%', width: isMobile ? '100%' : undefined, position: 'relative' as const, aspectRatio: '3/4', borderRadius: '26px', overflow: 'hidden', boxShadow: '0 40px 80px -20px rgba(45,21,55,0.28)' }}>
                                            <SiteImage src={src} alt={item.name} loading="lazy" decoding="async" style={{ position: 'absolute' as const, inset: 0, width: '100%', height: '100%', objectFit: 'cover' as const }} />
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
                                                <b style={{ color: '#2D1537', fontWeight: 700 }}>Preço: {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</b>
                                            </span>
                                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#6D5D75' }}>
                                                <b style={{ color: '#2D1537', fontWeight: 700 }}>Duração: {item.durationMinutes} min</b>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </RevealPanel>
                    );
                })}
            </section>


            <section aria-labelledby="care-guide-title" className="myl-care-guide">
                <div className="myl-care-guide-inner">
                    <span className="myl-featured-eyebrow">Guia de cuidados</span>
                    <h2 id="care-guide-title">Saiba mais sobre limpeza de pele</h2>
                    <p className="myl-care-guide-intro">Leia as explicações por aqui. Se ainda ficar com dúvidas, você pode perguntar à Maria pelo WhatsApp.</p>
                    <div className="myl-care-guide-options" role="group" aria-label="Escolha sua prioridade de cuidado facial">
                        {([
                            { id: 'impurezas', icon: '✦', label: 'Cravos e impurezas', summary: 'Cravos se formam quando os poros ficam obstruídos por oleosidade e células mortas.', response: 'Cravos são poros obstruídos, e a cor escura não significa falta de higiene. A profissional avalia se a limpeza e as etapas do protocolo são adequadas para sua pele.', whatsappMessage: 'Olá Maria, gostaria de conversar sobre limpeza de pele profunda e saber se o protocolo é indicado para mim.' },
                            { id: 'oleosidade', icon: '☼', label: 'Oleosidade', summary: 'A limpeza remove resíduos superficiais, mas não controla sozinha a oleosidade.', response: 'Pele oleosa também precisa de hidratação. Uma rotina suave e produtos adequados ajudam no cuidado diário; lavar ou esfregar em excesso pode irritar. A limpeza profissional é um complemento, e a frequência depende da avaliação da sua pele.', whatsappMessage: 'Olá Maria, gostaria de conversar sobre cuidados para pele oleosa e entender o que pode ser adequado para mim.' },
                            { id: 'hidratacao', icon: '❋', label: 'Hidratação e viço', summary: 'Hidratar ajuda a manter a pele macia e confortável, inclusive a pele oleosa.', response: 'A hidratação ajuda a reter água e a manter a barreira da pele. Os produtos são escolhidos conforme as necessidades e a sensibilidade da pele.', whatsappMessage: 'Olá Maria, gostaria de saber mais sobre hidratação facial Glow e se é indicada para mim.' },
                        ] as GuideChoice[]).map((choice) => (
                            <button key={choice.id} type="button" aria-pressed={guideChoice?.id === choice.id} onClick={() => setGuideChoice(choice)} className={`myl-care-guide-option${guideChoice?.id === choice.id ? ' is-selected' : ''}`}>
                                <span className="myl-guide-icon" aria-hidden="true">{choice.icon}</span>
                                <span className="myl-guide-copy"><strong>{choice.label}</strong><small>{choice.summary}</small></span>
                                <span aria-hidden="true" className="myl-guide-chevron">{guideChoice?.id === choice.id ? '−' : '+'}</span>
                            </button>
                        ))}
                    </div>
                    <div className="myl-care-guide-result" aria-live="polite">
                        {guideChoice ? (
                            <>
                                <strong>Sobre {guideChoice.label.toLowerCase()}</strong>
                                <p>{guideChoice.response}</p>
                                <a href={buildWhatsAppLink(guideChoice.whatsappMessage)} target="_blank" rel="noopener noreferrer">Se quiser, pergunte à Maria pelo WhatsApp ↗</a>
                            </>
                        ) : <><strong>Cada pele tem seu tempo e suas necessidades</strong><p>Selecione um tema para ler mais. A indicação e a frequência da limpeza são avaliadas individualmente.</p><a href={buildWhatsAppLink("Olá Maria, gostaria de tirar uma dúvida sobre limpeza de pele.")} target="_blank" rel="noopener noreferrer">Perguntar à Maria pelo WhatsApp ↗</a></>}
                    </div>
                </div>
            </section>



            {/* Galeria / Instagram */}
            <section id="instagram" style={styles.gallerySection}>
                <div style={styles.sectionHeader}>
                    <span style={styles.eyebrowCentered}>Conheça nosso trabalho</span>
                    <h2 style={styles.sectionTitle}>Conheça os atendimentos</h2>
                    <p style={styles.sectionSubtitle}>Momentos reais de cuidado e atendimento na clínica.</p>
                </div>
                <div className="myl-gallery-track" ref={galleryTrackRef} aria-label="Fotos de atendimentos e cuidados faciais" tabIndex={0}>
                    {[
                        { src: '/detalhe-cuidado-facial-taboao-da-serra.jpg', alt: 'Detalhe de cuidado facial durante atendimento', label: 'Cuidado facial' },
                        { src: '/cuidado-facial-em-clinica-taboao-da-serra.jpg', alt: 'Cliente recebendo atendimento estético facial', label: 'Atendimento' },
                        { src: '/procedimento-facial-personalizado-taboao-da-serra.jpg', alt: 'Detalhe da pele durante o atendimento facial', label: 'Cuidado em detalhe' },
                        { src: '/mascara-facial-tratamento-estetico-taboao-da-serra.jpg', alt: 'Máscara facial preparada para atendimento estético', label: 'Máscara facial' },
                        { src: '/aplicacao-de-mascara-facial-taboao-da-serra.jpg', alt: 'Aplicação de cuidados faciais durante atendimento', label: 'Momento de cuidado' },
                        { src: '/detalhe-de-tratamento-facial-taboao-da-serra.jpg', alt: 'Detalhe de tratamento facial personalizado', label: 'Pele bem cuidada' },
                    ].map((image, index) => (
                        <figure className="myl-gallery-card" key={image.src} style={{ animationDelay: `${index * 0.05}s` }}>
                            <GalleryPhoto src={image.src} alt={image.alt}>
                            <SiteImage
                                src={image.src}
                                alt={image.alt}
                                loading="lazy"
                                decoding="async"
                                onError={(event) => {
                                    const imageElement = event.currentTarget;
                                    imageElement.onerror = null;
                                    imageElement.src = '/mascara-facial-tratamento-estetico-taboao-da-serra.jpg';
                                }}
                            />
                            </GalleryPhoto>
                            <figcaption><span>{image.label} ↗</span></figcaption>
                        </figure>
                    ))}
                </div>
                <div className="myl-gallery-controls">
                    <span>Deslize para ver mais · Toque para ampliar</span>
                    <div>
                        <button type="button" onClick={() => scrollGallery(-1)} aria-label="Ver fotos anteriores">‹</button>
                        <button type="button" onClick={() => scrollGallery(1)} aria-label="Ver próximas fotos">›</button>
                    </div>
                </div>
                <div style={styles.galleryCta}>
                    <a
                        href={siteSettings.instagramUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="myl-instagram-link"
                    >
                        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg>
                        <span><small>Acompanhe no Instagram</small><strong>{instagramHandle}</strong></span>
                        <span aria-hidden="true" className="myl-instagram-arrow">↗</span>
                    </a>
                </div>
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
                            <a href={mapsUrl} target="_blank" rel="noreferrer" style={{...styles.secondaryActionButton, padding: '12px 20px', fontSize: '14px'}}>
                                Como chegar no Google Maps
                            </a>
                        </div>
                    </div>
                    <div style={styles.locationMapWrapper}>
                        <iframe
                            src={mapsEmbedUrl}
                            title="Mapa da localização da clínica"
                            aria-label="Mapa da localização e arredores da clínica"
                            loading="eager"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                            style={{ display: 'block', width: '100%', height: '100%', minHeight: '300px', border: 0, borderRadius: '18px' }}
                        />
                    </div>
                </div>
            </section>

            {/* Agendamento manual pelo WhatsApp */}
            <section id="agendamento" aria-labelledby="booking-title" style={{ ...styles.bookingSection, scrollMarginTop: topOffset + 100 }}>
                <div className="myl-booking-grid" style={styles.bookingGrid}>
                    <div className="myl-booking-photo" style={styles.bookingPhotoWrap}>
                        <SiteImage
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
                            Consulte os horários disponíveis e combine sua sessão diretamente com a Maria.
                        </p>
                        <ul style={styles.bookingDetails}>
                            <li style={styles.bookingDetail}><span style={styles.bookingIcon}><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg></span> Taboão da Serra</li>
                            <li style={styles.bookingDetail}><span style={styles.bookingIcon}><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg></span> Atendimento com hora marcada</li>
                        </ul>
                        <a href={bookingWhatsAppLink} target="_blank" rel="noopener noreferrer" className="myl-booking-button" style={styles.bookingButton}>
                            <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M21 11.5a9 9 0 0 1-13.3 7.9L3 21l1.5-4.6A9 9 0 1 1 21 11.5Z" /><path d="M8 7.5c-.8 1.5.2 3.8 2 5.6s4.1 2.8 5.6 2l1-1.5-2.5-1.4-1 1c-1.4-.5-2.5-1.6-3-3l1-1L9.5 6.8Z" /></svg>
                            Agendar pelo WhatsApp
                        </a>
                        <p style={styles.bookingNote}>Atendimento aos domingos e às segundas-feiras.</p>
                        <aside style={{ marginTop: '22px', padding: '16px 18px', borderLeft: '3px solid #B997CD', borderRadius: '0 12px 12px 0', backgroundColor: '#F5EDF7', color: '#5A4A60', fontSize: '14px', lineHeight: 1.7 }}>
                            <strong style={{ display: 'block', color: '#392040', marginBottom: '4px' }}>Antes do atendimento</strong>
                            Avise a Maria sobre alergias, sensibilidade, irritações e produtos ou medicamentos que esteja usando. Essas informações ajudam a planejar os cuidados da sessão.
                        </aside>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" style={{ ...styles.faqSection, position: 'relative' as const }}>
                {editable && <EditPencil label="Perguntas frequentes" onClick={() => editSection('faq')} />}
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>{siteSettings.faqSectionTitle}</h2>
                    <p style={styles.sectionSubtitle}>{siteSettings.faqSectionSubtitle}</p>
                </div>
                <div className="myl-faq-grid" style={styles.faqContainer}>
                    {priorityFaqs.map(renderFaq)}
                </div>
                {extraFaqs.length > 0 && <>
                    <div id="more-faqs" hidden={!showMoreFaqs}>
                        {showMoreFaqs && <div className="myl-faq-grid" style={{ ...styles.faqContainer, marginTop: '15px' }}>{extraFaqs.map(renderFaq)}</div>}
                    </div>
                    <button type="button" className="myl-more-faqs" aria-expanded={showMoreFaqs} aria-controls="more-faqs" onClick={() => setShowMoreFaqs(!showMoreFaqs)}>
                        {showMoreFaqs ? 'Ver menos dúvidas' : 'Ver mais dúvidas'}
                    </button>
                </>}
            </section>

            <div className="myl-mobile-contact" aria-label="Contato e dúvidas">
                <button type="button" onClick={() => setChatOpen(!chatOpen)} aria-expanded={chatOpen} aria-controls="clinic-assistant">Dúvidas?</button>
                <a href={bookingWhatsAppLink} target="_blank" rel="noopener noreferrer">Agendar pelo WhatsApp</a>
            </div>
            <button className="myl-chat-launcher" onClick={() => setChatOpen(!chatOpen)} style={styles.chatButton} aria-label={chatOpen ? 'Fechar assistente' : 'Abrir assistente'} aria-expanded={chatOpen}>💬</button>
            {chatOpen && (
                <div id="clinic-assistant" className="myl-chat-panel" role="dialog" aria-label="Assistente virtual da clínica" style={styles.chatPanel}>
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
                    {showChatSuggestions && (
                        <>
                            <div role="group" aria-label="Perguntas rápidas" style={styles.chatQuickActions}>
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
                        </>
                    )}
                    <form onSubmit={sendChatMessage} style={styles.chatForm}>
                        <input value={chatInput} onFocus={() => setShowChatSuggestions(true)} onPointerDown={() => setShowChatSuggestions(true)} onChange={(e) => { setChatInput(e.target.value); if (e.target.value) setShowChatSuggestions(true); }} aria-label="Sua mensagem" maxLength={1500} placeholder="Digite sua mensagem..." style={styles.chatInput} />
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
    heroGrid: { maxWidth: '1500px', margin: '0 auto', display: 'flex', flexWrap: 'wrap' as const, gap: '36px', alignItems: 'center' },
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
    aboutSection: { padding: '56px 20px', maxWidth: '1200px', margin: '0 auto' },
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
    section: { padding: '56px 20px', maxWidth: '1200px', margin: '0 auto' },
    sectionHeader: { textAlign: 'center' as const, marginBottom: '50px' },
    sectionTitle: { fontSize: '36px', fontWeight: '700', color: '#2D1537', marginBottom: '12px', fontFamily: "'Playfair Display', serif" },
    sectionSubtitle: { fontSize: '16px', color: '#6D5D75' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' },
    card: { backgroundColor: '#FFF', padding: '35px', borderRadius: '20px', border: '1px solid #E8D7F1', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', textAlign: 'left' as const, display: 'flex', flexDirection: 'column' as const, justifyContent: 'space-between' },
    cardIconCircle: { width: '54px', height: '54px', borderRadius: '50%', backgroundColor: '#F3E6F8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '18px' },
    cardTitle: { fontSize: '22px', fontWeight: 'bold', color: '#2D1537', marginBottom: '12px', fontFamily: "'Playfair Display', serif" },
    cardText: { fontSize: '15px', color: '#6D5D75', lineHeight: 1.6, marginBottom: '20px' },
    cardSelectButton: { backgroundColor: '#F3E6F8', color: '#4A155E', border: 'none', padding: '10px 18px', borderRadius: '20px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', alignSelf: 'flex-start', transition: 'background-color 0.2s' },
    locationSection: { padding: '56px 20px', maxWidth: '1000px', margin: '0 auto' },
    locationGrid: { display: 'flex', flexWrap: 'wrap' as const, gap: '30px', backgroundColor: '#FFF', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 25px rgba(0,0,0,0.05)', border: '1px solid #F0E4F5' },
    locationInfo: { flex: '1 1 300px', padding: '40px' },
    locationAddressText: { fontSize: '15px', color: '#5A4A60', lineHeight: 1.6, marginBottom: '20px' },
    locationMapWrapper: { flex: '1 1 400px', minHeight: '300px', width: '100%' },
    bookingSection: { position: 'relative' as const, isolation: 'isolate' as const, padding: '56px 20px', maxWidth: '1200px', margin: '0 auto' },
    bookingGrid: { position: 'relative' as const, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', alignItems: 'center', gap: 'clamp(28px, 4vw, 56px)', padding: 'clamp(28px, 4vw, 48px)', borderRadius: '40px', background: 'linear-gradient(120deg, rgba(255,255,255,.64), rgba(242,229,249,.6))', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,.9)', boxShadow: '0 16px 44px -20px rgba(77,35,96,.18), inset 0 0 0 1px rgba(232,215,241,.35)' },
    bookingPhotoWrap: { position: 'relative' as const, aspectRatio: '3 / 4', minWidth: 0, width: '100%', maxWidth: '440px', margin: '0 auto' },
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
    gallerySection: { padding: '56px 28px', maxWidth: '1200px', margin: '0 auto', borderRadius: '32px', background: 'linear-gradient(180deg, #FBF9F7 0%, #F8F3F8 100%)' },
    galleryGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px', marginTop: '30px' },
    galleryImage: { width: '100%', height: '250px', objectFit: 'cover' as const, borderRadius: '18px', boxShadow: '0 8px 20px rgba(45,21,55,0.08)', backgroundColor: '#F3E6F8' },
    galleryCta: { display: 'flex', justifyContent: 'center', marginTop: '28px' },
    faqSection: { padding: '56px 20px', maxWidth: '1100px', margin: '0 auto' },
    faqContainer: { display: 'flex', flexDirection: 'column' as const, gap: '15px' },
    faqItem: { backgroundColor: '#FFF', borderRadius: '12px', border: '1px solid #E8D7F1', padding: '20px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' },
    faqQuestionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    faqQuestionText: { fontSize: '16px', fontWeight: '600', color: '#2D1537', margin: 0 },
    faqIcon: { fontSize: '24px', color: '#A259C4', fontWeight: 'bold' },
    faqAnswerText: { fontSize: '15px', color: '#6D5D75', lineHeight: 1.6, margin: '15px 0 0 0', paddingTop: '15px', borderTop: '1px solid #F0E4F5' },
    footer: { backgroundColor: '#2D1537', color: '#FAF9F6', padding: '70px 20px 30px 20px', textAlign: 'left' as const },
    footerContent: { maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '36px', borderBottom: '1px solid #4A155E', paddingBottom: '40px' },
    footerTitle: { fontSize: '24px', fontWeight: 'bold', color: '#E3C2F0', marginBottom: '15px', fontFamily: "'Playfair Display', serif" },
    footerTextDesc: { fontSize: '15px', color: '#D4A5E0', lineHeight: 1.6 },
    footerContact: { fontSize: '15px', color: '#D4A5E0', lineHeight: 1.7 },
    footerInstagramLink: { color: '#FFF', textDecoration: 'none', fontWeight: 'bold' },
    footerBottom: { maxWidth: '1200px', margin: '30px auto 0 auto', textAlign: 'center' as const, fontSize: '13px', color: '#A259C4' }
};

