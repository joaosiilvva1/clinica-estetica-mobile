import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getQuickChatReply, requestChatReply, CHAT_TIMEOUT_MS } from '../src/utils/clinicChat.ts';
const info = {
  address: 'Rua de teste, 27\nTaboão da Serra',
  openingHoursText: 'Domingos e segundas, com hora marcada.',
  whatsappUrl: 'https://wa.me/5511999999999?text=Agendar',
  treatments: [{
    name: 'Limpeza de Pele Profunda + Massagem Facial Relaxante + Hidratação Facial Glow',
    description: 'Remoção de impurezas, cravos e células mortas, devolvendo o viço e a saúde da pele.',
    price: 130,
    durationMinutes: 120,
  }],
};
test('perguntas rápidas oferecem ação clicável para WhatsApp e explicações cuidadosas', () => {
  const booking = getQuickChatReply('Como agendar?', info);
  assert.match(booking.text, /não reserva horários automaticamente/);
  assert.match(booking.action.href, /^https:\/\/wa\.me\/5511999999999\?text=/);
  assert.match(decodeURIComponent(booking.action.href), /agendar um horário/);

  const cleaning = getQuickChatReply('O que é limpeza de pele?', info);
  assert.match(cleaning.text, /cravos e células mortas/);
  assert.match(cleaning.text, /não é um tratamento médico para acne/);
  assert.match(cleaning.source.href, /aad.org/);
  assert.match(getQuickChatReply('Limpeza de pele', info).text, /cravos e células mortas/);
  assert.match(getQuickChatReply('Quero fazer uma limpesa facial', info).text, /cravos e células mortas/);

  const massage = getQuickChatReply('Massagem facial', info);
  assert.match(massage.text, /conforto e ao relaxamento/);
  assert.match(massage.text, /nem promete mudar o contorno/);
  assert.match(massage.source.href, /clevelandclinic.org/);

  const hydration = getQuickChatReply('Hidratação facial', info);
  assert.match(hydration.text, /reduzir a perda de água/);
  assert.match(decodeURIComponent(hydration.action.href), /hidratação facial/);

  const price = getQuickChatReply('Qual o preço da massagem facial?', info);
  assert.match(price.text, /R\$\s?130,00/);
  assert.match(price.text, /120 minutos/);
  assert.match(price.text, /Massagem Facial Relaxante/);
  assert.match(decodeURIComponent(price.action.href), /massagem facial/);

  assert.match(getQuickChatReply('Onde fica?', info).text, /Rua de teste, 27, Taboão/);
  assert.match(getQuickChatReply('Horários', info).text, /confirme a disponibilidade/i);
  assert.match(getQuickChatReply('Como me preparo antes do procedimento?', info).text, /Não suspenda medicamentos/);
  assert.match(getQuickChatReply('Cuidados depois do procedimento', info).text, /FPS 30 ou mais/);
  assert.match(getQuickChatReply('Estou grávida, posso fazer?', info).text, /gravidez/);
  assert.equal(getQuickChatReply('Qual tratamento devo fazer?', info), null);
  assert.equal(CHAT_TIMEOUT_MS, 180000);
});
test('chat valida sucesso, falhas HTTP, fallback legado e resposta vazia', async (t) => {
  let body = { reply: 'Resposta válida' }; let status = 200;
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    assert.equal(JSON.parse(options.body).message, 'Olá');
    return new Response(JSON.stringify(body), { status });
  });
  const signal = new AbortController().signal;
  assert.equal(await requestChatReply('https://example.test', 'Olá', signal), 'Resposta válida');
  for (const reply of ['', 'Desculpe, não consegui responder agora. Tente novamente.']) {
    body = { reply }; await assert.rejects(requestChatReply('https://example.test', 'Olá', signal));
  }
  body = { reply: 'não disponível', available: false };
  await assert.rejects(requestChatReply('https://example.test', 'Olá', signal));
  status = 503; await assert.rejects(requestChatReply('https://example.test', 'Olá', signal));
});
test('cancelamento é encaminhado à requisição sem nova tentativa automática', async (t) => {
  const controller = new AbortController(); controller.abort();
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    calls++; assert.equal(options.signal, controller.signal); options.signal.throwIfAborted();
  });
  await assert.rejects(requestChatReply('https://example.test', 'Olá', controller.signal), { name: 'AbortError' });
  assert.equal(calls, 1);
});
