import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { TrashIcon, PlusIcon } from "lucide-react";
import {
  useCreateRecipeNote,
  useDeleteRecipeNote,
  type RecipeNote,
} from "../lib/api-hooks";

interface RecipeNotesProps {
  recipeId: string;
  notes: RecipeNote[];
  onNotesUpdate: (notes: RecipeNote[]) => void;
}

export function RecipeNotes({
  recipeId,
  notes,
  onNotesUpdate,
}: RecipeNotesProps) {
  const [newNote, setNewNote] = useState("");

  const createNoteMutation = useCreateRecipeNote();
  const deleteNoteMutation = useDeleteRecipeNote();

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString().slice(-2);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    createNoteMutation.mutate(
      {
        recipeId,
        content: newNote.trim(),
      },
      {
        onSuccess: () => {
          setNewNote("");
        },
      }
    );
  };

  const handleDeleteNote = (noteId: string) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    deleteNoteMutation.mutate(noteId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold text-gradient-dark flex items-center">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
          Notes ({notes.length})
        </Label>
      </div>

      {/* Add new note */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note about this recipe..."
            onKeyPress={(e) => e.key === "Enter" && handleAddNote()}
          />
          <Button
            onClick={handleAddNote}
            disabled={createNoteMutation.isPending || !newNote.trim()}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            {createNoteMutation.isPending ? "Adding..." : "Add"}
          </Button>
        </div>
      </div>

      {/* Notes list */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {notes.length === 0 ? (
          <p className="text-gray-500 text-sm italic text-center py-4">
            No notes yet. Add your first note above!
          </p>
        ) : (
          notes
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((note) => (
              <div
                key={note.id}
                className="bg-gray-50 rounded-lg p-3 border border-gray-200"
              >
                <div className="flex justify-between items-start gap-2">
                  <p className="text-sm text-gray-800 flex-1">{note.content}</p>
                  <Button
                    onClick={() => handleDeleteNote(note.id)}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                    disabled={deleteNoteMutation.isPending}
                  >
                    <TrashIcon className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {formatTimestamp(note.createdAt)}
                </p>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
