import { useState } from "react";
import { 
  DndContext, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay
} from "@dnd-kit/core";
import { 
  SortableContext, 
  verticalListSortingStrategy, 
  useSortable,
  sortableKeyboardCoordinates
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Loader2, Plus, Edit2, X } from "lucide-react";
import { Button } from "../ui/button";
import { apiFetch } from "../../lib/api";

function SortableChapterItem({ chapter, onEdit }: { chapter: any, onEdit: (c: any) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: chapter._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex items-center justify-between p-3 bg-white dark:bg-zinc-900 border ${
        isDragging ? 'border-blue-500 shadow-xl z-50' : 'border-zinc-200 dark:border-zinc-800'
      } rounded-xl mb-2 group transition-colors`}
    >
      <div className="flex items-center flex-grow">
        <div 
          {...attributes} 
          {...listeners} 
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-grab active:cursor-grabbing p-1 mr-2"
        >
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-zinc-500">Chapter {chapter.chapterNumber}</span>
          <span className="text-sm font-semibold text-zinc-900 dark:text-white">{chapter.title}</span>
        </div>
      </div>
      <Button size="xs" variant="ghost" onClick={() => onEdit(chapter)}>
        <Edit2 className="h-3.5 w-3.5 text-zinc-500" />
      </Button>
    </div>
  );
}

export function ChapterList({ storyId, initialChapters }: { storyId: string, initialChapters: any[] }) {
  const [chapters, setChapters] = useState(initialChapters);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingChapter, setEditingChapter] = useState<any>(null);
  
  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    if (active.id === over.id) return;

    const oldIndex = chapters.findIndex(c => c._id === active.id);
    const newIndex = chapters.findIndex(c => c._id === over.id);

    const newChapters = [...chapters];
    const [moved] = newChapters.splice(oldIndex, 1);
    newChapters.splice(newIndex, 0, moved);

    // Update chapterNumbers optimistically
    const reordered = newChapters.map((ch, idx) => ({ ...ch, chapterNumber: idx + 1 }));
    setChapters(reordered);

    // API call
    try {
      const chapterIds = reordered.map(c => c._id);
      await apiFetch(`/api/stories/${storyId}/chapters/reorder`, {
        method: 'PUT',
        body: JSON.stringify({ chapterIds })
      });
    } catch (err: any) {
      // Rollback
      setError("Failed to save chapter order. Rolling back.");
      setChapters(initialChapters);
    }
  };

  const handleSaveChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || formTitle.length > 100) {
      setError("Title must be between 1 and 100 characters");
      return;
    }
    if (!formContent.trim()) {
      setError("Content is required");
      return;
    }

    setFormLoading(true);
    try {
      if (editingChapter) {
        // Edit existing
        const res = await apiFetch(`/api/stories/${storyId}/chapters/${editingChapter._id}`, {
          method: 'PUT',
          body: JSON.stringify({ title: formTitle, content: formContent })
        });
        setChapters(chapters.map(c => c._id === res.chapter._id ? res.chapter : c));
      } else {
        // Create new
        const res = await apiFetch(`/api/stories/${storyId}/chapters`, {
          method: 'POST',
          body: JSON.stringify({ title: formTitle, content: formContent })
        });
        setChapters([...chapters, res]);
      }
      resetForm();
    } catch (err: any) {
      setError(err.message || "Failed to save chapter");
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingChapter(null);
    setFormTitle("");
    setFormContent("");
    setError("");
  };

  const openAddForm = () => {
    resetForm();
    setIsAdding(true);
  };

  const openEditForm = (chapter: any) => {
    resetForm();
    setEditingChapter(chapter);
    setFormTitle(chapter.title);
    setFormContent(chapter.content || "");
    setIsAdding(true);
  };

  if (isAdding) {
    return (
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-900 bg-zinc-100/10 dark:bg-zinc-900/10 p-6">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="font-bold">{editingChapter ? "Edit Chapter" : "New Chapter"}</h3>
          <Button size="xs" variant="ghost" onClick={resetForm}><X className="h-4 w-4" /></Button>
        </div>
        <form onSubmit={handleSaveChapter} className="mt-4 space-y-4">
          {error && <div className="text-xs text-red-500 bg-red-50 dark:bg-red-950 p-2 rounded">{error}</div>}
          <div>
            <label className="block text-xs font-semibold mb-1">Chapter Title</label>
            <input 
              required maxLength={100}
              value={formTitle} onChange={e => setFormTitle(e.target.value)}
              className="w-full text-sm p-2 rounded border dark:border-zinc-800 dark:bg-zinc-950" 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Content</label>
            <textarea 
              required
              value={formContent} onChange={e => setFormContent(e.target.value)}
              className="w-full text-sm p-3 rounded border dark:border-zinc-800 dark:bg-zinc-950 resize-none h-64" 
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={resetForm}>Cancel</Button>
            <Button type="submit" disabled={formLoading} className="bg-blue-600 text-white">
              {formLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (editingChapter ? "Save Changes" : "Publish Chapter")}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-900 bg-zinc-100/10 dark:bg-zinc-900/10 p-6">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 mb-4">
        <h3 className="font-bold">Chapters ({chapters.length})</h3>
        <Button size="sm" onClick={openAddForm} className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 gap-1">
          <Plus className="h-4 w-4" /> Add Chapter
        </Button>
      </div>

      {error && <div className="mb-4 text-xs text-red-500 bg-red-50 dark:bg-red-950 p-2 rounded">{error}</div>}

      {chapters.length === 0 ? (
        <div className="text-center py-8 text-zinc-500 text-sm">
          No chapters yet. Write your first one!
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <SortableContext items={chapters.map(c => c._id)} strategy={verticalListSortingStrategy}>
            {chapters.map((chapter) => (
              <SortableChapterItem key={chapter._id} chapter={chapter} onEdit={openEditForm} />
            ))}
          </SortableContext>
          <DragOverlay>
            {activeId ? (
              <div className="opacity-90 shadow-2xl scale-[1.02]">
                <SortableChapterItem chapter={chapters.find(c => c._id === activeId)} onEdit={() => {}} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
