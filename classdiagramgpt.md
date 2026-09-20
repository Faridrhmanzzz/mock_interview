# Audit Source Code untuk Penyusunan Class Diagram UML – PrepWise

---

## 1. Audit Struktur Project

### Teknologi Utama

| Aspek | Teknologi | Keterangan |
|---|---|---|
| Framework Frontend | **Next.js 16.2.4** (App Router + Turbopack) | Full-stack React framework |
| Framework Backend | **Next.js API Routes + Server Actions** | Tidak ada backend terpisah |
| Bahasa | **TypeScript** | Seluruh source code menggunakan TypeScript |
| Database | **Firebase Firestore** (NoSQL) | Melalui Firebase Admin SDK (server-side) |
| ORM/Query Builder | Tidak ada | Menggunakan Firestore SDK langsung |
| Authentication | **Firebase Auth** + **Session Cookie** | Client-side: Firebase Auth SDK; Server-side: Firebase Admin SDK + HTTP-only cookie |
| External API/Service | **VAPI** (Voice AI Platform) | Untuk simulasi wawancara berbasis suara real-time |
| AI Integration | **Groq API** (LLM: Llama 3.1, Llama 4 Scout) | Via OpenAI SDK & Vercel AI SDK |
| State Management | **React useState** (lokal) | Tidak menggunakan state management global |
| Styling | **Tailwind CSS v4** | Dengan ShadCN UI components |
| Validasi | **Zod** | Untuk validasi form (AuthForm) dan schema feedback AI |

### Struktur Folder Relevan

```
mock_interview/
├── app/
│   ├── (auth)/                         # Route group autentikasi
│   │   ├── layout.tsx                  # Layout guard: redirect jika sudah login
│   │   ├── sign-in/page.tsx            # Halaman Sign In
│   │   └── sign-up/page.tsx            # Halaman Sign Up
│   ├── (root)/                         # Route group utama (terproteksi)
│   │   ├── layout.tsx                  # Layout guard: redirect jika belum login + Navbar
│   │   ├── page.tsx                    # Halaman Dashboard
│   │   └── interview/
│   │       ├── page.tsx                # Halaman Generate Interview (via AI Voice)
│   │       └── [id]/
│   │           ├── page.tsx            # Halaman Pelaksanaan Interview
│   │           └── feedback/page.tsx   # Halaman Hasil Feedback
│   ├── api/
│   │   └── vapi/generate/route.ts      # API Route: Generate pertanyaan interview
│   └── layout.tsx                      # Root Layout (font, metadata, Toaster)
├── components/
│   ├── Agent.tsx                        # Komponen utama simulasi wawancara (VAPI)
│   ├── AuthForm.tsx                     # Komponen form Sign In / Sign Up
│   ├── FeedbackSlider.tsx               # Komponen tampilan hasil evaluasi + navigasi attempt
│   ├── InterviewCard.tsx                # Komponen kartu interview di Dashboard
│   ├── LogoutButton.tsx                 # Komponen tombol Logout
│   ├── DisplayTechIcons.tsx             # Komponen visual ikon teknologi
│   ├── FormField.tsx                    # Komponen reusable form field (tidak dipakai aktif)
│   └── ui/                             # ShadCN UI primitives (button, form, input, sonner)
├── constants/
│   └── index.ts                         # Konfigurasi interviewer VAPI, feedbackSchema, mappings
├── firebase/
│   ├── admin.ts                         # Inisialisasi Firebase Admin (server-side)
│   └── client.ts                        # Inisialisasi Firebase Client (client-side)
├── lib/
│   ├── actions/
│   │   ├── auth.action.ts               # Server Actions: signUp, signIn, signOut, getCurrentUser, isAuthenticated
│   │   └── general.action.ts            # Server Actions: CRUD interview & feedback, AI feedback generation
│   ├── utils.ts                         # Utility: cn(), getTechLogos(), getRandomInterviewCover()
│   └── vapi.sdk.ts                      # Inisialisasi VAPI Web SDK
└── types/
    ├── index.d.ts                       # Type definitions: User, Interview, Feedback, params, dll.
    └── vapi.d.ts                        # Type definitions untuk message VAPI
```

### Entry Point & Routing

| Route | File | Fungsi |
|---|---|---|
| `/sign-in` | `app/(auth)/sign-in/page.tsx` | Halaman login |
| `/sign-up` | `app/(auth)/sign-up/page.tsx` | Halaman registrasi |
| `/` | `app/(root)/page.tsx` | Dashboard utama |
| `/interview` | `app/(root)/interview/page.tsx` | Halaman generate template interview via AI voice |
| `/interview/[id]` | `app/(root)/interview/[id]/page.tsx` | Halaman pelaksanaan interview |
| `/interview/[id]/feedback` | `app/(root)/interview/[id]/feedback/page.tsx` | Halaman hasil evaluasi |
| `POST /api/vapi/generate` | `app/api/vapi/generate/route.ts` | API endpoint: generate pertanyaan + simpan interview |

---

## 2. Identifikasi Boundary

Berikut adalah kandidat `<<boundary>>` berdasarkan halaman/komponen yang berinteraksi langsung dengan pengguna dan memiliki tanggung jawab bisnis:

