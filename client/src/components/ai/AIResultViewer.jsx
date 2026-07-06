import React, { useState } from 'react';
import { Save, RefreshCw, Check, Download, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import { formatCurrency, formatDate } from '../../utils/formatters';
import reportService from '../../services/reportService';

const tabList = [
  { key: 'brief', label: 'Brief' },
  { key: 'themes', label: 'Tema' },
  { key: 'concept', label: 'Konsep' },
  { key: 'timeline', label: 'Timeline' },
  { key: 'rundown', label: 'Rundown' },
  { key: 'checklist', label: 'Checklist' },
  { key: 'budget', label: 'Anggaran' },
  { key: 'tasks', label: 'Tugas' },
  { key: 'risks', label: 'Risiko' },
  { key: 'documents', label: 'Dokumen' },
  { key: 'evaluation', label: 'Evaluasi' },
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

function BriefSection({ data }) {
  if (!data) return <Skeleton />;
  return (
    <div className="prose prose-sm max-w-none text-dark-700 whitespace-pre-wrap">
      {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
    </div>
  );
}

function ThemesSection({ data }) {
  if (!data) return <Skeleton />;
  const themes = Array.isArray(data) ? data : data.themes || [];
  const [selected, setSelected] = useState(null);

  return (
    <div className="space-y-3">
      {themes.map((theme, idx) => (
        <div
          key={idx}
          onClick={() => setSelected(idx)}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all
            ${selected === idx
              ? 'border-brand-500 bg-brand-50'
              : 'border-gray-200 hover:border-gray-300'}`}
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-dark-900">{theme.name || `Tema ${idx + 1}`}</h4>
            {selected === idx && (
              <Badge color="brand" size="sm"><Check size={10} className="mr-1" />Dipilih</Badge>
            )}
          </div>
          {theme.concept && (
            <p className="text-sm text-dark-600 mb-2">{theme.concept}</p>
          )}
          {theme.colorPalette && (
            <div className="flex items-center gap-1.5 mt-2">
              {(Array.isArray(theme.colorPalette) ? theme.colorPalette : []).map((color, ci) => (
                <div
                  key={ci}
                  className="w-6 h-6 rounded-full border border-gray-200"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function TimelineSection({ data }) {
  if (!data) return <Skeleton />;
  const items = Array.isArray(data) ? data : data.items || [];
  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Badge color="brand" size="sm">{item.phase || `H-${30 - idx * 7}`}</Badge>
          <span className="text-sm font-medium text-dark-900 flex-1">{item.title}</span>
          <span className="text-xs text-dark-500">{item.dueDate ? formatDate(item.dueDate) : ''}</span>
        </div>
      ))}
    </div>
  );
}

function RundownSection({ data }) {
  if (!data) return <Skeleton />;
  const items = Array.isArray(data) ? data : data.items || [];
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-3 py-2 text-left text-xs font-semibold text-dark-500">Waktu</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-dark-500">Agenda</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-dark-500">PIC</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((item, idx) => (
            <tr key={idx}>
              <td className="px-3 py-2 text-dark-600">{item.startTime} - {item.endTime}</td>
              <td className="px-3 py-2 font-medium text-dark-900">{item.agenda}</td>
              <td className="px-3 py-2 text-dark-600">{item.pic || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ChecklistSection({ data }) {
  if (!data) return <Skeleton />;
  const items = Array.isArray(data) ? data : data.items || [];
  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2 p-2">
          <div className="w-4 h-4 rounded border-2 border-gray-300" />
          <span className="text-sm text-dark-800">{item.label || item.name}</span>
          {item.category && (
            <Badge color="gray" size="sm">{item.category}</Badge>
          )}
        </div>
      ))}
    </div>
  );
}

function BudgetSection({ data }) {
  if (!data) return <Skeleton />;
  const items = Array.isArray(data) ? data : data.items || [];
  return (
    <div className="space-y-4">
      {data.summary && (
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-dark-500">Total</p>
            <p className="font-bold text-dark-900">{formatCurrency(data.summary.total)}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-dark-500">Rencana</p>
            <p className="font-bold text-dark-900">{formatCurrency(data.summary.planned)}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-dark-500">Aktual</p>
            <p className="font-bold text-dark-900">{formatCurrency(data.summary.actual)}</p>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-3 py-2 text-left text-xs font-semibold text-dark-500">Item</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-dark-500">Anggaran</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-dark-500">Kategori</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item, idx) => (
              <tr key={idx}>
                <td className="px-3 py-2 text-dark-900">{item.name}</td>
                <td className="px-3 py-2 text-right text-dark-700">{formatCurrency(item.plannedCost)}</td>
                <td className="px-3 py-2 text-dark-600">{item.category || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TasksSection({ data }) {
  if (!data) return <Skeleton />;
  const items = Array.isArray(data) ? data : data.items || [];
  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-brand-500" />
          <span className="text-sm font-medium text-dark-900 flex-1">{item.title}</span>
          {item.assignee && <span className="text-xs text-dark-500">{item.assignee}</span>}
          {item.priority && (
            <Badge
              color={item.priority === 'high' ? 'red' : item.priority === 'medium' ? 'yellow' : 'gray'}
              size="sm"
            >
              {item.priority}
            </Badge>
          )}
        </div>
      ))}
    </div>
  );
}

function RisksSection({ data }) {
  if (!data) return <Skeleton />;
  const items = Array.isArray(data) ? data : data.items || [];
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-3 py-2 text-left text-xs font-semibold text-dark-500">Risiko</th>
            <th className="px-3 py-2 text-center text-xs font-semibold text-dark-500">Probabilitas</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-dark-500">Mitigasi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((item, idx) => (
            <tr key={idx}>
              <td className="px-3 py-2 text-dark-900">{item.risk || item.name}</td>
              <td className="px-3 py-2 text-center">
                <Badge
                  color={item.probability === 'high' ? 'red' : item.probability === 'medium' ? 'yellow' : 'green'}
                  size="sm"
                >
                  {item.probability || '-'}
                </Badge>
              </td>
              <td className="px-3 py-2 text-dark-600">{item.mitigation || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DocumentsSection({ data }) {
  if (!data) return <Skeleton />;
  const items = Array.isArray(data) ? data : data.items || [];
  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Badge color={item.type === 'brief' ? 'blue' : 'gray'} size="sm">{item.type || 'doc'}</Badge>
          <span className="text-sm font-medium text-dark-900 flex-1">{item.title || item.name}</span>
        </div>
      ))}
    </div>
  );
}

function EvaluationSection({ data }) {
  if (!data) return <Skeleton />;
  const items = Array.isArray(data) ? data : data.criteria || [];
  return (
    <div className="space-y-3">
      {(items.length ? items : ['Komunikasi', 'Ketepatan Waktu', 'Kualitas', 'Profesionalisme']).map((item, idx) => {
        const label = typeof item === 'string' ? item : item.name || item.label;
        return (
          <div key={idx} className="p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-dark-800">{label}</span>
            {typeof item === 'object' && item.description && (
              <p className="text-xs text-dark-500 mt-1">{item.description}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

const sectionRenderers = {
  brief: BriefSection,
  themes: ThemesSection,
  concept: BriefSection,
  timeline: TimelineSection,
  rundown: RundownSection,
  checklist: ChecklistSection,
  budget: BudgetSection,
  tasks: TasksSection,
  risks: RisksSection,
  documents: DocumentsSection,
  evaluation: EvaluationSection,
};

export default function AIResultViewer({ results = {}, onSave, onRegenerate, activeTab: controlledTab, eventData }) {
  const [internalTab, setInternalTab] = useState('brief');
  const [exporting, setExporting] = useState(false);
  const activeTab = controlledTab || internalTab;

  const availableTabs = tabList.filter((t) => results[t.key] !== undefined);
  const SectionComponent = sectionRenderers[activeTab] || BriefSection;

  const handleExportDocx = async () => {
    setExporting(true);
    try {
      const response = await reportService.exportAiResultDocx(
        eventData || { event_name: 'Event', event_date: new Date().toISOString().split('T')[0] },
        results
      );
      // Download the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Event-${(results.event_brief?.event_name || eventData?.event_name || 'AI-Generate').replace(/[^a-zA-Z0-9]/g, '-')}.docx`);
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
      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {availableTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setInternalTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                ${activeTab === tab.key
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-dark-500 hover:text-dark-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 min-h-[200px]">
        <SectionComponent data={results[activeTab]} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
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
