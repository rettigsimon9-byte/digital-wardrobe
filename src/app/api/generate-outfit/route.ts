import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import type { ClothingItem } from '@/types';

const client = new Anthropic();

const OCCASION_RULES: Record<string, string> = {
  // Arbeit
  'Seriös': `
PFLICHT: Professionelle, bürogeeignete Kleidung für ein konservatives Arbeitsumfeld.
ERLAUBT: Blazer, Anzughosen, Chinos, Blusen, Hemden, Kleider (midi/maxi), elegante Röcke (midi), Pumps, Loafer, Stiefeletten.
VERBOTEN: Leggings, Jogginghosen, Shorts, Miniröcke (unter Knie), Trägerlose Tops, Spaghetti-Tops, Crop Tops, Tank Tops, Sportschuhe, Sneaker (außer sehr clean/minimalistisch), Hoodie, Bomberjacke, Strandkleidung, zu enge oder transparente Teile.`,

  'Smart Casual': `
PFLICHT: Gepflegt und stilbewusst, aber nicht übermäßig formal. Modernes Büro oder Business-Casual.
ERLAUBT: Chinos, dunkle Jeans (ohne Löcher), Blusen, Hemden, Strickpullover, Blazer, Loafer, Sneaker (clean/minimalistisch), Stiefeletten.
VERBOTEN: Leggings, Jogginghosen, Shorts, Crop Tops, Tank Tops, Sportschuhe (Laufschuhe), Hoodie, sehr kurze Röcke, zerrissene Kleidung.`,

  'Kreativ': `
PFLICHT: Ausdrucksstark und individuell – kreatives Arbeitsumfeld (Design, Medien, Kunst).
ERLAUBT: Trendige Kombinationen, interessante Muster, Statement-Pieces, Sneaker, Jeansjacke, Blazer mit Charakter.
VERBOTEN: Leggings als Hose, Jogginghosen, Sportkleidung, sehr zerrissene oder verschmutzte Kleidung.`,

  // Casual
  'Lässig': `
PFLICHT: Entspannt und alltagstauglich. Komfort steht im Vordergrund.
ERLAUBT: Jeans, T-Shirts, Pullover, Sneaker, einfache Kleider.
VERBOTEN: Sportkleidung (Leggings, Jogginghosen) außer explizit als Style-Statement, formelle Businesskleidung.`,

  'Wochenende': `
PFLICHT: Bequem und frisch für Freizeitaktivitäten. Entspannt aber gepflegt.
ERLAUBT: Jeans, Chinos, T-Shirts, Pullover, Sneaker, Stiefel, leichte Kleider.`,

  'Outdoor': `
PFLICHT: Praktisch und wetterfest für Outdoor-Aktivitäten.
ERLAUBT: Praktische Hosen, Funktionsjacken, Stiefel, robuste Schuhe, Layering-Pieces.
VERBOTEN: Elegante Schuhe (Pumps, Loafer ohne Profil), sehr empfindliche Materialien.`,

  // Abend
  'Elegant': `
PFLICHT: Festlich und stilvoll – Theater, Gala, formelles Dinner.
ERLAUBT: Abendkleider, elegante Midi/Maxi-Kleider, Blazer, Pumps, Stiefeletten mit Absatz, edle Accessoires.
VERBOTEN: Sneaker, Sportkleidung, zu lässige Jeans, Hoodies, Crop Tops im Freizeitstil.`,

  'Party': `
PFLICHT: Trendig, ausdrucksstark und festlich für eine Party oder Feier.
ERLAUBT: Kurze Kleider, trendige Outfits, Sneaker (wenn zum Look passend), Statement-Pieces, glänzende Stoffe.
VERBOTEN: Sportkleidung, Jogginghosen, reine Alltagskleidung ohne Aufwertung.`,

  'Dinner': `
PFLICHT: Gepflegt und angemessen für ein Restaurant-Dinner. Stilbewusst ohne übertrieben formal zu sein.
ERLAUBT: Kleider, elegante Hosen, Blusen, Stiefeletten, Pumps, Loafer.
VERBOTEN: Sportkleidung, Leggings, Sneaker (außer sehr clean), zu lässige T-Shirts.`,

  // Sport
  'Fitness': `
PFLICHT: Funktionale Sportkleidung für das Fitnessstudio.
ERLAUBT: Leggings, Sporttops, Tank Tops, Sportschuhe, Jogginghosen.
VERBOTEN: Jeans, Kleider, Blazer, elegante Schuhe, Baumwollhosen (unpraktisch beim Sport).`,

  'Outdoor Sport': `
PFLICHT: Wetterfeste, funktionale Sportkleidung für Outdoor-Aktivitäten.
ERLAUBT: Funktionshosen, Laufjacken, Sportschuhe (mit Profil), Layering-Pieces.
VERBOTEN: Elegante Kleidung, Jeans, Kleider, empfindliche Materialien.`,

  'Yoga': `
PFLICHT: Bequeme, dehnbare Kleidung für Yoga oder Pilates.
ERLAUBT: Leggings, Sporttops, weite Hosen, Tanktops, flexible Materialien.
VERBOTEN: Enge Jeans, Kleider, Schuhe (Yoga wird barfuß gemacht – keine Schuhe auswählen).`,

  // Date
  'Romantisch': `
PFLICHT: Weiblich, romantisch und einladend – perfekt für ein Date.
ERLAUBT: Kleider, feminine Blusen, schöne Röcke, Stiefeletten, Pumps, zarte Accessoires.
VERBOTEN: Reine Sportkleidung, zu lässige Alltagskleidung, Arbeitskleidung.`,

  'Leger': `
PFLICHT: Entspannt aber attraktiv – Coffee Date oder Spaziergang.
ERLAUBT: Jeans, T-Shirts, Pullover, Sneaker, lässige Kleider, Jeansjacke.
VERBOTEN: Sportkleidung, Leggings als Hose, zu formelle Businesskleidung.`,

  'Schick': `
PFLICHT: Gepflegt und stylisch – beeindruckend ohne zu overdressed zu wirken.
ERLAUBT: Kleider, schöne Hosen, elegante Tops, Stiefeletten, Pumps, Blazer.
VERBOTEN: Sportkleidung, Leggings, reine Freizeitkleidung.`,

  // Reise
  'Komfort': `
PFLICHT: Reisebequem – lange Flüge oder Zugreisen. Komfort hat Priorität.
ERLAUBT: Bequeme Hosen, Pullover, Sneaker, Strickjacken, Leggings (als Reisekleidung akzeptabel).
VERBOTEN: Unbequeme Schuhe (Pumps mit hohem Absatz), sehr empfindliche oder leicht knitterende Materialien.`,

  'City Trip': `
PFLICHT: Stylisch und praktisch für einen Städtetrip. Viel Laufen, aber trotzdem gut aussehen.
ERLAUBT: Jeans, Chinos, T-Shirts, Pullover, Sneaker, bequeme Stiefel, leichte Jacken.
VERBOTEN: High Heels (unpraktisch), empfindliche Materialien, zu formelle Kleidung.`,

  'Strandurlaub': `
PFLICHT: Sommer- und strandbewusst. Leicht, luftig, sonnentauglich.
ERLAUBT: Sommerkleider, Shorts, Sandalen, leichte Tops, Strandaccessoires.
VERBOTEN: Schwere Winterkleidung, Stiefel, formelle Businesskleidung.`,
};

