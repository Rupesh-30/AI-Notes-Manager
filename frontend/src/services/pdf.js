import { jsPDF } from "jspdf";

export function exportPDF(note) {
  if (!note) return;

  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.text(note.title || "Untitled Note", 15, 20);

  // Date
  doc.setFontSize(10);
  doc.text(
    `Last Updated: ${note.updatedAt || "N/A"}`,
    15,
    30
  );

  // Content
  doc.setFontSize(12);

  const lines = doc.splitTextToSize(
    note.content || "",
    180
  );

  doc.text(lines, 15, 45);

  doc.save(`${note.title || "note"}.pdf`);
}