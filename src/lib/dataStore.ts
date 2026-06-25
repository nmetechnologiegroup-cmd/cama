// Unified local storage based data store for the CAMA app

export interface ModificationTrace {
  id: string;
  field: string;
  oldValue: string;
  newValue: string;
  date: string;
  author: string;
}

export interface Request {
  id: string;
  assure: string;
  matricule: string;
  membre: string;
  prenoms?: string;
  sexe?: 'M' | 'F';
  dateNaissance?: string;
  lieuNaissance?: string;
  gs?: string; // Blood Group (Groupe Sanguin: A+, B+, etc.)
  refIdentityDoc?: string; // Identity card / document reference
  refMarriageCertificate?: string; // Acte de mariage reference
  refScolariteDoc?: string; // Acte/certificat de scolarité reference
  motherName?: string; // Mother's name (or father's name)
  profession?: string;
  residence?: string;
  telephone?: string;
  lien: string; // Conjoint, Enfant, Parent, Autre
  date: string;
  statut: 'En attente' | 'Validé' | 'Rejeté' | 'Modif. à Valider';
  numInformatique?: string;
  numCama?: string;
  justificatif?: string;
  rejectionReason?: string;
  documentImage?: string;
  userId?: number;
  emailNotificationSent?: boolean;
  modificationTraces?: ModificationTrace[];
}

export interface User {
  id: number;
  name: string;
  matricule: string;
  corp: string;
  email: string;
  password?: string;
  status: 'Actif' | 'Inactif';
  phone?: string;
  address?: string;
  // Extra fields from Section 1 (Military Admin Info)
  prenoms?: string;
  sexe?: 'M' | 'F';
  numInformatique?: string;
  grade?: string;
  categorie?: string;
  numCim?: string;
  numCarteCama?: string;
  numIup?: string;
  structArmee?: string;
  structRegion?: string;
  structCorps?: string;
  structService?: string;
  structSection?: string;
  structSousSection?: string;
  telephones?: string;
  personneAPrevenir?: string;
  personneAPrevenirTel?: string;
  statut?: 'Validé' | 'Modif. à Valider';
  pendingModifications?: Partial<User>;
  modificationTraces?: ModificationTrace[];
  numDossier?: string;
  numDossierHistory?: { date: string, author: string, oldValue: string, newValue: string, reason: string }[];
}

export interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables: string[]; // e.g. ['{{NOM}}', '{{NUM_DOSSIER}}', '{{MOTIF}}']
}

export interface ActionLog {
  id: string;
  userId: number;
  action: string;
  date: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  status: 'Actif' | 'Inactif';
  role: 'Super Admin' | 'Gestionnaire Dossiers' | 'Éditeur Actualités' | 'Responsable Réseau';
  permissions: string[]; // e.g. 'site_settings', 'dossiers', 'users', 'centres', 'news'
  createdDate: string;
}

export interface Centre {
  id: number;
  nom: string;
  ville: string;
  type: string;
}

export interface Article {
  id: number;
  title: string;
  date: string;
  status: 'Publié' | 'Brouillon';
  author: string;
  category?: string;
  content?: string;
  image?: string;
}

export interface SitePrestation {
  title: string;
  label: string;
  desc: string;
}

export interface SiteService {
  name: string;
  color: string;
  iconType: string;
  url?: string;
  imageUrl?: string;
  emoji?: string;
}

export interface SitePartner {
  id: number;
  name: string;
  logo?: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
}

export interface SiteStatistic {
  id: string;
  val: string;
  label: string;
  iconType: string;
}

export interface FAQItem {
  id: number;
  q: string;
  a: string;
  active?: boolean;
}

export interface SiteWebSettings {
  popupTitle: string;
  popupSubtitle: string;
  popupContent: string;
  popupActive: boolean;
  popupImage: string;
  popupMaxViews: number;
  dossierIdFormat?: string;
  prestations: SitePrestation[];
  dgName: string;
  dgMessage: string;
  dgCitation: string;
  dgImage: string;
  faqs?: FAQItem[];
  activeSections?: {
    prestations: boolean;
    services: boolean;
    dgMessage: boolean;
    statistics: boolean;
    testimonials: boolean;
    faq: boolean;
    partners: boolean;
    socials: boolean;
  };
  aboutContent?: {
    heroTitle?: string;
    heroSubtitle?: string;
    heroImage?: string;
    missionTitle?: string;
    missionDesc?: string;
    visionTitle?: string;
    visionDesc?: string;
    historyTitle?: string;
    historyDesc1?: string;
    historyDesc2?: string;
    historyImage?: string;
  };
  statistics?: SiteStatistic[];
  stat1_label?: string;
  stat1_val?: string;
  stat2_label?: string;
  stat2_val?: string;
  stat3_label?: string;
  stat3_val?: string;
  stat4_label?: string;
  stat4_val?: string;
  stats_savoir_plus_url: string;
  logoUrl?: string;
  logoWidth?: number;
  siteTitle?: string;
  siteSlogan?: string;
  visionContent?: string;
  rgpdContent?: string;
  flashInfos?: string[];
  showFlashInfos?: boolean;
  emailSettings?: {
    smtpHost: string;
    smtpPort: string;
    smtpUser: string;
    smtpPass: string;
    smtpSecure: boolean;
    imapHost: string;
    imapPort: string;
    imapUser: string;
    imapPass: string;
    fromEmail: string;
    fromName: string;
  };
  notificationTemplates?: {
    dossierCreated: { subject: string; body: string };
    statusChanged: { subject: string; body: string };
    dossierValidated: { subject: string; body: string };
    dossierRejected: { subject: string; body: string };
  };
  services: SiteService[];
  facebookPageUrl: string;
  facebookFeedText?: string;
  facebookFeedImage?: string;
  facebookFollowers?: string;
  testimonialHeroImage?: string;
  testimonialHeroTitle?: string;
  testimonialHeroSubtitle?: string;
  qualityCitation: string;
  qualityAuthor: string;
  testimonials?: Testimonial[];
  partners: SitePartner[];
  heroImage?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroBgWatermarkOpacity?: number;
  menuVisibility?: {
    about: boolean;
    services: boolean;
    news: boolean;
    contact: boolean;
    vision: boolean;
    rgpd: boolean;
  };
  sectionTitles?: {
    prestations: string;
    services: string;
  };
  footer?: {
    copyright: string;
    liensRapides: { label: string, url: string }[];
    espaceNumerique: { label: string, url: string }[];
    contactTitle: string;
    address: string;
    phone: string;
    email: string;
    description?: string;
    badgeText?: string;
  };
}

