import type { Section } from "@/lib/types";
import Narrative from "./sections/Narrative";
import Markets from "./sections/Markets";
import CompanyCards from "./sections/CompanyCards";
import Reflection from "./sections/Reflection";
import OnThisDay from "./sections/OnThisDay";
import Jokes from "./sections/Jokes";
import Vocab from "./sections/Vocab";
import Books from "./sections/Books";
import Shloka from "./sections/Shloka";
import ListCards from "./sections/ListCards";
import Advice from "./sections/Advice";
import StartupWatch from "./sections/StartupWatch";
import Jobs from "./sections/Jobs";
import Astrology from "./sections/Astrology";

export default function SectionRouter({ section }: { section: Section }) {
  const { content } = section;
  switch (content.layout) {
    case "narrative":
      return <Narrative body={content.body} />;
    case "markets":
      return <Markets body={content.body} />;
    case "company-cards":
      return <CompanyCards body={content.body} />;
    case "reflection":
      return <Reflection body={content.body} />;
    case "on-this-day":
      return <OnThisDay body={content.body} />;
    case "jokes":
      return <Jokes body={content.body} />;
    case "vocab":
      return <Vocab body={content.body} />;
    case "books":
      return <Books body={content.body} />;
    case "shloka":
      return <Shloka body={content.body} />;
    case "list-cards":
      return <ListCards body={content.body} />;
    case "advice":
      return <Advice body={content.body} />;
    case "startup-watch":
      return <StartupWatch body={content.body} />;
    case "jobs":
      return <Jobs body={content.body} />;
    case "astrology":
      return <Astrology body={content.body} />;
  }
}
