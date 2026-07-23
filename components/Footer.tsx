export function Footer() {
  const currentYear = new Date().getFullYear();
  const yearRange = currentYear > 2026 ? `2026 - ${currentYear}` : "2026";

  return (
    <footer className="relative z-10 border-t border-glass-border py-3.5">
      <p className="text-center text-xs text-muted">
        © {yearRange}, developed by{" "}
        <a
          href="https://github.com/SihyeonHong/mbest-timechecker"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          홍시현
        </a>
        . All rights reserved.
      </p>
    </footer>
  );
}
