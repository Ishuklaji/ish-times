import Masthead from "@/components/Masthead";
import CardDeck from "@/components/CardDeck";
import { getEdition } from "@/lib/content";

export default function Home() {
  const edition = getEdition();

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <Masthead edition={edition} />
      <CardDeck sections={edition.sections} />
    </div>
  );
}
