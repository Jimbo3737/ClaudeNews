import { TopBar } from "@/components/TopBar";
import { FeedGrid } from "@/components/FeedGrid";

export default function FeedPage() {
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <>
      <TopBar title="Your Feed" subtitle={today} />
      <FeedGrid />
    </>
  );
}
