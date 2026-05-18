import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import type { ClothingItem } from '@/types';

const client = new Anthropic();

const OCCASION_RULES: Record<string, string> = {
  'Seriös': `
PFLICHT: Professionelle, bürogeeignete Kleidung für ein konservatives Arbeitsumfeld.
ERLAUBT: Blazer, Anzughosen, Chinos, Blusen, Hemden, Kleider (midi/maxi), elegante Röcke (midi), Pumps, Loafer, Stiefeletten.
VERBOTEN: Leggings, Jogginghosen, Shorts, Miniröcke (unter Knie), Trägerlose Tops, Spaghetti-Tops, Crop Tops, Tank Tops, Sportschuhe, Sneaker (außer sehr clean/minimalistisch), Hoodie, Bomberjacke, Strandkleidung.`,

  'Smart Casual': `
PFLICHT: Gepflegt und stilbewusst, aber nicht übermäßig formal.
ERLAUBT: Chinos, dunkle Jeans (ohne Löcher), Blusen, Hemden, Strickpullover, Blazer, Loafer, Sneaker (clean), Stiefeletten.
VERBOTEN: Leggings, Jogginghosen, Shorts, Crop Tops, Tank Tops, Sportschuhe, Hoodie, sehr kurze Röcke.`,

  'Kreativ': `
PFLICHT: Ausdrucksstark und individuell – kreatives Arbeitsumfeld.
ERLAUBT: Trendige Kombinationen, Statement-Pieces, Sneaker, Jeansjacke, Blazer.
VERBOTEN: Leggings als Hose, Jogginghosen, Sportkleidung.`,

  'Lässig': `PFLICHT: Entspannt und alltagstauglich. VERBOTEN: Sportkleidung (außer als Style-Statement), formelle Businesskleidung.`,
  'Wochenende': `PFLICHT: Bequem und frisch. ERLAUBT: Jeans, T-Shirts, Pullover, Sneaker, leichte Kleider.`,
  'Outdoor': `PFLICHT: Praktisch und wetterfest. VERBOTEN: Elegante Schuhe, sehr empfindliche Materialien.`,

  'Elegant': `
PFLICHT: Festlich und stilvoll – Theater, Gala, formelles Dinner.
ERLAUBT: Abendkleider, elegante Kleider, Blazer, Pumps, edle Accessoires.
VERBOTEN: Sneaker, Sportkleidung, Hoodies, lässige Jeans.`,

  'Party': `PFLICHT: Trendig und festlich. ERLAUBT: Kurze Kleider, Statement-Pieces. VERBOTEN: Sportkleidung, Jogginghosen.`,
  'Dinner': `PFLICHT: Gepflegt für Restaurant-Dinner. VERBOTEN: Sportkleidung, Leggings, sehr lässige T-Shirts.`,

  'Fitness': `PFLICHT: Funktionale Sportkleidung. ERLAUBT: Leggings, Sporttops, Sportschuhe. VERBOTEN: Jeans, Kleider, elegante Schuhe.`,
  'Outdoor Sport': `PFLICHT: Wetterfeste Sportkleidung. VERBOTEN: Elegante Kleidung, Jeans, Kleider.`,
  'Yoga': `PFLICHT: Dehnbare Kleidung. ERLAUBT: Leggings, Sporttops. VERBOTEN: Enge Jeans, Schuhe (kein Schuhpaar auswählen).`,

  'Romantisch': `PFLICHT: Weiblich und romantisch. ERLAUBT: Kleider, feminine Blusen, Röcke, Pumps. VERBOTEN: Sportkleidung.`,
  'Leger': `PFLICHT: Entspannt aber attraktiv. ERLAUBT: Jeans, T-Shirts, Sneaker. VERBOTEN: Sportkleidung, Businesskleidung.`,
  'Schick': `PFLICHT: Gepflegt und stylisch. ERLAUBT: Kleider, elegante Hosen, Blazer. VERBOTEN: Sportkleidung, Leggings.`,

  'Komfort': `PFLICHT: Reisebequem. ERLAUBT: Bequeme Hosen, Pullover, Sneaker, Leggings (als Reisekleidung akzeptabel).`,
  'City Trip': `PFLICHT: Stylisch und praktisch. ERLAUBT: Jeans, T-Shirts, Sneaker, bequeme Stiefel. VERBOTEN: High Heels, formelle Kleidung.`,
  'Strandurlaub': `PFLICHT: Leicht und luftig. ERLAUBT: Sommerkleider, Shorts, Sandalen. VERBOTEN: Winterkleidung, formelle Kleidung.`,
};

