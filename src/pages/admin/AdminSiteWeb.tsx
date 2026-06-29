import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Save,
  RotateCcw, 
  ImagePlus, 
  Type, 
  Hash, 
  Upload, 
  ShieldCheck, 
  FileCheck, 
  Layers, 
  Building, 
  Eye, 
  Users, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  Link2, 
  Laptop, 
  MapPin, 
  Sparkles,
  Target,
  Trash,
  Check,
  HelpCircle,
  PlusCircle,
  Megaphone,
  Shield,
  LayoutDashboard,
  Mail,
  Bell,
  Settings,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getSiteSettings, saveSiteSettings, SitePrestation, SiteService, SitePartner, safeStorage, DEFAULT_SITE_SETTINGS } from '../../lib/dataStore';
import { compressImage } from '../../lib/utils';

export default function AdminSiteWeb() {
  const [activeTab, setActiveTab] = useState<'prestations' | 'motduDG' | 'services' | 'statistiques' | 'popup' | 'reseaux' | 'partenaires' | 'hero' | 'navigation' | 'footer' | 'about' | 'faq' | 'sections' | 'pages' | 'flash' | 'email' | 'notifications' | 'parametres'>('hero');
  
  // Load settings initially
  const [settings, setSettings] = useState<any>(DEFAULT_SITE_SETTINGS);
  React.useEffect(() => {
    getSiteSettings().then(setSettings);
  }, []);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; subtitle: string; isError?: boolean }>({
    title: "Succès de la publication !",
    subtitle: "Les modifications sont de suite visibles sur la page d'accueil d'un simple clic."
  });

  const popupFileRef = useRef<HTMLInputElement>(null);
  const dgFileRef = useRef<HTMLInputElement>(null);
  const heroFileRef = useRef<HTMLInputElement>(null);
  const fbFileRef = useRef<HTMLInputElement>(null);
  const testimonialFileRef = useRef<HTMLInputElement>(null);
  const aboutFileRef = useRef<HTMLInputElement>(null);
  const logoFileRef = useRef<HTMLInputElement>(null);

  const handlePopupFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handlePopupChange('popupImage', event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDgFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handlePopupChange('dgImage', event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHeroFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handlePopupChange('heroImage', event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFbFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handlePopupChange('facebookFeedImage', event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTestimonialHeroFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handlePopupChange('testimonialHeroImage', event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAboutFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          updateAbout('historyImage', event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handlePopupChange('logoUrl', event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: 'parametres', label: 'Paramètres Généraux' },
    { id: 'hero', label: 'Bandeau d\'accueil (Hero / Filigrane)' },
    { id: 'navigation', label: 'Navigation / Menus' },
    { id: 'about', label: 'Page À Propos' },
    { id: 'popup', label: 'Mot de Bienvenue (Popup)' },
    { id: 'sections', label: 'Sections de l\'Accueil (Activer/Désactiver)' },
    { id: 'prestations', label: 'Nos Prestations' },
    { id: 'motduDG', label: 'Le mot du DG' },
    { id: 'services', label: 'Services en Ligne' },
    { id: 'statistiques', label: 'Statistiques (Chiffres)' },
    { id: 'faq', label: 'Gestion de la FAQ' },
    { id: 'reseaux', label: 'Réseaux Sociaux' },
    { id: 'flash', label: 'Flash Infos' },
    { id: 'pages', label: 'Pages Info (Vision/RGPD)' },
    { id: 'email', label: 'Configuration Email' },
    { id: 'notifications', label: 'Templates Notifications' },
    { id: 'partenaires', label: 'Partenaires' },
    { id: 'footer', label: 'Bas de page (Footer)' }
  ];

  const [isSaving, setIsSaving] = useState(false);

  // Handler for publishing changes
  const handlePublish = async () => {
    setIsSaving(true);
    try {
      await saveSiteSettings(settings);
      setToastMessage({
        title: "Succès de la publication !",
        subtitle: "Les modifications ont été enregistrées avec succès.",
        isError: false
      });
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 4000);
    } catch (err: any) {
      setToastMessage({
        title: "Erreur lors de la publication !",
        subtitle: err.message || "Impossible de sauvegarder les modifications.",
        isError: true
      });
      setShowToast(true);
    } finally {
      setIsSaving(false);
    }
  };

  // Popup updates
  const handlePopupChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEmailSettingsChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      emailSettings: {
        ...(prev.emailSettings || DEFAULT_SITE_SETTINGS.emailSettings!),
        [field]: value
      }
    }));
  };

  const handleNotificationTemplateChange = (template: string, field: string, value: string) => {
    setSettings(prev => {
      const templates = prev.notificationTemplates || DEFAULT_SITE_SETTINGS.notificationTemplates!;
      return {
        ...prev,
        notificationTemplates: {
          ...templates,
          [template]: {
            ...(templates[template as keyof typeof templates]),
            [field]: value
          }
        }
      };
    });
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
          email: "contact@cama.bf"
        }),
        [field]: value
      }
    }));
  };

  const updateAbout = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      aboutContent: {
        ...(prev.aboutContent || {}),
        [field]: value
      }
    }));
  };

  // Prestations updates
  const updatePrestation = (index: number, field: keyof SitePrestation, value: string) => {
    const updated = [...(settings.prestations || [])];
    updated[index] = { ...updated[index], [field]: value };
    setSettings(prev => ({ ...prev, prestations: updated }));
  };

  const addPrestationBlock = () => {
    const current = settings.prestations || [];
    const newPres: SitePrestation = {
      title: "Nouvelle prestation",
      label: `Prestation 0${current.length + 1}`,
      desc: "Veuillez saisir la description de cette prestation pour vos assurés."
    };
    setSettings(prev => ({ ...prev, prestations: [...current, newPres] }));
  };

  const removePrestationBlock = (index: number) => {
    const updated = (settings.prestations || []).filter((_, idx) => idx !== index);
    setSettings(prev => ({ ...prev, prestations: updated }));
  };

  // Services updates
  const updateServiceValue = (index: number, field: keyof SiteService, value: string) => {
    const updated = [...(settings.services || [])];
    updated[index] = { ...updated[index], [field]: value };
    setSettings(prev => ({ ...prev, services: updated }));
  };

  const handleServiceImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const compressed = await compressImage(e.target.files[0], 200, 200, 0.8);
        updateServiceValue(index, 'imageUrl', compressed);
      } catch (err) {
        console.error("Failed to compress logo", err);
      }
    }
  };

  const addService = () => {
    const current = settings.services || [];
    const newSvc: SiteService = {
      name: "Nouveau Service",
      color: "bg-purple-500",
      iconType: "Laptop",
      url: "/"
    };
    setSettings(prev => ({ ...prev, services: [...current, newSvc] }));
  };

  const removeService = (index: number) => {
    const updated = (settings.services || []).filter((_, idx) => idx !== index);
    setSettings(prev => ({ ...prev, services: updated }));
  };

  // Statistics updates
  const addStatistic = () => {
    const currentStats = settings.statistics || [
      { id: "1", label: settings.stat1_label || "", val: settings.stat1_val || "", iconType: "Users" },
      { id: "2", label: settings.stat2_label || "", val: settings.stat2_val || "", iconType: "HeartPulse" },
      { id: "3", label: settings.stat3_label || "", val: settings.stat3_val || "", iconType: "MapPin" },
      { id: "4", label: settings.stat4_label || "", val: settings.stat4_val || "", iconType: "Activity" }
    ];
    const newId = String(currentStats.length > 0 ? Math.max(...currentStats.map(s => Number(s.id) || 0)) + 1 : 1);
    const newStat = { id: newId, label: "Nouvelle Stat", val: "0", iconType: "Activity" };
    setSettings(prev => ({ ...prev, statistics: [...currentStats, newStat] }));
  };

  const removeStatistic = (id: string) => {
    const currentStats = settings.statistics || [
      { id: "1", label: settings.stat1_label || "", val: settings.stat1_val || "", iconType: "Users" },
      { id: "2", label: settings.stat2_label || "", val: settings.stat2_val || "", iconType: "HeartPulse" },
      { id: "3", label: settings.stat3_label || "", val: settings.stat3_val || "", iconType: "MapPin" },
      { id: "4", label: settings.stat4_label || "", val: settings.stat4_val || "", iconType: "Activity" }
    ];
    const updated = currentStats.filter(s => s.id !== id);
    setSettings(prev => ({ ...prev, statistics: updated }));
  };

  const updateStatistic = (id: string, field: string, value: string) => {
    const currentStats = settings.statistics || [
      { id: "1", label: settings.stat1_label || "", val: settings.stat1_val || "", iconType: "Users" },
      { id: "2", label: settings.stat2_label || "", val: settings.stat2_val || "", iconType: "HeartPulse" },
      { id: "3", label: settings.stat3_label || "", val: settings.stat3_val || "", iconType: "MapPin" },
      { id: "4", label: settings.stat4_label || "", val: settings.stat4_val || "", iconType: "Activity" }
    ];
    const updated = currentStats.map(s => s.id === id ? { ...s, [field]: value } : s);
    setSettings(prev => ({ ...prev, statistics: updated }));
  };

  // Partners updates
  const addPartner = () => {
    const currentPartners = settings.partners || [];
    const newId = currentPartners.length > 0 ? Math.max(...currentPartners.map(p => p.id)) + 1 : 1;
    const newPartner: SitePartner = {
      id: newId,
      name: "Nouveau partenaire"
    };
    setSettings(prev => ({ ...prev, partners: [...currentPartners, newPartner] }));
  };

  const updatePartnerName = (id: number, value: string) => {
    const updated = (settings.partners || []).map(p => p.id === id ? { ...p, name: value } : p);
    setSettings(prev => ({ ...prev, partners: updated }));
  };

  const updatePartnerLogo = (id: number, value: string) => {
    const updated = (settings.partners || []).map(p => p.id === id ? { ...p, logo: value } : p);
    setSettings(prev => ({ ...prev, partners: updated }));
  };

  const deletePartner = (id: number) => {
    const updated = (settings.partners || []).filter(p => p.id !== id);
    setSettings(prev => ({ ...prev, partners: updated }));
  };

  // Testimonials updates
  const addTestimonial = () => {
    const list = settings.testimonials || [
      {
        id: "1",
        quote: settings.qualityCitation || "« Nous avons trouvé à la CAMA, un système efficace qui répond en tout point aux exigences de qualité »",
        author: settings.qualityAuthor || "Mme Ouedraogo",
        role: "Bénéficiaire"
      }
    ];
    const newId = String(list.length > 0 ? Math.max(...list.map(t => Number(t.id) || 0)) + 1 : 1);
    const newTestimonial = {
      id: newId,
      quote: "« Saisissez un nouveau témoignage de satisfaction pour inspirer confiance. »",
      author: "Nouveau bénéficiaire",
      role: "Bénéficiaire / Soldat"
    };
    setSettings(prev => ({
      ...prev,
      testimonials: [...(prev.testimonials || list), newTestimonial]
    }));
  };

  const updateTestimonial = (id: string, field: 'quote' | 'author' | 'role', value: string) => {
    const list = settings.testimonials && settings.testimonials.length > 0 ? settings.testimonials : [
      {
        id: "1",
        quote: settings.qualityCitation || "« Nous avons trouvé à la CAMA, un système efficace qui répond en tout point aux exigences de qualité »",
        author: settings.qualityAuthor || "Mme Ouedraogo",
        role: "Bénéficiaire"
      }
    ];
    const updated = list.map(t => t.id === id ? { ...t, [field]: value } : t);
    setSettings(prev => {
      const next = { ...prev, testimonials: updated };
      if (updated.length > 0) {
        next.qualityCitation = updated[0].quote;
        next.qualityAuthor = updated[0].author;
      }
      return next;
    });
  };

  const deleteTestimonial = (id: string) => {
    const list = settings.testimonials && settings.testimonials.length > 0 ? settings.testimonials : [
      {
        id: "1",
        quote: settings.qualityCitation || "« Nous avons trouvé à la CAMA, un système efficace qui répond en tout point aux exigences de qualité »",
        author: settings.qualityAuthor || "Mme Ouedraogo",
        role: "Bénéficiaire"
      }
    ];
    const updated = list.filter(t => t.id !== id);
    setSettings(prev => {
      const next = { ...prev, testimonials: updated };
      if (updated.length > 0) {
        next.qualityCitation = updated[0].quote;
        next.qualityAuthor = updated[0].author;
      } else {
        next.qualityCitation = "";
        next.qualityAuthor = "";
      }
      return next;
    });
  };

  return (
    <div className="max-w-7xl mx-auto text-left relative">
      {/* Dynamic Action Toaster */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border font-medium ${
              toastMessage.isError 
                ? "bg-red-600 text-white border-red-500" 
                : "bg-green-600 text-white border-green-500"
            }`}
          >
            {toastMessage.isError ? (
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            ) : (
              <CheckCircle2 className="w-6 h-6 animate-bounce" />
            )}
            <div>
              <p className="font-bold">{toastMessage.title}</p>
              <p className="text-xs mt-0.5 opacity-90">{toastMessage.subtitle}</p>
            </div>
            <button onClick={() => setShowToast(false)} className="text-white/80 hover:text-white ml-2 text-sm font-bold">×</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Gestion du Site Web</h1>
           <p className="text-gray-500 mt-1">Personnalisez le contenu de la page d'accueil de la CAMA de façon dynamique.</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/" target="_blank" className="bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg font-bold flex items-center hover:bg-gray-50 transition shadow-sm">
            <Eye className="w-4 h-4 mr-2" />
            Voir le site
          </Link>
          <button 
            onClick={handlePublish}
            disabled={isSaving}
            className={`bg-[#008a4b] text-white px-5 py-2.5 rounded-lg font-bold flex items-center hover:bg-[#00703c] transition shadow-md ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <Save className={`w-4 h-4 mr-2 ${isSaving ? 'animate-spin' : ''}`} />
            {isSaving ? 'Publication en cours...' : 'Publier les modifications'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
        <div className="flex flex-wrap border-b border-gray-200 bg-slate-50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-4 font-bold text-xs uppercase tracking-wider transition-colors relative ${
                activeTab === tab.id 
                  ? 'text-[#008a4b] bg-white border-t-2 border-[#008a4b]' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-8">
          {/* PARAMETRES TAB */}
          {activeTab === 'parametres' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="border-b border-gray-100 pb-3">
                 <h3 className="text-lg font-bold text-gray-900">Paramètres Généraux</h3>
                 <p className="text-xs text-gray-500 mt-1">Configurations globales de la plateforme (formats, variables, etc.).</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-xl border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-[#008a4b]" /> Format du Numéro de Dossier
                  </h4>
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                    Définissez le format utilisé lors de la génération automatique des numéros de dossiers.
                    Variables disponibles : <strong className="text-gray-900">{'{YYYY}'}</strong> (Année en cours), <strong className="text-gray-900">{'{SEQ}'}</strong> (Séquence incrémentale à 4 chiffres).
                  </p>
                  <input
                    type="text"
                    value={settings.dossierIdFormat || 'CAMA-{YYYY}-{SEQ}'}
                    onChange={(e) => handlePopupChange('dossierIdFormat', e.target.value)}
                    placeholder="Ex: CAMA-{YYYY}-{SEQ}"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#008a4b] uppercase"
                  />
                  <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600">
                     Aperçu : <strong className="text-[#008a4b]">{(settings.dossierIdFormat || 'CAMA-{YYYY}-{SEQ}').replace('{YYYY}', new Date().getFullYear().toString()).replace('{SEQ}', '0001')}</strong>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-[#008a4b]" /> Messagerie Directe (Conseiller)
                  </h4>
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                    Activez la discussion en direct avec un conseiller et paramétrez ses heures de disponibilité. En dehors de ces heures ou si désactivé, le chat repassera en mode robot/FAQ intelligent.
                  </p>
                  
                  <div className="space-y-4">
                    {/* Toggle Switch */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <div>
                        <span className="text-xs font-bold text-gray-900 block">Discussion avec conseiller</span>
                        <span className="text-[10px] text-gray-500">Activer le support humain direct</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.chatAdvisorActive || false}
                          onChange={(e) => handlePopupChange('chatAdvisorActive', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#008a4b]"></div>
                      </label>
                    </div>

                    {/* Hours Settings */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Heure de début</label>
                        <input
                          type="text"
                          value={settings.chatStartHour || '08:00'}
                          onChange={(e) => handlePopupChange('chatStartHour', e.target.value)}
                          placeholder="Ex: 08:00"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#008a4b]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Heure de fin</label>
                        <input
                          type="text"
                          value={settings.chatEndHour || '17:00'}
                          onChange={(e) => handlePopupChange('chatEndHour', e.target.value)}
                          placeholder="Ex: 17:00"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#008a4b]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* HERO TAB */}
          {activeTab === 'hero' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="border-b border-gray-100 pb-3">
                 <h3 className="text-lg font-bold text-gray-900">Bandeau d'accueil (Hero / Filigrane)</h3>
                 <p className="text-xs text-gray-500 mt-1">Configurez le visuel d'accueil de la plateforme avec une image d'arrière-plan en filigrane d'inspiration militaire.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Titre principal d'accueil</label>
                      <input 
                        type="text" 
                        value={settings.heroTitle || ''}
                        onChange={(e) => handlePopupChange('heroTitle', e.target.value)}
                        placeholder="La santé de nos héros, notre priorité."
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008a4b] outline-none text-sm font-medium" 
                      />
                      <span className="text-[10px] text-gray-500 mt-1.5 block">Astuce : Inclure la phrase <strong className="text-red-600">"notre priorité."</strong> pour la colorer automatiquement en jaune sur la page d'accueil !</span>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Description / Message d'accompagnement</label>
                      <textarea 
                        rows={4}
                        value={settings.heroSubtitle || ''}
                        onChange={(e) => handlePopupChange('heroSubtitle', e.target.value)}
                        placeholder="La Caisse d'Assurance Maladie des Armées (CAMA) offre une prise en charge sanitaire..."
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008a4b] outline-none text-sm leading-relaxed" 
                      />
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Opacité du filigrane d'arrière-plan (Vert)</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          step="5"
                          value={settings.heroBgWatermarkOpacity !== undefined ? settings.heroBgWatermarkOpacity : 20}
                          onChange={(e) => handlePopupChange('heroBgWatermarkOpacity', Number(e.target.value))}
                          className="flex-grow accent-[#008a4b] cursor-pointer h-2 bg-gray-200 rounded-lg appearance-none"
                        />
                        <span className="text-sm font-extrabold text-[#008a4b] bg-white px-3 py-1.5 rounded-lg border border-slate-200 min-w-[60px] text-center shadow-sm">
                          {settings.heroBgWatermarkOpacity !== undefined ? settings.heroBgWatermarkOpacity : 20}%
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-500 mt-2 block leading-normal">
                        Faites glisser pour changer l'opacité de l'image de couverture militaire au-dessus fond vert. Réglez sur <strong className="text-[#008a4b]">0%</strong> pour un fond 100% vert uni, ou augmentez pour intensifier le filigrane d'image !
                      </span>
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Image d'arrière-plan en filigrane (Slider)</label>
                     <div 
                        onClick={() => heroFileRef.current?.click()}
                        className="border border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-[#008a4b] bg-slate-50 relative overflow-hidden group cursor-pointer h-60"
                     >
                        {settings.heroImage ? (
                          <div className="absolute inset-0 w-full h-full">
                            <div className="absolute inset-0 bg-[#008a4b]/60 z-10 mix-blend-multiply"></div>
                            <img 
                              src={settings.heroImage} 
                              alt="Preview" 
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/30 opacity-0 group-hover:opacity-100 transition duration-300">
                              <span className="text-white text-xs font-bold flex items-center gap-1.5 bg-[#008a4b] px-3.5 py-2 rounded-full shadow">
                                <Upload className="w-3.5 h-3.5" /> Changer l'image
                              </span>
                            </div>
                            <div className="absolute bottom-3 left-3 z-20 bg-[#008a4b] text-white text-[10px] font-bold px-2.5 py-1 rounded shadow uppercase tracking-wider">
                              Aperçu Filigrane
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <ImagePlus className="w-12 h-12 text-gray-300 mb-3 group-hover:text-[#008a4b] transition-colors" />
                            <span className="text-xs font-bold text-gray-500 mb-1">Télécharger une image</span>
                            <span className="text-[10px] text-gray-400">PNG, JPG ou GIF (Max. 5 Mo)</span>
                          </div>
                        )}
                        <input 
                           type="file" 
                           ref={heroFileRef} 
                           onChange={handleHeroFileSelect} 
                           accept="image/*" 
                           className="hidden" 
                        />
                     </div>
                     <div className="mt-3 flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Ou entrez une URL d'image ici..."
                          value={settings.heroImage || ''}
                          onChange={(e) => handlePopupChange('heroImage', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs outline-none focus:border-[#008a4b]"
                        />
                        {settings.heroImage && (
                          <button
                            type="button"
                            onClick={() => handlePopupChange('heroImage', '')}
                            className="bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white p-2 rounded-lg border border-rose-150 transition"
                            title="Réinitialiser l'image"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        )}
                     </div>
                 </div>
              </div>
            </motion.div>
          )}

          {/* NAVIGATION TAB */}
          {activeTab === 'navigation' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-left">
              <div className="border-b border-gray-100 pb-3">
                 <h3 className="text-lg font-bold text-gray-900">Gestion de l'Identité & Menus</h3>
                 <p className="text-xs text-gray-500 mt-1">Personnalisez le logo, le titre du site, le slogan et gérez les menus de navigation.</p>
              </div>

              {/* Branding Section */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h4 className="font-extrabold text-[#008a4b] uppercase text-sm border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                  <Building className="w-4 h-4" /> Identité & Branding (En-tête)
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-1 space-y-4">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Logo du Site</label>
                    <div className="aspect-square bg-slate-50 border border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group">
                      {settings.logoUrl ? (
                        <img 
                          src={settings.logoUrl} 
                          alt="Logo Preview" 
                          className="max-w-[80%] max-h-[80%] object-contain"
                        />
                      ) : (
                        <div className="text-gray-300 flex flex-col items-center">
                          <ImagePlus className="w-10 h-10 mb-2" />
                          <span className="text-[10px] font-bold">Aucun Logo</span>
                        </div>
                      )}
                      <button 
                        type="button"
                        onClick={() => logoFileRef.current?.click()}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-2"
                      >
                        <Upload className="w-4 h-4" /> Changer le logo
                      </button>
                      <input 
                        type="file" 
                        ref={logoFileRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleLogoFileSelect} 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Taille du Logo (px)</label>
                      <div className="flex items-center gap-3">
                        <input 
                          type="range" 
                          min="40" 
                          max="200" 
                          step="10"
                          value={settings.logoWidth || 80}
                          onChange={(e) => handlePopupChange('logoWidth', parseInt(e.target.value))}
                          className="flex-1 accent-[#008a4b]"
                        />
                        <span className="text-xs font-bold text-gray-700 w-8">{settings.logoWidth || 80}</span>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-5">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Titre Principal du Site</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#008a4b] outline-none font-black text-xl text-gray-900 uppercase tracking-tight" 
                        value={settings.siteTitle || ''}
                        onChange={(e) => handlePopupChange('siteTitle', e.target.value)}
                        placeholder="Ex: CAMA"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Slogan / Sous-titre</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#008a4b] outline-none font-bold text-xs text-gray-600 uppercase tracking-widest" 
                        value={settings.siteSlogan || ''}
                        onChange={(e) => handlePopupChange('siteSlogan', e.target.value)}
                        placeholder="Ex: CAISSE D'ASSURANCE MALADIE DES ARMÉES"
                      />
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-3">
                      <HelpCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-700">Aperçu en direct</p>
                        <p className="text-[10px] text-gray-500 leading-relaxed">
                          Ces informations apparaissent dans l'en-tête (Header) de toutes les pages du site.
                          Assurez-vous que le slogan n'est pas trop long pour l'affichage mobile.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <h4 className="font-extrabold text-[#008a4b] uppercase text-sm border-b border-gray-100 pb-2">Menus de Navigation (Maintop)</h4>
                    
                    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <div>
                        <div className="flex items-center gap-2">
                           <span className="font-bold text-gray-900">Accueil</span>
                           <span className="text-[10px] bg-slate-200 text-slate-500 font-extrabold px-2 py-0.5 rounded uppercase">Obligatoire</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Le menu d'accueil ne peut pas être désactivé.</p>
                      </div>
                      <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-not-allowed opacity-50">
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm"></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <div>
                        <div className="font-bold text-gray-900">À propos</div>
                        <p className="text-xs text-gray-500 mt-1">Affiche le lien vers la page de présentation.</p>
                      </div>
                      <button 
                        onClick={() => setSettings(prev => ({ 
                           ...prev, 
                           menuVisibility: { ...prev.menuVisibility, about: !(prev.menuVisibility?.about !== false) } 
                        }))}
                        className={`w-12 h-6 rounded-full relative cursor-pointer transition-all ${settings.menuVisibility?.about !== false ? 'bg-[#008a4b]' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${settings.menuVisibility?.about !== false ? 'right-1' : 'left-1'}`}></div>
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <div>
                        <div className="font-bold text-gray-900">Services</div>
                        <p className="text-xs text-gray-500 mt-1">Menu présentant la page des services détaillés.</p>
                      </div>
                      <button 
                        onClick={() => setSettings(prev => ({ 
                           ...prev, 
                           menuVisibility: { ...prev.menuVisibility, services: !(prev.menuVisibility?.services !== false) } 
                        }))}
                        className={`w-12 h-6 rounded-full relative cursor-pointer transition-all ${settings.menuVisibility?.services !== false ? 'bg-[#008a4b]' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${settings.menuVisibility?.services !== false ? 'right-1' : 'left-1'}`}></div>
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <div>
                        <div className="font-bold text-gray-900">Actualités</div>
                        <p className="text-xs text-gray-500 mt-1">Menu redirigeant vers le fil d'actualités.</p>
                      </div>
                      <button 
                        onClick={() => setSettings(prev => ({ 
                           ...prev, 
                           menuVisibility: { ...prev.menuVisibility, news: !(prev.menuVisibility?.news !== false) } 
                        }))}
                        className={`w-12 h-6 rounded-full relative cursor-pointer transition-all ${settings.menuVisibility?.news !== false ? 'bg-[#008a4b]' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${settings.menuVisibility?.news !== false ? 'right-1' : 'left-1'}`}></div>
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <div>
                        <div className="font-bold text-gray-900">Contact</div>
                        <p className="text-xs text-gray-500 mt-1">Affiche un lien vers la page de contact avec informations de localisation.</p>
                      </div>
                      <button 
                        onClick={() => setSettings(prev => ({ 
                           ...prev, 
                           menuVisibility: { ...prev.menuVisibility, contact: !(prev.menuVisibility?.contact !== false) } 
                        }))}
                        className={`w-12 h-6 rounded-full relative cursor-pointer transition-all ${settings.menuVisibility?.contact !== false ? 'bg-[#008a4b]' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${settings.menuVisibility?.contact !== false ? 'right-1' : 'left-1'}`}></div>
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <div>
                        <div className="font-bold text-gray-900">Notre Vision</div>
                        <p className="text-xs text-gray-500 mt-1">Affiche le lien vers la page Vision (Haut & Bas de page).</p>
                      </div>
                      <button 
                        onClick={() => setSettings(prev => ({ 
                           ...prev, 
                           menuVisibility: { ...prev.menuVisibility, vision: !(prev.menuVisibility?.vision !== false) } 
                        }))}
                        className={`w-12 h-6 rounded-full relative cursor-pointer transition-all ${settings.menuVisibility?.vision !== false ? 'bg-[#008a4b]' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${settings.menuVisibility?.vision !== false ? 'right-1' : 'left-1'}`}></div>
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <div>
                        <div className="font-bold text-gray-900">RGPD & Confidentialité</div>
                        <p className="text-xs text-gray-500 mt-1">Affiche le lien vers la page RGPD (Haut & Bas de page).</p>
                      </div>
                      <button 
                        onClick={() => setSettings(prev => ({ 
                           ...prev, 
                           menuVisibility: { ...prev.menuVisibility, rgpd: !(prev.menuVisibility?.rgpd !== false) } 
                        }))}
                        className={`w-12 h-6 rounded-full relative cursor-pointer transition-all ${settings.menuVisibility?.rgpd !== false ? 'bg-[#008a4b]' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${settings.menuVisibility?.rgpd !== false ? 'right-1' : 'left-1'}`}></div>
                      </button>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h4 className="font-extrabold text-[#008a4b] uppercase text-sm border-b border-gray-100 pb-2">Titrage des Sections</h4>
                    
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                      <label className="block text-sm font-bold text-gray-900">Titre de la section "Nos prestations" (Services généraux)</label>
                      <input 
                        type="text" 
                        value={settings.sectionTitles?.prestations || 'Nos prestations'}
                        onChange={(e) => setSettings(prev => ({
                           ...prev,
                           sectionTitles: { ...prev.sectionTitles, prestations: e.target.value } as any
                        }))}
                        placeholder="Ex: Nos Prestations / Nos Services"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008a4b] outline-none font-medium" 
                      />
                      <p className="text-[10px] text-gray-500">Correspond à la liste des prestations avec puces colorées.</p>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                      <label className="block text-sm font-bold text-gray-900">Titre de la section "Services en ligne"</label>
                      <input 
                        type="text" 
                        value={settings.sectionTitles?.services || 'Services en ligne'}
                        onChange={(e) => setSettings(prev => ({
                           ...prev,
                           sectionTitles: { ...prev.sectionTitles, services: e.target.value } as any
                        }))}
                        placeholder="Ex: Services en ligne / E-Plateformes"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008a4b] outline-none font-medium" 
                      />
                      <p className="text-[10px] text-gray-500">Correspond à la zone des boutons interactifs de l'espace assuré.</p>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}

          {/* ABOUT TAB */}
          {activeTab === 'about' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Contenu de la Page À Propos</h3>
                  <p className="text-xs text-gray-500 mt-1">Gérez les textes et images de la page de présentation de l'institution.</p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (true) {
                      setSettings(prev => ({ ...prev, aboutContent: DEFAULT_SITE_SETTINGS.aboutContent }));
                    }
                  }}
                  className="text-xs font-bold text-rose-500 hover:text-rose-700 transition flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Réinitialiser
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Hero Section */}
                <div className="space-y-4">
                  <h4 className="font-extrabold text-[#008a4b] uppercase text-sm border-b border-gray-100 pb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> En-tête (Hero)
                  </h4>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Titre de l'en-tête</label>
                    <input 
                      type="text" 
                      value={settings.aboutContent?.heroTitle || ''}
                      onChange={(e) => updateAbout('heroTitle', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008a4b] outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Description (Sous-titre)</label>
                    <textarea 
                      rows={3}
                      value={settings.aboutContent?.heroSubtitle || ''}
                      onChange={(e) => updateAbout('heroSubtitle', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008a4b] outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">URL Image de fond</label>
                    <input 
                      type="text" 
                      value={settings.aboutContent?.heroImage || ''}
                      onChange={(e) => updateAbout('heroImage', e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008a4b] outline-none" 
                    />
                  </div>
                </div>

                {/* Mission & Vision */}
                <div className="space-y-4">
                  <h4 className="font-extrabold text-[#008a4b] uppercase text-sm border-b border-gray-100 pb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" /> Mission & Vision
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                      <label className="block text-sm font-bold text-gray-900">Notre Mission</label>
                      <input 
                        type="text" 
                        value={settings.aboutContent?.missionTitle || ''}
                        onChange={(e) => updateAbout('missionTitle', e.target.value)}
                        placeholder="Titre Mission"
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm mb-2"
                      />
                      <textarea 
                        rows={3}
                        value={settings.aboutContent?.missionDesc || ''}
                        onChange={(e) => updateAbout('missionDesc', e.target.value)}
                        placeholder="Description Mission"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                      />
                    </div>
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                      <label className="block text-sm font-bold text-gray-900">Notre Vision</label>
                      <input 
                        type="text" 
                        value={settings.aboutContent?.visionTitle || ''}
                        onChange={(e) => updateAbout('visionTitle', e.target.value)}
                        placeholder="Titre Vision"
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm mb-2"
                      />
                      <textarea 
                        rows={3}
                        value={settings.aboutContent?.visionDesc || ''}
                        onChange={(e) => updateAbout('visionDesc', e.target.value)}
                        placeholder="Description Vision"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Historique Section */}
                <div className="col-span-1 md:col-span-2 space-y-4">
                  <h4 className="font-extrabold text-[#008a4b] uppercase text-sm border-b border-gray-100 pb-2 flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Historique de l'institution
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Titre de la section</label>
                        <input 
                          type="text" 
                          value={settings.aboutContent?.historyTitle || ''}
                          onChange={(e) => updateAbout('historyTitle', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008a4b] outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Texte principal</label>
                        <textarea 
                          rows={4}
                          value={settings.aboutContent?.historyDesc1 || ''}
                          onChange={(e) => updateAbout('historyDesc1', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008a4b] outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Citation / Signature (Citation Finale)</label>
                        <textarea 
                          rows={4}
                          value={settings.aboutContent?.historyDesc2 || ''}
                          onChange={(e) => updateAbout('historyDesc2', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008a4b] outline-none italic" 
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-gray-700 mb-1">Image Historique / Bâtiment</label>
                      <div className="border border-gray-200 rounded-2xl p-4 bg-slate-50 flex flex-col items-center">
                        {settings.aboutContent?.historyImage ? (
                          <img src={settings.aboutContent.historyImage} alt="Historique" className="w-full h-48 object-cover rounded-xl mb-3 shadow-sm" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-48 bg-slate-200 rounded-xl flex items-center justify-center text-gray-400 mb-3 italic text-xs">Aucune image configurée</div>
                        )}
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={settings.aboutContent?.historyImage || ''}
                            onChange={(e) => updateAbout('historyImage', e.target.value)}
                            placeholder="URL de l'image..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#008a4b]" 
                          />
                          <button 
                            type="button"
                            onClick={() => aboutFileRef.current?.click()}
                            className="px-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm"
                            title="Upload Image"
                          >
                            <Upload className="w-4 h-4 text-gray-600" />
                          </button>
                          <input 
                            type="file" 
                            ref={aboutFileRef} 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleAboutFileSelect} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* POPUP TAB */}
          {activeTab === 'popup' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
                 <h3 className="text-lg font-bold text-gray-900">Configuration du Pop-up de bienvenue</h3>
                 <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${settings.popupActive ? 'bg-green-100 text-[#008a4b]' : 'bg-rose-100 text-rose-600'}`}>
                   {settings.popupActive ? 'Actif' : 'Désactivé'}
                 </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Titre principal</label>
                      <input 
                        type="text" 
                        value={settings.popupTitle}
                        onChange={(e) => handlePopupChange('popupTitle', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008a4b] outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Sous-titre / Slogan</label>
                      <input 
                        type="text" 
                        value={settings.popupSubtitle}
                        onChange={(e) => handlePopupChange('popupSubtitle', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008a4b] outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Contenu (Texte)</label>
                      <textarea 
                        rows={4} 
                        value={settings.popupContent}
                        onChange={(e) => handlePopupChange('popupContent', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008a4b] outline-none"
                      />
                    </div>
                    <div className="flex items-center space-x-3 mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                       <input 
                         type="checkbox" 
                         id="showPopup" 
                         checked={settings.popupActive}
                         onChange={(e) => handlePopupChange('popupActive', e.target.checked)}
                         className="w-5 h-5 text-[#008a4b] rounded focus:ring-[#008a4b]" 
                       />
                       <label htmlFor="showPopup" className="text-sm font-bold text-gray-700 select-none cursor-pointer">
                         Activer le popup à l'ouverture du site
                       </label>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-3">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Nombre d'affichages du pop-up</label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <select
                          value={settings.popupMaxViews !== undefined ? settings.popupMaxViews : 2}
                          onChange={(e) => handlePopupChange('popupMaxViews', Number(e.target.value))}
                          className="flex-grow bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-[#008a4b] font-semibold text-gray-700 outline-none cursor-pointer"
                        >
                          <option value={1}>1 fois (Affichage très limité)</option>
                          <option value={2}>2 fois (Recommandé)</option>
                          <option value={3}>3 fois (Standard)</option>
                          <option value={5}>5 fois</option>
                          <option value={9999}>À chaque visite (Illimité)</option>
                        </select>
                        <button
                          type="button"
                          onClick={async () => {
                            safeStorage.removeItem('cama_popup_views');
                            toast.success("Le compteur d'affichages a été réinitialisé pour votre navigateur local !");
                          }}
                          className="bg-[#008a4b]/10 hover:bg-[#008a4b]/20 text-[#008a4b] text-[11px] font-extrabold px-3 py-2 rounded-lg transition whitespace-nowrap border border-[#008a4b]/20 cursor-pointer"
                          title="Réinitialiser pour tester"
                        >
                          Réinitialiser le test
                        </button>
                      </div>
                      <span className="text-[10px] text-gray-550 mt-2 block leading-normal pt-1">
                        Définit combien de fois le communiqué de bienvenue doit s'afficher par utilisateur (via le stockage local de son navigateur) pour éviter de le déranger à chaque rechargement.
                      </span>
                    </div>
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Image de couverture</label>
                     <div 
                        onClick={() => popupFileRef.current?.click()}
                        className="border border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-[#008a4b] bg-slate-50 relative overflow-hidden group cursor-pointer h-60"
                     >
                        {settings.popupImage ? (
                          <img 
                            src={settings.popupImage} 
                            alt="Preview" 
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="flex flex-col items-center">
                            <Upload className="w-10 h-10 text-gray-400 mb-2" />
                            <span className="font-bold text-gray-700 text-sm">Téléverser une image de couverture</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                           <div className="bg-white px-4 py-2 rounded-lg flex items-center shadow font-bold text-xs text-gray-800">
                             <Upload className="w-4 h-4 text-[#008a4b] mr-1.5" /> Choisir un fichier local
                           </div>
                        </div>
                        <input 
                          type="file"
                          ref={popupFileRef}
                          onChange={handlePopupFileSelect}
                          accept="image/*"
                          className="hidden"
                        />
                     </div>
                     <div className="mt-3 flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Ou entrez une URL d'image ici..."
                          value={settings.popupImage || ''}
                          onChange={(e) => handlePopupChange('popupImage', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs outline-none focus:border-[#008a4b]"
                        />
                        {settings.popupImage && (
                          <button
                            type="button"
                            onClick={() => handlePopupChange('popupImage', '')}
                            className="bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white p-2 rounded-lg border border-rose-150 transition"
                            title="Supprimer l'image"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        )}
                     </div>
                  </div>
              </div>
            </motion.div>
          )}

          {/* PRESTATIONS TAB */}
          {activeTab === 'prestations' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                 <h3 className="text-lg font-bold text-gray-900">Blocks des prestations de soins</h3>
                 <button 
                   onClick={addPrestationBlock}
                   className="text-sm font-bold text-white bg-[#008a4b] px-4 py-2 rounded-lg hover:bg-[#00703c] transition flex items-center shadow-sm"
                 >
                    <Plus className="w-4 h-4 mr-1" /> Ajouter une prestation
                 </button>
              </div>

              {(settings.prestations || []).map((pres, index) => (
                <div key={index} className="bg-slate-50 rounded-2xl border border-gray-200 p-6 relative">
                    <button 
                      onClick={() => removePrestationBlock(index)}
                      className="absolute top-4 right-4 text-rose-500 hover:text-white hover:bg-rose-500 p-1.5 rounded-lg transition"
                      title="Supprimer la prestation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="flex flex-col md:flex-row gap-6">
                       <div className="md:w-1/5">
                           <label className="block text-xs font-extrabold text-gray-500 uppercase mb-2">Icône Prédéfinie</label>
                           <div className="w-16 h-16 bg-white border border-gray-300 rounded-xl flex items-center justify-center shadow-md text-[#008a4b] relative">
                             {index === 0 ? <ShieldCheck className="w-8 h-8"/> : index === 1 ? <Users className="w-8 h-8"/> : <Layers className="w-8 h-8"/>}
                             <div className="absolute -bottom-1 -right-1 bg-[#008a4b] text-white rounded-full text-[10px] w-5 h-5 flex items-center justify-center font-bold">i</div>
                           </div>
                       </div>
                       <div className="md:w-4/5 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                               <label className="block text-xs font-bold text-gray-600 mb-1">Titre de la prestation</label>
                               <input 
                                 type="text" 
                                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008a4b] outline-none font-bold" 
                                 value={pres.title}
                                 onChange={(e) => updatePrestation(index, 'title', e.target.value)}
                               />
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-gray-600 mb-1">Label / Affichage badge</label>
                               <input 
                                 type="text" 
                                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008a4b] outline-none" 
                                 value={pres.label}
                                 onChange={(e) => updatePrestation(index, 'label', e.target.value)}
                               />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Description explicative</label>
                            <textarea 
                              rows={2} 
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008a4b] outline-none" 
                              value={pres.desc}
                              onChange={(e) => updatePrestation(index, 'desc', e.target.value)}
                            />
                          </div>
                       </div>
                    </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* MOT DU DG TAB */}
          {activeTab === 'motduDG' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Mot du Directeur Général</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="md:col-span-1 text-center bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <label className="block text-sm font-bold text-gray-700 mb-4 w-full">Photo du Directeur</label>
                     <div 
                        onClick={() => dgFileRef.current?.click()}
                        className="w-40 h-40 rounded-full border-4 border-gray-200 overflow-hidden mx-auto bg-white flex items-center justify-center hover:border-[#008a4b] transition group relative shadow-md cursor-pointer"
                     >
                        {settings.dgImage ? (
                           <img 
                             src={settings.dgImage} 
                             alt="Directeur Général" 
                             className="w-full h-full object-cover" 
                             referrerPolicy="no-referrer"
                           />
                        ) : (
                           <Users className="w-14 h-14 text-gray-300" />
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                           <Upload className="w-6 h-6 text-white" />
                        </div>
                        <input 
                          type="file"
                          ref={dgFileRef}
                          onChange={handleDgFileSelect}
                          accept="image/*"
                          className="hidden"
                        />
                     </div>
                     <div className="mt-4 flex gap-2 w-full max-w-[200px]">
                        <input 
                          type="text" 
                          placeholder="URL Photo..."
                          value={settings.dgImage || ''}
                          onChange={(e) => handlePopupChange('dgImage', e.target.value)}
                          className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs outline-none bg-white font-medium text-center focus:border-[#008a4b]"
                        />
                        {settings.dgImage && (
                          <button
                            type="button"
                            onClick={() => handlePopupChange('dgImage', '')}
                            className="bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white p-2 rounded-lg border border-rose-150 transition"
                            title="Supprimer la photo"
                          >
                             <Trash className="w-3.5 h-3.5" />
                          </button>
                        )}
                     </div>
                  </div>
                 <div className="md:col-span-2 space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Nom Complet</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008a4b] outline-none font-bold text-gray-900" 
                        value={settings.dgName}
                        onChange={(e) => handlePopupChange('dgName', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Message du DG</label>
                      <textarea 
                        rows={5} 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008a4b] outline-none" 
                        value={settings.dgMessage}
                        onChange={(e) => handlePopupChange('dgMessage', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Citations / Slogans</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008a4b] outline-none italic font-medium" 
                        value={settings.dgCitation}
                        onChange={(e) => handlePopupChange('dgCitation', e.target.value)}
                      />
                    </div>
                 </div>
              </div>
            </motion.div>
          )}

          {/* STATISTIQUES TAB */}
          {activeTab === 'statistiques' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="text-lg font-bold text-gray-900">Statistiques nationales</h3>
                <button 
                   onClick={addStatistic}
                   className="text-sm font-bold text-white bg-[#008a4b] px-4 py-2 rounded-lg hover:bg-[#00703c] transition flex items-center shadow-sm"
                 >
                    <Plus className="w-4 h-4 mr-1" /> Ajouter une statistique
                 </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {(settings.statistics || [
                    { id: "1", label: settings.stat1_label || "", val: settings.stat1_val || "", iconType: "Users" },
                    { id: "2", label: settings.stat2_label || "", val: settings.stat2_val || "", iconType: "HeartPulse" },
                    { id: "3", label: settings.stat3_label || "", val: settings.stat3_val || "", iconType: "MapPin" },
                    { id: "4", label: settings.stat4_label || "", val: settings.stat4_val || "", iconType: "Activity" }
                 ]).map((stat, idx) => (
                   <div key={stat.id} className="flex gap-4 bg-slate-50 p-4 rounded-xl border border-gray-200 relative group">
                      <button 
                        onClick={() => removeStatistic(stat.id)}
                        className="absolute -top-2 -right-2 text-rose-500 hover:text-white hover:bg-rose-500 p-1 rounded-lg transition opacity-0 group-hover:opacity-100 bg-white border border-rose-100 shadow-sm z-10"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="w-16">
                        <label className="block text-xs font-bold text-gray-500 mb-1">ID</label>
                        <span className="block text-base font-bold text-center py-2 bg-white border border-gray-300 rounded">{String(idx + 1).padStart(2, '0')}</span>
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Valeur</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded bg-white font-bold" 
                          value={stat.val} 
                          onChange={(e) => updateStatistic(stat.id, 'val', e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Désignation</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded bg-white font-bold text-slate-700" 
                          value={stat.label} 
                          onChange={(e) => updateStatistic(stat.id, 'label', e.target.value)}
                        />
                      </div>
                   </div>
                 ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-bold text-gray-900 mb-4">Lien "Savoir Plus"</h4>
                <div className="flex items-center gap-4">
                   <input 
                     type="text" 
                     className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008a4b] outline-none" 
                     value={settings.stats_savoir_plus_url} 
                     onChange={(e) => handlePopupChange('stats_savoir_plus_url', e.target.value)}
                     placeholder="URL de la page" 
                   />
                </div>
              </div>
            </motion.div>
          )}

          {/* SERVICES TAB */}
          {activeTab === 'services' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                 <h3 className="text-lg font-bold text-gray-900">Raccourcis "Services en ligne"</h3>
                 <button 
                   onClick={addService}
                   className="text-sm font-bold text-white bg-[#008a4b] px-4 py-2 rounded-lg hover:bg-[#00703c] transition flex items-center shadow-sm"
                 >
                    <Plus className="w-4 h-4 mr-1" /> Ajouter un service
                 </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {(settings.services || []).map((svc, i) => (
                   <div key={i} className="bg-slate-50 p-6 rounded-2xl border border-gray-200 text-center relative group">
                      <button 
                        onClick={() => removeService(i)}
                        className="absolute top-2 right-2 text-rose-500 hover:text-white hover:bg-rose-500 p-1 rounded-lg transition opacity-0 group-hover:opacity-100"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className={`w-16 h-16 ${svc.color || 'bg-[#008a4b]'} rounded-full mx-auto flex items-center justify-center text-white cursor-pointer hover:opacity-85 transition shadow-md mb-4 overflow-hidden relative`}>
                         {svc.iconType === 'Image' ? (
                           svc.imageUrl ? (
                             <img src={svc.imageUrl} alt="Logo" className="w-full h-full object-cover" />
                           ) : (
                             <div className="flex flex-col items-center">
                               <Upload className="w-4 h-4 mb-1" />
                               <span className="text-[8px] font-bold">Upload</span>
                             </div>
                           )
                         ) : svc.iconType === 'CustomIcon' ? (
                           (() => {
                             const IconComp = (LucideIcons as any)[svc.customIconName || 'Sparkles'] || LucideIcons.Sparkles;
                             return <IconComp className="w-6 h-6" />;
                           })()
                         ) : svc.iconType === 'Emoji' ? (
                           <span className="text-2xl">{svc.emoji || '🌟'}</span>
                         ) : svc.iconType === 'Laptop' ? <Laptop className="w-6 h-6" /> : svc.iconType === 'FileCheck' ? <FileCheck className="w-6 h-6" /> : svc.iconType === 'MapPin' ? <MapPin className="w-6 h-6" /> : <Building className="w-6 h-6" />}
                         
                         {svc.iconType === 'Image' && (
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={(e) => handleServiceImageUpload(i, e)}
                            />
                         )}
                      </div>
                      
                      <div className="space-y-2">
                        <input 
                          type="text" 
                          className="w-full text-center px-2 py-1.5 border border-gray-300 rounded font-bold uppercase text-xs outline-none bg-white focus:border-[#008a4b] transition" 
                          value={svc.name}
                          onChange={(e) => updateServiceValue(i, 'name', e.target.value)}
                        />
                        <select
                          className="w-full text-center bg-white border border-gray-300 rounded text-[10px] py-1 outline-none font-bold"
                          value={svc.iconType}
                          onChange={(e) => updateServiceValue(i, 'iconType', e.target.value)}
                        >
                          <option value="Laptop">Ordinateur</option>
                          <option value="FileCheck">Dossier</option>
                          <option value="MapPin">Lieu</option>
                          <option value="Building">Bâtiment</option>
                          <option value="CustomIcon">Icône Lucide</option>
                          <option value="Image">Image / Logo</option>
                          <option value="Emoji">Emoji</option>
                        </select>
                        {svc.iconType === 'CustomIcon' && (
                          <div className="space-y-1">
                            <input 
                              type="text" 
                              className="w-full text-center px-2 py-1 border border-gray-300 rounded text-[11px] outline-none bg-white focus:border-[#008a4b] transition font-mono" 
                              placeholder="Nom icône (ex: Heart)"
                              value={svc.customIconName || ''}
                              onChange={(e) => updateServiceValue(i, 'customIconName', e.target.value)}
                            />
                            <p className="text-[8px] text-gray-400 leading-none">Ex: CreditCard, HeartPulse, ShieldCheck</p>
                          </div>
                        )}
                        {svc.iconType === 'Image' && (
                          <input 
                            type="text" 
                            className="w-full text-center px-2 py-1 border border-gray-300 rounded text-[10px] outline-none bg-white focus:border-[#008a4b] transition" 
                            placeholder="Ou collez URL d'image"
                            value={svc.imageUrl || ''}
                            onChange={(e) => updateServiceValue(i, 'imageUrl', e.target.value)}
                          />
                        )}
                        {svc.iconType === 'Emoji' && (
                          <input 
                            type="text" 
                            className="w-full text-center px-2 py-1.5 border border-gray-300 rounded text-[12px] outline-none bg-white focus:border-[#008a4b] transition mb-2" 
                            placeholder="Tapez un emoji (ex: 🌟)"
                            maxLength={2}
                            value={svc.emoji || ''}
                            onChange={(e) => updateServiceValue(i, 'emoji', e.target.value)}
                          />
                        )}
                        <input 
                          type="text" 
                          className="w-full text-center px-2 py-1.5 border border-gray-300 rounded text-[10px] outline-none bg-white focus:border-[#008a4b] transition" 
                          placeholder="/page or https://..."
                          value={svc.url || ''}
                          onChange={(e) => updateServiceValue(i, 'url', e.target.value)}
                        />
                      </div>
                   </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* RESEAUX SOCIAUX TAB */}
          {activeTab === 'reseaux' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-left">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-lg font-bold text-gray-900">Réseaux Sociaux & Témoignages</h3>
                <p className="text-xs text-gray-500 mt-1">Personnalisez votre présence sociale et gérez les témoignages clients affichés sur le site.</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {/* Facebook Section */}
                 <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-[#008a4b] flex items-center gap-1.5 text-sm uppercase tracking-wide border-b border-gray-200 pb-3">
                      <Link2 className="w-4 h-4 text-blue-600" /> Flux Facebook (Widget simulé)
                    </h4>
                    
                    <div className="space-y-4 mt-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">URL de la page Facebook</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008a4b] outline-none font-bold text-xs" 
                          value={settings.facebookPageUrl}
                          onChange={(e) => handlePopupChange('facebookPageUrl', e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nombre d'abonnés affiché</label>
                          <input 
                            type="text" 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008a4b] outline-none font-bold text-xs" 
                            value={settings.facebookFollowers || ''}
                            onChange={(e) => handlePopupChange('facebookFollowers', e.target.value)}
                            placeholder="Ex: 28 K abonnés"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Image du post</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008a4b] outline-none font-bold text-xs" 
                              value={settings.facebookFeedImage || ''}
                              onChange={(e) => handlePopupChange('facebookFeedImage', e.target.value)}
                              placeholder="URL de l'image"
                            />
                            <button 
                              type="button"
                              onClick={() => fbFileRef.current?.click()}
                              className="px-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm"
                              title="Upload Image"
                            >
                              <Upload className="w-4 h-4 text-gray-600" />
                            </button>
                            <input 
                              type="file" 
                              ref={fbFileRef} 
                              className="hidden" 
                              accept="image/*" 
                              onChange={handleFbFileSelect} 
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Texte du dernier post</label>
                        <textarea 
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008a4b] outline-none font-medium text-xs leading-relaxed" 
                          value={settings.facebookFeedText || ''}
                          onChange={(e) => handlePopupChange('facebookFeedText', e.target.value)}
                          placeholder="Saisissez le texte du post Facebook..."
                        />
                      </div>
                    </div>
                 </div>

                 {/* Testimonial Hero Section */}
                 <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-[#008a4b] flex items-center gap-1.5 text-sm uppercase tracking-wide border-b border-gray-200 pb-3">
                      <ImagePlus className="w-4 h-4 text-orange-500" /> Image de garde des témoignages
                    </h4>
                    
                    <div className="space-y-4 mt-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="sm:w-1/3">
                          <div className="w-full h-24 bg-white border border-gray-200 rounded-xl overflow-hidden relative shadow-sm">
                            <img 
                              src={settings.testimonialHeroImage || "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=1000&auto=format&fit=crop"} 
                              className="w-full h-full object-cover" 
                              alt="Aperçu"
                            />
                          </div>
                        </div>
                        <div className="sm:w-2/3 space-y-3">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Image de gauche</label>
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008a4b] outline-none font-bold text-xs" 
                                value={settings.testimonialHeroImage || ''}
                                onChange={(e) => handlePopupChange('testimonialHeroImage', e.target.value)}
                                placeholder="URL de l'image"
                              />
                              <button 
                                type="button"
                                onClick={() => testimonialFileRef.current?.click()}
                                className="px-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm"
                                title="Upload Image"
                              >
                                <Upload className="w-4 h-4 text-gray-600" />
                              </button>
                              <input 
                                type="file" 
                                ref={testimonialFileRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleTestimonialHeroFileSelect} 
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Titre de l'image (Superposé)</label>
                          <input 
                            type="text" 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008a4b] outline-none font-bold text-xs" 
                            value={settings.testimonialHeroTitle || ''}
                            onChange={(e) => handlePopupChange('testimonialHeroTitle', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Badge / Sous-titre</label>
                          <input 
                            type="text" 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008a4b] outline-none font-bold text-xs" 
                            value={settings.testimonialHeroSubtitle || ''}
                            onChange={(e) => handlePopupChange('testimonialHeroSubtitle', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                 </div>

                 {/* Testimonials List Section */}
                 <div className="lg:col-span-2 space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <h4 className="font-extrabold text-[#008a4b] flex items-center gap-1.5 text-sm uppercase tracking-wide">
                        <Sparkles className="w-4 h-4 text-green-600" /> Liste des Témoignages (Carrousel)
                      </h4>
                      <button 
                        type="button"
                        onClick={addTestimonial}
                        className="bg-[#008a4b] hover:bg-[#00703c] text-white font-extrabold text-xs px-3 py-2 rounded-lg transition flex items-center gap-1 cursor-pointer select-none shadow-sm"
                      >
                         <Plus className="w-3.5 h-3.5" /> Ajouter un témoignage
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      {((settings.testimonials && settings.testimonials.length > 0) ? settings.testimonials : []).map((item, index) => (
                        <div key={item.id} className="p-5 bg-white border border-gray-200 rounded-2xl relative hover:shadow-md transition-all duration-300 group">
                          <button
                            type="button"
                            onClick={() => deleteTestimonial(item.id)}
                            className="absolute top-4 right-4 text-rose-400 hover:text-white hover:bg-rose-500 p-1.5 rounded-lg transition-colors cursor-pointer opacity-0 group-hover:opacity-100 shadow-sm border border-rose-100 bg-rose-50"
                            title="Supprimer ce témoignage"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                          <div className="flex items-center gap-2 mb-4">
                             <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center text-[#008a4b] font-black text-[10px]">
                               {index + 1}
                             </div>
                             <span className="text-gray-900 font-extrabold text-[10px] uppercase tracking-widest">Témoignage bénéficiaire</span>
                          </div>

                          <div className="space-y-4">
                             <div>
                               <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Citation / Témoignage</label>
                               <textarea
                                 rows={3}
                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#008a4b] outline-none text-xs italic font-bold text-gray-800 leading-relaxed"
                                 value={item.quote}
                                 onChange={(e) => updateTestimonial(item.id, 'quote', e.target.value)}
                                 placeholder="Saisissez la citation de satisfaction..."
                               />
                             </div>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                               <div>
                                 <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Auteur</label>
                                 <input
                                   type="text"
                                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#008a4b] outline-none text-xs font-black text-gray-900"
                                   value={item.author}
                                   onChange={(e) => updateTestimonial(item.id, 'author', e.target.value)}
                                   placeholder="Nom de l'auteur"
                                 />
                               </div>
                               <div>
                                 <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Fonction / Grade</label>
                                 <input
                                   type="text"
                                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#008a4b] outline-none text-xs font-semibold text-gray-700"
                                   value={item.role || ''}
                                   onChange={(e) => updateTestimonial(item.id, 'role', e.target.value)}
                                   placeholder="Ex: Adjudant-Chef"
                                 />
                               </div>
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {(settings.testimonials || []).length === 0 && (
                      <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                        <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm font-bold text-gray-500">Aucun témoignage enregistré</p>
                        <p className="text-xs text-gray-400 mt-1">Ajoutez un nouveau témoignage pour enrichir votre page d'accueil.</p>
                      </div>
                    )}
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'flash' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 text-left">
              <div className="border-b border-gray-100 pb-3 flex justify-between items-end">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Gestion du Flash Infos</h3>
                  <p className="text-xs text-gray-500 mt-1">Ajoutez ou modifiez les messages défilants en haut du site.</p>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Affichage actif</span>
                  <button 
                    onClick={() => handlePopupChange('showFlashInfos', !settings.showFlashInfos)}
                    className={`w-10 h-5 rounded-full relative transition-all ${settings.showFlashInfos ? 'bg-[#008a4b]' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${settings.showFlashInfos ? 'right-0.5' : 'left-0.5'}`}></div>
                  </button>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-[#008a4b]" />
                    <h4 className="font-extrabold text-gray-900 uppercase text-sm tracking-tight">Liste des messages</h4>
                  </div>
                  <button 
                    onClick={async () => {
                      const newList = [...(settings.flashInfos || []), "Nouveau message d'information..."];
                      handlePopupChange('flashInfos', newList);
                    }}
                    className="bg-[#008a4b] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-[#00703c] transition shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Ajouter un message
                  </button>
                </div>

                <div className="space-y-3">
                  {(settings.flashInfos || []).map((info, index) => (
                    <div key={index} className="flex gap-3 items-start group">
                      <div className="bg-slate-100 w-8 h-10 rounded-lg flex items-center justify-center text-xs font-black text-gray-400 mt-0.5">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <textarea 
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008a4b] outline-none text-sm text-gray-700 leading-tight" 
                          rows={2}
                          value={info}
                          onChange={(e) => {
                            const newList = [...(settings.flashInfos || [])];
                            newList[index] = e.target.value;
                            handlePopupChange('flashInfos', newList);
                          }}
                        />
                      </div>
                      <button 
                        onClick={async () => {
                          const newList = (settings.flashInfos || []).filter((_, i) => i !== index);
                          handlePopupChange('flashInfos', newList);
                        }}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Supprimer"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}

                  {(settings.flashInfos || []).length === 0 && (
                    <div className="py-12 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-400">
                      <Megaphone className="w-10 h-10 mb-3 opacity-20" />
                      <p className="text-xs font-bold">Aucun message configuré</p>
                    </div>
                  )}
                </div>

                <div className="mt-8 p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-700">Conseil d'affichage</p>
                    <p className="text-[10px] text-gray-500 leading-relaxed">
                      Les messages défilent en boucle en haut du site. Pour un rendu optimal, évitez les messages trop longs et limitez-vous à 3-5 informations importantes.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* PAGES INFO TAB */}
          {activeTab === 'pages' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 text-left">
              <div className="border-b border-gray-100 pb-3">
                 <h3 className="text-lg font-bold text-gray-900">Gestion des Pages d'Information</h3>
                 <p className="text-xs text-gray-500 mt-1">Personnalisez le contenu textuel des pages Vision et RGPD.</p>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {/* Vision Content */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-3">
                    <Eye className="w-5 h-5 text-[#008a4b]" />
                    <h4 className="font-extrabold text-gray-900 uppercase text-sm tracking-tight">Contenu de la page "Notre Vision"</h4>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Texte principal de la vision</label>
                      <textarea 
                        rows={8}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#008a4b] outline-none text-sm text-gray-700 leading-relaxed" 
                        value={settings.visionContent || ''}
                        onChange={(e) => handlePopupChange('visionContent', e.target.value)}
                        placeholder="Décrivez ici la vision stratégique de la CAMA..."
                      />
                      <p className="text-[10px] text-gray-400 mt-2 italic">Supporte les retours à la ligne pour une meilleure mise en page.</p>
                    </div>
                  </div>
                </div>

                {/* RGPD Content */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-3">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <h4 className="font-extrabold text-gray-900 uppercase text-sm tracking-tight">Contenu "RGPD & Confidentialité"</h4>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Politique de confidentialité</label>
                      <textarea 
                        rows={8}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-sm text-gray-700 leading-relaxed" 
                        value={settings.rgpdContent || ''}
                        onChange={(e) => handlePopupChange('rgpdContent', e.target.value)}
                        placeholder="Détaillez ici la politique de protection des données..."
                      />
                      <p className="text-[10px] text-gray-400 mt-2 italic">Il est recommandé d'inclure les coordonnées du DPO.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* EMAIL SETTINGS TAB */}
          {activeTab === 'email' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 text-left">
              <div className="border-b border-gray-100 pb-3">
                 <h3 className="text-lg font-bold text-gray-900">Configuration du Serveur Email</h3>
                 <p className="text-xs text-gray-500 mt-1">Configurez les paramètres SMTP et IMAP pour l'envoi et la réception automatique des mails.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SMTP Config */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-3">
                    <Mail className="w-5 h-5 text-[#008a4b]" />
                    <h4 className="font-extrabold text-gray-900 uppercase text-sm tracking-tight">Serveur d'envoi (SMTP)</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Hôte SMTP</label>
                        <input 
                          type="text"
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008a4b] outline-none text-sm"
                          value={settings.emailSettings?.smtpHost || ''}
                          onChange={(e) => handleEmailSettingsChange('smtpHost', e.target.value)}
                          placeholder="smtp.example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Port</label>
                        <input 
                          type="text"
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008a4b] outline-none text-sm"
                          value={settings.emailSettings?.smtpPort || ''}
                          onChange={(e) => handleEmailSettingsChange('smtpPort', e.target.value)}
                          placeholder="587"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Utilisateur / Login</label>
                      <input 
                        type="text"
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008a4b] outline-none text-sm"
                        value={settings.emailSettings?.smtpUser || ''}
                        onChange={(e) => handleEmailSettingsChange('smtpUser', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Mot de passe</label>
                      <input 
                        type="password"
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008a4b] outline-none text-sm"
                        value={settings.emailSettings?.smtpPass || ''}
                        onChange={(e) => handleEmailSettingsChange('smtpPass', e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleEmailSettingsChange('smtpSecure', !settings.emailSettings?.smtpSecure)}
                        className={`w-10 h-5 rounded-full relative transition-all ${settings.emailSettings?.smtpSecure ? 'bg-[#008a4b]' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${settings.emailSettings?.smtpSecure ? 'right-0.5' : 'left-0.5'}`}></div>
                      </button>
                      <span className="text-xs font-bold text-gray-700">Utiliser SSL/TLS (Sécurisé)</span>
                    </div>
                  </div>
                </div>

                {/* IMAP Config */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-3">
                    <Settings className="w-5 h-5 text-blue-600" />
                    <h4 className="font-extrabold text-gray-900 uppercase text-sm tracking-tight">Serveur de réception (IMAP)</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Hôte IMAP</label>
                        <input 
                          type="text"
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-sm"
                          value={settings.emailSettings?.imapHost || ''}
                          onChange={(e) => handleEmailSettingsChange('imapHost', e.target.value)}
                          placeholder="imap.example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Port</label>
                        <input 
                          type="text"
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-sm"
                          value={settings.emailSettings?.imapPort || ''}
                          onChange={(e) => handleEmailSettingsChange('imapPort', e.target.value)}
                          placeholder="993"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Expéditeur par défaut (Email)</label>
                      <input 
                        type="email"
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-sm"
                        value={settings.emailSettings?.fromEmail || ''}
                        onChange={(e) => handleEmailSettingsChange('fromEmail', e.target.value)}
                        placeholder="no-reply@cama.bf"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Nom d'affichage</label>
                      <input 
                        type="text"
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-sm"
                        value={settings.emailSettings?.fromName || ''}
                        onChange={(e) => handleEmailSettingsChange('fromName', e.target.value)}
                        placeholder="CAMA Notifications"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 text-left">
              <div className="border-b border-gray-100 pb-3 flex justify-between items-start">
                 <div>
                   <h3 className="text-lg font-bold text-gray-900">Modèles de Notifications</h3>
                   <p className="text-xs text-gray-500 mt-1">Gérez les messages envoyés automatiquement aux assurés selon l'état de leur dossier.</p>
                 </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                 <h4 className="font-bold text-blue-900 text-sm mb-2 flex items-center">
                    <Sparkles className="w-4 h-4 mr-2" /> Variables de personnalisation
                 </h4>
                 <p className="text-xs text-blue-800 mb-3 leading-relaxed">
                   Vous pouvez utiliser ces variables dans l'objet ou le contenu. Elles seront automatiquement remplacées pour personnaliser l'e-mail afin de maintenir un contact humain :
                 </p>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[11px] font-mono text-blue-900 bg-white p-3 rounded border border-blue-100">
                    <div><strong className="text-blue-700">{'{nom_assure}'}</strong> : Nom</div>
                    <div><strong className="text-blue-700">{'{prenom_assure}'}</strong> : Prénom</div>
                    <div><strong className="text-blue-700">{'{num_dossier}'}</strong> : N° de dossier</div>
                    <div><strong className="text-blue-700">{'{statut_dossier}'}</strong> : Statut</div>
                    <div><strong className="text-blue-700">{'{num_cama}'}</strong> : N° CAMA</div>
                    <div><strong className="text-blue-700">{'{date_soumission}'}</strong> : Date</div>
                    <div><strong className="text-blue-700">{'{motif}'}</strong> : Raison (rejet/complément)</div>
                 </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {[
                  { id: 'dossierCreated', label: 'Dossier créé / reçu', icon: PlusCircle, color: 'text-blue-600' },
                  { id: 'statusChanged', label: 'Changement de statut', icon: RotateCcw, color: 'text-yellow-600' },
                  { id: 'dossierValidated', label: 'Dossier Validé', icon: CheckCircle2, color: 'text-green-600' },
                  { id: 'dossierRejected', label: 'Dossier Rejeté / Complément', icon: Shield, color: 'text-red-600' }
                ].map((tpl) => (
                  <div key={tpl.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-3">
                      <tpl.icon className={`w-5 h-5 ${tpl.color}`} />
                      <h4 className="font-extrabold text-gray-900 uppercase text-sm tracking-tight">{tpl.label}</h4>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Objet de l'email</label>
                        <input 
                          type="text"
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm font-bold"
                          value={settings.notificationTemplates?.[tpl.id as keyof typeof settings.notificationTemplates]?.subject || ''}
                          onChange={(e) => handleNotificationTemplateChange(tpl.id, 'subject', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Contenu du message</label>
                        <textarea 
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm text-gray-700 leading-relaxed" 
                          value={settings.notificationTemplates?.[tpl.id as keyof typeof settings.notificationTemplates]?.body || ''}
                          onChange={(e) => handleNotificationTemplateChange(tpl.id, 'body', e.target.value)}
                          placeholder={`Bonjour {prenom_assure},\nVotre dossier {num_dossier} a bien été reçu.`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* PARTENAIRES TAB */}
          {activeTab === 'partenaires' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                 <h3 className="text-lg font-bold text-gray-900">Affiliation des partenaires</h3>
                 <button 
                   onClick={addPartner}
                   className="text-sm font-bold text-white bg-[#008a4b] px-4 py-2 rounded-lg hover:bg-[#00703c] transition flex items-center shadow-sm"
                 >
                    <Plus className="w-4 h-4 mr-1" /> Ajouter un partenaire
                 </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                 {(settings.partners || []).map((partner) => (
                    <div key={partner.id} className="bg-slate-50 border border-gray-200 rounded-2xl p-5 text-center group cursor-pointer hover:border-[#008a4b] transition flex flex-col justify-between">
                       <div 
                          onClick={(e) => {
                            if ((e.target as HTMLElement).closest('.btn-delete-logo')) return;
                            const input = document.getElementById(`partner-file-${partner.id}`);
                            input?.click();
                          }}
                          className="w-full h-24 bg-white flex flex-col items-center justify-center rounded-xl mb-3 border border-gray-100 shadow-inner relative group/logo overflow-hidden cursor-pointer"
                        >
                           {partner.logo ? (
                              <img 
                                src={partner.logo} 
                                alt="Logo partenaire" 
                                className="w-full h-full object-contain p-2" 
                                referrerPolicy="no-referrer"
                              />
                           ) : (
                              <>
                                 <span className="text-3xl mb-1">🤝</span>
                                 <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide">Ajouter un Logo</span>
                              </>
                           )}
                           
                           {partner.logo && (
                              <button
                                 type="button"
                                 className="btn-delete-logo absolute top-1 right-1 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white p-1 rounded transition opacity-0 group-hover/logo:opacity-100 border border-rose-100 cursor-pointer"
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    updatePartnerLogo(partner.id, '');
                                 }}
                                 title="Supprimer le logo"
                              >
                                 <Trash className="w-3 h-3" />
                              </button>
                           )}

                           <input 
                              type="file"
                              id={`partner-file-${partner.id}`}
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                 if (e.target.files && e.target.files[0]) {
                                    const file = e.target.files[0];
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                       if (event.target?.result) {
                                          updatePartnerLogo(partner.id, event.target.result as string);
                                       }
                                    };
                                    reader.readAsDataURL(file);
                                 }
                              }}
                           />
                        </div>
                       
                       <input 
                         type="text" 
                         className="w-full text-center px-2 py-1.5 border border-transparent hover:border-gray-200 focus:border-[#008a4b] focus:bg-white rounded font-extrabold outline-none text-xs" 
                         value={partner.name}
                         onChange={(e) => updatePartnerName(partner.id, e.target.value)}
                       />
                       
                       <button 
                         onClick={() => deletePartner(partner.id)}
                         className="text-xs text-rose-500 font-bold mt-3 hover:underline flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition"
                       >
                         <Trash2 className="w-3 h-3" /> Retirer
                       </button>
                    </div>
                 ))}
              </div>
            </motion.div>
          )}

          {/* SECTIONS TAB */}
          {activeTab === 'sections' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-left">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-lg font-bold text-gray-900">Sections de la page d'accueil</h3>
                <p className="text-xs text-gray-500 mt-1">Activez ou désactivez l'affichage des différentes rubriques de la page d'accueil en temps réel.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { key: 'prestations', title: 'Nos Prestations', desc: 'Affiche la grille de vos prestations et garanties de santé pour les militaires et leurs familles.' },
                  { key: 'dgMessage', title: 'Le mot du Directeur Général', desc: 'Affiche le portrait, le message officiel, le nom et la citation inspirante du DG.' },
                  { key: 'services', title: 'Services en Ligne', desc: 'Affiche la section d\'accès rapide aux services en ligne (Enrôlement, Centres conventionnés, etc.).' },
                  { key: 'statistics', title: 'Statistiques (Chiffres)', desc: 'Affiche les indicateurs chiffrés et statistiques de la CAMA.' },
                  { key: 'faq', title: 'Foire Aux Questions (FAQ)', desc: 'Affiche la foire aux questions interactive pour orienter les assurés.' },
                  { key: 'socials', title: 'Nos réseaux sociaux', desc: 'Affiche le flux Facebook officiel CAMA ainsi que le carrousel des témoignages.' },
                  { key: 'partners', title: 'Partenaires', desc: 'Affiche la liste des partenaires institutionnels (ISSA, CIPRES, BCEAO, etc.).' }
                ].map((sec) => {
                  const isActive = settings.activeSections?.[sec.key] !== false;
                  return (
                    <div 
                      key={sec.key}
                      className={`p-6 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 ${
                        isActive 
                          ? 'bg-green-50/50 border-green-200 shadow-sm' 
                          : 'bg-slate-50 border-gray-200'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#008a4b]' : 'bg-gray-400'}`} />
                          <h4 className="font-extrabold text-gray-900 text-sm uppercase tracking-wide">{sec.title}</h4>
                        </div>
                        <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{sec.desc}</p>
                      </div>

                      <button
                        type="button"
                        onClick={async () => {
                          const currentSections = settings.activeSections || {
                            prestations: true,
                            dgMessage: true,
                            services: true,
                            statistics: true,
                            faq: true,
                            socials: true,
                            partners: true
                          };
                          setSettings(prev => ({
                            ...prev,
                            activeSections: {
                              ...currentSections,
                              [sec.key]: !isActive
                            }
                          }));
                        }}
                        className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 focus:outline-none cursor-pointer flex items-center ${
                          isActive ? 'bg-[#008a4b] justify-end' : 'bg-gray-300 justify-start'
                        }`}
                      >
                        <motion.div 
                          layout 
                          className="w-6 h-6 rounded-full bg-white shadow-md"
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* FAQ TAB */}
          {activeTab === 'faq' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-left">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Gestion de la Foire Aux Questions (FAQ)</h3>
                  <p className="text-xs text-gray-500 mt-1">Créez, modifiez ou supprimez les questions posées fréquemment par les assurés de la CAMA.</p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const currentFaqs = settings.faqs || [];
                    const newId = String(currentFaqs.length > 0 ? Math.max(...currentFaqs.map(f => Number(f.id) || 0)) + 1 : 1);
                    const newFaq = { 
                      id: newId, 
                      q: "Nouvelle question ?", 
                      a: "Saisissez la réponse détaillée à cette question.", 
                      active: true 
                    };
                    setSettings(prev => ({ ...prev, faqs: [...currentFaqs, newFaq] }));
                  }}
                  className="bg-[#008a4b] hover:bg-[#00703c] text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-1.5" /> Ajouter une question
                </button>
              </div>

              <div className="space-y-4">
                {(!settings.faqs || settings.faqs.length === 0) ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-slate-50">
                    <span className="text-4xl">❓</span>
                    <h4 className="font-extrabold text-gray-900 mt-4">Aucune question enregistrée</h4>
                    <p className="text-xs text-gray-500 mt-1">Commencez par ajouter votre première FAQ à l'aide du bouton ci-dessus.</p>
                  </div>
                ) : (
                  (settings.faqs || []).map((faq, idx) => (
                    <div 
                      key={faq.id} 
                      className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 relative group"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 space-y-4">
                          <div>
                            <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Question {idx + 1}</label>
                            <input
                              type="text"
                              value={faq.q}
                              onChange={(e) => {
                                const currentFaqs = settings.faqs || [];
                                const updated = currentFaqs.map(f => f.id === faq.id ? { ...f, q: e.target.value } : f);
                                setSettings(prev => ({ ...prev, faqs: updated }));
                              }}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#008a4b] outline-none text-sm font-bold text-gray-900"
                              placeholder="Quelle est la question ?"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Réponse</label>
                            <textarea
                              rows={3}
                              value={faq.a}
                              onChange={(e) => {
                                const currentFaqs = settings.faqs || [];
                                const updated = currentFaqs.map(f => f.id === faq.id ? { ...f, a: e.target.value } : f);
                                setSettings(prev => ({ ...prev, faqs: updated }));
                              }}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#008a4b] outline-none text-xs leading-relaxed"
                              placeholder="Saisissez la réponse..."
                            />
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-4 min-w-[120px]">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-500">Visible</span>
                            <button
                              type="button"
                              onClick={async () => {
                                const currentFaqs = settings.faqs || [];
                                const updated = currentFaqs.map(f => f.id === faq.id ? { ...f, active: f.active === false ? true : false } : f);
                                setSettings(prev => ({ ...prev, faqs: updated }));
                              }}
                              className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-300 cursor-pointer flex items-center ${
                                faq.active !== false ? 'bg-[#008a4b] justify-end' : 'bg-gray-300 justify-start'
                              }`}
                            >
                              <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={async () => {
                              const currentFaqs = settings.faqs || [];
                              const updated = currentFaqs.filter(f => f.id !== faq.id);
                              setSettings(prev => ({ ...prev, faqs: updated }));
                            }}
                            className="text-xs text-rose-500 font-bold hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition duration-300"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* FOOTER TAB */}
          {activeTab === 'footer' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                 <h3 className="text-lg font-bold text-gray-900">Bas de page (Footer)</h3>
                 <div className="flex gap-2">
                    <button 
                      onClick={async () => {
                        const updated = [...(settings.footer?.liensRapides || [])];
                        updated.push({ label: 'Nouveau lien', url: '#' });
                        setSettings(prev => ({ ...prev, footer: { ...prev.footer!, liensRapides: updated } }));
                      }}
                      className="text-[10px] font-bold text-white bg-blue-500 px-3 py-1.5 rounded-lg hover:bg-blue-600 transition flex items-center shadow-sm"
                    >
                       <Plus className="w-3 h-3 mr-1" /> Lien Rapide
                    </button>
                    <button 
                      onClick={async () => {
                        const updated = [...(settings.footer?.espaceNumerique || [])];
                        updated.push({ label: 'Nouveau lien', url: '#' });
                        setSettings(prev => ({ ...prev, footer: { ...prev.footer!, espaceNumerique: updated } }));
                      }}
                      className="text-[10px] font-bold text-white bg-purple-500 px-3 py-1.5 rounded-lg hover:bg-purple-600 transition flex items-center shadow-sm"
                    >
                       <Plus className="w-3 h-3 mr-1" /> Espace Numérique
                    </button>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Liens Rapides & Espace Numérique */}
                <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase">Présentation & Devise</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Description (sous le logo)</label>
                        <textarea
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#008a4b] outline-none text-xs leading-relaxed"
                          value={settings.footer?.description || ""}
                          onChange={(e) => setSettings(prev => ({ 
                            ...prev, 
                            footer: { 
                              ...(prev.footer || {
                                copyright: "© 2026 CAMA Burkina Faso. Tous droits réservés.",
                                liensRapides: [],
                                espaceNumerique: [],
                                contactTitle: "Contactez-nous",
                                address: "Camp Guillaume Ouédraogo, Ouagadougou, Burkina Faso",
                                phone: "+226 25 00 00 00",
                                email: "contact@cama.bf"
                              }), 
                              description: e.target.value 
                            } 
                          }))}
                          placeholder="Caisse d'Assurance Maladie des Armées..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Devise / Badge (Bouton jaune/vert)</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#008a4b] outline-none text-xs font-bold text-[#008a4b]"
                          value={settings.footer?.badgeText || ""}
                          onChange={(e) => setSettings(prev => ({ 
                            ...prev, 
                            footer: { 
                              ...(prev.footer || {
                                copyright: "© 2026 CAMA Burkina Faso. Tous droits réservés.",
                                liensRapides: [],
                                espaceNumerique: [],
                                contactTitle: "Contactez-nous",
                                address: "Camp Guillaume Ouédraogo, Ouagadougou, Burkina Faso",
                                phone: "+226 25 00 00 00",
                                email: "contact@cama.bf"
                              }), 
                              badgeText: e.target.value 
                            } 
                          }))}
                          placeholder="La Patrie ou la Mort, nous vaincrons !"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase">Liens Rapides</h4>
                    <div className="space-y-3">
                      {settings.footer?.liensRapides?.map((lien, idx) => (
                        <div key={idx} className="flex gap-2 relative group">
                          <button 
                            onClick={async () => {
                              const updated = [...(settings.footer?.liensRapides || [])];
                              updated.splice(idx, 1);
                              updateFooter('liensRapides', updated);
                            }}
                            className="absolute -left-3 -top-2 text-rose-500 hover:text-white hover:bg-rose-500 p-0.5 rounded-md transition opacity-0 group-hover:opacity-100 bg-white border border-rose-100 shadow-sm z-10"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                          <input
                            type="text"
                            placeholder="Titre"
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#008a4b] outline-none text-xs font-bold"
                            value={lien.label}
                            onChange={(e) => {
                              const updated = [...(settings.footer?.liensRapides || [])];
                              updated[idx] = { ...updated[idx], label: e.target.value };
                              updateFooter('liensRapides', updated);
                            }}
                          />
                          <input
                            type="text"
                            placeholder="URL"
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#008a4b] outline-none text-xs"
                            value={lien.url}
                            onChange={(e) => {
                              const updated = [...(settings.footer?.liensRapides || [])];
                              updated[idx] = { ...updated[idx], url: e.target.value };
                              updateFooter('liensRapides', updated);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase">Espace Numérique</h4>
                    <div className="space-y-3">
                      {settings.footer?.espaceNumerique?.map((lien, idx) => (
                        <div key={idx} className="flex gap-2 relative group">
                          <button 
                            onClick={async () => {
                              const updated = [...(settings.footer?.espaceNumerique || [])];
                              updated.splice(idx, 1);
                              updateFooter('espaceNumerique', updated);
                            }}
                            className="absolute -left-3 -top-2 text-rose-500 hover:text-white hover:bg-rose-500 p-0.5 rounded-md transition opacity-0 group-hover:opacity-100 bg-white border border-rose-100 shadow-sm z-10"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                          <input
                            type="text"
                            placeholder="Titre"
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#008a4b] outline-none text-xs font-bold"
                            value={lien.label}
                            onChange={(e) => {
                              const updated = [...(settings.footer?.espaceNumerique || [])];
                              updated[idx] = { ...updated[idx], label: e.target.value };
                              updateFooter('espaceNumerique', updated);
                            }}
                          />
                          <input
                            type="text"
                            placeholder="URL"
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#008a4b] outline-none text-xs"
                            value={lien.url}
                            onChange={(e) => {
                              const updated = [...(settings.footer?.espaceNumerique || [])];
                              updated[idx] = { ...updated[idx], url: e.target.value };
                              updateFooter('espaceNumerique', updated);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Contact & Copyright */}
                <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase">Contactez-nous</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Titre de section</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#008a4b] outline-none text-xs font-bold text-gray-900"
                          value={settings.footer?.contactTitle || "Contactez-nous"}
                          onChange={(e) => updateFooter('contactTitle', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Adresse physique</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#008a4b] outline-none text-xs"
                          value={settings.footer?.address || ""}
                          onChange={(e) => updateFooter('address', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Téléphone</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#008a4b] outline-none text-xs font-bold"
                          value={settings.footer?.phone || ""}
                          onChange={(e) => updateFooter('phone', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Email</label>
                        <input
                          type="email"
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#008a4b] outline-none text-xs"
                          value={settings.footer?.email || ""}
                          onChange={(e) => updateFooter('email', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase">Copyright & Mentions légales</h4>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Texte de copyright</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#008a4b] outline-none text-xs text-gray-600"
                        value={settings.footer?.copyright || "© 2026 CAMA Burkina Faso. Tous droits réservés."}
                        onChange={(e) => updateFooter('copyright', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
