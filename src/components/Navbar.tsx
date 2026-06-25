import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Mail, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';
import { getSiteSettings, SiteWebSettings } from '../lib/dataStore';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();
  const [settings, setSettings] = useState<SiteWebSettings>(getSiteSettings());

  useEffect(() => {
    // Refresh settings occasionally or on mount
    const handleSync = () => setSettings(getSiteSettings());
    window.addEventListener('storage', handleSync);
    window.addEventListener('cama_settings_updated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('cama_settings_updated', handleSync);
    };
  }, []);

  const navLinks = [
    { name: t('Accueil', 'Home'), path: '/' },
    ...(settings.menuVisibility?.about !== false ? [{ name: t('À propos', 'About US'), path: '/about' }] : []),
    ...(settings.menuVisibility?.services !== false ? [{ name: t('Services', 'Services'), path: '/services' }] : []),
    ...(settings.menuVisibility?.news !== false ? [{ name: t('Actualités', 'News'), path: '/news' }] : []),
    ...(settings.menuVisibility?.contact !== false ? [{ name: t('Contact', 'Contact Us'), path: '/contact' }] : []),
  ];

  return (
    <header className="bg-white shadow transition-colors">
      {/* Top Bar - Info & Contact */}
      <div className="bg-[#008a4b] text-white text-xs py-2 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex space-x-6">
            <span className="flex items-center"><Phone className="w-3 h-3 mr-2" /> {settings.footer?.phone || "+226 25 00 00 00"}</span>
            <span className="flex items-center"><Mail className="w-3 h-3 mr-2" /> {settings.footer?.email || "contact@cama.bf"}</span>
            <span className="flex items-center"><MapPin className="w-3 h-3 mr-2" /> Ouagadougou, Burkina Faso</span>
          </div>
          <div className="flex space-x-4 font-semibold">
            {settings.menuVisibility?.vision !== false && (
              <Link to="/vision" className="hover:text-yellow-300 cursor-pointer transition-colors">{t('Notre Vision', 'Our Vision')}</Link>
            )}
            {settings.menuVisibility?.rgpd !== false && (
              <Link to="/rgpd" className="hover:text-yellow-300 cursor-pointer transition-colors">{t('RGPD & Confidentialité', 'GDPR & Privacy')}</Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2.5">
              <img 
                src={settings.logoUrl || "/src/assets/images/cama_logo_1782214925115.jpg"} 
                alt="Logo CAMA" 
                style={{ height: `${settings.logoWidth || 64}px`, width: `${settings.logoWidth || 64}px` }}
                className="object-contain rounded-full shadow-sm bg-white"
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-xl text-gray-900 leading-tight tracking-wider transition-colors">
                  {settings.siteTitle || "CAMA"}
                </span>
                <span className="text-[9px] uppercase text-gray-500 font-extrabold tracking-widest hidden sm:block transition-colors max-w-[280px]">
                  {settings.siteSlogan || t("Caisse d'Assurance Maladie des Armées", "Military Health Insurance Fund")}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:ml-6 md:flex md:items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  location.pathname === link.path 
                    ? "text-[#008a4b] bg-green-50" 
                    : "text-gray-700 hover:text-[#008a4b] hover:bg-gray-50"
                )}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="ml-4 flex items-center space-x-3">
              <Link 
                to="/login"
                className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-4 py-2 rounded-md text-sm font-bold shadow-sm transition-colors"
              >
                {t('Espace Assuré', 'Insured Portal')}
              </Link>
              <Link 
                to="/admin"
                className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
              >
                {t('Intranet', 'Intranet')}
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu with AnimatePresence */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden border-t border-gray-200 overflow-hidden bg-white text-left"
          >
            <div className="pt-2 pb-3 space-y-1 bg-white transition-colors">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "block px-4 py-2.5 text-base font-semibold border-l-4 transition-all",
                    location.pathname === link.path 
                      ? "bg-green-50 text-[#008a4b] border-[#008a4b]" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <div className="p-4 flex flex-col space-y-2">
                <Link 
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-4 py-2.5 rounded-lg text-sm font-bold shadow-md transition-colors"
                >
                  {t('Espace Assuré', 'Insured Portal')}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
