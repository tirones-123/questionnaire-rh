import OpenAI from 'openai';
import { ScoreDetails } from './scoreCalculator';

// BASE DE CONNAISSANCE - 12 CRITÈRES DE POTENTIEL
const KNOWLEDGE_BASE_12_CRITERES = `
# AMBITION
(Famille « Vouloir » - Forces motrices)

Définition :
C'est la volonté de progresser dans sa carrière en élargissant le champ de ses responsabilités et en construisant un parcours porteur de sens.

Principes et mécanismes :
L'exploration de l'ambition permet de mieux comprendre les ressorts qui stimulent une personne dans son évolution professionnelle et donnent un sens à sa carrière.

Cette ambition peut être caractérisée par :
- Son origine en s'intéressant notamment à son ancienneté dans l'histoire de l'individu
  * Ancienne : présente très tôt dans l'histoire personnelle, elle structure un projet de carrière cohérent dans la durée
  * Récente : construite au fil des expériences et des opportunités
- Sa nature en fonction des objectifs poursuivis et des responsabilités visées
  * Ambition « managériale » : exercer un pouvoir direct sur les événements et sur les hommes
  * Ambition « d'expertise » : devenir une référence incontournable dans son domaine
  * Ambition « entrepreneuriale » : acquérir un maximum d'autonomie et de marge de manœuvre dans l'exercice des responsabilités

Points d'attention :
- Si une forte « Ambition » associée à un faible « Esprit d'équipe » peut nuire à l'harmonie collective
- Si une forte « Ambition » associée à un profil plus faible sur les autres critères peut générer déceptions, frustrations, voire épuisement

Pistes de développement :
Un coaching centré sur le projet professionnel peut :
- Clarifier et structurer une ambition cohérente avec les aspirations profondes
- Aider à poser des choix équilibrés entre priorités personnelles et professionnelles
- Faire de l'ambition un levier de motivation durable, plutôt qu'une source de tension

# INITIATIVE
(Famille « Vouloir » - Forces motrices)

Définition :
C'est le dynamisme d'une personne, le besoin de prendre des initiatives et d'impulser des projets sans attendre l'évolution des événements.

Principes et mécanismes :
Le critère « Initiative » évalue le besoin d'agir activement sur l'environnement. Contrairement à l'ambition, qui s'inscrit sur le long terme, ce critère se manifeste dans les actions quotidiennes.

Il s'agit d'une énergie interne constante qui pousse l'individu à intervenir de manière autonome. Trois niveaux permettent de cerner ce besoin :
- Le suiveur : passif face aux changements
- Le réactif : répond aux évolutions de l'environnement
- L'entrepreneur : agit spontanément, anticipe, initie

Points d'attention :
- Forte « Initiative » et faible « Esprit d'équipe » : risque d'isolement et d'individualisme
- Forte « Initiative » et faible « Recul » : risque d'agir sans mesurer les conséquences (imprudence)

Pistes de développement :
- Confier des missions laissant des marges d'initiative
- Favoriser des contextes où l'erreur est acceptée comme source d'apprentissage
- Alterner missions opérationnelles et fonctionnelles

# RÉSILIENCE
(Famille « Vouloir » - Forces motrices)

Définition :
C'est faire preuve de persévérance et d'opiniâtreté dans les situations de tensions psychologiques et physiologiques.

Principes et mécanismes :
Ce critère mesure la capacité à maintenir ses efforts malgré les difficultés, à surmonter les obstacles sans céder au découragement.

Deux dimensions sont à prendre en compte :
- Physiologique : résistance à l'effort, au rythme et à la fatigue
- Psychologique : capacité à faire face aux conflits et à la pression émotionnelle

Il s'agit d'évaluer la force de continuité de l'action dans la durée, même dans un contexte défavorable.

Points d'attention :
- Forte « Résilience » et manque de « Pertinence » et/ou de « Recul » : risque de s'entêter dans des voies sans issues
- Forte « Résilience » et difficultés à gérer son énergie : risque d'épuisement professionnel

Pistes de développement :
Développer la capacité de prise de distance émotionnelle et physique par le coaching, afin de renforcer la résilience tout en préservant ses ressources.

# VISION
(Famille « Penser » - Intelligence des situations)

Définition :
C'est faire preuve d'intuition pour imaginer l'avenir afin de mieux gérer l'instant présent en préparant et anticipant le futur avec des idées novatrices.

Principes et mécanismes :
Ce critère évalue la capacité à projeter une vision du futur et à l'intégrer dans l'action présente.

Il repose sur trois piliers :
- Curiosité : veille et ouverture sur l'environnement
- Intuition : perception fine des signaux faibles
- Imagination : aptitude à proposer des idées originales

Il s'agit d'une démarche proactive, tournée vers le changement et la nouveauté.

Points d'attention :
- Forte « Vision » et faible « Sens du résultat » : risque de dispersion, fuite en avant

Pistes de développement :
- Travailler sur l'anticipation notamment au travers de l'ambition personnelle
- Travailler la confiance en ses intuitions via coaching ou formation-action

# RECUL
(Famille « Penser » - Intelligence des situations)

Définition :
C'est prendre du recul sur les événements et sur les hommes pour étudier avec objectivité et rationalité une situation avec un esprit analytique et synthétique à la fois.

Principes et mécanismes :
Le sens du recul permet une compréhension globale des situations par l'analyse rationnelle et la mise en perspective.

Deux types de distance sont essentiels :
- Par rapport aux événements : capacité à observer objectivement
- Par rapport à soi : conscience de son implication et de ses biais

L'approche analytique (décomposition) et synthétique (vision d'ensemble) se complètent pour proposer des solutions adaptées.

Points d'attention :
- Fort « Recul » et faible « Sens du résultat » : risque de rester dans la théorie, sans passage à l'action

Pistes de développement :
Favoriser les responsabilités transverses pour élargir la vision stratégique et systémique.

# PERTINENCE
(Famille « Penser » - Intelligence des situations)

Définition :
C'est la compréhension instantanée d'une situation par l'intuition et la perspicacité.

Principes et mécanismes :
Ce critère repose sur une saisie rapide et intuitive d'un problème ou d'une opportunité, sans analyse formalisée.

Il valorise :
- Le diagnostic rapide
- Le bon sens et l'esprit critique
- L'humour et la distance pour pointer l'essentiel

La pertinence découle d'une lecture fine, souvent instinctive et quasi immédiate, des enjeux clés.

Points d'attention :
- Forte « Pertinence » et faible « Vision » : frein potentiel à la nouveauté et à la prise d'initiative par excès de lucidité sur les risques

Pistes de développement :
Confronter les intuitions à la mise en œuvre, à travers des responsabilités impliquant diagnostic et action.

# ORGANISATION
(Famille « Agir » - Capacités de réalisation)

Définition :
C'est l'attachement à une structuration du travail permettant une efficacité collective et individuelle.

Principes et mécanismes :
Ce critère évalue la capacité à hiérarchiser, planifier, déléguer, structurer les ressources matérielles et humaines de manière adaptée.

L'organisation favorise la clarté, le respect des délais et l'adéquation aux besoins du terrain, tout en restant souple.

Points d'attention :
- Forte « Organisation » et faible « Sens du résultat » sans lien au terrain : perte de sens pratique
- Manque de méthode : difficulté à structurer son action efficacement

Pistes de développement :
Accompagner par des outils de gestion adaptés et un apprentissage de la délégation efficace.

# DÉCISION
(Famille « Agir » - Capacités de réalisation)

Définition :
C'est la capacité à trancher et agir rapidement face à l'urgence et aux changements de l'environnement.

Principes et mécanismes :
Ce critère mesure l'aptitude à faire des choix dans l'incertitude, à assumer ses décisions et à réagir en temps utile.

Il suppose :
- Une indépendance d'esprit
- Une capacité à intégrer des données nouvelles
- Un positionnement clair, même en situation confuse

Points d'attention :
- Forte « Décision » et faible « Recul » : risque de précipitation ou de décisions mal évaluées
- Forte « Décision » et faible « Communication » dans son versant écoute : risque de tensions humaines

Pistes de développement :
- Multiplier les expériences de terrain et situations d'urgence pour renforcer la confiance en sa capacité de décision
- Privilégier les postes ou les mises en situation permettant une visibilité rapide sur les résultats des décisions prises

# SENS DU RÉSULTAT
(Famille « Agir » - Capacités de réalisation)

Définition :
C'est l'attention portée aux résultats concrets, avec une action ancrée dans les réalités opérationnelles.

Principes et mécanismes :
Le critère « Sens du résultat » valorise la mise en œuvre d'actions utiles et adaptées, en lien avec les besoins du terrain.

Deux éléments sont essentiels à la performance :
- Le pragmatisme : souci des faits, des moyens et du contexte
- L'efficacité : atteinte d'objectifs clairs et mesurables

Points d'attention :
- Fort « Sens du résultat » et faible « Esprit d'équipe » et « Communication » : risque de brutalité dans l'exécution
- Fort « Sens du résultat » et faible « Vision » : risque de ne reproduire que ce qui a déjà marché sans jamais innover

Pistes de développement :
- Installer des indicateurs clairs
- Structurer des bilans d'action
- Stabiliser les missions pour ancrer les résultats

# COMMUNICATION
(Famille « Ensemble » - Aptitudes relationnelles)

Définition :
C'est être à l'écoute et favoriser un dialogue ouvert où chacun peut s'exprimer librement.

Principes et mécanismes :
Ce critère explore la capacité à établir un échange authentique et respectueux, à travers deux dimensions :
- Le contenu : authenticité, clarté, fluidité
- La relation : écoute, intégration des propos de l'autre, empathie

Il s'agit de créer un espace de confiance où la parole circule dans les deux sens.

Points d'attention :
- Forte « Communication » et faible « Résilience » et/ou « Décision » : risque d'évitement du conflit
- Fort « Leadership » et faible « Communication » : risque de renforcer le côté descendant et unilatéral de la communication

Pistes de développement :
Travailler la fluidité, la clarté, ou l'écoute active selon le point faible identifié ; coaching ou training selon les besoins.

# ESPRIT D'ÉQUIPE
(Famille « Ensemble » - Aptitudes relationnelles)

Définition :
C'est l'aptitude à inscrire son action dans un projet collectif, en valorisant la cohésion du groupe.

Principes et mécanismes :
Le critère met en valeur la contribution individuelle à un projet commun, dans un réseau d'interdépendance.

L'individu :
- Communique sur son travail
- S'intéresse au travail des autres
- Partage compétences et expériences

Le sens de l'équipe se révèle aussi dans la capacité à maintenir la cohésion en cas de tensions.

Points d'attention :
- Fort « Esprit d'équipe » et faible « Communication » avec difficulté à prendre en compte la dimension individuelle : risque de dilution des responsabilités individuelles

Pistes de développement :
- Confier des missions transverses
- Promouvoir des projets collaboratifs
- Valoriser les résultats collectifs

# LEADERSHIP
(Famille « Ensemble » - Aptitudes relationnelles)

Définition :
C'est la faculté de susciter l'adhésion et de mobiliser un groupe autour d'un projet par sa personnalité.

Principes et mécanismes :
Ce critère mesure le charisme, l'impact personnel et la force de mobilisation d'un individu.

Trois dimensions clés :
- Conviction : assurance intérieure
- Engagement : capacité à s'affirmer
- Séduction : désir et plaisir de partager

Cette combinaison crée un effet d'entraînement vers un but commun.

Points d'attention :
- Fort « Leadership » avec volonté de mobiliser ses équipes et faible « Esprit d'équipe » avec les autres entités : risque d'en faire trop pour ses équipes au détriment de la bonne coopération avec les autres

Pistes de développement :
- Renforcer le leadership via coaching, mentoring
- Encourager la délégation et le transfert des compétences
`;

