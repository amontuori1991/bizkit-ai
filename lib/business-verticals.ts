export type BusinessType =
  | "gym"
  | "personal_trainer"
  | "fitness_studio"
  | "sports_center"
  | "hair_salon"
  | "barber_shop"
  | "hair_stylist";

export type AIContentType =
  | "caption"
  | "reel"
  | "promo"
  | "sports_caption"
  | "sports_reel_script"
  | "sports_promo"
  | "sports_client_message"
  | "hair_caption"
  | "hair_reel_script"
  | "hair_promo"
  | "hair_client_message"
  | "hair_appointment_reminder"
  | "hair_review_request"
  | "hair_stories_idea"
  | "hair_tiktok_hook";

export type SportsCenterSubcategory =
  | "paintball"
  | "softair"
  | "laser_tag"
  | "padel"
  | "calcetto"
  | "tennis"
  | "beach_volley"
  | "adventure_park"
  | "go_kart"
  | "multisport";

export type QuickTemplate = {
  label: string;
  prompt: string;
};

export const businessTypeOptions: Array<{
  value: BusinessType;
  label: string;
  vertical: "fitness" | "hair" | "sports";
}> = [
  { value: "gym", label: "Palestra", vertical: "fitness" },
  { value: "personal_trainer", label: "Personal trainer", vertical: "fitness" },
  { value: "fitness_studio", label: "Studio fitness", vertical: "fitness" },
  { value: "sports_center", label: "Centro sportivo & outdoor", vertical: "sports" },
  { value: "hair_salon", label: "Salone parrucchieri", vertical: "hair" },
  { value: "barber_shop", label: "Barber shop", vertical: "hair" },
  { value: "hair_stylist", label: "Hair stylist", vertical: "hair" },
];

export const sportsCenterSubcategoryOptions: Array<{
  value: SportsCenterSubcategory;
  label: string;
}> = [
  { value: "paintball", label: "Paintball" },
  { value: "softair", label: "Softair" },
  { value: "laser_tag", label: "Laser Tag" },
  { value: "padel", label: "Padel" },
  { value: "calcetto", label: "Calcetto" },
  { value: "tennis", label: "Tennis" },
  { value: "beach_volley", label: "Beach Volley" },
  { value: "adventure_park", label: "Adventure Park" },
  { value: "go_kart", label: "Go Kart" },
  { value: "multisport", label: "Multisport" },
];

export const hairBusinessTypes = new Set<BusinessType>([
  "hair_salon",
  "barber_shop",
  "hair_stylist",
]);

export const sportsBusinessTypes = new Set<BusinessType>(["sports_center"]);

export function isHairBusinessType(value?: string | null): value is BusinessType {
  return Boolean(value && hairBusinessTypes.has(value as BusinessType));
}

export function isSportsBusinessType(value?: string | null): value is BusinessType {
  return Boolean(value && sportsBusinessTypes.has(value as BusinessType));
}

export function getBusinessTypeLabel(value?: string | null) {
  return businessTypeOptions.find((item) => item.value === value)?.label ?? value ?? "Business";
}

export function getSportsSubcategoryLabel(value?: string | null) {
  return (
    sportsCenterSubcategoryOptions.find((item) => item.value === value)?.label ?? value ?? "Centro sportivo"
  );
}

