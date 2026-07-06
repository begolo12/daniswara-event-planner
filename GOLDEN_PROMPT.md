# GOLDEN PROMPT — Daniswara Event Planner AI
## Target: Aplikasi Siap Produksi untuk Penggunaan Sehari-hari

---

## 1. KONTEKS PERUSAHAAN

**Perusahaan:** PT Daniswara Group
**Bidang:** General supplier barang dan jasa sektor konstruksi
**Visi:** Berkembang dalam pembangunan konstruksi dan investasi di Indonesia - 2029
**Nilai Perusahaan (GHANDOS):**
- **G**rowth — Bertumbuh dan berkembang
- **H**armony — Menjaga kerja sama dan kebersamaan
- **A**daptif — Mampu menyesuaikan diri dengan perubahan
- **N**ew — Terbuka terhadap ide baru dan inovasi
- **D**etermination — Punya tekad dan daya juang
- **O**ptimistis — Melihat masa depan dengan positif
- **S**ocial — Memberi manfaat untuk lingkungan dan sesama

---

## 2. STACK TEKNIS

**Frontend:**
- React 18 + Vite 5
- Tailwind CSS 3
- Zustand (state management)
- React Router 6
- Axios (HTTP client)
- Recharts (charts)
- jsPDF + jspdf-autotable (PDF export)
- file-saver (download)
- lucide-react (icons)
- react-hot-toast (notifications)
- date-fns (date formatting)

**Backend:**
- Node.js + Express.js
- Sequelize ORM
- SQLite (development) / MySQL 8 (production)
- JWT Auth (access + refresh token)
- OpenAI-compatible API
- docx library (Word export)
- bcryptjs (password hashing)
- helmet + cors + morgan (security/logging)

---

## 3. DEFINISI APLIKASI SELESAI

Aplikasi dianggap **SIAP PRODUKSI** jika user bisa melakukan flow ini tanpa error:

### Flow Utama
1. ✅ Login sebagai Admin Event
2. ✅ Masuk dashboard dengan data real
3. ✅ Klik "Buat Event dengan AI"
4. ✅ Pilih mode:
   - Saya belum punya ide event
   - Saya punya momentum tapi belum punya konsep
   - Saya sudah punya konsep kasar
   - Saya ingin membuat proposal lengkap
5. ✅ Isi form singkat
6. ✅ Generate ide event dengan AI (atau Mode Demo)
7. ✅ AI memberikan 35 ide event (atau sample data)
8. ✅ User memilih satu konsep terbaik
9. ✅ AI membuat proposal event lengkap
10. ✅ User bisa melihat dan mengedit:
    - Identitas event
    - Latar belakang
    - Tujuan
    - Konsep
    - Tema
    - Timeline
    - Rundown
    - Budget
    - PIC
    - Perlengkapan
    - Risiko
    - Checklist
    - Output pasca-event
11. ✅ User bisa menyimpan event
12. ✅ Direksi/viewer bisa melihat proposal
13. ✅ Event bisa masuk approval flow
14. ✅ User bisa export laporan PDF/Word
15. ✅ Setelah event selesai, user bisa membuat laporan final pasca-event

### Flow Harian
1. ✅ Login → Dashboard → Lihat ringkasan event aktif
2. ✅ Cek task yang perlu dikerjakan hari ini
3. ✅ Update status task/checklist
4. ✅ Update budget aktual
5. ✅ Tambah vendor/kontak
6. ✅ Export laporan untuk rapat

---

## 4. ROLE DAN HAK AKSES

| Role | Hak Akses |
|---|---|
| Super Admin | Semua akses, kelola user, kelola setting AI, semua event |
| Admin Event | Buat event, edit event, generate AI, export laporan, submit approval |
| PIC Event | Lihat event yang ditugaskan, update task/checklist/status |
| Viewer/Direksi | Lihat dashboard, proposal, laporan, memberi review/approval |

---

## 5. HALAMAN YANG HARUS ADA

### 5.1 Autentikasi
- [ ] Login (email + password)
- [ ] Logout
- [ ] Idle timeout 30 menit

### 5.2 Dashboard
- [ ] Total event (draft, planning, waiting_approval, preparation, ready, on_going, done, evaluated)
- [ ] Total estimasi budget
- [ ] Total budget aktual
- [ ] Event terdekat
- [ ] Progress checklist
- [ ] Risiko utama
- [ ] Grafik event per bulan atau per jenis event
- [ ] Shortcut tombol "Buat Event dengan AI"
- [ ] Tugas yang perlu dikerjakan hari ini

