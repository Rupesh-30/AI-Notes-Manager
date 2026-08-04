
import { jsPDF } from "jspdf";

function cleanHTML(html) {
  if (!html) return "";

  const temp = document.createElement("div");
  temp.innerHTML = html;

  return temp.innerText
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function formatDate(timestamp) {
  if (!timestamp) return "N/A";

  try {
    if (timestamp?.toDate) {
      return timestamp.toDate().toLocaleString();
    }

    if (timestamp instanceof Date) {
      return timestamp.toLocaleString();
    }

    return new Date(timestamp).toLocaleString();
  } catch {
    return "N/A";
  }
}

export function exportPDF(note) {
  if (!note) return;

  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  const title = note.title || "Untitled Note";
  const content = cleanHTML(note.content);
  const updatedAt = formatDate(note.updatedAt);

  // =========================
  // Header
  // =========================

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(title, margin, 22, {
    maxWidth: contentWidth,
  });

  // Date
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Last Updated: ${updatedAt}`, margin, 32);

  // Divider
  doc.setLineWidth(0.3);
  doc.line(margin, 37, pageWidth - margin, 37);

  // =========================
  // Content
  // =========================

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const lines = doc.splitTextToSize(
    content || "No content available.",
    contentWidth
  );

  let y = 48;
  const lineHeight = 6;

  lines.forEach((line) => {
    // Automatic page break
    if (y > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }

    doc.text(line, margin, y);
    y += lineHeight;
  });

  // =========================
  // Footer / Page Numbers
  // =========================

  const totalPages = doc.internal.getNumberOfPages();

  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    doc.text(
      `AI Notes Manager • Page ${page} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      {
        align: "center",
      }
    );
  }

  // =========================
  // Safe File Name
  // =========================

  const safeFileName = title
    .replace(/[<>:"/\\|?*]+/g, "")
    .trim()
    .slice(0, 80);

  doc.save(`${safeFileName || "note"}.pdf`);
}

