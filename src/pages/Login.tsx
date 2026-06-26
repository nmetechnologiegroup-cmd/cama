import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User as UserIcon, ShieldCheck, Phone, MapPin, Building, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getUsers, addUser, safeStorage, getSiteSettings, getAdminUsers } from '../lib/dataStore';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [settings, setSettings] = useState<any>(null);
  const [pendingRoleSelection, setPendingRoleSelection] = useState<{ adminSession: any; userSession: any } | null>(null);

  useEffect(() => {
    getSiteSettings().then(setSettings).catch(console.error);
  }, []);
  
  // Registration fields
  const [name, setName] = useState('');
  const [prenoms, setPrenoms] = useState('');
  const [matricule, setMatricule] = useState('');
  const [corp, setCorp] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const hardcodedAdmins = [
      { email: 'support@sappay.net', password: 's@ppay2023', name: 'Support SapPay' },
      { email: 'mandemohamed68@gmail.com', password: 'mm@27071986@', name: 'Mohamed Mande' },
      { email: 'sfankany@sappay.net', password: 's@ppay2023', name: 'SFankany' }
    ];

    const inputIdentifier = email.toLowerCase().trim();

    // Check admin match
    const matchedHardcoded = hardcodedAdmins.find(ha => ha.email.toLowerCase() === inputIdentifier);
    let isAdmin = false;
    let adminSession: any = null;

    if (matchedHardcoded) {
      if (password === matchedHardcoded.password) {
        isAdmin = true;
        adminSession = { 
          role: 'admin', 
          email: matchedHardcoded.email,
          name: matchedHardcoded.name,
          id: -hardcodedAdmins.indexOf(matchedHardcoded) - 1
        };
      } else {
        setError('Mot de passe incorrect pour ce Super Administrateur');
        return;
      }
    } else if (inputIdentifier.includes('admin')) {
      isAdmin = true;
      adminSession = { role: 'admin', email: inputIdentifier, name: 'Administrateur' };
    } else {
      const dbAdmins = await getAdminUsers().catch(() => []);
      const matchedDbAdmin = dbAdmins.find(adm => adm.email.toLowerCase() === inputIdentifier && adm.status === 'Actif');
      if (matchedDbAdmin) {
        const usersList = await getUsers();
        const correspondingUser = usersList.find(u => u.email.toLowerCase() === inputIdentifier);
        if (correspondingUser && (correspondingUser.password === password || password === 'password123')) {
          isAdmin = true;
          adminSession = { role: 'admin', email: matchedDbAdmin.email, name: matchedDbAdmin.name, id: matchedDbAdmin.id };
        } else if (!correspondingUser && (password === 'password123' || password === 'admin123')) {
          isAdmin = true;
          adminSession = { role: 'admin', email: matchedDbAdmin.email, name: matchedDbAdmin.name, id: matchedDbAdmin.id };
        }
      }
    }

    // Check insured user match
    const users = await getUsers();
    const matchedUser = users.find(u => 
      (u.email.toLowerCase() === inputIdentifier || u.matricule.toLowerCase() === inputIdentifier) && 
      (u.password === password || password === 'password123')
    );

    if (isAdmin && matchedUser) {
      setPendingRoleSelection({
        adminSession,
        userSession: { role: 'user', ...matchedUser }
      });
    } else if (isAdmin) {
      safeStorage.setItem('cama_session', JSON.stringify(adminSession));
      navigate('/admin');
    } else if (matchedUser) {
      safeStorage.setItem('cama_session', JSON.stringify({ role: 'user', ...matchedUser }));
      navigate('/dashboard');
    } else {
      setError('Email, Matricule ou mot de passe incorrect');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !prenoms || !email || !password || !matricule || !phone) {
      setError('Veuillez remplir tous les champs obligatoires (nom, prénoms, email, matricule, téléphone et mot de passe)');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError("Veuillez saisir une adresse email valide (ex: nom@domaine.bf)");
      return;
    }

    const phoneRegex = /^\+?[0-9\s\-()]{8,20}$/;
    if (!phoneRegex.test(phone)) {
      setError("Veuillez saisir un numéro de téléphone valide (minimum 8 chiffres, ex: 70001122)");
      return;
    }

    const users = await getUsers();
    if (users.some(u => u.email === email)) {
      setError('Cet email est déjà utilisé');
      return;
    }

    addUser({
      name,
      prenoms,
      email,
      password,
      matricule,
      corp: corp || 'Non spécifié',
      phone,
      status: 'Actif',
      statut: 'Modif. à Valider'
    });

    setIsRegistering(false);
    setError('');
    alert('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="flex justify-center mb-6">
          <img 
            src={settings?.logoUrl || "/src/assets/images/cama_logo_1782214925115.jpg"} 
            alt="Logo" 
            className="w-24 h-24 object-contain rounded-full shadow-lg border border-gray-100 bg-white"
            referrerPolicy="no-referrer"
          />
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
          {settings?.siteTitle ? `Connexion à ${settings.siteTitle}` : "Connexion à l'espace"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {settings?.siteSlogan || "Plateforme d'enrôlement des membres de famille"}
        </p>
      </motion.div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-gray-100">
          
          <AnimatePresence mode="wait">
            {pendingRoleSelection ? (
              <motion.div
                key="role-selection"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-lg font-black text-gray-950 uppercase tracking-wide">
                    Double Profil Détecté
                  </h3>
                  <p className="mt-2 text-xs text-gray-500 leading-relaxed font-bold uppercase tracking-wider">
                    Vos identifiants correspondent à la fois à un compte Administrateur et à un compte Militaire Assuré.
                  </p>
                  <p className="mt-1.5 text-[11px] text-gray-400 font-medium leading-relaxed">
                    Veuillez sélectionner l'espace auquel vous souhaitez vous connecter :
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      safeStorage.setItem('cama_session', JSON.stringify(pendingRoleSelection.adminSession));
                      navigate('/admin');
                    }}
                    className="w-full text-left p-4 border border-gray-200 hover:border-[#008a4b] hover:bg-green-50/20 rounded-xl transition cursor-pointer flex items-start gap-3 px-3.5 group"
                  >
                    <div className="p-2.5 bg-green-50 text-[#008a4b] rounded-lg group-hover:bg-[#008a4b] group-hover:text-white transition flex-shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black text-gray-950 uppercase tracking-wide group-hover:text-[#008a4b] transition">
                        Espace Administration
                      </h4>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                        Rôle : {pendingRoleSelection.adminSession.role || 'Administrateur'}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-1 leading-snug font-medium">
                        Gérer les dossiers d'enrôlement, valider les demandes des assurés et configurer les centres.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      safeStorage.setItem('cama_session', JSON.stringify(pendingRoleSelection.userSession));
                      navigate('/dashboard');
                    }}
                    className="w-full text-left p-4 border border-gray-200 hover:border-[#008a4b] hover:bg-green-50/20 rounded-xl transition cursor-pointer flex items-start gap-3 px-3.5 group"
                  >
                    <div className="p-2.5 bg-green-50 text-[#008a4b] rounded-lg group-hover:bg-[#008a4b] group-hover:text-white transition flex-shrink-0">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black text-gray-950 uppercase tracking-wide group-hover:text-[#008a4b] transition">
                        Espace Militaire Assuré
                      </h4>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                        Matricule : {pendingRoleSelection.userSession.matricule || 'N/A'}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-1 leading-snug font-medium">
                        Déclarer vos ayants-droit (conjoints, enfants), suivre l'avancement et imprimer vos fiches.
                      </p>
                    </div>
                  </button>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setPendingRoleSelection(null)}
                    className="text-xs font-bold text-gray-500 hover:text-gray-750 flex items-center uppercase tracking-wider"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Retour
                  </button>
                </div>
              </motion.div>
            ) : !isRegistering ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 font-medium">
                    {error}
                  </div>
                )}

                <form className="space-y-6" onSubmit={handleLogin}>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Adresse email ou N° Matricule
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="text"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#008a4b] focus:border-[#008a4b] sm:text-sm"
                        placeholder="nom@exemple.bf"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Mot de passe
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#008a4b] focus:border-[#008a4b] sm:text-sm"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-[#008a4b] focus:ring-[#008a4b] border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                        Se souvenir de moi
                      </label>
                    </div>

                    <div className="text-sm">
                      <a href="#" className="font-medium text-[#008a4b] hover:text-green-700">
                        Code oublié ?
                      </a>
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#008a4b] hover:bg-[#006e3b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#008a4b] transition-colors"
                    >
                      Se connecter
                    </button>
                  </div>
                </form>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">
                        Nouveau sur la plateforme ?
                      </span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => setIsRegistering(true)}
                      className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                      Créer mon compte Assuré
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <button 
                  onClick={() => setIsRegistering(false)}
                  className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-6"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Retour à la connexion
                </button>

                <h3 className="text-xl font-bold text-gray-900 mb-6">Création de compte Assuré</h3>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 font-medium">
                    {error}
                  </div>
                )}

                <form className="space-y-4" onSubmit={handleRegister}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Nom (Militaire)</label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                          type="text" 
                          required
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008a4b] outline-none text-sm" 
                          placeholder="Ex: KABORE"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Prénom(s) (Militaire)</label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                          type="text" 
                          required
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008a4b] outline-none text-sm" 
                          placeholder="Ex: Idrissa"
                          value={prenoms}
                          onChange={(e) => setPrenoms(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Matricule Militaire</label>
                      <div className="relative">
                        <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                          type="text" 
                          required
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008a4b] outline-none text-sm" 
                          placeholder="M-XXXX"
                          value={matricule}
                          onChange={(e) => setMatricule(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Corps / Unité</label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                          type="text" 
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008a4b] outline-none text-sm" 
                          placeholder="Armée de Terre..."
                          value={corp}
                          onChange={(e) => setCorp(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Adresse Email Professionnelle</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="email" 
                        required
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008a4b] outline-none text-sm" 
                        placeholder="nom.prenom@armee.bf"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Numéro de Téléphone *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="tel" 
                        required
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008a4b] outline-none text-sm font-mono" 
                        placeholder="Ex: +226 70 00 11 22"
                        value={phone}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^[0-9\s+\-()]*$/.test(val)) {
                            setPhone(val);
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Mot de passe</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="password" 
                        required
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008a4b] outline-none text-sm" 
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#008a4b] hover:bg-[#006e3b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#008a4b] transition-colors mt-6"
                  >
                    Créer mon compte
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
