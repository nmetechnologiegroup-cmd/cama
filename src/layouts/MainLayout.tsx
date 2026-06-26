import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import NewsTicker from '../components/NewsTicker';
import { 
  Mail, 
  MessageSquare, 
  Newspaper, 
  CheckSquare, 
  ArrowUp, 
  User, 
  X, 
  Send, 
  Search, 
  HelpCircle, 
  Phone, 
  ArrowUpRight, 
  MessageCircle,
  Sparkles,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  getSiteSettings, 
  safeStorage, 
  getOrCreateDiscussion, 
  sendChatMessage, 
  getDiscussionMessages,
  ChatDiscussion,
  ChatMessageRecord 
} from '../lib/dataStore';

type ChatMessage = {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
  rawSender?: string;
};

export default function MainLayout() {
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);
  const [showAssistantModal, setShowAssistantModal] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState('+226 25 30 00 00');
  const [whatsappMessage, setWhatsappMessage] = useState('Bonjour CAMA, je souhaite avoir des renseignements concernant mon enrôlement.');
  
  // Site settings & Chat state
  const [settings, setSettings] = useState<any>(null);
  const [activeDiscussion, setActiveDiscussion] = useState<ChatDiscussion | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'bot', text: 'Bonjour ! 👋 Bienvenue sur le portail d\'assistance CAMA. Comment puis-je vous aider aujourd\'hui ?', time: 'À l\'instant' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Quick FAQ Questions
  const faqQuestions = [
    { q: "Comment s'enrôler ?", a: "Pour s'enrôler, connectez-vous à votre Espace Assuré, cliquez sur 'Nouveau membre' dans votre tableau de bord, et téléversez des justificatifs (acte de naissance, de mariage). Nos agents valideront votre dossier sous 48 heures." },
    { q: "Suivre mes remboursements ?", a: "Vos demandes de remboursement et dossiers de soins sont suivis en ligne en temps réel. Rendez-vous dans votre Espace Assuré au menu de 'Suivi des dossiers' pour voir leur statut de validation." },
    { q: "Où sont les cliniques agréées ?", a: "La CAMA dispose d'un réseau conventionné de 128 cliniques et officines. Vous trouverez l'annuaire complet et cartographié dans notre catalogue des services section 'Réseau de soins'." },
    { q: "Quels sont les taux de couverture ?", a: "La CAMA prend en charge de 70% à 100% des frais de santé selon la nature des soins et le type de d'intervention médicale, dans le strict respect de la réglementation militaire de prévoyance." }
  ];

  // Load site settings with forceRefresh=true so changes in the admin panel are immediately retrieved
  useEffect(() => {
    getSiteSettings(true).then(setSettings).catch(console.error);
  }, []);

  // Check if direct advisor mode is active and within availability hours (robust, locale-independent, time format safe)
  const isAdvisorAvailable = () => {
    if (!settings?.chatAdvisorActive) return false;
    const start = settings?.chatStartHour || "08:00";
    const end = settings?.chatEndHour || "17:00";
    
    try {
      const [startH, startM] = start.split(':').map(Number);
      const [endH, endM] = end.split(':').map(Number);
      
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      
      const currentTotal = currentHours * 60 + currentMinutes;
      const startTotal = startH * 60 + startM;
      const endTotal = endH * 60 + endM;
      
      return currentTotal >= startTotal && currentTotal <= endTotal;
    } catch (e) {
      console.error("Error calculating advisor availability:", e);
      return false;
    }
  };

  const activeAdvisorMode = isAdvisorAvailable();

  // Create or load active advisor discussion if available and modal is opened
  useEffect(() => {
    if (showAssistantModal && activeAdvisorMode) {
      let chatSessionId = safeStorage.getItem('cama_chat_session_id');
      if (!chatSessionId) {
        chatSessionId = 'session_' + Math.random().toString(36).substring(2, 11);
        safeStorage.setItem('cama_chat_session_id', chatSessionId);
      }
      
      let userEmail = '';
      let userName = '';
      try {
        const sessionStr = safeStorage.getItem('cama_session');
        if (sessionStr) {
          const u = JSON.parse(sessionStr);
          userEmail = u.email || '';
          userName = u.name || u.fullName || u.email || '';
        }
      } catch (e) {}

      getOrCreateDiscussion(chatSessionId, userEmail, userName).then(res => {
        setActiveDiscussion(res.discussion);
        if (res.messages && res.messages.length > 0) {
          setChatMessages(res.messages.map(m => ({
            id: m.id.toString(),
            sender: m.sender === 'user' ? 'user' : 'bot',
            text: m.text,
            time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            rawSender: m.sender
          })));
        } else {
          const welcomeText = `Bonjour ${userName || 'Cher Membre'}! 👋 Un conseiller CAMA va prendre en charge votre discussion. N'hésitez pas à nous laisser un message ci-dessous, nous sommes en ligne !`;
          sendChatMessage(res.discussion.id, 'advisor', welcomeText).then(m => {
            setChatMessages([{
              id: m.id.toString(),
              sender: 'bot',
              text: welcomeText,
              time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              rawSender: 'advisor'
            }]);
          });
        }
      }).catch(console.error);
    }
  }, [showAssistantModal, activeAdvisorMode]);

  // Polling for live advisor answers
  useEffect(() => {
    let interval: any;
    if (showAssistantModal && activeAdvisorMode && activeDiscussion) {
      interval = setInterval(() => {
        getDiscussionMessages(activeDiscussion.id).then(msgs => {
          setChatMessages(msgs.map(m => ({
            id: m.id.toString(),
            sender: m.sender === 'user' ? 'user' : 'bot',
            text: m.text,
            time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            rawSender: m.sender
          })));
        }).catch(console.error);
      }, 3500); // Poll every 3.5 seconds
    }
    return () => clearInterval(interval);
  }, [showAssistantModal, activeAdvisorMode, activeDiscussion]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newUserMsg]);
    setChatInput('');

    // If active advisor mode is enabled, persist to database instead of simulated bot reply
    if (activeAdvisorMode) {
      if (activeDiscussion) {
        sendChatMessage(activeDiscussion.id, 'user', textToSend).then(m => {
          // Refresh message list
          getDiscussionMessages(activeDiscussion.id).then(msgs => {
            setChatMessages(msgs.map(m => ({
              id: m.id.toString(),
              sender: m.sender === 'user' ? 'user' : 'bot',
              text: m.text,
              time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              rawSender: m.sender
            })));
          });
        }).catch(console.error);
      } else {
        // If the discussion is still loading, wait a bit and retry
        setTimeout(() => {
          const chatSessionId = safeStorage.getItem('cama_chat_session_id');
          if (chatSessionId) {
            getOrCreateDiscussion(chatSessionId, '', '').then(res => {
              setActiveDiscussion(res.discussion);
              sendChatMessage(res.discussion.id, 'user', textToSend).then(m => {
                getDiscussionMessages(res.discussion.id).then(msgs => {
                  setChatMessages(msgs.map(m => ({
                    id: m.id.toString(),
                    sender: m.sender === 'user' ? 'user' : 'bot',
                    text: m.text,
                    time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    rawSender: m.sender
                  })));
                });
              });
            });
          }
        }, 800);
      }
      return;
    }

    setIsTyping(true);

    const historyForAi = [...chatMessages, newUserMsg].map(m => ({
      sender: m.sender,
      text: m.text
    }));

    // Fetch dynamic AI reply from server with local static fallbacks built-in
    fetch('/api/chat/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: historyForAi })
    })
      .then(res => {
        if (!res.ok) throw new Error("Server error");
        return res.json();
      })
      .then(data => {
        const newBotMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: data.reply || "Je suis à votre disposition pour vous orienter.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages(prev => [...prev, newBotMsg]);
      })
      .catch(err => {
        console.error("AI chat error:", err);
        // Static fallback
        let botReplyText = "Merci pour votre message. Un conseiller de la Caisse d'Assurance Maladie des Armées (CAMA) va prendre en charge votre demande sous peu.";
        const lowerText = textToSend.toLowerCase();
        if (lowerText.includes('enrôl') || lowerText.includes('enrol')) {
          botReplyText = faqQuestions[0].a;
        } else if (lowerText.includes('rembours') || lowerText.includes('dossier') || lowerText.includes('suivi')) {
          botReplyText = faqQuestions[1].a;
        } else if (lowerText.includes('clinique') || lowerText.includes('centre') || lowerText.includes('pharmacie') || lowerText.includes('réseau')) {
          botReplyText = faqQuestions[2].a;
        } else if (lowerText.includes('couverture') || lowerText.includes('taux') || lowerText.includes('prise')) {
          botReplyText = faqQuestions[3].a;
        }
        
        const newBotMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: botReplyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages(prev => [...prev, newBotMsg]);
      })
      .finally(() => {
        setIsTyping(false);
      });
  };

  // Generate Whatsapp redirect link
  const generateWhatsappUrl = () => {
    const cleanPhone = whatsappPhone.replace(/\s+/g, '');
    const encodedMsg = encodeURIComponent(whatsappMessage);
    return `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
  };

  const handleActivateRedirection = () => {
    const url = generateWhatsappUrl();
    window.open(url, '_blank');
    setShowWhatsappModal(false);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 relative transition-colors duration-300">
      {/* News Ticker */}
      <NewsTicker />

      {/* Fixed Side Actions (Left) */}
      <div className="fixed left-0 top-1/2 -translate-y-1/2 flex flex-col z-50">
        <Link to="/services" className="bg-[#008a4b] hover:bg-[#00703c] text-white p-3 rounded-r-md mb-1 shadow-md transition-all w-12 h-12 hover:w-36 flex items-center group overflow-hidden" aria-label="Nos Prestations">
           <CheckSquare className="w-6 h-6 flex-shrink-0" />
           <span className="ml-3 font-bold text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">Nos prestations</span>
        </Link>
        <Link to="/news" className="bg-[#ef2b2d] hover:bg-red-700 text-white p-3 rounded-r-md mb-1 shadow-md transition-all w-12 h-12 hover:w-36 flex items-center group overflow-hidden" aria-label="Actualités">
           <Newspaper className="w-6 h-6 flex-shrink-0" />
           <span className="ml-3 font-bold text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">Actualités</span>
        </Link>
        <Link to="/login" className="bg-orange-400 hover:bg-orange-500 text-white p-3 rounded-r-md shadow-md transition-all w-12 h-12 hover:w-36 flex items-center group overflow-hidden" aria-label="E-Espace">
           <User className="w-6 h-6 flex-shrink-0" />
           <span className="ml-3 font-bold text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">E-Espace</span>
        </Link>
      </div>

      {/* Floating Bottom Right Actions */}
      <div className="fixed bottom-6 right-6 flex flex-col items-center space-y-3.5 z-50">
        {/* Assistant Robot Floating ("Discutons") */}
        <div className="relative">
          <button 
            onClick={() => setShowAssistantModal(prev => !prev)}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-2 border-white ring-2 transition-all duration-300 hover:scale-110 ${
              showAssistantModal ? 'bg-red-500 ring-red-300' : 'bg-[#008a4b] ring-[#008a4b]/30'
            }`}
            aria-label="Contacter l'assistant virtuel"
          >
             {showAssistantModal ? (
               <X className="w-6 h-6 text-white" />
             ) : (
               <Bot className="w-7 h-7 text-white" />
             )}
          </button>
          
          {!showAssistantModal && (
            <div className="absolute right-full top-1/2 -translate-y-1/2 mr-4 bg-white text-gray-850 text-xs font-extrabold py-2 px-3 rounded-xl shadow-xl border border-gray-100/60 whitespace-nowrap pointer-events-none animate-pulse">
              Discutons ! 👋
            </div>
          )}
        </div>

        {/* Helper WhatsApp trigger bubble (Detached) */}
        <button 
          onClick={() => setShowWhatsappModal(true)}
          className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center group relative w-14 h-14 animate-pulse" 
          aria-label="WhatsApp"
        >
          <MessageCircle className="w-7 h-7" />
          <div className="absolute right-full mr-4 bg-white text-gray-800 text-sm font-medium py-2 px-4 rounded-xl shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition border border-gray-100 flex flex-col pointer-events-none">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Service Direct</span>
            <span className="font-black text-green-600">WhatsApp CAMA</span>
          </div>
        </button>

        {/* Scroll to Top */}
        <button onClick={scrollToTop} className="bg-gray-100 border border-gray-200 text-gray-600 hover:text-[#008a4b] hover:bg-white p-3 rounded-full shadow-lg transition-all hover:scale-110 w-12 h-12 flex items-center justify-center animate-bounce [animation-duration:3s]" aria-label="Retour en haut">
           <ArrowUp className="w-5 h-5" />
        </button>
      </div>

      {/* Interactive Discutons Chat Panel */}
      <AnimatePresence>
        {showAssistantModal && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-40 right-6 w-96 max-w-[calc(100vw-2rem)] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden flex flex-col"
          >
            {/* Chat Header */}
            <div className="bg-[#008a4b] text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  {activeAdvisorMode ? (
                    <User className="w-6 h-6 text-yellow-300" />
                  ) : (
                    <Bot className="w-6 h-6 text-yellow-300" />
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm leading-none">
                    {activeAdvisorMode ? "Conseiller CAMA" : "Assistant CAMA"}
                  </h3>
                  <span className="text-xs text-green-100">
                    {activeAdvisorMode ? "Messagerie en direct • En ligne" : "En ligne pour vous aider"}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowAssistantModal(false)}
                className="text-white/80 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-grow p-4 overflow-y-auto bg-slate-50 space-y-4">
              {activeAdvisorMode ? (
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 text-xs text-gray-700 leading-relaxed mb-2">
                  <span className="font-bold text-blue-700 block mb-1">Assistance en direct</span>
                  Vous êtes connecté(e) en temps réel avec l'un de nos conseillers militaires. Saisissez votre question ci-dessous pour obtenir une réponse rapide.
                </div>
              ) : (
                <div className="bg-green-50 rounded-xl p-3 border border-green-100 text-xs text-gray-700 leading-relaxed mb-2">
                  <span className="font-bold text-[#008a4b] block mb-1">CAMA Info</span>
                  {settings?.chatAdvisorActive ? (
                    <span>Le service de discussion en direct avec un conseiller est actuellement fermé. Heures de disponibilité : de <strong>{settings?.chatStartHour || "08:00"}</strong> à <strong>{settings?.chatEndHour || "17:00"}</strong>. Posez vos questions ci-dessous au robot d'assistance ou utilisez WhatsApp.</span>
                  ) : (
                    <span>Posez vos questions ci-dessous ou cliquez sur un sujet fréquent de notre foire aux questions rapide.</span>
                  )}
                </div>
              )}

              {chatMessages.map(msg => (
                <div 
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.sender === 'user' 
                      ? 'bg-[#008a4b] text-white rounded-tr-none' 
                      : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                  }`}>
                    <p className="leading-relaxed">{msg.text}</p>
                    <span className="text-[10px] block text-right mt-1 opacity-60">{msg.time}</span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center space-x-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick FAQ Container */}
            <div className="px-4 py-2 bg-white border-t border-gray-100 flex flex-wrap gap-1.5 scrollbar-none overflow-x-auto max-h-24">
              {faqQuestions.map((faq, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(faq.q)}
                  className="text-[10px] font-bold text-gray-600 bg-slate-100 hover:bg-[#008a4b]/10 hover:text-[#008a4b] px-2.5 py-1.5 rounded-full border border-gray-200/60 transition whitespace-nowrap flex items-center"
                >
                  <HelpCircle className="w-3 h-3 mr-1 text-[#008a4b]" />
                  {faq.q}
                </button>
              ))}
            </div>

            {/* Chat Input Bar */}
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                handleSendMessage(chatInput);
              }}
              className="p-3 bg-white border-t border-gray-200 flex items-center space-x-2"
            >
              <input 
                type="text"
                placeholder="Rédiger votre message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-grow bg-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#008a4b] text-gray-700"
              />
              <button 
                type="submit"
                className="bg-[#008a4b] hover:bg-[#00703c] text-white p-2.5 rounded-lg transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WhatsApp Redirection Modal */}
      <AnimatePresence>
        {showWhatsappModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full overflow-hidden"
            >
              {/* Modal Banner Header */}
              <div className="bg-green-600 text-white p-6 relative">
                <button 
                  onClick={() => setShowWhatsappModal(false)}
                  className="absolute top-4 right-4 text-white/80 hover:text-white text-xl font-bold"
                >
                  ×
                </button>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg">Assistance WhatsApp CAMA</h3>
                    <p className="text-xs text-green-100">Générer & Activer la redirection</p>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4 text-left">
                <p className="text-sm text-gray-600 leading-relaxed">
                  Vous allez être redirigé de manière sécurisée vers le canal officiel WhatsApp de la Caisse d'Assurance Maladie des Armées. 
                  Vous pouvez personnaliser l'introduction ci-dessous :
                </p>

                {/* Redirection parameters */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Destinataire (Soutien CAMA)</label>
                    <div className="flex items-center bg-slate-100 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700">
                      <Phone className="w-4 h-4 text-green-600 mr-2" />
                      {whatsappPhone}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Message d'ouverture initial</label>
                    <textarea 
                      rows={3}
                      value={whatsappMessage}
                      onChange={(e) => setWhatsappMessage(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 text-gray-700"
                    />
                  </div>
                </div>

                {/* Generated preview link */}
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <span className="text-[10px] font-bold text-gray-400 block mb-0.5 uppercase tracking-wider">Lien de redirection généré</span>
                  <div className="text-xs text-gray-500 font-mono break-all truncate max-w-full">
                    {generateWhatsappUrl()}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="px-6 py-4 bg-slate-50 border-t border-gray-100 flex justify-end space-x-3">
                <button 
                  onClick={() => setShowWhatsappModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 bg-white hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleActivateRedirection}
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-extrabold flex items-center shadow-md shadow-green-600/10"
                >
                  <ArrowUpRight className="w-4 h-4 mr-1.5" />
                  Activer la redirection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

