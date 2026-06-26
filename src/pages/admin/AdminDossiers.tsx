import React, { useState, useMemo, useRef, Fragment, useEffect } from 'react';
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Download, 
  Clock, 
  Eye, 
  X, 
  ShieldAlert, 
  ShieldCheck,
  Plus, 
  Edit3, 
  Trash2, 
  Upload, 
  Trash, 
  Check, 
  FileUp, 
  Calendar, 
  UserPlus,
  Mail,
  Sparkles,
  RotateCcw,
  History,
  FileCheck2,
  User,
  MapPin,
  Smartphone,
  Briefcase,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AdminUsers from './AdminUsers';
import { 
  getRequests, 
  updateRequestStatus, 
  Request, 
  addRequest, 
  editRequest, 
  deleteRequest,
  getSiteSettings, DEFAULT_SITE_SETTINGS,
  getUsers
} from '../../lib/dataStore';

const isPdf = (src: string | null | undefined): boolean => {
  return typeof src === 'string' && src.startsWith('data:application/pdf');
};

const getFilesList = (val: string | null | undefined): string[] => {
  if (!val) return [];
  if (val.startsWith('[') && val.endsWith(']')) {
    try {
      return JSON.parse(val);
    } catch (e) {
      return [val];
    }
  }
  return [val];
};

