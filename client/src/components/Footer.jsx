import { Link } from 'react-router-dom';
import { useT } from '../context/TranslationContext';

export default function Footer() {
  const { t } = useT();
  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        <span className="app-footer-brand">🎣 AngelMate</span>
        <span className="app-footer-sep">·</span>
        <Link to="/impressum" className="app-footer-link">{t('footer.impressum')}</Link>
        <span className="app-footer-sep">·</span>
        <Link to="/guidelines" className="app-footer-link">{t('footer.guidelines')}</Link>
        <span className="app-footer-sep">·</span>
        <Link to="/report" className="app-footer-link">🚩 {t('footer.report')}</Link>
        <span className="app-footer-sep">·</span>
        <Link to="/privacy" className="app-footer-link">{t('footer.privacy')}</Link>
        <span className="app-footer-sep">·</span>
        <span className="app-footer-copy">© {new Date().getFullYear()} Timo Hoffmann</span>
      </div>
    </footer>
  );
}