const DEFAULT_REQUESTS: Request[] = [
  { id: '1021', assure: 'KABORE Idrissa', matricule: 'M-5421', membre: 'KABORE Alimata', prenoms: 'Sali', sexe: 'F', dateNaissance: '1992-05-12', lieuNaissance: 'Ouagadougou', gs: 'A+', motherName: 'OUEDRAOGO Fatoumata', profession: 'Commerçante', residence: 'Pissy, Ouagadougou', telephone: '+226 70 21 00 11', lien: 'Conjoint', date: '21 Juin 2026', statut: 'En attente', refMarriageCertificate: 'ACT-2021-992-M' },
  { id: '1022', assure: 'DIALLO Yaya', matricule: 'M-8832', membre: 'DIALLO Oumar', lien: 'Enfant', date: '20 Juin 2026', statut: 'Validé' },
  { id: '1023', assure: 'TRAORE Aïcha', matricule: 'M-1129', membre: 'TRAORE Fanta', lien: 'Parent', date: '18 Juin 2026', statut: 'En attente' },
  { id: '1024', assure: 'COMPAORE Seydou', matricule: 'M-3004', membre: 'COMPAORE Abdoul', lien: 'Enfant', date: '15 Juin 2026', statut: 'Rejeté' },
  { id: '1025', assure: 'OUEDRAOGO Paul', matricule: 'M-4201', membre: 'OUEDRAOGO Marie', lien: 'Conjoint', date: '14 Juin 2026', statut: 'Validé' },
];

const DEFAULT_USERS: User[] = [
  { id: 1, name: "KABORE Idrissa", matricule: "M-5421", corp: "Armée de Terre", email: "i.kabore@armee.bf", status: "Actif" },
  { id: 2, name: "DIALLO Yaya", matricule: "M-8832", corp: "Gendarmerie Nationale", email: "y.diallo@armee.bf", status: "Actif" },
  { id: 3, name: "TRAORE Aïcha", matricule: "M-1129", corp: "Armée de l'Air", email: "a.traore@armee.bf", status: "Inactif" },
];

const DEFAULT_ADMINS: AdminUser[] = [
  {
    id: 1,
    name: "Général de Brigade Lassane",
    email: "superadmin@cama.bf",
    status: 'Actif',
    role: 'Super Admin',
    permissions: ['site_settings', 'dossiers', 'users', 'centres', 'news', 'settings'],
    createdDate: '12 Janvier 2026'
  },
  {
    id: 2,
    name: "Colonel Commandant Sanou",
    email: "gestionnaire@cama.bf",
    status: 'Actif',
    role: 'Gestionnaire Dossiers',
    permissions: ['dossiers', 'centres'],
    createdDate: '18 Février 2026'
  },
  {
    id: 3,
    name: "Capitaine Sawadogo",
    email: "editeur@cama.bf",
    status: 'Actif',
    role: 'Éditeur Actualités',
    permissions: ['news', 'site_settings'],
    createdDate: '01 Avril 2026'
  }
];

const DEFAULT_CENTRES: Centre[] = [
  { id: 1, nom: "Centre Médical Camp Guillaume", ville: "Ouagadougou", type: "Public" },
  { id: 2, nom: "Clinique Notre Dame de la Paix", ville: "Ouagadougou", type: "Privé Conventionné" },
  { id: 3, nom: "Pharmacie de la Nation", ville: "Bobo-Dioulasso", type: "Pharmacie" },
  { id: 4, nom: "Hôpital Militaire", ville: "Ouagadougou", type: "Public" },
];

