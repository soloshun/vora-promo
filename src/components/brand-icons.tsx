import React from "react";

/**
 * Monochrome destination glyphs, drawn to sit inside the coloured tiles used
 * in the Distribution scene. They mirror the set the product ships in
 * `src/components/shared/brand-icons.tsx`.
 */

type IconProps = { size?: number; color?: string };

export const YouTubeIcon: React.FC<IconProps> = ({
  size = 24,
  color = "currentColor",
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M23.5 6.9a3 3 0 0 0-2.1-2.1C19.5 4.3 12 4.3 12 4.3s-7.5 0-9.4.5A3 3 0 0 0 .5 6.9C0 8.8 0 12 0 12s0 3.2.5 5.1a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.1.5-5.1s0-3.2-.5-5.1ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" />
  </svg>
);

export const InstagramIcon: React.FC<IconProps> = ({
  size = 24,
  color = "currentColor",
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4a3.9 3.9 0 0 1-1.4-.9 3.9 3.9 0 0 1-.9-1.4c-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4 1.3-.1 1.7-.1 4.8-.1Zm0 3.2a6.6 6.6 0 1 0 0 13.2 6.6 6.6 0 0 0 0-13.2Zm0 10.9a4.3 4.3 0 1 1 0-8.6 4.3 4.3 0 0 1 0 8.6Zm8.4-11.2a1.5 1.5 0 1 1-3.1 0 1.5 1.5 0 0 1 3.1 0Z" />
  </svg>
);

export const LinkedInIcon: React.FC<IconProps> = ({
  size = 24,
  color = "currentColor",
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM2.9 21.5h4.2V9.6H2.9v11.9ZM9.5 9.6h4v1.6h.1c.6-1 1.9-2 3.9-2 4.2 0 5 2.7 5 6.2v6.1h-4.2v-5.4c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9v5.5H9.5V9.6Z" />
  </svg>
);

export const TikTokIcon: React.FC<IconProps> = ({
  size = 24,
  color = "currentColor",
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M16.6 2h-3.2v13.2a2.7 2.7 0 1 1-2.7-2.7c.3 0 .5 0 .8.1V9.3a6 6 0 1 0 5.1 5.9V8.5c1 .8 2.3 1.3 3.7 1.3V6.6a4.2 4.2 0 0 1-3.7-4.6Z" />
  </svg>
);

export const CheckIcon: React.FC<IconProps> = ({
  size = 24,
  color = "currentColor",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={3}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m4 12.5 5.5 5.5L20 6.5" />
  </svg>
);

export const PlayIcon: React.FC<IconProps> = ({
  size = 24,
  color = "currentColor",
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M7 4.5 20 12 7 19.5V4.5Z" />
  </svg>
);

export const ShieldIcon: React.FC<IconProps> = ({
  size = 24,
  color = "currentColor",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2.5 4 6v6c0 5 3.4 8.4 8 9.5 4.6-1.1 8-4.5 8-9.5V6l-8-3.5Z" />
    <path d="m8.6 12 2.4 2.4 4.4-4.6" />
  </svg>
);

export const ArrowRightIcon: React.FC<IconProps> = ({
  size = 24,
  color = "currentColor",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
);
