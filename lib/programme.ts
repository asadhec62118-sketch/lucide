// Programme de 30 jours, tiré du livre « Comment tu vas arrêter le cannabis ».
// Ce sont des versions courtes, dans la voix de l'auteur : le récit complet
// de chaque jour reste dans le livre.
// Règles éditoriales de l'application : tutoiement, aucun vocabulaire d'échec,
// aucune promesse de résultat médical.

export type Pilier = { numero: number; titre: string; jours: [number, number] };

export const PILIERS: Pilier[] = [
  { numero: 1, titre: "Réflexion et décision", jours: [1, 7] },
  { numero: 2, titre: "Remplir le vide", jours: [8, 14] },
  { numero: 3, titre: "Force mentale et constance", jours: [15, 21] },
  { numero: 4, titre: "Ancrage et sens", jours: [22, 30] },
];

export type JourProgramme = {
  jour: number;
  titre: string;
  /** La pensée du jour. */
  pensee: string;
  /** Ce que l'auteur a vécu, en quelques phrases. */
  recit: string;
  /** Le message au lecteur. */
  message: string;
  /** L'action du jour. */
  action: string;
  /** Pour tenir jusqu'à demain. */
  demain: string;
};

export const NB_JOURS_PROGRAMME = 30;

/**
 * Jours dont la pensée lue par l'auteur est disponible.
 * Pour en ajouter un : déposer le fichier dans public/audio/jour-N.mp3,
 * puis ajouter N à cette liste.
 */
export const AUDIOS_DISPONIBLES: number[] = [];

