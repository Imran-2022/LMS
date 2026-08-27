import Link from "next/link";
import { CalendarDays, CheckCircle2, ClipboardCheck, XCircle } from "lucide-react";

import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { fetchList } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { cx } from "@/lib/format";
import type { QuizAttempt } from "@/lib/types";
import { CellStack, DataTable, type Column } from "@/components/ui/DataTable";

export default async function ResultsPage() {
  const attempts = await fetchList<QuizAttempt>("/api/quiz-attempts/mine");
  const columns: Column<QuizAttempt>[] = [
    { key: "quiz", header: "Quiz", cell: (attempt) => <Link className="hover:text-brand-700" href={attempt.course?.id && attempt.quiz?.id ? `/my-courses/${attempt.course.id}/quiz/${attempt.quiz.id}` : "/results"}><CellStack title={attempt.quiz?.title ?? "Quiz"} meta={attempt.course?.title ?? "Course"} /></Link> },
    { key: "score", header: "Score", align: "right", cell: (attempt) => <span className={attempt.passed ? "font-bold text-success-600" : "font-bold text-danger-600"}>{attempt.score}%</span> },
    { key: "answers", header: "Correct", cell: (attempt) => `${attempt.correctCount} of ${attempt.totalQuestions}` },
    { key: "submitted", header: "Submitted", cell: (attempt) => <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{formatDate(attempt.submittedAt)}</span> },
    { key: "status", header: "Status", cell: (attempt) => <span className={cx("inline-flex items-center gap-1 text-xs font-semibold", attempt.passed ? "text-success-600" : "text-danger-600")}>{attempt.passed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}{attempt.passed ? "Passed" : "Needs review"}</span> },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Learning workspace"
        title="Quiz results"
        description="Review your recent quiz attempts and scores."
      />

      <div className="mt-8">
        {attempts.length ? (
          <DataTable columns={columns} rows={attempts} getRowKey={(attempt) => attempt.id} caption="Your quiz results" />
        ) : (
          <EmptyState
            icon={<ClipboardCheck size={24} />}
            title="No quiz results yet"
            description="Complete a quiz in one of your courses to see your scores and progress here."
            action={<ButtonLink href="/my-courses">View my courses</ButtonLink>}
          />
        )}
      </div>
    </>
  );
}
