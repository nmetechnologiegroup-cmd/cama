import { useState, useMemo, FormEvent, useEffect } from 'react';
import { Search, UserPlus, Filter, Edit2, Trash2, Mail, X, Check, Save, Shield, ShieldCheck, ShieldAlert, Key, Users as UsersIcon, CheckSquare, Square, Lock, Activity, RotateCcw, CheckCircle, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getUsers, addUser, editUser, deleteUser, User, getAdminUsers, addAdminUser, editAdminUser, deleteAdminUser, AdminUser, getNotificationTemplates, saveNotificationTemplate, personalizeMessage, NotificationTemplate, getSiteSettings, DEFAULT_SITE_SETTINGS } from '../../lib/dataStore';

export default function AdminUsers({ initialTab, hideTabs }: { initialTab?: 'assures' | 'admins' | 'templates'; hideTabs?: boolean } = {}) {
  const [activeTab, setActiveTab] = useState<'assures' | 'admins' | 'templates'>(initialTab || 'assures');
  
  // Assurés State
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => { getUsers().then(setUsers); }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [corpFilter, setCorpFilter] = useState<'Tous' | 'Armée de Terre' | 'Gendarmerie Nationale' | "Armée de l'Air">('Tous');

  // Assurés Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Assurés Form Fields
  const [formName, setFormName] = useState('');
  const [formPrenoms, setFormPrenoms] = useState('');
  const [formMatricule, setFormMatricule] = useState('');
  const [formCorp, setFormCorp] = useState('Armée de Terre');
  const [formEmail, setFormEmail] = useState('');
  const [formStatus, setFormStatus] = useState<'Actif' | 'Inactif'>('Actif');
  const [formNumDossier, setFormNumDossier] = useState('');
  const [formJustification, setFormJustification] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  // Admins State
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  useEffect(() => { getAdminUsers().then(setAdmins); }, []);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);

  // Admin Form Fields
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminRole, setAdminRole] = useState<'Super Admin' | 'Gestionnaire Dossiers' | 'Éditeur Actualités' | 'Responsable Réseau'>('Gestionnaire Dossiers');
  const [adminStatus, setAdminStatus] = useState<'Actif' | 'Inactif'>('Actif');
  const [adminPermissions, setAdminPermissions] = useState<string[]>(['dossiers']);

  // Templates State
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  useEffect(() => { getNotificationTemplates().then(setTemplates); }, []);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateContent, setTemplateContent] = useState('');

  const AVAILABLE_PERMISSIONS = [
    { id: 'site_settings', name: 'Site Web & Présentation', desc: 'Editer le bandeau d\'accueil, le message filigrane et le popup.' },
    { id: 'dossiers', name: 'Gestion des Dossiers', desc: 'Consulter, valider ou rejeter les demandes d\'enrôlement.' },
    { id: 'users', name: 'Gestion des Assurés', desc: 'Ajouter, suspendre ou modifier les militaires inscrits.' },
    { id: 'centres', name: 'Gestion des Centres', desc: 'Administrer l\'annuaire des centres de santé de la CAMA.' },
    { id: 'news', name: 'Actualités & Communiqués', desc: 'Publier et modifier les articles de presse et lettres officielles.' },
    { id: 'settings', name: 'Supervision & Droits', desc: 'Superviser les privilèges et créer de nouveaux administrateurs.' }
  ];

  // Auto-fill suggested permissions based on selected Role
  const handleRoleChange = (role: 'Super Admin' | 'Gestionnaire Dossiers' | 'Éditeur Actualités' | 'Responsable Réseau') => {
    setAdminRole(role);
    if (role === 'Super Admin') {
      setAdminPermissions(['site_settings', 'dossiers', 'users', 'centres', 'news', 'settings']);
    } else if (role === 'Gestionnaire Dossiers') {
      setAdminPermissions(['dossiers', 'centres']);
    } else if (role === 'Éditeur Actualités') {
      setAdminPermissions(['news', 'site_settings']);
    } else if (role === 'Responsable Réseau') {
      setAdminPermissions(['centres']);
    }
  };

  const togglePermission = (permId: string) => {
    if (adminPermissions.includes(permId)) {
      setAdminPermissions(adminPermissions.filter(p => p !== permId));
    } else {
      setAdminPermissions([...adminPermissions, permId]);
    }
  };

  const [statusFilter, setStatusFilter] = useState<'Tous' | 'Actif' | 'Inactif' | 'Modif. à Valider' | 'En attente'>('Tous');

  // Comparison Modal
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [userToValidate, setUserToValidate] = useState<User | null>(null);

  // Filter assured users lists
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.matricule.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchCorp = corpFilter === 'Tous' || user.corp === corpFilter;
      const matchStatus = statusFilter === 'Tous' || (statusFilter === 'Modif. à Valider' ? user.statut === 'Modif. à Valider' : statusFilter === 'En attente' ? user.statut === 'En attente' : user.status === statusFilter);
      
      return matchSearch && matchCorp && matchStatus;
    });
  }, [users, searchQuery, corpFilter, statusFilter]);

  // Filter administrative users lists
  const filteredAdmins = useMemo(() => {
    return admins.filter(admin => {
      return (
        admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.role.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [admins, searchQuery]);

  // Open modal for creation
  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormName('');
    setFormPrenoms('');
    setFormMatricule('');
    setFormCorp('Armée de Terre');
    setFormEmail('');
    setFormStatus('Actif');
    setFormNumDossier('');
    setFormJustification('');
    setShowHistory(false);
    setIsModalOpen(true);
  };

  // Open modal for edition
  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormPrenoms(user.prenoms || '');
    setFormMatricule(user.matricule);
    setFormCorp(user.corp);
    setFormEmail(user.email);
    setFormStatus(user.status);
    setFormNumDossier(user.numDossier || '');
    setFormJustification('');
    setShowHistory(false);
    setIsModalOpen(true);
  };

  // Open admin modal for creation
  const handleOpenAdminCreate = () => {
    setEditingAdmin(null);
    setAdminName('');
    setAdminEmail('');
    setAdminRole('Gestionnaire Dossiers');
    setAdminStatus('Actif');
    setAdminPermissions(['dossiers', 'centres']);
    setIsAdminModalOpen(true);
  };

  // Open admin modal for edition
  const handleOpenAdminEdit = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setAdminName(admin.name);
    setAdminEmail(admin.email);
    setAdminRole(admin.role);
    setAdminStatus(admin.status);
    setAdminPermissions(admin.permissions || []);
    setIsAdminModalOpen(true);
  };

  const generateDossierId = () => {
    const [settings, setSettings] = useState<any>(DEFAULT_SITE_SETTINGS);
  useEffect(() => { getSiteSettings().then(setSettings); }, []);
    const format = settings.dossierIdFormat || 'CAMA-{YYYY}-{SEQ}';
    
    const year = new Date().getFullYear().toString();
    const allDossierIds = users.map(u => u.numDossier).filter(Boolean) as string[];
    let maxSeq = 0;
    
    allDossierIds.forEach(id => {
       const match = id.match(/(\d+)(?!.*\d)/);
       if (match) {
         const num = parseInt(match[0], 10);
         if (num > maxSeq) maxSeq = num;
       }
    });
    
    const nextSeq = (maxSeq + 1).toString().padStart(4, '0');
    const newId = format.replace('{YYYY}', year).replace('{SEQ}', nextSeq);
    setFormNumDossier(newId);
  };

  // Save creation or edition of Assuré
  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!formName || !formMatricule || !formEmail) return;

    if (editingUser) {
      // Edit mode
      const isNumDossierChanged = formNumDossier !== (editingUser.numDossier || '');
      
      if (isNumDossierChanged && !formJustification) {
        alert('Un motif ou justificatif est obligatoire pour modifier le numéro de dossier.');
        return;
      }

      const updatedUser: User = {
        ...editingUser,
        name: formName,
        prenoms: formPrenoms,
        matricule: formMatricule,
        corp: formCorp,
        email: formEmail,
        status: formStatus,
        numDossier: formNumDossier
      };

      try {
        const result = await editUser(updatedUser, isNumDossierChanged ? formJustification : undefined);
        setUsers(result);
        
        // Auto-send notification if numDossier was assigned/changed
        if (isNumDossierChanged) {
          const templates = await getNotificationTemplates();
          const templateId = editingUser.numDossier ? 'dossier_modified' : 'dossier_assigned';
          const template = templates.find(t => t.id === templateId);
          
          if (template) {
            const personalizedBody = personalizeMessage(template.content, {
              '{{NOM}}': formName,
              '{{PRENOM}}': formPrenoms,
              '{{NUM_DOSSIER}}': formNumDossier,
              '{{MOTIF}}': formJustification
            });
            console.log(`Notification envoyée à ${formEmail}: ${personalizedBody}`);
            alert(`Une notification a été envoyée à l'assuré pour l'informer de son numéro de dossier.`);
          }
        }
      } catch (error: any) {
        alert(error.message);
        return;
      }
    } else {
      // Create mode
      const newUser = {
        name: formName,
        prenoms: formPrenoms,
        matricule: formMatricule,
        corp: formCorp,
        email: formEmail,
        status: formStatus,
        numDossier: formNumDossier
      };
      
      try {
        const result = await addUser(newUser);
        setUsers(result);
        
        if (formNumDossier) {
           const templates = await getNotificationTemplates();
           const template = templates.find(t => t.id === 'dossier_assigned');
           if (template) {
              const personalizedBody = personalizeMessage(template.content, {
                '{{NOM}}': formName,
                '{{PRENOM}}': formPrenoms,
                '{{NUM_DOSSIER}}': formNumDossier
              });
              alert(`Assuré créé et notification envoyée.`);
           }
        }
      } catch (error: any) {
        alert(error.message);
        return;
      }
    }
    setIsModalOpen(false);
  };

  // Save creation or edition of Admin
  const handleAdminSave = (e: FormEvent) => {
    e.preventDefault();
    if (!adminName || !adminEmail) return;

    if (editingAdmin) {
      if (editingAdmin.id === 1 || editingAdmin.id < 0) {
        alert("Ce Super Administrateur système ne peut pas être modifié.");
        return;
      }
      const updatedAdmin: AdminUser = {
        id: editingAdmin.id,
        name: adminName,
        email: adminEmail,
        role: adminRole,
        status: adminStatus,
        permissions: adminPermissions,
        createdDate: editingAdmin.createdDate
      };
      const result = editAdminUser(updatedAdmin);
      setAdmins(result);
    } else {
      const newAdmin = {
        name: adminName,
        email: adminEmail,
        role: adminRole,
        status: adminStatus,
        permissions: adminPermissions
      };
      const result = addAdminUser(newAdmin);
      setAdmins(result);
    }
    setIsAdminModalOpen(false);
  };

  const handleTemplateSave = (e: FormEvent) => {
    e.preventDefault();
    if (!editingTemplate || !templateSubject || !templateContent) return;

    const updatedTemplate: NotificationTemplate = {
      ...editingTemplate,
      subject: templateSubject,
      content: templateContent
    };

    const result = saveNotificationTemplate(updatedTemplate);
    setTemplates(result);
    setEditingTemplate(null);
    alert('Modèle de notification mis à jour avec succès.');
  };

  const handleDelete = async (id: number) => {
    const result = deleteUser(id);
    setUsers(result);
  };

  const handleAdminDelete = (id: number) => {
    if (id === 1 || id < 0) {
      alert("Ce Super Administrateur système ne peut pas être supprimé.");
      return;
    }
    const result = deleteAdminUser(id);
    setAdmins(result);
  };

  const handleApproveModifications = async (user: User) => {
    if (!user.pendingModifications) return;
    
    const updatedUser: User = {
      ...user,
      ...user.pendingModifications,
      statut: 'Validé',
      pendingModifications: undefined
    } as User;
    
    const result = await editUser(updatedUser);
    setUsers(result);
    setShowComparisonModal(false);
    setUserToValidate(null);
    alert(`Modifications de profil pour ${user.name} approuvées avec succès.`);
  };

  const handleRejectModifications = async (user: User) => {
    const updatedUser: User = {
      ...user,
      statut: 'Validé',
      pendingModifications: undefined
    } as User;
    
    const result = await editUser(updatedUser);
    setUsers(result);
    setShowComparisonModal(false);
    setUserToValidate(null);
    alert(`Modifications de profil pour ${user.name} rejetées.`);
  };

  return (
    <div className="space-y-6 text-left">
      {!hideTabs ? (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Utilisateurs & Privilèges</h2>
            <p className="text-gray-500 font-medium text-sm mt-1">Supervisez la base des assurés de la Caisse et gérez les comptes administrateurs avec droits d\'accès.</p>
          </div>
          
          {activeTab === 'assures' ? (
            <button 
              onClick={handleOpenCreate}
              className="bg-[#008a4b] text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:bg-[#00703c] transition-all flex items-center"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Nouvel Assuré
            </button>
          ) : activeTab === 'admins' ? (
            <button 
              onClick={handleOpenAdminCreate}
              className="bg-amber-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:bg-amber-700 transition-all flex items-center"
            >
              <Shield className="w-5 h-5 mr-2" />
              Créer un Administrateur
            </button>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100/60">
          <div>
            <h3 className="text-lg font-black text-gray-900">
              {activeTab === 'assures' ? "Militaires Assurés" : "Comptes Administrateurs"}
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              {activeTab === 'assures' ? "Gestion de la base de données des assurés titulaires." : "Gestion des rôles et privilèges administratifs."}
            </p>
          </div>
          {activeTab === 'assures' ? (
            <button 
              onClick={handleOpenCreate}
              className="bg-[#008a4b] text-white px-4 py-2.5 rounded-xl font-bold shadow-md hover:bg-[#00703c] text-xs transition-all flex items-center"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Nouvel Assuré
            </button>
          ) : activeTab === 'admins' ? (
            <button 
              onClick={handleOpenAdminCreate}
              className="bg-amber-600 text-white px-4 py-2.5 rounded-xl font-bold shadow-md hover:bg-amber-700 text-xs transition-all flex items-center"
            >
              <Shield className="w-4 h-4 mr-2" />
              Créer un Administrateur
            </button>
          ) : null}
        </div>
      )}

      {/* Tabs list wrapper */}
      {!hideTabs && (
        <div className="flex border-b border-gray-200">
           <button
             onClick={async (e) => { setActiveTab('assures'); setSearchQuery(''); }}
             className={`px-6 py-3.5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
               activeTab === 'assures' 
                 ? 'border-[#008a4b] text-[#008a4b] border-b-3' 
                 : 'border-transparent text-gray-500 hover:text-gray-850'
             }`}
           >
             <UsersIcon className="w-4.5 h-4.5" />
             Base des Assurés ({users.length})
           </button>
           <button
             onClick={async (e) => { setActiveTab('admins'); setSearchQuery(''); }}
             className={`px-6 py-3.5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
               activeTab === 'admins' 
                 ? 'border-amber-600 text-amber-600 border-b-3' 
                 : 'border-transparent text-gray-500 hover:text-gray-850'
             }`}
           >
             <ShieldAlert className="w-4.5 h-4.5 text-amber-550" />
             Administrateurs & Droits ({admins.length})
           </button>
        </div>
      )}

      {activeTab === 'assures' ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100/60"
        >
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
             <div className="flex-1 flex items-center bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-[#008a4b]/20 focus-within:border-[#008a4b] transition-all">
              <Search className="w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Recherche par nom, email ou matricule..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none focus:outline-none ml-3 text-sm font-medium text-gray-900 placeholder-gray-400"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase whitespace-nowrap"><Filter className="w-4 h-4 inline mr-1" /> Corps:</span>
                <select
                  value={corpFilter}
                  onChange={(e) => setCorpFilter(e.target.value as any)}
                  className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#008a4b]/20"
                >
                   <option value="Tous">Tous</option>
                   <option value="Armée de Terre">Armée de Terre</option>
                   <option value="Gendarmerie Nationale">Gendarmerie Nationale</option>
                   <option value="Armée de l'Air">Armée de l'Air</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Statut:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#008a4b]/20"
                >
                   <option value="Tous">Tous les statuts</option>
                   <option value="Actif">Comptes Actifs</option>
                   <option value="Inactif">Comptes Inactifs</option>
                   <option value="En attente">Nouveaux Assurés à Valider</option>
                   <option value="Modif. à Valider">Modifications à Valider</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table for Assurés */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-slate-50/50 rounded-t-xl">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider rounded-tl-xl">Utilisateur & Corps</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Matricule Solde</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">N° Dossier</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Statut Compte</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider rounded-tr-xl">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50 font-medium">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[#008a4b] font-black shadow-inner mr-4">
                            {u.name.charAt(0)}{u.prenoms ? u.prenoms.charAt(0) : ''}
                          </div>
                          <div>
                            <div className="font-extrabold text-gray-900 text-sm uppercase">{u.name} {u.prenoms}</div>
                            <div className="text-xs font-bold text-gray-500 mt-1">{u.corp}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-mono font-black text-[#008a4b] bg-slate-50/30">#{u.matricule}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-gray-700">
                        {u.numDossier ? (
                          <span className="bg-slate-100 px-2 py-1 rounded text-slate-800">{u.numDossier}</span>
                        ) : (
                          <span className="text-gray-400 italic text-[10px]">Non attribué</span>
                        )}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center text-sm font-medium text-gray-600">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {u.email}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.status === 'Actif' ? 'bg-green-50 text-green-700 border border-green-200/50' : 'bg-gray-100 text-gray-700 border border-gray-200/50'}`}>
                            {u.status}
                          </span>
                          {u.statut === 'Modif. à Valider' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-700 border border-amber-200 animate-pulse">
                              MODIF. EN ATTENTE
                            </span>
                          )}
                          {u.statut === 'En attente' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-700 border border-blue-200 animate-pulse">
                              NOUVEAU COMPTE
                            </span>
                          )}
                          {u.statut === 'Validé' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-green-100 text-green-700 border border-green-200">
                              VALIDÉ
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right text-sm">
                        {u.statut === 'Modif. à Valider' && (
                          <button 
                            onClick={async (e) => {
                              setUserToValidate(u);
                              setShowComparisonModal(true);
                            }}
                            className="text-amber-600 bg-amber-50 hover:bg-amber-100 p-2 rounded-lg transition-colors mx-1 font-bold" 
                            title="Voir et Valider les Modifications"
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </button>
                        )}
                        {u.statut === 'En attente' && (
                          <button 
                            onClick={async (e) => {
                              if (confirm(`Voulez-vous valider le compte assuré de ${u.name} ${u.prenoms || ''} ?`)) {
                                const updatedUser = {
                                  ...u,
                                  statut: 'Validé'
                                };
                                const res = await editUser(updatedUser);
                                setUsers(res);
                                alert(`Le compte de ${u.name} a été validé avec succès.`);
                              }
                            }}
                            className="text-green-600 bg-green-50 hover:bg-green-100 p-2 rounded-lg transition-colors mx-1 font-bold animate-bounce" 
                            title="Valider le Nouveau Compte"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleOpenEdit(u)}
                          className="text-blue-600 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors mx-1 font-bold" 
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(u.id)}
                          className="text-red-500 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors mx-1 font-bold" 
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-gray-400 font-semibold">
                      Aucun assuré ne correspond aux termes recherchés.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : activeTab === 'admins' ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100/60"
        >
          {/* Admin Information Alert Box */}
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-3 text-left">
             <Key className="w-5 h-5 mt-0.5 text-amber-600 flex-shrink-0" />
             <div>
                <span className="font-extrabold text-sm block text-amber-855">Sécurité d'Administration CAMA</span>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                   Seuls les profils d'administration habilités peuvent configurer les visuels, actualités ou traiter des dossiers médicaux d'enrôlement. Utilisez ce panneau pour déléguer les habilitations requises.
                </p>
             </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
             <div className="flex-1 flex items-center bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500 transition-all">
              <Search className="w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Rechercher un administrateur par nom ou rôle..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none focus:outline-none ml-3 text-sm font-medium text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Table for Admins */}
          <div className="overflow-x-auto text-left">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-[#fff9f3]/50 rounded-t-xl">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider rounded-tl-xl">Administrateur</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rôle Principal</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Habilitation & Droits d'Accès</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider rounded-tr-xl">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50 font-medium text-sm">
                {filteredAdmins.length > 0 ? (
                  filteredAdmins.map(adm => {
                    const isSuper = adm.role === 'Super Admin';
                    return (
                      <tr key={adm.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-black shadow-inner mr-4 ${
                              isSuper ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-blue-50 text-blue-600 border-blue-200'
                            }`}>
                              {adm.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-extrabold text-gray-900">{adm.name}</div>
                              <div className="text-xs text-gray-500 mt-0.5">{adm.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-extrabold leading-none ${
                            isSuper ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            <Shield className="w-3.5 h-3.5" />
                            {adm.role}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-wrap gap-1.5 max-w-sm">
                             {(adm.permissions || []).map(pKey => {
                               const detail = AVAILABLE_PERMISSIONS.find(ap => ap.id === pKey);
                               return (
                                 <span key={pKey} className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200" title={detail?.desc}>
                                   {detail?.name || pKey}
                                 </span>
                               );
                             })}
                             {(adm.permissions || []).length === 0 && (
                               <span className="text-gray-400 text-xs italic font-semibold">Aucune permission</span>
                             )}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-center text-xs">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${adm.status === 'Actif' ? 'bg-[#e2f7eb] text-[#008a4b]' : 'bg-rose-50 text-rose-650'}`}>
                            {adm.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-right text-sm">
                          <button 
                            onClick={() => handleOpenAdminEdit(adm)}
                            className="text-amber-650 bg-amber-50 hover:bg-amber-100 p-2 rounded-lg transition-colors mx-1 font-bold" 
                            title="Modifier les habilitations"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {adm.id !== 1 && adm.id >= 0 && (
                            <button 
                              onClick={() => handleAdminDelete(adm.id)}
                              className="text-red-500 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors mx-1 font-bold" 
                              title="Révoquer les droits"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-gray-400 font-semibold">
                      Aucun administrateur ne correspond aux critères.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="md:col-span-1 space-y-4">
             <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100/60 text-left">
                <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight flex items-center gap-2 mb-4">
                   <Mail className="w-5 h-5 text-blue-600" />
                   Modèles Disponibles
                </h4>
                <div className="space-y-2">
                   {templates.map(t => (
                      <button
                        key={t.id}
                        onClick={async (e) => { setEditingTemplate(t); setTemplateSubject(t.subject); setTemplateContent(t.content); }}
                        className={`w-full text-left p-3 rounded-xl border transition-all ${
                          editingTemplate?.id === t.id 
                            ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500/10' 
                            : 'bg-slate-50 border-gray-100 hover:bg-white hover:border-blue-200'
                        }`}
                      >
                         <div className="text-xs font-black text-gray-800 uppercase tracking-tight">{t.name}</div>
                         <div className="text-[10px] text-gray-400 font-bold truncate mt-1">{t.subject}</div>
                      </button>
                   ))}
                </div>
             </div>

             <div className="bg-blue-600 p-5 rounded-2xl shadow-lg text-white text-left">
                <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-3">
                   <Activity className="w-4 h-4" />
                   Variables Supportées
                </h4>
                <p className="text-[11px] text-blue-100 leading-relaxed mb-4">
                   Utilisez ces variables dans vos messages pour qu'elles soient automatiquement remplacées par les données réelles de l'assuré.
                </p>
                <div className="flex flex-wrap gap-2">
                   {['{{NOM}}', '{{PRENOM}}', '{{NUM_DOSSIER}}', '{{MOTIF}}'].map(v => (
                      <span key={v} className="bg-white/20 px-2 py-1 rounded text-[10px] font-mono font-bold tracking-wider">{v}</span>
                   ))}
                </div>
             </div>
          </div>

          <div className="md:col-span-2">
             {editingTemplate ? (
                <motion.form 
                  key={editingTemplate.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onSubmit={handleTemplateSave}
                  className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100/60 space-y-6 text-left"
                >
                   <div>
                      <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Configuration : {editingTemplate.name}</h3>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Personnalisez le contenu de cet e-mail automatique</p>
                   </div>

                   <div className="space-y-4">
                      <div>
                         <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Objet de l'e-mail</label>
                         <input 
                           type="text" 
                           required
                           value={templateSubject}
                           onChange={(e) => setTemplateSubject(e.target.value)}
                           className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-gray-800"
                         />
                      </div>

                      <div>
                         <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Corps du message (Contenu)</label>
                         <textarea 
                           required
                           rows={8}
                           value={templateContent}
                           onChange={(e) => setTemplateContent(e.target.value)}
                           className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-gray-700 leading-relaxed"
                         />
                      </div>
                   </div>

                   <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                      <div className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-2">
                         <ShieldCheck className="w-4 h-4 text-blue-500" />
                         Modifications sécurisées
                      </div>
                      <button 
                        type="submit"
                        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                      >
                         <Save className="w-4 h-4" /> Enregistrer le modèle
                      </button>
                   </div>
                </motion.form>
             ) : (
                <div className="h-full flex flex-col items-center justify-center bg-slate-50 border border-dashed border-gray-200 rounded-2xl p-20 text-center">
                   <Mail className="w-16 h-16 text-gray-200 mb-4" />
                   <h4 className="text-gray-400 font-black uppercase tracking-widest">Sélectionnez un modèle à éditer</h4>
                   <p className="text-[10px] text-gray-300 mt-2 max-w-xs mx-auto">Choisissez l'un des modèles de notification à gauche pour personnaliser le message envoyé aux assurés.</p>
                </div>
             )}
          </div>
        </motion.div>
      )}

      {/* MODAL DE COMPARAISON DES MODIFICATIONS DE PROFIL */}
      <AnimatePresence>
        {showComparisonModal && userToValidate && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm text-left overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-gray-100 overflow-hidden my-8 max-h-[90vh] flex flex-col"
            >
              <div className="bg-amber-600 text-white px-6 py-5 flex justify-between items-center flex-shrink-0">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-6 h-6" />
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tight">Validation des Modifications de Profil</h3>
                    <p className="text-xs text-amber-100 font-bold uppercase tracking-widest mt-1">
                      Assuré: {userToValidate.name} (Matricule: {userToValidate.matricule})
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowComparisonModal(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto flex-1 space-y-6">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-800 text-xs font-bold flex gap-3">
                  <Activity className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span>Veuillez examiner les changements demandés par le militaire ci-dessous. Les valeurs en rouge sont les anciennes, et celles en vert sont les nouvelles valeurs proposées.</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2 flex items-center gap-2">
                       <RotateCcw className="w-3.5 h-3.5" /> État Actuel du Profil
                    </h4>
                    <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                       {Object.keys(userToValidate.pendingModifications || {}).map(key => (
                         <div key={key}>
                            <p className="text-[9px] font-bold text-gray-400 uppercase">{key}</p>
                            <p className="text-sm font-bold text-red-600 line-through">{(userToValidate as any)[key] || '—'}</p>
                         </div>
                       ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-[#008a4b] uppercase tracking-widest border-b border-green-100 pb-2 flex items-center gap-2">
                       <CheckCircle className="w-3.5 h-3.5" /> Nouvelles Valeurs Proposées
                    </h4>
                    <div className="space-y-3 bg-green-50/30 p-4 rounded-xl border border-green-100">
                       {Object.entries(userToValidate.pendingModifications || {}).map(([key, value]) => (
                         <div key={key}>
                            <p className="text-[9px] font-bold text-gray-400 uppercase">{key}</p>
                            <p className="text-sm font-bold text-green-700">{String(value) || '—'}</p>
                         </div>
                       ))}
                    </div>
                  </div>
                </div>

                {userToValidate.modificationTraces && userToValidate.modificationTraces.length > 0 && (
                  <div className="mt-8">
                     <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                       <History className="w-3.5 h-3.5" /> Historique des traces de modification
                    </h4>
                    <div className="space-y-2">
                       {userToValidate.modificationTraces.map(trace => (
                         <div key={trace.id} className="text-[10px] bg-slate-50 p-2 rounded border border-slate-100 flex justify-between">
                            <span className="font-bold text-gray-600"><span className="text-gray-400 uppercase mr-1">{trace.field}:</span> {trace.oldValue} ➔ {trace.newValue}</span>
                            <span className="text-gray-400 font-mono">{trace.date}</span>
                         </div>
                       ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 px-8 py-5 flex flex-col sm:flex-row gap-3 justify-end border-t border-gray-100 flex-shrink-0">
                <button 
                  onClick={() => handleRejectModifications(userToValidate)}
                  className="px-6 py-2.5 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-600 hover:text-white font-black text-xs rounded-xl transition-all uppercase tracking-wider"
                >
                  Rejeter les modifications
                </button>
                <button 
                  onClick={() => handleApproveModifications(userToValidate)}
                  className="px-6 py-2.5 bg-[#008a4b] text-white hover:bg-[#00703c] font-black text-xs rounded-xl shadow-lg transition-all uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Approuver & Mettre à jour
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ASSURÉS MODAL */}
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
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-250/20 max-h-[90vh] flex flex-col"
            >
              <div className="bg-gradient-to-r from-[#008a4b] to-[#015e34] text-white px-8 py-6 flex justify-between items-center border-b border-[#008a4b]/20 flex-shrink-0">
                <div>
                  <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                     <UsersIcon className="w-5.5 h-5.5 text-yellow-400" />
                     {editingUser ? "Modifier le Profil de l'Assuré" : "Enregistrer un Nouvel Assuré CAMA"}
                  </h3>
                  <p className="text-xs text-green-100/80 mt-1 font-medium">Saisissez les informations officielles pour la mise à jour des droits de prise en charge.</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 px-3 rounded-full text-white/90 hover:text-white bg-white/10 hover:bg-white/20 font-black text-sm transition-colors cursor-pointer"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSave} className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Nom de famille *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: SOME"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#008a4b]/20 focus:border-[#008a4b] font-bold text-gray-800 uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Prénom(s) *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Gildas K."
                      value={formPrenoms}
                      onChange={(e) => setFormPrenoms(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#008a4b]/20 focus:border-[#008a4b] font-bold text-gray-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Matricule Solde / Id</label>
                     <input 
                       type="text" 
                       required
                       placeholder="Ex: M-9983"
                       value={formMatricule}
                       onChange={(e) => setFormMatricule(e.target.value)}
                       className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#008a4b]/20 focus:border-[#008a4b] font-bold"
                     />
                  </div>
                  
                  <div>
                     <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Corps Militaire</label>
                     <select 
                       value={formCorp}
                       onChange={(e) => setFormCorp(e.target.value)}
                       className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#008a4b]/20 focus:border-[#008a4b] font-bold text-gray-700 bg-white"
                     >
                        <option value="Armée de Terre">Armée de Terre</option>
                        <option value="Gendarmerie Nationale">Gendarmerie Nationale</option>
                        <option value="Armée de l'Air">Armée de l'Air</option>
                        <option value="Santé Militaire">Santé Militaire</option>
                     </select>
                  </div>
                </div>

                <div>
                   <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Adresse E-mail Officielle</label>
                   <input 
                     type="email" 
                     required
                     placeholder="Ex: g.some@armee.bf"
                     value={formEmail}
                     onChange={(e) => setFormEmail(e.target.value)}
                     className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#008a4b]/20 focus:border-[#008a4b]"
                   />
                </div>

                <div>
                   <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Statut du compte souscripteur</label>
                   <div className="flex gap-4 mt-1 border border-gray-200 rounded-lg p-2.5 bg-slate-50">
                      <label className="flex items-center text-sm font-bold text-gray-700 cursor-pointer select-none">
                        <input 
                          type="radio" 
                          name="status" 
                          checked={formStatus === 'Actif'}
                          onChange={() => setFormStatus('Actif')}
                          className="w-4 h-4 text-[#008a4b] focus:ring-[#008a4b] mr-1.5"
                        />
                        Actif (Reconnu)
                      </label>
                      <label className="flex items-center text-sm font-bold text-gray-700 cursor-pointer select-none">
                        <input 
                          type="radio" 
                          name="status" 
                          checked={formStatus === 'Inactif'}
                          onChange={() => setFormStatus('Inactif')}
                          className="w-4 h-4 text-[#008a4b] focus:ring-[#008a4b] mr-1.5"
                        />
                        Inactif (Suspendu)
                      </label>
                   </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="bg-[#008a4b]/5 p-5 rounded-2xl border border-[#008a4b]/10">
                    <h4 className="text-sm font-black text-[#008a4b] uppercase tracking-tight flex items-center gap-2 mb-4">
                      <ShieldCheck className="w-5 h-5" />
                      Numéro de Dossier Unique (CAMA ID)
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Identifiant de dossier officiel</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Ex: CAMA-2026-BF-001"
                            value={formNumDossier}
                            onChange={(e) => setFormNumDossier(e.target.value)}
                            className="w-full px-4 py-2.5 border border-[#008a4b]/30 rounded-lg outline-none focus:ring-2 focus:ring-[#008a4b]/20 focus:border-[#008a4b] font-black text-[#008a4b] tracking-wider uppercase"
                          />
                          <button
                            type="button"
                            onClick={generateDossierId}
                            className="bg-[#008a4b]/10 text-[#008a4b] hover:bg-[#008a4b]/20 px-4 rounded-lg font-bold flex items-center gap-2 whitespace-nowrap transition-colors"
                          >
                            <Wand2 className="w-4 h-4" />
                            Générer
                          </button>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1.5 italic">Cet identifiant est unique et sera affiché sur toutes les fiches de prise en charge de l'assuré.</p>
                      </div>

                      {editingUser && formNumDossier !== (editingUser.numDossier || '') && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="bg-amber-50 border border-amber-200 p-4 rounded-xl"
                        >
                          <label className="block text-[10px] font-black text-amber-800 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5" /> Motif de la modification (Obligatoire)
                          </label>
                          <textarea 
                            required
                            rows={2}
                            placeholder="Justifiez le changement du numéro de dossier (ex: Erreur de saisie, Nouveau format...)"
                            value={formJustification}
                            onChange={(e) => setFormJustification(e.target.value)}
                            className="w-full px-3 py-2 border border-amber-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs font-bold text-amber-900 bg-white"
                          />
                        </motion.div>
                      )}

                      {editingUser && editingUser.numDossierHistory && editingUser.numDossierHistory.length > 0 && (
                        <div>
                          <button 
                            type="button"
                            onClick={() => setShowHistory(!showHistory)}
                            className="text-[10px] font-black text-[#008a4b] uppercase tracking-widest hover:underline flex items-center gap-1"
                          >
                            <Activity className="w-3.5 h-3.5" /> {showHistory ? "Masquer l'historique" : "Voir l'historique des modifications"}
                          </button>
                          
                          <AnimatePresence>
                            {showHistory && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-3 space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2"
                              >
                                {editingUser.numDossierHistory.slice().reverse().map((h, i) => (
                                  <div key={i} className="bg-white border border-gray-100 p-2.5 rounded-lg text-[9px] shadow-sm">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="font-black text-gray-400">{h.date}</span>
                                      <span className="bg-slate-100 px-1.5 py-0.5 rounded text-gray-500 font-bold uppercase">{h.author}</span>
                                    </div>
                                    <div className="font-bold text-gray-700 mb-1">
                                      {h.oldValue} ➔ <span className="text-[#008a4b]">{h.newValue}</span>
                                    </div>
                                    <div className="text-gray-400 italic">Motif: {h.reason}</div>
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end gap-2 text-left">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 bg-[#008a4b] font-bold text-white rounded-lg hover:bg-[#00703c] transition flex items-center shadow"
                  >
                    <Save className="w-4 h-4 mr-1.5" /> Enregistrer
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADMINISTRATEUR MODAL */}
      <AnimatePresence>
        {isAdminModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm text-left overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-amber-500/10 my-8 max-h-[90vh] flex flex-col"
            >
              <div className="bg-gradient-to-r from-amber-600 to-amber-800 text-white px-8 py-6 flex justify-between items-center border-b border-amber-500/25 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-yellow-300" />
                  <div>
                    <h3 className="text-xl font-black tracking-tight">
                       {editingAdmin ? "Modifier le Rôle de l'Administrateur" : "Créer un Nouvel Administrateur"}
                    </h3>
                    <p className="text-xs text-amber-100/80 mt-1 font-medium">Assignez les habilitation granulaires d'accès aux rubriques clés du back office.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAdminModalOpen(false)}
                  className="p-1 px-2.5 rounded-full text-white/80 hover:text-white bg-white/10 hover:bg-white/20 font-bold cursor-pointer"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleAdminSave} className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                <div>
                   <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Nom Complet / Grade & Fonction</label>
                   <input 
                     type="text" 
                     required
                     placeholder="Ex: Colonel Commandant Sanou"
                     value={adminName}
                     onChange={(e) => setAdminName(e.target.value)}
                     className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-bold text-gray-800"
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Adresse E-mail Militaire</label>
                     <input 
                       type="email" 
                       required
                       placeholder="Ex: sanou@cama.bf"
                       value={adminEmail}
                       onChange={(e) => setAdminEmail(e.target.value)}
                       className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-semibold text-gray-800"
                     />
                     <span className="text-[10px] text-gray-500 mt-1 block">Sert d'identifiant de connexion</span>
                  </div>
                  
                  <div>
                     <label className="block text-xs font-bold text-gray-650 uppercase mb-1">Rôle Principal</label>
                     <select 
                       value={adminRole}
                       onChange={(e) => handleRoleChange(e.target.value as any)}
                       className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-bold text-gray-700 bg-white"
                     >
                        <option value="Super Admin">Super Admin</option>
                        <option value="Gestionnaire Dossiers">Gestionnaire Dossiers</option>
                        <option value="Éditeur Actualités">Éditeur Actualités</option>
                        <option value="Responsable Réseau">Responsable Réseau</option>
                     </select>
                     <span className="text-[10px] text-[#008a4b] mt-1 block font-bold">Auto-configure les permissions suggérées !</span>
                  </div>
                </div>

                <div>
                   <label className="block text-xs font-bold text-gray-650 uppercase mb-1">Statut du Compte Admin</label>
                   <div className="flex gap-4 mt-1 border border-gray-200 rounded-lg p-2.5 bg-slate-50">
                      <label className="flex items-center text-sm font-bold text-gray-750 cursor-pointer select-none">
                        <input 
                          type="radio" 
                          name="admin_status" 
                          checked={adminStatus === 'Actif'}
                          onChange={() => setAdminStatus('Actif')}
                          className="w-4 h-4 text-amber-600 focus:ring-amber-500 mr-1.5"
                        />
                        Actif (Accès Autorisé)
                      </label>
                      <label className="flex items-center text-sm font-bold text-gray-750 cursor-pointer select-none">
                        <input 
                          type="radio" 
                          name="admin_status" 
                          checked={adminStatus === 'Inactif'}
                          onChange={() => setAdminStatus('Inactif')}
                          className="w-4 h-4 text-amber-600 focus:ring-amber-500 mr-1.5"
                        />
                        Inactif / Révocat (Accès Bloqué)
                      </label>
                   </div>
                </div>

                {/* Permissions Segment */}
                <div>
                   <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Droits Granulaires & Habilitations</label>
                   <div className="bg-slate-50 border border-gray-200 rounded-xl p-4 space-y-3 max-h-60 overflow-y-auto">
                     {AVAILABLE_PERMISSIONS.map(p => {
                       const isChecked = adminPermissions.includes(p.id);
                       return (
                         <div 
                           key={p.id} 
                           onClick={() => togglePermission(p.id)}
                           className="flex items-start gap-4 p-2 rounded-lg hover:bg-white cursor-pointer transition text-left"
                         >
                           <button type="button" className="mt-0.5 text-[#008a4b] flex-shrink-0">
                             {isChecked ? (
                               <CheckSquare className="w-5 h-5 text-amber-650" />
                             ) : (
                               <Square className="w-5 h-5 text-gray-300" />
                             )}
                           </button>
                           <div>
                              <div className="text-xs font-extrabold text-gray-900">{p.name}</div>
                              <p className="text-[10px] text-gray-500 mt-0.5 leading-normal">{p.desc}</p>
                           </div>
                         </div>
                       );
                     })}
                   </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end gap-2 text-left">
                  <button 
                    type="button" 
                    onClick={() => setIsAdminModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 bg-amber-600 font-bold text-white rounded-lg hover:bg-amber-700 transition flex items-center shadow"
                  >
                    <Save className="w-4 h-4 mr-1.5" /> Enregistrer les Droits
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
