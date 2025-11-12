import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface LanguageSelectorProps {
  selectedLanguages: string[];
  onChange: (languages: string[]) => void;
  disabled?: boolean;
}

const DEFAULT_LANGUAGES = [
  "English", "Spanish", "French", "German", "Italian", "Portuguese", "Arabic", 
  "Hindi", "Bengali", "Punjabi", "Urdu", "Chinese (Mandarin)", "Polish", 
  "Romanian", "Turkish", "Swahili", "Somali", "Tagalog", "Vietnamese", 
  "Korean", "Japanese", "Russian", "Dutch", "Swedish", "Danish", "Norwegian",
  "Finnish", "Greek", "Hebrew", "Thai", "Indonesian", "Malay", "Tamil",
  "Telugu", "Marathi", "Gujarati", "Kannada", "Malayalam", "Yoruba", 
  "Igbo", "Hausa", "Amharic", "Tigrinya", "Oromo"
];

export function LanguageSelector({ selectedLanguages, onChange, disabled }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>(DEFAULT_LANGUAGES);

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      const { data, error } = await supabase
        .from('job_application_settings')
        .select('setting_value')
        .eq('category', 'personal')
        .eq('setting_type', 'language')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;

      if (data && data.length > 0) {
        const languages = data
          .map(item => {
            const value = item.setting_value;
            if (value && typeof value === 'object' && 'value' in value) {
              return (value as {value?: string}).value;
            }
            return null;
          })
          .filter((lang): lang is string => !!lang);
        
        if (languages.length > 0) {
          setAvailableLanguages(languages);
        }
      }
    } catch (error) {
      console.error('Error fetching languages:', error);
    }
  };

  const handleSelect = (language: string) => {
    if (selectedLanguages.includes(language)) {
      onChange(selectedLanguages.filter(l => l !== language));
    } else {
      onChange([...selectedLanguages, language]);
    }
  };

  const handleRemove = (language: string) => {
    onChange(selectedLanguages.filter(l => l !== language));
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            <span className="truncate">
              {selectedLanguages.length === 0
                ? "Select languages..."
                : `${selectedLanguages.length} language${selectedLanguages.length !== 1 ? 's' : ''} selected`}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search languages..." />
            <CommandEmpty>No language found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {availableLanguages.map((language) => (
                <CommandItem
                  key={language}
                  value={language}
                  onSelect={() => handleSelect(language)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedLanguages.includes(language) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {language}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedLanguages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedLanguages.map((language) => (
            <Badge key={language} variant="secondary" className="gap-1">
              {language}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(language)}
                  className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
