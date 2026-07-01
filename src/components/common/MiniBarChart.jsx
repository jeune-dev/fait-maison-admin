import { memo } from 'react';

/**
 * Mini graphique en barres, en CSS pur (aucune dépendance externe).
 * data: tableau d'objets { [labelKey]: string, [valueKey]: number }
 */
const MiniBarChart = memo(function MiniBarChart({ data, labelKey, valueKey, formatValue }) {
  if (!data || data.length === 0) {
    return <div className="mini-chart-empty">Aucune donnée disponible</div>;
  }

  const max = Math.max(...data.map((d) => Number(d[valueKey]) || 0), 1);

  return (
    <div className="mini-chart">
      {data.map((d, i) => {
        const value = Number(d[valueKey]) || 0;
        const heightPct = Math.max((value / max) * 100, 2);
        return (
          <div className="mini-chart-col" key={d[labelKey] ?? i}>
            <span className="mini-chart-value">{formatValue ? formatValue(value) : value}</span>
            <div className="mini-chart-bar" style={{ height: `${heightPct}%` }} title={String(value)} />
            <span className="mini-chart-label">{d[labelKey] ?? '—'}</span>
          </div>
        );
      })}
    </div>
  );
});

export default MiniBarChart;
