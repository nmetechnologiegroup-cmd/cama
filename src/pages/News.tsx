import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Calendar, ChevronRight, Tag, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getArticles, Article } from '../lib/dataStore';
import { useLanguage } from '../lib/LanguageContext';

export default function News() {
  const { t } = useLanguage();
  const articlesList = useMemo(() => getArticles(), []);
  const publishedArticles = useMemo(() => articlesList.filter(a => a.status === 'Publié'), [articlesList]);
  
  // Return background/text category style
  const categoryStyle = (category: string) => {
    switch (category) {
      case "Événement Majeur":
        return "text-red-700 bg-red-50 border border-red-200/50";
      case "Réseau Santé":
        return "text-green-700 bg-green-50 border border-green-200/50";
      case "Annonce Officielle":
      case "Annonce":
        return "text-blue-700 bg-blue-50 border border-blue-200/50";
      default:
        return "text-amber-700 bg-amber-50 border border-amber-200/50";
    }
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-20 text-left">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          <div className="flex items-center space-x-2 text-gray-500 text-sm font-semibold tracking-wider uppercase mb-4">
            <Link to="/" className="hover:text-[#008a4b] transition">{t('Accueil', 'Home')}</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[#008a4b] font-bold">{t('Actualités', 'News')}</span>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight uppercase">
            {t('Ressources & Actualités', 'Resources & News')}
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl font-medium leading-relaxed">
            {t(
              "Restez informés des dernières annonces, communiqués et nouveautés concernant la Caisse d'Assurance Maladie des Armées.",
              "Stay informed of the latest announcements, updates, and releases concerning the Military Health Insurance Fund."
            )}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {publishedArticles.length > 0 ? (
            publishedArticles.map((article, index) => (
              <motion.article 
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col sm:flex-row hover:shadow-lg transition group cursor-pointer"
              >
                <Link to={`/news/${article.id}`} className="flex flex-col sm:flex-row w-full">
                  <div className="sm:w-2/5 h-48 sm:h-auto relative overflow-hidden bg-slate-50">
                    <img 
                      src={article.image || "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop"} 
                      alt={article.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500 pointer-events-none"
                    />
                  </div>
                  <div className="p-6 sm:w-3/5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${categoryStyle(article.category || '')}`}>
                          <Tag className="w-3 h-3 mr-1" /> {t(article.category || 'Annonce', article.category === 'Événement Majeur' ? 'Major Event' : article.category === 'Réseau Santé' ? 'Health Network' : 'Announcement')}
                        </span>
                        <span className="flex items-center text-xs text-gray-500 font-bold">
                          <Calendar className="w-3 h-3 mr-1" /> {article.date}
                        </span>
                      </div>
                      <h3 className="text-lh font-extrabold text-gray-900 mb-2 leading-snug group-hover:text-[#008a4b] transition">
                        {article.title}
                      </h3>
                      <p className="text-gray-500 text-sm mb-4 line-clamp-3 leading-relaxed font-semibold">
                        {article.content || t("Veuillez consulter le détail de cet article.", "Please consult details in the article.")}
                      </p>
                    </div>
                    <div>
                      <span className="inline-flex items-center text-[#008a4b] font-bold text-xs uppercase tracking-wider hover:underline">
                        {t('Lire la suite', 'Read more')} <ArrowRight className="ml-1 w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))
          ) : (
            <div className="col-span-full py-16 bg-white rounded-2xl border text-center font-bold text-gray-400">
              {t('Aucun communiqué ou actualité publié pour le moment.', 'No announcement published for the moment.')}
            </div>
          )}
        </div>

        {/* Load More Button */}
        {publishedArticles.length > 4 && (
          <div className="mt-16 text-center">
            <button className="bg-white border-2 border-[#008a4b] text-[#008a4b] px-6 py-3 rounded-lg font-bold hover:bg-[#008a4b] hover:text-white transition">
              {t('Charger les actualités précédentes', 'Load older news')}
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