| Boundary | File/Source | Fungsi | Operasi yang ditemukan |
|---|---|---|---|
| **SignInView** | `app/(auth)/sign-in/page.tsx` → merender `AuthForm` (`type="sign-in"`) | Halaman login pengguna | `inputEmail()`, `inputPassword()`, `clickSubmit()`, `navigateToSignUp()` |
| **SignUpView** | `app/(auth)/sign-up/page.tsx` → merender `AuthForm` (`type="sign-up"`) | Halaman registrasi pengguna baru | `inputName()`, `inputEmail()`, `inputPassword()`, `clickSubmit()`, `navigateToSignIn()` |
| **DashboardView** | `app/(root)/page.tsx` | Halaman utama yang menampilkan daftar interview pengguna | `viewCompletedInterviews()`, `viewPendingInterviews()`, `clickStartInterview()`, `clickViewInterview()`, `clickCheckFeedback()` |
| **InterviewGenerateView** | `app/(root)/interview/page.tsx` → merender `Agent` (`type="generate"`) | Halaman untuk membuat template interview lewat percakapan AI voice | `clickStartCall()`, `clickEndCall()` |
| **InterviewSessionView** | `app/(root)/interview/[id]/page.tsx` → merender `Agent` (`type="interview"`) | Halaman pelaksanaan simulasi wawancara | `clickStartCall()`, `clickEndCall()`, `viewTranscript()` |
| **FeedbackView** | `app/(root)/interview/[id]/feedback/page.tsx` → merender `FeedbackSlider` | Halaman menampilkan hasil evaluasi wawancara | `viewOverallScore()`, `viewCategoryScores()`, `viewStrengths()`, `viewAreasForImprovement()`, `selectAttempt()`, `clickPrevAttempt()`, `clickNextAttempt()`, `clickRetakeInterview()`, `clickBackToDashboard()` |

### Komponen yang TIDAK dijadikan Boundary (beserta alasan)

| Komponen | File | Alasan Tidak Masuk |
|---|---|---|
| `DisplayTechIcons` | `components/DisplayTechIcons.tsx` | Komponen visual/presentational murni, tidak memiliki tanggung jawab bisnis |
| `InterviewCard` | `components/InterviewCard.tsx` | Komponen visual kartu di Dashboard, logikanya sudah diwakili oleh DashboardView |
| `LogoutButton` | `components/LogoutButton.tsx` | Operasi `logout()` sudah tercakup dalam navigasi/navbar DashboardView |
| `FormField` | `components/FormField.tsx` | Komponen reusable visual, tidak digunakan secara aktif dalam kode saat ini |
| `ui/*` (Button, Form, Input, Sonner) | `components/ui/` | Komponen UI primitif dari library ShadCN, bukan domain aplikasi |

---

## 3. Identifikasi Controller

Berikut adalah kandidat `<<controller>>` berdasarkan API handler, server actions, dan logika proses bisnis:

### A. AuthController

| Aspek | Detail |
|---|---|
| **File** | `lib/actions/auth.action.ts` |
| **Stereotype** | `<<controller>>` |

**Operations:**

| Method | Tujuan | Boundary yang memanggil | Entity/Service yang digunakan |
|---|---|---|---|
| `signUp(params: SignUpParams)` | Mendaftarkan user baru ke Firestore | SignUpView (via `AuthForm`) | User entity (Firestore `users` collection) |
| `signIn(params: SignInParams)` | Membuat session cookie setelah login | SignInView (via `AuthForm`) | User entity (Firebase Auth `getUserByEmail`) |
| `signOut()` | Menghapus session cookie | DashboardView (via `LogoutButton`) | - (menghapus cookie) |
| `getCurrentUser()` | Mengambil data user yang sedang login dari session | DashboardView, InterviewGenerateView, InterviewSessionView, FeedbackView | User entity (Firestore `users` collection) |
| `isAuthenticated()` | Mengecek apakah user sudah login | AuthLayout, RootLayout | - (memanggil `getCurrentUser()`) |
| `setSessionCookie(idToken: string)` | Membuat dan menyimpan session cookie | Dipanggil oleh `signIn()` | - (Firebase Admin Auth `createSessionCookie`) |

---

### B. InterviewController

| Aspek | Detail |
|---|---|
| **File** | `app/api/vapi/generate/route.ts` dan `lib/actions/general.action.ts` |
| **Stereotype** | `<<controller>>` |

**Operations:**

| Method | File | Tujuan | Boundary yang memanggil | Entity/Service yang digunakan |
|---|---|---|---|---|
| `POST(request: Request)` | `app/api/vapi/generate/route.ts` | Menerima request dari VAPI, meng-generate pertanyaan via AI, menyimpan interview ke Firestore | InterviewGenerateView (melalui VAPI tool call) | Interview entity, AI Service (Groq/Llama) |
| `getInterviewsByUserId(userId)` | `lib/actions/general.action.ts` | Mengambil semua interview milik user | DashboardView | Interview entity |
| `getLatestInterviews(params)` | `lib/actions/general.action.ts` | Mengambil interview terbaru user | DashboardView | Interview entity |
| `getInterviewsById(id)` | `lib/actions/general.action.ts` | Mengambil detail satu interview berdasarkan ID | InterviewSessionView, FeedbackView | Interview entity |

---

### C. FeedbackController

| Aspek | Detail |
|---|---|
| **File** | `lib/actions/general.action.ts` |
| **Stereotype** | `<<controller>>` |

**Operations:**

| Method | Tujuan | Boundary yang memanggil | Entity/Service yang digunakan |
|---|---|---|---|
| `createFeedback(params: CreateFeedbackParams)` | Menghasilkan evaluasi AI dari transcript wawancara dan menyimpannya ke Firestore | InterviewSessionView (via `Agent.handleGenerateFeedback()`) | Feedback entity, AI Service (Groq/Llama 4 Scout) |
| `getFeedbackByInterviewId(params)` | Mengambil satu feedback terbaru untuk interview tertentu | DashboardView (via `InterviewCard`) | Feedback entity |
| `getAllFeedbackByInterviewId(params)` | Mengambil semua feedback (riwayat attempt) untuk interview tertentu | FeedbackView | Feedback entity |

---

### D. VapiController (Client-side Interview Orchestration)

| Aspek | Detail |
|---|---|
| **File** | `components/Agent.tsx` |
| **Stereotype** | `<<controller>>` |

