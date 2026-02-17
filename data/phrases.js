// ═══════════════════════════════════════════════
// PHRASES DATA — 52 phrases, 7 categories
// Source: Les Zexos — Relations logiques B1 (Barbara Delvern)
// ═══════════════════════════════════════════════

const PHRASES = [
  // ─── CAUSE (12 phrases) ───
  { id: 1, text: "Elle a annulé son voyage parce que son passeport était expiré.", connector: "parce que", category: "Cause" },
  { id: 2, text: "Puisque tu connais déjà la réponse, inutile de poser la question.", connector: "Puisque", category: "Cause" },
  { id: 3, text: "Comme il pleuvait à verse, les enfants sont restés jouer à l'intérieur.", connector: "Comme", category: "Cause" },
  { id: 4, text: "Le match a été reporté, car le terrain était inondé.", connector: "car", category: "Cause" },
  { id: 5, text: "Étant donné que les prix ont augmenté, nous devons revoir notre budget.", connector: "Étant donné que", category: "Cause" },
  { id: 6, text: "Il a refusé de venir sous prétexte qu'il avait trop de travail.", connector: "sous prétexte qu'", category: "Cause" },
  { id: 7, text: "Vu que le restaurant est complet, nous commanderons des sushis à emporter.", connector: "Vu que", category: "Cause" },
  { id: 8, text: "En raison d'un accident sur l'autoroute, le trafic routier est perturbé.", connector: "En raison d'", category: "Cause" },
  { id: 9, text: "Grâce à l'aide de ses collègues, elle a terminé le projet à temps.", connector: "Grâce à", category: "Cause" },
  { id: 10, text: "Le vol a été retardé à cause du brouillard.", connector: "à cause du", category: "Cause" },
  { id: 11, text: "À force de grimper aux arbres, l'enfant s'est fait mal à l'épaule.", connector: "À force de", category: "Cause" },
  { id: 12, text: "Il a été arrêté pour avoir dépassé la vitesse autorisée.", connector: "pour", category: "Cause" },

  // ─── CONSÉQUENCE (8 phrases) ───
  { id: 13, text: "La route était bloquée par la neige, donc nous avons dû prendre un détour.", connector: "donc", category: "Conséquence" },
  { id: 14, text: "Le budget a été réduit de moitié ; par conséquent, plusieurs projets ont été annulés.", connector: "par conséquent", category: "Conséquence" },
  { id: 15, text: "Elle a révisé chaque soir de sorte qu'elle a obtenu la meilleure note.", connector: "de sorte qu'", category: "Conséquence" },
  { id: 16, text: "Le train a eu deux heures de retard si bien que nous avons manqué notre correspondance.", connector: "si bien que", category: "Conséquence" },
  { id: 17, text: "Mon réveil n'a pas sonné, du coup je suis arrivé en retard au bureau.", connector: "du coup", category: "Conséquence" },
  { id: 18, text: "Cette région manque d'eau potable, c'est pourquoi des puits ont été creusés.", connector: "c'est pourquoi", category: "Conséquence" },
  { id: 19, text: "Il était tellement fatigué qu'il s'est endormi dans le métro.", connector: "tellement", category: "Conséquence" },
  { id: 20, text: "La danseuse s'est entraînée au point de s'évanouir.", connector: "au point de", category: "Conséquence" },

  // ─── BUT (7 phrases) ───
  { id: 21, text: "J'ai parlé lentement pour que tout le monde comprenne les instructions.", connector: "pour que", category: "But" },
  { id: 22, text: "Le professeur a distribué un résumé afin que les élèves révisent plus facilement.", connector: "afin que", category: "But" },
  { id: 23, text: "Elle a caché les bonbons de peur que les enfants ne les mangent avant le dessert.", connector: "de peur que", category: "But" },
  { id: 24, text: "Il a pris des cours du soir afin de perfectionner son anglais.", connector: "afin de", category: "But" },
  { id: 25, text: "Elle économise chaque mois pour s'offrir un voyage au Japon.", connector: "pour", category: "But" },
  { id: 26, text: "L'athlète s'entraîne intensivement en vue de participer aux Jeux olympiques.", connector: "en vue de", category: "But" },
  { id: 27, text: "Il a programmé trois alertes de manière à ne pas oublier son rendez-vous.", connector: "de manière à", category: "But" },

  // ─── OPPOSITION (6 phrases) ───
  { id: 28, text: "Le film a reçu d'excellentes critiques, mais le public ne l'a pas apprécié.", connector: "mais", category: "Opposition" },
  { id: 29, text: "Sophie préfère la campagne alors que son mari rêve de vivre en ville.", connector: "alors que", category: "Opposition" },
  { id: 30, text: "Les enfants jouaient dehors tandis que les parents préparaient le repas.", connector: "tandis que", category: "Opposition" },
  { id: 31, text: "Au lieu de prendre l'avion, ils ont décidé de traverser le Canada en train.", connector: "Au lieu de", category: "Opposition" },
  { id: 32, text: "Contrairement à ses collègues, Marc préfère travailler seul.", connector: "Contrairement à", category: "Opposition" },
  { id: 33, text: "Le prix de l'essence a augmenté ; en revanche, celui du gaz a diminué.", connector: "en revanche", category: "Opposition" },

  // ─── CONCESSION (6 phrases) ───
  { id: 34, text: "Même si le loyer est élevé, cet appartement est idéalement situé.", connector: "Même si", category: "Concession" },
  { id: 35, text: "Il a beaucoup révisé ; pourtant, il n'a pas réussi son examen.", connector: "pourtant", category: "Concession" },
  { id: 36, text: "Bien qu'il fasse très froid, les touristes continuent de visiter le marché de Noël.", connector: "Bien qu'", category: "Concession" },
  { id: 37, text: "J'ai beau chercher mes clés partout, je ne les retrouve pas.", connector: "ai beau", category: "Concession" },
  { id: 38, text: "Malgré la pluie torrentielle, le festival a attiré des milliers de spectateurs.", connector: "Malgré", category: "Concession" },
  { id: 39, text: "Le médecin lui a déconseillé de courir ; cependant, il s'est inscrit au marathon.", connector: "cependant", category: "Concession" },

  // ─── HYPOTHÈSE (6 phrases) ───
  { id: 40, text: "Tu peux emprunter ma voiture à condition que tu la rendes demain matin.", connector: "à condition que", category: "Hypothèse" },
  { id: 41, text: "Nous partirons à huit heures, à moins qu'il n'y ait un changement de programme.", connector: "à moins qu'", category: "Hypothèse" },
  { id: 42, text: "Prends un parapluie au cas où il pleuvrait dans l'après-midi.", connector: "au cas où", category: "Hypothèse" },
  { id: 43, text: "En cas d'incendie, utilisez les escaliers de secours.", connector: "En cas d'", category: "Hypothèse" },
  { id: 44, text: "À supposer que le train soit à l'heure, nous arriverons avant midi.", connector: "À supposer que", category: "Hypothèse" },
  { id: 45, text: "Sans votre aide, nous n'aurions jamais réussi à organiser cet événement.", connector: "Sans", category: "Hypothèse" },

  // ─── TEMPS (7 phrases) ───
  { id: 46, text: "Dès que le soleil se lève, les oiseaux commencent à chanter.", connector: "Dès que", category: "Temps" },
  { id: 47, text: "Pendant que je préparais le dîner, mon fils mettait la table.", connector: "Pendant que", category: "Temps" },
  { id: 48, text: "Nous attendrons ici jusqu'à ce que la pluie s'arrête.", connector: "jusqu'à ce que", category: "Temps" },
  { id: 49, text: "Termine ton rapport avant que le directeur n'arrive au bureau.", connector: "avant que", category: "Temps" },
  { id: 50, text: "Vérifie que toutes les fenêtres sont fermées avant de quitter la maison.", connector: "avant de", category: "Temps" },
  { id: 51, text: "Après avoir visité le musée, nous nous sommes installés à la terrasse d'un café.", connector: "Après avoir", category: "Temps" },
  { id: 52, text: "Lorsque nous sommes arrivés au sommet, la vue était spectaculaire.", connector: "Lorsque", category: "Temps" },

];

const CATEGORIES = ["Cause","Conséquence","But","Opposition","Concession","Hypothèse","Temps"];

const CAT_COLORS = {
  Cause         : { bg: "#FFF3E0", border: "#EF6C00", text: "#E65100" },
  Conséquence   : { bg: "#E8F5E9", border: "#2E7D32", text: "#1B5E20" },
  But           : { bg: "#E3F2FD", border: "#1565C0", text: "#0D47A1" },
  Opposition    : { bg: "#FCE4EC", border: "#C62828", text: "#B71C1C" },
  Concession    : { bg: "#F3E5F5", border: "#7B1FA2", text: "#4A148C" },
  Hypothèse     : { bg: "#FFF8E1", border: "#F9A825", text: "#F57F17" },
  Temps         : { bg: "#E0F7FA", border: "#00838F", text: "#006064" },
};
