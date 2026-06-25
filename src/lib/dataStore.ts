// Async dataStore connecting to the local Express backend

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
  gs?: string;
  refIdentityDoc?: string;
  refMarriageCertificate?: string;
  refScolariteDoc?: string;
  motherName?: string;
  profession?: string;
  residence?: string;
  telephone?: string;
  lien: string;
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
  variables: string[];
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
  permissions: string[];
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
  customIconName?: string;
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

export const DEFAULT_SITE_SETTINGS: SiteWebSettings = {
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
  faqs: [],
  prestations: [],
  dgName: "Colonel-Major Saïdou YONABA",
  dgMessage: "Message",
  dgCitation: "Citation",
  dgImage: "",
  aboutContent: {},
  statistics: [],
  stats_savoir_plus_url: "/about",
  logoUrl: "https://lh3.googleusercontent.com/d/1Xy_JkXv_E6NfT8Z_wG7_G_Fv5R0q9Y0K",
  logoWidth: 80,
  siteTitle: "CAMA",
  siteSlogan: "CAISSE D'ASSURANCE MALADIE DES ARMÉES",
  visionContent: "Notre vision est de devenir un modèle d’excellence en matière de protection sociale et d’assurance maladie militaire en Afrique de l'Ouest. Nous nous engageons à offrir une couverture sanitaire universelle, solidaire et équitable à l'ensemble des forces armées nationales, de leurs familles et des retraités militaires.\n\nÀ travers la modernisation constante de nos infrastructures, la digitalisation de nos processus de traitement des dossiers et des partenariats solides avec un réseau étendu de centres de soins de qualité, nous veillons à ce que chaque héros de notre nation et ses ayants droit bénéficient d'une prise en charge médicale rapide, humaine et efficace, partout sur le territoire.",
  rgpdContent: "Conformément aux réglementations nationales et internationales en vigueur concernant la protection des données personnelles, la Caisse d'Assurance Maladie des Armées (CAMA) s'engage à assurer la confidentialité, la sécurité et l'intégrité de toutes les données collectées sur ses plateformes.\n\nLes données d’enrôlement de vos membres de famille, vos informations médicales et vos pièces justificatives sont exclusivement traitées pour la gestion de vos droits d’assurance maladie et la validation de vos prises en charge. Vos données ne sont en aucun cas cédées, vendues ou partagées avec des tiers non autorisés. Vous disposez d’un droit d’accès, de rectification et de suppression de vos données personnelles sur simple demande adressée à notre Délégué à la Protection des Données (DPO).",
  flashInfos: [],
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
  services: [],
  facebookPageUrl: "https://facebook.com/CAMA_BF",
  facebookFeedText: "",
  facebookFollowers: "",
  qualityCitation: "",
  qualityAuthor: "",
  testimonials: [],
  partners: [],
  heroImage: "",
  heroTitle: "",
  heroSubtitle: "",
  footer: {
    copyright: "© 2026 CAMA Burkina Faso",
    liensRapides: [],
    espaceNumerique: [],
    contactTitle: "Contactez-nous",
    address: "Camp Guillaume Ouédraogo",
    phone: "+226 25 00 00 00",
    email: "contact@cama.bf"
  }
};

export const safeStorage = {
  getItem(key: string): string | null { return window.localStorage.getItem(key); },
  setItem(key: string, value: string): void { window.localStorage.setItem(key, value); },
  removeItem(key: string): void { window.localStorage.removeItem(key); }
};

const API_URL = '/api';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erreur API');
  }
  return res.json();
}

export async function getRequests(): Promise<Request[]> {
  return fetchAPI('/requests');
}

export async function updateRequestStatus(id: string, statut: 'Validé' | 'Rejeté'): Promise<Request[]> {
  const req = await fetchAPI(`/requests/${id}`);
  await fetchAPI(`/requests/${id}`, { method: 'PUT', body: JSON.stringify({ ...req, statut }) });
  return getRequests();
}

export async function addRequest(request: Omit<Request, 'id' | 'date'>): Promise<Request[]> {
  await fetchAPI('/requests', { method: 'POST', body: JSON.stringify(request) });
  return getRequests();
}

export async function editRequest(request: Request): Promise<Request[]> {
  await fetchAPI(`/requests/${request.id}`, { method: 'PUT', body: JSON.stringify(request) });
  return getRequests();
}

