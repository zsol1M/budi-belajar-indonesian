import { VOCAB_LESSONS } from "./vocab-nodes";

export type Level = "A1" | "A2" | "B1" | "B2";

export type Exercise =
  | { kind: "flashcard"; id: string; front: string; back: string; hint?: string }
  | { kind: "match"; id: string; pairs: { id: string; pl: string }[] }
  | { kind: "builder"; id: string; words: string[]; solution: string; pl: string }
  | {
      kind: "blocks";
      id: string;
      prompt: string;
      root: string;
      affixes: string[];
      answer: string;
      pl: string;
    }
  | {
      kind: "choice";
      id: string;
      question: string;
      options: string[];
      answer: string;
      explain: string;
    };

export type LessonKind = "grammar" | "vocab";

export type LessonContext = { key: string; label: string; brief: string };

export type Lesson = {
  id: string;
  level: Level;
  kind?: LessonKind;
  title: string;
  subtitle: string;
  icon: string;
  checkpoint?: boolean;
  context?: LessonContext;
  grammar: { title: string; body: string[]; examples: { id: string; pl: string }[] };
  vocab: { id: string; pl: string }[];
  exercises: Exercise[];
};

export const LEVEL_LABELS: Record<Level, string> = {
  A1: "A1 · Pierwsze kroki",
  A2: "A2 · Przedrostki i pytania",
  B1: "B1 · Strona bierna i sufiksy",
  B2: "B2 · Konfiksy i Bahasa Gaul",
};

