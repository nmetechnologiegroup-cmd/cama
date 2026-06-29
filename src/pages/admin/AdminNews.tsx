import React, { useState, useMemo, FormEvent, useRef, useEffect } from 'react';
import { Plus, Edit3, Trash2, Calendar, Eye, X, Save, Sparkles, BookOpen, Upload, Trash, Check, FileUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { getArticles, addArticle, editArticle, deleteArticle, Article } from '../../lib/dataStore';
import { compressImage } from '../../lib/utils';

export default function AdminNews() {
  const [articles, setArticles] = useState<Article[]>([]);
  useEffect(() => { getArticles().then(setArticles); }, []);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formAuthor, setFormAuthor] = useState('');
  const [formCategory, setFormCategory] = useState('Annonce');
  const [formContent, setFormContent] = useState('');
  const [formStatus, setFormStatus] = useState<'Publié' | 'Brouillon'>('Publié');
  const [formImage, setFormImage] = useState('');

  // Drag and Drop & Upload state
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error("Seuls les fichiers d'images (JPEG, PNG, WebP) sont acceptés comme couverture.");
      return;
    }
    try {
      const compressed = await compressImage(file, 800, 600, 0.7);
      setFormImage(compressed);
    } catch (e) {
      console.error("Compression failed, using fallback:", e);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteCoverImage = () => {
    setFormImage('');
  };

  // Open modal for writing an article
  const handleOpenWrite = () => {
    setEditingArticle(null);
    setFormTitle('');
    setFormAuthor('CAMA Officiel');
    setFormCategory('Annonce');
    setFormContent('');
    setFormStatus('Publié');
    setFormImage('https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop');
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (art: Article) => {
    setEditingArticle(art);
    setFormTitle(art.title);
    setFormAuthor(art.author);
    setFormCategory(art.category || 'Annonce');
    setFormContent(art.content || '');
    setFormStatus(art.status);
    setFormImage(art.image || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop');
    setIsModalOpen(true);
  };

  // Save creation or edits with automatic image compression to prevent exceeding quota
  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formContent) return;
    setIsSaving(true);

    try {
      let finalImage = formImage;
      // Compress if it is a base64 string to keep localStorage small
      if (formImage && formImage.startsWith('data:image/')) {
        try {
          finalImage = await compressImage(formImage, 800, 600, 0.7);
        } catch (err) {
          console.error("Failed to compress formImage during save:", err);
        }
      }

      if (editingArticle) {
        editArticle({
          id: editingArticle.id,
          title: formTitle,
          author: formAuthor,
          category: formCategory,
          content: formContent,
          status: formStatus,
          image: finalImage,
          date: editingArticle.date
        }).then(setArticles);
      } else {
        addArticle({
          title: formTitle,
          author: formAuthor,
          category: formCategory,
          content: formContent,
          status: formStatus,
          image: finalImage
        }).then(setArticles);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Une erreur est survenue lors de l'enregistrement de la publication.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: number) => {
    deleteArticle(id).then(setArticles);
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100/60">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Publications & Actualités</h2>
          <p className="text-gray-500 text-sm font-medium mt-1">Gérez le contenu éditorial et les communiqués officiels de la CAMA.</p>
        </div>
         <button 
           onClick={handleOpenWrite}
           className="bg-[#008a4b] text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:bg-[#00703c] transition-all flex items-center"
         >
          <Plus className="w-5 h-5 mr-2" />
          Rédiger un article
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border border-slate-100/60 rounded-2xl overflow-hidden"
      >
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Titre de l'article</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Auteur</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date de publication</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">État</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions rapides</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50 font-medium text-sm">
             {articles.length > 0 ? (
               articles.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-5 whitespace-nowrap font-extrabold text-gray-900 max-w-[320px] truncate">
                      <div className="text-gray-800 font-extrabold">{a.title}</div>
                      <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 font-bold text-[10px] uppercase tracking-wide rounded mt-1.5 border border-blue-100">
                        {a.category || "Annonce"}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-gray-500 font-bold">{a.author}</td>
                    <td className="px-6 py-5 whitespace-nowrap text-gray-500 font-semibold flex items-center pt-7">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" /> {a.date}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide border ${a.status === 'Publié' ? 'bg-green-50 text-green-700 border-green-200/50' : 'bg-yellow-50 text-yellow-700 border-yellow-200/50'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                      <div className="flex justify-end space-x-1">
                         <button 
                           onClick={() => setPreviewArticle(a)}
                           className="text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 p-2 rounded-lg transition-colors" 
                           title="Aperçu rapide"
                         >
                            <Eye className="w-4 h-4" />
                         </button>
                         <button 
                           onClick={() => handleOpenEdit(a)}
                           className="text-gray-400 hover:text-[#008a4b] bg-gray-50 hover:bg-green-50 p-2 rounded-lg transition-colors" 
                           title="Éditer"
                         >
                            <Edit3 className="w-4 h-4" />
                         </button>
                         <button 
                           onClick={() => handleDelete(a.id)}
                           className="text-gray-400 hover:text-rose-500 bg-gray-50 hover:bg-rose-50 p-2 rounded-lg transition-colors" 
                           title="Supprimer"
                         >
                            <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                    </td>
                  </tr>
               ))
             ) : (
                <tr>
                   <td colSpan={5} className="text-center py-12 text-gray-400 font-semibold">
                      Aucun article ni annonce rédigé pour le moment.
                   </td>
                </tr>
             )}
          </tbody>
        </table>
      </motion.div>

      {/* EDIT/WRITE ARTICLE SLIDE DIALOG */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col"
            >
              <div className="bg-[#008a4b] text-white px-6 py-4 flex justify-between items-center flex-shrink-0">
                <h3 className="text-lg font-bold">
                   {editingArticle ? "Éditer l'article de presse" : "Rédiger et Publier un Communiqué"}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 px-2.5 rounded-full text-white/80 hover:text-white bg-white/10 hover:bg-white/20 font-bold"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4 text-left overflow-y-auto flex-1 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Titre de l'article</label>
                     <input 
                       type="text" 
                       required
                       placeholder="Ex: Arrivée de matériel sanitaire"
                       value={formTitle}
                       onChange={(e) => setFormTitle(e.target.value)}
                       className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#008a4b]/20 focus:border-[#008a4b] font-bold text-gray-800"
                     />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Auteur / Service émetteur</label>
                     <input 
                       type="text" 
                       required
                       placeholder="Ex: Secrétariat CAMA"
                       value={formAuthor}
                       onChange={(e) => setFormAuthor(e.target.value)}
                       className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#008a4b]/20 focus:border-[#008a4b]"
                     />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Catégorie éditoriale</label>
                     <select 
                       value={formCategory}
                       onChange={(e) => setFormCategory(e.target.value)}
                       className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#008a4b]/20 focus:border-[#008a4b] font-bold text-gray-700 bg-white"
                     >
                        <option value="Événement Majeur">🔬 Événement Majeur</option>
                        <option value="Réseau Santé">🏥 Réseau Santé</option>
                        <option value="Annonce Officielle">📢 Communiqué Officiel</option>
                        <option value="Santé Publique">🍎 Santé Publique</option>
                     </select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                     <label className="block text-xs font-bold text-gray-600 uppercase">Image de Couverture de l'article</label>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {!formImage ? (
                          <div 
                             onDragEnter={handleDrag}
                             onDragOver={handleDrag}
                             onDragLeave={handleDrag}
                             onDrop={handleDrop}
                             onClick={() => fileInputRef.current?.click()}
                             className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col justify-center items-center h-44 ${
                               dragActive 
                                 ? 'border-[#008a4b] bg-green-50/50' 
                                 : 'border-gray-300 hover:border-[#008a4b] hover:bg-slate-50'
                             }`}
                          >
                             <FileUp className="w-8 h-8 text-gray-400 mb-2" />
                             <p className="text-xs font-bold text-gray-700">Glissez-déposez le visuel ou cliquez</p>
                             <p className="text-[10px] text-gray-400 mt-0.5">JPEG, PNG ou WebP</p>
                             <input 
                               type="file" 
                               ref={fileInputRef}
                               onChange={handleFileChange}
                               accept="image/*"
                               className="hidden" 
                             />
                          </div>
                        ) : (
                          <div className="relative border border-slate-200 rounded-xl p-3 bg-slate-50 flex items-center justify-between h-44">
                             <div className="flex items-center gap-3">
                                <div className="w-24 h-24 rounded border border-gray-300 overflow-hidden bg-white flex items-center justify-center">
                                   <img 
                                     src={formImage} 
                                     alt="Cover miniature" 
                                     className="w-full h-full object-cover" 
                                     referrerPolicy="no-referrer"
                                   />
                                </div>
                                <div className="flex-1 min-w-0">
                                   <p className="text-xs font-bold text-green-700 flex items-center gap-1">
                                      <Check className="w-4 h-4" /> Visuel chargé
                                   </p>
                                   <span className="text-[9px] text-gray-400 font-bold block max-w-[150px] truncate">
                                      {formImage.startsWith('data:') ? 'Image téléversée (Base64)' : formImage}
                                   </span>
                                </div>
                             </div>
                             
                             <button 
                               type="button"
                               onClick={deleteCoverImage}
                               className="bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white p-2 rounded-lg transition-colors border border-rose-100"
                               title="Supprimer la photo de couverture"
                             >
                                <Trash className="w-3.5 h-3.5" />
                             </button>
                          </div>
                        )}

                        <div className="flex flex-col justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 h-44">
                           <div>
                              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Ou renseigner l'URL directe</label>
                              <input 
                                type="text"
                                placeholder="Coller un lien d'image https://..."
                                value={formImage}
                                onChange={(e) => setFormImage(e.target.value)}
                                className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg outline-none bg-white focus:ring-1 focus:ring-[#008a4b] font-medium"
                              />
                           </div>
                           <p className="text-[10px] leading-relaxed text-gray-400 font-semibold mb-1">
                              Saisissez une adresse Web ou téléversez directement une image personnalisée pour attirer plus d'assurés.
                           </p>
                        </div>
                     </div>
                  </div>
                </div>

                <div>
                   <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Corps textuel de la publication</label>
                   <textarea 
                     rows={5}
                     required
                     placeholder="Écrivez le contenu de l'article ici..."
                     value={formContent}
                     onChange={(e) => setFormContent(e.target.value)}
                     className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#008a4b]/20 focus:border-[#008a4b] text-sm"
                   />
                </div>

                <div className="grid grid-cols-2 gap-4 items-center">
                  <div>
                     <label className="block text-xs font-bold text-gray-600 uppercase mb-1">État de diffusion</label>
                     <div className="flex gap-4 mt-1 border border-gray-200 rounded-lg p-2 bg-slate-50">
                        <label className="flex items-center text-xs font-bold text-gray-700 cursor-pointer">
                          <input 
                            type="radio" 
                            name="article_status"
                            checked={formStatus === 'Publié'}
                            onChange={() => setFormStatus('Publié')}
                            className="w-4 h-4 text-[#008a4b] mr-1"
                          />
                          Publié en ligne
                        </label>
                        <label className="flex items-center text-xs font-bold text-gray-700 cursor-pointer">
                          <input 
                            type="radio" 
                            name="article_status"
                            checked={formStatus === 'Brouillon'}
                            onChange={() => setFormStatus('Brouillon')}
                            className="w-4 h-4 text-[#008a4b] mr-1"
                          />
                          Brouillon (Masqué)
                        </label>
                     </div>
                  </div>
                  
                  <div className="text-right text-xs text-gray-400 font-bold pt-4">
                     Date d'émission: Automatique (Aujourd'hui)
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSaving}
                    className="px-5 py-2 bg-[#008a4b] font-bold text-white rounded-lg hover:bg-[#00703c] transition flex items-center shadow-md pb-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4 mr-1.5 animate-pulse" /> 
                    {isSaving ? "Enregistrement..." : "Enregistrer la publication"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PUBLIC STYLE ARTICLE PREVIEW MODAL */}
      <AnimatePresence>
        {previewArticle && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm text-left"
          >
             <motion.div 
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-200 text-slate-800 max-h-[90vh] flex flex-col"
             >
                <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center flex-shrink-0">
                   <div className="flex items-center gap-2 text-yellow-400">
                      <BookOpen className="w-5 h-5" />
                      <span className="font-bold text-white text-sm">Aperçu Web de l'Article</span>
                   </div>
                   <button 
                     onClick={() => setPreviewArticle(null)}
                     className="bg-slate-800 hover:bg-slate-700 p-1.5 rounded-full text-gray-400 hover:text-white transition"
                   >
                     <X className="w-5 h-5"/>
                   </button>
                </div>
                
                {/* Simulated Article Layout inside News page */}
                <div className="overflow-y-auto flex-1 p-8 space-y-6 custom-scrollbar">
                   <span className="px-3 py-1 bg-green-100 text-[#008a4b] font-bold text-xs uppercase tracking-widest rounded-full">
                      {previewArticle.category || "Actualités"}
                   </span>
                   <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">
                      {previewArticle.title}
                   </h1>
                   
                   <div className="flex items-center gap-4 text-xs font-bold text-gray-500 border-b border-gray-100 pb-4">
                      <div>Écrit par <span className="text-slate-900 uppercase font-black">{previewArticle.author}</span></div>
                      <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                      <div>Date : {previewArticle.date}</div>
                   </div>

                   <div className="w-full h-64 rounded-xl overflow-hidden bg-slate-100 shadow-inner relative">
                      <img 
                        src={previewArticle.image || "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop"} 
                        alt="Couverture" 
                        className="w-full h-full object-cover" 
                      />
                   </div>

                   <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line font-medium leading-7">
                      {previewArticle.content || "Aucun contenu textuel défini pour cette actualité..."}
                   </p>
                </div>

                <div className="bg-slate-50 px-6 py-4 flex justify-between items-center border-t border-gray-100">
                   <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${previewArticle.status === 'Publié' ? 'bg-green-100 text-[#008a4b]' : 'bg-yellow-100 text-yellow-700'}`}>
                      Statut d'indexation : {previewArticle.status}
                   </span>
                   <button 
                     onClick={() => setPreviewArticle(null)}
                     className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-4 py-2 rounded-lg transition-all"
                   >
                     Fermer l'aperçu
                   </button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
