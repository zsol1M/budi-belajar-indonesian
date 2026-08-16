import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { chat, parseJson, speak, type ChatMsg } from "./ai.server";

const MsgSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(2000),
});

export const budiChat = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) =>
    z
      .object({
        messages: z.array(MsgSchema).max(30),
        level: z.string().default("A1"),
      })
      .parse(raw),
  )
  .handler(async ({ data }) => {
    const system: ChatMsg = {
      role: "system",
      content: `Jesteś "Budi", przyjazny indonezyjski nauczyciel rozmawiający przez telefon z Polakiem uczącym się bahasa Indonesia na poziomie ${data.level}.
Odpowiadaj KRÓTKO (1-3 zdania) po indonezyjsku, dopasowując słownictwo do poziomu.
Zwróć WYŁĄCZNIE JSON:
{"reply":"odpowiedź po indonezyjsku","translation":"tłumaczenie odpowiedzi na polski","correction":"krótka uwaga po polsku o błędzie użytkownika lub pusty string","suggestions":["3 propozycje","co użytkownik może odpowiedzieć","po indonezyjsku"]}`,
    };
    const text = await chat([system, ...data.messages]);
    return parseJson(text, {
      reply: "Maaf, saya tidak mengerti.",
      translation: "Przepraszam, nie rozumiem.",
      correction: "",
      suggestions: ["Apa kabar?", "Saya dari Polandia.", "Tolong ulangi."],
    });
  });

export const adventureTurn = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) =>
    z
      .object({
        scenario: z.string().max(200),
        level: z.string().default("A1"),
        history: z.array(MsgSchema).max(30),
      })
      .parse(raw),
  )
  .handler(async ({ data }) => {
    const system: ChatMsg = {
      role: "system",
      content: `Prowadzisz tekstową grę RPG po indonezyjsku dla Polaka (poziom ${data.level}).
Scenariusz: "${data.scenario}".
Każda tura: opisz scenę po indonezyjsku (2-4 zdania), reaguj na to, co napisał gracz, i pchnij fabułę do przodu.
Zwróć WYŁĄCZNIE JSON:
{"scene":"opis sceny po indonezyjsku","translation":"tłumaczenie sceny na polski","feedback":"krótka uwaga po polsku o języku gracza lub pusty string","hints":["3 możliwe kwestie","gracza","po indonezyjsku"],"status":"continue"}`,
    };
    const text = await chat([system, ...data.history]);
    return parseJson(text, {
      scene: "Kamu berdiri di jalan yang ramai.",
      translation: "Stoisz na ruchliwej ulicy.",
      feedback: "",
      hints: ["Saya mau ke hotel.", "Berapa harganya?", "Tolong bantu saya."],
      status: "continue",
    });
  });

export const lessonReward = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) =>
    z
      .object({
        lesson: z.string().max(120),
        grammar: z.string().max(400),
        words: z.array(z.string().max(40)).max(15),
      })
      .parse(raw),
  )
  .handler(async ({ data }) => {
    const text = await chat([
      {
        role: "system",
        content: `Jesteś zabawnym twórcą treści edukacyjnych dla Polaków uczących się indonezyjskiego.
Użyj DOKŁADNIE zasady gramatycznej i słów z lekcji.
Zwróć WYŁĄCZNIE JSON:
{"story":"śmieszna mikro-historyjka po indonezyjsku (3-4 zdania)","storyPl":"tłumaczenie na polski","memeTop":"górny tekst mema po indonezyjsku (max 6 słów)","memeBottom":"dolny tekst mema po indonezyjsku (max 8 słów)","memePl":"wyjaśnienie żartu po polsku","emoji":"jedno emoji pasujące do mema"}`,
      },
      {
        role: "user",
        content: `Lekcja: ${data.lesson}\nGramatyka: ${data.grammar}\nSłowa: ${data.words.join(", ")}`,
      },
    ]);
    return parseJson(text, {
      story: "Budi makan nasi goreng. Nasi goreng itu terlalu pedas!",
      storyPl: "Budi je nasi goreng. To nasi goreng jest za ostre!",
      memeTop: "Saya bisa bahasa Indonesia",
      memeBottom: "Tapi saya lupa semua kata",
      memePl: "Klasyczne uczucie po pierwszej lekcji.",
      emoji: "😅",
    });
  });

export const translateToPolish = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => z.object({ text: z.string().min(1).max(1000) }).parse(raw))
  .handler(async ({ data }) => {
    const text = await chat([
      {
        role: "system",
        content:
          "Przetłumacz tekst z indonezyjskiego na naturalny polski. Zwróć wyłącznie tłumaczenie, bez komentarzy.",
      },
      { role: "user", content: data.text },
    ]);
    return { translation: text.trim() };
  });

export const speakIndonesian = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => z.object({ text: z.string().min(1).max(600) }).parse(raw))
  .handler(async ({ data }) => {
    const audio = await speak(data.text);
    return { audio };
  });
