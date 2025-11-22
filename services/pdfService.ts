import { Book } from '../types';

declare const jspdf: any;

const getPdfFontName = (fontFamily: string | undefined): string => {
    switch (fontFamily) {
        case 'Sans-Serif':
            return 'helvetica';
        case 'Monospace':
            return 'courier';
        case 'Serif':
        default:
            return 'times';
    }
};

export const generatePdf = async (book: Book): Promise<void> => {
  const { jsPDF } = jspdf;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  const maxLineWidth = pageWidth - margin * 2;

  // --- 1. Generate Cover Page ---
  if (book.coverImageUrl) {
    doc.addImage(book.coverImageUrl, 'PNG', 0, 0, pageWidth, pageHeight);
  }

  const isColoringBook = book.bookType === 'coloring';

  // --- 2. Generate Table of Contents (only for standard books) ---
  if (!isColoringBook) {
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('Sumário', pageWidth / 2, margin + 20, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    let tocY = margin + 80;
    book.chapters.forEach((chapter, index) => {
      if (tocY > pageHeight - margin) {
        doc.addPage();
        tocY = margin;
      }
      doc.text(`Capítulo ${index + 1}: ${chapter.title}`, margin, tocY);
      tocY += 20;
    });
  }

  // --- 3. Generate Chapter/Page Content ---
  for (const chapter of book.chapters) {
    if (isColoringBook) {
      // For coloring books, create a new page for EACH selected image.
      if (chapter.imageUrls && chapter.imageUrls.length > 0) {
        for (const imageUrl of chapter.imageUrls) {
            doc.addPage();
            let yPos = margin;

            // Page Title
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            const titleLines = doc.splitTextToSize(chapter.title, maxLineWidth);
            doc.text(titleLines, pageWidth / 2, yPos, { align: 'center' });
            yPos += (titleLines.length * 14 * 1.15) + 10;

            // Page Image
            try {
                const img = new Image();
                img.src = imageUrl;
                await new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
                
                const aspectRatio = img.width / img.height;
                let imgWidth = maxLineWidth;
                let imgHeight = imgWidth / aspectRatio;

                if (imgHeight > (pageHeight - margin * 2 - 20)) {
                  imgHeight = pageHeight - margin * 2 - 20;
                  imgWidth = imgHeight * aspectRatio;
                }
                
                const imgX = (pageWidth - imgWidth) / 2;

                if (yPos + imgHeight > pageHeight - margin) {
                    doc.addPage();
                    yPos = margin;
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(14);
                    const newTitleLines = doc.splitTextToSize(chapter.title, maxLineWidth);
                    doc.text(newTitleLines, pageWidth / 2, yPos, { align: 'center' });
                    yPos += (newTitleLines.length * 14 * 1.15) + 10;
                }

                doc.addImage(imageUrl, 'PNG', imgX, yPos, imgWidth, imgHeight);

            } catch (e) {
                console.error("Could not add image to PDF", e);
            }
        }
      }
    } else {
      // For standard books, create one page per chapter with content and ONE image.
      doc.addPage();
      let yPos = margin;

      // Chapter Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      const titleLines = doc.splitTextToSize(chapter.title, maxLineWidth);
      doc.text(titleLines, pageWidth / 2, yPos, { align: 'center' });
      yPos += (titleLines.length * 14 * 1.15) + 20; // Dynamic spacing

      // Chapter Image (use the first one if available)
      if (chapter.imageUrls && chapter.imageUrls.length > 0) {
          const imageUrl = chapter.imageUrls[0];
          try {
              const img = new Image();
              img.src = imageUrl;
              await new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
              
              const aspectRatio = img.width / img.height;
              const imgWidth = maxLineWidth * 0.6;
              const imgHeight = imgWidth / aspectRatio;
              
              const imgX = (pageWidth - imgWidth) / 2;

              if (yPos + imgHeight > pageHeight - margin) {
                  doc.addPage();
                  yPos = margin;
              }

              doc.addImage(imageUrl, 'PNG', imgX, yPos, imgWidth, imgHeight);
              yPos += imgHeight + 20;

          } catch (e) {
              console.error("Could not add image to PDF", e);
          }
      }

      // Chapter Content
      const fontName = getPdfFontName(book.fontFamily);
      const fontSize = book.fontSize || 11;
      const lineHeight = fontSize * 1.25;

      doc.setFont(fontName, 'normal');
      doc.setFontSize(fontSize);
      const textLines = doc.splitTextToSize(chapter.content, maxLineWidth);

      textLines.forEach((line: string) => {
        if (yPos > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
        }
        doc.text(line, margin, yPos);
        yPos += lineHeight; 
      });
    }
  }

  doc.save(`${book.title.replace(/\s/g, '_')}.pdf`);
};