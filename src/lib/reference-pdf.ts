import { PDFDocument, rgb, PDFPage, PDFFont } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import DejaVuSansRegularUrl from '@/assets/fonts/dejavu/DejaVuSans.ttf';
import DejaVuSansBoldUrl from '@/assets/fonts/dejavu/DejaVuSans-Bold.ttf';
import { format, parseISO } from 'date-fns';

// Helper function to format dates from yyyy-mm-dd or ISO string to dd/mm/yyyy
const formatDateToDDMMYYYY = (dateString: string): string => {
  if (!dateString) return dateString;
  
  try {
    // Try to parse as ISO date string (e.g., "2025-11-01T00:00:00.000Z")
    const date = parseISO(dateString);
    
    // Check if date is valid
    if (!isNaN(date.getTime())) {
      return format(date, 'dd/MM/yyyy');
    }
  } catch (error) {
    // If parsing fails, continue to manual parsing
  }
  
  // Fallback: Check if date is in yyyy-mm-dd format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  }
  
  // If already in dd/mm/yyyy format or other format, return as is
  return dateString;
};

interface ReferenceData {
  refereeFullName: string;
  refereeJobTitle?: string;
  
  // Employment reference specific
  employmentStatus?: string; // current, previous, or neither
  relationshipDescription?: string;
  jobTitle?: string;
  startDate?: string;
  endDate?: string;
  attendance?: string;
  leavingReason?: string;
  
  // Common checkbox qualities
  honestTrustworthy?: boolean;
  communicatesEffectively?: boolean;
  effectiveTeamMember?: boolean;
  respectfulConfidentiality?: boolean;
  reliablePunctual?: boolean;
  suitablePosition?: boolean;
  kindCompassionate?: boolean;
  worksIndependently?: boolean;
  
  // If any qualities not ticked
  qualitiesNotTickedReason?: string;
  
  // Criminal/legal questions
  convictionsKnown?: string;
  criminalProceedingsKnown?: string;
  criminalDetails?: string;
  
  // Final comments and signature
  additionalComments?: string;
  signatureDate?: string;
}

interface CompletedReference {
  id: string;
  reference_name: string;
  reference_type: string;
  form_data: ReferenceData;
  completed_at: string;
  created_at: string;
  sent_at: string;
  application_id: string;
}

interface CompanySettings {
  name: string;
  logo?: string;
}

// Color palette
const colors = {
  darkText: rgb(0.07, 0.09, 0.15),
  mutedText: rgb(0.4, 0.4, 0.5),
  accent: rgb(0.2, 0.4, 0.8),
  headerBg: rgb(0.98, 0.98, 0.985),
  sectionBg: rgb(0.96, 0.97, 0.98),
  criticalBorder: rgb(0.9, 0.4, 0.2),
  criticalBg: rgb(1, 0.97, 0.95),
  border: rgb(0.85, 0.85, 0.87),
  checkboxBg: rgb(0.94, 0.98, 0.94), // Light green tint like reference
  successText: rgb(0.13, 0.54, 0.13), // Green for checked items
};

const margin = 40;
const lineHeight = 14;

class PDFHelper {
  doc: PDFDocument;
  page: PDFPage;
  font: PDFFont;
  boldFont: PDFFont;
  y: number;
  embeddedLogo?: any;

  constructor(doc: PDFDocument, page: PDFPage, font: PDFFont, boldFont: PDFFont, embeddedLogo?: any) {
    this.doc = doc;
    this.page = page;
    this.font = font;
    this.boldFont = boldFont;
    this.y = page.getHeight() - margin;
    this.embeddedLogo = embeddedLogo;
  }

  ensureSpace(needed: number) {
    if (this.y - needed < margin + 30) {
      this.page = this.doc.addPage();
      this.y = this.page.getHeight() - margin;
      return true;
    }
    return false;
  }

  addSpacer(amount = 8) {
    this.y -= amount;
  }

