export const formatDate = (date) => {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const formatMontant = (montant) => {
  if (montant === null || montant === undefined) return '—';
  const n = Number(montant);
  if (isNaN(n)) return '—';
  return n.toLocaleString('fr-FR') + ' FCFA';
};

export const formatStatut = (statut) => {
  const map = {
    actif: 'Actif',
    inactif: 'Inactif',
    suspendu: 'Suspendu',
    en_attente: 'En attente',
    traite: 'Traité',
    en_cours: 'En cours',
    expire: 'Expiré',
    active: 'Actif',
    inactive: 'Inactif',
  };
  if (!statut) return '—';
  return map[statut.toLowerCase()] || statut;
};
