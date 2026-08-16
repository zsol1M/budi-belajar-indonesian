# Bahasa Buddy

Create a comprehensive, gamified mobile-responsive web application for learning Indonesian (Bahasa Indonesia) specifically designed for Polish speakers. The app must combine Duolingo-style gamification, advanced interactive AI features, and a flawless, step-by-step Indonesian grammar masterclass.

Core Interface & UI/UX:

- Bright, modern, clean, and colorful UI (Duolingo-inspired but more premium).

- Dashboard: Visual learning path map with nodes/levels to unlock progressively (from A1 to B2).

- Stats Display: XP points counter, daily streak tracker

- The language of instruction, explanations, and translations must be in POLISH.

1. PROGRESSIVE INDONESIAN GRAMMAR SYLLABUS:

Structure the learning path so grammar is introduced logically and step-by-step. Prevent users from advancing if they fail grammar checkpoints.

- Level A1: Basic SVO word order, no verb conjugations. Clear separation between "tidak" (for verbs/adjectives) and "bukan" (for nouns). Pluralization by word duplication (e.g., anak-anak). Introduction of "Kita" (inclusive we) vs "Kami" (exclusive we). Basic time markers (mau, bisa, sudah).

- Level A2: Introduction to key prefixes: "ber-" (state/possession) and "me-" (transitive verbs). Forming questions using the "-kah" particle and question words. Adjective comparisons (lebih, paling). Noun counters/classifiers (e.g., "ekor" for animals, "orang" for people, "buah" for objects).

- Level B1: Advanced affixes: passive prefix "di-", suffixes "-kan" and "-i". Random/accidental actions with prefix "ter-". Conjunctions and compound sentences. Word inversion/emphasis using the "-lah" particle.

- Level B2: Complex affixes and noun-building circumfixes like "per-an" and "ke-an". Advanced reduplications that change word meanings entirely (e.g., mata -> mata-mata). Formal Indonesian (Bahasa Baku) vs. Street/Colloquial slang (Bahasa Gaul).

2. CORE APPLICATION FEATURES (AI-POWERED):

- Voice Chat (Conversational AI): A dedicated chat screen styled like a phone call or WhatsApp with an AI tutor named "Budi". Integrate native-sounding Indonesian Text-to-Speech and accurate Speech-to-Text. Include a "Live Transcript" button, a "Tłumaczenie" (Translate to Polish) button, and 3 dynamic text suggestions for the user if they get stuck.

- Dynamic RPG Text Adventures: A story mode where AI generates text-based adventures (e.g., "Arriving at Jakarta Airport", "Ordering Nasi Goreng in Bali"). Every choice the user writes in Indonesian dynamically changes the plot and AI responses.

- Spaced Repetition System (SRS): An intelligent backend that tracks user response times. Words or grammar concepts where the user hesitates or fails are automatically scheduled for micro-quizzes in optimized intervals (e.g., in 10 minutes, next day).

- AI Meme & Story Generator: Upon successfully completing any sub-lesson, the AI automatically generates a humorous short story or a funny internet-style meme utilizing the exact words and grammar rules learned in that specific lesson to boost retention.

Gamified Quiz Types:

Include standard interactive minigimes: flashcards, word-matching grids, sentence builders (scrambled words), and interactive grammar block builders where users snap prefixes onto root words.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://budi-belajar-indonesian.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f2471838-199a-4961-b789-8bd4519751f3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
