import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Save,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Loader2,
  Check,
  Lightbulb,
  Target,
  FileText,
  Wand2,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import eventService from '../../services/eventService';
import aiService from '../../services/aiService';
import { eventTypes as eventTypesService } from '../../services/masterService';
import { EVENT_FORMATS, EVENT_TONES } from '../../utils/constants';
import { validateRequired } from '../../utils/validators';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import FormInput from '../../components/ui/FormInput';
import FormSelect from '../../components/ui/FormSelect';
import FormTextarea from '../../components/ui/FormTextarea';
import Drawer from '../../components/ui/Drawer';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import AIResultViewer from '../../components/ai/AIResultViewer';

const WIZARD_MODES = [
  {
    id: 'no_idea',
    icon: Lightbulb,
    title: 'Saya belum punya ide event',
    description: 'AI akan membantu membuat ide event dari nol berdasarkan kebutuhan perusahaan',
    color: 'blue',
  },
  {
    id: 'momentum',
    icon: Target,
    title: 'Punya momentum tapi belum konsep',
    description: 'AI akan mengembangkan momentum menjadi konsep event yang solid',
    color: 'green',
  },
  {
    id: 'rough_concept',
    icon: FileText,
    title: 'Sudah punya konsep kasar',
    description: 'AI akan memperkuat konsep Anda menjadi proposal lengkap',
    color: 'purple',
  },
  {
    id: 'full_proposal',
    icon: Wand2,
    title: 'Ingin membuat proposal lengkap',
    description: 'Langsung buat proposal event lengkap dengan semua komponen',
    color: 'red',
  },
];

const OUTPUT_OPTIONS = [
  { key: 'theme', label: 'Tema & Konsep' },
  { key: 'timeline', label: 'Timeline' },
  { key: 'rundown', label: 'Rundown' },
  { key: 'checklist', label: 'Checklist' },
  { key: 'budget', label: 'Anggaran' },
  { key: 'risks', label: 'Risiko' },
  { key: 'documents', label: 'Dokumen' },
];

const initialForm = {
  name: '',
  eventType: '',
  startDate: '',
  endDate: '',
  startTime: '',
  endTime: '',
  location: '',
  venue: '',
  format: 'offline',
  targetParticipants: '',
  targetAudience: '',
  goal: '',
  tone: '',
  budget: '',
  division: '',
  picMain: '',
  notes: '',
};