export const PROGRAMME: JourProgramme[] = [
  {
    jour: 1,
    titre: "La décision",
    pensee:
      "Tout commence par une décision. Pas par une méthode, pas par une astuce, pas par une appli. Une décision claire, prise pour soi, du fond du cœur : « C'est fini. Ma vie doit changer. »",
    recit:
      "Pour moi, ça ne s'est pas fait en un jour. Il y avait cette boule au ventre qui grandissait, le dégoût qui montait. Au début, fumer, c'était bon. Mais au fond, je savais que j'étais enchaîné. Un jour, le ras-le-bol a été total. J'ai fini mon dernier sachet, et le lendemain, je suis allé à la mosquée. Je n'ai jamais retouché au cannabis depuis.",
    message:
      "C'est la réflexion qui rend fort. Si tu te dis « c'est possible », tu commences déjà à te renforcer. Mon grand-père a jeté son paquet par la fenêtre de son camion et n'a plus jamais fumé. Mon père a arrêté du jour au lendemain. Je me suis dit : ce mental coule dans mes veines aussi. Toi aussi, tu as une force quelque part dans ton histoire. Va la chercher.",
    action:
      "Écris une seule phrase, la tienne : « J'arrête le cannabis, et voici pourquoi… » Termine-la avec tes vraies raisons, et garde-la sur toi.",
    demain:
      "Tu n'as pas à réussir les trente jours aujourd'hui. Tu as juste à décider, vraiment, une fois. Tu as fait le plus dur : tu as commencé.",
  },
  {
    jour: 2,
    titre: "Regarder la vérité en face",
    pensee:
      "On déteste rarement le cannabis. Le vrai courage, c'est de regarder en face ce qu'on aime, et de se demander honnêtement : qu'est-ce que ça m'a vraiment coûté ?",
    recit:
      "J'aimais fumer. C'était presque une passion. À vingt ans, je me voyais déjà en vieux Jamaïcain de quatre-vingts ans, tranquille, à fumer ma pipe. Et puis avec l'âge, les déclics sont venus. Un jour, j'ai fait les comptes : du temps, énormément. De l'argent, beaucoup. De l'énergie. Et surtout des occasions. Tout ce temps, j'aurais pu le passer à construire.",
    message:
      "La vraie question, ce n'est pas « est-ce que j'aime ça ». C'est : qu'est-ce que ça m'empêche de devenir ? Qui pourrais-tu devenir demain si tu récupérais ces heures, cet argent, cette énergie ?",
    action:
      "Fais tes comptes, calmement, dans ta tête : le temps, l'argent, l'énergie. Puis demande-toi ce que tu aurais pu en faire. Ce n'est pas un regret, c'est une promesse de ce qui devient possible.",
    demain:
      "Aimer le cannabis et décider d'arrêter, ce n'est pas une contradiction. C'est de la maturité. On peut tourner une belle page sans la déchirer.",
  },
  {
    jour: 3,
    titre: "Couper net",
    pensee:
      "Garder « juste un peu, au cas où », c'est rester un fumeur qui ne fume pas pour l'instant. Couper net, c'est devenir quelqu'un d'autre. Aujourd'hui, on choisit de changer de monde.",
    recit:
      "Dès le lendemain de mon dernier joint, j'ai agi. Je suis allé à la mosquée. J'ai recommencé à passer du temps avec ma mère. Le soir, j'ai évité de retourner voir les potes comme avant : je me suis mis à l'abri. Et j'ai repris le sport sérieusement. L'envie physique était encore là, mais dans ma tête, c'était fini. C'est ça qui fait toute la différence.",
    message:
      "La vie d'un fumeur et celle d'un non-fumeur, ce sont deux mondes. Tant que tu gardes « juste un peu », tu gardes un pied dans l'ancien. Le jour où tu ne gardes plus rien, tu passes de l'autre côté. Et méfie-toi de l'alcool : quand on boit, la garde tombe, et l'envie revient par la petite porte.",
    action:
      "S'il te reste quelque chose, débarrasse-t'en complètement. Puis fais un geste concret de ta nouvelle vie : appelle quelqu'un que tu aimes, sors marcher, reprends une activité que tu aimais.",
    demain:
      "Une fois le premier pas fait, tu n'es plus quelqu'un qui hésite. Tu es quelqu'un qui a décidé. Et ça, personne ne peut te le reprendre.",
  },
  {
    jour: 4,
    titre: "Traverser la tempête du corps",
    pensee:
      "Quand le corps réclame, il ne se bat pas contre toi. Il se bat à tes côtés. C'est ton corps qui se débarrasse de la vie d'avant.",
    recit:
      "Après plus de vingt ans, le corps ne se remet pas en sept jours. Le sommeil a été dur. Je me réveillais la nuit trempé, je gardais des affaires sèches à côté du lit. On rêve aussi qu'on fume, parfois longtemps après. Mais tout n'est pas négatif : j'ai retrouvé un appétit sain, le goût de prendre soin de moi.",
    message:
      "Ce qui m'a fait tenir, c'est mon mental, et le sport. Dans l'effort, le corps libère une énergie qui fait du bien sans détruire. C'est devenu ma nouvelle drogue, la bonne. Oui, ce sera dur, je ne vais pas te mentir. Mais c'est possible, et tout le monde peut le faire.",
    action:
      "Quand le corps réclame aujourd'hui, ne reste pas immobile : bouge. Marche, fais des pompes, va transpirer. Et si la nuit est difficile, rappelle-toi que c'est ton corps qui tourne la page.",
    demain:
      "Le manque n'est pas un mauvais signe : c'est le signe que tu es en train de réussir. Tiens bon encore une nuit. Chaque jour passé, c'est du terrain repris sur l'ancienne vie.",
  },
  {
    jour: 5,
    titre: "Le vide n'est pas un ennemi",
    pensee:
      "Le vide n'est pas un trou. C'est une place qui se libère. Une place pour le plaisir, pour les tiens, pour celui ou celle que tu vas devenir.",
    recit:
      "La première bataille, c'est tout ce temps qui devient libre d'un coup. J'ai compris qu'il fallait que je bouge. Alors je l'ai rempli de vrai plaisir : un film le soir avec ma mère, un bon jus, la lecture avant de dormir, le sport dans la journée. Ne jamais rester sans rien faire, et prendre du plaisir dans ce que je faisais.",
    message:
      "Certains autour de toi vont se poser des questions, il faut s'y attendre. Mais le regard le plus important, c'est le tien. Une fierté va arriver et s'installer en toi. Sers-t'en. Oui, c'est facile de retomber dedans. Mais si tout était facile, ce ne serait plus intéressant. Tu es un gagnant : crée-toi tes propres armes.",
    action:
      "Offre-toi aujourd'hui un vrai plaisir par les sens : un bon repas, une boisson que tu aimes, un film avec quelqu'un que tu aimes, un livre ce soir. Et bouge dans la journée.",
    demain:
      "Ce vide que tu redoutais, tu commences déjà à le remplir. Et la fierté qui monte en toi est réelle. Elle ne fera que grandir.",
  },
  {
    jour: 6,
    titre: "Un écart n'efface pas le chemin",
    pensee:
      "Ce qui fait reculer, ce n'est pas un écart. C'est de se dire « c'est foutu » et de tout lâcher. On peut se relever. Et le mieux, c'est de comprendre ce qui se passe, pour ne pas en arriver là.",
    recit:
      "Pour moi, c'était ma première et ma seule tentative, parce que je ne voulais pas essayer d'arrêter : je voulais arrêter. Mais au début, j'ai joué avec le feu : je voyais encore mes potes, je sentais l'odeur, je voyais les joints tourner. Et les nuits dures, une voix me disait « juste un joint, et le corps serait content ». C'est un mensonge : le corps ne réclame pas, il est en train de changer.",
    message:
      "Si tu as craqué, ce n'est pas grave. Le vrai piège, c'est de tout effacer et de repartir de plus belle dans l'ancienne vie. Ton arme, c'est la réflexion : remets tout de suite tes idées au clair. Moi, je ne voulais pas un jour avoir à dire « si j'avais su ». Et souviens-toi : comme au sport, c'est en te mettant dans le dur que tu construis ta fierté.",
    action:
      "Si tu as craqué, ne perds pas une heure à te détester : reprends tout de suite. Et dans tous les cas, réfléchis honnêtement à où te mène l'ancienne vie. Pas pour te faire peur, pour choisir en connaissance de cause.",
    demain:
      "Ce qui compte, c'est ce que tu fais juste après. Tu peux te relever immédiatement, plus lucide qu'avant. Demain, on fait le bilan de ta première semaine.",
  },
  {
    jour: 7,
    titre: "Une première peau qui tombe",
    pensee:
      "Sept jours, ce n'est pas la fin du chemin. C'est le premier vrai pas d'un long voyage que tu as choisi. Regarde honnêtement la personne que tu es en train de devenir.",
    recit:
      "Au bout d'une semaine, j'ai ressenti un petit sentiment de satisfaction. Mais je savais que sept jours, c'était un grain de sable. Avant, j'avais déjà tenu un mois pour un test d'urine, et ça avait été terriblement dur, parce que ce n'était pas mon but, c'était une contrainte. Cette fois, j'étais un autre homme. Ce n'est pas la volonté du corps qui compte, c'est celle de la personne que tu décides de devenir.",
    message:
      "Comme le serpent qui change de peau, tu es en train de tout changer : ton état d'esprit, ta façon de vivre, ton quotidien. Oui, ça va être long. C'est comme un marathon : personne ne court quarante-deux kilomètres le lendemain de son inscription. Toi, tu es en train de t'entraîner.",
    action:
      "Prends un moment de calme, seul. Repasse ta semaine dans ta tête : ce que tu as traversé, ce qui a déjà changé. Puis regarde devant toi la personne que tu veux devenir, et ancre cette image.",
    demain:
      "Tu as tenu une semaine entière, la plus dure. Sois-en fier, sans t'endormir dessus. Demain, on ne se contente plus de résister : on bâtit ta nouvelle vie.",
  },
  {
    jour: 8,
    titre: "Le sport, ta nouvelle drogue saine",
    pensee:
      "Ton corps réclamait quelque chose qui le détruisait. Le sport lui offre quelque chose qui le construit. Une énergie naturelle, saine et gratuite. Aujourd'hui, on va la chercher.",
    recit:
      "Je fais du sport depuis l'âge de cinq ans. En arrêtant, je m'y suis remis sérieusement : la course, les pompes, les tractions, le foot pour le plaisir, puis le Kung-Fu et le MMA. C'est dans l'effort intense que j'ai trouvé mon shoot, mais un shoot sain, qui me construisait au lieu de me détruire.",
    message:
      "« Trop fatigué, trop vieux, pas sportif » : ce sont des excuses. Il existe un sport et un niveau pour chacun. Le secret, c'est le palier. Si tu ne peux faire que deux pompes, fais cinq séries de deux. Si tu ne peux pas courir, marche. Chaque effort est une partie gagnée. C'est la même mentalité que pour arrêter : une mentalité de gagnant.",
    action:
      "Bouge aujourd'hui, à ton niveau, sans excuse. Trouve ton palier de départ et fais-le. Puis choisis une activité que tu pourras répéter cette semaine.",
    demain:
      "Chaque goutte de sueur remplace un joint que tu n'as pas fumé. Ton corps redécouvre qu'il peut se sentir bien autrement.",
  },
  {
    jour: 9,
    titre: "Se rapprocher de ceux qui t'aiment",
    pensee:
      "On ne se reconstruit pas seul. Le sport remplit le vide par l'effort. Les tiens le remplissent par l'amour.",
    recit:
      "Passer du temps avec ma mère a été un des piliers de mon changement. Un lien pur, naturel, sain. On discutait, on se promenait, on regardait un film, on mangeait ensemble. Les choses simples de la vie. Si je devais nommer mes trois grands piliers : ma foi, le sport, et ma mère.",
    message:
      "Le but n'est pas de dire à tes amis « vous n'êtes plus mes amis ». Le but, c'est d'être malin. Quand il fait 45 degrés, on se met à l'ombre ; on va au soleil le matin, quand c'est agréable. Si tu voyais tes amis le soir pour fumer, vois-les plutôt en journée : un café, une balade. Et profite-en pour retrouver des proches que tu n'as pas vus depuis longtemps.",
    action:
      "Tends la main aujourd'hui à quelqu'un qui t'aime : appelle-le, ou passe du temps avec lui. Fais quelque chose de simple ensemble. Et si tu vois un ami fumeur, propose un moment en journée.",
    demain:
      "Tu n'es pas seul, même si l'ancienne vie te le fait croire. Il y a des gens qui t'aiment et qui n'attendent qu'un signe de toi.",
  },
  {
    jour: 10,
    titre: "Construire tes nouveaux rituels",
    pensee:
      "Fumer, ce n'était pas qu'une substance. C'était des rituels, des moments presque sacrés. Aujourd'hui, on ne laisse pas de trou : on remplace chaque moment par un autre vrai plaisir.",
    recit:
      "Mes rituels, c'était surtout le soir. Le joint très attendu, la guitare, et mon rapport aux étoiles : je contemplais le ciel, je réfléchissais. Ce moment de contemplation, je l'ai gardé, parce qu'il n'avait pas besoin du joint pour exister. Le reste, je l'ai remplacé par le sport, mes proches, la lecture, des reportages passionnants.",
    message:
      "Je n'ai pas remplacé un plaisir par une corvée. J'ai remplacé un mauvais plaisir par un vrai plaisir, quelque chose qui me nourrit. Prends chacun de tes anciens moments de joint, un par un, et donne-lui un nouveau rituel. Quand ton temps est plein de bonnes choses, l'ancien réflexe n'a plus de place où revenir.",
    action:
      "Repère tes deux ou trois anciens moments de joint dans la journée. Pour chacun, choisis dès maintenant par quel nouveau plaisir tu le remplaces, et applique-le aujourd'hui pour au moins un.",
    demain:
      "Une journée sans trous, c'est une journée sans porte d'entrée pour l'ancienne habitude. Tu ne résistes plus : tu remplaces. Demain, on s'attaque aux soirées et aux week-ends.",
  },
  {
    jour: 11,
    titre: "Le piège du vendredi soir",
    pensee:
      "Le vendredi soir, quand tout est calme et qu'une voix te dit « allez, c'est le week-end ». Le week-end n'est pas un problème à part : c'est le même principe, appliqué à un moment plus libre.",
    recit:
      "Avant d'arrêter le cannabis, j'avais d'abord arrêté l'alcool, l'année d'avant. Pour moi, boire donnait envie de fumer : l'alcool baisse la garde. Et j'ai compris que la vie d'avant, la fête jusqu'à six heures du matin, ne correspondait plus à ma vie maintenant. Une nouvelle vie, qui pense à ma santé.",
    message:
      "Ce moment « exceptionnel » où tu consommais plus, remplis-le par quelque chose d'exceptionnel mais de sain : une grande balade, une sortie, un événement que tu attends avec impatience. L'argent que tu mettais dans le cannabis peut servir à ça, et ça te coûtera toujours moins cher qu'avant.",
    action:
      "Prévois dès maintenant une chose exceptionnelle et saine pour ton prochain week-end. Le piège n'existe que si tu arrives dedans les mains vides.",
    demain:
      "Transforme ton moment le plus risqué en ton moment préféré de la semaine. Demain, on parle de ton environnement.",
  },
  {
    jour: 12,
    titre: "Nettoyer ton environnement",
    pensee:
      "Ton environnement est souvent plus fort que ta volonté. Aujourd'hui, on ne compte plus seulement sur la volonté : on nettoie le terrain.",
    recit:
      "Il y avait des lieux et des moments propices : le soir entre potes, ou seul dans mon garage avec ma guitare. Et il n'y avait pas que les gens : des objets, des musiques me ramenaient directement au joint. Ce sont des déclencheurs invisibles. Alors j'ai changé mon cadre : le cinéma, un verre sans alcool, une balade, des endroits où fumer n'est même pas possible.",
    message:
      "S'il y a une personne dont tu sais qu'elle va te dire « allez, prends le joint », même un très bon ami, ne va pas la voir pendant cette période. Ce n'est pas de la trahison, c'est de la protection. Il n'y a aucune honte à protéger sa vie et sa santé.",
    action:
      "Fais le tour de ton environnement : les objets, les lieux, les musiques, les personnes liés au joint. Mets à distance ce que tu peux, sans culpabiliser.",
    demain:
      "Quand ton environnement travaille pour toi, tu n'as plus à lutter à chaque instant. C'est de l'intelligence, pas de la faiblesse.",
  },
  {
    jour: 13,
    titre: "La fierté, ton carburant",
    pensee:
      "Chaque jour sans cannabis est une victoire. Cette fierté qui grandit en toi n'est pas de la vanité. C'est du carburant. Et une voiture sans carburant n'avance pas.",
    recit:
      "Après quelques semaines, il y avait encore des nuits difficiles. Mais les premiers vrais résultats arrivaient : le sport donnait des résultats, l'esprit devenait plus clair, je me sentais plus libre. Et un jour, on se regarde et on se dit « wow, tout ça, c'est déjà moi ». Dix ans après, je me dis encore : bravo.",
    message:
      "Tu ne te prives pas : tu deviens une exception. Ceux qui ne consomment rien du tout, ni alcool, ni tabac, ni cannabis, sont une minorité. Tu es en train de rejoindre le petit cercle de ceux qui ont repris le contrôle de leur corps et de leur vie. Ce n'est pas une perte, c'est un privilège rare.",
    action:
      "Nomme dans ta tête au moins une chose dont tu es fier aujourd'hui : un résultat, un esprit plus clair, un jour de plus, ou simplement d'avoir tenu. Ressens-la pleinement.",
    demain:
      "Tu n'es plus la même personne qu'il y a deux semaines. Cette fierté t'appartient, et personne ne peut te la prendre.",
  },
  {
    jour: 14,
    titre: "La moitié du chemin",
    pensee:
      "Quatorze jours, c'est beaucoup, et c'est peu. La maison est à moitié montée, mais on ne peut pas encore vivre dedans. C'est quand tout va mieux qu'il faut rester le plus vigilant.",
    recit:
      "À un moment, j'ai senti que ma vie ne tournait plus autour du cannabis. Elle tournait autour d'autre chose : le sport, ma mère, la lecture, et surtout ma foi. Le centre de gravité de ma vie avait changé. Et j'ai compris que beaucoup de gens qui ont l'air très forts fument et n'arrêtent pas. « J'arrête quand je veux » ? Toi, tu le fais pour de vrai. Ça, c'est la vraie force.",
    message:
      "Dans les jours qui viennent, parce que tu vas mieux, une petite voix va te souffler : « tu vois, tu peux recommencer, juste une fois ». C'est le grand piège de la troisième semaine. Reconnais-la, et ne l'écoute pas. Ton pouvoir augmente chaque jour.",
    action:
      "Fais ton bilan de mi-parcours : tout ce qui a changé en deux semaines, et le chemin qui reste. Décide dès maintenant que quand la petite voix viendra, tu la reconnaîtras.",
    demain:
      "Tu as bâti les fondations et déjà les murs. Ne t'arrête pas si près du but. Demain, on entre dans la bataille du mental.",
  },
  {
    jour: 15,
    titre: "Tu n'arrêtes pas, tu changes de vie",
    pensee:
      "Celui qui arrête pour un mois cherche à tenir. Celui qui change de vie n'a plus à tenir : il est devenu quelqu'un d'autre.",
    recit:
      "Avant, il m'était déjà arrivé d'arrêter, pour passer un test d'urine. Dès le test passé, je reprenais de plus belle. Ça, ce n'est pas arrêter, c'est mettre en pause. Cette fois, c'était différent : je n'arrêtais pas de fumer, je changeais de vie. Et ma foi m'a énormément aidé à changer ma mentalité, ma confiance, ma sérénité.",
    message:
      "On n'arrête pas le cannabis pour arrêter le cannabis. On arrête pour changer de vie. Comme quelqu'un qui transforme son corps, ton mental va se bâtir, gagner en sérénité et en solidité. Quand la pensée « un seul ne changera rien » arrive, elle appartient à l'ancienne personne. Toi, tu n'es plus celle-là.",
    action:
      "Pose-toi cette question calmement : est-ce que j'arrête pour un temps, ou est-ce que je change de vie ? Ancre la réponse en toi.",
    demain:
      "Tu n'es pas quelqu'un qui se retient. Tu es quelqu'un de nouveau qui se construit. Demain : que faire dans la minute où l'envie devient forte.",
  },
  {
    jour: 16,
    titre: "L'envie qui passe",
    pensee:
      "L'envie n'est qu'une pensée qui passe devant toi. Regarde-la, mais ne t'assois pas dessus. Continue ton chemin.",
    recit:
      "L'envie peut revenir. À moi, c'est encore arrivé dix ans après. Ce n'est pas grave, c'est humain. Imagine : tu vas tondre ta pelouse, et tu passes devant ton canapé. « Je me mettrais bien là. » Soit tu t'assois, et la pelouse n'est pas tondue. Soit tu continues vers ta tondeuse, et une fois lancé, tu as oublié le canapé.",
    message:
      "L'envie de fumer, c'est exactement ce canapé. Quand elle arrive, ne reste pas sans rien faire : passe vite à autre chose. Une tâche, du sport, un appel à un proche. Et une fois la chose faite, tu es content : non seulement tu n'as pas fumé, mais tu as accompli quelque chose.",
    action:
      "Prépare une petite liste de choses à lancer dès qu'une envie arrive : une activité physique, une tâche concrète, un proche à appeler. Le jour où la vague monte, tu ne réfléchis pas : tu y vas.",
    demain:
      "Chaque envie traversée te rend plus fort. Demain, on parle des jours où l'on n'a plus de force.",
  },
  {
    jour: 17,
    titre: "Les jours sans force",
    pensee:
      "Le jour difficile n'est pas un accident. Il était prévu. Une minute passée à tenir, c'est déjà une minute de chemin parcouru.",
    recit:
      "Il y a eu des journées plus compliquées que les autres. Deux choses m'ont aidé : la foi, et la réflexion. Je me rappelais pourquoi je faisais tout ça : parce que je ne me sentais pas bien, parce que ça posait problème dans ma vie. Et je savais que ces moments arriveraient. Ils ne m'ont pas cassé, parce que je les attendais.",
    message:
      "Quelqu'un qui construit une maison sait qu'il y aura des intempéries, du matériel en retard, une semaine de plus. Personne n'abandonne sa maison pour ça. Ton jour sans force, c'est ton intempérie : le chantier avance plus lentement, c'est tout. Rien que tenir, c'est déjà gagner.",
    action:
      "Si aujourd'hui est un jour à plat, ne cherche pas à être performant. Reviens à ton « pourquoi » du premier jour, et fais une seule petite chose positive. Ça suffit.",
    demain:
      "Demain, on parle du regard des autres, et de la façon de rester solide face à eux.",
  },
  {
    jour: 18,
    titre: "Le regard des autres",
    pensee:
      "Tu crains le jugement des autres ? La plupart du temps, ce que tu prends pour du jugement, c'est de l'admiration silencieuse.",
    recit:
      "Pour le cannabis, personne ne s'est moqué de moi, personne ne m'a rejeté. Au contraire, j'avais l'impression que certains étaient admiratifs. Ils voyaient que j'avais décidé, que je tenais, et que je ne me la racontais pas. Je ressentais du respect.",
    message:
      "Très souvent, ce que tu redoutes n'arrive pas. Beaucoup t'admirent sans le dire, parce qu'eux-mêmes n'osent pas encore. Et si quelqu'un se moque, ris-en : derrière la moquerie, il y a souvent de la jalousie. En restant solide, tu deviens peut-être, sans le vouloir, un déclic pour quelqu'un d'autre.",
    action:
      "Assume aujourd'hui ce que tu fais, avec fierté. Si quelqu'un te questionne ou se moque, ne te justifie pas : souris. Ton changement t'appartient.",
    demain:
      "Demain, on parle de la patience, et de pourquoi le temps long est une bonne nouvelle.",
  },
  {
    jour: 19,
    titre: "La liberté qui grandit",
    pensee:
      "Tu ne deviens pas libre en un jour. Tu deviens libre chaque jour, un peu plus. Et ça ne s'arrête jamais.",
    recit:
      "On me demande à quel moment je me suis senti vraiment libre. Il n'y a pas eu de moment précis. Tous les jours, je sens ma liberté grandir. Et dix ans après, je la sens encore grandir. C'est comme l'appétit : ça évolue avec le temps.",
    message:
      "Les choses importantes ne se font jamais en un jour. Apprendre une langue prend une vie. J'ai lu un jour qu'un grand champion du monde de combat disait n'avoir atteint le sommet de son art que presque dix ans après son titre. Ta liberté, c'est pareil. Ce n'est pas un plaisir d'un mois : c'est un plaisir qui grandit toute ta vie.",
    action:
      "Arrête de te demander « quand est-ce que ce sera fini ? ». Imagine plutôt où tu seras dans un an, dans cinq ans, dans dix ans. Cette liberté-là t'attend.",
    demain:
      "Demain, on regarde la force qui s'est installée en toi, et comment t'appuyer dessus.",
  },
  {
    jour: 20,
    titre: "La force, marche après marche",
    pensee:
      "Ta force n'est pas apparue d'un coup. Elle se construit depuis le premier jour, une marche après l'autre. Et elle continuera toute ta vie.",
    recit:
      "Mon mental a commencé à changer bien avant d'arrêter. La première marche, c'est la réflexion. La deuxième, c'est de se dire « j'arrête ». Et ensuite, chaque épreuve renforce. Chaque minute passée à résister à une envie, c'est une minute où le mental devient plus fort.",
    message:
      "Si tu sens que tu es plus solide, c'est vrai. Cette force ne se voit pas dans un miroir, elle se ressent. Valorise-toi pour ce que tu réalises. Mais reconnaître ta force, ce n'est pas baisser la garde. La force et la vigilance vont ensemble.",
    action:
      "Rappelle-toi qui tu étais au Jour 1, et ressens qui tu es aujourd'hui. Sois-en fier, puis remets-toi en route, calmement.",
    demain:
      "Demain, c'est le bilan de trois semaines, et l'entrée dans la dernière ligne droite.",
  },
  {
    jour: 21,
    titre: "Le début d'une nouvelle vie",
    pensee:
      "Tu viens de passer trois semaines. Le plus dur est derrière toi. Et ce n'est pas une fin : c'est le début de ta nouvelle vie.",
    recit:
      "S'il faut désigner le plus grand changement au bout de 21 jours, c'est la routine. Ce qui nourrit une dépendance, c'est une routine. En 21 jours, tu as cassé la tienne et tu en as construit une nouvelle. C'est énorme. Et parfois, on respire et on se dit : « tiens, il y a un petit changement ». C'est déjà loin d'être rien.",
    message:
      "On ne devrait même pas appeler ça un programme pour arrêter de fumer. On devrait l'appeler par son vrai nom : une nouvelle vie. Elle se travaille tous les jours, comme quelqu'un qui veut rester en forme. Entre dans la dernière semaine comme quelqu'un qui pose les fondations de toute une vie.",
    action:
      "Célèbre. Mesure le chemin depuis le Jour 1. Puis change une phrase dans ta tête : « je ne suis pas en train d'arrêter de fumer, je suis en train de construire ma nouvelle vie ».",
    demain:
      "Demain, on parle de quelque chose de plus grand que toi : ce qui donne une raison profonde de rester libre.",
  },
  {
    jour: 22,
    titre: "Quelque chose de plus grand que toi",
    pensee:
      "La volonté seule s'épuise. Mais quand tu t'appuies sur quelque chose de plus grand que toi, ta force ne s'épuise jamais.",
    recit:
      "Ma volonté s'est bâtie jour après jour, et pour ma part, grâce à Dieu. Je me suis converti à l'islam pendant cette période. Mais pas à l'aveugle : j'ai relu l'Ancien Testament, les Évangiles, le Coran. J'avais besoin de comprendre par moi-même. Cette quête personnelle a fait partie de ma force.",
    message:
      "Si tu es croyant, appuie-toi sur ta foi, et cherche par toi-même. Si tu ne l'es pas, tu es totalement libre, je ne t'impose rien. Mais il y a toujours quelque chose de plus grand que toi : ta famille, ou le fait d'aider les autres. Trouve ta raison. C'est elle qui te fera tenir, pas 30 jours, mais toute une vie.",
    action:
      "Demande-toi sincèrement : quelle est ma chose plus grande que moi ? Nomme-la, et fais un premier geste dans ce sens aujourd'hui : un moment de recueillement, un appel à un proche, un coup de main à quelqu'un.",
    demain:
      "Demain, on parle de ta nouvelle identité : ne plus te voir comme « un fumeur qui a arrêté ».",
  },
  {
    jour: 23,
    titre: "Ta nouvelle vie s'appuie sur l'ancienne",
    pensee:
      "Tu n'as pas à renier ton passé. C'est en ayant traversé ton ancienne vie que tu as gagné le droit à la nouvelle.",
    recit:
      "On voudrait parfois nous faire croire qu'il faut tout effacer, avoir honte. Moi, je ne vois pas les choses comme ça. C'est le courage d'avoir quitté mon ancienne vie qui m'a donné la possibilité d'en construire une nouvelle. Ça fait partie de mon histoire, de mon chemin, de ma force.",
    message:
      "Le vrai changement, c'est d'avoir fait un choix. Cigarette, alcool, cannabis : au fond, c'est le même combat. Et la vie elle-même est une lutte pour vivre sainement. Ta lutte n'est pas une honte. Vois-toi comme quelqu'un qui a traversé une ancienne vie, et qui construit, sur ce socle, une vie plus saine et plus sereine.",
    action:
      "Regarde ton ancienne vie sans honte. Puis demande-toi : qu'est-ce que je veux construire maintenant ? Tu n'es pas quelqu'un qui répare une erreur, tu es quelqu'un qui bâtit.",
    demain:
      "Demain, on regarde tout ce que la liberté t'a déjà rendu.",
  },
  {
    jour: 24,
    titre: "La gratitude",
    pensee:
      "Au Jour 2, tu as mesuré ce que le cannabis t'avait pris. Aujourd'hui, mesure tout ce que la liberté t'a rendu.",
    recit:
      "Le temps : chercher, rouler, fumer, et tout ce que je ne pouvais plus faire après avec les yeux rouges. L'argent : mon compte en banque me remercie tous les jours. La santé : au bout d'un an, j'ai eu l'impression de retrouver une jeunesse. La clarté d'esprit. La sérénité : plus de peur d'un contrôle, plus de gêne devant ma famille. Et par-dessus tout, la fierté.",
    message:
      "Quand tu te focalises seulement sur l'effort, tu souffres. Quand tu regardes ce que tu as regagné, tout change. Pour rien au monde je ne voudrais revenir en arrière. Le manque te tire vers l'arrière ; la gratitude t'ancre dans l'avant.",
    action:
      "Fais la liste, dans ta tête, de tout ce que tu as déjà regagné, même les petites choses : du temps le soir, de l'argent, une tête plus claire, la fierté de tenir. Ressens la gratitude pour chacune.",
    demain:
      "Plus tu avances, plus cette liste s'allonge. Demain, on se prépare aux épreuves à venir.",
  },
  {
    jour: 25,
    titre: "Se préparer à l'avenir",
    pensee:
      "Un écart n'effacera jamais tout ton chemin. Mais ne te donne jamais l'écart comme excuse à l'avance.",
    recit:
      "Je ne me suis jamais vraiment posé la question, parce que j'étais prêt, comme un sportif avant un combat. Des épreuves, il y en a eu : le stress, la tristesse, des amis qui fumaient encore. Ce qui m'a protégé, surtout, c'est ma foi, et le mental. Encore aujourd'hui, il m'arrive de rêver que je fume. Au réveil, je suis toujours libre.",
    message:
      "Garde toujours en tête pourquoi tu as arrêté. Si un jour tu craques une fois, rien n'est perdu : tes jours propres sont plus forts que ce moment, et tu ne repars pas de zéro. Mais ne pense pas à la faiblesse à l'avance. Tu veux arrêter, point. Bats-toi, et tu ne perdras pas.",
    action:
      "Imagine une épreuve future : une fête où l'on fume, un coup dur, un stress. Décide dès maintenant comment tu réagiras, et sur quoi tu t'appuieras. Tu ne prépares pas une faiblesse : tu prépares ta victoire.",
    demain:
      "Demain, on parle de la transmission : comment ta liberté peut aider quelqu'un d'autre.",
  },
  {
    jour: 26,
    titre: "La transmission",
    pensee:
      "Le bonheur qu'on donne revient toujours. Aider quelqu'un à se relever, c'est ancrer un peu plus sa propre liberté.",
    recit:
      "Est-ce que mon parcours a inspiré des gens ? Je ne sais pas. Mais on peut être un exemple sans le savoir. Et aider les autres m'a renforcé : un coup de main, du temps pour une association, aller vers ceux qui en ont besoin. Donner du bonheur, c'est en recevoir. Et c'est du temps en moins à tourner en rond.",
    message:
      "La vraie transmission est discrète. Pas de leçon, pas de morale. Si un jour tu croises quelqu'un de perdu sur ce sujet, dis-lui simplement : « moi aussi, je sais ce que tu ressens ». Cette phrase vaut tous les sermons du monde.",
    action:
      "Pense à une manière simple d'aider quelqu'un cette semaine : un proche, une personne dans le besoin, une association près de chez toi. L'important, c'est de donner un peu de ton temps.",
    demain:
      "Demain, on donne un cap à ta liberté : ta vision d'avenir.",
  },
  {
    jour: 27,
    titre: "Ta vision d'avenir",
    pensee:
      "La liberté sans direction s'essouffle. Demande-toi non pas combien de temps il te reste, mais dans quel état tu veux avancer.",
    recit:
      "Quand j'ai arrêté, je n'avais pas de grand plan. J'avais une envie simple et forte : sortir de ça. Mais je savais que ça allait m'ouvrir des portes : des projets de vie, des projets professionnels, une vie sportive plus saine. Aujourd'hui, être libre depuis dix ans me rend meilleur chaque jour.",
    message:
      "Être dépendant, c'est traîner un boulet, tous les jours. Il te ralentit, quel que soit ton projet. Arrêter, c'est enlever ce boulet. Et pose-toi la vraie question : comment veux-tu avancer dans la vie ? Avec des regrets et du temps perdu, ou serein, libre, l'esprit clair ?",
    action:
      "Projette-toi : la personne que tu veux être dans un an, dans cinq ans, dans dix ans, libre et fière d'elle. Laisse cette image devenir ton cap.",
    demain:
      "Demain, on ancre tes nouvelles habitudes pour qu'elles deviennent une seconde nature.",
  },
  {
    jour: 28,
    titre: "Remplacer pour acquérir",
    pensee:
      "Une habitude tient quand elle t'apporte une richesse. Ne remplace pas le cannabis par du vide occupé : remplace-le par ce qui te fait grandir.",
    recit:
      "Chez moi, l'ancrage a été rapide : il ne fallait pas se poser 30 000 questions, mais agir. L'étude de l'islam, du temps avec ma mère, le sport, et des soirées différentes : moi le couche-tard, je me couchais vers 21h30 et je lisais. Toutes ces choses étaient exceptionnelles pour moi. J'avais l'impression que le soleil brillait tous les jours.",
    message:
      "Le tout, ce n'est pas de remplacer pour remplacer. C'est de remplacer pour acquérir : apprendre, se former, se faire du bien en profondeur. Choisis des activités qui ont vraiment de la valeur à tes yeux. C'est parce qu'elles t'enrichissent qu'elles vont s'ancrer toutes seules.",
    action:
      "Regarde tes nouvelles habitudes : est-ce qu'elles t'apportent une vraie richesse, ou est-ce qu'elles remplissent juste le temps ? Choisis-en une à ancrer pour de bon.",
    demain:
      "Demain, le grand bilan : d'où tu es parti, et qui tu es devenu.",
  },
  {
    jour: 29,
    titre: "Le grand bilan",
    pensee:
      "Regarde d'où tu es parti. On t'a retiré des chaînes, et on t'a rendu ta vie. C'est presque une résurrection.",
    recit:
      "Entre l'homme qui fumait et celui que je suis devenu, la différence est immense. Une vie ne devrait pas être enchaînée à une dépendance : une vie, c'est de la découverte. Il y a des gens que je vois moins aujourd'hui, et je le vis sans amertume : parfois, ce qui nous liait, c'était seulement le cannabis.",
    message:
      "Si tu es là, sans avoir compensé par l'alcool ou la cigarette, sois profondément fier de toi. Devant toi, ce n'est plus un sentier escarpé : c'est une route droite. Rien n'est terminé, mais ce ne sera plus un combat de tous les instants. La pensée reviendra parfois, mais elle n'aura plus de pouvoir.",
    action:
      "Refais le voyage dans ta tête, du Jour 1 à aujourd'hui : la décision, le corps, le vide rempli, le mental, le sens. Mesure la distance. Et laisse monter la fierté.",
    demain:
      "Demain, le dernier jour. Ce ne sera pas une fin, mais un commencement.",
  },
  {
    jour: 30,
    titre: "Le début de ta nouvelle vie",
    pensee:
      "Tu n'as pas fini quelque chose. Tu commences quelque chose. Ta nouvelle vie démarre aujourd'hui.",
    recit:
      "Félicitations pour ces trente jours de lutte, de réflexion, d'effort, et de joie aussi. Moi, je continue depuis dix ans, et je continuerai toute ma vie. Mais ce n'est pas un problème : l'envie du premier jour n'est pas celle du trois-millième jour. Avec le temps, tout s'allège.",
    message:
      "Dans cette continuité, tu te bonifies. Tu deviens meilleur. Ton compte en banque, ton humeur, ta façon de voir les choses : tout s'améliore. Il y aura des hauts et des bas, comme dans la vie, mais garde toujours espoir. Ton mental est ton allié. Tu l'as construit marche après marche. Il ne te quittera plus.",
    action:
      "Prends une grande respiration, celle d'une personne libre. Et fais ton premier pas dans ta nouvelle vie, avec la certitude que le meilleur est devant toi.",
    demain:
      "Ta nouvelle vie commence maintenant. Va la vivre. Bravo, tu es libre.",
  },
];

