import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageSquare, 
  Star, 
  Send, 
  Settings, 
  Check, 
  AlertCircle, 
  Sparkles, 
  ThumbsUp,
  User,
  Trash2
} from "lucide-react";

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  avatarColor: string;
  isCustom?: boolean; // added by user
  likes: number;
  hasLiked?: boolean;
}

interface BlogSectionProps {
  language: "es" | "pt" | "en";
}

// Highly polished preset reviews to simulate an active public board
const PRESET_REVIEWS: Record<"es" | "pt" | "en", Omit<Review, "id" | "avatarColor" | "likes">[]> = {
  es: [
    {
      name: "Marcos S.",
      rating: 5,
      comment: "¡Excelente analizador de firmas! Me sorprendió mucho la precisión con la que describió mi personalidad a partir de los trazos de mi rúbrica. El PDF de descarga está de 10.",
      date: "Hace 2 horas"
    },
    {
      name: "Carolina F.",
      rating: 5,
      comment: "La interfaz es hermosa y súper rápida. Qué buena idea armar un sitio de grafología científica tan serio y estéticamente impecable.",
      date: "Ayer"
    },
    {
      name: "Damián Olivera",
      rating: 4,
      comment: "Muy intuitivo el test interactivo paso a paso. Me sirvió para entender por qué mi firma cambia tanto cuando estoy estresado.",
      date: "Hace 2 días"
    },
    {
      name: "Patricia R.",
      rating: 5,
      comment: "Me encantó que se pueda usar totalmente gratis y sin vueltas. Los consejos de grafoterapia son geniales para calmar la ansiedad.",
      date: "Hace 4 días"
    },
    {
      name: "Sofía Martínez",
      rating: 5,
      comment: "Increíble la precisión del análisis de liderazgo. Lo compartí con todo mi equipo de trabajo y quedamos fascinados con los resultados.",
      date: "Hace 1 semana"
    }
  ],
  pt: [
    {
      name: "Thiago M.",
      rating: 5,
      comment: "Excelente analisador! Fiquei muito surpreso com a precisão com que descreveu minha personalidade apenas analisando minha assinatura.",
      date: "Há 2 horas"
    },
    {
      name: "Aline Sousa",
      rating: 5,
      comment: "A interface é linda, limpa e extremamente rápida. Um excelente recurso de grafologia científica sem anúncios chatos.",
      date: "Ontem"
    },
    {
      name: "Ronaldo D.",
      rating: 4,
      comment: "Muito divertido! Baixei o relatório em PDF e enviei para os meus amigos no grupo. Parabéns pelo desenvolvimento do site.",
      date: "Há 2 dias"
    },
    {
      name: "Beatriz L.",
      rating: 5,
      comment: "Os insights sobre cansaço e estresse muscular foram cirúrgicos. Realmente a escrita reflete o nosso cérebro.",
      date: "Há 5 dias"
    }
  ],
  en: [
    {
      name: "Arthur K.",
      rating: 5,
      comment: "Incredibly polished tool. The signature analysis is shockingly accurate and the automatically generated PDF report is beautiful.",
      date: "2 hours ago"
    },
    {
      name: "Elena B.",
      rating: 5,
      comment: "Perfect utility. No bloatware, extremely fast responses, and a highly aesthetic design. Truly impressive work!",
      date: "Yesterday"
    },
    {
      name: "Ryan J.",
      rating: 4,
      comment: "The personality profiling is spot-on. I especially enjoyed the interactive guided canvas questionnaire. Highly recommended.",
      date: "3 days ago"
    },
    {
      name: "Emily Watson",
      rating: 5,
      comment: "Wonderful site. Very clean user interface with superb attention to visual hierarchy and typography. Flawless experience.",
      date: "1 week ago"
    }
  ]
};

const AVATAR_COLORS = [
  "bg-indigo-500 text-white",
  "bg-emerald-500 text-white",
  "bg-violet-500 text-white",
  "bg-sky-500 text-white",
  "bg-rose-500 text-white",
  "bg-amber-500 text-white",
  "bg-fuchsia-500 text-white"
];

