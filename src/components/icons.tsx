export function BrandLogo() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-primary"
    >
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <path
        d="M9 23V9H13.5C15.9853 9 18 11.0147 18 13.5V13.5C18 15.9853 15.9853 18 13.5 18H9"
        stroke="hsl(var(--primary-foreground))"
        strokeWidth="2"
      />
      <path
        d="M14 23L23 9"
        stroke="hsl(var(--primary-foreground))"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
