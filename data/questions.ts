export interface Question {
  id: number;
  text: string;
}

export interface Section {
  id: number;
  title: string;
  questions: Question[];
}

export const sections: Section[] = [
  {
    id: 1,
    title: "Performance et réussite",
    questions: [
      { id: 1, text: "Attache de l'importance à sa réussite professionnelle" },
      { id: 7, text: "Est focalisé sur la performance et l'efficacité" },
      { id: 10, text: "Utilise efficacement les moyens mis à sa disposition" },
      { id: 36, text: "Va jusqu'au bout de ce qu'il entreprend sans jamais céder à la facilité" },
      { id: 37, text: "Souhaite évoluer en responsabilité ou en influence dans l'entreprise" },
      { id: 61, text: "Est prêt à faire des efforts importants pour réussir professionnellement" },
      { id: 70, text: "Respecte toujours les échéances et les délais" },
      { id: 72, text: "Possède une forte puissance de travail" },
      { id: 13, text: "Préfère son confort personnel à son évolution professionnelle" }
    ]
  },
  {
    id: 2,
    title: "Leadership et influence",
    questions: [
      { id: 20, text: "Possède un fort impact dans les réunions" },
      { id: 32, text: "N'ose pas se placer en leader dans un groupe" },
      { id: 44, text: "Possède une forte présence et sait se faire entendre" },
      { id: 56, text: "Entraîne facilement l'adhésion de ses interlocuteurs" },
      { id: 8, text: "A du mal à se faire entendre et à capter l'attention" },
      { id: 68, text: "Manque de charisme et d'impact sur les autres" },
      { id: 22, text: "A du mal à déléguer" },
      { id: 27, text: "Possède un bon sens pédagogique" },
      { id: 64, text: "Prend du temps pour aider ses collègues" }
    ]
  },
  {
    id: 3,
    title: "Initiative et innovation",
    questions: [
      { id: 9, text: "Prend activement des initiatives même dans des contextes peu stimulants" },
      { id: 21, text: "Sait se stimuler en permanence pour entreprendre" },
      { id: 69, text: "Sait prendre des risques si la situation l'exige" },
      { id: 2, text: "S'intéresse peu aux idées nouvelles et à l'innovation" },
      { id: 50, text: "Ne croit qu'aux solutions qui ont déjà fait leurs preuves" },
      { id: 62, text: "Est curieux de l'évolution de son environnement et est à l'affût de la nouveauté" },
      { id: 45, text: "A besoin d'un environnement stimulant pour se dynamiser" },
      { id: 57, text: "A tendance à se laisser porter par les événements" },
      { id: 33, text: "Pêche par excès de prudence pour avancer" }
    ]
  },
  {
    id: 4,
    title: "Communication et relations",
    questions: [
      { id: 3, text: "A tendance à monopoliser la parole dans les discussions" },
      { id: 15, text: "Ne se met pas suffisamment à la portée de ses interlocuteurs" },
      { id: 39, text: "Manque parfois de sincérité et de transparence avec son entourage professionnel" },
      { id: 51, text: "Prend en compte et intègre véritablement les arguments d'autrui" },
      { id: 63, text: "Ses échanges au sein de l'entreprise sont chaleureux et ouverts" },
      { id: 52, text: "A tendance à travailler de manière isolée et solitaire" },
      { id: 16, text: "Favorise le travail transverse avec d'autres entités ou services" },
      { id: 40, text: "S'intéresse peu aux activités des autres services" },
      { id: 28, text: "A tendance à défendre son territoire au détriment de l'intérêt collectif" }
    ]
  },
  {
    id: 5,
    title: "Adaptabilité et réactivité",
    questions: [
      { id: 6, text: "Sait réagir vite en cas d'urgence ou d'imprévu" },
      { id: 24, text: "S'accommode facilement des ruptures de rythme (déplacements, décalages horaires...)" },
      { id: 54, text: "Sait être réactif pour saisir les opportunités" },
      { id: 12, text: "Est éprouvé par les relations de travail difficiles" },
      { id: 29, text: "Perd de sa perspicacité dans les situations d'urgence" },
      { id: 48, text: "A du mal à s'adapter à des efforts soutenus" },
      { id: 65, text: "Fait preuve d'un bon jugement dans les situations d'urgences" },
      { id: 67, text: "Sait tenir compte des contraintes du terrain" },
      { id: 4, text: "Est solidaire des décisions prises en commun même s'il n'est pas d'accord" }
    ]
  },
  {
    id: 6,
    title: "Analyse et prise de décision",
    questions: [
      { id: 5, text: "Repère rapidement les dysfonctionnements d'une organisation" },
      { id: 11, text: "Conserve son objectivité dans les situations où il est lui-même impliqué" },
      { id: 17, text: "Possède un excellent coup d'œil, perspicace et critique" },
      { id: 18, text: "A du mal à trancher dans les situations floues" },
      { id: 30, text: "A tendance à remettre à plus tard les décisions à prendre" },
      { id: 35, text: "A du mal à argumenter rationnellement ses points de vue" },
      { id: 42, text: "Fait preuve d'indépendance d'esprit pour décider" },
      { id: 66, text: "A du mal à se décider seul" },
      { id: 71, text: "Sait être logique et rationnel dans l'analyse des problèmes complexes" }
    ]
  },
  {
    id: 7,
    title: "Organisation et méthode",
    questions: [
      { id: 23, text: "A tendance à se polariser sur les détails" },
      { id: 31, text: "Son perfectionnisme nuit à son efficacité" },
      { id: 34, text: "Fait preuve de méthode dans le pilotage de ses projets" },
      { id: 43, text: "Sait concrétiser les idées et les projets" },
      { id: 46, text: "Se plaint souvent du manque de moyens pour atteindre ses objectifs" },
      { id: 55, text: "A du mal à fixer des objectifs clairs et concrets" },
      { id: 58, text: "A tendance à se disperser dans son travail" },
      { id: 59, text: "A du mal à saisir l'ensemble des paramètres d'un problème complexe" },
      { id: 60, text: "Manque de ténacité pour mener à leur terme les projets difficiles" }
    ]
  },
  {
    id: 8,
    title: "Vision et projection",
    questions: [
      { id: 14, text: "Possède une bonne intuition pour imaginer la suite des événements" },
      { id: 19, text: "Se préoccupe peu de la pérennité de ce qu'il met en œuvre" },
      { id: 25, text: "A du mal à se projeter dans son avenir professionnel" },
      { id: 26, text: "A la conviction qu'il peut agir sur le futur et modifier le cours des événements" },
      { id: 38, text: "A du mal à se projeter dans le futur" },
      { id: 41, text: "Manque de bon sens dans les situations confuses et incertaines" },
      { id: 47, text: "Sait prendre de la hauteur pour se donner plus de perspectives sur une situation" },
      { id: 49, text: "Se préoccupe peu de son évolution de carrière" },
      { id: 53, text: "A besoin de réfléchir posément plutôt que de faire confiance en son intuition" }
    ]
  }
];

export const responseOptions = [
  { value: 'a', label: 'Tout à fait d\'accord', shortLabel: 'Tout à fait d\'accord (++)' },
  { value: 'b', label: 'D\'accord', shortLabel: 'D\'accord (+)' },
  { value: 'c', label: 'Neutre', shortLabel: 'Neutre (=)' },
  { value: 'd', label: 'Pas d\'accord', shortLabel: 'Pas d\'accord (-)' },
  { value: 'e', label: 'Pas d\'accord du tout', shortLabel: 'Pas d\'accord du tout (--)' }
]; 