### 5.3 Event Management
- [ ] Daftar event (tabel + filter + search + pagination)
- [ ] Buat event manual
- [ ] Buat event dengan AI (wizard 4 mode)
- [ ] Detail event (tabbed: overview, timeline, rundown, checklist, tasks, budget, vendors, documents, approvals, evaluation, report)
- [ ] Edit event
- [ ] Hapus event (draft only)

### 5.4 Event Sub-Resources (per tab di detail event)
- [ ] Timeline persiapan (H-30 sampai H+7)
- [ ] Rundown acara
- [ ] Checklist persiapan
- [ ] Tugas/Task management
- [ ] Budget/anggaran
- [ ] Vendor
- [ ] Dokumen
- [ ] Persetujuan/Approval
- [ ] Evaluasi pasca-event
- [ ] Laporan final

### 5.5 AI Generator
- [ ] Generate ide event (35 ide)
- [ ] Generate proposal lengkap
- [ ] Regenerate per section
- [ ] Edit hasil AI
- [ ] Simpan hasil AI ke database
- [ ] Mode Demo jika AI belum aktif

### 5.6 Export
- [ ] Export proposal event (PDF)
- [ ] Export proposal event (Word/DOCX)
- [ ] Export rundown (PDF)
- [ ] Export budget (PDF)
- [ ] Export checklist (PDF)
- [ ] Export laporan final (PDF/Word)

### 5.7 Master Data
- [ ] Tipe event (CRUD)
- [ ] Vendor (CRUD)
- [ ] Lokasi/Venue (CRUD)
- [ ] Peralatan (CRUD)

### 5.8 Pengaturan
- [ ] AI Settings (provider, API key, model, temperature)
- [ ] User Management (CRUD user, role assignment)
- [ ] Profile user

### 5.9 Lainnya
- [ ] Kalender event
- [ ] Tugas saya (My Tasks)
- [ ] Laporan/Reports

---

## 6. UI/UX REQUIREMENTS

### 6.1 Design Principles
1. **User awam harus langsung paham** cara membuat event
2. **Tombol utama harus jelas:**
   - Buat Event dengan AI
   - Generate Ide
   - Generate Proposal
   - Simpan Event
   - Export Laporan
3. **Hasil AI jangan hanya satu teks panjang** — Pecah menjadi section/tab
4. **Semua section bisa diedit manual**
5. **Tabel harus nyaman dibaca di laptop dan bisa scroll di mobile**
6. **Loading state saat AI generate**
7. **Empty state jika belum ada data**
8. **Error message yang jelas jika API gagal**
9. **Jika AI belum aktif, tampilkan Mode Demo**

### 6.2 Responsive Design
- Desktop: Sidebar + header + content area
- Tablet: Collapsible sidebar + header + content area
- Mobile: Bottom navigation + full-width content

### 6.3 Dark Mode
- Sidebar selalu dark (gray-950)
- Content area: white background dengan gray-50 accent
- Cards: white dengan gray-100 border
- Text: dark-900 untuk utama, dark-400 untuk secondary
- Brand color: red-600 untuk primary action
- Status colors: green (success), yellow (warning), red (danger), blue (info)

### 6.4 Typography
- Font: Inter (Google Fonts)
- Heading: font-bold, text-dark-900
- Body: text-sm, text-dark-700
- Caption: text-xs, text-dark-400
- Label: text-sm font-medium text-dark-700

### 6.5 Spacing
- Page padding: p-4 md:p-6
- Section spacing: space-y-6
- Card padding: p-6
- Form spacing: space-y-4
- Table cell: px-4 py-3

---

## 7. DATA MODEL

### 7.1 Users
- id, name, email, password_hash, role, division, position, phone, avatar_url, is_active, last_login_at

### 7.2 Events
- id, name, event_type_id, event_date, start_time, end_time, location, venue, format, estimated_participants, target_participants, goal, tone, budget_max, division, pic_main_id, notes, status, approved_by, approved_at, created_by

### 7.3 Event Themes
- id, event_id, theme_name, tagline, philosophy, visual_direction, dominant_colors, decoration_ideas, is_selected

### 7.4 Event Timelines
- id, event_id, phase, date, activity, pic_id, deadline, priority, risk_if_late, status, notes, sort_order

### 7.5 Event Rundowns
- id, event_id, start_time, end_time, duration, agenda, activity_detail, pic_id, technical_needs, mc_notes, expected_output, sort_order

