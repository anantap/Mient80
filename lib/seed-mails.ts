import type { Mail } from "./types";

/** Samenvattingen van het mailverkeer over de verbouwing (bijgewerkt t/m 4 november 2026). */
export const SEED_MAILS: Mail[] = [
  // ── Financiering: Paul Houweling (Buro Houweling) en Nationale-Nederlanden ──
  {
    id: "m01", datum: "2026-06-11", van: "Paul Houweling", partij: "financiering", richting: "uit",
    onderwerp: "Gesprek over bouwdepot aangevraagd",
    samenvatting: "We vragen Paul om een gesprek over het financieren van de verbouwing (keuken naar de woonkamer, oude keuken inrichten).",
    lijnId: "l6", belangrijk: false, threadId: "19eb5d4cca5505e7",
  },
  {
    id: "m02", datum: "2026-06-12", van: "Paul Houweling", partij: "financiering", richting: "in",
    onderwerp: "Hypotheekverhoging is mogelijk",
    samenvatting: "Na een belletje: verhogen kan, er is ruim voldoende ruimte. Advies: neem alle gewenste verbouwingen in één keer mee, omdat elke verhoging bijkomende kosten heeft. Afgesproken om eerst de kosten te laten inschatten.",
    lijnId: "l6", belangrijk: false, threadId: "19eb5d4cca5505e7",
  },
  {
    id: "m03", datum: "2026-08-10", van: "Paul Houweling", partij: "financiering", richting: "in",
    onderwerp: "Schatting voor de keuken mag",
    samenvatting: "Malouk meldt dat de begroting van de aannemer binnen is, maar de keuken nog ontbreekt. Paul: een schatting is genoeg. Wat het depot overhoudt wordt afgelost op de hypotheek; een tekort betaal je zelf, dus de afwijking moet niet groot zijn.",
    lijnId: "l6", belangrijk: false, threadId: "19eb5d4cca5505e7",
  },
  {
    id: "m04", datum: "2026-09-04", van: "Paul Houweling", partij: "financiering", richting: "in",
    onderwerp: "Begroting ca. € 37.000 en hoe het bouwdepot werkt",
    samenvatting: "We komen uit op ongeveer € 37.000. Paul legt uit: het bouwdepot is een geblokkeerde rekening; je dient facturen in en de bank toetst die aan het verbouwplan uit het taxatierapport. Het bedrag leg je vooraf vast, later ophogen kan niet.",
    lijnId: "l6", belangrijk: false, threadId: "19eb5d4cca5505e7",
  },
  {
    id: "m05", datum: "2026-09-09", van: "Paul Houweling", partij: "financiering", richting: "in",
    onderwerp: "Documentenlijst en voorwaarden voor de aanvraag",
    samenvatting: "Lijst met benodigde documenten en de verbouwingsspecificatie. Let op: een factuur (bijv. de aanbetaling van de keuken) moet een datum ná de hypotheekaanvraag hebben, anders kan hij niet uit het depot worden betaald. Akkoord geven op een offerte kan onder voorbehoud van financiering.",
    lijnId: "l6", belangrijk: true, threadId: "19eb5d4cca5505e7",
  },
  {
    id: "m06", datum: "2026-09-17", van: "Paul Houweling", partij: "financiering", richting: "in",
    onderwerp: "Afspraken over de financiering",
    samenvatting: "Samenvatting van het belletje: bijkomende kosten (taxatie, NHG, advies) worden meegefinancierd, de verhoging komt op € 42.922. Taxatie aangevraagd bij Stokman Van Duren. De verbouwingsspecificatie moet iets uitgebreider.",
    lijnId: "l6", belangrijk: true, threadId: "19eb5d4cca5505e7",
  },
  {
    id: "m07", datum: "2026-09-24", van: "Paul Houweling", partij: "financiering", richting: "in",
    onderwerp: "Renteaanbod Nationale-Nederlanden",
    samenvatting: "Renteaanbod van NN ontvangen: de bank reserveert de rente en noemt welke stukken nog nodig zijn.",
    lijnId: "l6", belangrijk: false, threadId: "19eb5d4cca5505e7",
  },
  {
    id: "m08", datum: "2026-10-06", van: "Paul Houweling", partij: "financiering", richting: "in",
    onderwerp: "Documenten ontvangen, formulier werkgever volgt",
    samenvatting: "We hebben de laatste documenten van de lijst gestuurd. Paul ontvangt nog graag het formulier aanvullende voorzieningen werkgever van Malouk; dat is nodig voor het advies, niet voor de aanvraag.",
    lijnId: "l6", belangrijk: false, threadId: "19eb5d4cca5505e7",
  },
  {
    id: "m09", datum: "2026-10-07", van: "Paul Houweling", partij: "financiering", richting: "in",
    onderwerp: "Verkort adviesplan: verbouwing € 42.000",
    samenvatting: "Verkort adviesplan met de verbouwing verhoogd van € 40.000 naar € 42.000 en de aangepaste advieskosten.",
    lijnId: "l6", belangrijk: false, threadId: "1a11621e0c6f6f34",
  },
  {
    id: "m10", datum: "2026-10-09", van: "Paul Houweling", partij: "financiering", richting: "in",
    onderwerp: "Definitieve offerte van Nationale-Nederlanden",
    samenvatting: "NN heeft de documenten beoordeeld en akkoord bevonden en de definitieve offerte uitgebracht.",
    lijnId: "l6", belangrijk: true, threadId: "1a11621e0c6f6f34",
  },
  {
    id: "m11", datum: "2026-10-19", van: "Paul Houweling", partij: "financiering", richting: "uit",
    onderwerp: "Adviesplan ontvangen, akkoordverklaring getekend",
    samenvatting: "Paul stuurt het volledige adviesplan en zijn factuur. Wij sturen dezelfde dag de getekende akkoordverklaring terug.",
    lijnId: "l6", belangrijk: false, threadId: "1a153865f251907d",
  },
  {
    id: "m12", datum: "2026-11-02", van: "Nationale-Nederlanden", partij: "financiering", richting: "in",
    onderwerp: "Hypotheekverhoging geregeld",
    samenvatting: "De hypotheekverhoging bij NN is rond; het bouwdepot is beschikbaar.",
    lijnId: "l6", belangrijk: true, threadId: "1a19e533f3963243",
  },
  {
    id: "m13", datum: "2026-11-02", van: "Nationale-Nederlanden", partij: "financiering", richting: "in",
    onderwerp: "Twee declaraties uit het bouwdepot uitbetaald",
    samenvatting: "Twee ingediende rekeningen (declaraties 1436450 en 1436451) zijn verwerkt en uitbetaald uit het bouwdepot.",
    lijnId: "l6", belangrijk: false, threadId: "1a19e8522e195847",
  },

  // ── Taxatie: Stokman Van Duren ──
  {
    id: "m14", datum: "2026-09-24", van: "NWWI / Stokman Van Duren", partij: "financiering", richting: "in",
    onderwerp: "Taxatie-aanvraag bevestigd",
    samenvatting: "De taxatie van Mient 80 is aangevraagd en doorgezet naar Stokman Van Duren. Daarna volgen de opdrachtvoorwaarden om te accepteren.",
    lijnId: "l6", belangrijk: false, threadId: "1a0d3d3bb99852f4",
  },
  {
    id: "m15", datum: "2026-09-27", van: "Verbouwingsopgave.nl", partij: "financiering", richting: "in",
    onderwerp: "Verbouwingsspecificatie gemaakt",
    samenvatting: "De verbouwingsspecificatie voor Mient 80 is opgesteld, voor de taxateur en de bank.",
    lijnId: "l6", belangrijk: false, threadId: "1a0e3a6ad9b92bd6",
  },
  {
    id: "m16", datum: "2026-09-29", van: "Stokman Van Duren", partij: "financiering", richting: "uit",
    onderwerp: "Taxatie-inspectie en stukken aangeleverd",
    samenvatting: "Bij de inspectie stuurden we op verzoek van de taxateur de verbouwingsspecificatie, een impressie van de nieuwe keuken en een kostenoverzicht. Stokman Van Duren bevestigt dat alles in het dossier zit.",
    lijnId: "l6", belangrijk: false, threadId: "1a0c300c4160c016",
  },
  {
    id: "m17", datum: "2026-10-05", van: "NWWI", partij: "financiering", richting: "in",
    onderwerp: "Taxatierapport klaar",
    samenvatting: "Het taxatierapport is door het NWWI goedgekeurd, ondertekend en staat klaar in MijnTaxatierapport.nl.",
    lijnId: "l6", belangrijk: false, threadId: "1a10b419aac42cd2",
  },

  // ── Baboon (Lindy) ──
  {
    id: "m18", datum: "2026-08-11", van: "Baboon", partij: "baboon", richting: "in",
    onderwerp: "Design meeting geboekt, aanbetaling ontvangen",
    samenvatting: "Design meeting met Lindy op 28 augustus in de studio. Baboon bevestigt de aanbetaling (factuur 2026-0811); die gaat later van de offerte af.",
    lijnId: "l1", belangrijk: false, threadId: "19fefd78e19ac2fc",
  },
  {
    id: "m19", datum: "2026-08-25", van: "Lindy (Baboon)", partij: "baboon", richting: "uit",
    onderwerp: "Voorbereiding design meeting",
    samenvatting: "Lindy vraagt om afmetingen, schetsen en inspiratie. We sturen schetsen en de plattegrond; Lindy kan ermee verder.",
    lijnId: "l1", belangrijk: false, threadId: "1a038e42b60c3305",
  },
  {
    id: "m20", datum: "2026-09-03", van: "Lindy (Baboon)", partij: "baboon", richting: "in",
    onderwerp: "Ontwerp en offerte 2026-1461",
    samenvatting: "Uitgewerkt ontwerp en eerste offerte na het ontwerpgesprek. Op onze vraag: het vaatwasserfront in het ontwerp is 80 cm hoog.",
    lijnId: "l1", belangrijk: false, threadId: "1a0668e68abbb45f",
  },
  {
    id: "m21", datum: "2026-09-04", van: "Lindy (Baboon)", partij: "baboon", richting: "in",
    onderwerp: "Lijst met monteurs",
    samenvatting: "Op onze vraag stuurt Lindy een lijst met partijen voor inmeten en montage, onder andere Reveal Works (Lars van der Zijden) en Baas klus (David Rijkee).",
    lijnId: "l3", belangrijk: false, threadId: "1a0668e68abbb45f",
  },
  {
    id: "m22", datum: "2026-09-10", van: "Baboon", partij: "baboon", richting: "in",
    onderwerp: "Final call verzet naar 16 oktober",
    samenvatting: "Omdat het inmeten nog niet gelukt was, is de final call verzet van 11 september naar vrijdag 16 oktober, 11:00 (online).",
    lijnId: "l1", belangrijk: false, threadId: "1a08bed57152880d",
  },
  {
    id: "m23", datum: "2026-09-29", van: "Lindy (Baboon)", partij: "baboon", richting: "in",
    onderwerp: "Maten verwerkt, offertedatum en levertijd",
    samenvatting: "Op 28 september is de keuken ingemeten. We vroegen naar de verloopdatum van de offerte (3 okt) en de levertijd voor plaatsing rond week 4. Lindy verwerkt de maten; 16 oktober voor de final call is prima.",
    lijnId: "l1", belangrijk: false, threadId: "1a0668e68abbb45f",
  },
  {
    id: "m24", datum: "2026-10-19", van: "Lindy (Baboon)", partij: "baboon", richting: "in",
    onderwerp: "Eindofferte 2026-1745",
    samenvatting: "Eindofferte na de final call (€ 4.496 na aftrek aanbetaling). Productie start na acceptatie en betaling van minimaal 50%. Levertijd 10–14 weken na betaling; na ongeveer vier weken volgt de verwachte leverdatum. Wij stuurden het ontwerp door naar Baas klus.",
    lijnId: "l1", belangrijk: false, threadId: "1a153e7e29e2ec54",
  },
  {
    id: "m25", datum: "2026-10-20", van: "Baboon", partij: "baboon", richting: "in",
    onderwerp: "Offerte geaccepteerd, factuur voor bouwdepot",
    samenvatting: "We hebben offerte 2026-1745 geaccepteerd. Baboon stuurt factuur 2026-1042 voor het hele bedrag, zodat we die bij het bouwdepot kunnen indienen; hij moet dan in één keer betaald worden.",
    lijnId: "l1", belangrijk: true, threadId: "1a1591f52d9c2d2a",
  },
  {
    id: "m26", datum: "2026-11-03", van: "Lindy (Baboon)", partij: "baboon", richting: "uit",
    onderwerp: "Factuur ingediend, vragen over leverdatum en apparatuur",
    samenvatting: "We melden dat factuur 2026-1042 (€ 4.496) bij het bouwdepot is ingediend en vragen om de leverdatum zodra de bestelling in productie gaat. Ook gevraagd of vaatwasser, koel-vriescombinatie en combi-oven in het ontwerp passen, en of er een lijst met IKEA-onderdelen is.",
    lijnId: "l1", belangrijk: false, threadId: "1a153e7e29e2ec54",
  },
  {
    id: "m27", datum: "2026-11-03", van: "Lindy (Baboon)", partij: "baboon", richting: "in",
    onderwerp: "Vaatwasser past waarschijnlijk niet",
    samenvatting: "Het ontwerp heeft een vaatwasserfront van 80 cm, dus Lindy is bang dat de vaatwasser niet past (die vraagt een front van max. 77,6 cm). Koelkast en combi-oven lijken wel te passen. Baboon heeft geen IKEA-bestellijst: ga met hun tekening naar IKEA, die weten wat er besteld moet worden.",
    lijnId: "l1", belangrijk: true, threadId: "1a153e7e29e2ec54",
  },
  {
    id: "m28", datum: "2026-11-04", van: "Lindy (Baboon)", partij: "baboon", richting: "in",
    onderwerp: "Baboon checkt apparatuur niet, wel een dubbele check op maten",
    samenvatting: "Baboon is niet verantwoordelijk voor apparatuur; meestal weet de leverancier of het in een IKEA-keuken past. Lindy wil wel de maten checken op basis van typenummers. Wij stuurden de offerte met typenummers en de inbouwmaten van Hans van der Helm.",
    lijnId: "l1", belangrijk: false, threadId: "1a153e7e29e2ec54",
  },

  // ── Hans van der Helm keukens (Yrsha) ──
  {
    id: "m29", datum: "2026-10-16", van: "Yrsha (Hans van der Helm)", partij: "hvdh", richting: "in",
    onderwerp: "Offerte W202600798 na showroombezoek",
    samenvatting: "Eerste offerte voor werkblad en apparatuur (€ 9.975,20). Niet alle gekozen apparatuur was leverbaar. Wij reageren: recirculatie voor de afzuiging, en de vraag of montage is inbegrepen.",
    lijnId: "l5", belangrijk: false, threadId: "1a1452e7dfe81661",
  },
  {
    id: "m30", datum: "2026-10-17", van: "Yrsha (Hans van der Helm)", partij: "hvdh", richting: "in",
    onderwerp: "Aangepaste offerte en showroomafspraak",
    samenvatting: "Aangepaste offerte met oven en kookplaat in matzwart; montage zit er niet in. Vlakinbouw kan maar is duurder en lastiger te vervangen. Wij kiezen opbouw en glanzend zwart (Proline). Afspraak in de showroom op vrijdag 30 oktober, 15:00.",
    lijnId: "l5", belangrijk: false, threadId: "1a148d500a5ce2c5",
  },
  {
    id: "m31", datum: "2026-10-30", van: "Yrsha (Hans van der Helm)", partij: "hvdh", richting: "in",
    onderwerp: "Offerte W202600804 rev. 2 na showroom",
    samenvatting: "Nieuwe offerte na het gesprek in de showroom: Electrolux in plaats van AEG, totaal € 9.043 (werkblad € 4.268, apparatuur € 4.775), excl. montage. Wij vragen of alle apparatuur in de IKEA-kasten past.",
    lijnId: "l5", belangrijk: false, threadId: "1a18d4d4c3091dc3",
  },
  {
    id: "m32", datum: "2026-10-31", van: "Yrsha (Hans van der Helm)", partij: "hvdh", richting: "in",
    onderwerp: "Inbouwmaten per apparaat",
    samenvatting: "Koel-vriescombinatie: nis h 1773–1780 × b 560–568 × d 550–560 mm. Combi-oven: nis h 450 × b 560 × d 550 mm. Vaatwasser: buitenmaat h 818 × b 596 × d 550 mm; het front moet minimaal 645 en maximaal 776 mm hoog zijn. Check dat bij de leverancier van de fronten.",
    lijnId: "l5", belangrijk: true, threadId: "1a18d4d4c3091dc3",
  },
  {
    id: "m33", datum: "2026-11-03", van: "Yrsha (Hans van der Helm)", partij: "hvdh", richting: "uit",
    onderwerp: "Akkoord met offerte W202600804",
    samenvatting: "De financiering is rond, dus we gaan akkoord. Gevraagd: levering afstemmen op plaatsing rond week 4, factuur op beide namen met adres en specificatie (voor het bouwdepot), en hoe aanbetaling en restbetaling werken. Vaatwasserfront checken we bij Baboon.",
    lijnId: "l5", belangrijk: false, threadId: "1a1a06cfde0a60df",
  },
  {
    id: "m34", datum: "2026-11-04", van: "Yrsha (Hans van der Helm)", partij: "hvdh", richting: "in",
    onderwerp: "Offerte ondertekenen, aanbetaling 25%",
    samenvatting: "Graag de offerte geprint, ondertekend en gescand terug. Daarna volgt een factuur voor 25% aanbetaling; de rest vóór bezorging. Apparatuur is ongeveer twee weken na bestelling binnen; bestellen zodra de opleverdatum vaststaat. Het werkblad wordt pas ingemeten als de keuken staat. Yrsha vraagt een monteur om een offerte voor de montage, en vraagt nog of alle maten passen.",
    lijnId: "l5", belangrijk: true, threadId: "1a1a06cfde0a60df",
  },

  // ── Multimar ──
  {
    id: "m35", datum: "2026-08-04", van: "Marco Timmermans (Multimar)", partij: "multimar", richting: "in",
    onderwerp: "Begroting verbouwing",
    samenvatting: "Marco stuurt de begroting voor de verbouwing (voorbereiding, leidingen en elektra). Op 3 september stuurden we een reactie met bijlagen terug.",
    lijnId: "l4", belangrijk: false, threadId: "19fcbe4e0ea65745",
  },

  // ── Montage ──
  {
    id: "m36", datum: "2026-09-07", van: "Baas klus", partij: "baasklus", richting: "in",
    onderwerp: "Offerte montage 2026-0048-1",
    samenvatting: "Offerte 2026-0048-1 van Baas klus voor inmeten, plaatsen (2 dagen) en vervoer; termijnen 50/30/20 %. De mail kwam binnen onder de naam Reveal Works.",
    lijnId: "l3", belangrijk: false, threadId: "1a07c02850ca5182",
  },
];
