import { TopBar } from "@/components/TopBar";

export default function Page() {
  return (
    <>
      <TopBar title="Digest" />
      <div className="flex-1 flex items-center justify-center">
        <p style={{ color: "var(--text-secondary)" }} className="text-sm">
          Digest — coming soon
        </p>
      </div>
    </>
  );
}
