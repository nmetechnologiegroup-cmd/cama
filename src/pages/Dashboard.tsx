import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Clock, 
  CheckCircle, 
  Trash2, 
  Edit, 
  AlertCircle, 
  Upload, 
  History, 
  User as UserIcon, 
  ShieldCheck, 
  Mail, 
  LogOut, 
  Shield, 
  FileText, 
  Phone, 
  MapPin, 
  IdCard, 
  Activity, 
  Sparkles,
  Info,
  Download,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { 
  safeStorage, 
  getRequests, 
  addRequest, 
  editRequest, 
  deleteRequest, 
  getLogs, 
  addLog, 
  User, 
  Request,
  editUser,
  ModificationTrace
} from '../lib/dataStore';

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

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  
  // Modals and tabs state
  const [showModal, setShowModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState<Request | null>(null);
  const [showSuiviModal, setShowSuiviModal] = useState(false);
  const [selectedMemberForSuivi, setSelectedMemberForSuivi] = useState<Request | null>(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  
  // Member Form State
  const [formData, setFormData] = useState<Partial<Request>>({
    membre: '', 
    prenoms: '', 
    sexe: 'M', 
    lien: 'Enfant', 
    dateNaissance: '',
    lieuNaissance: '',
    gs: 'O+',
    refIdentityDoc: '',
    refMarriageCertificate: '',
    refScolariteDoc: '',
    motherName: '',
    profession: '',
    residence: '',
    telephone: '',
    numInformatique: '',
    numCama: '',
    justificatif: ''
  });

  // Military Profile Form State
  const [profileData, setProfileData] = useState<Partial<User>>({});

  useEffect(() => {
    const sessionStr = safeStorage.getItem('cama_session');
    if (!sessionStr) {
      navigate('/login');
      return;
    }
    let session = null;
    try {
      session = JSON.parse(sessionStr);
    } catch (e) {
      navigate('/login');
      return;
    }
    if (session.role === 'admin') {
      navigate('/admin');
      return;
    }
    setCurrentUser(session);
    setProfileData(session);
    refreshData(session.id);
  }, [navigate]);

  const refreshData = (userId: number) => {
    getRequests().then(reqs => setRequests(reqs.filter(r => r.userId === userId)));
    getLogs(userId).then(setLogs);
  };

  const handleLogout = () => {
    safeStorage.removeItem('cama_session');
    navigate('/login');
  };

  // Helper to calculate age from birthdate
  const calculateAge = (birthdate: string) => {
    if (!birthdate) return 0;
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const validFiles = (Array.from(files) as File[]).filter(file => {
        const isValid = file.type.startsWith('image/') || file.type === 'application/pdf';
        if (!isValid) {
          alert(`Le fichier "${file.name}" n'est pas une image ou un PDF.`);
        }
        return isValid;
      });

      const readersPromises = validFiles.map(file => {
        return new Promise<string>((resolve, reject) => {
          if (file.size > 2 * 1024 * 1024) {
            reject(new Error(`Le fichier "${file.name}" est trop volumineux (max 2Mo)`));
            return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
            if (reader.result) {
              resolve(reader.result as string);
            } else {
              reject(new Error("Erreur de lecture"));
            }
          };
          reader.onerror = () => reject(new Error("Erreur de lecture"));
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readersPromises)
        .then(results => {
          setFormData(prev => {
            const existing = getFilesList(prev.justificatif);
            const merged = [...existing, ...results];
            return { ...prev, justificatif: JSON.stringify(merged) };
          });
        })
        .catch(err => {
          alert(err.message);
        });
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Validate phone fields
    const phoneRegex = /^\+?[0-9\s\-()]{8,20}$/;
    if (profileData.telephones && !phoneRegex.test(profileData.telephones)) {
      alert("Erreur : Le numéro de téléphone du militaire n'est pas valide (minimum 8 chiffres, ex: 70001122).");
      return;
    }
    if (profileData.personneAPrevenirTel && !phoneRegex.test(profileData.personneAPrevenirTel)) {
      alert("Erreur : Le numéro de téléphone de la personne à prévenir n'est pas valide (minimum 8 chiffres, ex: 75001122).");
      return;
    }

    // Any modification must be submitted for validation
    // We store the current user state as it is, but mark it as pending modification
    // or we store the requested changes in a pendingModifications field
    
    const traces: ModificationTrace[] = currentUser.modificationTraces || [];
    const now = new Date().toLocaleString('fr-FR');
    
    let hasChanges = false;
    Object.keys(profileData).forEach(key => {
      const oldVal = (currentUser as any)[key] || '';
      const newVal = (profileData as any)[key] || '';
      if (oldVal !== newVal && !['modificationTraces', 'pendingModifications', 'statut'].includes(key)) {
        hasChanges = true;
        traces.push({
          id: `tr-${Math.random().toString(36).substr(2, 9)}`,
          field: key,
          oldValue: String(oldVal),
          newValue: String(newVal),
          date: now,
          author: currentUser.name
        });
      }
    });

    if (!hasChanges) {
      setShowProfileModal(false);
      return;
    }

    const updatedUser: User = {
      ...currentUser,
      pendingModifications: { ...profileData },
      statut: 'Modif. à Valider',
      modificationTraces: traces
    } as User;

    editUser(updatedUser);
    setCurrentUser(updatedUser);
    safeStorage.setItem('cama_session', JSON.stringify(updatedUser));
    addLog(currentUser.id, `Mise à jour des informations administratives soumise pour validation admin.`);
    refreshData(currentUser.id);
    setShowProfileModal(false);
    alert('Vos modifications administratives ont été soumises pour validation à l\'administration CAMA.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Contact telephone validation
    if (formData.telephone) {
      const phoneRegex = /^\+?[0-9\s\-()]{8,20}$/;
      if (!phoneRegex.test(formData.telephone)) {
        alert("Erreur : Veuillez saisir un numéro de téléphone de contact valide (minimum 8 chiffres, ex: +226 70 00 11 22).");
        return;
      }
    }

    // Strict Age Rules Validation
    const age = calculateAge(formData.dateNaissance || '');
    if (formData.lien === 'Enfant') {
      if (age > 26) {
        alert("L'enrôlement des enfants est limité aux personnes de 0 à 26 ans révolus selon le règlement.");
        return;
      }
      if (age > 15 && !formData.refIdentityDoc) {
        if (!confirm("Attention: Conformément à la réglementation en vigueur au Burkina Faso, les références d'un document d'identité sont obligatoires pour les enfants de plus de 15 ans. Voulez-vous continuer sans cette référence ?")) {
          return;
        }
      }
      if (age > 21 && !formData.refScolariteDoc) {
        alert("Erreur: Pour les enfants de plus de 21 ans, un certificat ou acte de scolarité valide est strictement obligatoire.");
        return;
      }
    }

    if (editingRequest) {
      // Modification must be submitted for validation
      const updated = editRequest({
        ...editingRequest,
        ...formData,
        membre: formData.membre?.toUpperCase() || '',
        statut: 'Modif. à Valider' // Force re-validation for any edit by user
      } as Request);
      addLog(currentUser.id, `Modification du membre : ${formData.membre?.toUpperCase()} ${formData.prenoms} (Soumis pour validation)`);
    } else {
      addRequest({
        assure: currentUser.name,
        matricule: currentUser.matricule,
        userId: currentUser.id,
        membre: formData.membre?.toUpperCase() || '',
        prenoms: formData.prenoms,
        sexe: formData.sexe as 'M'|'F',
        dateNaissance: formData.dateNaissance,
        lieuNaissance: formData.lieuNaissance,
        gs: formData.gs,
        refIdentityDoc: formData.refIdentityDoc,
        refMarriageCertificate: formData.refMarriageCertificate,
        refScolariteDoc: formData.refScolariteDoc,
        motherName: formData.motherName,
        profession: formData.profession,
        residence: formData.residence,
        telephone: formData.telephone,
        lien: formData.lien || 'Enfant',
        numInformatique: formData.numInformatique,
        numCama: formData.numCama,
        justificatif: formData.justificatif,
        statut: 'En attente'
      });
      addLog(currentUser.id, `Ajout d'un nouveau membre (${formData.lien}) : ${formData.membre?.toUpperCase()} ${formData.prenoms}`);
    }

    refreshData(currentUser.id);
    setShowModal(false);
    setEditingRequest(null);
    setFormData({ 
      membre: '', 
      prenoms: '', 
      sexe: 'M', 
      lien: 'Enfant', 
      dateNaissance: '', 
      lieuNaissance: '',
      gs: 'O+',
      refIdentityDoc: '',
      refMarriageCertificate: '',
      refScolariteDoc: '',
      motherName: '',
      profession: '',
      residence: '',
      telephone: '',
      numInformatique: '', 
      numCama: '', 
      justificatif: '' 
    });
  };

  const handleDelete = (id: string) => {
    if (!currentUser || !window.confirm('Voulez-vous vraiment supprimer ce membre ?')) return;
    const reqToDelete = requests.find(r => r.id === id);
    deleteRequest(id);
    addLog(currentUser.id, `Suppression du membre : ${reqToDelete?.membre} ${reqToDelete?.prenoms}`);
    refreshData(currentUser.id);
  };

  const openEdit = (req: Request) => {
    setEditingRequest(req);
    setFormData(req);
    setShowModal(true);
  };

  const openSuivi = (req: Request) => {
    setSelectedMemberForSuivi(req);
    setShowSuiviModal(true);
  };

  const generatePDF = (member: Request) => {
    if (!currentUser) return;
    setPdfGenerating(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Background decorative frame
      doc.setDrawColor(0, 138, 75); // CAMA Green
      doc.setLineWidth(1);
      doc.rect(5, 5, 200, 287); // Page border

      doc.setDrawColor(239, 43, 45); // Burkina Red
      doc.setLineWidth(0.5);
      doc.rect(7, 7, 196, 283);

      // Top corner designs
      doc.setFillColor(0, 138, 75);
      doc.rect(7, 7, 30, 4, 'F');
      doc.setFillColor(252, 209, 22); // Gold
      doc.rect(37, 7, 20, 4, 'F');
      doc.setFillColor(239, 43, 45);
      doc.rect(57, 7, 30, 4, 'F');

      // Header Text Left: BURKINA FASO
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      doc.text("BURKINA FASO", 15, 20);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.text("Unité - Progrès - Justice", 15, 24);

      // Header Text Right: CAMA
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.text("CAISSE D'ASSURANCE MALADIE", 125, 20);
      doc.text("DES ARMÉES (CAMA)", 125, 24);
      doc.setFont('Helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text("Protection • Solidarité • Santé", 125, 28);

      // Divider Line
      doc.setDrawColor(200, 200, 200);
      doc.line(15, 32, 195, 32);

      // Document Title
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(0, 138, 75); // CAMA Green
      doc.text("RÉCÉPISSÉ OFFICIEL D'ENRÔLEMENT", 105, 45, { align: 'center' });
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')} • N° Dossier: CAMA-${member.id.substring(0, 8).toUpperCase()}`, 105, 50, { align: 'center' });

      // Hologram placeholder box
      doc.setDrawColor(220, 220, 220);
      doc.setFillColor(250, 250, 250);
      doc.rect(155, 58, 40, 40, 'FD');
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(180, 180, 180);
      doc.text("Sceau CAMA", 175, 75, { align: 'center' });
      doc.text("VALIDE EN LIGNE", 175, 80, { align: 'center' });

      // Section 1: MILITARY SPONSOR
      doc.setFillColor(240, 248, 243); // Very light green tint
      doc.rect(15, 58, 135, 40, 'F');
      doc.setDrawColor(0, 138, 75);
      doc.setLineWidth(0.5);
      doc.line(15, 58, 15, 98); // Left heavy border

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(0, 138, 75);
      doc.text("SECTION I : INFORMATIONS DU SOUSCRIPTEUR (MILITAIRE)", 18, 64);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text("Nom & Prénom(s) :", 18, 72);
      doc.text("Matricule :", 18, 77);
      doc.text("Grade / Corps :", 18, 82);
      doc.text("Structure :", 18, 87);
      doc.text("N° Carte CAMA :", 18, 92);

      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(`${currentUser.name.toUpperCase()} ${currentUser.prenoms || ''}`, 50, 72);
      doc.text(`${currentUser.matricule}`, 50, 77);
      doc.text(`${currentUser.grade || '—'} / ${currentUser.corp || '—'}`, 50, 82);
      doc.text(`${currentUser.structArmee || '—'} (${currentUser.structRegion || '—'})`, 50, 87);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(0, 138, 75);
      doc.text(`${currentUser.numCarteCama || 'EN COURS D\'ATTRIBUTION'}`, 50, 92);

      // Section 2: FAMILY MEMBER
      doc.setFillColor(254, 254, 254);
      doc.rect(15, 105, 180, 85, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.rect(15, 105, 180, 85, 'D');

      doc.setFillColor(245, 245, 245);
      doc.rect(15, 105, 180, 8, 'F');
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      doc.text("SECTION II : IDENTIFICATION DE L'AYANT DROIT (FAMILLE)", 18, 110);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text("Lien de Parenté :", 18, 120);
      doc.text("Nom de Famille :", 18, 126);
      doc.text("Prénoms :", 18, 132);
      doc.text("Sexe :", 18, 138);
      doc.text("Date de naissance :", 18, 144);
      doc.text("Lieu de naissance :", 18, 150);
      doc.text("Groupe Sanguin :", 18, 156);
      doc.text("N° Info Solde :", 18, 162);
      doc.text("Statut du dossier :", 18, 168);
      doc.text("Réf. Justificatifs :", 18, 174);

      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`${member.lien.toUpperCase()}`, 60, 120);
      doc.text(`${member.membre.toUpperCase()}`, 60, 126);
      doc.text(`${member.prenoms || ''}`, 60, 132);
      doc.setFont('Helvetica', 'normal');
      doc.text(`${member.sexe === 'F' ? 'FÉMININ (F)' : 'MASCULIN (M)'}`, 60, 138);
      doc.text(`${member.dateNaissance || ''}`, 60, 144);
      doc.text(`${member.lieuNaissance || 'Non spécifié'}`, 60, 150);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(180, 0, 0); // Red blood type
      doc.text(`${member.gs || 'O+'}`, 60, 156);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(`${member.numInformatique || 'N/A'}`, 60, 162);
      
      doc.setFont('Helvetica', 'bold');
      if (member.statut === 'Validé') {
        doc.setTextColor(0, 138, 75);
      } else if (member.statut === 'En attente') {
        doc.setTextColor(200, 150, 0);
      } else {
        doc.setTextColor(239, 43, 45);
      }
      doc.text(`${member.statut.toUpperCase()}`, 60, 168);

      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      let refText = [];
      if (member.refMarriageCertificate) refText.push(`Mariage: ${member.refMarriageCertificate}`);
      if (member.refIdentityDoc) refText.push(`ID: ${member.refIdentityDoc}`);
      if (member.refScolariteDoc) refText.push(`Scolarité: ${member.refScolariteDoc}`);
      if (member.motherName) refText.push(`Mère: ${member.motherName}`);
      doc.text(refText.length > 0 ? refText.join(' | ') : "Aucune référence spécifiée (justificatifs joints)", 60, 174, { maxWidth: 130 });

      // Section 3: VALIDATION LOGS
      doc.setFillColor(254, 254, 254);
      doc.rect(15, 196, 180, 42, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.rect(15, 196, 180, 42, 'D');

      doc.setFillColor(245, 245, 245);
      doc.rect(15, 196, 180, 8, 'F');
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      doc.text("SECTION III : HISTORIQUE DE TRAITEMENT ET VALIDATION", 18, 201);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 100, 100);
      doc.text("Étape 1 : Enregistrement initial", 18, 212);
      doc.text("Étape 2 : Transmission justificatifs", 18, 219);
      doc.text("Étape 3 : Examen d'éligibilité", 18, 226);
      doc.text("Étape 4 : Validation administrative", 18, 233);

      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(0, 138, 75);
      doc.text("SUCCÈS (Compte valide)", 85, 212);
      doc.text(member.justificatif ? "TRANSMIS (Fichier PDF/Image)" : "COMPLÉTÉ (Déclaration manuscrite)", 85, 219);
      
      if (member.statut === 'Validé') {
        doc.setTextColor(0, 138, 75);
        doc.text("CONFORME (Pièces vérifiées)", 85, 226);
        doc.text(`ATTRIBUÉ (${member.numCama || 'CC-' + member.id.substring(0, 5).toUpperCase() + '-BF'})`, 85, 233);
      } else if (member.statut === 'En attente') {
        doc.setTextColor(200, 150, 0);
        doc.text("EN COURS (Examen réglementaire)", 85, 226);
        doc.text("EN ATTENTE DE SIGNATURE", 85, 233);
      } else {
        doc.setTextColor(239, 43, 45);
        doc.text("REJETÉ (Non-conforme)", 85, 226);
        doc.text("DOSSIER CLOTURÉ AVEC ERREUR", 85, 233);
      }

      // Barcode / Footer stamp style
      doc.setDrawColor(50, 50, 50);
      doc.setLineWidth(0.4);
      for (let i = 0; i < 60; i += 2) {
        const w = (i % 3 === 0) ? 1.2 : 0.4;
        doc.setLineWidth(w);
        doc.line(75 + i, 250, 75 + i, 260);
      }
      doc.setFont('Courier', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text(`*CAMA-${member.id.toUpperCase()}*`, 105, 264, { align: 'center' });

      // Legal notice footer
      doc.setFont('Helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text("Ce document tient lieu de certificat d'enrôlement officiel auprès de la CAMA. En cas de contrôle, les informations de ce", 105, 274, { align: 'center' });
      doc.text("récépissé font foi sous réserve de correspondance exacte avec le registre national sécurisé de la CAMA au Burkina Faso.", 105, 278, { align: 'center' });

      // Save PDF
      doc.save(`recepisse_cama_${member.membre.toLowerCase()}_${member.prenoms ? member.prenoms.toLowerCase() : 'ayant_droit'}.pdf`);
      setPdfGenerating(false);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la génération du PDF.");
      setPdfGenerating(false);
    }
  };

  const getStatusBadge = (statut: string) => {
    if (statut === 'Validé') return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-green-100 text-green-800 border border-green-200/50 flex items-center"><CheckCircle className="w-3.5 h-3.5 mr-1" /> {statut}</span>;
    if (statut === 'En attente' || statut === 'Modif. à Valider') return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200/50 flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {statut === 'Modif. à Valider' ? 'Modification en attente' : statut}</span>;
    return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-red-100 text-red-800 border border-red-200/50 flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" /> {statut}</span>;
  };

  // Check if profile has military admin details filled
  const isProfileComplete = currentUser && currentUser.numIup && currentUser.grade && currentUser.structArmee;

  return (
    <div className="min-h-screen bg-slate-50 py-10 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Espace Souscripteur (Militaire)</h1>
            <p className="text-sm text-gray-500 mt-1">Saisissez les fiches d'identification famille (FIF) de vos ayants droit et gérez les documents de prise en charge.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={async () => { 
                setEditingRequest(null); 
                setFormData({ 
                  membre: '', 
                  prenoms: '', 
                  sexe: 'M', 
                  lien: 'Enfant', 
                  dateNaissance: '', 
                  lieuNaissance: '',
                  gs: 'O+',
                  refIdentityDoc: '',
                  refMarriageCertificate: '',
                  refScolariteDoc: '',
                  motherName: '',
                  profession: '',
                  residence: '',
                  telephone: '',
                  numInformatique: '', 
                  numCama: '', 
                  justificatif: '' 
                }); 
                setShowModal(true); 
              }}
              className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-[#008a4b] hover:bg-[#00703c] transition-colors"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Nouveau membre (FIF)
            </button>
            <button 
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </button>
          </div>
        </div>

        {/* Profile incomplete warning banner */}
        {!isProfileComplete && currentUser && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-amber-900 transition-all duration-300">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-extrabold text-sm">Fiche militaire non complétée !</p>
                <p className="text-xs text-amber-800 mt-1">Pour valider l'enrôlement de votre famille, vous devez remplir les informations administratives du militaire titulaire de la carte.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowProfileModal(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-all self-start sm:self-center uppercase tracking-wider"
            >
              Remplir la fiche militaire
            </button>
          </div>
        )}

        {/* User Info Card with military details */}
        {currentUser && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 bg-slate-50 border-l border-b border-gray-200 rounded-bl-xl text-xs font-mono font-bold text-gray-400">
              SECTION 1 : MILITAIRE
            </div>
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="w-16 h-16 rounded-full bg-[#008a4b] flex items-center justify-center text-white text-2xl font-black shadow-inner flex-shrink-0">
                {currentUser.name.charAt(0)}{currentUser.prenoms ? currentUser.prenoms.charAt(0) : ''}
              </div>
              <div className="flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Souscripteur</label>
                    <p className="text-base font-extrabold text-gray-900 uppercase">{currentUser.name} {currentUser.prenoms}</p>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">{currentUser.grade || 'Grade non spécifié'}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Matricule Militaire</label>
                    <p className="text-sm font-bold text-gray-800 font-mono mt-1">{currentUser.matricule}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Catégorie: {currentUser.categorie || '—'}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">N° IUP / CIM</label>
                    <p className="text-sm font-bold text-gray-800 font-mono mt-1">IUP: {currentUser.numIup || 'Non renseigné'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">CIM: {currentUser.numCim || '—'}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Structure de Rattachement</label>
                    <p className="text-sm font-semibold text-gray-800 mt-1">{currentUser.corp}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Armée: {currentUser.structArmee || '—'}</p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-gray-500">
                  <span className="flex items-center"><Phone className="w-4 h-4 mr-1.5 text-gray-400" /> {currentUser.telephones || 'Aucun numéro enregistré'}</span>
                  <span className="flex items-center"><Mail className="w-4 h-4 mr-1.5 text-gray-400" /> {currentUser.email}</span>
                  <span className="flex items-center bg-[#008a4b]/5 px-2 py-0.5 rounded-lg border border-[#008a4b]/10"><ShieldCheck className="w-4 h-4 mr-1.5 text-[#008a4b]" /> N° Dossier CAMA: <strong className="ml-1 text-gray-900 tracking-wider font-black uppercase">{currentUser.numDossier || 'Non Attribué'}</strong></span>
                  <span className="flex items-center"><Shield className="w-4 h-4 mr-1.5 text-gray-400" /> Carte CAMA: <strong className="ml-1 text-[#008a4b]">{currentUser.numCarteCama || 'En cours'}</strong></span>
                  {currentUser.statut === 'Modif. à Valider' && (
                    <span className="flex items-center text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-[10px] border border-amber-100">
                      <Clock className="w-3 h-3 mr-1" /> Modification en attente de validation
                    </span>
                  )}
                  <button 
                    onClick={() => setShowProfileModal(true)}
                    className="ml-auto text-xs font-bold text-[#008a4b] hover:underline"
                  >
                    Modifier ma fiche administrative &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List Card */}
          <div className="lg:col-span-2 bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-gray-200 bg-[#008a4b]/5 flex justify-between items-center flex-shrink-0">
              <div>
                <h3 className="text-lg leading-6 font-bold text-gray-900 uppercase tracking-tight flex items-center gap-2">
                   <IdCard className="w-5 h-5 text-[#008a4b]" />
                   Mon Dossier de Prise en Charge Famille
                </h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Regroupement de tous les ayants droit enregistrés</p>
              </div>
              <span className="bg-[#008a4b] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                {requests.length} Membre(s)
              </span>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left">ID Dossier</th>
                    <th scope="col" className="px-6 py-4 text-left">Identité & Sexe</th>
                    <th scope="col" className="px-6 py-4 text-left">Relation</th>
                    <th scope="col" className="px-6 py-4 text-left">Détails / Document</th>
                    <th scope="col" className="px-6 py-4 text-left">Statut</th>
                    <th scope="col" className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-gray-400">
                        #{member.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-slate-100 border border-gray-200 flex items-center justify-center text-slate-600 font-bold shadow-sm">
                            {member.membre.charAt(0)}{member.prenoms?.charAt(0)}
                          </div>
                          <div className="ml-4 text-left">
                            <div className="text-sm font-extrabold text-gray-900">{member.membre} {member.prenoms}</div>
                            <div className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">Sexe: {member.sexe || 'M'} • Groupe: {member.gs || 'O+'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-bold">
                        <span className="inline-block bg-slate-100 text-slate-800 rounded px-2.5 py-1 text-xs font-extrabold">{member.lien}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs font-semibold text-gray-700 leading-tight">Né le {member.dateNaissance} {member.lieuNaissance && `à ${member.lieuNaissance}`}</div>
                        <div className="text-[10px] text-gray-400 mt-1 flex items-center">
                          {member.justificatif ? (
                            <span className="text-green-600 font-bold flex items-center"><CheckCircle className="w-3.5 h-3.5 mr-1" /> Justificatif joint</span>
                          ) : (
                            <span className="text-amber-500 font-bold flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" /> Aucun justificatif</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(member.statut)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => openSuivi(member)}
                            className="p-1.5 rounded-md bg-green-50 text-[#008a4b] hover:bg-green-100 transition-colors" 
                            title="Suivi détaillé & Évolution"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => generatePDF(member)}
                            className="p-1.5 rounded-md bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors" 
                            title="Télécharger le Récépissé PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openEdit(member)}
                            className="p-1.5 rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors" 
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(member.id)}
                            className="p-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors" 
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
                  {requests.length === 0 && (
                <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
                    <UserPlus className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="font-bold text-gray-800 italic">Votre dossier familial est actuellement vide.</p>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto uppercase font-bold leading-relaxed">
                    Ajoutez vos membres de famille (conjoint, enfants) pour initier leur enrôlement à la CAMA.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Side Column: History */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden flex flex-col h-fit">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
              <History className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg leading-6 font-bold text-gray-900 uppercase tracking-tight">Historique des Actions</h3>
            </div>
            <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto custom-scrollbar text-left">
              {logs.map((log) => (
                <div key={log.id} className="relative pl-6 pb-6 last:pb-0 border-l border-gray-200">
                  <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-[#008a4b] ring-4 ring-white shadow-sm"></div>
                  <p className="text-xs text-gray-400 font-mono font-bold uppercase mb-1">{log.date}</p>
                  <p className="text-sm text-gray-700 font-semibold leading-tight">{log.action}</p>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-center text-gray-400 py-4 italic text-sm font-medium">
                  Aucune action récente.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL AJOUT MEMBRE */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/55 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl text-left overflow-hidden shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col transition-all duration-300">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center border-b border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <IdCard className="w-5.5 h-5.5 text-yellow-400" />
                <div>
                  <h3 className="font-extrabold text-base uppercase">
                    {editingRequest ? 'Modifier le membre de famille' : 'Enrôler un nouveau membre de famille'}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Section 2 & 3 de la Fiche d'identification Famille (FIF)</p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 px-2.5 rounded-full text-white/80 hover:text-white bg-white/10 hover:bg-white/20 font-black text-sm transition-colors"
              >
                ×
              </button>
            </div>

            <div className="bg-white px-6 py-6 overflow-y-auto flex-1 custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Lien de parenté first to configure fields */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Lien de parenté *</label>
                  <select 
                    value={formData.lien || 'Enfant'} 
                    onChange={e => setFormData({...formData, lien: e.target.value})} 
                    className="mt-1 block w-full bg-white border border-gray-300 text-gray-900 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#008a4b]/20 focus:border-[#008a4b] font-bold sm:text-sm"
                  >
                    <option value="Conjoint">Conjoint (Marié(e) à la mairie uniquement)</option>
                    <option value="Enfant">Enfant (De 0 à 26 ans)</option>
                    <option value="Parent">Parent ascendant</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Nom (En Majuscules) *</label>
                    <input required type="text" value={formData.membre || ''} onChange={e => setFormData({...formData, membre: e.target.value})} className="mt-1 block w-full border border-gray-300 bg-white text-gray-900 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#008a4b] sm:text-sm font-bold uppercase" placeholder="Ex: KABORE" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Prénoms *</label>
                    <input required type="text" value={formData.prenoms || ''} onChange={e => setFormData({...formData, prenoms: e.target.value})} className="mt-1 block w-full border border-gray-300 bg-white text-gray-900 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#008a4b] sm:text-sm font-bold" placeholder="Ex: Fatimata" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Date de naissance *</label>
                    <input required type="date" value={formData.dateNaissance || ''} onChange={e => setFormData({...formData, dateNaissance: e.target.value})} className="mt-1 block w-full border border-gray-300 bg-white text-gray-900 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#008a4b] sm:text-sm font-bold font-mono" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Sexe</label>
                    <select value={formData.sexe || 'M'} onChange={e => setFormData({...formData, sexe: e.target.value as 'M'|'F'})} className="mt-1 block w-full bg-white border border-gray-300 text-gray-900 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#008a4b] sm:text-sm font-bold">
                      <option value="M">Masculin (M)</option>
                      <option value="F">Féminin (F)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Lieu de naissance *</label>
                    <input required type="text" value={formData.lieuNaissance || ''} onChange={e => setFormData({...formData, lieuNaissance: e.target.value})} className="mt-1 block w-full border border-gray-300 bg-white text-gray-900 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#008a4b] sm:text-sm font-bold" placeholder="Ex: Ouagadougou" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Groupe Sanguin (G.S.) *</label>
                    <select value={formData.gs || 'O+'} onChange={e => setFormData({...formData, gs: e.target.value})} className="mt-1 block w-full bg-white border border-gray-300 text-gray-900 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#008a4b] sm:text-sm font-bold">
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
                </div>

                {/* DYNAMIC CONJOINT FIELDS */}
                {formData.lien === 'Conjoint' && (
                  <div className="border-l-4 border-yellow-500 pl-4 space-y-4 py-1 transition-all duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Réf. Acte de mariage *</label>
                        <input required type="text" value={formData.refMarriageCertificate || ''} onChange={e => setFormData({...formData, refMarriageCertificate: e.target.value})} className="block w-full border border-gray-300 bg-white text-gray-900 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#008a4b] sm:text-sm font-bold" placeholder="Ex: N° 583-2026/Ouaga" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Références document d'identité *</label>
                        <input required type="text" value={formData.refIdentityDoc || ''} onChange={e => setFormData({...formData, refIdentityDoc: e.target.value})} className="block w-full border border-gray-300 bg-white text-gray-900 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#008a4b] sm:text-sm font-bold" placeholder="Ex: CNIB N° B1592831" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Profession *</label>
                        <input required type="text" value={formData.profession || ''} onChange={e => setFormData({...formData, profession: e.target.value})} className="block w-full border border-gray-300 bg-white text-gray-900 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#008a4b] sm:text-sm font-bold" placeholder="Ex: Commerçante" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Lieu de résidence *</label>
                        <input required type="text" value={formData.residence || ''} onChange={e => setFormData({...formData, residence: e.target.value})} className="block w-full border border-gray-300 bg-white text-gray-900 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#008a4b] sm:text-sm font-bold" placeholder="Ex: Koudougou Secteur 3" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Téléphone de contact *</label>
                      <input 
                        required 
                        type="tel" 
                        value={formData.telephone || ''} 
                        onChange={e => {
                          const val = e.target.value;
                          if (/^[0-9\s+\-()]*$/.test(val)) {
                            setFormData({...formData, telephone: val});
                          }
                        }} 
                        className="block w-full border border-gray-300 bg-white text-gray-900 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#008a4b] sm:text-sm font-bold font-mono" 
                        placeholder="Ex: +226 70 00 11 22" 
                      />
                    </div>
                  </div>
                )}

                {/* DYNAMIC ENFANT FIELDS */}
                {formData.lien === 'Enfant' && (
                  <div className="border-l-4 border-blue-500 pl-4 space-y-4 py-1 transition-all duration-300">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Nom et Prénoms de la Mère (ou Père si militaire féminin) *</label>
                      <input required type="text" value={formData.motherName || ''} onChange={e => setFormData({...formData, motherName: e.target.value})} className="block w-full border border-gray-300 bg-white text-gray-900 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#008a4b] sm:text-sm font-bold" placeholder="Ex: COMPAORE Alimata" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Téléphone Enfant / Tuteur</label>
                        <input 
                          type="tel" 
                          value={formData.telephone || ''} 
                          onChange={e => {
                            const val = e.target.value;
                            if (/^[0-9\s+\-()]*$/.test(val)) {
                              setFormData({...formData, telephone: val});
                            }
                          }} 
                          className="block w-full border border-gray-300 bg-white text-gray-900 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#008a4b] sm:text-sm font-bold font-mono" 
                          placeholder="Ex: +226 56 12 34 56" 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Réf. Document d'identité (Obligatoire si +15 ans)</label>
                        <input 
                          type="text" 
                          required={calculateAge(formData.dateNaissance || '') > 15}
                          value={formData.refIdentityDoc || ''} 
                          onChange={e => setFormData({...formData, refIdentityDoc: e.target.value})} 
                          className="block w-full border border-gray-300 bg-white text-gray-900 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#008a4b] sm:text-sm font-bold" 
                          placeholder="Ex: CNIB N° B88273" 
                        />
                      </div>
                    </div>

                    {calculateAge(formData.dateNaissance || '') > 21 && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-bold text-red-700">
                        <label className="block text-[10px] uppercase tracking-wider text-red-500 mb-1">Réf. Certificat de scolarité (Obligatoire pour enfants de +21 ans) *</label>
                        <input 
                          required 
                          type="text" 
                          value={formData.refScolariteDoc || ''} 
                          onChange={e => setFormData({...formData, refScolariteDoc: e.target.value})} 
                          className="block w-full border border-red-300 bg-white text-gray-900 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 sm:text-sm font-bold" 
                          placeholder="Ex: Certificat Scolaire N° 993-2026/UJKZ" 
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">N° Informatique Solde (Si dispo)</label>
                    <input type="text" value={formData.numInformatique || ''} onChange={e => setFormData({...formData, numInformatique: e.target.value})} className="mt-1 block w-full border border-gray-300 bg-white text-gray-900 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#008a4b] sm:text-sm font-bold font-mono" placeholder="Ex: 887221" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">N° Carte CAMA (Saisi par l'administration)</label>
                    <input disabled type="text" value={formData.numCama || ''} className="mt-1 block w-full border border-gray-200 bg-gray-50 text-gray-450 rounded-lg shadow-sm py-2 px-3 focus:outline-none sm:text-sm font-bold font-mono cursor-not-allowed" placeholder="Attribué après validation" />
                  </div>
                </div>

                {/* Justificatif Upload */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Pièce(s) d'État Civil Justificative(s) (Acte de naissance, acte de mariage, etc.) *</label>
                  
                  {formData.justificatif && getFilesList(formData.justificatif).length > 0 ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {getFilesList(formData.justificatif).map((fileSrc, idx) => (
                          <div key={idx} className="relative border border-gray-200 rounded-xl p-2 bg-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <div className="w-10 h-10 rounded border border-gray-300 overflow-hidden bg-white flex items-center justify-center flex-shrink-0">
                                {isPdf(fileSrc) ? (
                                  <FileText className="w-6 h-6 text-red-500" />
                                ) : (
                                  <img 
                                    src={fileSrc} 
                                    alt={`Aperçu ${idx + 1}`} 
                                    className="w-full h-full object-cover" 
                                    referrerPolicy="no-referrer"
                                  />
                                )}
                              </div>
                              <span className="text-[10px] font-bold text-gray-600 truncate">
                                {isPdf(fileSrc) ? 'Justificatif.pdf' : `Image_${idx + 1}.png`}
                              </span>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => {
                                const current = getFilesList(formData.justificatif);
                                current.splice(idx, 1);
                                setFormData({
                                  ...formData, 
                                  justificatif: current.length > 0 ? JSON.stringify(current) : ''
                                });
                              }} 
                              className="text-red-500 hover:text-red-700 p-1.5 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
                              title="Supprimer ce fichier"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      <div className="border border-dashed border-gray-200 rounded-xl p-3 text-center group relative hover:bg-green-50/50 transition cursor-pointer">
                        <span className="text-xs text-[#008a4b] font-bold">+ Ajouter d'autres pièces</span>
                        <input type="file" multiple onChange={handleFileChange} accept="image/*,application/pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center group relative hover:bg-green-50/50 transition cursor-pointer">
                      <Upload className="mx-auto h-9 w-9 text-gray-300 group-hover:text-[#008a4b] transition-colors" />
                      <div className="mt-2 text-xs text-gray-650">
                        <span className="text-[#008a4b] font-extrabold">Téléverser les pièces justificatives</span>
                        <p className="text-[9px] uppercase font-bold text-gray-450 mt-1">Glissez-déposez ou cliquez (Images / PDFs, max 2Mo par fichier)</p>
                      </div>
                      <input type="file" multiple onChange={handleFileChange} accept="image/*,application/pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    </div>
                  )}
                </div>
                
                <div className="pt-6 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-gray-100">
                  <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl shadow-sm text-xs font-black text-gray-500 bg-white hover:bg-gray-50 transition-colors uppercase tracking-wider">
                    Annuler
                  </button>
                  <button type="submit" className="px-5 py-2.5 border border-transparent rounded-xl shadow-md text-xs font-black text-white bg-[#008a4b] hover:bg-[#00703c] transition-colors uppercase tracking-wider">
                    {editingRequest ? 'Enregistrer les modifications' : 'Soumettre le dossier (FIF)'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FICHE ADMINISTRATIVE MILITAIRE (SECTION 1) */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/55 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl text-left overflow-hidden shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col transition-all duration-300">
            <div className="bg-gradient-to-r from-[#008a4b] to-[#015f34] text-white px-6 py-4 flex justify-between items-center border-b border-[#015f34] flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5.5 h-5.5 text-yellow-300" />
                <div>
                  <h3 className="font-extrabold text-base uppercase" id="profile-modal-title">
                    Informations Administratives du Militaire
                  </h3>
                  <p className="text-[10px] text-green-100 font-bold uppercase mt-0.5">Section 1 de la Fiche d'identification Famille (FIF)</p>
                </div>
              </div>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="p-1 px-2.5 rounded-full text-white/80 hover:text-white bg-white/10 hover:bg-white/20 font-black text-sm transition-colors"
              >
                ×
              </button>
            </div>

            <div className="bg-white px-6 py-6 overflow-y-auto flex-1 custom-scrollbar">
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Nom (Militaire) *</label>
                    <input required type="text" value={profileData.name || ''} onChange={e => setProfileData({...profileData, name: e.target.value})} className="mt-1 block w-full border border-gray-300 bg-white text-gray-900 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#008a4b] sm:text-sm font-bold uppercase" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Prénoms (Militaire) *</label>
                    <input required type="text" value={profileData.prenoms || ''} onChange={e => setProfileData({...profileData, prenoms: e.target.value})} className="mt-1 block w-full border border-gray-300 bg-white text-gray-900 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#008a4b] sm:text-sm font-bold" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Sexe</label>
                    <select value={profileData.sexe || 'M'} onChange={e => setProfileData({...profileData, sexe: e.target.value as 'M'|'F'})} className="mt-1 block w-full bg-white border border-gray-300 text-gray-900 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#008a4b] sm:text-sm font-bold">
                      <option value="M">Masculin (M)</option>
                      <option value="F">Féminin (F)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Matricule Militaire *</label>
                    <input required type="text" value={profileData.matricule || ''} onChange={e => setProfileData({...profileData, matricule: e.target.value})} className="mt-1 block w-full border border-gray-300 bg-white text-gray-900 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#008a4b] sm:text-sm font-bold font-mono" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">N° Informatique *</label>
                    <input required type="text" value={profileData.numInformatique || ''} onChange={e => setProfileData({...profileData, numInformatique: e.target.value})} className="mt-1 block w-full border border-gray-300 bg-white text-gray-900 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#008a4b] sm:text-sm font-bold font-mono" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Grade *</label>
                    <input required type="text" value={profileData.grade || ''} onChange={e => setProfileData({...profileData, grade: e.target.value})} className="mt-1 block w-full border border-gray-300 bg-white text-gray-900 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#008a4b] sm:text-sm font-bold" placeholder="Ex: Sergent" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Catégorie *</label>
                    <input required type="text" value={profileData.categorie || ''} onChange={e => setProfileData({...profileData, categorie: e.target.value})} className="mt-1 block w-full border border-gray-300 bg-white text-gray-900 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#008a4b] sm:text-sm font-bold" placeholder="Ex: Sous-Officier" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">N° CIM</label>
                    <input type="text" value={profileData.numCim || ''} onChange={e => setProfileData({...profileData, numCim: e.target.value})} className="mt-1 block w-full border border-gray-300 bg-white text-gray-900 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#008a4b] sm:text-sm font-bold font-mono" placeholder="Ex: CIM-2026/Ouaga" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">N° Carte CAMA</label>
                    <input type="text" value={profileData.numCarteCama || ''} onChange={e => setProfileData({...profileData, numCarteCama: e.target.value})} className="mt-1 block w-full border border-gray-300 bg-white text-gray-900 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#008a4b] sm:text-sm font-bold font-mono" placeholder="Ex: CC-9921-BF" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">N° IUP *</label>
                    <input required type="text" value={profileData.numIup || ''} onChange={e => setProfileData({...profileData, numIup: e.target.value})} className="mt-1 block w-full border border-gray-300 bg-white text-gray-900 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#008a4b] sm:text-sm font-bold font-mono" placeholder="Identifiant Unique de la Personne" />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3">
                  <span className="text-xs font-extrabold text-gray-600 block mb-2 uppercase tracking-wide">Structure de rattachement</span>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Armée *</label>
                      <input required type="text" value={profileData.structArmee || ''} onChange={e => setProfileData({...profileData, structArmee: e.target.value})} className="block w-full border border-gray-300 bg-white text-gray-900 rounded-lg shadow-sm py-1.5 px-2.5 focus:outline-none focus:ring-[#008a4b] sm:text-xs font-bold" placeholder="Ex: Armée de Terre" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Région *</label>
                      <input required type="text" value={profileData.structRegion || ''} onChange={e => setProfileData({...profileData, structRegion: e.target.value})} className="block w-full border border-gray-300 bg-white text-gray-900 rounded-lg shadow-sm py-1.5 px-2.5 focus:outline-none focus:ring-[#008a4b] sm:text-xs font-bold" placeholder="Ex: 1ère Région Militaire" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Corps *</label>
                      <input required type="text" value={profileData.structCorps || ''} onChange={e => setProfileData({...profileData, structCorps: e.target.value})} className="block w-full border border-gray-300 bg-white text-gray-900 rounded-lg shadow-sm py-1.5 px-2.5 focus:outline-none focus:ring-[#008a4b] sm:text-xs font-bold" placeholder="Ex: 11ème RIC" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Service</label>
                      <input type="text" value={profileData.structService || ''} onChange={e => setProfileData({...profileData, structService: e.target.value})} className="block w-full border border-gray-300 bg-white text-gray-900 rounded-lg shadow-sm py-1.5 px-2.5 focus:outline-none focus:ring-[#008a4b] sm:text-xs font-bold" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Section</label>
                      <input type="text" value={profileData.structSection || ''} onChange={e => setProfileData({...profileData, structSection: e.target.value})} className="block w-full border border-gray-300 bg-white text-gray-900 rounded-lg shadow-sm py-1.5 px-2.5 focus:outline-none focus:ring-[#008a4b] sm:text-xs font-bold" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Sous-Section</label>
                      <input type="text" value={profileData.structSousSection || ''} onChange={e => setProfileData({...profileData, structSousSection: e.target.value})} className="block w-full border border-gray-300 bg-white text-gray-900 rounded-lg shadow-sm py-1.5 px-2.5 focus:outline-none focus:ring-[#008a4b] sm:text-xs font-bold" />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3">
                  <span className="text-xs font-extrabold text-gray-600 block mb-2 uppercase tracking-wide">Contacts & Urgences</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Téléphones Militaire *</label>
                      <input 
                        required 
                        type="tel" 
                        value={profileData.telephones || ''} 
                        onChange={e => {
                          const val = e.target.value;
                          if (/^[0-9\s+\-()]*$/.test(val)) {
                            setProfileData({...profileData, telephones: val});
                          }
                        }} 
                        className="block w-full border border-gray-300 bg-white text-gray-900 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#008a4b] sm:text-sm font-bold font-mono" 
                        placeholder="+226 70001122" 
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Personne à prévenir *</label>
                      <input required type="text" value={profileData.personneAPrevenir || ''} onChange={e => setProfileData({...profileData, personneAPrevenir: e.target.value})} className="block w-full border border-gray-300 bg-white text-gray-900 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#008a4b] sm:text-sm font-bold" placeholder="Nom Prénom conjoint/frère..." />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Téléphone à prévenir *</label>
                      <input 
                        required 
                        type="tel" 
                        value={profileData.personneAPrevenirTel || ''} 
                        onChange={e => {
                          const val = e.target.value;
                          if (/^[0-9\s+\-()]*$/.test(val)) {
                            setProfileData({...profileData, personneAPrevenirTel: val});
                          }
                        }} 
                        className="block w-full border border-gray-300 bg-white text-gray-900 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#008a4b] sm:text-sm font-bold font-mono" 
                        placeholder="+226 75001122" 
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-gray-100">
                  <button type="button" onClick={() => setShowProfileModal(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl shadow-sm text-xs font-black text-gray-500 bg-white hover:bg-gray-50 transition-colors uppercase tracking-wider">
                    Annuler
                  </button>
                  <button type="submit" className="px-5 py-2.5 border border-transparent rounded-xl shadow-md text-xs font-black text-white bg-[#008a4b] hover:bg-[#00703c] transition-colors uppercase tracking-wider">
                    Enregistrer ma fiche militaire
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Suivi Détaillé de l'Enrôlement */}
      {showSuiviModal && selectedMemberForSuivi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-5 bg-[#008a4b] text-white flex justify-between items-center flex-shrink-0">
              <div className="text-left">
                <h3 className="text-lg font-bold">Suivi d'Enrôlement CAMA</h3>
                <p className="text-xs text-green-100 font-medium">Dossier de {selectedMemberForSuivi.membre} {selectedMemberForSuivi.prenoms || ''} ({selectedMemberForSuivi.lien})</p>
              </div>
              <button 
                onClick={() => setShowSuiviModal(false)}
                className="text-white hover:text-green-200 transition-colors text-xl font-black"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
              {/* Stepper Steps */}
              <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 pl-6">
                
                {/* Step 1 */}
                <div className="relative">
                  <span className="absolute -left-9 top-0.5 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold ring-4 ring-white shadow-sm">
                    ✓
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Étape 1 : Enregistrement initial</h4>
                    <p className="text-xs text-gray-500 mt-1">Dossier créé et enregistré sur le portail d'enrôlement militaire CAMA.</p>
                    <p className="text-[10px] font-mono text-[#008a4b] font-bold mt-1">✓ Terminé le {selectedMemberForSuivi.date || new Date().toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <span className={`absolute -left-9 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ring-4 ring-white shadow-sm ${
                    selectedMemberForSuivi.justificatif ? 'bg-green-500' : 'bg-amber-500'
                  }`}>
                    ✓
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Étape 2 : Transmission des pièces justificatives</h4>
                    <p className="text-xs text-gray-500 mt-1">Analyse des pièces requises pour le conjoint (acte de mariage) ou les enfants (extrait de naissance/certificat de scolarité).</p>
                    {selectedMemberForSuivi.justificatif ? (
                      <p className="text-[10px] font-mono text-green-600 font-bold mt-1">✓ Fichier justificatif vérifié & archivé avec succès</p>
                    ) : (
                      <p className="text-[10px] font-mono text-amber-600 font-bold mt-1">⚠ Déclaration sur l'honneur (justificatif à présenter physiquement)</p>
                    )}
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative">
                  <span className={`absolute -left-9 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ring-4 ring-white shadow-sm ${
                    selectedMemberForSuivi.statut === 'Validé' 
                      ? 'bg-green-500' 
                      : selectedMemberForSuivi.statut === 'Rejeté' 
                        ? 'bg-red-500' 
                        : 'bg-blue-500 animate-pulse'
                  }`}>
                    {selectedMemberForSuivi.statut === 'Validé' ? '✓' : selectedMemberForSuivi.statut === 'Rejeté' ? '✕' : '⏳'}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Étape 3 : Examen d'éligibilité par la Direction CAMA</h4>
                    <p className="text-xs text-gray-500 mt-1">Le dossier réglementaire est examiné par le comité d'éligibilité médicale et militaire.</p>
                    {selectedMemberForSuivi.statut === 'Validé' && (
                      <p className="text-[10px] font-mono text-green-600 font-bold mt-1">✓ Statut : Éligible et validé pour couverture santé intégrale</p>
                    )}
                    {(selectedMemberForSuivi.statut === 'En attente' || selectedMemberForSuivi.statut === 'Modif. à Valider') && (
                      <p className="text-[10px] font-mono text-blue-600 font-bold mt-1 animate-pulse">⏳ Statut : {selectedMemberForSuivi.statut === 'Modif. à Valider' ? 'Modification en cours d\'analyse...' : 'En cours d\'analyse réglementaire...'}</p>
                    )}
                    {selectedMemberForSuivi.statut === 'Rejeté' && (
                      <div className="mt-1 bg-red-50 p-2.5 rounded-lg border border-red-100">
                        <p className="text-[10px] font-mono text-red-600 font-bold">✕ Statut : Dossier rejeté</p>
                        {selectedMemberForSuivi.rejectionReason && (
                          <p className="text-xs text-red-700 font-medium mt-1">Motif : {selectedMemberForSuivi.rejectionReason}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 4 */}
                <div className="relative">
                  <span className={`absolute -left-9 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ring-4 ring-white shadow-sm ${
                    selectedMemberForSuivi.statut === 'Validé' 
                      ? 'bg-green-500' 
                      : selectedMemberForSuivi.statut === 'Rejeté' 
                        ? 'bg-red-500' 
                        : 'bg-gray-300'
                  }`}>
                    {selectedMemberForSuivi.statut === 'Validé' ? '✓' : selectedMemberForSuivi.statut === 'Rejeté' ? '✕' : '4'}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Étape 4 : Validation administrative & attribution de carte</h4>
                    <p className="text-xs text-gray-500 mt-1">Saisie finale, signature de la carte CAMA d'assuré et attribution du numéro national d'ayant droit.</p>
                    {selectedMemberForSuivi.statut === 'Validé' && (
                      <div className="mt-2 bg-green-50 p-3 rounded-lg border border-green-100">
                        <p className="text-xs text-green-800 font-bold">Numéro de carte CAMA attribué :</p>
                        <p className="text-base font-extrabold text-[#008a4b] font-mono tracking-wider mt-1">
                          {selectedMemberForSuivi.numCama || 'CC-' + selectedMemberForSuivi.id.substring(0, 5).toUpperCase() + '-BF'}
                        </p>
                        <p className="text-[9px] text-gray-500 mt-1">Cette carte physique vous sera transmise via votre direction ou corps militaire.</p>
                      </div>
                    )}
                    {selectedMemberForSuivi.statut === 'En attente' && (
                      <p className="text-[10px] font-mono text-gray-500 font-bold mt-1">⏳ En attente de signature par le Directeur Général de la CAMA</p>
                    )}
                    {selectedMemberForSuivi.statut === 'Rejeté' && (
                      <p className="text-[10px] font-mono text-red-500 font-bold mt-1">✕ Traitement annulé pour non-conformité réglementaire</p>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-between gap-3 flex-shrink-0">
              <button 
                onClick={() => setShowSuiviModal(false)}
                className="px-5 py-2.5 border border-slate-200 rounded-xl font-bold text-xs text-slate-500 bg-white hover:bg-slate-50 transition-colors uppercase tracking-wider"
              >
                Fermer
              </button>
              
              <button 
                onClick={() => generatePDF(selectedMemberForSuivi)}
                disabled={pdfGenerating}
                className="px-5 py-2.5 border border-transparent rounded-xl shadow-md font-black text-xs text-white bg-[#008a4b] hover:bg-[#00703c] transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <Download className="w-4 h-4" />
                {pdfGenerating ? "Génération..." : "Télécharger le Récépissé PDF"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
