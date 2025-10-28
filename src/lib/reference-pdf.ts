import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

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

// Modern color palette
const colors = {
  primary: rgb(0.2, 0.4, 0.8), // Blue
  primaryDark: rgb(0.1, 0.2, 0.5),
  secondary: rgb(0.95, 0.97, 1), // Light blue
  accent: rgb(0.13, 0.7, 0.4), // Green
  warning: rgb(0.96, 0.8, 0.2), // Yellow/orange
  danger: rgb(0.9, 0.2, 0.2), // Red
  text: rgb(0.1, 0.1, 0.1), // Dark gray
  textLight: rgb(0.4, 0.4, 0.4), // Light gray
  border: rgb(0.85, 0.87, 0.9),
  white: rgb(1, 1, 1),
};

interface WriterContext {
  doc: PDFDocument;
  page: any;
  font: any;
  boldFont: any;
  y: number;
  margin: number;
  pageWidth: number;
  pageHeight: number;
  lineHeight: number;
  fontSize: number;
}

function addPage(ctx: WriterContext) {
  ctx.page = ctx.doc.addPage();
  ctx.y = ctx.page.getHeight() - ctx.margin;
  ctx.pageWidth = ctx.page.getWidth();
  ctx.pageHeight = ctx.page.getHeight();
}

function ensureSpace(ctx: WriterContext, needed: number) {
  if (ctx.y - needed < ctx.margin + 20) {
    addPage(ctx);
  }
}

function drawSectionBackground(ctx: WriterContext, height: number, color: any) {
  ctx.page.drawRectangle({
    x: ctx.margin,
    y: ctx.y - height,
    width: ctx.pageWidth - ctx.margin * 2,
    height: height,
    color: color,
  });
}

function drawText(ctx: WriterContext, text: string, x: number, y: number, options?: { 
  bold?: boolean; 
  size?: number; 
  color?: any;
  maxWidth?: number;
}) {
  const font = options?.bold ? ctx.boldFont : ctx.font;
  const size = options?.size ?? ctx.fontSize;
  const color = options?.color ?? colors.text;
  const maxWidth = options?.maxWidth ?? (ctx.pageWidth - ctx.margin * 2);

  const words = text.split(/\s+/);
  let line = '';
  const lines: string[] = [];

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, size);
    if (width > maxWidth) {
      if (line) lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  }
  if (line) lines.push(line);

  let currentY = y;
  for (const l of lines) {
    ctx.page.drawText(l, {
      x,
      y: currentY,
      size,
      font,
      color,
    });
    currentY -= ctx.lineHeight;
  }

  return currentY;
}

function drawHeaderBanner(ctx: WriterContext, companyName: string, documentTitle: string, companyLogo?: string) {
  const bannerHeight = 80;
  
  // Draw gradient effect (simulated with two rectangles)
  ctx.page.drawRectangle({
    x: 0,
    y: ctx.pageHeight - bannerHeight,
    width: ctx.pageWidth,
    height: bannerHeight,
    color: colors.primary,
  });

  // Company name in white
  const companyNameSize = 16;
  const companyNameWidth = ctx.boldFont.widthOfTextAtSize(companyName, companyNameSize);
  ctx.page.drawText(companyName, {
    x: (ctx.pageWidth - companyNameWidth) / 2,
    y: ctx.pageHeight - 35,
    size: companyNameSize,
    font: ctx.boldFont,
    color: colors.white,
  });

  // Document title in white
  const titleSize = 14;
  const titleWidth = ctx.font.widthOfTextAtSize(documentTitle, titleSize);
  ctx.page.drawText(documentTitle, {
    x: (ctx.pageWidth - titleWidth) / 2,
    y: ctx.pageHeight - 55,
    size: titleSize,
    font: ctx.font,
    color: colors.white,
  });

  ctx.y = ctx.pageHeight - bannerHeight - 20;
}

function drawInfoCard(ctx: WriterContext, label: string, value: string, x: number, width: number) {
  const cardHeight = 30;
  const startY = ctx.y;

  // Card background
  ctx.page.drawRectangle({
    x,
    y: startY - cardHeight,
    width,
    height: cardHeight,
    color: colors.secondary,
    borderColor: colors.border,
    borderWidth: 1,
  });

  // Label (small, gray)
  ctx.page.drawText(label, {
    x: x + 8,
    y: startY - 12,
    size: 9,
    font: ctx.font,
    color: colors.textLight,
  });

  // Value (larger, blue)
  ctx.page.drawText(value, {
    x: x + 8,
    y: startY - 24,
    size: 11,
    font: ctx.boldFont,
    color: colors.primary,
  });
}

function drawSectionTitle(ctx: WriterContext, title: string) {
  ensureSpace(ctx, 30);
  
  ctx.page.drawText(title, {
    x: ctx.margin,
    y: ctx.y,
    size: 14,
    font: ctx.boldFont,
    color: colors.primary,
  });
  
  ctx.y -= 5;
  
  // Horizontal divider
  ctx.page.drawRectangle({
    x: ctx.margin,
    y: ctx.y - 2,
    width: ctx.pageWidth - ctx.margin * 2,
    height: 2,
    color: colors.primary,
  });
  
  ctx.y -= 12;
}

function drawCheckbox(ctx: WriterContext, x: number, y: number, checked: boolean) {
  const size = 10;
  
  if (checked) {
    // Green checkmark
    ctx.page.drawText('✓', {
      x,
      y: y - size + 2,
      size: size + 4,
      font: ctx.boldFont,
      color: colors.accent,
    });
  } else {
    // Light gray circle
    ctx.page.drawText('○', {
      x,
      y: y - size + 2,
      size: size + 2,
      font: ctx.font,
      color: colors.textLight,
    });
  }
}

function drawBadge(ctx: WriterContext, text: string, x: number, y: number, color: any) {
  const padding = 6;
  const width = ctx.boldFont.widthOfTextAtSize(text, 9) + padding * 2;
  const height = 16;

  ctx.page.drawRectangle({
    x,
    y: y - height,
    width,
    height,
    color,
  });

  ctx.page.drawText(text, {
    x: x + padding,
    y: y - height + 4,
    size: 9,
    font: ctx.boldFont,
    color: colors.white,
  });
}

function drawKeyValue(ctx: WriterContext, label: string, value: string, options?: { indent?: boolean }) {
  ensureSpace(ctx, ctx.lineHeight * 2);
  
  const indent = options?.indent ? 15 : 0;
  const labelText = `${label}:`;
  const labelWidth = ctx.boldFont.widthOfTextAtSize(labelText, ctx.fontSize);
  
  // Draw label
  ctx.page.drawText(labelText, {
    x: ctx.margin + indent,
    y: ctx.y,
    size: ctx.fontSize,
    font: ctx.boldFont,
    color: colors.text,
  });
  
  // Draw value (wrapping if needed)
  const valueX = ctx.margin + indent + labelWidth + 5;
  const maxWidth = ctx.pageWidth - ctx.margin - valueX;
  ctx.y = drawText(ctx, value, valueX, ctx.y, { 
    color: colors.primary,
    maxWidth 
  });
  
  ctx.y -= 5;
}

export const generateReferencePDF = async (
  reference: CompletedReference,
  applicantName: string,
  applicantDOB: string,
  applicantPostcode: string,
  companySettings: CompanySettings = { name: 'Company Name' }
) => {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

  const ctx: WriterContext = {
    doc,
    page: doc.addPage(),
    font,
    boldFont,
    y: 0,
    margin: 40,
    pageWidth: 0,
    pageHeight: 0,
    lineHeight: 14,
    fontSize: 11,
  };

  ctx.pageWidth = ctx.page.getWidth();
  ctx.pageHeight = ctx.page.getHeight();
  ctx.y = ctx.pageHeight - ctx.margin;

  // Header Banner
  const referenceType = reference.reference_type === 'employer' 
    ? 'EMPLOYMENT REFERENCE' 
    : 'CHARACTER REFERENCE';
  drawHeaderBanner(ctx, companySettings.name, referenceType, companySettings.logo);

  // Applicant Info Cards (3 columns)
  const cardWidth = (ctx.pageWidth - ctx.margin * 2 - 20) / 3;
  drawInfoCard(ctx, 'Applicant Name', applicantName, ctx.margin, cardWidth);
  drawInfoCard(ctx, 'Date of Birth', applicantDOB, ctx.margin + cardWidth + 10, cardWidth);
  drawInfoCard(ctx, 'Postcode', applicantPostcode, ctx.margin + (cardWidth + 10) * 2, cardWidth);
  ctx.y -= 40;

  // Referee Information Section
  drawSectionTitle(ctx, 'Referee Information');
  ensureSpace(ctx, 40);
  
  const sectionStartY = ctx.y + 5;
  drawSectionBackground(ctx, 40, colors.secondary);
  ctx.y = sectionStartY - 10;
  
  drawKeyValue(ctx, 'Referee Name', reference.form_data.refereeFullName || 'Not provided', { indent: true });
  if (reference.form_data.refereeJobTitle) {
    drawKeyValue(ctx, 'Job Title', reference.form_data.refereeJobTitle, { indent: true });
  }
  ctx.y -= 10;

  // Reference Type Specific Content
  if (reference.reference_type === 'employer') {
    drawSectionTitle(ctx, 'Employment Details');
    ensureSpace(ctx, 100);

    // Employment Status with badge
    ctx.page.drawText('Employment Status:', {
      x: ctx.margin,
      y: ctx.y,
      size: ctx.fontSize,
      font: ctx.boldFont,
      color: colors.text,
    });
    
    const status = reference.form_data.employmentStatus;
    if (status === 'current') {
      drawBadge(ctx, 'CURRENT', ctx.margin + 130, ctx.y + 5, colors.accent);
    } else if (status === 'previous') {
      drawBadge(ctx, 'PREVIOUS', ctx.margin + 130, ctx.y + 5, rgb(0.9, 0.6, 0.2));
    } else {
      drawBadge(ctx, 'NEITHER', ctx.margin + 130, ctx.y + 5, colors.textLight);
    }
    ctx.y -= 20;

    // Relationship
    ensureSpace(ctx, 40);
    ctx.page.drawText('Relationship to Applicant:', {
      x: ctx.margin,
      y: ctx.y,
      size: ctx.fontSize,
      font: ctx.boldFont,
      color: colors.text,
    });
    ctx.y -= ctx.lineHeight;
    ctx.y = drawText(ctx, reference.form_data.relationshipDescription || 'Not provided', ctx.margin, ctx.y, {
      color: colors.primary
    });
    ctx.y -= 10;

    // Job Title
    drawKeyValue(ctx, 'Job Title', reference.form_data.jobTitle || 'Not provided');

    // Employment Period
    if (reference.form_data.startDate || reference.form_data.endDate) {
      const startDate = reference.form_data.startDate ? new Date(reference.form_data.startDate).toLocaleDateString() : 'Not provided';
      const endDate = reference.form_data.endDate ? new Date(reference.form_data.endDate).toLocaleDateString() : 'Not provided';
      drawKeyValue(ctx, 'Employment Period', `From ${startDate} to ${endDate}`);
    }

    // Attendance with color coding
    if (reference.form_data.attendance) {
      ensureSpace(ctx, 20);
      ctx.page.drawText('Attendance Record:', {
        x: ctx.margin,
        y: ctx.y,
        size: ctx.fontSize,
        font: ctx.boldFont,
        color: colors.text,
      });
      
      const attendance = reference.form_data.attendance;
      let attendanceColor = colors.accent;
      let attendanceText = attendance.toUpperCase();
      
      if (attendance === 'good') {
        attendanceColor = colors.accent;
      } else if (attendance === 'average') {
        attendanceColor = rgb(0.9, 0.6, 0.2);
      } else if (attendance === 'poor') {
        attendanceColor = colors.danger;
      }
      
      drawBadge(ctx, attendanceText, ctx.margin + 130, ctx.y + 5, attendanceColor);
      ctx.y -= 20;
    }

    // Leaving Reason
    if (reference.form_data.leavingReason) {
      ensureSpace(ctx, 40);
      ctx.page.drawText('Reason for Leaving:', {
        x: ctx.margin,
        y: ctx.y,
        size: ctx.fontSize,
        font: ctx.boldFont,
        color: colors.text,
      });
      ctx.y -= ctx.lineHeight;
      ctx.y = drawText(ctx, reference.form_data.leavingReason, ctx.margin, ctx.y, {
        color: colors.primary
      });
      ctx.y -= 10;
    }
  } else {
    // Character Reference
    drawSectionTitle(ctx, 'Character Reference Details');
    ensureSpace(ctx, 40);

    ctx.page.drawText('Relationship Description:', {
      x: ctx.margin,
      y: ctx.y,
      size: ctx.fontSize,
      font: ctx.boldFont,
      color: colors.text,
    });
    ctx.y -= ctx.lineHeight;
    ctx.y = drawText(ctx, reference.form_data.relationshipDescription || 'Not provided', ctx.margin, ctx.y, {
      color: colors.primary
    });
    ctx.y -= 10;
  }

  // Character Qualities Section
  drawSectionTitle(ctx, 'Character Assessment');
  ensureSpace(ctx, 120);

  ctx.page.drawText('Which qualities describe this person?', {
    x: ctx.margin,
    y: ctx.y,
    size: ctx.fontSize,
    font: ctx.font,
    color: colors.textLight,
  });
  ctx.y -= 15;

  const qualities = [
    { key: 'honestTrustworthy', label: 'Honest and trustworthy' },
    { key: 'communicatesEffectively', label: 'Communicates effectively' },
    { key: 'effectiveTeamMember', label: 'Effective team member' },
    { key: 'respectfulConfidentiality', label: 'Respectful of confidentiality' },
    { key: 'reliablePunctual', label: 'Reliable and punctual' },
    { key: 'suitablePosition', label: 'Suitable for position' },
    { key: 'kindCompassionate', label: 'Kind and compassionate' },
    { key: 'worksIndependently', label: 'Works independently' },
  ];

  // Display in 2 columns with visual checkboxes
  const columnWidth = (ctx.pageWidth - ctx.margin * 2) / 2;
  for (let i = 0; i < qualities.length; i += 2) {
    ensureSpace(ctx, 18);
    
    // Left column
    const leftQuality = qualities[i];
    const leftChecked = reference.form_data[leftQuality.key as keyof ReferenceData];
    drawCheckbox(ctx, ctx.margin, ctx.y, !!leftChecked);
    ctx.page.drawText(leftQuality.label, {
      x: ctx.margin + 18,
      y: ctx.y - 10,
      size: ctx.fontSize,
      font: ctx.font,
      color: leftChecked ? colors.text : colors.textLight,
    });
    
    // Right column
    if (i + 1 < qualities.length) {
      const rightQuality = qualities[i + 1];
      const rightChecked = reference.form_data[rightQuality.key as keyof ReferenceData];
      const rightX = ctx.margin + columnWidth;
      drawCheckbox(ctx, rightX, ctx.y, !!rightChecked);
      ctx.page.drawText(rightQuality.label, {
        x: rightX + 18,
        y: ctx.y - 10,
        size: ctx.fontSize,
        font: ctx.font,
        color: rightChecked ? colors.text : colors.textLight,
      });
    }
    
    ctx.y -= 18;
  }

  // Qualities not ticked reason
  if (reference.form_data.qualitiesNotTickedReason) {
    ctx.y -= 5;
    ensureSpace(ctx, 40);
    ctx.page.drawText('Explanation for unticked qualities:', {
      x: ctx.margin,
      y: ctx.y,
      size: ctx.fontSize,
      font: ctx.boldFont,
      color: colors.text,
    });
    ctx.y -= ctx.lineHeight;
    ctx.y = drawText(ctx, reference.form_data.qualitiesNotTickedReason, ctx.margin, ctx.y, {
      color: colors.primary
    });
    ctx.y -= 10;
  }

  // Criminal Background Section - CRITICAL with warning styling
  drawSectionTitle(ctx, '⚠️ CRIMINAL BACKGROUND CHECK');
  ensureSpace(ctx, 100);
  
  const criminalSectionHeight = 100;
  const criminalStartY = ctx.y + 5;
  
  // Warning background
  ctx.page.drawRectangle({
    x: ctx.margin,
    y: criminalStartY - criminalSectionHeight,
    width: ctx.pageWidth - ctx.margin * 2,
    height: criminalSectionHeight,
    color: rgb(1, 0.98, 0.9),
    borderColor: colors.warning,
    borderWidth: 2,
  });
  
  ctx.y = criminalStartY - 15;

  // Question 1
  ctx.page.drawText('Known convictions, cautions, or warnings:', {
    x: ctx.margin + 10,
    y: ctx.y,
    size: 10,
    font: ctx.boldFont,
    color: colors.text,
  });
  ctx.y -= 15;
  
  const convictions = reference.form_data.convictionsKnown;
  ctx.page.drawText(convictions === 'yes' ? '● YES' : '○ NO', {
    x: ctx.margin + 15,
    y: ctx.y,
    size: 11,
    font: ctx.boldFont,
    color: convictions === 'yes' ? colors.danger : colors.accent,
  });
  ctx.y -= 20;

  // Question 2
  ctx.page.drawText('Currently subject to criminal proceedings:', {
    x: ctx.margin + 10,
    y: ctx.y,
    size: 10,
    font: ctx.boldFont,
    color: colors.text,
  });
  ctx.y -= 15;
  
  const proceedings = reference.form_data.criminalProceedingsKnown;
  ctx.page.drawText(proceedings === 'yes' ? '● YES' : '○ NO', {
    x: ctx.margin + 15,
    y: ctx.y,
    size: 11,
    font: ctx.boldFont,
    color: proceedings === 'yes' ? colors.danger : colors.accent,
  });
  ctx.y -= 25;

  // Criminal details if provided
  if (reference.form_data.criminalDetails) {
    ensureSpace(ctx, 40);
    ctx.page.drawText('Details:', {
      x: ctx.margin,
      y: ctx.y,
      size: ctx.fontSize,
      font: ctx.boldFont,
      color: colors.text,
    });
    ctx.y -= ctx.lineHeight;
    ctx.y = drawText(ctx, reference.form_data.criminalDetails, ctx.margin + 10, ctx.y, {
      color: colors.danger,
      size: 10
    });
    ctx.y -= 10;
  }

  // Additional Comments
  if (reference.form_data.additionalComments) {
    drawSectionTitle(ctx, 'Additional Comments');
    ensureSpace(ctx, 60);
    
    // Quote-style box
    const commentHeight = 50;
    const commentStartY = ctx.y + 5;
    ctx.page.drawRectangle({
      x: ctx.margin + 5,
      y: commentStartY - commentHeight,
      width: 3,
      height: commentHeight,
      color: colors.primary,
    });
    
    ctx.y = commentStartY - 10;
    ctx.y = drawText(ctx, reference.form_data.additionalComments, ctx.margin + 15, ctx.y, {
      color: colors.text,
      size: 10
    });
    ctx.y -= 15;
  }

  // Declaration
  drawSectionTitle(ctx, 'Declaration');
  ensureSpace(ctx, 60);
  
  const declStartY = ctx.y + 5;
  ctx.page.drawRectangle({
    x: ctx.margin,
    y: declStartY - 50,
    width: ctx.pageWidth - ctx.margin * 2,
    height: 50,
    color: rgb(0.97, 0.97, 0.97),
  });
  
  ctx.y = declStartY - 12;
  const declarationText = 'I certify that, to the best of my knowledge, the information I have given is true and complete. I understand that any deliberate omission, falsification or misrepresentation may lead to refusal of appointment or dismissal.';
  ctx.y = drawText(ctx, declarationText, ctx.margin + 10, ctx.y, {
    color: colors.textLight,
    size: 9
  });
  ctx.y -= 15;

  // Footer Metadata
  ensureSpace(ctx, 80);
  ctx.y -= 10;
  
  const footerStartY = ctx.y + 5;
  ctx.page.drawRectangle({
    x: ctx.margin,
    y: footerStartY - 70,
    width: ctx.pageWidth - ctx.margin * 2,
    height: 70,
    color: rgb(0.96, 0.96, 0.96),
  });
  
  ctx.y = footerStartY - 15;
  
  ctx.page.drawText('Reference Information', {
    x: ctx.margin + 10,
    y: ctx.y,
    size: 10,
    font: ctx.boldFont,
    color: colors.textLight,
  });
  ctx.y -= 15;
  
  const metaFontSize = 9;
  ctx.page.drawText(`Created: ${new Date(reference.created_at).toLocaleDateString()}`, {
    x: ctx.margin + 10,
    y: ctx.y,
    size: metaFontSize,
    font: ctx.font,
    color: colors.textLight,
  });
  ctx.y -= 12;
  
  ctx.page.drawText(`Sent: ${new Date(reference.sent_at).toLocaleDateString()}`, {
    x: ctx.margin + 10,
    y: ctx.y,
    size: metaFontSize,
    font: ctx.font,
    color: colors.textLight,
  });
  ctx.y -= 12;
  
  ctx.page.drawText(`Completed: ${new Date(reference.completed_at).toLocaleDateString()}`, {
    x: ctx.margin + 10,
    y: ctx.y,
    size: metaFontSize,
    font: ctx.font,
    color: colors.textLight,
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
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

  const ctx: WriterContext = {
    doc,
    page: doc.addPage(),
    font,
    boldFont,
    y: 0,
    margin: 40,
    pageWidth: 0,
    pageHeight: 0,
    lineHeight: 14,
    fontSize: 11,
  };

  ctx.pageWidth = ctx.page.getWidth();
  ctx.pageHeight = ctx.page.getHeight();
  ctx.y = ctx.pageHeight - ctx.margin;

  // Header Banner
  const referenceType = data.referenceType === 'employer' 
    ? 'EMPLOYMENT REFERENCE REQUEST' 
    : 'CHARACTER REFERENCE REQUEST';
  drawHeaderBanner(ctx, companySettings.name, referenceType, companySettings.logo);

  // Applicant Info
  const cardWidth = (ctx.pageWidth - ctx.margin * 2 - 20) / 3;
  drawInfoCard(ctx, 'Applicant Name', data.applicantName, ctx.margin, cardWidth);
  drawInfoCard(ctx, 'Date of Birth', data.applicantDOB || 'Not provided', ctx.margin + cardWidth + 10, cardWidth);
  drawInfoCard(ctx, 'Postcode', data.applicantPostcode || 'Not provided', ctx.margin + (cardWidth + 10) * 2, cardWidth);
  ctx.y -= 40;

  if (data.applicantPosition) {
    drawKeyValue(ctx, 'Position Applied For', data.applicantPosition);
  }

  // Referee Information
  drawSectionTitle(ctx, 'Referee Details');
  ensureSpace(ctx, 100);
  
  const sectionStartY = ctx.y + 5;
  drawSectionBackground(ctx, 100, colors.secondary);
  ctx.y = sectionStartY - 10;

  if (data.referee.name) {
    drawKeyValue(ctx, 'Referee Name', data.referee.name, { indent: true });
  }
  if (data.referee.company) {
    drawKeyValue(ctx, 'Company', data.referee.company, { indent: true });
  }
  if (data.referee.jobTitle) {
    drawKeyValue(ctx, 'Job Title', data.referee.jobTitle, { indent: true });
  }
  if (data.referee.email) {
    drawKeyValue(ctx, 'Email', data.referee.email, { indent: true });
  }
  if (data.referee.phone) {
    drawKeyValue(ctx, 'Phone', data.referee.phone, { indent: true });
  }
  
  ctx.y -= 10;

  // Employment Details (if employer reference)
  if (data.referenceType === 'employer') {
    drawSectionTitle(ctx, 'Employment Information');
    ensureSpace(ctx, 60);

    if (data.employmentStatus) {
      ctx.page.drawText('Employment Status:', {
        x: ctx.margin,
        y: ctx.y,
        size: ctx.fontSize,
        font: ctx.boldFont,
        color: colors.text,
      });
      
      if (data.employmentStatus === 'current') {
        drawBadge(ctx, 'CURRENT', ctx.margin + 130, ctx.y + 5, colors.accent);
      } else if (data.employmentStatus === 'previous') {
        drawBadge(ctx, 'PREVIOUS', ctx.margin + 130, ctx.y + 5, rgb(0.9, 0.6, 0.2));
      }
      ctx.y -= 20;
    }

    if (data.employmentFrom || data.employmentTo) {
      const from = data.employmentFrom || 'Not specified';
      const to = data.employmentTo || 'Present';
      drawKeyValue(ctx, 'Employment Period', `${from} to ${to}`);
    }

    if (data.reasonForLeaving) {
      ensureSpace(ctx, 40);
      ctx.page.drawText('Reason for Leaving:', {
        x: ctx.margin,
        y: ctx.y,
        size: ctx.fontSize,
        font: ctx.boldFont,
        color: colors.text,
      });
      ctx.y -= ctx.lineHeight;
      ctx.y = drawText(ctx, data.reasonForLeaving, ctx.margin, ctx.y, {
        color: colors.primary
      });
      ctx.y -= 10;
    }
  }

  // Instructions Section
  drawSectionTitle(ctx, 'Instructions');
  ensureSpace(ctx, 60);
  
  const instructionText = 'This reference request has been generated for completion. Please provide honest and accurate information about the applicant. Your response will be treated with confidentiality and will help inform our hiring decision.';
  ctx.y = drawText(ctx, instructionText, ctx.margin, ctx.y, {
    color: colors.textLight,
    size: 10
  });

  return doc;
};
