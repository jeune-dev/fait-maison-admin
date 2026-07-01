import { useState } from 'react';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet';
import { envoyerNotificationGlobale } from '../../api/notifications.api';
import ConfirmModal from '../../components/common/ConfirmModal';
import FormField from '../../components/forms/FormField';

const TYPES = [
  { value: 'info', label: 'Information' },
  { value: 'promotion', label: 'Promotion' },
  { value: 'alerte', label: 'Alerte' },
];

const EMPTY_FORM = { titre: '', message: '', type: 'info' };

export default function NotificationGlobalePage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((err) => ({ ...err, [name]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.titre.trim()) e.titre = 'Le titre est requis';
    if (!form.message.trim()) e.message = 'Le message est requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSend = async () => {
    setSending(true);
    try {
      await envoyerNotificationGlobale(form);
      toast.success('Notification globale envoyée avec succès');
      setForm(EMPTY_FORM);
    } catch {
      toast.error("Erreur lors de l'envoi de la notification");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <Helmet><title>Notification globale — Fait Maison Admin</title></Helmet>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Notification globale</h1>
          <p>Envoyer une notification à tous les utilisateurs de la plateforme</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 560 }}>
        <div className="card-header">
          <span className="card-title">Nouvelle notification</span>
        </div>
        <div className="card-body">
          <FormField
            label="Titre" name="titre" value={form.titre} onChange={handleChange}
            error={errors.titre} required placeholder="Titre de la notification"
          />
          <FormField
            label="Message" name="message" as="textarea" value={form.message} onChange={handleChange}
            error={errors.message} required placeholder="Contenu du message"
          />
          <div className="form-field">
            <label className="form-label" htmlFor="type">Type</label>
            <select id="type" name="type" className="form-select" value={form.type} onChange={handleChange}>
              {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => { if (validate()) setConfirmOpen(true); }}
            disabled={sending}
          >
            {sending ? 'Envoi...' : 'Envoyer la notification'}
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleSend}
        title="Envoyer la notification globale"
        message={`Voulez-vous envoyer la notification "${form.titre}" à tous les utilisateurs ?`}
        confirmLabel="Envoyer"
        variant="warning"
      />
    </div>
  );
}
