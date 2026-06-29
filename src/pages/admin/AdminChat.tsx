import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Search, 
  Trash2, 
  CheckCircle, 
  Clock, 
  User, 
  X, 
  ChevronRight, 
  UserCheck, 
  FileText,
  AlertCircle,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  getAdminDiscussions, 
  getDiscussionMessages, 
  sendChatMessage, 
  updateDiscussionStatus, 
  deleteDiscussion,
  ChatDiscussion,
  ChatMessageRecord,
  getSiteSettings
} from '../../lib/dataStore';

export default function AdminChat() {
  const [discussions, setDiscussions] = useState<ChatDiscussion[]>([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState<ChatDiscussion | null>(null);
  const [messages, setMessages] = useState<ChatMessageRecord[]>([]);
  const [replyInput, setReplyInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick reply presets for advisors
  const quickReplies = [
    "Bonjour ! Comment puis-je vous aider aujourd'hui ? 🫡",
    "Votre dossier d'enrôlement est en cours de traitement par nos services militaires.",
    "Pour valider votre demande, merci de nous transmettre votre acte de mariage ou de naissance.",
    "La prise en charge pour cette prestation est de 80%.",
    "Merci pour votre confiance. Je ferme cette discussion. Bonne journée ! 🟢"
  ];

  // Load site settings & discussions initially
  useEffect(() => {
    getSiteSettings().then(setSettings).catch(console.error);
    fetchDiscussions();
  }, []);

  const fetchDiscussions = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await getAdminDiscussions();
      setDiscussions(data);
    } catch (e) {
      console.error(e);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Poll for new discussions every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDiscussions(false);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Poll for messages of the active discussion every 3 seconds
  useEffect(() => {
    let interval: any;
    if (selectedDiscussion) {
      // Immediate load
      getDiscussionMessages(selectedDiscussion.id)
        .then(setMessages)
        .catch(console.error);

      interval = setInterval(() => {
        getDiscussionMessages(selectedDiscussion.id)
          .then(setMessages)
          .catch(console.error);
      }, 3000);
    } else {
      setMessages([]);
    }
    return () => clearInterval(interval);
  }, [selectedDiscussion]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSelectDiscussion = (disc: ChatDiscussion) => {
    setSelectedDiscussion(disc);
  };

  const handleSendReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyInput.trim() || !selectedDiscussion) return;

    const textToSend = replyInput;
    setReplyInput('');

    try {
      const newMsg = await sendChatMessage(selectedDiscussion.id, 'advisor', textToSend);
      setMessages(prev => [...prev, newMsg]);
      
      // Update discussions list to reflect latest message immediately
      fetchDiscussions(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickReply = async (reply: string) => {
    if (!selectedDiscussion) return;
    try {
      const newMsg = await sendChatMessage(selectedDiscussion.id, 'advisor', reply);
      setMessages(prev => [...prev, newMsg]);
      fetchDiscussions(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (disc: ChatDiscussion) => {
    const newStatus = disc.status === 'active' ? 'closed' : 'active';
    try {
      await updateDiscussionStatus(disc.id, newStatus);
      
      // Update current selected object if applicable
      if (selectedDiscussion && selectedDiscussion.id === disc.id) {
        setSelectedDiscussion(prev => prev ? { ...prev, status: newStatus } : null);
      }
      
      fetchDiscussions(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDiscussion = async (discId: number) => {
    // Removed confirm
    try {
      await deleteDiscussion(discId);
      if (selectedDiscussion && selectedDiscussion.id === discId) {
        setSelectedDiscussion(null);
      }
      fetchDiscussions();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter discussions
  const filteredDiscussions = discussions.filter(disc => {
    const nameMatch = (disc.user_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                      (disc.user_email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const lastMsgMatch = disc.lastMessage?.text?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSearch = nameMatch || lastMsgMatch;
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && disc.status === statusFilter;
  });

  return (
    <div className="h-[calc(100vh-10rem)] bg-white rounded-2xl shadow-sm border border-slate-100 flex overflow-hidden text-left">
      {/* LEFT COLUMN: DISCUSSION LIST */}
      <div className="w-80 md:w-96 border-r border-slate-200 flex flex-col bg-slate-50/50">
        {/* Header search / filters */}
        <div className="p-4 border-b border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-800 text-base flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-[#008a4b]" />
              Discussions
            </h3>
            <button 
              onClick={() => fetchDiscussions()}
              className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition"
              title="Rafraîchir"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un assuré ou un message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#008a4b] font-medium"
            />
          </div>

          <div className="flex gap-1.5 p-0.5 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`flex-1 py-1 px-2.5 rounded-md font-bold transition-all text-center ${statusFilter === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Tous
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`flex-1 py-1 px-2.5 rounded-md font-bold transition-all text-center ${statusFilter === 'active' ? 'bg-[#008a4b] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              En cours
            </button>
            <button
              onClick={() => setStatusFilter('closed')}
              className={`flex-1 py-1 px-2.5 rounded-md font-bold transition-all text-center ${statusFilter === 'closed' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Fermés
            </button>
          </div>
        </div>

        {/* List items */}
        <div className="flex-grow overflow-y-auto divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs font-bold animate-pulse">
              Chargement des discussions...
            </div>
          ) : filteredDiscussions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs leading-relaxed">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              Aucune discussion trouvée.
            </div>
          ) : (
            filteredDiscussions.map(disc => {
              const isSelected = selectedDiscussion?.id === disc.id;
              const isClosed = disc.status === 'closed';
              return (
                <div
                  key={disc.id}
                  onClick={() => handleSelectDiscussion(disc)}
                  className={`p-4 cursor-pointer transition-colors hover:bg-slate-50/80 flex items-start gap-3 relative ${
                    isSelected ? 'bg-green-50/30 border-l-4 border-l-[#008a4b]' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold flex-shrink-0">
                    {disc.user_name ? disc.user_name.charAt(0).toUpperCase() : 'V'}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-800 text-xs truncate leading-tight">
                        {disc.user_name || 'Visiteur Anonyme'}
                      </h4>
                      <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap ml-2">
                        {disc.started_at ? new Date(disc.started_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                      </span>
                    </div>
                    {disc.user_email && (
                      <span className="text-[10px] text-slate-400 truncate block mt-0.5">
                        {disc.user_email}
                      </span>
                    )}
                    <p className="text-[11px] text-slate-500 mt-1 truncate font-medium">
                      {disc.lastMessage ? disc.lastMessage.text : 'Discussion initialisée'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-extrabold uppercase ${
                        isClosed ? 'bg-slate-200 text-slate-600' : 'bg-green-100 text-[#008a4b]'
                      }`}>
                        {isClosed ? 'Fermé' : 'En cours'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: ACTIVE CONVERSATION OR PLACEHOLDER */}
      <div className="flex-grow flex flex-col bg-white">
        {selectedDiscussion ? (
          <>
            {/* Active Discussion Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/40">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#008a4b] text-white flex items-center justify-center font-bold shadow-sm">
                  {selectedDiscussion.user_name ? selectedDiscussion.user_name.charAt(0).toUpperCase() : 'V'}
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm">
                    {selectedDiscussion.user_name || 'Visiteur Anonyme'}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    {selectedDiscussion.user_email && (
                      <span className="text-[10px] text-slate-400 font-medium mr-1">{selectedDiscussion.user_email}</span>
                    )}
                    <span className={`inline-block w-2 h-2 rounded-full ${selectedDiscussion.status === 'closed' ? 'bg-slate-400' : 'bg-green-500 animate-pulse'}`}></span>
                    <span className="text-[10px] font-bold text-slate-500">
                      {selectedDiscussion.status === 'closed' ? 'Discussion close' : 'Discussion en cours de traitement'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleStatus(selectedDiscussion)}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    selectedDiscussion.status === 'closed' 
                      ? 'bg-green-50 text-[#008a4b] hover:bg-green-100' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  title={selectedDiscussion.status === 'closed' ? "Réouvrir la discussion" : "Fermer la discussion"}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{selectedDiscussion.status === 'closed' ? 'Réouvrir' : 'Fermer'}</span>
                </button>
                <button
                  onClick={() => handleDeleteDiscussion(selectedDiscussion.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                  title="Supprimer la discussion"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-grow p-6 overflow-y-auto bg-slate-50/50 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-slate-400 text-xs py-12">
                  Aucun message dans cette discussion. Saisissez une réponse ci-dessous.
                </div>
              ) : (
                messages.map(msg => {
                  const isMe = msg.sender !== 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-xs shadow-sm leading-relaxed ${
                        isMe 
                          ? 'bg-[#008a4b] text-white rounded-tr-none' 
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                      }`}>
                        <div className="font-extrabold text-[9px] uppercase mb-1 opacity-75">
                          {isMe ? 'Moi (Conseiller CAMA)' : (selectedDiscussion.user_name || 'Assuré')}
                        </div>
                        <p className="font-medium whitespace-pre-line">{msg.text}</p>
                        <span className="text-[8px] text-right block mt-1 opacity-60">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick replies block */}
            <div className="p-3 border-t border-slate-100 bg-slate-50 flex flex-wrap gap-1.5 items-center">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase mr-1">Raccourcis :</span>
              {quickReplies.map((reply, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickReply(reply)}
                  className="text-[10px] bg-white border border-slate-200 hover:border-[#008a4b] hover:text-[#008a4b] text-slate-600 px-2 py-1 rounded-full font-medium transition max-w-xs truncate"
                  title={reply}
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Input Footer */}
            <div className="p-4 border-t border-slate-200 bg-white">
              <form onSubmit={handleSendReply} className="flex gap-2.5">
                <input
                  type="text"
                  placeholder="Saisissez votre réponse..."
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  className="flex-grow px-4 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#008a4b] font-medium"
                />
                <button
                  type="submit"
                  disabled={!replyInput.trim()}
                  className="bg-[#008a4b] hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <span>Envoyer</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          /* Placeholder */
          <div className="flex-grow flex flex-col items-center justify-center p-8 text-center text-slate-400 bg-slate-50/20">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-[#008a4b] mb-4">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-sm">Gestion de l'Assistance en Direct</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed font-medium">
              Sélectionnez une discussion active dans le panneau latéral gauche pour commencer à clavarder avec un assuré en temps réel.
            </p>
            {settings?.chatAdvisorActive ? (
              <div className="mt-4 inline-flex items-center gap-1.5 bg-green-50 text-[#008a4b] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
                <span>Canal en direct activé</span>
              </div>
            ) : (
              <div className="mt-4 inline-flex items-center gap-1.5 bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <span>Canal en mode Robot FAQ</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
