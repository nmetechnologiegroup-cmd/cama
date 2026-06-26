import { useState, useEffect } from 'react';
import { useMemo } from 'react';
import { Users, FileCheck, Building2, FileText, ArrowUpRight, Clock, CheckCircle2, AlertTriangle, TrendingUp, BarChart2 } from 'lucide-react';
import { motion } from 'motion/react';
import { getRequests, getUsers, getCentres } from '../../lib/dataStore';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell, 
  Legend
} from 'recharts';

export default function AdminDashboard() {
  const [requests, setrequests] = useState<any[]>([]);
  useEffect(() => { getRequests().then(setrequests); }, []);
  const [users, setusers] = useState<any[]>([]);
  useEffect(() => { getUsers().then(setusers); }, []);
  const [centres, setcentres] = useState<any[]>([]);
  useEffect(() => { getCentres().then(setcentres); }, []);

  // Compute dynamic stats dashboard values
  const totalAssures = 12450 + (users.length - 3); // base 12,450 to reflect high volume
  const pendingRequestsCount = requests.filter(r => r.statut === 'En attente').length;
  const activeCentresCount = centres.length;
  const monthlyEnrollments = 450 + (requests.length - 5);

  const stats = [
    { name: 'Assurés Actifs', value: totalAssures.toLocaleString(), icon: Users, color: 'text-blue-500 bg-blue-50', trend: '+12%' },
    { name: 'Dossiers en attente', value: pendingRequestsCount.toString(), icon: FileCheck, color: 'text-yellow-600 bg-yellow-50', trend: `${pendingRequestsCount > 2 ? '+' : ''}${pendingRequestsCount - 2}` },
    { name: 'Centres affiliés', value: activeCentresCount.toString(), icon: Building2, color: 'text-purple-600 bg-purple-50', trend: `+${activeCentresCount - 4}` },
    { name: 'Enrôlements du mois', value: monthlyEnrollments.toString(), icon: FileText, color: 'text-[#008a4b] bg-green-50', trend: '+18%' },
  ];

  // Latest 5 dossiers
  const latestRequests = useMemo(() => {
    return [...requests].reverse().slice(0, 5);
  }, [requests]);

  // Dynamic status distribution data
  const statusData = useMemo(() => {
    let valide = 125;
    let enAttente = 0;
    let rejete = 8;
    
    requests.forEach(r => {
      if (r.statut === 'Validé') valide++;
      else if (r.statut === 'En attente') enAttente++;
      else if (r.statut === 'Rejeté') rejete++;
    });

    return [
      { name: 'Validés', value: valide, color: '#008a4b' },
      { name: 'En Attente', value: enAttente, color: '#d9a300' }, // Darker gold/yellow for high contrast on light backgrounds
      { name: 'Rejetés', value: rejete, color: '#ef2b2d' }
    ];
  }, [requests]);

  // Simulated & dynamic daily historical enrôlements
  const dailyData = useMemo(() => {
    const todayRequests = requests.filter(r => r.statut === 'En attente' || r.statut === 'Validé').length;
    return [
      { date: '18 Juin', dossiers: 14 },
      { date: '19 Juin', dossiers: 22 },
      { date: '20 Juin', dossiers: 18 },
      { date: '21 Juin', dossiers: 35 },
      { date: '22 Juin', dossiers: 29 },
      { date: '23 Juin', dossiers: 42 },
      { date: '24 Juin', dossiers: 30 + todayRequests },
    ];
  }, [requests]);

  return (
    <div className="space-y-8 text-left">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100/60 hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className={`text-xs font-bold flex items-center px-2 py-1 rounded-full ${stat.trend.startsWith('+') || Number(stat.trend) >= 0 ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
                <ArrowUpRight className="w-4 h-4 mr-0.5" />
                {stat.trend}
              </span>
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-[#008a4b] tracking-tight">{stat.value}</h3>
              <p className="text-sm font-bold text-gray-500 mt-1">{stat.name}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Visualisations / Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Enrôlements Quotidiens (Area Chart) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100/60 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-50 text-[#008a4b] rounded-xl">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">Évolution quotidienne des enrôlements</h3>
                  <p className="text-xs text-gray-400 font-medium">Nombre de dossiers soumis au cours des 7 derniers jours</p>
                </div>
              </div>
              <span className="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-lg">CAMA Direct</span>
            </div>

            <div className="h-72 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDossiers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#008a4b" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#008a4b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} 
                    labelClassName="font-bold text-gray-800 text-xs"
                    itemStyle={{ color: '#008a4b', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="dossiers" name="Dossiers" stroke="#008a4b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDossiers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Répartition des Statuts (Bar Chart) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-green-50 text-[#008a4b] rounded-xl">
                <BarChart2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 leading-tight">Statuts des dossiers</h3>
                <p className="text-xs text-gray-400 font-medium">Répartition globale par état de traitement</p>
              </div>
            </div>

            <div className="h-72 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} 
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="value" name="Nombre" radius={[6, 6, 0, 0]}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Enrolments */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100/60 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 border-l-4 border-[#008a4b] pl-3">Dossiers d'Enrôlement Récents</h3>
              <span className="text-xs font-extrabold text-gray-400">INDEX DE SUIVI</span>
            </div>
            <div className="space-y-5">
              {latestRequests.map((req) => (
                <div key={req.id} className="flex items-center justify-between group">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[#008a4b] font-black group-hover:bg-[#008a4b] group-hover:text-white group-hover:border-[#008a4b] transition-all duration-300">
                      {req.membre.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 group-hover:text-[#008a4b] transition-colors">Dossier #{req.id}</p>
                      <p className="text-xs font-bold text-gray-400 mt-0.5">Assuré: {req.assure} ({req.matricule})</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    req.statut === 'En attente' 
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-100' 
                      : req.statut === 'Validé' 
                        ? 'bg-green-50 text-[#008a4b] border-green-100'
                        : 'bg-rose-50 text-rose-600 border-rose-100'
                  }`}>
                    {req.statut}
                  </span>
                </div>
              ))}
              {latestRequests.length === 0 && (
                <p className="text-center text-gray-400 font-medium italic">Aucun dossier enrôlé pour le moment.</p>
              )}
            </div>
          </div>
        </div>

         {/* Activity Log */}
         <div className="bg-white rounded-2xl shadow-sm border border-slate-100/60 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 border-l-4 border-slate-800 pl-3">Activité Récente</h3>
          <div className="relative border-l-2 border-gray-100 ml-4 space-y-8">
            <div className="relative pl-8">
              <span className="absolute -left-2 top-1.5 w-4 h-4 rounded-full bg-[#008a4b] ring-4 ring-white shadow-sm flex items-center justify-center text-[8px] text-white">✓</span>
              <p className="font-bold text-gray-900 text-sm">Validation par lot de 45 dossiers</p>
              <p className="text-xs font-medium text-gray-400 mt-1">Par Direction Administrative • Il y a 2 heures</p>
            </div>
            <div className="relative pl-8">
              <span className="absolute -left-2 top-1.5 w-4 h-4 rounded-full bg-blue-500 ring-4 ring-white shadow-sm"></span>
              <p className="font-bold text-gray-900 text-sm">Nouvel article de presse publié</p>
              <p className="text-xs font-medium text-gray-400 mt-1">"Ajout de nouvelles cliniques conventionnées" • Hier à 14:30</p>
            </div>
            <div className="relative pl-8">
              <span className="absolute -left-2 top-1.5 w-4 h-4 rounded-full bg-purple-500 ring-4 ring-white shadow-sm"></span>
              <p className="font-bold text-gray-900 text-sm">Convention d'affiliation signée</p>
              <p className="text-xs font-medium text-gray-400 mt-1">Nouveaux services ouverts pour pharmacie • Il y a 2 jours</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
