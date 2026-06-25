import { motion } from 'motion/react';
import { Megaphone } from 'lucide-react';
import { getSiteSettings } from '../lib/dataStore';

export default function NewsTicker() {
  const settings = getSiteSettings();
  const news = settings.flashInfos || [];

  if (news.length === 0 || settings.showFlashInfos === false) return null;

  return (
    <div className="bg-white border-b border-gray-100 h-12 flex items-center overflow-hidden relative z-40">
      <div className="flex-shrink-0 h-full bg-[#008a4b] px-4 flex items-center gap-2 relative z-10 shadow-[4px_0_10px_rgba(0,0,0,0.1)]">
        <Megaphone className="w-4 h-4 text-white fill-white/20" />
        <span className="text-white font-black text-xs uppercase tracking-tighter whitespace-nowrap">Flash infos</span>
      </div>
      
      <div className="flex-1 overflow-hidden relative h-full flex items-center">
        <motion.div 
          className="flex whitespace-nowrap gap-20 pl-4 items-center"
          animate={{ x: [0, -1000] }}
          transition={{ 
            duration: 30, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        >
          {news.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 group cursor-default">
              <div className="w-1.5 h-1.5 rounded-full bg-[#008a4b]/40 group-hover:bg-[#008a4b] transition-colors" />
              <span className="text-xs font-bold text-gray-700 hover:text-[#008a4b] transition-colors">{item}</span>
            </div>
          ))}
          {/* Duplicate for infinite effect if content is short, but for now simple ticker */}
          {news.map((item, idx) => (
            <div key={`dup-${idx}`} className="flex items-center gap-3 group cursor-default">
              <div className="w-1.5 h-1.5 rounded-full bg-[#008a4b]/40 group-hover:bg-[#008a4b] transition-colors" />
              <span className="text-xs font-bold text-gray-700 hover:text-[#008a4b] transition-colors">{item}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
