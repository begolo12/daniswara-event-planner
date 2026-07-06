export function buildSystemPrompt() {
  return `Kamu adalah AI Event Planner profesional untuk PT Daniswara. Tugas kamu adalah membantu perencanaan, eksekusi, dan evaluasi event korporasi.

Kemampuan kamu meliputi:
1. Merancang konsep dan tema event
2. Membuat timeline dan rundown acara
3. Menghitung dan mengoptimasi budget
4. Mengidentifikasi risiko dan membuat rencana mitigasi
5. Membuat dokumen event (undangan, TOR, proposal, dll)
6. Mengevaluasi hasil event dan memberikan rekomendasi

Selalu berikan respons dalam Bahasa Indonesia yang profesional. Format output dalam JSON sesuai dengan struktur yang diminta.

PENTING: Untuk generated proposal lengkap, gunakan format "comprehensive" dengan semua section berikut:
- event_identity: Identitas event (nama, tipe, tanggal, lokasi, dll)
- idea_options: Array 35 ide konsep event (beragam ide kreatif)
- recommended_concept: Konsep yang direkomendasikan (dari idea_options)
- background: Latar belakang event
- objectives: Tujuan dan objektif
- concept: Konsep detail
- theme_philosophy: Tema, tagline, filosofi, arah visual
- participant_targets: Target peserta
- benefits: Manfaat event
- key_messages: Pesan kunci
- committee: Susunan panitia
- timeline: Timeline persiapan
- rundown: Rundown acara
- equipment_needs: Kebutuhan peralatan
- budget: Rincian anggaran
- budget_summary: Ringkasan budget
- materials_content: Materi dan konten
- post_event_outputs: Output pasca event
- risks: Risiko dan mitigasi
- checklists: Checklist persiapan
- final_recommendation: Rekomendasi akhir`;
}

/**
 * Build prompt for comprehensive AI proposal generation.
 * Returns a structured prompt that asks for ALL sections of a complete event proposal.
 */
