import { motion } from 'motion/react';
import { FileCheck, Users, Building2, Stethoscope, HeartPulse, ChevronRight, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../lib/LanguageContext';

export default function Services() {
  const { t } = useLanguage();

  const services = [
    {
      icon: <Users className="w-8 h-8" />,
      title: t("Enrôlement des familles", "Family Enrollment"),
      desc: t(
        "Déclaration et immatriculation des membres de famille (conjoints, enfants, ascendants) pour leur intégration dans le système de couverture sanitaire.",
        "Declaration and registration of family members (spouses, children, ascendants) for integration into the health coverage system."
      ),
      color: "bg-green-100 text-[#008a4b]",
      link: "/login"
    },
    {
      icon: <FileCheck className="w-8 h-8" />,
      title: t("Suivi des dossiers", "File Status Tracking"),
      desc: t(
        "Consultation en temps réel de l'état de traitement de vos dossiers de remboursement et feuilles de soins soumises.",
        "Real-time tracking of the processing status of your reimbursement files and submitted treatment forms."
      ),
      color: "bg-blue-100 text-blue-600",
      link: "/login"
    },
    {
      icon: <Building2 className="w-8 h-8" />,
      title: t("Réseau de soins", "Care Provider Network"),
      desc: t(
        "Accès à l'annuaire cartographié de l'ensemble de nos cliniques, pharmacies et centres de santé conventionnés.",
        "Access to the mapped directory of all our affiliated clinics, pharmacies, and healthcare centers."
      ),
      color: "bg-yellow-100 text-yellow-600",
      link: "#"
    },
    {
      icon: <HeartPulse className="w-8 h-8" />,
      title: t("Prise en charge", "Direct Coverage"),
      desc: t(
        "Émission des bons de prise en charge pour les interventions médicales lourdes et les hospitalisations dans les structures partenaires.",
        "Issuance of direct coverage orders for substantial medical procedures and stays in affiliated facilities."
      ),
      color: "bg-red-100 text-red-600",
      link: "#"
    },
    {
      icon: <Stethoscope className="w-8 h-8" />,
      title: t("Bilan de santé annuel", "Annual Check-up"),
      desc: t(
        "Programmation et organisation des visites médicales annuelles périodiques pour les militaires en activité.",
        "Planning and organization of periodic annual health check-ups for active-duty military personnel."
      ),
      color: "bg-purple-100 text-purple-600",
      link: "#"
    },
    {
      icon: <Download className="w-8 h-8" />,
      title: t("Documents utiles", "Useful Documents"),
      desc: t(
        "Téléchargement de formulaires divers : feuilles de soins, attestations de droits, formulaires de mise à jour.",
        "Download of various official forms: medical logs, rights certificates, information update forms."
      ),
      color: "bg-slate-100 text-slate-600",
      link: "#"
    }
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="bg-slate-900 text-white py-20 relative overflow-hidden text-left">
        <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="flex justify-center items-center space-x-2 text-yellow-400 text-sm font-semibold tracking-wider uppercase mb-4">
            <Link to="/" className="hover:text-white transition">{t('Accueil', 'Home')}</Link>
            <ChevronRight className="w-4 h-4" />
            <span>{t('Nos Services', 'Our Services')}</span>
          </div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-center"
          >
            {t('Le Catalogue de nos ', 'Our Catalog of ')}<span className="text-yellow-400">{t('Prestations', 'Services')}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-300 max-w-2xl mx-auto text-center"
          >
            {t(
              "Découvrez l'ensemble des services dématérialisés et des prestations offertes par la CAMA pour vous et vos ayants droit.",
              "Explore all digital resources and health benefits provided by CAMA for you and your eligible dependants."
            )}
          </motion.p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="py-20 bg-slate-50 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-lg transition flex flex-col h-full"
              >
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 ${service.color}`}>
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-6 flex-grow leading-relaxed">
                  {service.desc}
                </p>
                {service.link !== "#" ? (
                  <Link to={service.link} className="inline-flex items-center font-semibold text-[#008a4b] hover:underline">
                    {t('Accéder', 'Access')} <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                ) : (
                  <span className="inline-flex items-center font-semibold text-gray-400 cursor-not-allowed">
                    {t('Prochainement', 'Upcoming')} <ChevronRight className="w-4 h-4 ml-1" />
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-[#008a4b] py-16 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">{t("Besoin d'aide pour une prestation ?", "Need assistance with a benefit?")}</h2>
          <p className="text-green-100 mb-8 max-w-2xl mx-auto">
            {t(
              "Notre service d'assistance est joignable tous les jours ouvrables. Vous pouvez également consulter notre foire aux questions dans votre espace privé.",
              "Our helpline is available on business days. You can also view our Frequently Asked Questions in your secure portal."
            )}
          </p>
          <Link to="/about" className="inline-block bg-white text-[#008a4b] font-bold px-8 py-3 rounded-lg shadow hover:bg-gray-100 transition">
            {t('Nous contacter', 'Contact us')}
          </Link>
        </div>
      </div>
    </div>
  );
}
