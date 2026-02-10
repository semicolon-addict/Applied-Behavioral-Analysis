
"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Domain, Task } from "@/types"
import { useState, useEffect } from "react"

interface TaskDialogProps {
  isOpen: boolean
  onClose: () => void
  domain: Domain
  task: Task
  score: number | null
  onSave: (domainName: string, taskName: string, newScore: number | null) => void
}

export function TaskDialog({ isOpen, onClose, domain, task, score, onSave }: TaskDialogProps) {
  const [currentScore, setCurrentScore] = useState<string>(score?.toString() ?? "");

  useEffect(() => {
    setCurrentScore(score?.toString() ?? "");
  }, [score, isOpen]);

  const handleSave = () => {
    const newScore = currentScore === "" ? null : parseInt(currentScore, 10);
    if (newScore === null || (!isNaN(newScore) && newScore >= 0 && newScore <= 10)) {
        onSave(domain.name, task.name, newScore);
    } else {
        // Maybe show an error to the user
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{domain.name} - Task {task.name}</DialogTitle>
          <DialogDescription>
            Review the objective and enter the score for this task.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <h4 className="font-semibold">Objective</h4>
                <p className="text-sm text-muted-foreground">{task.objective}</p>
            </div>
             <div className="grid gap-2">
                <h4 className="font-semibold">Question</h4>
                <p className="text-sm text-muted-foreground">{task.question}</p>
            </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="score" className="text-right">
              Score
            </Label>
            <Input
              id="score"
              type="number"
              min="0"
              max="10"
              value={currentScore}
              onChange={(e) => setCurrentScore(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save score</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
