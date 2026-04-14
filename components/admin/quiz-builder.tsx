"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Loader2,
  Plus,
  Trash2,
  HelpCircle,
  CheckCircle,
  Save,
} from "lucide-react";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  position: number;
}

interface QuizData {
  id: string;
  title: string;
  passMark: number;
  questions: QuizQuestion[];
}

interface QuizBuilderProps {
  courseId: string;
  sectionId: string;
  lessonId: string;
}

export function QuizBuilder({ courseId, sectionId, lessonId }: QuizBuilderProps) {
  const basePath = `/api/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/quiz`;

  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [passMark, setPassMark] = useState(70);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions] = useState(["", "", "", ""]);
  const [newCorrectAnswer, setNewCorrectAnswer] = useState(0);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const response = await axios.get(basePath);
        if (response.data) {
          setQuiz(response.data);
          setTitle(response.data.title);
          setPassMark(response.data.passMark);
          setQuestions(response.data.questions || []);
        }
      } catch {
        // No quiz yet
      } finally {
        setIsLoading(false);
      }
    }
    fetchQuiz();
  }, [basePath]);

  async function createQuiz() {
    try {
      setIsSaving(true);
      const response = await axios.post(basePath, { title: "Lesson Quiz", passMark: 70 });
      setQuiz(response.data);
      setTitle(response.data.title);
      setPassMark(response.data.passMark);
      toast.success("Quiz created");
    } catch {
      toast.error("Failed to create quiz");
    } finally {
      setIsSaving(false);
    }
  }

  async function updateQuizSettings() {
    try {
      setIsSaving(true);
      await axios.patch(basePath, { title, passMark });
      toast.success("Quiz settings updated");
    } catch {
      toast.error("Failed to update quiz");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteQuiz() {
    if (!confirm("Delete this quiz and all questions?")) return;

    try {
      setIsSaving(true);
      await axios.delete(basePath);
      setQuiz(null);
      setQuestions([]);
      toast.success("Quiz deleted");
    } catch {
      toast.error("Failed to delete quiz");
    } finally {
      setIsSaving(false);
    }
  }

  async function addQuestion() {
    if (!newQuestion.trim()) {
      toast.error("Enter a question");
      return;
    }

    const validOptions = newOptions.filter((o) => o.trim());
    if (validOptions.length < 2) {
      toast.error("Provide at least 2 options");
      return;
    }

    try {
      setIsAddingQuestion(true);
      const response = await axios.post(`${basePath}/questions`, {
        question: newQuestion,
        options: validOptions,
        correctAnswer: newCorrectAnswer,
      });

      setQuestions((prev) => [...prev, response.data]);
      setNewQuestion("");
      setNewOptions(["", "", "", ""]);
      setNewCorrectAnswer(0);
      toast.success("Question added");
    } catch {
      toast.error("Failed to add question");
    } finally {
      setIsAddingQuestion(false);
    }
  }

  async function deleteQuestion(questionId: string) {
    try {
      await axios.delete(`${basePath}/questions?questionId=${questionId}`);
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      toast.success("Question deleted");
    } catch {
      toast.error("Failed to delete question");
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!quiz) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Quiz
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Add a quiz to this lesson. Students must pass the quiz to complete the lesson.
          </p>
          <Button onClick={createQuiz} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Plus className="mr-2 h-4 w-4" />
            Create Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          Quiz Builder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Quiz Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Pass Mark (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={passMark}
              onChange={(e) => setPassMark(parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" onClick={updateQuizSettings} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
          <Button size="sm" variant="destructive" onClick={deleteQuiz} disabled={isSaving}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Quiz
          </Button>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">
            Questions ({questions.length})
          </h4>

          {questions.length === 0 && (
            <p className="text-sm text-muted-foreground mb-4">No questions yet.</p>
          )}

          <div className="space-y-3">
            {questions.map((q, qIdx) => (
              <div
                key={q.id}
                className="flex items-start gap-3 p-3 rounded-md border bg-muted/30"
              >
                <span className="text-sm font-medium text-muted-foreground mt-0.5">
                  {qIdx + 1}.
                </span>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{q.question}</p>
                  <div className="space-y-0.5">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`text-xs flex items-center gap-1 ${
                          oIdx === q.correctAnswer
                            ? "text-[#12B76A] font-medium"
                            : "text-muted-foreground"
                        }`}
                      >
                        {oIdx === q.correctAnswer && (
                          <CheckCircle className="h-3 w-3" />
                        )}
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => deleteQuestion(q.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4 space-y-4">
          <h4 className="font-medium">Add Question</h4>
          <div className="space-y-2">
            <Label>Question</Label>
            <Textarea
              placeholder="Enter your question..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Answer Options</Label>
            {newOptions.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-4">
                  {String.fromCharCode(65 + idx)}.
                </span>
                <Input
                  placeholder={`Option ${idx + 1}`}
                  value={opt}
                  onChange={(e) => {
                    const updated = [...newOptions];
                    updated[idx] = e.target.value;
                    setNewOptions(updated);
                  }}
                  className="flex-1"
                />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Correct Answer</Label>
            <RadioGroup
              value={newCorrectAnswer.toString()}
              onValueChange={(val: string) => setNewCorrectAnswer(parseInt(val))}
            >
              {newOptions.map((opt, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <RadioGroupItem value={idx.toString()} id={`new-${idx}`} />
                  <Label htmlFor={`new-${idx}`} className="text-sm font-normal">
                    {opt || `Option ${idx + 1}`}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Button onClick={addQuestion} disabled={isAddingQuestion} size="sm">
            {isAddingQuestion && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