/** Pilier auquel appartient un jour du programme. */
export function pilierDuJour(jour: number): Pilier {
  return PILIERS.find((p) => jour >= p.jours[0] && jour <= p.jours[1]) ?? PILIERS[0];
}

// --------------------------------------------------------------------------
// Après le programme : un rendez-vous par semaine pendant les mois 2 et 3.
// Brouillon composé à partir des idées et souvenirs du livre, à faire valider
// par l'auteur.
// --------------------------------------------------------------------------

export type RendezVous = {
  numero: number;
  /** Nombre de jours écoulés depuis le départ à partir duquel il s'ouvre. */
  jour: number;
  titre: string;
  pensee: string;
  message: string;
  action: string;
};

export const RENDEZ_VOUS: RendezVous[] = [
  {
    numero: 1,
    jour: 30,
    titre: "Rester vigilant quand tout va bien",
    pensee:
      "La force et la vigilance vont ensemble. Tu es plus solide qu'au premier jour : sers-t'en pour continuer, pas pour t'arrêter.",
    message:
      "Le programme est fini, ta nouvelle vie, elle, continue. C'est justement quand tout va mieux que la petite voix revient : « tu vois, tu maîtrises, une fois ne changera rien ». Tu la connais maintenant. Elle appartient à l'ancienne personne. Toi, tu n'es plus celle-là.",
    action:
      "Relis ta phrase de décision du Jour 1. Est-ce qu'elle est toujours vraie ? Si tu veux, complète-la avec ce que tu sais aujourd'hui.",
  },
  {
    numero: 2,
    jour: 37,
    titre: "Les pensées qui reviennent",
    pensee: "La pensée peut passer. Ce qui compte, c'est qu'elle n'a plus de pouvoir sur toi.",
    message:
      "Dix ans après, il m'arrive encore de rêver que je fume. Au réveil, je suis toujours libre. Une envie, une image, un rêve : ce ne sont pas des signes que tu recules. Ce sont des traces de l'ancienne vie. Tu les regardes passer, comme le canapé devant lequel tu ne t'assois plus.",
    action:
      "La prochaine fois qu'une pensée revient, nomme-la dans ta tête : « tiens, une trace de l'ancienne vie ». Puis va vers ta tondeuse.",
  },
  {
    numero: 3,
    jour: 44,
    titre: "Ton nouveau quotidien",
    pensee: "Remplacer pour acquérir, pas juste pour remplir. Une habitude tient quand elle t'apporte une richesse.",
    message:
      "Regarde ton quotidien d'aujourd'hui et celui d'il y a deux mois. Le sport, les tiens, la lecture, ta foi peut-être : qu'est-ce qui a pris la place ? Ce qui t'enrichit vraiment restera. Ce qui ne fait que boucher un trou, il est temps de le remplacer par mieux.",
    action:
      "Choisis une nouvelle chose à apprendre ou à pratiquer ce mois-ci. Quelque chose qui te grandit, que tu attends avec plaisir.",
  },
  {
    numero: 4,
    jour: 51,
    titre: "Les épreuves de la vie",
    pensee: "La vie t'apportera des épreuves. Tu ne prépares pas une faiblesse : tu prépares ta victoire.",
    message:
      "Un stress au travail, une tristesse, une fête où l'on fume : ces moments viendront. Les vivre ne veut pas dire que tu recules : c'est la vie. Ce qui fait la différence, c'est d'y arriver préparé : savoir à quoi tu penseras, sur qui ou sur quoi tu t'appuieras.",
    action:
      "Pense à la prochaine épreuve qui pourrait arriver ce mois-ci. Écris dans ta tête ton plan : ce que tu feras, qui tu appelleras, quelle activité tu lanceras.",
  },
  {
    numero: 5,
    jour: 58,
    titre: "L'alcool, toujours",
    pensee: "L'alcool n'attaque pas ta volonté de face. Il la contourne en endormant ta vigilance.",
    message:
      "Moi, j'avais arrêté l'alcool un an avant le cannabis, et je suis convaincu que ça m'a énormément aidé. Deux mois après, c'est souvent le moment où l'on se relâche, où l'on se dit qu'un verre ne changera rien. Si tu bois, sois honnête avec toi : est-ce que l'envie de fumer revient avec ?",
    action:
      "Si une soirée arrive, décide à l'avance ce que tu boiras. Un bon jus, un cocktail sans alcool : le plaisir passe aussi par le goût.",
  },
  {
    numero: 6,
    jour: 65,
    titre: "Ce que tu as regagné",
    pensee: "Quand tu réalises la valeur de ce que tu tiens dans tes mains, tu n'as plus aucune envie de le lâcher.",
    message:
      "Regarde tes chiffres sur l'accueil : l'argent, les joints non fumés, le temps. Ce temps-là, j'aurais pu le passer à construire. Toi, tu le récupères maintenant. Et il y a ce qui ne se compte pas : la tête plus claire, la sérénité de ne plus te cacher, la fierté.",
    action:
      "Offre-toi quelque chose avec une partie de l'argent économisé. Quelque chose qui te fait vibrer, et qui te rappelle pourquoi tu as choisi cette vie.",
  },
  {
    numero: 7,
    jour: 72,
    titre: "Tends la main",
    pensee: "Le bonheur qu'on donne revient toujours. En aidant l'autre, c'est toi aussi que tu renforces.",
    message:
      "Tu es peut-être déjà un exemple pour quelqu'un, sans le savoir. Pas besoin de crier sur les toits ton histoire, ni de faire la leçon. Si un jour tu croises quelqu'un de perdu sur ce chemin, une seule phrase suffit : « moi aussi, je sais ce que tu ressens ».",
    action:
      "Donne un peu de ton temps cette semaine : un coup de main à un proche, une association, quelqu'un qui en a besoin.",
  },
  {
    numero: 8,
    jour: 79,
    titre: "La liberté qui grandit",
    pensee: "Tu ne deviens pas libre en un jour. Tu deviens libre chaque jour, un peu plus. Et ça ne s'arrête jamais.",
    message:
      "Bientôt trois mois. On me demande souvent à quel moment je me suis senti vraiment libre. Il n'y a pas eu de moment précis : tous les jours, je sens ma liberté grandir, et dix ans après, elle grandit encore. L'envie du premier jour n'est pas celle du centième. Avec le temps, tout s'allège.",
    action:
      "Imagine la personne que tu seras dans un an, libre depuis un an. Garde cette image : c'est ton cap.",
  },
];

/** Rendez-vous ouverts compte tenu des jours écoulés depuis le départ. */
export function rendezVousOuverts(joursEcoules: number): RendezVous[] {
  return RENDEZ_VOUS.filter((r) => joursEcoules >= r.jour);
}
