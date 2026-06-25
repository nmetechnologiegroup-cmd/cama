import { useState, useMemo, FormEvent, useEffect } from 'react';
import { Plus, MapPin, Search, X, Save, Edit, Trash, HelpCircle, Eye, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getCentres, addCentre, editCentre, deleteCentre, Centre } from '../../lib/dataStore';

export default function AdminCentres() {
  const [centres, setCentres] = useState<Centre[]>([]);
  useEffect(() => { getCentres().then(setCentres); }, []);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCentre, setEditingCentre] = useState<Centre | null>(null);

  // Form Fields
  const [formNom, setFormNom] = useState('');
  const [formVille, setFormVille] = useState('Ouagadougou');
  const [formType, setFormType] = useState('Public');

  // Filter centers
  const filteredCentres = useMemo(() => {
    return centres.filter(c => 
      c.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ville.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [centres, searchQuery]);

  // Open creation modal
  const handleOpenCreate = () => {
    setEditingCentre(null);
    setFormNom('');
    setFormVille('Ouagadougou');
    setFormType('Public');
    setIsModalOpen(true);
  };

  // Open editing modal
  const handleOpenEdit = (centre: Centre) => {
    setEditingCentre(centre);
    setFormNom(centre.nom);
    setFormVille(centre.ville);
    setFormType(centre.type);
    setIsModalOpen(true);
  };

  // Save creation or editing
  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!formNom) return;

    if (editingCentre) {
      editCentre({
        id: editingCentre.id,
        nom: formNom,
        ville: formVille,
        type: formType
      }).then(setCentres);
    } else {
      addCentre({
        nom: formNom,
        ville: formVille,
        type: formType
      }).then(setCentres);
    }
    setIsModalOpen(false);
  };

  // Handle remove center
  const handleRemove = (id: number) => {
    deleteCentre(id).then(setCentres);
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2 bg-white p-5 rounded-2xl shadow-sm border border-slate-100/60">
        <div className="flex items-center w-full max-w-md bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 shadow-inner">
          <Search className="w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Rechercher une structure, ville, pharmacie..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none focus:outline-none ml-3 text-sm font-medium text-gray-900"
          />
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:bg-slate-800 transition-all flex items-center shrink-0 ml-auto md:ml-0"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouvelle Structure
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCentres.length > 0 ? (
          filteredCentres.map((c, i) => (
            <motion.div 
              key={c.id} 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-100/60 p-6 hover:shadow-md transition-all group flex flex-col h-full relative"
            >
              <div className="flex justify-between items-start mb-5">
                <div className="w-12 h-12 bg-green-50 text-[#008a4b] rounded-xl flex items-center justify-center border border-green-100/50 group-hover:bg-[#008a4b] group-hover:text-white transition-colors shadow-sm">
                  <MapPin className="w-6 h-6" />
                </div>
                <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide rounded-full border ${
                  c.type.includes('Public') 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' 
                    : c.type.includes('Pharmacie') 
                      ? 'bg-amber-50 text-amber-700 border-amber-200/50'
                      : 'bg-blue-50 text-blue-700 border-blue-200/50'
                }`}>
                  {c.type}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug flex-grow">{c.nom}</h3>
              <p className="text-gray-500 font-bold text-xs mb-6 flex items-center">
                <MapPin className="w-4 h-4 mr-1.5 text-rose-500" /> {c.ville}, Burkina Faso
              </p>
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
                <span className="text-xs font-bold text-gray-400 font-mono">CODE: CN-{c.id}00</span>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => handleOpenEdit(c)}
                    className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                  >
                    Éditer
                  </button>
                  <button 
                    onClick={() => handleRemove(c.id)}
                    className="text-rose-500 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                  >
                    Retirer
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-400 font-semibold bg-white rounded-2xl border border-slate-100/60">
             Aucune structure de santé ne correspond à votre recherche.
          </div>
        )}
      </div>

       {/* ADD/EDIT MODAL */}
       <AnimatePresence>
         {isModalOpen && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm text-left"
           >
             <motion.div 
               initial={{ scale: 0.95, y: 15 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.95, y: 15 }}
               className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col"
             >
               <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center flex-shrink-0">
                 <h3 className="text-lg font-bold">
                    {editingCentre ? "Éditer la structure conventionnée" : "Nouvelle structure à conventionner"}
                 </h3>
                 <button 
                   onClick={() => setIsModalOpen(false)}
                   className="p-1 px-2.5 rounded-full text-white/80 hover:text-white bg-white/10 hover:bg-white/20 font-bold"
                 >
                   ×
                 </button>
               </div>

               <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
                 <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Désignation de la structure</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Centre Hospitalier Régional (CHR)"
                      value={formNom}
                      onChange={(e) => setFormNom(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#008a4b]/20 focus:border-[#008a4b] font-bold text-gray-800"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Type de convention</label>
                      <select 
                        value={formType}
                        onChange={(e) => setFormType(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#008a4b]/20 focus:border-[#008a4b] font-bold text-gray-700 bg-white"
                      >
                         <option value="Public">Public (Hôpital/Camp)</option>
                         <option value="Privé Conventionné">Privé Conventionné</option>
                         <option value="Pharmacie">Pharmacie Partenaire</option>
                         <option value="Clinique">Clinique / Cabinet d'audit</option>
                      </select>
                   </div>
                   
                   <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Ville locale</label>
                      <select 
                        value={formVille}
                        onChange={(e) => setFormVille(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#008a4b]/20 focus:border-[#008a4b] font-bold text-gray-700 bg-white"
                      >
                         <option value="Ouagadougou">Ouagadougou</option>
                         <option value="Bobo-Dioulasso">Bobo-Dioulasso</option>
                         <option value="Koudougou">Koudougou</option>
                         <option value="Kaya">Kaya</option>
                         <option value="Fada N'gourma">Fada N'gourma</option>
                      </select>
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
                     className="px-5 py-2 bg-[#008a4b] font-bold text-white rounded-lg hover:bg-[#00703c] transition flex items-center shadow-md animate-pulse-once"
                   >
                     <Save className="w-4 h-4 mr-1.5" /> Enregistrer la décision
                   </button>
                 </div>
               </form>
             </motion.div>
           </motion.div>
         )}
       </AnimatePresence>
    </div>
  );
}
