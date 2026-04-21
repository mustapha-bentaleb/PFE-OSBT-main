import { useState, useEffect } from 'react';

const DEFAULT_ICON = 'FaUserCircle';
const DEFAULT_COLOR = '#6366f1';

function normalizeHex(color) {
  if (!color || typeof color !== 'string') return DEFAULT_COLOR;
  const c = color.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(c)) return c;
  return DEFAULT_COLOR;
}

/**
 * Renders a react-icons FA icon when the package is installed; otherwise shows initials in a colored circle.
 * Run: npm install (so react-icons is present in node_modules).
 */
const ProfileAvatar = ({
  icon,
  color,
  size = 32,
  className = '',
  initial = '?',
}) => {
  const [IconComponent, setIconComponent] = useState(undefined);

  useEffect(() => {
    let cancelled = false;
    setIconComponent(undefined);

    import('react-icons/fa')
      .then((FaIcons) => {
        if (cancelled) return;
        const name = icon && FaIcons[icon] ? icon : DEFAULT_ICON;
        const Cmp = FaIcons[name] || FaIcons[DEFAULT_ICON];
        setIconComponent(() => (typeof Cmp === 'function' ? Cmp : null));
      })
      .catch(() => {
        if (!cancelled) setIconComponent(null);
      });

    return () => {
      cancelled = true;
    };
  }, [icon]);

  const fill = normalizeHex(color);
  const letter = (initial && String(initial).charAt(0).toUpperCase()) || '?';
  const dim = `${size}px`;
  const showIcon = typeof IconComponent === 'function';

  if (!showIcon) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white shadow-sm ${className}`}
        style={{
          width: dim,
          minWidth: dim,
          height: dim,
          backgroundColor: fill,
          fontSize: Math.max(12, Math.round(size * 0.42)),
        }}
        aria-hidden
      >
        {letter}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full ring-2 ring-white/20 ${className}`}
      style={{ color: fill, width: dim, height: dim }}
      aria-hidden
    >
      <IconComponent size={size} />
    </span>
  );
};

export default ProfileAvatar;
