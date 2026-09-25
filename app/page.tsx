import Masthead from "@/components/Masthead";
import CardDeck from "@/components/CardDeck";
import { getEdition } from "@/lib/content";

export default function Home() {
  const edition = getEdition();
// page.tsx is the main entry point for the application. It imports the Masthead and CardDeck components, as well as a function to get the edition data. The Home component retrieves the edition data and renders the Masthead and CardDeck components, passing the edition data as props. The layout is structured using flexbox to ensure that the content takes up the full height of the viewport.
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <Masthead edition={edition} />
      <CardDeck sections={edition.sections} />
    </div>
  );
}