// EXEMPLE DE RAPPORT - Pour référence du format et du style
const EXEMPLE_RAPPORT_OLIVIER = `
RAPPORT D'AUTODIAGNOSTIC
Olivier H, DRH, 60 ans

1. Analyse critère par critère

FAMILLE « VOULOIR » (MOTEUR PERSONNEL)

AMBITION
Volonté de progresser dans sa carrière en construisant un parcours porteur de sens
Score : 4,8 – Point fort
Le score exceptionnel obtenu par Olivier sur le critère de l'ambition reflète une volonté affirmée de progression professionnelle. Il accorde une grande importance à sa réussite, sans pour autant négliger le sens profond de son parcours. On observe chez lui une capacité à se projeter clairement dans l'avenir, accompagnée d'une disposition à consentir des efforts réguliers pour atteindre ses objectifs. Olivier semble avoir construit une ambition solide, ancrée dans une histoire personnelle cohérente et une expérience confirmée. Cette ambition, probablement nourrie par une volonté de transmission et une posture d'influence à ce stade de sa carrière, constitue un véritable moteur dans son positionnement professionnel. Elle est d'autant plus structurante qu'elle s'inscrit dans une logique de responsabilité accrue.

INITIATIVE
Besoin de prendre des initiatives et d'impulser des projets
Score : 4,2 – Point fort
Olivier démontre une propension marquée à agir avec autonomie et à impulser des dynamiques nouvelles, même dans des contextes peu stimulants. Son énergie interne est manifeste, lui permettant d'initier des projets sans attendre de sollicitation externe. Il semble avoir développé une capacité à se mobiliser de façon continue, combinant volonté d'agir et responsabilité individuelle. Ce profil traduit un comportement d'entrepreneur interne, capable de créer le mouvement autour de lui. Cette initiative affirmée peut s'avérer d'autant plus précieuse qu'elle se double d'une capacité à doser le risque de manière pertinente. Dans des environnements de changement ou d'incertitude, cette posture constitue un véritable atout de pilotage.

RÉSILIENCE
Persévérance face aux tensions psychologiques et physiologiques
Score : 4,2 – Point fort
La résilience d'Olivier apparaît comme un de ses points d'appui notables. Il dispose d'une grande capacité à maintenir ses efforts sur la durée, même dans des contextes de forte pression ou de rythme soutenu. Il semble faire preuve d'une régularité exemplaire dans la conduite de ses projets, tout en gérant avec efficacité les perturbations extérieures. Sa puissance de travail alliée à une certaine stabilité émotionnelle lui permet de résister aux tensions, sans renoncer à l'objectif fixé. Cette robustesse psychologique et physique témoigne d'une maturité professionnelle éprouvée. Elle permet à Olivier de tenir son cap en toutes circonstances, avec une remarquable force de continuité.

FAMILLE « PENSER » (INTELLIGENCE DES SITUATIONS)

VISION
Intuition pour imaginer l'avenir, anticiper et innover.
Score : 4,2 – Point fort
Olivier possède une vision d'ensemble bien structurée, nourrie par une curiosité soutenue et une ouverture aux idées nouvelles. Il fait preuve d'une capacité réelle à anticiper les évolutions de son environnement et à se projeter au-delà du présent immédiat. On observe chez lui un sens du futur articulé à une volonté d'agir sur le cours des événements, sans se résigner aux cadres existants. Cette posture proactive est généralement portée par une intuition sûre et une aptitude à détecter les signaux faibles. Elle constitue un véritable levier d'innovation et de renouvellement, qui peut être d'autant plus efficace qu'il s'ancre dans un projet collectif clarifié.

RECUL
Capacité d'analyse objective et synthétique avec distance critique
Score : 4,4 – Point fort
Le sens du recul d'Olivier s'exprime par une aptitude marquée à analyser les situations complexes avec objectivité. Il sait se détacher des émotions ou des enjeux personnels pour appréhender les problématiques avec rigueur et esprit critique. Son approche analytique, combinée à une capacité de synthèse, lui permet de proposer des lectures pertinentes et équilibrées. Dans des environnements où les données sont multiples ou contradictoires, il conserve une vue d'ensemble cohérente. Cette faculté de prise de hauteur, adossée à une logique d'objectivation, renforce sa crédibilité dans les processus de pilotage stratégique.

PERTINENCE
Compréhension instantanée, diagnostic rapide par intuition.
Score : 4,0 – Dimension solide
Olivier fait preuve d'une bonne intuition dans l'analyse des situations, avec une capacité à formuler des diagnostics pertinents dans des contextes mouvants. Il parvient souvent à saisir l'essentiel rapidement, sans négliger les nuances. Son sens critique est affûté, et il semble capable de repérer les signaux déviants ou les zones de fragilité dans un système. Si cette pertinence gagnerait à être davantage exploitée dans des situations d'urgence ou d'incertitude, elle constitue déjà un socle fiable sur lequel s'appuyer. Olivier peut ainsi contribuer efficacement à des processus de décision ou à des démarches de diagnostic organisationnel.

FAMILLE « AGIR » (EFFICACITÉ DANS L'ACTION)

ORGANISATION
Structuration du travail pour l'efficacité collective et individuelle
Score : 4,6 – Point fort
Olivier fait preuve d'une organisation rigoureuse et adaptée, orientée vers l'efficacité concrète. Il semble capable de structurer ses activités avec méthode, tout en tenant compte des contraintes du terrain. Il hiérarchise les priorités, gère les ressources disponibles et respecte les délais impartis. Cette maîtrise des fondamentaux organisationnels lui permet d'évoluer dans des environnements exigeants avec fluidité. Il sait aussi faire preuve de souplesse lorsque la situation le demande, évitant ainsi les effets d'une rigueur trop rigide. Cette posture structurante est un atout clé pour coordonner des projets complexes ou piloter des équipes transverses.

DÉCISION
Aptitude à trancher vite en contexte incertain
Score : 3,8 – Dimension solide
Olivier démontre une aptitude certaine à trancher et à prendre position dans des contextes flous ou urgents. Il sait faire preuve de réactivité et mobiliser son jugement pour dégager des solutions concrètes. Toutefois, certaines hésitations peuvent apparaître lorsqu'il se retrouve seul face à des décisions impliquant un fort niveau d'incertitude. Il semble rechercher un certain confort intellectuel avant d'arbitrer, ce qui peut ralentir sa dynamique d'action. Cela dit, son sens de l'opportunité et sa capacité à réagir en cas d'imprévu constituent des leviers solides sur lesquels il peut continuer de s'appuyer.

SENS DU RÉSULTAT
Attention aux résultats concrets, pragmatisme.
Score : 4,6 – Point fort
Le sens du résultat d'Olivier est manifeste. Il porte une attention soutenue à la performance et à l'efficacité de ses actions. Il sait concrétiser les projets, tout en prenant en compte les contraintes du terrain et les objectifs de long terme. On observe chez lui un souci constant de rendre ses actions utiles, avec une focalisation sur les résultats mesurables. Cette posture pragmatique permet une exécution fluide et fiable, avec une priorité donnée à la durabilité des effets produits. Olivier semble allier exigence et réalisme, ce qui fait de lui un acteur opérationnel de premier plan.

FAMILLE « ENSEMBLE » (POSTURE RELATIONNELLE)

COMMUNICATION
Écoute et dialogue ouvert, authentique
Score : 4,6 – Point fort
Olivier se distingue par une communication de qualité, à la fois claire, ouverte et sincère. Il fait preuve d'une grande capacité d'écoute et sait s'adapter à ses interlocuteurs. Ses échanges sont marqués par une volonté de dialogue constructif, où la parole circule de manière fluide et respectueuse. Il prend en compte les points de vue exprimés, ce qui contribue à instaurer un climat de confiance et de coopération. Son sens pédagogique et sa chaleur relationnelle renforcent son impact dans les situations de communication sensible ou complexe. Cette posture constitue un socle robuste pour toute fonction où la relation humaine est centrale.

ESPRIT D'ÉQUIPE
Inscription de l'action dans un projet collectif, cohésion.
Score : 5,0 – Point fort
L'esprit d'équipe d'Olivier se manifeste pleinement dans sa manière de coopérer, de soutenir ses collègues et de favoriser la dynamique collective. Il agit avec solidarité, y compris lorsqu'il n'est pas directement concerné par les décisions ou les projets. Il valorise les réussites collectives et entretient des liens fonctionnels avec les autres entités. Sa posture collaborative va au-delà du simple travail d'équipe : il s'investit dans l'interdépendance, favorisant les interactions transverses. Cette orientation constitue un véritable ciment relationnel dans les contextes où la coopération est une condition de réussite.

LEADERSHIP
Capacité à mobiliser un groupe, charisme et entraînement.
Score : 4,4 – Point fort
Olivier présente un leadership affirmé, marqué par une forte présence et une capacité à entraîner l'adhésion autour de ses projets. Il sait se faire entendre avec conviction, tout en veillant à impliquer les autres dans la dynamique collective. Son charisme, bien que discret, repose sur une cohérence interne forte et une volonté de partage. Il mobilise avec justesse, sans excès d'autorité, en s'appuyant sur la responsabilité individuelle de chacun. Cette posture lui permet de piloter des équipes en créant de la cohésion et de la confiance. Elle fait de lui un leader naturellement reconnu, au service d'une ambition partagée.

2. Analyse du profil d'ensemble

Le profil d'Olivier se distingue par une solidité remarquable sur l'ensemble des critères évalués. Il conjugue une ambition ancrée et structurée avec une capacité opérationnelle aboutie, tout en démontrant une grande maturité relationnelle. Son énergie d'initiative, sa vision prospective, sa résilience et son esprit d'équipe forment un socle très homogène, gage d'efficacité dans des environnements complexes et exigeants.

On note également un équilibre entre la projection stratégique et la rigueur de mise en œuvre, qui confère à Olivier une capacité rare à conjuguer vision et action. Sa posture de leader mobilisateur, associée à une communication fluide, favorise la création d'une dynamique collective durable. Il sait autant inspirer qu'organiser, impulser qu'ancrer, dans une logique de responsabilité partagée.

Ce profil complet, empreint de cohérence et de solidité, laisse entrevoir un potentiel de contribution majeur, notamment dans des fonctions de pilotage stratégique ou d'accompagnement de transformations d'envergure. Le défi réside moins dans la correction de fragilités que dans la valorisation pleine et entière de ses capacités dans des contextes porteurs de sens.

3. Points de vigilance

• Tendance à rechercher un confort intellectuel avant de trancher (Décision)
Olivier semble avoir besoin de sécuriser ses décisions par une réflexion approfondie. Cette exigence de clarté peut freiner sa capacité à agir rapidement, notamment lorsqu'il s'agit de trancher dans des contextes mouvants où toutes les données ne sont pas disponibles. Bien qu'elle reflète un souci de justesse, cette posture peut générer des lenteurs opérationnelles si elle n'est pas compensée par des processus de décision simplifiés.

• Légères hésitations dans les contextes d'incertitude forte (Décision)
Lorsqu'il est confronté à des situations complexes ou imprévues, Olivier peut manifester une forme de prudence excessive. Cette tendance à différer le choix, en attente d'une meilleure visibilité, peut constituer un frein à l'agilité attendue dans certains environnements. Cela ne remet pas en cause sa capacité à décider, mais souligne un axe de consolidation autour de la confiance dans ses intuitions premières.

• Pertinence encore perfectible en contexte d'urgence (Pertinence)
Si Olivier démontre une capacité d'analyse fine dans les situations structurées, son acuité peut être moins efficiente lorsque l'action rapide est requise. Il peut manquer d'instantanéité dans le repérage des signaux critiques, notamment sous pression. Le développement de réflexes intuitifs plus immédiats permettrait de compléter utilement son registre de jugement.

4. Recommandations de développement

• Décision : multiplier les mises en situation où le temps de réflexion est restreint, avec des feedbacks ciblés sur la rapidité et la clarté des arbitrages ; encourager la formalisation de critères décisionnels simples pour faciliter le passage à l'acte.

• Décision : travailler la tolérance à l'incertitude à travers des scénarios de crise ou de changement imprévu, afin de renforcer la confiance en ses choix même sans vision exhaustive.

• Pertinence : favoriser la prise de décision rapide sur des situations opérationnelles concrètes, avec un retour d'expérience systématique ; organiser des ateliers de type "diagnostic flash" pour entraîner la réactivité intuitive.

5. Conclusion synthétique

Olivier présente un profil particulièrement abouti, alliant ambition, leadership et robustesse opérationnelle. Il conjugue un solide capacité d'analyse à une posture relationnelle engageante, et se distingue par son sens des responsabilités et son ancrage collectif.

Pour tirer pleinement parti de ce potentiel, il conviendra de renforcer sa capacité à décider dans l'incertitude et à mobiliser son intuition en contexte contraint. Ce levier d'agilité complémentaire permettra de consolider son impact stratégique dans des environnements mouvants.

Sa maturité professionnelle, son équilibre personnel et son orientation vers le collectif font d'Olivier un atout précieux pour toute organisation en transformation.
`;

