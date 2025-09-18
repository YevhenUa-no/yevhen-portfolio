import React from 'react';
import ElectricBorder from './ElectricBorder';

const ProjectCard = ({ title, description, link, svgComponent }) => {
    return (
        <ElectricBorder>
            <div className="card p-6 rounded-xl shadow-lg transition-all duration-300 transform">
                {svgComponent}
                <h3 className="text-2xl font-semibold text-gray-100">{title}</h3>
                <p className="mt-4 text-gray-400 text-lg">{description}</p>
                <a href={link} className="mt-6 inline-block w-full text-center py-3 px-6 rounded-lg font-semibold code-link">
                    View Project
                </a>
            </div>
        </ElectricBorder>
    );
};

export default ProjectCard;
