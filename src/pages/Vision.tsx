import { motion } from 'motion/react';
import { Eye, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../lib/LanguageContext';
import { getSiteSettings } from '../lib/dataStore';

export default function Vision() {
  const { t } = useLanguage();
  const settings = getSiteSettings();
  const visionContent = settings.visionContent;

  return (
    <div className="w-full">
      <div className="relative bg-slate-900 text-white py-20 flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#008a4b]/90 to-slate-900/90 z-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl text-left"
          >
            <div className="flex items-center space-x-2 text-yellow-400 text-sm font-semibold tracking-wider uppercase mb-4">
              <Link to="/" className="hover:text-white transition">{t('Accueil', 'Home')}</Link>
              <ChevronRight className="w-4 h-4" />
              <span>{t('Notre Vision', 'Our Vision')}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              {t('Notre Vision Stratégique', 'Our Strategic Vision')}
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
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-[#008a4b] mb-8 shadow-sm">
              <Eye className="w-8 h-8" />
            </div>
            
            <p className="text-xl font-medium text-gray-900 mb-8 border-l-4 border-[#008a4b] pl-6 italic">
              "L'excellence au service de la santé militaire"
            </p>
            
            <div className="whitespace-pre-wrap">
              {visionContent}
            </div>

            <div className="mt-12 p-8 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col md:flex-row gap-6 items-center">
               <div className="md:w-1/3">
                 <img 
                   src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop" 
                   alt="Vision illustration" 
                   className="rounded-2xl shadow-sm"
                 />
               </div>
               <div className="md:w-2/3">
                 <h4 className="font-bold text-gray-900 mb-2">Un engagement pour demain</h4>
                 <p className="text-sm text-gray-600">
                   Chaque décision que nous prenons aujourd'hui façonne le système de santé de nos forces armées pour les décennies à venir. Nous sommes fiers de porter cette responsabilité.
                 </p>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
