// src/components/MatrixCanvas.jsx
import { useEffect, useRef } from 'react';

const MatrixCanvas = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let width, height;

        const resizeCanvas = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            columns = Math.floor(width / fontSize);
            drops = [];
            for (let x = 0; x < columns; x++) {
                drops[x] = 1;
            }
        };

        const textCharacters = "01".split('');
        const fontSize = 16;
        let columns;
        let drops = [];

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const draw = () => {
            ctx.fillStyle = 'rgba(13, 15, 16, 0.05)';
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = '#0f0';
            ctx.font = fontSize + 'px monospace';

            for (let i = 0; i < drops.length; i++) {
                const text = textCharacters[Math.floor(Math.random() * textCharacters.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };

        const intervalId = setInterval(draw, 50);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    return <canvas id="matrix-canvas" ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 opacity-15"></canvas>;
};

export default MatrixCanvas;