import { PDFDocument, rgb, PDFPage, PDFFont } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import DejaVuSansRegularUrl from '@/assets/fonts/dejavu/DejaVuSans.ttf';
import DejaVuSansBoldUrl from '@/assets/fonts/dejavu/DejaVuSans-Bold.ttf';

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

export const generateReferencePDF = async (
  reference: CompletedReference,
  applicantName: string,
  applicantDOB: string,
  applicantPostcode: string,
  companySettings: CompanySettings = { name: 'Company Name' }
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
  const referenceTypeTitle = reference.reference_type === 'employer' 
    ? 'Employment Reference' 
    : 'Character Reference';
  helper.drawHeader(companySettings.name, referenceTypeTitle);
  
  // Applicant Information Section
  helper.drawSection('Applicant Information');
  helper.drawKeyValueHorizontal([
    { label: 'Name', value: applicantName },
    { label: 'Date of Birth', value: applicantDOB },
    { label: 'Postcode', value: applicantPostcode }
  ]);
  
  // Referee Information Section
  helper.drawSection('Referee Information');
  const refereeItems = [
    { label: 'Referee Name', value: reference.form_data.refereeFullName || 'Not provided' }
  ];
  if (reference.form_data.refereeJobTitle) {
    refereeItems.push({ label: 'Job Title', value: reference.form_data.refereeJobTitle });
  }
  helper.drawKeyValueHorizontal(refereeItems);
  
  // Reference Type Specific Content
  if (reference.reference_type === 'employer') {
    helper.drawSection('Employment Reference');
    
    helper.drawText('Are you this person\'s current or previous employer?', { bold: true, size: 10 });
    helper.addSpacer(2);
    
    helper.drawInlineCheckboxes([
      { label: 'Current', checked: reference.form_data.employmentStatus === 'current' },
      { label: 'Previous', checked: reference.form_data.employmentStatus === 'previous' },
      { label: 'Neither', checked: reference.form_data.employmentStatus === 'neither' },
    ]);
    
    helper.addSpacer(6);
    helper.drawText('What is your relationship to this person (e.g. "I am her/his manager")?', { bold: true, size: 10 });
    helper.addSpacer(2);
    helper.drawWrappedText(
      reference.form_data.relationshipDescription || 'Not provided',
      helper.page.getWidth() - 2 * margin,
      { color: colors.mutedText }
    );
    
    helper.addSpacer(6);
    helper.drawText('Please state the person\'s job title:', { bold: true, size: 10 });
    helper.addSpacer(2);
    helper.drawText(reference.form_data.jobTitle || 'Not provided', { color: colors.mutedText });
    
    helper.addSpacer(6);
    if (reference.form_data.startDate || reference.form_data.endDate) {
      const startDate = reference.form_data.startDate 
        ? new Date(reference.form_data.startDate).toLocaleDateString() 
        : 'Not provided';
      const endDate = reference.form_data.endDate 
        ? new Date(reference.form_data.endDate).toLocaleDateString() 
        : 'Not provided';
      helper.drawText('Employment Period:', { bold: true, size: 10 });
      helper.addSpacer(2);
      helper.drawText(`From ${startDate} to ${endDate}`, { color: colors.mutedText });
      helper.addSpacer(6);
    }
    
    helper.drawText('How would you describe their recent attendance record?', { bold: true, size: 10 });
    helper.addSpacer(2);
    helper.drawInlineCheckboxes([
      { label: 'Good', checked: reference.form_data.attendance === 'good' },
      { label: 'Average', checked: reference.form_data.attendance === 'average' },
      { label: 'Poor', checked: reference.form_data.attendance === 'poor' },
    ]);
    
    helper.addSpacer(6);
    helper.drawWrappedText(
      'Why did the person leave your employment (if they are still employed, please write \'still employed\')?',
      helper.page.getWidth() - 2 * margin,
      { bold: true, size: 10 }
    );
    helper.addSpacer(2);
    helper.drawWrappedText(
      reference.form_data.leavingReason || 'Not provided',
      helper.page.getWidth() - 2 * margin,
      { color: colors.mutedText }
    );
  } else {
    // Character reference
    helper.drawSection('Character Reference');
    
    helper.drawText('Do you know this person from outside employment or education?', { bold: true, size: 10 });
    helper.addSpacer(2);
    helper.drawInlineCheckboxes([
      { label: 'Yes', checked: reference.form_data.employmentStatus === 'yes' },
      { label: 'No', checked: reference.form_data.employmentStatus === 'no' },
    ]);
    
    helper.addSpacer(6);
    helper.drawText('Please describe your relationship with this person, including how long you have known them:', { bold: true, size: 10 });
    helper.addSpacer(2);
    helper.drawWrappedText(
      reference.form_data.relationshipDescription || 'Not provided',
      helper.page.getWidth() - 2 * margin,
      { color: colors.mutedText }
    );
  }
  
  // Character Qualities Section
  helper.ensureSpace(120);
  helper.drawSection('Character Qualities');
  
  helper.drawText('In your opinion, which of the following describes this person (tick each that is true)?', { bold: true, size: 10 });
  helper.addSpacer(4);
  
  // Draw qualities box
  const startY = helper.y;
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
    
    helper.drawCheckbox(
      left.label,
      !!reference.form_data[left.key as keyof ReferenceData],
      'left'
    );
    
    if (right) {
      helper.drawCheckbox(
        right.label,
        !!reference.form_data[right.key as keyof ReferenceData],
        'right'
      );
    }
    
    helper.y -= 20;
  }
  
  helper.addSpacer(8);
  
  // Only show the optional reason field if there's actual content
  if (reference.form_data.qualitiesNotTickedReason) {
    helper.drawText('If you did not tick one or more of the above, please tell us why here:', { bold: true, size: 10 });
    helper.addSpacer(2);
    helper.drawWrappedText(
      reference.form_data.qualitiesNotTickedReason,
      helper.page.getWidth() - 2 * margin,
      { color: colors.mutedText }
    );
    helper.addSpacer(6);
  } else {
    helper.addSpacer(6);
  }
  
  // Criminal Background Section - CRITICAL
  helper.ensureSpace(140);
  helper.addSpacer(12);
  
  const criticalStartY = helper.y;
  helper.addSpacer(8);
  
  // Critical header
  helper.page.drawText('CRIMINAL BACKGROUND CHECK', {
    x: margin,
    y: helper.y - 12,
    size: 12,
    font: boldFont,
    color: colors.darkText,
  });
  helper.y -= 20;
  
  helper.drawWrappedText(
    'The position this person has applied for involves working with vulnerable people. Are you aware of any convictions, cautions, reprimands or final warnings that the person may have received that are not \'protected\' as defined by the Rehabilitation of Offenders Act 1974 (Exceptions) Order 1975 (as amended in 2013 by SI 210 1198)?',
    helper.page.getWidth() - 2 * margin,
    { size: 10 }
  );
  
  helper.addSpacer(4);
  helper.drawInlineCheckboxes([
    { label: 'Yes', checked: reference.form_data.convictionsKnown === 'yes' },
    { label: 'No', checked: reference.form_data.convictionsKnown === 'no' },
  ]);
  
  helper.addSpacer(8);
  helper.drawWrappedText(
    'To your knowledge, is this person currently the subject of any criminal proceedings (for example, charged or summoned but not yet dealt with) or any police investigation?',
    helper.page.getWidth() - 2 * margin,
    { size: 10 }
  );
  
  helper.addSpacer(4);
  helper.drawInlineCheckboxes([
    { label: 'Yes', checked: reference.form_data.criminalProceedingsKnown === 'yes' },
    { label: 'No', checked: reference.form_data.criminalProceedingsKnown === 'no' },
  ]);
  
  if (reference.form_data.convictionsKnown === 'yes' || reference.form_data.criminalProceedingsKnown === 'yes' || reference.form_data.criminalDetails) {
    helper.addSpacer(8);
    helper.drawText('Details provided:', { bold: true, size: 10 });
    helper.addSpacer(2);
    helper.drawWrappedText(
      reference.form_data.criminalDetails || 'Not provided',
      helper.page.getWidth() - 2 * margin,
      { color: colors.mutedText }
    );
  }
  
  helper.addSpacer(8);
  
  // Additional Comments
  helper.ensureSpace(60);
  helper.addSpacer(12);
  helper.drawSection('Additional Comments');
  helper.drawText('Any additional comments you would like to make about this person:', { bold: true, size: 10 });
  helper.addSpacer(2);
  helper.drawWrappedText(
    reference.form_data.additionalComments || 'Not provided',
    helper.page.getWidth() - 2 * margin,
    { color: colors.mutedText }
  );
  
  // Declaration
  helper.ensureSpace(80);
  helper.addSpacer(12);
  helper.drawSection('Declaration');
  
  helper.drawWrappedText(
    'I certify that, to the best of my knowledge, the information I have given is true and complete. I understand that any deliberate omission, falsification or misrepresentation may lead to refusal of appointment or dismissal.',
    helper.page.getWidth() - 2 * margin,
    { size: 10, color: colors.mutedText }
  );
  
  helper.addSpacer(12);
  
  // Referee Information section
  helper.addSpacer(8);
  helper.drawSection('Referee Information');
  helper.drawKeyValue('Referee Name', reference.form_data.refereeFullName || 'Not provided');
  helper.drawKeyValue('Referee Job Title', reference.form_data.refereeJobTitle || 'Not provided');
  helper.drawKeyValue('Reference Created', new Date(reference.created_at).toLocaleDateString());
  helper.drawKeyValue('Reference Sent', new Date(reference.sent_at).toLocaleDateString());
  helper.drawKeyValue('Reference Completed', new Date(reference.completed_at).toLocaleDateString());
  
  // Add footers to all pages
  const pages = doc.getPages();
  pages.forEach((p, i) => {
    const tempHelper = new PDFHelper(doc, p, font, boldFont);
    tempHelper.drawFooter(i + 1, pages.length);
  });
  
  return doc;
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
  referenceNumber?: number;
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
  const referenceTypeTitle = data.referenceType === 'employer' 
    ? 'Employment Reference Request' 
    : 'Character Reference Request';
  helper.drawHeader(companySettings.name, referenceTypeTitle);
  
  // Applicant Information
  helper.drawSection('Applicant Information');
  helper.drawKeyValue('Name', data.applicantName);
  if (data.applicantPosition) {
    helper.drawKeyValue('Position Applied For', data.applicantPosition);
  }
  if (data.applicantDOB) {
    helper.drawKeyValue('Date of Birth', data.applicantDOB);
  }
  if (data.applicantPostcode) {
    helper.drawKeyValue('Postcode', data.applicantPostcode);
  }
  
  // Referee Information
  helper.drawSection('Referee Information');
  if (data.referee.name) {
    helper.drawKeyValue('Name', data.referee.name);
  }
  if (data.referee.company) {
    helper.drawKeyValue('Company', data.referee.company);
  }
  if (data.referee.jobTitle) {
    helper.drawKeyValue('Job Title', data.referee.jobTitle);
  }
  if (data.referee.email) {
    helper.drawKeyValue('Email', data.referee.email);
  }
  if (data.referee.phone) {
    helper.drawKeyValue('Phone', data.referee.phone);
  }
  if (data.referee.address) {
    helper.drawKeyValue('Address', data.referee.address);
  }
  if (data.referee.town) {
    helper.drawKeyValue('Town', data.referee.town);
  }
  if (data.referee.postcode) {
    helper.drawKeyValue('Postcode', data.referee.postcode);
  }
  
  // Employment Details (if applicable)
  if (data.referenceType === 'employer') {
    helper.drawSection('Employment Details');
    
    if (data.employmentStatus) {
      helper.drawText('Employment Status:', { bold: true, size: 10 });
      helper.addSpacer(2);
      helper.drawInlineCheckboxes([
        { label: 'Current', checked: data.employmentStatus === 'current' },
        { label: 'Previous', checked: data.employmentStatus === 'previous' },
        { label: 'Neither', checked: data.employmentStatus === 'neither' },
      ]);
      helper.addSpacer(6);
    }
    
    if (data.employmentFrom || data.employmentTo) {
      helper.drawKeyValue(
        'Employment Period',
        `${data.employmentFrom || 'Not specified'} to ${data.employmentTo || 'Not specified'}`
      );
    }
    
    if (data.reasonForLeaving) {
      helper.drawText('Reason for Leaving:', { bold: true, size: 10 });
      helper.addSpacer(2);
      helper.drawWrappedText(
        data.reasonForLeaving,
        helper.page.getWidth() - 2 * margin,
        { color: colors.mutedText }
      );
    }
  }
  
  // Instructions
  helper.ensureSpace(120);
  helper.addSpacer(16);
  helper.drawSection('Instructions for Referee');
  
  helper.drawWrappedText(
    'Please complete this reference form and return it to us at your earliest convenience. This reference is confidential and will only be used for employment purposes.',
    helper.page.getWidth() - 2 * margin,
    { size: 10, color: colors.mutedText }
  );
  
  helper.addSpacer(12);
  
  // Questions section
  helper.drawText('Questions to Answer:', { bold: true, size: 11 });
  helper.addSpacer(8);
  
  const questions = data.referenceType === 'employer' ? [
    '1. In what capacity do/did you know the applicant?',
    '2. What were their main duties and responsibilities?',
    '3. How would you describe their work performance and reliability?',
    '4. How would you describe their attendance and punctuality?',
    '5. Did they work well as part of a team?',
    '6. Would you re-employ this person? Why or why not?',
    '7. Do you know of any reason why they should not work with vulnerable people?',
  ] : [
    '1. In what capacity do you know the applicant?',
    '2. How long have you known them?',
    '3. What are their main strengths and positive qualities?',
    '4. How would you describe their character and personality?',
    '5. Would you trust them to work with vulnerable people? Why or why not?',
    '6. Are you aware of any issues that might affect their suitability for this role?',
  ];
  
  questions.forEach(q => {
    helper.ensureSpace(40);
    helper.drawText(q, { bold: true, size: 10 });
    helper.addSpacer(2);
    
    // Draw lines for answers
    for (let i = 0; i < 3; i++) {
      helper.page.drawLine({
        start: { x: margin, y: helper.y - 8 },
        end: { x: helper.page.getWidth() - margin, y: helper.y - 8 },
        color: colors.border,
        thickness: 0.5,
      });
      helper.y -= 16;
    }
    
    helper.addSpacer(8);
  });
  
  // Signature section
  helper.ensureSpace(80);
  helper.addSpacer(12);
  helper.drawSection('Declaration and Signature');
  
  helper.drawWrappedText(
    'I certify that, to the best of my knowledge, the information I have provided is true and complete. I understand that any deliberate omission, falsification or misrepresentation may have consequences.',
    helper.page.getWidth() - 2 * margin,
    { size: 10, color: colors.mutedText }
  );
  
  helper.addSpacer(20);
  
  // Signature lines
  const signatureLineWidth = 200;
  helper.page.drawLine({
    start: { x: margin, y: helper.y - 8 },
    end: { x: margin + signatureLineWidth, y: helper.y - 8 },
    color: colors.border,
    thickness: 0.5,
  });
  helper.y -= 12;
  helper.drawText('Signature', { size: 9, color: colors.mutedText });
  
  helper.addSpacer(12);
  
  helper.page.drawLine({
    start: { x: margin, y: helper.y - 8 },
    end: { x: margin + signatureLineWidth, y: helper.y - 8 },
    color: colors.border,
    thickness: 0.5,
  });
  helper.y -= 12;
  helper.drawText('Date', { size: 9, color: colors.mutedText });
  
  // Add footers
  const pages = doc.getPages();
  pages.forEach((p, i) => {
    const tempHelper = new PDFHelper(doc, p, font, boldFont);
    tempHelper.drawFooter(i + 1, pages.length);
  });
  
  return doc;
};
