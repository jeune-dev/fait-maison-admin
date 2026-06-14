import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import LOGO from '../../assets/images/logo.jpeg';

const MAX_ATTEMPTS = 3;
const FREEZE_SECONDS = 30;

const HTTP_ERRORS = {
  400: 'Données de connexion invalides.',
  401: 'Email ou mot de passe incorrect.',
  403: 'Accès refusé.',
  404: 'Service introuvable.',
  429: 'Trop de tentatives. Réessayez plus tard.',
  500: 'Erreur serveur. Réessayez dans quelques instants.',
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [frozen, setFrozen] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const startFreeze = useCallback(() => {
    setFrozen(true);
    setCountdown(FREEZE_SECONDS);
    let remaining = FREEZE_SECONDS;
    timerRef.current = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(timerRef.current);
        setFrozen(false);
        setAttempts(0);
        setCountdown(0);
      }
    }, 1000);
  }, []);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (frozen) return;
    if (!email.trim()) { toast.error("L'email est requis"); return; }
    if (!password) { toast.error('Le mot de passe est requis'); return; }

    setLoading(true);
    try {
      const utilisateur = await login(email.trim(), password);
      if (utilisateur.role !== 'Admin') {
        toast.error('Accès refusé. Ce portail est réservé aux administrateurs.');
        return;
      }
      toast.success('Connexion réussie !');
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      const msg = HTTP_ERRORS[status] || 'Erreur de connexion.';
      toast.error(msg);
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= MAX_ATTEMPTS) {
        toast.warning(`Trop de tentatives. Attente de ${FREEZE_SECONDS} secondes.`);
        startFreeze();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Connexion — Fait Maison Admin</title></Helmet>
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

          {frozen && (
            <div className="login-freeze-banner">
              Trop de tentatives — réessayez dans <strong>{countdown}s</strong>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                className="form-input"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={frozen}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="password">Mot de passe</label>
              <input
                id="password"
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={frozen}
              />
            </div>

            <button className="login-btn" type="submit" disabled={loading || frozen}>
              {loading ? (
                <>
                  <div className="spinner spinner-sm" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} />
                  Connexion...
                </>
              ) : frozen ? `Attente ${countdown}s...` : 'Se connecter'}
            </button>
          </form>

          <p className="login-foot">Accès réservé aux administrateurs</p>
        </div>
      </div>
    </>
  );
}