// Demo/fallback data when AI is not configured
function getDemoData(mode, form) {
  const eventName = form.name || 'Daniswara Team Building 2026';
  return {
    themes: [
      {
        theme_name: 'Sinergi Bangun Negeri',
        tagline: 'Bersama Membangun Masa Depan',
        philosophy: 'Menggambarkan semangat gotong royong dan kolaborasi dalam membangun Indonesia yang lebih baik, selaras dengan visi Daniswara Group.',
        visual_direction: 'Tema industrial modern dengan sentuhan warna konstruksi - biru baja, oranye keselamatan, abu-abu semen',
        dominant_colors: ['#1E40AF', '#EA580C', '#374151', '#F59E0B'],
        decoration_ideas: 'Dekorasi menggunakan elemen konstruksi seperti miniatur crane, hard hat, blueprint roll. Background stage dengan gradient industrial.',
      },
      {
        theme_name: 'GHANDOS Festival',
        tagline: 'Tumbuh Bersama, Hebat Bersama',
        philosophy: 'Perayaan nilai-nilai GHANDOS perusahaan melalui aktivitas interaktif dan menyenangkan.',
        visual_direction: 'Warna-warni ceria dengan ikon untuk setiap nilai GHANDOS',
        dominant_colors: ['#EF4444', '#22C55E', '#3B82F6', '#EAB308'],
        decoration_ideas: 'Wall of GHANDOS, interactive stations untuk setiap nilai, photo booth dengan props',
      },
      {
        theme_name: 'Road to 2029',
        tagline: 'Strategi menuju Visi 2029',
        philosophy: 'Event yang menghubungkan pencapaian masa lalu dengan target masa depan perusahaan.',
        visual_direction: 'Desain futuristik dengan timeline visual menuju 2029',
        dominant_colors: ['#6366F1', '#06B6D4', '#111827', '#F97316'],
        decoration_ideas: 'Timeline wall interaktif, milestone cards, target visualization',
      },
    ],
    timelines: [
      { phase: 'H-30', date: 'T-30 hari', activity: 'Kick-off meeting panitia', priority: 'high', risk_if_late: 'Keterlambatan perencanaan' },
      { phase: 'H-21', date: 'T-21 hari', activity: 'Finalisasi konsep dan tema', priority: 'high', risk_if_late: 'Tema tidak final' },
      { phase: 'H-14', date: 'T-14 hari', activity: 'Konfirmasi vendor dan tempat', priority: 'critical', risk_if_late: 'Ketersediaan tempat hilang' },
      { phase: 'H-7', date: 'T-7 hari', activity: 'Undangan dan koordinasi peserta', priority: 'high', risk_if_late: 'Peserta tidak hadir' },
      { phase: 'H-3', date: 'T-3 hari', activity: 'Technical rehearsal', priority: 'medium', risk_if_late: 'Masalah teknis di hari H' },
      { phase: 'H-1', date: 'T-1 hari', activity: 'Setup venue dan final check', priority: 'critical', risk_if_late: 'Event terganggu' },
    ],
    rundowns: [
      { start_time: '08:00', end_time: '08:30', duration: '30 menit', agenda: 'Registrasi & Welcome Coffee', activity_detail: 'Peserta datang, daftar ulang, nikmati welcome drink', technical_needs: 'Meja registrasi, name tag', mc_notes: 'Putar musik ambient' },
      { start_time: '08:30', end_time: '09:00', duration: '30 menit', agenda: 'Opening Ceremony', activity_detail: 'MC membuka acara, sambutan direktur utama', technical_needs: 'Mic, sound system, proyektor', mc_notes: 'Sambutan singkat dan energik' },
      { start_time: '09:00', end_time: '10:30', duration: '90 menit', agenda: 'Keynote & Presentasi', activity_detail: 'Evaluasi kinerja perusahaan dan roadmap 2029', technical_needs: 'Slide presentasi, laser pointer', mc_notes: 'Jaga ritme, antar sesi' },
      { start_time: '10:30', end_time: '11:00', duration: '30 menit', agenda: 'Coffee Break & Networking', activity_detail: 'Istirahat, foto bersama, kunjungan booth', technical_needs: 'Area coffee break', mc_notes: 'Putar musik ringan' },
      { start_time: '11:00', end_time: '12:30', duration: '90 menit', agenda: 'Team Building Activity', activity_detail: 'Games interaktif berbasis nilai GHANDOS', technical_needs: 'Sound system, props games', mc_notes: 'Jaga energi tinggi' },
      { start_time: '12:30', end_time: '13:30', duration: '60 menit', agenda: 'Lunch & Prayer', activity_detail: 'Makan siang bersama, sholat', technical_needs: 'Catering, area sholat', mc_notes: 'Istirahat total' },
      { start_time: '13:30', end_time: '15:00', duration: '90 menit', agenda: 'Workshop & Discussion', activity_detail: 'Breakout session per divisi', technical_needs: 'Ruang breakout, flipchart', mc_notes: 'Moderasi diskusi' },
      { start_time: '15:00', end_time: '16:00', duration: '60 menit', agenda: 'Awards & Closing', activity_detail: 'Penghargaan karyawan terbaik, penutupan', technical_needs: 'Trophy, backing vocal', mc_notes: 'Tutup dengan semangat' },
    ],
    checklists: [
      { category: 'Venue', item_name: 'Booking gedung', quantity: 1, priority: 'critical', estimated_cost: 15000000 },
      { category: 'Venue', item_name: 'Catering makan siang', quantity: 100, priority: 'high', estimated_cost: 25000000 },
      { category: 'Equipment', item_name: 'Sound system & projector', quantity: 1, priority: 'critical', estimated_cost: 5000000 },
      { category: 'Decoration', item_name: 'Dekorasi stage & venue', quantity: 1, priority: 'medium', estimated_cost: 8000000 },
      { category: 'Documentation', item_name: 'Fotografer & videografer', quantity: 1, priority: 'high', estimated_cost: 7000000 },
      { category: 'Transportation', item_name: 'Transport peserta', quantity: 1, priority: 'medium', estimated_cost: 5000000 },
      { category: 'Personnel', item_name: 'MC & host', quantity: 1, priority: 'high', estimated_cost: 3000000 },
    ],
    budgets: [
      { category: 'Venue', item: 'Sewa gedung', quantity: 1, unit_price: 15000000, total_price: 15000000, priority: 'critical', saving_alternative: 'Gunakan kantor sendiri' },
      { category: 'Catering', item: 'Paket makan siang', quantity: 100, unit_price: 75000, total_price: 7500000, priority: 'high', saving_alternative: 'Buffet prasmanan' },
      { category: 'Equipment', item: 'Sewa sound & projector', quantity: 1, unit_price: 5000000, total_price: 5000000, priority: 'critical', saving_alternative: '-' },
      { category: 'Decoration', item: 'Dekorasi venue', quantity: 1, unit_price: 8000000, total_price: 8000000, priority: 'medium', saving_alternative: 'DIY decoration' },
      { category: 'Documentation', item: 'Foto & video', quantity: 1, unit_price: 7000000, total_price: 7000000, priority: 'high', saving_alternative: '-' },
      { category: 'Transport', item: 'Bus/transport', quantity: 2, unit_price: 2500000, total_price: 5000000, priority: 'medium', saving_alternative: 'Carpooling' },
      { category: 'Personnel', item: 'MC & entertainment', quantity: 1, unit_price: 5000000, total_price: 5000000, priority: 'high', saving_alternative: 'MC internal' },
      { category: 'Miscellaneous', item: 'Door prize & merchandise', quantity: 1, unit_price: 5000000, total_price: 5000000, priority: 'low', saving_alternative: 'Kurangi jumlah' },
    ],
    risks: [
      { risk: 'Cuaca buruk (untuk event outdoor)', impact: 'Tinggi', probability: 'Sedang', backup_plan: 'Siapkan indoor backup venue', status: 'identified' },
      { risk: 'Peserta tidak hadir', impact: 'Sedang', probability: 'Sedang', backup_plan: 'Konfirmasi H-3, follow-up via WA', status: 'identified' },
      { risk: 'Kerusakan equipment', impact: 'Tinggi', probability: 'Rendah', backup_plan: 'Backup equipment dari vendor', status: 'identified' },
      { risk: 'Budget melebihi anggaran', impact: 'Tinggi', probability: 'Sedang', backup_plan: 'Monitor pengeluaran real-time', status: 'identified' },
      { risk: 'Masalah teknis (audio/visual)', impact: 'Sedang', probability: 'Rendah', backup_plan: 'Technical rehearsal H-3', status: 'identified' },
    ],
    documents: [
      { doc_type: 'proposal', title: 'Proposal Event', content: `PROPOSAL EVENT\n\nNama: ${eventName}\nTanggal: ${form.startDate || 'TBD'}\nLokasi: ${form.location || 'TBD'}\n\nTujuan: ${form.goal || 'Memperkuat sinergi tim dan mencapai visi perusahaan 2029'}\n\nKesesuaian Nilai GHANDOS:\n- Growth: Pertumbuhan tim melalui workshop\n- Harmony: Kolaborasi lintas divisi\n- Adaptif: Beradaptasi dengan tantangan baru\n- New: Inovasi dalam pendekatan kerja\n- Determination: Semangat mencapai target\n- Optimistis: Melihat masa depan positif\n- Social: Manfaat untuk sesama` },
    ],
  };
}

