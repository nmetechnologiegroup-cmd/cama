import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Building2, Newspaper, Settings, LogOut, Bell, Globe, ChevronDown, User as UserIcon, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { getSiteSettings, safeStorage } from '../lib/dataStore';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getSiteSettings().then(setSettings).catch(console.error);

    const sessionStr = safeStorage.getItem('cama_session');
    if (!sessionStr) {
      navigate('/login');
      return;
    }
    try {
      const user = JSON.parse(sessionStr);
      if (user.role !== 'admin') {
        navigate('/login');
        return;
      }
      setCurrentUser(user);
    } catch (e) {
      navigate('/login');
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [navigate]);

  const getInitials = (nameStr: string) => {
    if (!nameStr) return 'AD';
    const parts = nameStr.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return nameStr.substring(0, 2).toUpperCase();
  };

  const navigation = [
    { name: 'Tableau de bord', href: '/admin', icon: LayoutDashboard },
    { name: 'Gestion Site Web', href: '/admin/site', icon: Globe },
    { name: 'Messagerie Chat', href: '/admin/chat', icon: MessageSquare },
    { name: 'Dossiers enrôlement', href: '/admin/dossiers', icon: FileText },
    { name: 'Assurés & Utilisateurs', href: '/admin/users', icon: Users },
    { name: 'Centres de santé', href: '/admin/centres', icon: Building2 },
    { name: 'Actualités', href: '/admin/news', icon: Newspaper },
    { name: 'Paramètres', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 font-sans transition-colors duration-300">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 flex flex-col text-slate-300 shadow-xl z-20 transition-colors">
        <div className="h-20 flex items-center justify-start px-6 text-white font-bold text-lg border-b border-slate-800 bg-slate-950 gap-2.5">
          <img 
            src={settings?.logoUrl || "/src/assets/images/cama_logo_1782214925115.jpg"} 
            alt="Logo CAMA" 
            className="w-10 h-10 object-contain rounded-full shadow border border-slate-700 bg-white"
            referrerPolicy="no-referrer"
          />
          <span className="tracking-wide font-extrabold">{settings?.siteTitle ? `Admin ${settings.siteTitle}` : "Admin CAMA"}</span>
        </div>
        <div className="flex-1 overflow-y-auto py-6">
          <nav className="space-y-2 px-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    isActive ? 'bg-[#008a4b] text-white shadow-md' : 'hover:bg-slate-800 hover:text-white',
                    'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200'
                  )}
                >
                  <item.icon className={cn(
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200',
                    'mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200'
                  )} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-red-400 rounded-xl transition-all duration-200"
          >
            <LogOut className="mr-3 flex-shrink-0 h-5 w-5" />
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50 dark:bg-slate-900 transition-colors">
        <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 z-10 flex justify-between px-8 py-4 items-center transition-colors">
          <h2 className="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight transition-colors">
            {navigation.find(n => n.href === location.pathname)?.name || 'Administration'}
          </h2>
          <div className="flex items-center space-x-6 relative">
            
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-slate-300 relative transition-colors focus:outline-none"
              >
                <Bell className="w-6 h-6" />
                <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-800"></span>
              </button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                      <span className="font-bold text-gray-900 dark:text-white">Notifications</span>
                      <span className="text-xs bg-[#008a4b]/10 text-[#008a4b] px-2 py-0.5 rounded-full font-bold">1 Nouvelle</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <div className="p-4 border-b border-gray-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer">
                        <div className="text-xs font-bold text-gray-900 dark:text-white mb-1">Nouveau dossier soumis</div>
                        <div className="text-[10px] text-gray-500 dark:text-slate-400">Le militaire DIALLO Oumar a soumis un nouveau dossier d'enrôlement.</div>
                        <div className="text-[9px] text-gray-400 mt-2 font-medium">Il y a 5 min</div>
                      </div>
                      <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer opacity-70">
                        <div className="text-xs font-bold text-gray-900 dark:text-white mb-1">Mise à jour système</div>
                        <div className="text-[10px] text-gray-500 dark:text-slate-400">La plateforme a été mise à jour vers la version 1.2.</div>
                        <div className="text-[9px] text-gray-400 mt-2 font-medium">Il y a 2 jours</div>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-slate-900/80 text-center border-t border-gray-100 dark:border-slate-700">
                      <button className="text-[10px] font-bold text-[#008a4b] hover:underline uppercase tracking-wider">Tout marquer comme lu</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}
            <div className="relative border-l border-gray-200 dark:border-slate-700 pl-6" ref={profileRef}>
              <div 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-[#008a4b] flex items-center justify-center text-white font-bold shadow-md group-hover:bg-[#00703c] transition-colors">
                  {currentUser ? getInitials(currentUser.name) : 'AD'}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900 dark:text-white leading-tight transition-colors">
                    {currentUser?.name || 'Administrateur'}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-slate-400 font-medium transition-colors">
                    {currentUser?.email === 'support@sappay.net' || currentUser?.email === 'mandemohamed68@gmail.com' || currentUser?.email === 'sfankany@sappay.net' ? 'Super Admin' : 'Direction'}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
              </div>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        {currentUser?.name || 'Administrateur'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">
                        {currentUser?.email || 'admin@cama.bf'}
                      </div>
                    </div>
                    <div className="p-2">
                      <Link 
                        to="/admin/settings" 
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4 mr-3 text-gray-400" />
                        Mon Compte
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors mt-1"
                      >
                        <LogOut className="w-4 h-4 mr-3 text-red-500" />
                        Se déconnecter
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto px-8 py-8 dark:text-slate-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
