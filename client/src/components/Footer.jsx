import { Link } from 'react-router-dom';
import { useT } from '../context/TranslationContext';

function FishLogo() {
  return (
    <svg viewBox="0 0 36 22" width="28" height="18" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="16" cy="11" rx="13" ry="8" fill="currentColor" />
      <polygon points="29,11 36,4 36,18" fill="currentColor" />
      <circle cx="9" cy="8" r="2.2" fill="rgba(0,0,0,0.25)" />
    </svg>
  );
}
function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}
function IconFacebook() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
function IconYouTube() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
    </svg>
  );
}

export default function Footer() {
  const { t } = useT();
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer-v2">
      <div className="footer-inner">
        <div className="footer-brand-col">
          <div className="footer-logo">
            <FishLogo />
            <span>AngelMate</span>
          </div>
          <p className="footer-tagline">
            Dein digitaler Begleiter am Wasser.<br />
            Für Angler. Für die Natur.
          </p>
          <div className="footer-social">
            <a href="#" aria-label="Instagram" className="footer-social-btn"><IconInstagram /></a>
            <a href="#" aria-label="Facebook" className="footer-social-btn"><IconFacebook /></a>
            <a href="#" aria-label="YouTube" className="footer-social-btn"><IconYouTube /></a>
          </div>
        </div>

        <div className="footer-col">
          <h4>App</h4>
          <Link to="/">Dashboard</Link>
          <Link to="/catches">{t('nav.catches')}</Link>
          <Link to="/spots">{t('nav.spots_full')}</Link>
          <Link to="/forecast">{t('nav.forecast')}</Link>
          <Link to="/community">{t('nav.community')}</Link>
        </div>

        <div className="footer-col">
          <h4>Rechtliches</h4>
          <Link to="/impressum">{t('footer.impressum')}</Link>
          <Link to="/privacy">{t('footer.privacy')}</Link>
          <Link to="/guidelines">{t('footer.guidelines')}</Link>
        </div>

        <div className="footer-col">
          <h4>Über uns</h4>
          <Link to="/impressum">Kontakt</Link>
          <Link to="/guidelines">Hilfe &amp; Support</Link>
          <Link to="/report">Feedback</Link>
        </div>
      </div>
      <div className="footer-bottom">
        © {year} AngelMate. Alle Rechte vorbehalten.
      </div>
    </footer>
  );
}