/**
 * Detect whether AI results use the new comprehensive format or the old format.
 * New format has keys like: event_identity, idea_options, theme_philosophy, committee, etc.
 * Old format has keys like: themes, timelines, rundowns, checklists, budgets, risks, documents.
 */
function isNewAiFormat(results) {
  if (!results || typeof results !== 'object') return false;
  return (
    results.event_identity ||
    results.idea_options ||
    results.theme_philosophy ||
    results.recommended_concept ||
    results.committee ||
    results.rundown ||
    results.equipment_needs ||
    results.budget_summary ||
    results.materials_content ||
    results.post_event_outputs ||
    results.final_recommendation
  );
}

/**
 * Save AI results to database sub-resources.
 * Handles both old format (themes, timelines, rundowns, etc.) and
 * new comprehensive format (event_identity, idea_options, theme_philosophy, etc.)
 */
async function saveAiResultsToDb(eventId, aiResults, eventService, subService) {
  if (!aiResults) return;

  const isNewFormat = isNewAiFormat(aiResults);

  if (isNewFormat) {
    await saveNewFormatResults(eventId, aiResults, subService);
  } else {
    await saveOldFormatResults(eventId, aiResults, subService);
  }
}

/**
 * Save old-format AI results (themes, timelines, rundowns, checklists, budgets, risks, documents)
 */
async function saveOldFormatResults(eventId, results, subService) {
  // Save themes
  if (results.themes && Array.isArray(results.themes)) {
    for (let i = 0; i < results.themes.length; i++) {
      const theme = results.themes[i];
      try {
        await subService.themes.create(eventId, {
          theme_name: theme.theme_name,
          tagline: theme.tagline,
          philosophy: theme.philosophy,
          visual_direction: theme.visual_direction,
          dominant_colors: theme.dominant_colors,
          decoration_ideas: theme.decoration_ideas,
          is_selected: i === 0, // Select first theme by default
        });
      } catch { /* skip */ }
    }
  }

  // Save timelines
  if (results.timelines && Array.isArray(results.timelines)) {
    for (let i = 0; i < results.timelines.length; i++) {
      const t = results.timelines[i];
      try {
        await subService.timelines.create(eventId, {
          phase: t.phase,
          date: t.date,
          activity: t.activity,
          deadline: t.deadline || t.date,
          priority: t.priority || 'medium',
          risk_if_late: t.risk_if_late,
          sort_order: i,
          status: 'not_started',
        });
      } catch { /* skip */ }
    }
  }

  // Save rundowns
  if (results.rundowns && Array.isArray(results.rundowns)) {
    for (let i = 0; i < results.rundowns.length; i++) {
      const r = results.rundowns[i];
      try {
        await subService.rundowns.create(eventId, {
          start_time: r.start_time,
          end_time: r.end_time,
          duration: r.duration,
          agenda: r.agenda,
          activity_detail: r.activity_detail,
          technical_needs: r.technical_needs,
          mc_notes: r.mc_notes,
          expected_output: r.expected_output,
          sort_order: i,
        });
      } catch { /* skip */ }
    }
  }

  // Save checklists
  if (results.checklists && Array.isArray(results.checklists)) {
    for (let i = 0; i < results.checklists.length; i++) {
      const c = results.checklists[i];
      try {
        await subService.checklists.create(eventId, {
          category: c.category,
          item_name: c.item_name,
          quantity: c.quantity || 1,
          priority: c.priority || 'medium',
          deadline: c.deadline,
          estimated_cost: c.estimated_cost || 0,
          sort_order: i,
          status: 'not_started',
        });
      } catch { /* skip */ }
    }
  }

  // Save budgets
  if (results.budgets && Array.isArray(results.budgets)) {
    for (let i = 0; i < results.budgets.length; i++) {
      const b = results.budgets[i];
      try {
        await subService.budgets.create(eventId, {
          category: b.category,
          item: b.item,
          quantity: b.quantity || 1,
          unit_price: b.unit_price || 0,
          total_price: b.total_price || 0,
          priority: b.priority || 'medium',
          saving_alternative: b.saving_alternative,
          sort_order: i,
        });
      } catch { /* skip */ }
    }
  }

  // Save risks
  if (results.risks && Array.isArray(results.risks)) {
    for (const r of results.risks) {
      try {
        await subService.risks.create(eventId, {
          risk: r.risk,
          impact: r.impact,
          probability: r.probability,
          backup_plan: r.backup_plan,
          status: r.status || 'identified',
        });
      } catch { /* skip */ }
    }
  }

  // Save documents
  if (results.documents && Array.isArray(results.documents)) {
    for (const d of results.documents) {
      try {
        await subService.documents.create(eventId, {
          title: d.title || 'Dokumen AI',
          doc_type: d.doc_type || 'proposal',
          content: d.content,
          status: 'draft',
        });
      } catch { /* skip */ }
    }
  }
}

