import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PerfilInfantil } from './perfil';
import { ProgresoPerfil, ReporteProgreso, ResultadoDetalle, formatearTiempo } from './seguimiento';

@Injectable({
  providedIn: 'root',
})
export class PdfExportService {
  /**
   * Genera y descarga un informe institucional en PDF de alta fidelidad estética
   * con las métricas, progreso y resultados de un perfil infantil en PlayMotricity.
   */
  exportarProgresoPDF(
    perfil: PerfilInfantil,
    progreso: ProgresoPerfil,
    resultados: ResultadoDetalle[],
    reportes: ReporteProgreso[],
    generadoPor: string,
    rolUsuario: string
  ): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;

    // ════════════════ 1. BARRA SUPERIOR DE COLOR INSTITUCIONAL ════════════════
    doc.setFillColor(255, 122, 69); // Orange
    doc.rect(0, 0, pageWidth * 0.35, 4, 'F');
    doc.setFillColor(16, 185, 129); // Green
    doc.rect(pageWidth * 0.35, 0, pageWidth * 0.25, 4, 'F');
    doc.setFillColor(37, 99, 235); // Blue
    doc.rect(pageWidth * 0.6, 0, pageWidth * 0.2, 4, 'F');
    doc.setFillColor(139, 92, 246); // Purple
    doc.rect(pageWidth * 0.8, 0, pageWidth * 0.2, 4, 'F');

    let y = 14;

