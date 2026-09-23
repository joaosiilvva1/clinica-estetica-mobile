export const CHAT_TIMEOUT_MS = 90000;

type ClinicInfo = { address: string; openingHoursText: string };

// Apenas informações já exibidas no site; não depende da IA para dúvidas básicas.
export function getQuickChatReply(message: string, info: ClinicInfo): string | null {
    const question = message.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[?!.]/g, '').trim();
    if (['como agendar', 'quero agendar', 'agendamento'].includes(question)) {
        return 'O agendamento é feito diretamente com a Maria pelo WhatsApp. Use o link abaixo para combinar o procedimento e consultar os horários. Nenhum horário é reservado automaticamente por aqui.';
    }
    if (['onde fica', 'qual o endereco', 'qual o endereco da clinica', 'endereco', 'localizacao'].includes(question)) {
        return `Estamos em: ${info.address.replace(/\n/g, ', ')}. Você também encontra o mapa na seção Onde Estamos.`;
    }
    if (['horarios', 'horario de atendimento', 'qual o horario de atendimento'].includes(question)) {
        return `${info.openingHoursText} Consulte a disponibilidade diretamente com a Maria pelo WhatsApp.`;
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
