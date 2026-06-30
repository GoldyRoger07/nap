export interface Pillar { num: string; title: string; text: string; icon: string; }
export interface Group { title: string; text: string; dot: string; icon: string; }
export interface Value { num: string; title: string; text: string; dot: string; }
export interface Social { label: string; icon: string; url: string; }
export interface Article {
  category: string;
  title: string;
  excerpt: string;
  meta: string;
  imgLabel: string;
}

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

export const ARTICLES: Article[] = [
  { category: 'Sécurité', title: "Rétablir la sécurité : une feuille de route en cinq étapes", excerpt: "Sans sécurité, aucun développement n'est possible. La NAP propose une approche structurée et réaliste pour restaurer la paix.", meta: "15 juin 2026 · 6 min de lecture", imgLabel: 'PHOTO — sécurité' },
  { category: 'Gouvernance', title: "Réformer les institutions pour une gouvernance transparente", excerpt: "La bonne gouvernance commence par des institutions fortes et redevables. Tour d'horizon de nos propositions.", meta: "8 juin 2026 · 5 min de lecture", imgLabel: 'PHOTO — institutions' },
  { category: 'Jeunesse', title: "La jeunesse haïtienne au cœur de la transformation", excerpt: "Former, inclure et donner les moyens d'agir : la jeunesse est l'avenir de la nation.", meta: "1 juin 2026 · 4 min de lecture", imgLabel: 'PHOTO — jeunesse' },
  { category: 'Diaspora', title: "Mobiliser la diaspora : un pont entre Haïti et le monde", excerpt: "Compétences, investissements et solidarité : la diaspora est une force pour la reconstruction.", meta: "24 mai 2026 · 5 min de lecture", imgLabel: 'PHOTO — diaspora' },
  { category: 'Justice sociale', title: "Pour une Haïti où chacun vit dans la dignité", excerpt: "La justice sociale n'est pas une option mais le fondement d'une nation stable et apaisée.", meta: "17 mai 2026 · 4 min de lecture", imgLabel: 'PHOTO — communauté' },
  { category: 'Économie', title: "Vers un développement économique durable et inclusif", excerpt: "Créer des emplois, soutenir la production locale et bâtir une croissance qui profite à tous.", meta: "10 mai 2026 · 6 min de lecture", imgLabel: 'PHOTO — économie' },
];

export const CATEGORIES = ['Sécurité', 'Gouvernance', 'Jeunesse', 'Diaspora', 'Justice sociale', 'Économie'];
