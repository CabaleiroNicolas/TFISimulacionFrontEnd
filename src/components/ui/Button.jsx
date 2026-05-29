export function Button({
  variant = 'secondary',
  size = '',
  disabled = false,
  onClick,
  type = 'button',
  children,
  className = '',
}) {
  const cls = ['btn', variant, size, className].filter(Boolean).join(' ');
  return (
    <button className={cls} type={type} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