  drawText(text: string, opts?: { bold?: boolean; size?: number; color?: any; centered?: boolean }) {
    const f = opts?.bold ? this.boldFont : this.font;
    const size = opts?.size ?? 11;
    const color = opts?.color ?? colors.darkText;
    
    let x = margin;
    if (opts?.centered) {
      const width = f.widthOfTextAtSize(text, size);
      x = this.page.getWidth() / 2 - width / 2;
    }

    this.page.drawText(text ?? '', {
      x,
      y: this.y - size,
      size,
      font: f,
      color,
    });
    this.y -= size + 4;
  }

  drawWrappedText(text: string, maxWidth: number, opts?: { bold?: boolean; size?: number; color?: any }): void {
    const f = opts?.bold ? this.boldFont : this.font;
    const size = opts?.size ?? 11;
    const color = opts?.color ?? colors.darkText;
    
    const words = (text || '').split(/\s+/);
    let line = '';
    const lines: string[] = [];
    
    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;
      const width = f.widthOfTextAtSize(testLine, size);
      
      if (width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    }
    if (line) lines.push(line);

    lines.forEach(l => {
      this.page.drawText(l, {
        x: margin,
        y: this.y - size,
        size,
        font: f,
        color,
      });
      this.y -= size + 4;
    });
  }

  drawKeyValue(label: string, value: string, opts?: { valueColor?: any }) {
    const labelText = `${label}: `;
    const labelWidth = this.boldFont.widthOfTextAtSize(labelText, 11);
    
    this.page.drawText(labelText, {
      x: margin,
      y: this.y - 11,
      size: 11,
      font: this.boldFont,
      color: colors.darkText,
    });
    
    this.page.drawText(value ?? '', {
      x: margin + labelWidth,
      y: this.y - 11,
      size: 11,
      font: this.font,
      color: opts?.valueColor ?? colors.darkText,
    });
    
    this.y -= lineHeight;
  }

  drawKeyValueHorizontal(items: Array<{ label: string; value: string }>) {
    const availableWidth = this.page.getWidth() - 2 * margin;
    const itemSpacing = availableWidth / items.length;
    
    items.forEach((item, index) => {
      const labelText = `${item.label}: `;
      const labelWidth = this.boldFont.widthOfTextAtSize(labelText, 11);
      const xPos = margin + (index * itemSpacing);
      
      this.page.drawText(labelText, {
        x: xPos,
        y: this.y - 11,
        size: 11,
        font: this.boldFont,
        color: colors.darkText,
      });
      
      this.page.drawText(item.value ?? '', {
        x: xPos + labelWidth,
        y: this.y - 11,
        size: 11,
        font: this.font,
        color: colors.darkText,
      });
    });
    
    this.y -= lineHeight;
  }

  drawSection(title: string) {
    this.ensureSpace(30);
    this.addSpacer(6);
    
    // Section background
    this.page.drawRectangle({
      x: margin - 8,
      y: this.y - 24,
      width: this.page.getWidth() - 2 * margin + 16,
      height: 24,
      color: colors.sectionBg,
    });
    
    this.drawText(title, { bold: true, size: 12 });
    this.addSpacer(4);
  }

  drawCheckbox(label: string, checked: boolean, column: 'left' | 'right' = 'left') {
    const checkbox = checked ? '☑' : '☐';
    const boxSize = 13;
    
    const columnWidth = (this.page.getWidth() - 2 * margin) / 2;
    const x = column === 'left' ? margin + 6 : margin + columnWidth + 6;
    
    // Draw checkbox with better styling
    this.page.drawText(checkbox, {
      x,
      y: this.y - boxSize,
      size: boxSize,
      font: this.font,
      color: checked ? colors.successText : colors.mutedText,
    });
    
    this.page.drawText(label, {
      x: x + boxSize + 8,
      y: this.y - 10,
      size: 10,
      font: this.font,
      color: colors.darkText,
    });
  }

