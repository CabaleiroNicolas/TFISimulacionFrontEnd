import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { HomePage }             from './pages/Home';
import { NewSimulationPage }    from './pages/NewSimulation';
import { SimulationPage }       from './pages/SimulationPage';
import { HistoryPage }          from './pages/History';
import { HistorialDetailPage }  from './pages/HistorialDetail';
import { PricesPage }           from './pages/Prices';
import { CenterPage }           from './pages/Center';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/"                    element={<HomePage />} />
        <Route path="/simulaciones/nueva"  element={<NewSimulationPage />} />
        <Route path="/simulaciones/:id"    element={<SimulationPage />} />
        <Route path="/historial"           element={<HistoryPage />} />
        <Route path="/historial/:index"    element={<HistorialDetailPage />} />
        <Route path="/precios"             element={<PricesPage />} />
        <Route path="/centro"             element={<CenterPage />} />
        <Route path="*"                    element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
