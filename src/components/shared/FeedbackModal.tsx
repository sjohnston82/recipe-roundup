import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { StarRating } from "../StarRating";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedbackRating: number;
  setFeedbackRating: (rating: number) => void;
  feedbackNote: string;
  setFeedbackNote: (note: string) => void;
  onSubmit: () => void;
}

export function FeedbackModal({
  isOpen,
  onClose,
  feedbackRating,
  setFeedbackRating,
  feedbackNote,
  setFeedbackNote,
  onSubmit,
}: FeedbackModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gradient-dark">
            I hope you enjoyed it!
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-muted-text">
            Would you like to leave a rating or a note about this recipe?
          </p>

          <div>
            <Label className="text-sm font-medium text-gradient-dark">
              Rating
            </Label>
            <StarRating
              rating={feedbackRating}
              onRatingChange={setFeedbackRating}
              size="md"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-gradient-dark">
              Note (optional)
            </Label>
            <Input
              value={feedbackNote}
              onChange={(e) => setFeedbackNote(e.target.value)}
              placeholder="How was it? Any modifications you made?"
              className="mt-1"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={onSubmit}
              className="flex-1 bg-gradient-to-r from-gradient-dark to-gradient-light hover:opacity-90"
            >
              Submit Feedback
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Skip
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
