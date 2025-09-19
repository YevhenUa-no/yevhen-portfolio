// src/App.jsx
<<<<<<< HEAD

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import SnakeGame from './pages/SnakeGame';
=======
import MatrixCanvas from './components/MatrixCanvas';
import ProjectCard from './components/ProjectCard';
>>>>>>> parent of 25e7c12 (code update)
import './App.css';

function App() {
  const projects = [
    {
      title: 'Classic Snake Game',
      description: 'A retro-style game built entirely with HTML5 and JavaScript. It showcases fundamental game development logic, including canvas rendering and user input handling.',
      link: 'snake.html',
      svg: (
        <svg className="svg-animation" viewBox="0 0 100 100">
            <path d="M10 50 Q30 20, 50 50 T90 50" fill="none" stroke="#10b981" strokeWidth="5" className="snake-path" />
        </svg>
      )
    },
    {
      title: 'Voice to Speech',
      description: 'A web application that converts spoken language into text in real-time. This project showcases proficiency in audio processing and API integration.',
      link: 'https://lazybot.streamlit.app/',
      svg: (
        <svg className="svg-animation" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="10" fill="#10b981"></circle>
            <circle cx="50" cy="50" r="20" fill="none" stroke="#10b981" strokeWidth="2" className="wave-circle" style={{ animationDelay: '0s' }}></circle>
            <circle cx="50" cy="50" r="35" fill="none" stroke="#10b981" strokeWidth="2" className="wave-circle" style={{ animationDelay: '0.5s' }}></circle>
            <circle cx="50" cy="50" r="50" fill="none" stroke="#10b981" strokeWidth="2" className="wave-circle" style={{ animationDelay: '1s' }}></circle>
        </svg>
      )
    },
    {
        title: 'FinTech Trend Analysis',
        description: 'A detailed analysis of global investment and development trends within the FinTech sector. This project explores key market drivers and future opportunities.',
        link: '#',
        svg: (
            <svg className="svg-animation" viewBox="0 0 100 100" preserveAspectRatio="none">
                <rect x="10" y="50" width="20" height="50" fill="#10b981" className="pulse-bar" style={{ animationDelay: '0s' }}></rect>
                <rect x="40" y="30" width="20" height="70" fill="#10b981" className="pulse-bar" style={{ animationDelay: '0.5s' }}></rect>
                <rect x="70" y="70" width="20" height="30" fill="#10b981" className="pulse-bar" style={{ animationDelay: '1s' }}></rect>
            </svg>
        )
    },
    {
        title: 'Data Modeling & Analytics',
        description: 'An application demonstrating data modeling skills to forecast market behavior and visualize complex financial data using interactive charts.',
        link: '#',
        svg: (
            <svg className="svg-animation" viewBox="0 0 100 100">
                <g fill="#10b981" className="data-stream">
                    <rect x="25" y="0" width="50" height="10" fill="#10b981"></rect>
                    <rect x="25" y="20" width="50" height="10" fill="#10b981" opacity="0.8"></rect>
                    <rect x="25" y="40" width="50" height="10" fill="#10b981" opacity="0.6"></rect>
                    <rect x="25" y="60" width="50" height="10" fill="#10b981" opacity="0.4"></rect>
                    <rect x="25" y="80" width="50" height="10" fill="#10b981" opacity="0.2"></rect>
                    <text x="50" y="95" textAnchor="middle" fontSize="8" fill="#10b981" fontWeight="bold">LOADING...</text>
                </g>
            </svg>
        )
    }
  ];

  return (
    <div className="text-gray-200">
      <MatrixCanvas />

      <main className="relative z-10 p-4 md:p-8 lg:p-12">
        <header className="max-w-4xl mx-auto text-center py-20 px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 code-title">Yevhen Riabtsun</h1>
          <p className="mt-4 text-xl md:text-2xl font-light text-gray-400">Business Analyst at Statkraft | FinTech & AI</p>
          <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            I'm a Business Analyst at Statkraft with a passion for turning data into impact. With a background in Finance and FinTech, and recent training from the Oxford Machine Learning Summer School, I explore the edge of AI, machine learning, and generative models. This space showcases hobby projects born from curiosity—where data meets creativity and innovation. Welcome!
          </p>
        </header>

        <section className="max-w-6xl mx-auto mt-16" id="projects">
          <h2 className="text-3xl md:text-4xl font-bold text-[#10b981] text-center mb-12">My Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
            {projects.map((project, index) => (
                <ProjectCard
                    key={index}
                    title={project.title}
                    description={project.description}
                    link={project.link}
                    svgComponent={project.svg}
                />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