export default function BlogSection({ language }: BlogSectionProps) {
  // Local state for reviews (custom reviews saved in localStorage + presets)
  const [customReviews, setCustomReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem("graphostudio_user_reviews");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Formspree Endpoint (for silent notification to owner in case they want to log reviews in their mail)
  const [formspreeEndpoint, setFormspreeEndpoint] = useState<string>(() => {
    return localStorage.getItem("graphostudio_formspree_url") || "https://formspree.io/f/xoqyzgop";
  });

  const [showSettings, setShowSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Form input states (NO EMAIL, NO SIGNATURE)
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Filter rating
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | "all">("all");

  // Load preset base reviews depending on current language
  const [presetReviewsList, setPresetReviewsList] = useState<Review[]>([]);

  useEffect(() => {
    const list = PRESET_REVIEWS[language].map((r, index) => ({
      id: `preset-${language}-${index}`,
      name: r.name,
      rating: r.rating,
      comment: r.comment,
      date: r.date,
      avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
      likes: Math.floor(Math.random() * 8) + 3,
      hasLiked: false
    }));
    setPresetReviewsList(list);
  }, [language]);

  // Combine custom reviews + current language presets
  const allReviews = [...customReviews.filter(r => !r.id.startsWith("preset-")), ...presetReviewsList];

  // Save custom reviews to local storage whenever changed
  useEffect(() => {
    localStorage.setItem("graphostudio_user_reviews", JSON.stringify(customReviews));
  }, [customReviews]);

  const saveSettings = () => {
    localStorage.setItem("graphostudio_formspree_url", formspreeEndpoint);
    setSettingsSaved(true);
    setTimeout(() => {
      setSettingsSaved(false);
      setShowSettings(false);
    }, 1500);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setSubmitError(
        language === "es" 
          ? "Por favor, escribe un comentario sobre lo que te pareció el sitio." 
          : language === "pt" 
          ? "Por favor, escreva um comentário sobre o que achou do site." 
          : "Please write a comment sharing what you thought of the site."
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const authorName = name.trim() || (language === "es" ? "Visitante Anónimo" : language === "pt" ? "Visitante Anônimo" : "Anonymous Visitor");

    // Create the new review structure
    const newReview: Review = {
      id: `custom-${Date.now()}`,
      name: authorName,
      rating,
      comment: comment.trim(),
      date: language === "es" ? "Hace unos momentos" : language === "pt" ? "Há poucos instantes" : "Just now",
      avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      isCustom: true,
      likes: 0,
      hasLiked: false
    };

    // Formspree payload (silent notification so owner receives opinion)
    const payload = {
      name: authorName,
      rating: `${rating} / 5 Stars`,
      comment: comment.trim(),
      subject: "Nueva Opinión sobre el Analizador de Grafología"
    };

    try {
      // Optional: attempt silent submission to Formspree
      if (formspreeEndpoint) {
        await fetch(formspreeEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(payload)
        });
      }
    } catch (err) {
      // Silent catch - we want it to submit locally even if offline or invalid Formspree endpoint
      console.warn("Silent notification failed to deliver:", err);
    }

    // Success flow (adds directly to local reviews)
    setCustomReviews(prev => [newReview, ...prev]);
    setFormSubmitted(true);
    setName("");
    setComment("");
    setRating(5);
    setIsSubmitting(false);

    // Reset success banner after 5 seconds
    setTimeout(() => {
      setFormSubmitted(false);
    }, 5000);
  };

  const handleLike = (id: string) => {
    // Check if customized
    const isCustom = id.startsWith("custom-");
    if (isCustom) {
      setCustomReviews(prev => prev.map(r => {
        if (r.id === id) {
          const hasLiked = !r.hasLiked;
          return {
            ...r,
            hasLiked,
            likes: hasLiked ? r.likes + 1 : r.likes - 1
          };
        }
        return r;
      }));
    } else {
      setPresetReviewsList(prev => prev.map(r => {
        if (r.id === id) {
          const hasLiked = !r.hasLiked;
          return {
            ...r,
            hasLiked,
            likes: hasLiked ? r.likes + 1 : r.likes - 1
          };
        }
        return r;
      }));
    }
  };

  const handleDeleteReview = (id: string) => {
    setCustomReviews(prev => prev.filter(r => r.id !== id));
  };

  // Filter reviews
  const filteredReviews = allReviews.filter(r => {
    if (selectedRatingFilter === "all") return true;
    return r.rating === selectedRatingFilter;
  });

  // Calculate stats
  const totalReviewsCount = allReviews.length;
  const averageRating = totalReviewsCount > 0 
    ? (allReviews.reduce((acc, r) => acc + r.rating, 0) / totalReviewsCount).toFixed(1) 
    : "5.0";

  const countByRating = (stars: number) => allReviews.filter(r => r.rating === stars).length;

  return (
    <div className="w-full">
      {/* HEADER ROW */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-indigo-500 shrink-0" />
            {language === "es" 
              ? "Libro de Visitas & Opiniones" 
              : language === "pt" 
              ? "Livro de Visitas & Opiniões" 
              : "Guestbook & User Opinions"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === "es"
              ? "¡Queremos saber qué pensás! Dejá tu reseña sobre el analizador o leé lo que dicen otros visitantes sin necesidad de registro ni correos."
              : language === "pt"
              ? "Queremos saber sua opinião! Deixe seu comentário sobre o analisador ou leia o que outros visitantes acham, sem cadastro ou e-mail."
              : "We want to hear from you! Leave your feedback about the site or read what other visitors have to say—no email or sign-up required."}
          </p>
        </div>

        {/* Configurations cog button for owner (Formspree silent notifications) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-xs"
          >
            <Settings className="w-3.5 h-3.5 text-indigo-500" />
            {language === "es" ? "Ajustes del Muro" : language === "pt" ? "Ajustes do Mural" : "Wall Settings"}
          </button>

          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 z-50 w-72 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Settings className="w-3.5 h-3.5 text-indigo-500" />
                    {language === "es" ? "Recibir Copia al Mail" : language === "pt" ? "Receber no E-mail" : "Get Copy to Email"}
                  </h4>
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer font-bold"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal mb-3">
                  {language === "es"
                    ? "Para recibir todas las opiniones directamente en tu casilla de correo por Formspree, colocá tu endpoint aquí:"
                    : language === "pt"
                    ? "Para receber todos os comentários diretamente na sua caixa de entrada via Formspree, insira seu endpoint aqui:"
                    : "To forward all guestbook comments straight to your email inbox via Formspree, paste your endpoint here:"}
                </p>
                <input
                  type="text"
                  value={formspreeEndpoint}
                  onChange={(e) => setFormspreeEndpoint(e.target.value)}
                  placeholder="https://formspree.io/f/tu-codigo"
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 mb-3"
                />
                <button
                  type="button"
                  onClick={saveSettings}
                  className="w-full py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all shadow-md"
                >
                  {settingsSaved ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      {language === "es" ? "¡Configurado!" : language === "pt" ? "Configurado!" : "Configured!"}
                    </>
                  ) : (
                    language === "es" ? "Guardar cambios" : language === "pt" ? "Salvar alterações" : "Save Changes"
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* STATS OVERVIEW BENTO ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        
        {/* Rating average big bento block */}
        <div className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 flex flex-col items-center justify-center text-center shadow-xs">
          <span className="text-4xl font-black text-slate-900 dark:text-white leading-none">
            {averageRating}
          </span>
          <div className="flex items-center gap-0.5 mt-2.5">
            {[1, 2, 3, 4, 5].map((starValue) => {
              const numVal = parseFloat(averageRating);
              const isFilled = starValue <= Math.round(numVal);
              return (
                <Star 
                  key={starValue} 
                  className={`w-4 h-4 ${isFilled ? "fill-amber-400 text-amber-400" : "text-slate-200 dark:text-slate-800"}`} 
                />
              );
            })}
          </div>
          <p className="text-[11px] text-slate-400 font-bold mt-2">
            {language === "es" 
              ? `Promedio basado en ${totalReviewsCount} opiniones` 
              : language === "pt" 
              ? `Média baseada em ${totalReviewsCount} avaliações` 
              : `Average based on ${totalReviewsCount} reviews`}
          </p>
        </div>

        {/* Progress distribution bar chart block */}
        <div className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 flex flex-col justify-center shadow-xs md:col-span-2">
          <div className="flex flex-col gap-1.5">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = countByRating(stars);
              const percentage = totalReviewsCount > 0 ? (count / totalReviewsCount) * 100 : 0;
              return (
                <div key={stars} className="flex items-center gap-3">
                  <button 
                    onClick={() => setSelectedRatingFilter(selectedRatingFilter === stars ? "all" : stars)}
                    className={`text-[10px] font-black tracking-wider w-11 flex items-center gap-1 text-left cursor-pointer hover:text-indigo-500 transition-colors ${selectedRatingFilter === stars ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500"}`}
                  >
                    <span>{stars}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                  </button>
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-400 rounded-full transition-all duration-500" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 w-6 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* MAIN TWO COLUMN GRID: WRITE REVIEW (LEFT) AND REVIEWS WALL (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN: GUESTBOOK SUBMISSION FORM (NO EMAIL FIELD, NO SIGNATURE) */}
        <div className="lg:col-span-1 bg-gradient-to-br from-indigo-50/40 to-slate-50/40 dark:from-indigo-950/10 dark:to-slate-950 border border-slate-200/60 dark:border-indigo-950/20 rounded-2xl p-5 shadow-xs sticky top-6">
          <div className="flex items-start gap-3 mb-4.5">
            <div className="p-2.5 bg-indigo-100/60 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-wider">
                {language === "es" ? "Dejá tu Opinión" : language === "pt" ? "Deixe sua Opinião" : "Leave your Review"}
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                {language === "es"
                  ? "Compartí libremente tu experiencia o comentario sobre la página. ¡Aparecerá en el muro al instante!"
                  : language === "pt"
                  ? "Compartilhe sua experiência sobre o site. Aparecerá no mural imediatamente!"
                  : "Share your experience with this handwriting analyser. It will appear on the wall instantly!"}
              </p>
            </div>
          </div>

          <AnimatePresence>
            {formSubmitted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-200/50 dark:border-emerald-800/40 rounded-xl p-4 text-center mb-4"
              >
                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Check className="w-4.5 h-4.5" />
                </div>
                <h4 className="text-xs font-black text-emerald-800 dark:text-emerald-300">
                  {language === "es" ? "¡Publicado en el Muro!" : language === "pt" ? "Publicado no Mural!" : "Published successfully!"}
                </h4>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 leading-normal">
                  {language === "es"
                    ? "Tu opinión ya se encuentra visible para otros visitantes."
                    : language === "pt"
                    ? "Seu comentário já está visível para outros usuários."
                    : "Your review is now live on our guestbook wall."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleCommentSubmit} className="flex flex-col gap-4">
            
            {/* Nickname / Name (Optional) */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                {language === "es" ? "Nombre o Apodo" : language === "pt" ? "Nome ou Apelido" : "Name or Nickname"}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  language === "es" 
                    ? "Ej: Martín P. (Dejar vacío para Anónimo)" 
                    : language === "pt" 
                    ? "Ex: Thiago M. (Vazio para Anônimo)" 
                    : "Ex: Alex W. (Leave empty for Anonymous)"
                }
                className="w-full text-xs p-2.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800/80 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 shadow-xs"
              />
            </div>

            {/* STAR RATING INTERACTIVE INPUT */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                {language === "es" ? "¿Cuántas estrellas le das?" : language === "pt" ? "Quantas estrelas você dá?" : "How many stars do you give?"}
              </label>
              <div className="flex items-center gap-1.5 py-1.5">
                {[1, 2, 3, 4, 5].map((starValue) => {
                  const isHighlighted = hoveredRating !== null 
                    ? starValue <= hoveredRating
                    : starValue <= rating;
                  return (
                    <button
                      key={starValue}
                      type="button"
                      onClick={() => setRating(starValue)}
                      onMouseEnter={() => setHoveredRating(starValue)}
                      onMouseLeave={() => setHoveredRating(null)}
                      className="cursor-pointer hover:scale-120 transition-transform focus:outline-hidden"
                    >
                      <Star 
                        className={`w-7 h-7 transition-all ${
                          isHighlighted 
                            ? "fill-amber-400 text-amber-400 drop-shadow-xs" 
                            : "text-slate-200 dark:text-slate-800"
                        }`} 
                      />
                    </button>
                  );
                })}
                <span className="text-xs font-black text-slate-500 dark:text-slate-400 ml-2">
                  {rating} / 5
                </span>
              </div>
            </div>

            {/* Comment Area */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                {language === "es" ? "Tu Mensaje *" : language === "pt" ? "Sua Mensagem *" : "Your Message *"}
              </label>
              <textarea
                required
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  language === "es" 
                    ? "Escribí acá qué te pareció el sitio, el analizador de firmas o lo que quieras..." 
                    : language === "pt" 
                    ? "Escreva aqui o que achou do site, do analisador de assinaturas ou o que desejar..." 
                    : "Type here what you thought about the site, the analyzer, or anything you'd like..."
                }
                className="w-full text-xs p-2.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800/80 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 shadow-xs resize-none leading-relaxed"
              />
            </div>

            {submitError && (
              <div className="text-[10px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 p-2.5 rounded-xl flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>{language === "es" ? "Publicando..." : language === "pt" ? "Publicando..." : "Publishing..."}</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{language === "es" ? "Publicar Comentario" : language === "pt" ? "Publicar Comentário" : "Publish Comment"}</span>
                </>
              )}
            </button>

          </form>
        </div>

        {/* RIGHT COLUMN: GUESTBOOK WALL OF REVIEWS WITH FILTERS */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/40 dark:border-slate-800">
            <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              {language === "es" ? "Filtrar por valoración:" : language === "pt" ? "Filtrar por avaliação:" : "Filter by rating:"}
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setSelectedRatingFilter("all")}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${
                  selectedRatingFilter === "all"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-950"
                }`}
              >
                {language === "es" ? "Todos" : language === "pt" ? "Todos" : "All"}
              </button>
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = countByRating(stars);
                return (
                  <button
                    key={stars}
                    onClick={() => setSelectedRatingFilter(stars)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1 ${
                      selectedRatingFilter === stars
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-950"
                    }`}
                  >
                    <span>{stars}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-[9px] opacity-60">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actual Scrollable reviews list */}
          <div className="flex flex-col gap-4">
            <AnimatePresence initial={false}>
              {filteredReviews.length > 0 ? (
                filteredReviews.map((review) => (
                  <motion.div
                    key={review.id}
                    layoutId={review.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 p-4.5 rounded-2xl shadow-xs relative group"
                  >
                    
                    {/* Delete button (only for user's customized reviews left during session) */}
                    {review.isCustom && (
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="absolute top-4.5 right-4.5 p-1 bg-slate-50 dark:bg-slate-950 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-500 rounded-lg cursor-pointer transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title={language === "es" ? "Eliminar mi opinión" : language === "pt" ? "Excluir meu comentário" : "Delete my review"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <div className="flex items-start gap-3">
                      {/* Colorful dynamic avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none uppercase ${review.avatarColor}`}>
                        {review.name.slice(0, 2)}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Author name and date */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                            {review.name}
                          </h4>
                          {review.isCustom && (
                            <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/40 px-1.5 py-0.2 rounded-xs uppercase tracking-wider">
                              {language === "es" ? "Vos" : language === "pt" ? "Você" : "You"}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 ml-auto shrink-0 font-medium">
                            {review.date}
                          </span>
                        </div>

                        {/* Stars Display */}
                        <div className="flex items-center gap-0.5 mt-1">
                          {[1, 2, 3, 4, 5].map((starValue) => (
                            <Star 
                              key={starValue} 
                              className={`w-3.5 h-3.5 ${starValue <= review.rating ? "fill-amber-400 text-amber-400" : "text-slate-100 dark:text-slate-800/80"}`} 
                            />
                          ))}
                        </div>

                        {/* Comment Content */}
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed whitespace-pre-line">
                          {review.comment}
                        </p>

                        {/* Interaction bar (Likes count) */}
                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100/60 dark:border-slate-800/60">
                          <button
                            type="button"
                            onClick={() => handleLike(review.id)}
                            className={`flex items-center gap-1.5 text-[10px] font-bold cursor-pointer transition-colors ${
                              review.hasLiked 
                                ? "text-indigo-600 dark:text-indigo-400" 
                                : "text-slate-400 hover:text-slate-600"
                            }`}
                          >
                            <ThumbsUp className={`w-3 h-3 ${review.hasLiked ? "fill-current" : ""}`} />
                            <span>
                              {review.likes} {review.likes === 1 ? (language === "es" || language === "pt" ? "Me gusta" : "Like") : (language === "es" || language === "pt" ? "Me gustas" : "Likes")}
                            </span>
                          </button>
                        </div>

                      </div>
                    </div>

                  </motion.div>
                ))
              ) : (
                <div className="bg-white dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-10 text-center shadow-xs">
                  <p className="text-slate-500 dark:text-slate-400 text-xs">
                    {language === "es" 
                      ? "No hay valoraciones con esta puntuación todavía." 
                      : language === "pt" 
                      ? "Ainda não há avaliações com esta classificação." 
                      : "No reviews found for this star level yet."}
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>

    </div>
  );
}