const DEFAULT_ARTICLES: Article[] = [
  { 
    id: 1, 
    title: "Lancement officiel de la plateforme", 
    date: "18 Juin 2026", 
    status: "Publié", 
    author: "Communication", 
    category: "Événement Majeur",
    content: "Sous la Présidence du Ministre d’Etat, Ministre de la Défense, lancement officiel des activités de la CAMA. Découvrez les fiches d'enrôlement et bénéficiez de vos prises en charge.",
    image: "https://images.unsplash.com/photo-1579548122080-c11707ea8211?q=80&w=600&auto=format&fit=crop"
  },
  { 
    id: 2, 
    title: "Ajout de 15 nouvelles cliniques au réseau", 
    date: "10 Juin 2026", 
    status: "Publié", 
    author: "Dir. Santé", 
    category: "Réseau Santé",
    content: "Afin de garantir un meilleur maillage territorial, la CAMA étend son réseau de soins partenaires dans tout le pays. De nouvelles structures ont signé des conventions de partenariat.",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=600&auto=format&fit=crop"
  },
  { 
    id: 3, 
    title: "Campagne de vaccination gratuite au Camp", 
    date: "02 Juin 2026", 
    status: "Brouillon", 
    author: "Communication", 
    category: "Santé Publique",
    content: "Campagne élargie de vaccination contre l'hépatite et les maladies saisonnières. Réservé aux assurés et membres de famille.",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600&auto=format&fit=crop"
  },
];

