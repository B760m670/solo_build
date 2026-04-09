function Header() {
  return (
    <header className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold tracking-tight" style={{ color: 'var(--text)' }}>
          BRABBLE
        </span>
      </div>
      <div className="w-8 h-8 rounded-full" style={{ backgroundColor: 'var(--surface2)' }} />
    </header>
  );
}

export default Header;
