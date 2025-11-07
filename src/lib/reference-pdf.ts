import jsPDF from 'jspdf';

// Modern color palette
const colors = {
  primary: [37, 99, 235] as const,      // Blue
  primaryLight: [239, 246, 255] as const, // Light blue tint
  secondary: [71, 85, 105] as const,    // Slate gray
  success: [34, 197, 94] as const,      // Green for checkmarks
  warning: [245, 158, 11] as const,     // Orange for warnings
  warningLight: [254, 243, 199] as const, // Light orange tint
  background: [248, 250, 252] as const, // Light background
  border: [226, 232, 240] as const,     // Light border
  textDark: [15, 23, 42] as const,      // Dark text
  textMuted: [100, 116, 139] as const,  // Muted text
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
  const margin = 20; // Increased margin
  const lineHeight = 8; // Increased line height
  let yPosition = 15;

  // Set font to support Unicode characters
  pdf.setFont('helvetica', 'normal');

  // Helper function to draw section header with background
  const drawSectionHeader = (text: string, y: number) => {
    pdf.setFillColor(...colors.primaryLight);
    pdf.rect(margin - 5, y - 6, pageWidth - 2 * margin + 10, 10, 'F');
    pdf.setDrawColor(...colors.border);
    pdf.setLineWidth(0.3);
    pdf.rect(margin - 5, y - 6, pageWidth - 2 * margin + 10, 10);
    pdf.setTextColor(...colors.primary);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.text(text, margin, y);
  };

  // Helper function to draw info box
  const drawInfoBox = (y: number, height: number) => {
    pdf.setFillColor(...colors.background);
    pdf.rect(margin - 3, y - 5, pageWidth - 2 * margin + 6, height, 'F');
    pdf.setDrawColor(...colors.border);
    pdf.setLineWidth(0.2);
    pdf.rect(margin - 3, y - 5, pageWidth - 2 * margin + 6, height);
  };

  // Helper function to draw modern checkbox
  const drawCheckbox = (checked: boolean, x: number, y: number) => {
    if (checked) {
      pdf.setTextColor(...colors.success);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text('✓', x, y);
    } else {
      pdf.setTextColor(...colors.textMuted);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      pdf.text('○', x, y);
    }
    pdf.setTextColor(...colors.textDark); // Reset
  };

  // Helper function to ensure space on page
  const ensureSpace = (needed: number) => {
    if (yPosition + needed > pageHeight - 20) {
      pdf.addPage();
      yPosition = 15;
      // Draw header bar on new page
      pdf.setFillColor(...colors.primary);
      pdf.rect(0, 0, pageWidth, 12, 'F');
    }
  };

  // Draw modern header bar
  pdf.setFillColor(...colors.primary);
  pdf.rect(0, 0, pageWidth, 35, 'F');

  // Add company logo if available (on colored header)
  if (companySettings.logo) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = companySettings.logo!;
      });
      
      const maxWidth = 40;
      const maxHeight = 20;
      const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
      const logoWidth = img.width * scale;
      const logoHeight = img.height * scale;
      const logoX = margin;
      
      const format = companySettings.logo.toLowerCase().includes('.png') ? 'PNG' : 'JPEG';
      pdf.addImage(companySettings.logo, format, logoX, 8, logoWidth, logoHeight);
    } catch (error) {
      console.error('Error adding logo to PDF:', error);
    }
  }

  // Add company name on header (white text)
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(companySettings.name, pageWidth / 2, 22, { align: 'center' });
  
  yPosition = 45;

  // Helper function to add text with word wrap
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 11): number => {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + (lines.length * lineHeight);
  };

  // Reference type title
  pdf.setTextColor(...colors.primary);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  const referenceType = reference.reference_type === 'employer' ? 'Employment Reference' : 'Character Reference';
  pdf.text(referenceType, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Applicant Information Box
  drawInfoBox(yPosition, 20);
  
  pdf.setTextColor(...colors.textDark);
  pdf.setFontSize(11);
  
  // Name
  pdf.setFont('helvetica', 'bold');
  pdf.text('Name:', margin, yPosition);
  pdf.setFont('helvetica', 'normal');
  const nameLabelWidth = pdf.getTextWidth('Name:');
  pdf.text(` ${applicantName}`, margin + nameLabelWidth, yPosition);
  const nameWidth = pdf.getTextWidth(`Name: ${applicantName}`);
  
  // Date of Birth
  pdf.setFont('helvetica', 'bold');
  pdf.text('Date of Birth:', margin + nameWidth + 15, yPosition);
  const dobLabelWidth = pdf.getTextWidth('Date of Birth:');
  pdf.setFont('helvetica', 'normal');
  pdf.text(` ${applicantDOB}`, margin + nameWidth + 15 + dobLabelWidth, yPosition);
  
  yPosition += lineHeight;
  
  // Postcode
  pdf.setFont('helvetica', 'bold');
  pdf.text('Postcode:', margin, yPosition);
  const postcodeLabelWidth = pdf.getTextWidth('Postcode:');
  pdf.setFont('helvetica', 'normal');
  pdf.text(` ${applicantPostcode}`, margin + postcodeLabelWidth, yPosition);
  yPosition += 18;

  // Referee Information
  drawSectionHeader('Referee Information', yPosition);
  yPosition += 12;
  
  pdf.setTextColor(...colors.textDark);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Name:', margin, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(reference.form_data.refereeFullName || '', margin + 30, yPosition);
  yPosition += lineHeight;
  
  if (reference.form_data.refereeJobTitle) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('Job Title:', margin, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(reference.form_data.refereeJobTitle, margin + 30, yPosition);
    yPosition += lineHeight;
  }
  yPosition += 8;

  // Reference specific content
  ensureSpace(60);
  if (reference.reference_type === 'employer') {
    // Employment Status
    pdf.setTextColor(...colors.textDark);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text('Are you this person\'s current or previous employer?', margin, yPosition);
    yPosition += lineHeight + 2;
    
    pdf.setFont('helvetica', 'normal');
    const currentChecked = reference.form_data.employmentStatus === 'current';
    const previousChecked = reference.form_data.employmentStatus === 'previous';
    const neitherChecked = reference.form_data.employmentStatus === 'neither';
    
    drawCheckbox(currentChecked, margin, yPosition);
    pdf.text('Current', margin + 8, yPosition);
    drawCheckbox(previousChecked, margin + 40, yPosition);
    pdf.text('Previous', margin + 48, yPosition);
    drawCheckbox(neitherChecked, margin + 85, yPosition);
    pdf.text('Neither', margin + 93, yPosition);
    yPosition += lineHeight + 5;

    // Relationship Description
    ensureSpace(25);
    pdf.setTextColor(...colors.textDark);
    pdf.setFont('helvetica', 'bold');
    pdf.text('What is your relationship to this person?', margin, yPosition);
    yPosition += lineHeight;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...colors.textMuted);
    yPosition = addWrappedText(`${reference.form_data.relationshipDescription || 'Not provided'}`, margin, yPosition, pageWidth - 2 * margin);
    yPosition += 5;

    // Job Title
    ensureSpace(20);
    pdf.setTextColor(...colors.textDark);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Person\'s job title:', margin, yPosition);
    yPosition += lineHeight;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...colors.textMuted);
    pdf.text(`${reference.form_data.jobTitle || 'Not provided'}`, margin, yPosition);
    yPosition += lineHeight + 5;

    // Employment Dates
    ensureSpace(20);
    pdf.setTextColor(...colors.textDark);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Employment Period:', margin, yPosition);
    yPosition += lineHeight;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...colors.textMuted);
    const startDate = reference.form_data.startDate ? new Date(reference.form_data.startDate).toLocaleDateString() : 'Not provided';
    const endDate = reference.form_data.endDate ? new Date(reference.form_data.endDate).toLocaleDateString() : 'Not provided';
    pdf.text(`From ${startDate} to ${endDate}`, margin, yPosition);
    yPosition += lineHeight + 5;

    // Attendance
    ensureSpace(20);
    pdf.setTextColor(...colors.textDark);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Recent attendance record:', margin, yPosition);
    yPosition += lineHeight + 2;
    
    pdf.setFont('helvetica', 'normal');
    const goodChecked = reference.form_data.attendance === 'good';
    const averageChecked = reference.form_data.attendance === 'average';
    const poorChecked = reference.form_data.attendance === 'poor';
    
    drawCheckbox(goodChecked, margin, yPosition);
    pdf.text('Good', margin + 8, yPosition);
    drawCheckbox(averageChecked, margin + 35, yPosition);
    pdf.text('Average', margin + 43, yPosition);
    drawCheckbox(poorChecked, margin + 80, yPosition);
    pdf.text('Poor', margin + 88, yPosition);
    yPosition += lineHeight + 5;

    // Leaving Reason
    ensureSpace(30);
    pdf.setTextColor(...colors.textDark);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Why did the person leave your employment?', margin, yPosition);
    yPosition += lineHeight;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...colors.textMuted);
    yPosition = addWrappedText(`${reference.form_data.leavingReason || 'Not provided'}`, margin, yPosition, pageWidth - 2 * margin);
    yPosition += 5;
  } else {
    // Character reference specific content
    ensureSpace(40);
    pdf.setTextColor(...colors.textDark);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Do you know this person from outside employment or education?', margin, yPosition);
    yPosition += lineHeight + 2;
    
    pdf.setFont('helvetica', 'normal');
    const outsideYes = reference.form_data.employmentStatus === 'yes';
    const outsideNo = reference.form_data.employmentStatus === 'no';
    
    drawCheckbox(outsideYes, margin, yPosition);
    pdf.text('Yes', margin + 8, yPosition);
    drawCheckbox(outsideNo, margin + 30, yPosition);
    pdf.text('No', margin + 38, yPosition);
    yPosition += lineHeight + 8;

    pdf.setTextColor(...colors.textDark);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Describe your relationship with this person:', margin, yPosition);
    yPosition += lineHeight;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...colors.textMuted);
    yPosition = addWrappedText(`${reference.form_data.relationshipDescription || 'Not provided'}`, margin, yPosition, pageWidth - 2 * margin);
    yPosition += 8;
  }

  // Character qualities section
  ensureSpace(70);
  drawSectionHeader('Character Qualities', yPosition);
  yPosition += 12;
  
  pdf.setTextColor(...colors.textDark);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('Which of the following describes this person?', margin, yPosition);
  yPosition += lineHeight + 5;

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

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...colors.textDark);
  
  // Display qualities in 2 columns
  const columnWidth = (pageWidth - 2 * margin) / 2;
  for (let i = 0; i < qualities.length; i += 2) {
    ensureSpace(10);
    
    // Left column quality
    const leftQuality = qualities[i];
    const leftChecked = reference.form_data[leftQuality.key as keyof ReferenceData];
    drawCheckbox(!!leftChecked, margin, yPosition);
    pdf.text(leftQuality.label, margin + 8, yPosition);
    
    // Right column quality (if exists)
    if (i + 1 < qualities.length) {
      const rightQuality = qualities[i + 1];
      const rightChecked = reference.form_data[rightQuality.key as keyof ReferenceData];
      const rightStartX = margin + columnWidth;
      drawCheckbox(!!rightChecked, rightStartX, yPosition);
      pdf.text(rightQuality.label, rightStartX + 8, yPosition);
    }
    
    yPosition += lineHeight + 2;
  }

  // Qualities not ticked reason
  ensureSpace(30);
  yPosition += 5;
  pdf.setTextColor(...colors.textDark);
  pdf.setFont('helvetica', 'bold');
  pdf.text('If you did not tick one or more of the above, please explain:', margin, yPosition);
  yPosition += lineHeight;
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...colors.textMuted);
  yPosition = addWrappedText(`${reference.form_data.qualitiesNotTickedReason || 'Not provided'}`, margin, yPosition, pageWidth - 2 * margin);
  yPosition += 8;

  // Criminal background questions - CRITICAL SECTION
  ensureSpace(120);
  
  // Warning background for critical section
  pdf.setFillColor(...colors.warningLight);
  const sectionHeight = 85;
  pdf.rect(margin - 5, yPosition - 8, pageWidth - 2 * margin + 10, sectionHeight, 'F');
  pdf.setDrawColor(...colors.warning);
  pdf.setLineWidth(0.5);
  pdf.rect(margin - 5, yPosition - 8, pageWidth - 2 * margin + 10, sectionHeight);
  
  pdf.setTextColor(...colors.warning);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.text('⚠ CRIMINAL BACKGROUND CHECK', margin, yPosition);
  yPosition += lineHeight + 5;
  
  pdf.setTextColor(...colors.textDark);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  yPosition = addWrappedText('Are you aware of any convictions, cautions, reprimands or final warnings that the person may have received that are not \'protected\' as defined by the Rehabilitation of Offenders Act 1974?', margin, yPosition, pageWidth - 2 * margin - 10, 10);
  yPosition += 3;
  
  pdf.setFont('helvetica', 'normal');
  const convictionsYes = reference.form_data.convictionsKnown === 'yes';
  const convictionsNo = reference.form_data.convictionsKnown === 'no';
  
  if (reference.form_data.convictionsKnown) {
    drawCheckbox(convictionsYes, margin, yPosition);
    pdf.text('Yes', margin + 8, yPosition);
    drawCheckbox(convictionsNo, margin + 30, yPosition);
    pdf.text('No', margin + 38, yPosition);
  } else {
    pdf.setTextColor(...colors.textMuted);
    pdf.text('Not answered', margin, yPosition);
  }
  yPosition += lineHeight + 8;

  ensureSpace(50);
  pdf.setTextColor(...colors.textDark);
  pdf.setFont('helvetica', 'bold');
  yPosition = addWrappedText('Is this person currently the subject of any criminal proceedings or police investigation?', margin, yPosition, pageWidth - 2 * margin - 10, 10);
  yPosition += 3;
  
  pdf.setFont('helvetica', 'normal');
  const proceedingsYes = reference.form_data.criminalProceedingsKnown === 'yes';
  const proceedingsNo = reference.form_data.criminalProceedingsKnown === 'no';
  
  if (reference.form_data.criminalProceedingsKnown) {
    drawCheckbox(proceedingsYes, margin, yPosition);
    pdf.text('Yes', margin + 8, yPosition);
    drawCheckbox(proceedingsNo, margin + 30, yPosition);
    pdf.text('No', margin + 38, yPosition);
  } else {
    pdf.setTextColor(...colors.textMuted);
    pdf.text('Not answered', margin, yPosition);
  }
  yPosition += lineHeight + 8;

  // Criminal details if provided
  if (reference.form_data.convictionsKnown === 'yes' || reference.form_data.criminalProceedingsKnown === 'yes' || reference.form_data.criminalDetails) {
    ensureSpace(40);
    pdf.setTextColor(...colors.textDark);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Details provided:', margin, yPosition);
    yPosition += lineHeight;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...colors.textMuted);
    yPosition = addWrappedText(`${reference.form_data.criminalDetails || 'Not provided'}`, margin, yPosition, pageWidth - 2 * margin - 10);
    yPosition += 5;
  }
  yPosition += 10;

  // Additional Comments
  ensureSpace(40);
  drawSectionHeader('Additional Comments', yPosition);
  yPosition += 12;
  
  pdf.setTextColor(...colors.textMuted);
  pdf.setFont('helvetica', 'normal');
  yPosition = addWrappedText(`${reference.form_data.additionalComments || 'Not provided'}`, margin, yPosition, pageWidth - 2 * margin);
  yPosition += 12;

  // Declaration
  ensureSpace(35);
  drawSectionHeader('Declaration', yPosition);
  yPosition += 12;
  
  pdf.setTextColor(...colors.textDark);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  const declarationText = 'I certify that, to the best of my knowledge, the information I have given is true and complete. I understand that any deliberate omission, falsification or misrepresentation may lead to refusal of appointment or dismissal.';
  yPosition = addWrappedText(declarationText, margin, yPosition, pageWidth - 2 * margin, 10);
  yPosition += 12;

  // Footer section with gray background
  ensureSpace(60);
  pdf.setFillColor(...colors.background);
  pdf.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 50, 'F');
  
  pdf.setTextColor(...colors.textDark);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('Reference Details', margin, yPosition);
  yPosition += lineHeight + 3;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...colors.textMuted);
  pdf.text('Referee:', margin, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(reference.form_data.refereeFullName || '', margin + 35, yPosition);
  yPosition += lineHeight;

  pdf.setFont('helvetica', 'bold');
  pdf.text('Job Title:', margin, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(reference.form_data.refereeJobTitle || '', margin + 35, yPosition);
  yPosition += lineHeight;

  pdf.setFont('helvetica', 'bold');
  pdf.text('Created:', margin, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(new Date(reference.created_at).toLocaleDateString(), margin + 35, yPosition);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Sent:', margin + 90, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(new Date(reference.sent_at).toLocaleDateString(), margin + 110, yPosition);
  yPosition += lineHeight;

  pdf.setFont('helvetica', 'bold');
  pdf.text('Completed:', margin, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(new Date(reference.completed_at).toLocaleDateString(), margin + 35, yPosition);

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
  const margin = 20;
  const lineHeight = 8;
  let yPosition = 15;

  pdf.setFont('helvetica', 'normal');

  // Helper function to draw section header with background
  const drawSectionHeader = (text: string, y: number) => {
    pdf.setFillColor(...colors.primaryLight);
    pdf.rect(margin - 5, y - 6, pageWidth - 2 * margin + 10, 10, 'F');
    pdf.setDrawColor(...colors.border);
    pdf.setLineWidth(0.3);
    pdf.rect(margin - 5, y - 6, pageWidth - 2 * margin + 10, 10);
    pdf.setTextColor(...colors.primary);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.text(text, margin, y);
  };

  // Helper function to draw info box
  const drawInfoBox = (y: number, height: number) => {
    pdf.setFillColor(...colors.background);
    pdf.rect(margin - 3, y - 5, pageWidth - 2 * margin + 6, height, 'F');
    pdf.setDrawColor(...colors.border);
    pdf.setLineWidth(0.2);
    pdf.rect(margin - 3, y - 5, pageWidth - 2 * margin + 6, height);
  };

  // Helper function to draw modern checkbox
  const drawCheckbox = (checked: boolean, x: number, y: number) => {
    if (checked) {
      pdf.setTextColor(...colors.success);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text('✓', x, y);
    } else {
      pdf.setTextColor(...colors.textMuted);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      pdf.text('○', x, y);
    }
    pdf.setTextColor(...colors.textDark);
  };

  // Helper function to ensure space on page
  const ensureSpace = (needed: number) => {
    if (yPosition + needed > pageHeight - 20) {
      pdf.addPage();
      yPosition = 15;
      pdf.setFillColor(...colors.primary);
      pdf.rect(0, 0, pageWidth, 12, 'F');
    }
  };

  // Draw modern header bar
  pdf.setFillColor(...colors.primary);
  pdf.rect(0, 0, pageWidth, 35, 'F');

  // Add company logo if available
  if (companySettings.logo) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = companySettings.logo!;
      });
      
      const maxWidth = 40;
      const maxHeight = 20;
      const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
      const logoWidth = img.width * scale;
      const logoHeight = img.height * scale;
      const logoX = margin;
      
      const format = companySettings.logo.toLowerCase().includes('.png') ? 'PNG' : 'JPEG';
      pdf.addImage(companySettings.logo, format, logoX, 8, logoWidth, logoHeight);
    } catch (error) {
      console.error('Error adding logo to PDF:', error);
    }
  }

  // Company name on header
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.text(companySettings.name, pageWidth / 2, 22, { align: 'center' });
  
  yPosition = 45;

  // Helper function to add text with word wrap
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 11): number => {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + (lines.length * lineHeight);
  };

  // Reference type title
  pdf.setTextColor(...colors.primary);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  const referenceTitle = data.referenceType === 'employer' ? 'Employment Reference' : 'Character Reference';
  pdf.text(referenceTitle, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Applicant Information Box
  drawInfoBox(yPosition, 20);
  
  pdf.setTextColor(...colors.textDark);
  pdf.setFontSize(11);
  
  // Name
  pdf.setFont('helvetica', 'bold');
  pdf.text('Name:', margin, yPosition);
  pdf.setFont('helvetica', 'normal');
  const nameLabelWidth = pdf.getTextWidth('Name:');
  pdf.text(` ${data.applicantName}`, margin + nameLabelWidth, yPosition);
  const nameWidth = pdf.getTextWidth(`Name: ${data.applicantName}`);
  
  // Date of Birth
  pdf.setFont('helvetica', 'bold');
  pdf.text('Date of Birth:', margin + nameWidth + 15, yPosition);
  const dobLabelWidth = pdf.getTextWidth('Date of Birth:');
  pdf.setFont('helvetica', 'normal');
  pdf.text(` ${data.applicantDOB || ''}`, margin + nameWidth + 15 + dobLabelWidth, yPosition);
  
  yPosition += lineHeight;
  
  // Postcode
  pdf.setFont('helvetica', 'bold');
  pdf.text('Postcode:', margin, yPosition);
  const postcodeLabelWidth = pdf.getTextWidth('Postcode:');
  pdf.setFont('helvetica', 'normal');
  pdf.text(` ${data.applicantPostcode || ''}`, margin + postcodeLabelWidth, yPosition);
  yPosition += 18;

  // Referee Information
  drawSectionHeader('Referee Information', yPosition);
  yPosition += 12;
  
  pdf.setTextColor(...colors.textDark);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Name:', margin, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(data.referee.name || '', margin + 30, yPosition);
  yPosition += lineHeight;
  
  if (data.referee.jobTitle) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('Job Title:', margin, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.referee.jobTitle, margin + 30, yPosition);
    yPosition += lineHeight;
  }
  yPosition += 8;

  // Reference specific content
  ensureSpace(60);
  if (data.referenceType === 'employer') {
    pdf.setTextColor(...colors.textDark);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text('Are you this person\'s current or previous employer?', margin, yPosition);
    yPosition += lineHeight + 2;
    
    pdf.setFont('helvetica', 'normal');
    const currentChecked = data.employmentStatus === 'current';
    const previousChecked = data.employmentStatus === 'previous';
    const neitherChecked = data.employmentStatus === 'neither';
    
    drawCheckbox(currentChecked, margin, yPosition);
    pdf.text('Current', margin + 8, yPosition);
    drawCheckbox(previousChecked, margin + 40, yPosition);
    pdf.text('Previous', margin + 48, yPosition);
    drawCheckbox(neitherChecked, margin + 85, yPosition);
    pdf.text('Neither', margin + 93, yPosition);
    yPosition += lineHeight + 5;

    ensureSpace(25);
    pdf.setTextColor(...colors.textDark);
    pdf.setFont('helvetica', 'bold');
    pdf.text('What is your relationship to this person?', margin, yPosition);
    yPosition += lineHeight;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...colors.textMuted);
    yPosition = addWrappedText(`${data.referee.jobTitle || ''}`, margin, yPosition, pageWidth - 2 * margin);
    yPosition += 5;

    ensureSpace(20);
    pdf.setTextColor(...colors.textDark);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Person\'s job title:', margin, yPosition);
    yPosition += lineHeight;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...colors.textMuted);
    pdf.text(`${data.applicantPosition || ''}`, margin, yPosition);
    yPosition += lineHeight + 5;

    ensureSpace(20);
    pdf.setTextColor(...colors.textDark);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Employment Period:', margin, yPosition);
    yPosition += lineHeight;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...colors.textMuted);
    const startDate = data.employmentFrom || '';
    const endDate = data.employmentTo || '';
    pdf.text(`From ${startDate} to ${endDate}`, margin, yPosition);
    yPosition += lineHeight + 5;

    ensureSpace(20);
    pdf.setTextColor(...colors.textDark);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Recent attendance record:', margin, yPosition);
    yPosition += lineHeight + 2;
    
    pdf.setFont('helvetica', 'normal');
    drawCheckbox(true, margin, yPosition);
    pdf.text('Good', margin + 8, yPosition);
    drawCheckbox(false, margin + 35, yPosition);
    pdf.text('Average', margin + 43, yPosition);
    drawCheckbox(false, margin + 80, yPosition);
    pdf.text('Poor', margin + 88, yPosition);
    yPosition += lineHeight + 5;

    ensureSpace(30);
    pdf.setTextColor(...colors.textDark);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Why did the person leave your employment?', margin, yPosition);
    yPosition += lineHeight;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...colors.textMuted);
    yPosition = addWrappedText(`${data.reasonForLeaving || ''}`, margin, yPosition, pageWidth - 2 * margin);
    yPosition += 5;
  } else {
    ensureSpace(40);
    pdf.setTextColor(...colors.textDark);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Do you know this person from outside employment or education?', margin, yPosition);
    yPosition += lineHeight + 2;
    
    pdf.setFont('helvetica', 'normal');
    drawCheckbox(true, margin, yPosition);
    pdf.text('Yes', margin + 8, yPosition);
    drawCheckbox(false, margin + 30, yPosition);
    pdf.text('No', margin + 38, yPosition);
    yPosition += lineHeight + 8;

    pdf.setTextColor(...colors.textDark);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Describe your relationship with this person:', margin, yPosition);
    yPosition += lineHeight;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...colors.textMuted);
    yPosition = addWrappedText('', margin, yPosition, pageWidth - 2 * margin);
    yPosition += 8;
  }

  // Character qualities section
  ensureSpace(70);
  drawSectionHeader('Character Qualities', yPosition);
  yPosition += 12;
  
  pdf.setTextColor(...colors.textDark);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('Which of the following describes this person?', margin, yPosition);
  yPosition += lineHeight + 5;

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

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...colors.textDark);
  
  const columnWidth = (pageWidth - 2 * margin) / 2;
  for (let i = 0; i < qualities.length; i += 2) {
    ensureSpace(10);
    
    drawCheckbox(true, margin, yPosition);
    pdf.text(qualities[i], margin + 8, yPosition);
    
    if (i + 1 < qualities.length) {
      const rightStartX = margin + columnWidth;
      drawCheckbox(true, rightStartX, yPosition);
      pdf.text(qualities[i + 1], rightStartX + 8, yPosition);
    }
    
    yPosition += lineHeight + 2;
  }

  ensureSpace(30);
  yPosition += 5;
  pdf.setTextColor(...colors.textDark);
  pdf.setFont('helvetica', 'bold');
  pdf.text('If you did not tick one or more of the above, please explain:', margin, yPosition);
  yPosition += lineHeight;
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...colors.textMuted);
  yPosition = addWrappedText('Not provided', margin, yPosition, pageWidth - 2 * margin);
  yPosition += 8;

  // Criminal background questions
  ensureSpace(120);
  
  pdf.setFillColor(...colors.warningLight);
  const sectionHeight = 85;
  pdf.rect(margin - 5, yPosition - 8, pageWidth - 2 * margin + 10, sectionHeight, 'F');
  pdf.setDrawColor(...colors.warning);
  pdf.setLineWidth(0.5);
  pdf.rect(margin - 5, yPosition - 8, pageWidth - 2 * margin + 10, sectionHeight);
  
  pdf.setTextColor(...colors.warning);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.text('⚠ CRIMINAL BACKGROUND CHECK', margin, yPosition);
  yPosition += lineHeight + 5;
  
  pdf.setTextColor(...colors.textDark);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  yPosition = addWrappedText('Are you aware of any convictions, cautions, reprimands or final warnings that the person may have received that are not \'protected\' as defined by the Rehabilitation of Offenders Act 1974?', margin, yPosition, pageWidth - 2 * margin - 10, 10);
  yPosition += 3;
  
  pdf.setFont('helvetica', 'normal');
  drawCheckbox(false, margin, yPosition);
  pdf.text('Yes', margin + 8, yPosition);
  drawCheckbox(true, margin + 30, yPosition);
  pdf.text('No', margin + 38, yPosition);
  yPosition += lineHeight + 8;

  ensureSpace(50);
  pdf.setTextColor(...colors.textDark);
  pdf.setFont('helvetica', 'bold');
  yPosition = addWrappedText('Is this person currently the subject of any criminal proceedings or police investigation?', margin, yPosition, pageWidth - 2 * margin - 10, 10);
  yPosition += 3;
  
  pdf.setFont('helvetica', 'normal');
  drawCheckbox(false, margin, yPosition);
  pdf.text('Yes', margin + 8, yPosition);
  drawCheckbox(true, margin + 30, yPosition);
  pdf.text('No', margin + 38, yPosition);
  yPosition += lineHeight + 15;

  // Additional Comments
  ensureSpace(40);
  drawSectionHeader('Additional Comments', yPosition);
  yPosition += 12;
  
  pdf.setTextColor(...colors.textMuted);
  pdf.setFont('helvetica', 'normal');
  yPosition = addWrappedText('Not provided', margin, yPosition, pageWidth - 2 * margin);
  yPosition += 12;

  // Declaration
  ensureSpace(35);
  drawSectionHeader('Declaration', yPosition);
  yPosition += 12;
  
  pdf.setTextColor(...colors.textDark);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  const declarationText = 'I certify that, to the best of my knowledge, the information I have given is true and complete. I understand that any deliberate omission, falsification or misrepresentation may lead to refusal of appointment or dismissal.';
  yPosition = addWrappedText(declarationText, margin, yPosition, pageWidth - 2 * margin, 10);
  yPosition += 12;

  // Footer section with gray background
  ensureSpace(60);
  pdf.setFillColor(...colors.background);
  pdf.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 50, 'F');
  
  pdf.setTextColor(...colors.textDark);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('Reference Details', margin, yPosition);
  yPosition += lineHeight + 3;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...colors.textMuted);
  pdf.text('Referee:', margin, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(data.referee.name || '', margin + 35, yPosition);
  yPosition += lineHeight;

  pdf.setFont('helvetica', 'bold');
  pdf.text('Job Title:', margin, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(data.referee.jobTitle || '', margin + 35, yPosition);
  yPosition += lineHeight;

  const createdKey = `{R${data.referenceNumber || 1}_Created}`;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Created:', margin, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(createdKey, margin + 35, yPosition);
  
  const signatureKey = `{R${data.referenceNumber || 1}_Signed}`;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Sent:', margin + 90, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(signatureKey, margin + 110, yPosition);
  yPosition += lineHeight;

  pdf.setFont('helvetica', 'bold');
  pdf.text('Completed:', margin, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(signatureKey, margin + 35, yPosition);

  return pdf;
};