export const DEFAULT_SITE_SETTINGS: SiteWebSettings = {
  dossierIdFormat: "CAMA-{YYYY}-{SEQ}",
  popupTitle: "La CAMA officiellement lancée !",
  popupSubtitle: "La santé de nos héros, notre priorité.",
  popupContent: "La CAMA, soucieuse du bien-être des soldats engagés dans la lutte, vient à point nommé étendre ses services à la famille de nos forces armées nationales. Découvrez le nouveau portail de gestion de vos prestations.",
  popupActive: true,
  popupImage: "https://images.unsplash.com/photo-1579548122080-c11707ea8211?q=80&w=2070&auto=format&fit=crop",
  popupMaxViews: 2,
  heroBgWatermarkOpacity: 25,
  menuVisibility: {
    about: true,
    services: true,
    news: true,
    contact: true,
    vision: true,
    rgpd: true
  },
  sectionTitles: {
    prestations: "Nos prestations",
    services: "Services en ligne"
  },
  activeSections: {
    prestations: true,
    services: true,
    dgMessage: true,
    statistics: true,
    testimonials: true,
    faq: true,
    partners: true,
    socials: true
  },
  faqs: [
    {
      id: 1,
      q: "Qu'est-ce que la CAMA et qui peut en bénéficier ?",
      a: "La Caisse d'Assurance Maladie des Armées (CAMA) est l'organisme officiel de prévoyance sociale chargé d'assurer une couverture santé universelle et solidaire pour l'ensemble des forces armées nationales burkinabè en activité ou à la retraite, ainsi que pour leurs familles directes (conjoints légaux, enfants à charge et ascendants directs).",
      active: true
    },
    {
      id: 2,
      q: "Comment puis-je créer mon compte assuré ?",
      a: "La création de compte est simple. Utilisez votre adresse e-mail institutionnelle (par exemple, prenom.nom@armee.bf) et votre matricule militaire lors de votre première connexion. Si vous rencontrez un problème, contactez le bureau des ressources humaines de votre corps de rattachement.",
      active: true
    },
    {
      id: 3,
      q: "Quels sont les documents obligatoires requis pour l'enrôlement d'un ayant droit ?",
      a: "Les pièces justificatives varient selon le lien de parenté : pour un conjoint, il faut l'acte de mariage officiel et sa pièce d'identité ; pour un enfant mineur, l'acte de naissance ou de baptême ; pour un enfant majeur de 21 à 25 ans, un certificat de scolarité en cours de validité ; et pour un ascendant, l'acte de naissance du militaire attestant la filiation.",
      active: true
    },
    {
      id: 4,
      q: "Combien de temps faut-il pour valider ma demande d'enrôlement ?",
      a: "Les services d'examen de la CAMA traitent vos demandes dans un délai moyen de 48 à 72 heures ouvrables. Dès qu'une décision est prise (validation ou rejet avec explication), vous recevez un e-mail automatique de notification et le statut est mis à jour en temps réel sur votre tableau de bord.",
      active: true
    },
    {
      id: 5,
      q: "Où et comment puis-je utiliser ma prise en charge CAMA ?",
      a: "Une fois votre carte ou fiche d'enrôlement obtenue, vous bénéficiez du tiers-payant automatique dans tous les centres médicaux militaires, hôpitaux publics conventionnés, cliniques privées partenaires et pharmacies agréées du réseau CAMA répartis dans tout le Burkina Faso.",
      active: true
    },
    {
      id: 6,
      q: "Que faire si ma demande d'enrôlement est rejetée ?",
      a: "En cas de rejet, un motif précis est affiché sur votre Espace Assuré (ex: 'justificatif illisible' ou 'acte de mariage manquant'). Vous pouvez immédiatement modifier votre demande en téléversant la bonne pièce justificative sans avoir à recréer un nouveau dossier.",
      active: true
    }
  ],
  prestations: [
    { title: "Prise en charge médicale", label: "Prestation 01", desc: "Vous êtes assurés, bénéficie d'une prise en charge médicale dans nos centres conventionnés pour vous et votre famille avec une gestion rapide et efficace." },
    { title: "Enrôlement des familles", label: "Prestation 02", desc: "Déclarez facilement vos ayants droit (conjoints, enfants, ascendants) via la plateforme numérique pour faciliter leur intégration dans le système de couverture." },
    { title: "Couverture risques", label: "Prestation 03", desc: "Couverture des blessures en opération et risques professionnels. N'hésitez pas à prendre attache with nos services pour l'ouverture de votre dossier de suivi." }
  ],
  dgName: "Colonel-Major Saïdou YONABA",
  dgMessage: "Je vous souhaite chaleureusement la bienvenue sur notre site web. Cette institution, née de la ferme volonté de la hiérarchie militaire, s’est vue réalisée sous le leadership du Chef de l’Etat pour permettre aux militaires engagés au front ou non, de bénéficier d’une prise en charge sanitaire élargie à sa famille à travers un traitement solidaire et équitable.",
  dgCitation: "Bâtir une solidarité agissante au sein de nos forces.",
  dgImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop", // placeholder or simple UI
  aboutContent: {
    heroTitle: "Notre Mission, Notre Identité",
    heroSubtitle: "La Caisse d'Assurance Maladie des Armées (CAMA) est l'institution de prévoyance sociale dédiée à garantir une couverture santé universelle et solidaire pour les forces armées burkinabè et leurs familles.",
    heroImage: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=2070&auto=format&fit=crop",
    missionTitle: "Notre Mission",
    missionDesc: "Assurer la gestion du régime d'assurance maladie au profit des personnels des forces armées, de leurs familles et des retraités, en garantissant un accès équitable à des soins de santé de qualité.",
    visionTitle: "Notre Vision",
    visionDesc: "Devenir un pôle d'excellence en matière de sécurité sociale militaire dans la sous-région, soutenu par la digitalisation de nos services et la rigueur dans la gestion de nos prestations.",
    historyTitle: "Historique",
    historyDesc1: "Autrefois assurée par la Mutuelle des Forces Armées Nationales (MUFAN), la prise en charge sanitaire était destinée aux militaires uniquement. Face aux défis sécuritaires et soucieuse du bien-être des soldats engagés dans la lutte, la CAMA vient à point nommé étendre ses services à la famille de nos vaillantes forces.",
    historyDesc2: "« Cette institution, née de la ferme volonté de la hiérarchie militaire, s'est vue réalisée sous le leadership du Capitaine Ibrahim TRAORE, Président du Faso, Chef de l'Etat, pour permettre aux militaires de bénéficier d'une prise en charge élargie. » — Colonel-Major Saïdou YONABA.",
    historyImage: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=2070&auto=format&fit=crop"
  },
  statistics: [
    { id: "1", label: "Personnels Enrôlés", val: "54 219", iconType: "Users" },
    { id: "2", label: "Ayants Droit Couverts", val: "112 943", iconType: "HeartPulse" },
    { id: "3", label: "Centres Affiliés", val: "128", iconType: "MapPin" },
    { id: "4", label: "Dossiers Traités", val: "45 600+", iconType: "Activity" }
  ],
  stats_savoir_plus_url: "/about",
  logoUrl: "https://lh3.googleusercontent.com/d/1Xy_JkXv_E6NfT8Z_wG7_G_Fv5R0q9Y0K",
  logoWidth: 80,
  siteTitle: "CAMA",
  siteSlogan: "CAISSE D'ASSURANCE MALADIE DES ARMÉES",
  visionContent: "Notre vision est de devenir le modèle de référence en matière de protection sociale et de santé pour les forces armées en Afrique de l'Ouest. Nous nous engageons à offrir une couverture santé universelle, solidaire et innovante, garantissant à chaque militaire et à sa famille un accès équitable à des soins de qualité.\n\nNous visons l'excellence opérationnelle à travers la digitalisation intégrale de nos processus, permettant une prise en charge rapide et transparente. La CAMA se veut être un pilier de la résilience nationale, en veillant sur ceux qui veillent sur nous.",
  rgpdContent: "Conformément à la loi n°001-2021/AN portant protection des personnes à l'égard du traitement des données à caractère personnel, la CAMA s'engage à protéger la confidentialité de vos informations.\n\n1. Collecte des données : Nous collectons uniquement les données strictement nécessaires à votre enrôlement et à la gestion de vos prestations de santé.\n2. Finalité : Vos données sont utilisées exclusivement pour l'identification des assurés, le remboursement des soins et la lutte contre la fraude.\n3. Sécurité : Vos données de santé sont stockées sur des serveurs sécurisés et ne sont accessibles qu'aux personnels habilités soumis au secret médical.\n4. Vos droits : Vous disposez d'un droit d'accès, de rectification et de suppression de vos données en contactant notre Délégué à la Protection des Données (DPO).",
  flashInfos: [
    "Ouverture du nouveau bureau régional de l'ANRBF à Bobo-Dioulasso",
    "Politique d'archivage et de documentation de la CARFO : validation d'un nouveau Tableau de gestion",
    "Lancement de la plateforme de e-enrôlement pour les nouveaux adhérents"
  ],
  showFlashInfos: true,
  emailSettings: {
    smtpHost: "smtp.cama.bf",
    smtpPort: "587",
    smtpUser: "notifications@cama.bf",
    smtpPass: "********",
    smtpSecure: true,
    imapHost: "imap.cama.bf",
    imapPort: "993",
    imapUser: "notifications@cama.bf",
    imapPass: "********",
    fromEmail: "notifications@cama.bf",
    fromName: "CAMA Notifications"
  },
  notificationTemplates: {
    dossierCreated: {
      subject: "Confirmation de réception de votre dossier - CAMA",
      body: "Bonjour,\n\nNous vous confirmons avoir bien reçu votre dossier de prestation. Il est actuellement en cours d'examen par nos services.\n\nCordialement,\nL'équipe CAMA."
    },
    statusChanged: {
      subject: "Mise à jour du statut de votre dossier - CAMA",
      body: "Bonjour,\n\nLe statut de votre dossier a été mis à jour. Veuillez vous connecter à votre espace assuré pour consulter les détails.\n\nCordialement,\nL'équipe CAMA."
    },
    dossierValidated: {
      subject: "Validation de votre dossier - CAMA",
      body: "Bonjour,\n\nFélicitations, votre dossier a été validé. Vos prestations seront traitées dans les plus brefs délais.\n\nCordialement,\nL'équipe CAMA."
    },
    dossierRejected: {
      subject: "Complément d'information requis - CAMA",
      body: "Bonjour,\n\nAprès examen, votre dossier nécessite des informations complémentaires. Veuillez consulter votre espace assuré pour voir les motifs du rejet temporaire.\n\nCordialement,\nL'équipe CAMA."
    }
  },
  services: [
    { name: "e-Enrôlement", color: "bg-yellow-400", iconType: "Laptop", url: "/login" },
    { name: "e-Dossier", color: "bg-red-500", iconType: "FileCheck", url: "/login" },
    { name: "Réseau Santé", color: "bg-[#008a4b]", iconType: "MapPin", url: "/services" },
    { name: "Partenaires", color: "bg-blue-400", iconType: "Building", url: "/about" },
  ],
  facebookPageUrl: "https://facebook.com/CAMA_BF",
  facebookFeedText: "Un nouveau pas franchi pour la digitalisation des services des forces armées nationales. Lancement de la plateforme web d'enrôlement direct. 🇧🇫",
  facebookFeedImage: "https://images.unsplash.com/photo-1579548122080-c11707ea8211?q=80&w=2070&auto=format&fit=crop",
  facebookFollowers: "28 K abonnés",
  testimonialHeroImage: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=1000&auto=format&fit=crop",
  testimonialHeroTitle: "La CAMA au service de la Nation Burkinabè",
  testimonialHeroSubtitle: "TÉMOIGNAGES ENGAGÉS",
  qualityCitation: "« Nous avons trouvé à la CAMA, un système efficace qui répond en tout point aux exigences de qualité »",
  qualityAuthor: "Mme Ouedraogo, bénéficiaire",
  testimonials: [
    {
      id: "1",
      quote: "« Nous avons trouvé à la CAMA, un système efficace qui répond en tout point aux exigences de qualité de soins pour nos militaires. »",
      author: "Mme Ouedraogo",
      role: "Mère de famille & Bénéficiaire"
    },
    {
      id: "2",
      quote: "« L'enrôlement en ligne est extrêmement rapide. J'ai pu inscrire mes ayants droit depuis chez moi avant mon déploiement sur le terrain. »",
      author: "Adjudant-Chef Diallo",
      role: "Militaire en activité"
    },
    {
      id: "3",
      quote: "« Grâce aux accords de prise en charge instantanés de la CAMA, notre clinique accueille et soigne les soldats sans formalités fastidieuses. »",
      author: "Dr. Somé L.",
      role: "Médecin-Chef"
    }
  ],
  partners: [
    { id: 1, name: "ISSA" },
    { id: 2, name: "CIPRES" },
    { id: 3, name: "OIT (ILO)" },
    { id: 4, name: "BCEAO" }
  ],
  heroImage: "https://images.unsplash.com/photo-1544257121-8178d46e33bd?q=80&w=2070&auto=format&fit=crop",
  heroTitle: "La santé de nos héros, notre priorité.",
  heroSubtitle: "La Caisse d'Assurance Maladie des Armées (CAMA) offre une prise en charge sanitaire élargie aux vaillants combattants des Forces Armées Nationales et à leurs familles.",
  footer: {
    copyright: "© 2026 CAMA Burkina Faso. Tous droits réservés.",
    liensRapides: [
      { label: "Accueil", url: "/" },
      { label: "Notre Mission", url: "/about" },
      { label: "Catalogue des Services", url: "/services" },
      { label: "Actualités", url: "/news" }
    ],
    espaceNumerique: [
      { label: "Espace Assuré", url: "/login" },
      { label: "Plateforme d'enrôlement", url: "/login" },
      { label: "Portail Administrateur", url: "/login" },
      { label: "Simulateur de prestations", url: "/services" }
    ],
    contactTitle: "Contactez-nous",
    address: "Camp Guillaume Ouédraogo, Ouagadougou, Burkina Faso",
    phone: "+226 25 00 00 00",
    email: "contact@cama.bf",
    description: "Caisse d'Assurance Maladie des Armées. Garantir une couverture santé universelle et solidaire pour nos forces armées et leurs familles.",
    badgeText: "La Patrie ou la Mort, nous vaincrons !"
  }
};

