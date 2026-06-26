import { Save, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect } from 'react';
import { getSiteSettings, saveSiteSettings, DEFAULT_SITE_SETTINGS } from '../../lib/dataStore';

export default function AdminSettings() {
  const [settings, setSettings] = useState<any>(DEFAULT_SITE_SETTINGS);
  useEffect(() => { getSiteSettings().then(setSettings); }, []);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string, isError?: boolean }>({ text: "Configuration enregistrée avec succès" });
  const [isMaintenance, setIsMaintenance] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveSiteSettings(settings);
      setToastMessage({ text: "Configuration enregistrée avec succès", isError: false });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err: any) {
      setToastMessage({ text: err.message || "Erreur de sauvegarde", isError: true });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    }
  };

  const updateFooter = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      footer: {
        ...(prev.footer || {
          copyright: "© 2026 CAMA Burkina Faso. Tous droits réservés.",
          liensRapides: [],
          espaceNumerique: [],
          contactTitle: "Contactez-nous",
          address: "Camp Guillaume Ouédraogo, Ouagadougou, Burkina Faso",
          phone: "+226 25 00 00 00",
          email: "contact@cama.bf",
          whatsapp: "+226 70 00 11 22"
        }),
        [field]: value
      }
    }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl space-y-6 pb-20 relative"
    >
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-4 left-1/2 z-50 px-6 py-3 rounded-full shadow-2xl flex items-center border ${
              toastMessage.isError 
                ? "bg-red-600 border-red-500 text-white" 
                : "bg-slate-900 border-slate-700 text-white"
            }`}
          >
            {toastMessage.isError ? (
              <AlertTriangle className="w-5 h-5 text-white mr-2" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-[#008a4b] mr-2" />
            )}
            <span className="font-bold text-sm tracking-wide">{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100/60 overflow-hidden">
        
        <div className="bg-slate-900 border-b border-slate-800 p-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white tracking-tight">Configuration Générale</h3>
        </div>
        
        <form onSubmit={handleSave} className="p-8 space-y-8">
          {/* Identity */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold text-[#008a4b] uppercase tracking-wider">Identité de l'Institution</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nom de l'institution</label>
                <input 
                  type="text" 
                  value="Caisse d'Assurance Maladie des Armées" 
                  readOnly
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-slate-100 cursor-not-allowed transition-all font-medium text-gray-500 shadow-sm outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email de contact principal</label>
                <input 
                  type="email" 
                  value={settings.footer?.email || ""} 
                  onChange={(e) => updateFooter('email', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#008a4b]/20 focus:border-[#008a4b] transition-all font-medium text-gray-900 shadow-sm" 
                />
              </div>
               <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Téléphone Accueil</label>
                <input 
                  type="text" 
                  value={settings.footer?.phone || ""} 
                  onChange={(e) => updateFooter('phone', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#008a4b]/20 focus:border-[#008a4b] transition-all font-medium text-gray-900 shadow-sm" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Numéro WhatsApp de l'Assistance</label>
                <input 
                  type="text" 
                  value={settings.footer?.whatsapp || ""} 
                  onChange={(e) => updateFooter('whatsapp', e.target.value)}
                  placeholder="Ex: +226 70 00 11 22"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#008a4b]/20 focus:border-[#008a4b] transition-all font-medium text-gray-900 shadow-sm font-mono" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Adresse de Siège Centrale</label>
                <input 
                  type="text" 
                  value={settings.footer?.address || ""} 
                  onChange={(e) => updateFooter('address', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#008a4b]/20 focus:border-[#008a4b] transition-all font-medium text-gray-900 shadow-sm" 
                />
              </div>
            </div>
          </div>

          {/* Workflow */}
          <div className="border-t border-gray-100 pt-8 space-y-6">
             <h4 className="text-sm font-bold text-[#008a4b] uppercase tracking-wider">Workflow & Notifications</h4>
             
             <div className="bg-slate-50 rounded-xl border border-gray-200 p-5 flex items-start justify-between">
               <div>
                 <p className="font-bold text-gray-900 mb-1">Validation automatique des dossiers</p>
                 <p className="text-sm font-medium text-gray-500 max-w-lg">Accepter et valider d'office les demandes si toutes les pièces justificatives sont présentes informatiquement. (Non recommandé)</p>
               </div>
               <label className="relative inline-flex items-center cursor-pointer mt-1">
                  <input type="checkbox" value="" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#008a4b]"></div>
                </label>
            </div>

            <div className="bg-slate-50 rounded-xl border border-gray-200 p-5 flex items-start justify-between">
               <div>
                 <p className="font-bold text-gray-900 mb-1">Notifications Email automatiques</p>
                 <p className="text-sm font-medium text-gray-500 max-w-lg">Envoyer un mail récapitulatif aux assurés lors du traitement de leur dossier (Validation ou Rejet).</p>
               </div>
               <label className="relative inline-flex items-center cursor-pointer mt-1">
                  <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#008a4b]"></div>
                </label>
            </div>
          </div>

          {/* SMTP Configuration */}
          <div className="border-t border-gray-100 pt-8 space-y-6">
             <h4 className="text-sm font-bold text-[#008a4b] uppercase tracking-wider">Configuration de Messagerie (SMTP / POP / IMAP)</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Serveur SMTP Sortant</label>
                  <input type="text" placeholder="smtp.cama.bf" className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-slate-50 font-medium text-sm" />
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Port SMTP</label>
                  <input type="text" placeholder="587" className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-slate-50 font-medium text-sm" />
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Nom d'utilisateur</label>
                  <input type="text" placeholder="notifications@cama.bf" className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-slate-50 font-medium text-sm" />
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Mot de passe</label>
                  <input type="password" placeholder="••••••••••••" className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-slate-50 font-medium text-sm" />
               </div>
             </div>
             
             <div className="bg-amber-50 rounded-xl border border-amber-200 p-5 flex items-start gap-3">
               <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
               <div className="text-xs text-amber-800 font-medium leading-relaxed">
                 <p className="font-bold text-amber-900 mb-1">Authentification Sécurisée requise</p>
                 L'utilisation de protocoles SSL/TLS est obligatoire pour l'envoi de mails officiels aux militaires. Assurez-vous que le certificat du serveur est à jour pour éviter les échecs d'envoi.
               </div>
             </div>
          </div>
          
          <div className="border-t border-gray-100 pt-8 space-y-6">
             <h4 className="text-sm font-bold text-red-600 uppercase tracking-wider">Maintenance & Sécurité</h4>
               <div>
                 <p className={`font-bold mb-1 flex items-center ${isMaintenance ? 'text-white' : 'text-red-900'}`}><ShieldAlert className="w-4 h-4 mr-2" />Maintenance système</p>
                 <p className={`text-sm font-medium max-w-lg ${isMaintenance ? 'text-red-100' : 'text-red-700'}`}>Désactiver temporairement l'accès à la plateforme publique d'enrôlement (Mode Maintenance).</p>
               </div>
               <button 
                type="button" 
                onClick={() => setIsMaintenance(!isMaintenance)}
                className={`font-bold px-4 py-2 rounded-lg text-sm transition-colors shadow-sm ${isMaintenance ? 'bg-white text-red-600 hover:bg-gray-100' : 'bg-white text-red-700 border border-red-200 hover:bg-red-100'}`}
               >
                 {isMaintenance ? 'Désactiver Maintenance' : 'Activer Maintenance'}
               </button>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
             <button type="submit" className="bg-[#008a4b] text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-[#00703c] transition-all hover:-translate-y-0.5 flex items-center">
                <Save className="w-5 h-5 mr-2" />
                Enregistrer la configuration
              </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
