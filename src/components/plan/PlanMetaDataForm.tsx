import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ESGPlan } from '@/components/AppContext'; // Assuming ESGPlan type is here or adjust path

interface PlanMetaDataFormProps {
  planDetails: Partial<Pick<ESGPlan, 'title' | 'description'>>;
  onDetailsChange: (field: keyof Pick<ESGPlan, 'title' | 'description'>, value: string) => void;
  isEditing?: boolean;
}

const PlanMetaDataForm: React.FC<PlanMetaDataFormProps> = ({ planDetails, onDetailsChange, isEditing = true }) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Plan Details</CardTitle>
        <CardDescription>Define the title and description for your ESG action plan.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="planTitle">Plan Title</Label>
          <Input
            id="planTitle"
            value={planDetails.title || ''}
            onChange={(e) => onDetailsChange('title', e.target.value)}
            placeholder="E.g., 2024 Sustainability Improvement Plan"
            disabled={!isEditing}
          />
        </div>
        <div>
          <Label htmlFor="planDescription">Plan Description</Label>
          <Textarea
            id="planDescription"
            value={planDetails.description || ''}
            onChange={(e) => onDetailsChange('description', e.target.value)}
            placeholder="A brief overview of the plan's objectives and scope."
            rows={3}
            disabled={!isEditing}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanMetaDataForm; 