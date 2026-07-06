export function buildSystemPrompt() {
  return `Kamu adalah AI Event Planner profesional untuk PT Daniswara. Tugas kamu adalah membantu perencanaan, eksekusi, dan evaluasi event korporasi.

Kemampuan kamu meliputi:
1. Merancang konsep dan tema event
2. Membuat timeline dan rundown acara
3. Menghitung dan mengoptimasi budget
4. Mengidentifikasi risiko dan membuat rencana mitigasi
5. Membuat dokumen event (undangan, TOR, proposal, dll)
6. Mengevaluasi hasil event dan memberikan rekomendasi

Selalu berikan respons dalam Bahasa Indonesia yang profesional. Format output dalam JSON sesuai dengan struktur yang diminta.`;
}

export function buildEventGenerationPrompt(eventData, outputs) {
  const { name, event_type, event_date, location, format, estimated_participants, goal, tone, budget_max, division } = eventData;

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

  // Ensure outputs is always an array
  const outputList = Array.isArray(outputs) ? outputs : (typeof outputs === 'string' ? outputs.split(',').map(s => s.trim()) : []);

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

    default:
      prompt = `Bantu saya untuk event berikut:\n${eventDesc}\n${additionalInfo ? `Tambahan: ${additionalInfo}\n` : ''}`;
  }

  return prompt;
}
