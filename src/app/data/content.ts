import type { Article } from '../models/article';

export interface Pillar { num: string; title: string; text: string; icon: string; }
export interface Group { title: string; text: string; dot: string; icon: string; }
export interface Value { num: string; title: string; text: string; dot: string; }
export interface Social { label: string; icon: string; url: string; }

export type { Article };
export { CATEGORIES } from '../models/article';

export const PILLARS: Pillar[] = [
  { num: '01', title: "Reconstruction de l'État", text: "Réformes institutionnelles et bonne gouvernance pour un État au service du citoyen.", icon: 'lucideLandmark' },
  { num: '02', title: "Rétablissement de la sécurité", text: "Restaurer la paix et la sécurité publique, condition de toute reconstruction.", icon: 'lucideShieldCheck' },
  { num: '03', title: "Renforcement de la démocratie", text: "Des institutions fortes, transparentes et redevables devant la nation.", icon: 'lucideVote' },
  { num: '04', title: "Développement durable", text: "Une croissance économique inclusive et la justice sociale pour tous.", icon: 'lucideSprout' },
];

export const GROUPS: Group[] = [
  { title: "Les jeunes", text: "Moteurs de la transformation nationale.", dot: '#00209F', icon: 'lucideUsers' },
  { title: "Les femmes", text: "Au cœur des décisions et du changement.", dot: '#D21034', icon: 'lucideUserRound' },
  { title: "La société civile", text: "Associations et forces citoyennes mobilisées.", dot: '#00209F', icon: 'lucideHandshake' },
  { title: "Le secteur privé", text: "Partenaire du développement économique.", dot: '#D21034', icon: 'lucideBriefcase' },
  { title: "La diaspora", text: "Un pont entre Haïti et le monde.", dot: '#00209F', icon: 'lucideGlobe' },
  { title: "Les territoires", text: "Chaque région d'Haïti représentée.", dot: '#D21034', icon: 'lucideMapPinned' },
];

export const SOCIALS: Social[] = [
  { label: 'Facebook', icon: 'simpleFacebook', url: 'https://facebook.com' },
  { label: 'X', icon: 'simpleX', url: 'https://x.com' },
  { label: 'Instagram', icon: 'simpleInstagram', url: 'https://instagram.com' },
  { label: 'Threads', icon: 'simpleThreads', url: 'https://threads.net' },
  { label: 'YouTube', icon: 'simpleYoutube', url: 'https://youtube.com' },
  { label: 'WhatsApp', icon: 'simpleWhatsapp', url: 'https://whatsapp.com' },
];

export const VALUES: Value[] = [
  { num: '1', title: "Leadership intègre", text: "Un leadership responsable, intègre et compétent au service de la Patrie.", dot: '#00209F' },
  { num: '2', title: "Dialogue", text: "Le dialogue comme fondement de toute solution durable.", dot: '#D21034' },
  { num: '3', title: "Rassemblement", text: "L'union des forces vives de la nation autour d'un projet commun.", dot: '#00209F' },
  { num: '4', title: "Solutions concrètes", text: "Des propositions réalistes face aux défis réels d'Haïti.", dot: '#D21034' },
];

/**
 * Articles de démarrage. Servent à amorcer (seed) la base de données au premier
 * lancement du serveur. Une fois en base, les articles se gèrent depuis /admin.
 */
