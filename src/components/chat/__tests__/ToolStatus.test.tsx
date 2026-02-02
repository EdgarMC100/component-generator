import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolStatus } from "../ToolStatus";

afterEach(() => {
  cleanup();
});

test("shows 'Creating' when str_replace_editor command is create", () => {
  render(
    <ToolStatus
      toolName="str_replace_editor"
      args={{ command: "create", path: "/components/Button.tsx" }}
      isComplete={true}
    />
  );

  expect(screen.getByText(/Creating/)).toBeDefined();
  expect(screen.getByText("Button.tsx")).toBeDefined();
});

test("shows 'Replacing' when str_replace_editor command is str_replace", () => {
  render(
    <ToolStatus
      toolName="str_replace_editor"
      args={{ command: "str_replace", path: "/src/App.tsx" }}
      isComplete={true}
    />
  );

  expect(screen.getByText(/Replacing/)).toBeDefined();
  expect(screen.getByText("App.tsx")).toBeDefined();
});

test("shows 'Editing' when str_replace_editor command is insert", () => {
  render(
    <ToolStatus
      toolName="str_replace_editor"
      args={{ command: "insert", path: "/utils/helpers.ts" }}
      isComplete={true}
    />
  );

  expect(screen.getByText(/Editing/)).toBeDefined();
  expect(screen.getByText("helpers.ts")).toBeDefined();
});

test("shows 'Reading' when str_replace_editor command is view", () => {
  render(
    <ToolStatus
      toolName="str_replace_editor"
      args={{ command: "view", path: "/config.json" }}
      isComplete={true}
    />
  );

  expect(screen.getByText(/Reading/)).toBeDefined();
  expect(screen.getByText("config.json")).toBeDefined();
});

test("shows 'Renaming' when file_manager command is rename", () => {
  render(
    <ToolStatus
      toolName="file_manager"
      args={{ command: "rename", path: "/old-name.ts" }}
      isComplete={true}
    />
  );

  expect(screen.getByText(/Renaming/)).toBeDefined();
  expect(screen.getByText("old-name.ts")).toBeDefined();
});

test("shows 'Deleting' when file_manager command is delete", () => {
  render(
    <ToolStatus
      toolName="file_manager"
      args={{ command: "delete", path: "/temp/file.ts" }}
      isComplete={true}
    />
  );

  expect(screen.getByText(/Deleting/)).toBeDefined();
  expect(screen.getByText("file.ts")).toBeDefined();
});

test("shows spinner when isComplete is false", () => {
  const { container } = render(
    <ToolStatus
      toolName="str_replace_editor"
      args={{ command: "create", path: "/Button.tsx" }}
      isComplete={false}
    />
  );

  // Check for the spinner (Loader2 with animate-spin class)
  const spinner = container.querySelector(".animate-spin");
  expect(spinner).toBeDefined();

  // Should not have the green dot
  const greenDot = container.querySelector(".bg-emerald-500");
  expect(greenDot).toBeNull();
});

test("shows green dot when isComplete is true", () => {
  const { container } = render(
    <ToolStatus
      toolName="str_replace_editor"
      args={{ command: "create", path: "/Button.tsx" }}
      isComplete={true}
    />
  );

  // Check for the green dot
  const greenDot = container.querySelector(".bg-emerald-500");
  expect(greenDot).toBeDefined();

  // Should not have the spinner
  const spinner = container.querySelector(".animate-spin");
  expect(spinner).toBeNull();
});

test("handles unknown tool names gracefully", () => {
  render(
    <ToolStatus
      toolName="unknown_tool"
      args={{ path: "/some/file.ts" }}
      isComplete={true}
    />
  );

  expect(screen.getByText(/Processing/)).toBeDefined();
  expect(screen.getByText("file.ts")).toBeDefined();
});

test("handles missing path gracefully", () => {
  render(
    <ToolStatus
      toolName="str_replace_editor"
      args={{ command: "create" }}
      isComplete={true}
    />
  );

  expect(screen.getByText("Creating")).toBeDefined();
});

test("extracts filename from nested path", () => {
  render(
    <ToolStatus
      toolName="str_replace_editor"
      args={{ command: "create", path: "/deeply/nested/path/to/Component.tsx" }}
      isComplete={true}
    />
  );

  expect(screen.getByText("Component.tsx")).toBeDefined();
});

test("shows 'Modifying' for unknown str_replace_editor command", () => {
  render(
    <ToolStatus
      toolName="str_replace_editor"
      args={{ command: "unknown_command", path: "/file.ts" }}
      isComplete={true}
    />
  );

  expect(screen.getByText(/Modifying/)).toBeDefined();
  expect(screen.getByText("file.ts")).toBeDefined();
});

test("shows 'Managing' for unknown file_manager command", () => {
  render(
    <ToolStatus
      toolName="file_manager"
      args={{ command: "unknown_command", path: "/file.ts" }}
      isComplete={true}
    />
  );

  expect(screen.getByText(/Managing/)).toBeDefined();
  expect(screen.getByText("file.ts")).toBeDefined();
});
