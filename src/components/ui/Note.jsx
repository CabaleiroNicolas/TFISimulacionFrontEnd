export function Note({ variant = '', icon, title, children }) {
  return (
    <div className={`note${variant ? ' ' + variant : ''}`}>
      {icon && (
        <div className="icon-wrap">
          {icon}
        </div>
      )}
      <div>
        {title && <div style={{ fontWeight: 500, fontSize: 13 }}>{title}</div>}
        {children && (
          <div className="xs ink-3" style={{ marginTop: title ? 4 : 0 }}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