### 7.6 Event Checklists
- id, event_id, category, item_name, quantity, priority, pic_id, deadline, estimated_cost, actual_cost, status, notes, sort_order

### 7.7 Event Tasks
- id, event_id, task_name, description, pic_id, deadline, priority, status, progress, sort_order, notes, proof_file_url

### 7.8 Event Budgets
- id, event_id, category, item, quantity, unit_price, total_price, actual_cost, priority, can_be_reduced, saving_alternative, notes, receipt_file_url, sort_order

### 7.9 Event Vendors
- id, event_id, vendor_name, category, contact_person, phone, email, estimated_cost, actual_cost, performance_notes, status, sort_order

### 7.10 Event Documents
- id, event_id, doc_type, title, content, file_url, version, created_by, approved_by, approved_at, status

### 7.11 Event Approvals
- id, event_id, event_document_id, reviewer_id, status, notes

### 7.12 Event Evaluations
- id, event_id, actual_participants, rundown_compliance, issues_encountered, budget_planned, budget_actual, feedback_summary, documentation_notes, improvement_notes, recommendations, ai_summary, ai_lesson_learned

### 7.13 Event Feedbacks
- id, event_id, respondent_name, rating, comments

### 7.14 Risk Backup Plans
- id, event_id, risk, impact, probability, backup_plan, pic_id, status, sort_order

### 7.15 AI Settings
- id, provider_name, base_url, api_key_encrypted, model, default_system_prompt, temperature, max_tokens, is_active, last_test_at, last_test_status

### 7.16 AI Generation Logs
- id, user_id, event_id, generation_type, prompt, response, model_used, token_input, token_output, status, error_message, duration_ms

### 7.17 Master Data
- MasterVendor: id, name, category, contact_person, phone, email, estimated_price_range, performance_notes, is_active
- MasterVenue: id, name, capacity, address, rental_price, facilities, notes, is_active
- MasterEquipment: id, name, category, quantity_available, condition, storage_location, notes, is_active

### 7.18 Activity Logs
- id, user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent

---

## 8. API ENDPOINTS

### Auth
- POST /api/auth/login
- POST /api/auth/refresh
- GET /api/auth/me
- PUT /api/auth/password

### Users
- GET /api/users
- POST /api/users
- GET /api/users/:id
- PUT /api/users/:id
- DELETE /api/users/:id
- PUT /api/users/:id/toggle

### Events
- GET /api/events
- POST /api/events
- GET /api/events/:id
- PUT /api/events/:id
- DELETE /api/events/:id
- PUT /api/events/:id/status
- POST /api/events/:id/submit-approval
- POST /api/events/:id/approve
- POST /api/events/:id/reject

### Event Sub-Resources (per resource)
- GET /api/events/:eventId/:resource
- POST /api/events/:eventId/:resource
- GET /api/events/:eventId/:resource/:id
- PUT /api/events/:eventId/:resource/:id
- DELETE /api/events/:eventId/:resource/:id

### Special Sub-Resource Endpoints
- PUT /api/events/:eventId/timelines/reorder
- PUT /api/events/:eventId/rundowns/reorder
- PUT /api/events/:eventId/checklists/:id/status
- PUT /api/events/:eventId/tasks/:id/progress
- PUT /api/events/:eventId/budgets/:id/actual
- PUT /api/events/:eventId/themes/:id/select

### AI
- POST /api/ai/generate-event
- POST /api/ai/generate
- GET /api/ai/logs
- POST /api/ai/test-connection

### AI Settings
- GET /api/ai-settings
- POST /api/ai-settings
- PUT /api/ai-settings/:id
- POST /api/ai-settings/test

### Master Data
- GET/POST/PUT/DELETE /api/master/event-types
- GET/POST/PUT/DELETE /api/master/vendors
- GET/POST/PUT/DELETE /api/master/venues
- GET/POST/PUT/DELETE /api/master/equipments

### Dashboard
- GET /api/dashboard/stats
- GET /api/dashboard/calendar
- GET /api/dashboard/upcoming
- GET /api/dashboard/overdue

### Reports
- GET /api/reports/events
- GET /api/reports/events/:id
- POST /api/reports/events/:id/generate
- GET /api/reports/events/:id/export-docx
- POST /api/reports/export-ai-docx
- GET /api/reports/budget

### Other
- GET /api/my-tasks
- GET /api/activity-logs
- GET /api/health

