import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';
import { CATEGORY_IDS } from '@/lib/constants';
import type { AnalyzedReceipt } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PROMPT = `Você é um assistente que analisa fotos de recibos brasileiros para uma empresa de mineração.

Extraia as informações do recibo na imagem e responda APENAS um JSON válido (sem markdown, sem \`\`\`) no formato exato:
{
  "description": string | null,
  "amount": number | null,
  "date": "YYYY-MM-DD" | null,
  "category": "diesel" | "manutencao" | "funcionarios" | "equipamentos" | "alimentacao" | "transporte" | "outros"
}

Regras:
- description: nome curto do estabelecimento e/ou produto principal. Ex: "Diesel Posto Shell", "Peças Toyota", "Almoço Restaurante X". Máx 60 caracteres.
- amount: valor TOTAL em reais (número decimal, ex: 850.50). NUNCA use string.
- date: se estiver visível, retorne no formato YYYY-MM-DD. Se não, null.
- category: escolha a mais apropriada. Se não souber, use "outros".

Se não for um recibo ou não conseguir ler nada, retorne todos os campos como null exceto category = "outros".`;

export async function POST(req: Request) {
  // Requer autenticação
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY não configurada' }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'Arquivo ausente' }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const base64 = buf.toString('base64');
    const mimeType = file.type || 'image/jpeg';

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const result = await model.generateContent([
      PROMPT,
      { inlineData: { mimeType, data: base64 } },
    ]);

    const text = result.response.text().trim();
    let parsed: AnalyzedReceipt;
    try {
      parsed = JSON.parse(text);
    } catch {
      // Fallback caso Gemini retorne com fences
      const cleaned = text.replace(/^```(?:json)?\s*|\s*```$/g, '');
      parsed = JSON.parse(cleaned);
    }

    // Sanitizar
    const out: AnalyzedReceipt = {
      description: typeof parsed.description === 'string' ? parsed.description.slice(0, 60) : null,
      amount: typeof parsed.amount === 'number' && parsed.amount > 0 ? parsed.amount : null,
      date: typeof parsed.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date) ? parsed.date : null,
      category: typeof parsed.category === 'string' && CATEGORY_IDS.includes(parsed.category) ? parsed.category : 'outros',
    };

    return NextResponse.json(out);
  } catch (err: any) {
    console.error('analyze-receipt error:', err);
    return NextResponse.json(
      { error: 'Falha ao analisar recibo', detail: err?.message ?? String(err) },
      { status: 500 },
    );
  }
}
