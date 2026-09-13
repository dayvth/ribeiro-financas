# Ribeiro Mineração — Controle financeiro

Sistema web mobile-first para controle financeiro. Next.js + Supabase + Gemini.

- **Dashboard** — lucro bruto, despesas, resultado, investimento total, despesas por categoria
- **Movimentações** — lista completa, com detalhe e recibo
- **Adicionar** — despesa (foto do recibo com IA ou manual), receita, investimento
- **Realtime** — quando você lança, aparece imediatamente no celular do seu irmão
- **PWA** — pode instalar na tela inicial do celular

---

## Passo a passo (30–40 min)

### 1. Criar projeto Supabase

1. Vá em [supabase.com](https://supabase.com) → **Start your project** → **New project**
2. Nome: `ribeiro-financas` — Region: `South America (São Paulo)` — escolha uma senha forte pro banco
3. Espere ~2 minutos até o projeto ficar pronto

### 2. Rodar o schema do banco

1. No painel do Supabase, menu esquerdo → **SQL Editor** → **New query**
2. Cole todo o conteúdo do arquivo `supabase/schema.sql`
3. Clique em **Run**. Deve aparecer "Success"

Isso cria: tabelas `transactions` e `categories`, políticas RLS, realtime habilitado e o bucket `receipts` para as fotos.

### 3. Criar os dois usuários

1. Menu esquerdo → **Authentication** → **Users** → **Add user** → **Create new user**
2. Crie o seu: e-mail + senha (marque "Auto Confirm User")
3. Crie o do seu irmão: mesmo processo

### 4. Copiar as chaves do Supabase

1. Menu esquerdo → **Project Settings** → **API**
2. Copie:
   - **Project URL** (algo como `https://xxxx.supabase.co`)
   - **anon / public** key (a chave pública, longa)

### 5. Pegar chave do Gemini (grátis)

1. Acesse [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Faça login com Google → **Create API key** → **Create API key in new project**
3. Copie a chave (começa com `AIza…`)

O tier grátis do Gemini 2.0 Flash dá **1.500 requisições por dia** — muito mais do que dois irmãos vão gastar.

### 6. Configurar variáveis locais

Na raiz do projeto:

```bash
cp .env.example .env.local
```

Abra `.env.local` e cole as três chaves:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
GEMINI_API_KEY=AIza...
```

### 7. Instalar e rodar

```bash
npm install
npm run dev
```

Abra `http://localhost:3000` — faça login com o e-mail e senha que você criou no passo 3.

### 8. Deploy no Vercel

1. Suba o código para o GitHub (repositório privado)
2. Acesse [vercel.com](https://vercel.com) → **Add New Project** → importe o repositório
3. Antes de fazer deploy, vá em **Environment Variables** e adicione as três variáveis do `.env.local`
4. **Deploy**

Em ~2 minutos você tem a URL pública (`https://ribeiro-financas.vercel.app` ou similar).

### 9. Instalar no celular

**iPhone (Safari):**
1. Abra a URL
2. Toque no botão de compartilhar (quadrado com seta)
3. Rolar → **Adicionar à Tela de Início**

**Android (Chrome):**
1. Abra a URL
2. Menu ⋮ → **Instalar aplicativo** (ou **Adicionar à tela inicial**)

Pronto. Vai aparecer o R dourado como ícone e abrir em tela cheia como app.

---

## Estrutura

```
app/
  page.tsx                    → home (verifica auth, renderiza App)
  login/page.tsx              → tela de login
  api/analyze-receipt/        → chama Gemini para ler recibo
  auth/signout/               → logout
components/
  App.tsx                     → estado principal + realtime
  Dashboard.tsx               → tela 1
  Transactions.tsx            → tela 2
  TransactionForm.tsx         → formulário (com categoria e IA)
  TransactionDetail.tsx       → detalhe de movimentação
  Sheet.tsx, BottomBar.tsx    → UI compartilhada
lib/
  supabase/                   → clients (browser, server, middleware)
  format.ts                   → BRL, data, filtro por período
  constants.ts, types.ts
supabase/
  schema.sql                  → todo o banco
```

---

## Como funcionam as regras financeiras

- **Lucro bruto** = soma das receitas no período
- **Despesas** = soma das despesas no período
- **Resultado** = Lucro bruto − Despesas
- **Investimento total** = soma dos investimentos (NÃO entra no cálculo do resultado)

O filtro de período (Semana / Mês / Ano / Personalizado) recalcula tudo.

---

## Como funciona o realtime

O `App.tsx` inscreve no canal `transactions-changes` do Supabase. Sempre que qualquer usuário insere, edita ou apaga uma movimentação, os dois celulares recarregam a lista automaticamente. Sem refresh manual.

---

## Como funciona a IA do recibo

1. Você tira foto do recibo
2. A foto é enviada para `/api/analyze-receipt`
3. A rota manda pra Gemini 2.0 Flash com um prompt específico pra recibos brasileiros
4. Gemini devolve JSON com `description`, `amount`, `date`, `category`
5. O formulário abre já preenchido — você confere e salva

Se a IA errar algo, é só editar antes de salvar.

---

## Custos

- **Supabase**: tier grátis é mais que suficiente (500 MB de banco, 1 GB de storage, 2 GB de bandwidth/mês)
- **Gemini**: tier grátis dá 1.500 requisições/dia
- **Vercel**: tier grátis (hobby) hospeda tranquilo
- **Total: R$ 0/mês** para o uso de vocês

---

## Melhorias possíveis depois (não implementadas)

Foram deixadas de fora pra manter o escopo do MVP:

- Editar movimentação (hoje só cria e exclui)
- Modo offline com sincronização quando voltar internet
- Exportar movimentações (CSV/PDF)
- Gráficos de evolução mensal
- Filtro/busca na lista de movimentações
- Ícones customizados para categorias criadas pelo usuário

Se quiser adicionar qualquer uma dessas depois, me avise.
