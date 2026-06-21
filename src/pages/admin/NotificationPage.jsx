import { useState } from 'react';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet';
import { envoyerNotificationGlobale } from '../../api/moderation.api';

export default function NotificationPage() {
  const [titre, setTitre] = useState('');
  const [message, setMessage] = useState('');
  const [cible, setCible] = useState('tous');
  const [sending, setSending] = useState(false);

  const envoyer = async (e) => {
    e.preventDefault();
    if (!titre.trim() || !message.trim()) {
      toast.error('Titre et message requis');
      return;
    }
    setSending(true);
    try {
      await envoyerNotificationGlobale({
        titre: titre.trim(),
        message: message.trim(),
        type: 'systeme',
        cible,
      });
      toast.success('Notification envoyée');
      setTitre('');
      setMessage('');
    } catch {
      toast.error("Échec de l'envoi");
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
          <p>Envoyer une notification push à vos utilisateurs</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 600 }}>
        <div className="card-header"><span className="card-title">Nouveau message</span></div>
        <form onSubmit={envoyer} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Cible</label>
            <select className="form-select" value={cible} onChange={(e) => setCible(e.target.value)}
              style={{ padding: '0.6rem 0.75rem', borderRadius: 8, width: '100%' }}>
              <option value="tous">Tous les utilisateurs</option>
              <option value="acheteurs">Acheteurs</option>
              <option value="vendeurs">Vendeurs</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Titre</label>
            <input className="form-input" value={titre} onChange={(e) => setTitre(e.target.value)}
              placeholder="Titre de la notification"
              style={{ padding: '0.6rem 0.75rem', borderRadius: 8, width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Message</label>
            <textarea className="form-input" value={message} onChange={(e) => setMessage(e.target.value)}
              rows={4} placeholder="Contenu du message"
              style={{ padding: '0.6rem 0.75rem', borderRadius: 8, width: '100%', resize: 'vertical' }} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={sending}
            style={{ alignSelf: 'flex-start' }}>
            {sending ? 'Envoi…' : 'Envoyer la notification'}
          </button>
        </form>
      </div>
    </div>
  );
}
