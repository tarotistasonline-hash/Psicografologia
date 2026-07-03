import React, { useState, useRef } from "react";
import { Upload, X, FileImage, Image as ImageIcon } from "lucide-react";

interface ImageUploaderProps {
  onUpload: (base64Image: string | null) => void;
  language: "es" | "pt" | "en";
}

export default function ImageUploader({ onUpload, language }: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const t = {
    es: {
      dragTitle: "Arrastrá y soltá una imagen acá",
      dragSubtitle: "O hacé clic para buscar en tus archivos (PNG, JPG, JPEG)",
      fileSizeLimit: "Tamaño máximo recomendado: 5MB. Para un mejor análisis, asegurate de tener buena iluminación y nitidez.",
      changeImage: "Reemplazar Imagen",
      removeImage: "Eliminar",
      previewLabel: "¡Muestra de escritura cargada con éxito!"
    },
    pt: {
      dragTitle: "Arraste e solte uma imagem aqui",
      dragSubtitle: "Ou clique para navegar nos seus arquivos (PNG, JPG, JPEG)",
      fileSizeLimit: "Tamanho máximo recomendado: 5MB. Para melhor análise, garanta iluminação e nitidez adequadas.",
      changeImage: "Substituir Imagem",
      removeImage: "Remover",
      previewLabel: "Amostra carregada com sucesso!"
    },
    en: {
      dragTitle: "Drag & drop an image here",
      dragSubtitle: "Or click to browse your files (PNG, JPG, JPEG)",
      fileSizeLimit: "Recommended max size: 5MB. Ensure good lighting and high resolution for best results.",
      changeImage: "Replace Image",
      removeImage: "Remove",
      previewLabel: "Handwriting sample loaded successfully!"
    }
  }[language];

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert(
        language === "es"
          ? "Por favor, subí solo archivos de imagen."
          : language === "pt"
          ? "Por favor, envie apenas arquivos de imagem."
          : "Please upload image files only."
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setPreviewUrl(base64);
      onUpload(base64);
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const onDragLeave = () => {
    setIsDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setPreviewUrl(null);
    onUpload(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full" id="image-uploader-wrapper">
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        accept="image/*"
        className="hidden"
      />

      {!previewUrl ? (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all min-h-[220px] ${
            isDragActive
              ? "border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20"
              : "border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30"
          }`}
        >
          <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-xs border border-slate-200 dark:border-slate-700 mb-3 text-indigo-600 dark:text-indigo-400">
            <Upload className="w-6 h-6 animate-pulse" />
          </div>
          
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 text-center">
            {t.dragTitle}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center">
            {t.dragSubtitle}
          </p>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-4 max-w-xs text-center leading-relaxed">
            {t.fileSizeLimit}
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center justify-between w-full mb-3">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <FileImage className="w-4 h-4 text-emerald-500" />
              {t.previewLabel}
            </span>
            <button
              type="button"
              onClick={removeFile}
              className="text-xs text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1 p-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-md transition-all"
            >
              <X className="w-3.5 h-3.5" />
              {t.removeImage}
            </button>
          </div>

          <div className="relative w-full rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white shadow-xs max-h-[250px] flex justify-center items-center">
            <img
              src={previewUrl}
              alt="Handwriting sample preview"
              className="object-contain max-h-[240px] w-full"
            />
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            {t.changeImage}
          </button>
        </div>
      )}
    </div>
  );
}