  drawInlineCheckboxes(options: Array<{ label: string; checked: boolean }>) {
    const spacing = 60;
    let x = margin;
    
    options.forEach(opt => {
      const checkbox = opt.checked ? '☑' : '☐';
      const boxWidth = this.font.widthOfTextAtSize(checkbox, 11);
      
      this.page.drawText(checkbox, {
        x,
        y: this.y - 11,
        size: 11,
        font: this.font,
        color: opt.checked ? colors.accent : colors.mutedText,
      });
      
      this.page.drawText(opt.label, {
        x: x + boxWidth + 4,
        y: this.y - 11,
        size: 10,
        font: this.font,
        color: colors.darkText,
      });
      
      x += spacing;
    });
    
    this.y -= lineHeight;
  }

  drawBox(content: () => void, opts?: { borderColor?: any; bgColor?: any }) {
    const startY = this.y;
    const boxMargin = 12;
    
    content();
    
    const height = startY - this.y + boxMargin;
    
    // Draw background
    if (opts?.bgColor) {
      this.page.drawRectangle({
        x: margin - boxMargin / 2,
        y: this.y - boxMargin / 2,
        width: this.page.getWidth() - 2 * margin + boxMargin,
        height: height,
        color: opts.bgColor,
      });
    }
    
    // Draw border
    const borderColor = opts?.borderColor ?? colors.border;
    const x = margin - boxMargin / 2;
    const y = this.y - boxMargin / 2;
    const width = this.page.getWidth() - 2 * margin + boxMargin;
    
    // Draw four lines for border
    this.page.drawLine({ start: { x, y }, end: { x: x + width, y }, color: borderColor, thickness: 1 });
    this.page.drawLine({ start: { x, y: y + height }, end: { x: x + width, y: y + height }, color: borderColor, thickness: 1 });
    this.page.drawLine({ start: { x, y }, end: { x, y: y + height }, color: borderColor, thickness: 1 });
    this.page.drawLine({ start: { x: x + width, y }, end: { x: x + width, y: y + height }, color: borderColor, thickness: 1 });
    
    this.y -= boxMargin;
  }

  drawHeader(companyName: string, referenceType: string) {
    const headerHeight = this.embeddedLogo ? 130 : 100;
    
    // Header background
    this.page.drawRectangle({
      x: 0,
      y: this.page.getHeight() - headerHeight,
      width: this.page.getWidth(),
      height: headerHeight,
      color: colors.headerBg,
    });
    
    let cursorY = this.page.getHeight() - 20;
    
    // Logo
    if (this.embeddedLogo) {
      const logoW = 60;
      const logoH = (this.embeddedLogo.height / this.embeddedLogo.width) * logoW;
      const logoX = this.page.getWidth() / 2 - logoW / 2;
      const logoY = cursorY - logoH;
      
      this.page.drawImage(this.embeddedLogo, {
        x: logoX,
        y: logoY,
        width: logoW,
        height: logoH,
      });
      
      cursorY = logoY - 12;
    }
    
    // Company name
    const companySize = 14;
    const companyWidth = this.boldFont.widthOfTextAtSize(companyName, companySize);
    this.page.drawText(companyName, {
      x: this.page.getWidth() / 2 - companyWidth / 2,
      y: cursorY - companySize,
      size: companySize,
      font: this.boldFont,
      color: colors.darkText,
    });
    cursorY -= companySize + 8;
    
    // Reference type title
    const titleSize = 13;
    const titleWidth = this.boldFont.widthOfTextAtSize(referenceType, titleSize);
    this.page.drawText(referenceType, {
      x: this.page.getWidth() / 2 - titleWidth / 2,
      y: cursorY - titleSize,
      size: titleSize,
      font: this.boldFont,
      color: colors.accent,
    });
    
    // Divider line
    this.page.drawRectangle({
      x: margin,
      y: this.page.getHeight() - headerHeight - 1,
      width: this.page.getWidth() - 2 * margin,
      height: 1,
      color: colors.border,
    });
    
    this.y = this.page.getHeight() - headerHeight - 16;
  }

  drawFooter(pageNum: number, totalPages: number) {
    const footerY = 20;
    const footerText = `Page ${pageNum} of ${totalPages}`;
    const footerWidth = this.font.widthOfTextAtSize(footerText, 9);
    
    this.page.drawText(footerText, {
      x: this.page.getWidth() / 2 - footerWidth / 2,
      y: footerY,
      size: 9,
      font: this.font,
      color: colors.mutedText,
    });
  }
}

