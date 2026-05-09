import { notFound } from "next/navigation";
import { MOCK_ARTICLES, MOCK_TOPICS } from "@/lib/mock-data";
import { TopicView } from "./TopicView";

export default async function TopicPage(props: PageProps<"/topics/[slug]">) {
  const { slug } = await props.params;
  const topic = MOCK_TOPICS.find((t) => t.slug === slug);
  if (!topic) notFound();

  // Pretend the topic curates articles whose tags loosely match its name.
  const matchTokens = topic.name.toLowerCase().split(/\s+/);
  const articles = MOCK_ARTICLES.filter((a) =>
    a.tags.some((tag) => matchTokens.some((m) => tag.toLowerCase().includes(m)))
  );

  // If no fuzzy match, fall back to a slice so the page is never empty in mock-data world.
  const list = articles.length > 0 ? articles : MOCK_ARTICLES.slice(0, 4);

  return <TopicView topic={topic} articles={list} />;
}
