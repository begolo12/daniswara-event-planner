import React, { useState, useEffect, useCallback } from 'react';
import {
  Palette,
  ListOrdered,
  Clock,
  CheckSquare,
  DollarSign,
  Mic,
  MessageSquare,
  Mail,
  FileText,
  ClipboardList,
  FileBarChart,
  Star,
  Hash,
  File,
  ShieldAlert,
  Sparkles,
  Save,
  RefreshCw,
  Copy,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import FormSelect from '../../components/ui/FormSelect';
import FormTextarea from '../../components/ui/FormTextarea';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import aiService from '../../services/aiService';
import eventService from '../../services/eventService';

const GENERATORS = [
  { id: 'theme', icon: Palette, title: 'Tema & Konsep', description: 'Buat tema dan konsep event', type: 'theme' },
  { id: 'rundown', icon: ListOrdered, title: 'Rundown', description: 'Buat rundown detail acara', type: 'rundown' },
  { id: 'timeline', icon: Clock, title: 'Timeline', description: 'Buat timeline perencanaan', type: 'timeline' },
  { id: 'checklist', icon: CheckSquare, title: 'Checklist', description: 'Buat checklist persiapan', type: 'checklist' },
  { id: 'budget', icon: DollarSign, title: 'Anggaran', description: 'Buat perencanaan anggaran', type: 'budget' },
  { id: 'mc-script', icon: Mic, title: 'Naskah MC', description: 'Buat naskah pembawa acara', type: 'mc-script' },
  { id: 'speech', icon: MessageSquare, title: 'Pidato', description: 'Buat draft pidato', type: 'speech' },
  { id: 'invitation', icon: Mail, title: 'Undangan', description: 'Buat template undangan', type: 'invitation' },
  { id: 'proposal', icon: FileText, title: 'Proposal', description: 'Buat proposal event', type: 'proposal' },
  { id: 'tor', icon: ClipboardList, title: 'TOR', description: 'Buat Terms of Reference', type: 'tor' },
  { id: 'report', icon: FileBarChart, title: 'Laporan', description: 'Buat laporan event', type: 'report' },
  { id: 'evaluation', icon: Star, title: 'Evaluasi', description: 'Buat form evaluasi', type: 'evaluation' },
  { id: 'caption', icon: Hash, title: 'Caption Media Sosial', description: 'Buat caption untuk media sosial', type: 'caption' },
  { id: 'doc-brief', icon: File, title: 'Dokumen Brief', description: 'Buat brief dokumen', type: 'doc-brief' },
  { id: 'risk-plan', icon: ShieldAlert, title: 'Rencana Risiko', description: 'Buat rencana mitigasi risiko', type: 'risk-plan' },
];

export default function AIGeneratorCenterPage() {
  const [selectedGenerator, setSelectedGenerator] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ eventId: '', additionalParams: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [resultTab, setResultTab] = useState('preview');
  const [events, setEvents] = useState([]);

  useEffect(() => {
    eventService.list({ limit: 100 }).then((res) => {
      setEvents(res.data?.data || []);
    }).catch(() => {});
  }, []);

  const openGenerator = useCallback((gen) => {
    setSelectedGenerator(gen);
    setForm({ eventId: '', additionalParams: '' });
    setResult(null);
    setShowModal(true);
  }, []);

  const handleGenerate = async () => {
    if (!selectedGenerator) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await aiService.generate(form.eventId || undefined, selectedGenerator.type, {
        params: form.additionalParams,
      });
      setResult(res.data?.data || res.data);
      toast.success('Berhasil generate!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal generate');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const text = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
    navigator.clipboard.writeText(text).then(() => toast.success('Berhasil disalin'));
  };

  const handleSaveToEvent = async () => {
    if (!form.eventId || !result) {
      toast.error('Pilih event terlebih dahulu');
      return;
    }
    try {
      await aiService.generate(form.eventId, selectedGenerator.type, {
        params: form.additionalParams,
        save: true,
        result,
      });
      toast.success('Berhasil disimpan ke event');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-900">AI Generator Center</h1>
        <p className="text-sm text-dark-500 mt-1">Gunakan AI untuk membuat berbagai dokumen event secara otomatis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {GENERATORS.map((gen) => {
          const Icon = gen.icon;
          return (
            <div
              key={gen.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                  <Icon size={20} className="text-brand-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-dark-900 text-sm">{gen.title}</h3>
                  <p className="text-xs text-dark-500 mt-0.5">{gen.description}</p>
                </div>
              </div>
              <div className="mt-auto pt-2">
                <Button
                  size="sm"
                  className="w-full"
                  icon={<Sparkles size={14} />}
                  onClick={() => openGenerator(gen)}
                >
                  Generate
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && selectedGenerator && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={selectedGenerator.title}
          size="lg"
          footer={
            <>
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Tutup
              </Button>
              {result && (
                <>
                  <Button variant="secondary" icon={<Copy size={14} />} onClick={handleCopy}>
                    Salin
                  </Button>
                  {form.eventId && (
                    <Button variant="secondary" icon={<Save size={14} />} onClick={handleSaveToEvent}>
                      Simpan ke Event
                    </Button>
                  )}
                  <Button variant="outline" icon={<RefreshCw size={14} />} onClick={handleGenerate} loading={loading}>
                        Regenerate
                  </Button>
                </>
              )}
              <Button icon={<Sparkles size={14} />} onClick={handleGenerate} loading={loading}>
                Generate
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <FormSelect
              label="Event (opsional)"
              name="eventId"
              value={form.eventId}
              onChange={(e) => setForm((f) => ({ ...f, eventId: e.target.value }))}
              options={events.map((ev) => ({ value: ev.id, label: ev.name }))}
              placeholder="Tanpa event spesifik"
            />

            <FormTextarea
              label="Parameter Tambahan"
              name="additionalParams"
              value={form.additionalParams}
              onChange={(e) => setForm((f) => ({ ...f, additionalParams: e.target.value }))}
              placeholder="Deskripsikan kebutuhan spesifik Anda..."
              rows={3}
            />

            {loading && (
              <div className="flex flex-col items-center py-8">
                <LoadingSpinner size="md" />
                <p className="text-sm text-dark-500 mt-3">Sedang generate...</p>
              </div>
            )}

            {result && !loading && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setResultTab('preview')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      resultTab === 'preview'
                        ? 'text-brand-600 border-b-2 border-brand-600'
                        : 'text-dark-500 hover:text-dark-700'
                    }`}
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => setResultTab('raw')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      resultTab === 'raw'
                        ? 'text-brand-600 border-b-2 border-brand-600'
                        : 'text-dark-500 hover:text-dark-700'
                    }`}
                  >
                    Raw
                  </button>
                </div>
                <div className="p-4 max-h-80 overflow-y-auto bg-gray-50">
                  {resultTab === 'preview' ? (
                    <div className="text-sm text-dark-700 whitespace-pre-wrap leading-relaxed">
                      {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                    </div>
                  ) : (
                    <pre className="text-xs text-dark-600 font-mono whitespace-pre-wrap">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
