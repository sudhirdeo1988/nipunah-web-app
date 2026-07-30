/**
 * Mock CV download — generates a simple downloadable text resume
 * until real resume files are served from storage.
 */
export const downloadCandidateResume = (candidate) => {
  if (typeof window === "undefined" || !candidate) return;

  const fileName = candidate.resumeName || "Resume.pdf";
  const lines = [
    "CURRICULUM VITAE",
    "================",
    "",
    `Name: ${candidate.name || "N/A"}`,
    `Email: ${candidate.email || "N/A"}`,
    `Phone: ${candidate.phone || "N/A"}`,
    `Experience: ${candidate.experience || "N/A"}`,
    `Skills: ${(candidate.skills || []).join(", ") || "N/A"}`,
    `Applied on: ${candidate.appliedDate || "N/A"}`,
    "",
    "Cover letter",
    "------------",
    String(candidate.coverLetter || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/\s+/g, " ")
      .trim() || "No cover letter provided.",
    "",
    "(Mock resume file for demo — replace with real PDF from storage.)",
  ];

  const blob = new Blob([lines.join("\n")], {
    type: "application/pdf",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