> **Catatan:** Komponen `Agent.tsx` berfungsi ganda sebagai Boundary (UI) dan Controller (orkestrasi panggilan VAPI). Untuk kepentingan class diagram, logika kontrolnya diekstrak sebagai controller terpisah.

**Operations:**

| Method | Tujuan | Boundary yang memanggil | Entity/Service yang digunakan |
|---|---|---|---|
| `handleCall()` | Memulai sesi wawancara suara via VAPI (`vapi.start()`) | InterviewGenerateView, InterviewSessionView | VAPI SDK (external service) |
| `handleDisconnect()` | Menghentikan sesi wawancara suara via VAPI (`vapi.stop()`) | InterviewGenerateView, InterviewSessionView | VAPI SDK (external service) |
| `handleGenerateFeedback(messages)` | Memanggil `createFeedback()` setelah interview selesai | InterviewSessionView | FeedbackController (`createFeedback`) |
| `onCallStart()` | Event handler saat panggilan dimulai | Internal (VAPI event) | - |
| `onCallEnd()` | Event handler saat panggilan berakhir | Internal (VAPI event) | - |
| `onMessage(message)` | Event handler menerima transcript wawancara | Internal (VAPI event) | - |
| `onSpeechStart()` | Event handler saat AI mulai berbicara | Internal (VAPI event) | - |
| `onSpeechEnd()` | Event handler saat AI selesai berbicara | Internal (VAPI event) | - |

---

## 4. Identifikasi Entity

Berdasarkan interface TypeScript di `types/index.d.ts` dan data yang disimpan di Firestore:

### A. User Entity

| Atribut | Tipe Data | Primary Key | Foreign Key | Keterangan |
|---|---|---|---|---|
| `userId` | string | ✅ (Document ID = Firebase Auth UID) | - | ID unik dari Firebase Auth |
| `name` | string | - | - | Nama pengguna |
| `email` | string | - | - | Email pengguna |

**Source:** `types/index.d.ts` (interface `User`), `lib/actions/auth.action.ts` (L21-23)

---

### B. Interview Entity

| Atribut | Tipe Data | Primary Key | Foreign Key | Keterangan |
|---|---|---|---|---|
| `interviewId` | string | ✅ (Auto-generated Firestore ID) | - | ID interview |
| `interviewUserId` | string | - | ✅ → `User.userId` | ID pembuat interview |
| `role` | string | - | - | Posisi/peran pekerjaan (misal: "Frontend Developer") |
| `type` | string | - | - | Tipe interview (misal: "Technical", "Mixed") |
| `level` | string | - | - | Tingkat keahlian (misal: "Junior", "Senior") |
| `techstack` | string[] | - | - | Daftar teknologi terkait |
| `questions` | string[] | - | - | Daftar pertanyaan interview (hasil generate AI) |
| `finalized` | boolean | - | - | Status finalisasi interview |
| `coverImage` | string | - | - | Path gambar cover [NEEDS CONFIRMATION: tidak ada di interface TypeScript, tapi ditulis ke Firestore] |
| `createdAt` | string | - | - | Waktu pembuatan (ISO 8601) |

**Source:** `types/index.d.ts` (interface `Interview`), `app/api/vapi/generate/route.ts` (L99-111)

---

### C. Feedback Entity

| Atribut | Tipe Data | Primary Key | Foreign Key | Keterangan |
|---|---|---|---|---|
| `feedbackId` | string | ✅ (Auto-generated Firestore ID) | - | ID feedback |
| `feedbackInterviewId` | string | - | ✅ → `Interview.interviewId` | ID interview terkait |
| `feedbackUserId` | string | - | ✅ → `User.userId` | ID user pemilik feedback [NEEDS CONFIRMATION: tidak ada di interface TypeScript, tapi ditulis ke Firestore] |
| `totalScore` | number | - | - | Skor keseluruhan (0-100) |
| `categoryScores` | Array<{name: string, score: number, comment: string}> | - | - | Skor per kategori penilaian |
| `strengths` | string[] | - | - | Daftar kekuatan kandidat |
| `areasForImprovement` | string[] | - | - | Daftar area yang perlu ditingkatkan |
| `finalAssessment` | string | - | - | Rangkuman penilaian akhir |
| `createdAt` | string | - | - | Waktu pembuatan (ISO 8601) |
| `attemptNumber` | number (optional) | - | - | Nomor percobaan (dihitung saat runtime, TIDAK disimpan di Firestore) |

**Source:** `types/index.d.ts` (interface `Feedback`), `lib/actions/general.action.ts` (L92-101)

---

## 5. Identifikasi Operasi Entity

Berikut adalah operasi yang ditemukan untuk setiap entity berdasarkan source code. Operasi-operasi ini merupakan operasi **repository/database** yang dipanggil melalui controller.

### User

| Operasi | Tipe | File | Keterangan |
|---|---|---|---|
| `create(uid, name, email)` | Repository/DB | `auth.action.ts:L21-23` | `db.collection('users').doc(uid).set({name, email})` |
| `findById(uid)` | Repository/DB | `auth.action.ts:L12`, `auth.action.ts:L103-106` | `db.collection('users').doc(uid).get()` |
| `findByEmail(email)` | Repository/DB | `auth.action.ts:L50` | `auth.getUserByEmail(email)` — via Firebase Admin Auth |

### Interview

| Operasi | Tipe | File | Keterangan |
|---|---|---|---|
| `create(interviewData)` | Repository/DB | `route.ts:L113` | `db.collection('interviews').add(interviewData)` |
| `findByUserId(userId)` | Repository/DB | `general.action.ts:L8-12` | `db.collection('interviews').where('userId','==', userId).orderBy('createdAt','desc').get()` |
| `findById(id)` | Repository/DB | `general.action.ts:L38-41` | `db.collection('interviews').doc(id).get()` |
| `findLatestByUserId(userId, limit)` | Repository/DB | `general.action.ts:L23-29` | `db.collection('interviews').orderBy(...).where(...).limit(limit).get()` |