export const generatorQuickTemplates: Partial<Record<AIContentType, QuickTemplate[]>> = {
  caption: [
    { label: "Promo estate", prompt: "Scrivi una caption per lanciare una promo estate con iscrizione agevolata entro domenica." },
    { label: "Open day", prompt: "Scrivi una caption per promuovere un open day con consulenza gratuita e visita guidata." },
    { label: "Trasformazione cliente", prompt: "Scrivi una caption che racconti la trasformazione di un cliente in modo credibile e motivante." },
    { label: "Prova gratuita", prompt: "Scrivi una caption per promuovere una prova gratuita di 7 giorni con CTA a DM o WhatsApp." },
    { label: "Recupero inattivi", prompt: "Scrivi una caption per riattivare clienti inattivi con una promo rientro limitata." },
  ],
  reel: [
    { label: "Promo estate", prompt: "Crea un Reel per annunciare una promo estate e spingere DM immediati." },
    { label: "Open day", prompt: "Crea un Reel per invitare le persone a un open day con visita e prova guidata." },
    { label: "Trasformazione cliente", prompt: "Crea un Reel storytelling su una trasformazione cliente prima/dopo." },
    { label: "Prova gratuita", prompt: "Crea un Reel per promuovere la prova gratuita di 7 giorni." },
    { label: "Recupero inattivi", prompt: "Crea un Reel per riportare in palestra clienti inattivi con una proposta semplice." },
  ],
  promo: [
    { label: "Promo estate", prompt: "Crea una promo estate per nuovi iscritti con urgenza chiara e valore percepito alto." },
    { label: "Open day", prompt: "Crea una promo open day con bonus iscrizione valido solo in giornata." },
    { label: "Trasformazione cliente", prompt: "Crea una promo che usi il risultato di un cliente come leva di conversione." },
    { label: "Prova gratuita", prompt: "Crea una promo commerciale per una prova gratuita di 7 giorni." },
    { label: "Recupero inattivi", prompt: "Crea una promo win-back per clienti inattivi con messaggio caldo e deciso." },
  ],
  sports_caption: [
    { label: "Promo weekend", prompt: "Scrivi una caption per promuovere il weekend con posti limitati e prenotazione veloce." },
    { label: "Compleanni", prompt: "Scrivi una caption per vendere pacchetti compleanno divertenti e facili da prenotare." },
    { label: "Team building", prompt: "Scrivi una caption per proporre un evento team building aziendale ad alto coinvolgimento." },
    { label: "Torneo", prompt: "Scrivi una caption per lanciare un torneo con iscrizioni aperte e CTA immediata." },
    { label: "Promo last minute", prompt: "Scrivi una caption per riempire slot liberi di questa settimana con urgenza chiara." },
  ],
  sports_reel_script: [
    { label: "Promo weekend", prompt: "Crea un Reel per promuovere il weekend e spingere prenotazioni immediate." },
    { label: "Compleanno", prompt: "Crea un Reel per mostrare l'esperienza compleanno in modo energico e social-first." },
    { label: "Team building", prompt: "Crea un Reel per aziende che vogliono un team building memorabile." },
    { label: "Torneo", prompt: "Crea un Reel per lanciare un torneo con ritmo rapido e CTA iscrizione." },
    { label: "Esperienza outdoor", prompt: "Crea un Reel per mostrare adrenalina, gruppo e atmosfera dell'attivita." },
  ],
  sports_promo: [
    { label: "Promo weekend", prompt: "Crea una promo commerciale per il weekend con valore chiaro e urgenza." },
    { label: "Compleanni", prompt: "Crea una promo per pacchetti compleanno con booking semplice e benefit evidenti." },
    { label: "Team building", prompt: "Crea una promo B2B per team building aziendale con tono professionale." },
    { label: "Prenotazione campi", prompt: "Crea una promo per prenotazioni campi infrasettimanali con incentivo immediato." },
    { label: "Recupero clienti inattivi", prompt: "Crea una promo win-back per clienti che non prenotano da tempo." },
  ],
  sports_client_message: [
    { label: "Reminder prenotazione", prompt: "Scrivi un messaggio WhatsApp per ricordare una prenotazione e ridurre i no-show." },
    { label: "Compleanno", prompt: "Scrivi un messaggio per proporre un pacchetto compleanno in modo diretto e coinvolgente." },
    { label: "Team building", prompt: "Scrivi un messaggio commerciale per aziende interessate a un team building." },
    { label: "Promo weekend", prompt: "Scrivi un messaggio WhatsApp per spingere una promo weekend con posti limitati." },
    { label: "Recupero clienti inattivi", prompt: "Scrivi un messaggio per riattivare clienti che non prenotano da settimane." },
  ],
  hair_caption: [
    { label: "Promo balayage", prompt: "Scrivi una caption premium per promuovere una promo balayage con posti limitati questa settimana." },
    { label: "Nuovo look estate", prompt: "Scrivi una caption emozionale per lanciare un nuovo look estate in salone." },
    { label: "Cambio colore", prompt: "Scrivi una caption social-first per promuovere un cambio colore stagionale." },
    { label: "Prima/Dopo", prompt: "Scrivi una caption per un prima/dopo capelli che spinga prenotazioni." },
    { label: "Offerta last minute", prompt: "Scrivi una caption per riempire gli slot last minute di domani." },
  ],
  hair_reel_script: [
    { label: "Reels trend", prompt: "Crea un Reel trend beauty per mostrare una trasformazione capelli con hook virale." },
    { label: "Barber fade", prompt: "Crea un Reel per promuovere un barber fade con stile moderno e CTA booking." },
    { label: "Trasformazione capelli", prompt: "Crea un Reel before/after per una trasformazione capelli premium." },
    { label: "Nuova cliente", prompt: "Crea un Reel per presentare l'esperienza di una nuova cliente in salone." },
    { label: "Promo piega", prompt: "Crea un Reel rapido per lanciare una promo piega di questa settimana." },
  ],
  hair_promo: [
    { label: "Promo piega", prompt: "Crea una promo commerciale per una piega smart con CTA prenotazione." },
    { label: "Cambio colore", prompt: "Crea una promo per cambio colore con focus booking e valore percepito." },
    { label: "Promo trattamenti", prompt: "Crea una promo per trattamenti capelli con tono premium e booking immediato." },
    { label: "Nuovo look estate", prompt: "Crea una promo estate per rinnovare il look con posti limitati." },
    { label: "Offerta last minute", prompt: "Crea una promo last minute per riempire due slot liberi oggi." },
  ],
  hair_client_message: [
    { label: "Nuova cliente", prompt: "Scrivi un messaggio WhatsApp per accogliere una nuova cliente e invitarla a prenotare." },
    { label: "Promo trattamenti", prompt: "Scrivi un messaggio clienti per promuovere un trattamento capelli premium." },
    { label: "Recupero clienti inattivi", prompt: "Scrivi un messaggio per riportare in salone clienti inattive con una proposta elegante." },
    { label: "Offerta last minute", prompt: "Scrivi un messaggio rapido per riempire slot last minute oggi." },
    { label: "Cambio colore", prompt: "Scrivi un messaggio WhatsApp per proporre un refresh colore stagionale." },
  ],
  hair_appointment_reminder: [
    { label: "Reminder appuntamento", prompt: "Scrivi un reminder appuntamento elegante e chiaro per WhatsApp." },
  ],
  hair_review_request: [
    { label: "Richiesta recensione", prompt: "Scrivi un messaggio post-servizio per chiedere una recensione cliente in modo naturale." },
  ],
  hair_stories_idea: [
    { label: "Prima/Dopo", prompt: "Crea un'idea Stories Instagram per mostrare un prima/dopo capelli." },
    { label: "Promo balayage", prompt: "Crea una sequenza Stories per promuovere il balayage." },
  ],
  hair_tiktok_hook: [
    { label: "TikTok hook virale", prompt: "Genera hook TikTok virali per un salone che mostra trasformazioni capelli." },
    { label: "Barber trend", prompt: "Genera hook TikTok per barber shop con fade e grooming." },
  ],
};

export function getQuickTemplatesForType(type: AIContentType) {
  return generatorQuickTemplates[type] ?? [];
}