    // ════════════════ 2. ENCABEZADO INSTITUCIONAL ════════════════
    // Logo / Nombre
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59); // Slate 800
    doc.text('PLAYMOTRICITY', margin, y);

    // Badge institucional
    doc.setFontSize(8);
    doc.setTextColor(255, 122, 69);
    doc.text('SISTEMA INTEGRAL DE PSICOMOTRICIDAD INFANTIL', margin, y + 4.5);

    // Metadatos a la derecha
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    const fechaEmision = new Date().toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    doc.text(`Fecha de emisión: ${fechaEmision}`, pageWidth - margin, y, { align: 'right' });
    doc.text(`Generado por: ${generadoPor} (${rolUsuario})`, pageWidth - margin, y + 4.5, { align: 'right' });

    y += 11;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    // Título del informe
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 12, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text('INFORME OFICIAL DE DESARROLLO Y PROGRESO PSICOMOTRIZ', margin + 6, y + 8);
    y += 17;

    // ════════════════ 3. DATOS DEL PERFIL INFANTIL ════════════════
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(234, 88, 12);
    doc.text('1. INFORMACIÓN DEL ESTUDIANTE / HIJO', margin, y);
    y += 4;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 22, 2.5, 2.5, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);

    const col1 = margin + 5;
    const col2 = margin + 65;
    const col3 = margin + 125;

    // Fila 1
    doc.text('Nombre completo:', col1, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.text(perfil.nombre || '—', col1 + 32, y + 7);

    doc.setFont('helvetica', 'bold');
    doc.text('Edad:', col2, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.text(`${perfil.edad} años cumplidos`, col2 + 12, y + 7);

    doc.setFont('helvetica', 'bold');
    doc.text('Grupo / Grado:', col3, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.text(perfil.grupoGrado || 'No asignado', col3 + 25, y + 7);

    // Fila 2
    doc.setFont('helvetica', 'bold');
    doc.text('Fecha nacimiento:', col1, y + 15);
    doc.setFont('helvetica', 'normal');
    doc.text(perfil.fechaNacimiento || '—', col1 + 32, y + 15);

    doc.setFont('helvetica', 'bold');
    doc.text('Etapa motriz:', col2, y + 15);
    doc.setFont('helvetica', 'normal');
    const etapa =
      perfil.edad <= 3
        ? 'Exploración y Control Inicial'
        : perfil.edad <= 5
        ? 'Coordinación y Destreza'
        : 'Transición Escolar Avanzada';
    doc.text(etapa, col2 + 22, y + 15);

    doc.setFont('helvetica', 'bold');
    doc.text('Rango etario:', col3, y + 15);
    doc.setFont('helvetica', 'normal');
    doc.text('2 a 6 años (Válido)', col3 + 25, y + 15);

    y += 27;

    // ════════════════ 4. MÉTRICAS CLAVE (KPI CARDS) ════════════════
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(37, 99, 235);
    doc.text('2. RESUMEN EJECUTIVO Y MÉTRICAS DE RENDIMIENTO', margin, y);
    y += 4;

    const cardW = (pageWidth - margin * 2 - 9) / 4;
    const cardH = 20;

    // Tarjeta 1: Completadas
    this.dibujarTarjetaKpi(
      doc,
      margin,
      y,
      cardW,
      cardH,
      'Actividades',
      `${progreso.completadas} / ${progreso.totalAsignadas}`,
      `${Math.round(progreso.porcentajeAvance)}% del total`,
      [255, 247, 237],
      [234, 88, 12]
    );

    // Tarjeta 2: Puntaje Promedio
    this.dibujarTarjetaKpi(
      doc,
      margin + cardW + 3,
      y,
      cardW,
      cardH,
      'Promedio Puntaje',
      progreso.promedioPuntaje !== null ? `${Math.round(progreso.promedioPuntaje)} pts` : '—',
      'Escala 0 a 100',
      [240, 253, 244],
      [22, 163, 74]
    );

    // Tarjeta 3: Precisión
    this.dibujarTarjetaKpi(
      doc,
      margin + (cardW + 3) * 2,
      y,
      cardW,
      cardH,
      'Precisión Promedio',
      progreso.promedioPrecision !== null ? `${Math.round(progreso.promedioPrecision)}%` : '—',
      'Exactitud motriz',
      [239, 246, 255],
      [37, 99, 235]
    );

    // Tarjeta 4: Nivel
    this.dibujarTarjetaKpi(
      doc,
      margin + (cardW + 3) * 3,
      y,
      cardW,
      cardH,
      'Nivel de Dominio',
      progreso.nivel.replace('_', ' '),
      formatearTiempo(progreso.tiempoPromedioEjecucionSeg),
      [250, 245, 255],
      [147, 51, 234]
    );

    y += cardH + 7;

    // ════════════════ 5. DESGLOSE POR TIPO DE MOTRICIDAD ════════════════
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(16, 185, 129);
    doc.text('3. DESGLOSE POR ÁREA PSICOMOTRIZ', margin, y);
    y += 4;

    const filaTipoData = (progreso.progresoPorTipo || []).map((t) => {
      const resTipo = (resultados || []).filter((r) => r.tipoActividad === t.tipoActividad && r.completada);
      const precProm = resTipo.length > 0
        ? (resTipo.reduce((acc, curr) => acc + (curr.precision || 0), 0) / resTipo.length).toFixed(1) + '%'
        : 'Sin datos';

      return [
        t.tipoActividad === 'MOTRICIDAD_FINA'
          ? 'Motricidad Fina'
          : t.tipoActividad === 'MOTRICIDAD_GRUESA'
          ? 'Motricidad Gruesa'
          : 'Mixta / Coordinación',
        `${t.completadas} completadas`,
        t.promedioPuntaje !== null ? `${t.promedioPuntaje.toFixed(1)} pts` : 'Sin puntaje',
        precProm,
      ];
    });

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Área Motriz', 'Completadas', 'Puntaje Promedio', 'Precisión Promedio']],
      body: filaTipoData.length > 0 ? filaTipoData : [['Sin registros', '0', '—', '—']],
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: [51, 65, 85],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 7;

    // ════════════════ 6. DETALLE DE RESULTADOS INDIVIDUALES ════════════════
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(30, 41, 59);
    doc.text('4. HISTORIAL DE ACTIVIDADES REALIZADAS', margin, y);
    y += 4;

    const tablaResultados = (resultados || []).slice(0, 15).map((r) => [
      r.actividadNombre || 'Actividad',
      r.tipoActividad === 'MOTRICIDAD_FINA'
        ? 'Fina'
        : r.tipoActividad === 'MOTRICIDAD_GRUESA'
        ? 'Gruesa'
        : 'Mixta',
      r.estadoAsignacion === 'COMPLETADA' ? 'Completada' : 'En progreso',
      r.puntaje !== null ? `${r.puntaje.toFixed(0)} pts` : '—',
      r.precision !== null ? `${r.precision.toFixed(0)}%` : '—',
      formatearTiempo(r.tiempoEjecucionSeg),
      r.fechaRealizacion ? new Date(r.fechaRealizacion).toLocaleDateString('es-CO') : '—',
    ]);

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Actividad', 'Tipo', 'Estado', 'Puntaje', 'Precisión', 'Tiempo', 'Fecha']],
      body:
        tablaResultados.length > 0
          ? tablaResultados
          : [['Aún no se han completado actividades evaluadas', '—', '—', '—', '—', '—', '—']],
      theme: 'striped',
      headStyles: {
        fillColor: [255, 122, 69],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [30, 41, 59],
      },
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

    // Si hay espacio suficiente, agregar recomendación pedagógica
    if (y < pageHeight - 35) {
      doc.setFillColor(254, 243, 199); // Amber light
      doc.setDrawColor(245, 158, 11);
      doc.roundedRect(margin, y, pageWidth - margin * 2, 18, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(146, 64, 14);
      doc.text('💡 RECOMENDACIÓN PEDAGÓGICA Y PSICOMOTRIZ:', margin + 4, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(120, 53, 15);
      const recomendacion =
        progreso.porcentajeAvance >= 75
          ? 'Excelente nivel de coordinación y destreza motriz. Se aconseja continuar con desafíos avanzados como Secuencia Deportiva y Panel de Reacción para afianzar tiempos de reacción y planificación motora.'
          : progreso.porcentajeAvance >= 40
          ? 'Buen progreso en el desarrollo motor. Se sugiere mantener constancia semanal en actividades de motricidad fina y retos asistidos de equilibrio para fortalecer el tono muscular.'
          : 'Etapa inicial de estimulación psicomotriz. Se recomienda realizar sesiones lúdicas diarias guiadas de 10 a 15 minutos con actividades de arrastre y seguimiento guiado.';
      const textoSplit = doc.splitTextToSize(recomendacion, pageWidth - margin * 2 - 8);
      doc.text(textoSplit, margin + 4, y + 11);
    }

    // ════════════════ PIE DE PÁGINA INSTITUCIONAL ════════════════
    const totalPaginas = doc.getNumberOfPages();
    for (let p = 1; p <= totalPaginas; p++) {
      doc.setPage(p);
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        'PlayMotricity © 2026 · Plataforma Pedagógica de Estimulación Psicomotriz Infantil · Informe generado con seguridad JWT',
        margin,
        pageHeight - 7
      );
      doc.text(`Página ${p} de ${totalPaginas}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
    }

    // Nombre de archivo amigable
    const nombreLimpio = (perfil.nombre || 'Perfil')
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_]/g, '');
    const timestamp = new Date().toISOString().split('T')[0];
    doc.save(`Reporte_Progreso_PlayMotricity_${nombreLimpio}_${timestamp}.pdf`);
  }

  private dibujarTarjetaKpi(
    doc: jsPDF,
    x: number,
    y: number,
    w: number,
    h: number,
    titulo: string,
    valor: string,
    sub: string,
    fondoRgb: [number, number, number],
    textoRgb: [number, number, number]
  ): void {
    doc.setFillColor(fondoRgb[0], fondoRgb[1], fondoRgb[2]);
    doc.setDrawColor(textoRgb[0], textoRgb[1], textoRgb[2]);
    doc.roundedRect(x, y, w, h, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(titulo.toUpperCase(), x + 3, y + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(textoRgb[0], textoRgb[1], textoRgb[2]);
    doc.text(valor, x + 3, y + 11.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(sub, x + 3, y + 16.5);
  }
}