### Feedback

| Operasi | Tipe | File | Keterangan |
|---|---|---|---|
| `create(feedbackData)` | Repository/DB | `general.action.ts:L92-101` | `db.collection('feedback').add({...})` |
| `findByInterviewIdAndUserId(interviewId, userId)` | Repository/DB | `general.action.ts:L121-126` | `db.collection('feedback').where(...).limit(1).get()` |
| `findAllByInterviewIdAndUserId(interviewId, userId)` | Repository/DB | `general.action.ts:L141-147` | `db.collection('feedback').where(...).orderBy('createdAt','asc').limitToLast(5).get()` |

---

## 6. Audit Authentication

### Alur Lengkap Authentication

```
[SignUpView] → inputName(), inputEmail(), inputPassword(), clickSubmit()
    ↓
[Firebase Client Auth] → createUserWithEmailAndPassword(auth, email, password)
    ↓ (berhasil → mendapat uid)
[AuthController.signUp(uid, name, email)] → cek apakah user sudah ada → simpan ke Firestore `users`
    ↓
Redirect ke /sign-in

[SignInView] → inputEmail(), inputPassword(), clickSubmit()
    ↓
[Firebase Client Auth] → signInWithEmailAndPassword(auth, email, password)
    ↓ (berhasil → mendapat idToken)
[AuthController.signIn(email, idToken)]
    ↓
[AuthController.setSessionCookie(idToken)] → auth.createSessionCookie() → simpan ke HTTP-only cookie
    ↓
Redirect ke /

[DashboardView] → klik tombol Logout
    ↓
[LogoutButton.handleLogout()]
    ↓
[AuthController.signOut()] → hapus session cookie dari server
    ↓
[Firebase Client Auth] → firebaseSignOut(auth) → hapus state auth di client
    ↓
Redirect ke /sign-in
```

### Middleware / Guard Authentication

| File | Fungsi | Mekanisme |
|---|---|---|
| `app/(auth)/layout.tsx` | Redirect ke `/` jika sudah login | Memanggil `isAuthenticated()` |
| `app/(root)/layout.tsx` | Redirect ke `/sign-in` jika belum login | Memanggil `isAuthenticated()` |

### Class yang terlibat dalam Authentication

| Class | Stereotype | Peran |
|---|---|---|
| `SignInView` | `<<boundary>>` | Interface login |
| `SignUpView` | `<<boundary>>` | Interface registrasi |
| `AuthController` | `<<controller>>` | Logika autentikasi (signUp, signIn, signOut, getCurrentUser, isAuthenticated, setSessionCookie) |
| `User` | `<<entity>>` | Data pengguna |

---

## 7. Audit Pembuatan Template Simulasi Wawancara

### Alur Lengkap

```
[DashboardView] → klik "Start an Interview"
    ↓
Redirect ke /interview

[InterviewGenerateView] → klik "Start Interview"
    ↓
[VapiController.handleCall()] → vapi.start(assistantId, {variableValues: {username, userid, role, type, level, techstack, amount}})
    ↓
[VAPI Cloud] → AI berbicara dengan user untuk mengumpulkan preferensi
    ↓
[VAPI Tool Call] → HTTP POST ke /api/vapi/generate
    ↓
[InterviewController.POST(request)]
    ↓
  1. Parse tool call arguments (role, type, level, techstack, amount)
  2. Ambil userid dari variableValues
    ↓
[AI Service: Groq/Llama 3.1] → Generate pertanyaan interview
    ↓
  3. Simpan ke Firestore collection `interviews`
    ↓
Return {success: true, id: docRef.id}

[VapiController] → call berakhir → redirect ke /
```

### Fitur yang ditemukan di source code vs yang diminta di source.md

| Fitur | Ditemukan? | Keterangan |
|---|---|---|
| Job role | ✅ | `role` dalam `route.ts:L55` |
| Interview type | ✅ | `type` dalam `route.ts:L55` |
| Level/Difficulty | ✅ | `level` dalam `route.ts:L55` |
| Techstack | ✅ | `techstack` dalam `route.ts:L55` |
| Amount (jumlah pertanyaan) | ✅ | `amount` dalam `route.ts:L55` |
| Template save | ✅ | `db.collection('interviews').add()` dalam `route.ts:L113` |
| Template retrieval | ✅ | `getInterviewsByUserId()`, `getInterviewsById()` di `general.action.ts` |
| Job description | ❌ | Tidak ditemukan |
| Duration | ❌ | Tidak ditemukan |
| Language | ❌ | Tidak ditemukan (hardcoded bahasa Inggris) |
| Tone | ❌ | Tidak ditemukan |
| Communication mode | ❌ | Tidak ditemukan (selalu voice) |
| Follow-up depth | ❌ | Tidak ditemukan |
| Template update | ❌ | Tidak ditemukan |
| Template deletion | ❌ | Tidak ditemukan |

### Class yang terlibat

| Class | Stereotype | Peran |
|---|---|---|
| `DashboardView` | `<<boundary>>` | Tombol "Start an Interview" |
| `InterviewGenerateView` | `<<boundary>>` | Interface percakapan AI untuk generate |
| `VapiController` | `<<controller>>` | Orkestrasi panggilan VAPI |
| `InterviewController` | `<<controller>>` | Menerima request, generate pertanyaan, simpan ke DB |
| `Interview` | `<<entity>>` | Data interview yang tersimpan |

---

## 8. Audit Pelaksanaan Simulasi Wawancara

### Alur Lengkap

