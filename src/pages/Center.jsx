import { useState, useEffect } from 'react';
import { Check, AlertTriangle } from 'lucide-react';
import { useCenter, useUpdateCenter } from '../hooks/useCenter';
import { Note } from '../components/ui/Note';

const FIELDS = [
  { key: 'nombre',               label: 'Nombre del centro',               type: 'text', hint: '' },
  { key: 'cuit',                 label: 'CUIT',                            type: 'text', hint: '' },
  { key: 'direccion',            label: 'Dirección',                       type: 'text', hint: '' },
  { key: 'responsable',          label: 'Responsable operativo',           type: 'text', hint: '' },
  { key: 'cantMonitoresPromedio',label: 'Promedio de monitores / jornada', type: 'text', inputMode: 'numeric', hint: 'Cantidad promedio de monitores que ingresan al centro por jornada' },
];

export function CenterPage() {
  const { data, loading, error: loadError } = useCenter();
  const { update, loading: saving, error: saveError } = useUpdateCenter();

  const [form, setForm]   = useState({});
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({ ...data });
      setDirty(false);
    }
  }, [data]);

  function handleChange(key, value) {
    const parsed = key === 'cantMonitoresPromedio' ? value.replace(/[^0-9]/g, '').slice(0, 8) : value;
    setForm(prev => ({ ...prev, [key]: parsed }));
    setDirty(true);
    setSaved(false);
  }

  async function handleSave() {
    try {
      const updated = await update(form);
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
          <h1 className="page">Datos del centro</h1>
          <p className="lead">Información general del centro de reciclaje.</p>
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
        <Note icon={<AlertTriangle size={16} />} variant="danger" title="No se pudieron cargar los datos">
          {loadError}
        </Note>
      )}
      {saveError && (
        <Note icon={<AlertTriangle size={16} />} variant="danger" title="Error al guardar">
          {saveError}
        </Note>
      )}

      <div className="card">
        <div className="grid g-2" style={{ gap: 16 }}>
          {FIELDS.map(({ key, label, type, inputMode, hint }) => (
            <div className="field" key={key}>
              <label>{label}</label>
              <input
                className={`input${inputMode === 'numeric' ? ' num' : ''}`}
                type={type}
                inputMode={inputMode}
                maxLength={inputMode === 'numeric' ? 8 : undefined}
                value={loading ? '' : (form[key] ?? '')}
                disabled={loading}
                onChange={e => handleChange(key, e.target.value)}
              />
              {hint && <div className="hint">{hint}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
