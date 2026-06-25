import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Tag, 
  Share2, 
  ChevronRight,
  BookOpen,
  Clock
} from 'lucide-react';
import { getArticles } from '../lib/dataStore';
import { useLanguage } from '../lib/LanguageContext';

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [articles, setarticles] = useState<any[]>([]);
  useEffect(() => { getArticles().then(setarticles); }, []);
  const article = useMemo(() => articles.find(a => a.id === Number(id)), [articles, id]);

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

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
        <h2 className="text-2xl font-black text-slate-900 mb-4">{t('Article non trouvé', 'Article not found')}</h2>
        <Link to="/news" className="flex items-center gap-2 text-[#008a4b] font-bold hover:underline">
          <ArrowLeft className="w-4 h-4" />
          {t('Retour aux actualités', 'Back to news')}
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-20 text-left">
      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-gray-100 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center space-x-2 text-gray-500 text-[10px] font-black tracking-widest uppercase mb-4">
            <Link to="/" className="hover:text-[#008a4b] transition">{t('Accueil', 'Home')}</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/news" className="hover:text-[#008a4b] transition">{t('Actualités', 'News')}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#008a4b] truncate max-w-[200px]">{article.title}</span>
          </div>
          
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-[#008a4b] font-bold text-xs transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('Retour', 'Back')}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-1">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-white overflow-hidden mt-8"
        >
          {/* Article Header Image */}
          <div className="w-full h-64 md:h-96 relative overflow-hidden bg-slate-100">
            <img 
              src={article.image || "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1200&auto=format&fit=crop"} 
              alt={article.title} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            
            <div className="absolute bottom-6 left-6 right-6">
              <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${categoryStyle(article.category || '')}`}>
                <Tag className="w-3 h-3 mr-1.5" /> {article.category || t('Annonce', 'Announcement')}
              </span>
            </div>
          </div>

          <div className="p-8 md:p-12 space-y-8">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight">
                {article.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-gray-400 pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#008a4b]/10 flex items-center justify-center text-[#008a4b]">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-gray-400 font-black tracking-widest">{t('Auteur', 'Author')}</div>
                    <div className="text-slate-900 uppercase">{article.author}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-gray-400 font-black tracking-widest">{t('Date de publication', 'Published Date')}</div>
                    <div className="text-slate-900">{article.date}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-gray-400 font-black tracking-widest">{t('Lecture', 'Read')}</div>
                    <div className="text-slate-900">5 min</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="prose prose-slate max-w-none">
              <div className="text-slate-600 text-lg leading-relaxed whitespace-pre-line font-medium">
                {article.content || t("Détails officiels à venir...", "Official details coming soon...")}
              </div>
            </div>

            <div className="pt-10 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3">
                <button 
                  className="p-3 rounded-full bg-slate-100 text-slate-500 hover:bg-[#008a4b] hover:text-white transition-all shadow-sm"
                  title="Partager sur Facebook"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('Partager cet article', 'Share this article')}</span>
              </div>

              <Link 
                to="/news"
                className="flex items-center gap-2 bg-[#008a4b] text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#00703c] transition-all shadow-lg shadow-[#008a4b]/20"
              >
                <BookOpen className="w-4 h-4" />
                {t('Voir toutes les actualités', 'View all news')}
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Patriotic Footer Ornament */}
        <div className="mt-12 flex justify-center items-center gap-2">
          <div className="h-1 bg-[#ef2b2d] w-12 rounded"></div>
          <div className="h-1.5 bg-[#fcd116] w-3 rounded-full"></div>
          <div className="h-1 bg-[#008a4b] w-12 rounded"></div>
        </div>
      </div>
    </div>
  );
}
