import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { JobApplicationPortalContent } from "@/components/job-application/JobApplicationPortal";
import { JobApplicationData } from "@/components/job-application/types";
import { CompanyProvider } from "@/contexts/CompanyContext";

interface EditApplicationDialogProps {
  application: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditApplicationDialog({
  application,
  open,
  onOpenChange,
  onSuccess,
}: EditApplicationDialogProps) {
  // Transform application data to JobApplicationData format
  const transformToJobAppData = (): JobApplicationData => {
    const pi = application.personal_info || {};
    const fullName = pi.fullName || `${pi.firstName || ''} ${pi.lastName || ''}`.trim();

    const personalInfo = {
      title: pi.title || '',
      fullName,
      email: pi.email || '',
      confirmEmail: pi.confirmEmail || pi.email || '',
      telephone: pi.telephone || '',
      dateOfBirth: pi.dateOfBirth || pi.dob || '',
      streetAddress: pi.streetAddress || pi.address || '',
      streetAddress2: pi.streetAddress2 || pi.address2 || '',
      town: pi.town || pi.city || '',
      borough: pi.borough || '',
      postcode: pi.postcode || '',
      englishProficiency: pi.englishProficiency || '',
      otherLanguages: Array.isArray(pi.otherLanguages)
        ? pi.otherLanguages
        : (pi.otherLanguages ? String(pi.otherLanguages).split(',').map((s: string) => s.trim()).filter(Boolean) : []),
      positionAppliedFor: pi.positionAppliedFor || '',
      personalCareWillingness: pi.personalCareWillingness || '',
      hasDBS: pi.hasDBS || '',
      hasCarAndLicense: pi.hasCarAndLicense || '',
      nationalInsuranceNumber: pi.nationalInsuranceNumber || '',
    };

    const av = application.availability || {};
    const availability = {
      timeSlots: av.timeSlots || av.selectedSlots || {},
      hoursPerWeek: av.hoursPerWeek || '',
      hasRightToWork: typeof av.hasRightToWork === 'boolean' ? (av.hasRightToWork ? 'Yes' : 'No') : (av.hasRightToWork || ''),
    };

    const ec = application.emergency_contact || {};
    const emergencyContact = {
      fullName: ec.fullName || '',
      relationship: ec.relationship || '',
      contactNumber: ec.contactNumber || '',
      howDidYouHear: ec.howDidYouHear || '',
    };

    const eh = application.employment_history || {};
    const recent = eh.recentEmployer || undefined;
    const previous = Array.isArray(eh.previousEmployers) ? eh.previousEmployers : [];
    const previouslyEmployed = typeof eh.previouslyEmployed === 'boolean'
      ? (eh.previouslyEmployed ? 'yes' : 'no')
      : (eh.previouslyEmployed || ((recent || previous.length) ? 'yes' : 'no'));

    const rinfo = application.reference_info || {};
    const references = {
      reference1: rinfo.reference1 || {
        name: '', company: '', jobTitle: '', email: '', address: '', address2: '', town: '', contactNumber: '', postcode: ''
      },
      reference2: rinfo.reference2 || {
        name: '', company: '', jobTitle: '', email: '', address: '', address2: '', town: '', contactNumber: '', postcode: ''
      }
    };

    const skillsExperience = {
      skills: application.skills_experience?.skills || application.skills_experience || {},
    };

    const declaration = application.declarations || {
      socialServiceEnquiry: '', convictedOfOffence: '', safeguardingInvestigation: '',
      criminalConvictions: '', healthConditions: '', cautionsReprimands: ''
    };

    const termsPolicy = application.consent || {
      consentToTerms: false, signature: '', fullName: '', date: ''
    };

    return {
      personalInfo,
      availability,
      emergencyContact,
      employmentHistory: {
        previouslyEmployed,
        recentEmployer: recent,
        previousEmployers: previous,
      },
      references,
      skillsExperience,
      declaration,
      termsPolicy,
    };
  };

  const pi = application.personal_info || {};
  const applicantName = pi.fullName || `${pi.firstName || ''} ${pi.lastName || ''}`.trim() || 'Applicant';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[100vw] max-h-[100vh] w-full h-full p-0 gap-0 overflow-y-auto">
        <DialogHeader className="px-8 pt-8 pb-6 border-b bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xl font-semibold text-primary">
                {applicantName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">{applicantName}</DialogTitle>
              <DialogDescription className="text-base mt-1">
                Editing application details
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <CompanyProvider>
          <JobApplicationPortalContent
            initialData={transformToJobAppData()}
            isEditMode={true}
            applicationId={application.id}
            onEditComplete={() => {
              onSuccess();
              onOpenChange(false);
            }}
          />
        </CompanyProvider>
      </DialogContent>
    </Dialog>
  );
}
