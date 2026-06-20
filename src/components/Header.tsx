export default function Header() {
  return (
    <header className="flex items-start justify-between px-8 py-6 text-xs uppercase tracking-widest text-neutral-400">
      <div className="font-bold text-white text-sm tracking-wider">
        TYPE&middot;001
      </div>
      <nav className="flex gap-8">
        <a href="#" className="hover:text-white transition-colors">Works</a>
        <a href="#" className="hover:text-white transition-colors">About</a>
      </nav>
      <nav className="flex gap-8">
        <a href="#" className="hover:text-white transition-colors">Instagram</a>
        <span className="text-neutral-500">info@type001.com</span>
      </nav>
      <div className="text-right text-neutral-500">
        <div>Creative Studio</div>
        <div>New York, NY</div>
      </div>
    </header>
  );
}
