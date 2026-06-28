"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  DndContext, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay,
  useDroppable
} from "@dnd-kit/core";
import { 
  SortableContext, 
  verticalListSortingStrategy, 
  useSortable 
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, GripVertical, FileText, LayoutDashboard } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

interface Story {
  _id: string;
  title: string;
  genre: string;
  status: string;
  coverImage?: string;
  views: number;
  likes: string[];
}

type ColumnsType = {
  [key: string]: Story[];
};

const COLUMN_TITLES: { [key: string]: string } = {
  ideas: "Ideas",
  draft: "Draft",
  editing: "Editing",
  published: "Published",
  archived: "Archived"
};

// Droppable Column Component
function DroppableColumn({ id, children, items }: { id: string, children: React.ReactNode, items: string[] }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div 
      ref={setNodeRef}
      className="flex-grow flex flex-col gap-3 p-3 bg-zinc-100/50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl overflow-y-auto min-h-[150px]"
    >
      <SortableContext id={id} items={items} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </div>
  );
}

// Sortable Story Card Component
function SortableStoryCard({ story }: { story: Story }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: story._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex items-start gap-3 p-3 bg-white dark:bg-zinc-900 border ${
        isDragging ? 'border-blue-500 shadow-xl z-50' : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
      } rounded-xl shadow-sm cursor-grab active:cursor-grabbing group transition-colors`}
      {...attributes}
      {...listeners}
    >
      <div className="mt-1 text-zinc-400 opacity-0 group-hover:opacity-100 transition">
        <GripVertical className="h-4 w-4" />
      </div>
      
      {story.coverImage ? (
        <div className="h-12 w-10 flex-shrink-0 overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-800">
          <img src={story.coverImage} alt={story.title} className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="h-12 w-10 flex-shrink-0 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
          <FileText className="h-4 w-4 text-zinc-400" />
        </div>
      )}

      <div className="flex-grow min-w-0">
        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{story.title}</h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            {story.genre || 'Story'}
          </span>
          <span className="text-[10px] text-zinc-500">{story.views} views</span>
        </div>
      </div>
    </div>
  );
}

export default function WorkspacePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [columns, setColumns] = useState<ColumnsType>({
    ideas: [],
    draft: [],
    editing: [],
    published: [],
    archived: []
  });
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") fetchWorkspace();
  }, [status]);

  const fetchWorkspace = async () => {
    try {
      const res = await fetch("/api/workspace");
      const data = await res.json();
      if (data.success) {
        setColumns(data.columns);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const findColumnOfStory = (id: string) => {
    for (const [colId, stories] of Object.entries(columns)) {
      if (stories.find((s) => s._id === id)) return colId;
    }
    return null;
  };

  const getStory = (id: string) => {
    for (const stories of Object.values(columns)) {
      const story = stories.find((s) => s._id === id);
      if (story) return story;
    }
    return null;
  };

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    const activeCol = findColumnOfStory(activeId);
    let overCol = findColumnOfStory(overId);

    // If overId is a column container itself
    if (!overCol && Object.keys(columns).includes(overId)) {
      overCol = overId;
    }

    if (!activeCol || !overCol || activeCol === overCol) return;

    setColumns((prev) => {
      const activeItems = prev[activeCol];
      const overItems = prev[overCol as string];
      
      const activeIndex = activeItems.findIndex((s) => s._id === activeId);
      const overIndex = overItems.findIndex((s) => s._id === overId);

      const newActiveItems = [...activeItems];
      const [movedItem] = newActiveItems.splice(activeIndex, 1);
      
      const newOverItems = [...overItems];
      if (overIndex >= 0) {
        newOverItems.splice(overIndex, 0, movedItem);
      } else {
        newOverItems.push(movedItem);
      }

      return {
        ...prev,
        [activeCol]: newActiveItems,
        [overCol as string]: newOverItems,
      };
    });
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeCol = findColumnOfStory(activeId);
    let overCol = findColumnOfStory(overId) || overId;

    if (activeCol && activeCol !== overCol) {
      // Finalize status update on backend
      try {
        await fetch(`/api/workspace/stories/${activeId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: overCol })
        });
      } catch (err) {
        console.error("Failed to save status", err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  const activeStory = activeId ? getStory(activeId) : null;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-[#0E0E11]">
      <Navbar />
      
      <main className="flex-grow flex flex-col p-6 h-[calc(100vh-64px)] overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <LayoutDashboard className="h-6 w-6 text-blue-600 dark:text-blue-500" />
              Creator Workspace
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Manage your story pipeline like a pro.</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/20">
            <Plus className="h-4 w-4" />
            New Story
          </Button>
        </div>

        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCorners} 
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full overflow-x-auto pb-4 custom-scrollbar">
            {Object.keys(columns).map((colId) => (
              <div key={colId} className="flex flex-col flex-shrink-0 w-[300px] h-full max-h-full">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                    {COLUMN_TITLES[colId]}
                    <span className="bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs px-2 py-0.5 rounded-full">
                      {columns[colId].length}
                    </span>
                  </h3>
                </div>
                
                <DroppableColumn id={colId} items={columns[colId].map(s => s._id)}>
                  {columns[colId].map((story) => (
                    <SortableStoryCard key={story._id} story={story} />
                  ))}
                  {columns[colId].length === 0 && (
                    <div className="flex-grow flex items-center justify-center p-6 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl">
                      <span className="text-xs text-zinc-400 font-medium">Drop here</span>
                    </div>
                  )}
                </DroppableColumn>
              </div>
            ))}
          </div>

          <DragOverlay>
            {activeStory ? (
              <div className="rotate-3 scale-105 shadow-2xl opacity-90 cursor-grabbing">
                <SortableStoryCard story={activeStory} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>
    </div>
  );
}