// Shared template function for generating reference PDF layouts
interface GenerateReferencePDFTemplateOptions {
  isBlankTemplate: boolean;
  referenceType: 'employer' | 'character';
  applicantName: string;
  applicantDOB: string;
  applicantPostcode: string;
  companySettings: CompanySettings;
  referenceData?: ReferenceData;
  refereeInfo?: {
    name?: string;
    company?: string;
    jobTitle?: string;
    email?: string;
    phone?: string;
    address?: string;
    town?: string;
    postcode?: string;
  };
  completionDates?: {
    created: string;
    sent: string;
    completed: string;
  };
  manualPDFData?: {
    applicantPosition?: string;
    employmentFrom?: string;
    employmentTo?: string;
    reasonForLeaving?: string;
    employmentStatus?: 'current' | 'previous' | 'neither';
  };
}

const generateReferencePDFTemplate = async (
  isBlankTemplate: boolean,
  referenceType: 'employer' | 'character',
  applicantName: string,
  applicantDOB: string,
  applicantPostcode: string,
  companySettings: CompanySettings,
  referenceData?: ReferenceData,
  refereeInfo?: {
    name?: string;
    company?: string;
    jobTitle?: string;
    email?: string;
    phone?: string;
    address?: string;
    town?: string;
    postcode?: string;
  },
  completionDates?: {
    created: string;
    sent: string;
    completed: string;
  },
  manualPDFData?: {
    applicantPosition?: string;
    employmentFrom?: string;
    employmentTo?: string;
    reasonForLeaving?: string;
    employmentStatus?: 'current' | 'previous' | 'neither';
  }
) => {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  
  // Load fonts
  const regularBytes = await fetch(DejaVuSansRegularUrl).then(r => r.arrayBuffer());
  const boldBytes = await fetch(DejaVuSansBoldUrl).then(r => r.arrayBuffer());
  const font = await doc.embedFont(new Uint8Array(regularBytes), { subset: true });
  const boldFont = await doc.embedFont(new Uint8Array(boldBytes), { subset: true });
  
  // Try to embed company logo
  let embeddedLogo: any | undefined;
  if (companySettings.logo) {
    try {
      const logoBytes = await fetch(companySettings.logo).then(r => r.arrayBuffer());
      try {
        embeddedLogo = await doc.embedPng(logoBytes);
      } catch {
        embeddedLogo = await doc.embedJpg(logoBytes);
      }
    } catch {
      embeddedLogo = undefined;
    }
  }
  
  const page = doc.addPage();
  const helper = new PDFHelper(doc, page, font, boldFont, embeddedLogo);
  
  // Draw header
  const referenceTypeTitle = referenceType === 'employer' 
    ? (isBlankTemplate ? 'Employment Reference Request' : 'Employment Reference')
    : (isBlankTemplate ? 'Character Reference Request' : 'Character Reference');
  helper.drawHeader(companySettings.name, referenceTypeTitle);
  
  // Applicant Information Section
  helper.drawSection('Applicant Information');
  helper.drawKeyValueHorizontal([
    { label: 'Name', value: applicantName },
    { label: 'Date of Birth', value: formatDateToDDMMYYYY(applicantDOB) },
    { label: 'Postcode', value: applicantPostcode }
  ]);
  
  // Referee Information Section (Top)
  helper.drawSection('Referee Information');
  const refereeItems: Array<{ label: string; value: string }> = [];
  
  if (isBlankTemplate && refereeInfo) {
    if (refereeInfo.name) {
      refereeItems.push({ label: 'Referee Name', value: refereeInfo.name });
    }
  } else if (referenceData) {
    refereeItems.push({ label: 'Referee Name', value: referenceData.refereeFullName || 'Not provided' });
    if (referenceData.refereeJobTitle) {
      refereeItems.push({ label: 'Job Title', value: referenceData.refereeJobTitle });
    }
  }
  
  if (refereeItems.length > 0) {
    helper.drawKeyValueHorizontal(refereeItems);
  }
  
  // Reference Type Specific Content
  if (referenceType === 'employer') {
    helper.drawSection('Employment Reference');
    
    helper.drawText('Are you this person\'s current or previous employer?', { bold: true, size: 10 });
    helper.addSpacer(4);
    
    if (isBlankTemplate) {
      const statusToCheck = manualPDFData?.employmentStatus || 'previous';
      helper.drawInlineCheckboxes([
        { label: 'Current', checked: statusToCheck === 'current' },
        { label: 'Previous', checked: statusToCheck === 'previous' },
        { label: 'Neither', checked: statusToCheck === 'neither' },
      ]);
    } else {
      helper.drawInlineCheckboxes([
        { label: 'Current', checked: referenceData?.employmentStatus === 'current' },
        { label: 'Previous', checked: referenceData?.employmentStatus === 'previous' },
        { label: 'Neither', checked: referenceData?.employmentStatus === 'neither' },
      ]);
    }
    
    helper.addSpacer(12);
    helper.drawText('What is your relationship to this person (e.g. "I am her/his manager")?', { bold: true, size: 10 });
    helper.addSpacer(4);
    
    if (isBlankTemplate) {
      const relationshipText = refereeInfo?.jobTitle 
        ? refereeInfo.jobTitle
        : '_'.repeat(100);
      helper.drawWrappedText(
        relationshipText,
        helper.page.getWidth() - 2 * margin,
        { color: colors.mutedText }
      );
    } else {
      helper.drawWrappedText(
        referenceData?.relationshipDescription || 'Not provided',
        helper.page.getWidth() - 2 * margin,
        { color: colors.mutedText }
      );
    }
    
    helper.addSpacer(12);
    helper.drawText('Please state the person\'s job title:', { bold: true, size: 10 });
    helper.addSpacer(4);
    
    if (isBlankTemplate) {
      const jobTitleText = manualPDFData?.applicantPosition || '_'.repeat(60);
      helper.drawText(jobTitleText, { color: colors.mutedText });
    } else {
      helper.drawText(referenceData?.jobTitle || 'Not provided', { color: colors.mutedText });
    }
    
    helper.addSpacer(12);
    helper.drawText('Employment Period:', { bold: true, size: 10 });
    helper.addSpacer(4);
    
    if (isBlankTemplate) {
      const fromDate = manualPDFData?.employmentFrom 
        ? formatDateToDDMMYYYY(manualPDFData.employmentFrom)
        : '_________________';
      const toDate = manualPDFData?.employmentTo 
        ? formatDateToDDMMYYYY(manualPDFData.employmentTo)
        : '_________________';
      helper.drawText(`From ${fromDate} to ${toDate}`, { color: colors.mutedText });
    } else {
      const startDate = referenceData?.startDate 
        ? formatDateToDDMMYYYY(referenceData.startDate)
        : 'Not provided';
      const endDate = referenceData?.endDate 
        ? formatDateToDDMMYYYY(referenceData.endDate)
        : 'Not provided';
      helper.drawText(`From ${startDate} to ${endDate}`, { color: colors.mutedText });
    }
    helper.addSpacer(12);
    
    helper.drawText('How would you describe their recent attendance record?', { bold: true, size: 10 });
    helper.addSpacer(4);
    
    if (isBlankTemplate) {
      helper.drawInlineCheckboxes([
        { label: 'Good', checked: true },
        { label: 'Average', checked: false },
        { label: 'Poor', checked: false },
      ]);
    } else {
      helper.drawInlineCheckboxes([
        { label: 'Good', checked: referenceData?.attendance === 'good' },
        { label: 'Average', checked: referenceData?.attendance === 'average' },
        { label: 'Poor', checked: referenceData?.attendance === 'poor' },
      ]);
    }
    
    helper.addSpacer(16);
    helper.drawWrappedText(
      'Why did the person leave your employment (if they are still employed, please write \'still employed\')?',
      helper.page.getWidth() - 2 * margin,
      { bold: true, size: 10 }
    );
    helper.addSpacer(4);
    
    if (isBlankTemplate) {
      const leavingReasonText = manualPDFData?.reasonForLeaving || 
        (manualPDFData?.employmentStatus === 'current' ? 'still employed' : '_'.repeat(100));
      helper.drawWrappedText(
        leavingReasonText,
        helper.page.getWidth() - 2 * margin,
        { color: colors.mutedText }
      );
    } else {
      helper.drawWrappedText(
        referenceData?.leavingReason || 'Not provided',
        helper.page.getWidth() - 2 * margin,
        { color: colors.mutedText }
      );
    }
  } else {
    // Character reference
    helper.drawSection('Character Reference');
    
    helper.drawText('Do you know this person from outside employment or education?', { bold: true, size: 10 });
    helper.addSpacer(4);
    
    if (isBlankTemplate) {
      helper.drawInlineCheckboxes([
        { label: 'Yes', checked: true },
        { label: 'No', checked: false },
      ]);
    } else {
      helper.drawInlineCheckboxes([
        { label: 'Yes', checked: referenceData?.employmentStatus === 'yes' },
        { label: 'No', checked: referenceData?.employmentStatus === 'no' },
      ]);
    }
    
    helper.addSpacer(16);
    helper.drawText('Please describe your relationship with this person, including how long you have known them:', { bold: true, size: 10 });
    helper.addSpacer(4);
    
    if (isBlankTemplate) {
      helper.drawWrappedText(
        '_'.repeat(100),
        helper.page.getWidth() - 2 * margin,
        { color: colors.mutedText }
      );
    } else {
      helper.drawWrappedText(
        referenceData?.relationshipDescription || 'Not provided',
        helper.page.getWidth() - 2 * margin,
        { color: colors.mutedText }
      );
    }
  }
  
  // Character Qualities Section
  helper.ensureSpace(120);
  helper.addSpacer(16);
  helper.drawSection('Character Qualities');
  
  helper.drawText('In your opinion, which of the following describes this person (tick each that is true)?', { bold: true, size: 10 });
  helper.addSpacer(4);
  
  helper.addSpacer(6);
  
  const qualities = [
    { key: 'honestTrustworthy', label: 'Honest and trustworthy' },
    { key: 'communicatesEffectively', label: 'Communicates effectively' },
    { key: 'effectiveTeamMember', label: 'An effective team member' },
    { key: 'respectfulConfidentiality', label: 'Respectful of confidentiality' },
    { key: 'reliablePunctual', label: 'Reliable and punctual' },
    { key: 'suitablePosition', label: 'Suitable for the position applied for' },
    { key: 'kindCompassionate', label: 'Kind and compassionate' },
    { key: 'worksIndependently', label: 'Able to work well without close supervision' },
  ];
  
  // Calculate height for background with better padding
  const estimatedHeight = (qualities.length / 2) * 20 + 24;
  
  // Draw background with rounded appearance
  helper.page.drawRectangle({
    x: margin - 10,
    y: helper.y - estimatedHeight,
    width: helper.page.getWidth() - 2 * margin + 20,
    height: estimatedHeight,
    color: colors.checkboxBg,
    borderColor: rgb(0.85, 0.92, 0.85),
    borderWidth: 1,
  });
  
  helper.addSpacer(8);
  
  for (let i = 0; i < qualities.length; i += 2) {
    helper.ensureSpace(22);
    const left = qualities[i];
    const right = qualities[i + 1];
    
    const leftChecked = isBlankTemplate ? true : !!referenceData?.[left.key as keyof ReferenceData];
    helper.drawCheckbox(left.label, leftChecked, 'left');
    
    if (right) {
      const rightChecked = isBlankTemplate ? true : !!referenceData?.[right.key as keyof ReferenceData];
      helper.drawCheckbox(right.label, rightChecked, 'right');
    }
    
    helper.y -= 20;
  }
  
  helper.addSpacer(8);
  
  // Optional reason field
  if (!isBlankTemplate && referenceData?.qualitiesNotTickedReason) {
    helper.drawText('If you did not tick one or more of the above, please tell us why here:', { bold: true, size: 10 });
    helper.addSpacer(4);
    helper.drawWrappedText(
      referenceData.qualitiesNotTickedReason,
      helper.page.getWidth() - 2 * margin,
      { color: colors.mutedText }
    );
    helper.addSpacer(12);
  } else if (isBlankTemplate) {
    const randomResponse = Math.random() > 0.5 ? 'N/A' : 'Not Provided';
    helper.drawText('If you did not tick one or more of the above, please tell us why here:', { bold: true, size: 10 });
    helper.addSpacer(4);
    helper.drawWrappedText(
      randomResponse,
      helper.page.getWidth() - 2 * margin,
      { color: colors.mutedText }
    );
    helper.addSpacer(12);
  } else {
    helper.addSpacer(12);
  }
  
  // ===== FORCE NEW PAGE FOR CRITICAL SECTIONS =====
  helper.page = helper.doc.addPage();
  helper.y = helper.page.getHeight() - margin;
  helper.addSpacer(30);
  
  // Criminal Background Section
  helper.drawSection('Criminal Background Check');
  
  helper.drawWrappedText(
    'The position this person has applied for involves working with vulnerable people. Are you aware of any convictions, cautions, reprimands or final warnings that the person may have received that are not \'protected\' as defined by the Rehabilitation of Offenders Act 1974 (Exceptions) Order 1975 (as amended in 2013 by SI 210 1198)?',
    helper.page.getWidth() - 2 * margin,
    { size: 10 }
  );
  
  helper.addSpacer(6);
  
  if (isBlankTemplate) {
    helper.drawInlineCheckboxes([
      { label: 'Yes', checked: false },
      { label: 'No', checked: true },
    ]);
  } else {
    helper.drawInlineCheckboxes([
      { label: 'Yes', checked: referenceData?.convictionsKnown === 'yes' },
      { label: 'No', checked: referenceData?.convictionsKnown === 'no' },
    ]);
  }
  
  helper.addSpacer(16);
  helper.drawWrappedText(
    'To your knowledge, is this person currently the subject of any criminal proceedings (for example, charged or summoned but not yet dealt with) or any police investigation?',
    helper.page.getWidth() - 2 * margin,
    { size: 10 }
  );
  
  helper.addSpacer(6);
  
  if (isBlankTemplate) {
    helper.drawInlineCheckboxes([
      { label: 'Yes', checked: false },
      { label: 'No', checked: true },
    ]);
  } else {
    helper.drawInlineCheckboxes([
      { label: 'Yes', checked: referenceData?.criminalProceedingsKnown === 'yes' },
      { label: 'No', checked: referenceData?.criminalProceedingsKnown === 'no' },
    ]);
  }
  
  helper.addSpacer(16);
  
  if (!isBlankTemplate && (referenceData?.convictionsKnown === 'yes' || referenceData?.criminalProceedingsKnown === 'yes' || referenceData?.criminalDetails)) {
    helper.drawText('Details provided:', { bold: true, size: 10 });
    helper.addSpacer(4);
    helper.drawWrappedText(
      referenceData.criminalDetails || 'Not provided',
      helper.page.getWidth() - 2 * margin,
      { color: colors.mutedText }
    );
  } else if (isBlankTemplate) {
    helper.drawText('If you answered yes to either question above, please provide details:', { bold: true, size: 10 });
    helper.addSpacer(4);
    helper.drawWrappedText(
      '_'.repeat(100),
      helper.page.getWidth() - 2 * margin,
      { color: colors.mutedText }
    );
  }
  
  helper.addSpacer(20);
  
  // Additional Comments
  helper.drawSection('Additional Comments');
  helper.drawText('Any additional comments you would like to make about this person:', { bold: true, size: 10 });
  helper.addSpacer(6);
  
  if (isBlankTemplate) {
    helper.drawWrappedText(
      '_'.repeat(100),
      helper.page.getWidth() - 2 * margin,
      { color: colors.mutedText }
    );
  } else {
    helper.drawWrappedText(
      referenceData?.additionalComments || 'Not provided',
      helper.page.getWidth() - 2 * margin,
      { color: colors.mutedText }
    );
  }
  
  helper.addSpacer(20);
  
  // Declaration
  helper.drawSection('Declaration');
  
  helper.drawWrappedText(
    'I certify that, to the best of my knowledge, the information I have given is true and complete. I understand that any deliberate omission, falsification or misrepresentation may lead to refusal of appointment or dismissal.',
    helper.page.getWidth() - 2 * margin,
    { size: 10, color: colors.mutedText }
  );
  
  helper.addSpacer(20);
  
  // Referee Information section (Bottom - Full Details)
  helper.drawSection('Referee Information');
  
  if (isBlankTemplate && refereeInfo) {
    if (refereeInfo.name) {
      helper.drawKeyValue('Referee Name', refereeInfo.name);
    } else {
      helper.drawKeyValue('Referee Name', '');
    }
    
    if (refereeInfo.jobTitle) {
      helper.drawKeyValue('Referee Job Title', refereeInfo.jobTitle);
    } else {
      helper.drawKeyValue('Referee Job Title', '');
    }
    
    // Add date placeholders
    if (completionDates) {
      helper.drawKeyValue('Referee Created', completionDates.created);
      helper.drawKeyValue('Referee Sent', completionDates.sent);
      helper.drawKeyValue('Referee Completed', completionDates.completed);
    }
  } else if (referenceData && completionDates) {
    helper.drawKeyValue('Referee Name', referenceData.refereeFullName || 'Not provided');
    helper.drawKeyValue('Referee Job Title', referenceData.refereeJobTitle || 'Not provided');
    helper.drawKeyValue('Reference Created', new Date(completionDates.created).toLocaleDateString());
    helper.drawKeyValue('Reference Sent', new Date(completionDates.sent).toLocaleDateString());
    helper.drawKeyValue('Reference Completed', new Date(completionDates.completed).toLocaleDateString());
  }
  
  // Add footers to all pages
  const pages = doc.getPages();
  pages.forEach((p, i) => {
    const tempHelper = new PDFHelper(doc, p, font, boldFont);
    tempHelper.drawFooter(i + 1, pages.length);
  });
  
  return doc;
};

