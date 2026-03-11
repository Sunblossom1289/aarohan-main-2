import React from 'react';
import { CAREER_MAP_DATA } from './constants';

const AvatarStack = ({ suitability, onSelect }) => {
  return (
    <div className="flex justify-center items-center gap-6 flex-wrap my-8">
      {suitability
        .sort((a, b) => b.relevance - a.relevance)
        .map((s) => {
          const char = CAREER_MAP_DATA.archetypes.find(c => c.id === s.archetypeId);
          if (!char) return null;
          
          const scale = 0.6 + (s.relevance * 0.6);
          
          return (
            <div
              key={s.archetypeId}
              onClick={() => onSelect?.(char)}
              className="cursor-pointer group"
              style={{ transform: `scale(${scale})` }}
            >
              <div className="relative">
                <div className="p-1 bg-white rounded-full shadow-2xl">
                  <img
                    src={char.imageUrl}
                    className="w-24 h-24 rounded-full border-2 border-slate-100 object-cover group-hover:rotate-6 transition-transform"
                    alt={char.name}
                  />
                </div>
                <div className="absolute -top-3 -right-3 bg-slate-900 text-white w-10 h-10 flex items-center justify-content-center rounded-full text-xl shadow-lg border-2 border-white">
                  {char.icon}
                </div>
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs px-3 py-1 rounded-full whitespace-nowrap z-50 pointer-events-none">
                  {Math.round(s.relevance * 100)}%
                </div>
                <p className="text-center mt-4 font-bold text-sm text-slate-700">{char.name}</p>
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default AvatarStack;