```
[DashboardView] → klik "View Interview" pada interview card
    ↓
Redirect ke /interview/[id]

[InterviewSessionView] → menampilkan detail interview (role, techstack, type)
    ↓
User klik "Start Interview"
    ↓
[VapiController.handleCall()] → vapi.start(interviewerConfig, {variableValues: {questions}})
    ↓
[VAPI Cloud + Groq Llama 3.1] → AI Interviewer bertanya sesuai daftar pertanyaan
    ↓
[VapiController.onMessage()] → menerima transcript secara real-time → simpan ke state `messages`
    ↓
[InterviewSessionView] → menampilkan transcript terbaru di UI
    ↓
User klik "End Call" atau AI selesai
    ↓
[VapiController.handleDisconnect()] atau [VapiController.onCallEnd()]
    ↓
callStatus → FINISHED
    ↓
[VapiController.handleGenerateFeedback(messages)]
    ↓
[FeedbackController.createFeedback(interviewId, userId, transcript)]
    ↓
  1. Format transcript menjadi string
  2. AI (Groq/Llama 4 Scout) menganalisis dan men-generate evaluasi
  3. Simpan feedback ke Firestore collection `feedback`
    ↓
Redirect ke /interview/[id]/feedback
```

### Fitur yang ditemukan

| Fitur | Ditemukan? | Keterangan |
|---|---|---|
| Start interview | ✅ | `handleCall()` di `Agent.tsx:L137` |
| Display/generate question | ✅ | Pertanyaan disuntikkan ke AI interviewer via `variableValues.questions` |
| Voice answer | ✅ | VAPI real-time voice conversation |
| Transcript recording | ✅ | `onMessage()` di `Agent.tsx:L65-76` |
| End interview | ✅ | `handleDisconnect()` di `Agent.tsx:L183` |
| Save answer (transcript) | ✅ | Transcript dikirim ke `createFeedback()` |
| Text answer | ❌ | Tidak ditemukan (hanya voice) |
| Video answer | ❌ | Tidak ditemukan |
| Timer | ❌ | Tidak ditemukan |
| Next question (manual) | ❌ | Tidak ditemukan (otomatis oleh AI interviewer) |

### Class yang terlibat

| Class | Stereotype | Peran |
|---|---|---|
| `InterviewSessionView` | `<<boundary>>` | Interface pelaksanaan wawancara |
| `VapiController` | `<<controller>>` | Orkestrasi panggilan VAPI, handling event, manajemen state |
| `FeedbackController` | `<<controller>>` | Generate evaluasi AI dari transcript |
| `Interview` | `<<entity>>` | Data interview (pertanyaan yang diambil) |
| `Feedback` | `<<entity>>` | Data hasil evaluasi yang disimpan |

---

## 9. Audit AI/Groq

### Integrasi AI yang ditemukan

| Fitur AI | Lokasi | Model | Provider | Tujuan |
|---|---|---|---|---|
| **Question Generation** | `app/api/vapi/generate/route.ts:L73-86` | `llama-3.1-8b-instant` | Groq (via OpenAI SDK) | Men-generate daftar pertanyaan wawancara berdasarkan role, techstack, level, type |
| **Interview Conversation** | `constants/index.ts:L118-119` (konfigurasi) | `llama-3.1-8b-instant` | Groq (via VAPI) | Model AI interviewer yang berbicara dengan kandidat |
| **Speech Transcription** | `constants/index.ts:L104-108` (konfigurasi) | `nova-2` | Deepgram (via VAPI) | Transkripsi suara ke teks secara real-time |
| **Speech Synthesis** | `constants/index.ts:L109-117` (konfigurasi) | Voice ID: `Elliot` | VAPI | Text-to-Speech untuk suara AI interviewer |
| **Feedback/Evaluation Generation** | `lib/actions/general.action.ts:L66-85` | `meta-llama/llama-4-scout-17b-16e-instruct` | Groq (via Vercel AI SDK `generateObject`) | Menganalisis transcript dan menghasilkan evaluasi terstruktur (skor, kekuatan, kelemahan, assessment) |

### Klasifikasi dalam Class Diagram

Fungsi AI dalam aplikasi ini **bukan merupakan class domain tersendiri**, melainkan merupakan **bagian dari operasi controller**:

- **Question generation** → bagian dari `InterviewController.generateInterview()`.
- **Feedback generation** → bagian dari `FeedbackController.createFeedback()`.
- **Interview conversation** → dikonfigurasi sebagai konstanta (`interviewer`) dan dijalankan oleh VAPI cloud service.

> AI service (Groq API) berperan sebagai **external service/dependency** yang dipanggil oleh controller. Untuk class diagram skripsi, cukup direpresentasikan sebagai operasi di dalam controller, **bukan** sebagai class terpisah. VAPI juga merupakan external service yang diintegrasikan melalui SDK.

---

## 10. Audit Database dan Relasi

### Relasi Antar Entity (berdasarkan source code)

| Source | Relationship | Target | Multiplicity | Evidence |
|---|---|---|---|---|
| `User` | Association | `Interview` | `1` — `0..*` | `Interview.interviewUserId` merujuk ke `User.userId` (`route.ts:L107`, `general.action.ts:L10`) |
| `User` | Association | `Feedback` | `1` — `0..*` | `Feedback.feedbackUserId` merujuk ke `User.userId` (`general.action.ts:L94`, `general.action.ts:L124`) |
| `Interview` | Association | `Feedback` | `1` — `0..*` | `Feedback.feedbackInterviewId` merujuk ke `Interview.interviewId` (`general.action.ts:L93`, `general.action.ts:L123`) |

### Justifikasi Tipe Relasi

- **Association (bukan Composition/Aggregation)** digunakan karena:
  - Firestore adalah NoSQL; tidak ada foreign key constraint yang ketat.
  - Tidak ada bukti di source code bahwa penghapusan User otomatis menghapus Interview atau Feedback (cascade delete).
  - Setiap entity memiliki lifecycle independen di Firestore.

---

## 11. Mapping Boundary–Control–Entity

