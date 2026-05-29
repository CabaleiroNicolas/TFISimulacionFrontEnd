import { useLocation, useNavigate } from 'react-router-dom';
import { ResultsView } from './SimulationPage';

export function HistorialDetailPage() {
  const { state } = useLocation();
  const navigate  = useNavigate();

  if (!state?.sim) {
    return (
      <div className="content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 80, gap: 16 }}>
        <h1 className="page" style={{ textAlign: 'center' }}>Simulación no encontrada</h1>
        <p className="lead" style={{ textAlign: 'center' }}>Accedé desde el historial para ver el detalle.</p>
        <button className="btn secondary" onClick={() => navigate('/historial')}>
          Volver al historial
        </button>
      </div>
    );
  }

  return <ResultsView sim={state.sim} readOnly />;
}
