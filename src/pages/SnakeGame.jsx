import React, { useRef, useEffect, useState } from 'react';
import * as Tone from 'tone';

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

    .game-over-message {
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

    .start-button {
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

    .start-button:hover {
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

    .controls-container {
        display: none;
    }

    @media (max-width: 768px) {
        .controls-container {
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
            envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.8 }
        }).chain(new Tone.Filter(800, "lowpass"), new Tone.Volume(-10), Tone.Destination);
        
        Tone.Transport.bpm.value = song.tempo;
        mainLoopRef.current = new Tone.Sequence((time, note) => {
            if (note) mainSynth.triggerAttackRelease(note, "8n", time);
        }, song.notes, "8n").start(0);
    };

    const toggleMusic = async () => {
        if (!isGameStarted && !Tone.context) {
            await Tone.start();
        }
        setMusicEnabled(prev => !prev);
        if (musicEnabled) {
            Tone.Transport.stop();
            if (mainLoopRef.current) mainLoopRef.current.dispose();
        } else {
            Tone.Transport.start();
            playBackgroundMusic();
        }
    };
    
    // Game logic
    const placeFood = () => {
        food = {
            x: Math.floor(Math.random() * gridSize),
            y: Math.floor(Math.random() * gridSize)
        };
        for (let segment of snake) {
            if (segment.x === food.x && segment.y === food.y) {
                placeFood();
                return;
            }
        }
    };

    const checkSelfCollision = () => {
        const head = snake[0];
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                return true;
            }
        }
        return false;
    };

    const endGame = () => {
        setIsGameOver(true);
        setIsGameStarted(false);
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('snakeHighScore', score);
        }
        Tone.Transport.stop();
        if (mainLoopRef.current) mainLoopRef.current.dispose();
        playGameOverSound();
    };

    const drawGame = (ctx) => {
        if (!canvasRef.current) return;
        const gradient = ctx.createLinearGradient(0, 0, canvasRef.current.width, canvasRef.current.height);
        gradient.addColorStop(0, 'rgba(15, 23, 42, 0.9)');
        gradient.addColorStop(1, 'rgba(30, 41, 59, 0.9)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        snake.forEach((segment, index) => {
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = index === 0 ? 15 : 8;
            const segmentGradient = ctx.createRadialGradient(
                segment.x * tileSize + tileSize/2, segment.y * tileSize + tileSize/2, 0,
                segment.x * tileSize + tileSize/2, segment.y * tileSize + tileSize/2, tileSize/2
            );
            segmentGradient.addColorStop(0, index === 0 ? '#34d399' : '#10b981');
            segmentGradient.addColorStop(1, index === 0 ? '#10b981' : '#059669');
            ctx.fillStyle = segmentGradient;
            ctx.fillRect(segment.x * tileSize + 1, segment.y * tileSize + 1, tileSize - 2, tileSize - 2);
        });

        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 20;
        const foodGradient = ctx.createRadialGradient(
            food.x * tileSize + tileSize/2, food.y * tileSize + tileSize/2, 0,
            food.x * tileSize + tileSize/2, food.y * tileSize + tileSize/2, tileSize/2
        );
        foodGradient.addColorStop(0, '#f87171');
        foodGradient.addColorStop(1, '#dc2626');
        ctx.fillStyle = foodGradient;
        ctx.fillRect(food.x * tileSize + 2, food.y * tileSize + 2, tileSize - 4, tileSize - 4);

        ctx.shadowBlur = 0;
    };

    const gameTick = () => {
        if (isGameOver) return;
        const direction = directionRef.current;
        const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            setScore(prev => prev + 1);
            playPointSound();
            placeFood();
        } else {
            snake.pop();
        }

        if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize || checkSelfCollision()) {
            endGame();
        }

        const ctx = canvasRef.current.getContext('2d');
        drawGame(ctx);
    };

    const startGame = async () => {
        setIsGameOver(false);
        setScore(0);
        setIsGameStarted(true);
        snake = [
            { x: Math.floor(gridSize/2), y: Math.floor(gridSize/2) },
            { x: Math.floor(gridSize/2) - 1, y: Math.floor(gridSize/2) }
        ];
        directionRef.current = { x: 1, y: 0 };
        placeFood();
        
        await Tone.start();
        if (musicEnabled) {
            Tone.Transport.start();
            playBackgroundMusic();
        }

        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        gameLoopRef.current = setInterval(gameTick, 120);
    };

    // UseEffect hook for setting up the canvas and event listeners
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        const setupCanvas = () => {
            const size = Math.min(window.innerWidth * 0.8, window.innerHeight * 0.6, 500);
            canvas.width = size - (size % gridSize);
            canvas.height = size - (size % gridSize);
            tileSize = canvas.width / gridSize;
        };
        
        setupCanvas();
        window.addEventListener('resize', setupCanvas);

        const handleKeyDown = e => {
            if (isGameOver) return;
            switch (e.key) {
                case 'ArrowUp':
                case 'w': if (directionRef.current.y === 0) directionRef.current = { x: 0, y: -1 }; break;
                case 'ArrowDown':
                case 's': if (directionRef.current.y === 0) directionRef.current = { x: 0, y: 1 }; break;
                case 'ArrowLeft':
                case 'a': if (directionRef.current.x === 0) directionRef.current = { x: -1, y: 0 }; break;
                case 'ArrowRight':
                case 'd': if (directionRef.current.x === 0) directionRef.current = { x: 1, y: 0 }; break;
                case ' ': e.preventDefault(); toggleMusic(); break;
            }
        };

        const handleTouchStart = e => {
            if (isGameOver) return;
            e.preventDefault();
            touchStartRef.current.x = e.touches[0].clientX;
            touchStartRef.current.y = e.touches[0].clientY;
        };

        const handleTouchMove = e => {
            if (isGameOver || e.touches.length === 0) return;
            e.preventDefault();
            const touchEndX = e.touches[0].clientX;
            const touchEndY = e.touches[0].clientY;
            const dx = touchEndX - touchStartRef.current.x;
            const dy = touchEndY - touchStartRef.current.y;
            const sensitivity = 20;

            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > sensitivity) {
                if (dx > 0 && directionRef.current.x === 0) directionRef.current = { x: 1, y: 0 };
                else if (dx < 0 && directionRef.current.x === 0) directionRef.current = { x: -1, y: 0 };
            } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > sensitivity) {
                if (dy > 0 && directionRef.current.y === 0) directionRef.current = { x: 0, y: 1 };
                else if (dy < 0 && directionRef.current.y === 0) directionRef.current = { x: 0, y: -1 };
            }
            touchStartRef.current.x = touchEndX;
            touchStartRef.current.y = touchEndY;
        };

        document.addEventListener('keydown', handleKeyDown);
        canvas.addEventListener('touchstart', handleTouchStart);
        canvas.addEventListener('touchmove', handleTouchMove);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('resize', setupCanvas);
            canvas.removeEventListener('touchstart', handleTouchStart);
            canvas.removeEventListener('touchmove', handleTouchMove);
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
            if (mainLoopRef.current) mainLoopRef.current.dispose();
            if (Tone.Transport.state === 'started') {
                Tone.Transport.stop();
            }
        };
    }, [isGameOver, musicEnabled]);

    useEffect(() => {
        if (canvasRef.current && isGameStarted) {
            const ctx = canvasRef.current.getContext('2d');
            drawGame(ctx);
        }
    }, [score, isGameStarted]);

    return (
        <div className="container">
            <style>{styles}</style>
            <div className="music-controls">
                <button className="music-button" onClick={toggleMusic}>
                    🎵 Music {musicEnabled ? 'On' : 'Off'}
                </button>
            </div>
            <div className="text-center mb-6">
                <h1 className="text-4xl md:text-5xl font-extrabold title">RETRO SNAKE</h1>
                <p className="text-sm text-gray-400 mt-2">Classic arcade gaming with 8-bit beats!</p>
            </div>
            <canvas ref={canvasRef}></canvas>
            <div className="game-info">
                Score: <span id="score">{score}</span> | High Score: <span id="highScore">{highScore}</span>
            </div>
            <div className="controls-info">
                Use arrow keys or swipe to control • Collect red food to grow
            </div>
            {isGameOver && (
                <div className="game-over-message" style={{ display: 'block' }}>
                    <div>GAME OVER!</div>
                    <div style={{ fontSize: '1.2rem', marginTop: '10px' }}>Final Score: {score}</div>
                </div>
            )}
            <button className="start-button" onClick={startGame}>
                {isGameStarted ? 'PLAY AGAIN' : 'START GAME'}
            </button>
            <div className="controls-container mt-8">
                <div className="controls-row">
                    <button className="control-button" onClick={() => directionRef.current.y === 0 && (directionRef.current = { x: 0, y: -1 })}>▲</button>
                </div>
                <div className="controls-row">
                    <button className="control-button" onClick={() => directionRef.current.x === 0 && (directionRef.current = { x: -1, y: 0 })}>◀</button>
                    <button className="control-button" onClick={() => directionRef.current.y === 0 && (directionRef.current = { x: 0, y: 1 })}>▼</button>
                    <button className="control-button" onClick={() => directionRef.current.x === 0 && (directionRef.current = { x: 1, y: 0 })}>▶</button>
                </div>
            </div>
        </div>
    );
}

export default SnakeGame;