// Resilient safeStorage wrapper to prevent SecurityError inside iframe environments
const isStorageAvailable = (() => {
  try {
    const key = '__storage_test__';
    window.localStorage.setItem(key, key);
    window.localStorage.removeItem(key);
    return true;
  } catch (e) {
    return false;
  }
})();

const inMemoryStore: Record<string, string> = {
  cama_requests: JSON.stringify(DEFAULT_REQUESTS),
  cama_users: JSON.stringify(DEFAULT_USERS),
  cama_centres: JSON.stringify(DEFAULT_CENTRES),
  cama_articles: JSON.stringify(DEFAULT_ARTICLES),
  cama_site_settings: JSON.stringify(DEFAULT_SITE_SETTINGS),
  cama_admins: JSON.stringify(DEFAULT_ADMINS)
};

export const safeStorage = {
  getItem(key: string): string | null {
    if (isStorageAvailable) {
      try {
        return window.localStorage.getItem(key);
      } catch (e) {
        // Fall through
      }
    }
    return inMemoryStore[key] !== undefined ? inMemoryStore[key] : null;
  },
  setItem(key: string, value: string): void {
    if (isStorageAvailable) {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch (e) {
        // Fall through
      }
    }
    inMemoryStore[key] = value;
  },
  removeItem(key: string): void {
    if (isStorageAvailable) {
      try {
        window.localStorage.removeItem(key);
        return;
      } catch (e) {
        // Fall through
      }
    }
    delete inMemoryStore[key];
  }
};

