KERJAKAN REPO INI SAMPAI PRODUCTION-READY UNTUK PENGGUNAAN INTERNAL.

Jangan berhenti sebelum semua flow utama berhasil dijalankan manual dari login sampai export laporan.

Pastikan aplikasi benar-benar usable, bukan hanya tampilan. User harus bisa login, membuka dashboard, membuat event, generate ide dengan AI, memilih konsep terbaik, generate proposal lengkap, mengedit timeline/rundown/budget/PIC/risiko/checklist, menyimpan event, menjalankan approval, export PDF/Word, dan membuat laporan final pasca-event.

Jika ada bug, error, fitur belum tersambung, data belum tersimpan, API gagal, UI berantakan, export belum rapi, validasi kurang, security lemah, file rahasia masuk repo, atau flow belum lengkap, perbaiki sampai tuntas.

Gunakan pendekatan paling stabil, sederhana, aman, dan mudah dirawat. Jangan mengganti stack utama tanpa alasan kuat. Jangan menghapus fitur lama yang masih berguna. Jangan berhenti di prototype.

Definisi selesai: aplikasi bisa dijalankan manual dari awal sampai akhir oleh user non-teknis, aman untuk penggunaan internal, dan hasilnya bisa dipakai sebagai laporan resmi perusahaan.

# GOLDEN PROMPT — DANISWARA EVENT PLANNER AI

## 1. Tujuan Utama

Aplikasi **Daniswara Event Planner AI** harus bisa dipakai untuk membuat event perusahaan dari kondisi user belum punya ide sampai menjadi proposal/laporan lengkap.

Target aplikasi:

1. Membantu user menemukan ide event ketika belum punya konsep.
2. Membuat 3–5 alternatif konsep event.
3. Merekomendasikan 1 konsep terbaik secara objektif.
4. Membuat proposal event lengkap.
5. Mengelola timeline persiapan.
6. Mengelola rundown acara.
7. Mengelola budget estimasi dan aktual.
8. Mengelola PIC/panitia.
9. Mengelola risiko dan mitigasi.
10. Mengelola checklist sebelum, saat, dan setelah event.
11. Menjalankan approval/review.
12. Membuat laporan final pasca-event.
13. Export laporan ke PDF/Word.

Aplikasi tidak boleh hanya berupa UI statis. Semua flow utama harus tersambung frontend, backend, database, AI service/fallback demo, dan export.

## 2. Konteks Perusahaan

Perusahaan: **Daniswara Group**

Bidang usaha: general supplier / barang dan jasa sektor konstruksi.

Karakter event: formal, semi-formal, kekeluargaan, produktif, efisien, dan punya nilai strategis.

Visi:

> Berkembang dalam pembangunan konstruksi dan investasi di Indonesia - 2029.

Nilai GHANDOS:

- Growth: bertumbuh dan berkembang.
- Harmony: menjaga kerja sama dan kebersamaan.
- Adaptif: mampu menyesuaikan diri dengan perubahan.
- New: terbuka terhadap ide baru dan inovasi.
- Determination: punya tekad dan daya juang.
- Optimistis: melihat masa depan dengan positif.
- Social: memberi manfaat untuk lingkungan dan sesama.

Setiap event sebisa mungkin dikaitkan dengan nilai GHANDOS, arah pertumbuhan perusahaan, budaya kerja, dan kebutuhan operasional.

## 3. Stack yang Harus Dipertahankan

Ikuti stack yang sudah ada di repo.

Frontend:

- React 18
- Vite
- Tailwind CSS
- Zustand
- React Router
- Axios
- Recharts
- jsPDF
- jsPDF AutoTable
- File Saver

Backend:

- Node.js
- Express.js
- Sequelize
- MySQL 8
- JWT Auth
- OpenAI-compatible API
- DOCX export jika sudah tersedia

Command wajib berhasil:

- `npm run install:all`
- `npm run setup`
- `npm run dev`
- `npm run build`

## 4. Flow Utama yang Wajib Berjalan

1. Login.
2. Dashboard.
3. Buat event.
4. Pilih mode:
   - belum punya ide;
   - punya momentum;
   - punya konsep kasar;
   - ingin proposal lengkap.
5. Input data dasar event.
6. Generate ide event.
7. Pilih konsep terbaik.
8. Generate proposal lengkap.
9. Edit proposal per section.
10. Edit timeline.
11. Edit rundown.
12. Edit budget.
13. Edit PIC/panitia.
14. Edit risiko.
15. Edit checklist.
16. Simpan event.
17. Submit review/approval.
18. Export PDF/Word.
19. Buat laporan final pasca-event.

