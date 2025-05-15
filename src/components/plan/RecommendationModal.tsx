import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ESGRecommendation, Priority, Effort, Impact } from '@/components/AppContext'; // Adjust path if necessary
import { sanitizeInput, sanitizeObject } from '@/lib/error-utils';
import { useToast } from '@/components/ui/use-toast';

interface RecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recommendation: ESGRecommendation) => void;
  initialData?: ESGRecommendation | null;
}

const defaultRec: Partial<ESGRecommendation> = {
  title: '',
  description: '',
  framework: '',
  indicator: '',
  priority: 'medium',
  effort: 'medium',
  impact: 'medium',
};

const RecommendationModal: React.FC<RecommendationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [recommendation, setRecommendation] = useState<Partial<ESGRecommendation>>(defaultRec);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setRecommendation(initialData ? { ...initialData } : defaultRec);
    }
  }, [isOpen, initialData]);

  const handleChange = useCallback((field: keyof ESGRecommendation, value: string) => {
    setRecommendation(prev => ({ ...prev, [field]: sanitizeInput(value) }));
  }, []);

  const handleSelectChange = useCallback((field: keyof ESGRecommendation, value: Priority | Effort | Impact) => {
    setRecommendation(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!recommendation.title || !recommendation.framework || !recommendation.indicator) {
      toast({
        title: "Missing Fields",
        description: "Title, Framework, and Indicator are required.",
        variant: "destructive",
      });
      return;
    }
    const finalRec: ESGRecommendation = {
      id: initialData?.id || `rec-${Date.now()}`,
      title: recommendation.title!,
      description: recommendation.description || '',
      framework: recommendation.framework!,
      indicator: recommendation.indicator!,
      priority: recommendation.priority || 'medium',
      effort: recommendation.effort || 'medium',
      impact: recommendation.impact || 'medium',
    };
    onSave(sanitizeObject(finalRec));
    onClose();
  }, [recommendation, initialData, onSave, onClose, toast]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Recommendation' : 'Add New Recommendation'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rec-title" className="text-right">Title</Label>
            <Input id="rec-title" value={recommendation.title} onChange={(e) => handleChange('title', e.target.value)} className="col-span-3" placeholder="E.g., Reduce Scope 1 Emissions" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rec-description" className="text-right">Description</Label>
            <Textarea id="rec-description" value={recommendation.description} onChange={(e) => handleChange('description', e.target.value)} className="col-span-3" placeholder="Detailed description of the recommendation" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rec-framework" className="text-right">Framework</Label>
            <Input id="rec-framework" value={recommendation.framework} onChange={(e) => handleChange('framework', e.target.value)} className="col-span-3" placeholder="E.g., GRI, SASB, TCFD" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rec-indicator" className="text-right">Indicator</Label>
            <Input id="rec-indicator" value={recommendation.indicator} onChange={(e) => handleChange('indicator', e.target.value)} className="col-span-3" placeholder="E.g., 305-1, EM-CM-110a.1" />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rec-priority" className="text-right">Priority</Label>
            <Select value={recommendation.priority} onValueChange={(val) => handleSelectChange('priority', val as Priority)}>
              <SelectTrigger id="rec-priority" className="col-span-3">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rec-effort" className="text-right">Effort</Label>
            <Select value={recommendation.effort} onValueChange={(val) => handleSelectChange('effort', val as Effort)}>
              <SelectTrigger id="rec-effort" className="col-span-3">
                <SelectValue placeholder="Select effort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rec-impact" className="text-right">Impact</Label>
            <Select value={recommendation.impact} onValueChange={(val) => handleSelectChange('impact', val as Impact)}>
              <SelectTrigger id="rec-impact" className="col-span-3">
                <SelectValue placeholder="Select impact" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit}>Save Recommendation</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RecommendationModal; 