import { Users } from "lucide-react";

import { Avatar } from "@/components/ui/Avatar";
import { BackButton } from "@/components/ui/BackButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressMeter } from "@/components/ui/Progress";
import { Table, TableWrap, Td, Th, Tr } from "@/components/ui/Table";
import { fetchItem, fetchListWithMeta } from "@/lib/api";
import type { Course, RosterRow } from "@/lib/types";

export default async function CourseRosterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [course, roster] = await Promise.all([
    fetchItem<Course>(`/api/courses/${id}`),
    fetchListWithMeta<RosterRow>(`/api/courses/${id}/roster`),
  ]);

  if (!course) return <p className="text-ink-600">Course not found.</p>;

  const averagePercent =
    typeof roster.meta.averagePercent === "number"
      ? roster.meta.averagePercent
      : 0;

  return (
    <>
      <header>
        <p className="mb-2 text-[11.5px] font-bold uppercase tracking-[0.1em] text-brand-500">
          Teaching workspace
        </p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="min-w-0 text-[26px] font-bold leading-tight tracking-tight text-ink-900 sm:text-[30px]">
            {course.title} progress
          </h1>
          <BackButton />
        </div>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-500">
          See how enrolled students are progressing through this course.
        </p>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded border border-ink-200 bg-white p-5">
          <p className="text-[11.5px] font-bold uppercase tracking-[0.08em] text-ink-400">
            Enrolled students
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-ink-900">
            {roster.data.length}
          </p>
        </div>
        <div className="rounded border border-ink-200 bg-white p-5">
          <p className="text-[11.5px] font-bold uppercase tracking-[0.08em] text-ink-400">
            Average completion
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-brand-600">
            {averagePercent}%
          </p>
        </div>
      </div>

      <div className="mt-6">
        {roster.data.length ? (
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <Th>Student</Th>
                  <Th>Lesson progress</Th>
                  <Th align="right">Quiz score</Th>
                  <Th align="right">Quiz quantity</Th>
                </tr>
              </thead>
              <tbody>
                {roster.data.map((row) => {
                  const studentName =
                    row.student.fullName ?? row.student.username;
                  return (
                    <Tr key={row.enrollmentId}>
                      <Td>
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={studentName}
                            src={row.student.avatarUrl}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <strong className="block truncate text-ink-900">
                              {studentName}
                            </strong>
                            <span className="text-xs text-ink-500">
                              {row.student.mobileNumber ?? ""}
                            </span>
                          </div>
                        </div>
                      </Td>
                      <Td className="min-w-[220px]">
                        <ProgressMeter
                          percent={row.progress.percent}
                          completed={row.progress.completed}
                          total={row.progress.total}
                        />
                      </Td>
                      <Td align="right">
                        <span className="font-semibold text-ink-800">
                          {row.averageQuizScore === null
                            ? "No attempt"
                            : `${row.averageQuizScore}%`}
                        </span>
                      </Td>
                      <Td align="right">
                        {row.completedQuizCount} of {row.totalQuizCount}
                      </Td>
                    </Tr>
                  );
                })}
              </tbody>
            </Table>
          </TableWrap>
        ) : (
          <EmptyState
            icon={<Users size={24} />}
            title="No students enrolled yet"
            description="Student progress will appear here after someone enrols in this course."
          />
        )}
      </div>
    </>
  );
}
