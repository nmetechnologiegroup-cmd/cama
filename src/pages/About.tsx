import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, Target, Eye, Users, ChevronRight, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../lib/LanguageContext';
import { getSiteSettings, DEFAULT_SITE_SETTINGS } from '../lib/dataStore';

export default function About() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<any>(DEFAULT_SITE_SETTINGS);
  useEffect(() => { getSiteSettings().then(setSettings); }, []);
  const about = settings.aboutContent;

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="relative bg-slate-900 text-white py-24 flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={about?.heroImage || "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=2070&auto=format&fit=crop"} 
            alt="Medical team" 
            className="w-full h-full object-cover opacity-20"
            referrerPolicy="no-referrer"
          />
        </div>
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
              <span>{t('À propos', 'About US')}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
              {about?.heroTitle || t('Notre Mission, Notre Identité', 'Our Mission, Our Identity')}
            </h1>
            <p className="text-lg text-green-50 max-w-2xl leading-relaxed">
              {about?.heroSubtitle || t(
                "La Caisse d'Assurance Maladie des Armées (CAMA) est l'institution de prévoyance sociale dédiée à garantir une couverture santé universelle et solidaire pour les forces armées burkinabè et leurs familles.",
                "The Military Health Insurance Fund (CAMA) is the social security institution dedicated to ensuring universal and solidary health coverage for the Burkina Faso armed forces and their families."
              )}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Vision & Mission */}
      <div className="py-20 bg-slate-50 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">{t('Fondements de la CAMA', 'CAMA Foundations')}</h2>
            <div className="w-16 h-1 bg-[#008a4b] mx-auto mt-4 rounded"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
            >
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center text-[#008a4b] mb-6">
                <Target className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{about?.missionTitle || t('Notre Mission', 'Our Mission')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {about?.missionDesc || t(
                  "Assurer la gestion du régime d'assurance maladie au profit des personnels des forces armées, de leurs familles et des retraités, en garantissant un accès équitable à des soins de santé de qualité.",
                  "Ensure the management of the health insurance scheme for the benefit of armed forces personnel, their families, and retirees, guaranteeing equitable access to quality healthcare."
                )}
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
            >
              <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600 mb-6">
                <Eye className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{about?.visionTitle || t('Notre Vision', 'Our Vision')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {about?.visionDesc || t(
                  "Devenir un pôle d'excellence en matière de sécurité sociale militaire dans la sous-région, soutenu par la digitalisation de nos services et la rigueur dans la gestion de nos prestations.",
                  "Become a center of excellence in military social security within the sub-region, supported by the digitalization of our services and rigor in benefit management."
                )}
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
            >
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{t('Nos Valeurs', 'Our Values')}</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center"><ChevronRight className="w-4 h-4 text-[#008a4b] mr-2" /> {t('Solidarité', 'Solidarity')}</li>
                <li className="flex items-center"><ChevronRight className="w-4 h-4 text-[#008a4b] mr-2" /> {t('Intégrité', 'Integrity')}</li>
                <li className="flex items-center"><ChevronRight className="w-4 h-4 text-[#008a4b] mr-2" /> {t('Loyauté', 'Loyalty')}</li>
                <li className="flex items-center"><ChevronRight className="w-4 h-4 text-[#008a4b] mr-2" /> {t('Qualité de service', 'Service Quality')}</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="py-20 bg-white text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <motion.img 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                src={about?.historyImage || "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=2070&auto=format&fit=crop"} 
                alt="Medical building" 
                className="rounded-2xl shadow-lg object-cover h-[400px] w-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">{about?.historyTitle || t('Historique', 'History')}</h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                {about?.historyDesc1 || t(
                  "Autrefois assurée par la Mutuelle des Forces Armées Nationales (MUFAN), la prise en charge sanitaire était destinée aux militaires uniquement. Face aux défis sécuritaires et soucieuse du bien-être des soldats engagés dans la lutte, la CAMA vient à point nommé étendre ses services à la famille de nos vaillantes forces.",
                  "Formerly provided by the National Armed Forces Mutual (MUFAN), health coverage was intended for military personnel only. Facing security challenges and devoted to the well-being of the soldiers engaged in operations, CAMA was introduced at a crucial time to extend services to the families of our brave forces."
                )}
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {about?.historyDesc2 || t(
                  "« Cette institution, née de la ferme volonté de la hiérarchie militaire, s'est vue réalisée sous le leadership du Capitaine Ibrahim TRAORE, Président du Faso, Chef de l'Etat, pour permettre aux militaires de bénéficier d'une prise en charge élargie. » — Colonel-Major Saïdou YONABA.",
                  "\"This institution, born from the strong will of the military hierarchy, was realized under the leadership of Captain Ibrahim Traore, President of Faso, Head of State, to allow soldiers to benefit from expanded coverage.\" — Colonel-Major Saïdou YONABA."
                )}
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#008a4b] text-white rounded-full flex items-center justify-center font-bold text-xl">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-2xl">54 219</h4>
                    <span className="text-sm text-gray-500">{t('Assurés', 'Insured Members')}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold text-xl">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-2xl">128</h4>
                    <span className="text-sm text-gray-500">{t('Centres affiliés', 'Affiliated Centers')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