export function buildComprehensiveProposalPrompt(eventData, outputs) {
  const { name, event_type, event_date, location, format, estimated_participants, goal, tone, budget_max, division, mode } = eventData;

  let prompt = `Buatkan proposal lengkap event korporasi berikut:\n`;
  prompt += `- Nama Event: ${name}\n`;
  prompt += `- Tipe: ${event_type}\n`;
  prompt += `- Tanggal: ${event_date}\n`;
  prompt += `- Lokasi: ${location || 'Belum ditentukan'}\n`;
  prompt += `- Format: ${format || 'offline'}\n`;
  prompt += `- Peserta: ${estimated_participants || 'Belum ditentukan'} orang\n`;
  prompt += `- Tujuan: ${goal || '-'}\n`;
  prompt += `- Nada/Suasana: ${tone || 'formal'}\n`;
  prompt += `- Budget Maksimal: ${budget_max ? `Rp ${Number(budget_max).toLocaleString('id-ID')}` : 'Belum ditentukan'}\n`;
  prompt += `- Divisi: ${division || '-'}\n`;
  if (mode) prompt += `- Mode Perencanaan: ${mode}\n`;
  prompt += `\n`;

  prompt += `Buatkan proposal LENGKAP dengan semua section berikut dalam format JSON:\n\n`;
  prompt += `{\n`;
  prompt += `  "event_identity": {\n`;
  prompt += `    "name": "Nama event yang kreatif",\n`;
  prompt += `    "event_type": "${event_type || 'corporate'}",\n`;
  prompt += `    "event_date": "${event_date || ''}",\n`;
  prompt += `    "location": "${location || ''}",\n`;
  prompt += `    "format": "${format || 'offline'}",\n`;
  prompt += `    "estimated_participants": ${estimated_participants || 100},\n`;
  prompt += `    "tone": "${tone || 'formal'}",\n`;
  prompt += `    "budget_max": ${budget_max || 0},\n`;
  prompt += `    "goal": "Tujuan event yang jelas",\n`;
  prompt += `    "division": "${division || ''}"\n`;
  prompt += `  },\n`;
  prompt += `  "idea_options": [\n`;
  prompt += `    // Buatkan 35 ide konsep event yang beragam dan kreatif\n`;
  prompt += `    // Setiap ide harus memiliki:\n`;
  prompt += `    {\n`;
  prompt += `      "title": "Judul Ide",\n`;
  prompt += `      "description": "Deskripsi singkat ide",\n`;
  prompt += `      "concept": "Konsep inti",\n`;
  prompt += `      "tagline": "Tagline kreatif",\n`;
  prompt += `      "philosophy": "Filosofi di balik ide",\n`;
  prompt += `      "unique_selling_point": "Keunikan ide ini",\n`;
  prompt += `      "visual_direction": "Arah visual/dekorasi",\n`;
  prompt += `      "dominant_colors": ["#hex1", "#hex2", "#hex3"],\n`;
  prompt += `      "budget_estimate": "Estimasi budget",\n`;
  prompt += `      "suitability_score": 85,\n`;
  prompt += `      "notes": "Catatan tambahan"\n`;
  prompt += `    }\n`;
  prompt += `    // ... total 35 ide\n`;
  prompt += `  ],\n`;
  prompt += `  "recommended_concept": {\n`;
  prompt += `    "selected_index": 0,\n`;
  prompt += `    "title": "Judul konsep terpilih",\n`;
  prompt += `    "rationale": "Alasan pemilihan konsep ini",\n`;
  prompt += `    "theme_name": "Nama tema",\n`;
  prompt += `    "tagline": "Tagline event",\n`;
  prompt += `    "concept": "Konsep detail"\n`;
  prompt += `  },\n`;
  prompt += `  "background": "Latar belakang event yang komprehensif...",\n`;
  prompt += `  "objectives": {\n`;
  prompt += `    "primary": "Tujuan utama",\n`;
  prompt += `    "secondary": ["Tujuan sekunder 1", "Tujuan sekunder 2"],\n`;
  prompt += `    "kpi": ["KPI 1", "KPI 2"]\n`;
  prompt += `  },\n`;
  prompt += `  "concept": {\n`;
  prompt += `    "theme_name": "Nama tema",\n`;
  prompt += `    "tagline": "Tagline",\n`;
  prompt += `    "philosophy": "Filosofi tema",\n`;
  prompt += `    "visual_direction": "Arah visual",\n`;
  prompt += `    "decoration_ideas": "Ide dekorasi"\n`;
  prompt += `  },\n`;
  prompt += `  "theme_philosophy": {\n`;
  prompt += `    "theme_name": "Nama tema event",\n`;
  prompt += `    "tagline": "Tagline event",\n`;
  prompt += `    "philosophy": "Filosofi dan makna tema",\n`;
  prompt += `    "visual_direction": "Deskripsi arah visual",\n`;
  prompt += `    "dominant_colors": ["#hex1", "#hex2", "#hex3", "#hex4"],\n`;
  prompt += `    "decoration_ideas": "Ide dekorasi venue"\n`;
  prompt += `  },\n`;
  prompt += `  "participant_targets": [\n`;
  prompt += `    {\n`;
  prompt += `      "category": "Kategori peserta",\n`;
  prompt += `      "count": 100,\n`;
  prompt += `      "description": "Deskripsi target",\n`;
  prompt += `      "characteristics": "Karakteristik peserta"\n`;
  prompt += `    }\n`;
  prompt += `  ],\n`;
  prompt += `  "benefits": {\n`;
  prompt += `    "for_participants": ["Manfaat 1", "Manfaat 2"],\n`;
  prompt += `    "for_company": ["Manfaat 1", "Manfaat 2"],\n`;
  prompt += `    "for_stakeholders": ["Manfaat 1", "Manfaat 2"]\n`;
  prompt += `  },\n`;
  prompt += `  "key_messages": ["Pesan kunci 1", "Pesan kunci 2", "Pesan kunci 3"],\n`;
  prompt += `  "committee": [\n`;
  prompt += `    {\n`;
  prompt += `      "position": "Ketua Panitia",\n`;
  prompt += `      "name": "Nama (opsional)",\n`;
  prompt += `      "tugas_utama": "Deskripsi tugas utama",\n`;
  prompt += `      "deadline": "Deadline penugasan"\n`;
  prompt += `    }\n`;
  prompt += `    // ... semua posisi panitia\n`;
  prompt += `  ],\n`;
  prompt += `  "timeline": [\n`;
  prompt += `    {\n`;
  prompt += `      "phase": "H-30",\n`;
  prompt += `      "date": "YYYY-MM-DD",\n`;
  prompt += `      "activity": "Aktivitas yang dilakukan",\n`;
  prompt += `      "deadline": "YYYY-MM-DD",\n`;
  prompt += `      "priority": "critical|high|medium|low",\n`;
  prompt += `      "risk_if_late": "Risiko jika terlambat"\n`;
  prompt += `    }\n`;
  prompt += `  ],\n`;
  prompt += `  "rundown": [\n`;
  prompt += `    {\n`;
  prompt += `      "start_time": "HH:MM",\n`;
  prompt += `      "end_time": "HH:MM",\n`;
  prompt += `      "duration": "30 menit",\n`;
  prompt += `      "agenda": "Nama agenda",\n`;
  prompt += `      "activity_detail": "Detail aktivitas",\n`;
  prompt += `      "technical_needs": "Kebutuhan teknis",\n`;
  prompt += `      "mc_notes": "Catatan MC",\n`;
  prompt += `      "expected_output": "Output yang diharapkan"\n`;
  prompt += `    }\n`;
  prompt += `  ],\n`;
  prompt += `  "equipment_needs": [\n`;
  prompt += `    {\n`;
  prompt += `      "name": "Nama peralatan",\n`;
  prompt += `      "quantity": 1,\n`;
  prompt += `      "priority": "critical|high|medium|low",\n`;
  prompt += `      "estimated_cost": 0,\n`;
  prompt += `      "notes": "Catatan"\n`;
  prompt += `    }\n`;
  prompt += `  ],\n`;
  prompt += `  "budget": [\n`;
  prompt += `    {\n`;
  prompt += `      "category": "Kategori",\n`;
  prompt += `      "item": "Nama item",\n`;
  prompt += `      "quantity": 1,\n`;
  prompt += `      "unit_price": 0,\n`;
  prompt += `      "total_price": 0,\n`;
  prompt += `      "priority": "critical|high|medium|low",\n`;
  prompt += `      "saving_alternative": "Alternatif penghematan"\n`;
  prompt += `    }\n`;
  prompt += `  ],\n`;
  prompt += `  "budget_summary": {\n`;
  prompt += `    "total_estimated": 0,\n`;
  prompt += `    "budget_max": ${budget_max || 0},\n`;
  prompt += `    "remaining": 0,\n`;
  prompt += `    "by_category": {\n`;
  prompt += `      "Venue": { "estimated": 0 },\n`;
  prompt += `      "Catering": { "estimated": 0 }\n`;
  prompt += `    },\n`;
  prompt += `    "summary": "Ringkasan anggaran"\n`;
  prompt += `  },\n`;
  prompt += `  "materials_content": [\n`;
  prompt += `    {\n`;
  prompt += `      "title": "Judul materi",\n`;
  prompt += `      "type": "Tipe materi",\n`;
  prompt += `      "content": "Isi materi",\n`;
  prompt += `      "speaker": "Pembicara (jika ada)"\n`;
  prompt += `    }\n`;
  prompt += `  ],\n`;
  prompt += `  "post_event_outputs": [\n`;
  prompt += `    {\n`;
  prompt += `      "title": "Judul output",\n`;
  prompt += `      "type": "Tipe output",\n`;
  prompt += `      "description": "Deskripsi",\n`;
  prompt += `      "deadline": "Deadline"\n`;
  prompt += `    }\n`;
  prompt += `  ],\n`;
  prompt += `  "risks": [\n`;
  prompt += `    {\n`;
  prompt += `      "risk": "Deskripsi risiko",\n`;
  prompt += `      "impact": "Tinggi|Sedang|Rendah",\n`;
  prompt += `      "probability": "Tinggi|Sedang|Rendah",\n`;
  prompt += `      "backup_plan": "Rencana mitigasi",\n`;
  prompt += `      "status": "identified"\n`;
  prompt += `    }\n`;
  prompt += `  ],\n`;
  prompt += `  "checklists": [\n`;
  prompt += `    {\n`;
  prompt += `      "category": "Kategori",\n`;
  prompt += `      "item_name": "Nama item",\n`;
  prompt += `      "quantity": 1,\n`;
  prompt += `      "priority": "critical|high|medium|low",\n`;
  prompt += `      "deadline": "YYYY-MM-DD",\n`;
  prompt += `      "estimated_cost": 0\n`;
  prompt += `    }\n`;
  prompt += `  ],\n`;
  prompt += `  "final_recommendation": {\n`;
  prompt += `    "summary": "Ringkasan rekomendasi",\n`;
  prompt += `    "next_steps": ["Langkah 1", "Langkah 2"],\n`;
  prompt += `    "key_success_factors": ["Faktor 1", "Faktor 2"]\n`;
  prompt += `  }\n`;
  prompt += `}\n\n`;
  prompt += `Pastikan:\n`;
  prompt += `1. idea_options memiliki tepat 35 ide yang beragam\n`;
  prompt += `2. recommended_concept memilih salah satu dari idea_options\n`;
  prompt += `3. Semua angka budget dalam Rupiah\n`;
  prompt += `4. Format tanggal YYYY-MM-DD\n`;
  prompt += `5. Format waktu HH:MM (24 jam)\n`;
  prompt += `6. Timeline minimal 6 milestone dari H-30 sampai H-1\n`;
  prompt += `7. Rundown mencakup seluruh durasi event dari awal sampai akhir\n`;

  return prompt;
}

