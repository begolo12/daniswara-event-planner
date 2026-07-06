import React, { useState } from 'react';
import { Save, RefreshCw, Check, Download, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import reportService from '../../services/reportService';

/**
 * Detect whether AI results use the new comprehensive format or the old format.
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

// Normalize data from AI response format to our display format
function normalizeResults(results) {
  if (!results || typeof results !== 'object') return {};

  // Check if this is the new comprehensive format
  if (isNewAiFormat(results)) {
    return normalizeNewFormat(results);
  }

  // Old format normalization
  const normalized = {};
  
  // Map AI response keys to our tab keys
  if (results.themes) normalized.themes = results.themes;
  if (results.timelines) normalized.timeline = results.timelines;
  if (results.rundowns) normalized.rundown = results.rundowns;
  if (results.checklists) normalized.checklist = results.checklists;
  if (results.budgets) normalized.budget = results.budgets;
  if (results.risks) normalized.risks = results.risks;
  if (results.documents) normalized.documents = Array.isArray(results.documents) ? results.documents : [results.documents];
  
  // Direct mappings
  if (results.brief || results.event_brief) normalized.brief = results.brief || results.event_brief;
  if (results.concept || results.event_concept) normalized.concept = results.concept || results.event_concept;
  if (results.evaluation || results.post_event_evaluation) normalized.evaluation = results.evaluation || results.post_event_evaluation;
  
  return normalized;
}

/**
 * Normalize new comprehensive AI format to display sections.
 */
function normalizeNewFormat(results) {
  const normalized = {};

  // Event Identity → brief
  if (results.event_identity) {
    normalized.event_identity = results.event_identity;
    normalized.brief = results.event_identity;
  }

  // Idea Options
  if (results.idea_options && Array.isArray(results.idea_options)) {
    normalized.idea_options = results.idea_options;
  }

  // Recommended Concept
  if (results.recommended_concept) {
    normalized.recommended_concept = results.recommended_concept;
  }

  // Background
  if (results.background) {
    normalized.background = results.background;
  }

  // Objectives
  if (results.objectives) {
    normalized.objectives = results.objectives;
  }

  // Concept
  if (results.concept) {
    normalized.concept = results.concept;
  }

  // Theme Philosophy → themes (wrap in array for display)
  if (results.theme_philosophy) {
    normalized.themes = [results.theme_philosophy];
    if (results.recommended_concept && (results.recommended_concept.theme_name || results.recommended_concept.concept_name)) {
      normalized.themes.push(results.recommended_concept);
    }
  }

  // Participant Targets
  if (results.participant_targets && Array.isArray(results.participant_targets)) {
    normalized.participant_targets = results.participant_targets;
  }

  // Benefits
  if (results.benefits) {
    normalized.benefits = results.benefits;
  }

  // Key Messages
  if (results.key_messages && Array.isArray(results.key_messages)) {
    normalized.key_messages = results.key_messages;
  }

  // Committee
  if (results.committee && Array.isArray(results.committee)) {
    normalized.committee = results.committee;
  }

  // Timeline
  if (results.timeline && Array.isArray(results.timeline)) {
    normalized.timeline = results.timeline;
  }

  // Rundown
  if (results.rundown && Array.isArray(results.rundown)) {
    normalized.rundown = results.rundown;
  }

  // Equipment Needs → checklist (category: Peralatan)
  if (results.equipment_needs && Array.isArray(results.equipment_needs)) {
    normalized.equipment_needs = results.equipment_needs;
  }

  // Budget
  if (results.budget && Array.isArray(results.budget)) {
    normalized.budget = results.budget;
  }

  // Budget Summary
  if (results.budget_summary) {
    normalized.budget_summary = results.budget_summary;
  }

  // Materials Content
  if (results.materials_content && Array.isArray(results.materials_content)) {
    normalized.materials_content = results.materials_content;
  }

  // Post Event Outputs
  if (results.post_event_outputs && Array.isArray(results.post_event_outputs)) {
    normalized.post_event_outputs = results.post_event_outputs;
  }

  // Risks
  if (results.risks && Array.isArray(results.risks)) {
    normalized.risks = results.risks;
  }

  // Checklists
  if (results.checklists && Array.isArray(results.checklists)) {
    normalized.checklist = results.checklists;
  }

  // Final Recommendation
  if (results.final_recommendation) {
    normalized.final_recommendation = results.final_recommendation;
  }

  return normalized;
}

// ─── Tab Definitions ────────────────────────────────────

const oldTabList = [
  { key: 'themes', label: 'Tema' },
  { key: 'timeline', label: 'Timeline' },
  { key: 'rundown', label: 'Rundown' },
  { key: 'checklist', label: 'Checklist' },
  { key: 'budget', label: 'Anggaran' },
  { key: 'risks', label: 'Risiko' },
  { key: 'documents', label: 'Dokumen' },
];

const newTabList = [
  { key: 'event_identity', label: 'Identitas Event' },
  { key: 'idea_options', label: 'Ide Konsep' },
  { key: 'themes', label: 'Tema & Konsep' },
  { key: 'background', label: 'Latar Belakang' },
  { key: 'objectives', label: 'Tujuan' },
  { key: 'concept', label: 'Konsep' },
  { key: 'participant_targets', label: 'Target Peserta' },
  { key: 'benefits', label: 'Manfaat' },
  { key: 'key_messages', label: 'Pesan Kunci' },
  { key: 'committee', label: 'Panitia' },
  { key: 'timeline', label: 'Timeline' },
  { key: 'rundown', label: 'Rundown' },
  { key: 'equipment_needs', label: 'Peralatan' },
  { key: 'budget', label: 'Anggaran' },
  { key: 'budget_summary', label: 'Ringkasan Budget' },
  { key: 'materials_content', label: 'Materi' },
  { key: 'post_event_outputs', label: 'Output Pasca' },
  { key: 'risks', label: 'Risiko' },
  { key: 'checklist', label: 'Checklist' },
  { key: 'final_recommendation', label: 'Rekomendasi' },
];

function Skeleton({ lines = 5 }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
      ))}
    </div>
  );
}

