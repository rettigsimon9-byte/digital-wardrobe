import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, mediaType } = await request.json();

    const imageData = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType || 'image/jpeg',
                data: imageData,
              },
            },
            {
              type: 'text',
              text: `Analysiere dieses Kleidungsstück genau und gib NUR eine JSON-Antwort zurück (kein anderer Text, keine Erklärungen):
{
  "name": "präziser Name des Kleidungsstücks auf Deutsch (z.B. 'Weißes Leinenhemd', 'Schwarze Skinny Jeans')",
  "category": "GENAU EINES von: tops | bottoms | dresses | outerwear | shoes | accessories",
  "subcategory": "GENAU EINE passende Unterkategorie zur gewählten Hauptkategorie: tops→[Trägerloses Top | Spaghetti-Top | Tank Top | T-Shirt | Langarmshirt | Bluse | Hemd | Crop Top | Rollkragenpullover | Pullover | Strickpullover] | bottoms→[Jeans | Chinos | Shorts | Rock | Minirock | Maxirock | Jogginghose | Leggings | Anzughose] | dresses→[Minikleid | Midikleid | Maxikleid | Sommerkleid | Abendkleid | Wickelkleid] | outerwear→[Jeansjacke | Lederjacke | Blazer | Hoodie | Trenchcoat | Wintermantel | Cardigan | Bomberjacke | Pufferjacke] | shoes→[Sneaker | Pumps | Sandalen | Stiefel | Stiefeletten | Ballerinas | Loafer | Sportschuhe] | accessories→[Tasche | Handtasche | Rucksack | Gürtel | Schal | Mütze | Schmuck | Sonnenbrille | Hut]",
  "colors": ["Farbe1 auf Deutsch", "Farbe2 auf Deutsch"],
  "colorHex": ["#rrggbb", "#rrggbb"],
  "style": ["MINDESTENS EINES von: casual | klassisch | sportlich | elegant | streetwear | business | boho | minimalistisch"],
  "season": ["MINDESTENS EINES von: Frühling | Sommer | Herbst | Winter | Ganzjährig"],
  "description": "Ein Satz auf Deutsch der das Kleidungsstück beschreibt",
  "tags": ["tag1", "tag2", "tag3"]
}`,
            },
          ],
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response type');

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    const analysis = JSON.parse(jsonMatch[0]);
    return NextResponse.json(analysis);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Analyze error:', msg);
    return NextResponse.json({ error: 'Analyse fehlgeschlagen', detail: msg }, { status: 500 });
  }
}
