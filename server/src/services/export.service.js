import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, HeadingLevel, BorderStyle, ShadingType,
  Header, Footer, PageNumber, NumberFormat, TabStopType, TabStopPosition,
} from 'docx';
import { format } from 'date-fns';

const COLORS = {
  primary: 'DC2626',
  dark: '111827',
  gray: '6B7280',
  lightGray: 'F3F4F6',
  white: 'FFFFFF',
  green: '16A34A',
  yellow: 'EAB308',
  red: 'EF4444',
};

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({ text, heading: level, spacing: { before: 300, after: 100 } });
}

function subHeading(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 80 },
    border: { bottom: { color: COLORS.primary, space: 4, style: BorderStyle.SINGLE, size: 2 } },
  });
}

function para(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text: String(text || '-'), ...opts })],
    spacing: { after: 60 },
  });
}

function bold(label, value) {
  return new Paragraph({
    children: [
      new TextRun({ text: label, bold: true }),
      new TextRun({ text: String(value || '-') }),
    ],
    spacing: { after: 40 },
  });
}

function bullet(text) {
  return new Paragraph({
    children: [new TextRun({ text: `• ${text}` })],
    spacing: { after: 30 },
    indent: { left: 400 },
  });
}

function emptyLine() {
  return new Paragraph({ text: '', spacing: { after: 80 } });
}

function makeTable(headers, rows) {
  const headerRow = new TableRow({
    children: headers.map(h => new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: COLORS.white, size: 20 })] })],
      shading: { type: ShadingType.SOLID, color: COLORS.primary },
      width: { size: Math.floor(100 / headers.length), type: WidthType.PERCENTAGE },
    })),
  });

  const dataRows = rows.map(row => new TableRow({
    children: row.map(cell => new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: String(cell || '-'), size: 20 })] })],
      width: { size: Math.floor(100 / headers.length), type: WidthType.PERCENTAGE },
    })),
  }));

  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}

function separator() {
  return new Paragraph({
    border: { bottom: { color: 'D1D5DB', space: 4, style: BorderStyle.SINGLE, size: 1 } },
    spacing: { before: 200, after: 200 },
  });
}

