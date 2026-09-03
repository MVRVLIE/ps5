/*
 * База героев Dota 2 для подбора контрпиков.
 * attr: str | agi | int | all
 * atk: melee | ranged
 * weak (слабости героя, за что его можно "контрить"):
 *   invis        - полагается на невидимость
 *   activeReliant- сильно зависит от активных способностей/предметов (страдает от силенса)
 *   channeling   - имеет уязвимый ченнелящийся ульт
 *   auraPassive  - сила держится на пассивках/аурах (страдает от break-эффектов)
 *   physical     - основной урон физический (страдает от брони/armor reduction/evasion)
 *   magicBurst   - убивает магическим бурстом (страдает от magic resistance/spell immunity)
 *   squishy      - низкий запас HP, умирает от бурста
 *   immobile     - нет побега/блинка, уязвим к гэпклозерам и стану
 *   pokeReliant  - играет через дальний харасс (страдает от sustain/regen)
 *   illusion     - зависит от иллюзий (страдает от АОЕ/cleave)
 *   summons      - зависит от призывов (страдает от АОЕ)
 *   tanky        - живучий, но обычно медленный/уязвим к разгону брони или чистому урону
 * strong (сильные стороны, которыми герой контрит других):
 *   detection    - даёт обзор/детект невидимости
 *   silence      - силенсит
 *   breakEffect  - имеет break (снимает пассивки)
 *   burstPhys    - физический бурст
 *   burstMagic   - магический бурст
 *   spellImmune  - даёт/имеет иммунитет к магии
 *   tankyStr     - высокая живучесть/сложно убить бурстом
 *   gapCloser    - хороший гэпклозер/инициация
 *   longStun     - долгий контроль
 *   sustain      - лечение/реген
 *   aoe          - сильное АОЕ
 *   armorReduction - снижает броню
 *   evasion      - даёт уклонение
 *   trueStrike   - урон, игнорирующий уклонение
 *   antiPoke     - хорошо переживает харасс (реген/лечение/иммунитет)
 */

