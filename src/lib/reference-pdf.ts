import { PDFDocument, rgb, PDFPage, PDFFont } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import DejaVuSansRegularUrl from '@/assets/fonts/dejavu/DejaVuSans.ttf';
import DejaVuSansBoldUrl from '@/assets/fonts/dejavu/DejaVuSans-Bold.ttf';

interface ReferenceData {
  refereeFullName: string;
  refereeJobTitle?: string;
  
  // Employment reference specific
  employmentStatus?: string;
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

// Helper class for PDF generation
class PDFHelper {
  doc: PDFDocument;
  page: PDFPage;
  font: PDFFont;
  boldFont: PDFFont;
  margin = 40;
  lineHeight = 16;
  y: number;
  embeddedLogo?: any;
  companyName: string;
  currentPageNumber = 1;
  totalPages = 1;

  constructor(
    doc: PDFDocument,
    page: PDFPage,
    font: PDFFont,
    boldFont: PDFFont,
    companyName: string,
    embeddedLogo?: any
  ) {
    this.doc = doc;
    this.page = page;
    this.font = font;
    this.boldFont = boldFont;
    this.companyName = companyName;
    this.embeddedLogo = embeddedLogo;
    this.y = page.getHeight() - this.margin;
  }

  drawHeader(title: string, subtitle?: string) {
    const headerHeight = this.embeddedLogo ? 120 : 100;
    
    // Background
    this.page.drawRectangle({
      x: 0,
      y: this.page.getHeight() - headerHeight,
      width: this.page.getWidth(),
      height: headerHeight,
      color: rgb(0.98, 0.98, 0.985),
    });

    const centerX = this.page.getWidth() / 2;
    let cursorY = this.page.getHeight() - 16;

    // Logo
    if (this.embeddedLogo) {
      const logoW = 56;
      const logoH = (this.embeddedLogo.height / this.embeddedLogo.width) * logoW;
      const logoX = centerX - logoW / 2;
      const logoY = this.page.getHeight() - headerHeight + headerHeight - logoH - 8;
      this.page.drawImage(this.embeddedLogo, {
        x: logoX,
        y: logoY,
        width: logoW,
        height: logoH,
      });
      cursorY = logoY - 6;
    }

    // Company name
    const companySize = 13;
    const companyWidth = this.boldFont.widthOfTextAtSize(this.companyName, companySize);
    this.page.drawText(this.companyName, {
      x: centerX - companyWidth / 2,
      y: cursorY - companySize,
      size: companySize,
      font: this.boldFont,
      color: rgb(0, 0, 0),
    });
    cursorY -= companySize + 2;

    // Title
    const titleSize = 12;
    const titleWidth = this.boldFont.widthOfTextAtSize(title, titleSize);
    this.page.drawText(title, {
      x: centerX - titleWidth / 2,
      y: cursorY - titleSize - 2,
      size: titleSize,
      font: this.boldFont,
      color: rgb(0, 0, 0),
    });
    cursorY -= titleSize + 8;

    // Subtitle
    if (subtitle) {
      const subtitleSize = 11;
      const subtitleWidth = this.font.widthOfTextAtSize(subtitle, subtitleSize);
      this.page.drawText(subtitle, {
        x: centerX - subtitleWidth / 2,
        y: cursorY - subtitleSize,
        size: subtitleSize,
        font: this.font,
        color: rgb(0.4, 0.4, 0.4),
      });
    }

    // Divider
    this.page.drawRectangle({
      x: this.margin,
      y: this.page.getHeight() - headerHeight - 1,
      width: this.page.getWidth() - this.margin * 2,
      height: 1,
      color: rgb(0.2, 0.55, 0.95),
    });

    this.y = this.page.getHeight() - headerHeight - 16;
  }

