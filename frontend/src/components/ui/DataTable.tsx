/**
 * DataTable — column definitions instead of hand-written `<tr>`/`<td>` markup.
 *
 * The wrappers in `Table.tsx` already handle the styling; what they do not prevent is a
 * table whose header row and body row drift out of alignment, which is exactly what had
 * happened: the admin user list hand-rolled a raw `<table>` and ended up with different
 * padding and no header association at all. Describing a table as columns makes that
 * mismatch impossible to write — each column states its own header, alignment and cell.
 *
 * Deliberately *not* a client component. Every list in this app is rendered on the server
 * from a Server Component, and pushing a table into the client only to print rows would
 * ship the whole dataset twice. Interactive cells (an action menu, a publish toggle) are
 * client components placed *inside* a `cell`, which keeps the boundary at the button.
 *
 * No sorting or pagination: the API returns these lists already ordered and page-sized,
 * so a client-side sort would reorder one page of a larger set and quietly lie about it.
 */
import type { ReactNode } from "react";

import { cx } from "@/lib/format";
import { Table, TableWrap, Td, Th, Tr } from "./Table";

export type Column<T> = {
  /** Stable identity for the column — used as the React key, never displayed. */
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  align?: "left" | "right" | "center";
  /** A width utility (`"w-40"`) when a column should not be sized by its content. */
  width?: string;
  /**
   * Keep the header in the accessibility tree but out of sight — for an actions column,
   * where a visible "Actions" label is noise but an empty `<th>` leaves the buttons in
   * a column a screen reader cannot name.
   */
  srOnlyHeader?: boolean;
  /** Extra classes for this column's body cells. */
  cellClassName?: string;
};

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  empty,
  caption,
  className,
  rowClassName,
}: {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T, index: number) => string | number;
  /** Rendered instead of the table when there are no rows — usually an `EmptyState`. */
  empty?: ReactNode;
  /**
   * A one-line summary of the table. Visually hidden; it is what a screen reader reads
   * when it hits the table, and "12 accounts, newest first" is more use than "table".
   */
  caption?: string;
  className?: string;
  rowClassName?: (row: T) => string | undefined;
}) {
  if (rows.length === 0 && empty) return <>{empty}</>;

  return (
    <TableWrap className={className}>
      <Table>
        {caption ? (
          <caption className="sr-only">{caption}</caption>
        ) : null}
        <thead>
          <tr>
            {columns.map((column) => (
              <Th
                key={column.key}
                align={column.align}
                className={column.width}
              >
                {column.srOnlyHeader ? (
                  <span className="sr-only">{column.header}</span>
                ) : (
                  column.header
                )}
              </Th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <Tr key={getRowKey(row, index)} className={rowClassName?.(row)}>
              {columns.map((column) => (
                <Td
                  key={column.key}
                  align={column.align}
                  className={column.cellClassName}
                >
                  {column.cell(row)}
                </Td>
              ))}
            </Tr>
          ))}
        </tbody>
      </Table>
    </TableWrap>
  );
}

/**
 * The two-line "title + supporting detail" cell that every list's first column wants.
 *
 * Extracted because there were four slightly different versions of it — one per list —
 * and they disagreed about font size, so the tables looked subtly unrelated.
 */
export function CellStack({
  title,
  meta,
  className,
}: {
  title: ReactNode;
  meta?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("min-w-0", className)}>
      <div className="truncate font-semibold text-ink-900">{title}</div>
      {meta ? (
        <div className="mt-0.5 truncate text-[12.5px] text-ink-500">{meta}</div>
      ) : null}
    </div>
  );
}