export function buildEventGenerationPrompt(eventData, outputs) {
  const { name, event_type, event_date, location, format, estimated_participants, goal, tone, budget_max, division, mode } = eventData;

  // If mode is 'full_proposal' or all outputs are selected, use comprehensive prompt
  const outputList = Array.isArray(outputs) ? outputs : (typeof outputs === 'string' ? outputs.split(',').map(s => s.trim()) : []);
  const isFullProposal = mode === 'full_proposal' || outputList.length >= 6;

  if (isFullProposal) {
    return buildComprehensiveProposalPrompt(eventData, outputs);
  }

  // Otherwise, use the partial prompt for selected outputs only
  let prompt = `Bantu saya merencanakan event korporasi berikut:\n`;
  prompt += `- Nama Event: ${name}\n`;
  prompt += `- Tipe: ${event_type}\n`;
  prompt += `- Tanggal: ${event_date}\n`;
  prompt += `- Lokasi: ${location || 'Belum ditentukan'}\n`;
  prompt += `- Format: ${format || 'offline'}\n`;
  prompt += `- Peserta: ${estimated_participants || 'Belum ditentukan'} orang\n`;
  prompt += `- Tujuan: ${goal || '-'}\n`;
  prompt += `- Nada/Suasana: ${tone || 'formal'}\n`;
  prompt += `- Budget Maksimal: ${budget_max ? `Rp ${Number(budget_max).toLocaleString('id-ID')}` : 'Belum ditentukan'}\n`;
  prompt += `- Divisi: ${division || '-'}\n\n`;

  prompt += `Saya membutuhkan output untuk bagian berikut:\n`;
  const outputMap = {
    theme: '1. Tema & Konsep (theme_name, tagline, philosophy, visual_direction, dominant_colors, decoration_ideas)',
    timeline: '2. Timeline Persiapan (phase, date, activity, deadline, priority, risk_if_late)',
    rundown: '3. Rundown Acara (start_time, end_time, duration, agenda, activity_detail, technical_needs, mc_notes, expected_output)',
    checklist: '4. Checklist Persiapan (category, item_name, quantity, priority, deadline, estimated_cost)',
    budget: '5. Rincian Budget (category, item, quantity, unit_price, total_price, priority, can_be_reduced, saving_alternative)',
    risks: '6. Rencana Risiko & Mitigasi (risk, impact, probability, backup_plan, status)',
    documents: '7. Dokumen Event (doc_type, title, content)',
  };

  outputList.forEach((output) => {
    if (outputMap[output]) prompt += outputMap[output] + '\n';
  });

  prompt += `\nBerikan respons dalam format JSON dengan struktur berikut:\n`;
  prompt += `{\n`;
  if (outputList.includes('theme')) prompt += `  "themes": [{ "theme_name": "...", "tagline": "...", "philosophy": "...", "visual_direction": "...", "dominant_colors": ["#..."], "decoration_ideas": "..." }],\n`;
  if (outputList.includes('timeline')) prompt += `  "timelines": [{ "phase": "...", "date": "YYYY-MM-DD", "activity": "...", "deadline": "YYYY-MM-DD", "priority": "medium|high|low|critical", "risk_if_late": "..." }],\n`;
  if (outputList.includes('rundown')) prompt += `  "rundowns": [{ "start_time": "HH:MM", "end_time": "HH:MM", "duration": "...", "agenda": "...", "activity_detail": "...", "technical_needs": "...", "mc_notes": "...", "expected_output": "..." }],\n`;
  if (outputList.includes('checklist')) prompt += `  "checklists": [{ "category": "...", "item_name": "...", "quantity": 1, "priority": "medium", "deadline": "YYYY-MM-DD", "estimated_cost": 0 }],\n`;
  if (outputList.includes('budget')) prompt += `  "budgets": [{ "category": "...", "item": "...", "quantity": 1, "unit_price": 0, "total_price": 0, "priority": "medium", "can_be_reduced": true, "saving_alternative": "..." }],\n`;
  if (outputList.includes('risks')) prompt += `  "risks": [{ "risk": "...", "impact": "...", "probability": "...", "backup_plan": "...", "status": "identified" }],\n`;
  if (outputList.includes('documents')) prompt += `  "documents": [{ "doc_type": "invitation|proposal", "title": "...", "content": "..." }]\n`;
  prompt += `}`;

  return prompt;
}

