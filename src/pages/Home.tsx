import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  FileText, 
  Users, 
  Activity, 
  FileCheck, 
  Building, 
  X, 
  MapPin, 
  Heart, 
  PlusCircle, 
  Laptop, 
  HeartPulse, 
  UserCircle2, 
  ShieldCheck, 
  Globe, 
  MessageCircle, 
  CheckCircle2, 
  ArrowLeftRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getSiteSettings, getArticles, safeStorage } from '../lib/dataStore';
import { useLanguage } from '../lib/LanguageContext';

export default function Home() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState(() => getSiteSettings());
  const [showModal, setShowModal] = useState(() => {
    const s = getSiteSettings();
    if (!s.popupActive) return false;
    const views = Number(safeStorage.getItem('cama_popup_views') || '0');
    const maxViews = s.popupMaxViews !== undefined ? s.popupMaxViews : 2;
    return views < maxViews;
  });

  useEffect(() => {
    // Increment popup count on mount if visible
    if (showModal) {
      const views = Number(safeStorage.getItem('cama_popup_views') || '0');
      safeStorage.setItem('cama_popup_views', String(views + 1));
    }
  }, [showModal]);

  useEffect(() => {
    // Synchroniser en temps réel les réglages du backoffice CAMA
    setSettings(getSiteSettings());
    
    const handleSyncSettings = () => {
      const freshSettings = getSiteSettings();
      setSettings(freshSettings);
      const views = Number(safeStorage.getItem('cama_popup_views') || '0');
      const maxViews = freshSettings.popupMaxViews !== undefined ? freshSettings.popupMaxViews : 2;
      setShowModal(freshSettings.popupActive && (views < maxViews));
    };

    window.addEventListener('storage', handleSyncSettings);
    window.addEventListener('focus', handleSyncSettings);
    return () => {
      window.removeEventListener('storage', handleSyncSettings);
      window.removeEventListener('focus', handleSyncSettings);
    };
  }, []);

  const allArticles = useMemo(() => getArticles(), []);
  const publishedArticles = useMemo(() => allArticles.filter(a => a.status === 'Publié'), [allArticles]);

  // Partners logos rendered professionally
  const partnerLogos: Record<string, { logoText: string, color: string, badge: string }> = {
    'ISSA': { logoText: 'ISSA', color: 'text-blue-500', badge: '🌐' },
    'CIPRES': { logoText: 'C.I.P.R.E.S', color: 'text-amber-500', badge: '🏵️' },
    'OIT (ILO)': { logoText: 'ILO', color: 'text-cyan-700', badge: '⚙️' },
    'BCEAO': { logoText: 'BCEAO', color: 'text-emerald-700', badge: '🏛️' },
  };

  // Multiple testimonials integration
  const testimonials = useMemo(() => {
    if (settings.testimonials && settings.testimonials.length > 0) {
      return settings.testimonials;
    }
    return [
      {
        id: 'legacy',
        quote: settings.qualityCitation || "« Nous avons trouvé à la CAMA, un système efficace qui répond en tout point aux exigences de qualité »",
        author: settings.qualityAuthor || "Mme Ouedraogo",
        role: "Bénéficiaire CAMA"
      }
    ];
  }, [settings.testimonials, settings.qualityCitation, settings.qualityAuthor]);

  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = useMemo(() => {
    return (settings.faqs || []).filter(f => f.active !== false);
  }, [settings.faqs]);

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="w-full">
      {/* Welcome Popup Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-950/85 backdrop-blur-md text-left overflow-y-auto"
          >
             <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 180 }}
                className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full relative overflow-hidden text-left border border-slate-100 flex flex-col md:flex-row min-h-[550px] md:h-[620px]"
             >
                {/* Close Button with premium rotate-hover glow */}
                <button 
                  onClick={() => setShowModal(false)} 
                  className="absolute top-5 right-5 bg-slate-900/10 hover:bg-[#ef2b2d] text-slate-800 hover:text-white p-2.5 rounded-full transition-all duration-300 z-30 shadow hover:rotate-90"
                  aria-label="Fermer le message"
                >
                  <X className="w-5 h-5"/>
                </button>

                {/* Left Column: Patriotic Military Cinematic Ribbon */}
                <div className="md:w-5/12 bg-slate-900 relative flex flex-col justify-end p-8 overflow-hidden min-h-[250px] md:min-h-full">
                   {/* Background Image */}
                   <img 
                     src={settings.popupImage || "https://images.unsplash.com/photo-1579548122080-c11707ea8211?q=80&w=2070&auto=format&fit=crop"} 
                     alt="Drapeau du Burkina Faso en arriere-plan" 
                     className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity scale-105" 
                     referrerPolicy="no-referrer"
                   />
                   
                   {/* Gradient shading */}
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/10 z-10"></div>
                   {/* Gold, Green & Red stripe decoration */}
                   <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#ef2b2d] via-[#fcd116] to-[#008a4b] z-20"></div>

                   <div className="relative z-20 space-y-4">
                     <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 w-fit">
                        <span className="flex h-2.5 w-2.5 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                        <span className="text-white text-[11px] font-extrabold tracking-widest uppercase">CAMA • Burkina Faso</span>
                     </div>

                     <div className="pt-2">
                        <h4 className="text-yellow-400 text-xs font-black uppercase tracking-wider mb-1">
                          {settings.popupTitle || "COMMUNIQUÉ DU DIRECTEUR GÉNÉRAL"}
                        </h4>
                        <p className="text-slate-200 text-[11px] md:text-xs leading-relaxed font-semibold italic border-l-2 border-yellow-400 pl-3">
                          "La protection sociale et la couverture médicale de nos braves soldats et de leurs vaillantes familles est au centre de notre combat républicain."
                        </p>
                     </div>

                     <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pt-2 flex items-center gap-1.5">
                       <ShieldCheck className="w-4 h-4 text-green-500" /> Plateforme Nationale Sécurisée • CAMA
                     </div>
                   </div>
                </div>

                {/* Right Column: Title and details layout */}
                <div className="md:w-7/12 p-8 md:p-12 flex flex-col justify-between bg-gradient-to-br from-white via-slate-50 to-white overflow-y-auto">
                   
                   <div className="space-y-6 my-auto">
                      <div className="flex items-center gap-2 text-xs font-black tracking-widest uppercase text-[#008a4b]">
                        <span className="w-6 h-0.5 bg-[#008a4b]"></span>
                        <span>ADMINISTRATION CAMA</span>
                        <span className="bg-[#fcd116] text-[#ef2b2d] px-2.5 py-0.5 rounded text-[9px] font-extrabold tracking-wide">OFFICIEL 🇧🇫</span>
                      </div>

                      <h2 className="text-2xl md:text-3xl font-extrabold text-[#008a4b] tracking-tight leading-[1.2]">
                        {settings.popupSubtitle || "Bienvenue sur la Plateforme Officielle de la Caisse d'Assurance Maladie des Armées"}
                      </h2>

                      {/* Miniature flag divider */}
                      <div className="flex items-center gap-1">
                        <div className="h-1 bg-[#ef2b2d] w-12 rounded"></div>
                        <div className="h-1.5 bg-[#fcd116] w-3 rounded-full"></div>
                        <div className="h-1 bg-[#008a4b] w-12 rounded"></div>
                      </div>

                      <p className="text-gray-700 text-sm md:text-base font-semibold leading-relaxed">
                        {settings.popupContent || "Cette plateforme dématérialisée permet à chaque combattant, souscripteur d'armes et personnel de la défense nationale, d'enregistrer de manière fiable ses ayants droit pour l'attribution des cartes d'assurance maladie de la CAMA."}
                      </p>

                      {/* Interactive Benefits display */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-100 shadow-sm">
                           <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                           <span className="text-xs font-bold text-gray-800">Couverture Elargie</span>
                        </div>
                        <div className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-100 shadow-sm">
                           <Activity className="w-5 h-5 text-green-600 flex-shrink-0" />
                           <span className="text-xs font-bold text-gray-800">Assistance Médicale Directe</span>
                        </div>
                        <div className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-100 shadow-sm">
                           <FileCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
                           <span className="text-xs font-bold text-gray-800">Enrôlement Sécurisé</span>
                        </div>
                        <div className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-100 shadow-sm">
                           <Users className="w-5 h-5 text-green-600 flex-shrink-0" />
                           <span className="text-xs font-bold text-gray-800">Espace Privé Membre</span>
                        </div>
                      </div>
                   </div>

                   {/* Layout Action buttons */}
                   <div className="pt-8 flex flex-col sm:flex-row gap-3 items-center">
                     <button 
                       onClick={() => setShowModal(false)} 
                       className="w-full sm:flex-1 bg-gradient-to-r from-[#008a4b] to-[#00703c] text-white font-extrabold py-4 px-6 rounded-xl hover:shadow-[#008a4b]/20 hover:shadow-xl transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                     >
                       <span>Accéder à la Plateforme CAMA</span>
                       <ArrowRight className="w-5 h-5" />
                     </button>
                     <button 
                       onClick={() => setShowModal(false)} 
                       className="w-full sm:w-auto text-gray-700 hover:text-gray-900 border border-slate-200 bg-white font-bold py-4 px-6 rounded-xl hover:bg-slate-50 transition-colors"
                     >
                       Passer
                     </button>
                   </div>
                   
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Banner Section */}
      <div className="relative bg-[#008a4b] text-white pb-16 lg:pb-0 h-[80vh] min-h-[500px] flex items-center overflow-hidden text-left">
        {/* Background Image using <img> with JSX referrerPolicy="no-referrer" for full web & sandboxed compatibility */}
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
          <img 
            src={settings.heroImage || 'https://images.unsplash.com/photo-1544257121-8178d46e33bd?q=80&w=2070&auto=format&fit=crop'} 
            className="w-full h-full object-cover select-none"
            alt="CAMA Hero Background"
            referrerPolicy="no-referrer"
          />
          {/* Transparent color matching overlay to darken/green-wash the background smoothly */}
          <div 
            className="absolute inset-0 bg-[#008a4b] transition-opacity duration-300"
            style={{ 
              opacity: 1 - (settings.heroBgWatermarkOpacity !== undefined ? settings.heroBgWatermarkOpacity : 20) / 100 
            }}
          ></div>
          {/* Subtle military grid overlay */}
          <div className="absolute inset-0" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")', opacity: 0.08 }}></div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent z-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 py-16 lg:py-0 w-full">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-block bg-[#fcd116] text-[#ef2b2d] border border-[#ef2b2d]/30 font-bold px-4 py-1.5 rounded-full text-xs tracking-wider uppercase mb-6 shadow-sm">
                La Patrie ou la Mort, nous vaincrons !
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                {settings.heroTitle ? (
                  settings.heroTitle.includes("notre priorité.") ? (
                    <>
                      {settings.heroTitle.split("notre priorité.")[0]}
                      <span className="text-[#fcd116] block mt-1">{settings.heroTitle.includes("notre priorité.") && "notre priorité."}</span>
                    </>
                  ) : (
                    settings.heroTitle
                  )
                ) : (
                  <>
                    La santé de nos héros, <br className="hidden md:block"/>
                    <span className="text-[#fcd116]">notre priorité.</span>
                  </>
                )}
              </h1>
              <p className="text-lg md:text-xl text-green-50 mb-8 max-w-xl font-medium leading-relaxed">
                {settings.heroSubtitle || "La Caisse d'Assurance Maladie des Armées (CAMA) offre une prise en charge sanitaire élargie aux vaillants combattants des Forces Armées Nationales et à leurs familles."}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/login" className="bg-white text-[#008a4b] px-8 py-3.5 rounded-lg font-bold text-center flex items-center justify-center hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl">
                  Se connecter à l'espace
                </Link>
                <Link to="/services" className="border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white px-8 py-3.5 rounded-lg font-bold text-center flex items-center justify-center hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
                  Consulter nos prestations
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Nos Prestations Section */}
      {settings.activeSections?.prestations !== false && (
        <div className="bg-white dark:bg-slate-950 py-20 relative z-20 text-center transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold text-[#ef2b2d] uppercase tracking-wide">
                {settings.sectionTitles?.prestations || 'Nos prestations'}
              </h2>
              <div className="w-24 h-1 bg-[#008a4b] mx-auto mt-4 rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {(settings.prestations || []).map((pres, index) => {
                const Icon = index === 0 ? HeartPulse : index === 1 ? Users : Activity;
                return (
                  <motion.div 
                     key={index}
                     initial={{ opacity: 0, y: 50, scale: 0.9 }}
                     whileInView={{ opacity: 1, y: 0, scale: 1 }}
                     viewport={{ once: true, margin: "-100px" }}
                     transition={{ duration: 0.6, delay: index * 0.15, type: 'spring', bounce: 0.4 }}
                     whileHover={{ y: -10, scale: 1.02 }}
                     className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-800 p-8 text-left transition-colors"
                  >
                     <div className="flex justify-between items-start mb-6">
                       <div className="w-16 h-16 bg-green-50 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
                          <Icon className="w-8 h-8 text-[#008a4b] dark:text-green-400" strokeWidth={2} />
                       </div>
                       <span className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold text-xs rounded-full border border-red-100 dark:border-red-900/30">
                         {pres.label}
                       </span>
                     </div>
                     <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{pres.title}</h3>
                     <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">{pres.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}

       {/* Mot du Directeur Section */}
      {settings.activeSections?.dgMessage !== false && (
        <motion.div 
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8 }}
           className="bg-[#008a4b] text-white py-16 relative overflow-hidden text-center md:text-left"
        >
           <div className="absolute inset-0" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")', opacity: 0.1 }}></div>
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center gap-12">
              <motion.div 
                 initial={{ x: -50, opacity: 0, rotate: -5 }}
                 whileInView={{ x: 0, opacity: 1, rotate: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.7, type: 'spring' }}
                 className="md:w-1/3 flex justify-center"
              >
                <div className="w-64 h-64 md:w-80 md:h-80 rounded-full border-8 border-[#00703c] overflow-hidden bg-slate-50 flex items-center justify-center shadow-2xl relative">
                   {settings.dgImage ? (
                      <img 
                        src={settings.dgImage} 
                        alt={settings.dgName || "Directeur"} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <UserCircle2 className="w-44 h-44 text-slate-300" strokeWidth={1} />
                    )}
                </div>
              </motion.div>
              <motion.div 
                 initial={{ x: 50, opacity: 0 }}
                 whileInView={{ x: 0, opacity: 1 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.7, delay: 0.2 }}
                 className="md:w-2/3 text-center md:text-left"
              >
                 <h3 className="text-[#fcd116] font-bold text-xl mb-2">Le mot du Directeur Général</h3>
                 <h2 className="text-3xl md:text-5xl font-extrabold mb-6">{settings.dgName}</h2>
                 <p className="text-lg text-green-50 leading-relaxed mb-6 font-medium">
                    {settings.dgMessage}
                 </p>
                 <p className="text-green-100 italic font-medium">{settings.dgCitation}</p>
              </motion.div>
           </div>
        </motion.div>
      )}

      {/* Services en Ligne */}
      {settings.activeSections?.services !== false && (
        <div className="bg-slate-50 dark:bg-slate-900 py-20 text-center overflow-hidden transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div 
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.5 }}
                 className="text-center mb-16"
              >
                <h2 className="text-4xl font-extrabold text-[#008a4b] dark:text-green-500 uppercase tracking-wide">
                   {settings.sectionTitles?.services || 'Services en ligne'}
                </h2>
                <div className="w-full h-px bg-gray-200 dark:bg-slate-800 mt-6 relative items-center flex justify-center">
                   <div className="absolute w-32 h-1 bg-[#008a4b]"></div>
                </div>
              </motion.div>
  
              <div className="flex flex-wrap justify-center gap-6">
                {(settings.services || []).map((svc, i) => {
                  const Icon = svc.iconType === 'Laptop' ? Laptop : svc.iconType === 'FileCheck' ? FileCheck : svc.iconType === 'MapPin' ? MapPin : Building;
                  return (
                    <Link 
                       key={i}
                       to={svc.url || '#'}
                       className="block"
                    >
                      <motion.div 
                         initial={{ opacity: 0, scale: 0.5, y: 50 }}
                         whileInView={{ opacity: 1, scale: 1, y: 0 }}
                         viewport={{ once: true, margin: "-50px" }}
                         transition={{ duration: 0.6, delay: i * 0.1, type: 'spring', bounce: 0.5 }}
                         whileHover={{ y: -15, scale: 1.05 }}
                         className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-gray-100 dark:border-slate-700 p-8 w-64 h-full flex flex-col items-center justify-center group transition-colors"
                      >
                         <motion.div 
                            whileHover={{ scale: 1.1, rotate: 360 }}
                            transition={{ duration: 0.6 }}
                            className={`w-20 h-20 ${svc.color || 'bg-[#008a4b]'} rounded-full flex items-center justify-center text-white mb-4 shadow-inner overflow-hidden`}
                         >
                           {svc.iconType === 'Image' && svc.imageUrl ? (
                             <img src={svc.imageUrl} alt={svc.name} className="w-full h-full object-cover" />
                           ) : svc.iconType === 'Emoji' ? (
                             <span className="text-4xl leading-none">{svc.emoji || '🌟'}</span>
                           ) : (
                             <Icon className="w-10 h-10 group-hover:drop-shadow-md" />
                           )}
                         </motion.div>
                         <h4 className="font-extrabold text-gray-900 dark:text-white uppercase tracking-wider text-sm transition-colors">{svc.name}</h4>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
           </div>
        </div>
      )}

       {/* Statistiques Section */}
       {settings.activeSections?.statistics !== false && (
         <div className="bg-[#1a2e1d] text-white py-20 relative overflow-hidden text-center">
           <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
              <motion.div 
                 initial={{ opacity: 0, y: -20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.6 }}
                 className="text-center mb-12"
              >
                 <div className="flex items-center justify-center mb-3">
                    <PlusCircle className="w-5 h-5 text-[#fcd116] mr-2" />
                    <span className="text-[#fcd116] font-bold tracking-widest uppercase text-sm">Nos chiffres</span>
                 </div>
                 <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Quelques statistiques 2025</h2>
                 <Link 
                   to={settings.stats_savoir_plus_url || "/about"} 
                   className="inline-block border-2 border-[#008a4b]/80 text-white hover:bg-[#008a4b] px-8 py-2.5 transition uppercase text-sm font-bold tracking-wider rounded-lg shadow-sm"
                 >
                   Savoir Plus
                 </Link>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10 mt-12 border-t border-white/10 pt-10 relative">
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.5 }}
                   whileInView={{ opacity: 0.1, scale: 1 }}
                   viewport={{ once: true }}
                   transition={{ duration: 1.5, type: 'spring' }}
                   className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none hidden md:block"
                 >
                    <Heart className="w-64 h-64 text-[#008a4b]" fill="currentColor" />
                 </motion.div>

                 {settings.statistics?.map((stat, idx) => {
                   const Icon = stat.iconType === 'Users' ? Users : stat.iconType === 'HeartPulse' ? HeartPulse : stat.iconType === 'MapPin' ? MapPin : Activity;
                   return (
                     <motion.div 
                       key={stat.id}
                       initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                       whileInView={{ opacity: 1, x: 0 }}
                       viewport={{ once: true }}
                       transition={{ duration: 0.5, delay: (idx + 1) * 0.1 }}
                       className="flex items-center border-b border-white/10 pb-6 text-left hover:bg-white/5 p-4 rounded-xl transition-colors"
                     >
                       <div className="relative">
                          <div className="w-16 h-16 bg-[#008a4b] rounded-full flex items-center justify-center text-white z-10 relative">
                             <Icon className="w-8 h-8" />
                          </div>
                          <div className="absolute -top-2 -right-2 bg-white text-gray-900 font-bold text-xs rounded-full w-6 h-6 flex items-center justify-center z-20 shadow-md">
                            {String(idx + 1).padStart(2, '0')}
                          </div>
                       </div>
                       <div className="ml-6">
                          <div className="text-3xl font-extrabold mb-1">{stat.val}</div>
                          <div className="text-gray-400 text-xs font-bold tracking-wider uppercase">{stat.label}</div>
                       </div>
                     </motion.div>
                   );
                 })}
              </div>
           </div>
         </div>
       )}

      {/* News Section */}
      <div className="py-16 bg-white text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2 uppercase tracking-wide border-l-4 border-[#008a4b] pl-3">Actualités CAMA</h2>
              <p className="text-gray-600">Restez informés des dernières annonces et nouveautés.</p>
            </div>
            <Link to="/news" className="hidden sm:flex text-[#008a4b] font-bold items-center hover:underline">
              Toutes les actualités <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {publishedArticles.slice(0, 2).map((art) => (
              <Link 
                key={art.id} 
                to={`/news/${art.id}`}
                className="flex flex-col md:flex-row border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-[#008a4b]/30 transition-all duration-300 bg-white group shadow-sm hover:scale-[1.01]"
              >
                <div className="w-full md:w-1/3 bg-gray-100 min-h-[160px] relative overflow-hidden">
                  <img 
                    src={art.image || "https://images.unsplash.com/photo-1579548122080-c11707ea8211?q=80&w=600&auto=format&fit=crop"} 
                    alt="News" 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                </div>
                <div className="p-6 md:w-2/3 flex flex-col justify-center">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-[#ef2b2d] uppercase tracking-widest">{art.category || "CAMA Info"}</span>
                    <ArrowRight className="w-4 h-4 text-gray-200 group-hover:text-[#008a4b] group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-lg font-black text-gray-900 mb-3 leading-snug group-hover:text-[#008a4b] transition-colors">{art.title}</h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2 font-medium leading-relaxed">{art.content || ""}</p>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 font-black uppercase tracking-widest mt-auto">
                    <Calendar className="w-3 h-3" />
                    {art.date}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      {settings.activeSections?.faq !== false && (
        <div className="py-20 bg-slate-50 border-t border-gray-200/50 text-left" id="faq">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-[#008a4b] font-bold text-xs uppercase tracking-widest rounded-full mb-3">
                <HelpCircle className="w-3.5 h-3.5" /> Questions fréquentes
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 uppercase tracking-wide">Foire Aux Questions (FAQ)</h2>
              <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
                Retrouvez ici toutes les réponses aux questions les plus courantes sur le fonctionnement de la CAMA et l'enrôlement de vos familles.
              </p>
              <div className="w-24 h-1 bg-[#008a4b] mx-auto mt-4 rounded-full"></div>
            </div>
  
            <div className="space-y-4">
              {faqs.map((faq) => {
                const isOpen = openFaq === faq.id;
                return (
                  <div 
                    key={faq.id} 
                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                      className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left font-bold text-gray-900 hover:text-[#008a4b] transition-colors"
                    >
                      <span className="text-base md:text-lg">{faq.q}</span>
                      <span className={`p-1.5 rounded-lg transition-transform duration-300 ${isOpen ? 'bg-green-50 text-[#008a4b] rotate-180' : 'bg-gray-50 text-gray-500'}`}>
                        <ChevronDown className="w-5 h-5" />
                      </span>
                    </button>
  
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                        >
                          <div className="px-6 pb-6 pt-1 text-sm md:text-base text-gray-600 leading-relaxed border-t border-gray-100 bg-slate-50/50">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
  
            <div className="text-center mt-10 p-6 bg-white border border-gray-200 rounded-2xl shadow-sm max-w-xl mx-auto">
              <p className="text-sm text-gray-600 font-medium">
                Vous ne trouvez pas la réponse à votre question ?
              </p>
              <Link 
                to="/contact" 
                className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#008a4b] hover:underline"
              >
                <span>Contactez notre équipe d'assistance</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Nos réseaux sociaux (matching CARFO screenshots style) */}
      {settings.activeSections?.socials !== false && (
        <div className="py-16 bg-slate-50 border-t border-gray-200/50 text-left">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                 <h2 className="text-4xl font-extrabold text-gray-900 uppercase tracking-wide">Nos réseaux sociaux</h2>
                 <div className="w-24 h-1 bg-[#008a4b] mx-auto mt-4 rounded-full"></div>
              </div>
  
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                 {/* Facebook feed element */}
                 <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                       <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                          <div className="flex items-center">
                             <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-extrabold text-xl shadow-md">
                                F
                             </div>
                             <div className="ml-3">
                                <div className="flex items-center">
                                   <h4 className="font-bold text-gray-900">CAMA</h4>
                                   <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500 ml-1.5" />
                                </div>
                                <p className="text-xs text-gray-500 font-bold">{settings.facebookFollowers || "28 K abonnés"}</p>
                             </div>
                          </div>
                          <a 
                            href={settings.facebookPageUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-4 py-2 rounded-lg transition-colors shadow flex items-center"
                          >
                             <span className="mr-1">💬</span> Suivre
                          </a>
                       </div>
  
                       <div className="mt-4 space-y-3">
                          <p className="text-sm text-gray-700 leading-relaxed">
                             {settings.facebookFeedText || "Un nouveau pas franchi pour la digitalisation des services des forces armées nationales. Lancement de la plateforme web d'enrôlement direct. 🇧🇫"}
                          </p>
                          <div className="h-48 rounded-xl overflow-hidden bg-slate-100 relative">
                             <img 
                               src={settings.facebookFeedImage || "https://images.unsplash.com/photo-1579548122080-c11707ea8211?q=80&w=2070&auto=format&fit=crop"} 
                               alt="Facebook Post" 
                               className="w-full h-full object-cover" 
                             />
                          </div>
                       </div>
                    </div>
  
                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-gray-500 text-xs">
                       <span>CAMA Officiel • Il y a 2 jours</span>
                       <span className="font-bold text-blue-600 cursor-pointer hover:underline">Voir sur Facebook</span>
                    </div>
                 </div>
  
                  {/* Quality banners/Citation style carousel element */}
                  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row relative group">
                     <div className="md:w-1/2 relative min-h-[220px] md:min-h-auto bg-[#008a4b]/5">
                        <img 
                          src={settings.testimonialHeroImage || "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=1000&auto=format&fit=crop"} 
                          alt="Qualité de soins" 
                          className="absolute inset-0 w-full h-full object-cover opacity-90" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-[#008a4b]/30 mix-blend-multiply"></div>
                        <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent">
                          <span className="text-[10px] font-black tracking-widest text-[#fcd116] uppercase bg-black/40 self-start px-2.5 py-1 rounded">
                            {settings.testimonialHeroSubtitle || "TÉMOIGNAGES ENGAGÉS"}
                          </span>
                          <h4 className="text-white text-base font-black tracking-tight mt-1.5 leading-snug drop-shadow-md">
                            {settings.testimonialHeroTitle || "La CAMA au service de la Nation Burkinabè"}
                          </h4>
                        </div>
                     </div>
                     <div className="md:w-1/2 p-8 flex flex-col justify-between relative min-h-[300px]">
                        <div className="space-y-4">
                           <div className="flex justify-between items-center">
                             <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-[#008a4b]">
                                <Sparkles className="w-5 h-5" />
                             </div>
                             <span className="text-[11px] font-bold text-[#008a4b] bg-green-50 px-2 py-1 rounded-lg">
                               {currentTestimonialIndex + 1} / {testimonials.length}
                             </span>
                           </div>
                           
                           <AnimatePresence mode="wait">
                             <motion.div
                               key={currentTestimonialIndex}
                               initial={{ opacity: 0, x: 20 }}
                               animate={{ opacity: 1, x: 0 }}
                               exit={{ opacity: 0, x: -20 }}
                               transition={{ duration: 0.3 }}
                             >
                               <p className="text-base font-bold text-[#008a4b] italic leading-relaxed min-h-[100px]">
                                  {testimonials[currentTestimonialIndex]?.quote}
                               </p>
                             </motion.div>
                           </AnimatePresence>
                        </div>
                        
                        <div className="pt-6 border-t border-gray-100 mt-6">
                           <div className="flex justify-between items-center">
                             <div>
                               <div className="font-extrabold text-sm text-gray-900">
                                  {testimonials[currentTestimonialIndex]?.author}
                               </div>
                               <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-extrabold text-[10px]">
                                  {testimonials[currentTestimonialIndex]?.role || "Bénéficiaire CAMA"}
                               </div>
                             </div>
                             
                             {/* Small circular navigation buttons */}
                             {testimonials.length > 1 && (
                               <div className="flex gap-1">
                                 <button 
                                   type="button"
                                   onClick={() => setCurrentTestimonialIndex(prev => (prev === 0 ? testimonials.length - 1 : prev - 1))}
                                   className="w-7 h-7 bg-slate-100 border border-slate-200 hover:bg-[#008a4b] hover:text-white rounded-full flex items-center justify-center text-gray-600 transition cursor-pointer text-xs"
                                   title="Précédent"
                                 >
                                   ◀
                                 </button>
                                 <button 
                                   type="button"
                                   onClick={() => setCurrentTestimonialIndex(prev => (prev === testimonials.length - 1 ? 0 : prev + 1))}
                                   className="w-7 h-7 bg-slate-100 border border-slate-200 hover:bg-[#008a4b] hover:text-white rounded-full flex items-center justify-center text-gray-600 transition cursor-pointer text-xs"
                                   title="Suivant"
                                 >
                                   ▶
                                 </button>
                               </div>
                             )}
                           </div>
  
                           {/* Slider Dots */}
                           {testimonials.length > 1 && (
                             <div className="flex justify-center gap-1 mt-4">
                               {testimonials.map((_, idx) => (
                                 <button
                                   key={idx}
                                   type="button"
                                   onClick={() => setCurrentTestimonialIndex(idx)}
                                   className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                     idx === currentTestimonialIndex 
                                       ? "bg-[#008a4b] w-4" 
                                       : "bg-slate-200 hover:bg-slate-300"
                                   }`}
                                 />
                               ))}
                             </div>
                           )}
                        </div>
                     </div>
                  </div>
              </div>
           </div>
        </div>
      )}

      {/* NEW: Nos partenaires (matching ISSA/CIPRES/BCEAO screenshot group) */}
      {settings.activeSections?.partners !== false && (
        <div className="py-16 bg-white border-t border-gray-200/50">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-[#008a4b] font-bold text-xs uppercase tracking-widest rounded-full mb-3">
                 ✦ CAMA
              </div>
              <h2 className="text-4xl font-extrabold text-gray-900 uppercase tracking-wide mb-12">Nos partenaires</h2>
              
              <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
                 {(settings.partners || []).map((partner) => {
                   const logoData = partnerLogos[partner.name] || { logoText: partner.name, color: 'text-gray-700', badge: '🤝' };
                   return (
                     <motion.div 
                       key={partner.id}
                       whileHover={{ scale: 1.05 }}
                       className="w-44 h-24 bg-white border-2 border-gray-100 rounded-2xl flex flex-col items-center justify-center p-4 shadow-sm hover:border-[#008a4b] cursor-pointer transition overflow-hidden"
                     >
                       {partner.logo ? <img src={partner.logo} alt={partner.name} className="w-full h-full object-contain p-2" referrerPolicy="no-referrer" /> : <span className="text-2xl mb-1">{logoData.badge}</span>}
                       <span className={`font-black uppercase tracking-wider text-sm ${partner.logo ? 'hidden' : logoData.color}`}>
                         {logoData.logoText}
                       </span>
                     </motion.div>
                   );
                 })}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
