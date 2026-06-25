import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User as UserIcon, ShieldCheck, Phone, MapPin, Building, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getUsers, addUser, safeStorage } from '../lib/dataStore';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration fields
  const [name, setName] = useState('');
  const [matricule, setMatricule] = useState('');
  const [corp, setCorp] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (email.includes('admin')) {
      safeStorage.setItem('cama_session', JSON.stringify({ role: 'admin', email }));
      navigate('/admin');
      return;
    }

    const users = getUsers();
    const user = users.find(u => u.email === email && (u.password === password || password === 'password123'));

    if (user) {
      safeStorage.setItem('cama_session', JSON.stringify({ role: 'user', ...user }));
      navigate('/dashboard');
    } else {
      setError('Email ou mot de passe incorrect');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !matricule) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const users = getUsers();
    if (users.some(u => u.email === email)) {
      setError('Cet email est déjà utilisé');
      return;
    }

    addUser({
      name,
      email,
      password,
      matricule,
      corp: corp || 'Non spécifié',
      phone,
      status: 'Actif'
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
            src="/src/assets/images/cama_logo_1782214925115.jpg" 
            alt="Logo CAMA" 
            className="w-24 h-24 object-contain rounded-full shadow-lg border border-gray-100 bg-white"
            referrerPolicy="no-referrer"
          />
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
          Connexion à l'espace
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Plateforme d'enrôlement des membres de famille
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
            {!isRegistering ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                  <strong>Mode démo :</strong><br/>
                  Utilisez <strong>superadmin@cama.bf</strong> (mot de passe libre) pour l'admin. <br/>
                  Utilisez <strong>i.kabore@armee.bf</strong> (mot de passe: password123) pour l'espace assuré.
                </div>

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
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Nom complet (Militaire)</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        required
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008a4b] outline-none text-sm" 
                        placeholder="Ex: KABORE Idrissa"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
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
