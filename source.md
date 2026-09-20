Audit Source Code untuk Penyusunan Class Diagram UML

Saya sedang menyusun Class Diagram UML untuk skripsi aplikasi simulasi wawancara AI.

Saya ingin membuat class diagram dengan pendekatan Boundary–Control–Entity (BCE) seperti referensi berikut:

* <<boundary>> untuk halaman/interface yang berinteraksi langsung dengan pengguna.
* <<controller>> untuk menangani alur dan proses bisnis.
* <<entity>> untuk merepresentasikan data/domain object.
* Setiap class harus memiliki atribut dan operasi/method yang benar-benar didukung oleh source code.
* Diagram harus menunjukkan relasi antar-class.

Tujuan Audit

Lakukan audit terhadap seluruh source code yang relevan untuk menemukan:

1. Seluruh kandidat <<boundary>>.
2. Seluruh kandidat <<controller>>.
3. Seluruh kandidat <<entity>>.
4. Atribut setiap entity.
5. Operasi/method setiap class.
6. Relasi antar-class.
7. Alur pemanggilan antar-class.
8. Relasi antara frontend, backend, service, database, dan API.
9. Fungsi yang berkaitan dengan authentication.
10. Fungsi yang berkaitan dengan pembuatan template simulasi wawancara.
11. Fungsi yang berkaitan dengan pelaksanaan simulasi wawancara.
12. Fungsi yang berkaitan dengan AI.
13. Fungsi penyimpanan jawaban dan hasil evaluasi.
14. Fungsi lain yang termasuk dalam scope aplikasi simulasi wawancara.

⸻

1. Audit Struktur Project

Pertama, identifikasi:

* Framework frontend
* Framework/backend
* Struktur folder
* Entry point aplikasi
* Routing
* API layer
* Database
* ORM/query builder jika ada
* Authentication mechanism
* External API/service
* AI integration
* State management jika ada

Tampilkan struktur project yang relevan dan jelaskan fungsi setiap folder/file penting.

Jangan memasukkan library/dependency pihak ketiga yang tidak merepresentasikan class dalam domain aplikasi.

⸻

2. Identifikasi Boundary

Cari seluruh halaman, screen, view, component, atau interface yang secara langsung digunakan oleh pengguna.

Kelompokkan sebagai:

<<boundary>>

Untuk setiap boundary, berikan:

Boundary	File/Source	Fungsi	Operasi yang ditemukan

Contoh format:

SigninView

* clickSubmit()
* inputEmail()
* inputPassword()

InterviewTemplateView

* submitTemplate()
* selectDuration()
* selectLanguage()

Jangan membuat operasi yang tidak ditemukan atau tidak dapat ditelusuri dari source code.

Jika sebuah frontend component hanya merupakan komponen visual/reusable dan tidak memiliki tanggung jawab bisnis, jangan otomatis menjadikannya class boundary.

⸻

3. Identifikasi Controller

Cari seluruh:

* Controller
* API handler
* Route handler
* Request handler
* Application service
* Use-case handler

yang menangani proses bisnis aplikasi.

Kelompokkan kandidat sebagai:

<<controller>>

Untuk setiap controller, identifikasi:

* Nama class
* File
* Method
* Tujuan method
* Boundary yang memanggilnya
* Entity/service yang digunakan

Gunakan operasi yang benar-benar ada dalam source code.

Contoh:

InterviewController

Operations:

* createTemplate()
* startInterview()
* submitAnswer()
* finishInterview()
* getResult()

Tetapi hanya gunakan operasi tersebut jika memang ditemukan/didukung source code.

⸻

4. Identifikasi Entity

Cari seluruh domain object/model yang menyimpan atau merepresentasikan data aplikasi.

Periksa:

* Model
* Database schema
* Migration
* ORM model
* Type/interface yang merepresentasikan persistent data
* DTO jika benar-benar merepresentasikan domain data

Kelompokkan sebagai:

<<entity>>

Untuk setiap entity, tampilkan:

Entity	Atribut	Tipe Data	Primary Key	Foreign Key	Relasi

Contoh:

User

* id
* name
* email
* password
* createdAt

Namun jangan mengarang atribut. Ambil berdasarkan source code/database schema.

⸻

5. Identifikasi Operasi Entity

Periksa apakah entity/model memiliki operasi seperti:

* create()
* save()
* find()
* findById()
* update()
* delete()
* authenticate()

atau operasi domain lainnya.

Bedakan antara:

1. operasi yang memang merupakan bagian dari entity/domain,
2. operasi repository/database,
3. operasi controller,
4. operasi service.

Jangan memasukkan seluruh fungsi framework/library ke dalam class diagram.

⸻

6. Audit Authentication

Telusuri seluruh proses:

Sign In
↓
Authentication
↓
User validation
↓
Session/token
↓
Authorization

Cari:

* Login
* Register
* Logout
* Session
* Token
* Authentication middleware
* Authorization
* User model/entity

Identifikasi class yang benar-benar terlibat.

⸻

7. Audit Pembuatan Template Simulasi Wawancara

Telusuri secara lengkap use case:

Membuat Template Simulasi Wawancara

Cari source yang menangani:

* Job role
* Job description
* Interview type
* Duration
* Language
* Tone
* Difficulty
* Communication mode
* Follow-up depth
* Question configuration
* Template save
* Template retrieval
* Template update
* Template deletion

