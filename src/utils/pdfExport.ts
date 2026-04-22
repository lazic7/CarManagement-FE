import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { MileageRecordDto } from "../api/dto";

const CONTRACT_ADDRESS =
  import.meta.env.VITE_MILEAGE_CONTRACT_ADDRESS ?? "";
import { EXPLORER_BASE } from "../config/chain";

type Rgb = [number, number, number];

const BRAND_CYAN: Rgb = [0, 212, 255];
const BRAND_PURPLE: Rgb = [139, 92, 246];
const BRAND_BG_DARK: Rgb = [10, 10, 15];
const BRAND_DARK: Rgb = [17, 24, 39];
const BRAND_SOFT_DARK: Rgb = [51, 65, 85];
const BRAND_MUTED: Rgb = [100, 116, 139];
const BRAND_SUCCESS: Rgb = [16, 185, 129];
const SURFACE_ALT: Rgb = [248, 250, 252];
const BORDER_LIGHT: Rgb = [226, 232, 240];

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
    ? `${address.slice(0, 8)}...${address.slice(-6)}`
    : address;

const drawCheckmark = (
  doc: jsPDF,
  centerX: number,
  centerY: number,
  size: number,
  color: Rgb,
) => {
  doc.setDrawColor(...color);
  doc.setLineWidth(size * 0.18);
  doc.setLineCap("round");
  doc.setLineJoin("round");
  const s = size / 2;
  doc.line(centerX - s * 0.9, centerY, centerX - s * 0.2, centerY + s * 0.7);
  doc.line(centerX - s * 0.2, centerY + s * 0.7, centerX + s, centerY - s * 0.6);
  doc.setLineWidth(0.1);
  doc.setLineCap("butt");
};