export async function POST(request: NextRequest) {
  try {
    const { items, occasion, subOccasion }: { items: ClothingItem[]; occasion: string; subOccasion?: string } =
      await request.json();

    if (items.length < 2) {
      return NextResponse.json(
        { error: 'Bitte füge mindestens 2 Kleidungsstücke zu deinem Kleiderschrank hinzu.' },
        { status: 400 }
      );
    }

    const occasionRules = subOccasion ? OCCASION_RULES[subOccasion] : '';
    const fullOccasion = subOccasion ? `${occasion} – ${subOccasion}` : occasion;

    const itemList = items
      .map(
        (item) =>
          `ID:${item.id} | ${item.name} | Kategorie:${item.category}${item.subcategory ? ` (${item.subcategory})` : ''} | Farben:${item.colors.join('+')} | Stil:${item.style.join('+')} | Saison:${item.season.join('+')}`
      )
      .join('\n');

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Du bist ein professioneller Modeberater mit strengem Stilbewusstsein. Erstelle ein passendes Outfit für den angegebenen Anlass.

Verfügbare Kleidungsstücke:
${itemList}

Anlass: ${fullOccasion}
${occasionRules ? `\nSTRENGE ANLASS-REGELN (UNBEDINGT EINHALTEN):${occasionRules}` : ''}

Allgemeine Regeln:
- Wähle maximal: 1 Oberteil (tops), 1 Hose/Rock (bottoms) ODER 1 Kleid (dresses), 1 Jacke (outerwear, optional), 1 Schuhpaar (shoes, optional), 1 Accessoire (accessories, optional)
- Farben müssen harmonieren (komplementär, analog oder monochrom)
- Stil muss konsistent und für den Anlass passend sein
- Wenn kein passendes Kleidungsstück für den Anlass vorhanden ist, wähle das am besten geeignete und weise darauf hin
- WICHTIG: Überprüfe jedes gewählte Stück einzeln gegen die Anlass-Regeln bevor du es auswählst

Antworte NUR mit diesem JSON (kein anderer Text):
{
  "itemIds": ["exakte-id-1", "exakte-id-2"],
  "name": "kreativer Outfit-Name auf Deutsch",
  "description": "2-3 Sätze auf Deutsch warum diese Kombination perfekt zum Anlass passt",
  "colorScheme": "Farbschema-Beschreibung auf Deutsch",
  "stylingTip": "Ein konkreter Styling-Tipp auf Deutsch passend zum Anlass"
}`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response type');

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    const outfit = JSON.parse(jsonMatch[0]);

    const validIds = items.map((i) => i.id);
    outfit.itemIds = outfit.itemIds.filter((id: string) => validIds.includes(id));

    if (outfit.itemIds.length === 0) {
      throw new Error('No valid item IDs returned');
    }

    return NextResponse.json(outfit);
  } catch (error) {
    console.error('Generate outfit error:', error);
    return NextResponse.json({ error: 'Outfit-Generierung fehlgeschlagen' }, { status: 500 });
  }
}