// Local storage keys
const KEYS = {
  REQUESTS: 'cama_requests',
  USERS: 'cama_users',
  CENTRES: 'cama_centres',
  ARTICLES: 'cama_articles',
  SITE_SETTINGS: 'cama_site_settings',
  ADMINS: 'cama_admins',
  LOGS: 'cama_logs'
};

// Initialize helper
export function initStore() {
  if (!safeStorage.getItem(KEYS.REQUESTS)) {
    safeStorage.setItem(KEYS.REQUESTS, JSON.stringify(DEFAULT_REQUESTS));
  }
  if (!safeStorage.getItem(KEYS.USERS)) {
    // Add default password for existing users
    const usersWithPass = DEFAULT_USERS.map(u => ({ ...u, password: 'password123' }));
    safeStorage.setItem(KEYS.USERS, JSON.stringify(usersWithPass));
  }
  if (!safeStorage.getItem(KEYS.CENTRES)) {
    safeStorage.setItem(KEYS.CENTRES, JSON.stringify(DEFAULT_CENTRES));
  }
  if (!safeStorage.getItem(KEYS.ARTICLES)) {
    safeStorage.setItem(KEYS.ARTICLES, JSON.stringify(DEFAULT_ARTICLES));
  }
  if (!safeStorage.getItem(KEYS.SITE_SETTINGS)) {
    safeStorage.setItem(KEYS.SITE_SETTINGS, JSON.stringify(DEFAULT_SITE_SETTINGS));
  } else {
    try {
      const current = JSON.parse(safeStorage.getItem(KEYS.SITE_SETTINGS) || '{}');
      let changed = false;
      if (!current.faqs) {
        current.faqs = DEFAULT_SITE_SETTINGS.faqs;
        changed = true;
      }
      if (!current.activeSections) {
        current.activeSections = DEFAULT_SITE_SETTINGS.activeSections;
        changed = true;
      }
      if (!current.aboutContent || Object.keys(current.aboutContent).length === 0) {
        current.aboutContent = DEFAULT_SITE_SETTINGS.aboutContent;
        changed = true;
      }
      if (!current.facebookFeedText) {
        current.facebookFeedText = DEFAULT_SITE_SETTINGS.facebookFeedText;
        current.facebookFeedImage = DEFAULT_SITE_SETTINGS.facebookFeedImage;
        current.facebookFollowers = DEFAULT_SITE_SETTINGS.facebookFollowers;
        current.testimonialHeroImage = DEFAULT_SITE_SETTINGS.testimonialHeroImage;
        current.testimonialHeroTitle = DEFAULT_SITE_SETTINGS.testimonialHeroTitle;
        current.testimonialHeroSubtitle = DEFAULT_SITE_SETTINGS.testimonialHeroSubtitle;
        changed = true;
      }
      if (!current.logoUrl) {
        current.logoUrl = DEFAULT_SITE_SETTINGS.logoUrl;
        current.logoWidth = DEFAULT_SITE_SETTINGS.logoWidth;
        current.siteTitle = DEFAULT_SITE_SETTINGS.siteTitle;
        current.siteSlogan = DEFAULT_SITE_SETTINGS.siteSlogan;
        changed = true;
      }
      if (!current.visionContent) {
        current.visionContent = DEFAULT_SITE_SETTINGS.visionContent;
        current.rgpdContent = DEFAULT_SITE_SETTINGS.rgpdContent;
        changed = true;
      }
      if (!current.flashInfos) {
        current.flashInfos = DEFAULT_SITE_SETTINGS.flashInfos;
        changed = true;
      }
      if (changed) {
        safeStorage.setItem(KEYS.SITE_SETTINGS, JSON.stringify(current));
      }
    } catch (e) {
      // Ignored
    }
  }
  if (!safeStorage.getItem(KEYS.ADMINS)) {
    safeStorage.setItem(KEYS.ADMINS, JSON.stringify(DEFAULT_ADMINS));
  }
  if (!safeStorage.getItem(KEYS.LOGS)) {
    safeStorage.setItem(KEYS.LOGS, JSON.stringify([]));
  }
}

