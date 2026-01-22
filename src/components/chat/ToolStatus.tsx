"use client";

import { Loader2 } from "lucide-react";

interface ToolStatusProps {
  toolName: string;
  args: Record<string, unknown>;
  isComplete: boolean;
}

function getActionLabel(toolName: string, args: Record<string, unknown>): string {
  if (toolName === "str_replace_editor") {
    const command = args.command as string;
    switch (command) {
      case "create":
        return "Creating";
      case "str_replace":
        return "Replacing";
      case "insert":
        return "Editing";
      case "view":
        return "Reading";
      default:
        return "Modifying";
    }
  }

  if (toolName === "file_manager") {
    const command = args.command as string;
    switch (command) {
      case "rename":
        return "Renaming";
      case "delete":
        return "Deleting";
      default:
        return "Managing";
    }
  }

  return "Processing";
}

function getFileName(args: Record<string, unknown>): string | null {
  const path = args.path as string | undefined;
  if (!path) return null;

  // Extract just the filename from the path
  const parts = path.split("/");
  return parts[parts.length - 1] || path;
}

export function ToolStatus({ toolName, args, isComplete }: ToolStatusProps) {
  const action = getActionLabel(toolName, args);
  const fileName = getFileName(args);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isComplete ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">
        {action}
        {fileName && <span className="font-medium ml-1">{fileName}</span>}
      </span>
    </div>
  );
}