/**
 * Save new comprehensive format AI results.
 * Maps each section to the appropriate database table.
 */
async function saveNewFormatResults(eventId, results, subService) {
  // 1. event_identity → Already saved as Event record, but update with additional fields if available
  // (Event record is created before this function is called)

  // 2. theme_philosophy → EventTheme
  if (results.theme_philosophy) {
    const tp = results.theme_philosophy;
    try {
      const themeData = {
        theme_name: tp.theme_name || tp.name || 'Tema Event',
        tagline: tp.tagline || '',
        philosophy: tp.philosophy || tp.description || '',
        visual_direction: tp.visual_direction || '',
        dominant_colors: tp.dominant_colors || [],
        decoration_ideas: tp.decoration_ideas || '',
        is_selected: true,
      };
      await subService.themes.create(eventId, themeData);
    } catch { /* skip */ }
  }

  // Also save recommended_concept as a theme if it has theme-like data
  if (results.recommended_concept) {
    const rc = results.recommended_concept;
    if (rc.theme_name || rc.tagline || rc.concept_name) {
      try {
        await subService.themes.create(eventId, {
          theme_name: rc.theme_name || rc.concept_name || rc.title || 'Konsep Rekomendasi',
          tagline: rc.tagline || '',
          philosophy: rc.philosophy || rc.description || rc.rationale || '',
          visual_direction: rc.visual_direction || '',
          dominant_colors: rc.dominant_colors || [],
          decoration_ideas: rc.decoration_ideas || '',
          is_selected: false,
        });
      } catch { /* skip */ }
    }
  }

  // 3. idea_options → Save as EventDocument (all 35 ideas as a comprehensive document)
  if (results.idea_options && Array.isArray(results.idea_options) && results.idea_options.length > 0) {
    try {
      const ideasContent = results.idea_options.map((idea, idx) => {
        const num = idx + 1;
        const parts = [`Ide ${num}: ${idea.title || idea.name || idea.concept || `Idea ${num}`}`];
        if (idea.description) parts.push(`  Deskripsi: ${idea.description}`);
        if (idea.theme) parts.push(`  Tema: ${idea.theme}`);
        if (idea.tagline) parts.push(`  Tagline: ${idea.tagline}`);
        if (idea.concept) parts.push(`  Konsep: ${idea.concept}`);
        if (idea.philosophy) parts.push(`  Filosofi: ${idea.philosophy}`);
        if (idea.unique_selling_point) parts.push(`  Keunikan: ${idea.unique_selling_point}`);
        if (idea.budget_estimate) parts.push(`  Estimasi Budget: ${idea.budget_estimate}`);
        if (idea.suitability_score) parts.push(`  Skor Kesesuaian: ${idea.suitability_score}`);
        if (idea.notes) parts.push(`  Catatan: ${idea.notes}`);
        return parts.join('\n');
      }).join('\n\n');

      const recommendedIdx = results.recommended_concept
        ? (results.recommended_concept.selected_index || results.recommended_concept.index || 0)
        : 0;

      const header = `PILIHAN KONSEP EVENT (${results.idea_options.length} Ide)\n` +
        `Konsep Rekomendasi: Ide ke-${recommendedIdx + 1}\n` +
        `${'='.repeat(60)}\n\n`;

      await subService.documents.create(eventId, {
        title: `Ide-ide Konsep Event (${results.idea_options.length} Pilihan)`,
        doc_type: 'proposal',
        content: header + ideasContent,
        status: 'draft',
      });
    } catch { /* skip */ }
  }

  // 4. background → EventDocument
  if (results.background) {
    try {
      const content = typeof results.background === 'string'
        ? results.background
        : JSON.stringify(results.background, null, 2);
      await subService.documents.create(eventId, {
        title: 'Latar Belakang Event',
        doc_type: 'proposal',
        content,
        status: 'draft',
      });
    } catch { /* skip */ }
  }

  // 5. objectives → Update Event.goal + save as EventDocument
  if (results.objectives) {
    try {
      const content = typeof results.objectives === 'string'
        ? results.objectives
        : JSON.stringify(results.objectives, null, 2);
      await subService.documents.create(eventId, {
        title: 'Tujuan & Objektif Event',
        doc_type: 'proposal',
        content,
        status: 'draft',
      });
    } catch { /* skip */ }
  }

  // 6. concept → EventDocument
  if (results.concept) {
    try {
      const content = typeof results.concept === 'string'
        ? results.concept
        : JSON.stringify(results.concept, null, 2);
      await subService.documents.create(eventId, {
        title: 'Konsep Event',
        doc_type: 'proposal',
        content,
        status: 'draft',
      });
    } catch { /* skip */ }
  }

  // 7. participant_targets → EventDocument
  if (results.participant_targets && Array.isArray(results.participant_targets) && results.participant_targets.length > 0) {
    try {
      const content = results.participant_targets.map((pt, idx) => {
        const parts = [`Target ${idx + 1}:`];
        if (pt.category || pt.type) parts.push(`  Kategori: ${pt.category || pt.type}`);
        if (pt.count || pt.number || pt.quantity) parts.push(`  Jumlah: ${pt.count || pt.number || pt.quantity}`);
        if (pt.description) parts.push(`  Deskripsi: ${pt.description}`);
        if (pt.characteristics) parts.push(`  Karakteristik: ${pt.characteristics}`);
        return parts.join('\n');
      }).join('\n\n');

      await subService.documents.create(eventId, {
        title: 'Target Peserta',
        doc_type: 'proposal',
        content,
        status: 'draft',
      });
    } catch { /* skip */ }
  }

  // 8. benefits → EventDocument
  if (results.benefits) {
    try {
      const content = typeof results.benefits === 'string'
        ? results.benefits
        : JSON.stringify(results.benefits, null, 2);
      await subService.documents.create(eventId, {
        title: 'Manfaat Event',
        doc_type: 'proposal',
        content,
        status: 'draft',
      });
    } catch { /* skip */ }
  }

  // 9. key_messages → EventDocument
  if (results.key_messages && Array.isArray(results.key_messages) && results.key_messages.length > 0) {
    try {
      const content = results.key_messages.map((msg, idx) => `${idx + 1}. ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`).join('\n');
      await subService.documents.create(eventId, {
        title: 'Pesan Kunci Event',
        doc_type: 'proposal',
        content,
        status: 'draft',
      });
    } catch { /* skip */ }
  }

  // 10. committee → EventDocument (since EventTask requires pic_id which we don't have from AI)
  if (results.committee && Array.isArray(results.committee) && results.committee.length > 0) {
    try {
      const content = results.committee.map((c, idx) => {
        const parts = [`Posisi ${idx + 1}: ${c.position || c.role || c.title || `Panitia ${idx + 1}`}`];
        if (c.name) parts.push(`  Nama: ${c.name}`);
        if (c.tugas_utama || c.main_task || c.responsibilities) parts.push(`  Tugas Utama: ${c.tugas_utama || c.main_task || c.responsibilities}`);
        if (c.deadline) parts.push(`  Deadline: ${c.deadline}`);
        if (c.description) parts.push(`  Deskripsi: ${c.description}`);
        return parts.join('\n');
      }).join('\n\n');

      await subService.documents.create(eventId, {
        title: 'Susunan Panitia Event',
        doc_type: 'proposal',
        content,
        status: 'draft',
      });
    } catch { /* skip */ }
  }

  // 11. timeline → EventTimeline
  if (results.timeline && Array.isArray(results.timeline)) {
    for (let i = 0; i < results.timeline.length; i++) {
      const t = results.timeline[i];
      try {
        await subService.timelines.create(eventId, {
          phase: t.phase || t.milestone || `Phase ${i + 1}`,
          date: t.date,
          activity: t.activity || t.title || t.description || '',
          deadline: t.deadline || t.date,
          priority: t.priority || 'medium',
          risk_if_late: t.risk_if_late || t.risk || '',
          sort_order: i,
          status: 'not_started',
        });
      } catch { /* skip */ }
    }
  }

  // 12. rundown → EventRundown
  if (results.rundown && Array.isArray(results.rundown)) {
    for (let i = 0; i < results.rundown.length; i++) {
      const r = results.rundown[i];
      try {
        await subService.rundowns.create(eventId, {
          start_time: r.start_time,
          end_time: r.end_time,
          duration: r.duration,
          agenda: r.agenda || r.title || r.activity || '',
          activity_detail: r.activity_detail || r.description || r.detail || '',
          technical_needs: r.technical_needs || r.equipment || '',
          mc_notes: r.mc_notes || r.notes || '',
          expected_output: r.expected_output || r.output || '',
          sort_order: i,
        });
      } catch { /* skip */ }
    }
  }

  // 13. equipment_needs → EventChecklist (category='Peralatan')
  if (results.equipment_needs && Array.isArray(results.equipment_needs)) {
    for (let i = 0; i < results.equipment_needs.length; i++) {
      const eq = results.equipment_needs[i];
      try {
        await subService.checklists.create(eventId, {
          category: 'Peralatan',
          item_name: eq.name || eq.item || eq.equipment || `Peralatan ${i + 1}`,
          quantity: eq.quantity || eq.qty || 1,
          priority: eq.priority || 'medium',
          deadline: eq.deadline,
          estimated_cost: eq.estimated_cost || eq.cost || eq.price || 0,
          sort_order: i,
          status: 'not_started',
          notes: eq.notes || eq.specification || eq.description || '',
        });
      } catch { /* skip */ }
    }
  }

  // 14. budget → EventBudget
  if (results.budget && Array.isArray(results.budget)) {
    for (let i = 0; i < results.budget.length; i++) {
      const b = results.budget[i];
      try {
        await subService.budgets.create(eventId, {
          category: b.category || b.group || 'Lainnya',
          item: b.item || b.name || b.description || `Item ${i + 1}`,
          quantity: b.quantity || b.qty || 1,
          unit_price: b.unit_price || b.unit_cost || b.price || 0,
          total_price: b.total_price || b.total || b.plannedCost || 0,
          priority: b.priority || 'medium',
          saving_alternative: b.saving_alternative || b.alternative || '',
          notes: b.notes || b.description || '',
          sort_order: i,
        });
      } catch { /* skip */ }
    }
  }

  // 15. budget_summary → EventDocument (store as reference document)
  if (results.budget_summary) {
    try {
      const bs = results.budget_summary;
      const lines = ['RINGKASAN ANGGARAN EVENT', '='.repeat(40), ''];
      if (bs.total_estimated || bs.total) lines.push(`Total Estimasi: Rp ${(bs.total_estimated || bs.total || 0).toLocaleString('id-ID')}`);
      if (bs.total_actual) lines.push(`Total Aktual: Rp ${bs.total_actual.toLocaleString('id-ID')}`);
      if (bs.remaining !== undefined) lines.push(`Sisa Budget: Rp ${bs.remaining.toLocaleString('id-ID')}`);
      if (bs.budget_max) lines.push(`Budget Maksimal: Rp ${bs.budget_max.toLocaleString('id-ID')}`);
      if (bs.by_category && typeof bs.by_category === 'object') {
        lines.push('', 'Rincian per Kategori:');
        Object.entries(bs.by_category).forEach(([cat, data]) => {
          lines.push(`  ${cat}: Rp ${(data.estimated || data.total || 0).toLocaleString('id-ID')}`);
        });
      }
      if (bs.summary) lines.push('', bs.summary);

      await subService.documents.create(eventId, {
        title: 'Ringkasan Anggaran',
        doc_type: 'proposal',
        content: lines.join('\n'),
        status: 'draft',
      });
    } catch { /* skip */ }
  }

  // 16. materials_content → EventDocument
  if (results.materials_content && Array.isArray(results.materials_content) && results.materials_content.length > 0) {
    try {
      const content = results.materials_content.map((m, idx) => {
        const parts = [`Materi ${idx + 1}: ${m.title || m.name || `Materi ${idx + 1}`}`];
        if (m.content || m.description) parts.push(`  Isi: ${m.content || m.description}`);
        if (m.type) parts.push(`  Tipe: ${m.type}`);
        if (m.format) parts.push(`  Format: ${m.format}`);
        if (m.speaker || m.presenter) parts.push(`  Pembicara: ${m.speaker || m.presenter}`);
        return parts.join('\n');
      }).join('\n\n');

      await subService.documents.create(eventId, {
        title: 'Materi & Konten Event',
        doc_type: 'proposal',
        content,
        status: 'draft',
      });
    } catch { /* skip */ }
  }

  // 17. post_event_outputs → EventDocument
  if (results.post_event_outputs && Array.isArray(results.post_event_outputs) && results.post_event_outputs.length > 0) {
    try {
      const content = results.post_event_outputs.map((o, idx) => {
        const parts = [`Output ${idx + 1}: ${o.title || o.name || o.type || `Output ${idx + 1}`}`];
        if (o.description) parts.push(`  Deskripsi: ${o.description}`);
        if (o.deadline) parts.push(`  Deadline: ${o.deadline}`);
        if (o.responsible) parts.push(`  Penanggung Jawab: ${o.responsible}`);
        return parts.join('\n');
      }).join('\n\n');

      await subService.documents.create(eventId, {
        title: 'Output Pasca Event',
        doc_type: 'report',
        content,
        status: 'draft',
      });
    } catch { /* skip */ }
  }

  // 18. risks → RiskBackupPlan
  if (results.risks && Array.isArray(results.risks)) {
    for (const r of results.risks) {
      try {
        await subService.risks.create(eventId, {
          risk: r.risk || r.name || r.description || 'Risiko',
          impact: r.impact || r.severity || '',
          probability: r.probability || r.likelihood || '',
          backup_plan: r.backup_plan || r.mitigation || r.contingency || '',
          status: r.status || 'identified',
        });
      } catch { /* skip */ }
    }
  }

  // 19. checklists → EventChecklist
  if (results.checklists && Array.isArray(results.checklists)) {
    for (let i = 0; i < results.checklists.length; i++) {
      const c = results.checklists[i];
      try {
        await subService.checklists.create(eventId, {
          category: c.category || 'General',
          item_name: c.item_name || c.item || c.name || `Item ${i + 1}`,
          quantity: c.quantity || c.qty || 1,
          priority: c.priority || 'medium',
          deadline: c.deadline,
          estimated_cost: c.estimated_cost || c.cost || 0,
          sort_order: i,
          status: 'not_started',
        });
      } catch { /* skip */ }
    }
  }

  // 20. final_recommendation → EventDocument
  if (results.final_recommendation) {
    try {
      const fr = results.final_recommendation;
      const content = typeof fr === 'string'
        ? fr
        : JSON.stringify(fr, null, 2);
      await subService.documents.create(eventId, {
        title: 'Rekomendasi Akhir AI',
        doc_type: 'proposal',
        content,
        status: 'draft',
      });
    } catch { /* skip */ }
  }
}