export const ARTICLES: Article[] = [
  {
    slug: 'retablir-la-securite-feuille-de-route',
    category: 'Sécurité',
    title: "Rétablir la sécurité : une feuille de route en cinq étapes",
    excerpt: "Sans sécurité, aucun développement n'est possible. La NAP propose une approche structurée et réaliste pour restaurer la paix.",
    date: '2026-06-15',
    readMinutes: 6,
    imgLabel: 'PHOTO — sécurité',
    published: true,
    body: `La sécurité est la première des libertés. Sans elle, ni l'école, ni l'hôpital, ni le commerce ne peuvent fonctionner normalement. C'est pourquoi la Nouvelle Alliance pour la Patrie place le rétablissement de la sécurité au cœur de son projet.

Notre feuille de route repose sur cinq étapes. D'abord, restaurer l'autorité de l'État sur l'ensemble du territoire. Ensuite, réformer et professionnaliser les forces de l'ordre. Troisièmement, désarmer et réinsérer, en s'attaquant aux racines sociales de la violence.

Quatrièmement, rendre la justice accessible et indépendante, car il n'y a pas de paix durable sans justice. Enfin, associer les communautés à leur propre sécurité, par la prévention et le dialogue.

Cette approche n'est pas une promesse de plus : c'est un engagement méthodique, réaliste et mesurable, que nous entendons mener avec toutes les forces vives de la nation.`,
  },
  {
    slug: 'reformer-les-institutions-gouvernance-transparente',
    category: 'Gouvernance',
    title: "Réformer les institutions pour une gouvernance transparente",
    excerpt: "La bonne gouvernance commence par des institutions fortes et redevables. Tour d'horizon de nos propositions.",
    date: '2026-06-08',
    readMinutes: 5,
    imgLabel: 'PHOTO — institutions',
    published: true,
    body: `La confiance entre les citoyens et l'État se reconstruit par la transparence. Trop longtemps, l'opacité a nourri la défiance et le découragement.

La NAP propose des institutions fortes, indépendantes et redevables : publication des budgets, contrôle citoyen des dépenses publiques, et lutte sans relâche contre la corruption.

Une gouvernance transparente n'est pas un luxe : c'est la condition d'un État qui sert réellement le citoyen.`,
  },
  {
    slug: 'la-jeunesse-au-coeur-de-la-transformation',
    category: 'Jeunesse',
    title: "La jeunesse haïtienne au cœur de la transformation",
    excerpt: "Former, inclure et donner les moyens d'agir : la jeunesse est l'avenir de la nation.",
    date: '2026-06-01',
    readMinutes: 4,
    imgLabel: 'PHOTO — jeunesse',
    published: true,
    body: `La jeunesse haïtienne est la première richesse du pays. Former, inclure et donner les moyens d'agir : voilà notre priorité.

Nous voulons investir dans l'éducation, la formation professionnelle et l'entrepreneuriat des jeunes, pour qu'ils deviennent les acteurs de la transformation nationale plutôt que les spectateurs de leur propre avenir.`,
  },
  {
    slug: 'mobiliser-la-diaspora-pont-entre-haiti-et-le-monde',
    category: 'Diaspora',
    title: "Mobiliser la diaspora : un pont entre Haïti et le monde",
    excerpt: "Compétences, investissements et solidarité : la diaspora est une force pour la reconstruction.",
    date: '2026-05-24',
    readMinutes: 5,
    imgLabel: 'PHOTO — diaspora',
    published: true,
    body: `La diaspora haïtienne est un pont entre Haïti et le monde. Ses compétences, ses investissements et sa solidarité sont une force considérable pour la reconstruction.

La NAP entend créer les conditions d'un engagement durable de la diaspora : reconnaissance de son rôle, participation à la vie nationale et cadre de confiance pour investir au pays.`,
  },
  {
    slug: 'pour-une-haiti-ou-chacun-vit-dans-la-dignite',
    category: 'Justice sociale',
    title: "Pour une Haïti où chacun vit dans la dignité",
    excerpt: "La justice sociale n'est pas une option mais le fondement d'une nation stable et apaisée.",
    date: '2026-05-17',
    readMinutes: 4,
    imgLabel: 'PHOTO — communauté',
    published: true,
    body: `La justice sociale n'est pas une option : c'est le fondement d'une nation stable et apaisée. Une société où chacun vit dans la dignité est une société plus sûre pour tous.

Accès à la santé, à l'éducation et à un revenu décent : ce sont les piliers d'une Haïti réconciliée avec elle-même.`,
  },
  {
    slug: 'developpement-economique-durable-et-inclusif',
    category: 'Économie',
    title: "Vers un développement économique durable et inclusif",
    excerpt: "Créer des emplois, soutenir la production locale et bâtir une croissance qui profite à tous.",
    date: '2026-05-10',
    readMinutes: 6,
    imgLabel: 'PHOTO — économie',
    published: true,
    body: `Créer des emplois, soutenir la production locale et bâtir une croissance qui profite à tous : telle est notre ambition économique.

La NAP défend un développement durable et inclusif, qui valorise l'agriculture, l'artisanat et l'industrie nationale, tout en protégeant l'environnement pour les générations futures.`,
  },
];