export default function AdminDossiers() {
  const [activePageTab, setActivePageTab] = useState<'requests' | 'assures'>('assures');
  const [requests, setRequests] = useState<Request[]>([]);
  useEffect(() => { getRequests().then(setRequests); }, []);
  const [users, setUsers] = useState<any[]>([]);
  useEffect(() => { getUsers().then(setUsers); }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Tous' | 'En attente' | 'Validé' | 'Rejeté' | 'Modif. à Valider'>('Tous');
  
  // Modals state
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [isFIFModalOpen, setIsFIFModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<Request | null>(null);

  // Subscriber Info State
  const [isSubscriberModalOpen, setIsSubscriberModalOpen] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState<any>(null);

  // Form Fields State
  const [formAssure, setFormAssure] = useState('');
  const [formMatricule, setFormMatricule] = useState('');
  const [formMembre, setFormMembre] = useState('');
  const [formPrenoms, setFormPrenoms] = useState('');
  const [formSexe, setFormSexe] = useState<'M' | 'F'>('M');
  const [formDateNaissance, setFormDateNaissance] = useState('');
  const [formLieuNaissance, setFormLieuNaissance] = useState('');
  const [formGs, setFormGs] = useState('');
  const [formMotherName, setFormMotherName] = useState('');
  const [formProfession, setFormProfession] = useState('');
  const [formResidence, setFormResidence] = useState('');
  const [formTelephone, setFormTelephone] = useState('');
  const [formRefIdentityDoc, setFormRefIdentityDoc] = useState('');
  const [formRefMarriageCertificate, setFormRefMarriageCertificate] = useState('');
  const [formRefScolariteDoc, setFormRefScolariteDoc] = useState('');
  const [formLien, setFormLien] = useState('Enfant');
  const [formStatut, setFormStatut] = useState<'En attente' | 'Validé' | 'Rejeté' | 'Modif. à Valider'>('En attente');
  const [formNumInformatique, setFormNumInformatique] = useState('');
  const [formNumCama, setFormNumCama] = useState('');
  const [formDocumentImage, setFormDocumentImage] = useState<string>('');
  const [formRejectionReason, setFormRejectionReason] = useState('');

  // Drag and Drop State
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation feedback
  const [formError, setFormError] = useState('');

  // Missing Piece modal state
  const [isMissingPieceModalOpen, setIsMissingPieceModalOpen] = useState(false);
  const [missingPieceRequest, setMissingPieceRequest] = useState<Request | null>(null);
  const [selectedMissingPiece, setSelectedMissingPiece] = useState('Acte de naissance');
  const [customMissingNote, setCustomMissingNote] = useState('');

  // Simulated Email logs
  const [emailLogs, setEmailLogs] = useState<any[]>(() => {
    const saved = localStorage.getItem('cama_email_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore and fall through
      }
    }
    return [
      { id: 'em-1', recipient: 'i.kabore@defense.bf', subject: 'CAMA - Demande de pièces complémentaires', content: 'Votre dossier d’enrôlement pour KABORE Alimata requiert une pièce complémentaire: Acte de mariage légalisé ou certifié.', date: '21 Juin 2026 à 10:45', status: 'sent' },
      { id: 'em-2', recipient: 'y.diallo@defense.bf', subject: 'CAMA - Validation de dossier d’ayant droit', content: 'Bonne nouvelle ! Le dossier de DIALLO Oumar a été validé. Votre numéro de carte CAMA attribué est CM-2026-BF-1092.', date: '20 Juin 2026 à 15:30', status: 'sent' }
    ];
  });

  const saveEmailLogs = (newLogs: any[]) => {
    setEmailLogs(newLogs);
    localStorage.setItem('cama_email_logs', JSON.stringify(newLogs));
  };

  const sendSimulatedEmail = (recipient: string, subject: string, content: string) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) + ' à ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const newLog = {
      id: `em-${Math.floor(1000 + Math.random() * 9000)}`,
      recipient,
      subject,
      content,
      date: dateStr,
      status: 'sent'
    };
    saveEmailLogs([newLog, ...emailLogs]);
  };

  const parseNotificationTemplate = (template: string, req: Request, reason?: string) => {
    if (!template) return '';
    return template
      .replace(/{nom_assure}/g, req.assure)
      .replace(/{prenom_assure}/g, req.prenoms || '')
      .replace(/{num_dossier}/g, req.id)
      .replace(/{statut_dossier}/g, req.statut)
      .replace(/{num_cama}/g, req.numCama || 'CM-XXXX')
      .replace(/{date_soumission}/g, req.date)
      .replace(/{motif}/g, reason || 'Non précisé');
  };

  const handleOpenSubscriberInfo = async (matricule: string) => {
    const users = await getUsers();
    const user = users?.find(u => u.matricule === matricule);
    if (user) {
      setSelectedSubscriber(user);
      setIsSubscriberModalOpen(true);
    } else {
      alert("Informations du souscripteur non trouvées.");
    }
  };

  const handleValidate = async (id: string, newStatut: 'Validé' | 'Rejeté', reason?: string) => {
    const updated = await updateRequestStatus(id, newStatut);
    
    // Auto-generate CAMA card number on manual validation if none exists
    const finalRequests = updated.map(r => {
      if (r.id === id && newStatut === 'Validé' && !r.numCama) {
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        return { ...r, numCama: `CM-2026-BF-${randomSuffix}` };
      }
      return r;
    });

    if (newStatut === 'Validé') {
      // Save updated list with generated CAMA card
      for (const r of finalRequests) {
        if (r.id === id) await editRequest(r);
      }
    }

    const req = finalRequests.find(r => r.id === id);
    if (req) {
      const settings = await getSiteSettings();
      const templates = settings.notificationTemplates;
      
      const email = `${req.assure.toLowerCase().replace(/\s+/g, '.')}@defense.bf`;
      
      let subject = `CAMA - ${newStatut === 'Validé' ? 'Approbation' : 'Rejet'} de votre dossier d'enrôlement (#${id})`;
      let content = newStatut === 'Validé' 
        ? `Cher militaire ${req.assure},\n\nNous vous informons que le dossier d'enrôlement FIF pour votre ayant droit ${req.membre} ${req.prenoms || ''} (${req.lien}) a été validé avec succès par la Direction Administrative de la CAMA.\n\nVotre numéro de carte CAMA définitif est : ${req.numCama || 'CM-2026-BF-8812'}.\n\nPrise en charge active dès aujourd'hui.`
        : `Cher militaire ${req.assure},\n\nNous regrettons de vous informer que le dossier d'enrôlement pour ${req.membre} ${req.prenoms || ''} (${req.lien}) a été rejeté.\n\nMotif du rejet : ${reason || 'Pièce justificative non conforme ou illisible.'}\n\nVeuillez soumettre à nouveau le dossier sur votre tableau de bord avec les justificatifs demandés.`;

      // Use templates if configured
      if (newStatut === 'Validé' && templates?.dossierValidated) {
        subject = parseNotificationTemplate(templates.dossierValidated.subject, req, reason);
        content = parseNotificationTemplate(templates.dossierValidated.body, req, reason);
      } else if (newStatut === 'Rejeté' && templates?.dossierRejected) {
        subject = parseNotificationTemplate(templates.dossierRejected.subject, req, reason);
        content = parseNotificationTemplate(templates.dossierRejected.body, req, reason);
      }
      
      sendSimulatedEmail(email, subject, content);
    }

    setRequests(finalRequests);
    alert(`Dossier ${newStatut === 'Validé' ? 'validé' : 'rejeté'} avec succès. Un e-mail de notification officiel a été simulé et envoyé à l'utilisateur.`);
  };

  // Delete handler
  const handleDeleteRequest = (id: string) => {
    if (confirm("Voulez-vous vraiment supprimer ce dossier d'enrôlement ?")) {
      deleteRequest(id).then(setRequests);
      if (selectedRequest?.id === id) {
        setSelectedRequest(null);
      }
    }
  };

  // Auto-validation function using FIF guidelines
  const handleAutoValidation = () => {
    let count = 0;
    const updatedRequests = ((requests as any) || []).map(req => {
      if (req.statut !== 'En attente') return req;

      // Calculate age from date of birth
      const age = req.dateNaissance ? (new Date().getFullYear() - new Date(req.dateNaissance).getFullYear()) : 0;
      let isValid = false;

      const hasDoc = req.justificatif || req.documentImage;

      if (req.lien === 'Conjoint') {
        // Conjoint needs marriage cert reference and identity document and justificatif
        if (req.refMarriageCertificate && req.refIdentityDoc && hasDoc) {
          isValid = true;
        }
      } else if (req.lien === 'Enfant') {
        if (age <= 26) {
          if (age > 21) {
            // Over 21 needs school cert reference and justificatif
            if (req.refScolariteDoc && hasDoc) {
              isValid = true;
            }
          } else if (age > 15) {
            // Over 15 needs identity document reference and justificatif
            if (req.refIdentityDoc && hasDoc) {
              isValid = true;
            }
          } else {
            // Under 15 just needs birth certificate file
            if (hasDoc) {
              isValid = true;
            }
          }
        }
      } else {
        // Parents / Others need document
        if (hasDoc) {
          isValid = true;
        }
      }

      if (isValid) {
        count++;
        // Generate automatic CAMA card number
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const finalCamaNum = req.numCama || `CM-2026-BF-${randomSuffix}`;
        
        const validatedReq = {
          ...req,
          statut: 'Validé' as const,
          numCama: finalCamaNum
        };

        // Send confirmation email
        const email = `${req.assure.toLowerCase().replace(/\s+/g, '.')}@defense.bf`;
        const subject = `CAMA - [AUTO-APPROBATION] Validation automatique de dossier d'enrôlement (#${req.id})`;
        const content = `Cher militaire ${req.assure},\n\nFélicitations ! Notre système de contrôle de conformité des pièces d'état civil de la CAMA a validé automatiquement votre dossier d'ayant droit pour ${req.membre} ${req.prenoms || ''} (${req.lien}).\n\nVotre numéro de carte CAMA définitif est : ${finalCamaNum}.\n\nVous pouvez désormais bénéficier des soins et prestations de santé.`;
        
        // We delay simulated sending very slightly
        sendSimulatedEmail(email, subject, content);
        return validatedReq;
      }

      return req;
    });

    if (count > 0) {
      updatedRequests.forEach(req => {
        editRequest(req);
      });
      setRequests(updatedRequests);
      alert(`${count} dossier(s) en attente ont été validés automatiquement après vérification de leur conformité administrative (références d'acte d'état civil, certificat scolaire et pièces justificatives présents).`);
    } else {
      alert("Aucun dossier en attente ne remplit les conditions de conformité automatique (il manque des pièces d'identité pour les enfants de +15 ans, certificat scolaire pour les +21 ans, ou justificatifs téléversés).");
    }
  };

  const handleDownloadDocument = (req: Request) => {
    const docData = req.justificatif || req.documentImage;
    if (docData) {
      const link = document.createElement("a");
      link.href = docData;
      link.download = `CAMA_Justificatif_${req.membre}_${req.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const content = `
=============================================
             MINISTÈRE DE LA DÉFENSE
              C.A.M.A. BURKINA FASO
=============================================
EXTRAIT D'ACTE D'ÉTAT CIVIL SIMULÉ (#${req.id})
Lien: ${req.lien}
Militaire titulaire: ${req.assure} (${req.matricule})
Bénéficiaire: ${req.membre} ${req.prenoms || ''}
Sexe: ${req.sexe || 'M'}
Date de Naissance: ${req.dateNaissance || '—'}
N° Informatique: ${req.numInformatique || '—'}
---------------------------------------------
Vérifié conforme et archivé de façon sécurisée
CAMA SECURED ENROLLMENT ARCHIVE SYSTEM
=============================================
      `;
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `CAMA_Certificat_Simule_${req.membre}_${req.id}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleDeleteDocument = (req: Request) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la pièce justificative d'état civil pour ${req.membre}? Cette action est irréversible.`)) {
      const updatedReq = { ...req, justificatif: '', documentImage: '' };
      editRequest(updatedReq).then(setRequests);
      setSelectedRequest(null);
      alert("La pièce justificative a été supprimée avec succès.");
    }
  };

  const handleOpenMissingPieceModal = (req: Request) => {
    setMissingPieceRequest(req);
    setSelectedMissingPiece(req.lien === 'Conjoint' ? 'Acte de mariage' : 'Acte de naissance');
    setCustomMissingNote('');
    setIsMissingPieceModalOpen(true);
  };

  const handleSendMissingPieceEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!missingPieceRequest) return;

    const email = `${missingPieceRequest.assure.toLowerCase().replace(/\s+/g, '.')}@defense.bf`;
    let subject = `CAMA - Action requise : Pièce manquante pour l'enrôlement (#${missingPieceRequest.id})`;
    let content = `Cher militaire ${missingPieceRequest.assure},\n\nLors de l'examen de votre dossier d'enrôlement pour ${missingPieceRequest.membre} ${missingPieceRequest.prenoms || ''} (${missingPieceRequest.lien}), nos agents ont constaté qu'une pièce justificative est manquante ou non conforme.\n\nDocument requis : ${selectedMissingPiece}\n\nNote de l'agent : ${customMissingNote || 'Veuillez nous transmettre une copie lisible de cette pièce dans les plus brefs délais.'}\n\nVous pouvez téléverser ce justificatif en vous connectant sur votre Tableau de Bord CAMA.`;

    try {
      const settings = await getSiteSettings();
      const templates = settings.notificationTemplates;
      if (templates?.dossierRejected) {
        const reason = `Document requis: ${selectedMissingPiece}. Note: ${customMissingNote || 'Veuillez transmettre une copie lisible.'}`;
        subject = parseNotificationTemplate(templates.dossierRejected.subject, missingPieceRequest, reason);
        content = parseNotificationTemplate(templates.dossierRejected.body, missingPieceRequest, reason);
      }
    } catch (err) {
      console.error("Error fetching site settings for missing piece email:", err);
    }

    sendSimulatedEmail(email, subject, content);
    setIsMissingPieceModalOpen(false);
    alert(`E-mail de notification pour pièce manquante (${selectedMissingPiece}) envoyé avec succès à ${email}.`);
  };

  // Filter requests dynamically
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const matchQuery = 
        req.assure.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.membre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.matricule.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.id.includes(searchQuery);
      
    const matchStatus = statusFilter === 'Tous' || req.statut === statusFilter;
      
      return matchQuery && matchStatus;
    });
  }, [requests, searchQuery, statusFilter]);

  // Group requests by subscriber for a "Single Dossier" philosophy
  const groupedDossiers = useMemo(() => {
    const groups: { [key: string]: { subscriber: string, matricule: string, numDossier?: string, requests: Request[] } } = {};
    
    filteredRequests.forEach(req => {
      const key = req.matricule;
      if (!groups[key]) {
        const user = users?.find(u => u.matricule === req.matricule);
        groups[key] = {
          subscriber: req.assure,
          matricule: req.matricule,
          numDossier: user?.numDossier,
          requests: []
        };
      }
      groups[key].requests.push(req);
    });
    
    return Object.values(groups);
  }, [filteredRequests, users]);

  const [expandedDossiers, setExpandedDossiers] = useState<Set<string>>(new Set());

  const toggleDossier = (matricule: string) => {
    const newSet = new Set(expandedDossiers);
    if (newSet.has(matricule)) {
      newSet.delete(matricule);
    } else {
      newSet.add(matricule);
    }
    setExpandedDossiers(newSet);
  };

  // Export CSV helper
  const handleExportCSV = () => {
    const headers = ['ID Dossier', 'Souscripteur', 'Matricule', 'Nom Membre', 'Prénoms', 'Sexe', 'Naissance', 'Relation', 'N° Informatique', 'N° CAMA', 'Date Demande', 'Statut'];
    const csvRows = [headers.join(',')];
    
    filteredRequests.forEach(req => {
      const values = [
        `#${req.id}`,
        `"${req.assure}"`,
        `"${req.matricule}"`,
        `"${req.membre}"`,
        `"${req.prenoms || ''}"`,
        `"${req.sexe || ''}"`,
        `"${req.dateNaissance || ''}"`,
        `"${req.lien}"`,
        `"${req.numInformatique || ''}"`,
        `"${req.numCama || ''}"`,
        `"${req.date}"`,
        `"${req.statut}"`
      ];
      csvRows.push(values.join(','));
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CAMA_Dossiers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open Form Modal for Addition
  const handleOpenAddModal = () => {
    setEditingRequest(null);
    setFormAssure('');
    setFormMatricule('');
    setFormMembre('');
    setFormPrenoms('');
    setFormSexe('M');
    setFormDateNaissance('');
    setFormLieuNaissance('');
    setFormGs('');
    setFormMotherName('');
    setFormProfession('');
    setFormResidence('');
    setFormTelephone('');
    setFormRefIdentityDoc('');
    setFormRefMarriageCertificate('');
    setFormRefScolariteDoc('');
    setFormLien('Enfant');
    setFormStatut('En attente');
    setFormNumInformatique('');
    setFormNumCama('');
    setFormDocumentImage('');
    setFormError('');
    setIsFormModalOpen(true);
  };

  // Open Form Modal for Editing
  const handleOpenEditModal = (req: Request) => {
    setEditingRequest(req);
    setFormAssure(req.assure);
    setFormMatricule(req.matricule);
    setFormMembre(req.membre);
    setFormPrenoms(req.prenoms || '');
    setFormSexe(req.sexe || 'M');
    setFormDateNaissance(req.dateNaissance || '');
    setFormLieuNaissance(req.lieuNaissance || '');
    setFormGs(req.gs || '');
    setFormMotherName(req.motherName || '');
    setFormProfession(req.profession || '');
    setFormResidence(req.residence || '');
    setFormTelephone(req.telephone || '');
    setFormRefIdentityDoc(req.refIdentityDoc || '');
    setFormRefMarriageCertificate(req.refMarriageCertificate || '');
    setFormRefScolariteDoc(req.refScolariteDoc || '');
    setFormLien(req.lien);
    setFormStatut(req.statut);
    setFormNumInformatique(req.numInformatique || '');
    setFormNumCama(req.numCama || '');
    setFormDocumentImage(req.documentImage || '');
    setFormError('');
    setIsFormModalOpen(true);
  };

  // Save/Publish edits or new folder
  const handleSaveRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAssure.trim() || !formMatricule.trim() || !formMembre.trim() || !formPrenoms.trim()) {
      setFormError('Veuillez remplir tous les champs obligatoires (*).');
      return;
    }

    if (formTelephone) {
      const phoneRegex = /^\+?[0-9\s\-()]{8,20}$/;
      if (!phoneRegex.test(formTelephone)) {
        setFormError("Erreur : Le numéro de téléphone de contact n'est pas valide (minimum 8 chiffres, ex: +226 70 00 11 22).");
        return;
      }
    }

    if (editingRequest) {
      // Trace calculation
      const newValues: any = {
        assure: formAssure,
        matricule: formMatricule,
        membre: formMembre,
        prenoms: formPrenoms,
        sexe: formSexe,
        dateNaissance: formDateNaissance,
        lieuNaissance: formLieuNaissance,
        gs: formGs,
        motherName: formMotherName,
        profession: formProfession,
        residence: formResidence,
        telephone: formTelephone,
        refIdentityDoc: formRefIdentityDoc,
        refMarriageCertificate: formRefMarriageCertificate,
        refScolariteDoc: formRefScolariteDoc,
        lien: formLien,
        statut: formStatut,
        numInformatique: formNumInformatique,
        numCama: formNumCama,
        documentImage: formDocumentImage
      };

      const traces: any[] = editingRequest.modificationTraces || [];
      const now = new Date().toLocaleString('fr-FR');
      const author = "Admin (Back-office)";

      Object.keys(newValues).forEach(key => {
        const oldVal = (editingRequest as any)[key] || '';
        const newVal = newValues[key] || '';
        if (oldVal !== newVal) {
          traces.push({
            id: `tr-${Math.random().toString(36).substr(2, 9)}`,
            field: key,
            oldValue: String(oldVal),
            newValue: String(newVal),
            date: now,
            author
          });
        }
      });

      // Edit mode
      const updatedReq: Request = {
        ...editingRequest,
        ...newValues,
        modificationTraces: traces
      };
      editRequest(updatedReq).then(setRequests);
    } else {
      // Add mode
      const newReq = {
        assure: formAssure,
        matricule: formMatricule,
        membre: formMembre,
        prenoms: formPrenoms,
        sexe: formSexe,
        dateNaissance: formDateNaissance,
        lieuNaissance: formLieuNaissance,
        gs: formGs,
        motherName: formMotherName,
        profession: formProfession,
        residence: formResidence,
        telephone: formTelephone,
        refIdentityDoc: formRefIdentityDoc,
        refMarriageCertificate: formRefMarriageCertificate,
        refScolariteDoc: formRefScolariteDoc,
        lien: formLien,
        statut: formStatut,
        numInformatique: formNumInformatique,
        numCama: formNumCama,
        documentImage: formDocumentImage
      };
      addRequest(newReq).then(setRequests);
    }

    setIsFormModalOpen(false);
  };

  // Handle Drag & Drop operations
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

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("Ce portail accepte uniquement les fichiers d'images (JPEG, PNG, WebP) pour l'acte d'état civil.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormDocumentImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header with Title and Page Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/60 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dossiers & Assurés</h2>
          <p className="text-slate-500 font-medium text-xs mt-1">Gérez et validez les dossiers d'enrôlement ou consultez la base officielle des assurés de la Caisse.</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-200/60 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/40">
          <button
            onClick={() => { setActivePageTab('assures'); setSearchQuery(''); }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activePageTab === 'assures'
                ? 'bg-white text-[#008a4b] shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            Base des Assurés ({users.length})
          </button>
          <button
            onClick={() => { setActivePageTab('requests'); setSearchQuery(''); }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activePageTab === 'requests'
                ? 'bg-white text-[#008a4b] shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Dossiers d'Enrôlement ({requests.length})
          </button>
        </div>
      </div>

      {activePageTab === 'assures' ? (
        <AdminUsers initialTab="assures" hideTabs={true} />
      ) : (
        <>
          {/* Top Bar Navigation Additions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100/60">
            <div className="flex items-center w-full md:w-[350px] bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 transition-all focus-within:ring-2 focus-within:ring-[#008a4b]/20 focus-within:border-[#008a4b]">
              <Search className="w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Rechercher souscripteur, matricule..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none focus:outline-none ml-3 text-sm font-medium text-gray-900 placeholder-gray-400"
              />
            </div>
            <div className="flex items-center space-x-3 w-full md:w-auto flex-wrap gap-y-2">
              {/* Status selector */}
              <div className="flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs font-bold text-gray-600">
                {(['Tous', 'En attente', 'Validé', 'Rejeté', 'Modif. à Valider'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-3 py-2 rounded-lg transition-all ${
                      statusFilter === filter 
                        ? 'bg-white text-[#008a4b] shadow-sm' 
                        : 'hover:text-gray-950'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              <button 
                onClick={handleExportCSV}
                className="flex justify-center items-center px-4 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 shadow-sm transition-all duration-200"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV ({filteredRequests.length})
              </button>

              <button 
                onClick={handleAutoValidation}
                className="flex justify-center items-center px-4 py-2.5 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 shadow-sm transition-all duration-200 gap-1.5"
                title="Vérifier et valider automatiquement les dossiers conformes aux règles de la FIF"
              >
                <Sparkles className="w-4 h-4 text-white" /> Validation Auto.
              </button>

              <button 
                onClick={handleOpenAddModal}
                className="flex justify-center items-center px-4 py-2.5 bg-[#008a4b] text-white rounded-xl text-xs font-bold hover:bg-[#00703c] shadow-md transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Nouveau Dossier
              </button>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white shadow-sm border border-slate-100/60 rounded-2xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID Dossier</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Souscripteur (Militaire)</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Membre Enrôlé (Bénéficiaire)</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Justificatifs</th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Actions & Décisions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                  {groupedDossiers.length > 0 ? (
                    groupedDossiers.map((dossier) => (
                      <Fragment key={dossier.matricule}>
                        {/* Subscriber Header Row */}
                        <tr 
                          onClick={() => toggleDossier(dossier.matricule)}
                          className="bg-slate-50/50 hover:bg-slate-100 transition-colors cursor-pointer border-l-4 border-[#008a4b]"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {expandedDossiers.has(dossier.matricule) ? (
                                <ChevronDown className="w-4 h-4 text-[#008a4b]" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              )}
                              <div className="text-sm font-black text-gray-900 uppercase">
                                 {dossier.numDossier ? (
                                    <span className="bg-slate-200 px-2 py-1 rounded border border-slate-300">{dossier.numDossier}</span>
                                 ) : (
                                    <span className="text-gray-400 italic text-[10px]">Non attribué</span>
                                 )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-black text-gray-900 uppercase flex items-center gap-1.5">
                                Dossier de 
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleOpenSubscriberInfo(dossier.matricule); }}
                                  className="text-indigo-600 hover:text-indigo-800 hover:underline transition-colors uppercase font-black tracking-tight focus:outline-none flex items-center gap-1"
                                  title="Consulter les détails du souscripteur"
                                >
                                  {dossier.subscriber}
                                </button>
                              </div>
                              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                N° Matricule: {dossier.matricule} • {dossier.requests.length} Membre(s) enrôlé(s)
                              </div>
                            </div>
                          </td>
                          <td colSpan={4} className="px-6 py-4 text-right">
                             <div className="flex justify-end items-center gap-3">
                               <button 
                                  onClick={(e) => { e.stopPropagation(); handleOpenSubscriberInfo(dossier.matricule); }}
                                  className="text-[10px] font-black text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-3 py-1.5 rounded-full uppercase tracking-tighter shadow-sm transition-colors flex items-center gap-1.5"
                               >
                                  <User className="w-3.5 h-3.5" /> Info Souscripteur
                               </button>
                               <span className="text-[10px] font-black text-[#008a4b] bg-white border border-[#008a4b]/20 px-3 py-1.5 rounded-full uppercase tracking-tighter shadow-sm transition-transform">
                                  {expandedDossiers.has(dossier.matricule) ? 'Refermer le dossier' : 'Consulter le dossier complet'}
                               </span>
                             </div>
                          </td>
                        </tr>

                        {/* Member Rows */}
                        {expandedDossiers.has(dossier.matricule) && dossier.requests.map((req: any) => (
                          <tr key={req.id} className="hover:bg-[#008a4b]/5 transition-colors group">
                            <td className="px-6 py-4 whitespace-nowrap text-[10px] font-black text-gray-400 pl-14">#{req.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Souscripteur</div>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleOpenSubscriberInfo(req.matricule); }}
                                className="text-sm font-black text-gray-800 hover:text-indigo-600 hover:underline transition-colors uppercase tracking-tight text-left focus:outline-none flex items-center gap-1"
                                title="Consulter les détails du souscripteur"
                              >
                                <User className="w-3.5 h-3.5 text-gray-400" /> {req.assure}
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-xs font-bold text-[#008a4b] uppercase tracking-widest mb-0.5">{req.lien}</div>
                              <div className="text-sm font-black text-gray-900 uppercase">{req.membre} {req.prenoms}</div>
                              <div className="text-[10px] font-bold text-slate-500 mt-1 flex items-center gap-2">
                                 <Calendar className="w-3 h-3" /> {req.date}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col gap-1.5">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setSelectedRequest(req); }}
                                  className="text-blue-600 hover:text-blue-800 text-[10px] font-black uppercase flex items-center bg-blue-50/50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors border border-blue-100 w-fit"
                                >
                                  <FileUp className="w-3 h-3 mr-1.5" /> Justificatif
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setSelectedRequest(req); setIsFIFModalOpen(true); }}
                                  className="text-slate-600 hover:text-slate-800 text-[10px] font-black uppercase flex items-center bg-slate-50/50 hover:bg-slate-100 px-3 py-1 rounded-lg transition-colors border border-slate-100 w-fit"
                                >
                                  <FileText className="w-3 h-3 mr-1.5" /> Fiche FIF
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              {req.statut === 'En attente' && <span className="px-2.5 py-1 inline-flex text-[10px] font-black rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200/50 uppercase"><Clock className="w-3 h-3 mr-1" /> {req.statut}</span>}
                              {req.statut === 'Validé' && <span className="px-2.5 py-1 inline-flex text-[10px] font-black rounded-full bg-green-50 text-green-700 border border-green-200/50 uppercase"><CheckCircle className="w-3 h-3 mr-1" /> {req.statut}</span>}
                              {req.statut === 'Rejeté' && <span className="px-2.5 py-1 inline-flex text-[10px] font-black rounded-full bg-red-50 text-red-700 border border-red-200/50 uppercase"><XCircle className="w-3 h-3 mr-1" /> {req.statut}</span>}
                              {req.statut === 'Modif. à Valider' && <span className="px-2.5 py-1 inline-flex text-[10px] font-black rounded-full bg-purple-50 text-purple-700 border border-purple-200/50 uppercase"><RotateCcw className="w-3 h-3 mr-1" /> {req.statut}</span>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center justify-center gap-2">
                                {(req.statut === 'En attente' || req.statut === 'Modif. à Valider') && (
                                  <>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleOpenMissingPieceModal(req); }}
                                      className="text-white bg-amber-500 hover:bg-amber-600 p-1.5 rounded-lg shadow-sm transition-all" 
                                      title="Signaler un document manquant"
                                    >
                                      <Mail className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleValidate(req.id, 'Validé'); }}
                                      className="text-white bg-[#008a4b] hover:bg-[#00703c] p-1.5 rounded-lg shadow-sm transition-all" 
                                      title="Approuver"
                                    >
                                      <CheckCircle className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleValidate(req.id, 'Rejeté'); }}
                                      className="text-white bg-red-500 hover:bg-red-600 p-1.5 rounded-lg shadow-sm transition-all" 
                                      title="Rejeter"
                                    >
                                      <XCircle className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleOpenEditModal(req); }}
                                  className="text-slate-500 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition-all"
                                  title="Modifier"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleDeleteRequest(req.id); }}
                                  className="text-slate-500 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-all"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </Fragment>
                    ))
                  ) : (
                    <tr>
                       <td colSpan={6} className="text-center py-12 text-gray-400 font-semibold text-sm">
                          Aucun dossier d'enrôlement ne correspond à vos critères.
                       </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}

      {/* FIF MODAL - FICHE D'INFORMATION DE L'ADHÉRENT SUMMARY */}
      <AnimatePresence>
        {isFIFModalOpen && selectedRequest && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm text-left overflow-y-auto"
          >
             <motion.div 
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="bg-white text-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-gray-200 max-h-[90vh] flex flex-col my-8"
             >
                <div className="bg-[#008a4b] text-white px-6 py-4 flex justify-between items-center flex-shrink-0">
                   <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-white" />
                      <span className="font-bold uppercase tracking-tight text-sm">Fiche d'Information de l'Adhérent (FIF) — #{selectedRequest.id}</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        selectedRequest.statut === 'Validé' ? 'bg-white text-green-700' : 
                        selectedRequest.statut === 'Rejeté' ? 'bg-rose-500 text-white' : 
                        'bg-yellow-400 text-yellow-900'
                      }`}>
                        {selectedRequest.statut}
                      </span>
                      <button 
                        onClick={() => setIsFIFModalOpen(false)}
                        className="bg-white/10 hover:bg-white/20 p-1.5 rounded-full text-white transition"
                      >
                        <X className="w-5 h-5"/>
                      </button>
                   </div>
                </div>

                <div className="p-8 overflow-y-auto flex-1 custom-scrollbar space-y-8">
                   {/* Header Branding */}
                   <div className="flex justify-between items-start border-b-2 border-gray-100 pb-6">
                      <div className="space-y-1">
                        <h2 className="text-2xl font-black text-[#008a4b] leading-none">C.A.M.A.</h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Caisse d'Assurance Maladie des Armées</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-gray-900 uppercase">Fiche Individuelle d'Enrôlement</p>
                        <p className="text-[10px] text-gray-500 font-bold mt-1">Générée le {new Date().toLocaleDateString('fr-FR')}</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Section 1: Subscriber */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                          <ShieldAlert className="w-4 h-4 text-[#008a4b]" />
                          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Identité du Souscripteur (Titulaire)</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-y-3 text-sm">
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Nom & Prénoms</p>
                            <p className="font-bold text-gray-900">{selectedRequest.assure}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">N° Matricule</p>
                            <p className="font-bold text-gray-900">{selectedRequest.matricule}</p>
                          </div>
                        </div>
                      </div>

                      {/* Completion Status Banner */}
                      <div className="space-y-4">
                        {(() => {
                          const isConjoint = selectedRequest.lien === 'Conjoint';
                          const fields = isConjoint ? [
                            { key: 'membre', label: 'Nom', value: selectedRequest.membre },
                            { key: 'prenoms', label: 'Prénoms', value: selectedRequest.prenoms },
                            { key: 'dateNaissance', label: 'Date Naissance', value: selectedRequest.dateNaissance },
                            { key: 'lieuNaissance', label: 'Lieu Naissance', value: selectedRequest.lieuNaissance },
                            { key: 'sexe', label: 'Sexe', value: selectedRequest.sexe },
                            { key: 'gs', label: 'G.S.', value: selectedRequest.gs },
                            { key: 'refIdentityDoc', label: 'Réf. Identité', value: selectedRequest.refIdentityDoc },
                            { key: 'refMarriageCertificate', label: 'Réf. Acte Mariage', value: selectedRequest.refMarriageCertificate },
                            { key: 'profession', label: 'Profession', value: selectedRequest.profession },
                            { key: 'residence', label: 'Lieu Résidence', value: selectedRequest.residence },
                            { key: 'telephone', label: 'Téléphone', value: selectedRequest.telephone },
                          ] : [
                            { key: 'membre', label: 'Nom', value: selectedRequest.membre },
                            { key: 'prenoms', label: 'Prénoms', value: selectedRequest.prenoms },
                            { key: 'dateNaissance', label: 'Date Naissance', value: selectedRequest.dateNaissance },
                            { key: 'lieuNaissance', label: 'Lieu Naissance', value: selectedRequest.lieuNaissance },
                            { key: 'sexe', label: 'Sexe', value: selectedRequest.sexe },
                            { key: 'gs', label: 'G.S.', value: selectedRequest.gs },
                            { key: 'refIdentityDoc', label: 'Réf. Identité', value: selectedRequest.refIdentityDoc },
                            { key: 'refScolariteDoc', label: 'Réf. Scolarité/État Civil', value: selectedRequest.refScolariteDoc },
                            { key: 'motherName', label: 'Nom Mère/Père', value: selectedRequest.motherName },
                            { key: 'telephone', label: 'Téléphone', value: selectedRequest.telephone },
                          ];

                          const missingFields = fields.filter(f => !f.value || f.value.toString().trim() === '');
                          const isComplete = missingFields.length === 0;

                          return (
                            <div className={`p-4 rounded-xl border flex items-center gap-3 ${isComplete ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                              <div className={`p-2 rounded-lg ${isComplete ? 'bg-emerald-500' : 'bg-amber-500'} text-white`}>
                                {isComplete ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5 animate-pulse" />}
                              </div>
                              <div>
                                <h4 className={`text-xs font-black uppercase tracking-tight ${isComplete ? 'text-emerald-900' : 'text-amber-900'}`}>
                                  Dossier {isComplete ? 'Complet' : 'Incomplet'}
                                </h4>
                                <p className={`text-[10px] font-medium ${isComplete ? 'text-emerald-700' : 'text-amber-700'}`}>
                                  {isComplete 
                                    ? "Toutes les informations administratives sont renseignées." 
                                    : `${missingFields.length} champ(s) obligatoire(s) manquant(s).`}
                                </p>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                          <UserPlus className="w-4 h-4 text-[#008a4b]" />
                          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Section 2/3 : Identité de l'Ayant-Droit</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {(() => {
                            const isConjoint = selectedRequest.lien === 'Conjoint';
                            const fields = isConjoint ? [
                              { label: 'Nom', value: selectedRequest.membre, key: 'membre' },
                              { label: 'Prénoms', value: selectedRequest.prenoms, key: 'prenoms' },
                              { label: 'Sexe', value: selectedRequest.sexe === 'M' ? 'Masculin' : 'Féminin', key: 'sexe' },
                              { label: 'Groupe Sanguin', value: selectedRequest.gs, key: 'gs', color: 'text-rose-600' },
                              { label: 'Né(e) le', value: selectedRequest.dateNaissance, key: 'dateNaissance' },
                              { label: 'À (Lieu)', value: selectedRequest.lieuNaissance, key: 'lieuNaissance' },
                              { label: 'Réf. Document Identité', value: selectedRequest.refIdentityDoc, key: 'refIdentityDoc' },
                              { label: 'Réf. Acte de Mariage', value: selectedRequest.refMarriageCertificate, key: 'refMarriageCertificate' },
                              { label: 'Profession', value: selectedRequest.profession, key: 'profession' },
                              { label: 'Lieu de Résidence', value: selectedRequest.residence, key: 'residence' },
                              { label: 'Téléphone', value: selectedRequest.telephone, key: 'telephone' },
                            ] : [
                              { label: 'Nom', value: selectedRequest.membre, key: 'membre' },
                              { label: 'Prénoms', value: selectedRequest.prenoms, key: 'prenoms' },
                              { label: 'Sexe', value: selectedRequest.sexe === 'M' ? 'Masculin' : 'Féminin', key: 'sexe' },
                              { label: 'Groupe Sanguin', value: selectedRequest.gs, key: 'gs', color: 'text-rose-600' },
                              { label: 'Né(e) le', value: selectedRequest.dateNaissance, key: 'dateNaissance' },
                              { label: 'À (Lieu)', value: selectedRequest.lieuNaissance, key: 'lieuNaissance' },
                              { label: 'Réf. Document Identité', value: selectedRequest.refIdentityDoc, key: 'refIdentityDoc' },
                              { label: 'Réf. Scolarité / État Civil', value: selectedRequest.refScolariteDoc, key: 'refScolariteDoc' },
                              { label: 'Nom Mère (ou Père)', value: selectedRequest.motherName, key: 'motherName' },
                              { label: 'Téléphone', value: selectedRequest.telephone, key: 'telephone' },
                            ];

                            return fields.map((field) => {
                              const isMissing = !field.value || field.value.toString().trim() === '';
                              return (
                                <div key={field.key} className={`p-3 rounded-xl border transition-all ${isMissing ? 'bg-amber-50/40 border-dashed border-amber-200' : 'bg-slate-50 border-slate-100'}`}>
                                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{field.label}</p>
                                  <p className={`text-xs font-bold uppercase truncate ${isMissing ? 'text-amber-500 italic' : field.color || 'text-gray-900'}`}>
                                    {field.value || 'Non renseigné'}
                                  </p>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                   </div>



                   {/* Section 5: Modification Traces */}
                   {selectedRequest.modificationTraces && selectedRequest.modificationTraces.length > 0 && (
                     <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                           <div className="flex items-center gap-2">
                              <History className="w-4 h-4 text-purple-600" />
                              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Traces des Modifications (Audits)</h3>
                           </div>
                           <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">{selectedRequest.modificationTraces.length} actions</span>
                        </div>
                        <div className="space-y-2">
                           {selectedRequest.modificationTraces.map((trace, idx) => (
                             <div key={idx} className="flex items-start gap-4 p-3 bg-purple-50/30 border border-purple-100 rounded-xl text-xs">
                                <div className="mt-1 bg-purple-600 text-white p-1 rounded-full">
                                   <RotateCcw className="w-2.5 h-2.5" />
                                </div>
                                <div className="flex-1 space-y-1">
                                   <div className="flex justify-between items-center">
                                      <span className="font-black text-purple-900">Champ modifié: <span className="uppercase text-[10px]">{trace.field}</span></span>
                                      <span className="text-[10px] text-gray-400 font-bold">{trace.date}</span>
                                   </div>
                                   <div className="flex items-center gap-2 text-gray-600 font-medium">
                                      <span className="line-through opacity-50">{trace.oldValue || 'vide'}</span>
                                      <span className="text-gray-400">→</span>
                                      <span className="font-bold text-gray-900">{trace.newValue}</span>
                                   </div>
                                   <p className="text-[10px] text-gray-400 italic">Par {trace.author}</p>
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>
                   )}
                </div>

                <div className="bg-slate-50 px-6 py-4 flex gap-3 justify-end border-t border-slate-200">
                    <button 
                      onClick={() => window.print()}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-4 py-2 rounded-lg transition-colors shadow flex items-center gap-1.5"
                    >
                      <Download className="w-4 h-4" /> Imprimer Fiche
                    </button>
                    <button 
                      onClick={async (e) => {
                        setIsFIFModalOpen(false);
                        handleOpenEditModal(selectedRequest);
                      }}
                      className="bg-[#008a4b] hover:bg-[#00703c] text-white font-bold text-sm px-4 py-2 rounded-lg transition-colors shadow flex items-center gap-1.5"
                    >
                      <Edit3 className="w-4 h-4" /> Modifier les Infos
                    </button>
                    <button 
                      onClick={() => setIsFIFModalOpen(false)}
                      className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-sm px-4 py-2 rounded-lg transition-all"
                    >
                      Fermer
                   </button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedRequest && !isFIFModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm text-left"
          >
             <motion.div 
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="bg-zinc-900 text-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-zinc-800 max-h-[90vh] flex flex-col"
             >
                <div className="bg-zinc-800 px-6 py-4 flex justify-between items-center border-b border-zinc-700 flex-shrink-0">
                   <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#008a4b]" />
                      <span className="font-bold">Pièce Justificative — #{selectedRequest.id}</span>
                   </div>
                   <button 
                     onClick={() => setSelectedRequest(null)}
                     className="bg-zinc-700 hover:bg-zinc-600 p-1.5 rounded-full text-zinc-400 hover:text-white transition"
                   >
                     <X className="w-5 h-5"/>
                   </button>
                </div>
                
                {/* Document display supports simulated standard document AND real custom uploaded image Base64 */}
                <div className="p-8 bg-amber-50/10 flex justify-center text-gray-800 relative select-none overflow-y-auto flex-1 custom-scrollbar">
                  { (selectedRequest.justificatif || selectedRequest.documentImage) ? (
                    <div className="flex flex-col items-center justify-center space-y-6 w-full py-4">
                      {getFilesList(selectedRequest.justificatif || selectedRequest.documentImage).map((fileSrc, idx) => {
                        const fileIsPdf = isPdf(fileSrc);
                        return (
                          <div key={idx} className="flex flex-col items-center max-w-full">
                            {fileIsPdf ? (
                              <div className="flex flex-col items-center justify-center p-8 bg-zinc-800 border border-zinc-750 rounded-xl max-w-md text-center shadow-lg">
                                <FileText className="w-16 h-16 text-red-500 mb-4" />
                                <h5 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Fichier PDF Justificatif</h5>
                                <p className="text-xs text-zinc-400 mb-4">Document d'acte de naissance / mariage téléversé par l'assuré.</p>
                                <a 
                                  href={fileSrc} 
                                  download={`Justificatif_${selectedRequest.id || 'dossier'}_${idx + 1}.pdf`}
                                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition shadow-md"
                                >
                                  Télécharger / Visualiser le PDF
                                </a>
                              </div>
                            ) : (
                              <img 
                                src={fileSrc} 
                                alt={`Acte État Civil ${idx + 1}`} 
                                className="max-h-[550px] w-auto max-w-full rounded-lg object-contain border border-zinc-700 shadow-xl"
                                referrerPolicy="no-referrer"
                              />
                            )}
                            {getFilesList(selectedRequest.justificatif || selectedRequest.documentImage).length > 1 && (
                              <span className="text-[10px] text-zinc-400 bg-black/60 px-2.5 py-0.5 rounded-full mt-2 font-bold uppercase tracking-wider">
                                Document {idx + 1} sur {getFilesList(selectedRequest.justificatif || selectedRequest.documentImage).length}
                              </span>
                            )}
                          </div>
                        );
                      })}
                      <span className="text-xs text-white/50 bg-black/30 px-3 py-1 rounded-full font-bold">
                        {selectedRequest.justificatif ? "Pièce(s) téléversée(s) par le souscripteur" : "Pièce téléversée par l'administration"}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-6 text-center py-20">
                       <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 shadow-inner">
                          <FileUp className="w-10 h-10 text-zinc-600" />
                       </div>
                       <div>
                          <h4 className="text-lg font-black text-white uppercase tracking-tight">Aucun document numérique</h4>
                          <p className="text-sm text-zinc-400 mt-2 max-w-sm mx-auto leading-relaxed">
                             Le souscripteur n'a pas encore téléversé de copie numérique de la pièce justificative (Acte de naissance, CNIB, etc.) pour ce membre.
                          </p>
                       </div>
                       <button 
                         onClick={async (e) => { setSelectedRequest(null); setIsMissingPieceModalOpen(true); setMissingPieceRequest(selectedRequest); }}
                         className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl transition-all uppercase tracking-widest"
                       >
                          Signaler le document manquant
                       </button>
                    </div>
                  )}
                </div>

                <div className="bg-zinc-800 px-6 py-4 flex gap-3 justify-end border-t border-zinc-700">
                   {(selectedRequest.statut === 'En attente' || selectedRequest.statut === 'Modif. à Valider') && (
                      <>
                         <button 
                           onClick={async (e) => {
                             handleValidate(selectedRequest.id, 'Rejeté');
                             setSelectedRequest(null);
                           }}
                           className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm px-4 py-2 rounded-lg transition-colors shadow"
                         >
                            Rejeter Dossier
                         </button>
                         <button 
                           onClick={async (e) => {
                             handleValidate(selectedRequest.id, 'Validé');
                             setSelectedRequest(null);
                           }}
                           className="bg-[#008a4b] hover:bg-[#00703c] text-white font-bold text-sm px-4 py-2 rounded-lg transition-colors shadow"
                         >
                            Valider & Approuver
                         </button>
                      </>
                   )}
                   <button 
                     onClick={() => handleDownloadDocument(selectedRequest)}
                     className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-4 py-2 rounded-lg transition-colors shadow flex items-center gap-1.5 mr-2"
                   >
                     <Download className="w-4 h-4" /> Télécharger
                    </button>
                    {(selectedRequest.justificatif || selectedRequest.documentImage) && (
                      <button 
                        type="button"
                        onClick={() => handleDeleteDocument(selectedRequest)}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm px-4 py-2 rounded-lg transition-colors shadow flex items-center gap-1.5 mr-2"
                      >
                        <Trash className="w-4 h-4" /> Supprimer la pièce
                      </button>
                    )}
                    <button 
                      onClick={() => setSelectedRequest(null)}
                      className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold text-sm px-4 py-2 rounded-lg transition-all"
                    >
                      Fermer
                   </button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FORM MODAL - MULTIPURPOSE CREATION & EDITING WITH TRUE DRAG & DROP FILE UPLOAD */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm text-left overflow-y-auto">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-100 overflow-hidden my-8 max-h-[90vh] flex flex-col"
             >
                <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center flex-shrink-0">
                   <div className="flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-[#008a4b]" />
                      <span className="font-bold">
                        {editingRequest ? `Modifier le dossier d'enrôlement #${editingRequest.id}` : "Créer un nouveau dossier d'enrôlement"}
                      </span>
                   </div>
                   <button 
                     type="button"
                     onClick={() => setIsFormModalOpen(false)}
                     className="bg-slate-800 hover:bg-slate-700 p-1.5 rounded-full text-zinc-400 hover:text-white transition"
                   >
                     <X className="w-5 h-5"/>
                   </button>
                </div>

                <form onSubmit={handleSaveRequest} className="p-6 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                   {formError && (
                     <div className="bg-rose-50 text-rose-600 text-sm font-bold p-3 rounded-lg border border-rose-200">
                       {formError}
                     </div>
                   )}

                   {/* Group 1: Souscripteur */}
                   <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                        <ShieldAlert className="w-4 h-4 text-[#008a4b]" />
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Informations du Souscripteur (Titulaire)</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-[10px] font-black text-gray-700 uppercase mb-1">Nom & Prénoms du Militaire *</label>
                           <input 
                             type="text" 
                             required
                             value={formAssure}
                             onChange={(e) => setFormAssure(e.target.value)}
                             placeholder="Ex: Sgt. Amadou Traoré"
                             className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#008a4b]/20 focus:border-[#008a4b] font-medium text-sm"
                           />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-gray-700 uppercase mb-1">N° Matricule *</label>
                           <input 
                             type="text" 
                             required
                             value={formMatricule}
                             onChange={(e) => setFormMatricule(e.target.value)}
                             placeholder="Ex: 092.105-B"
                             className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#008a4b]/20 focus:border-[#008a4b] font-medium text-sm"
                           />
                        </div>
                      </div>
                   </div>

                   {/* Group 2: Bénéficiaire Identity */}
                   <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                        <UserPlus className="w-4 h-4 text-[#008a4b]" />
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Identité du Bénéficiaire (Ayant-Droit)</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                           <label className="block text-[10px] font-black text-gray-700 uppercase mb-1">Nom *</label>
                           <input 
                             type="text" 
                             required
                             value={formMembre}
                             onChange={(e) => setFormMembre(e.target.value)}
                             placeholder="Ex: Traoré"
                             className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#008a4b]/20 focus:border-[#008a4b] font-bold text-sm"
                           />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-gray-700 uppercase mb-1">Prénoms *</label>
                           <input 
                             type="text" 
                             required
                             value={formPrenoms}
                             onChange={(e) => setFormPrenoms(e.target.value)}
                             placeholder="Ex: Fatimata"
                             className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#008a4b]/20 focus:border-[#008a4b] font-bold text-sm"
                           />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-gray-700 uppercase mb-1">Sexe</label>
                           <select 
                             value={formSexe}
                             onChange={(e) => setFormSexe(e.target.value as 'M' | 'F')}
                             className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#008a4b]/20 focus:border-[#008a4b] font-bold text-sm"
                           >
                              <option value="M">Masculin (M)</option>
                              <option value="F">Féminin (F)</option>
                           </select>
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-gray-700 uppercase mb-1">Date de Naissance *</label>
                           <input 
                             type="date" 
                             required
                             value={formDateNaissance}
                             onChange={(e) => setFormDateNaissance(e.target.value)}
                             className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#008a4b]/20 focus:border-[#008a4b] font-bold text-sm"
                           />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-gray-700 uppercase mb-1">Lieu de Naissance</label>
                           <input 
                             type="text" 
                             value={formLieuNaissance}
                             onChange={(e) => setFormLieuNaissance(e.target.value)}
                             placeholder="Ex: Ouagadougou"
                             className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#008a4b]/20 focus:border-[#008a4b] font-bold text-sm"
                           />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-gray-700 uppercase mb-1">Groupe Sanguin</label>
                           <select 
                             value={formGs}
                             onChange={(e) => setFormGs(e.target.value)}
                             className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#008a4b]/20 focus:border-[#008a4b] font-bold text-sm"
                           >
                              <option value="">Sélectionner</option>
                              <option value="A+">A+</option>
                              <option value="A-">A-</option>
                              <option value="B+">B+</option>
                              <option value="B-">B-</option>
                              <option value="AB+">AB+</option>
                              <option value="AB-">AB-</option>
                              <option value="O+">O+</option>
                              <option value="O-">O-</option>
                           </select>
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-gray-700 uppercase mb-1">Lien de Parenté</label>
                           <select 
                             value={formLien}
                             onChange={(e) => setFormLien(e.target.value)}
                             className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#008a4b]/20 focus:border-[#008a4b] font-black text-sm text-[#008a4b]"
                           >
                              <option value="Conjoint">Conjoint (Épouse / Époux)</option>
                              <option value="Enfant">Enfant à Charge</option>
                              <option value="Parent">Parent ascendant</option>
                              <option value="Autre">Autre (Parent éloigné)</option>
                           </select>
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-gray-700 uppercase mb-1">Nom de la Mère / Père</label>
                           <input 
                             type="text" 
                             value={formMotherName}
                             onChange={(e) => setFormMotherName(e.target.value)}
                             placeholder="Nom & Prénom(s)"
                             className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#008a4b]/20 focus:border-[#008a4b] font-bold text-sm"
                           />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-gray-700 uppercase mb-1">Téléphone</label>
                           <input 
                             type="tel" 
                             value={formTelephone}
                             onChange={(e) => {
                               const val = e.target.value;
                               if (/^[0-9\s+\-()]*$/.test(val)) {
                                 setFormTelephone(val);
                               }
                             }}
                             placeholder="Ex: +226 70 00 11 22"
                             className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#008a4b]/20 focus:border-[#008a4b] font-bold text-sm font-mono"
                           />
                        </div>
                        <div className="lg:col-span-2">
                           <label className="block text-[10px] font-black text-gray-700 uppercase mb-1">Lieu de Résidence</label>
                           <input 
                             type="text" 
                             value={formResidence}
                             onChange={(e) => setFormResidence(e.target.value)}
                             placeholder="Quartier, Secteur, Ville"
                             className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#008a4b]/20 focus:border-[#008a4b] font-bold text-sm"
                           />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-gray-700 uppercase mb-1">Profession</label>
                           <input 
                             type="text" 
                             value={formProfession}
                             onChange={(e) => setFormProfession(e.target.value)}
                             placeholder="Ex: Étudiant, Sans"
                             className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#008a4b]/20 focus:border-[#008a4b] font-bold text-sm"
                           />
                        </div>
                      </div>
                   </div>

                   {/* Group 3: Document References */}
                   <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                        <FileCheck2 className="w-4 h-4 text-[#008a4b]" />
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Références Administratives & Justificatifs</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                           <label className="block text-[10px] font-black text-gray-700 uppercase mb-1">Réf. Acte (Naiss./Mari.)</label>
                           <input 
                             type="text" 
                             value={formRefMarriageCertificate}
                             onChange={(e) => setFormRefMarriageCertificate(e.target.value)}
                             placeholder="N° Acte / Registre"
                             className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#008a4b]/20 focus:border-[#008a4b] font-bold text-sm"
                           />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-gray-700 uppercase mb-1">Réf. Certificat Scolarité</label>
                           <input 
                             type="text" 
                             value={formRefScolariteDoc}
                             onChange={(e) => setFormRefScolariteDoc(e.target.value)}
                             placeholder="N° Certificat"
                             className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#008a4b]/20 focus:border-[#008a4b] font-bold text-sm"
                           />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-gray-700 uppercase mb-1">Réf. Pièce Identité</label>
                           <input 
                             type="text" 
                             value={formRefIdentityDoc}
                             onChange={(e) => setFormRefIdentityDoc(e.target.value)}
                             placeholder="N° CNIB / Passeport"
                             className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#008a4b]/20 focus:border-[#008a4b] font-bold text-sm"
                           />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-gray-700 uppercase mb-1">N° Informatique</label>
                           <input 
                             type="text" 
                             value={formNumInformatique}
                             onChange={(e) => setFormNumInformatique(e.target.value)}
                             placeholder="Ex: 887221"
                             className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#008a4b]/20 focus:border-[#008a4b] font-bold text-sm text-blue-700"
                           />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-gray-700 uppercase mb-1">N° Carte CAMA</label>
                           <input 
                             type="text" 
                             value={formNumCama}
                             onChange={(e) => setFormNumCama(e.target.value)}
                             placeholder="Ex: CM-2026-BF-9921"
                             className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#008a4b]/20 focus:border-[#008a4b] font-bold text-sm text-[#008a4b]"
                           />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-gray-700 uppercase mb-1">Statut du Dossier</label>
                           <select 
                             value={formStatut}
                             onChange={(e) => setFormStatut(e.target.value as any)}
                             className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#008a4b]/20 focus:border-[#008a4b] font-black text-sm"
                           >
                              <option value="En attente">En attente</option>
                              <option value="Validé">Validé</option>
                              <option value="Rejeté">Rejeté</option>
                              <option value="Modif. à Valider">Soumettre pour Validation</option>
                           </select>
                        </div>
                      </div>
                   </div>

                   {/* Custom drag-and-drop piece uploader with base64 serialization as requested */}
                   <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-700 uppercase">
                         Pièce d'État Civil Justificative (Acte de Naissance/Mariage)
                      </label>
                      
                      {!formDocumentImage ? (
                        <div 
                           onDragEnter={handleDrag}
                           onDragOver={handleDrag}
                           onDragLeave={handleDrag}
                           onDrop={handleDrop}
                           onClick={triggerFileInput}
                           className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col justify-center items-center h-44 ${
                             dragActive 
                               ? 'border-[#008a4b] bg-green-50/50' 
                               : 'border-gray-300 hover:border-[#008a4b] hover:bg-slate-50'
                           }`}
                        >
                           <FileUp className="w-10 h-10 text-gray-400 mb-2.5" />
                           <p className="text-sm font-bold text-gray-700">Glissez-déposez le document ici</p>
                           <p className="text-xs text-gray-400 mt-1">ou cliquez pour parcourir vos fichiers d'images</p>
                           <input 
                             type="file" 
                             ref={fileInputRef}
                             onChange={handleFileChange}
                             accept="image/*"
                             className="hidden" 
                           />
                        </div>
                      ) : (
                        <div className="relative border border-slate-200 rounded-xl p-4 bg-slate-50 flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className="w-16 h-16 rounded border border-gray-300 overflow-hidden bg-white flex items-center justify-center">
                                 <img 
                                   src={formDocumentImage} 
                                   alt="Preview document" 
                                   className="w-full h-full object-cover" 
                                   referrerPolicy="no-referrer"
                                 />
                              </div>
                              <div>
                                 <p className="text-xs font-bold text-green-700 flex items-center gap-1">
                                    <Check className="w-4.5 h-4.5" /> Document prêt à être enregistré
                                 </p>
                                 <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Image Base64 Encapsulée</span>
                              </div>
                           </div>
                           
                           {/* Delete button as requested */}
                           <button 
                             type="button"
                             onClick={() => setFormDocumentImage('')}
                             className="bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white p-2 rounded-lg transition-colors border border-rose-100"
                             title="Supprimer la pièce jointe"
                           >
                              <Trash className="w-4 h-4" />
                           </button>
                        </div>
                      )}
                   </div>

                   <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs font-bold text-gray-500 flex gap-2">
                       <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0" />
                       <span>L'état de droit et le secret professionnel sont de rigueur. Toutes les informations sont transmises de façon cryptée à des fins de vérification biométrique.</span>
                   </div>

                   <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                      <button 
                         type="button"
                         onClick={() => setIsFormModalOpen(false)}
                         className="px-5 py-2.5 bg-slate-150 text-slate-700 hover:bg-slate-200 font-bold text-sm rounded-xl transition"
                      >
                         Annuler
                      </button>
                      <button 
                         type="submit"
                         className="px-6 py-2.5 bg-[#008a4b] hover:bg-[#00703c] text-white font-bold text-sm rounded-xl shadow-md transition"
                      >
                         Enregistrer Dossier
                      </button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

       {/* MODAL DE PIÈCE MANQUANTE AVEC FORMULAIRE COMPLET ET ENVOI DE NOTIFICATION */}
       <AnimatePresence>
         {isMissingPieceModalOpen && missingPieceRequest && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm text-left overflow-y-auto">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-100 overflow-hidden my-8"
             >
               <div className="bg-amber-600 text-white px-6 py-4 flex justify-between items-center">
                 <div className="flex items-center gap-2">
                   <Mail className="w-5 h-5 text-white" />
                   <span className="font-bold">Signaler une pièce manquante</span>
                 </div>
                 <button 
                   type="button"
                   onClick={() => setIsMissingPieceModalOpen(false)}
                   className="bg-amber-700 hover:bg-amber-800 p-1.5 rounded-full text-white/80 hover:text-white transition"
                 >
                   <X className="w-5 h-5" />
                 </button>
               </div>
               
               <form onSubmit={handleSendMissingPieceEmail} className="p-6 space-y-4">
                 <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Souscripteur Militaire</label>
                   <p className="text-sm font-bold text-gray-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-150">
                     {missingPieceRequest.assure} (Matricule: {missingPieceRequest.matricule})
                   </p>
                 </div>

                 <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ayant droit concerné</label>
                   <p className="text-sm font-bold text-gray-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-150">
                     {missingPieceRequest.membre} ({missingPieceRequest.lien})
                   </p>
                 </div>

                 <div>
                   <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Document Manquant / Non conforme</label>
                   <select 
                     value={selectedMissingPiece}
                     onChange={(e) => setSelectedMissingPiece(e.target.value)}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                   >
                     <option value="Acte de naissance">Acte de naissance ou d'adoption</option>
                     <option value="Acte de mariage">Acte de mariage officiel</option>
                     <option value="Certificat de scolarité">Certificat de scolarité officiel (Enfant +21 ans)</option>
                     <option value="Pièce d'identité (CNIB/Passeport)">Pièce d'identité (CNIB / Passeport pour Enfant +15 ans)</option>
                     <option value="Autre justificatif">Autre justificatif administratif</option>
                   </select>
                 </div>

                 <div>
                   <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Instructions pour le militaire *</label>
                   <textarea 
                     rows={4}
                     required
                     value={customMissingNote}
                     onChange={(e) => setCustomMissingNote(e.target.value)}
                     placeholder="Ex: Le document fourni est flou et illisible. Veuillez téléverser un nouvel extrait d'acte de naissance certifié conforme."
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium text-sm"
                   ></textarea>
                 </div>

                 <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-100 text-[11px] text-amber-800 flex gap-2 font-medium">
                   <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
                   <span>Un e-mail officiel sera immédiatement envoyé au souscripteur pour l'informer du rejet temporaire et lui permettre de téléverser la pièce demandée.</span>
                 </div>

                 <div className="flex gap-3 justify-end pt-3">
                   <button 
                     type="button"
                     onClick={() => setIsMissingPieceModalOpen(false)}
                     className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs rounded-xl transition"
                   >
                     Annuler
                   </button>
                   <button 
                     type="submit"
                     className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
                   >
                     <Mail className="w-3.5 h-3.5" /> Envoyer la demande
                   </button>
                 </div>
               </form>
             </motion.div>
           </div>
         )}
       </AnimatePresence>

       {/* SIMULATEUR DE MESSAGERIE ET NOTIFICATIONS CAMA */}
       <div className="mt-8 bg-slate-900 text-slate-100 p-6 rounded-2xl border border-slate-800 shadow-xl text-left animate-fade-in">
         <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
           <div className="flex items-center gap-2.5">
             <div className="bg-[#008a4b]/20 p-2 rounded-xl text-[#008a4b]">
               <Mail className="w-5 h-5" />
             </div>
             <div>
               <h3 className="text-base font-extrabold text-white">Journal d'Envoi d'E-mails (Simulé)</h3>
               <p className="text-xs text-slate-400">Suivi en direct des notifications d'enrôlement envoyées aux militaires</p>
             </div>
           </div>
           <span className="text-xs bg-[#008a4b] text-white px-2.5 py-1 rounded-full font-bold">
             {emailLogs.length} Envoyés
           </span>
         </div>

         <div className="space-y-3.5 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
           {emailLogs.length === 0 ? (
             <div className="text-center py-6 text-slate-500 text-sm font-medium">
               Aucun e-mail envoyé pour le moment.
             </div>
           ) : (
             emailLogs.map((log) => (
               <div key={log.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 hover:border-slate-700 transition">
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                   <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Destinataire: {log.recipient}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">{log.date}</span>
                  </div>
                  <div className="text-xs font-bold text-white">{log.subject}</div>
                  <div className="text-xs text-slate-400 whitespace-pre-line leading-relaxed bg-slate-900/50 p-2.5 rounded border border-slate-900 font-mono">
                    {log.content}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      {/* SUBSCRIBER INFO MODAL */}
      <AnimatePresence>
        {isSubscriberModalOpen && selectedSubscriber && (() => {
          const subscriberFields = [
            { key: 'name', label: 'NOM', value: selectedSubscriber.name, section: 'identité' },
            { key: 'prenoms', label: 'PRENOMS', value: selectedSubscriber.prenoms, section: 'identité' },
            { key: 'sexe', label: 'SEXE', value: selectedSubscriber.sexe, section: 'identité' },
            { key: 'matricule', label: 'MATRICULE MILITAIRE', value: selectedSubscriber.matricule, section: 'identité' },
            { key: 'numInformatique', label: 'N° INFORMATIQUE', value: selectedSubscriber.numInformatique, section: 'identité' },
            
            { key: 'grade', label: 'GRADE', value: selectedSubscriber.grade, section: 'statut' },
            { key: 'categorie', label: 'CATEGORIE', value: selectedSubscriber.categorie, section: 'statut' },
            { key: 'numCim', label: 'N° CIM', value: selectedSubscriber.numCim, section: 'statut' },
            { key: 'numCarteCama', label: 'N° Carte CAMA', value: selectedSubscriber.numCarteCama, section: 'statut' },
            { key: 'numIup', label: 'N° IUP (3)', value: selectedSubscriber.numIup, section: 'statut' },
            
            { key: 'structArmee', label: 'ARMEE', value: selectedSubscriber.structArmee, section: 'rattachement' },
            { key: 'structRegion', label: 'REGION', value: selectedSubscriber.structRegion, section: 'rattachement' },
            { key: 'structCorps', label: 'CORPS', value: selectedSubscriber.structCorps || selectedSubscriber.corp, section: 'rattachement' },
            { key: 'structService', label: 'SERVICE', value: selectedSubscriber.structService, section: 'rattachement' },
            { key: 'structSection', label: 'SECTION', value: selectedSubscriber.structSection, section: 'rattachement' },
            { key: 'structSousSection', label: 'SOUS-SECTION', value: selectedSubscriber.structSousSection, section: 'rattachement' },
            
            { key: 'telephones', label: 'TELEPHONES', value: selectedSubscriber.telephones || selectedSubscriber.phone, section: 'contacts' },
            { key: 'email', label: 'E-MAIL', value: selectedSubscriber.email, section: 'contacts' },
            { key: 'personneAPrevenir', label: 'PERSONNE A PREVENIR', value: selectedSubscriber.personneAPrevenir, section: 'contacts' },
            { key: 'personneAPrevenirTel', label: 'TEL (PERS. PREVENIR)', value: selectedSubscriber.personneAPrevenirTel, section: 'contacts' },
          ];

          const missingFields = subscriberFields.filter(f => !f.value || f.value.toString().trim() === '');
          const isComplete = missingFields.length === 0;

          return (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            >
               <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="bg-white text-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-gray-200 flex flex-col"
               >
                  <div className="bg-[#008a4b] text-white px-6 py-4 flex justify-between items-center shadow-md">
                     <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-white animate-pulse" />
                        <h3 className="font-bold uppercase tracking-tight text-sm">Fiche Militaire — 1. INFORMATIONS ADMINISTRATIVES DU MILITAIRE</h3>
                     </div>
                     <button 
                       onClick={() => setIsSubscriberModalOpen(false)}
                       className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white"
                     >
                       <X className="w-5 h-5" />
                     </button>
                  </div>

                  <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh] custom-scrollbar text-left">
                     
                     {/* COMPLETE / INCOMPLETE STATUS BANNER */}
                     {isComplete ? (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                           <div className="p-2 bg-emerald-500 rounded-lg text-white">
                              <ShieldCheck className="w-6 h-6" />
                           </div>
                           <div>
                              <h4 className="text-sm font-black text-emerald-900 uppercase tracking-tight">Dossier Administratif Complet (100%)</h4>
                              <p className="text-xs text-emerald-700 font-medium mt-0.5">
                                Toutes les informations requises de la section 1 du formulaire ont été fournies avec succès.
                              </p>
                           </div>
                        </div>
                     ) : (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                           <div className="p-2 bg-amber-500 rounded-lg text-white mt-0.5">
                              <ShieldAlert className="w-6 h-6 animate-pulse" />
                           </div>
                           <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                 <h4 className="text-sm font-black text-amber-950 uppercase tracking-tight">Profil Militaire Incomplet</h4>
                                 <span className="px-2.5 py-0.5 text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300 rounded-full uppercase">
                                    {missingFields.length} champ(s) manquant(s)
                                 </span>
                              </div>
                              <p className="text-xs text-amber-700 font-medium mt-1">
                                Certaines informations obligatoires de la section 1 de la fiche physique de la CAMA ne sont pas renseignées pour ce militaire.
                              </p>
                              <div className="mt-2 text-[10px] text-amber-800 font-bold flex flex-wrap gap-x-2 gap-y-1 bg-amber-100/50 p-2 rounded-lg border border-amber-200">
                                 <span className="uppercase text-amber-950">Champs manquants :</span>
                                 {missingFields.map((f) => (
                                    <span key={f.key} className="bg-white px-1.5 py-0.5 rounded border border-amber-300/60 text-amber-900">
                                       {f.label}
                                    </span>
                                 ))}
                              </div>
                           </div>
                        </div>
                     )}

                     {/* ROW 1: INFORMATIONS DE L'IDENTITE */}
                     <div className="space-y-3">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                           <span className="text-xs font-black text-[#008a4b] bg-emerald-50 px-2 py-0.5 rounded-md">1.1</span>
                           <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider">Identité Civile & Militaire</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                           {subscriberFields.filter(f => f.section === 'identité').map(field => {
                              const isFieldMissing = !field.value || field.value.toString().trim() === '';
                              return (
                                 <div 
                                    key={field.key} 
                                    className={`p-3 rounded-xl border transition-all ${
                                       isFieldMissing 
                                       ? 'bg-amber-50/40 border-dashed border-amber-200 shadow-inner' 
                                       : 'bg-slate-50 border-slate-100 hover:border-slate-200'
                                    }`}
                                 >
                                    <div className="flex items-center justify-between mb-1">
                                       <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest">{field.label}</span>
                                       {isFieldMissing && (
                                          <span className="text-[8px] font-black text-amber-600 bg-amber-100 px-1 rounded uppercase">Manquant</span>
                                       )}
                                    </div>
                                    <span className={`font-black text-sm uppercase block truncate ${isFieldMissing ? 'text-amber-500 italic font-medium' : 'text-gray-800'}`}>
                                       {field.value || 'Non renseigné'}
                                    </span>
                                 </div>
                              );
                           })}
                        </div>
                     </div>

                     {/* ROW 2: STATUT ET CARTES */}
                     <div className="space-y-3">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                           <span className="text-xs font-black text-[#008a4b] bg-emerald-50 px-2 py-0.5 rounded-md">1.2</span>
                           <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider">Statuts, Grades & Cartes</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                           {subscriberFields.filter(f => f.section === 'statut').map(field => {
                              const isFieldMissing = !field.value || field.value.toString().trim() === '';
                              return (
                                 <div 
                                    key={field.key} 
                                    className={`p-3 rounded-xl border transition-all ${
                                       isFieldMissing 
                                       ? 'bg-amber-50/40 border-dashed border-amber-200 shadow-inner' 
                                       : 'bg-slate-50 border-slate-100 hover:border-slate-200'
                                    }`}
                                 >
                                    <div className="flex items-center justify-between mb-1">
                                       <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest">{field.label}</span>
                                       {isFieldMissing && (
                                          <span className="text-[8px] font-black text-amber-600 bg-amber-100 px-1 rounded uppercase">Manquant</span>
                                       )}
                                    </div>
                                    <span className={`font-black text-sm uppercase block truncate ${isFieldMissing ? 'text-amber-500 italic font-medium' : 'text-gray-800'}`}>
                                       {field.value || 'Non renseigné'}
                                    </span>
                                 </div>
                              );
                           })}
                        </div>
                     </div>

                     {/* ROW 3: STRUCTURE DE RATTACHEMENT */}
                     <div className="space-y-3">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                           <span className="text-xs font-black text-[#008a4b] bg-emerald-50 px-2 py-0.5 rounded-md">1.3</span>
                           <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider">Structure de Rattachement</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                           {subscriberFields.filter(f => f.section === 'rattachement').map(field => {
                              const isFieldMissing = !field.value || field.value.toString().trim() === '';
                              return (
                                 <div 
                                    key={field.key} 
                                    className={`p-3 rounded-xl border transition-all ${
                                       isFieldMissing 
                                       ? 'bg-amber-50/40 border-dashed border-amber-200 shadow-inner' 
                                       : 'bg-slate-50 border-slate-100 hover:border-slate-200'
                                    }`}
                                 >
                                    <div className="flex items-center justify-between mb-1">
                                       <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest">{field.label}</span>
                                       {isFieldMissing && (
                                          <span className="text-[8px] font-black text-amber-600 bg-amber-100 px-1 rounded uppercase">Manquant</span>
                                       )}
                                    </div>
                                    <span className={`font-black text-xs uppercase block truncate ${isFieldMissing ? 'text-amber-500 italic font-medium' : 'text-gray-800'}`}>
                                       {field.value || 'Non renseigné'}
                                    </span>
                                 </div>
                              );
                           })}
                        </div>
                     </div>

                     {/* ROW 4: CONTACTS & COORDONNÉES */}
                     <div className="space-y-3">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                           <span className="text-xs font-black text-[#008a4b] bg-emerald-50 px-2 py-0.5 rounded-md">1.4</span>
                           <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider">Contacts & Personnes à Prévenir</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                           {subscriberFields.filter(f => f.section === 'contacts').map(field => {
                              const isFieldMissing = !field.value || field.value.toString().trim() === '';
                              return (
                                 <div 
                                    key={field.key} 
                                    className={`p-3 rounded-xl border transition-all ${
                                       isFieldMissing 
                                       ? 'bg-amber-50/40 border-dashed border-amber-200 shadow-inner' 
                                       : 'bg-slate-50 border-slate-100 hover:border-slate-200'
                                    }`}
                                 >
                                    <div className="flex items-center justify-between mb-1">
                                       <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest">{field.label}</span>
                                       {isFieldMissing && (
                                          <span className="text-[8px] font-black text-amber-600 bg-amber-100 px-1 rounded uppercase">Manquant</span>
                                       )}
                                    </div>
                                    <span className={`font-black text-xs block truncate ${isFieldMissing ? 'text-amber-500 italic font-medium' : 'text-gray-800'}`}>
                                       {field.value || 'Non renseigné'}
                                    </span>
                                 </div>
                              );
                           })}
                        </div>
                     </div>

                  </div>
                  
                  <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3 shadow-inner">
                     <button 
                        onClick={() => setIsSubscriberModalOpen(false)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-sm px-6 py-2.5 rounded-xl transition-all uppercase tracking-wider"
                     >
                        Fermer
                     </button>
                  </div>
               </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
