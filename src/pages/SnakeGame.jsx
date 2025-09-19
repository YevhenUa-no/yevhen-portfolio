import React, { useRef, useEffect, useState } from 'react';
import * as Tone from 'tone';

// CSS styles in a single block for simplicity.
// For a production app, you would move this to a CSS module.
const styles = `
    body {
        font-family: 'Inter', sans-serif;
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        color: #10b981;
        flex-direction: column;
        user-select: none;
        overflow: hidden;
    }

    .container {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        height: 100vh;
        width: 100%;
    }

    canvas {
        background-color: rgba(15, 23, 42, 0.8);
        border: 3px solid #10b981;
        border-radius: 0.75rem;
        box-shadow: 0 0 30px rgba(16, 185, 129, 0.6), inset 0 0 20px rgba(16, 185, 129, 0.1);
    }

    .game-info {
        margin-top: 1rem;
        text-align: center;
        font-size: 1.5rem;
        font-weight: bold;
        text-shadow: 0 0 10px rgba(16, 185, 129, 0.8);
    }

    .controls-info {
        margin-top: 0.5rem;
        font-size: 0.9rem;
        color: #64748b;
        text-align: center;
    }

    #game-over-message {
        display: none;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%);
        padding: 2rem;
        border-radius: 1rem;
        border: 3px solid #ef4444;
        color: #ef4444;
        font-size: 2rem;
        font-weight: bold;
        text-shadow: 0 0 15px #ef4444;
        text-align: center;
        z-index: 10;
        backdrop-filter: blur(10px);
    }

    #start-button {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: #0f172a;
        padding: 1rem 2.5rem;
        border-radius: 9999px;
        font-weight: 700;
        font-size: 1.1rem;
        margin-top: 1rem;
        box-shadow: 0 0 15px rgba(16, 185, 129, 0.7);
        transition: all 0.3s ease;
        cursor: pointer;
        border: none;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    #start-button:hover {
        transform: scale(1.05) translateY(-2px);
        box-shadow: 0 5px 25px rgba(16, 185, 129, 0.9);
    }

    .title {
        background: linear-gradient(135deg, #10b981, #34d399);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
    }

    .music-controls {
        position: absolute;
        top: 20px;
        right: 20px;
        display: flex;
        gap: 10px;
    }

    .music-button {
        background: rgba(16, 185, 129, 0.2);
        border: 2px solid #10b981;
        color: #10b981;
        padding: 8px 12px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.2s;
    }

    .music-button:hover {
        background: rgba(16, 185, 129, 0.3);
        box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
    }
    
    .control-button {
        background-color: rgba(16, 185, 129, 0.2);
        border: 2px solid #10b981;
        color: #10b981;
        padding: 1rem;
        font-size: 2rem;
        font-weight: bold;
        border-radius: 0.75rem;
        transition: all 0.2s;
        cursor: pointer;
        box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
        text-shadow: 0 0 5px #10b981;
        line-height: 1;
    }
    
    .control-button:active {
        transform: scale(0.95);
        background-color: rgba(16, 185, 129, 0.4);
    }

    #controls-container {
        display: none;
    }

    @media (max-width: 768px) {
        #controls-container {
            display: block;
        }
        .controls-row {
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin-bottom: 0.5rem;
        }
    }
`;

function SnakeGame() {
    const canvasRef = useRef(null);
    const gameLoopRef = useRef(null);
    const mainLoopRef = useRef(null);
    const directionRef = useRef({ x: 1, y: 0 });
    const touchStartRef = useRef({ x: 0, y: 0 });

    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(localStorage.getItem('snakeHighScore') || 0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [musicEnabled, setMusicEnabled] = useState(true);

    const gridSize = 20;
    let tileSize;
    let snake, food;

    const playPointSound = () => {
        if (!Tone.context || !musicEnabled) return;
        const pitches = ["C5", "D5", "E5", "F5", "G5"];
        const randomPitch = pitches[Math.floor(Math.random() * pitches.length)];
        const pointSynth = new Tone.Synth({
            oscillator: { type: "triangle8" },
            envelope: { attack: 0.01, decay: 0.1, sustain: 0.05, release: 0.1 }
        }).chain(new Tone.Volume(-8), Tone.Destination).toDestination();
        pointSynth.triggerAttackRelease(randomPitch, "16n");
    };

    const playGameOverSound = () => {
        if (!Tone.context) return;
        const buzzSynth = new Tone.Synth({
            oscillator: { type: "sawtooth4" },
            envelope: { attack: 0.01, decay: 1.5, sustain: 0, release: 0.1 }
        }).chain(new Tone.Volume(-12), Tone.Destination).toDestination();
        buzzSynth.triggerAttackRelease("C2", "1n");
    };

    const playBackgroundMusic = () => {
        if (!musicEnabled) return;
        if (mainLoopRef.current) mainLoopRef.current.dispose();
        
        const song = {
            notes: ["E5", "B4", "C5", "D5", "C5", "B4", "A4", "A4", "C5", "E5", "D5", "C5", "B4"],
            durations: ["4n", "8n", "8n", "4n", "8n", "8n", "4n", "8n", "8n", "4n", "8n", "8n", "2n"],
            tempo: 120
        };

        const mainSynth = new Tone.Synth({
            oscillator: { type: "square8", modulationFrequency: 0.5 },
            envelope: