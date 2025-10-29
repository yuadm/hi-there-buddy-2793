import jsPDF from 'jspdf';

// Modern color palette (RGB for jsPDF)
const COLORS = {
  primary: { r: 59, g: 130, b: 246 },      // Blue
  success: { r: 34, g: 197, b: 94 },       // Green
  warning: { r: 239, g: 68, b: 68 },       // Red
  neutral: { r: 107, g: 114, b: 128 },     // Gray
  lightBg: { r: 249, g: 250, b: 251 },     // Light gray
  darkText: { r: 17, g: 24, b: 39 },       // Dark
  accent: { r: 99, g: 102, b: 241 },       // Indigo
  checked: { r: 34, g: 197, b: 94 },       // Green for checked
  unchecked: { r: 156, g: 163, b: 175 },   // Gray for unchecked
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

export const generateReferencePDF = async (
  reference: CompletedReference,
  applicantName: string,
  applicantDOB: string,
  applicantPostcode: string,
  companySettings: CompanySettings = { name: 'Company Name' }
) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const lineHeight = 7;
  let yPosition = 20;

  pdf.setFont('helvetica', 'normal');

  // Helper: Add modern page border with accent
  const addPageBorder = () => {
    // Outer border
    pdf.setDrawColor(COLORS.neutral.r, COLORS.neutral.g, COLORS.neutral.b);
    pdf.setLineWidth(0.3);
    pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);
    
    // Accent left border
    pdf.setFillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
    pdf.rect(10, 10, 3, pageHeight - 20, 'F');
  };

  addPageBorder();

  // Helper: Ensure space on page
  const ensureSpace = (needed: number) => {
    if (yPosition + needed > pageHeight - 25) {
      pdf.addPage();
      addPageBorder();
      yPosition = 25;
    }
  };

  // Helper: Add styled checkbox
  const addCheckbox = (x: number, y: number, checked: boolean) => {
    if (checked) {
      pdf.setTextColor(COLORS.checked.r, COLORS.checked.g, COLORS.checked.b);
      pdf.setFont('helvetica', 'bold');
      pdf.text('☑', x, y);
    } else {
      pdf.setTextColor(COLORS.unchecked.r, COLORS.unchecked.g, COLORS.unchecked.b);
      pdf.setFont('helvetica', 'normal');
      pdf.text('☐', x, y);
    }
    pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
  };

  // Helper: Add section header with colored underline
  const addSectionHeader = (text: string, y: number, color = COLORS.primary) => {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(color.r, color.g, color.b);
    pdf.text(text, margin, y);
    
    // Underline
    const textWidth = pdf.getTextWidth(text);
    pdf.setDrawColor(color.r, color.g, color.b);
    pdf.setLineWidth(0.5);
    pdf.line(margin, y + 1, margin + textWidth, y + 1);
    
    pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
  };

  // Helper: Add background section
  const addSectionBg = (y: number, height: number) => {
    pdf.setFillColor(COLORS.lightBg.r, COLORS.lightBg.g, COLORS.lightBg.b);
    pdf.rect(margin, y - 3, pageWidth - 2 * margin, height, 'F');
  };

  // Helper: Word wrap text
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 11): number => {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + (lines.length * lineHeight);
  };

  // Add company logo
  if (companySettings.logo) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = companySettings.logo!;
      });
      
      const maxWidth = 50;
      const maxHeight = 25;
      const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
      const logoWidth = img.width * scale;
      const logoHeight = img.height * scale;
      const logoX = (pageWidth / 2) - (logoWidth / 2);
      
      const format = companySettings.logo.toLowerCase().includes('.png') ? 'PNG' : 'JPEG';
      pdf.addImage(companySettings.logo, format, logoX, yPosition, logoWidth, logoHeight);
      yPosition += logoHeight + 8;
    } catch (error) {
      console.error('Error adding logo:', error);
      yPosition += 5;
    }
  }

  // Company name with primary color
  pdf.setFontSize(13);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  pdf.text(companySettings.name, pageWidth / 2, yPosition, { align: 'center' });
  pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
  yPosition += 10;

  // Document title with accent color
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLORS.accent.r, COLORS.accent.g, COLORS.accent.b);
  const referenceType = reference.reference_type === 'employer' ? 'Employment Reference' : 'Character Reference';
  pdf.text(referenceType, pageWidth / 2, yPosition, { align: 'center' });
  pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
  yPosition += 12;

  // Applicant info box with background
  addSectionBg(yPosition, 12);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLORS.neutral.r, COLORS.neutral.g, COLORS.neutral.b);
  pdf.text('Name:', margin + 2, yPosition + 2);
  const nameLabelWidth = pdf.getTextWidth('Name:');
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
  pdf.text(` ${applicantName}`, margin + 2 + nameLabelWidth, yPosition + 2);
  const nameWidth = pdf.getTextWidth(`Name: ${applicantName}`);
  
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLORS.neutral.r, COLORS.neutral.g, COLORS.neutral.b);
  pdf.text('DOB:', margin + nameWidth + 15, yPosition + 2);
  const dobLabelWidth = pdf.getTextWidth('DOB:');
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
  pdf.text(` ${applicantDOB}`, margin + nameWidth + 15 + dobLabelWidth, yPosition + 2);
  const dobWidth = pdf.getTextWidth(`DOB: ${applicantDOB}`);
  
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLORS.neutral.r, COLORS.neutral.g, COLORS.neutral.b);
  pdf.text('Postcode:', margin + nameWidth + dobWidth + 30, yPosition + 2);
  const postcodeLabelWidth = pdf.getTextWidth('Postcode:');
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
  pdf.text(` ${applicantPostcode}`, margin + nameWidth + dobWidth + 30 + postcodeLabelWidth, yPosition + 2);
  yPosition += 18;

  // Referee info
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(COLORS.neutral.r, COLORS.neutral.g, COLORS.neutral.b);
  pdf.text('Referee:', margin, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
  pdf.text(reference.form_data.refereeFullName || '', margin + 35, yPosition);
  
  if (reference.form_data.refereeJobTitle) {
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(COLORS.neutral.r, COLORS.neutral.g, COLORS.neutral.b);
    pdf.text('Title:', margin + 140, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
    pdf.text(reference.form_data.refereeJobTitle, margin + 165, yPosition);
  }
  yPosition += 15;

  // Reference specific content
  ensureSpace(60);
  if (reference.reference_type === 'employer') {
    addSectionHeader('EMPLOYMENT DETAILS', yPosition, COLORS.primary);
    yPosition += 10;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.text('Are you this person\'s current or previous employer?', margin, yPosition);
    yPosition += lineHeight;
    
    addCheckbox(margin, yPosition, reference.form_data.employmentStatus === 'current');
    pdf.text('Current', margin + 8, yPosition);
    addCheckbox(margin + 40, yPosition, reference.form_data.employmentStatus === 'previous');
    pdf.text('Previous', margin + 48, yPosition);
    addCheckbox(margin + 85, yPosition, reference.form_data.employmentStatus === 'neither');
    pdf.text('Neither', margin + 93, yPosition);
    yPosition += lineHeight + 5;

    ensureSpace(25);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(COLORS.neutral.r, COLORS.neutral.g, COLORS.neutral.b);
    pdf.text('Relationship:', margin, yPosition);
    yPosition += lineHeight;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
    yPosition = addWrappedText(`${reference.form_data.relationshipDescription || 'Not provided'}`, margin, yPosition, pageWidth - 2 * margin);
    yPosition += 5;

    ensureSpace(20);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(COLORS.neutral.r, COLORS.neutral.g, COLORS.neutral.b);
    pdf.text('Job Title:', margin, yPosition);
    yPosition += lineHeight;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
    pdf.text(`${reference.form_data.jobTitle || 'Not provided'}`, margin, yPosition);
    yPosition += lineHeight + 5;

    ensureSpace(20);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(COLORS.neutral.r, COLORS.neutral.g, COLORS.neutral.b);
    pdf.text('Employment Period:', margin, yPosition);
    yPosition += lineHeight;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
    const startDate = reference.form_data.startDate ? new Date(reference.form_data.startDate).toLocaleDateString() : 'Not provided';
    const endDate = reference.form_data.endDate ? new Date(reference.form_data.endDate).toLocaleDateString() : 'Not provided';
    pdf.text(`From ${startDate} to ${endDate}`, margin, yPosition);
    yPosition += lineHeight + 5;

    ensureSpace(20);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(COLORS.neutral.r, COLORS.neutral.g, COLORS.neutral.b);
    pdf.text('Attendance Record:', margin, yPosition);
    yPosition += lineHeight;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
    addCheckbox(margin, yPosition, reference.form_data.attendance === 'good');
    pdf.text('Good', margin + 8, yPosition);
    addCheckbox(margin + 35, yPosition, reference.form_data.attendance === 'average');
    pdf.text('Average', margin + 43, yPosition);
    addCheckbox(margin + 75, yPosition, reference.form_data.attendance === 'poor');
    pdf.text('Poor', margin + 83, yPosition);
    yPosition += lineHeight + 5;

    ensureSpace(30);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(COLORS.neutral.r, COLORS.neutral.g, COLORS.neutral.b);
    pdf.text('Reason for Leaving:', margin, yPosition);
    yPosition += lineHeight;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
    yPosition = addWrappedText(`${reference.form_data.leavingReason || 'Not provided'}`, margin, yPosition, pageWidth - 2 * margin);
    yPosition += 5;
  } else {
    addSectionHeader('CHARACTER REFERENCE', yPosition, COLORS.primary);
    yPosition += 10;

    ensureSpace(40);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.text('Do you know this person from outside employment or education?', margin, yPosition);
    yPosition += lineHeight;
    addCheckbox(margin, yPosition, reference.form_data.employmentStatus === 'yes');
    pdf.text('Yes', margin + 8, yPosition);
    addCheckbox(margin + 30, yPosition, reference.form_data.employmentStatus === 'no');
    pdf.text('No', margin + 38, yPosition);
    yPosition += lineHeight + 5;

    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(COLORS.neutral.r, COLORS.neutral.g, COLORS.neutral.b);
    pdf.text('Relationship Description:', margin, yPosition);
    yPosition += lineHeight;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
    yPosition = addWrappedText(`${reference.form_data.relationshipDescription || 'Not provided'}`, margin, yPosition, pageWidth - 2 * margin);
    yPosition += 5;
  }

  // Character qualities section
  ensureSpace(60);
  addSectionHeader('CHARACTER ASSESSMENT', yPosition, COLORS.success);
  yPosition += 10;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.text('Which of the following describes this person?', margin, yPosition);
  yPosition += lineHeight + 3;

  const qualities = [
    { key: 'honestTrustworthy', label: 'Honest and trustworthy' },
    { key: 'communicatesEffectively', label: 'Communicates effectively' },
    { key: 'effectiveTeamMember', label: 'An effective team member' },
    { key: 'respectfulConfidentiality', label: 'Respectful of confidentiality' },
    { key: 'reliablePunctual', label: 'Reliable and punctual' },
    { key: 'suitablePosition', label: 'Suitable for the position' },
    { key: 'kindCompassionate', label: 'Kind and compassionate' },
    { key: 'worksIndependently', label: 'Works well independently' },
  ];

  const columnWidth = (pageWidth - 2 * margin) / 2;
  for (let i = 0; i < qualities.length; i += 2) {
    ensureSpace(8);
    
    const leftQuality = qualities[i];
    const leftChecked = reference.form_data[leftQuality.key as keyof ReferenceData];
    addCheckbox(margin, yPosition, !!leftChecked);
    pdf.setFont('helvetica', 'normal');
    pdf.text(leftQuality.label, margin + 8, yPosition);
    
    if (i + 1 < qualities.length) {
      const rightQuality = qualities[i + 1];
      const rightChecked = reference.form_data[rightQuality.key as keyof ReferenceData];
      const rightStartX = margin + columnWidth;
      addCheckbox(rightStartX, yPosition, !!rightChecked);
      pdf.setFont('helvetica', 'normal');
      pdf.text(rightQuality.label, rightStartX + 8, yPosition);
    }
    
    yPosition += lineHeight;
  }

  ensureSpace(30);
  yPosition += 3;
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLORS.neutral.r, COLORS.neutral.g, COLORS.neutral.b);
  pdf.text('If any not selected, explain why:', margin, yPosition);
  yPosition += lineHeight;
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
  yPosition = addWrappedText(`${reference.form_data.qualitiesNotTickedReason || 'Not provided'}`, margin, yPosition, pageWidth - 2 * margin);
  yPosition += 5;

  // Criminal background section
  ensureSpace(100);
  addSectionHeader('SAFEGUARDING CHECKS', yPosition, COLORS.warning);
  yPosition += 10;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  yPosition = addWrappedText('The position involves working with vulnerable people. Are you aware of any convictions, cautions, reprimands or final warnings that are not \'protected\' under the Rehabilitation of Offenders Act 1974?', margin, yPosition, pageWidth - 2 * margin, 10);
  yPosition += 3;
  addCheckbox(margin, yPosition, reference.form_data.convictionsKnown === 'yes');
  pdf.text('Yes', margin + 8, yPosition);
  addCheckbox(margin + 30, yPosition, reference.form_data.convictionsKnown === 'no');
  pdf.text('No', margin + 38, yPosition);
  if (!reference.form_data.convictionsKnown) {
    pdf.setTextColor(COLORS.neutral.r, COLORS.neutral.g, COLORS.neutral.b);
    pdf.text('Not answered', margin + 55, yPosition);
    pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
  }
  yPosition += lineHeight + 8;

  ensureSpace(50);
  pdf.setFontSize(10);
  yPosition = addWrappedText('Is this person currently subject to any criminal proceedings or police investigation?', margin, yPosition, pageWidth - 2 * margin, 10);
  yPosition += 3;
  addCheckbox(margin, yPosition, reference.form_data.criminalProceedingsKnown === 'yes');
  pdf.text('Yes', margin + 8, yPosition);
  addCheckbox(margin + 30, yPosition, reference.form_data.criminalProceedingsKnown === 'no');
  pdf.text('No', margin + 38, yPosition);
  if (!reference.form_data.criminalProceedingsKnown) {
    pdf.setTextColor(COLORS.neutral.r, COLORS.neutral.g, COLORS.neutral.b);
    pdf.text('Not answered', margin + 55, yPosition);
    pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
  }
  yPosition += lineHeight + 8;

  if (reference.form_data.convictionsKnown === 'yes' || reference.form_data.criminalProceedingsKnown === 'yes' || reference.form_data.criminalDetails) {
    ensureSpace(40);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(COLORS.warning.r, COLORS.warning.g, COLORS.warning.b);
    pdf.text('Details Provided:', margin, yPosition);
    yPosition += lineHeight;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
    yPosition = addWrappedText(`${reference.form_data.criminalDetails || 'Not provided'}`, margin, yPosition, pageWidth - 2 * margin);
    yPosition += 10;
  }

  // Additional comments
  ensureSpace(40);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(COLORS.neutral.r, COLORS.neutral.g, COLORS.neutral.b);
  pdf.text('Additional Comments:', margin, yPosition);
  yPosition += lineHeight;
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
  yPosition = addWrappedText(`${reference.form_data.additionalComments || 'None provided'}`, margin, yPosition, pageWidth - 2 * margin);
  yPosition += 10;

  // Declaration
  ensureSpace(30);
  addSectionHeader('DECLARATION', yPosition, COLORS.accent);
  yPosition += 8;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  const declarationText = 'I certify that, to the best of my knowledge, the information I have given is true and complete. I understand that any deliberate omission, falsification or misrepresentation may lead to refusal of appointment or dismissal.';
  yPosition = addWrappedText(declarationText, margin, yPosition, pageWidth - 2 * margin, 10);
  yPosition += 10;

  // Footer info box with background
  ensureSpace(50);
  addSectionBg(yPosition, 32);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(COLORS.neutral.r, COLORS.neutral.g, COLORS.neutral.b);
  pdf.text('Referee:', margin + 2, yPosition + 2);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
  pdf.text(reference.form_data.refereeFullName || '', margin + 50, yPosition + 2);
  yPosition += 7;

  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLORS.neutral.r, COLORS.neutral.g, COLORS.neutral.b);
  pdf.text('Job Title:', margin + 2, yPosition + 2);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
  pdf.text(reference.form_data.refereeJobTitle || '', margin + 50, yPosition + 2);
  yPosition += 7;

  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLORS.neutral.r, COLORS.neutral.g, COLORS.neutral.b);
  pdf.text('Created:', margin + 2, yPosition + 2);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
  pdf.text(new Date(reference.created_at).toLocaleDateString(), margin + 50, yPosition + 2);
  
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLORS.neutral.r, COLORS.neutral.g, COLORS.neutral.b);
  pdf.text('Sent:', margin + 95, yPosition + 2);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
  pdf.text(new Date(reference.sent_at).toLocaleDateString(), margin + 115, yPosition + 2);
  yPosition += 7;

  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLORS.neutral.r, COLORS.neutral.g, COLORS.neutral.b);
  pdf.text('Completed:', margin + 2, yPosition + 2);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(COLORS.success.r, COLORS.success.g, COLORS.success.b);
  pdf.text(new Date(reference.completed_at).toLocaleDateString(), margin + 50, yPosition + 2);

  return pdf;
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
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const lineHeight = 7;
  let yPosition = 20;

  pdf.setFont('helvetica', 'normal');

  // Helper: Add modern page border with accent
  const addPageBorder = () => {
    pdf.setDrawColor(COLORS.neutral.r, COLORS.neutral.g, COLORS.neutral.b);
    pdf.setLineWidth(0.3);
    pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);
    
    pdf.setFillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
    pdf.rect(10, 10, 3, pageHeight - 20, 'F');
  };

  addPageBorder();

  // Helper: Ensure space
  const ensureSpace = (needed: number) => {
    if (yPosition + needed > pageHeight - 25) {
      pdf.addPage();
      addPageBorder();
      yPosition = 25;
    }
  };

  // Helper: Add styled checkbox
  const addCheckbox = (x: number, y: number, checked: boolean) => {
    if (checked) {
      pdf.setTextColor(COLORS.checked.r, COLORS.checked.g, COLORS.checked.b);
      pdf.setFont('helvetica', 'bold');
      pdf.text('☑', x, y);
    } else {
      pdf.setTextColor(COLORS.unchecked.r, COLORS.unchecked.g, COLORS.unchecked.b);
      pdf.setFont('helvetica', 'normal');
      pdf.text('☐', x, y);
    }
    pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
  };

  // Helper: Add section header
  const addSectionHeader = (text: string, y: number, color = COLORS.primary) => {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(color.r, color.g, color.b);
    pdf.text(text, margin, y);
    
    const textWidth = pdf.getTextWidth(text);
    pdf.setDrawColor(color.r, color.g, color.b);
    pdf.setLineWidth(0.5);
    pdf.line(margin, y + 1, margin + textWidth, y + 1);
    
    pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
  };

  // Helper: Add background
  const addSectionBg = (y: number, height: number) => {
    pdf.setFillColor(COLORS.lightBg.r, COLORS.lightBg.g, COLORS.lightBg.b);
    pdf.rect(margin, y - 3, pageWidth - 2 * margin, height, 'F');
  };

  // Helper: Word wrap
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 11): number => {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + (lines.length * lineHeight);
  };

  // Add company logo
  if (companySettings.logo) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = companySettings.logo!;
      });
      
      const maxWidth = 50;
      const maxHeight = 25;
      const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
      const logoWidth = img.width * scale;
      const logoHeight = img.height * scale;
      const logoX = (pageWidth / 2) - (logoWidth / 2);
      
      const format = companySettings.logo.toLowerCase().includes('.png') ? 'PNG' : 'JPEG';
      pdf.addImage(companySettings.logo, format, logoX, yPosition, logoWidth, logoHeight);
      yPosition += logoHeight + 8;
    } catch (error) {
      console.error('Error adding logo:', error);
      yPosition += 5;
    }
  }

  // Company name
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  pdf.text(companySettings.name, pageWidth / 2, yPosition, { align: 'center' });
  pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
  yPosition += 10;

  // Title
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLORS.accent.r, COLORS.accent.g, COLORS.accent.b);
  const referenceTitle = data.referenceType === 'employer' ? 'Employment Reference' : 'Character Reference';
  pdf.text(referenceTitle, pageWidth / 2, yPosition, { align: 'center' });
  pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
  yPosition += 12;

  // Applicant info box
  addSectionBg(yPosition, 12);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLORS.neutral.r, COLORS.neutral.g, COLORS.neutral.b);
  pdf.text('Name:', margin + 2, yPosition + 2);
  const nameLabelWidth = pdf.getTextWidth('Name:');
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
  pdf.text(` ${data.applicantName}`, margin + 2 + nameLabelWidth, yPosition + 2);
  const nameWidth = pdf.getTextWidth(`Name: ${data.applicantName}`);
  
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLORS.neutral.r, COLORS.neutral.g, COLORS.neutral.b);
  pdf.text('DOB:', margin + nameWidth + 15, yPosition + 2);
  const dobLabelWidth = pdf.getTextWidth('DOB:');
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
  pdf.text(` ${data.applicantDOB || ''}`, margin + nameWidth + 15 + dobLabelWidth, yPosition + 2);
  const dobWidth = pdf.getTextWidth(`DOB: ${data.applicantDOB || ''}`);
  
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLORS.neutral.r, COLORS.neutral.g, COLORS.neutral.b);
  pdf.text('Postcode:', margin + nameWidth + dobWidth + 30, yPosition + 2);
  const postcodeLabelWidth = pdf.getTextWidth('Postcode:');
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
  pdf.text(` ${data.applicantPostcode || ''}`, margin + nameWidth + dobWidth + 30 + postcodeLabelWidth, yPosition + 2);
  yPosition += 18;

  // Referee info
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(COLORS.neutral.r, COLORS.neutral.g, COLORS.neutral.b);
  pdf.text('Referee:', margin, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
  pdf.text(data.referee.name || '', margin + 35, yPosition);
  
  if (data.referee.jobTitle) {
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(COLORS.neutral.r, COLORS.neutral.g, COLORS.neutral.b);
    pdf.text('Title:', margin + 140, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
    pdf.text(data.referee.jobTitle, margin + 165, yPosition);
  }
  yPosition += 15;

  // Reference specific content
  ensureSpace(60);
  if (data.referenceType === 'employer') {
    addSectionHeader('EMPLOYMENT DETAILS', yPosition, COLORS.primary);
    yPosition += 10;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.text('Are you this person\'s current or previous employer?', margin, yPosition);
    yPosition += lineHeight;
    
    addCheckbox(margin, yPosition, data.employmentStatus === 'current');
    pdf.text('Current', margin + 8, yPosition);
    addCheckbox(margin + 40, yPosition, data.employmentStatus === 'previous');
    pdf.text('Previous', margin + 48, yPosition);
    addCheckbox(margin + 85, yPosition, data.employmentStatus === 'neither');
    pdf.text('Neither', margin + 93, yPosition);
    yPosition += lineHeight + 5;

    ensureSpace(25);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(COLORS.neutral.r, COLORS.neutral.g, COLORS.neutral.b);
    pdf.text('Relationship:', margin, yPosition);
    yPosition += lineHeight;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
    yPosition = addWrappedText(`${data.referee.jobTitle || ''}`, margin, yPosition, pageWidth - 2 * margin);
    yPosition += 5;

    ensureSpace(20);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(COLORS.neutral.r, COLORS.neutral.g, COLORS.neutral.b);
    pdf.text('Job Title:', margin, yPosition);
    yPosition += lineHeight;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
    pdf.text(`${data.applicantPosition || ''}`, margin, yPosition);
    yPosition += lineHeight + 5;

    ensureSpace(20);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(COLORS.neutral.r, COLORS.neutral.g, COLORS.neutral.b);
    pdf.text('Employment Period:', margin, yPosition);
    yPosition += lineHeight;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
    pdf.text(`From ${data.employmentFrom || ''} to ${data.employmentTo || ''}`, margin, yPosition);
    yPosition += lineHeight + 5;

    ensureSpace(20);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(COLORS.neutral.r, COLORS.neutral.g, COLORS.neutral.b);
    pdf.text('Attendance Record:', margin, yPosition);
    yPosition += lineHeight;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
    addCheckbox(margin, yPosition, true);
    pdf.text('Good', margin + 8, yPosition);
    addCheckbox(margin + 35, yPosition, false);
    pdf.text('Average', margin + 43, yPosition);
    addCheckbox(margin + 75, yPosition, false);
    pdf.text('Poor', margin + 83, yPosition);
    yPosition += lineHeight + 5;

    ensureSpace(30);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(COLORS.neutral.r, COLORS.neutral.g, COLORS.neutral.b);
    pdf.text('Reason for Leaving:', margin, yPosition);
    yPosition += lineHeight;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
    yPosition = addWrappedText(`${data.reasonForLeaving || ''}`, margin, yPosition, pageWidth - 2 * margin);
    yPosition += 5;
  } else {
    addSectionHeader('CHARACTER REFERENCE', yPosition, COLORS.primary);
    yPosition += 10;

    ensureSpace(40);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.text('Do you know this person from outside employment or education?', margin, yPosition);
    yPosition += lineHeight;
    addCheckbox(margin, yPosition, true);
    pdf.text('Yes', margin + 8, yPosition);
    addCheckbox(margin + 30, yPosition, false);
    pdf.text('No', margin + 38, yPosition);
    yPosition += lineHeight + 5;

    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(COLORS.neutral.r, COLORS.neutral.g, COLORS.neutral.b);
    pdf.text('Relationship Description:', margin, yPosition);
    yPosition += lineHeight;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
    yPosition = addWrappedText('', margin, yPosition, pageWidth - 2 * margin);
    yPosition += 5;
  }

  // Character qualities
  ensureSpace(60);
  addSectionHeader('CHARACTER ASSESSMENT', yPosition, COLORS.success);
  yPosition += 10;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.text('Which of the following describes this person?', margin, yPosition);
  yPosition += lineHeight + 3;

  const qualities = [
    'Honest and trustworthy',
    'Communicates effectively',
    'An effective team member',
    'Respectful of confidentiality',
    'Reliable and punctual',
    'Suitable for the position',
    'Kind and compassionate',
    'Works well independently',
  ];

  const columnWidth = (pageWidth - 2 * margin) / 2;
  for (let i = 0; i < qualities.length; i += 2) {
    ensureSpace(8);
    
    addCheckbox(margin, yPosition, true);
    pdf.text(qualities[i], margin + 8, yPosition);
    
    if (i + 1 < qualities.length) {
      const rightStartX = margin + columnWidth;
      addCheckbox(rightStartX, yPosition, true);
      pdf.text(qualities[i + 1], rightStartX + 8, yPosition);
    }
    
    yPosition += lineHeight;
  }

  ensureSpace(30);
  yPosition += 3;
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLORS.neutral.r, COLORS.neutral.g, COLORS.neutral.b);
  pdf.text('If any not selected, explain why:', margin, yPosition);
  yPosition += lineHeight;
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
  yPosition = addWrappedText('Not provided', margin, yPosition, pageWidth - 2 * margin);
  yPosition += 5;

  // Criminal background
  ensureSpace(100);
  addSectionHeader('SAFEGUARDING CHECKS', yPosition, COLORS.warning);
  yPosition += 10;
  
  pdf.setFontSize(10);
  yPosition = addWrappedText('The position involves working with vulnerable people. Are you aware of any convictions, cautions, reprimands or final warnings that are not \'protected\' under the Rehabilitation of Offenders Act 1974?', margin, yPosition, pageWidth - 2 * margin, 10);
  yPosition += 3;
  addCheckbox(margin, yPosition, false);
  pdf.text('Yes', margin + 8, yPosition);
  addCheckbox(margin + 30, yPosition, true);
  pdf.text('No', margin + 38, yPosition);
  yPosition += lineHeight + 8;

  ensureSpace(50);
  yPosition = addWrappedText('Is this person currently subject to any criminal proceedings or police investigation?', margin, yPosition, pageWidth - 2 * margin, 10);
  yPosition += 3;
  addCheckbox(margin, yPosition, false);
  pdf.text('Yes', margin + 8, yPosition);
  addCheckbox(margin + 30, yPosition, true);
  pdf.text('No', margin + 38, yPosition);
  yPosition += lineHeight + 8;

  // Additional comments
  ensureSpace(40);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(COLORS.neutral.r, COLORS.neutral.g, COLORS.neutral.b);
  pdf.text('Additional Comments:', margin, yPosition);
  yPosition += lineHeight;
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
  yPosition = addWrappedText('Not provided', margin, yPosition, pageWidth - 2 * margin);
  yPosition += 10;

  // Declaration
  ensureSpace(30);
  addSectionHeader('DECLARATION', yPosition, COLORS.accent);
  yPosition += 8;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  const declarationText = 'I certify that, to the best of my knowledge, the information I have given is true and complete. I understand that any deliberate omission, falsification or misrepresentation may lead to refusal of appointment or dismissal.';
  yPosition = addWrappedText(declarationText, margin, yPosition, pageWidth - 2 * margin, 10);
  yPosition += 10;

  // Footer info
  ensureSpace(50);
  addSectionBg(yPosition, 25);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(COLORS.neutral.r, COLORS.neutral.g, COLORS.neutral.b);
  pdf.text('Referee:', margin + 2, yPosition + 2);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
  pdf.text(data.referee.name || '', margin + 50, yPosition + 2);
  yPosition += 7;

  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLORS.neutral.r, COLORS.neutral.g, COLORS.neutral.b);
  pdf.text('Job Title:', margin + 2, yPosition + 2);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
  pdf.text(data.referee.jobTitle || '', margin + 50, yPosition + 2);
  yPosition += 7;

  const createdKey = `{R${data.referenceNumber || 1}_Created}`;
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLORS.neutral.r, COLORS.neutral.g, COLORS.neutral.b);
  pdf.text('Created:', margin + 2, yPosition + 2);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
  pdf.text(createdKey, margin + 50, yPosition + 2);
  
  const signatureKey = `{R${data.referenceNumber || 1}_Signed}`;
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLORS.neutral.r, COLORS.neutral.g, COLORS.neutral.b);
  pdf.text('Sent:', margin + 95, yPosition + 2);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
  pdf.text(signatureKey, margin + 115, yPosition + 2);
  yPosition += 7;

  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLORS.neutral.r, COLORS.neutral.g, COLORS.neutral.b);
  pdf.text('Completed:', margin + 2, yPosition + 2);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(COLORS.darkText.r, COLORS.darkText.g, COLORS.darkText.b);
  pdf.text(signatureKey, margin + 50, yPosition + 2);

  return pdf;
};
