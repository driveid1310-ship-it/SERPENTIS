import type { Report } from '../types/report';

/**
 * Generates a clean, standardized complaint text dossier
 * that citizens can copy and paste directly into official
 * government grievance portals (such as FSSAI FoSCoS or NCH).
 */
export function generateComplaintDossier(report: Report): string {
  const lines: string[] = [];

  lines.push('========================================');
  lines.push('FOOD SAFETY INCIDENT COMPLAINT DOSSIER');
  lines.push('Generated via SERPENTIS Community Platform');
  lines.push('========================================\n');

  lines.push(`1. INCIDENT / COMPLAINT TITLE:`);
  lines.push(`${report.title}\n`);

  if (report.foodSafetyDetails?.establishmentName) {
    lines.push(`2. FOOD ESTABLISHMENT / VENDOR NAME:`);
    lines.push(`${report.foodSafetyDetails.establishmentName}\n`);
  }

  if (report.foodSafetyDetails?.foodItem) {
    lines.push(`3. FOOD ITEM / PRODUCT AFFECTED:`);
    lines.push(`${report.foodSafetyDetails.foodItem}\n`);
  }

  if (report.foodSafetyDetails?.concernType) {
    lines.push(`4. CONCERN CLASSIFICATION:`);
    lines.push(`${report.foodSafetyDetails.concernType.toUpperCase()}\n`);
  }

  if (report.foodSafetyDetails?.incidentDate) {
    lines.push(`5. DATE & TIME OF OCCURRENCE:`);
    lines.push(`${new Date(report.foodSafetyDetails.incidentDate).toLocaleString()}\n`);
  }

  lines.push(`6. INCIDENT LOCATION (COORDINATES):`);
  lines.push(
    `Latitude: ${report.location.coordinates[1]}, Longitude: ${report.location.coordinates[0]}\n`,
  );

  lines.push(`7. DETAILED STATEMENT OF FACTS:`);
  lines.push(`${report.description}\n`);

  if (report.images && report.images.length > 0) {
    lines.push(`8. ATTACHED PHOTOGRAPHIC EVIDENCE URLS:`);
    report.images.forEach((img, idx) => {
      lines.push(`- Evidence #${idx + 1}: ${img}`);
    });
    lines.push('');
  }

  if (report.foodSafetyDetails?.officialFiling?.docketNumber) {
    lines.push(`9. PREVIOUS OFFICIAL DOCKET REFERENCE:`);
    lines.push(
      `${report.foodSafetyDetails.officialFiling.channelName || 'Official Channel'}: ${report.foodSafetyDetails.officialFiling.docketNumber}\n`,
    );
  }

  lines.push('----------------------------------------');
  lines.push(
    'DISCLAIMER: This dossier contains citizen-recorded observations compiled for statutory submission. Redact any sensitive personal banking information prior to official lodgment.',
  );
  lines.push('----------------------------------------');

  return lines.join('\n');
}
