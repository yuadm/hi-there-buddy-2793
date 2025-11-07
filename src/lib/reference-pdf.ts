import { PDFDocument, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import DejaVuSansRegularUrl from '@/assets/fonts/dejavu/DejaVuSans.ttf'
import DejaVuSansBoldUrl from '@/assets/fonts/dejavu/DejaVuSans-Bold.ttf'

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
  const doc = await PDFDocument.create()
  doc.registerFontkit(fontkit)

  // Load fonts
  const regularBytes = await fetch(DejaVuSansRegularUrl).then(r => r.arrayBuffer())
  const boldBytes = await fetch(DejaVuSansBoldUrl).then(r => r.arrayBuffer())
  const font = await doc.embedFont(new Uint8Array(regularBytes), { subset: true })
  const boldFont = await doc.embedFont(new Uint8Array(boldBytes), { subset: true })

  // Try to embed company logo (optional)
  let embeddedLogo: any | undefined
  if (companySettings.logo) {
    try {
      const logoBytes = await fetch(companySettings.logo).then(r => r.arrayBuffer())
      try {
        embeddedLogo = await doc.embedPng(logoBytes)
      } catch {
        embeddedLogo = await doc.embedJpg(logoBytes)
      }
    } catch {
      embeddedLogo = undefined
    }
  }

  // Create first page
  let page = doc.addPage([595, 842]) // A4 size
  const pageWidth = page.getWidth()
  const pageHeight = page.getHeight()
  const margin = 15
  const lineHeight = 7
  let yPosition = pageHeight - 25

  // Colors
  const black = rgb(0, 0, 0)
  const gray = rgb(0.5, 0.5, 0.5)

  // Helper to add new page with border
  const addNewPage = () => {
    page = doc.addPage([595, 842])
    // Add border
    page.drawRectangle({
      x: 10,
      y: 10,
      width: pageWidth - 20,
      height: pageHeight - 20,
      borderColor: black,
      borderWidth: 0.5,
    })
    yPosition = pageHeight - 25
  }

  // Helper to ensure space on page
  const ensureSpace = (needed: number) => {
    if (yPosition - needed < 25) {
      addNewPage()
    }
  }

  // Helper to wrap text
  const wrapText = (text: string, maxWidth: number, f = font, size = 11) => {
    const words = (text || '').split(/\s+/).filter(Boolean)
    const lines: string[] = []
    let line = ''
    for (const w of words) {
      const test = line ? line + ' ' + w : w
      if (f.widthOfTextAtSize(test, size) <= maxWidth) line = test
      else { if (line) lines.push(line); line = w }
    }
    if (line) lines.push(line)
    return lines.length ? lines : ['']
  }

  // Helper to add wrapped text
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 11): number => {
    const lines = wrapText(text, maxWidth, font, fontSize)
    for (const line of lines) {
      page.drawText(line, {
        x,
        y,
        size: fontSize,
        font,
        color: black,
      })
      y -= lineHeight
    }
    return y
  }

  // Add border to first page
  page.drawRectangle({
    x: 10,
    y: 10,
    width: pageWidth - 20,
    height: pageHeight - 20,
    borderColor: black,
    borderWidth: 0.5,
  })

  // Add logo if available
  if (embeddedLogo) {
    const maxWidth = 50
    const maxHeight = 25
    const scale = Math.min(maxWidth / embeddedLogo.width, maxHeight / embeddedLogo.height, 1)
    const logoWidth = embeddedLogo.width * scale
    const logoHeight = embeddedLogo.height * scale
    const logoX = (pageWidth / 2) - (logoWidth / 2)
    
    page.drawImage(embeddedLogo, {
      x: logoX,
      y: yPosition - logoHeight,
      width: logoWidth,
      height: logoHeight,
    })
    yPosition -= logoHeight + 10
  }

  // Company name
  const companyNameWidth = boldFont.widthOfTextAtSize(companySettings.name, 12)
  page.drawText(companySettings.name, {
    x: (pageWidth / 2) - (companyNameWidth / 2),
    y: yPosition,
    size: 12,
    font: boldFont,
    color: black,
  })
  yPosition -= 12

  // Header
  const referenceType = reference.reference_type === 'employer' ? 'Employment reference for' : 'Character reference for'
  const headerWidth = boldFont.widthOfTextAtSize(referenceType, 14)
  page.drawText(referenceType, {
    x: (pageWidth / 2) - (headerWidth / 2),
    y: yPosition,
    size: 14,
    font: boldFont,
    color: black,
  })
  yPosition -= 12

  // Applicant Information - Horizontal Layout
  const infoLine = `Name: ${applicantName}     Date of Birth: ${applicantDOB}     Postcode: ${applicantPostcode}`
  const nameLabel = 'Name:'
  const nameLabelWidth = boldFont.widthOfTextAtSize(nameLabel, 12)
  page.drawText(nameLabel, { x: margin, y: yPosition, size: 12, font: boldFont, color: black })
  page.drawText(` ${applicantName}`, { x: margin + nameLabelWidth, y: yPosition, size: 12, font, color: black })
  
  const nameWidth = boldFont.widthOfTextAtSize('Name:', 12) + font.widthOfTextAtSize(` ${applicantName}`, 12)
  const dobLabel = 'Date of Birth:'
  const dobLabelWidth = boldFont.widthOfTextAtSize(dobLabel, 12)
  page.drawText(dobLabel, { x: margin + nameWidth + 20, y: yPosition, size: 12, font: boldFont, color: black })
  page.drawText(` ${applicantDOB}`, { x: margin + nameWidth + 20 + dobLabelWidth, y: yPosition, size: 12, font, color: black })
  
  const dobWidth = boldFont.widthOfTextAtSize('Date of Birth:', 12) + font.widthOfTextAtSize(` ${applicantDOB}`, 12)
  const postcodeLabel = 'Postcode:'
  const postcodeLabelWidth = boldFont.widthOfTextAtSize(postcodeLabel, 12)
  page.drawText(postcodeLabel, { x: margin + nameWidth + dobWidth + 40, y: yPosition, size: 12, font: boldFont, color: black })
  page.drawText(` ${applicantPostcode}`, { x: margin + nameWidth + dobWidth + 40 + postcodeLabelWidth, y: yPosition, size: 12, font, color: black })
  yPosition -= 15

  // Referee Information
  page.drawText('Referee Name:', { x: margin, y: yPosition, size: 12, font: boldFont, color: black })
  page.drawText(reference.form_data.refereeFullName || '', { x: margin + 70, y: yPosition, size: 12, font, color: black })
  
  if (reference.form_data.refereeJobTitle) {
    page.drawText('Job Title:', { x: margin + 200, y: yPosition, size: 12, font: boldFont, color: black })
    page.drawText(reference.form_data.refereeJobTitle, { x: margin + 250, y: yPosition, size: 12, font, color: black })
  }
  yPosition -= 15

  // Reference specific content
  ensureSpace(60)
  if (reference.reference_type === 'employer') {
    // Employment Status
    page.drawText('Are you this person\'s current or previous employer?', { x: margin, y: yPosition, size: 11, font: boldFont, color: black })
    yPosition -= lineHeight
    const currentBox = reference.form_data.employmentStatus === 'current' ? '[X]' : '[ ]'
    const previousBox = reference.form_data.employmentStatus === 'previous' ? '[X]' : '[ ]'
    const neitherBox = reference.form_data.employmentStatus === 'neither' ? '[X]' : '[ ]'
    page.drawText(`${currentBox} Current    ${previousBox} Previous    ${neitherBox} Neither`, { x: margin, y: yPosition, size: 11, font, color: black })
    yPosition -= lineHeight + 2

    // Relationship Description
    ensureSpace(25)
    page.drawText('What is your relationship to this person (e.g. "I am her/his manager")?', { x: margin, y: yPosition, size: 11, font: boldFont, color: black })
    yPosition -= lineHeight
    yPosition = addWrappedText(reference.form_data.relationshipDescription || 'Not provided', margin, yPosition, pageWidth - 2 * margin)
    yPosition -= 2

    // Job Title
    ensureSpace(20)
    page.drawText('Please state the person\'s job title:', { x: margin, y: yPosition, size: 11, font: boldFont, color: black })
    yPosition -= lineHeight
    page.drawText(reference.form_data.jobTitle || 'Not provided', { x: margin, y: yPosition, size: 11, font, color: black })
    yPosition -= lineHeight + 2

    // Employment Dates
    ensureSpace(20)
    page.drawText('Employment Period:', { x: margin, y: yPosition, size: 11, font: boldFont, color: black })
    yPosition -= lineHeight
    const startDate = reference.form_data.startDate ? new Date(reference.form_data.startDate).toLocaleDateString() : 'Not provided'
    const endDate = reference.form_data.endDate ? new Date(reference.form_data.endDate).toLocaleDateString() : 'Not provided'
    page.drawText(`From ${startDate} to ${endDate}`, { x: margin, y: yPosition, size: 11, font, color: black })
    yPosition -= lineHeight + 2

    // Attendance
    ensureSpace(20)
    page.drawText('How would you describe their recent attendance record?', { x: margin, y: yPosition, size: 11, font: boldFont, color: black })
    yPosition -= lineHeight
    const goodBox = reference.form_data.attendance === 'good' ? '[X]' : '[ ]'
    const averageBox = reference.form_data.attendance === 'average' ? '[X]' : '[ ]'
    const poorBox = reference.form_data.attendance === 'poor' ? '[X]' : '[ ]'
    page.drawText(`${goodBox} Good    ${averageBox} Average    ${poorBox} Poor`, { x: margin, y: yPosition, size: 11, font, color: black })
    yPosition -= lineHeight + 2

    // Leaving Reason
    ensureSpace(30)
    page.drawText('Why did the person leave your employment (if they are still employed, please write \'still employed\')?', { x: margin, y: yPosition, size: 11, font: boldFont, color: black })
    yPosition -= lineHeight
    yPosition = addWrappedText(reference.form_data.leavingReason || 'Not provided', margin, yPosition, pageWidth - 2 * margin)
    yPosition -= 2
  } else {
    // Character reference specific content
    ensureSpace(40)
    page.drawText('Do you know this person from outside employment or education?', { x: margin, y: yPosition, size: 11, font: boldFont, color: black })
    yPosition -= lineHeight
    const outsideYesBox = reference.form_data.employmentStatus === 'yes' ? '[X]' : '[ ]'
    const outsideNoBox = reference.form_data.employmentStatus === 'no' ? '[X]' : '[ ]'
    page.drawText(`${outsideYesBox} Yes    ${outsideNoBox} No`, { x: margin, y: yPosition, size: 11, font, color: black })
    yPosition -= lineHeight + 5

    page.drawText('Please describe your relationship with this person, including how long you have known them:', { x: margin, y: yPosition, size: 11, font: boldFont, color: black })
    yPosition -= lineHeight
    yPosition = addWrappedText(reference.form_data.relationshipDescription || 'Not provided', margin, yPosition, pageWidth - 2 * margin)
    yPosition -= 5
  }

  // Character qualities - Horizontal layout in 2 columns
  ensureSpace(60)
  page.drawText('In your opinion, which of the following describes this person (tick each that is true)?', { x: margin, y: yPosition, size: 11, font: boldFont, color: black })
  yPosition -= lineHeight + 3

  const qualities = [
    { key: 'honestTrustworthy', label: 'Honest and trustworthy' },
    { key: 'communicatesEffectively', label: 'Communicates effectively' },
    { key: 'effectiveTeamMember', label: 'An effective team member' },
    { key: 'respectfulConfidentiality', label: 'Respectful of confidentiality' },
    { key: 'reliablePunctual', label: 'Reliable and punctual' },
    { key: 'suitablePosition', label: 'Suitable for the position applied for' },
    { key: 'kindCompassionate', label: 'Kind and compassionate' },
    { key: 'worksIndependently', label: 'Able to work well without close supervision' },
  ]

  // Display qualities in 2 columns
  const columnWidth = (pageWidth - 2 * margin) / 2
  for (let i = 0; i < qualities.length; i += 2) {
    ensureSpace(8)
    
    // Left column quality
    const leftQuality = qualities[i]
    const leftChecked = reference.form_data[leftQuality.key as keyof ReferenceData]
    const leftCheckbox = leftChecked ? '[X]' : '[ ]'
    page.drawText(leftCheckbox, { x: margin, y: yPosition, size: 11, font, color: black })
    page.drawText(leftQuality.label, { x: margin + 10, y: yPosition, size: 11, font, color: black })
    
    // Right column quality (if exists)
    if (i + 1 < qualities.length) {
      const rightQuality = qualities[i + 1]
      const rightChecked = reference.form_data[rightQuality.key as keyof ReferenceData]
      const rightCheckbox = rightChecked ? '[X]' : '[ ]'
      const rightStartX = margin + columnWidth
      page.drawText(rightCheckbox, { x: rightStartX, y: yPosition, size: 11, font, color: black })
      page.drawText(rightQuality.label, { x: rightStartX + 10, y: yPosition, size: 11, font, color: black })
    }
    
    yPosition -= lineHeight
  }

  // Qualities not ticked reason
  ensureSpace(30)
  yPosition -= 3
  page.drawText('If you did not tick one or more of the above, please tell us why here:', { x: margin, y: yPosition, size: 11, font: boldFont, color: black })
  yPosition -= lineHeight
  yPosition = addWrappedText(reference.form_data.qualitiesNotTickedReason || 'Not provided', margin, yPosition, pageWidth - 2 * margin)
  yPosition -= 5

  // Criminal background questions - CRITICAL SECTION
  ensureSpace(100)
  page.drawText('CRIMINAL BACKGROUND CHECK', { x: margin, y: yPosition, size: 12, font: boldFont, color: black })
  yPosition -= lineHeight + 3
  
  const criminalQ1 = 'The position this person has applied for involves working with vulnerable people. Are you aware of any convictions, cautions, reprimands or final warnings that the person may have received that are not \'protected\' as defined by the Rehabilitation of Offenders Act 1974 (Exceptions) Order 1975 (as amended in 2013 by SI 210 1198)?'
  const q1Lines = wrapText(criminalQ1, pageWidth - 2 * margin, boldFont, 11)
  for (const line of q1Lines) {
    page.drawText(line, { x: margin, y: yPosition, size: 11, font: boldFont, color: black })
    yPosition -= lineHeight
  }
  yPosition -= 3
  const convictionsYesBox = reference.form_data.convictionsKnown === 'yes' ? '[X]' : '[ ]'
  const convictionsNoBox = reference.form_data.convictionsKnown === 'no' ? '[X]' : '[ ]'
  const convictionsAnswer = reference.form_data.convictionsKnown ? `${convictionsYesBox} Yes    ${convictionsNoBox} No` : 'Not answered'
  page.drawText(convictionsAnswer, { x: margin, y: yPosition, size: 11, font, color: black })
  yPosition -= lineHeight + 8

  ensureSpace(50)
  const criminalQ2 = 'To your knowledge, is this person currently the subject of any criminal proceedings (for example, charged or summoned but not yet dealt with) or any police investigation?'
  const q2Lines = wrapText(criminalQ2, pageWidth - 2 * margin, boldFont, 11)
  for (const line of q2Lines) {
    page.drawText(line, { x: margin, y: yPosition, size: 11, font: boldFont, color: black })
    yPosition -= lineHeight
  }
  yPosition -= 3
  const proceedingsYesBox = reference.form_data.criminalProceedingsKnown === 'yes' ? '[X]' : '[ ]'
  const proceedingsNoBox = reference.form_data.criminalProceedingsKnown === 'no' ? '[X]' : '[ ]'
  const proceedingsAnswer = reference.form_data.criminalProceedingsKnown ? `${proceedingsYesBox} Yes    ${proceedingsNoBox} No` : 'Not answered'
  page.drawText(proceedingsAnswer, { x: margin, y: yPosition, size: 11, font, color: black })
  yPosition -= lineHeight + 8

  // Criminal details if provided
  if (reference.form_data.convictionsKnown === 'yes' || reference.form_data.criminalProceedingsKnown === 'yes' || reference.form_data.criminalDetails) {
    ensureSpace(40)
    page.drawText('Details provided:', { x: margin, y: yPosition, size: 11, font: boldFont, color: black })
    yPosition -= lineHeight
    yPosition = addWrappedText(reference.form_data.criminalDetails || 'Not provided', margin, yPosition, pageWidth - 2 * margin)
    yPosition -= 10
  }

  // Additional Comments
  ensureSpace(40)
  page.drawText('Any additional comments you would like to make about this person:', { x: margin, y: yPosition, size: 11, font: boldFont, color: black })
  yPosition -= lineHeight
  yPosition = addWrappedText(reference.form_data.additionalComments || 'Not provided', margin, yPosition, pageWidth - 2 * margin)
  yPosition -= 10

  // Declaration and Date
  ensureSpace(30)
  page.drawText('DECLARATION', { x: margin, y: yPosition, size: 11, font: boldFont, color: black })
  yPosition -= lineHeight + 3
  const declarationText = 'I certify that, to the best of my knowledge, the information I have given is true and complete. I understand that any deliberate omission, falsification or misrepresentation may lead to refusal of appointment or dismissal.'
  yPosition = addWrappedText(declarationText, margin, yPosition, pageWidth - 2 * margin)
  yPosition -= 8

  // Referee Information
  ensureSpace(70)
  page.drawText('REFEREE INFORMATION', { x: margin, y: yPosition, size: 11, font: boldFont, color: black })
  yPosition -= lineHeight + 3
  
  page.drawText('Referee Name:', { x: margin, y: yPosition, size: 11, font: boldFont, color: black })
  page.drawText(reference.form_data.refereeFullName || '', { x: margin + 110, y: yPosition, size: 11, font, color: black })
  yPosition -= lineHeight

  page.drawText('Referee Job Title:', { x: margin, y: yPosition, size: 11, font: boldFont, color: black })
  page.drawText(reference.form_data.refereeJobTitle || '', { x: margin + 110, y: yPosition, size: 11, font, color: black })
  yPosition -= lineHeight

  page.drawText('Reference Created:', { x: margin, y: yPosition, size: 11, font: boldFont, color: black })
  page.drawText(new Date(reference.created_at).toLocaleDateString(), { x: margin + 110, y: yPosition, size: 11, font, color: black })
  yPosition -= lineHeight

  page.drawText('Reference Sent:', { x: margin, y: yPosition, size: 11, font: boldFont, color: black })
  page.drawText(new Date(reference.sent_at).toLocaleDateString(), { x: margin + 110, y: yPosition, size: 11, font, color: black })
  yPosition -= lineHeight

  page.drawText('Reference Completed:', { x: margin, y: yPosition, size: 11, font: boldFont, color: black })
  page.drawText(new Date(reference.completed_at).toLocaleDateString(), { x: margin + 110, y: yPosition, size: 11, font, color: black })
  yPosition -= lineHeight + 5

  // Save & download
  const bytes = await doc.save()
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const filename = `${reference.reference_name}_${applicantName.replace(/\s+/g, '_')}.pdf`
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
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

