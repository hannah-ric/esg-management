import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, PlusCircle, Edit3, Sparkles } from 'lucide-react';
import { ESGRecommendation, Priority, Effort, Impact } from '@/components/AppContext'; // Adjust path if necessary

interface PlanRecommendationsProps {
  recommendations: ESGRecommendation[];
  onAddRecommendation: () => void; // Triggered to open a modal or form for adding
  onEditRecommendation: (recommendation: ESGRecommendation) => void; // Triggered to open a modal or form for editing
  onDeleteRecommendation: (recommendationId: string) => void;
  onGenerateAIRecs?: () => void; // Optional AI generation
  isGeneratingAIRecs?: boolean;
  isEditing?: boolean;
}

const getPriorityBadgeVariant = (priority: Priority) => {
  switch (priority) {
    case 'high': return 'destructive';
    case 'medium': return 'secondary';
    case 'low': return 'outline';
    default: return 'secondary';
  }
};

const PlanRecommendations: React.FC<PlanRecommendationsProps> = ({
  recommendations,
  onAddRecommendation,
  onEditRecommendation,
  onDeleteRecommendation,
  onGenerateAIRecs,
  isGeneratingAIRecs,
  isEditing = true,
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>ESG Recommendations</CardTitle>
            <CardDescription>Outline key recommendations to achieve your ESG goals.</CardDescription>
          </div>
          {isEditing && onGenerateAIRecs && (
            <Button onClick={onGenerateAIRecs} variant="outline" size="sm" disabled={isGeneratingAIRecs} aria-label={isGeneratingAIRecs ? "Generating AI recommendations" : "Generate recommendations with AI"}>
              <Sparkles className={`mr-2 h-4 w-4 ${isGeneratingAIRecs ? 'animate-spin' : ''}`} />
              {isGeneratingAIRecs ? 'Generating...' : 'Generate with AI'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 && !isEditing && (
            <p className="text-sm text-muted-foreground">No recommendations defined for this plan.</p>
        )}
        {(recommendations.length > 0 || isEditing) && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Framework</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Effort</TableHead>
                <TableHead>Impact</TableHead>
                {isEditing && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {recommendations.map((rec) => (
                <TableRow key={rec.id}>
                  <TableCell className="font-medium">{rec.title}</TableCell>
                  <TableCell>{rec.framework} - {rec.indicator}</TableCell>
                  <TableCell><Badge variant={getPriorityBadgeVariant(rec.priority)}>{rec.priority}</Badge></TableCell>
                  <TableCell><Badge variant="outline">{rec.effort}</Badge></TableCell>
                  <TableCell><Badge variant="outline">{rec.impact}</Badge></TableCell>
                  {isEditing && (
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => onEditRecommendation(rec)} aria-label={`Edit recommendation ${rec.title}`}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDeleteRecommendation(rec.id)} aria-label={`Delete recommendation ${rec.title}`}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {isEditing && (
          <Button onClick={onAddRecommendation} variant="outline" className="mt-4">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Recommendation
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PlanRecommendations; 