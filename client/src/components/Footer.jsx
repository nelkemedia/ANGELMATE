import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        <span className="app-footer-brand">🎣 AngelMate</span>
        <span className="app-footer-sep">·</span>
        <Link to="/impressum" className="app-footer-link">Impressum</Link>
        <span className="app-footer-sep">·</span>
        <Link to="/guidelines" className="app-footer-link">Community-Richtlinien</Link>
        <span className="app-footer-sep">·</span>
        <Link to="/report" className="app-footer-link">🚩 Inhalt melden</Link>
        <span className="app-footer-sep">·</span>
        <Link to="/privacy" className="app-footer-link">Datenschutz</Link>
        <span className="app-footer-sep">·</span>
        <span className="app-footer-copy">© {new Date().getFullYear()} Timo Hoffmann</span>
      </div>
    </footer>
  );
}
