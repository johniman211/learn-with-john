"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Pencil, Trash2, Check, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  courseCount: number;
}

interface CategoryManagerProps {
  initialCategories: Category[];
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [newName, setNewName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  async function handleAdd() {
    if (!newName.trim()) return;
    try {
      setIsAdding(true);
      const res = await axios.post("/api/categories", { name: newName.trim() });
      setCategories([...categories, { ...res.data, courseCount: 0 }]);
      setNewName("");
      toast.success("Category created");
      router.refresh();
    } catch {
      toast.error("Failed to create category");
    } finally {
      setIsAdding(false);
    }
  }

  async function handleUpdate(id: string) {
    if (!editingName.trim()) return;
    try {
      await axios.patch(`/api/categories/${id}`, { name: editingName.trim() });
      setCategories(
        categories.map((c) =>
          c.id === id ? { ...c, name: editingName.trim() } : c
        )
      );
      setEditingId(null);
      toast.success("Category updated");
      router.refresh();
    } catch {
      toast.error("Failed to update category");
    }
  }

  async function handleDelete(id: string) {
    const cat = categories.find((c) => c.id === id);
    if (cat && cat.courseCount > 0) {
      toast.error("Cannot delete a category that has courses");
      return;
    }
    try {
      await axios.delete(`/api/categories/${id}`);
      setCategories(categories.filter((c) => c.id !== id));
      toast.success("Category deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete category");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Categories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="New category name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            disabled={isAdding}
          />
          <Button onClick={handleAdd} disabled={isAdding || !newName.trim()}>
            {isAdding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-1" />
            )}
            Add
          </Button>
        </div>

        <div className="divide-y rounded-md border">
          {categories.length === 0 && (
            <p className="text-sm text-muted-foreground p-4 text-center">
              No categories yet. Add one above.
            </p>
          )}
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between px-4 py-3"
            >
              {editingId === cat.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleUpdate(cat.id)}
                    className="h-8"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleUpdate(cat.id)}
                  >
                    <Check className="h-4 w-4 text-green-500" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingId(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <div>
                    <span className="font-medium">{cat.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({cat.courseCount} {cat.courseCount === 1 ? "course" : "courses"})
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(cat.id);
                        setEditingName(cat.name);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(cat.id)}
                      disabled={cat.courseCount > 0}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