export default function EventCreateAIPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: mode, 2: form, 3: generate, 4: review
  const [selectedMode, setSelectedMode] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [eventTypeOptions, setEventTypeOptions] = useState([]);
  const [aiResults, setAiResults] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [outputs, setOutputs] = useState(
    OUTPUT_OPTIONS.reduce((acc, opt) => ({ ...acc, [opt.key]: true }), {})
  );
  const [generating, setGenerating] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(true);

  useEffect(() => {
    eventTypesService
      .list()
      .then((res) => {
        const list = res.data.data;
        setEventTypeOptions(
          (Array.isArray(list) ? list : []).map((t) => ({
            value: t.id || t._id,
            label: t.name,
          }))
        );
      })
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const toggleOutput = (key) => {
    setOutputs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const validateForm = () => {
    const errs = {};
    if (!form.name?.trim()) errs.name = 'Nama Event wajib diisi';
    if (!form.startDate) errs.startDate = 'Tanggal Mulai wajib diisi';
    return errs;
  };

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
    setStep(2);
  };

  const handleNextStep = () => {
    if (step === 2) {
      const errs = validateForm();
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        return;
      }
      setStep(3);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const payload = {
        ...form,
        outputs: Object.keys(outputs).filter((k) => outputs[k]),
        mode: selectedMode,
      };
      if (payload.targetParticipants) payload.targetParticipants = Number(payload.targetParticipants);
      if (payload.budget) payload.budget = Number(payload.budget);

      const res = await aiService.generateEvent(payload);
      setAiResults(res.data.data);
      setShowDrawer(true);
      toast.success('AI selesai membuat perencanaan');
    } catch (err) {
      // Check if it's an AI configuration error - fallback to demo mode
      const msg = err.response?.data?.message || '';
      if (msg.includes('Pengaturan AI') || msg.includes('api_key') || msg.includes('API key') || msg.includes('koneksi')) {
        toast('AI belum dikonfigurasi. Menggunakan Mode Demo.', { icon: '⚠️' });
        setAiAvailable(false);
        setAiResults(getDemoData(selectedMode, form));
        setShowDrawer(true);
      } else {
        toast.error(msg || 'Gagal generate dengan AI');
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveAll = async () => {
    setLoading(true);
    try {
      // Build event payload - merge form data with AI event_identity if available
      const eventIdentity = aiResults?.event_identity || {};
      const payload = {
        name: form.name || eventIdentity.name || eventIdentity.event_name || '',
        event_type_id: form.eventType || null,
        event_date: form.startDate || eventIdentity.event_date || '',
        start_time: form.startTime || eventIdentity.start_time || '09:00',
        end_time: form.endTime || eventIdentity.end_time || '17:00',
        location: form.location || eventIdentity.location || '',
        venue: form.venue || eventIdentity.venue || '',
        format: form.format || eventIdentity.format || eventIdentity.event_format || 'offline',
        estimated_participants: form.targetParticipants
          ? Number(form.targetParticipants)
          : eventIdentity.estimated_participants || eventIdentity.participant_count || null,
        goal: form.goal || eventIdentity.goal || eventIdentity.event_goal || '',
        tone: form.tone || eventIdentity.tone || 'formal',
        budget_max: form.budget
          ? Number(form.budget)
          : eventIdentity.budget_max || eventIdentity.budget || null,
        division: form.division || eventIdentity.division || '',
        notes: form.notes || eventIdentity.notes || '',
        status: 'draft',
      };

      const eventRes = await eventService.create(payload);
      const eventId = eventRes.data.data.id || eventRes.data.data._id;

      // Save AI results as sub-resources
      if (aiResults) {
        const subService = await import('../../services/eventSubService');
        await saveAiResultsToDb(eventId, aiResults, eventService, subService);
      }

      toast.success('Event dan hasil AI berhasil disimpan');
      navigate(`/events/${eventId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setLoading(false);
    }
  };

  const formatOptions = Object.entries(EVENT_FORMATS).map(([k, v]) => ({ value: k, label: v }));
  const toneOptions = Object.entries(EVENT_TONES).map(([k, v]) => ({ value: k, label: v }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center gap-2 text-sm">
        {['Pilih Mode', 'Isi Data', 'Generate', 'Review'].map((label, idx) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              step > idx + 1 ? 'bg-green-500 text-white' :
              step === idx + 1 ? 'bg-brand-600 text-white' :
              'bg-gray-200 text-gray-500'
            }`}>
              {step > idx + 1 ? <Check size={14} /> : idx + 1}
            </div>
            <span className={step === idx + 1 ? 'font-semibold text-dark-900' : 'text-dark-400'}>
              {label}
            </span>
            {idx < 3 && <div className="w-8 h-px bg-gray-300 mx-1" />}
          </div>
        ))}
      </div>

      {/* Step 1: Mode Selection */}
      {step === 1 && (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-dark-900">Buat Event dengan AI</h1>
          <p className="text-dark-500">Pilih mode yang sesuai dengan kondisi Anda saat ini:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {WIZARD_MODES.map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  onClick={() => handleModeSelect(mode.id)}
                  className={`p-6 rounded-xl border-2 text-left transition-all hover:shadow-lg ${
                    selectedMode === mode.id
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                    mode.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                    mode.color === 'green' ? 'bg-green-100 text-green-600' :
                    mode.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="font-semibold text-dark-900 mb-1">{mode.title}</h3>
                  <p className="text-sm text-dark-500">{mode.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Form */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-dark-900">Informasi Event</h1>
            <Button variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft size={16} className="mr-1" /> Kembali
            </Button>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <Card>
              <h2 className="text-lg font-semibold text-dark-900 mb-4">Informasi Dasar</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Nama Event"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  error={errors.name}
                  required
                  placeholder="Nama event"
                />
                <FormSelect
                  label="Tipe Event"
                  name="eventType"
                  value={form.eventType}
                  onChange={handleChange}
                  options={eventTypeOptions}
                  placeholder="Pilih tipe event"
                />
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-dark-900 mb-4">Waktu & Lokasi</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Tanggal Mulai" name="startDate" type="date" value={form.startDate} onChange={handleChange} error={errors.startDate} required />
                <FormInput label="Tanggal Selesai" name="endDate" type="date" value={form.endDate} onChange={handleChange} />
                <FormInput label="Jam Mulai" name="startTime" type="time" value={form.startTime} onChange={handleChange} />
                <FormInput label="Jam Selesai" name="endTime" type="time" value={form.endTime} onChange={handleChange} />
                <FormInput label="Lokasi" name="location" value={form.location} onChange={handleChange} placeholder="Kota / wilayah" />
                <FormInput label="Venue" name="venue" value={form.venue} onChange={handleChange} placeholder="Nama gedung / tempat" />
                <FormSelect label="Format" name="format" value={form.format} onChange={handleChange} options={formatOptions} />
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-dark-900 mb-4">Detail Event</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Target Peserta" name="targetParticipants" type="number" value={form.targetParticipants} onChange={handleChange} placeholder="Jumlah peserta" />
                <FormSelect label="Tone Acara" name="tone" value={form.tone} onChange={handleChange} options={toneOptions} placeholder="Pilih tone" />
                <FormTextarea label="Target Audiens" name="targetAudience" value={form.targetAudience} onChange={handleChange} placeholder="Siapa yang menjadi target peserta" className="md:col-span-2" />
                <FormTextarea label="Tujuan Event" name="goal" value={form.goal} onChange={handleChange} placeholder="Tujuan dari event ini" className="md:col-span-2" />
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-dark-900 mb-4">Penanggung Jawab & Budget</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Divisi" name="division" value={form.division} onChange={handleChange} placeholder="Divisi penanggung jawab" />
                <FormInput label="PIC Utama" name="picMain" value={form.picMain} onChange={handleChange} placeholder="Nama PIC" />
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1.5">Budget (Rp)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-400 text-sm">Rp</span>
                    <input
                      name="budget"
                      type="number"
                      value={form.budget}
                      onChange={handleChange}
                      placeholder="0"
                      className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm text-dark-900 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-dark-900 mb-4">Catatan</h2>
              <FormTextarea name="notes" value={form.notes} onChange={handleChange} placeholder="Catatan tambahan..." rows={4} />
            </Card>

            <div className="flex justify-end">
              <Button variant="primary" type="button" size="lg" onClick={handleNextStep}>
                Selanjutnya <ArrowRight size={16} className="ml-1" />
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Step 3: Generate */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-dark-900">Generate dengan AI</h1>
            <Button variant="outline" onClick={() => setStep(2)}>
              <ArrowLeft size={16} className="mr-1" /> Kembali
            </Button>
          </div>

          <Card>
            <h2 className="text-lg font-semibold text-dark-900 mb-4">Output yang Ingin Dibuat</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {OUTPUT_OPTIONS.map((opt) => (
                <label
                  key={opt.key}
                  className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                    outputs[opt.key]
                      ? 'border-brand-300 bg-brand-50 text-brand-700'
                      : 'border-gray-200 bg-white text-dark-600 hover:bg-gray-50'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                      outputs[opt.key]
                        ? 'bg-brand-600 border-brand-600 text-white'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {outputs[opt.key] && <Check size={12} />}
                  </div>
                  <span className="text-sm font-medium">{opt.label}</span>
                </label>
              ))}
            </div>
          </Card>

          {/* Summary */}
          <Card>
            <h2 className="text-lg font-semibold text-dark-900 mb-3">Ringkasan</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-dark-400">Mode:</span> <span className="font-medium">{WIZARD_MODES.find(m => m.id === selectedMode)?.title}</span></div>
              <div><span className="text-dark-400">Nama:</span> <span className="font-medium">{form.name}</span></div>
              <div><span className="text-dark-400">Tanggal:</span> <span className="font-medium">{form.startDate || 'TBD'}</span></div>
              <div><span className="text-dark-400">Lokasi:</span> <span className="font-medium">{form.location || 'TBD'}</span></div>
            </div>
          </Card>

          {!aiAvailable && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-sm text-yellow-700">
              <AlertTriangle size={16} />
              AI belum dikonfigurasi. Aplikasi akan menggunakan <strong>Mode Demo</strong> dengan data sampel.
            </div>
          )}

          <div className="flex justify-center">
            <Button
              variant="primary"
              type="button"
              size="lg"
              loading={generating}
              icon={generating ? <Loader2 className="animate-spin" /> : <Sparkles />}
              onClick={handleGenerate}
              className="min-w-[250px]"
            >
              {generating ? 'Menggenerate...' : 'Generate dengan AI'}
            </Button>
          </div>
        </div>
      )}

      {/* Generating Overlay */}
      {generating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center gap-4 max-w-sm">
            <LoadingSpinner size="lg" />
            <p className="text-dark-900 font-medium text-center">AI sedang membuat perencanaan event...</p>
            <p className="text-sm text-dark-400 text-center">Ini mungkin memakan waktu 30-60 detik</p>
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-brand-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-brand-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-brand-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}

      {/* Results Drawer */}
      <Drawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        title={aiAvailable ? 'Hasil Generate AI' : 'Mode Demo — Data Sampel'}
        size="xl"
      >
        {aiResults && (
          <div className="space-y-4">
            {!aiAvailable && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-700">
                <AlertTriangle size={16} />
                Ini adalah data demo. Konfigurasikan API key AI untuk hasil yang lebih sesuai dengan kebutuhan Anda.
              </div>
            )}
            <AIResultViewer
              results={aiResults}
              eventData={form}
              onSave={handleSaveAll}
              onRegenerate={handleGenerate}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
}