| Use Case | Boundary | Controller | Entity |
|---|---|---|---|
| **Autentikasi - Sign Up** | SignUpView | AuthController | User |
| **Autentikasi - Sign In** | SignInView | AuthController | User |
| **Autentikasi - Sign Out** | DashboardView | AuthController | - |
| **Membuat Template Simulasi Wawancara** | DashboardView, InterviewGenerateView | VapiController, InterviewController | Interview |
| **Melakukan Simulasi Wawancara** | InterviewSessionView | VapiController, FeedbackController | Interview, Feedback |
| **Memberikan Hasil dan Evaluasi** | FeedbackView | FeedbackController, InterviewController | Feedback, Interview |
| **Melakukan Pengulangan Wawancara** | FeedbackView, InterviewSessionView | VapiController, FeedbackController | Interview, Feedback |

---

## 12. Seleksi Class untuk Class Diagram Skripsi

### A. Class yang WAJIB masuk

| Class | Stereotype | Alasan |
|---|---|---|
| `SignInView` | `<<boundary>>` | Representasi langsung use case autentikasi (sign in) |
| `SignUpView` | `<<boundary>>` | Representasi langsung use case autentikasi (sign up) |
| `DashboardView` | `<<boundary>>` | Halaman utama tempat user melihat dan memilih interview |
| `InterviewGenerateView` | `<<boundary>>` | Representasi langsung use case membuat template via AI |
| `InterviewSessionView` | `<<boundary>>` | Representasi langsung use case pelaksanaan wawancara |
| `FeedbackView` | `<<boundary>>` | Representasi langsung use case melihat hasil evaluasi dan retake |
| `AuthController` | `<<controller>>` | Menangani seluruh logika autentikasi |
| `InterviewController` | `<<controller>>` | Menangani generate pertanyaan dan manajemen data interview |
| `VapiController` | `<<controller>>` | Menangani orkestrasi simulasi wawancara suara |
| `FeedbackController` | `<<controller>>` | Menangani generate dan pengambilan evaluasi |
| `User` | `<<entity>>` | Domain object utama: pengguna |
| `Interview` | `<<entity>>` | Domain object utama: sesi wawancara |
| `Feedback` | `<<entity>>` | Domain object utama: hasil evaluasi |

### B. Class yang MUNGKIN masuk

| Class | Stereotype | Alasan |
|---|---|---|
| `CategoryScore` | `<<entity>>` (sub-entity) | Jika ingin mendetailkan struktur `categoryScores` di dalam `Feedback` sebagai class terpisah. Saat ini berupa atribut array of objects di entity Feedback. |

### C. Class yang TIDAK perlu masuk

| Class/Komponen | Alasan Tidak Masuk |
|---|---|
| `DisplayTechIcons` | Komponen visual presentational murni; tidak ada logika bisnis |
| `InterviewCard` | Komponen UI untuk kartu; logikanya sudah tercakup dalam DashboardView |
| `LogoutButton` | Komponen UI sederhana; aksi logout sudah masuk dalam DashboardView + AuthController |
| `FormField` | Komponen form reusable generik; tidak ada logika bisnis |
| `AuthForm` | Komponen UI form; logikanya sudah diwakili SignInView/SignUpView + AuthController |
| `ui/*` (Button, Form, Input, Sonner) | Library UI primitif dari ShadCN; bukan domain aplikasi |
| `utils.ts` (cn, getTechLogos, getRandomInterviewCover) | Utility/helper generik; tidak relevan dengan domain |
| `vapi.sdk.ts` | Inisialisasi SDK, bukan class domain |
| `firebase/admin.ts`, `firebase/client.ts` | Konfigurasi/inisialisasi infrastruktur; bukan domain |
| `constants/index.ts` (mappings, interviewCovers, dummyInterviews) | Data konfigurasi statis; bukan class domain |

---

## 13. Format Output Audit

### A. Candidate Boundary

| Class | File | Stereotype | Operations | Keterangan |
|---|---|---|---|---|
| SignInView | `app/(auth)/sign-in/page.tsx`, `components/AuthForm.tsx` | `<<boundary>>` | `inputEmail()`, `inputPassword()`, `clickSubmit()`, `navigateToSignUp()` | Halaman login |
| SignUpView | `app/(auth)/sign-up/page.tsx`, `components/AuthForm.tsx` | `<<boundary>>` | `inputName()`, `inputEmail()`, `inputPassword()`, `clickSubmit()`, `navigateToSignIn()` | Halaman registrasi |
| DashboardView | `app/(root)/page.tsx` | `<<boundary>>` | `viewCompletedInterviews()`, `viewPendingInterviews()`, `clickStartInterview()`, `clickViewInterview()`, `clickCheckFeedback()` | Halaman utama |
| InterviewGenerateView | `app/(root)/interview/page.tsx`, `components/Agent.tsx` | `<<boundary>>` | `clickStartCall()`, `clickEndCall()` | Halaman generate template via AI voice |
| InterviewSessionView | `app/(root)/interview/[id]/page.tsx`, `components/Agent.tsx` | `<<boundary>>` | `clickStartCall()`, `clickEndCall()`, `viewTranscript()` | Halaman pelaksanaan wawancara |
| FeedbackView | `app/(root)/interview/[id]/feedback/page.tsx`, `components/FeedbackSlider.tsx` | `<<boundary>>` | `viewOverallScore()`, `viewCategoryScores()`, `viewStrengths()`, `viewAreasForImprovement()`, `selectAttempt()`, `clickPrevAttempt()`, `clickNextAttempt()`, `clickRetakeInterview()`, `clickBackToDashboard()` | Halaman hasil evaluasi |

### B. Candidate Controller