export async function POST(request: NextRequest) {
  try {
    const {
      items,
      occasion,
      subOccasion,
      previousCombinations = [],
    }: {
      items: ClothingItem[];
      occasion: string;
      subOccasion?: string;
      previousCombinations?: string[][];
    } = await request.json();

    if (items.length < 2) {
      return NextResponse.json(
        { error: 'Bitte füge mindestens 2 Kleidungsstücke zu deinem Kleiderschrank hinzu.' },
        { status: 400 }
      );
    }

    const occasionRules = subOccasion ? OCCASION_RULES[subOccasion] ?? '' : '';
    const fullOccasion = subOccasion ? `${occasion} – ${subOccasion}` : occasion;

    const itemList = items
      .map(
        (item) =>
          `ID:${item.id} | ${item.name} | Kategorie:${item.category}${item.subcategory ? ` (${item.subcategory})` : ''} | Farben:${item.colors.join('+')} | Stil:${item.style.join('+')} | Saison:${item.season.join('+')}`
      )
      .join('\n');

    const avoidHint =
      previousCombinations.length > 0
        ? `\nBEREITS GEZEIGTE KOMBINATIONEN (diese Item-ID-Gruppen nicht wiederholen):\n${previousCombinations.map((c) => c.join(', ')).join('\n')}`
        : '';

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `Du bist ein professioneller Modeberater. Erstelle bis zu 3 verschiedene, harmonische Outfits für den angegebenen Anlass. Jedes Outfit muss eine andere Kombination von Kleidungsstücken verwenden.

Verfügbare Kleidungsstücke:
${itemList}

Anlass: ${fullOccasion}
${occasionRules ? `\nSTRENGE ANLASS-REGELN (UNBEDINGT EINHALTEN):${occasionRules}` : ''}${avoidHint}

Allgemeine Regeln pro Outfit:
- Max: 1 Oberteil (tops), 1 Hose/Rock (bottoms) ODER 1 Kleid (dresses), 1 Jacke (outerwear, optional), 1 Schuhpaar (shoes, optional), 1 Accessoire (accessories, optional)
- Farben müssen harmonieren
- Stil muss konsistent und für den Anlass passend sein
- Jedes der 3 Outfits soll einen anderen Look/eine andere Stimmung haben
- Wenn nicht genug verschiedene Kleidungsstücke für 3 Outfits vorhanden sind, erstelle so viele wie möglich

Antworte NUR mit einem JSON-Array (kein anderer Text, keine Erklärungen):
[
  {
    "itemIds": ["id1", "id2"],
    "name": "kreativer Outfit-Name auf Deutsch",
    "description": "2 Sätze warum diese Kombination zum Anlass passt",
    "colorScheme": "Farbschema auf Deutsch",
    "stylingTip": "Ein Styling-Tipp auf Deutsch"
  }
]`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response type');

    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array in response');

    const outfits: { itemIds: string[]; name: string; description: string; colorScheme: string; stylingTip: string }[] =
      JSON.parse(jsonMatch[0]);

    const validIds = new Set(items.map((i) => i.id));
    const cleaned = outfits
      .map((o) => ({ ...o, itemIds: o.itemIds.filter((id) => validIds.has(id)) }))
      .filter((o) => o.itemIds.length > 0);

    if (cleaned.length === 0) throw new Error('No valid outfits returned');

    return NextResponse.json(cleaned);
  } catch (error) {
    console.error('Generate outfit error:', error);
    return NextResponse.json({ error: 'Outfit-Generierung fehlgeschlagen' }, { status: 500 });
  }
}
