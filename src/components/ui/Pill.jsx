export function Pill({ variant = '', dot = false, children, className = '' }) {
  return (
    <span className={`pill${variant ? ' ' + variant : ''}${className ? ' ' + className : ''}`}>
      {dot && <span className="dot" />}
      {children}
    </span>
  );
}