export function buildPartialPrompt(type, context) {
  // Accept both { eventData, additionalInfo } and flat event data
  const eventData = context.eventData || context;
  const additionalInfo = context.additionalInfo || '';
  let prompt = '';

  const eventDesc = `Event: ${eventData.name || eventData.event_name || 'Event'}, Tanggal: ${eventData.event_date || '-'}, Lokasi: ${eventData.location || '-'}, Peserta: ${eventData.estimated_participants || eventData.participant_count || '-'}, Budget: ${eventData.budget_max || eventData.budget ? `Rp ${Number(eventData.budget_max || eventData.budget || 0).toLocaleString('id-ID')}` : '-'}`;

  switch (type) {
    case 'theme':
      prompt = `Buatkan konsep tema untuk event berikut:\n${eventDesc}\nNada/Suasana: ${eventData.tone || 'formal'}\n\nBerikan dalam format JSON: { "theme_name": "...", "tagline": "...", "philosophy": "...", "visual_direction": "...", "dominant_colors": ["#..."], "decoration_ideas": "..." }`;
      break;

    case 'timeline':
      prompt = `Buatkan timeline persiapan untuk event berikut:\n${eventDesc}\n\nBerikan dalam format JSON array: [{ "phase": "...", "date": "YYYY-MM-DD", "activity": "...", "deadline": "YYYY-MM-DD", "priority": "medium|high|low|critical", "risk_if_late": "..." }]`;
      break;

    case 'rundown':
      prompt = `Buatkan rundown acara untuk event berikut:\n${eventDesc}\n${additionalInfo ? `Tambahan: ${additionalInfo}\n` : ''}\nBerikan dalam format JSON array: [{ "start_time": "HH:MM", "end_time": "HH:MM", "duration": "...", "agenda": "...", "activity_detail": "...", "technical_needs": "...", "mc_notes": "...", "expected_output": "..." }]`;
      break;

    case 'checklist':
      prompt = `Buatkan checklist persiapan untuk event berikut:\n${eventDesc}\n\nBerikan dalam format JSON array: [{ "category": "...", "item_name": "...", "quantity": 1, "priority": "medium|high|low|critical", "deadline": "YYYY-MM-DD", "estimated_cost": 0 }]`;
      break;

    case 'budget':
      prompt = `Buatkan rincian budget untuk event berikut:\n${eventDesc}\n\nBerikan dalam format JSON array: [{ "category": "...", "item": "...", "quantity": 1, "unit_price": 0, "total_price": 0, "priority": "medium|high|low|critical", "can_be_reduced": true, "saving_alternative": "..." }]`;
      break;

    case 'risks':
      prompt = `Buatkan analisis risiko dan rencana mitigasi untuk event berikut:\n${eventDesc}\n\nBerikan dalam format JSON array: [{ "risk": "...", "impact": "...", "probability": "...", "backup_plan": "...", "status": "identified" }]`;
      break;

    case 'document':
      prompt = `Buatkan dokumen event untuk event berikut:\n${eventDesc}\nJenis dokumen: ${additionalInfo || 'undangan'}\n\nBerikan dalam format JSON: { "doc_type": "...", "title": "...", "content": "..." }`;
      break;

    case 'evaluation':
      prompt = `Buatkan ringkasan evaluasi untuk event berikut:\n${eventDesc}\n${additionalInfo ? `Data evaluasi: ${additionalInfo}\n` : ''}\nBerikan dalam format JSON: { "ai_summary": "...", "ai_lesson_learned": "...", "recommendations": "..." }`;
      break;

    case 'report':
      prompt = `Buatkan laporan event untuk event berikut:\n${eventDesc}\n${additionalInfo ? `Data event: ${additionalInfo}\n` : ''}\n\nBerikan dalam format JSON: { "report_title": "...", "executive_summary": "...", "highlights": [...], "issues": [...], "recommendations": [...] }`;
      break;

    case 'comprehensive':
      prompt = buildComprehensiveProposalPrompt(eventData, null);
      break;

    default:
      prompt = `Bantu saya untuk event berikut:\n${eventDesc}\n${additionalInfo ? `Tambahan: ${additionalInfo}\n` : ''}`;
  }

  return prompt;
}
