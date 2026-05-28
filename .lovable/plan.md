## Feladat
A feltöltött `Kimetsu no Yaiba The Movie - Infinity Castle Part 1.ru.ass` ASS feliratfájl orosz szövegének magyarra fordítása, karakterhűen.

## Mit csinálok
1. Beolvasom a teljes .ass fájlt (1665 sor).
2. **Csak a `Dialogue:` sorok végén lévő szöveget** fordítom oroszról magyarra.
3. **Érintetlenül hagyom**:
   - `[Script Info]`, `[V4+ Styles]`, `[Events]` fejléceket
   - Időkódokat (Start/End)
   - Stílusneveket (Default, Song), Layer, Margin, Effect mezőket
   - ASS formázó tageket: `{\i1}`, `{\pos(...)}`, `\N` sortörés, `\h` stb.
   - Dalszöveg (`Song` stílus) sorokat is lefordítom, hacsak nem kéred, hogy maradjanak oroszul
4. AI Gateway-en keresztül (Gemini) batch-elve fordítom, hogy a kontextus és a karakternevek (Muzan, Tanjiro, Nezuko stb.) konzisztensek legyenek.
5. Eredmény mentése: `/mnt/documents/Kimetsu_no_Yaiba_Infinity_Castle_Part_1.hu.ass`
6. Ellenőrzés: sorok száma egyezik az eredetivel, időkódok bitre azonosak, csak a szöveg változott.

## Kérdés mielőtt indítok
- A **dalszövegeket (Song stílus)** is fordítsam magyarra, vagy maradjanak oroszul?
- Ha jó így, írd: **mehet**, és csinálom.
