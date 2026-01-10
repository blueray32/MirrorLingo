import React, { useRef, useEffect } from 'react';

interface PronunciationWaveformProps {
  audioLevel: number;
  isRecording: boolean;
  width?: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
}

export const PronunciationWaveform: React.FC<PronunciationWaveformProps> = ({
  audioLevel,
  isRecording,
  width = 500,
  height = 120,
  color = '#10b981', // var(--accent)
  backgroundColor = 'transparent'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const waveformDataRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size with high DPI support
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const drawWaveform = () => {
      ctx.clearRect(0, 0, width, height);

      if (isRecording) {
        waveformDataRef.current.push(audioLevel);

        const barWidth = 3;
        const gap = 2;
        const maxSamples = Math.floor(width / (barWidth + gap));

        if (waveformDataRef.current.length > maxSamples) {
          waveformDataRef.current = waveformDataRef.current.slice(-maxSamples);
        }

        const centerY = height / 2;

        waveformDataRef.current.forEach((level, index) => {
          const x = index * (barWidth + gap);
          const rawAmp = level * (height / 2) * 0.9;
          const amplitude = Math.max(2, rawAmp); // Min height of 2px for stylistic continuity

          // Draw double-sided bars
          ctx.beginPath();
          ctx.roundRect(x, centerY - amplitude, barWidth, amplitude * 2, 2);

          // Gradient based on position
          const opacity = 0.3 + (index / waveformDataRef.current.length) * 0.7;
          ctx.fillStyle = color + Math.floor(opacity * 255).toString(16).padStart(2, '0');
          ctx.fill();
        });

        // Add a glow effect to the leading edge
        if (waveformDataRef.current.length > 0) {
          const lastX = (waveformDataRef.current.length - 1) * (barWidth + gap);
          ctx.shadowBlur = 15;
          ctx.shadowColor = color;
          ctx.fillStyle = color;
          ctx.fillRect(lastX, 0, 2, height);
          ctx.shadowBlur = 0;
        }

      } else {
        // Static "Pulse" state
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = '800 10px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('ACOUSTIC STREAM READY', width / 2, height / 2 + 15);
      }

      if (isRecording) {
        animationFrameRef.current = requestAnimationFrame(drawWaveform);
      }
    };

    drawWaveform();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioLevel, isRecording, width, height, color]);

  useEffect(() => {
    if (!isRecording) {
      waveformDataRef.current = [];
    }
  }, [isRecording]);

  return (
    <div className="waveform-wrapper">
      <canvas
        ref={canvasRef}
        className="waveform-canvas"
        style={{ width, height }}
      />

      {isRecording && (
        <div className="live-meta">
          <div className="recording-dot"></div>
          <span className="live-label">Capturing Neural Patterns</span>
        </div>
      )}

      <style jsx>{`
        .waveform-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          width: 100%;
        }

        .waveform-canvas {
          display: block;
          max-width: 100%;
        }

        .live-meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(239, 68, 68, 0.1);
          padding: 0.4rem 1rem;
          border-radius: 100px;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .live-label {
          color: #ef4444;
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .recording-dot {
          width: 6px;
          height: 6px;
          background: #ef4444;
          border-radius: 50%;
          box-shadow: 0 0 10px #ef4444;
          animation: pulse-red 2s infinite;
        }

        @keyframes pulse-red {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
