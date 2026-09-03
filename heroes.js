/*
 * Dota 2 hero database for the counter-pick tool.
 * attr: str | agi | int | all
 * atk: melee | ranged
 * weak (what makes the hero counterable):
 *   invis        - relies on invisibility
 *   activeReliant- heavily dependent on active abilities/items (hurt by silence)
 *   channeling   - has a vulnerable channeled ultimate
 *   auraPassive  - power comes from passives/auras (hurt by break effects)
 *   physical     - deals mostly physical damage (hurt by armor/armor reduction/evasion)
 *   magicBurst   - kills with magic burst (hurt by magic resistance/spell immunity)
 *   squishy      - low HP pool, dies to burst
 *   immobile     - no escape/blink, vulnerable to gap-closers and stuns
 *   pokeReliant  - plays through long-range harass (hurt by sustain/regen)
 *   illusion     - relies on illusions (hurt by AOE/cleave)
 *   summons      - relies on summoned units (hurt by AOE)
 *   tanky        - durable but usually slow/vulnerable to armor shred or pure damage
 * strong (what the hero uses to counter others):
 *   detection    - grants vision/true sight
 *   silence      - silences
 *   breakEffect  - has Break (removes passives)
 *   burstPhys    - physical burst
 *   burstMagic   - magical burst
 *   spellImmune  - grants/has spell immunity
 *   tankyStr     - very durable, hard to burst down
 *   gapCloser    - strong gap-closer/initiator
 *   longStun     - long-lasting control
 *   sustain      - healing/regen
 *   aoe          - strong area damage
 *   armorReduction - reduces armor
 *   evasion      - grants evasion
 *   trueStrike   - damage that ignores evasion
 *   antiPoke     - shrugs off harass (regen/lifesteal/immunity)
 */

