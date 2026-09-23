import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getQuickChatReply, requestChatReply, CHAT_TIMEOUT_MS } from '../src/utils/clinicChat.ts';
const info = { address: 'Rua de teste, 27\nTaboão da Serra', openingHoursText: 'Domingos e segundas, com hora marcada.' };
test('informações rápidas usam o conteúdo da clínica e não inventam disponibilidade', () => {
  assert.match(getQuickChatReply('Onde fica?', info), /Rua de teste, 27, Taboão/);
  assert.match(getQuickChatReply('Horários', info), /Consulte a disponibilidade/);
  assert.match(getQuickChatReply('Como agendar?', info), /Nenhum horário é reservado automaticamente/);
  assert.equal(getQuickChatReply('Qual tratamento devo fazer?', info), null);
  assert.equal(CHAT_TIMEOUT_MS, 90000);
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
