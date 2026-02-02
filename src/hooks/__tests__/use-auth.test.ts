import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { useAuth } from "../use-auth";
import * as actions from "@/actions";
import * as anonWorkTracker from "@/lib/anon-work-tracker";
import * as getProjectsAction from "@/actions/get-projects";
import * as createProjectAction from "@/actions/create-project";

// Mock actions
vi.mock("@/actions", () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock("@/lib/anon-work-tracker", () => ({
  getAnonWorkData: vi.fn(),
  clearAnonWork: vi.fn(),
}));

vi.mock("@/actions/get-projects", () => ({
  getProjects: vi.fn(),
}));

vi.mock("@/actions/create-project", () => ({
  createProject: vi.fn(),
}));

// Get the mock push function
const mockPush = vi.fn();

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Configure the mock router to return our mock push function
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    test("returns isLoading as false initially", () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);
    });

    test("returns signIn and signUp functions", () => {
      const { result } = renderHook(() => useAuth());

      expect(typeof result.current.signIn).toBe("function");
      expect(typeof result.current.signUp).toBe("function");
    });
  });

  describe("signIn", () => {
    test("sets isLoading to true during sign in", async () => {
      vi.mocked(actions.signIn).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: false }), 100)
          )
      );

      const { result } = renderHook(() => useAuth());

      let signInPromise: Promise<any>;
      act(() => {
        signInPromise = result.current.signIn("test@example.com", "password123");
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        await signInPromise;
      });

      expect(result.current.isLoading).toBe(false);
    });

    test("calls signIn action with correct credentials", async () => {
      vi.mocked(actions.signIn).mockResolvedValue({ success: false });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password123");
      });

      expect(actions.signIn).toHaveBeenCalledWith(
        "test@example.com",
        "password123"
      );
    });

    test("returns result from signIn action on failure", async () => {
      const expectedResult = { success: false, error: "Invalid credentials" };
      vi.mocked(actions.signIn).mockResolvedValue(expectedResult);

      const { result } = renderHook(() => useAuth());

      let signInResult: any;
      await act(async () => {
        signInResult = await result.current.signIn(
          "test@example.com",
          "wrongpassword"
        );
      });

      expect(signInResult).toEqual(expectedResult);
    });

    test("returns result from signIn action on success", async () => {
      const expectedResult = { success: true };
      vi.mocked(actions.signIn).mockResolvedValue(expectedResult);
      vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(null);
      vi.mocked(getProjectsAction.getProjects).mockResolvedValue([
        { id: "proj-1", name: "Test", createdAt: new Date(), updatedAt: new Date() },
      ]);

      const { result } = renderHook(() => useAuth());

      let signInResult: any;
      await act(async () => {
        signInResult = await result.current.signIn(
          "test@example.com",
          "password123"
        );
      });

      expect(signInResult).toEqual(expectedResult);
    });

    test("resets isLoading to false even on error", async () => {
      vi.mocked(actions.signIn).mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await result.current.signIn("test@example.com", "password123");
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("signUp", () => {
    test("sets isLoading to true during sign up", async () => {
      vi.mocked(actions.signUp).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: false }), 100)
          )
      );

      const { result } = renderHook(() => useAuth());

      let signUpPromise: Promise<any>;
      act(() => {
        signUpPromise = result.current.signUp("test@example.com", "password123");
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        await signUpPromise;
      });

      expect(result.current.isLoading).toBe(false);
    });

    test("calls signUp action with correct credentials", async () => {
      vi.mocked(actions.signUp).mockResolvedValue({ success: false });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp("newuser@example.com", "password123");
      });

      expect(actions.signUp).toHaveBeenCalledWith(
        "newuser@example.com",
        "password123"
      );
    });

    test("returns result from signUp action on failure", async () => {
      const expectedResult = {
        success: false,
        error: "Email already registered",
      };
      vi.mocked(actions.signUp).mockResolvedValue(expectedResult);

      const { result } = renderHook(() => useAuth());

      let signUpResult: any;
      await act(async () => {
        signUpResult = await result.current.signUp(
          "existing@example.com",
          "password123"
        );
      });

      expect(signUpResult).toEqual(expectedResult);
    });

    test("returns result from signUp action on success", async () => {
      const expectedResult = { success: true };
      vi.mocked(actions.signUp).mockResolvedValue(expectedResult);
      vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(null);
      vi.mocked(getProjectsAction.getProjects).mockResolvedValue([]);
      vi.mocked(createProjectAction.createProject).mockResolvedValue({
        id: "new-proj",
        name: "New Design",
        userId: "user-1",
        messages: "[]",
        data: "{}",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const { result } = renderHook(() => useAuth());

      let signUpResult: any;
      await act(async () => {
        signUpResult = await result.current.signUp(
          "newuser@example.com",
          "password123"
        );
      });

      expect(signUpResult).toEqual(expectedResult);
    });

    test("resets isLoading to false even on error", async () => {
      vi.mocked(actions.signUp).mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await result.current.signUp("test@example.com", "password123");
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("post sign-in navigation with anonymous work", () => {
    test("creates project from anonymous work and navigates to it", async () => {
      const anonData = {
        messages: [{ id: "1", role: "user", content: "Hello" }],
        fileSystemData: { "/test.tsx": { type: "file", content: "test" } },
      };

      vi.mocked(actions.signIn).mockResolvedValue({ success: true });
      vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(anonData);
      vi.mocked(createProjectAction.createProject).mockResolvedValue({
        id: "saved-proj-123",
        name: "Saved Project",
        userId: "user-1",
        messages: JSON.stringify(anonData.messages),
        data: JSON.stringify(anonData.fileSystemData),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password123");
      });

      expect(createProjectAction.createProject).toHaveBeenCalledWith({
        name: expect.stringContaining("Design from"),
        messages: anonData.messages,
        data: anonData.fileSystemData,
      });
      expect(anonWorkTracker.clearAnonWork).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/saved-proj-123");
    });

    test("does not save anonymous work with empty messages", async () => {
      const anonData = {
        messages: [],
        fileSystemData: { "/": { type: "directory" } },
      };

      vi.mocked(actions.signIn).mockResolvedValue({ success: true });
      vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(anonData);
      vi.mocked(getProjectsAction.getProjects).mockResolvedValue([
        { id: "existing-proj", name: "Existing", createdAt: new Date(), updatedAt: new Date() },
      ]);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password123");
      });

      expect(createProjectAction.createProject).not.toHaveBeenCalled();
      expect(anonWorkTracker.clearAnonWork).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/existing-proj");
    });
  });

  describe("post sign-in navigation without anonymous work", () => {
    test("navigates to most recent project when user has projects", async () => {
      vi.mocked(actions.signIn).mockResolvedValue({ success: true });
      vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(null);
      vi.mocked(getProjectsAction.getProjects).mockResolvedValue([
        { id: "recent-proj", name: "Recent", createdAt: new Date(), updatedAt: new Date() },
        { id: "old-proj", name: "Old", createdAt: new Date(), updatedAt: new Date() },
      ]);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password123");
      });

      expect(getProjectsAction.getProjects).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/recent-proj");
    });

    test("creates new project when user has no projects", async () => {
      vi.mocked(actions.signIn).mockResolvedValue({ success: true });
      vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(null);
      vi.mocked(getProjectsAction.getProjects).mockResolvedValue([]);
      vi.mocked(createProjectAction.createProject).mockResolvedValue({
        id: "new-proj-456",
        name: "New Design #12345",
        userId: "user-1",
        messages: "[]",
        data: "{}",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password123");
      });

      expect(createProjectAction.createProject).toHaveBeenCalledWith({
        name: expect.stringMatching(/^New Design #\d+$/),
        messages: [],
        data: {},
      });
      expect(mockPush).toHaveBeenCalledWith("/new-proj-456");
    });
  });

  describe("post sign-up navigation", () => {
    test("handles post sign-up the same as post sign-in", async () => {
      const anonData = {
        messages: [{ id: "1", role: "user", content: "Design this" }],
        fileSystemData: { "/app.tsx": { type: "file", content: "code" } },
      };

      vi.mocked(actions.signUp).mockResolvedValue({ success: true });
      vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(anonData);
      vi.mocked(createProjectAction.createProject).mockResolvedValue({
        id: "signup-proj",
        name: "Signup Project",
        userId: "user-1",
        messages: JSON.stringify(anonData.messages),
        data: JSON.stringify(anonData.fileSystemData),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp("new@example.com", "password123");
      });

      expect(createProjectAction.createProject).toHaveBeenCalledWith({
        name: expect.stringContaining("Design from"),
        messages: anonData.messages,
        data: anonData.fileSystemData,
      });
      expect(anonWorkTracker.clearAnonWork).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/signup-proj");
    });

    test("creates new project for new user with no anon work", async () => {
      vi.mocked(actions.signUp).mockResolvedValue({ success: true });
      vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(null);
      vi.mocked(getProjectsAction.getProjects).mockResolvedValue([]);
      vi.mocked(createProjectAction.createProject).mockResolvedValue({
        id: "first-proj",
        name: "First Project",
        userId: "new-user",
        messages: "[]",
        data: "{}",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp("brand-new@example.com", "password123");
      });

      expect(createProjectAction.createProject).toHaveBeenCalledWith({
        name: expect.stringMatching(/^New Design #\d+$/),
        messages: [],
        data: {},
      });
      expect(mockPush).toHaveBeenCalledWith("/first-proj");
    });
  });

  describe("failed authentication does not navigate", () => {
    test("does not navigate on signIn failure", async () => {
      vi.mocked(actions.signIn).mockResolvedValue({
        success: false,
        error: "Invalid credentials",
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "wrongpassword");
      });

      expect(mockPush).not.toHaveBeenCalled();
      expect(getProjectsAction.getProjects).not.toHaveBeenCalled();
      expect(createProjectAction.createProject).not.toHaveBeenCalled();
    });

    test("does not navigate on signUp failure", async () => {
      vi.mocked(actions.signUp).mockResolvedValue({
        success: false,
        error: "Email already registered",
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp("existing@example.com", "password123");
      });

      expect(mockPush).not.toHaveBeenCalled();
      expect(getProjectsAction.getProjects).not.toHaveBeenCalled();
      expect(createProjectAction.createProject).not.toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    test("handles null anon work data", async () => {
      vi.mocked(actions.signIn).mockResolvedValue({ success: true });
      vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(null);
      vi.mocked(getProjectsAction.getProjects).mockResolvedValue([
        { id: "proj-1", name: "Project", createdAt: new Date(), updatedAt: new Date() },
      ]);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password123");
      });

      expect(anonWorkTracker.clearAnonWork).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/proj-1");
    });

    test("handles multiple sign-in calls and resets loading after last one", async () => {
      let resolveFirst: (value: any) => void;

      vi.mocked(actions.signIn).mockImplementationOnce(
        () => new Promise((resolve) => (resolveFirst = resolve))
      );

      vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(null);
      vi.mocked(getProjectsAction.getProjects).mockResolvedValue([
        { id: "proj-1", name: "Project", createdAt: new Date(), updatedAt: new Date() },
      ]);

      const { result } = renderHook(() => useAuth());

      let signInPromise: Promise<any>;

      act(() => {
        signInPromise = result.current.signIn("test@example.com", "password1");
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolveFirst!({ success: true });
        await signInPromise;
      });

      expect(result.current.isLoading).toBe(false);
    });

    test("preserves loading state across multiple hook calls", async () => {
      vi.mocked(actions.signIn).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: false }), 50)
          )
      );

      const { result, rerender } = renderHook(() => useAuth());

      let signInPromise: Promise<any>;
      act(() => {
        signInPromise = result.current.signIn("test@example.com", "password");
      });

      expect(result.current.isLoading).toBe(true);

      rerender();

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        await signInPromise;
      });

      expect(result.current.isLoading).toBe(false);
    });
  });
});
