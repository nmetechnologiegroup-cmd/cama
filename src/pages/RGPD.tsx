import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, ChevronRight, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../lib/LanguageContext';
import { getSiteSettings, DEFAULT_SITE_SETTINGS } from '../lib/dataStore';

export default function RGPD() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<any>(DEFAULT_SITE_SETTINGS);
  useEffect(() => { getSiteSettings().then(setSettings); }, []);
  const rgpdContent = settings.rgpdContent;

  return (
    <div className="w-full">
      <div className="relative bg-slate-900 text-white py-20 flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-slate-900/90 z-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl text-left"
          >
            <div className="flex items-center space-x-2 text-blue-400 text-sm font-semibold tracking-wider uppercase mb-4">
              <Link to="/" className="hover:text-white transition">{t('Accueil', 'Home')}</Link>
              <ChevronRight className="w-4 h-4" />
              <span>{t('Confidentialité', 'Privacy')}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              {t('RGPD & Confidentialité', 'GDPR & Privacy')}
            </h1>
          </motion.div>
        </div>
      </div>

      <div className="py-20 bg-white text-left">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 m-0">Protection des Données</h3>
                <p className="text-sm text-gray-500 m-0">Politique de confidentialité et conformité RGPD</p>
              </div>
            </div>
            
            <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl mb-10 flex gap-4">
              <Lock className="w-6 h-6 text-blue-500 flex-shrink-0" />
              <p className="text-sm m-0">
                La sécurité de vos données de santé est notre priorité absolue. Nous utilisons des protocoles de chiffrement de pointe pour garantir que vos informations restent confidentielles.
              </p>
            </div>
            
            <div className="whitespace-pre-wrap">
              {rgpdContent}
            </div>

            <div className="mt-16 pt-8 border-t border-gray-100">
               <h4 className="font-bold text-gray-900 mb-4">Questions et Réclamations</h4>
               <p className="text-sm text-gray-600 mb-6">
                 Pour toute question concernant le traitement de vos données personnelles ou pour exercer vos droits, vous pouvez contacter notre Délégué à la Protection des Données (DPO) :
               </p>
               <div className="flex flex-col sm:flex-row gap-4">
                 <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm flex-1">
                   <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Email DPO</p>
                   <p className="text-sm font-bold text-blue-600 m-0">protection-donnees@cama.bf</p>
                 </div>
                 <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm flex-1">
                   <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Téléphone</p>
                   <p className="text-sm font-bold text-gray-800 m-0">+226 25 00 00 00</p>
                 </div>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