const HEROES = [
  // STRENGTH
  {id:"anti-mage", en:"Anti-Mage", attr:"agi", atk:"melee", weak:["physical","immobile"], strong:["spellImmune","burstPhys","gapCloser"]},
  {id:"axe", en:"Axe", attr:"str", atk:"melee", weak:["immobile","physical"], strong:["gapCloser","longStun","tankyStr"]},
  {id:"bristleback", en:"Bristleback", attr:"str", atk:"melee", weak:["physical"], strong:["tankyStr","sustain"]},
  {id:"centaur", en:"Centaur Warrunner", attr:"str", atk:"melee", weak:["immobile"], strong:["gapCloser","longStun","tankyStr"]},
  {id:"chaos-knight", en:"Chaos Knight", attr:"str", atk:"melee", weak:["illusion","physical"], strong:["burstPhys","gapCloser","tankyStr"]},
  {id:"clockwerk", en:"Clockwerk", attr:"str", atk:"melee", weak:["immobile"], strong:["gapCloser","longStun"]},
  {id:"dawnbreaker", en:"Dawnbreaker", attr:"str", atk:"melee", weak:["physical"], strong:["sustain","burstPhys","tankyStr"]},
  {id:"doom", en:"Doom", attr:"str", atk:"melee", weak:["immobile"], strong:["breakEffect","silence","gapCloser"]},
  {id:"dragon-knight", en:"Dragon Knight", attr:"str", atk:"melee", weak:["physical"], strong:["tankyStr","burstMagic"]},
  {id:"earth-spirit", en:"Earth Spirit", attr:"str", atk:"melee", weak:["immobile"], strong:["gapCloser","longStun"]},
  {id:"earthshaker", en:"Earthshaker", attr:"str", atk:"melee", weak:["immobile","channeling"], strong:["longStun","burstMagic","gapCloser"]},
  {id:"elder-titan", en:"Elder Titan", attr:"str", atk:"melee", weak:["immobile"], strong:["longStun","gapCloser"]},
  {id:"huskar", en:"Huskar", attr:"str", atk:"melee", weak:["magicBurst","squishy"], strong:["sustain","burstPhys"]},
  {id:"kunkka", en:"Kunkka", attr:"str", atk:"melee", weak:["immobile"], strong:["longStun","aoe","gapCloser"]},
  {id:"legion-commander", en:"Legion Commander", attr:"str", atk:"melee", weak:["immobile","physical"], strong:["gapCloser","burstPhys","longStun"]},
  {id:"lifestealer", en:"Lifestealer", attr:"str", atk:"melee", weak:["magicBurst"], strong:["spellImmune","sustain","burstPhys"]},
  {id:"lycan", en:"Lycan", attr:"str", atk:"melee", weak:["summons","physical"], strong:["aoe","burstPhys"]},
  {id:"magnus", en:"Magnus", attr:"str", atk:"melee", weak:["immobile"], strong:["longStun","aoe","gapCloser"]},
  {id:"marci", en:"Marci", attr:"str", atk:"melee", weak:["immobile"], strong:["gapCloser","sustain","longStun"]},
  {id:"mars", en:"Mars", attr:"str", atk:"melee", weak:["immobile"], strong:["longStun","gapCloser","tankyStr"]},
  {id:"night-stalker", en:"Night Stalker", attr:"str", atk:"melee", weak:["immobile","squishy"], strong:["gapCloser","longStun"]},
  {id:"ogre-magi", en:"Ogre Magi", attr:"str", atk:"melee", weak:["immobile"], strong:["longStun","burstMagic","tankyStr"]},
  {id:"omniknight", en:"Omniknight", attr:"str", atk:"melee", weak:["physical"], strong:["sustain","spellImmune","tankyStr"]},
  {id:"primal-beast", en:"Primal Beast", attr:"str", atk:"melee", weak:["immobile"], strong:["longStun","gapCloser","tankyStr"]},
  {id:"pudge", en:"Pudge", attr:"str", atk:"melee", weak:["channeling","immobile"], strong:["longStun","gapCloser","tankyStr"]},
  {id:"sand-king", en:"Sand King", attr:"str", atk:"melee", weak:["immobile"], strong:["aoe","longStun","gapCloser"]},
  {id:"slardar", en:"Slardar", attr:"str", atk:"melee", weak:["immobile"], strong:["detection","armorReduction","gapCloser"]},
  {id:"spirit-breaker", en:"Spirit Breaker", attr:"str", atk:"melee", weak:["immobile"], strong:["gapCloser","longStun"]},
  {id:"sven", en:"Sven", attr:"str", atk:"melee", weak:["physical"], strong:["burstPhys","longStun","tankyStr"]},
  {id:"tidehunter", en:"Tidehunter", attr:"str", atk:"melee", weak:["immobile"], strong:["aoe","longStun","tankyStr"]},
  {id:"timbersaw", en:"Timbersaw", attr:"str", atk:"melee", weak:["physical"], strong:["burstMagic","tankyStr"]},
  {id:"tiny", en:"Tiny", attr:"str", atk:"melee", weak:["physical"], strong:["burstMagic","longStun","gapCloser"]},
  {id:"treant", en:"Treant Protector", attr:"str", atk:"melee", weak:["invis","physical"], strong:["sustain","longStun"]},
  {id:"tusk", en:"Tusk", attr:"str", atk:"melee", weak:["immobile"], strong:["gapCloser","longStun"]},
  {id:"underlord", en:"Underlord", attr:"str", atk:"melee", weak:["immobile"], strong:["aoe","tankyStr","longStun"]},
  {id:"undying", en:"Undying", attr:"str", atk:"melee", weak:["physical"], strong:["tankyStr","sustain","breakEffect"]},
  {id:"wraith-king", en:"Wraith King", attr:"str", atk:"melee", weak:["physical"], strong:["tankyStr","longStun"]},
  {id:"abaddon", en:"Abaddon", attr:"str", atk:"melee", weak:["physical"], strong:["sustain","tankyStr"]},
  {id:"alchemist", en:"Alchemist", attr:"str", atk:"melee", weak:["physical"], strong:["burstPhys","tankyStr","sustain"]},
  {id:"beastmaster", en:"Beastmaster", attr:"str", atk:"melee", weak:["summons"], strong:["aoe","longStun","gapCloser"]},
  {id:"brewmaster", en:"Brewmaster", attr:"str", atk:"melee", weak:["channeling","immobile"], strong:["aoe","longStun","spellImmune"]},
  {id:"bloodseeker", en:"Bloodseeker", attr:"agi", atk:"melee", weak:["immobile","physical"], strong:["gapCloser","burstPhys","antiPoke"]},

  // AGILITY
  {id:"arc-warden", en:"Arc Warden", attr:"agi", atk:"ranged", weak:["squishy","physical"], strong:["burstMagic"]},
  {id:"bounty-hunter", en:"Bounty Hunter", attr:"agi", atk:"melee", weak:["invis","squishy"], strong:["detection","burstPhys","gapCloser"]},
  {id:"broodmother", en:"Broodmother", attr:"agi", atk:"melee", weak:["summons","squishy"], strong:["aoe"]},
  {id:"clinkz", en:"Clinkz", attr:"agi", atk:"ranged", weak:["invis","squishy"], strong:["detection","burstPhys"]},
  {id:"drow-ranger", en:"Drow Ranger", attr:"agi", atk:"ranged", weak:["squishy","physical","immobile"], strong:["burstPhys","gapCloser"]},
  {id:"ember-spirit", en:"Ember Spirit", attr:"agi", atk:"melee", weak:["squishy"], strong:["gapCloser","burstMagic"]},
  {id:"faceless-void", en:"Faceless Void", attr:"agi", atk:"melee", weak:["physical","channeling"], strong:["burstPhys","longStun","spellImmune"]},
  {id:"gyrocopter", en:"Gyrocopter", attr:"agi", atk:"ranged", weak:["squishy"], strong:["aoe","burstPhys"]},
  {id:"hoodwink", en:"Hoodwink", attr:"agi", atk:"ranged", weak:["squishy","channeling"], strong:["longStun","burstPhys"]},
  {id:"juggernaut", en:"Juggernaut", attr:"agi", atk:"melee", weak:["physical"], strong:["spellImmune","burstPhys","evasion"]},
  {id:"luna", en:"Luna", attr:"agi", atk:"ranged", weak:["squishy","physical"], strong:["aoe","burstPhys"]},
  {id:"medusa", en:"Medusa", attr:"agi", atk:"ranged", weak:["physical","immobile"], strong:["tankyStr","antiPoke","evasion"]},
  {id:"meepo", en:"Meepo", attr:"agi", atk:"melee", weak:["squishy","aoe"], strong:["burstPhys","gapCloser"]},
  {id:"mirana", en:"Mirana", attr:"agi", atk:"ranged", weak:["squishy","channeling"], strong:["longStun","gapCloser","burstPhys"]},
  {id:"monkey-king", en:"Monkey King", attr:"agi", atk:"melee", weak:["squishy"], strong:["gapCloser","burstPhys","longStun"]},
  {id:"naga-siren", en:"Naga Siren", attr:"agi", atk:"melee", weak:["illusion"], strong:["aoe","longStun","antiPoke"]},
  {id:"morphling", en:"Morphling", attr:"agi", atk:"ranged", weak:["squishy"], strong:["spellImmune","burstPhys","antiPoke"]},
  {id:"pangolier", en:"Pangolier", attr:"agi", atk:"melee", weak:["squishy"], strong:["gapCloser","spellImmune","longStun"]},
  {id:"phantom-assassin", en:"Phantom Assassin", attr:"agi", atk:"melee", weak:["physical","immobile"], strong:["burstPhys","trueStrike"]},
  {id:"phantom-lancer", en:"Phantom Lancer", attr:"agi", atk:"melee", weak:["illusion"], strong:["aoe","antiPoke"]},
  {id:"razor", en:"Razor", attr:"agi", atk:"ranged", weak:["squishy"], strong:["antiPoke","burstPhys"]},
  {id:"riki", en:"Riki", attr:"agi", atk:"melee", weak:["invis","physical"], strong:["detection","burstPhys"]},
  {id:"shadow-fiend", en:"Shadow Fiend", attr:"agi", atk:"ranged", weak:["squishy","immobile"], strong:["burstMagic","gapCloser"]},
  {id:"slark", en:"Slark", attr:"agi", atk:"melee", weak:["invis","physical"], strong:["detection","burstPhys","gapCloser"]},
  {id:"spectre", en:"Spectre", attr:"agi", atk:"melee", weak:["illusion"], strong:["aoe","tankyStr","burstPhys"]},
  {id:"templar-assassin", en:"Templar Assassin", attr:"agi", atk:"melee", weak:["squishy"], strong:["burstPhys","trueStrike"]},
  {id:"terrorblade", en:"Terrorblade", attr:"agi", atk:"ranged", weak:["illusion","physical"], strong:["aoe","burstPhys"]},
  {id:"troll-warlord", en:"Troll Warlord", attr:"agi", atk:"melee", weak:["physical"], strong:["burstPhys","breakEffect"]},
  {id:"ursa", en:"Ursa", attr:"agi", atk:"melee", weak:["immobile","physical"], strong:["burstPhys","gapCloser","breakEffect"]},
  {id:"vengeful-spirit", en:"Vengeful Spirit", attr:"agi", atk:"ranged", weak:["squishy"], strong:["armorReduction","gapCloser"]},
  {id:"venomancer", en:"Venomancer", attr:"agi", atk:"ranged", weak:["squishy"], strong:["aoe","antiPoke"]},
  {id:"viper", en:"Viper", attr:"agi", atk:"ranged", weak:["squishy","immobile"], strong:["antiPoke","gapCloser","burstPhys"]},
  {id:"weaver", en:"Weaver", attr:"agi", atk:"ranged", weak:["invis","squishy"], strong:["detection","antiPoke"]},

  // INTELLIGENCE
  {id:"ancient-apparition", en:"Ancient Apparition", attr:"int", atk:"ranged", weak:["squishy","immobile"], strong:["burstMagic","antiPoke"]},
  {id:"bane", en:"Bane", attr:"int", atk:"ranged", weak:["squishy","immobile"], strong:["silence","longStun"]},
  {id:"batrider", en:"Batrider", attr:"int", atk:"melee", weak:["squishy"], strong:["gapCloser","longStun"]},
  {id:"chen", en:"Chen", attr:"int", atk:"ranged", weak:["summons","squishy"], strong:["sustain"]},
  {id:"crystal-maiden", en:"Crystal Maiden", attr:"int", atk:"ranged", weak:["squishy","immobile"], strong:["longStun","aoe"]},
  {id:"dark-seer", en:"Dark Seer", attr:"int", atk:"melee", weak:["squishy"], strong:["aoe","gapCloser"]},
  {id:"dark-willow", en:"Dark Willow", attr:"int", atk:"ranged", weak:["squishy"], strong:["silence","longStun"]},
  {id:"dazzle", en:"Dazzle", attr:"int", atk:"ranged", weak:["squishy"], strong:["sustain","breakEffect"]},
  {id:"death-prophet", en:"Death Prophet", attr:"int", atk:"ranged", weak:["summons"], strong:["antiPoke","aoe"]},
  {id:"disruptor", en:"Disruptor", attr:"int", atk:"ranged", weak:["squishy","immobile"], strong:["silence","longStun"]},
  {id:"enchantress", en:"Enchantress", attr:"int", atk:"ranged", weak:["squishy"], strong:["sustain","antiPoke"]},
  {id:"enigma", en:"Enigma", attr:"int", atk:"melee", weak:["channeling","squishy"], strong:["aoe","longStun"]},
  {id:"grimstroke", en:"Grimstroke", attr:"int", atk:"ranged", weak:["squishy","immobile"], strong:["silence","longStun"]},
  {id:"invoker", en:"Invoker", attr:"int", atk:"ranged", weak:["squishy","activeReliant"], strong:["burstMagic","longStun"]},
  {id:"jakiro", en:"Jakiro", attr:"int", atk:"ranged", weak:["squishy","immobile"], strong:["aoe","longStun"]},
  {id:"keeper-of-the-light", en:"Keeper of the Light", attr:"int", atk:"ranged", weak:["squishy","immobile"], strong:["burstMagic","aoe"]},
  {id:"leshrac", en:"Leshrac", attr:"int", atk:"ranged", weak:["squishy"], strong:["burstMagic","aoe"]},
  {id:"lich", en:"Lich", attr:"int", atk:"ranged", weak:["squishy","immobile"], strong:["aoe","antiPoke"]},
  {id:"lina", en:"Lina", attr:"int", atk:"ranged", weak:["squishy","immobile"], strong:["burstMagic","longStun"]},
  {id:"lion", en:"Lion", attr:"int", atk:"ranged", weak:["squishy","immobile"], strong:["silence","longStun","burstMagic"]},
  {id:"warlock", en:"Warlock", attr:"int", atk:"ranged", weak:["squishy","immobile"], strong:["longStun","sustain"]},
  {id:"muerta", en:"Muerta", attr:"agi", atk:"ranged", weak:["squishy"], strong:["burstMagic","detection"]},
  {id:"nature-prophet", en:"Nature's Prophet", attr:"int", atk:"ranged", weak:["summons"], strong:["aoe","antiPoke"]},
  {id:"necrophos", en:"Necrophos", attr:"int", atk:"ranged", weak:["squishy"], strong:["breakEffect","tankyStr","antiPoke"]},
  {id:"oracle", en:"Oracle", attr:"int", atk:"ranged", weak:["squishy","immobile"], strong:["sustain","spellImmune"]},
  {id:"outworld-destroyer", en:"Outworld Destroyer", attr:"int", atk:"ranged", weak:["squishy"], strong:["burstMagic","silence"]},
  {id:"puck", en:"Puck", attr:"int", atk:"ranged", weak:["squishy"], strong:["gapCloser","burstMagic"]},
  {id:"pugna", en:"Pugna", attr:"int", atk:"ranged", weak:["squishy","immobile"], strong:["burstMagic","antiPoke"]},
  {id:"queen-of-pain", en:"Queen of Pain", attr:"int", atk:"ranged", weak:["squishy"], strong:["burstMagic","gapCloser"]},
  {id:"rubick", en:"Rubick", attr:"int", atk:"ranged", weak:["squishy","immobile"], strong:["silence","longStun"]},
  {id:"shadow-demon", en:"Shadow Demon", attr:"int", atk:"ranged", weak:["squishy","immobile"], strong:["silence","longStun"]},
  {id:"shadow-shaman", en:"Shadow Shaman", attr:"int", atk:"ranged", weak:["squishy","immobile","summons"], strong:["longStun","aoe"]},
  {id:"silencer", en:"Silencer", attr:"int", atk:"ranged", weak:["squishy"], strong:["silence","antiPoke"]},
  {id:"skywrath-mage", en:"Skywrath Mage", attr:"int", atk:"ranged", weak:["squishy","immobile"], strong:["silence","burstMagic"]},
  {id:"storm-spirit", en:"Storm Spirit", attr:"int", atk:"melee", weak:["activeReliant","squishy"], strong:["gapCloser","spellImmune"]},
  {id:"tinker", en:"Tinker", attr:"int", atk:"ranged", weak:["squishy","activeReliant","immobile"], strong:["burstMagic"]},
  {id:"visage", en:"Visage", attr:"int", atk:"ranged", weak:["summons"], strong:["aoe","tankyStr"]},
  {id:"void-spirit", en:"Void Spirit", attr:"int", atk:"melee", weak:["squishy"], strong:["gapCloser","burstMagic","silence"]},
  {id:"windranger", en:"Windranger", attr:"int", atk:"ranged", weak:["squishy"], strong:["silence","longStun"]},
  {id:"winter-wyvern", en:"Winter Wyvern", attr:"int", atk:"ranged", weak:["squishy","immobile"], strong:["sustain","spellImmune"]},
  {id:"witch-doctor", en:"Witch Doctor", attr:"int", atk:"ranged", weak:["squishy","immobile","channeling"], strong:["longStun","aoe"]},
  {id:"zeus", en:"Zeus", attr:"int", atk:"ranged", weak:["squishy"], strong:["burstMagic","aoe"]},

  // UNIVERSAL / OTHERS
  {id:"io", en:"Io", attr:"all", atk:"ranged", weak:["squishy"], strong:["sustain","gapCloser"]},
  {id:"nyx-assassin", en:"Nyx Assassin", attr:"all", atk:"melee", weak:["invis"], strong:["silence","detection","burstMagic"]},
  {id:"snapfire", en:"Snapfire", attr:"all", atk:"ranged", weak:["squishy"], strong:["longStun","burstMagic"]},
  {id:"techies", en:"Techies", attr:"all", atk:"ranged", weak:["squishy","immobile"], strong:["burstMagic","longStun"]},
  {id:"sniper", en:"Sniper", attr:"agi", atk:"ranged", weak:["squishy","immobile"], strong:["antiPoke","burstPhys"]}
];

