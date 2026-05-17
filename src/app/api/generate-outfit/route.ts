import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import type { ClothingItem } from '@/types';

const client = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const { items, occasion }: { items: ClothingItem[]; occasion: string } =
      await request.json();

    if (items.length < 2) {
      return NextResponse.json(
        { error: 'Bitte füge mindestens 2 Kleidungsstücke zu deinem Kleiderschrank hinzu.' },
        { status: 400 }
      );
    }

    const itemList = items
      .map(
        (item) =>
          `ID:${item.id} | ${item.name} | Kategorie:${item.category} | Farben:${item.colors.join('+')} | Stil:${item.style.join('+')} | Saison:${item.season.join('+')}`
      )
      .join('\n');

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Du bist ein professioneller Modeberater. Erstelle ein harmonisches, stimmiges Outfit aus diesen Kleidungsstücken.

Verfügbare Kleidungsstücke:
${itemList}

Anlass: ${occasion}

Regeln:
- Wähle maximal: 1 Oberteil (tops), 1 Hose/Rock (bottoms) ODER 1 Kleid (dresses), 1 Jacke (outerwear, optional), 1 Schuhpaar (shoes, optional), 1 Accessoire (accessories, optional)
- Farben müssen harmonieren (komplementär, analog oder monochrom)
- Stil muss konsistent und für den Anlass passend sein
- Bevorzuge vollständige Outfits (Oberteil + Hose/Rock oder Kleid)

Antworte NUR mit diesem JSON (kein anderer Text):
{
  "itemIds": ["exakte-id-1", "exakte-id-2"],
  "name": "kreativer Outfit-Name auf Deutsch",
  "description": "2-3 Sätze auf Deutsch warum diese Kombination perfekt zusammenpasst",
  "colorScheme": "Farbschema-Beschreibung auf Deutsch (z.B. 'Monochromes Blau mit Akzenten')",
  "stylingTip": "Ein konkreter Styling-Tipp auf Deutsch"
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