export const generateReferencePDF = async (
  reference: CompletedReference,
  applicantName: string,
  applicantDOB: string,
  applicantPostcode: string,
  companySettings: CompanySettings = { name: 'Company Name' }
) => {
  return generateReferencePDFTemplate(
    false,
    reference.reference_type as 'employer' | 'character',
    applicantName,
    applicantDOB,
    applicantPostcode,
    companySettings,
    reference.form_data,
    undefined,
    {
      created: reference.created_at,
      sent: reference.sent_at,
      completed: reference.completed_at,
    }
  );
};

export interface ManualReferenceInput {
  applicantName: string;
  applicantPosition?: string;
  referenceType: 'employer' | 'character';
  applicantDOB?: string;
  applicantPostcode?: string;
  employmentFrom?: string;
  employmentTo?: string;
  reasonForLeaving?: string;
  employmentStatus?: 'current' | 'previous' | 'neither';
  referenceNumber?: number; // 1 or 2 for placeholder generation
  referee: {
    name?: string;
    company?: string;
    jobTitle?: string;
    email?: string;
    phone?: string;
    address?: string;
    town?: string;
    postcode?: string;
  };
}

export const generateManualReferencePDF = async (
  data: ManualReferenceInput,
  companySettings: CompanySettings = { name: 'Company Name' }
) => {
  // Generate date placeholders based on reference number
  const refNum = data.referenceNumber || 1;
  const datePlaceholders = {
    created: `{R${refNum}_Created}`,
    sent: `{R${refNum}_Sent}`,
    completed: `{R${refNum}_Signed}`,
  };
  
  return generateReferencePDFTemplate(
    true,
    data.referenceType,
    data.applicantName,
    data.applicantDOB || '',
    data.applicantPostcode || '',
    companySettings,
    undefined,
    data.referee,
    datePlaceholders,
    {
      applicantPosition: data.applicantPosition,
      employmentFrom: data.employmentFrom,
      employmentTo: data.employmentTo,
      reasonForLeaving: data.reasonForLeaving,
      employmentStatus: data.employmentStatus,
    }
  );
};