const GRAMMAR_LESSONS: Lesson[] = [
  {
    id: "a1-1",
    level: "A1",
    title: "Szyk SVO bez odmiany",
    subtitle: "Podmiot – orzeczenie – dopełnienie",
    icon: "🌱",
    grammar: {
      title: "Zdanie indonezyjskie jest prostsze niż polskie",
      body: [
        "W bahasa Indonesia czasownik NIE odmienia się przez osoby ani czasy. „Makan” (jeść) brzmi tak samo dla ja, ty, on, my.",
        "Obowiązuje stały szyk: PODMIOT → CZASOWNIK → DOPEŁNIENIE (SVO). Nie ma przypadków, nie ma rodzajników.",
        "Zaimki: saya (ja, formalnie), aku (ja, potocznie), kamu (ty), dia (on/ona), mereka (oni).",
      ],
      examples: [
        { id: "Saya makan nasi.", pl: "Jem ryż." },
        { id: "Dia minum kopi.", pl: "On/ona pije kawę." },
        { id: "Mereka belajar bahasa Indonesia.", pl: "Oni uczą się indonezyjskiego." },
      ],
    },
    vocab: [
      { id: "makan", pl: "jeść" },
      { id: "minum", pl: "pić" },
      { id: "nasi", pl: "ryż" },
      { id: "kopi", pl: "kawa" },
      { id: "belajar", pl: "uczyć się" },
      { id: "rumah", pl: "dom" },
    ],
    exercises: [
      { kind: "flashcard", id: "a1-1-f1", front: "makan", back: "jeść" },
      { kind: "flashcard", id: "a1-1-f2", front: "minum", back: "pić" },
      {
        kind: "match",
        id: "a1-1-m1",
        pairs: [
          { id: "nasi", pl: "ryż" },
          { id: "kopi", pl: "kawa" },
          { id: "rumah", pl: "dom" },
          { id: "belajar", pl: "uczyć się" },
        ],
      },
      {
        kind: "builder",
        id: "a1-1-b1",
        words: ["Saya", "makan", "nasi"],
        solution: "Saya makan nasi",
        pl: "Jem ryż.",
      },
      {
        kind: "choice",
        id: "a1-1-c1",
        question: "Jak powiedzieć „Ona pije kawę”?",
        options: ["Dia minum kopi", "Kopi dia minum", "Dia minumnya kopi"],
        answer: "Dia minum kopi",
        explain: "Stały szyk SVO: dia (podmiot) + minum (czasownik) + kopi (dopełnienie).",
      },
    ],
  },
  {
    id: "a1-2",
    level: "A1",
    title: "Tidak vs bukan",
    subtitle: "Dwa różne „nie”",
    icon: "🚫",
    grammar: {
      title: "Przeczenie zależy od tego, co negujesz",
      body: [
        "TIDAK — negujemy czasowniki i przymiotniki. Saya tidak makan. (Nie jem.)",
        "BUKAN — negujemy rzeczowniki i zaimki. Ini bukan rumah. (To nie jest dom.)",
        "Potocznie „tidak” skraca się do „nggak / gak”, a „bukan” zostaje bez zmian.",
      ],
      examples: [
        { id: "Saya tidak minum kopi.", pl: "Nie piję kawy." },
        { id: "Dia bukan guru.", pl: "On nie jest nauczycielem." },
        { id: "Rumah ini tidak besar.", pl: "Ten dom nie jest duży." },
      ],
    },
    vocab: [
      { id: "tidak", pl: "nie (czasowniki/przymiotniki)" },
      { id: "bukan", pl: "nie (rzeczowniki)" },
      { id: "guru", pl: "nauczyciel" },
      { id: "besar", pl: "duży" },
      { id: "kecil", pl: "mały" },
    ],
    exercises: [
      {
        kind: "choice",
        id: "a1-2-c1",
        question: "Dia ___ dokter. (On nie jest lekarzem)",
        options: ["bukan", "tidak", "belum"],
        answer: "bukan",
        explain: "„Dokter” to rzeczownik, więc używamy BUKAN.",
      },
      {
        kind: "choice",
        id: "a1-2-c2",
        question: "Saya ___ suka durian. (Nie lubię duriana)",
        options: ["tidak", "bukan", "jangan"],
        answer: "tidak",
        explain: "„Suka” to czasownik → TIDAK.",
      },
      {
        kind: "builder",
        id: "a1-2-b1",
        words: ["Ini", "bukan", "rumah", "saya"],
        solution: "Ini bukan rumah saya",
        pl: "To nie jest mój dom.",
      },
      {
        kind: "match",
        id: "a1-2-m1",
        pairs: [
          { id: "besar", pl: "duży" },
          { id: "kecil", pl: "mały" },
          { id: "guru", pl: "nauczyciel" },
          { id: "dokter", pl: "lekarz" },
        ],
      },
    ],
  },
  {
    id: "a1-3",
    level: "A1",
    title: "Liczba mnoga i kita/kami",
    subtitle: "Reduplikacja + dwa rodzaje „my”",
    icon: "👥",
    grammar: {
      title: "Podwojenie słowa = liczba mnoga",
      body: [
        "Liczbę mnogą tworzymy przez powtórzenie wyrazu: anak → anak-anak (dzieci), buku → buku-buku (książki).",
        "Jeśli jest liczebnik lub „banyak” (dużo), NIE podwajamy: dua anak (dwoje dzieci), banyak buku.",
        "KITA = my (włącznie z rozmówcą). KAMI = my (bez rozmówcy). To rozróżnienie jest obowiązkowe!",
      ],
      examples: [
        { id: "Anak-anak bermain di rumah.", pl: "Dzieci bawią się w domu." },
        { id: "Kita makan bersama.", pl: "Zjemy razem (ty też)." },
        { id: "Kami dari Polandia.", pl: "My jesteśmy z Polski (ty nie)." },
      ],
    },
    vocab: [
      { id: "anak", pl: "dziecko" },
      { id: "buku", pl: "książka" },
      { id: "teman", pl: "przyjaciel" },
      { id: "kita", pl: "my (z tobą)" },
      { id: "kami", pl: "my (bez ciebie)" },
    ],
    exercises: [
      {
        kind: "choice",
        id: "a1-3-c1",
        question: "Mówisz do Indonezyjczyka: „Chodźmy razem”. Które „my”?",
        options: ["Kita", "Kami", "Mereka"],
        answer: "Kita",
        explain: "Rozmówca jest częścią grupy → KITA (inkluzywne).",
      },
      {
        kind: "choice",
        id: "a1-3-c2",
        question: "Jak powiedzieć „książki” (ogólnie, bez liczby)?",
        options: ["buku-buku", "bukus", "dua buku"],
        answer: "buku-buku",
        explain: "Reduplikacja tworzy liczbę mnogą.",
      },
      { kind: "flashcard", id: "a1-3-f1", front: "anak-anak", back: "dzieci" },
      {
        kind: "builder",
        id: "a1-3-b1",
        words: ["Kami", "dari", "Polandia"],
        solution: "Kami dari Polandia",
        pl: "Jesteśmy z Polski (bez ciebie).",
      },
    ],
  },
  {
    id: "a1-4",
    level: "A1",
    title: "Sprawdzian A1",
    subtitle: "Markery czasu: mau, bisa, sudah",
    icon: "🏁",
    checkpoint: true,
    grammar: {
      title: "Czas wyrażamy słówkiem, nie odmianą",
      body: [
        "SUDAH = już (czynność dokonana). Saya sudah makan. — Już zjadłem.",
        "BELUM = jeszcze nie. Saya belum makan. — Jeszcze nie jadłem.",
        "AKAN / MAU = będę / chcę (przyszłość, zamiar). BISA = móc, umieć. SEDANG = właśnie (w trakcie).",
      ],
      examples: [
        { id: "Saya sudah minum kopi.", pl: "Już wypiłem kawę." },
        { id: "Dia mau pergi ke Bali.", pl: "On chce jechać na Bali." },
        { id: "Kamu bisa berbicara bahasa Indonesia?", pl: "Umiesz mówić po indonezyjsku?" },
      ],
    },
    vocab: [
      { id: "sudah", pl: "już" },
      { id: "belum", pl: "jeszcze nie" },
      { id: "mau", pl: "chcieć / zamierzać" },
      { id: "bisa", pl: "móc, umieć" },
      { id: "pergi", pl: "iść, jechać" },
    ],
    exercises: [
      {
        kind: "choice",
        id: "a1-4-c1",
        question: "„Jeszcze nie jadłem” to:",
        options: ["Saya belum makan", "Saya tidak makan", "Saya sudah makan"],
        answer: "Saya belum makan",
        explain: "BELUM = jeszcze nie (czynność nastąpi).",
      },
      {
        kind: "choice",
        id: "a1-4-c2",
        question: "Wybierz poprawne przeczenie: „To nie jest moja książka”.",
        options: ["Ini bukan buku saya", "Ini tidak buku saya", "Ini belum buku saya"],
        answer: "Ini bukan buku saya",
        explain: "Rzeczownik → BUKAN.",
      },
      {
        kind: "builder",
        id: "a1-4-b1",
        words: ["Dia", "mau", "pergi", "ke", "Bali"],
        solution: "Dia mau pergi ke Bali",
        pl: "On chce jechać na Bali.",
      },
      {
        kind: "match",
        id: "a1-4-m1",
        pairs: [
          { id: "sudah", pl: "już" },
          { id: "belum", pl: "jeszcze nie" },
          { id: "bisa", pl: "móc" },
          { id: "mau", pl: "chcieć" },
        ],
      },
    ],
  },
  {
    id: "a2-1",
    level: "A2",
    title: "Przedrostek ber-",
    subtitle: "Stan, posiadanie, czynność nieprzechodnia",
    icon: "🔵",
    grammar: {
      title: "ber- = mieć coś / być w jakimś stanie",
      body: [
        "BER- tworzy czasowniki nieprzechodnie (bez dopełnienia): kerja → bekerja (pracować), main → bermain (bawić się).",
        "Często znaczy „mieć”: keluarga → berkeluarga (mieć rodzinę), nama → bernama (nazywać się).",
        "Wyjątki fonetyczne: ber- + ajar = belajar; przed „r” traci r: ber- + renang = berenang.",
      ],
      examples: [
        { id: "Saya bekerja di Jakarta.", pl: "Pracuję w Dżakarcie." },
        { id: "Dia bernama Budi.", pl: "On nazywa się Budi." },
        { id: "Anak-anak bermain bola.", pl: "Dzieci grają w piłkę." },
      ],
    },
    vocab: [
      { id: "bekerja", pl: "pracować" },
      { id: "bermain", pl: "bawić się, grać" },
      { id: "berenang", pl: "pływać" },
      { id: "bernama", pl: "nazywać się" },
    ],
    exercises: [
      {
        kind: "blocks",
        id: "a2-1-x1",
        prompt: "Zbuduj czasownik „pracować”",
        root: "kerja",
        affixes: ["ber-", "me-", "di-", "-kan"],
        answer: "ber-",
        pl: "bekerja — pracować (ber- + kerja)",
      },
      {
        kind: "blocks",
        id: "a2-1-x2",
        prompt: "Zbuduj czasownik „pływać”",
        root: "renang",
        affixes: ["ber-", "ter-", "-i", "pe-"],
        answer: "ber-",
        pl: "berenang — pływać",
      },
      {
        kind: "choice",
        id: "a2-1-c1",
        question: "Które zdanie jest poprawne?",
        options: ["Dia bernama Budi", "Dia menama Budi", "Dia dinama Budi"],
        answer: "Dia bernama Budi",
        explain: "ber- + nama = mieć imię, nazywać się.",
      },
      { kind: "flashcard", id: "a2-1-f1", front: "bekerja", back: "pracować" },
    ],
  },
  {
    id: "a2-2",
    level: "A2",
    title: "Przedrostek me- i pytania",
    subtitle: "Czasowniki przechodnie + -kah",
    icon: "❓",
    grammar: {
      title: "me- = czasownik przechodni (z dopełnieniem)",
      body: [
        "ME- zmienia się fonetycznie: mem- (b, p), men- (d, t), meng- (g, k, samogłoski), meny- (s), me- (l, m, n, r, w, y).",
        "Litery p, t, k, s często znikają: pukul → memukul, tulis → menulis, kirim → mengirim, sapu → menyapu.",
        "Pytania: dodaj partykułę -KAH do słowa kluczowego (formalnie) — Sudahkah kamu makan? Albo użyj słów pytających: apa, siapa, di mana, kapan, kenapa, bagaimana, berapa.",
      ],
      examples: [
        { id: "Saya menulis surat.", pl: "Piszę list." },
        { id: "Apakah kamu sudah makan?", pl: "Czy już jadłeś?" },
        { id: "Di mana kamu tinggal?", pl: "Gdzie mieszkasz?" },
      ],
    },
    vocab: [
      { id: "menulis", pl: "pisać" },
      { id: "membaca", pl: "czytać" },
      { id: "di mana", pl: "gdzie" },
      { id: "kapan", pl: "kiedy" },
      { id: "berapa", pl: "ile" },
    ],
    exercises: [
      {
        kind: "blocks",
        id: "a2-2-x1",
        prompt: "Zbuduj „czytać” (root: baca)",
        root: "baca",
        affixes: ["mem-", "ber-", "ter-", "-an"],
        answer: "mem-",
        pl: "membaca — czytać",
      },
      {
        kind: "choice",
        id: "a2-2-c1",
        question: "„tulis” + me- =",
        options: ["menulis", "mentulis", "metulis"],
        answer: "menulis",
        explain: "Przed „t” używamy men-, a samo „t” znika: menulis.",
      },
      {
        kind: "builder",
        id: "a2-2-b1",
        words: ["Apakah", "kamu", "sudah", "makan"],
        solution: "Apakah kamu sudah makan",
        pl: "Czy już jadłeś?",
      },
      {
        kind: "match",
        id: "a2-2-m1",
        pairs: [
          { id: "kapan", pl: "kiedy" },
          { id: "di mana", pl: "gdzie" },
          { id: "siapa", pl: "kto" },
          { id: "kenapa", pl: "dlaczego" },
        ],
      },
    ],
  },
  {
    id: "a2-3",
    level: "A2",
    title: "Sprawdzian A2",
    subtitle: "Stopniowanie i klasyfikatory",
    icon: "🏁",
    checkpoint: true,
    grammar: {
      title: "lebih / paling oraz liczniki",
      body: [
        "Stopniowanie: LEBIH … DARIPADA (bardziej niż), PALING / TER- (naj-). Dia lebih tinggi daripada saya.",
        "Klasyfikatory po liczebniku: ORANG dla ludzi (dua orang guru), EKOR dla zwierząt (tiga ekor kucing), BUAH dla przedmiotów (empat buah buku).",
        "„Paling besar” = „terbesar” (największy).",
      ],
      examples: [
        { id: "Rumah ini lebih besar daripada rumah saya.", pl: "Ten dom jest większy niż mój." },
        { id: "Saya punya tiga ekor kucing.", pl: "Mam trzy koty." },
        { id: "Dia yang paling pintar.", pl: "On jest najmądrzejszy." },
      ],
    },
    vocab: [
      { id: "lebih", pl: "bardziej" },
      { id: "paling", pl: "naj-" },
      { id: "ekor", pl: "licznik: zwierzęta" },
      { id: "orang", pl: "licznik: ludzie" },
      { id: "buah", pl: "licznik: przedmioty" },
    ],
    exercises: [
      {
        kind: "choice",
        id: "a2-3-c1",
        question: "Dua ___ kucing (dwa koty)",
        options: ["ekor", "orang", "buah"],
        answer: "ekor",
        explain: "Zwierzęta liczymy przez EKOR (dosł. „ogon”).",
      },
      {
        kind: "choice",
        id: "a2-3-c2",
        question: "„Większy niż” to:",
        options: ["lebih besar daripada", "paling besar dari", "besar lebih dari"],
        answer: "lebih besar daripada",
        explain: "Konstrukcja: lebih + przymiotnik + daripada.",
      },
      {
        kind: "blocks",
        id: "a2-3-x1",
        prompt: "Zbuduj „wysyłać” (root: kirim)",
        root: "kirim",
        affixes: ["meng-", "ber-", "-lah", "ke-"],
        answer: "meng-",
        pl: "mengirim — wysyłać (k znika)",
      },
      {
        kind: "builder",
        id: "a2-3-b1",
        words: ["Saya", "punya", "tiga", "ekor", "kucing"],
        solution: "Saya punya tiga ekor kucing",
        pl: "Mam trzy koty.",
      },
    ],
  },
  {
    id: "b1-1",
    level: "B1",
    title: "Strona bierna di-",
    subtitle: "Ulubiona forma Indonezyjczyków",
    icon: "🔄",
    grammar: {
      title: "di- = strona bierna",
      body: [
        "Aktyw: Saya membaca buku. Pasyw: Buku dibaca oleh saya / Buku saya baca.",
        "Dla 3. osoby: di- + rdzeń + OLEH + wykonawca. Buku itu dibaca oleh Budi.",
        "Dla ja/ty pasyw budujemy bez di-: Buku itu saya baca. (Ta książka jest przeze mnie czytana.)",
        "Uwaga: di- jako przedrostek pisze się łącznie (dibaca), a „di” jako przyimek miejsca osobno (di rumah).",
      ],
      examples: [
        { id: "Nasi goreng dimasak oleh ibu.", pl: "Nasi goreng jest gotowane przez mamę." },
        { id: "Surat itu saya tulis kemarin.", pl: "Ten list napisałem wczoraj." },
      ],
    },
    vocab: [
      { id: "dimasak", pl: "ugotowany" },
      { id: "oleh", pl: "przez" },
      { id: "kemarin", pl: "wczoraj" },
      { id: "surat", pl: "list" },
    ],
    exercises: [
      {
        kind: "blocks",
        id: "b1-1-x1",
        prompt: "Zamień „masak” na stronę bierną",
        root: "masak",
        affixes: ["di-", "me-", "ber-", "-nya"],
        answer: "di-",
        pl: "dimasak — jest gotowane",
      },
      {
        kind: "choice",
        id: "b1-1-c1",
        question: "Które zapisane jest poprawnie?",
        options: ["Dia tinggal di rumah", "Dia tinggal dirumah", "Dia ditinggal rumah"],
        answer: "Dia tinggal di rumah",
        explain: "„di” jako miejsce piszemy osobno; di- jako przedrostek łącznie.",
      },
      {
        kind: "builder",
        id: "b1-1-b1",
        words: ["Nasi", "goreng", "dimasak", "oleh", "ibu"],
        solution: "Nasi goreng dimasak oleh ibu",
        pl: "Nasi goreng jest gotowane przez mamę.",
      },
    ],
  },
  {
    id: "b1-2",
    level: "B1",
    title: "Sufiksy -kan / -i oraz ter-",
    subtitle: "Kauzatywność i przypadkowość",
    icon: "⚡",
    grammar: {
      title: "-kan, -i, ter-",
      body: [
        "-KAN: robić coś dla kogoś lub sprawić, by coś się stało. membaca → membacakan (czytać komuś), besar → membesarkan (powiększyć).",
        "-I: czynność skierowana na miejsce/obiekt, powtarzalna. duduk → menduduki (zasiadać na czymś), surat → menyurati (pisać do kogoś).",
        "TER-: czynność przypadkowa lub stan dokonany. jatuh → terjatuh (przewrócić się niechcący), tidur → tertidur (zasnąć niechcący). Też stopień najwyższy: terbaik.",
      ],
      examples: [
        { id: "Saya tertidur di bus.", pl: "Zasnąłem (niechcący) w autobusie." },
        { id: "Ibu membacakan cerita untuk anaknya.", pl: "Mama czyta dziecku bajkę." },
      ],
    },
    vocab: [
      { id: "terjatuh", pl: "przewrócić się przypadkiem" },
      { id: "tertidur", pl: "zasnąć niechcący" },
      { id: "membawakan", pl: "przynieść komuś" },
      { id: "terbaik", pl: "najlepszy" },
    ],
    exercises: [
      {
        kind: "blocks",
        id: "b1-2-x1",
        prompt: "„Zasnąłem niechcący” — zbuduj formę od „tidur”",
        root: "tidur",
        affixes: ["ter-", "ber-", "di-", "-kan"],
        answer: "ter-",
        pl: "tertidur — zasnąć przypadkiem",
      },
      {
        kind: "choice",
        id: "b1-2-c1",
        question: "„membawakan” znaczy:",
        options: ["przynieść coś komuś", "być niesionym", "nieść siebie"],
        answer: "przynieść coś komuś",
        explain: "Sufiks -kan dodaje beneficjenta czynności.",
      },
      {
        kind: "builder",
        id: "b1-2-b1",
        words: ["Saya", "tertidur", "di", "bus"],
        solution: "Saya tertidur di bus",
        pl: "Zasnąłem w autobusie.",
      },
    ],
  },
  {
    id: "b1-3",
    level: "B1",
    title: "Sprawdzian B1",
    subtitle: "Spójniki i partykuła -lah",
    icon: "🏁",
    checkpoint: true,
    grammar: {
      title: "Zdania złożone i emfaza",
      body: [
        "Spójniki: karena (ponieważ), tetapi/tapi (ale), sehingga (tak że), meskipun (chociaż), kalau/jika (jeśli), setelah (po tym jak).",
        "-LAH podkreśla wyraz i przesuwa go na początek: Dialah yang datang. — To właśnie on przyszedł.",
        "-LAH łagodzi też rozkaz: Duduklah! — Usiądź, proszę.",
      ],
      examples: [
        {
          id: "Saya tidak datang karena hujan.",
          pl: "Nie przyszedłem, ponieważ padało.",
        },
        { id: "Dialah yang menolong saya.", pl: "To właśnie on mi pomógł." },
      ],
    },
    vocab: [
      { id: "karena", pl: "ponieważ" },
      { id: "tetapi", pl: "ale" },
      { id: "meskipun", pl: "chociaż" },
      { id: "kalau", pl: "jeśli" },
    ],
    exercises: [
      {
        kind: "choice",
        id: "b1-3-c1",
        question: "Wybierz poprawną stronę bierną: „Ten list został napisany przez Budiego”.",
        options: [
          "Surat itu ditulis oleh Budi",
          "Surat itu menulis oleh Budi",
          "Surat itu bertulis Budi",
        ],
        answer: "Surat itu ditulis oleh Budi",
        explain: "di- + rdzeń + oleh + wykonawca.",
      },
      {
        kind: "choice",
        id: "b1-3-c2",
        question: "Co robi partykuła -lah w „Dialah yang datang”?",
        options: [
          "podkreśla, że to właśnie ON przyszedł",
          "tworzy pytanie",
          "tworzy stronę bierną",
        ],
        answer: "podkreśla, że to właśnie ON przyszedł",
        explain: "-lah to partykuła emfatyczna, często z „yang”.",
      },
      {
        kind: "builder",
        id: "b1-3-b1",
        words: ["Saya", "tidak", "datang", "karena", "hujan"],
        solution: "Saya tidak datang karena hujan",
        pl: "Nie przyszedłem, bo padało.",
      },
    ],
  },
  {
    id: "b2-1",
    level: "B2",
    title: "Konfiksy ke-an i per-an",
    subtitle: "Budowanie rzeczowników abstrakcyjnych",
    icon: "🏛️",
    grammar: {
      title: "Fabryka rzeczowników",
      body: [
        "KE- -AN: abstrakcja lub niepożądane zdarzenie. besar → kebesaran (wielkość / za duże), hujan → kehujanan (zostać złapanym przez deszcz), merdeka → kemerdekaan (niepodległość).",
        "PER- -AN: proces, miejsce, system. usaha → perusahaan (firma), tani → pertanian (rolnictwo), pustaka → perpustakaan (biblioteka).",
        "PE- -AN od czasowników me-: membangun → pembangunan (budowa, rozwój).",
      ],
      examples: [
        { id: "Kemerdekaan Indonesia tahun 1945.", pl: "Niepodległość Indonezji w 1945 r." },
        { id: "Saya bekerja di perusahaan besar.", pl: "Pracuję w dużej firmie." },
      ],
    },
    vocab: [
      { id: "kemerdekaan", pl: "niepodległość" },
      { id: "perusahaan", pl: "firma" },
      { id: "perpustakaan", pl: "biblioteka" },
      { id: "pembangunan", pl: "budowa, rozwój" },
    ],
    exercises: [
      {
        kind: "blocks",
        id: "b2-1-x1",
        prompt: "Zbuduj „firma” od rdzenia „usaha”",
        root: "usaha",
        affixes: ["per-...-an", "ke-...-an", "ber-", "di-"],
        answer: "per-...-an",
        pl: "perusahaan — firma",
      },
      {
        kind: "blocks",
        id: "b2-1-x2",
        prompt: "Zbuduj „niepodległość” od „merdeka”",
        root: "merdeka",
        affixes: ["ke-...-an", "per-...-an", "me-", "-lah"],
        answer: "ke-...-an",
        pl: "kemerdekaan — niepodległość",
      },
      {
        kind: "choice",
        id: "b2-1-c1",
        question: "„kehujanan” znaczy:",
        options: ["zostać złapanym przez deszcz", "deszczowy dzień", "padać mocno"],
        answer: "zostać złapanym przez deszcz",
        explain: "ke- -an często opisuje niechciane doświadczenie.",
      },
    ],
  },
  {
    id: "b2-2",
    level: "B2",
    title: "Reduplikacje zmieniające sens + Bahasa Gaul",
    subtitle: "mata → mata-mata, baku vs gaul",
    icon: "🕵️",
    checkpoint: true,
    grammar: {
      title: "Kiedy podwojenie NIE oznacza liczby mnogiej",
      body: [
        "mata (oko) → mata-mata (szpieg); langit (niebo) → langit-langit (sufit); kupu (—) → kupu-kupu (motyl); orang (człowiek) → orang-orangan (strach na wróble).",
        "Reduplikacja z ber- oznacza wzajemność: salam → bersalam-salaman (witać się nawzajem).",
        "BAHASA BAKU (formalny): saya, tidak, sangat, bagaimana. BAHASA GAUL (uliczny): gue/gua, nggak/gak, banget, gimana, kenapa → napa, teman → temen.",
        "W urzędzie i mediach używaj baku; z przyjaciółmi w Dżakarcie — gaul.",
      ],
      examples: [
        { id: "Dia ternyata mata-mata.", pl: "Okazało się, że on jest szpiegiem." },
        { id: "Gue nggak tahu, bro.", pl: "Nie wiem, ziomek. (potocznie)" },
      ],
    },
    vocab: [
      { id: "mata-mata", pl: "szpieg" },
      { id: "langit-langit", pl: "sufit" },
      { id: "banget", pl: "bardzo (gaul)" },
      { id: "gue", pl: "ja (gaul)" },
      { id: "nggak", pl: "nie (gaul)" },
    ],
    exercises: [
      {
        kind: "match",
        id: "b2-2-m1",
        pairs: [
          { id: "mata-mata", pl: "szpieg" },
          { id: "langit-langit", pl: "sufit" },
          { id: "kupu-kupu", pl: "motyl" },
          { id: "orang-orangan", pl: "strach na wróble" },
        ],
      },
      {
        kind: "choice",
        id: "b2-2-c1",
        question: "Formalny odpowiednik „gue nggak tahu” to:",
        options: ["saya tidak tahu", "aku gak tau", "gua kagak tau"],
        answer: "saya tidak tahu",
        explain: "Bahasa baku: saya + tidak.",
      },
      {
        kind: "blocks",
        id: "b2-2-x1",
        prompt: "Zbuduj rzeczownik „rolnictwo” od „tani”",
        root: "tani",
        affixes: ["per-...-an", "ke-...-an", "ter-", "-i"],
        answer: "per-...-an",
        pl: "pertanian — rolnictwo",
      },
    ],
  },
];

export const LEVEL_ORDER: Level[] = ["A1", "A2", "B1", "B2"];

// Zintegrowana ścieżka: gramatyka i słownictwo przeplatają się w obrębie poziomu.
const PATH_ORDER = [
  "a1-1", "a1-v1", "a1-2", "a1-v2", "a1-3", "a1-4",
  "a2-1", "a2-v1", "a2-2", "a2-v2", "a2-3",
  "b1-1", "b1-v1", "b1-2", "b1-v2", "b1-v3", "b1-3",
  "b2-1", "b2-v1", "b2-v2", "b2-2", "b2-v3",
];

const ALL_LESSONS: Lesson[] = [
  ...GRAMMAR_LESSONS.map((l) => ({ ...l, kind: l.kind ?? ("grammar" as const) })),
  ...VOCAB_LESSONS,
];

export const CURRICULUM: Lesson[] = PATH_ORDER.map(
  (id) => ALL_LESSONS.find((l) => l.id === id)!,
).filter(Boolean);

export function lessonById(id: string) {
  return CURRICULUM.find((l) => l.id === id);
}
