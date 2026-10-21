interface BunnyLogoProps {
  size?: number;
  className?: string;
}

export default function BunnyLogo({ size = 80, className = '' }: BunnyLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Hand-drawn sketch style bunny */}
      {/* Left ear */}
      <path
        d="M 38 48 C 30 35, 26 15, 34 8 C 42 2, 45 22, 44 46"
        stroke="var(--coffee)"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 35 38 C 32 26, 31 16, 35 12 C 39 8, 41 20, 40 38"
        stroke="var(--caramel)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Right ear */}
      <path
        d="M 52 46 C 54 22, 57 2, 65 8 C 73 15, 69 35, 61 48"
        stroke="var(--coffee)"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 58 38 C 59 20, 61 8, 65 12 C 69 16, 68 26, 64 38"
        stroke="var(--caramel)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Head */}
      <path
        d="M 34 56 C 24 64, 25 80, 38 88 C 45 92, 55 92, 62 88 C 75 80, 76 64, 66 56 C 60 50, 40 50, 34 56 Z"
        stroke="var(--espresso)"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Eyes */}
      <ellipse cx="42" cy="67" rx="2.5" ry="3.5" fill="var(--espresso)" />
      <ellipse cx="58" cy="67" rx="2.5" ry="3.5" fill="var(--espresso)" />
      {/* Nose & mouth */}
      <path
        d="M 48 73 C 50 72, 52 72, 53 73 C 51 75, 49 75, 48 73 Z"
        fill="var(--caramel)"
        stroke="var(--caramel)"
        strokeWidth="1"
      />
      <path
        d="M 50.5 74.5 L 50.5 78 M 47 77 C 49 79, 50.5 78, 50.5 78 C 50.5 78, 52 79, 54 77"
        stroke="var(--espresso)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Cheeks */}
      <circle cx="36" cy="73" r="3" fill="var(--almond)" opacity="0.6" />
      <circle cx="64" cy="73" r="3" fill="var(--almond)" opacity="0.6" />
    </svg>
  );
}
