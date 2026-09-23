export const CHAT_TIMEOUT_MS = 180000;

export type ClinicService = {
    name: string;
    description: string;
    price: number;
    durationMinutes: number;
};

export type QuickChatReply = {
    text: string;
    action?: { href: string; label: string };
    source?: { href: string; label: string };
};

type ClinicInfo = {
    address: string;
    openingHoursText: string;
    whatsappUrl: string;
    treatments: ClinicService[];
};

const sourceLinks = {
    aadWash: { href: 'https://www.aad.org/public/everyday-care/skin-care-basics/care/face-washing-101', label: 'Orientações de dermatologistas (AAD)' },
    aadExfoliation: { href: 'https://www.aad.org/public/everyday-care/skin-care-secrets/routine/safely-exfoliate-at-home', label: 'Esfoliação segura (AAD)' },
    aadMoisturizer: { href: 'https://www.aad.org/public/everyday-care/skin-care-basics/dry/pick-moisturizer', label: 'Hidratação da pele (AAD)' },
    sunProtection: { href: 'https://www.aad.org/public/everyday-care/sun-protection/shade-clothing-sunscreen/how-to-apply-sunscreen', label: 'Proteção solar (AAD)' },
    acne: { href: 'https://www.aad.org/public/diseases/acne/derm-treat/treat', label: 'Orientações sobre acne (AAD)' },
    pregnancy: { href: 'https://www.aad.org/public/everyday-care/skin-care-secrets/routine/pregnancy-skin-care', label: 'Cuidados com a pele na gravidez (AAD)' },
    massage: { href: 'https://health.clevelandclinic.org/can-doing-facial-exercises-help-you-look-younger-face-yoga', label: 'Cuidados e limites da massagem facial (Cleveland Clinic)' },
};

const normalize = (message: string) => message
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[?!.;,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const hasAny = (text: string, words: string[]) => words.some((word) => text.includes(word));
const asksAboutSkinCleaning = (text: string) =>
    hasAny(text, ['limpeza', 'cravos', 'comedoes', 'limpeza profunda']) ||
    (/\blimp[a-z]*\b/.test(text) && /\b(pele|facial|rosto)\b/.test(text));

const actionFor = (
    info: ClinicInfo,
    label = 'Agendar ou tirar dúvidas pelo WhatsApp',
    message = 'Olá Maria, vi o site e gostaria de agendar um horário.',
): QuickChatReply['action'] => ({
    href: `${info.whatsappUrl.split('?')[0]}?text=${encodeURIComponent(message)}`,
    label,
});

const money = (value: number) => new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL', maximumFractionDigits: 2,
}).format(value);