// ─── Section Renderers ──────────────────────────────────

function EventIdentitySection({ data }) {
  if (!data) return <Skeleton />;
  const d = typeof data === 'string' ? { name: data } : data;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 text-sm">
        {d.name && <div><span className="text-dark-400">Nama:</span> <span className="font-medium text-dark-900">{d.name || d.event_name}</span></div>}
        {d.event_type && <div><span className="text-dark-400">Tipe:</span> <span className="font-medium text-dark-900">{d.event_type}</span></div>}
        {d.event_date && <div><span className="text-dark-400">Tanggal:</span> <span className="font-medium text-dark-900">{d.event_date}</span></div>}
        {d.location && <div><span className="text-dark-400">Lokasi:</span> <span className="font-medium text-dark-900">{d.location}</span></div>}
        {d.format && <div><span className="text-dark-400">Format:</span> <span className="font-medium text-dark-900">{d.format}</span></div>}
        {d.estimated_participants && <div><span className="text-dark-400">Peserta:</span> <span className="font-medium text-dark-900">{d.estimated_participants} orang</span></div>}
        {d.tone && <div><span className="text-dark-400">Tone:</span> <span className="font-medium text-dark-900">{d.tone}</span></div>}
        {d.budget_max && <div><span className="text-dark-400">Budget:</span> <span className="font-medium text-dark-900">{formatCurrency(d.budget_max)}</span></div>}
        {d.division && <div><span className="text-dark-400">Divisi:</span> <span className="font-medium text-dark-900">{d.division}</span></div>}
      </div>
      {d.goal && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-dark-400 mb-1">Tujuan Event</p>
          <p className="text-sm text-dark-700">{d.goal}</p>
        </div>
      )}
    </div>
  );
}

