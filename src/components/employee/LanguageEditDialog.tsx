import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LanguageSelector } from "@/components/employees/LanguageSelector";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LanguageEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  currentLanguages: string[];
  onSuccess: () => void;
}

export function LanguageEditDialog({
  open,
  onOpenChange,
  employeeId,
  currentLanguages,
  onSuccess
}: LanguageEditDialogProps) {
  const [languages, setLanguages] = useState<string[]>(currentLanguages || []);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('employees')
        .update({ languages: languages })
        .eq('id', employeeId);

      if (error) throw error;

      toast({
        title: "Languages updated",
        description: "Your language preferences have been saved successfully.",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating languages:', error);
      toast({
        title: "Error",
        description: "Failed to update languages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Languages</DialogTitle>
          <DialogDescription>
            Select the languages you speak. This information helps with assignments and communication.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Languages</Label>
            <LanguageSelector
              selectedLanguages={languages}
              onChange={setLanguages}
              disabled={saving}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
