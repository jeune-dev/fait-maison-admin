import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet';
import { changerMotDePasse } from '../../api/password.api';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import LOGO from '../../assets/images/logo.jpeg';

export default function ChangePasswordPage() {
  const [form, setForm] = useState({ ancienMotDePasse: '', nouveauMotDePasse: '', confirmation: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { logout } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.ancienMotDePasse) e.ancienMotDePasse = 'Requis';
    if (!form.nouveauMotDePasse) e.nouveauMotDePasse = 'Requis';
    else if (form.nouveauMotDePasse.length < 8) e.nouveauMotDePasse = 'Minimum 8 caractères';
    if (form.nouveauMotDePasse !== form.confirmation) e.confirmation = 'Les mots de passe ne correspondent pas';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await changerMotDePasse(form);
      toast.success('Mot de passe modifié avec succès ! Reconnectez-vous.');
      await logout();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Erreur lors du changement de mot de passe.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Changement de mot de passe — Fait Maison Admin</title></Helmet>
      <div className="login-page">
        <div className="login-card">
          <div className="login-logo-row">
            <img className="login-logo-img" src={LOGO} alt="Fait Maison" />
            <div>
              <div className="login-brand-name">Fait Maison</div>
              <div className="login-brand-sub">Administration</div>
            </div>
          </div>
          <div className="login-divider" />

          <div className="change-pwd-banner">
            <strong>Première connexion détectée</strong>
            <p>Pour des raisons de sécurité, vous devez définir votre propre mot de passe avant de continuer.</p>
          </div>

          <form onSubmit={handleSubmit}>
            {[
              { name: 'ancienMotDePasse',  label: 'Mot de passe temporaire',          placeholder: '••••••••' },
              { name: 'nouveauMotDePasse', label: 'Nouveau mot de passe',              placeholder: 'Min. 8 chars, 1 majuscule, 1 chiffre, 1 spécial' },
              { name: 'confirmation',      label: 'Confirmer le nouveau mot de passe', placeholder: '••••••••' },
            ].map(({ name, label, placeholder }) => (
              <div className="form-field" key={name}>
                <label className="form-label" htmlFor={name}>{label}</label>
                <input
                  id={name} name={name} type="password"
                  className={`form-input${errors[name] ? ' input-error' : ''}`}
                  placeholder={placeholder}
                  value={form[name]}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
                {errors[name] && <div className="form-error">{errors[name]}</div>}
              </div>
            ))}
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? (
                <><div className="spinner spinner-sm" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} />Enregistrement...</>
              ) : 'Définir mon mot de passe'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
