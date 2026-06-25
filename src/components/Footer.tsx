import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSiteSettings, DEFAULT_SITE_SETTINGS } from '../lib/dataStore';

export default function Footer() {
  const [settings, setSettings] = useState<any>(DEFAULT_SITE_SETTINGS);
  useEffect(() => { getSiteSettings().then(setSettings); }, []);
  const footer = settings.footer;

  return (
    <footer className="bg-slate-900 dark:bg-black text-white pt-12 pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4 text-left">
              <img 
                src={settings.logoUrl || "/src/assets/images/cama_logo_1782214925115.jpg"} 
                alt="Logo CAMA" 
                className="h-20 w-20 object-contain rounded-full shadow-lg border-2 border-slate-700 bg-white"
                referrerPolicy="no-referrer"
              />
              <span className="font-extrabold text-xl tracking-wider">{settings.siteTitle || "CAMA"}</span>
            </div>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed text-left">
              {footer?.description || "Caisse d'Assurance Maladie des Armées. Garantir une couverture santé universelle et solidaire pour nos forces armées et leurs familles."}
            </p>
            <div className="flex items-center text-[#fcd116] font-bold text-sm bg-slate-800/50 py-2 px-3 rounded-md w-fit border border-slate-700">
              {footer?.badgeText || "La Patrie ou la Mort, nous vaincrons !"}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4 text-[#fcd116]">Liens Rapides</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              {footer?.liensRapides?.map((lien, idx) => (
                <li key={idx}>
                  <Link to={lien.url} className="hover:text-white transition-colors">{lien.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4 text-[#fcd116]">Espace Numérique</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              {footer?.espaceNumerique?.map((lien, idx) => (
                <li key={idx}>
                  <Link to={lien.url} className="hover:text-white transition-colors">{lien.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4 text-[#fcd116]">{footer?.contactTitle || "Contactez-nous"}</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start">
                <MapPin className="w-4 h-4 mr-2 mt-0.5 text-[#008a4b]" />
                <span dangerouslySetInnerHTML={{ __html: (footer?.address || "Camp Guillaume Ouédraogo,<br/>Ouagadougou, Burkina Faso").replace(/\n/g, '<br/>') }}></span>
              </li>
              <li className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-[#008a4b]" />
                <span>{footer?.phone || "+226 25 00 00 00"}</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-[#008a4b]" />
                <span>{footer?.email || "contact@cama.bf"}</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p>{footer?.copyright || `© ${new Date().getFullYear()} CAMA Burkina Faso. Tous droits réservés.`}</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            {settings.menuVisibility?.vision !== false && (
              <Link to="/vision" className="hover:text-white">Notre Vision</Link>
            )}
            {settings.menuVisibility?.rgpd !== false && (
              <Link to="/rgpd" className="hover:text-white">RGPD & Confidentialité</Link>
            )}
            <a href="#" className="hover:text-white">Accessibilité</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
