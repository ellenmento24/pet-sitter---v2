# Patinhas v3 — com sincronização entre aparelhos

O app continua salvando tudo no aparelho (rápido e funciona offline) e, quando tem internet, sincroniza com o armazenamento do seu projeto no Netlify (Netlify Blobs). O acesso aos dados é protegido por uma senha que só vocês sabem.

## O que tem nesta pasta

| Pasta / arquivo | Para que serve |
|---|---|
| `public/` | O app (index.html, ícones, manifest, sw.js) |
| `netlify/functions/api.mjs` | A "API" que guarda e devolve os dados e as fotos |
| `netlify.toml` | Diz ao Netlify que o site está em `public/` e as funções em `netlify/functions/` |
| `package.json` | Lista a biblioteca de armazenamento (`@netlify/blobs`), que o Netlify instala sozinho |

## Publicação (uma vez)

Funções do Netlify só funcionam quando o site é publicado via Git (ou CLI). Arrastar a pasta no Netlify **não serve mais**. O caminho abaixo usa o GitHub pelo navegador, sem instalar nada.

### 0. Faça um backup no celular (segurança)
No app atual do celular: engrenagem → **Exportar backup** → salve no Arquivos/iCloud.

### 1. Suba o código no GitHub
1. Crie uma conta grátis em github.com (se ainda não tiver).
2. Clique em **+ → New repository**. Nome: `patinhas`. Pode deixar **Private**. Clique em **Create repository**.
3. Na página do repositório vazio, clique no link **uploading an existing file**.
4. Abra a pasta `patinhas-app` no computador, selecione **o conteúdo dela** (`public`, `netlify`, `netlify.toml`, `package.json`, `LEIA-ME.md`) e arraste para a página. Use Chrome ou Edge, que aceitam pastas.
5. Clique em **Commit changes**.
6. Confira: o repositório deve mostrar `netlify.toml` e `package.json` na raiz, e as pastas `public` e `netlify`.

### 2. Ligue o GitHub ao projeto do Netlify (mantendo o mesmo endereço)
1. No Netlify, abra o projeto que você já criou.
2. Vá em **Project configuration → Build & deploy → Continuous deployment** e procure **Link repository** (ou "Link to Git").
3. Escolha **GitHub**, autorize o acesso e selecione o repositório `patinhas`.
4. Nas configurações de build: **Build command** vazio, **Publish directory** `public`, **Functions directory** `netlify/functions` (o `netlify.toml` já informa isso).

Se não encontrar a opção de ligar o projeto existente, crie um novo: **Add new project → Import an existing project → GitHub → patinhas → Deploy**. O endereço muda. Depois de tudo pronto, restaure no app novo o backup do passo 0.

### 3. Crie a senha de sincronização
1. No projeto: **Project configuration → Environment variables → Add a variable**.
2. **Key:** `PATINHAS_SENHA` · **Value:** uma senha forte (ex.: três palavras + números). Deixe todos os escopos marcados.
3. Salve e faça um novo deploy para valer: aba **Deploys → Trigger deploy → Deploy project**.

### 4. Teste se a parte de sincronização está no ar
Abra `https://SEU-ENDEREÇO.netlify.app/api/ping` no navegador.
- `{"error":"Senha incorreta"}` → **está funcionando** (o navegador não mandou a senha, por isso a mensagem).
- `{"error":"Senha não configurada..."}` → faltou o passo 3 ou o novo deploy.
- Página 404 do Netlify → a função não subiu. Confira se `netlify.toml` e `package.json` estão na raiz do repositório.

### 5. Conecte os aparelhos
1. **Primeiro o celular que já tem os dados:** abra o app pelo ícone e feche/abra uma ou duas vezes para carregar a versão nova. Toque na engrenagem → **Sincronização entre aparelhos** → digite a senha → **Conectar**. Tudo sobe para a nuvem, inclusive as fotos.
2. **Depois o computador:** abra o endereço, toque no aviso "Sincronização desligada" (ou na engrenagem), digite a mesma senha → **Conectar**. Os dados aparecem.

A bolinha na engrenagem mostra o status: verde = sincronizado, laranja = sincronizando, vermelha = problema (veja em Ajustes).

## Como funciona a sincronização
- Sincroniza ao abrir o app, a cada minuto com ele aberto, ao voltar para ele e logo depois de cada alteração.
- Sem internet, as alterações ficam guardadas na fila e sobem quando a conexão voltar.
- Se o mesmo registro for alterado em dois aparelhos, vale a alteração mais recente.

## Atualizações futuras
Basta enviar os arquivos novos para o repositório no GitHub (**Add file → Upload files**, arrastando por cima). O Netlify publica sozinho. Cada publicação gasta ~15 dos 300 créditos mensais do plano grátis.

## Segurança
- Quem tiver a senha vê todos os dados (endereços, senhas de fechadura). Não compartilhe e não use uma senha fraca.
- Para trocar a senha: mude `PATINHAS_SENHA` no Netlify, faça um novo deploy e conecte de novo em cada aparelho.