export const generateVehiclePassport = (
  vin: string,
  records: MileageRecordDto[],
): void => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 44;
  const contentWidth = pageWidth - margin * 2;

  // ───────────────────────── HEADER ─────────────────────────
  doc.setFillColor(...BRAND_BG_DARK);
  doc.rect(0, 0, pageWidth, 120, "F");

  // Subtle grid of radial accent dots in header
  doc.setFillColor(0, 212, 255);
  for (let i = 0; i < 40; i += 1) {
    const x = (pageWidth / 40) * i + 8;
    doc.setGState(doc.GState({ opacity: 0.06 + (i % 5) * 0.02 }));
    doc.circle(x, 28 + (i % 3) * 22, 1.1, "F");
  }
  doc.setGState(doc.GState({ opacity: 1 }));

  // Gradient bottom accent bar (simulated with two rects)
  doc.setFillColor(...BRAND_CYAN);
  doc.rect(0, 119, pageWidth * 0.55, 2, "F");
  doc.setFillColor(...BRAND_PURPLE);
  doc.rect(pageWidth * 0.55, 119, pageWidth * 0.45, 2, "F");

  // Logo text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("AutoLedger", margin, 58);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...BRAND_CYAN);
  doc.text("VEHICLE PASSPORT", margin, 72);

  // Right side header
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(150, 165, 190);
  doc.text("GENERATED", pageWidth - margin, 50, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(
    new Date().toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    pageWidth - margin,
    65,
    { align: "right" },
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...BRAND_CYAN);
  doc.text(
    "Ethereum Sepolia Blockchain",
    pageWidth - margin,
    77,
    { align: "right" },
  );

  // ──────────────────────── VIN CARD ────────────────────────
  let cursorY = 160;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...BORDER_LIGHT);
  doc.setLineWidth(0.8);
  doc.roundedRect(margin, cursorY - 26, contentWidth, 72, 10, 10, "FD");
  doc.setLineWidth(0.1);

  // Left accent bar
  doc.setFillColor(...BRAND_CYAN);
  doc.roundedRect(margin + 2, cursorY - 22, 4, 64, 2, 2, "F");

  doc.setTextColor(...BRAND_MUTED);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("VEHICLE IDENTIFICATION NUMBER", margin + 18, cursorY - 8);

  doc.setTextColor(...BRAND_DARK);
  doc.setFont("courier", "bold");
  doc.setFontSize(22);
  doc.text(vin, margin + 18, cursorY + 20);

  cursorY += 72;

  // ─────────────────────── STATS TILES ───────────────────────
  const sorted = [...records].sort((a, b) => a.timestamp - b.timestamp);
  const latest = sorted[sorted.length - 1];
  const earliest = sorted[0];
  const currentKm = latest ? latest.mileage : 0;
  const firstDate = earliest ? formatTimestamp(earliest.timestamp) : "—";

  const statsStartY = cursorY;
  const statGap = 12;
  const statWidth = (contentWidth - statGap * 2) / 3;

  const drawStat = (
    label: string,
    value: string,
    index: number,
    accent: Rgb,
  ) => {
    const x = margin + index * (statWidth + statGap);
    doc.setFillColor(...SURFACE_ALT);
    doc.setDrawColor(...BORDER_LIGHT);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, statsStartY, statWidth, 74, 10, 10, "FD");
    doc.setLineWidth(0.1);

    // Accent dot (top-left)
    doc.setFillColor(...accent);
    doc.circle(x + 16, statsStartY + 18, 3.5, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...BRAND_MUTED);
    doc.text(label.toUpperCase(), x + 26, statsStartY + 21);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...BRAND_DARK);
    doc.text(value, x + 16, statsStartY + 52);
  };

  drawStat("Current mileage", formatKm(currentKm), 0, BRAND_CYAN);
  drawStat("Verified records", String(sorted.length), 1, BRAND_PURPLE);
  drawStat("First record", firstDate, 2, BRAND_SUCCESS);

  cursorY = statsStartY + 96;

  // ───────────────────── VERIFIED BADGE ─────────────────────
  const badgeHeight = 54;
  doc.setFillColor(...BRAND_BG_DARK);
  doc.roundedRect(margin, cursorY, contentWidth, badgeHeight, 10, 10, "F");

  // Glow accent stripe on right edge (gradient simulation)
  doc.setFillColor(...BRAND_CYAN);
  doc.setGState(doc.GState({ opacity: 0.12 }));
  doc.roundedRect(margin + contentWidth - 90, cursorY, 90, badgeHeight, 10, 10, "F");
  doc.setGState(doc.GState({ opacity: 1 }));

  // Checkmark circle indicator
  doc.setFillColor(...BRAND_SUCCESS);
  doc.circle(margin + 24, cursorY + badgeHeight / 2, 10, "F");
  drawCheckmark(doc, margin + 24, cursorY + badgeHeight / 2, 10, [255, 255, 255]);

  // Glow ring (subtle)
  doc.setDrawColor(...BRAND_SUCCESS);
  doc.setGState(doc.GState({ opacity: 0.35 }));
  doc.setLineWidth(1.5);
  doc.circle(margin + 24, cursorY + badgeHeight / 2, 14, "S");
  doc.setGState(doc.GState({ opacity: 1 }));
  doc.setLineWidth(0.1);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("Verified on-chain", margin + 44, cursorY + 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(150, 165, 190);
  doc.text("Immutable record · Ethereum Sepolia Blockchain", margin + 44, cursorY + 36);

  // Contract address on the right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...BRAND_CYAN);
  doc.text("CONTRACT", pageWidth - margin - 8, cursorY + 20, { align: "right" });

  doc.setFont("courier", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(200, 210, 230);
  doc.text(
    shortenAddress(CONTRACT_ADDRESS),
    pageWidth - margin - 8,
    cursorY + 36,
    { align: "right" },
  );

  cursorY += badgeHeight + 24;

  // ───────────────────── HISTORY HEADING ─────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND_DARK);
  doc.text("MILEAGE HISTORY", margin, cursorY);

  // Cyan accent line under heading
  doc.setFillColor(...BRAND_CYAN);
  doc.rect(margin, cursorY + 4, 36, 2, "F");
  doc.setFillColor(...BRAND_PURPLE);
  doc.rect(margin + 36, cursorY + 4, 24, 2, "F");

  // Record count chip (right)
  const chipW = 90;
  const chipH = 16;
  const chipX = pageWidth - margin - chipW;
  const chipY = cursorY - 10;
  doc.setFillColor(...SURFACE_ALT);
  doc.setDrawColor(...BORDER_LIGHT);
  doc.setLineWidth(0.5);
  doc.roundedRect(chipX, chipY, chipW, chipH, 8, 8, "FD");
  doc.setLineWidth(0.1);

  doc.setFillColor(...BRAND_CYAN);
  doc.circle(chipX + 10, chipY + chipH / 2, 2.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...BRAND_SOFT_DARK);
  doc.text(`${sorted.length} RECORDS ON CHAIN`, chipX + 18, chipY + 11);

  cursorY += 16;

  // ───────────────────────── TABLE ─────────────────────────
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
      cellPadding: { top: 9, right: 10, bottom: 9, left: 10 },
      textColor: BRAND_DARK,
      lineColor: BORDER_LIGHT,
      lineWidth: { bottom: 0.4 },
    },
    headStyles: {
      fillColor: BRAND_BG_DARK,
      textColor: BRAND_CYAN,
      fontStyle: "bold",
      fontSize: 7.5,
      cellPadding: { top: 10, right: 10, bottom: 10, left: 10 },
      lineWidth: 0,
    },
    bodyStyles: {
      fillColor: [255, 255, 255],
    },
    alternateRowStyles: { fillColor: SURFACE_ALT },
    columnStyles: {
      0: {
        fontStyle: "bold",
        textColor: BRAND_CYAN,
        cellWidth: 32,
        halign: "center",
      },
      2: { fontStyle: "bold" },
      3: { font: "courier", fontSize: 8, textColor: BRAND_SOFT_DARK },
    },
    margin: { left: margin, right: margin },
  });

  // ───────────────────────── FOOTER ─────────────────────────
  const footerY = pageHeight - 66;
  doc.setFillColor(...BRAND_BG_DARK);
  doc.rect(0, footerY, pageWidth, 66, "F");

  // Top accent on footer
  doc.setFillColor(...BRAND_CYAN);
  doc.rect(0, footerY, pageWidth * 0.45, 1.5, "F");
  doc.setFillColor(...BRAND_PURPLE);
  doc.rect(pageWidth * 0.45, footerY, pageWidth * 0.55, 1.5, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(160, 175, 200);
  doc.text(
    "This record is cryptographically sealed on the Ethereum Sepolia blockchain. Any attempt to alter historical entries is rejected by the smart contract.",
    margin,
    footerY + 22,
    { maxWidth: contentWidth },
  );

  // Verify row
  doc.setFillColor(...BRAND_CYAN);
  doc.circle(margin + 4, footerY + 48, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...BRAND_CYAN);
  doc.text("VERIFY ONLINE", margin + 12, footerY + 50);

  doc.setFont("courier", "normal");
  doc.setFontSize(7);
  doc.setTextColor(200, 210, 230);
  doc.text(
    `${EXPLORER_BASE}/address/${CONTRACT_ADDRESS}`,
    margin + 74,
    footerY + 50,
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...BRAND_CYAN);
  doc.text("AutoLedger", pageWidth - margin, footerY + 50, {
    align: "right",
  });

  const safeVin = vin.replace(/[^A-Z0-9]/gi, "_");
  doc.save(`AutoLedger_Passport_${safeVin}.pdf`);
};