export const generateManualReferencePDF = async (
  data: ManualReferenceInput,
  companySettings: CompanySettings = { name: 'Company Name' }
) => {
  const doc = await PDFDocument.create()
  doc.registerFontkit(fontkit)

  // Load fonts
  const regularBytes = await fetch(DejaVuSansRegularUrl).then(r => r.arrayBuffer())
  const boldBytes = await fetch(DejaVuSansBoldUrl).then(r => r.arrayBuffer())
  const font = await doc.embedFont(new Uint8Array(regularBytes), { subset: true })
  const boldFont = await doc.embedFont(new Uint8Array(boldBytes), { subset: true })

  // Try to embed company logo (optional)
  let embeddedLogo: any | undefined
  if (companySettings.logo) {
    try {
      const logoBytes = await fetch(companySettings.logo).then(r => r.arrayBuffer())
      try {
        embeddedLogo = await doc.embedPng(logoBytes)
      } catch {
        embeddedLogo = await doc.embedJpg(logoBytes)
      }
    } catch {
      embeddedLogo = undefined
    }
  }

  // Create first page
  let page = doc.addPage([595, 842]) // A4 size
  const pageWidth = page.getWidth()
  const pageHeight = page.getHeight()
  const margin = 15
  const lineHeight = 7
  let yPosition = pageHeight - 25

  // Colors
  const black = rgb(0, 0, 0)
  const gray = rgb(0.5, 0.5, 0.5)

  // Helper to add new page with border
  const addNewPage = () => {
    page = doc.addPage([595, 842])
    // Add border
    page.drawRectangle({
      x: 10,
      y: 10,
      width: pageWidth - 20,
      height: pageHeight - 20,
      borderColor: black,
      borderWidth: 0.5,
    })
    yPosition = pageHeight - 25
  }

  // Helper to ensure space on page
  const ensureSpace = (needed: number) => {
    if (yPosition - needed < 25) {
      addNewPage()
    }
  }

  // Helper to wrap text
  const wrapText = (text: string, maxWidth: number, f = font, size = 11) => {
    const words = (text || '').split(/\s+/).filter(Boolean)
    const lines: string[] = []
    let line = ''
    for (const w of words) {
      const test = line ? line + ' ' + w : w
      if (f.widthOfTextAtSize(test, size) <= maxWidth) line = test
      else { if (line) lines.push(line); line = w }
    }
    if (line) lines.push(line)
    return lines.length ? lines : ['']
  }

  // Helper to add wrapped text
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 11): number => {
    const lines = wrapText(text, maxWidth, font, fontSize)
    for (const line of lines) {
      page.drawText(line, {
        x,
        y,
        size: fontSize,
        font,
        color: black,
      })
      y -= lineHeight
    }
    return y
  }

  // Add border to first page
  page.drawRectangle({
    x: 10,
    y: 10,
    width: pageWidth - 20,
    height: pageHeight - 20,
    borderColor: black,
    borderWidth: 0.5,
  })

  // Add logo if available
  if (embeddedLogo) {
    const maxWidth = 50
    const maxHeight = 25
    const scale = Math.min(maxWidth / embeddedLogo.width, maxHeight / embeddedLogo.height, 1)
    const logoWidth = embeddedLogo.width * scale
    const logoHeight = embeddedLogo.height * scale
    const logoX = (pageWidth / 2) - (logoWidth / 2)
    
    page.drawImage(embeddedLogo, {
      x: logoX,
      y: yPosition - logoHeight,
      width: logoWidth,
      height: logoHeight,
    })
    yPosition -= logoHeight + 10
  }

  // Company name
  const companyNameWidth = boldFont.widthOfTextAtSize(companySettings.name, 12)
  page.drawText(companySettings.name, {
    x: (pageWidth / 2) - (companyNameWidth / 2),
    y: yPosition,
    size: 12,
    font: boldFont,
    color: black,
  })
  yPosition -= 12

  // Title
  const referenceTitle = data.referenceType === 'employer' ? 'Employment reference for' : 'Character reference for'
  const titleWidth = boldFont.widthOfTextAtSize(referenceTitle, 14)
  page.drawText(referenceTitle, {
    x: (pageWidth / 2) - (titleWidth / 2),
    y: yPosition,
    size: 14,
    font: boldFont,
    color: black,
  })
  yPosition -= 12

  // Basic Information - Horizontal Layout
  const nameLabel = 'Name:'
  const nameLabelWidth = boldFont.widthOfTextAtSize(nameLabel, 12)
  page.drawText(nameLabel, { x: margin, y: yPosition, size: 12, font: boldFont, color: black })
  page.drawText(` ${data.applicantName}`, { x: margin + nameLabelWidth, y: yPosition, size: 12, font, color: black })
  
  const nameWidth = boldFont.widthOfTextAtSize('Name:', 12) + font.widthOfTextAtSize(` ${data.applicantName}`, 12)
  const dobLabel = 'Date of Birth:'
  const dobLabelWidth = boldFont.widthOfTextAtSize(dobLabel, 12)
  page.drawText(dobLabel, { x: margin + nameWidth + 20, y: yPosition, size: 12, font: boldFont, color: black })
  page.drawText(` ${data.applicantDOB || ''}`, { x: margin + nameWidth + 20 + dobLabelWidth, y: yPosition, size: 12, font, color: black })
  
  const dobWidth = boldFont.widthOfTextAtSize('Date of Birth:', 12) + font.widthOfTextAtSize(` ${data.applicantDOB || ''}`, 12)
  const postcodeLabel = 'Postcode:'
  const postcodeLabelWidth = boldFont.widthOfTextAtSize(postcodeLabel, 12)
  page.drawText(postcodeLabel, { x: margin + nameWidth + dobWidth + 40, y: yPosition, size: 12, font: boldFont, color: black })
  page.drawText(` ${data.applicantPostcode || ''}`, { x: margin + nameWidth + dobWidth + 40 + postcodeLabelWidth, y: yPosition, size: 12, font, color: black })
  yPosition -= 15

  // Referee Information
  page.drawText('Referee Name:', { x: margin, y: yPosition, size: 12, font: boldFont, color: black })
  page.drawText(data.referee.name || '', { x: margin + 70, y: yPosition, size: 12, font, color: black })
  
  if (data.referee.jobTitle) {
    page.drawText('Job Title:', { x: margin + 200, y: yPosition, size: 12, font: boldFont, color: black })
    page.drawText(data.referee.jobTitle, { x: margin + 250, y: yPosition, size: 12, font, color: black })
  }
  yPosition -= 15

  // Reference specific content
  ensureSpace(60)
  if (data.referenceType === 'employer') {
    // Employment Status with proper checkboxes
    page.drawText('Are you this person\'s current or previous employer?', { x: margin, y: yPosition, size: 11, font: boldFont, color: black })
    yPosition -= lineHeight
    
    const currentCheck = data.employmentStatus === 'current' ? '[X]' : '[ ]'
    const previousCheck = data.employmentStatus === 'previous' ? '[X]' : '[ ]'
    const neitherCheck = data.employmentStatus === 'neither' ? '[X]' : '[ ]'
    page.drawText(`${currentCheck} Current    ${previousCheck} Previous    ${neitherCheck} Neither`, { x: margin, y: yPosition, size: 11, font, color: black })
    yPosition -= lineHeight + 2

    // Relationship Description - prefill with Referee Job Title
    ensureSpace(25)
    page.drawText('What is your relationship to this person (e.g. "I am her/his manager")?', { x: margin, y: yPosition, size: 11, font: boldFont, color: black })
    yPosition -= lineHeight
    yPosition = addWrappedText(data.referee.jobTitle || '', margin, yPosition, pageWidth - 2 * margin)
    yPosition -= 2

    // Job Title
    ensureSpace(20)
    page.drawText('Please state the person\'s job title:', { x: margin, y: yPosition, size: 11, font: boldFont, color: black })
    yPosition -= lineHeight
    page.drawText(data.applicantPosition || '', { x: margin, y: yPosition, size: 11, font, color: black })
    yPosition -= lineHeight + 2

    // Employment Dates
    ensureSpace(20)
    page.drawText('Employment Period:', { x: margin, y: yPosition, size: 11, font: boldFont, color: black })
    yPosition -= lineHeight
    const startDate = data.employmentFrom || ''
    const endDate = data.employmentTo || ''
    page.drawText(`From ${startDate} to ${endDate}`, { x: margin, y: yPosition, size: 11, font, color: black })
    yPosition -= lineHeight + 2

    // Attendance - leave unchecked
    ensureSpace(20)
    page.drawText('How would you describe their recent attendance record?', { x: margin, y: yPosition, size: 11, font: boldFont, color: black })
    yPosition -= lineHeight
    page.drawText('[X] Good    [ ] Average    [ ] Poor', { x: margin, y: yPosition, size: 11, font, color: black })
    yPosition -= lineHeight + 2

    // Leaving Reason
    ensureSpace(30)
    page.drawText('Why did the person leave your employment (if they are still employed, please write \'still employed\')?', { x: margin, y: yPosition, size: 11, font: boldFont, color: black })
    yPosition -= lineHeight
    yPosition = addWrappedText(data.reasonForLeaving || '', margin, yPosition, pageWidth - 2 * margin)
    yPosition -= 2
  } else {
    // Character reference specific content
    ensureSpace(40)
    page.drawText('Do you know this person from outside employment or education?', { x: margin, y: yPosition, size: 11, font: boldFont, color: black })
    yPosition -= lineHeight
    page.drawText('[X] Yes    [ ] No', { x: margin, y: yPosition, size: 11, font, color: black })
    yPosition -= lineHeight + 5

    page.drawText('Please describe your relationship with this person, including how long you have known them:', { x: margin, y: yPosition, size: 11, font: boldFont, color: black })
    yPosition -= lineHeight
    yPosition = addWrappedText('', margin, yPosition, pageWidth - 2 * margin)
    yPosition -= 5
  }

  // Character qualities - Horizontal layout in 2 columns
  ensureSpace(60)
  page.drawText('In your opinion, which of the following describes this person (tick each that is true)?', { x: margin, y: yPosition, size: 11, font: boldFont, color: black })
  yPosition -= lineHeight + 3

  const qualities = [
    { label: 'Honest and trustworthy' },
    { label: 'Communicates effectively' },
    { label: 'An effective team member' },
    { label: 'Respectful of confidentiality' },
    { label: 'Reliable and punctual' },
    { label: 'Suitable for the position applied for' },
    { label: 'Kind and compassionate' },
    { label: 'Able to work well without close supervision' },
  ]

  // Display qualities in 2 columns - leave unchecked by default
  const columnWidth = (pageWidth - 2 * margin) / 2
  for (let i = 0; i < qualities.length; i += 2) {
    ensureSpace(8)
    
    // Left column quality - preselected
    page.drawText('[X]', { x: margin, y: yPosition, size: 11, font, color: black })
    page.drawText(qualities[i].label, { x: margin + 15, y: yPosition, size: 11, font, color: black })
    
    // Right column quality (if exists) - preselected
    if (i + 1 < qualities.length) {
      const rightStartX = margin + columnWidth
      page.drawText('[X]', { x: rightStartX, y: yPosition, size: 11, font, color: black })
      page.drawText(qualities[i + 1].label, { x: rightStartX + 15, y: yPosition, size: 11, font, color: black })
    }
    
    yPosition -= lineHeight
  }

  // Qualities not ticked reason
  ensureSpace(30)
  yPosition -= 3
  page.drawText('If you did not tick one or more of the above, please tell us why here:', { x: margin, y: yPosition, size: 11, font: boldFont, color: black })
  yPosition -= lineHeight
  yPosition = addWrappedText('Not provided', margin, yPosition, pageWidth - 2 * margin)
  yPosition -= 5

  // Criminal background questions - CRITICAL SECTION
  ensureSpace(100)
  page.drawText('CRIMINAL BACKGROUND CHECK', { x: margin, y: yPosition, size: 12, font: boldFont, color: black })
  yPosition -= lineHeight + 3
  
  const criminalQ1 = 'The position this person has applied for involves working with vulnerable people. Are you aware of any convictions, cautions, reprimands or final warnings that the person may have received that are not \'protected\' as defined by the Rehabilitation of Offenders Act 1974 (Exceptions) Order 1975 (as amended in 2013 by SI 210 1198)?'
  const q1Lines = wrapText(criminalQ1, pageWidth - 2 * margin, boldFont, 11)
  for (const line of q1Lines) {
    page.drawText(line, { x: margin, y: yPosition, size: 11, font: boldFont, color: black })
    yPosition -= lineHeight
  }
  yPosition -= 3
  page.drawText('[ ] Yes    [X] No', { x: margin, y: yPosition, size: 11, font, color: black })
  yPosition -= lineHeight + 8

  ensureSpace(50)
  const criminalQ2 = 'To your knowledge, is this person currently the subject of any criminal proceedings (for example, charged or summoned but not yet dealt with) or any police investigation?'
  const q2Lines = wrapText(criminalQ2, pageWidth - 2 * margin, boldFont, 11)
  for (const line of q2Lines) {
    page.drawText(line, { x: margin, y: yPosition, size: 11, font: boldFont, color: black })
    yPosition -= lineHeight
  }
  yPosition -= 3
  page.drawText('[ ] Yes    [X] No', { x: margin, y: yPosition, size: 11, font, color: black })
  yPosition -= lineHeight + 8

  // Additional Comments
  ensureSpace(40)
  page.drawText('Any additional comments you would like to make about this person:', { x: margin, y: yPosition, size: 11, font: boldFont, color: black })
  yPosition -= lineHeight
  yPosition = addWrappedText('Not provided', margin, yPosition, pageWidth - 2 * margin)
  yPosition -= 10

  // Declaration and Date
  ensureSpace(30)
  page.drawText('DECLARATION', { x: margin, y: yPosition, size: 11, font: boldFont, color: black })
  yPosition -= lineHeight + 3
  const declarationText = 'I certify that, to the best of my knowledge, the information I have given is true and complete. I understand that any deliberate omission, falsification or misrepresentation may lead to refusal of appointment or dismissal.'
  yPosition = addWrappedText(declarationText, margin, yPosition, pageWidth - 2 * margin)
  yPosition -= 8

  // Referee Information
  ensureSpace(70)
  page.drawText('REFEREE INFORMATION', { x: margin, y: yPosition, size: 11, font: boldFont, color: black })
  yPosition -= lineHeight + 3
  
  page.drawText('Referee Name:', { x: margin, y: yPosition, size: 11, font: boldFont, color: black })
  page.drawText(data.referee.name || '', { x: margin + 110, y: yPosition, size: 11, font, color: black })
  yPosition -= lineHeight

  page.drawText('Referee Job Title:', { x: margin, y: yPosition, size: 11, font: boldFont, color: black })
  page.drawText(data.referee.jobTitle || '', { x: margin + 110, y: yPosition, size: 11, font, color: black })
  yPosition -= lineHeight

  const createdKey = `{R${data.referenceNumber || 1}_Created}`
  page.drawText('Reference Created:', { x: margin, y: yPosition, size: 11, font: boldFont, color: black })
  page.drawText(createdKey, { x: margin + 110, y: yPosition, size: 11, font, color: black })
  yPosition -= lineHeight

  const signatureKey = `{R${data.referenceNumber || 1}_Signed}`
  page.drawText('Reference Sent:', { x: margin, y: yPosition, size: 11, font: boldFont, color: black })
  page.drawText(signatureKey, { x: margin + 110, y: yPosition, size: 11, font, color: black })
  yPosition -= lineHeight

  page.drawText('Reference Completed:', { x: margin, y: yPosition, size: 11, font: boldFont, color: black })
  page.drawText(signatureKey, { x: margin + 110, y: yPosition, size: 11, font, color: black })
  yPosition -= lineHeight + 5

  // Save & download
  const bytes = await doc.save()
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const filename = `manual-reference-${data.referee.name?.replace(/\s+/g, '-') || 'reference'}-${data.applicantName.replace(/\s+/g, '_')}.pdf`
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
