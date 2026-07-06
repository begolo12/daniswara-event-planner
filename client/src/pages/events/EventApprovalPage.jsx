import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Send, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { approvals } from '../../services/eventSubService';
import eventService from '../../services/eventService';
import { APPROVAL_STATUSES } from '../../utils/constants';
import { formatDateTime } from '../../utils/formatters';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import FormTextarea from '../../components/ui/FormTextarea';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/ui/StatusBadge';

export default function EventApprovalPage() {
  const { id: eventId } = useParams();
  const [approvalList, setApprovalList] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState('approve');
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [approvalsRes, eventRes] = await Promise.all([
        approvals.list(eventId),
        eventService.getById(eventId),
      ]);
      setApprovalList(approvalsRes.data.data || []);
      setEvent(eventRes.data.data);
    } catch {
      toast.error('Gagal memuat data persetujuan');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmitForApproval = async () => {
    setSubmitting(true);
    try {
      await eventService.submitForApproval(eventId);
      toast.success('Berhasil diajukan untuk persetujuan');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengajukan persetujuan');
    } finally {
      setSubmitting(false);
      setConfirmSubmit(false);
    }
  };

  const openReview = (action) => {
    setReviewAction(action);
    setReviewNotes('');
    setShowReviewModal(true);
  };

  const handleReview = async () => {
    setSubmitting(true);
    try {
      if (reviewAction === 'approve') {
        await eventService.approve(eventId, reviewNotes);
        toast.success('Event berhasil disetujui');
      } else if (reviewAction === 'reject') {
        await eventService.reject(eventId, reviewNotes);
        toast.success('Event ditolak');
      } else if (reviewAction === 'revision') {
        await eventService.changeStatus(eventId, 'draft');
        toast.success('Event dikembalikan untuk revisi');
      }
      setShowReviewModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memproses persetujuan');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const eventStatus = event?.status;
  const canSubmit = eventStatus === 'draft' || eventStatus === 'planning';
  const isApproval = eventStatus === 'approval';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-dark-900">Persetujuan Event</h2>
          {event && <StatusBadge status={eventStatus} />}
        </div>
        <div className="flex items-center gap-2">
          {canSubmit && (
            <Button
              variant="primary"
              size="sm"
              icon={<Send />}
              loading={submitting}
              onClick={() => setConfirmSubmit(true)}
            >
              Ajukan Persetujuan
            </Button>
          )}
          {isApproval && (
            <>
              <Button variant="primary" size="sm" icon={<CheckCircle />} onClick={() => openReview('approve')}>
                Setujui
              </Button>
              <Button variant="secondary" size="sm" icon={<RefreshCw />} onClick={() => openReview('revision')}>
                Revisi
              </Button>
              <Button variant="danger" size="sm" icon={<XCircle />} onClick={() => openReview('reject')}>
                Tolak
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Approval History */}
      {approvalList.length === 0 ? (
        <EmptyState
          icon={Send}
          title="Belum ada riwayat persetujuan"
          message={canSubmit ? 'Ajukan event untuk persetujuan pertama kali.' : 'Riwayat persetujuan akan muncul di sini.'}
          action={
            canSubmit ? (
              <Button variant="primary" icon={<Send />} onClick={() => setConfirmSubmit(true)}>
                Ajukan Persetujuan
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {approvalList.map((approval) => (
            <Card key={approval.id || approval._id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={approval.status || 'pending'} />
                    <span className="text-xs text-dark-400">
                      {formatDateTime(approval.createdAt)}
                    </span>
                  </div>
                  {approval.reviewer && (
                    <p className="text-sm text-dark-700">
                      <span className="font-medium">{approval.reviewer}</span>
                      {' '}memberikan keputusan
                    </p>
                  )}
                  {approval.notes && (
                    <p className="text-sm text-dark-500 mt-1 bg-gray-50 rounded-lg p-3">
                      {approval.notes}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title={
          reviewAction === 'approve' ? 'Setujui Event' :
          reviewAction === 'reject' ? 'Tolak Event' :
          'Revisi Event'
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setShowReviewModal(false)} disabled={submitting}>
              Batal
            </Button>
            <Button
              variant={reviewAction === 'approve' ? 'primary' : reviewAction === 'reject' ? 'danger' : 'secondary'}
              loading={submitting}
              onClick={handleReview}
            >
              {reviewAction === 'approve' ? 'Setujui' : reviewAction === 'reject' ? 'Tolak' : 'Kembalikan'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormTextarea
            label="Catatan"
            name="notes"
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder={
              reviewAction === 'approve' ? 'Catatan persetujuan (opsional)...' :
              reviewAction === 'reject' ? 'Alasan penolakan...' :
              'Catatan revisi yang diperlukan...'
            }
            rows={4}
          />
        </div>
      </Modal>

      {/* Submit Confirmation */}
      <ConfirmDialog
        isOpen={confirmSubmit}
        onClose={() => setConfirmSubmit(false)}
        onConfirm={handleSubmitForApproval}
        title="Ajukan Persetujuan"
        message="Event akan diajukan kepada approver. Setelah diajukan, status akan berubah menjadi 'Menunggu Persetujuan'. Lanjutkan?"
        confirmText="Ajukan"
      />
    </div>
  );
}