// Hand-picked, meta-informed hard counters — weighted above the heuristic.
// Format: enemyId: [{id, reason}]
const CURATED_COUNTERS = {
  "anti-mage": [
    {id:"axe", reason:"Berserker's Call forces AM into melee range, where he's weak"},
    {id:"legion-commander", reason:"Duel and Blood Rite kill AM before he can farm a lead"},
    {id:"night-stalker", reason:"At night he catches AM instantly with no escape"},
    {id:"bloodseeker", reason:"Rupture stops the Blink Dagger getaway"}
  ],
  "phantom-assassin": [
    {id:"nyx-assassin", reason:"Mana Burn and Impale land through Blur"},
    {id:"bristleback", reason:"High armor and damage that doesn't care about crits"},
    {id:"lion", reason:"Long stun plus silence kills PA before she can crit"},
    {id:"axe", reason:"Call guarantees a hit and forces a fight"}
  ],
  "juggernaut": [
    {id:"axe", reason:"Berserker's Call still locks him down right after Blade Fury ends"},
    {id:"lion", reason:"Stun and silence land before or right after Omnislash"},
    {id:"bane", reason:"Fiend's Grip kills through Blade Fury"},
    {id:"disruptor", reason:"Glimpse resets his positioning before Omnislash"}
  ],
  "riki": [
    {id:"bounty-hunter", reason:"Track and vision strip the invisibility"},
    {id:"slardar", reason:"Amplify Damage reveals Riki"},
    {id:"nyx-assassin", reason:"Impale lands off vision, and silence shuts down his tools"}
  ],
  "slark": [
    {id:"nyx-assassin", reason:"Impale and Mana Burn catch him and drain his mana"},
    {id:"bloodseeker", reason:"Rupture punishes the Pounce escape"},
    {id:"legion-commander", reason:"Duel won't let Slark disengage"},
    {id:"axe", reason:"Call locks him into the fight"}
  ],
  "storm-spirit": [
    {id:"axe", reason:"Call still lands the moment he exits Ball Lightning"},
    {id:"bloodseeker", reason:"Thirst and Rupture punish him mid-transition"},
    {id:"silencer", reason:"Global Silence shuts down his mobility entirely"},
    {id:"nyx-assassin", reason:"Mana Burn drains the mana he needs to move"}
  ],
  "templar-assassin": [
    {id:"bounty-hunter", reason:"Vision and Track strip Meld/invisibility"},
    {id:"earthshaker", reason:"AOE stun lands despite Refraction charges"},
    {id:"axe", reason:"Call instantly burns all Refraction charges"}
  ],
  "medusa": [
    {id:"silencer", reason:"Global Silence disables Split Shot and Stone Gaze"},
    {id:"doom", reason:"Doom breaks her passives and blocks her spells entirely"},
    {id:"bloodseeker", reason:"Rupture punishes repositioning around Mana Shield"}
  ],
  "spectre": [
    {id:"axe", reason:"Pressures her illusion farm and Call locks her down"},
    {id:"phantom-lancer", reason:"Spectre struggles to hold lanes against PL's illusions"},
    {id:"bloodseeker", reason:"Rupture kills even through Dispersion"}
  ],
  "faceless-void": [
    {id:"silencer", reason:"Prevents ability use inside Chronosphere"},
    {id:"disruptor", reason:"Glimpse and Static Storm undercut his timing advantage"},
    {id:"morphling", reason:"Spell immunity ignores control inside Chrono"}
  ],
  "terrorblade": [
    {id:"axe", reason:"Clears illusions and pressures the lane"},
    {id:"necrophos", reason:"Reaper's Scythe finishes based on percentage health"},
    {id:"doom", reason:"Break removes Metamorphosis's benefits"}
  ],
  "invoker": [
    {id:"silencer", reason:"Global Silence completely shuts down his combo"},
    {id:"nyx-assassin", reason:"Mana Burn drains the mana needed for a combo cast"},
    {id:"axe", reason:"Fast initiation doesn't give him time to cast"}
  ],
  "tinker": [
    {id:"silencer", reason:"Silence and disabling actives break his rotation"},
    {id:"nyx-assassin", reason:"Mana Burn drains the mana he needs for Rearm/TP"},
    {id:"anti-mage", reason:"Mana Break drains his mana, Blink catches him"}
  ],
  "shadow-fiend": [
    {id:"axe", reason:"Fast initiation denies the Requiem of Souls cast"},
    {id:"nyx-assassin", reason:"Impale and silence land before Requiem"},
    {id:"bristleback", reason:"High HP and armor blunt his physical damage"}
  ],
  "puck": [
    {id:"nyx-assassin", reason:"Impale lands even through Phase Shift"},
    {id:"lion", reason:"A long stun pins down the elusive Puck"}
  ],
  "morphling": [
    {id:"viper", reason:"Nethertoxin strips his attributes and spell immunity"},
    {id:"silencer", reason:"Silence blocks Waveform and self-heal"},
    {id:"doom", reason:"Doom disables all ability use"}
  ],
  "pudge": [
    {id:"bloodseeker", reason:"Spots low HP and finishes with Rupture"},
    {id:"windranger", reason:"Focus Fire kills him fast"},
    {id:"silencer", reason:"Blocks the Meat Hook as he approaches"}
  ],
  "lifestealer": [
    {id:"viper", reason:"Nethertoxin disables spell immunity"},
    {id:"necrophos", reason:"Reaper's Scythe finishes based on percentage health despite regen"},
    {id:"dazzle", reason:"Shallow Grave denies the kill, though his healing itself falls under Break"}
  ],
  "bristleback": [
    {id:"doom", reason:"Break removes Quill Spray and his other passives"},
    {id:"silencer", reason:"Control prevents him from turning his back correctly"},
    {id:"viper", reason:"Nether Toxin shreds armor and strips buffs"}
  ],
  "huskar": [
    {id:"lion", reason:"Magical burst finishes his low HP pool"},
    {id:"skywrath-mage", reason:"Pure magic damage kills despite his resistances"},
    {id:"necrophos", reason:"Reaper's Scythe ignores his physical resistances"}
  ],
  "chaos-knight": [
    {id:"axe", reason:"AOE clears illusions, Call catches the real one"},
    {id:"necrophos", reason:"Percentage-health damage ignores armor and crit"}
  ],
  "naga-siren": [
    {id:"axe", reason:"Pressures her illusion farm"},
    {id:"lion", reason:"A stun denies the escape into Song of the Siren"}
  ],
  "broodmother": [
    {id:"bounty-hunter", reason:"Vision and Track strip the spiderlings' invisibility"},
    {id:"axe", reason:"AOE Culling Blade clears spiderlings and Broodmother herself"}
  ],
  "clinkz": [
    {id:"bounty-hunter", reason:"Track strips the invisibility"},
    {id:"nyx-assassin", reason:"Impale lands off vision"}
  ],
  "weaver": [
    {id:"bounty-hunter", reason:"Vision and Track limit his escape"},
    {id:"silencer", reason:"Blocks Shukuchi and Time Lapse from being effective"}
  ],
  "meepo": [
    {id:"earthshaker", reason:"Echo Slam wipes out the whole clone pack at once"},
    {id:"tidehunter", reason:"Ravage sweeps the entire Meepo swarm"},
    {id:"sand-king", reason:"Epicenter hits every clone"}
  ],
  "arc-warden": [
    {id:"axe", reason:"Kills the Warden or its clone quickly before it scales"},
    {id:"bloodseeker", reason:"Rupture stops kiting with the clone"}
  ],
  "drow-ranger": [
    {id:"axe", reason:"Call stops the kiting and forces a fight"},
    {id:"clockwerk", reason:"Gap-close plus stun deny her range advantage"}
  ],
  "sniper": [
    {id:"axe", reason:"Instant initiation denies him range to kite"},
    {id:"clockwerk", reason:"Jumps in his face and stuns"},
    {id:"nyx-assassin", reason:"Impale off vision catches him at any range"}
  ],
  "windranger": [
    {id:"axe", reason:"Fast initiation denies the Focus Fire cast"},
    {id:"nyx-assassin", reason:"Mana Burn and stun break her combo"}
  ],
  "zeus": [
    {id:"silencer", reason:"Global Silence completely shuts off his damage"},
    {id:"nyx-assassin", reason:"Mana Burn drains the mana behind his nukes"},
    {id:"anti-mage", reason:"Spell Shield and Mana Break starve Zeus"}
  ],
  "lina": [
    {id:"axe", reason:"Fast initiation denies the nuke combo"},
    {id:"nyx-assassin", reason:"Impale and silence land before her nukes"}
  ],
  "skywrath-mage": [
    {id:"axe", reason:"Fast initiation kills this fragile hero outright"},
    {id:"nyx-assassin", reason:"Silence removes Ancient Seal and shuts down nukes"}
  ],
  "queen-of-pain": [
    {id:"nyx-assassin", reason:"Impale lands even through her Blink"},
    {id:"axe", reason:"Call denies the Blink escape"}
  ],
  "necrophos": [
    {id:"silencer", reason:"Silence denies the ultimate cast"},
    {id:"anti-mage", reason:"Spell Shield lowers magic damage, and Mana Break drains his mana"}
  ],
  "enigma": [
    {id:"silencer", reason:"Denies the Black Hole cast"},
    {id:"nyx-assassin", reason:"A stun interrupts the channeled ultimate"},
    {id:"axe", reason:"Fast initiation catches him before Black Hole"}
  ],
  "tidehunter": [
    {id:"silencer", reason:"Denies the Ravage cast"},
    {id:"nyx-assassin", reason:"Stuns and interrupts his ultimate setup"}
  ],
  "magnus": [
    {id:"silencer", reason:"Denies Reverse Polarity"},
    {id:"nyx-assassin", reason:"Catches him with a stun before he can initiate"}
  ],
  "earthshaker": [
    {id:"nyx-assassin", reason:"Interrupts the Echo Slam channel"},
    {id:"silencer", reason:"Denies the ultimate cast"}
  ],
  "witch-doctor": [
    {id:"nyx-assassin", reason:"A stun interrupts the Death Ward channel"},
    {id:"axe", reason:"Fast initiation before he can cast"}
  ],
  "shadow-shaman": [
    {id:"nyx-assassin", reason:"Catches him before his stun chain lands"},
    {id:"axe", reason:"Fast initiation"}
  ],
  "outworld-destroyer": [
    {id:"anti-mage", reason:"Spell Shield cuts down OD's magic damage"},
    {id:"axe", reason:"Fast initiation catches this fragile hero"}
  ],
  "leshrac": [
    {id:"axe", reason:"Fast initiation kills this fragile hero outright"},
    {id:"anti-mage", reason:"Spell Shield lowers his magic damage"}
  ],
  "pugna": [
    {id:"axe", reason:"Fast initiation denies the Nether Ward setup"},
    {id:"anti-mage", reason:"Mana Break punishes his mana dependency"}
  ],
  "death-prophet": [
    {id:"axe", reason:"Kills the spirits and Death Prophet herself"},
    {id:"doom", reason:"Break removes Spirit Siphon's benefit"}
  ],
  "beastmaster": [
    {id:"axe", reason:"AOE kills off his summons"},
    {id:"doom", reason:"Doom fully disables him from the fight"}
  ],
  "lycan": [
    {id:"axe", reason:"AOE kills off the wolves"},
    {id:"doom", reason:"Doom fully disables him from the fight"}
  ],
  "visage": [
    {id:"axe", reason:"AOE kills off the familiars"}
  ],
  "nature-prophet": [
    {id:"axe", reason:"Quickly kills his treants"},
    {id:"bounty-hunter", reason:"Track finds him after a teleport"}
  ],
  "io": [
    {id:"nyx-assassin", reason:"Mana Burn and a stun catch him despite Relocate"},
    {id:"axe", reason:"Call locks him down before Relocate"}
  ],
  "dark-willow": [
    {id:"nyx-assassin", reason:"Silence denies her cast"},
    {id:"axe", reason:"Fast initiation"}
  ],
  "rubick": [
    {id:"nyx-assassin", reason:"Silence stops him from stealing a spell"},
    {id:"axe", reason:"Fast initiation"}
  ],
  "keeper-of-the-light": [
    {id:"axe", reason:"Quickly kills this fragile hero"},
    {id:"nyx-assassin", reason:"Mana Burn drains his mana"}
  ],
  "ancient-apparition": [
    {id:"axe", reason:"Fast initiation before he can cast Ice Blast"},
    {id:"nyx-assassin", reason:"Silence denies his cast"}
  ],
  "batrider": [
    {id:"silencer", reason:"Blocks the use of Flaming Lasso"},
    {id:"nyx-assassin", reason:"A stun interrupts his setup"}
  ],
  "void-spirit": [
    {id:"nyx-assassin", reason:"Impale lands even through Dissimilate"},
    {id:"silencer", reason:"Silence stops him from chaining portals"}
  ]
};
