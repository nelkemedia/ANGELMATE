export default function Avatar({ src, name, size = 36, className = '' }) {
  const letter = name?.[0]?.toUpperCase() ?? '📷';
  const style  = { width: size, height: size, minWidth: size, minHeight: size };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`avatar-img ${className}`}
        style={style}
      />
    );
  }

  return (
    <div className={`avatar-letter ${className}`} style={style}>
      {letter}
    </div>
  );
}
