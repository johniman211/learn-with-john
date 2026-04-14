"use client";

import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Trophy,
  RotateCcw,
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
  attempts: { score: number; passed: boolean }[];
}

interface QuizPlayerProps {
  quiz: QuizData;
  courseId: string;
  lessonId: string;
  profileId: string;
  onPass: () => void;
}

type QuizState = "ready" | "in-progress" | "submitting" | "results";

export function QuizPlayer({
  quiz,
  courseId,
  onPass,
}: QuizPlayerProps) {
  const sortedQuestions = [...quiz.questions].sort(
    (a, b) => a.position - b.position
  );

  const lastAttempt = quiz.attempts?.[0];
  const hasPassed = lastAttempt?.passed ?? false;

  const [state, setState] = useState<QuizState>(hasPassed ? "results" : "ready");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
  } | null>(hasPassed && lastAttempt ? { score: lastAttempt.score, passed: true } : null);

  function handleAnswer(questionId: string, optionIndex: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  }

  async function handleSubmit() {
    if (Object.keys(answers).length < sortedQuestions.length) {
      toast.error("Please answer all questions");
      return;
    }

    try {
      setState("submitting");

      const answerArray = sortedQuestions.map((q) => answers[q.id] ?? -1);

      const response = await axios.post(
        `/api/courses/${courseId}/quiz/${quiz.id}/attempt`,
        { answers: answerArray }
      );

      setResult(response.data);
      setState("results");

      if (response.data.passed) {
        toast.success("Quiz passed!");
        onPass();
      }
    } catch {
      toast.error("Failed to submit quiz");
      setState("in-progress");
    }
  }

  function handleRetry() {
    setAnswers({});
    setResult(null);
    setState("in-progress");
  }

  const allAnswered = Object.keys(answers).length === sortedQuestions.length;

  if (state === "ready") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            {quiz.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {sortedQuestions.length} question{sortedQuestions.length !== 1 ? "s" : ""} &middot;
            Pass mark: {quiz.passMark}%
          </p>
          {hasPassed && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-green-500/10 text-green-600 text-sm">
              <CheckCircle className="h-4 w-4" />
              You already passed this quiz with {lastAttempt?.score}%
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            You must pass this quiz to complete the lesson.
          </p>
          <Button onClick={() => setState("in-progress")}>
            {hasPassed ? "Retake Quiz" : "Start Quiz"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (state === "results" && result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quiz Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-4">
            {result.passed ? (
              <div className="space-y-2">
                <CheckCircle className="h-12 w-12 text-[#12B76A] mx-auto" />
                <h3 className="text-xl font-bold text-[#12B76A]">Passed!</h3>
              </div>
            ) : (
              <div className="space-y-2">
                <XCircle className="h-12 w-12 text-destructive mx-auto" />
                <h3 className="text-xl font-bold text-destructive">Not Passed</h3>
              </div>
            )}
            <div className="mt-4">
              <p className="text-3xl font-bold">{result.score}%</p>
              <p className="text-sm text-muted-foreground">
                Pass mark: {quiz.passMark}%
              </p>
            </div>
            <Progress
              value={result.score}
              className={`h-3 mt-3 ${result.passed ? "[&>div]:bg-[#12B76A]" : "[&>div]:bg-destructive"}`}
            />
          </div>
          {!result.passed && (
            <Button onClick={handleRetry} className="w-full gap-2">
              <RotateCcw className="h-4 w-4" />
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{quiz.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {sortedQuestions.map((question, qIndex) => (
          <div key={question.id} className="space-y-3">
            <p className="text-sm font-medium">
              {qIndex + 1}. {question.question}
            </p>
            <RadioGroup
              value={answers[question.id]?.toString()}
              onValueChange={(val) =>
                handleAnswer(question.id, parseInt(val))
              }
            >
              {question.options.map((option, oIndex) => (
                <div key={oIndex} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={oIndex.toString()}
                    id={`${question.id}-${oIndex}`}
                  />
                  <Label
                    htmlFor={`${question.id}-${oIndex}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ))}

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {Object.keys(answers).length}/{sortedQuestions.length} answered
          </p>
          <Button
            onClick={handleSubmit}
            disabled={!allAnswered || state === "submitting"}
          >
            {state === "submitting" && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Submit Quiz
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