  drawFooter() {
    const footerY = 20;
    const pageText = `Page ${this.currentPageNumber}`;
    const textWidth = this.font.widthOfTextAtSize(pageText, 9);
    this.page.drawText(pageText, {
      x: this.page.getWidth() / 2 - textWidth / 2,
      y: footerY,
      size: 9,
      font: this.font,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  ensureSpace(needed: number) {
    if (this.y - needed < this.margin + 30) {
      this.page = this.doc.addPage();
      this.currentPageNumber++;
      this.y = this.page.getHeight() - this.margin;
    }
  }

  drawText(text: string, opts?: { bold?: boolean; size?: number; color?: [number, number, number] }) {
    const f = opts?.bold ? this.boldFont : this.font;
    const size = opts?.size ?? 11;
    const color = opts?.color ? rgb(opts.color[0], opts.color[1], opts.color[2]) : rgb(0, 0, 0);
    
    this.page.drawText(text ?? '', {
      x: this.margin,
      y: this.y - this.lineHeight,
      size,
      font: f,
      color,
    });
    this.y -= this.lineHeight;
  }

  drawKeyValue(label: string, value?: string, inline = false) {
    const labelText = `${label}: `;
    const labelWidth = this.boldFont.widthOfTextAtSize(labelText, 11);
    
    this.page.drawText(labelText, {
      x: this.margin,
      y: this.y - this.lineHeight,
      size: 11,
      font: this.boldFont,
      color: rgb(0, 0, 0),
    });
    
    this.page.drawText(String(value ?? ''), {
      x: this.margin + labelWidth,
      y: this.y - this.lineHeight,
      size: 11,
      font: this.font,
      color: rgb(0, 0, 0),
    });
    
    if (!inline) {
      this.y -= this.lineHeight;
    }
  }

  wrapText(text: string, maxWidth: number): string[] {
    const words = (text || '').split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let line = '';
    const effectiveWidth = maxWidth - this.margin * 2;

    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (this.font.widthOfTextAtSize(test, 11) <= effectiveWidth) {
        line = test;
      } else {
        if (line) lines.push(line);
        line = word;
      }
    }
    if (line) lines.push(line);
    return lines.length ? lines : [''];
  }

  drawWrappedText(text: string, maxWidth: number) {
    const lines = this.wrapText(text, maxWidth);
    lines.forEach((line) => {
      this.ensureSpace(this.lineHeight);
      this.page.drawText(line, {
        x: this.margin,
        y: this.y - this.lineHeight,
        size: 11,
        font: this.font,
        color: rgb(0, 0, 0),
      });
      this.y -= this.lineHeight;
    });
  }

  addSpacer(amount = 8) {
    this.y -= amount;
  }

  drawSectionTitle(title: string) {
    this.ensureSpace(30);
    
    // Background panel
    this.page.drawRectangle({
      x: this.margin - 8,
      y: this.y - this.lineHeight - 4,
      width: this.page.getWidth() - this.margin * 2 + 16,
      height: this.lineHeight + 8,
      color: rgb(0.96, 0.97, 0.99),
    });

    this.page.drawText(title, {
      x: this.margin,
      y: this.y - this.lineHeight,
      size: 12,
      font: this.boldFont,
      color: rgb(0.2, 0.55, 0.95),
    });
    
    this.y -= this.lineHeight + 8;
  }

  drawDivider() {
    this.page.drawRectangle({
      x: this.margin,
      y: this.y - 1,
      width: this.page.getWidth() - this.margin * 2,
      height: 1,
      color: rgb(0.85, 0.85, 0.85),
    });
    this.y -= 8;
  }

  drawCheckbox(label: string, checked: boolean, xOffset = 0) {
    const checkbox = checked ? '[✓]' : '[ ]';
    this.page.drawText(checkbox, {
      x: this.margin + xOffset,
      y: this.y - this.lineHeight,
      size: 11,
      font: this.font,
      color: rgb(0, 0, 0),
    });
    
    this.page.drawText(label, {
      x: this.margin + xOffset + 20,
      y: this.y - this.lineHeight,
      size: 11,
      font: this.font,
      color: rgb(0, 0, 0),
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
  const regularBytes = await fetch(DejaVuSansRegularUrl).then((r) => r.arrayBuffer());
  const boldBytes = await fetch(DejaVuSansBoldUrl).then((r) => r.arrayBuffer());
  const font = await doc.embedFont(new Uint8Array(regularBytes), { subset: true });
  const boldFont = await doc.embedFont(new Uint8Array(boldBytes), { subset: true });

  // Try to embed company logo
  let embeddedLogo: any | undefined;
  if (companySettings.logo) {
    try {
      const logoBytes = await fetch(companySettings.logo).then((r) => r.arrayBuffer());
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
  const helper = new PDFHelper(doc, page, font, boldFont, companySettings.name, embeddedLogo);

  // Draw header
  const referenceType = reference.reference_type === 'employer' ? 'Employment Reference' : 'Character Reference';
  helper.drawHeader(referenceType, `Reference for ${applicantName}`);

  // Applicant Information Section
  helper.drawSectionTitle('APPLICANT INFORMATION');
  helper.addSpacer(4);
  
  const infoPanel = {
    x: helper.margin - 4,
    y: helper.y - 60,
    width: helper.page.getWidth() - helper.margin * 2 + 8,
    height: 64,
  };
  helper.page.drawRectangle({
    ...infoPanel,
    color: rgb(0.99, 0.99, 0.995),
  });

  helper.drawKeyValue('Name', applicantName);
  helper.drawKeyValue('Date of Birth', applicantDOB);
  helper.drawKeyValue('Postcode', applicantPostcode);
  helper.addSpacer(8);

  // Referee Information Section
  helper.drawSectionTitle('REFEREE INFORMATION');
  helper.addSpacer(4);
  helper.drawKeyValue('Referee Name', reference.form_data.refereeFullName);
  if (reference.form_data.refereeJobTitle) {
    helper.drawKeyValue('Job Title', reference.form_data.refereeJobTitle);
  }
  helper.addSpacer(8);

  // Reference Type Specific Content
  if (reference.reference_type === 'employer') {
    helper.drawSectionTitle('EMPLOYMENT DETAILS');
    helper.addSpacer(4);

    // Employment Status
    helper.drawText('Are you this person\'s current or previous employer?', { bold: true });
    helper.ensureSpace(20);
    const currentChecked = reference.form_data.employmentStatus === 'current';
    const previousChecked = reference.form_data.employmentStatus === 'previous';
    const neitherChecked = reference.form_data.employmentStatus === 'neither';
    
    helper.drawCheckbox('Current', currentChecked);
    helper.y += helper.lineHeight;
    helper.drawCheckbox('Previous', previousChecked, 80);
    helper.y += helper.lineHeight;
    helper.drawCheckbox('Neither', neitherChecked, 160);
    helper.addSpacer(8);

    // Relationship Description
    helper.ensureSpace(30);
    helper.drawText('What is your relationship to this person?', { bold: true });
    helper.drawWrappedText(reference.form_data.relationshipDescription || 'Not provided', helper.page.getWidth());
    helper.addSpacer(4);

    // Job Title
    helper.ensureSpace(20);
    helper.drawKeyValue('Job Title', reference.form_data.jobTitle);
    helper.addSpacer(4);

    // Employment Dates
    if (reference.form_data.startDate && reference.form_data.endDate) {
      const startDate = new Date(reference.form_data.startDate).toLocaleDateString();
      const endDate = new Date(reference.form_data.endDate).toLocaleDateString();
      helper.drawKeyValue('Employment Period', `${startDate} to ${endDate}`);
      helper.addSpacer(4);
    }

    // Attendance
    if (reference.form_data.attendance) {
      helper.drawText('Attendance Record:', { bold: true });
      const goodChecked = reference.form_data.attendance === 'good';
      const averageChecked = reference.form_data.attendance === 'average';
      const poorChecked = reference.form_data.attendance === 'poor';
      
      helper.drawCheckbox('Good', goodChecked);
      helper.y += helper.lineHeight;
      helper.drawCheckbox('Average', averageChecked, 80);
      helper.y += helper.lineHeight;
      helper.drawCheckbox('Poor', poorChecked, 160);
      helper.addSpacer(8);
    }

    // Leaving Reason
    if (reference.form_data.leavingReason) {
      helper.ensureSpace(30);
      helper.drawText('Reason for leaving:', { bold: true });
      helper.drawWrappedText(reference.form_data.leavingReason, helper.page.getWidth());
      helper.addSpacer(8);
    }
  } else {
    // Character Reference
    helper.drawSectionTitle('CHARACTER REFERENCE DETAILS');
    helper.addSpacer(4);

    helper.drawText('Do you know this person from outside employment or education?', { bold: true });
    const yesChecked = reference.form_data.employmentStatus === 'yes';
    const noChecked = reference.form_data.employmentStatus === 'no';
    
    helper.drawCheckbox('Yes', yesChecked);
    helper.y += helper.lineHeight;
    helper.drawCheckbox('No', noChecked, 80);
    helper.addSpacer(8);

    helper.ensureSpace(30);
    helper.drawText('Relationship description:', { bold: true });
    helper.drawWrappedText(reference.form_data.relationshipDescription || 'Not provided', helper.page.getWidth());
    helper.addSpacer(8);
  }

  // Character Qualities
  helper.drawSectionTitle('CHARACTER QUALITIES');
  helper.addSpacer(4);
  helper.drawText('Which of the following describes this person?', { bold: true });
  helper.addSpacer(4);

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

  qualities.forEach((quality) => {
    helper.ensureSpace(20);
    const checked = reference.form_data[quality.key as keyof ReferenceData] as boolean;
    helper.drawCheckbox(quality.label, checked);
    helper.y -= helper.lineHeight;
  });

  helper.addSpacer(8);

  if (reference.form_data.qualitiesNotTickedReason) {
    helper.ensureSpace(30);
    helper.drawText('If any qualities were not selected, reason:', { bold: true });
    helper.drawWrappedText(reference.form_data.qualitiesNotTickedReason, helper.page.getWidth());
    helper.addSpacer(8);
  }

  // Criminal Background Check
  helper.drawSectionTitle('CRIMINAL BACKGROUND CHECK');
  helper.addSpacer(4);
  
  // Warning background
  helper.page.drawRectangle({
    x: helper.margin - 4,
    y: helper.y - 100,
    width: helper.page.getWidth() - helper.margin * 2 + 8,
    height: 104,
    color: rgb(1, 0.98, 0.95),
  });

  helper.drawText('Are you aware of any convictions, cautions, reprimands or final warnings?', { bold: true, size: 10 });
  helper.addSpacer(4);
  
  if (reference.form_data.convictionsKnown) {
    const yesChecked = reference.form_data.convictionsKnown === 'yes';
    const noChecked = reference.form_data.convictionsKnown === 'no';
    helper.drawCheckbox('Yes', yesChecked);
    helper.y += helper.lineHeight;
    helper.drawCheckbox('No', noChecked, 80);
    helper.addSpacer(8);
  }

  helper.drawText('Is this person the subject of any criminal proceedings?', { bold: true, size: 10 });
  helper.addSpacer(4);
  
  if (reference.form_data.criminalProceedingsKnown) {
    const yesChecked = reference.form_data.criminalProceedingsKnown === 'yes';
    const noChecked = reference.form_data.criminalProceedingsKnown === 'no';
    helper.drawCheckbox('Yes', yesChecked);
    helper.y += helper.lineHeight;
    helper.drawCheckbox('No', noChecked, 80);
    helper.addSpacer(12);
  }

  if (reference.form_data.criminalDetails) {
    helper.ensureSpace(30);
    helper.drawText('Details:', { bold: true });
    helper.drawWrappedText(reference.form_data.criminalDetails, helper.page.getWidth());
    helper.addSpacer(8);
  }

  // Additional Comments
  if (reference.form_data.additionalComments) {
    helper.drawSectionTitle('ADDITIONAL COMMENTS');
    helper.addSpacer(4);
    helper.drawWrappedText(reference.form_data.additionalComments, helper.page.getWidth());
    helper.addSpacer(8);
  }

  // Declaration
  helper.drawSectionTitle('DECLARATION');
  helper.addSpacer(4);
  const declarationText = 'I certify that, to the best of my knowledge, the information I have given is true and complete. I understand that any deliberate omission, falsification or misrepresentation may lead to refusal of appointment or dismissal.';
  helper.drawWrappedText(declarationText, helper.page.getWidth());
  helper.addSpacer(12);

  // Reference Metadata
  helper.drawSectionTitle('REFERENCE METADATA');
  helper.addSpacer(4);
  helper.drawKeyValue('Reference Created', new Date(reference.created_at).toLocaleDateString());
  helper.drawKeyValue('Reference Sent', new Date(reference.sent_at).toLocaleDateString());
  helper.drawKeyValue('Reference Completed', new Date(reference.completed_at).toLocaleDateString());

  // Add footers to all pages
  const pages = doc.getPages();
  helper.totalPages = pages.length;
  pages.forEach((p, index) => {
    helper.page = p;
    helper.currentPageNumber = index + 1;
    helper.drawFooter();
  });

  return doc;
};

export const generateManualReferencePDF = async (
  data: ManualReferenceInput,
  companySettings: CompanySettings = { name: 'Company Name' }
) => {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  // Load fonts
  const regularBytes = await fetch(DejaVuSansRegularUrl).then((r) => r.arrayBuffer());
  const boldBytes = await fetch(DejaVuSansBoldUrl).then((r) => r.arrayBuffer());
  const font = await doc.embedFont(new Uint8Array(regularBytes), { subset: true });
  const boldFont = await doc.embedFont(new Uint8Array(boldBytes), { subset: true });

  // Try to embed company logo
  let embeddedLogo: any | undefined;
  if (companySettings.logo) {
    try {
      const logoBytes = await fetch(companySettings.logo).then((r) => r.arrayBuffer());
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
  const helper = new PDFHelper(doc, page, font, boldFont, companySettings.name, embeddedLogo);

  // Draw header
  const referenceType = data.referenceType === 'employer' ? 'Employment Reference' : 'Character Reference';
  const refNumber = data.referenceNumber ? ` #${data.referenceNumber}` : '';
  helper.drawHeader(referenceType + refNumber, `Reference for ${data.applicantName}`);

  // Applicant Information Section
  helper.drawSectionTitle('APPLICANT INFORMATION');
  helper.addSpacer(4);
  
  const infoPanel = {
    x: helper.margin - 4,
    y: helper.y - 60,
    width: helper.page.getWidth() - helper.margin * 2 + 8,
    height: 64,
  };
  helper.page.drawRectangle({
    ...infoPanel,
    color: rgb(0.99, 0.99, 0.995),
  });

  helper.drawKeyValue('Name', data.applicantName);
  if (data.applicantDOB) helper.drawKeyValue('Date of Birth', data.applicantDOB);
  if (data.applicantPostcode) helper.drawKeyValue('Postcode', data.applicantPostcode);
  if (data.applicantPosition) helper.drawKeyValue('Position Applied For', data.applicantPosition);
  helper.addSpacer(8);

  // Referee Information Section
  helper.drawSectionTitle('REFEREE INFORMATION');
  helper.addSpacer(4);
  if (data.referee.name) helper.drawKeyValue('Name', data.referee.name);
  if (data.referee.company) helper.drawKeyValue('Company', data.referee.company);
  if (data.referee.jobTitle) helper.drawKeyValue('Job Title', data.referee.jobTitle);
  if (data.referee.email) helper.drawKeyValue('Email', data.referee.email);
  if (data.referee.phone) helper.drawKeyValue('Phone', data.referee.phone);
  if (data.referee.address) helper.drawKeyValue('Address', data.referee.address);
  if (data.referee.town) helper.drawKeyValue('Town', data.referee.town);
  if (data.referee.postcode) helper.drawKeyValue('Postcode', data.referee.postcode);
  helper.addSpacer(8);

  // Reference Type Specific Content
  if (data.referenceType === 'employer') {
    helper.drawSectionTitle('EMPLOYMENT DETAILS');
    helper.addSpacer(4);

    helper.drawText('Are you this person\'s current or previous employer?', { bold: true });
    helper.addSpacer(2);
    helper.drawCheckbox('Current', data.employmentStatus === 'current');
    helper.y += helper.lineHeight;
    helper.drawCheckbox('Previous', data.employmentStatus === 'previous', 80);
    helper.y += helper.lineHeight;
    helper.drawCheckbox('Neither', data.employmentStatus === 'neither', 160);
    helper.addSpacer(8);

    helper.drawText('What is your relationship to this person?', { bold: true });
    helper.drawText('_____________________________________________________________________');
    helper.addSpacer(8);

    helper.drawKeyValue('Job Title', '___________________________________');
    helper.addSpacer(4);

    if (data.employmentFrom && data.employmentTo) {
      helper.drawKeyValue('Employment Period', `${data.employmentFrom} to ${data.employmentTo}`);
    } else {
      helper.drawText('Employment Period:', { bold: true });
      helper.drawText('From: ________________  To: ________________');
    }
    helper.addSpacer(8);

    helper.drawText('Attendance Record:', { bold: true });
    helper.drawCheckbox('Good', false);
    helper.y += helper.lineHeight;
    helper.drawCheckbox('Average', false, 80);
    helper.y += helper.lineHeight;
    helper.drawCheckbox('Poor', false, 160);
    helper.addSpacer(8);

    helper.drawText('Reason for leaving:', { bold: true });
    if (data.reasonForLeaving) {
      helper.drawWrappedText(data.reasonForLeaving, helper.page.getWidth());
    } else {
      helper.drawText('_____________________________________________________________________');
      helper.drawText('_____________________________________________________________________');
    }
    helper.addSpacer(8);
  } else {
    helper.drawSectionTitle('CHARACTER REFERENCE DETAILS');
    helper.addSpacer(4);

    helper.drawText('Do you know this person from outside employment or education?', { bold: true });
    helper.drawCheckbox('Yes', false);
    helper.y += helper.lineHeight;
    helper.drawCheckbox('No', false, 80);
    helper.addSpacer(8);

    helper.drawText('Please describe your relationship:', { bold: true });
    helper.drawText('_____________________________________________________________________');
    helper.drawText('_____________________________________________________________________');
    helper.addSpacer(8);
  }

  // Character Qualities
  helper.drawSectionTitle('CHARACTER QUALITIES');
  helper.addSpacer(4);
  helper.drawText('Which of the following describes this person? (tick each that is true)', { bold: true });
  helper.addSpacer(4);

  const qualities = [
    'Honest and trustworthy',
    'Communicates effectively',
    'An effective team member',
    'Respectful of confidentiality',
    'Reliable and punctual',
    'Suitable for the position applied for',
    'Kind and compassionate',
    'Able to work well without close supervision',
  ];

  qualities.forEach((quality) => {
    helper.ensureSpace(20);
    helper.drawCheckbox(quality, false);
    helper.y -= helper.lineHeight;
  });

  helper.addSpacer(8);
  helper.drawText('If any qualities were not selected, please explain why:', { bold: true });
  helper.drawText('_____________________________________________________________________');
  helper.drawText('_____________________________________________________________________');
  helper.addSpacer(8);

  // Criminal Background Check
  helper.drawSectionTitle('CRIMINAL BACKGROUND CHECK');
  helper.addSpacer(4);
  
  // Warning background
  helper.page.drawRectangle({
    x: helper.margin - 4,
    y: helper.y - 110,
    width: helper.page.getWidth() - helper.margin * 2 + 8,
    height: 114,
    color: rgb(1, 0.98, 0.95),
  });

  helper.drawText('Are you aware of any convictions, cautions, reprimands or final warnings?', { bold: true, size: 10 });
  helper.drawCheckbox('Yes', false);
  helper.y += helper.lineHeight;
  helper.drawCheckbox('No', false, 80);
  helper.addSpacer(8);

  helper.drawText('Is this person the subject of any criminal proceedings?', { bold: true, size: 10 });
  helper.drawCheckbox('Yes', false);
  helper.y += helper.lineHeight;
  helper.drawCheckbox('No', false, 80);
  helper.addSpacer(8);

  helper.drawText('If yes to either, please provide details:', { bold: true });
  helper.drawText('_____________________________________________________________________');
  helper.drawText('_____________________________________________________________________');
  helper.addSpacer(8);

  // Additional Comments
  helper.drawSectionTitle('ADDITIONAL COMMENTS');
  helper.addSpacer(4);
  helper.drawText('Any additional comments you would like to make:');
  helper.drawText('_____________________________________________________________________');
  helper.drawText('_____________________________________________________________________');
  helper.drawText('_____________________________________________________________________');
  helper.addSpacer(8);

  // Declaration
  helper.drawSectionTitle('DECLARATION');
  helper.addSpacer(4);
  const declarationText = 'I certify that, to the best of my knowledge, the information I have given is true and complete. I understand that any deliberate omission, falsification or misrepresentation may lead to refusal of appointment or dismissal.';
  helper.drawWrappedText(declarationText, helper.page.getWidth());
  helper.addSpacer(12);

  helper.drawText('Signature: _______________________________   Date: _______________');
  helper.addSpacer(8);

  // Add footers to all pages
  const pages = doc.getPages();
  helper.totalPages = pages.length;
  pages.forEach((p, index) => {
    helper.page = p;
    helper.currentPageNumber = index + 1;
    helper.drawFooter();
  });

  return doc;
};