---

## 9. AI OUTPUT FORMAT

### 9.1 System Prompt
```
Kamu adalah AI Event Planner profesional untuk PT Daniswara Group.
Tugas kamu adalah membantu perencanaan, eksekusi, dan evaluasi event korporasi.

Kemampuan kamu meliputi:
1. Merancang konsep dan tema event
2. Membuat timeline dan rundown acara
3. Menghitung dan mengoptimasi budget
4. Mengidentifikasi risiko dan membuat rencana mitigasi
5. Membuat dokumen event (undangan, TOR, proposal, dll)
6. Mengevaluasi hasil event dan memberikan rekomendasi

Selalu berikan respons dalam Bahasa Indonesia yang profesional.
Format output dalam JSON sesuai dengan struktur yang diminta.
Gunakan nilai GHANDOS perusahaan dalam setiap proposal.
```

### 9.2 Output JSON Structure
```json
{
  "assumptions": [],
  "event_identity": {
    "event_name": "",
    "theme": "",
    "tagline": "",
    "event_type": "",
    "date": "",
    "time": "",
    "location": "",
    "participants": "",
    "estimated_participants": 0,
    "main_pic": "",
    "related_divisions": []
  },
  "idea_options": [
    {
      "name": "",
      "theme": "",
      "objective": "",
      "duration": "",
      "budget_level": "",
      "pros": [],
      "risks": [],
      "fit_reason": ""
    }
  ],
  "recommended_concept": { "name": "", "reason": "" },
  "background": "",
  "objectives": {
    "main": "",
    "supporting": [],
    "expected_outputs": []
  },
  "concept": {
    "big_idea": "",
    "format": "",
    "mood": "",
    "main_activities": [],
    "supporting_activities": [],
    "ghandos_values": []
  },
  "theme_philosophy": {
    "theme": "",
    "meaning": "",
    "company_relevance": "",
    "participant_relevance": "",
    "target_relevance": ""
  },
  "participant_targets": [],
  "benefits": {
    "company": [],
    "management": [],
    "employees": [],
    "division": [],
    "culture_branding": []
  },
  "key_messages": [],
  "committee": [],
  "timeline": [],
  "rundown": [],
  "equipment_needs": [],
  "budget": [],
  "budget_summary": {
    "total_estimated": 0,
    "recommended_budget_option": "",
    "efficiency_strategy": []
  },
  "materials_content": [],
  "post_event_outputs": [],
  "risks": [],
  "checklists": {
    "before_event": [],
    "during_event": [],
    "after_event": []
  },
  "final_recommendation": {
    "feasibility": "",
    "best_budget_option": "",
    "preparation_priority": [],
    "management_decisions_needed": []
  }
}
```

---

## 10. EXPORT FORMAT

### 10.1 Proposal Event (Word/PDF)
- Cover page (nama perusahaan, nama event, tanggal)
- Daftar isi
- Identitas event
- Latar belakang
- Tujuan
- Konsep acara
- Tema dan filosofi
- Sasaran peserta
- Manfaat event
- Key message
- Susunan panitia
- Timeline persiapan
- Rundown acara
- Kebutuhan perlengkapan
- Estimasi budget
- Strategi efisiensi budget
- Materi dan konten
- Output dokumen pasca-event
- Risiko dan mitigasi
- Checklist eksekusi
- Rekomendasi final

### 10.2 Laporan Final Pasca-Event
- Identitas event
- Ringkasan pelaksanaan
- Perbandingan rencana vs realisasi
- Jumlah peserta hadir
- Rundown aktual
- Budget estimasi vs aktual
- Dokumentasi kegiatan
- Kendala yang terjadi
- Solusi yang dilakukan
- Evaluasi peserta
- Action plan setelah event
- Rekomendasi untuk event berikutnya
- Kesimpulan

---

## 11. STATUS FLOW EVENT

```
draft → planning → waiting_approval → preparation → ready → on_going → done → evaluated
```

Transisi yang diizinkan:
- draft: planning, cancelled
- planning: draft, waiting_approval, cancelled
- waiting_approval: planning, preparation, cancelled
- preparation: ready, cancelled
- ready: on_going, cancelled
- on_going: done
- done: evaluated
- evaluated: (final)
- cancelled: draft

---

## 12. PRIORITAS PENGERJAAN

### Prioritas 1 — App Jalan ✅
- [x] Install dependency
- [x] Fix startup error
- [x] Fix environment variable
- [x] Fix database connection
- [x] Fix login
- [x] Fix routing frontend/backend