Buat alur:

Boundary
   ↓
Controller
   ↓
Service/Business Logic
   ↓
Entity
   ↓
Database

Catat class dan operasi yang benar-benar terlibat.

⸻

8. Audit Pelaksanaan Simulasi Wawancara

Telusuri use case:

Melaksanakan Simulasi Wawancara

Cari source yang menangani:

* Start interview
* Generate question
* Display question
* Text answer
* Voice answer
* Video answer jika ada
* Submit answer
* Next question
* Follow-up question
* Timer
* End interview
* Save interview session
* Save answer

Identifikasi semua class yang terlibat dan method yang digunakan.

⸻

9. Audit AI/Gemini

Telusuri seluruh integrasi AI.

Cari:

* Gemini API
* Prompt generation
* Question generation
* Follow-up question generation
* Answer evaluation
* Scoring
* Feedback generation
* AI response parsing

Tentukan apakah fungsi tersebut berada pada:

<<controller>>

atau

<<service>>

atau class/domain lain.

Jangan memasukkan class dari SDK Gemini sebagai class domain aplikasi kecuali memang diperlukan untuk menjelaskan arsitektur.

Jika terdapat AI service seperti:

GeminiService

jelaskan apakah service tersebut sebaiknya ditampilkan dalam class diagram skripsi atau cukup direpresentasikan sebagai bagian dari controller/application service.

⸻

10. Audit Database dan Relasi

Periksa:

* Migration
* Schema
* Foreign key
* Relation ORM
* Join
* Query
* Reference ID

Identifikasi relasi seperti:

User 1 ---- * InterviewTemplate
InterviewTemplate 1 ---- * InterviewSession
InterviewSession 1 ---- * Question
InterviewSession 1 ---- * Answer
InterviewSession 1 ---- 1 Evaluation

Tetapi JANGAN menggunakan contoh relasi tersebut sebagai fakta.

Gunakan hanya relasi yang benar-benar ditemukan pada source code/database.

Untuk setiap relasi, tentukan:

* Association
* Aggregation
* Composition
* Generalization/inheritance jika ada
* Multiplicity

Jika tidak ada bukti yang cukup untuk aggregation/composition, gunakan association biasa.

⸻

11. Mapping Boundary–Control–Entity

Setelah audit selesai, buat mapping:

Boundary	Controller	Entity
SigninView	AuthController	User
SignupView	AuthController	User
TemplateView	InterviewTemplateController	InterviewTemplate
InterviewView	InterviewController	InterviewSession, Question, Answer
ResultView	EvaluationController	Evaluation

Isi berdasarkan source code aktual.

⸻

12. Seleksi Class untuk Class Diagram Skripsi

Jangan memasukkan semua class dari source code.

Pisahkan menjadi:

A. Class yang WAJIB masuk

Class yang memiliki tanggung jawab langsung terhadap fitur/use case utama aplikasi.

B. Class yang MUNGKIN masuk

Class pendukung yang masih relevan untuk menjelaskan proses bisnis.

C. Class yang TIDAK perlu masuk

Contohnya:

* Framework internal
* Library eksternal
* Utility sederhana
* Helper generik
* Configuration class
* UI component yang hanya bersifat visual
* Class teknis yang tidak relevan dengan domain skripsi

Berikan alasan untuk setiap class yang dikeluarkan.

⸻

13. Format Output Audit

Berikan hasil dalam urutan berikut:

A. Candidate Boundary

Class	File	Stereotype	Operations	Keterangan

B. Candidate Controller

Class	File	Stereotype	Operations	Keterangan

C. Candidate Entity

Class	File	Attributes	Operations	Keterangan

D. Relationships

Source	Relationship	Target	Multiplicity	Evidence

E. Use Case Mapping

Use Case	Boundary	Controller	Entity

F. Recommended Class Diagram

Berikan daftar final class yang direkomendasikan untuk dimasukkan ke class diagram skripsi.

Untuk setiap class tampilkan:

<<stereotype>>
ClassName
----------------------
- attribute
- attribute
----------------------
+ operation()
+ operation()

G. Ambiguities

Jika ada bagian yang tidak dapat dipastikan dari source code, tandai:

[NEEDS CONFIRMATION]

Jangan membuat asumsi tanpa memberikan tanda tersebut.

⸻

14. Prinsip Penting

Gunakan source code sebagai sumber kebenaran utama.

Jangan membuat class, atribut, operasi, atau relasi hanya berdasarkan asumsi umum tentang aplikasi interview.

Tujuan akhirnya adalah menghasilkan class diagram yang:

1. Konsisten dengan implementasi aplikasi.
2. Konsisten dengan use case.
3. Konsisten dengan database.
4. Konsisten dengan sequence diagram.
5. Menggunakan pendekatan Boundary–Control–Entity.
6. Tidak terlalu penuh dengan class teknis yang tidak relevan.
7. Memiliki atribut dan operasi yang dapat ditelusuri kembali ke source code.

Setelah audit selesai, jangan langsung menggambar diagram. Berikan terlebih dahulu hasil audit dan rekomendasi class diagram final agar dapat diverifikasi.

Hasilnya buatkan file : classdiagramgpt.md