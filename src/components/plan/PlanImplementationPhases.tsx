import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, PlusCircle, Edit3, CalendarDays, Info } from 'lucide-react';
import { ImplementationPhase, ImplementationTask, TaskStatus } from '@/components/AppContext'; // Adjust path

interface PlanImplementationPhasesProps {
  phases: ImplementationPhase[];
  onAddPhase: () => void;
  onEditPhase: (phase: ImplementationPhase) => void;
  onDeletePhase: (phaseId: string) => void;
  onAddTaskToPhase: (phaseId: string) => void;
  onEditTask: (task: ImplementationTask, phaseId: string) => void;
  onDeleteTask: (taskId: string, phaseId: string) => void;
  onUpdateTaskStatus: (taskId: string, phaseId: string, status: TaskStatus) => void;
  isEditing?: boolean;
}

const getStatusBadgeVariant = (status: TaskStatus) => {
  switch (status) {
    case 'completed': return 'default';
    case 'in_progress': return 'outline';
    case 'not_started': return 'secondary';
    default: return 'outline';
  }
};

const PlanImplementationPhases: React.FC<PlanImplementationPhasesProps> = ({
  phases,
  onAddPhase,
  onEditPhase,
  onDeletePhase,
  onAddTaskToPhase,
  onEditTask,
  onDeleteTask,
  onUpdateTaskStatus,
  isEditing = true,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Implementation Phases & Tasks</CardTitle>
        <CardDescription>Define the phases and tasks to execute your ESG plan.</CardDescription>
      </CardHeader>
      <CardContent>
        {phases.length === 0 && !isEditing && (
            <p className="text-sm text-muted-foreground">No implementation phases defined for this plan.</p>
        )}
        {(phases.length > 0 || isEditing) && (
          <Accordion type="multiple" className="w-full space-y-4">
            {phases.map((phase) => (
              <AccordionItem value={phase.id} key={phase.id} className="border rounded-md">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex justify-between items-center w-full">
                    <span className="font-medium text-lg">{phase.title}</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="flex items-center">
                        <CalendarDays className="h-3 w-3 mr-1" /> {phase.duration}
                      </Badge>
                      {isEditing && (
                        <>
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onEditPhase(phase); }} className="h-7 w-7" aria-label={`Edit phase ${phase.title}`}>
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDeletePhase(phase.id); }} className="h-7 w-7" aria-label={`Delete phase ${phase.title}`}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 border-t">
                  <p className="text-sm text-muted-foreground mb-3">{phase.description}</p>
                  {phase.tasks.length === 0 && !isEditing && (
                      <p className="text-xs text-muted-foreground italic">No tasks defined for this phase.</p>
                  )}
                  {(phase.tasks.length > 0 || isEditing) && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Task</TableHead>
                          <TableHead>Status</TableHead>
                          {isEditing && <TableHead className="text-right">Actions</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {phase.tasks.map((task) => (
                          <TableRow key={task.id}>
                            <TableCell className="font-medium">{task.title}</TableCell>
                            <TableCell>
                              {isEditing ? (
                                <select 
                                  value={task.status}
                                  onChange={(e) => onUpdateTaskStatus(task.id, phase.id, e.target.value as TaskStatus)}
                                  className="text-xs p-1 border rounded-md bg-background"
                                  aria-label={`Update status for task ${task.title}`}
                                >
                                  <option value="not_started">Not Started</option>
                                  <option value="in_progress">In Progress</option>
                                  <option value="completed">Completed</option>
                                </select>
                              ) : (
                                <Badge variant={getStatusBadgeVariant(task.status)}>{task.status.replace('_',' ')}</Badge>
                              )}
                            </TableCell>
                            {isEditing && (
                              <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => onEditTask(task, phase.id)} aria-label={`Edit task ${task.title}`}>
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => onDeleteTask(task.id, phase.id)} aria-label={`Delete task ${task.title}`}>
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
                    <Button onClick={() => onAddTaskToPhase(phase.id)} variant="outline" size="sm" className="mt-4">
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Task to "{phase.title}"
                    </Button>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
        {isEditing && (
          <Button onClick={onAddPhase} variant="default" className="mt-6">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Phase
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PlanImplementationPhases; 