| Class | File | Stereotype | Operations | Keterangan |
|---|---|---|---|---|
| AuthController | `lib/actions/auth.action.ts` | `<<controller>>` | `signUp()`, `signIn()`, `signOut()`, `getCurrentUser()`, `isAuthenticated()`, `setSessionCookie()` | Menangani autentikasi & sesi |
| InterviewController | `app/api/vapi/generate/route.ts`, `lib/actions/general.action.ts` | `<<controller>>` | `generateInterview()`, `getInterviewsByUserId()`, `getInterviewsById()`, `getLatestInterviews()` | Manajemen data interview & generate pertanyaan AI |
| VapiController | `components/Agent.tsx` | `<<controller>>` | `handleCall()`, `handleDisconnect()`, `handleGenerateFeedback()`, `onCallStart()`, `onCallEnd()`, `onMessage()`, `onSpeechStart()`, `onSpeechEnd()` | Orkestrasi simulasi wawancara suara |
| FeedbackController | `lib/actions/general.action.ts` | `<<controller>>` | `createFeedback()`, `getFeedbackByInterviewId()`, `getAllFeedbackByInterviewId()` | Generate evaluasi AI & manajemen data feedback |

### C. Candidate Entity

| Class | File | Attributes | Operations | Keterangan |
|---|---|---|---|---|
| User | `types/index.d.ts`, Firestore `users` | `userId: string`, `name: string`, `email: string` | `create()`, `findById()`, `findByEmail()` | Pengguna aplikasi |
| Interview | `types/index.d.ts`, Firestore `interviews` | `interviewId: string`, `interviewUserId: string`, `role: string`, `type: string`, `level: string`, `techstack: string[]`, `questions: string[]`, `finalized: boolean`, `coverImage: string`, `createdAt: string` | `create()`, `findByUserId()`, `findById()`, `findLatestByUserId()` | Sesi simulasi wawancara |
| Feedback | `types/index.d.ts`, Firestore `feedback` | `feedbackId: string`, `feedbackInterviewId: string`, `feedbackUserId: string`, `totalScore: number`, `categoryScores: CategoryScore[]`, `strengths: string[]`, `areasForImprovement: string[]`, `finalAssessment: string`, `createdAt: string`, `attemptNumber: number` | `create()`, `findByInterviewIdAndUserId()`, `findAllByInterviewIdAndUserId()` | Hasil evaluasi AI |

### D. Relationships

| Source | Relationship | Target | Multiplicity | Evidence |
|---|---|---|---|---|
| User | Association | Interview | 1 — 0..* | `Interview.interviewUserId` merujuk ke `User.userId` (`route.ts:L107`) |
| User | Association | Feedback | 1 — 0..* | `Feedback.feedbackUserId` merujuk ke `User.userId` (`general.action.ts:L94`) |
| Interview | Association | Feedback | 1 — 0..* | `Feedback.feedbackInterviewId` merujuk ke `Interview.interviewId` (`general.action.ts:L93`) |
| SignInView | Dependency | AuthController | — | SignInView memanggil `AuthController.signIn()` |
| SignUpView | Dependency | AuthController | — | SignUpView memanggil `AuthController.signUp()` |
| DashboardView | Dependency | AuthController | — | DashboardView memanggil `AuthController.getCurrentUser()` |
| DashboardView | Dependency | InterviewController | — | DashboardView memanggil `InterviewController.getInterviewsByUserId()` |
| DashboardView | Dependency | FeedbackController | — | DashboardView memanggil `FeedbackController.getFeedbackByInterviewId()` |
| InterviewGenerateView | Dependency | VapiController | — | Merender Agent dengan type="generate" |
| InterviewSessionView | Dependency | VapiController | — | Merender Agent dengan type="interview" |
| VapiController | Dependency | InterviewController | — | VAPI tool call memicu `InterviewController.generateInterview()` |
| VapiController | Dependency | FeedbackController | — | `handleGenerateFeedback()` memanggil `FeedbackController.createFeedback()` |
| FeedbackView | Dependency | FeedbackController | — | Memanggil `getAllFeedbackByInterviewId()` |
| FeedbackView | Dependency | InterviewController | — | Memanggil `getInterviewsById()` |
| AuthController | Dependency | User | — | CRUD operasi pada entity User |
| InterviewController | Dependency | Interview | — | CRUD operasi pada entity Interview |
| FeedbackController | Dependency | Feedback | — | CRUD operasi pada entity Feedback |

### E. Use Case Mapping

| Use Case | Boundary | Controller | Entity |
|---|---|---|---|
| Autentikasi Pengguna (Sign Up) | SignUpView | AuthController | User |
| Autentikasi Pengguna (Sign In) | SignInView | AuthController | User |
| Autentikasi Pengguna (Sign Out) | DashboardView | AuthController | — |
| Membuat Template Simulasi Wawancara | DashboardView, InterviewGenerateView | VapiController, InterviewController | Interview |
| Melakukan Simulasi Wawancara | InterviewSessionView | VapiController, FeedbackController | Interview, Feedback |
| Memberikan Hasil dan Evaluasi | FeedbackView | FeedbackController, InterviewController | Feedback, Interview |
| Melakukan Pengulangan Wawancara | FeedbackView, InterviewSessionView | VapiController, FeedbackController | Interview, Feedback |

### F. Recommended Class Diagram

Berikut adalah daftar final class yang direkomendasikan untuk class diagram skripsi:

---

#### Boundary Classes

```
<<boundary>>
SignInView
─────────────────────
─────────────────────
+ inputEmail()
+ inputPassword()
+ clickSubmit()
+ navigateToSignUp()
```

```
<<boundary>>
SignUpView
─────────────────────
─────────────────────
+ inputName()
+ inputEmail()
+ inputPassword()
+ clickSubmit()
+ navigateToSignIn()
```

```
<<boundary>>
DashboardView
─────────────────────
─────────────────────
+ viewCompletedInterviews()
+ viewPendingInterviews()
+ clickStartInterview()
+ clickViewInterview()
+ clickCheckFeedback()
```