const HEROES = [
  // STRENGTH
  {id:"anti-mage", en:"Anti-Mage", ru:"Анти-маг", attr:"agi", atk:"melee", weak:["physical","immobile"], strong:["spellImmune","burstPhys","gapCloser"]},
  {id:"axe", en:"Axe", ru:"Топор", attr:"str", atk:"melee", weak:["immobile","physical"], strong:["gapCloser","longStun","tankyStr"]},
  {id:"bristleback", en:"Bristleback", ru:"Ежак", attr:"str", atk:"melee", weak:["physical"], strong:["tankyStr","sustain"]},
  {id:"centaur", en:"Centaur Warrunner", ru:"Кентавр", attr:"str", atk:"melee", weak:["immobile"], strong:["gapCloser","longStun","tankyStr"]},
  {id:"chaos-knight", en:"Chaos Knight", ru:"Рыцарь Хаоса", attr:"str", atk:"melee", weak:["illusion","physical"], strong:["burstPhys","gapCloser","tankyStr"]},
  {id:"clockwerk", en:"Clockwerk", ru:"Клокверк", attr:"str", atk:"melee", weak:["immobile"], strong:["gapCloser","longStun"]},
  {id:"dawnbreaker", en:"Dawnbreaker", ru:"Заря", attr:"str", atk:"melee", weak:["physical"], strong:["sustain","burstPhys","tankyStr"]},
  {id:"doom", en:"Doom", ru:"Дум", attr:"str", atk:"melee", weak:["immobile"], strong:["breakEffect","silence","gapCloser"]},
  {id:"dragon-knight", en:"Dragon Knight", ru:"Рыцарь Дракона", attr:"str", atk:"melee", weak:["physical"], strong:["tankyStr","burstMagic"]},
  {id:"earth-spirit", en:"Earth Spirit", ru:"Дух Земли", attr:"str", atk:"melee", weak:["immobile"], strong:["gapCloser","longStun"]},
  {id:"earthshaker", en:"Earthshaker", ru:"Землетряс", attr:"str", atk:"melee", weak:["immobile","channeling"], strong:["longStun","burstMagic","gapCloser"]},
  {id:"elder-titan", en:"Elder Titan", ru:"Древний Титан", attr:"str", atk:"melee", weak:["immobile"], strong:["longStun","gapCloser"]},
  {id:"huskar", en:"Huskar", ru:"Хускар", attr:"str", atk:"melee", weak:["magicBurst","squishy"], strong:["sustain","burstPhys"]},
  {id:"kunkka", en:"Kunkka", ru:"Кунка", attr:"str", atk:"melee", weak:["immobile"], strong:["longStun","aoe","gapCloser"]},
  {id:"legion-commander", en:"Legion Commander", ru:"Легион Командор", attr:"str", atk:"melee", weak:["immobile","physical"], strong:["gapCloser","burstPhys","longStun"]},
  {id:"lifestealer", en:"Lifestealer", ru:"Пожиратель Жизней", attr:"str", atk:"melee", weak:["magicBurst"], strong:["spellImmune","sustain","burstPhys"]},
  {id:"lycan", en:"Lycan", ru:"Ликан", attr:"str", atk:"melee", weak:["summons","physical"], strong:["aoe","burstPhys"]},
  {id:"magnus", en:"Magnus", ru:"Магнус", attr:"str", atk:"melee", weak:["immobile"], strong:["longStun","aoe","gapCloser"]},
  {id:"marci", en:"Marci", ru:"Марси", attr:"str", atk:"melee", weak:["immobile"], strong:["gapCloser","sustain","longStun"]},
  {id:"mars", en:"Mars", ru:"Марс", attr:"str", atk:"melee", weak:["immobile"], strong:["longStun","gapCloser","tankyStr"]},
  {id:"night-stalker", en:"Night Stalker", ru:"Ночной Сталкер", attr:"str", atk:"melee", weak:["immobile","squishy"], strong:["gapCloser","longStun"]},
  {id:"ogre-magi", en:"Ogre Magi", ru:"Огр Маги", attr:"str", atk:"melee", weak:["immobile"], strong:["longStun","burstMagic","tankyStr"]},
  {id:"omniknight", en:"Omniknight", ru:"Омникнайт", attr:"str", atk:"melee", weak:["physical"], strong:["sustain","spellImmune","tankyStr"]},
  {id:"primal-beast", en:"Primal Beast", ru:"Первородный Зверь", attr:"str", atk:"melee", weak:["immobile"], strong:["longStun","gapCloser","tankyStr"]},
  {id:"pudge", en:"Pudge", ru:"Пудж", attr:"str", atk:"melee", weak:["channeling","immobile"], strong:["longStun","gapCloser","tankyStr"]},
  {id:"sand-king", en:"Sand King", ru:"Песчаный Король", attr:"str", atk:"melee", weak:["immobile"], strong:["aoe","longStun","gapCloser"]},
  {id:"slardar", en:"Slardar", ru:"Слардар", attr:"str", atk:"melee", weak:["immobile"], strong:["detection","armorReduction","gapCloser"]},
  {id:"spirit-breaker", en:"Spirit Breaker", ru:"Спирит Брейкер", attr:"str", atk:"melee", weak:["immobile"], strong:["gapCloser","longStun"]},
  {id:"sven", en:"Sven", ru:"Свен", attr:"str", atk:"melee", weak:["physical"], strong:["burstPhys","longStun","tankyStr"]},
  {id:"tidehunter", en:"Tidehunter", ru:"Тайдхантер", attr:"str", atk:"melee", weak:["immobile"], strong:["aoe","longStun","tankyStr"]},
  {id:"timbersaw", en:"Timbersaw", ru:"Тимберсо", attr:"str", atk:"melee", weak:["physical"], strong:["burstMagic","tankyStr"]},
  {id:"tiny", en:"Tiny", ru:"Тайни", attr:"str", atk:"melee", weak:["physical"], strong:["burstMagic","longStun","gapCloser"]},
  {id:"treant", en:"Treant Protector", ru:"Древень", attr:"str", atk:"melee", weak:["invis","physical"], strong:["sustain","longStun"]},
  {id:"tusk", en:"Tusk", ru:"Тоск", attr:"str", atk:"melee", weak:["immobile"], strong:["gapCloser","longStun"]},
  {id:"underlord", en:"Underlord", ru:"Андерлорд", attr:"str", atk:"melee", weak:["immobile"], strong:["aoe","tankyStr","longStun"]},
  {id:"undying", en:"Undying", ru:"Андайинг", attr:"str", atk:"melee", weak:["physical"], strong:["tankyStr","sustain","breakEffect"]},
  {id:"wraith-king", en:"Wraith King", ru:"Король-Призрак", attr:"str", atk:"melee", weak:["physical"], strong:["tankyStr","longStun"]},
  {id:"abaddon", en:"Abaddon", ru:"Абаддон", attr:"str", atk:"melee", weak:["physical"], strong:["sustain","tankyStr"]},
  {id:"alchemist", en:"Alchemist", ru:"Алхимик", attr:"str", atk:"melee", weak:["physical"], strong:["burstPhys","tankyStr","sustain"]},
  {id:"beastmaster", en:"Beastmaster", ru:"Бистмастер", attr:"str", atk:"melee", weak:["summons"], strong:["aoe","longStun","gapCloser"]},
  {id:"brewmaster", en:"Brewmaster", ru:"Бруммастер", attr:"str", atk:"melee", weak:["channeling","immobile"], strong:["aoe","longStun","spellImmune"]},
  {id:"bloodseeker", en:"Bloodseeker", ru:"Кровочерп", attr:"agi", atk:"melee", weak:["immobile","physical"], strong:["gapCloser","burstPhys","antiPoke"]},

  // AGILITY
  {id:"arc-warden", en:"Arc Warden", ru:"Дуговой Страж", attr:"agi", atk:"ranged", weak:["squishy","physical"], strong:["burstMagic"]},
  {id:"bounty-hunter", en:"Bounty Hunter", ru:"Охотник за головами", attr:"agi", atk:"melee", weak:["invis","squishy"], strong:["detection","burstPhys","gapCloser"]},
  {id:"broodmother", en:"Broodmother", ru:"Мать выводка", attr:"agi", atk:"melee", weak:["summons","squishy"], strong:["aoe"]},
  {id:"clinkz", en:"Clinkz", ru:"Клинкз", attr:"agi", atk:"ranged", weak:["invis","squishy"], strong:["detection","burstPhys"]},
  {id:"drow-ranger", en:"Drow Ranger", ru:"Дроу Рейнджер", attr:"agi", atk:"ranged", weak:["squishy","physical","immobile"], strong:["burstPhys","gapCloser"]},
  {id:"ember-spirit", en:"Ember Spirit", ru:"Дух Огня", attr:"agi", atk:"melee", weak:["squishy"], strong:["gapCloser","burstMagic"]},
  {id:"faceless-void", en:"Faceless Void", ru:"Безликая Пустота", attr:"agi", atk:"melee", weak:["physical","channeling"], strong:["burstPhys","longStun","spellImmune"]},
  {id:"gyrocopter", en:"Gyrocopter", ru:"Гирокоптер", attr:"agi", atk:"ranged", weak:["squishy"], strong:["aoe","burstPhys"]},
  {id:"hoodwink", en:"Hoodwink", ru:"Хадвинк", attr:"agi", atk:"ranged", weak:["squishy","channeling"], strong:["longStun","burstPhys"]},
  {id:"juggernaut", en:"Juggernaut", ru:"Джаггернаут", attr:"agi", atk:"melee", weak:["physical"], strong:["spellImmune","burstPhys","evasion"]},
  {id:"luna", en:"Luna", ru:"Луна", attr:"agi", atk:"ranged", weak:["squishy","physical"], strong:["aoe","burstPhys"]},
  {id:"medusa", en:"Medusa", ru:"Медуза", attr:"agi", atk:"ranged", weak:["physical","immobile"], strong:["tankyStr","antiPoke","evasion"]},
  {id:"meepo", en:"Meepo", ru:"Мипо", attr:"agi", atk:"melee", weak:["squishy","aoe"], strong:["burstPhys","gapCloser"]},
  {id:"mirana", en:"Mirana", ru:"Мирана", attr:"agi", atk:"ranged", weak:["squishy","channeling"], strong:["longStun","gapCloser","burstPhys"]},
  {id:"monkey-king", en:"Monkey King", ru:"Царь Обезьян", attr:"agi", atk:"melee", weak:["squishy"], strong:["gapCloser","burstPhys","longStun"]},
  {id:"naga-siren", en:"Naga Siren", ru:"Нага Сирена", attr:"agi", atk:"melee", weak:["illusion"], strong:["aoe","longStun","antiPoke"]},
  {id:"morphling", en:"Morphling", ru:"Морфлинг", attr:"agi", atk:"ranged", weak:["squishy"], strong:["spellImmune","burstPhys","antiPoke"]},
  {id:"pangolier", en:"Pangolier", ru:"Панголье", attr:"agi", atk:"melee", weak:["squishy"], strong:["gapCloser","spellImmune","longStun"]},
  {id:"phantom-assassin", en:"Phantom Assassin", ru:"Фантом Ассассин", attr:"agi", atk:"melee", weak:["physical","immobile"], strong:["burstPhys","trueStrike"]},
  {id:"phantom-lancer", en:"Phantom Lancer", ru:"Фантом Лансер", attr:"agi", atk:"melee", weak:["illusion"], strong:["aoe","antiPoke"]},
  {id:"razor", en:"Razor", ru:"Бритва", attr:"agi", atk:"ranged", weak:["squishy"], strong:["antiPoke","burstPhys"]},
  {id:"riki", en:"Riki", ru:"Рики", attr:"agi", atk:"melee", weak:["invis","physical"], strong:["detection","burstPhys"]},
  {id:"shadow-fiend", en:"Shadow Fiend", ru:"Ночной Дьявол", attr:"agi", atk:"ranged", weak:["squishy","immobile"], strong:["burstMagic","gapCloser"]},
  {id:"slark", en:"Slark", ru:"Сларк", attr:"agi", atk:"melee", weak:["invis","physical"], strong:["detection","burstPhys","gapCloser"]},
  {id:"spectre", en:"Spectre", ru:"Спектр", attr:"agi", atk:"melee", weak:["illusion"], strong:["aoe","tankyStr","burstPhys"]},
  {id:"templar-assassin", en:"Templar Assassin", ru:"Тамплиер-Ассассин", attr:"agi", atk:"melee", weak:["squishy"], strong:["burstPhys","trueStrike"]},
  {id:"terrorblade", en:"Terrorblade", ru:"Ужас клинков", attr:"agi", atk:"ranged", weak:["illusion","physical"], strong:["aoe","burstPhys"]},
  {id:"troll-warlord", en:"Troll Warlord", ru:"Тролль-Военачальник", attr:"agi", atk:"melee", weak:["physical"], strong:["burstPhys","breakEffect"]},
  {id:"ursa", en:"Ursa", ru:"Урса", attr:"agi", atk:"melee", weak:["immobile","physical"], strong:["burstPhys","gapCloser","breakEffect"]},
  {id:"vengeful-spirit", en:"Vengeful Spirit", ru:"Мстительный Дух", attr:"agi", atk:"ranged", weak:["squishy"], strong:["armorReduction","gapCloser"]},
  {id:"venomancer", en:"Venomancer", ru:"Веномансер", attr:"agi", atk:"ranged", weak:["squishy"], strong:["aoe","antiPoke"]},
  {id:"viper", en:"Viper", ru:"Гадюка", attr:"agi", atk:"ranged", weak:["squishy","immobile"], strong:["antiPoke","gapCloser","burstPhys"]},
  {id:"weaver", en:"Weaver", ru:"Ткач", attr:"agi", atk:"ranged", weak:["invis","squishy"], strong:["detection","antiPoke"]},

  // INTELLIGENCE
  {id:"ancient-apparition", en:"Ancient Apparition", ru:"Древнее Видение", attr:"int", atk:"ranged", weak:["squishy","immobile"], strong:["burstMagic","antiPoke"]},
  {id:"bane", en:"Bane", ru:"Бейн", attr:"int", atk:"ranged", weak:["squishy","immobile"], strong:["silence","longStun"]},
  {id:"batrider", en:"Batrider", ru:"Батрайдер", attr:"int", atk:"melee", weak:["squishy"], strong:["gapCloser","longStun"]},
  {id:"chen", en:"Chen", ru:"Чен", attr:"int", atk:"ranged", weak:["summons","squishy"], strong:["sustain"]},
  {id:"crystal-maiden", en:"Crystal Maiden", ru:"Ледяная Дева", attr:"int", atk:"ranged", weak:["squishy","immobile"], strong:["longStun","aoe"]},
  {id:"dark-seer", en:"Dark Seer", ru:"Тёмный Провидец", attr:"int", atk:"melee", weak:["squishy"], strong:["aoe","gapCloser"]},
  {id:"dark-willow", en:"Dark Willow", ru:"Тёмная Ива", attr:"int", atk:"ranged", weak:["squishy"], strong:["silence","longStun"]},
  {id:"dazzle", en:"Dazzle", ru:"Даззл", attr:"int", atk:"ranged", weak:["squishy"], strong:["sustain","breakEffect"]},
  {id:"death-prophet", en:"Death Prophet", ru:"Пророчица Смерти", attr:"int", atk:"ranged", weak:["summons"], strong:["antiPoke","aoe"]},
  {id:"disruptor", en:"Disruptor", ru:"Дизраптор", attr:"int", atk:"ranged", weak:["squishy","immobile"], strong:["silence","longStun"]},
  {id:"enchantress", en:"Enchantress", ru:"Чародейка", attr:"int", atk:"ranged", weak:["squishy"], strong:["sustain","antiPoke"]},
  {id:"enigma", en:"Enigma", ru:"Энигма", attr:"int", atk:"melee", weak:["channeling","squishy"], strong:["aoe","longStun"]},
  {id:"grimstroke", en:"Grimstroke", ru:"Гримстроук", attr:"int", atk:"ranged", weak:["squishy","immobile"], strong:["silence","longStun"]},
  {id:"invoker", en:"Invoker", ru:"Инвокер", attr:"int", atk:"ranged", weak:["squishy","activeReliant"], strong:["burstMagic","longStun"]},
  {id:"jakiro", en:"Jakiro", ru:"Джакиро", attr:"int", atk:"ranged", weak:["squishy","immobile"], strong:["aoe","longStun"]},
  {id:"keeper-of-the-light", en:"Keeper of the Light", ru:"Хранитель Света", attr:"int", atk:"ranged", weak:["squishy","immobile"], strong:["burstMagic","aoe"]},
  {id:"leshrac", en:"Leshrac", ru:"Лешрак", attr:"int", atk:"ranged", weak:["squishy"], strong:["burstMagic","aoe"]},
  {id:"lich", en:"Lich", ru:"Лич", attr:"int", atk:"ranged", weak:["squishy","immobile"], strong:["aoe","antiPoke"]},
  {id:"lina", en:"Lina", ru:"Лина", attr:"int", atk:"ranged", weak:["squishy","immobile"], strong:["burstMagic","longStun"]},
  {id:"lion", en:"Lion", ru:"Лион", attr:"int", atk:"ranged", weak:["squishy","immobile"], strong:["silence","longStun","burstMagic"]},
  {id:"warlock", en:"Warlock", ru:"Ворлок", attr:"int", atk:"ranged", weak:["squishy","immobile"], strong:["longStun","sustain"]},
  {id:"muerta", en:"Muerta", ru:"Муэрта", attr:"agi", atk:"ranged", weak:["squishy"], strong:["burstMagic","detection"]},
  {id:"nature-prophet", en:"Nature's Prophet", ru:"Пророк Природы", attr:"int", atk:"ranged", weak:["summons"], strong:["aoe","antiPoke"]},
  {id:"necrophos", en:"Necrophos", ru:"Некрофос", attr:"int", atk:"ranged", weak:["squishy"], strong:["breakEffect","tankyStr","antiPoke"]},
  {id:"oracle", en:"Oracle", ru:"Оракул", attr:"int", atk:"ranged", weak:["squishy","immobile"], strong:["sustain","spellImmune"]},
  {id:"outworld-destroyer", en:"Outworld Destroyer", ru:"Разрушитель Иного Мира", attr:"int", atk:"ranged", weak:["squishy"], strong:["burstMagic","silence"]},
  {id:"puck", en:"Puck", ru:"Пак", attr:"int", atk:"ranged", weak:["squishy"], strong:["gapCloser","burstMagic"]},
  {id:"pugna", en:"Pugna", ru:"Пугна", attr:"int", atk:"ranged", weak:["squishy","immobile"], strong:["burstMagic","antiPoke"]},
  {id:"queen-of-pain", en:"Queen of Pain", ru:"Королева Боли", attr:"int", atk:"ranged", weak:["squishy"], strong:["burstMagic","gapCloser"]},
  {id:"rubick", en:"Rubick", ru:"Рубик", attr:"int", atk:"ranged", weak:["squishy","immobile"], strong:["silence","longStun"]},
  {id:"shadow-demon", en:"Shadow Demon", ru:"Демон Тени", attr:"int", atk:"ranged", weak:["squishy","immobile"], strong:["silence","longStun"]},
  {id:"shadow-shaman", en:"Shadow Shaman", ru:"Шаман Тени", attr:"int", atk:"ranged", weak:["squishy","immobile","summons"], strong:["longStun","aoe"]},
  {id:"silencer", en:"Silencer", ru:"Молчун", attr:"int", atk:"ranged", weak:["squishy"], strong:["silence","antiPoke"]},
  {id:"skywrath-mage", en:"Skywrath Mage", ru:"Небесный Маг", attr:"int", atk:"ranged", weak:["squishy","immobile"], strong:["silence","burstMagic"]},
  {id:"storm-spirit", en:"Storm Spirit", ru:"Дух Бури", attr:"int", atk:"melee", weak:["activeReliant","squishy"], strong:["gapCloser","spellImmune"]},
  {id:"tinker", en:"Tinker", ru:"Тинкер", attr:"int", atk:"ranged", weak:["squishy","activeReliant","immobile"], strong:["burstMagic"]},
  {id:"visage", en:"Visage", ru:"Визаж", attr:"int", atk:"ranged", weak:["summons"], strong:["aoe","tankyStr"]},
  {id:"void-spirit", en:"Void Spirit", ru:"Дух Пустоты", attr:"int", atk:"melee", weak:["squishy"], strong:["gapCloser","burstMagic","silence"]},
  {id:"windranger", en:"Windranger", ru:"Виндраннер", attr:"int", atk:"ranged", weak:["squishy"], strong:["silence","longStun"]},
  {id:"winter-wyvern", en:"Winter Wyvern", ru:"Зимний Виверн", attr:"int", atk:"ranged", weak:["squishy","immobile"], strong:["sustain","spellImmune"]},
  {id:"witch-doctor", en:"Witch Doctor", ru:"Знахарь", attr:"int", atk:"ranged", weak:["squishy","immobile","channeling"], strong:["longStun","aoe"]},
  {id:"zeus", en:"Zeus", ru:"Зевс", attr:"int", atk:"ranged", weak:["squishy"], strong:["burstMagic","aoe"]},

  // UNIVERSAL / OTHERS
  {id:"io", en:"Io", ru:"Ио", attr:"all", atk:"ranged", weak:["squishy"], strong:["sustain","gapCloser"]},
  {id:"nyx-assassin", en:"Nyx Assassin", ru:"Никс Ассассин", attr:"all", atk:"melee", weak:["invis"], strong:["silence","detection","burstMagic"]},
  {id:"snapfire", en:"Snapfire", ru:"Снэпфаер", attr:"all", atk:"ranged", weak:["squishy"], strong:["longStun","burstMagic"]},
  {id:"techies", en:"Techies", ru:"Техиз", attr:"all", atk:"ranged", weak:["squishy","immobile"], strong:["burstMagic","longStun"]},
  {id:"sniper", en:"Sniper", ru:"Снайпер", attr:"agi", atk:"ranged", weak:["squishy","immobile"], strong:["antiPoke","burstPhys"]}
];

