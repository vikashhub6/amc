import { useRef, useState, useEffect } from 'react';

// Customer digital signature capture - plain canvas, no external library needed.
// onChange receives a File (PNG blob) ready to append to FormData.
export default function SignaturePad({ onChange }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#171b22';
  }, []);

  function getPos(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    return {
      x: ((point.clientX - rect.left) / rect.width) * canvas.width,
      y: ((point.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function start(e) {
    e.preventDefault();
    drawing.current = true;
    const { x, y } = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function move(e) {
    if (!drawing.current) return;
    e.preventDefault();
    const { x, y } = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
    setIsEmpty(false);
  }

  function end() {
    drawing.current = false;
    canvasRef.current.toBlob((blob) => {
      if (blob) onChange(new File([blob], 'signature.png', { type: 'image/png' }));
    }, 'image/png');
  }

  function clear() {
    const canvas = canvasRef.current;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onChange(null);
  }

  return (
    <div>
      <div className="relative border-2 border-dashed border-ink-200 rounded-xl overflow-hidden bg-ink-50">
        <canvas
          ref={canvasRef}
          width={500}
          height={180}
          className="w-full h-[180px] touch-none bg-white cursor-crosshair"
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={() => drawing.current && end()}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
        />
        {isEmpty && (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-ink-400 pointer-events-none">
            Customer sign here
          </p>
        )}
      </div>
      <button type="button" onClick={clear} className="btn btn-ghost text-xs mt-2">
        Clear signature
      </button>
    </div>
  );
}
