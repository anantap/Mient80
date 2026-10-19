# Mient 80

Projectoverzicht voor de keukenverbouwing: status per lijn, to-do's, kosten en planning.
Next.js (App Router, TypeScript) op Vercel, data in Upstash Redis.

## Online zetten

1. **Repo koppelen in Vercel**: Vercel → *Add New… → Project* → kies de GitHub-repo `Mient80` → *Deploy*.
   Vercel herkent het framework zelf als Next.js; je hoeft geen build-instellingen aan te passen.
2. **Upstash toevoegen via Storage**: open het project in Vercel → tab *Storage* → *Create Database* →
   *Upstash for Redis* (Marketplace) → kies een regio (bijv. Frankfurt) → *Connect* aan het project.
   Vercel zet dan zelf `KV_REST_API_URL` en `KV_REST_API_TOKEN` als environment variables.
3. **(Optioneel) bewerkcode**: *Settings → Environment Variables* → `EDIT_CODE` = een code naar keuze.
   Is die gezet, dan vraagt de site één keer per apparaat om de code voordat je iets kunt wijzigen
   (onthouden in een cookie, een jaar geldig). Leeg of niet gezet = iedereen kan bewerken. Lezen is altijd open.
4. **Redeploy**: *Deployments* → laatste deployment → *Redeploy*, zodat de nieuwe variabelen actief zijn.
5. **Seed draaien** (lokaal, eenmalig):

   ```bash
   npm install
   npx vercel link          # koppel deze map aan het Vercel-project
   npx vercel env pull .env.local
   npm run seed
   ```

   De seed zet de beginwaarden (lijnen, to-do's, kosten, planning) alleen in collecties die nog leeg zijn.
   Bestaande data wordt nooit overschreven, dus je kunt hem veilig opnieuw draaien.

   Daarna voert de seed eenmalige migraties uit (`lib/migrations.ts`) voor een database die al gevuld was,
   zoals het invullen van de offerte van Hans van der Helm. Een migratie past alleen data aan die nog in de
   oorspronkelijke vorm staat; wat je zelf in de site hebt gewijzigd, blijft staan.

## Lokaal ontwikkelen

```bash
npm install
npm run dev     # http://localhost:3000
```

Zonder `KV_REST_API_URL`/`KV_REST_API_TOKEN` draait de app op een geheugenkopie van de seeddata
(wijzigingen verdwijnen bij herstarten). Met `.env.local` uit `vercel env pull` werk je tegen de echte database.

Overige scripts: `npm run build`, `npm run typecheck`.

## Opbouw

- `app/`: pagina's per tab (`/status`, `/todo`, `/kosten`, `/planning`) en `actions.ts` (server actions voor alle wijzigingen).
- `components/`: UI per tab, zijbalk, bewerkslot (`EditProvider`).
- `lib/`: types, seeddata, Redis-opslag, datum- en bedraghelpers, invoercontrole.
- `scripts/seed.ts`: vult Redis met de beginwaarden.

Data staat per collectie in een Redis-hash (`mient80:v2:lijnen`, `mient80:v2:todos`, `mient80:v2:kosten`,
`mient80:v2:planning`), met elk item als eigen veld. Zo kunnen twee wijzigingen kort na elkaar elkaar niet
overschrijven. Data uit de eerdere opslag (één JSON-document per collectie onder `mient80:<collectie>`) wordt
bij de eerste keer lezen automatisch overgezet; het oude document blijft als `mient80:<collectie>:v1-backup` bewaard.
Bedragen worden in centen opgeslagen. Het leenbedrag (€ 42.000) staat in `lib/types.ts` (`LENING`).

Is er geen database gekoppeld, dan toont de site bovenaan een waarschuwing dat wijzigingen niet worden bewaard.
