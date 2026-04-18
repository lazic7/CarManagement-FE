import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { MileageRecordDto } from "../api/dto";

const CONTRACT_ADDRESS =
  import.meta.env.VITE_MILEAGE_CONTRACT_ADDRESS ?? "";
const EXPLORER_BASE = "https://volta-explorer.energyweb.org";

const BRAND_CYAN: [number, number, number] = [0, 212, 255];
const BRAND_PURPLE: [number, number, number] = [139, 92, 246];
const BRAND_BG_DARK: [number, number, number] = [10, 10, 15];
const BRAND_BG_DEEP: [number, number, number] = [20, 20, 35];
const BRAND_DARK: [number, number, number] = [17, 24, 39];
const BRAND_MUTED: [number, number, number] = [100, 116, 139];
const BRAND_SUCCESS: [number, number, number] = [16, 185, 129];
const SURFACE_SOFT: [number, number, number] = [240, 250, 253];
const SURFACE_ALT: [number, number, number] = [248, 250, 252];

const formatKm = (value: number) => `${value.toLocaleString("en-US")} km`;

const formatTimestamp = (timestamp: number) => {
  if (!timestamp) return "Unknown";
  return new Date(timestamp * 1000).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const shortenAddress = (address: string) =>
  address.length > 14
    ? `${address.slice(0, 8)}…${address.slice(-6)}`
    : address;

export const generateVehiclePassport = (
  vin: string,
  records: MileageRecordDto[],
): void => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;

  doc.setFillColor(...BRAND_BG_DARK);
  doc.rect(0, 0, pageWidth, 130, "F");

  doc.setFillColor(...BRAND_BG_DEEP);
  doc.rect(0, 100, pageWidth, 30, "F");

  doc.setFillColor(...BRAND_CYAN);
  doc.rect(0, 130, pageWidth, 2, "F");
  doc.setFillColor(...BRAND_PURPLE);
  doc.rect(pageWidth * 0.5, 130, pageWidth * 0.5, 2, "F");

  doc.setFillColor(...BRAND_CYAN);
  doc.roundedRect(margin, 30, 6, 42, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text("AutoLedger", margin + 18, 55);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND_CYAN);
  doc.text("VEHICLE PASSPORT", margin + 18, 72);

  doc.setFontSize(9);
  doc.setTextColor(200, 210, 230);
  doc.text(
    `Generated  ${new Date().toLocaleString("en-GB")}`,
    pageWidth - margin,
    55,
    { align: "right" },
  );
  doc.setTextColor(...BRAND_CYAN);
  doc.text(
    "Secured by Energy Web Volta Blockchain",
    pageWidth - margin,
    72,
    { align: "right" },
  );

  let cursorY = 170;

  doc.setFillColor(...SURFACE_SOFT);
  doc.roundedRect(margin, cursorY - 22, pageWidth - margin * 2, 64, 8, 8, "F");
  doc.setDrawColor(...BRAND_CYAN);
  doc.setLineWidth(0.6);
  doc.line(margin, cursorY - 22, margin, cursorY + 42);
  doc.setLineWidth(0.1);

  doc.setTextColor(...BRAND_MUTED);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("VEHICLE IDENTIFICATION NUMBER", margin + 16, cursorY - 4);

  doc.setTextColor(...BRAND_DARK);
  doc.setFont("courier", "bold");
  doc.setFontSize(22);
  doc.text(vin, margin + 16, cursorY + 24);
  cursorY += 68;

  const sorted = [...records].sort((a, b) => a.timestamp - b.timestamp);
  const latest = sorted[sorted.length - 1];
  const earliest = sorted[0];
  const currentKm = latest ? latest.mileage : 0;
  const firstDate = earliest ? formatTimestamp(earliest.timestamp) : "—";

  const statsStartY = cursorY;
  const statWidth = (pageWidth - margin * 2 - 20) / 3;

  const drawStat = (
    label: string,
    value: string,
    index: number,
    accent: [number, number, number],
  ) => {
    const x = margin + index * (statWidth + 10);
    doc.setFillColor(...SURFACE_ALT);
    doc.roundedRect(x, statsStartY, statWidth, 78, 8, 8, "F");

    doc.setFillColor(...accent);
    doc.roundedRect(x, statsStartY, 3, 78, 1.5, 1.5, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...BRAND_MUTED);
    doc.text(label.toUpperCase(), x + 14, statsStartY + 20);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(...accent);
    doc.text(value, x + 14, statsStartY + 48);
  };

  drawStat("Current mileage", formatKm(currentKm), 0, BRAND_CYAN);
  drawStat(
    "Verified records",
    String(sorted.length),
    1,
    BRAND_PURPLE,
  );
  drawStat("First record", firstDate, 2, BRAND_SUCCESS);

  cursorY = statsStartY + 108;

  doc.setFillColor(...BRAND_BG_DARK);
  doc.roundedRect(margin, cursorY, pageWidth - margin * 2, 42, 8, 8, "F");
  doc.setFillColor(...BRAND_CYAN);
  doc.roundedRect(margin, cursorY, 3, 42, 1.5, 1.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND_CYAN);
  doc.text("◆  VERIFIED ON ENERGY WEB VOLTA BLOCKCHAIN", margin + 16, cursorY + 18);
  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.setTextColor(200, 210, 230);
  doc.text(
    `Contract  ${CONTRACT_ADDRESS}`,
    margin + 16,
    cursorY + 32,
  );

  cursorY += 62;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND_DARK);
  doc.text("MILEAGE HISTORY", margin, cursorY);
  doc.setDrawColor(...BRAND_CYAN);
  doc.setLineWidth(1.5);
  doc.line(margin, cursorY + 4, margin + 80, cursorY + 4);
  doc.setLineWidth(0.1);
  cursorY += 14;

  const historyDesc = sorted.slice().reverse();

  autoTable(doc, {
    startY: cursorY,
    head: [["#", "Date & time", "Mileage", "Mechanic wallet"]],
    body: historyDesc.map((record, index) => [
      String(historyDesc.length - index),
      formatTimestamp(record.timestamp),
      formatKm(record.mileage),
      shortenAddress(record.mechanic),
    ]),
    theme: "plain",
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 8,
      textColor: BRAND_DARK,
    },
    headStyles: {
      fillColor: BRAND_BG_DARK,
      textColor: BRAND_CYAN,
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: 9,
    },
    bodyStyles: {
      fillColor: [255, 255, 255],
    },
    alternateRowStyles: { fillColor: SURFACE_ALT },
    columnStyles: {
      0: { fontStyle: "bold", textColor: BRAND_CYAN, cellWidth: 30 },
      2: { fontStyle: "bold" },
      3: { font: "courier", fontSize: 8, textColor: BRAND_MUTED },
    },
    margin: { left: margin, right: margin },
  });

  const finalY =
    (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
      ?.finalY ?? cursorY;

  doc.setFillColor(...BRAND_BG_DARK);
  doc.rect(0, pageHeight - 70, pageWidth, 70, "F");
  doc.setFillColor(...BRAND_CYAN);
  doc.rect(0, pageHeight - 70, pageWidth, 1.5, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(180, 195, 220);
  doc.text(
    "This record is immutable and cryptographically secured on the Energy Web Volta blockchain. Any attempt to alter historical entries is rejected by the smart contract.",
    margin,
    pageHeight - 48,
    { maxWidth: pageWidth - margin * 2 },
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...BRAND_CYAN);
  doc.text("VERIFY ONLINE", margin, pageHeight - 22);

  doc.setFont("courier", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(200, 210, 230);
  doc.text(
    `${EXPLORER_BASE}/address/${CONTRACT_ADDRESS}`,
    margin + 62,
    pageHeight - 22,
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...BRAND_CYAN);
  doc.text("AutoLedger", pageWidth - margin, pageHeight - 22, {
    align: "right",
  });

  if (finalY > pageHeight - 100) {
    // Table already paginated by autoTable; footer drawn on last page by jsPDF default position above.
  }

  const safeVin = vin.replace(/[^A-Z0-9]/gi, "_");
  doc.save(`AutoLedger_Passport_${safeVin}.pdf`);
};
