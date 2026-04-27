import { TopBar } from "@/components/TopBar";

export default function Page() {
  return (
    <>
      <TopBar title="Library" />
      <div className="flex-1 flex items-center justify-center">
        <p style={{ color: "var(--text-secondary)" }} className="text-sm">
          Library — coming soon
        </p>
      </div>
    </>
  );
}
