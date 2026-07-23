export function Footer() {
  const currentYear = new Date().getFullYear();
  const yearRange = currentYear > 2026 ? `2026 - ${currentYear}` : "2026";

  return (
    <footer className="border-glass-border relative z-10 border-t py-3.5">
      <p className="text-muted text-center text-xs">
        © {yearRange} , developed by{" "}
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
