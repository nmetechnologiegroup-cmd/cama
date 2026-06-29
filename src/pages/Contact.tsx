import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import { getSiteSettings, DEFAULT_SITE_SETTINGS } from '../lib/dataStore';

export default function Contact() {
  const [settings, setSettings] = useState<any>(DEFAULT_SITE_SETTINGS);
  useEffect(() => { getSiteSettings().then(setSettings); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Votre message a été envoyé avec succès ! Notre équipe vous répondra dans les plus brefs délais.");
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="relative bg-[#008a4b] text-white py-24 pb-32 overflow-hidden text-center z-0">
        <div className="absolute inset-0" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")', opacity: 0.1 }}></div>
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-50 to-transparent z-10"></div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto px-4 relative z-20"
        >
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20">
             <MessageCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Contactez-nous</h1>
          <p className="text-xl text-green-50 max-w-2xl mx-auto font-medium">
            Une question, un besoin d'assistance ou une suggestion ? Notre équipe est à votre écoute pour vous accompagner.
          </p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <motion.div 
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6, delay: 0.2 }}
             className="lg:col-span-2 bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100/50"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Envoyez-nous un message</h2>
            <p className="text-gray-500 mb-8 text-sm">Remplissez le formulaire ci-dessous et nous vous répondrons dès que possible.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">Nom complet <span className="text-red-500">*</span></label>
                  <input type="text" required className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#008a4b] focus:border-transparent outline-none transition-all placeholder:text-gray-400 font-medium" placeholder="Ex: Jean Dupont" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">Adresse email <span className="text-red-500">*</span></label>
                  <input type="email" required className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#008a4b] focus:border-transparent outline-none transition-all placeholder:text-gray-400 font-medium" placeholder="jean.dupont@email.com" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">Numéro de téléphone</label>
                  <input type="tel" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#008a4b] focus:border-transparent outline-none transition-all placeholder:text-gray-400 font-medium" placeholder="+226 00 00 00 00" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">Sujet <span className="text-red-500">*</span></label>
                  <select required className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#008a4b] focus:border-transparent outline-none transition-all bg-white font-medium text-gray-700">
                    <option value="">Sélectionnez un sujet</option>
                    <option value="enrolement">Assistance à l'Enrôlement</option>
                    <option value="prise_en_charge">Demande de Prise en Charge</option>
                    <option value="carte">Renouvellement/Perte de Carte</option>
                    <option value="autre">Autre demande</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Votre message <span className="text-red-500">*</span></label>
                <textarea required rows={5} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#008a4b] focus:border-transparent outline-none transition-all placeholder:text-gray-400 font-medium resize-none" placeholder="Décrivez votre besoin en détail..."></textarea>
              </div>
              <button type="submit" className="w-full md:w-auto bg-[#008a4b] hover:bg-[#00703c] text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group">
                <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> Envoyer le message
              </button>
            </form>
          </motion.div>

          {/* Contact Infos & Map */}
          <div className="space-y-8">
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.6, delay: 0.4 }}
               className="bg-[#1a2e1d] rounded-3xl p-8 shadow-xl text-white border border-white/10"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><MapPin className="text-[#fcd116]" /> Nos Coordonnées</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-green-50/70 mb-1">Adresse Physique</div>
                    <div 
                       className="font-medium text-white leading-relaxed" 
                       dangerouslySetInnerHTML={{ __html: (settings.footer?.address || "Direction Centrale de la CAMA\nOuagadougou, Burkina Faso\nCamp Militaire Guillaume Ouédraogo").replace(/\n/g, '<br/>') }}
                    />
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-green-50/70 mb-1">Téléphone</div>
                    <div className="font-medium text-white">
                      {settings.footer?.phone || "+226 25 30 00 00"}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-green-50/70 mb-1">Email</div>
                    <div className="font-medium text-white">
                      {settings.footer?.email || "contact@cama.bf"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/10">
                 <h4 className="font-bold text-sm text-green-50/70 mb-3 uppercase tracking-wider">Horaires d'ouverture</h4>
                 <div className="space-y-2 text-sm font-medium">
                    <div className="flex justify-between">
                       <span>Lundi - Vendredi :</span>
                       <span>07h30 - 16h00</span>
                    </div>
                    <div className="flex justify-between text-yellow-400">
                       <span>Urgences 24/7 :</span>
                       <span>Numéro Vert</span>
                    </div>
                 </div>
              </div>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.6 }}
               className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 flex-grow h-[300px]"
            >
              {/* Note: In a real environment, replace with a real Google Maps API integration if possible, 
                  but for an iframe, this default embed is acceptable and widely used. */}
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15589.60563459918!2d-1.5434551717277161!3d12.35515201170762!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xe2e95ecce45cb0b%3A0xc31faeb962f99581!2sOuagadougou%2C%20Burkina%20Faso!5e0!3m2!1sfr!2sfr!4v1714421182280!5m2!1sfr!2sfr" 
                className="w-full h-full border-0" 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="CAMA Location Map"
              ></iframe>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
