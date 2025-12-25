"use client";

interface ProjectDetailProps {
  projectId: string;
  projectName: string;
  children: React.ReactNode;
  showFeedback?: boolean;
}

export function ProjectDetail({
  projectId,
  projectName,
  children,
  showFeedback = false
}: Readonly<ProjectDetailProps>) {
  // projectId, projectName, and showFeedback are available for future use
  // (e.g., analytics tracking, feedback forms)
  void projectId;
  void projectName;
  void showFeedback;

  return (
    <div className="space-y-8">
      {/* Main content */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
}
