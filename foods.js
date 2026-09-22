/* ==========================================================================
   FOODS.JS — database di riferimento alimenti (valori per 100 g)
   --------------------------------------------------------------------------
   Questo è un elenco indipendente di valori nutrizionali medi, tipici della
   letteratura nutrizionale generale — NON è un'estrazione delle tabelle
   CREA (il sito https://www.alimentinutrizione.it dichiara espressamente che
   i propri dati non possono essere copiati/riprodotti). Usa questo elenco
   come punto di partenza pratico e comodo; per un singolo alimento puoi
   sempre modificarne i valori o aggiungerne uno nuovo dalla scheda "Diete",
   confrontandoti se vuoi con le tabelle ufficiali CREA per la massima
   precisione clinica su un caso specifico.

   Struttura: { name, kcal, protein, carbs, fat, fiber } per 100 g di parte edibile.
   ========================================================================== */

const FOOD_DB = [
  // ---- Cereali, pane, pasta ----
  { name: "Pasta di semola, cruda", kcal: 353, protein: 12.8, carbs: 71.7, fat: 1.5, fiber: 2.9 },
  { name: "Pasta di semola, cotta", kcal: 158, protein: 5.8, carbs: 31.9, fat: 0.7, fiber: 1.8 },
  { name: "Pasta integrale, cruda", kcal: 337, protein: 13.4, carbs: 66.2, fat: 2.5, fiber: 8.0 },
  { name: "Pasta integrale, cotta", kcal: 148, protein: 5.9, carbs: 29.2, fat: 1.1, fiber: 3.5 },
  { name: "Riso, crudo", kcal: 332, protein: 6.7, carbs: 80.4, fat: 0.6, fiber: 1.0 },
  { name: "Riso, cotto", kcal: 130, protein: 2.7, carbs: 28.2, fat: 0.3, fiber: 0.4 },
  { name: "Riso integrale, crudo", kcal: 337, protein: 7.5, carbs: 77.2, fat: 2.8, fiber: 3.5 },
  { name: "Riso integrale, cotto", kcal: 123, protein: 2.7, carbs: 25.8, fat: 1.0, fiber: 1.8 },
  { name: "Pane comune (bianco)", kcal: 275, protein: 7.9, carbs: 56.0, fat: 1.0, fiber: 3.4 },
  { name: "Pane integrale", kcal: 224, protein: 7.5, carbs: 42.0, fat: 1.4, fiber: 7.2 },
  { name: "Pane azzimo / carasau", kcal: 350, protein: 11.0, carbs: 74.0, fat: 1.5, fiber: 3.0 },
  { name: "Fette biscottate", kcal: 408, protein: 10.5, carbs: 76.8, fat: 6.8, fiber: 3.0 },
  { name: "Grissini", kcal: 434, protein: 11.7, carbs: 74.9, fat: 10.3, fiber: 3.0 },
  { name: "Cracker salati", kcal: 439, protein: 10.0, carbs: 66.0, fat: 15.0, fiber: 3.0 },
  { name: "Farina di frumento tipo 00", kcal: 340, protein: 11.0, carbs: 72.6, fat: 1.0, fiber: 2.2 },
  { name: "Farina di frumento integrale", kcal: 319, protein: 12.0, carbs: 61.9, fat: 1.9, fiber: 8.0 },
  { name: "Cous cous, cotto", kcal: 112, protein: 3.8, carbs: 23.2, fat: 0.2, fiber: 1.4 },
  { name: "Orzo perlato, crudo", kcal: 313, protein: 10.4, carbs: 70.0, fat: 1.5, fiber: 7.0 },
  { name: "Farro perlato, crudo", kcal: 335, protein: 15.0, carbs: 67.0, fat: 2.5, fiber: 8.0 },
  { name: "Farro perlato, cotto", kcal: 145, protein: 5.5, carbs: 28.0, fat: 1.0, fiber: 4.0 },
  { name: "Quinoa, cruda", kcal: 368, protein: 14.1, carbs: 64.2, fat: 6.1, fiber: 7.0 },
  { name: "Quinoa, cotta", kcal: 120, protein: 4.4, carbs: 21.3, fat: 1.9, fiber: 2.8 },
  { name: "Avena, fiocchi", kcal: 389, protein: 16.9, carbs: 66.3, fat: 6.9, fiber: 10.6 },
  { name: "Muesli", kcal: 362, protein: 9.0, carbs: 66.0, fat: 6.0, fiber: 7.0 },
  { name: "Polenta, cotta", kcal: 70, protein: 1.7, carbs: 14.9, fat: 0.4, fiber: 1.0 },
  { name: "Biscotti frollini", kcal: 450, protein: 7.0, carbs: 68.0, fat: 17.0, fiber: 2.0 },
  { name: "Biscotti integrali", kcal: 430, protein: 8.0, carbs: 65.0, fat: 14.0, fiber: 5.0 },
  { name: "Pizza con pomodoro e mozzarella", kcal: 271, protein: 10.4, carbs: 33.7, fat: 10.5, fiber: 2.0 },

  // ---- Legumi ----
  { name: "Ceci, secchi crudi", kcal: 316, protein: 20.9, carbs: 54.3, fat: 6.0, fiber: 15.0 },
  { name: "Ceci, cotti bolliti", kcal: 164, protein: 8.9, carbs: 27.4, fat: 2.6, fiber: 7.6 },
  { name: "Fagioli borlotti, secchi crudi", kcal: 314, protein: 21.9, carbs: 45.4, fat: 2.3, fiber: 16.8 },
  { name: "Fagioli borlotti, cotti bolliti", kcal: 127, protein: 8.7, carbs: 22.8, fat: 0.5, fiber: 6.4 },
  { name: "Fagioli cannellini, cotti bolliti", kcal: 123, protein: 8.5, carbs: 21.0, fat: 0.5, fiber: 6.3 },
  { name: "Lenticchie, secche crude", kcal: 291, protein: 22.7, carbs: 46.6, fat: 1.1, fiber: 11.3 },
  { name: "Lenticchie, cotte bollite", kcal: 116, protein: 9.0, carbs: 20.0, fat: 0.4, fiber: 7.9 },
  { name: "Fave, secche crude", kcal: 341, protein: 26.1, carbs: 47.8, fat: 2.2, fiber: 19.4 },
  { name: "Piselli, freschi", kcal: 81, protein: 5.4, carbs: 12.9, fat: 0.4, fiber: 4.5 },
  { name: "Piselli, surgelati", kcal: 65, protein: 5.0, carbs: 10.0, fat: 0.5, fiber: 5.0 },
  { name: "Soia, semi secchi", kcal: 375, protein: 36.5, carbs: 23.3, fat: 18.0, fiber: 15.7 },
  { name: "Tofu", kcal: 76, protein: 8.1, carbs: 1.9, fat: 4.8, fiber: 0.3 },
  { name: "Hummus di ceci", kcal: 177, protein: 7.9, carbs: 14.3, fat: 9.6, fiber: 6.0 },

  // ---- Verdura ----
  { name: "Pomodori, freschi", kcal: 19, protein: 1.0, carbs: 3.5, fat: 0.2, fiber: 1.2 },
  { name: "Zucchine, fresche", kcal: 18, protein: 1.3, carbs: 1.8, fat: 0.1, fiber: 1.2 },
  { name: "Melanzane, fresche", kcal: 18, protein: 1.1, carbs: 2.6, fat: 0.2, fiber: 2.6 },
  { name: "Peperoni, freschi", kcal: 22, protein: 1.0, carbs: 4.2, fat: 0.3, fiber: 1.9 },
  { name: "Carote, fresche", kcal: 35, protein: 1.1, carbs: 7.6, fat: 0.2, fiber: 3.1 },
  { name: "Patate, crude", kcal: 80, protein: 2.0, carbs: 18.5, fat: 0.1, fiber: 1.6 },
  { name: "Patate, lesse", kcal: 85, protein: 1.9, carbs: 20.0, fat: 0.1, fiber: 1.6 },
  { name: "Lattuga, fresca", kcal: 15, protein: 1.4, carbs: 2.2, fat: 0.3, fiber: 1.5 },
  { name: "Spinaci, freschi crudi", kcal: 25, protein: 3.1, carbs: 3.6, fat: 0.3, fiber: 2.6 },
  { name: "Broccoli, freschi", kcal: 34, protein: 3.3, carbs: 3.1, fat: 0.4, fiber: 3.1 },
  { name: "Cavolfiore, fresco", kcal: 24, protein: 2.4, carbs: 2.6, fat: 0.2, fiber: 2.4 },
  { name: "Zucca, fresca", kcal: 18, protein: 1.1, carbs: 3.5, fat: 0.1, fiber: 1.5 },
  { name: "Fagiolini, freschi", kcal: 27, protein: 2.1, carbs: 4.2, fat: 0.2, fiber: 3.8 },
  { name: "Cipolle, fresche", kcal: 26, protein: 1.1, carbs: 5.7, fat: 0.2, fiber: 1.3 },
  { name: "Funghi champignon, freschi", kcal: 20, protein: 3.1, carbs: 2.3, fat: 0.3, fiber: 1.4 },
  { name: "Finocchi, freschi", kcal: 31, protein: 1.2, carbs: 5.0, fat: 0.2, fiber: 3.1 },
  { name: "Cetrioli, freschi", kcal: 12, protein: 0.7, carbs: 1.5, fat: 0.1, fiber: 0.7 },
  { name: "Radicchio, fresco", kcal: 13, protein: 1.4, carbs: 1.6, fat: 0.2, fiber: 1.9 },
  { name: "Rucola, fresca", kcal: 25, protein: 2.6, carbs: 2.1, fat: 0.7, fiber: 1.6 },
  { name: "Carciofi, freschi", kcal: 22, protein: 2.7, carbs: 2.5, fat: 0.2, fiber: 5.5 },
  { name: "Cavolo verza, fresco", kcal: 25, protein: 2.4, carbs: 3.0, fat: 0.3, fiber: 3.1 },
  { name: "Sedano, fresco", kcal: 20, protein: 1.0, carbs: 3.1, fat: 0.2, fiber: 1.7 },

  // ---- Frutta ----
  { name: "Mele, fresche", kcal: 52, protein: 0.3, carbs: 13.8, fat: 0.4, fiber: 2.4 },
  { name: "Pere, fresche", kcal: 42, protein: 0.3, carbs: 10.9, fat: 0.1, fiber: 3.1 },
  { name: "Banane, fresche", kcal: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6 },
  { name: "Arance, fresche", kcal: 34, protein: 0.7, carbs: 7.8, fat: 0.2, fiber: 1.6 },
  { name: "Kiwi, freschi", kcal: 57, protein: 1.1, carbs: 11.0, fat: 0.6, fiber: 2.4 },
  { name: "Fragole, fresche", kcal: 27, protein: 0.9, carbs: 5.3, fat: 0.4, fiber: 1.6 },
  { name: "Uva, fresca", kcal: 61, protein: 0.5, carbs: 15.6, fat: 0.1, fiber: 0.9 },
  { name: "Ananas, fresco", kcal: 48, protein: 0.5, carbs: 12.2, fat: 0.1, fiber: 1.2 },
  { name: "Melone, fresco", kcal: 29, protein: 0.8, carbs: 6.2, fat: 0.2, fiber: 0.7 },
  { name: "Anguria/cocomero, fresco", kcal: 16, protein: 0.6, carbs: 3.4, fat: 0.2, fiber: 0.3 },
  { name: "Pesche, fresche", kcal: 27, protein: 0.9, carbs: 6.1, fat: 0.1, fiber: 1.4 },
  { name: "Albicocche, fresche", kcal: 28, protein: 0.8, carbs: 6.2, fat: 0.1, fiber: 1.4 },
  { name: "Prugne, fresche", kcal: 42, protein: 0.5, carbs: 10.0, fat: 0.2, fiber: 1.5 },
  { name: "Mirtilli, freschi", kcal: 43, protein: 0.6, carbs: 9.7, fat: 0.3, fiber: 2.4 },
  { name: "Avocado, fresco", kcal: 160, protein: 2.0, carbs: 8.5, fat: 14.7, fiber: 6.7 },
  { name: "Limoni, freschi", kcal: 29, protein: 1.0, carbs: 2.5, fat: 0.3, fiber: 2.4 },
  { name: "Cachi/loti, freschi", kcal: 65, protein: 0.6, carbs: 15.9, fat: 0.2, fiber: 2.5 },
  { name: "Fichi, freschi", kcal: 47, protein: 1.0, carbs: 10.0, fat: 0.3, fiber: 2.5 },
  { name: "Melagrane, fresche", kcal: 63, protein: 0.9, carbs: 14.0, fat: 0.3, fiber: 3.4 },

  // ---- Frutta secca e oleosi ----
  { name: "Noci, secche", kcal: 654, protein: 15.0, carbs: 13.7, fat: 65.2, fiber: 6.7 },
  { name: "Mandorle, secche", kcal: 579, protein: 21.2, carbs: 21.6, fat: 49.9, fiber: 12.5 },
  { name: "Nocciole, secche", kcal: 628, protein: 15.0, carbs: 17.0, fat: 60.8, fiber: 9.7 },
  { name: "Pistacchi", kcal: 562, protein: 20.6, carbs: 27.2, fat: 45.4, fiber: 10.3 },
  { name: "Arachidi, tostate", kcal: 567, protein: 25.8, carbs: 16.1, fat: 49.2, fiber: 8.5 },
  { name: "Anacardi", kcal: 553, protein: 18.0, carbs: 30.0, fat: 44.0, fiber: 3.3 },

  // ---- Carne ----
  { name: "Pollo, petto, crudo", kcal: 120, protein: 22.5, carbs: 0.0, fat: 2.6, fiber: 0 },
  { name: "Pollo, petto, cotto alla griglia", kcal: 165, protein: 31.0, carbs: 0.0, fat: 3.6, fiber: 0 },
  { name: "Tacchino, petto, crudo", kcal: 104, protein: 24.0, carbs: 0.0, fat: 1.0, fiber: 0 },
  { name: "Manzo, fesa/girello, crudo", kcal: 109, protein: 21.8, carbs: 0.0, fat: 2.3, fiber: 0 },
  { name: "Manzo, macinato 20% m.g., crudo", kcal: 254, protein: 17.2, carbs: 0.0, fat: 20.0, fiber: 0 },
  { name: "Vitello, crudo", kcal: 109, protein: 20.7, carbs: 0.0, fat: 2.6, fiber: 0 },
  { name: "Maiale, lonza, cruda", kcal: 143, protein: 21.3, carbs: 0.0, fat: 6.0, fiber: 0 },
  { name: "Coniglio, crudo", kcal: 118, protein: 21.0, carbs: 0.0, fat: 3.5, fiber: 0 },
  { name: "Prosciutto cotto, sgrassato", kcal: 109, protein: 17.9, carbs: 0.3, fat: 3.7, fiber: 0 },
  { name: "Prosciutto crudo, sgrassato", kcal: 159, protein: 25.6, carbs: 0.0, fat: 6.3, fiber: 0 },
  { name: "Bresaola", kcal: 151, protein: 32.0, carbs: 0.3, fat: 2.6, fiber: 0 },
  { name: "Speck", kcal: 262, protein: 22.4, carbs: 0.0, fat: 19.0, fiber: 0 },
  { name: "Salame, medio", kcal: 407, protein: 25.0, carbs: 1.0, fat: 34.0, fiber: 0 },
  { name: "Bistecca di maiale, cotta in padella", kcal: 240, protein: 27.0, carbs: 0.0, fat: 14.0, fiber: 0 },

  // ---- Pesce ----
  { name: "Salmone, crudo", kcal: 208, protein: 20.0, carbs: 0.0, fat: 13.0, fiber: 0 },
  { name: "Tonno, fresco crudo", kcal: 144, protein: 23.3, carbs: 0.0, fat: 4.9, fiber: 0 },
  { name: "Tonno in scatola, sott'olio sgocciolato", kcal: 192, protein: 25.2, carbs: 0.4, fat: 10.4, fiber: 0 },
  { name: "Tonno in scatola, al naturale", kcal: 103, protein: 25.0, carbs: 0.0, fat: 0.8, fiber: 0 },
  { name: "Merluzzo/nasello, fresco", kcal: 76, protein: 17.0, carbs: 0.0, fat: 0.6, fiber: 0 },
  { name: "Orata, fresca", kcal: 121, protein: 20.0, carbs: 0.0, fat: 4.5, fiber: 0 },
  { name: "Branzino/spigola, fresco", kcal: 97, protein: 18.4, carbs: 0.0, fat: 2.5, fiber: 0 },
  { name: "Gamberi, freschi", kcal: 71, protein: 17.6, carbs: 1.0, fat: 0.5, fiber: 0 },
  { name: "Cozze/mitili", kcal: 84, protein: 11.7, carbs: 3.4, fat: 2.7, fiber: 0 },
  { name: "Calamari", kcal: 68, protein: 15.0, carbs: 1.0, fat: 1.0, fiber: 0 },
  { name: "Polpo", kcal: 57, protein: 10.6, carbs: 1.4, fat: 1.0, fiber: 0 },
  { name: "Sgombro, fresco", kcal: 205, protein: 19.0, carbs: 0.0, fat: 14.0, fiber: 0 },

  // ---- Uova ----
  { name: "Uova di gallina, intere", kcal: 143, protein: 12.6, carbs: 0.8, fat: 10.0, fiber: 0 },
  { name: "Albume d'uovo", kcal: 48, protein: 10.9, carbs: 0.7, fat: 0.0, fiber: 0 },
  { name: "Tuorlo d'uovo", kcal: 322, protein: 16.0, carbs: 1.0, fat: 28.0, fiber: 0 },

  // ---- Latte e derivati ----
  { name: "Latte vaccino, intero", kcal: 64, protein: 3.3, carbs: 4.9, fat: 3.6, fiber: 0 },
  { name: "Latte vaccino, parz. scremato", kcal: 46, protein: 3.4, carbs: 4.9, fat: 1.5, fiber: 0 },
  { name: "Latte vaccino, scremato", kcal: 36, protein: 3.4, carbs: 5.0, fat: 0.2, fiber: 0 },
  { name: "Yogurt intero, bianco", kcal: 66, protein: 3.5, carbs: 4.3, fat: 3.6, fiber: 0 },
  { name: "Yogurt magro, bianco", kcal: 42, protein: 4.0, carbs: 4.7, fat: 0.7, fiber: 0 },
  { name: "Yogurt greco, 0% grassi", kcal: 59, protein: 10.0, carbs: 3.6, fat: 0.4, fiber: 0 },
  { name: "Mozzarella vaccina", kcal: 253, protein: 18.7, carbs: 0.7, fat: 19.5, fiber: 0 },
  { name: "Mozzarella di bufala", kcal: 288, protein: 17.0, carbs: 0.4, fat: 24.0, fiber: 0 },
  { name: "Parmigiano Reggiano", kcal: 392, protein: 33.0, carbs: 0.0, fat: 28.0, fiber: 0 },
  { name: "Grana Padano", kcal: 384, protein: 33.0, carbs: 0.0, fat: 28.0, fiber: 0 },
  { name: "Ricotta vaccina", kcal: 146, protein: 8.8, carbs: 3.5, fat: 10.9, fiber: 0 },
  { name: "Fiocchi di formaggio magro (tipo cottage)", kcal: 98, protein: 12.0, carbs: 3.4, fat: 4.3, fiber: 0 },
  { name: "Formaggio spalmabile, light", kcal: 142, protein: 10.0, carbs: 4.0, fat: 9.0, fiber: 0 },
  { name: "Emmenthal/Groviera", kcal: 380, protein: 28.0, carbs: 0.0, fat: 29.0, fiber: 0 },
  { name: "Feta", kcal: 264, protein: 14.2, carbs: 4.1, fat: 21.3, fiber: 0 },

  // ---- Grassi e condimenti ----
  { name: "Olio extravergine d'oliva", kcal: 899, protein: 0.0, carbs: 0.0, fat: 99.9, fiber: 0 },
  { name: "Burro", kcal: 758, protein: 0.6, carbs: 0.7, fat: 83.4, fiber: 0 },
  { name: "Maionese", kcal: 680, protein: 1.1, carbs: 2.5, fat: 75.0, fiber: 0 },
  { name: "Aceto di vino", kcal: 5, protein: 0.0, carbs: 0.9, fat: 0.0, fiber: 0 },

  // ---- Dolci, snack, bevande ----
  { name: "Zucchero", kcal: 392, protein: 0.0, carbs: 99.6, fat: 0.0, fiber: 0 },
  { name: "Miele", kcal: 304, protein: 0.4, carbs: 80.3, fat: 0.0, fiber: 0 },
  { name: "Cioccolato fondente", kcal: 570, protein: 7.0, carbs: 46.0, fat: 38.0, fiber: 10.9 },
  { name: "Cioccolato al latte", kcal: 542, protein: 8.0, carbs: 55.0, fat: 32.0, fiber: 2.0 },
  { name: "Marmellata", kcal: 260, protein: 0.5, carbs: 63.0, fat: 0.0, fiber: 1.0 },
  { name: "Gelato, fior di latte", kcal: 190, protein: 4.0, carbs: 24.0, fat: 8.0, fiber: 0 },
  { name: "Patatine fritte, confezionate", kcal: 542, protein: 6.6, carbs: 49.6, fat: 34.6, fiber: 4.4 },
  { name: "Croissant", kcal: 406, protein: 8.0, carbs: 46.0, fat: 21.0, fiber: 2.0 },
  { name: "Pop corn", kcal: 384, protein: 9.0, carbs: 78.0, fat: 4.5, fiber: 15.0 },
  { name: "Vino rosso", kcal: 85, protein: 0.1, carbs: 0.3, fat: 0.0, fiber: 0 },
  { name: "Birra chiara", kcal: 43, protein: 0.5, carbs: 3.5, fat: 0.0, fiber: 0 },
  { name: "Succo d'arancia, fresco", kcal: 42, protein: 0.7, carbs: 9.4, fat: 0.2, fiber: 0.1 },
  { name: "Bevanda tipo cola", kcal: 42, protein: 0.0, carbs: 10.6, fat: 0.0, fiber: 0 },
];

// normalizza le proprietà mancanti a 0 per sicurezza di calcolo
FOOD_DB.forEach(f => { ['protein', 'carbs', 'fat', 'fiber'].forEach(k => { if (f[k] === undefined) f[k] = 0; }); });
