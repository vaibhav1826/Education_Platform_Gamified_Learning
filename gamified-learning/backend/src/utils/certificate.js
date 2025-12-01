import PDFDocument from 'pdfkit';

export const generateCertificate = (user, course, score) =>
  new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    doc.fontSize(26).text('Certificate of Completion', { align: 'center' });
    doc.moveDown();
    doc.fontSize(18).text(`Awarded to ${user.name}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`For successfully completing ${course.title}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Final Score: ${score}`, { align: 'center' });
    doc.moveDown(2);
    doc.text('Keep up the great learning!', { align: 'center' });

    doc.end();
  });