// API de sincronização do Patinhas (Netlify Functions + Netlify Blobs).
// Protegida pela variável de ambiente PATINHAS_SENHA configurada no painel do Netlify.
import { getStore } from '@netlify/blobs';

export const config = { path: '/api/*' };

const COLS = new Set(['clients', 'services']);
const ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

async function loadDb(store) {
  const r = await store.getWithMetadata('db', { type: 'json' });
  if (!r || !r.data) return { db: { rev: 0, records: {} }, etag: null };
  return { db: r.data, etag: r.etag };
}

async function handleSync(req, store) {
  let body;
  try { body = await req.json(); } catch { return json({ error: 'JSON inválido' }, 400); }
  const changes = Array.isArray(body.changes) ? body.changes : [];
  let sinceRev = Number(body.sinceRev) || 0;

  for (let attempt = 0; attempt < 6; attempt++) {
    const { db, etag } = await loadDb(store);
    let changed = false;
    for (const c of changes) {
      if (!c || !COLS.has(c.col) || !ID_RE.test(String(c.id))) continue;
      const key = `${c.col}/${c.id}`;
      const cur = db.records[key];
      const ts = Number(c.updatedAt) || Date.now();
      if (cur && (cur.updatedAt || 0) > ts) continue; // servidor tem versão mais nova
      db.rev += 1;
      db.records[key] = { col: c.col, id: c.id, updatedAt: ts, deleted: !!c.deleted, data: c.deleted ? null : c.data, rev: db.rev };
      changed = true;
    }
    if (changed) {
      const res = etag
        ? await store.setJSON('db', db, { onlyIfMatch: etag })
        : await store.setJSON('db', db, { onlyIfNew: true });
      if (!res.modified) continue; // outro aparelho gravou ao mesmo tempo: tenta de novo
    }
    if (sinceRev > db.rev) sinceRev = 0; // servidor foi reiniciado: manda tudo
    const records = Object.values(db.records).filter(r => r.rev > sinceRev);
    return json({ rev: db.rev, records });
  }
  return json({ error: 'Conflito, tente de novo' }, 409);
}

export default async (req) => {
  const secret = process.env.PATINHAS_SENHA;
  if (!secret) return json({ error: 'Senha não configurada no Netlify (variável PATINHAS_SENHA).' }, 503);
  if (!safeEqual(req.headers.get('x-patinhas-key') || '', secret)) return json({ error: 'Senha incorreta' }, 401);

  const path = new URL(req.url).pathname.replace(/^\/api\/?/, '');
  const store = getStore({ name: 'patinhas', consistency: 'strong' });

  if (path === 'ping') return json({ ok: true });
  if (path === 'sync' && req.method === 'POST') return handleSync(req, store);

  const m = path.match(/^photo\/([A-Za-z0-9_-]{1,64})$/);
  if (m) {
    const key = 'photo/' + m[1];
    if (req.method === 'PUT') {
      const buf = await req.arrayBuffer();
      if (buf.byteLength > 5_000_000) return json({ error: 'Foto grande demais' }, 413);
      await store.set(key, buf);
      return json({ ok: true });
    }
    if (req.method === 'GET') {
      const data = await store.get(key, { type: 'arrayBuffer' });
      if (!data) return json({ error: 'Foto não encontrada' }, 404);
      return new Response(data, { headers: { 'content-type': 'image/jpeg', 'cache-control': 'private, max-age=31536000, immutable' } });
    }
    if (req.method === 'DELETE') { await store.delete(key); return json({ ok: true }); }
  }
  return json({ error: 'Não encontrado' }, 404);
};
