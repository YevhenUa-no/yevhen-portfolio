// src/components/ProjectCard.jsx

import React from 'react';

function ProjectCard({ title, description, svgComponent }) {
  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden shadow-2xl transition-transform transform hover:scale-105 hover:shadow-green-500/50 cursor-pointer">
      <div className="p-6">
        <div className="w-16 h-16 mx-auto mb-4">
          {svgComponent}
        </div>
        <h3 className="text-xl font-bold text-center text-[#10b981]">{title}</h3>
        <p className="text-gray-400 mt-2 text-center">{description}</p>
      </div>
    </div>
  );
}

export default ProjectCard;
