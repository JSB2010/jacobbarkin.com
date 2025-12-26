"use client";

import React, { memo } from 'react';
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Eye, Trash2 } from "lucide-react";
import type { ContactSubmission } from "@/lib/db/submissions";
import { formatDistanceToNow } from "date-fns";

interface SubmissionRowProps {
  submission: ContactSubmission;
  onView: (submission: ContactSubmission) => void;
  onDelete: (submission: ContactSubmission) => void;
  isDeleting: boolean;
}

/**
 * Memoized component for rendering a submission row in the admin dashboard
 */
function SubmissionRowComponent({
  submission,
  onView,
  onDelete,
  isDeleting
}: SubmissionRowProps) {
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{submission.name}</TableCell>
      <TableCell>{submission.subject}</TableCell>
      <TableCell className="hidden md:table-cell">
        {formatDate(submission.created_at)}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(submission)}
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">View</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(submission)}
            disabled={isDeleting}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const SubmissionRow = memo(SubmissionRowComponent);