Jika AI API belum dikonfigurasi, aplikasi tetap harus bisa demo memakai fallback/sample data dengan label jelas: **Mode Demo**.

## 5. Role dan Hak Akses

Minimal role:

| Role | Hak Akses |
|---|---|
| Super Admin | Semua akses, kelola user, setting AI, semua event |
| Admin Event | Buat/edit event, generate AI, export laporan, submit approval |
| PIC Event | Lihat event tugasnya, update task/checklist/status |
| Viewer/Direksi | Lihat dashboard, proposal, laporan, memberi review/approval |

Pastikan route guard, pembatasan tombol/action, dan validasi backend sesuai role.

## 6. Halaman Minimum

1. Login
2. Dashboard
3. Daftar Event
4. Buat Event / AI Wizard
5. Detail Event
6. Edit Event
7. Timeline / Task
8. Rundown
9. Budget
10. Risk Management
11. Checklist
12. Approval / Review
13. Export Laporan
14. Setting AI / API Key
15. User Management sederhana untuk Super Admin
16. Laporan Final Event

## 7. Proposal Lengkap Wajib Berisi

1. Identitas event
2. Latar belakang
3. Tujuan event
4. Konsep acara
5. Tema dan filosofi
6. Sasaran peserta
7. Manfaat event
8. Key message
9. Susunan panitia dan PIC
10. Timeline persiapan
11. Rundown acara
12. Kebutuhan perlengkapan
13. Estimasi budget
14. Strategi efisiensi budget
15. Materi dan konten acara
16. Output dokumen setelah event
17. Risiko dan mitigasi
18. Checklist eksekusi
19. Rekomendasi final

Semua bagian harus bisa ditampilkan rapi, diedit manual, disimpan, dan diekspor.

## 8. AI Event Generator

Jika user belum punya ide, AI wajib menghasilkan 3–5 alternatif ide event.

Setiap ide harus berisi:

- nama event;
- tema besar;
- tagline;
- tujuan;
- peserta yang cocok;
- estimasi durasi;
- level budget: hemat / standar / premium;
- aktivitas utama;
- kelebihan;
- risiko/catatan;
- keterkaitan dengan GHANDOS;
- alasan cocok untuk Daniswara Group.

Setelah itu AI wajib merekomendasikan 1 konsep terbaik berdasarkan dampak, momentum, kemudahan eksekusi, efisiensi budget, potensi dokumentasi, dan manfaat bagi perusahaan.

## 9. Data AI Harus Terstruktur

Jangan simpan hasil AI hanya sebagai teks panjang. Simpan sebagai data terstruktur agar bisa diedit per section.

Minimal struktur:

- assumptions
- event_identity
- idea_options
- recommended_concept
- background
- objectives
- concept
- theme_philosophy
- participant_targets
- benefits
- key_messages
- committee
- timeline
- rundown
- equipment_needs
- budget
- budget_summary
- materials_content
- post_event_outputs
- risks
- checklists
- final_recommendation

Aturan:

- Output AI harus valid dan bisa diparse.
- Semua biaya harus numeric.
- Jika data kurang, gunakan asumsi profesional.
- Jangan mengisi null kosong jika bisa diisi asumsi wajar.
- Gunakan bahasa Indonesia.

## 10. Laporan Final Pasca-Event

Laporan final minimal berisi:

1. Identitas event
2. Ringkasan pelaksanaan
3. Perbandingan rencana vs realisasi
4. Jumlah peserta hadir
5. Rundown aktual
6. Budget estimasi vs aktual
7. Dokumentasi kegiatan
8. Kendala yang terjadi
9. Solusi yang dilakukan
10. Evaluasi peserta
11. Action plan setelah event
12. Rekomendasi event berikutnya
13. Kesimpulan

Laporan final harus bisa diedit dan diekspor.

## 11. Security Requirement Wajib

Security tidak boleh dianggap tambahan. Untuk penggunaan internal, minimal wajib aman pada hal-hal penting berikut:

### File dan Secret

- Jangan commit file `.env`, `.env.local`, secret key, API key, token, password asli, private key, file database lokal, atau upload user.
- File yang boleh masuk GitHub hanya kode, config contoh, dokumentasi, migration, seed aman, dan template.
- `.env.example` boleh ada, tapi semua value sensitif harus placeholder, bukan secret asli.
- Pastikan `.gitignore` melindungi file penting.

