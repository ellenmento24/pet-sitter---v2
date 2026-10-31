# Patinhas v4

App de pet sitter com sincronização entre aparelhos (Netlify Functions + Netlify Blobs).

## Estrutura do repositório

Tudo fica solto na raiz, exceto a função de sincronização:

```
LEIA-ME.md
icon-180.png
icon-192.png
icon-512.png
index.html
manifest.json
netlify.toml
package.json
sw.js
netlify/
  functions/
    api.mjs      ← precisa estar exatamente aqui
```

## Subir no GitHub

1. Repositório vazio → **uploading an existing file** → selecione os **9 arquivos soltos** (pode ser pelo botão de escolher arquivos) → **Commit changes**.
2. A função precisa ficar dentro de `netlify/functions/`. Escolha uma das formas:
   - **Arrastar a pasta:** **Add file → Upload files** e arraste a **pasta `netlify`** (no Chrome ou Edge) para a página → **Commit changes**.
   - **Criar pelo editor:** **Add file → Create new file**. No nome, digite `netlify/functions/api.mjs`. Abra o `api.mjs` desta pasta no Bloco de Notas, copie tudo e cole no editor → **Commit changes**.
3. Confira se a raiz mostra os 9 arquivos e a pasta `netlify`, com `functions/api.mjs` dentro.

## Netlify

1. Ligue o repositório ao projeto: **Project configuration → Build & deploy → Continuous deployment → Link repository** (ou crie com **Add new project → Import an existing project**).
2. Deixe o Build command vazio. Publish directory e Functions directory já vêm do `netlify.toml`.
3. **Project configuration → Environment variables → Add a variable** → `PATINHAS_SENHA` = uma senha forte.
4. **Deploys → Trigger deploy → Deploy project** (a variável só vale após um novo deploy).
5. Teste `https://SEU-ENDEREÇO.netlify.app/api/ping`. A resposta `{"error":"Senha incorreta"}` significa que está funcionando.

## Conectar os aparelhos

1. **Primeiro o celular que tem os dados:** abra pelo ícone e feche/abra uma ou duas vezes para atualizar. Depois: engrenagem → Sincronização → senha → **Conectar**.
2. **Depois o computador:** abra o site → aviso "Sincronização desligada" → mesma senha → **Conectar**.

A bolinha na engrenagem mostra o status: verde = ok, laranja = sincronizando, vermelha = problema (detalhe em Ajustes).

## Atualizações

Envie os arquivos alterados com **Add file → Upload files** (eles substituem os de mesmo nome). O Netlify publica sozinho. Cada publicação gasta ~15 dos 300 créditos mensais do plano grátis. Se for subir várias coisas, mande tudo num único commit.