// Ensure store is initialized when imported
initStore();

// Requests (Dossiers) API
export function getRequests(): Request[] {
  initStore();
  return JSON.parse(safeStorage.getItem(KEYS.REQUESTS) || '[]');
}

export function saveRequests(requests: Request[]) {
  safeStorage.setItem(KEYS.REQUESTS, JSON.stringify(requests));
}

export function updateRequestStatus(id: string, statut: 'Validé' | 'Rejeté'): Request[] {
  const current = getRequests();
  const updated = current.map(r => r.id === id ? { ...r, statut } : r);
  saveRequests(updated);
  return updated;
}

export function addRequest(request: Omit<Request, 'id' | 'date'>): Request[] {
  const current = getRequests();
  const users = getUsers();
  const subscriber = users.find(u => u.matricule === request.matricule);
  
  // Base ID is either the subscriber's assigned Dossier ID or based on their matricule
  const baseId = subscriber?.numDossier || `DOS-${request.matricule}`;
  
  // Find how many requests already exist for this subscriber
  const subscriberRequests = current.filter(r => r.matricule === request.matricule);
  const newId = `${baseId}-${(subscriberRequests.length + 1).toString().padStart(2, '0')}`;

  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const newRequest: Request = { 
    ...request, 
    id: newId, 
    date: dateStr 
  };
  const updated = [...current, newRequest];
  saveRequests(updated);
  return updated;
}

export function editRequest(request: Request): Request[] {
  const current = getRequests();
  const updated = current.map(r => r.id === request.id ? request : r);
  saveRequests(updated);
  return updated;
}

export function deleteRequest(id: string): Request[] {
  const current = getRequests();
  const updated = current.filter(r => r.id !== id);
  saveRequests(updated);
  return updated;
}

// Users API
export function getUsers(): User[] {
  initStore();
  return JSON.parse(safeStorage.getItem(KEYS.USERS) || '[]');
}

export function saveUsers(users: User[]) {
  safeStorage.setItem(KEYS.USERS, JSON.stringify(users));
}

export function addUser(user: Omit<User, 'id'>): User[] {
  const current = getUsers();
  const newId = current.length > 0 ? Math.max(...current.map(u => u.id)) + 1 : 1;
  const newUser: User = { ...user, id: newId };
  const updated = [...current, newUser];
  saveUsers(updated);
  return updated;
}

export function editUser(user: User, justification?: string, author?: string): User[] {
  const current = getUsers();

  // Check uniqueness of numDossier if provided
  if (user.numDossier) {
    const existing = current.find(u => u.numDossier === user.numDossier && u.id !== user.id);
    if (existing) {
      throw new Error('Ce numéro de dossier est déjà utilisé par un autre assuré.');
    }
  }

  const updated = current.map(u => {
    if (u.id === user.id) {
      const updatedUser = { ...u, ...user };
      
      // Handle numDossier history tracking
      if (user.numDossier !== u.numDossier && justification) {
        const historyEntry = {
          date: new Date().toLocaleString('fr-FR'),
          author: author || 'Admin',
          oldValue: u.numDossier || 'Néant',
          newValue: user.numDossier || 'Néant',
          reason: justification
        };
        updatedUser.numDossierHistory = [...(u.numDossierHistory || []), historyEntry];
      }

      return updatedUser;
    }
    return u;
  });
  saveUsers(updated);
  return updated;
}

export function deleteUser(id: number): User[] {
  const current = getUsers();
  const updated = current.filter(u => u.id !== id);
  saveUsers(updated);
  return updated;
}

// Admins API
export function getAdminUsers(): AdminUser[] {
  initStore();
  return JSON.parse(safeStorage.getItem(KEYS.ADMINS) || '[]');
}

export function saveAdminUsers(admins: AdminUser[]) {
  safeStorage.setItem(KEYS.ADMINS, JSON.stringify(admins));
}

export function addAdminUser(admin: Omit<AdminUser, 'id' | 'createdDate'>): AdminUser[] {
  const current = getAdminUsers();
  const newId = current.length > 0 ? Math.max(...current.map(a => a.id)) + 1 : 1;
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const newAdmin: AdminUser = { 
    ...admin, 
    id: newId, 
    createdDate: dateStr 
  };
  const updated = [...current, newAdmin];
  saveAdminUsers(updated);
  return updated;
}

export function editAdminUser(admin: AdminUser): AdminUser[] {
  const current = getAdminUsers();
  const updated = current.map(a => a.id === admin.id ? admin : a);
  saveAdminUsers(updated);
  return updated;
}

export function deleteAdminUser(id: number): AdminUser[] {
  const current = getAdminUsers();
  const updated = current.filter(a => a.id !== id);
  saveAdminUsers(updated);
  return updated;
}