```
<<boundary>>
InterviewGenerateView
─────────────────────
─────────────────────
+ clickStartCall()
+ clickEndCall()
```

```
<<boundary>>
InterviewSessionView
─────────────────────
─────────────────────
+ clickStartCall()
+ clickEndCall()
+ viewTranscript()
```

```
<<boundary>>
FeedbackView
─────────────────────
─────────────────────
+ viewOverallScore()
+ viewCategoryScores()
+ viewStrengths()
+ viewAreasForImprovement()
+ selectAttempt()
+ clickPrevAttempt()
+ clickNextAttempt()
+ clickRetakeInterview()
+ clickBackToDashboard()
```

---

#### Controller Classes

```
<<controller>>
AuthController
─────────────────────
─────────────────────
+ signUp(uid: string, name: string, email: string, password: string): {success, message}
+ signIn(email: string, idToken: string): {success, message}
+ signOut(): void
+ getCurrentUser(): User | null
+ isAuthenticated(): boolean
+ setSessionCookie(idToken: string): void
```

```
<<controller>>
InterviewController
─────────────────────
─────────────────────
+ generateInterview(role: string, type: string, level: string, techstack: string, amount: number, userId: string): {success, id}
+ getInterviewsByUserId(userId: string): Interview[]
+ getInterviewsById(id: string): Interview | null
+ getLatestInterviews(userId: string, limit: number): Interview[]
```

```
<<controller>>
VapiController
─────────────────────
- callStatus: CallStatus
- messages: SavedMessage[]
- isSpeaking: boolean
- error: string | null
─────────────────────
+ handleCall(): void
+ handleDisconnect(): void
+ handleGenerateFeedback(messages: SavedMessage[]): void
+ onCallStart(): void
+ onCallEnd(): void
+ onMessage(message: Message): void
+ onSpeechStart(): void
+ onSpeechEnd(): void
```

```
<<controller>>
FeedbackController
─────────────────────
─────────────────────
+ createFeedback(interviewId: string, userId: string, transcript: Transcript[]): {success, feedbackId}
+ getFeedbackByInterviewId(interviewId: string, userId: string): Feedback | null
+ getAllFeedbackByInterviewId(interviewId: string, userId: string): Feedback[]
```

---

#### Entity Classes

```
<<entity>>
User
─────────────────────
- userId: string
- name: string
- email: string
─────────────────────
+ create()
+ findById()
+ findByEmail()
```

```
<<entity>>
Interview
─────────────────────
- interviewId: string
- interviewUserId: string
- role: string
- type: string
- level: string
- techstack: string[]
- questions: string[]
- finalized: boolean
- coverImage: string
- createdAt: string
─────────────────────
+ create()
+ findByUserId()
+ findById()
+ findLatestByUserId()
```

```
<<entity>>
Feedback
─────────────────────
- feedbackId: string
- feedbackInterviewId: string
- feedbackUserId: string
- totalScore: number
- categoryScores: CategoryScore[]
- strengths: string[]
- areasForImprovement: string[]
- finalAssessment: string
- createdAt: string
- attemptNumber: number
─────────────────────
+ create()
+ findByInterviewIdAndUserId()
+ findAllByInterviewIdAndUserId()
```

---

### G. Ambiguities

| Item | Keterangan |
|---|---|
| [NEEDS CONFIRMATION] `Interview.coverImage` | Atribut `coverImage` **ditulis ke Firestore** (`route.ts:L109`), tetapi **tidak didefinisikan** dalam interface `Interview` di `types/index.d.ts`. Perlu dikonfirmasi apakah atribut ini sebaiknya ditambahkan ke interface atau dihilangkan dari class diagram. |
| [NEEDS CONFIRMATION] `Feedback.userId` | Atribut `userId` **ditulis ke Firestore** (`general.action.ts:L94`), tetapi **tidak didefinisikan** dalam interface `Feedback` di `types/index.d.ts`. Namun, atribut ini digunakan dalam query, sehingga kemungkinan besar memang seharusnya ada. |
| [NEEDS CONFIRMATION] `Feedback.attemptNumber` | Atribut ini **tidak disimpan ke Firestore** tetapi **dihitung saat runtime** berdasarkan urutan index (`general.action.ts:L154`). Didefinisikan sebagai optional di interface. Perlu dikonfirmasi apakah ini ditampilkan sebagai atribut entity atau tidak. |
| [NEEDS CONFIRMATION] `VapiController` sebagai class terpisah | Dalam source code, `VapiController` dan `InterviewSessionView` / `InterviewGenerateView` terdapat dalam satu file (`Agent.tsx`). Pemisahan menjadi boundary dan controller terpisah adalah keputusan desain untuk class diagram. Perlu konfirmasi apakah pendekatan ini sesuai. |
| [NEEDS CONFIRMATION] `User.password` | Pada fungsi `signUp()`, parameter `password` dikirimkan (`auth.action.ts:L66`) tetapi **tidak disimpan ke Firestore** (yang disimpan hanya `name` dan `email`). Password dikelola sepenuhnya oleh Firebase Auth. Di class diagram, `password` **tidak dimasukkan** sebagai atribut `User` entity karena tidak disimpan di database aplikasi. |

---

## Catatan Akhir

Audit ini menggunakan **source code sebagai sumber kebenaran utama**. Tidak ada class, atribut, operasi, atau relasi yang dibuat berdasarkan asumsi umum tentang aplikasi interview. Seluruh temuan dapat ditelusuri kembali ke file dan baris kode yang spesifik.

Sebelum menggambar diagram akhir, silakan verifikasi:
1. Apakah pemisahan `VapiController` dari `Agent.tsx` sudah sesuai?
2. Apakah atribut-atribut yang ditandai [NEEDS CONFIRMATION] perlu dimasukkan?
3. Apakah ada use case tambahan yang terlewat?