export function generateEventDocument(eventData, aiResult) {
  const sections = [];
  const today = format(new Date(), 'dd MMMM yyyy', { locale: undefined });

  // ═══════ COVER PAGE ═══════
  sections.push(
    emptyLine(), emptyLine(), emptyLine(),
    new Paragraph({ text: 'PT DANISWARA', alignment: AlignmentType.CENTER, spacing: { after: 100 } }),
    new Paragraph({ text: 'Jl. Contoh No. 123, Jakarta Selatan', alignment: AlignmentType.CENTER, spacing: { after: 20 }, color: COLORS.gray }),
    emptyLine(), emptyLine(),
    new Paragraph({
      text: 'DOKUMEN PERENCANAAN EVENT',
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.TITLE,
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: eventData.event_name || aiResult?.event_brief?.event_name || 'Event',
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.HEADING_1,
      color: COLORS.primary,
      spacing: { after: 300 },
    }),
    separator(),
    bold('Jenis Event : ', eventData.event_type || aiResult?.event_brief?.event_type || '-'),
    bold('Tanggal     : ', eventData.event_date || '-'),
    bold('Lokasi      : ', eventData.location || '-'),
    bold('Peserta     : ', `${eventData.participant_count || '-'} orang`),
    bold('Budget      : ', `Rp ${Number(eventData.budget || 0).toLocaleString('id-ID')}`),
    bold('Dokumen ini disusun pada : ', today),
    emptyLine(), emptyLine(),
    new Paragraph({ text: 'DOKUMEN INI BERSIFAT RAHASIA DAN HANYA UNTUK KEPENTINGAN INTERNAL', alignment: AlignmentType.CENTER, color: COLORS.gray, size: 18 }),
    emptyLine(),
    new Paragraph({ text: 'Disetujui oleh:', alignment: AlignmentType.CENTER }),
    emptyLine(), emptyLine(),
    new Paragraph({ text: '_________________________', alignment: AlignmentType.CENTER }),
    new Paragraph({ text: 'Direktur', alignment: AlignmentType.CENTER, color: COLORS.gray }),
  );

  // ═══════ TABLE OF CONTENTS ═══════
  sections.push(
    new Paragraph({ children: [], pageBreakBefore: true }),
    heading('DAFTAR ISI', HeadingLevel.HEADING_1),
    para('1. Event Brief & Ringkasan'),
    para('2. Rekomendasi Tema'),
    para('3. Konsep Acara'),
    para('4. Timeline Persiapan'),
    para('5. Rundown Acara'),
    para('6. Checklist Kebutuhan'),
    para('7. Rencana Anggaran (Budget)'),
    para('8. Pembagian Tugas & PIC'),
    para('9. Rencana Risiko & Mitigasi'),
    para('10. Dokumen Pendukung'),
    para('11. Evaluasi Pasca Event'),
    separator(),
  );

  // ═══════ 1. EVENT BRIEF ═══════
  const brief = aiResult?.event_brief || {};
  sections.push(
    new Paragraph({ children: [], pageBreakBefore: true }),
    heading('1. EVENT BRIEF & RINGKASAN'),
    para('Berikut ringkasan informasi utama event:'),
    emptyLine(),
    bold('Nama Event     : ', brief.event_name || eventData.event_name),
    bold('Jenis Event    : ', brief.event_type || eventData.event_type),
    bold('Tanggal        : ', eventData.event_date),
    bold('Waktu          : ', `${eventData.start_time || '09:00'} - ${eventData.end_time || '17:00'}`),
    bold('Lokasi         : ', eventData.location),
    bold('Format         : ', eventData.event_format || 'Offline'),
    bold('Peserta        : ', `${eventData.participant_count || '-'} orang`),
    bold('Tujuan         : ', brief.event_goal || eventData.event_goal),
    bold('Tone Acara     : ', brief.tone || eventData.tone),
    bold('Budget Maks    : ', `Rp ${Number(eventData.budget || 0).toLocaleString('id-ID')}`),
    bold('Konsep Utama   : ', brief.main_concept || '-'),
    bold('Key Message    : ', brief.key_message || '-'),
    emptyLine(),
    para('Indikator Keberhasilan:'),
    ...(brief.success_indicators || []).map(i => bullet(i)),
    separator(),
  );

  // ═══════ 2. THEME RECOMMENDATIONS ═══════
  const themes = aiResult?.themes || aiResult?.theme_recommendations || [];
  sections.push(
    new Paragraph({ children: [], pageBreakBefore: true }),
    heading('2. REKOMENDASI TEMA'),
    para('Berikut rekomendasi tema dari AI yang dapat dipilih:'),
    emptyLine(),
  );

  if (Array.isArray(themes) && themes.length > 0) {
    themes.forEach((t, i) => {
      sections.push(
        subHeading(`Tema ${i + 1}: ${t.theme_name || '-'}`),
        bold('Tagline      : ', t.tagline || '-'),
        bold('Filosofi     : ', t.philosophy || '-'),
        bold('Arah Visual  : ', t.visual_direction || '-'),
        bold('Warna        : ', Array.isArray(t.dominant_colors) ? t.dominant_colors.join(', ') : (t.dominant_colors || '-')),
        bold('Ide Dekorasi : ', Array.isArray(t.decoration_ideas) ? t.decoration_ideas.join('; ') : (t.decoration_ideas || '-')),
        emptyLine(),
      );
    });
  }
  sections.push(separator());

  // ═══════ 3. EVENT CONCEPT ═══════
  const concept = aiResult?.event_concept || {};
  sections.push(
    new Paragraph({ children: [], pageBreakBefore: true }),
    heading('3. KONSEP ACARA'),
    bold('Alur Besar Acara     : ', concept.main_flow || '-'),
    bold('Gaya Penyampaian     : ', concept.activity_style || '-'),
    emptyLine(),
    para('Aktivitas Utama:'),
    ...(concept.main_activities || []).map(a => bullet(a)),
    emptyLine(),
    para('Aktivitas Pendukung:'),
    ...(concept.supporting_activities || []).map(a => bullet(a)),
    emptyLine(),
    para('Ide Ice Breaking:'),
    ...(concept.ice_breaking_ideas || []).map(a => bullet(a)),
    emptyLine(),
    para('Ide Dokumentasi:'),
    ...(concept.documentation_ideas || []).map(a => bullet(a)),
    separator(),
  );

  // ═══════ 4. TIMELINE ═══════
  const timelines = aiResult?.timelines || aiResult?.preparation_timeline || [];
  sections.push(
    new Paragraph({ children: [], pageBreakBefore: true }),
    heading('4. TIMELINE PERSIAPAN'),
    para('Jadwal persiapan event dari H-30 hingga H+7:'),
    emptyLine(),
  );

  if (Array.isArray(timelines) && timelines.length > 0) {
    sections.push(makeTable(
      ['Fase', 'Tanggal', 'Aktivitas', 'PIC', 'Prioritas', 'Status'],
      timelines.map(t => [t.phase, t.date, t.activity, t.pic || '-', t.priority || '-', t.status || 'Not Started'])
    ));
  } else {
    para('Timeline belum tersedia.');
  }
  sections.push(emptyLine(), separator());

  // ═══════ 5. RUNDOWN ═══════
  const rundowns = aiResult?.rundowns || [];
  sections.push(
    new Paragraph({ children: [], pageBreakBefore: true }),
    heading('5. RUNDOWN ACARA'),
    para('Jadwal pelaksanaan acara secara detail:'),
    emptyLine(),
  );

  if (Array.isArray(rundowns) && rundowns.length > 0) {
    sections.push(makeTable(
      ['Waktu', 'Durasi', 'Agenda', 'Detail Kegiatan', 'Kebutuhan Teknis', 'Catatan MC'],
      rundowns.map(r => [
        `${r.start_time || '-'} - ${r.end_time || '-'}`,
        r.duration || '-',
        r.agenda || '-',
        r.activity_detail || '-',
        Array.isArray(r.technical_needs) ? r.technical_needs.join(', ') : (r.technical_needs || '-'),
        r.mc_notes || '-',
      ])
    ));
  } else {
    para('Rundown belum tersedia.');
  }
  sections.push(emptyLine(), separator());

  // ═══════ 6. CHECKLIST ═══════
  const checklists = aiResult?.checklists || [];
  sections.push(
    new Paragraph({ children: [], pageBreakBefore: true }),
    heading('6. CHECKLIST KEBUTUHAN'),
    para('Daftar kebutuhan yang harus dipersiapkan:'),
    emptyLine(),
  );

  if (Array.isArray(checklists) && checklists.length > 0) {
    // Group by category
    const grouped = {};
    checklists.forEach(c => {
      const cat = c.category || 'Lainnya';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(c);
    });

    Object.entries(grouped).forEach(([cat, items]) => {
      sections.push(
        subHeading(cat),
        makeTable(
          ['Item', 'Jumlah', 'Prioritas', 'PIC', 'Deadline', 'Est. Biaya'],
          items.map(c => [
            c.item_name || '-',
            c.quantity || 1,
            c.priority || '-',
            c.pic || '-',
            c.deadline || '-',
            `Rp ${Number(c.estimated_cost || 0).toLocaleString('id-ID')}`,
          ])
        ),
        emptyLine(),
      );
    });
  } else {
    para('Checklist belum tersedia.');
  }
  sections.push(separator());

  // ═══════ 7. BUDGET ═══════
  const budgets = aiResult?.budgets || aiResult?.budget_plan || [];
  sections.push(
    new Paragraph({ children: [], pageBreakBefore: true }),
    heading('7. RENCANA ANGGARAN (BUDGET)'),
    para('Estimasi biaya untuk seluruh kegiatan:'),
    emptyLine(),
  );

  if (Array.isArray(budgets) && budgets.length > 0) {
    let totalBudget = 0;
    sections.push(makeTable(
      ['Kategori', 'Item', 'Qty', 'Harga Satuan', 'Total', 'Prioritas', 'Alternatif Hemat'],
      budgets.map(b => {
        const total = Number(b.total_price || 0);
        totalBudget += total;
        return [
          b.category || '-',
          b.item || '-',
          b.quantity || 1,
          `Rp ${Number(b.unit_price || 0).toLocaleString('id-ID')}`,
          `Rp ${total.toLocaleString('id-ID')}`,
          b.priority || '-',
          b.saving_alternative || '-',
        ];
      })
    ));
    sections.push(
      emptyLine(),
      bold('TOTAL BUDGET RENCANA : ', `Rp ${totalBudget.toLocaleString('id-ID')}`),
    );
  } else {
    para('Budget belum tersedia.');
  }
  sections.push(separator());

  // ═══════ 8. TASK & PIC ═══════
  const tasks = aiResult?.tasks || [];
  sections.push(
    new Paragraph({ children: [], pageBreakBefore: true }),
    heading('8. PEMBAGIAN TUGAS & PIC'),
    para('Daftar tugas yang harus dikerjakan beserta penanggung jawabnya:'),
    emptyLine(),
  );

  if (Array.isArray(tasks) && tasks.length > 0) {
    sections.push(makeTable(
      ['Tugas', 'Deskripsi', 'PIC', 'Deadline', 'Prioritas', 'Status'],
      tasks.map(t => [
        t.task_name || '-',
        t.description || '-',
        t.pic || '-',
        t.deadline || '-',
        t.priority || '-',
        t.status || 'Not Started',
      ])
    ));
  } else {
    para('Daftar tugas belum tersedia.');
  }
  sections.push(separator());

  // ═══════ 9. RISK PLAN ═══════
  const risks = aiResult?.risks || aiResult?.risk_backup_plan || [];
  sections.push(
    new Paragraph({ children: [], pageBreakBefore: true }),
    heading('9. RENCANA RISIKO & MITIGASI'),
    para('Identifikasi potensi risiko dan rencana mitigasi:'),
    emptyLine(),
  );

  if (Array.isArray(risks) && risks.length > 0) {
    sections.push(makeTable(
      ['Risiko', 'Dampak', 'Kemungkinan', 'Rencana Cadangan', 'PIC'],
      risks.map(r => [
        r.risk || '-',
        r.impact || '-',
        r.probability || '-',
        r.backup_plan || '-',
        r.pic || '-',
      ])
    ));
  } else {
    para('Rencana risiko belum tersedia.');
  }
  sections.push(separator());

  // ═══════ 10. DOKUMEN PENDUKUNG ═══════
  const docs = aiResult?.documents || {};
  sections.push(
    new Paragraph({ children: [], pageBreakBefore: true }),
    heading('10. DOKUMEN PENDUKUNG'),
    para('Draft dokumen pendukung event:'),
    emptyLine(),
  );

  const docFields = [
    ['Undangan', docs.invitation_draft],
    ['Naskah MC', docs.mc_script],
    ['Sambutan Direktur', docs.director_speech],
    ['Sambutan Ketua Panitia', docs.committee_speech],
    ['Proposal Event', docs.event_proposal],
    ['TOR Event', docs.tor],
  ];

  docFields.forEach(([title, content]) => {
    if (content) {
      sections.push(
        subHeading(title),
        para(content),
        emptyLine(),
      );
    }
  });
  sections.push(separator());

  // ═══════ 11. EVALUASI ═══════
  const evaluation = aiResult?.post_event_evaluation || aiResult?.evaluation || {};
  sections.push(
    new Paragraph({ children: [], pageBreakBefore: true }),
    heading('11. EVALUASI PASCA EVENT'),
    para('Template evaluasi yang harus diisi setelah event selesai:'),
    emptyLine(),
    bold('Peserta Hadir         : ', '_____ / _____ orang'),
    bold('Kesesuaian Rundown    : ', 'Ya / Tidak (dengan catatan)'),
    bold('Kendala Saat Acara    : ', '_________________________'),
    bold('Budget Realisasi      : ', 'Rp _____________'),
    bold('Feedback Peserta      : ', '_________________________'),
    emptyLine(),
    para('Pertanyaan Evaluasi:'),
    ...(evaluation.feedback_questions || [
      'Apakah tujuan event tercapai?',
      'Bagaimana kepuasan peserta terhadap acara?',
      'Apakah budget sesuai dengan realisasi?',
      'Apa saja kendala yang dihadapi?',
      'Apa rekomendasi untuk event berikutnya?',
    ]).map(q => bullet(q)),
    emptyLine(),
    para('Poin Evaluasi:'),
    ...(evaluation.evaluation_points || []).map(p => bullet(p)),
    emptyLine(),
    para('Rekomendasi Perbaikan:'),
    ...(evaluation.improvement_recommendations || []).map(r => bullet(r)),
    emptyLine(),
    para('Struktur Laporan:'),
    ...(evaluation.report_structure || []).map(s => bullet(s)),
    separator(),
  );

  // ═══════ BUILD DOCUMENT ═══════
  const doc = new Document({
    creator: 'Daniswara Event Planner AI',
    title: `Dokumen Event - ${eventData.event_name || 'Event'}`,
    description: 'Dokumen perencanaan event lengkap yang dihasilkan oleh AI',
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 22, color: COLORS.dark },
          paragraph: { spacing: { line: 276 } },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: { top: 1440, right: 1200, bottom: 1440, left: 1200 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: 'PT DANISWARA', bold: true, size: 18, color: COLORS.primary }),
                new TextRun({ text: ' | Dokumen Perencanaan Event', size: 16, color: COLORS.gray }),
              ],
              border: { bottom: { color: COLORS.primary, space: 4, style: BorderStyle.SINGLE, size: 2 } },
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: 'Daniswara Event Planner AI | ', size: 16, color: COLORS.gray }),
                new TextRun({ text: 'Halaman ', size: 16, color: COLORS.gray }),
                new TextRun({ children: [PageNumber.CURRENT], size: 16, color: COLORS.gray }),
                new TextRun({ text: ' dari ', size: 16, color: COLORS.gray }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: COLORS.gray }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
      },
      children: sections,
    }],
  });

  return doc;
}

export async function generateEventBuffer(eventData, aiResult) {
  const doc = generateEventDocument(eventData, aiResult);
  return await Packer.toBuffer(doc);
}
