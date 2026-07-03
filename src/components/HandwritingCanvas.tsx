import React, { useRef, useState, useEffect } from "react";
import { Trash2, RotateCcw, PenTool, Eraser, Eye, EyeOff } from "lucide-react";

interface HandwritingCanvasProps {
  onCapture: (base64Image: string | null) => void;
  language: "es" | "pt" | "en";
}

export default function HandwritingCanvas({ onCapture, language }: HandwritingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState("#1e293b"); // Deep ink color
  const [brushWidth, setBrushWidth] = useState(3);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [paperStyle, setPaperStyle] = useState<"blank" | "lined" | "grid">("blank");
  const [hasDrawings, setHasDrawings] = useState(false);

  // Labels based on language
  const t = {
    es: {
      clear: "Limpiar",
      eraser: "Borrador",
      pen: "Bolígrafo Azul-Tinta",
      thick: "Grosor",
      thickDesc: "Ajustá el grosor para simular la presión o fuerza real de tu escritura habitual en papel (no lo cambies solo por estética; el sistema lo interpretará como tu nivel de presión al escribir).",
      paper: "Estilo de Papel",
      paperBlank: "Sin renglones",
      paperLined: "Renglones",
      paperGrid: "Cuadrícula",
      drawInstruction: "Escribí una frase cortita y firmá tu nombre para analizar...",
      undo: "Limpiar Todo"
    },
    pt: {
      clear: "Limpar",
      eraser: "Borracha",
      pen: "Caneta Azul-Tinta",
      thick: "Espessura",
      thickDesc: "Ajuste a espessura para simular a pressão real de sua escrita habitual no papel (o sistema interpretará isso como seu nível de pressão de escrita).",
      paper: "Papel",
      paperBlank: "Sem pauta",
      paperLined: "Pautado",
      paperGrid: "Quadriculado",
      drawInstruction: "Escreva uma frase curta e assine seu nome para análise...",
      undo: "Limpar Tudo"
    },
    en: {
      clear: "Clear",
      eraser: "Eraser",
      pen: "Ink Pen",
      thick: "Thickness",
      thickDesc: "Adjust thickness to simulate the real pressure of your habitual writing on paper (the system will interpret this as your pen pressure level).",
      paper: "Paper Style",
      paperBlank: "Blank",
      paperLined: "Lined",
      paperGrid: "Grid",
      drawInstruction: "Write a short sentence and sign your name for analysis...",
      undo: "Clear All"
    }
  }[language];

  // Adjust canvas resolution for high-DPI displays
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width || 600;
    const height = 300;

    canvas.width = width * 2;
    canvas.height = height * 2;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(2, 2);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushWidth;
    }
  };

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  // Update canvas properties when tool, color, or brush width changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.strokeStyle = tool === "eraser" ? "#ffffff" : brushColor;
      ctx.lineWidth = tool === "eraser" ? 24 : brushWidth;
    }
  }, [tool, brushColor, brushWidth]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    // Check if touch event
    if ("touches" in e) {
      if (e.touches.length === 0) return null;
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      setIsDrawing(true);
      setHasDrawings(true);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const coords = getCoordinates(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    captureCanvas();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawings(false);
      onCapture(null);
    }
  };

  const captureCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawings) return;

    // Create a temporary canvas with white background to send to Gemini
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");
    
    if (tempCtx) {
      // 1. Fill background with solid white
      tempCtx.fillStyle = "#ffffff";
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // 2. Draw actual canvas drawings on top
      tempCtx.drawImage(canvas, 0, 0);

      // 3. Export to base64
      const base64 = tempCanvas.toDataURL("image/png");
      onCapture(base64);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full" id="handwriting-canvas-container">
      {/* Tool panel */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setTool("pen")}
            className={`p-2 rounded-md transition-all flex items-center gap-1.5 text-xs font-medium ${
              tool === "pen"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800"
            }`}
            title={t.pen}
          >
            <PenTool className="w-4 h-4" />
            <span className="hidden sm:inline">{t.pen}</span>
          </button>
          
          <button
            type="button"
            onClick={() => setTool("eraser")}
            className={`p-2 rounded-md transition-all flex items-center gap-1.5 text-xs font-medium ${
              tool === "eraser"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800"
            }`}
            title={t.eraser}
          >
            <Eraser className="w-4 h-4" />
            <span className="hidden sm:inline">{t.eraser}</span>
          </button>

          {tool === "pen" && (
            <>
              <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-1.5" />
              <div className="flex items-center gap-1">
                {["#1e293b", "#1d4ed8", "#b91c1c", "#15803d"].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setBrushColor(color)}
                    style={{ backgroundColor: color }}
                    className={`w-4 h-4 rounded-full border transition-transform cursor-pointer ${
                      brushColor === color
                        ? "scale-125 ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-slate-900"
                        : "hover:scale-110"
                    }`}
                    title={
                      color === "#1e293b" ? (language === "es" ? "Tinta Negra" : language === "pt" ? "Tinta Preta" : "Black Ink") :
                      color === "#1d4ed8" ? (language === "es" ? "Tinta Azul" : language === "pt" ? "Tinta Azul" : "Blue Ink") :
                      color === "#b91c1c" ? (language === "es" ? "Tinta Roja" : language === "pt" ? "Tinta Vermelha" : "Red Ink") :
                      (language === "es" ? "Tinta Verde" : language === "pt" ? "Tinta Verde" : "Green Ink")
                    }
                  />
                ))}
              </div>
            </>
          )}
        </div>



        {/* Clear Actions */}
        <button
          type="button"
          onClick={clearCanvas}
          className="p-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-all flex items-center gap-1.5"
          title={t.clear}
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">{t.undo}</span>
        </button>
      </div>

      {/* Drawing Area Wrapper */}
      <div 
        ref={containerRef}
        className="relative w-full border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white shadow-inner select-none"
        style={{ height: "300px" }}
      >
        {/* Background Paper Guidelines */}
        {paperStyle === "lined" && (
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-0 opacity-40 dark:opacity-20" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 27px, #3b82f6 28px)" }}></div>
        )}
        {paperStyle === "grid" && (
          <div 
            className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-10" 
            style={{ 
              backgroundImage: "linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)", 
              backgroundSize: "20px 20px" 
            }}
          ></div>
        )}

        {/* Floating guidance text when empty */}
        {!hasDrawings && (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center pointer-events-none">
            <p className="text-sm text-slate-400 font-medium max-w-sm">
              {t.drawInstruction}
            </p>
          </div>
        )}

        {/* Main interactive canvas */}
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
        />
      </div>

    </div>
  );
}
