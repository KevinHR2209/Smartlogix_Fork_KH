"use client";
export default function AdminPage() {
  return (
    <div className="flex h-full w-full flex-col">
      <iframe
        src="/ml-dashboard"
        title="Dashboard ml-forecast"
        className="flex-1 w-full border-0"
        style={{ minHeight: "calc(100vh - 130px)" }}
      />
    </div>
  );
}