function IdeaOptionsSection({ data }) {
  if (!data || !Array.isArray(data)) return <Skeleton />;
  const [selected, setSelected] = useState(null);
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="space-y-3">
      <p className="text-sm text-dark-500">{data.length} ide konsep event tersedia. Pilih yang paling sesuai:</p>
      {data.map((idea, idx) => (
        <div
          key={idx}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
            selected === idx
              ? 'border-brand-500 bg-brand-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setSelected(idx)}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center">
                {idx + 1}
              </span>
              <h4 className="font-semibold text-dark-900">{idea.title || idea.name || idea.concept || `Ide ${idx + 1}`}</h4>
            </div>
            <div className="flex items-center gap-2">
              {idea.suitability_score && (
                <Badge color="blue" size="sm">Skor: {idea.suitability_score}</Badge>
              )}
              {selected === idx && (
                <Badge color="brand" size="sm"><Check size={10} className="mr-1" />Dipilih</Badge>
              )}
            </div>
          </div>
          {idea.tagline && <p className="text-sm text-brand-600 italic mb-1">"{idea.tagline}"</p>}
          {idea.description && <p className="text-sm text-dark-600 mb-2">{idea.description}</p>}
          
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(expanded === idx ? null : idx); }}
            className="text-xs text-dark-400 hover:text-dark-600 flex items-center gap-1"
          >
            {expanded === idx ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            Detail
          </button>
          
          {expanded === idx && (
            <div className="mt-3 space-y-2 text-sm">
              {idea.philosophy && <div><span className="text-dark-400">Filosofi:</span> <span className="text-dark-700">{idea.philosophy}</span></div>}
              {idea.concept && <div><span className="text-dark-400">Konsep:</span> <span className="text-dark-700">{idea.concept}</span></div>}
              {idea.unique_selling_point && <div><span className="text-dark-400">Keunikan:</span> <span className="text-dark-700">{idea.unique_selling_point}</span></div>}
              {idea.budget_estimate && <div><span className="text-dark-400">Estimasi Budget:</span> <span className="text-dark-700">{idea.budget_estimate}</span></div>}
              {idea.visual_direction && <div><span className="text-dark-400">Visual:</span> <span className="text-dark-700">{idea.visual_direction}</span></div>}
              {idea.dominant_colors && (
                <div className="flex items-center gap-1.5">
                  {(Array.isArray(idea.dominant_colors) ? idea.dominant_colors : []).map((color, ci) => (
                    <div
                      key={ci}
                      className="w-5 h-5 rounded-full border border-gray-200"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              )}
              {idea.notes && <div><span className="text-dark-400">Catatan:</span> <span className="text-dark-700">{idea.notes}</span></div>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ThemesSection({ data }) {
  if (!data) return <Skeleton />;
  const themes = Array.isArray(data) ? data : [];
  const [selected, setSelected] = useState(null);

  return (
    <div className="space-y-3">
      <p className="text-sm text-dark-500">Pilih tema yang paling sesuai:</p>
      {themes.map((theme, idx) => (
        <div
          key={idx}
          onClick={() => setSelected(idx)}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
            selected === idx
              ? 'border-brand-500 bg-brand-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-dark-900">{theme.theme_name || theme.name || `Tema ${idx + 1}`}</h4>
            {selected === idx && (
              <Badge color="brand" size="sm"><Check size={10} className="mr-1" />Dipilih</Badge>
            )}
          </div>
          {theme.tagline && <p className="text-sm text-brand-600 italic mb-1">"{theme.tagline}"</p>}
          {theme.philosophy && <p className="text-sm text-dark-600 mb-2">{theme.philosophy}</p>}
          {theme.visual_direction && <p className="text-xs text-dark-500 mb-2">🎨 {theme.visual_direction}</p>}
          {theme.dominant_colors && (
            <div className="flex items-center gap-1.5 mt-2">
              {(Array.isArray(theme.dominant_colors) ? theme.dominant_colors : []).map((color, ci) => (
                <div
                  key={ci}
                  className="w-6 h-6 rounded-full border border-gray-200"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          )}
          {theme.decoration_ideas && (
            <p className="text-xs text-dark-400 mt-2">💡 {theme.decoration_ideas}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function TextSection({ data, title }) {
  if (!data) return <Skeleton />;
  const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  return (
    <div className="space-y-2">
      {title && <h4 className="text-sm font-semibold text-dark-700">{title}</h4>}
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-dark-700 whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  );
}

function ParticipantTargetsSection({ data }) {
  if (!data || !Array.isArray(data)) return <Skeleton />;
  return (
    <div className="space-y-2">
      {data.map((pt, idx) => (
        <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Badge color="blue" size="sm">{pt.category || pt.type || `Target ${idx + 1}`}</Badge>
          <span className="text-sm font-medium text-dark-900 flex-1">
            {pt.description || pt.characteristics || '-'}
          </span>
          {(pt.count || pt.number || pt.quantity) && (
            <span className="text-xs text-dark-500">{pt.count || pt.number || pt.quantity} orang</span>
          )}
        </div>
      ))}
    </div>
  );
}

function CommitteeSection({ data }) {
  if (!data || !Array.isArray(data)) return <Skeleton />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-3 py-2 text-left text-xs font-semibold text-dark-500">Posisi</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-dark-500">Nama</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-dark-500">Tugas Utama</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((c, idx) => (
            <tr key={idx}>
              <td className="px-3 py-2 font-medium text-dark-900">{c.position || c.role || c.title || '-'}</td>
              <td className="px-3 py-2 text-dark-600">{c.name || '-'}</td>
              <td className="px-3 py-2 text-dark-600 text-xs max-w-[300px] truncate">{c.tugas_utama || c.main_task || c.responsibilities || c.description || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TimelineSection({ data }) {
  if (!data) return <Skeleton />;
  const items = Array.isArray(data) ? data : [];
  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Badge color="brand" size="sm">{item.phase || `H-${30 - idx * 7}`}</Badge>
          <span className="text-sm font-medium text-dark-900 flex-1">{item.activity || item.title || '-'}</span>
          <span className="text-xs text-dark-500">{item.date || item.deadline || ''}</span>
          {item.priority && (
            <Badge color={item.priority === 'critical' ? 'red' : item.priority === 'high' ? 'orange' : 'gray'} size="sm">
              {item.priority}
            </Badge>
          )}
        </div>
      ))}
    </div>
  );
}

function RundownSection({ data }) {
  if (!data) return <Skeleton />;
  const items = Array.isArray(data) ? data : [];
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-3 py-2 text-left text-xs font-semibold text-dark-500">Waktu</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-dark-500">Agenda</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-dark-500">Detail</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((item, idx) => (
            <tr key={idx}>
              <td className="px-3 py-2 text-dark-600 whitespace-nowrap">
                {item.start_time || item.startTime} - {item.end_time || item.endTime}
              </td>
              <td className="px-3 py-2 font-medium text-dark-900">{item.agenda || '-'}</td>
              <td className="px-3 py-2 text-dark-600 text-xs max-w-[300px] truncate">{item.activity_detail || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EquipmentNeedsSection({ data }) {
  if (!data || !Array.isArray(data)) return <Skeleton />;
  return (
    <div className="space-y-2">
      {data.map((eq, idx) => (
        <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-xs font-bold flex items-center justify-center">
            {idx + 1}
          </span>
          <span className="text-sm font-medium text-dark-900 flex-1">{eq.name || eq.item || eq.equipment || `Peralatan ${idx + 1}`}</span>
          {(eq.quantity || eq.qty) && <span className="text-xs text-dark-500">x{eq.quantity || eq.qty}</span>}
          {(eq.estimated_cost || eq.cost) && (
            <span className="text-xs text-dark-400">{formatCurrency(eq.estimated_cost || eq.cost)}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function ChecklistSection({ data }) {
  if (!data) return <Skeleton />;
  const items = Array.isArray(data) ? data : [];
  // Group by category
  const grouped = {};
  items.forEach((item) => {
    const cat = item.category || 'Lainnya';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  });

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([cat, catItems]) => (
        <div key={cat}>
          <h4 className="text-sm font-semibold text-dark-700 mb-2">{cat}</h4>
          <div className="space-y-1">
            {catItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 text-sm">
                <div className="w-4 h-4 rounded border-2 border-gray-300 flex-shrink-0" />
                <span className="text-dark-800">{item.item_name || item.label || item.name}</span>
                {item.quantity > 1 && <span className="text-xs text-dark-400">x{item.quantity}</span>}
                {item.estimated_cost > 0 && (
                  <span className="text-xs text-dark-400 ml-auto">{formatCurrency(item.estimated_cost)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function BudgetSection({ data }) {
  if (!data) return <Skeleton />;
  const items = Array.isArray(data) ? data : [];
  const total = items.reduce((sum, i) => sum + (Number(i.total_price || i.plannedCost) || 0), 0);

  return (
    <div className="space-y-4">
      <div className="p-3 bg-gray-50 rounded-lg text-center">
        <p className="text-xs text-dark-500">Total Anggaran</p>
        <p className="text-xl font-bold text-dark-900">{formatCurrency(total)}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-3 py-2 text-left text-xs font-semibold text-dark-500">Kategori</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-dark-500">Item</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-dark-500">Qty</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-dark-500">Harga</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-dark-500">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item, idx) => (
              <tr key={idx}>
                <td className="px-3 py-2 text-dark-600">{item.category || '-'}</td>
                <td className="px-3 py-2 font-medium text-dark-900">{item.item || item.name}</td>
                <td className="px-3 py-2 text-right text-dark-700">{item.quantity || 1}</td>
                <td className="px-3 py-2 text-right text-dark-700">{formatCurrency(item.unit_price)}</td>
                <td className="px-3 py-2 text-right font-medium text-dark-900">{formatCurrency(item.total_price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BudgetSummarySection({ data }) {
  if (!data) return <Skeleton />;
  const d = typeof data === 'string' ? { summary: data } : data;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 text-sm">
        {d.total_estimated && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-dark-400">Total Estimasi</p>
            <p className="text-lg font-bold text-dark-900">{formatCurrency(d.total_estimated)}</p>
          </div>
        )}
        {d.total_actual && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-dark-400">Total Aktual</p>
            <p className="text-lg font-bold text-dark-900">{formatCurrency(d.total_actual)}</p>
          </div>
        )}
        {d.remaining !== undefined && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-dark-400">Sisa Budget</p>
            <p className="text-lg font-bold text-dark-900">{formatCurrency(d.remaining)}</p>
          </div>
        )}
        {d.budget_max && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-dark-400">Budget Maksimal</p>
            <p className="text-lg font-bold text-dark-900">{formatCurrency(d.budget_max)}</p>
          </div>
        )}
      </div>
      {d.by_category && typeof d.by_category === 'object' && (
        <div>
          <h4 className="text-sm font-semibold text-dark-700 mb-2">Rincian per Kategori</h4>
          {Object.entries(d.by_category).map(([cat, info]) => (
            <div key={cat} className="flex items-center justify-between p-2 text-sm">
              <span className="text-dark-600">{cat}</span>
              <span className="font-medium text-dark-900">{formatCurrency(info.estimated || info.total || 0)}</span>
            </div>
          ))}
        </div>
      )}
      {d.summary && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-dark-700 whitespace-pre-wrap">{d.summary}</p>
        </div>
      )}
    </div>
  );
}

function MaterialsContentSection({ data }) {
  if (!data || !Array.isArray(data)) return <Skeleton />;
  return (
    <div className="space-y-3">
      {data.map((m, idx) => (
        <div key={idx} className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Badge color="purple" size="sm">{m.type || m.format || 'Materi'}</Badge>
            <span className="text-sm font-medium text-dark-900">{m.title || m.name || `Materi ${idx + 1}`}</span>
          </div>
          {(m.content || m.description) && (
            <p className="text-sm text-dark-600 whitespace-pre-wrap">{m.content || m.description}</p>
          )}
          {m.speaker && <p className="text-xs text-dark-400 mt-2">🎤 {m.speaker}</p>}
        </div>
      ))}
    </div>
  );
}

function PostEventOutputsSection({ data }) {
  if (!data || !Array.isArray(data)) return <Skeleton />;
  return (
    <div className="space-y-2">
      {data.map((o, idx) => (
        <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Badge color="green" size="sm">{o.type || `Output ${idx + 1}`}</Badge>
          <span className="text-sm font-medium text-dark-900 flex-1">{o.title || o.name || '-'}</span>
          {o.deadline && <span className="text-xs text-dark-500">{o.deadline}</span>}
        </div>
      ))}
    </div>
  );
}

function RisksSection({ data }) {
  if (!data) return <Skeleton />;
  const items = Array.isArray(data) ? data : [];
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-3 py-2 text-left text-xs font-semibold text-dark-500">Risiko</th>
            <th className="px-3 py-2 text-center text-xs font-semibold text-dark-500">Dampak</th>
            <th className="px-3 py-2 text-center text-xs font-semibold text-dark-500">Probabilitas</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-dark-500">Mitigasi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((item, idx) => (
            <tr key={idx}>
              <td className="px-3 py-2 text-dark-900">{item.risk || item.name || '-'}</td>
              <td className="px-3 py-2 text-center">
                <Badge color={item.impact === 'Tinggi' ? 'red' : item.impact === 'Sedang' ? 'yellow' : 'green'} size="sm">
                  {item.impact || '-'}
                </Badge>
              </td>
              <td className="px-3 py-2 text-center">
                <Badge color={item.probability === 'high' || item.probability === 'Tinggi' ? 'red' : item.probability === 'medium' || item.probability === 'Sedang' ? 'yellow' : 'green'} size="sm">
                  {item.probability || '-'}
                </Badge>
              </td>
              <td className="px-3 py-2 text-dark-600">{item.backup_plan || item.mitigation || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DocumentsSection({ data }) {
  if (!data) return <Skeleton />;
  const items = Array.isArray(data) ? data : [data];
  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={idx} className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Badge color="blue" size="sm">{item.doc_type || 'doc'}</Badge>
            <span className="text-sm font-medium text-dark-900">{item.title || '-'}</span>
          </div>
          {item.content && (
            <p className="text-sm text-dark-600 whitespace-pre-wrap max-h-[200px] overflow-y-auto">{item.content}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function FinalRecommendationSection({ data }) {
  if (!data) return <Skeleton />;
  const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  return (
    <div className="p-4 bg-gradient-to-r from-brand-50 to-blue-50 rounded-xl border border-brand-200">
      <h4 className="text-sm font-semibold text-brand-800 mb-2">Rekomendasi Akhir AI</h4>
      <p className="text-sm text-dark-700 whitespace-pre-wrap">{text}</p>
    </div>
  );
}

// ─── Section Renderers Map ──────────────────────────────

const sectionRenderers = {
  event_identity: EventIdentitySection,
  idea_options: IdeaOptionsSection,
  themes: ThemesSection,
  background: (props) => <TextSection {...props} title="Latar Belakang" />,
  objectives: (props) => <TextSection {...props} title="Tujuan & Objektif" />,
  concept: (props) => <TextSection {...props} title="Konsep Event" />,
  participant_targets: ParticipantTargetsSection,
  benefits: (props) => <TextSection {...props} title="Manfaat Event" />,
  key_messages: (props) => {
    if (!props.data || !Array.isArray(props.data)) return <Skeleton />;
    return (
      <div className="space-y-2">
        {props.data.map((msg, idx) => (
          <div key={idx} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
            <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
              {idx + 1}
            </span>
            <span className="text-sm text-dark-700">{typeof msg === 'string' ? msg : JSON.stringify(msg)}</span>
          </div>
        ))}
      </div>
    );
  },
  committee: CommitteeSection,
  timeline: TimelineSection,
  rundown: RundownSection,
  equipment_needs: EquipmentNeedsSection,
  budget: BudgetSection,
  budget_summary: BudgetSummarySection,
  materials_content: MaterialsContentSection,
  post_event_outputs: PostEventOutputsSection,
  risks: RisksSection,
  checklist: ChecklistSection,
  final_recommendation: FinalRecommendationSection,
  documents: DocumentsSection,
  brief: EventIdentitySection,
  evaluation: (props) => <TextSection {...props} title="Evaluasi" />,
};

export default function AIResultViewer({ results = {}, onSave, onRegenerate, activeTab: controlledTab, eventData }) {
  const [internalTab, setInternalTab] = useState(null);
  const [exporting, setExporting] = useState(false);
  
  // Normalize results to handle both AI response format and demo data format
  const normalized = normalizeResults(results);
  
  // Determine which tab list to use based on format
  const is_new_format = isNewAiFormat(results);
  const tabList = is_new_format ? newTabList : oldTabList;
  
  // Find first available tab
  const availableTabs = tabList.filter((t) => {
    const key = typeof t.key === 'function' ? t.key(results) : t.key;
    return normalized[key] !== undefined;
  });
  const activeTab = controlledTab || internalTab || (availableTabs.length > 0 ? (typeof availableTabs[0].key === 'function' ? availableTabs[0].key(results) : availableTabs[0].key) : 'themes');
  const SectionComponent = sectionRenderers[activeTab] || ThemesSection;

  const handleExportDocx = async () => {
    setExporting(true);
    try {
      const eventDataForExport = eventData ? {
        event_name: eventData.name,
        event_date: eventData.startDate,
        location: eventData.location,
      } : { event_name: 'Event', event_date: new Date().toISOString().split('T')[0] };
      
      const response = await reportService.exportAiResultDocx(eventDataForExport, results);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Event-${(eventData?.name || 'AI-Generate').replace(/[^a-zA-Z0-9]/g, '-')}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Dokumen Word berhasil diunduh!');
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Gagal export dokumen');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Format indicator */}
      {is_new_format && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 border border-green-200 text-xs text-green-700">
          <Check size={14} />
          Format Proposal Lengkap — {availableTabs.length} bagian tersedia
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {availableTabs.map((tab) => {
            const key = typeof tab.key === 'function' ? tab.key(results) : tab.key;
            const label = typeof tab.label === 'function' ? tab.label(results) : tab.label;
            return (
              <button
                key={key}
                onClick={() => setInternalTab(key)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === key
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-dark-500 hover:text-dark-700'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 min-h-[200px]">
        {normalized[activeTab] ? (
          <SectionComponent data={normalized[activeTab]} />
        ) : (
          <p className="text-sm text-dark-400 text-center py-8">Tidak ada data untuk bagian ini</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        {onRegenerate && (
          <Button
            variant="secondary"
            icon={<RefreshCw size={16} />}
            onClick={() => onRegenerate(activeTab)}
          >
            Regenerate
          </Button>
        )}
        <Button
          variant="secondary"
          icon={<Download size={16} />}
          onClick={handleExportDocx}
          loading={exporting}
        >
          Export .docx
        </Button>
        {onSave && (
          <Button
            icon={<Save size={16} />}
            onClick={() => onSave(results)}
            className="flex-1"
          >
            Simpan Semua ke Event
          </Button>
        )}
      </div>
    </div>
  );
}
