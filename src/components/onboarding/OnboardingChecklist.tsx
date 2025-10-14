import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { CheckCircle2, Circle, RotateCcw, Play } from "lucide-react";

export const OnboardingChecklist = () => {
  const {
    hasCompletedTour,
    hasAddedProperty,
    hasAssignedCompliance,
    hasUploadedDocument,
    startTour,
    resetOnboarding,
  } = useOnboarding();

  const tasks = [
    { id: "tour", label: "Complete welcome tour", completed: hasCompletedTour },
    { id: "property", label: "Add your first property", completed: hasAddedProperty },
    { id: "compliance", label: "Assign compliance standards", completed: hasAssignedCompliance },
    { id: "document", label: "Upload a compliance document", completed: hasUploadedDocument },
  ];

  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = (completedCount / tasks.length) * 100;
  const allComplete = completedCount === tasks.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Getting Started</CardTitle>
        <CardDescription>
          {allComplete 
            ? "You're all set! Explore more features or start managing compliance."
            : `${completedCount} of ${tasks.length} tasks completed`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} className="h-2" />

        <ul className="space-y-2">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-center gap-2 text-sm">
              {task.completed ? (
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              )}
              <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                {task.label}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex gap-2 pt-2">
          {!hasCompletedTour && (
            <Button size="sm" onClick={startTour}>
              <Play className="mr-2 h-4 w-4" />
              Start Tour
            </Button>
          )}
          {allComplete && (
            <Button size="sm" variant="outline" onClick={resetOnboarding}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Progress
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
