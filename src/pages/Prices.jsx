import { useState, useEffect } from 'react';
import { Check, AlertTriangle } from 'lucide-react';
import { usePrices, useUpdatePrices } from '../hooks/usePrices';
import { Note } from '../components/ui/Note';

// Metadatos de cada material: etiqueta visible, unidad de precio y agrupación
const MATERIALES_META = [
  // Metales base
  { key: 'cobre',          label: 'Cobre',             unidad: '$ / kg', grupo: 'Metales base' },
  { key: 'aluminio',       label: 'Aluminio',           unidad: '$ / kg', grupo: 'Metales base' },
  { key: 'acero',          label: 'Acero',              unidad: '$ / kg', grupo: 'Metales base' },
  { key: 'niquel',         label: 'Níquel',             unidad: '$ / gr', grupo: 'Metales base' },
  { key: 'estanio',        label: 'Estaño',             unidad: '$ / gr', grupo: 'Metales base' },
  // Metales preciosos
  { key: 'oro',            label: 'Oro',                unidad: '$ / gr', grupo: 'Metales preciosos' },
  { key: 'plata',          label: 'Plata',              unidad: '$ / gr', grupo: 'Metales preciosos' },
  { key: 'paladio',        label: 'Paladio',            unidad: '$ / gr', grupo: 'Metales preciosos' },
  { key: 'indio',          label: 'Indio',              unidad: '$ / gr', grupo: 'Metales preciosos' },
  // Plásticos
  { key: 'plastABS',       label: 'Plástico ABS',       unidad: '$ / kg', grupo: 'Plásticos' },
  { key: 'plastPC',        label: 'Plástico PC',        unidad: '$ / kg', grupo: 'Plásticos' },
  // Vidrio
  { key: 'vidrioPanelCRT', label: 'Vidrio panel CRT',   unidad: '$ / kg', grupo: 'Vidrio' },
  { key: 'vidrioPanelLCDLED', label: 'Vidrio panel LCD/LED', unidad: '$ / kg', grupo: 'Vidrio' },
  // Componentes electrónicos
  { key: 'placasPCB',      label: 'Placas PCB',         unidad: '$ / kg', grupo: 'Componentes' },
  { key: 'lc',             label: 'Cristal líquido (LC)', unidad: '$ / gr', grupo: 'Componentes' },
  { key: 'tirasLed',       label: 'Tiras LED',          unidad: '$ / gr', grupo: 'Componentes' },
];

const GRUPOS = ['Metales base', 'Metales preciosos', 'Plásticos', 'Vidrio', 'Componentes'];

export function PricesPage() {
  const { data: precios, loading, error: loadError } = usePrices();
  const { update, loading: saving, error: saveError } = useUpdatePrices();

  const [form, setForm]   = useState({});
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (precios) {
      setForm({ ...precios });
      setDirty(false);
    }
  }, [precios]);

  function handleChange(key, value) {
    // Permitir solo dígitos y un punto decimal
    const sanitized = value.replace(/[^0-9.]/g, '').replace(/^(\d*\.?\d*).*$/, '$1');
    setForm(prev => ({ ...prev, [key]: sanitized }));
    setDirty(true);
    setSaved(false);
  }

  async function handleSave() {
    // Convertir strings a números antes de enviar
    const parsed = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, parseFloat(v) || 0])
    );
    try {
      const updated = await update(parsed);
      if (updated) setForm({ ...updated });
      setDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      // el error se muestra desde saveError
    }
  }

  return (
    <div className="content page-enter">
      <div className="row between" style={{ marginBottom: 24, alignItems: 'flex-end' }}>
        <div>
          <h1 className="page">Precios de mercado</h1>
          <p className="lead">Variables exógenas configurables. Se usan en cada nueva simulación para calcular los ingresos por material.</p>
        </div>
        <button
          className={`btn ${saved ? 'secondary' : 'brand'}`}
          onClick={handleSave}
          disabled={saving || !dirty || loading}
        >
          <Check size={14} />
          {saved ? 'Guardado' : saving ? 'Guardando…' : 'Guardar cambios'}
          {dirty && !saved && (
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.7)', display: 'inline-block', marginLeft: 2 }} />
          )}
        </button>
      </div>

      {loadError && (
        <Note icon={<AlertTriangle size={16} />} variant="danger" title="No se pudieron cargar los precios">
          {loadError}
        </Note>
      )}
      {saveError && (
        <Note icon={<AlertTriangle size={16} />} variant="danger" title="Error al guardar">
          {saveError}
        </Note>
      )}

      <div className="stack stack-16">
        {GRUPOS.map(grupo => {
          const campos = MATERIALES_META.filter(m => m.grupo === grupo);
          return (
            <div className="card" key={grupo}>
              <h2 className="sec" style={{ marginBottom: 16 }}>{grupo}</h2>
              <div className="grid g-3" style={{ gap: 16 }}>
                {campos.map(({ key, label, unidad }) => (
                  <div className="field" key={key}>
                    <label>{label}</label>
                    <div className="input-wrap">
                      <span className="prefix">$</span>
                      <input
                        className="input with-prefix with-suffix num"
                        type="text"
                        inputMode="decimal"
                        value={loading ? '' : (form[key] ?? '')}
                        disabled={loading}
                        onChange={e => handleChange(key, e.target.value)}
                      />
                      <span className="suffix">{unidad.replace('$ / ', '')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