### Prioritas 2 — Core Event Flow ✅
- [x] Dashboard
- [x] Daftar event
- [x] Buat event
- [x] Detail event
- [x] Edit event

### Prioritas 3 — AI Generator ✅
- [x] Generate ide event
- [x] Generate proposal lengkap
- [x] Simpan hasil AI ke database
- [x] Edit hasil AI
- [x] Fallback demo jika API belum aktif

### Prioritas 4 — Proposal dan Laporan ✅
- [x] Timeline
- [x] Rundown
- [x] Budget
- [x] Risiko
- [x] Checklist
- [x] PIC
- [x] Export PDF/Word
- [x] Laporan final

### Prioritas 5 — Polish (BELUM SELESAI)
- [ ] Mobile responsive testing di device nyata
- [ ] Print-friendly layout untuk semua halaman
- [ ] Notification system (in-app + email)
- [ ] Drag-and-drop untuk rundown/timeline
- [ ] File upload untuk foto/dokumen
- [ ] Search global
- [ ] Keyboard shortcuts
- [ ] Accessibility (aria labels, screen reader)
- [ ] Performance optimization (lazy loading, code splitting)
- [ ] SEO meta tags
- [ ] Error boundary React
- [ ] Offline support (Service Worker)
- [ ] Analytics/tracking
- [ ] Backup/restore database
- [ ] Multi-language support (ID/EN)

---

## 13. QA CHECKLIST

Sebelum deploy ke produksi:

### Authentication
- [ ] Login berhasil dengan semua role
- [ ] Refresh token berfungsi
- [ ] Idle timeout 30 menit logout
- [ ] Password minimal 8 karakter
- [ ] Email validation

### Event Management
- [ ] CRUD event tanpa error
- [ ] Status flow sesuai diagram
- [ ] hanya draft yang bisa dihapus
- [ ] Approval flow berfungsi
- [ ] Semua sub-resource CRUD berfungsi

### AI Integration
- [ ] Generate ide 35 event
- [ ] Generate proposal lengkap
- [ ] Demo mode jika API key kosong
- [ ] Save hasil AI ke database

### Export
- [ ] Export proposal Word
- [ ] Export proposal PDF
- [ ] Export rundown
- [ ] Export budget
- [ ] Export laporan final

### UI/UX
- [ ] Loading state di semua halaman
- [ ] Empty state di semua halaman
- [ ] Error message yang jelas
- [ ] Toast notification
- [ ] Responsive di mobile
- [ ] Dark mode konsisten
- [ ] Tab navigation berfungsi
- [ ] Form validation

### Performance
- [ ] Build < 10 detik
- [ ] Page load < 3 detik
- [ ] API response < 500ms
- [ ] Bundle size < 500KB gzipped

### Security
- [ ] JWT token expiry
- [ ] Refresh token rotation
- [ ] Role-based access control
- [ ] Input sanitization
- [ ] SQL injection prevention
- [ ] XSS prevention

---

## 14. CARA MENJALANKAN

```bash
# Install
cd F:\project\aplikasi-event
npm run install:all

# Setup database
npm run setup

# Development
npm run dev

# Build production
npm run build

# Start production
npm run start
```

### Akun Default
| Email | Password | Role |
|---|---|---|
| admin@daniswara.com | password123 | Super Admin |
| event@daniswara.com | password123 | Admin Event |
| pic@daniswara.com | password123 | PIC Event |
| direksi@daniswara.com | password123 | Viewer/Direksi |

---

## 15. CATATAN TEKNIS

### Known Issues (to fix)
1. Rundown drag-and-drop belum berfungsi (perlu import react-beautiful-dnd)
2. File upload belum diimplementasi (multer sudah install)
3. Notification system belum ada
4. Offline support belum ada
5. Multi-user real-time belum ada

### Architecture Notes
- Backend: REST API dengan pattern CRUD factory untuk semua sub-resource
- Frontend: SPA dengan lazy loading per route
- Database: SQLite untuk dev, MySQL untuk production
- Auth: JWT access token (15 menit) + refresh token (7 hari)
- State: Zustand dengan persist middleware untuk auth
- AI: OpenAI-compatible API dengan fallback ke demo data

### Performance Targets
- API response: < 500ms (p95)
- Page load: < 3 detik (first contentful paint)
- Bundle size: < 500KB gzipped
- Database query: < 100ms (p95)