### Environment Variable

- JWT secret, refresh secret, database password, AI API key, dan encryption key wajib dibaca dari environment variable.
- Jangan hardcode secret di source code.
- Jika secret belum diisi, tampilkan error yang jelas atau gunakan mode demo yang aman.

### Auth dan Session

- Password harus di-hash.
- JWT harus punya expiry.
- Refresh token jika ada harus aman.
- Endpoint penting wajib memakai auth middleware.
- Role-based access control wajib diterapkan di backend, bukan hanya UI.

### API Security

- Validasi input wajib di endpoint create/update.
- Terapkan rate limit pada auth dan endpoint AI.
- Gunakan helmet dan CORS yang dibatasi dari env `CLIENT_URL`.
- Jangan return stack trace/detail error sensitif ke frontend saat production.
- Sanitasi input teks panjang untuk mencegah injection/XSS.

### AI Security

- API key AI disimpan terenkripsi atau minimal tidak tampil ulang secara penuh.
- Prompt user tidak boleh langsung dipercaya untuk melakukan action berbahaya.
- Hasil AI harus divalidasi sebelum disimpan.
- Jika JSON AI gagal parse, tampilkan fallback dan error message yang jelas.

### Upload dan Export

- Batasi ukuran file upload.
- Validasi tipe file upload.
- Jangan menyimpan upload ke repo.
- Export PDF/Word tidak boleh memuat secret/env.
- Nama file export harus aman.

### Production Readiness

- `NODE_ENV=production` harus aman.
- Logging production tidak boleh membocorkan secret.
- Default password seed wajib diberi catatan harus diganti saat production.
- Database migration/seed tidak boleh merusak data existing.

## 12. GitHub Hygiene

Yang boleh masuk GitHub:

- source code;
- migration;
- seed demo aman;
- `.env.example` dengan placeholder;
- dokumentasi;
- script setup;
- template export;
- file konfigurasi build.

Yang tidak boleh masuk GitHub:

- `.env`;
- API key asli;
- password asli;
- token;
- private key;
- database lokal;
- file upload user;
- file backup;
- log;
- build output;
- cache;
- folder `node_modules`.

Jika sudah terlanjur ada secret di commit, buat catatan bahwa secret harus dirotate/diganti.

## 13. QA Checklist Wajib

Sebelum menyatakan selesai, pastikan:

- install dependency berhasil;
- setup database berhasil;
- frontend dan backend running;
- login berhasil;
- dashboard tampil;
- event bisa dibuat;
- ide event bisa digenerate;
- proposal lengkap bisa digenerate;
- proposal tersimpan;
- timeline bisa diedit;
- rundown bisa diedit;
- budget bisa diedit;
- PIC bisa diedit;
- checklist bisa diedit;
- risiko bisa diedit;
- approval berjalan;
- export PDF berhasil;
- export DOCX berhasil jika fiturnya tersedia;
- laporan final bisa dibuat;
- UI responsive;
- endpoint utama tidak return 500;
- tidak ada error fatal di console;
- tidak ada secret/file sensitif di repo;
- `.env.example` aman;
- `.gitignore` aman.

## 14. Output Laporan Coding Agent

Setelah selesai, laporkan:

# Ringkasan Pengerjaan

## Fitur yang Sudah Berjalan
- ...

## Perbaikan yang Dilakukan
- ...

## Security yang Sudah Dicek
- ...

## Cara Menjalankan Aplikasi
1. ...

## Akun Default
- ...

## Flow Penggunaan
1. Login
2. Buat Event
3. Generate Ide
4. Generate Proposal
5. Edit Detail
6. Approval
7. Export Laporan
8. Buat Laporan Final

## File Penting yang Diubah
- ...

## Catatan Teknis
- ...

## Sisa Pengembangan Jika Ada
- ...

## 15. Definisi Sukses

Project sukses jika user non-teknis bisa membuka aplikasi dan menjalankan skenario berikut tanpa bantuan developer:

1. Login.
2. Buka dashboard.
3. Buat event dari mode belum punya ide.
4. Generate beberapa ide event.
5. Pilih konsep terbaik.
6. Generate proposal lengkap.
7. Edit timeline, rundown, budget, PIC, risiko, dan checklist.
8. Simpan event.
9. Submit approval.
10. Export laporan.
11. Buat laporan final pasca-event.

Event yang baik bukan hanya acara yang ramai, tapi acara yang punya arah, manfaat, eksekusi rapi, dan hasil yang bisa ditindaklanjuti.
