const GATEWAY = "https://ai.gateway.lovable.dev/v1";
const MODEL = "google/gemini-3.6-flash";

function key() {
  const k = process.env["LOVABLE_API_KEY"];
  if (!k) throw new Error("Brak konfiguracji AI (LOVABLE_API_KEY).");
  return k;
}

export type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

export async function chat(messages: ChatMsg[]): Promise<string> {
  const res = await fetch(`${GATEWAY}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key(),
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({ model: MODEL, messages }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("Za dużo zapytań do AI. Spróbuj za chwilę.");
    if (res.status === 402) throw new Error("Wyczerpano kredyty AI w tym projekcie.");
    throw new Error(`Błąd AI [${res.status}]: ${body.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content ?? "";
}

export function parseJson<T>(text: string, fallback: T): T {
  const cleaned = text
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) return fallback;
  try {
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  } catch {
    return fallback;
  }
}

export async function speak(text: string, voice = "onyx"): Promise<string> {
  const res = await fetch(`${GATEWAY}/audio/speech`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key()}`,
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini-tts",
      input: text.slice(0, 2000),
      voice,
      response_format: "mp3",
      instructions:
        "Speak natural, clear Indonesian (Bahasa Indonesia) with a warm Jakarta accent, moderate pace.",
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Błąd syntezy mowy [${res.status}]: ${body.slice(0, 200)}`);
  }

  const buf = await res.arrayBuffer();
  return Buffer.from(buf).toString("base64");
}