// Ключевые контрпики "по знаниям меты" — приоритетнее эвристики.
// Формат: enemyId: [{id, reason}]
const CURATED_COUNTERS = {
  "anti-mage": [
    {id:"axe", reason:"Клич берсерка заставляет Анти-мага драться в ближнем бою, где он слаб"},
    {id:"legion-commander", reason:"Дуэль и Петля крови убивают Анти-мага до того, как он разгонится"},
    {id:"night-stalker", reason:"Ночью резко ловит Анти-мага без побега"},
    {id:"bloodseeker", reason:"Разрыв не даёт заблинковать и убежать"}
  ],
  "phantom-assassin": [
    {id:"nyx-assassin", reason:"Сжигание маны и Пронзание ловят Фантом Ассассина сквозь Смаз"},
    {id:"bristleback", reason:"Много брони и урон, который не зависит от критов"},
    {id:"lion", reason:"Долгий стан+силенс убивают Фантом Ассассина до крита"},
    {id:"axe", reason:"Клич гарантированно ловит и заставляет драться"}
  ],
  "juggernaut": [
    {id:"axe", reason:"Клич берсерка ловит даже в Клинковый вихрь (не прерывает, но фиксирует после)"},
    {id:"lion", reason:"Стан+силенс до Всесечение или сразу после"},
    {id:"bane", reason:"Хватка исчадия убивает сквозь Клинковый вихрь"},
    {id:"disruptor", reason:"Проблеск отменяет позиционирование к Всесечение"}
  ],
  "riki": [
    {id:"bounty-hunter", reason:"Слежка и обзор снимают невидимость"},
    {id:"slardar", reason:"Усиление урона раскрывает Рики"},
    {id:"nyx-assassin", reason:"Пронзание ловит из вижена, силенс не даёт активок"}
  ],
  "slark": [
    {id:"nyx-assassin", reason:"Пронзание и Сжигание маны ловят и обнуляют ману"},
    {id:"bloodseeker", reason:"Разрыв ловит побег после Прыжка"},
    {id:"legion-commander", reason:"Дуэль не даёт Сларку выйти из боя"},
    {id:"axe", reason:"Клич фиксирует в бою"}
  ],
  "storm-spirit": [
    {id:"axe", reason:"Клич достаёт при выходе из Шаровая молния"},
    {id:"bloodseeker", reason:"Жажда крови и Разрыв ловят на переходах"},
    {id:"silencer", reason:"Глобальное безмолвие обнуляет мобильность Шторма"},
    {id:"nyx-assassin", reason:"Сжигание маны лишает маны на способности"}
  ],
  "templar-assassin": [
    {id:"bounty-hunter", reason:"Обзор и Слежка снимают Слияние/невидимость"},
    {id:"earthshaker", reason:"АОЕ стан ловит несмотря на Рефракция"},
    {id:"axe", reason:"Клич снимает заряды Рефракция моментально"}
  ],
  "medusa": [
    {id:"silencer", reason:"Глобальное безмолвие не даёт использовать Веерный выстрел/Каменный взгляд"},
    {id:"doom", reason:"Дум режет пассивки и не даёт кастовать"},
    {id:"bloodseeker", reason:"Разрыв обходит Щит маны по механике позиционирования"}
  ],
  "spectre": [
    {id:"axe", reason:"Прерывает фарм иллюзий давлением, Клич фиксирует"},
    {id:"phantom-lancer", reason:"У Спектр слаб пуш на линии от иллюзий ПЛ"},
    {id:"bloodseeker", reason:"Разрыв убивает даже сквозь Рассеивание"}
  ],
  "faceless-void": [
    {id:"silencer", reason:"Не даёт войти в Хроносферу с способностями"},
    {id:"disruptor", reason:"Проблеск и Статический шторм снимают преимущество тайминга"},
    {id:"morphling", reason:"Иммунитет к магии игнорирует контроль в Хроне"}
  ],
  "terrorblade": [
    {id:"axe", reason:"Убивает иллюзии и давит на линии"},
    {id:"necrophos", reason:"Коса жнеца добивает по проценту здоровья"},
    {id:"doom", reason:"Брейк снимает эффекты Метаморфозы"}
  ],
  "invoker": [
    {id:"silencer", reason:"Глобальное безмолвие полностью выключает комбо"},
    {id:"nyx-assassin", reason:"Сжигание маны лишает маны на комбо-каст"},
    {id:"axe", reason:"Быстрая инициация не даёт откастовать"}
  ],
  "tinker": [
    {id:"silencer", reason:"Силенс и обнуление активок ломают ротацию"},
    {id:"nyx-assassin", reason:"Сжигание маны выжигает ману на телепорты"},
    {id:"anti-mage", reason:"Разрушение маны истощает ману, а рывок догоняет"}
  ],
  "shadow-fiend": [
    {id:"axe", reason:"Быстрая инициация не даёт откастовать Реквием душ"},
    {id:"nyx-assassin", reason:"Пронзание и силенс ловят перед Реквием душ"},
    {id:"bristleback", reason:"Много здоровья и брони против физического урона Ночного Дьявола"}
  ],
  "puck": [
    {id:"nyx-assassin", reason:"Пронзание ловит сквозь Смещение фазы"},
    {id:"lion", reason:"Долгий стан фиксирует эфемерную Пак"}
  ],
  "morphling": [
    {id:"viper", reason:"Эфирный яд снимает атрибуты и спелл иммунитет"},
    {id:"silencer", reason:"Силенс не даёт вафлить и лечиться"},
    {id:"doom", reason:"Дум запрещает использование способностей"}
  ],
  "pudge": [
    {id:"bloodseeker", reason:"Видит низкое здоровье и добивает Разрыв"},
    {id:"windranger", reason:"Прицельный огонь убивает быстро"},
    {id:"silencer", reason:"Не даёт кастовать хук на подходе"}
  ],
  "lifestealer": [
    {id:"viper", reason:"Эфирный яд отключает иммунитет к магии"},
    {id:"necrophos", reason:"Коса жнеца добивает по % здоровья несмотря на реген"},
    {id:"dazzle", reason:"Неглубокую могилу не даёт добить, но лечение Лайфа рушится под ним же"}
  ],
  "bristleback": [
    {id:"doom", reason:"Брейк убирает Разброс игл и другие пассивки Ежака"},
    {id:"silencer", reason:"Не даёт разворачиваться спиной корректно через контроль"},
    {id:"viper", reason:"Эфирный яд режет броню и снимает баффы"}
  ],
  "huskar": [
    {id:"lion", reason:"Магический бурст добивает низкий запас здоровья Хускара"},
    {id:"skywrath-mage", reason:"Чистый магический урон убивает несмотря на резист"},
    {id:"necrophos", reason:"Коса жнеца игнорирует физ. резисты Хускара"}
  ],
  "chaos-knight": [
    {id:"axe", reason:"АОЕ снимает иллюзии, Клич ловит оригинал"},
    {id:"necrophos", reason:"Урон по % здоровья не зависит от брони и крита"}
  ],
  "naga-siren": [
    {id:"axe", reason:"Прерывает фарм иллюзий давлением"},
    {id:"lion", reason:"Стан не даёт уйти в Песнь сирены вовремя"}
  ],
  "broodmother": [
    {id:"bounty-hunter", reason:"Обзор и Слежка снимают невидимость пауков"},
    {id:"axe", reason:"АОЕ Клинок жатвы добивает пауков и саму Брудмать"}
  ],
  "clinkz": [
    {id:"bounty-hunter", reason:"Слежка снимает невидимость"},
    {id:"nyx-assassin", reason:"Пронзание ловит из вижена"}
  ],
  "weaver": [
    {id:"bounty-hunter", reason:"Обзор и Слежка ограничивают побег"},
    {id:"silencer", reason:"Не даёт использовать Сюкути/Отскок во времени эффективно"}
  ],
  "meepo": [
    {id:"earthshaker", reason:"Гулкий удар уничтожает всех клонов разом"},
    {id:"tidehunter", reason:"Опустошение сносит всю пачку меп"},
    {id:"sand-king", reason:"Эпицентр бьёт по всем клонам"}
  ],
  "arc-warden": [
    {id:"axe", reason:"Быстро убивает Стража/клона до разгона"},
    {id:"bloodseeker", reason:"Разрыв не даёт кайтить клоном"}
  ],
  "drow-ranger": [
    {id:"axe", reason:"Клич не даёт стрелять и заставляет драться"},
    {id:"clockwerk", reason:"Гэпклозер+стан не дают удерживать дистанцию"}
  ],
  "sniper": [
    {id:"axe", reason:"Мгновенная инициация не даёт держать дистанцию"},
    {id:"clockwerk", reason:"Прыжок в лицо и стан"},
    {id:"nyx-assassin", reason:"Пронзание из вижена ловит на любой дистанции"}
  ],
  "windranger": [
    {id:"axe", reason:"Быстрая инициация не даёт откастовать Прицельный огонь"},
    {id:"nyx-assassin", reason:"Сжигание маны и стан ломают комбо"}
  ],
  "zeus": [
    {id:"silencer", reason:"Глобальное безмолвие полностью выключает урон"},
    {id:"nyx-assassin", reason:"Сжигание маны лишает маны на нюки"},
    {id:"anti-mage", reason:"Щит от заклинаний и Разрушение маны душат Зевса"}
  ],
  "lina": [
    {id:"axe", reason:"Быстрая инициация не даёт откастовать комбо"},
    {id:"nyx-assassin", reason:"Пронзание и силенс ловят до нюков"}
  ],
  "skywrath-mage": [
    {id:"axe", reason:"Быстрая инициация убивает хрупкого героя"},
    {id:"nyx-assassin", reason:"Силенс снимает Печать древних и нюки"}
  ],
  "queen-of-pain": [
    {id:"nyx-assassin", reason:"Пронзание ловит сквозь блинк"},
    {id:"axe", reason:"Клич не даёт уйти в блинк"}
  ],
  "necrophos": [
    {id:"silencer", reason:"Силенс не даёт откастовать ульт"},
    {id:"anti-mage", reason:"Щит от заклинаний снижает магический урон, а Разрушение маны истощает ману"}
  ],
  "enigma": [
    {id:"silencer", reason:"Не даёт откастовать Чёрную дыру"},
    {id:"nyx-assassin", reason:"Прерывает ченнелинг ульта станом"},
    {id:"axe", reason:"Быстрая инициация ловит до Чёрную дыру"}
  ],
  "tidehunter": [
    {id:"silencer", reason:"Не даёт откастовать Опустошение"},
    {id:"nyx-assassin", reason:"Станит и прерывает подготовку к ульту"}
  ],
  "magnus": [
    {id:"silencer", reason:"Не даёт использовать Разворот полярности"},
    {id:"nyx-assassin", reason:"Ловит до инициации станом"}
  ],
  "earthshaker": [
    {id:"nyx-assassin", reason:"Прерывает ченнелинг Гулкого удара"},
    {id:"silencer", reason:"Не даёт откастовать ульт"}
  ],
  "witch-doctor": [
    {id:"nyx-assassin", reason:"Прерывает Дозорного смерти станом"},
    {id:"axe", reason:"Быстрая инициация до каста"}
  ],
  "shadow-shaman": [
    {id:"nyx-assassin", reason:"Ловит до серии станов"},
    {id:"axe", reason:"Быстрая инициация"}
  ],
  "outworld-destroyer": [
    {id:"anti-mage", reason:"Щит от заклинаний режет магический урон Разрушителя"},
    {id:"axe", reason:"Быстрая инициация ловит хрупкого героя"}
  ],
  "leshrac": [
    {id:"axe", reason:"Быстрая инициация убивает хрупкого героя"},
    {id:"anti-mage", reason:"Щит от заклинаний снижает магический урон"}
  ],
  "pugna": [
    {id:"axe", reason:"Быстрая инициация не даёт использовать Эфирного стража"},
    {id:"anti-mage", reason:"Разрушение маны контрит манозависимость"}
  ],
  "death-prophet": [
    {id:"axe", reason:"Убивает призраков и саму ДП"},
    {id:"doom", reason:"Брейк снимает Похищение духа"}
  ],
  "beastmaster": [
    {id:"axe", reason:"АОЕ убивает призывы"},
    {id:"doom", reason:"Дум выключает героя из боя"}
  ],
  "lycan": [
    {id:"axe", reason:"АОЕ убивает волков"},
    {id:"doom", reason:"Дум выключает из боя целиком"}
  ],
  "visage": [
    {id:"axe", reason:"АОЕ убивает фамильяров"},
  ],
  "nature-prophet": [
    {id:"axe", reason:"Быстро убивает трипсы"},
    {id:"bounty-hunter", reason:"Слежка находит НП на телепорте"}
  ],
  "io": [
    {id:"nyx-assassin", reason:"Сжигание маны и стан ловят несмотря на Перемещение"},
    {id:"axe", reason:"Клич фиксирует перед Перемещение"}
  ],
  "dark-willow": [
    {id:"nyx-assassin", reason:"Силенс не даёт откастовать"},
    {id:"axe", reason:"Быстрая инициация"}
  ],
  "rubick": [
    {id:"nyx-assassin", reason:"Силенс не даёт украсть заклинание"},
    {id:"axe", reason:"Быстрая инициация"}
  ],
  "keeper-of-the-light": [
    {id:"axe", reason:"Быстро убивает хрупкого КОТЛ"},
    {id:"nyx-assassin", reason:"Сжигание маны лишает маны"}
  ],
  "ancient-apparition": [
    {id:"axe", reason:"Быстрая инициация до Ледяной снаряд"},
    {id:"nyx-assassin", reason:"Силенс не даёт откастовать"}
  ],
  "batrider": [
    {id:"silencer", reason:"Не даёт использовать Огненное лассо"},
    {id:"nyx-assassin", reason:"Прерывает подготовку станом"}
  ],
  "void-spirit": [
    {id:"nyx-assassin", reason:"Пронзание ловит сквозь Разделение"},
    {id:"silencer", reason:"Силенс не даёт разгоняться порталами"}
  ]
};