// Respostas rápidas educativas e comerciais. Procedimentos e valores vêm da API pública;
// orientações gerais não substituem avaliação individual nem atendimento dermatológico.
export function getQuickChatReply(message: string, info: ClinicInfo): QuickChatReply | null {
    const question = normalize(message);
    const asksPrice = hasAny(question, ['quanto custa', 'preco', 'valor', 'duracao', 'quanto tempo', 'valores']);
    const otherModalities = ['limpeza', 'massagem', 'hidratacao'];
    const specificService = (modality: string) => info.treatments.find((item) => {
        const name = normalize(item.name);
        return name.includes(modality) && otherModalities.every((other) => other === modality || !name.includes(other));
    });
    const relatedService = (modality: string) => info.treatments.find((item) => normalize(item.name).includes(modality));
    const catalogNote = (modality: string) => {
        const item = relatedService(modality);
        return item
            ? `No cadastro atual, essa etapa aparece em “${item.name}” (${money(item.price)}, cerca de ${item.durationMinutes} minutos).`
            : '';
    };

    if (hasAny(question, ['agendar', 'agendamento', 'marcar horario', 'marcar uma consulta', 'reservar horario'])) {
        return {
            text: 'O agendamento é combinado diretamente com a Maria pelo WhatsApp. Toque no botão abaixo para enviar uma mensagem e confirmar o procedimento e os horários disponíveis. O site não reserva horários automaticamente.',
            action: actionFor(info, 'Abrir conversa no WhatsApp'),
        };
    }

    if (hasAny(question, ['onde fica', 'endereco', 'localizacao', 'como chegar'])) {
        return {
            text: `A clínica fica em ${info.address.replace(/\n/g, ', ')}. Você também pode consultar o mapa na seção “Onde estamos”.`,
            action: actionFor(info, 'Falar com a Maria', 'Olá Maria, gostaria de confirmar o endereço da clínica.'),
        };
    }

    if (hasAny(question, ['horario', 'que horas', 'dias atende', 'quando atende'])) {
        return {
            text: `${info.openingHoursText} Como os horários dependem da agenda, confirme a disponibilidade diretamente com a Maria.`,
            action: actionFor(info, 'Consultar horários no WhatsApp', 'Olá Maria, quais horários estão disponíveis para agendamento?'),
        };
    }

    if (asksAboutSkinCleaning(question)) {
        const service = relatedService('limpeza');
        const description = service?.description || 'A limpeza de pele é um cuidado estético voltado à higienização e à remoção de impurezas superficiais e comedões quando apropriado.';
        return {
            text: `${description} O protocolo e a necessidade de extração são definidos conforme a avaliação da pele; não é um tratamento médico para acne. Uma vermelhidão passageira pode acontecer. Avise antes sobre alergias, sensibilidades, medicamentos ou procedimentos recentes e converse com a profissional se sua pele estiver ferida, irritada ou queimada de sol.${catalogNote('limpeza') ? `\n\n${catalogNote('limpeza')}` : ''}`,
            action: actionFor(info, 'Perguntar sobre limpeza de pele', 'Olá Maria, gostaria de saber mais sobre a limpeza de pele.'),
            source: sourceLinks.aadExfoliation,
        };
    }

    if (hasAny(question, ['massagem', 'relaxamento facial', 'massagem facial'])) {
        const service = specificService('massagem');
        const description = service?.description || 'A massagem facial relaxante é um cuidado suave voltado ao conforto e ao relaxamento.';
        return {
            text: `${description} A sensação é individual; a massagem não substitui tratamentos dermatológicos nem promete mudar o contorno do rosto ou eliminar rugas. Avise a profissional se sua pele estiver irritada, machucada, com hematomas ou passando por algum tratamento.${catalogNote('massagem') ? `\n\n${catalogNote('massagem')}` : ''}`,
            action: actionFor(info, 'Perguntar sobre massagem facial', 'Olá Maria, gostaria de saber mais sobre a massagem facial.'),
            source: sourceLinks.massage,
        };
    }

    if (hasAny(question, ['hidratacao', 'hidratar', 'pele seca', 'glow', 'ressecada'])) {
        const service = specificService('hidratacao');
        const description = service?.description || 'A hidratação facial busca ajudar a manter a pele confortável, macia e com aparência viçosa.';
        return {
            text: `${description} Os produtos são escolhidos de acordo com a pele e o protocolo disponível na clínica. Hidratantes ajudam a reduzir a perda de água da pele, mas não tratam doenças dermatológicas. Conte à profissional sobre alergias e produtos que causam irritação.${catalogNote('hidratacao') ? `\n\n${catalogNote('hidratacao')}` : ''}`,
            action: actionFor(info, 'Perguntar sobre hidratação facial', 'Olá Maria, gostaria de saber mais sobre a hidratação facial.'),
            source: sourceLinks.aadMoisturizer,
        };
    }

    if (hasAny(question, ['antes do procedimento', 'antes da limpeza', 'como me preparo', 'preparo', 'preparacao'])) {
        return {
            text: 'Para um atendimento mais seguro, conte à Maria sobre alergias, sensibilidade, medicamentos e produtos que usa na pele, procedimentos recentes e qualquer irritação ou ferida. Não suspenda medicamentos ou sua rotina prescrita por conta própria; pergunte ao profissional que acompanha você. Se estiver com queimadura de sol ou pele lesionada, converse antes de marcar.',
            action: actionFor(info, 'Tirar dúvidas antes de agendar', 'Olá Maria, tenho algumas dúvidas sobre preparo e cuidados antes do procedimento.'),
            source: sourceLinks.aadWash,
        };
    }

    if (hasAny(question, ['depois do procedimento', 'pos procedimento', 'pos limpeza', 'cuidados depois', 'pos cuidados'])) {
        return {
            text: 'Siga as orientações dadas pela profissional para o seu atendimento. Em geral, prefira uma limpeza suave, evite esfregar ou esfoliar a pele se estiver sensível e mantenha a proteção solar de amplo espectro (FPS 30 ou mais). Se houver reação intensa ou persistente, procure orientação de um profissional de saúde.',
            action: actionFor(info, 'Confirmar os cuidados pelo WhatsApp', 'Olá Maria, quais cuidados devo seguir depois do procedimento?'),
            source: sourceLinks.sunProtection,
        };
    }

    if (hasAny(question, ['acne', 'espinha', 'rosacea', 'irritacao', 'alergia', 'gravida', 'gestante'])) {
        const source = hasAny(question, ['gravida', 'gestante'])
            ? sourceLinks.pregnancy
            : hasAny(question, ['acne', 'espinha']) ? sourceLinks.acne : undefined;
        return {
            text: 'Cada caso e cada produto precisam ser avaliados individualmente. A assistente não consegue diagnosticar nem confirmar se um procedimento é indicado; informe a Maria sobre a condição, alergias, gravidez e medicamentos antes de marcar. Para acne persistente, dor, inflamação importante ou reação na pele, procure um dermatologista.',
            action: actionFor(info, 'Conversar com a Maria', 'Olá Maria, gostaria de confirmar se o procedimento é adequado para mim.'),
            ...(source ? { source } : {}),
        };
    }

    if (asksPrice) {
        const services = info.treatments.filter((item) => item.name && Number.isFinite(item.price) && Number.isFinite(item.durationMinutes));
        const details = services.length
            ? services.map((item) => `${item.name}: ${money(item.price)} · cerca de ${item.durationMinutes} minutos`).join('\n')
            : 'Os valores e a duração são informados pela clínica; confirme os dados atualizados diretamente com a Maria.';
        return {
            text: `${details}\n\nA duração pode variar conforme o atendimento. Confirme o valor e o horário antes de agendar.`,
            action: actionFor(info, 'Confirmar e agendar pelo WhatsApp'),
        };
    }

    return null;
}

export async function requestChatReply(apiUrl: string, message: string, signal: AbortSignal): Promise<string> {
    const response = await fetch(`${apiUrl}/api/chat/public`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }), signal,
    });
    if (!response.ok) throw new Error('CHAT_UNAVAILABLE');
    const data = await response.json();
    if (data.available === false || typeof data.reply !== 'string' || !data.reply.trim() ||
        data.reply.startsWith('Desculpe, não consegui responder agora.')) {
        throw new Error('CHAT_UNAVAILABLE');
    }
    return data.reply.trim();
}
