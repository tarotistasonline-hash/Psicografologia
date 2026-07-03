import { jsPDF } from "jspdf";
import { AnalysisReportData } from "../types";

export function generatePDF(report: AnalysisReportData, language: "es" | "pt" | "en", presetLabel: string) {
  const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
  const pageHeight = 297;
  const marginBottom = 20;
  const leftMargin = 15;
  const rightMargin = 15;
  const contentWidth = 210 - leftMargin - rightMargin; // 180mm
  
  let y = 20;
  let pageCount = 0;

  // Header/Footer renderer for subsequent pages or overall pagination tracking
  function drawFooter() {
    pageCount++;
    
    // Draw footer line
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.2);
    doc.line(leftMargin, 280, 210 - rightMargin, 280);
    
    // Draw footer text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // slate-500
    
    const footerText = language === "es"
      ? "GraphoStudio — Informe Psicográfico Clínico Oficial • Generado con Gemini 3.5 AI"
      : language === "pt"
      ? "GraphoStudio — Relatório Psicografológico Clínico Oficial • Gerado com Gemini 3.5 AI"
      : "GraphoStudio — Official Clinical Psychographology Report • Generated with Gemini 3.5 AI";
      
    doc.text(footerText, leftMargin, 285);
    doc.text(`${pageCount}`, 210 - rightMargin, 285, { align: "right" });
  }

  function checkSpace(needed: number) {
    if (y + needed > pageHeight - marginBottom) {
      drawFooter();
      doc.addPage();
      y = 20;
    }
  }

  // Draw Page 1 header block
  // Elegant Rounded Accent Box for the logo
  doc.setFillColor(79, 70, 229); // indigo-600
  doc.roundedRect(leftMargin, y, 12, 12, 2.5, 2.5, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("G", leftMargin + 4.5, y + 8.5);

  // App Title & Brand
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("GraphoStudio", leftMargin + 16, y + 7);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // slate-500
  
  const subBrandText = language === "es"
    ? "Estudio Avanzado de Análisis Psicografológico y Grafotécnico"
    : language === "pt"
    ? "Estúdio Avançado de Análise Psicografológica e Grafotécnica"
    : "Advanced Psychographological & Graphotechnic Analysis Studio";
    
  doc.text(subBrandText, leftMargin + 16, y + 11);

  y += 18;

  // Main Document Header Banner
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(leftMargin, y, contentWidth, 22, "F");
  
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  
  const titleText = language === "es"
    ? "INFORME DE DIAGNÓSTICO PSICOGRAFOLÓGICO"
    : language === "pt"
    ? "LAUDO DE DIAGNÓSTICO PSICOGRAFOLÓGICO"
    : "PSYCHOGRAPHOLOGICAL DIAGNOSTIC REPORT";
  doc.text(titleText, leftMargin + 6, y + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105); // slate-600
  
  const subTitleText = language === "es"
    ? "Mapeo detallado de rasgos cognitivos, temperamentos, fortalezas y dinámica emocional"
    : language === "pt"
    ? "Mapeamento de traços cognitivos, temperamentos, forças e dinâmica emocional"
    : "Detailed mapping of cognitive traits, temperaments, strengths, and emotional dynamics";
  doc.text(subTitleText, leftMargin + 6, y + 13);
  
  // Badge on the right side of the banner
  doc.setFillColor(79, 70, 229); // indigo-600
  doc.roundedRect(210 - rightMargin - 40, y + 5, 34, 5, 1, 1, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text(`ID: GEMINI-3.5-PRO`, 210 - rightMargin - 23, y + 8.5, { align: "center" });

  y += 28;

  // Metadata block (Date, Profile, Metodologia)
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.2);
  doc.roundedRect(leftMargin, y, contentWidth, 18, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // slate-500
  
  doc.text(language === "es" ? "FECHA DE EMISIÓN" : language === "pt" ? "DATA DE EMISSÃO" : "DATE ISSUED", leftMargin + 6, y + 6);
  doc.text(language === "es" ? "MUESTRA ANALIZADA" : language === "pt" ? "AMOSTRA ANALISADA" : "ANALYSED SAMPLE", leftMargin + 60, y + 6);
  doc.text(language === "es" ? "METODOLOGÍA" : language === "pt" ? "METODOLOGIA" : "METHODOLOGY", leftMargin + 120, y + 6);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(new Date().toLocaleDateString(), leftMargin + 6, y + 12);
  
  const customSampleText = language === "es"
    ? "Personalizada (Escritura Digital/Foto)"
    : language === "pt"
    ? "Personalizado (Escrita Digital/Foto)"
    : "Custom (Digital Ink/Image)";
  doc.text(presetLabel || customSampleText, leftMargin + 60, y + 12);
  
  const methodText = language === "es"
    ? "Mapeo Psicofisiológico IA"
    : language === "pt"
    ? "Mapeamento Psicofisiológico IA"
    : "AI Psychophysiological Mapping";
  doc.text(methodText, leftMargin + 120, y + 12);

  y += 26;

  // Section 1: Síntese de Perfil Psicológico
  checkSpace(40);
  doc.setTextColor(79, 70, 229); // indigo
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  
  const s1Title = language === "es"
    ? "1. Síntesis del Perfil Psicológico"
    : language === "pt"
    ? "1. Síntese do Perfil Psicológico"
    : "1. Psychological Profile Synthesis";
  doc.text(s1Title, leftMargin, y);
  
  y += 2.5;
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(0.4);
  doc.line(leftMargin, y, leftMargin + 15, y); // thick under-line
  
  y += 5.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85); // slate-700
  
  // Wrap and print psychological profile paragraphs
  const wrappedProfile = doc.splitTextToSize(report.psychologicalProfile, contentWidth - 4);
  for (let i = 0; i < wrappedProfile.length; i++) {
    checkSpace(5);
    doc.text(wrappedProfile[i], leftMargin, y);
    y += 4.5;
  }

  y += 6;

  // Section 2: Temperamento Hipocrático (Numerical and visual bar)
  checkSpace(50);
  doc.setTextColor(79, 70, 229);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  
  const s2Title = language === "es"
    ? "2. Distribución de Temperamentos Hipocráticos"
    : language === "pt"
    ? "2. Distribuição dos Temperamentos Hipocráticos"
    : "2. Hippocratic Temperament Distribution";
  doc.text(s2Title, leftMargin, y);
  
  y += 2.5;
  doc.line(leftMargin, y, leftMargin + 15, y);
  
  y += 6;

  const tempKeys = ["sanguine", "choleric", "melancholic", "phlegmatic"];
  const tempLabelsEs: Record<string, string> = { sanguine: "Sanguíneo", choleric: "Colérico", melancholic: "Melancólico", phlegmatic: "Flemático" };
  const tempLabelsPt: Record<string, string> = { sanguine: "Sanguíneo", choleric: "Colérico", melancholic: "Melancólico", phlegmatic: "Fleumático" };
  const tempLabelsEn: Record<string, string> = { sanguine: "Sanguine", choleric: "Choleric", melancholic: "Melancholic", phlegmatic: "Phlegmatic" };
  const tempColors: Record<string, [number, number, number]> = {
    sanguine: [225, 29, 72],    // rose
    choleric: [245, 158, 11],   // amber
    melancholic: [79, 70, 229], // indigo
    phlegmatic: [13, 148, 136]  // teal
  };

  const currentLabels = language === "es" ? tempLabelsEs : language === "pt" ? tempLabelsPt : tempLabelsEn;

  // Draw 4 temperament bars in a clean, professional grid-like layout
  tempKeys.forEach((key) => {
    checkSpace(12);
    const score = report.temperament[key as keyof typeof report.temperament] || 0;
    const label = currentLabels[key];
    const rgb = tempColors[key];

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(label, leftMargin, y + 4.5);
    doc.text(`${score}%`, leftMargin + 40, y + 4.5, { align: "right" });

    // Draw bar background
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(leftMargin + 45, y + 1.5, 120, 3.5, 1, 1, "F");

    // Draw active bar fill
    if (score > 0) {
      doc.setFillColor(rgb[0], rgb[1], rgb[2]);
      const fillWidth = (score / 100) * 120;
      doc.roundedRect(leftMargin + 45, y + 1.5, fillWidth, 3.5, 1, 1, "F");
    }

    y += 8;
  });

  y += 6;

  // Section 3: Traços Principais de Personalidade
  checkSpace(55);
  doc.setTextColor(79, 70, 229);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  
  const s3Title = language === "es"
    ? "3. Intensidad de los Rasgos de Personalidad"
    : language === "pt"
    ? "3. Intensidade dos Traços de Personalidade"
    : "3. Key Personality Traits Intensity";
  doc.text(s3Title, leftMargin, y);
  
  y += 2.5;
  doc.line(leftMargin, y, leftMargin + 15, y);
  
  y += 6;

  report.coreTraits.forEach((trait) => {
    checkSpace(18);
    
    // Trait Name & Score
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(trait.trait, leftMargin, y);
    doc.text(`${trait.level}%`, 210 - rightMargin, y, { align: "right" });

    y += 1.5;
    // Draw bar background & progress fill
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(leftMargin, y, contentWidth, 2, 0.5, 0.5, "F");
    doc.setFillColor(79, 70, 229);
    doc.roundedRect(leftMargin, y, (trait.level / 100) * contentWidth, 2, 0.5, 0.5, "F");

    y += 4;
    // Explanations
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    
    const indicatorText = language === "es"
      ? "Indicador Físico"
      : language === "pt"
      ? "Indicador Físico"
      : "Physical Indicator";
    doc.text(`${indicatorText}: ${trait.indicator}`, leftMargin, y);
    
    y += 3.5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    const wrappedDesc = doc.splitTextToSize(trait.description, contentWidth);
    wrappedDesc.forEach((line: string) => {
      doc.text(line, leftMargin, y);
      y += 3.2;
    });

    y += 2;
  });

  y += 6;

  // Section 4: Análise Micro-Grafológica (Tabela de observações)
  checkSpace(40);
  doc.setTextColor(79, 70, 229);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  
  const s4Title = language === "es"
    ? "4. Análisis Micro-Grafológico"
    : language === "pt"
    ? "4. Análise Micro-Grafológica"
    : "4. Micro-Graphological Analysis Table";
  doc.text(s4Title, leftMargin, y);
  
  y += 2.5;
  doc.line(leftMargin, y, leftMargin + 15, y);
  
  y += 6;

  // Draw clean table headers
  doc.setFillColor(15, 23, 42); // deep slate header
  doc.rect(leftMargin, y, contentWidth, 6.5, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  
  const h1 = language === "es" ? "EJE ANALIZADO" : language === "pt" ? "EIXO ANALISADO" : "ANALYZED FEATURE";
  const h2 = language === "es" ? "RASGO OBSERVADO" : language === "pt" ? "TRAÇO OBSERVADO" : "OBSERVED DETAIL";
  const h3 = language === "es" ? "SIGNIFICADO PSICOLÓGICO" : language === "pt" ? "SIGNIFICADO PSICOLÓGICO" : "PSYCHOLOGICAL MEANING";
  
  doc.text(h1, leftMargin + 3, y + 4.5);
  doc.text(h2, leftMargin + 40, y + 4.5);
  doc.text(h3, leftMargin + 85, y + 4.5);

  y += 6.5;

  report.graphologicalObservations.forEach((obs) => {
    // We measure maximum heights of wrapped strings to dynamically size the row height
    const featureWrapped = doc.splitTextToSize(obs.feature, 34);
    const observedWrapped = doc.splitTextToSize(obs.observed, 42);
    const meaningWrapped = doc.splitTextToSize(obs.psychologicalMeaning, 90);

    const rowLines = Math.max(featureWrapped.length, observedWrapped.length, meaningWrapped.length);
    const rowHeight = rowLines * 4 + 4;

    checkSpace(rowHeight + 4);

    // Draw zebra alternating rows
    doc.setFillColor(248, 250, 252);
    doc.rect(leftMargin, y, contentWidth, rowHeight, "F");
    
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.15);
    doc.line(leftMargin, y + rowHeight, leftMargin + contentWidth, y + rowHeight);

    // Print cell contents
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(79, 70, 229);
    for (let i = 0; i < featureWrapped.length; i++) {
      doc.text(featureWrapped[i], leftMargin + 3, y + 4 + i * 3.5);
    }

    doc.setFont("helvetica", "semibold");
    doc.setTextColor(15, 23, 42);
    for (let i = 0; i < observedWrapped.length; i++) {
      doc.text(observedWrapped[i], leftMargin + 40, y + 4 + i * 3.5);
    }

    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    for (let i = 0; i < meaningWrapped.length; i++) {
      doc.text(meaningWrapped[i], leftMargin + 85, y + 4 + i * 3.5);
    }

    y += rowHeight;
  });

  y += 10;

  // Section 5: Indicadores de Estado Emocional Atual
  checkSpace(40);
  doc.setTextColor(79, 70, 229);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  
  const s5Title = language === "es"
    ? "5. Indicadores del Estado Emocional Actual"
    : language === "pt"
    ? "5. Indicadores de Estado Emocional Atual"
    : "5. Current Emotional State Indicators";
  doc.text(s5Title, leftMargin, y);
  
  y += 2.5;
  doc.line(leftMargin, y, leftMargin + 15, y);
  
  y += 6;

  const emotionalKeys = ["anxiety", "stress", "fatigue", "confidence"];
  const emoLabelsEs: Record<string, string> = { anxiety: "Ansiedad/Tensión", stress: "Estrés General", fatigue: "Fatiga Física", confidence: "Autoconfianza" };
  const emoLabelsPt: Record<string, string> = { anxiety: "Ansiedade/Tensão", stress: "Estresse Geral", fatigue: "Fadiga Física", confidence: "Autoconfiança" };
  const emoLabelsEn: Record<string, string> = { anxiety: "Anxiety/Tension", stress: "General Stress", fatigue: "Physical Fatigue", confidence: "Self-Confidence" };
  
  const currentEmoLabels = language === "es" ? emoLabelsEs : language === "pt" ? emoLabelsPt : emoLabelsEn;

  // Draw 4 emotional indicators
  emotionalKeys.forEach((key) => {
    checkSpace(12);
    const score = report.emotionalState[key as keyof typeof report.emotionalState] || 0;
    const label = currentEmoLabels[key];
    
    let color: [number, number, number] = [16, 185, 129]; // green
    if (key === "confidence") {
      if (score < 50) color = [244, 63, 94]; // red
      else if (score < 80) color = [245, 158, 11]; // amber
    } else {
      if (score > 70) color = [244, 63, 94]; // red
      else if (score > 40) color = [245, 158, 11]; // amber
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(label, leftMargin, y + 4);
    doc.text(`${score}%`, leftMargin + 40, y + 4, { align: "right" });

    // Bar bg
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(leftMargin + 45, y + 1, 120, 3, 1, 1, "F");

    // Bar fill
    if (score > 0) {
      doc.setFillColor(color[0], color[1], color[2]);
      doc.roundedRect(leftMargin + 45, y + 1, (score / 100) * 120, 3, 1, 1, "F");
    }

    y += 7.5;
  });

  y += 8;

  // Section 6: Pontos Fortes com Insight Detalhado
  checkSpace(40);
  doc.setTextColor(79, 70, 229);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  
  const s6Title = language === "es"
    ? "6. Fortalezas e Insights Clínicos"
    : language === "pt"
    ? "6. Pontos Fortes e Insights Clínicos"
    : "6. Strengths & Clinical Insights";
  doc.text(s6Title, leftMargin, y);
  
  y += 2.5;
  doc.line(leftMargin, y, leftMargin + 15, y);
  
  y += 6;

  report.strengths.forEach((str) => {
    // Title of strength
    checkSpace(20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(16, 185, 129); // emerald-500
    doc.text(`[+] ${str.title}`, leftMargin, y);
    
    y += 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    
    const wrappedInsight = doc.splitTextToSize(str.insight, contentWidth - 4);
    wrappedInsight.forEach((line: string) => {
      checkSpace(4);
      doc.text(line, leftMargin + 4, y);
      y += 3.5;
    });

    y += 2;
  });

  y += 6;

  // Section 7: Desafios com Insight Detalhado
  checkSpace(40);
  doc.setTextColor(79, 70, 229);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  
  const s7Title = language === "es"
    ? "7. Desafíos y Zonas de Crecimiento"
    : language === "pt"
    ? "7. Desafios & Zonas de Crescimento"
    : "7. Challenges & Growth Zones";
  doc.text(s7Title, leftMargin, y);
  
  y += 2.5;
  doc.line(leftMargin, y, leftMargin + 15, y);
  
  y += 6;

  report.challenges.forEach((cha) => {
    checkSpace(20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(244, 63, 94); // rose-500
    doc.text(`[-] ${cha.title}`, leftMargin, y);
    
    y += 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    
    const wrappedInsight = doc.splitTextToSize(cha.insight, contentWidth - 4);
    wrappedInsight.forEach((line: string) => {
      checkSpace(4);
      doc.text(line, leftMargin + 4, y);
      y += 3.5;
    });

    y += 2;
  });

  y += 8;

  // Section 8: Direções de Carreira Recomendadas
  checkSpace(40);
  doc.setTextColor(79, 70, 229);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  
  const s8Title = language === "es"
    ? "8. Recomendaciones de Orientación Profesional"
    : language === "pt"
    ? "8. Recomendações de Direção de Carreira"
    : "8. Recommended Career Directions";
  doc.text(s8Title, leftMargin, y);
  
  y += 2.5;
  doc.line(leftMargin, y, leftMargin + 15, y);
  
  y += 6;

  report.careerRecommendations.forEach((career, idx) => {
    checkSpace(8);
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(leftMargin, y, contentWidth, 6, 1, 1, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(79, 70, 229);
    doc.text(`${idx + 1}.`, leftMargin + 3, y + 4.2);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(career, leftMargin + 10, y + 4.2);

    y += 8;
  });

  // Render the final footer for the last page
  drawFooter();

  // Save the PDF
  const filename = language === "es"
    ? "informe-psicografologico.pdf"
    : language === "pt"
    ? "laudo-psicografologico.pdf"
    : "psychographology-report.pdf";
  doc.save(filename);
}