// Centers API
export function getCentres(): Centre[] {
  initStore();
  return JSON.parse(safeStorage.getItem(KEYS.CENTRES) || '[]');
}

// Notification Templates API
const DEFAULT_NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'dossier_assigned',
    name: 'Attribution du numéro de dossier',
    subject: 'Attribution de votre numéro de dossier CAMA',
    content: 'Cher(e) {{NOM}} {{PRENOM}}, votre numéro de dossier CAMA a été attribué : {{NUM_DOSSIER}}. Vous pouvez désormais suivre votre dossier sur votre espace personnel.',
    variables: ['{{NOM}}', '{{PRENOM}}', '{{NUM_DOSSIER}}']
  },
  {
    id: 'dossier_modified',
    name: 'Modification du numéro de dossier',
    subject: 'Mise à jour de votre numéro de dossier CAMA',
    content: 'Cher(e) {{NOM}} {{PRENOM}}, votre numéro de dossier CAMA a été modifié par un administrateur. Nouveau numéro : {{NUM_DOSSIER}}. Motif : {{MOTIF}}.',
    variables: ['{{NOM}}', '{{PRENOM}}', '{{NUM_DOSSIER}}', '{{MOTIF}}']
  }
];

export function getNotificationTemplates(): NotificationTemplate[] {
  const stored = safeStorage.getItem('cama_notification_templates');
  if (!stored) {
    safeStorage.setItem('cama_notification_templates', JSON.stringify(DEFAULT_NOTIFICATION_TEMPLATES));
    return DEFAULT_NOTIFICATION_TEMPLATES;
  }
  return JSON.parse(stored);
}

export function saveNotificationTemplate(template: NotificationTemplate): NotificationTemplate[] {
  const current = getNotificationTemplates();
  const updated = current.map(t => t.id === template.id ? template : t);
  if (!current.find(t => t.id === template.id)) {
    updated.push(template);
  }
  safeStorage.setItem('cama_notification_templates', JSON.stringify(updated));
  return updated;
}

export function personalizeMessage(content: string, variables: Record<string, string>): string {
  let personalized = content;
  Object.entries(variables).forEach(([key, value]) => {
    personalized = personalized.replace(new RegExp(key, 'g'), value);
  });
  return personalized;
}

export function saveCentres(centres: Centre[]) {
  safeStorage.setItem(KEYS.CENTRES, JSON.stringify(centres));
}

export function addCentre(centre: Omit<Centre, 'id'>): Centre[] {
  const current = getCentres();
  const newId = current.length > 0 ? Math.max(...current.map(c => c.id)) + 1 : 1;
  const newCentre: Centre = { ...centre, id: newId };
  const updated = [...current, newCentre];
  saveCentres(updated);
  return updated;
}

export function editCentre(centre: Centre): Centre[] {
  const current = getCentres();
  const updated = current.map(c => c.id === centre.id ? centre : c);
  saveCentres(updated);
  return updated;
}

export function deleteCentre(id: number): Centre[] {
  const current = getCentres();
  const updated = current.filter(c => c.id !== id);
  saveCentres(updated);
  return updated;
}

// Articles API
export function getArticles(): Article[] {
  initStore();
  return JSON.parse(safeStorage.getItem(KEYS.ARTICLES) || '[]');
}

export function saveArticles(articles: Article[]) {
  safeStorage.setItem(KEYS.ARTICLES, JSON.stringify(articles));
}

export function addArticle(article: Omit<Article, 'id' | 'date'>): Article[] {
  const current = getArticles();
  const newId = current.length > 0 ? Math.max(...current.map(a => a.id)) + 1 : 1;
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const newArticle: Article = { ...article, id: newId, date: dateStr };
  const updated = [newArticle, ...current];
  saveArticles(updated);
  return updated;
}

export function editArticle(article: Article): Article[] {
  const current = getArticles();
  const updated = current.map(a => a.id === article.id ? article : a);
  saveArticles(updated);
  return updated;
}

export function deleteArticle(id: number): Article[] {
  const current = getArticles();
  const updated = current.filter(a => a.id !== id);
  saveArticles(updated);
  return updated;
}

// Site Web Settings API
export function getSiteSettings(): SiteWebSettings {
  initStore();
  return JSON.parse(safeStorage.getItem(KEYS.SITE_SETTINGS) || '{}');
}

export function saveSiteSettings(settings: SiteWebSettings) {
  safeStorage.setItem(KEYS.SITE_SETTINGS, JSON.stringify(settings));
}

// Logs API
export function getLogs(userId?: number): ActionLog[] {
  initStore();
  const allLogs: ActionLog[] = JSON.parse(safeStorage.getItem(KEYS.LOGS) || '[]');
  if (userId) {
    return allLogs.filter(l => l.userId === userId).reverse();
  }
  return allLogs.reverse();
}

export function addLog(userId: number, action: string) {
  const allLogs = getLogs();
  const newLog: ActionLog = {
    id: Math.random().toString(36).substr(2, 9),
    userId,
    action,
    date: new Date().toLocaleString('fr-FR')
  };
  safeStorage.setItem(KEYS.LOGS, JSON.stringify([newLog, ...allLogs]));
}