interface GenerateReportParams {
  type: 'autodiagnostic' | 'evaluation';
  person: {
    firstName: string;
    lastName: string;
    age: string;
    profession: string;
  };
  evaluator?: {
    firstName: string;
    lastName: string;
  };
  scores: { [key: string]: ScoreDetails };
  scoresTable: Array<{
    critere: string;
    question: string;
    score: number;
    sens: string;
  }>;
}

export async function generateReportContent(params: GenerateReportParams): Promise<string> {
  const { type, person, evaluator, scores, scoresTable } = params;

  // Vérifier la clé API
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY is not defined in environment variables');
    throw new Error('Configuration error: OpenAI API key is missing');
  }

  console.log('Starting report generation with OpenAI...');
  console.log('Report type:', type);
  console.log('Person:', person.firstName, person.lastName);

  const openai = new OpenAI({
    apiKey: apiKey,
  });

  // Préparer le tableau des scores pour le prompt (sans la colonne Valence pour ne pas exposer Normal/Inversé)
  const scoresTableText = scoresTable
    .map(row => `${row.critere}\t${row.question}\t${row.score}`)
    .join('\n');

  // Préparer le tableau des scores globaux
  const globalScoresText = Object.values(scores)
    .map(score => `${score.critere}\t${score.noteSur5.toFixed(1)}`)
    .join('\n');

  const promptType = type === 'evaluation' 
    ? `RAPPORT D'ÉVALUATION DU POTENTIEL
${person.firstName} ${person.lastName}, ${person.profession}, ${person.age} ans
évalué par ${evaluator?.firstName || 'un évaluateur'}`
    : `RAPPORT D'AUTODIAGNOSTIC
${person.firstName} ${person.lastName}, ${person.profession}, ${person.age} ans`;

  const evaluationInstructions = type === 'evaluation'
    ? `IMPORTANT : Ce rapport est basé sur l'évaluation faite par ${evaluator?.firstName || 'l\'évaluateur'}. 
Dans les parties 1 et 5 du rapport, variez les formulations pour rappeler que c'est le point de vue de l'évaluateur :
- "Selon ${evaluator?.firstName || 'l\'évaluateur'}"
- "D'après ${evaluator?.firstName || 'l\'évaluateur'}"
- "Dans la perception de ${evaluator?.firstName || 'l\'évaluateur'}"
- "${evaluator?.firstName || 'L\'évaluateur'} observe que"
- "Du point de vue de ${evaluator?.firstName || 'l\'évaluateur'}"
Utilisez uniquement le prénom de l'évaluateur, jamais le nom complet.`
    : '';

  // Construction du prompt selon le schéma :
  // system -> assistant(name=retrieval) -> user

  const systemPrompt = `🎯 PROMPT – GÉNÉRATION DU "RAPPORT D'AUTODIAGNOSTIC" (FORMAT IDENTIQUE AU MODÈLE OLIVIER H.)

Contexte & rôle
Tu es consultant·e RH senior, expert·e de l'analyse du potentiel.
Ta mission : transformer les résultats d'un questionnaire d'évaluation en rapport structuré, nuancé et exploitable pour la personne évaluée et son/sa manager, en respectant scrupuleusement la mise en forme du modèle joint.

Sources disponibles
• Tableau de scores globaux (1 – 5) pour chacun des 12 critères.
• Tableau de réponses détaillées : critère, item, score (1 – 4), valence (normale ou inversée).
• Référentiel officiel à reprendre dans l'analyse : "12 critères 2025" : définitions, points d'attention, leviers de développement.

Barème d'interprétation
≥ 4,2 : Point fort 3,3 – 4,1 : Dimension solide 2,3 – 3,2 : Axe de progression < 2,3 : Point de vigilance

Traitement impératif des items inversés
• Un score élevé doit toujours être interprété positivement, quelle que soit la valeur.
• Ne jamais révéler qu'un item est "inversé" ou "normal".
• L'analyse reflète le sens réel de la réponse, jamais la forme de l'item.

Structure du rapport à produire (copie conforme au modèle)
Respecter la casse, la ponctuation, les retours à la ligne et l'ordre EXACTEMENT comme ci-dessous :

${promptType.toUpperCase()}

1. Analyse critère par critère

FAMILLE « VOULOIR » (MOTEUR PERSONNEL)

AMBITION
Volonté de progresser dans sa carrière en construisant un parcours porteur de sens
Score : X,X – [Interprétation]
[Analyse qualitative]

INITIATIVE
Besoin de prendre des initiatives et d'impulser des projets
Score : X,X – [Interprétation]
[Analyse qualitative]

RÉSILIENCE
Persévérance face aux tensions psychologiques et physiologiques
Score : X,X – [Interprétation]
[Analyse qualitative]

FAMILLE « PENSER » (INTELLIGENCE DES SITUATIONS)
[… répéter pour les 12 critères dans l'ordre et la présentation du modèle …]

2. Analyse du profil d'ensemble
[analyse globale du profil – 200 à 300 mots, 4 paragraphes]

3. Points de vigilance
bullet list

4. Recommandations de développement
• 1 à 2 recommandations par point de vigilance, relier explicitement aux critères

5. Conclusion synthétique
[80 à 120 mots : atouts, leviers, point clé de vigilance]

Règles de mise en forme
• Titre principal : RAPPORT D'AUTODIAGNOSTIC, majuscules.
• Ligne vide, puis "Prénom, âge ans" sur une seule ligne.
• Numérotation décimale (1-5) sans point final.
• FAMILLE : capitales + guillemets français "…".
• Nom du critère en MAJUSCULES simples, sans gras.
• Score : "Score : 3,6 – Dimension solide" (virgule décimale).
• Analyses : style fluide, tournures variées ("On observe…", "Il arrive que…").
• Aucune mention d'item, score 4/1, valence ou codage.
• Longueur totale visée : 1 600 – 2 300 mots.

Consignes de style
• Ton professionnel, clair, bienveillant.

Tout écart sera considéré comme une non-conformité.`;

  const retrievalContext = `# BASE DE CONNAISSANCE - DÉFINITIONS DES 12 CRITÈRES :
${KNOWLEDGE_BASE_12_CRITERES}

# EXEMPLE DE RAPPORT - Pour t'inspirer du style et du format :
${EXEMPLE_RAPPORT_OLIVIER}`;

  const userPrompt = `Données à analyser :

SCORES GLOBAUX PAR CRITÈRE :
Critère\tNote sur 5
${globalScoresText}

DÉTAIL DES RÉPONSES :
Critère\tQuestion\tScore
${scoresTableText}

Génère le rapport complet conformément aux instructions fournies, sans répéter les consignes.`;

  try {
    console.log('Calling OpenAI API...');
    
    // PREMIER APPEL : Génération de la partie 1 (analyse des 12 critères)
    console.log('Generating Part 1: Criteria Analysis...');
    
    const part1Prompt = `Génère UNIQUEMENT la partie 1 (Analyse critère par critère) du rapport.

**Objectif :** Produire une analyse **simple, claire et directe** pour chaque critère.

**Rappels :**
*   Commence par le titre : "1. Analyse critère par critère"
*   Suis l'ordre des 12 critères.
*   Pour chaque critère : nom, définition, score, puis analyse de 100-120 mots.
*   **INTERDIT :** Aucune recommandation.
*   **INTERDIT :** Aucun jargon.
*   Utilise le prénom ${person.firstName}.
*   Ne Fais pas références dans le texte aux réponses du questionnaire ni au score ex: "ses réponses montrent", "son score de 4,6 montre"... Mais bien les prendre en compte dans l'analyse.
`;

    const part1Exigences = `INSTRUCTIONS STRICTES : SIMPLICITÉ AVANT TOUT.

2.  **Vocabulaire OBLIGATOIREMENT Simple.**

4.  **Rappel : INTERDICTION ABSOLUE de faire des recommandations.**
    *   L'analyse est 100% descriptive. Ne jamais suggérer ce que la personne "devrait faire" ou "pourrait améliorer".
`;

    const completion1 = await openai.chat.completions.create({
      model: "o3-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "assistant", name: "retrieval", content: retrievalContext },
        { role: "user", content: `${userPrompt}\n\n${part1Prompt}\n\n${part1Exigences}` }
      ],
      reasoning_effort: "medium",
      max_completion_tokens: 10000,
    });

    const part1Content = completion1.choices[0]?.message?.content;
    if (!part1Content) {
      throw new Error('La génération de la partie 1 a échoué');
    }

    console.log('Part 1 generated successfully');

    // DEUXIÈME APPEL : Génération des parties 2-5 avec la partie 1 en contexte
    console.log('Generating Parts 2-5...');
    
    const part2Prompt = `Voici la partie 1 déjà générée :

${part1Content}

Maintenant, génère les parties 2 à 5 du rapport en te basant sur l'analyse ci-dessus.

STRUCTURE À PRODUIRE :

2. Analyse du profil d'ensemble
[Résumé transversal de 4 paragraphes, 200-300 mots au total, qui synthétise et fait une analyse global les forces et axes de progression identifiés dans la partie 1]

3. Points de vigilance
[bullet liste]

4. Recommandations de développement
[2-3 recommandations par point de vigilance, relier explicitement aux critères]

5. Conclusion synthétique
[80-120 mots : synthèse des atouts, leviers, point clef de vigilance]

IMPORTANT : Ne pas répéter la partie 1, commencer directement par "2. Analyse du profil d'ensemble"`;

         const part2Exigences = `INSTRUCTIONS SIMPLES POUR LES PARTIES 2 à 5 :

**Style Général :**
*   Ton professionnel, simple et bienveillant.
*   Pas de jargon, pas de phrases trop compliquées.

---

**Partie 2 - Analyse Approfondie du Profil :**
*   **Objectif :** Aller au-delà de la description pour révéler la dynamique de fond du profil.
*   **Contenu :**
    *   **Analyse des Équilibres :** Mettre en lumière les équilibres ou déséquilibres.
    *   **Identifier la "Mécanique" du Profil :** Décrire comment la personne fonctionne.
    *   **Conséquences et Potentiel :** Expliquer les conséquences concrètes de cette dynamique dans une entreprise et le levier principal pour libérer ce potentiel.
*   **Lisibilité :** Ajouter des sauts de ligne entre chaque paragraphe.

---

**Partie 3 - Points de vigilance :**
*   **Objectif :** Lister les risques et points faibles de manière concise et percutante.
*   **Format :**
    *   Utiliser des puces (•).
    *   Formuler chaque point comme un titre descriptif
    *   La plupart des points doivent se terminer par le critère concerné entre parenthèses (Critère).
    *   **Être exhaustif sur le nombre de points de vigilance (plus que 6 si possible).**
    *   **Pensez aux combinaisons de critères**
    *   SI il y a un déséquilibre entre deux ou trois critères qui comporte un risque, il faut le signaler (ex: "Fort en décision et faible en pertinence").

---

**Partie 4 - Recommandations de développement :**
*   **Objectif :** Proposer des actions concrètes et utiles.
*   **Format OBLIGATOIRE :**
    *   Chaque recommandation est un bloc.
    *   Titre en bullet point : compétence à développer (Critère). Exemple : "Renforcer la projection dans l'avenir professionnel (Ambition)".
    *   Texte en tiret : Deux phrases complètes et fluides. Chaque phrase commence par une action.
---

**Partie 5 - Conclusion synthétique :**
*   **Objectif :** Résumer le profil et donner une perspective.
*   **Format :**
    *   Paragraphe 1 : Rappeler les points forts principaux.
    *   Paragraphe 2 : Indiquer les axes de progrès les plus importants.
    *   Paragraphe 3 : Suggérer des pistes d'amélioration et conclure sur le potentiel.
*   **Lisibilité :** Ajouter des sauts de ligne entre chaque paragraphe.
`;

    const completion2 = await openai.chat.completions.create({
      model: "o3-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "assistant", name: "retrieval", content: retrievalContext },
        { role: "user", content: `${userPrompt}\n\n${part2Prompt}\n\n${part2Exigences}` }
      ],
      reasoning_effort: "medium",
      max_completion_tokens: 5000,
    });

    const part2Content = completion2.choices[0]?.message?.content;
    if (!part2Content) {
      throw new Error('La génération des parties 2-5 a échoué');
    }

    console.log('Parts 2-5 generated successfully');

    // Assembler le rapport complet
    const fullReport = `${promptType.toUpperCase()}

${part1Content}

${part2Content}`;

    console.log('Report generated successfully');
    
    // Nettoyer le contenu de tout formatage markdown indésirable
    const cleanedContent = fullReport
      .replace(/\*\*(.*?)\*\*/g, '$1') // Enlever les doubles astérisques
      .replace(/\*(.*?)\*/g, '$1')     // Enlever les simples astérisques
      .replace(/__(.*?)__/g, '$1')     // Enlever les doubles underscores
      .replace(/_(.*?)_/g, '$1');      // Enlever les simples underscores
    
    return cleanedContent;
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    
    if (error instanceof Error) {
      // Erreur spécifique OpenAI
      if (error.message.includes('401') || error.message.includes('Incorrect API key')) {
        throw new Error('Erreur d\'authentification OpenAI : vérifiez votre clé API');
      }
      if (error.message.includes('429')) {
        throw new Error('Limite de taux OpenAI atteinte : réessayez dans quelques secondes');
      }
      if (error.message.includes('500') || error.message.includes('503')) {
        throw new Error('Service OpenAI temporairement indisponible');
      }
    }
    
    throw new Error('Erreur lors de la génération du rapport : ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
  }
} 