export async function deleteRequest(id: string): Promise<Request[]> {
  await fetchAPI(`/requests/${id}`, { method: 'DELETE' });
  return getRequests();
}

export async function getUsers(): Promise<User[]> {
  return fetchAPI('/users');
}

export async function addUser(user: Omit<User, 'id'>): Promise<User[]> {
  await fetchAPI('/users', { method: 'POST', body: JSON.stringify(user) });
  return getUsers();
}

export async function editUser(user: User, justification?: string, author?: string): Promise<User[]> {
  await fetchAPI(`/users/${user.id}`, { method: 'PUT', body: JSON.stringify(user) });
  return getUsers();
}

export async function deleteUser(id: number): Promise<User[]> {
  await fetchAPI(`/users/${id}`, { method: 'DELETE' });
  return getUsers();
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  return fetchAPI('/admins');
}

export async function addAdminUser(admin: Omit<AdminUser, 'id' | 'createdDate'>): Promise<AdminUser[]> {
  await fetchAPI('/admins', { method: 'POST', body: JSON.stringify(admin) });
  return getAdminUsers();
}

export async function editAdminUser(admin: AdminUser): Promise<AdminUser[]> {
  await fetchAPI(`/admins/${admin.id}`, { method: 'PUT', body: JSON.stringify(admin) });
  return getAdminUsers();
}

export async function deleteAdminUser(id: number): Promise<AdminUser[]> {
  await fetchAPI(`/admins/${id}`, { method: 'DELETE' });
  return getAdminUsers();
}

export async function getCentres(): Promise<Centre[]> {
  return fetchAPI('/centres');
}

export async function addCentre(centre: Omit<Centre, 'id'>): Promise<Centre[]> {
  await fetchAPI('/centres', { method: 'POST', body: JSON.stringify(centre) });
  return getCentres();
}

export async function editCentre(centre: Centre): Promise<Centre[]> {
  await fetchAPI(`/centres/${centre.id}`, { method: 'PUT', body: JSON.stringify(centre) });
  return getCentres();
}

export async function deleteCentre(id: number): Promise<Centre[]> {
  await fetchAPI(`/centres/${id}`, { method: 'DELETE' });
  return getCentres();
}

export async function getArticles(): Promise<Article[]> {
  return fetchAPI('/articles');
}

export async function addArticle(article: Omit<Article, 'id' | 'date'>): Promise<Article[]> {
  await fetchAPI('/articles', { method: 'POST', body: JSON.stringify(article) });
  return getArticles();
}

export async function editArticle(article: Article): Promise<Article[]> {
  await fetchAPI(`/articles/${article.id}`, { method: 'PUT', body: JSON.stringify(article) });
  return getArticles();
}

export async function deleteArticle(id: number): Promise<Article[]> {
  await fetchAPI(`/articles/${id}`, { method: 'DELETE' });
  return getArticles();
}

export async function getSiteSettings(): Promise<SiteWebSettings> {
  return fetchAPI('/site-settings');
}

export async function saveSiteSettings(settings: SiteWebSettings): Promise<void> {
  await fetchAPI('/site-settings', { method: 'PUT', body: JSON.stringify(settings) });
}

export async function getLogs(userId?: number): Promise<ActionLog[]> {
  const logs = await fetchAPI('/logs');
  return userId ? logs.filter((l: any) => l.userId === userId) : logs;
}

export async function addLog(userId: number, action: string): Promise<void> {
  await fetchAPI('/logs', { method: 'POST', body: JSON.stringify({ userId, action }) });
}

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

export async function getNotificationTemplates(): Promise<NotificationTemplate[]> {
  const stored = safeStorage.getItem('cama_notification_templates');
  if (!stored) {
    safeStorage.setItem('cama_notification_templates', JSON.stringify(DEFAULT_NOTIFICATION_TEMPLATES));
    return DEFAULT_NOTIFICATION_TEMPLATES;
  }
  try {
      return JSON.parse(stored);
    } catch (e) {
      return DEFAULT_NOTIFICATION_TEMPLATES;
    }
}

export async function saveNotificationTemplate(template: NotificationTemplate): Promise<NotificationTemplate[]> {
  const current = await getNotificationTemplates();
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
