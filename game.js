// ===============================
// Shadow Realm Asset Mapping
// ===============================
// --- Enemy Avatars (assets/images/) ---
// enemy1.png      => Shadow Minion (Enemy)
// enemy2.png      => Crystal Golem (Enemy)
// enemy3.png      => Void Spirit (Enemy)
// boss1.png       => The Shadow Lord (Boss)
// boss2.png       => The Crystal Queen (Boss)
// boss3.png       => The Void Devourer (Boss)
// boss4.png       => The Abyssal Hydra (Boss)
// boss5.png       => The Chronomancer (Boss)
// boss6.png       => The Iron Colossus (Boss)
// player.png      => Player Avatar
//
// --- Weapons (assets/images/) ---
// weapon1.png     => Shadow Blade
// weapon2.png     => Void Dagger
// weapon3.png     => Crystal Greatsword
//
// --- Armor (assets/images/) ---
// armor1.png      => Shadow Cloak
// armor2.png      => Void Mail
// armor3.png      => Crystal Plate
//
// --- Skills (assets/images/) ---
// skill1.png      => Shadow Step
// skill2.png      => Void Shield
// skill3.png      => Crystal Burst
//
// --- Potions (assets/images/) ---
// potion1.png     => Health Potion
// potion2.png     => Strength Elixir
// potion3.png     => Void Essence
//
// --- Audio (assets/audio/) ---
// background.mp3  => Main Menu/Non-battle
// battle.mp3      => Regular Battle
// boss.mp3        => Boss Battle
// attack.wav      => Basic Attack SFX
// special.wav     => Special Attack SFX
// buff.wav        => Buff/Power Up SFX
// heal.wav        => Healing SFX
// boss.wav        => Boss Attack SFX
// hydra_roar.wav  => Abyssal Hydra SFX
// time_warp.wav   => Chronomancer SFX
// colossus_step.wav => Iron Colossus SFX
// ===============================

// Game State
const gameState = {
    player: {
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        health: 100,
        maxHealth: 100,
    },
    dailyChallenge: {
        type: null,
        progress: 0,
        target: 0,
        reward: null,
        lastReset: 0
    },
    bossRush: {
        enabled: false,
        currentBossIndex: 0,
        defeatedBosses: [],
        timeLimit: 600000, // 10 minutes
        startTime: 0
    },
        attack: 10,
        defense: 5,
        speed: 3,
        gems: 0,
        inventory: [],
        equipment: {
            weapon: null,
            armor: null,
            accessory: null // Added accessory slot for future expansion
        },
        // NEW: Moved temporary effects here
        temporaryEffects: { attackBonus: 0, defenseBonus: 0, speedBonus: 0, poisonTurns: 0, stunTurns: 0 }
    },
    enemy: null,
    // Removed redundant bosses/enemies arrays here, use gameData
    achievements: [], // Achievements state will be loaded/initialized
    shopItems: {}, // Shop state (like purchased status) might live elsewhere or items loaded dynamically
    currentScreen: 'battle', // Default screen
    settings: {
        musicVolume: 70,
        sfxVolume: 80,
        darkMode: true
    },
    gameProgress: {
        highestLevel: 1,
        enemiesDefeated: 0,
        bossesDefeated: 0,
        gemsCollected: 0
    },
    // NEW: Boss Status Tracker (replaces defeatedBosses array)
    bossStatus: {},
    // NEW: Battle State
    battle: {
        playerTurn: true,
        playerDefending: false,
        enemyAction: null // Can store the enemy's chosen move object
    }
    // Note: removed defeatedBosses array - migration handled in ensureBossStatusInitialized
};

// DOM Elements - Defined later in DOMContentLoaded
const elements = {};

// Game Data (Static definitions)
const gameData = {
    enemies: [
        { id: 'shadow_minion', name: 'Shadow Minion', health: 50, attack: 5, defense: 2, speed: 2, xp: 20, gems: 5, image: 'assets/images/enemy1.png', abilities: ['slash', 'dark_pulse'] },
        { id: 'crystal_golem', name: 'Crystal Golem', health: 80, attack: 4, defense: 8, speed: 1, xp: 30, gems: 8, image: 'assets/images/enemy2.png', abilities: ['smash', 'crystal_barrier'] },
        { id: 'void_spirit', name: 'Void Spirit', health: 40, attack: 9, defense: 1, speed: 7, xp: 35, gems: 12, image: 'assets/images/enemy3.png', abilities: ['void_strike', 'phase_shift'] }
    ],
    bosses: [
        { id: 'shadow_lord', name: 'The Shadow Lord', health: 500, attack: 35, defense: 25, speed: 8, xp: 300, gems: 120, image: 'assets/images/boss1.png', abilities: ['shadow_storm', 'void_crush', 'dark_resurrection', 'fear_aura', 'shadow_clone'], description: 'A powerful entity born from the darkness between worlds. The Shadow Lord commands legions of minions and draws power from fear itself. Creates shadow clones and drains life force.', unlockLevel: 5, enrage: { threshold: 0.3, bonus: { attack: 25, speed: 5 } }, lifeDrain: { amount: 20, healFactor: 0.5 } },
        { id: 'crystal_queen', name: 'The Crystal Queen', health: 750, attack: 40, defense: 35, speed: 9, xp: 500, gems: 200, image: 'assets/images/boss2.png', abilities: ['crystal_storm', 'reflective_barrier', 'shard_explosion', 'crystal_prison', 'crystal_armor'], description: 'Once a benevolent ruler, the Crystal Queen was corrupted by dark magic. Her crystal shield reflects damage and can trap opponents. Forms impenetrable crystal armor.', unlockLevel: 10, shield: { capacity: 200, reflection: 0.5 }, crystalArmor: { threshold: 0.5, defenseBonus: 30 } },
        { id: 'void_devourer', name: 'The Void Devourer', health: 1000, attack: 50, defense: 40, speed: 10, xp: 800, gems: 350, image: 'assets/images/boss3.png', abilities: ['consume_reality', 'dimensional_rift', 'entropy_beam', 'void_absorption', 'reality_shatter'], description: 'An ancient cosmic horror that grows stronger by absorbing damage. Each successful hit increases its power exponentially.', unlockLevel: 15, absorption: { rate: 0.3, cap: 100 }, voidEmpowerment: { damageThreshold: 200, bonusMultiplier: 1.5 } },
        { id: 'abyssal_hydra', name: 'The Abyssal Hydra', health: 1200, attack: 45, defense: 38, speed: 9, xp: 1000, gems: 400, image: 'assets/images/boss4.png', abilities: ['hydras_fury', 'toxic_breath', 'regenerate', 'head_spawn', 'hydra_rage'], description: 'A multi-headed horror that spawns new heads when damaged. Each head increases attack power and grants unique abilities. Enters a devastating rage state.', unlockLevel: 20, heads: { max: 5, spawnThreshold: 0.2, bonus: { attack: 15, defense: 8 } }, rage: { threshold: 0.3, multiplier: 2.0 } },
        { id: 'chronomancer', name: 'The Chronomancer', health: 900, attack: 55, defense: 35, speed: 15, xp: 1200, gems: 500, image: 'assets/images/boss5.png', abilities: ['time_reversal', 'haste', 'temporal_blast', 'time_loop', 'temporal_collapse'], description: 'A master of time who can reverse fatal damage and duplicate powerful attacks. Time manipulation grows stronger in later phases. Can create temporal echoes of attacks.', unlockLevel: 25, timeWarp: { charges: 3, cooldown: 2 }, temporalEcho: { chance: 0.3, damage: 0.7 } },
        { id: 'iron_colossus', name: 'The Iron Colossus', health: 2000, attack: 60, defense: 55, speed: 6, xp: 1500, gems: 700, image: 'assets/images/boss6.png', abilities: ['earthquake', 'iron_defense', 'overload', 'molten_core', 'annihilation_beam'], description: 'A towering construct that enters a devastating molten state at low health. Charges up devastating attacks that can instantly defeat the unprepared.', unlockLevel: 30, moltenState: { threshold: 0.4, attack: 40, defense: -20 }, chargeAttack: { chargeTime: 2, damageMultiplier: 3.0 } }
    ],
    shopItems: {
        weapons: [
            { id: 'shadow_blade', name: 'Shadow Blade', description: 'A blade forged from shadow essence. Increases attack by 5.', price: 50, effect: { attack: 5 }, image: 'assets/images/weapon1.png', unlockLevel: 1 },
            { id: 'void_dagger', name: 'Void Dagger', description: 'Quick strikes from beyond the void. Increases attack by 10 and speed by 2.', price: 120, effect: { attack: 10, speed: 2 }, image: 'assets/images/weapon2.png', unlockLevel: 3 },
            { id: 'crystal_greatsword', name: 'Crystal Greatsword', description: 'A massive sword infused with crystal energy. Increases attack by 25.', price: 300, effect: { attack: 25 }, image: 'assets/images/weapon3.png', unlockLevel: 7 },
            { id: 'abyssal_scythe', name: 'Abyssal Scythe', description: 'Harvests the power of the abyss. Increases attack by 40, speed by 3.', price: 600, effect: { attack: 40, speed: 3 }, image: 'assets/images/weapon4.png', unlockLevel: 10 },
            { id: 'lunar_staff', name: 'Lunar Staff', description: 'A staff blessed by the moon. Increases attack by 15, defense by 10.', price: 400, effect: { attack: 15, defense: 10 }, image: 'assets/images/weapon5.png', unlockLevel: 8 }
        ],
        armor: [
            { id: 'shadow_cloak', name: 'Shadow Cloak', description: 'A cloak made of shadows. Increases defense by 5.', price: 50, effect: { defense: 5 }, image: 'assets/images/armor1.png', unlockLevel: 1 },
            { id: 'void_mail', name: 'Void Mail', description: 'Armor forged in the void. Increases defense by 10 and max health by 20.', price: 150, effect: { defense: 10, maxHealth: 20 }, image: 'assets/images/armor2.png', unlockLevel: 4 },
            { id: 'crystal_plate', name: 'Crystal Plate', description: 'Heavy armor made of enchanted crystals. Increases defense by 20 and max health by 50.', price: 350, effect: { defense: 20, maxHealth: 50 }, image: 'assets/images/armor3.png', unlockLevel: 8 },
            { id: 'hydra_scale_mail', name: 'Hydra Scale Mail', description: 'Armor made from hydra scales. Increases defense by 30, max health by 100.', price: 700, effect: { defense: 30, maxHealth: 100 }, image: 'assets/images/armor4.png', unlockLevel: 12 }
        ],
        skills: [
            { id: 'shadow_step', name: 'Shadow Step', description: 'Teleport through shadows to strike your enemy. Powerful single target.', price: 100, effect: { ability: 'shadow_step' }, image: 'assets/images/skill1.png', unlockLevel: 2 },
            { id: 'void_shield', name: 'Void Shield', description: 'Create a shield of void energy. Greatly increases defense next turn.', price: 100, effect: { ability: 'void_shield' }, image: 'assets/images/skill2.png', unlockLevel: 2 },
            { id: 'crystal_burst', name: 'Crystal Burst', description: 'Shatter crystals in all directions. Moderate damage, lowers enemy defense.', price: 200, effect: { ability: 'crystal_burst' }, image: 'assets/images/skill3.png', unlockLevel: 5 },
            { id: 'hydra_frenzy', name: 'Hydra Frenzy', description: 'Unleash a flurry of weaker attacks. Hits 3 times for very low damage.', price: 300, effect: { ability: 'hydra_frenzy' }, image: 'assets/images/skill4.png', unlockLevel: 8 },
            { id: 'lunar_blessing', name: 'Lunar Blessing', description: 'Heals you for 30% of your max HP.', price: 400, effect: { ability: 'lunar_blessing' }, image: 'assets/images/skill5.png', unlockLevel: 10 },
            { id: 'time_warp', name: 'Time Warp', description: 'Take an extra turn after this one.', price: 600, effect: { ability: 'time_warp' }, image: 'assets/images/skill6.png', unlockLevel: 13 }
        ],
        potions: [
            { id: 'health_potion', name: 'Health Potion', description: 'Restores 50 health points.', price: 20, effect: { health: 50 }, image: 'assets/images/potion1.png', unlockLevel: 1 },
            { id: 'strength_elixir', name: 'Strength Elixir', description: 'Temporarily boosts attack by 10 for the next battle.', price: 30, effect: { tempAttack: 10 }, image: 'assets/images/potion2.png', unlockLevel: 3 },
            { id: 'void_essence', name: 'Void Essence', description: 'Permanently increases max health by 10.', price: 100, effect: { maxHealth: 10 }, image: 'assets/images/potion3.png', unlockLevel: 6 },
            { id: 'speed_potion', name: 'Speed Potion', description: 'Temporarily boosts speed by 5 for the next battle.', price: 40, effect: { tempSpeed: 5 }, image: 'assets/images/potion4.png', unlockLevel: 5 },
            { id: 'defense_tonic', name: 'Defense Tonic', description: 'Temporarily boosts defense by 8 for the next battle.', price: 50, effect: { tempDefense: 8 }, image: 'assets/images/potion5.png', unlockLevel: 7 }
        ]
    },
    achievements: [
        { id: 'first_blood', name: 'First Blood', description: 'Defeat your first enemy.', progress: 0, target: 1, reward: { gems: 10 }, unlocked: false, claimed: false },
        { id: 'shadow_hunter', name: 'Shadow Hunter', description: 'Defeat 10 Shadow Minions.', progress: 0, target: 10, reward: { gems: 50 }, unlocked: false, claimed: false },
        { id: 'boss_slayer', name: 'Boss Slayer', description: 'Defeat your first boss.', progress: 0, target: 1, reward: { gems: 100 }, unlocked: false, claimed: false },
        { id: 'gem_collector', name: 'Gem Collector', description: 'Collect 500 gems total.', progress: 0, target: 500, reward: { attack: 5, defense: 5 }, unlocked: false, claimed: false },
        { id: 'master_of_shadows', name: 'Master of Shadows', description: 'Reach level 10.', progress: 1, target: 10, reward: { gems: 200, attack: 10, defense: 10 }, unlocked: false, claimed: false },
        { id: 'hydra_slayer', name: 'Hydra Slayer', description: 'Defeat the Abyssal Hydra.', progress: 0, target: 1, reward: { gems: 150 }, unlocked: false, claimed: false },
        { id: 'chronomancer_vanquished', name: 'Chronomancer Vanquished', description: 'Defeat the Chronomancer.', progress: 0, target: 1, reward: { gems: 200 }, unlocked: false, claimed: false },
        { id: 'skill_collector', name: 'Skill Collector', description: 'Unlock 5 different skills.', progress: 0, target: 5, reward: { gems: 100 }, unlocked: false, claimed: false },
        { id: 'shopaholic', name: 'Shopaholic', description: 'Buy 20 items from the shop.', progress: 0, target: 20, reward: { gems: 80 }, unlocked: false, claimed: false }
    ]
};

// --- ENEMY MOVE VARIETY AND GROWTH ---
const ENEMY_MOVES = {
    shadow_minion: [
        { name: 'Shadow Slash', type: 'attack', power: 1.0, sfx: 'attack.wav', color: '#6a0080' },
        { name: 'Dark Pulse', type: 'attack', power: 1.2, sfx: 'special.wav', color: '#23234a' },
        { name: 'Enrage', type: 'buff', stat: 'attack', amount: 2, sfx: 'buff.wav', color: '#ff9800' }
    ],
    crystal_golem: [
        { name: 'Crystal Smash', type: 'attack', power: 1.1, sfx: 'attack.wav', color: '#2196f3' },
        { name: 'Crystal Barrier', type: 'buff', stat: 'defense', amount: 3, sfx: 'buff.wav', color: '#4caf50' },
        { name: 'Shard Shot', type: 'attack', power: 0.8, sfx: 'special.wav', color: '#d05ce3' }
    ],
    void_spirit: [
        { name: 'Void Strike', type: 'attack', power: 1.3, sfx: 'attack.wav', color: '#9c27b0' },
        { name: 'Phase Shift', type: 'buff', stat: 'speed', amount: 2, sfx: 'buff.wav', color: '#00bcd4' },
        { name: 'Entropy Zap', type: 'attack', power: 1.0, sfx: 'special.wav', color: '#f44336' }
    ],
    shadow_lord: [
        { name: 'Shadow Storm', type: 'attack', power: 1.6, sfx: 'boss.wav', color: '#6a0080', multi: 2 },
        { name: 'Void Crush', type: 'attack', power: 1.4, sfx: 'boss.wav', color: '#23234a', defense_pierce: 0.3 },
        { name: 'Dark Resurrection', type: 'heal', amount: 60, sfx: 'heal.wav', color: '#4caf50', buff: { attack: 5 } },
        { name: 'Fear Aura', type: 'debuff', stat: 'attack', amount: -8, duration: 3, sfx: 'boss.wav', color: '#6a0080' }
    ],
    crystal_queen: [
        { name: 'Crystal Storm', type: 'attack', power: 1.5, sfx: 'boss.wav', color: '#2196f3', multi: 3, shield_gain: 20 },
        { name: 'Reflective Barrier', type: 'buff', stat: 'defense', amount: 8, sfx: 'buff.wav', color: '#d05ce3', reflect: 0.3 },
        { name: 'Shard Explosion', type: 'attack', power: 1.4, sfx: 'special.wav', color: '#ff9800', shield_consume: true },
        { name: 'Crystal Prison', type: 'debuff', stat: 'stun', amount: 2, sfx: 'boss.wav', color: '#2196f3', condition: 'shield_active' }
    ],
    void_devourer: [
        { name: 'Consume Reality', type: 'attack', power: 1.8, sfx: 'boss.wav', color: '#9c27b0', life_steal: 0.3 },
        { name: 'Dimensional Rift', type: 'attack', power: 1.5, sfx: 'special.wav', color: '#00bcd4', ignore_defense: true },
        { name: 'Entropy Beam', type: 'attack', power: 1.6, sfx: 'special.wav', color: '#f44336', scaling: 'absorbed_power' },
        { name: 'Void Absorption', type: 'buff', stat: 'absorbed_power', amount: 10, sfx: 'boss.wav', color: '#9c27b0' }
    ],
    abyssal_hydra: [
        { name: "Hydra's Fury", type: 'attack', power: 1.2, multi: 3, sfx: 'hydra_roar.wav', color: '#43e97b' }, // Multi-hit example
        { name: 'Toxic Breath', type: 'debuff', stat: 'poison', amount: 3, sfx: 'hydra_roar.wav', color: '#a3ffae' }, // Debuff example
        { name: 'Regenerate', type: 'heal', amount: 80, sfx: 'heal.wav', color: '#4caf50' }
    ],
    chronomancer: [
        { name: 'Time Reversal', type: 'heal', amount: 120, sfx: 'time_warp.wav', color: '#00e6ff' },
        { name: 'Haste', type: 'buff', stat: 'speed', amount: 4, sfx: 'time_warp.wav', color: '#b388ff' },
        { name: 'Temporal Blast', type: 'attack', power: 2.0, telegraph: true, sfx: 'time_warp.wav', color: '#00e6ff' } // Telegraph example
    ],
    iron_colossus: [
        { name: 'Earthquake', type: 'attack', power: 1.3, stun: true, sfx: 'colossus_step.wav', color: '#bdbdbd' }, // Stun example
        { name: 'Iron Defense', type: 'buff', stat: 'defense', amount: 10, sfx: 'colossus_step.wav', color: '#607d8b' },
        { name: 'Overload', type: 'attack', power: 2.5, telegraph: true, sfx: 'colossus_step.wav', color: '#ff1744' }
    ]
};

// --- PLAYER SKILLS SYSTEM ---
// This array holds the *currently known/unlocked* player skills. It starts with default skills.
let PLAYER_SKILLS = [ // Changed from const to let allow adding skills
    {
        id: 'special_strike',
        name: 'Special Strike',
        description: 'A powerful attack that ignores some enemy defense.',
        color: '#ff9800',
        sfx: 'special.wav',
        // Example effect: returns calculated damage
        effect: (enemy, player) => {
            const damage = calculateDamage(player, enemy, 1.5); // Use base multiplier
            return Math.max(1, Math.floor(damage * 1.2)); // Add extra boost or effect like ignoring defense part here
        }
    },
    {
        id: 'quick_slash',
        name: 'Quick Slash',
        description: 'A fast attack dealing moderate damage.',
        color: '#2196f3',
        sfx: 'attack.wav',
        effect: (enemy, player) => calculateDamage(player, enemy, 1.0) // Standard damage calculation
    }
    // Purchased skills will be added here by purchaseItem function
];

// --- SPECIAL SKILL BAR LOGIC ---
let selectedSkill = PLAYER_SKILLS[0]; // Default to the first known skill

// NEW Helper to format item effect for display in shop
function formatEffect(effect) {
    if (!effect) return '';
    let parts = [];
    if (effect.attack) parts.push(`+${effect.attack} Atk`);
    if (effect.defense) parts.push(`+${effect.defense} Def`);
    if (effect.speed) parts.push(`+${effect.speed} Spd`);
    if (effect.maxHealth) parts.push(`+${effect.maxHealth} Max HP`);
    if (effect.health) parts.push(`Restore ${effect.health} HP`);
    if (effect.tempAttack) parts.push(`+${effect.tempAttack} Atk (Next Battle)`);
    if (effect.ability) parts.push(`Unlock Skill`);
    // Add other potential effects
    return parts.join(', ');
}

// Revised renderSkillBar
function renderSkillBar() {
    // Ensure skillBar element exists
    if (!elements.skillBar) return;
    elements.skillBar.innerHTML = ''; // Clear existing buttons

    // Ensure PLAYER_SKILLS is an array
    if (!Array.isArray(PLAYER_SKILLS)) {
        console.error("PLAYER_SKILLS is not an array!", PLAYER_SKILLS);
        PLAYER_SKILLS = []; // Reset to empty array to prevent further errors
    }

    // Render buttons for known skills
    PLAYER_SKILLS.forEach((skill) => {
        const btn = document.createElement('button');
        // Ensure selectedSkill is valid before comparing IDs
        const isSelected = selectedSkill && selectedSkill.id === skill.id;
        btn.className = 'skill-bar-btn' + (isSelected ? ' selected' : '');
        btn.style.borderLeft = `6px solid ${skill.color || '#ccc'}`; // Use default color if missing
        btn.innerHTML = `<span>${skill.name || 'Unknown Skill'}</span><span class="desc">${skill.description || ''}</span>`;
        btn.onclick = () => {
            selectedSkill = skill;
            console.log("Selected Skill:", selectedSkill.name); // Log selection
            renderSkillBar(); // Re-render to update selection style
        };
        elements.skillBar.appendChild(btn);
    });

    // Add Unequip button
    const unequipBtn = document.createElement('button');
    unequipBtn.className = 'skill-bar-btn unequip-btn' + (!selectedSkill ? ' selected' : '');
    unequipBtn.style.borderLeft = '6px solid #888';
    unequipBtn.innerHTML = `<span>Unequip Skill</span><span class="desc">No skill equipped</span>`;
    unequipBtn.onclick = () => {
        selectedSkill = null;
        renderSkillBar();
    };
    elements.skillBar.appendChild(unequipBtn);

    // Unique idea: Random Skill button (optional)
    /*
    const randomBtn = document.createElement('button');
    randomBtn.className = 'skill-bar-btn';
    randomBtn.style.borderLeft = '6px solid #ffeb3b';
    randomBtn.innerHTML = `<span>Random Skill</span><span class="desc">Use a random unlocked skill!</span>`;
    randomBtn.onclick = () => {
        if (PLAYER_SKILLS.length > 0) {
            const idx = Math.floor(Math.random() * PLAYER_SKILLS.length);
            selectedSkill = PLAYER_SKILLS[idx];
            console.log("Randomly Selected Skill:", selectedSkill.name);
            renderSkillBar();
        } else {
             addToBattleLog("No skills available to randomize!", 'system');
        }
    };
    elements.skillBar.appendChild(randomBtn);
    */
}

// --- NEW: Initialize Default Game State ---
function initializeDefaultGameState() {
     console.log("Initializing default game state...");
     // Reset player stats, inventory, equipment etc. to initial values
     gameState.player = {
        level: 1, xp: 0, xpToNextLevel: 100, health: 100, maxHealth: 100,
        attack: 10, defense: 5, speed: 3, gems: 0, inventory: [],
        equipment: { weapon: null, armor: null, accessory: null },
        temporaryEffects: { attackBonus: 0, defenseBonus: 0, speedBonus: 0, poisonTurns: 0, stunTurns: 0 }
    };
    gameState.enemy = null; // Start with no enemy
    gameState.currentScreen = 'battle'; // Default screen
    gameState.gameProgress = { highestLevel: 1, enemiesDefeated: 0, bossesDefeated: 0, gemsCollected: 0 };
    gameState.bossStatus = {}; // Clear boss status
    // Ensure achievements array exists and reset progress/unlocked status based on gameData
     if (gameData.achievements && Array.isArray(gameData.achievements)) {
         // Create a deep copy and reset progress/claimed status for gameState
         gameState.achievements = gameData.achievements.map(ach => ({
             ...ach, // Copy base data
             progress: ach.id === 'master_of_shadows' ? 1 : 0, // Reset progress (level starts at 1)
             unlocked: false, // Reset unlocked status
             claimed: false   // Reset claimed status
         }));
     } else {
        gameState.achievements = []; // Default to empty if gameData is malformed
     }
     // Apply default settings
     gameState.settings = { musicVolume: 70, sfxVolume: 80, darkMode: true };
     // Reset battle state
     gameState.battle = { playerTurn: true, playerDefending: false, enemyAction: null };

     console.log("Game state reset to default.");
     ensureBossStatusInitialized(); // Initialize boss status for the new game
     // Reset PLAYER_SKILLS to defaults if needed
     PLAYER_SKILLS = [ // Reset known skills back to defaults
        { id: 'special_strike', name: 'Special Strike', description: 'A powerful attack that ignores some enemy defense.', color: '#ff9800', sfx: 'special.wav', effect: (enemy, player) => { const damage = calculateDamage(player, enemy, 1.5); return Math.max(1, Math.floor(damage * 1.2)); } },
        { id: 'quick_slash', name: 'Quick Slash', description: 'A fast attack dealing moderate damage.', color: '#2196f3', sfx: 'attack.wav', effect: (enemy, player) => calculateDamage(player, enemy, 1.0) }
     ];
     // Don't save here, let the game save naturally on first action/screen change
}

// --- NEW: Save/Load Game Logic ---
function saveGame() {
    try {
        // Create a copy of the state to save, including known skills
        const stateToSave = {
             ...gameState,
             knownSkills: PLAYER_SKILLS.map(skill => skill.id) // Save only IDs of known skills
        };
        // Example: Exclude DOM elements if they were accidentally stored in state (shouldn't happen)
        // delete stateToSave.domElements;
        // Maybe exclude transient battle state? Or keep it to resume mid-battle?
        // Let's keep battle state for now.

        localStorage.setItem('shadowRealmSave_v2', JSON.stringify(stateToSave)); // Use versioned key
        // console.log("Game saved."); // Optional: log save success
    } catch (e) {
        console.error('Failed to save game:', e);
        // Inform user? Low storage space?
        addToBattleLog("Failed to save game progress!", "system");
    }
}

function loadGame() {
    const saved = localStorage.getItem('shadowRealmSave_v2'); // Load from versioned key
    if (saved) {
        try {
            const loadedData = JSON.parse(saved);

            // --- State Migration/Validation ---
            // Before merging, ensure loaded data structure is compatible
            // Example: If structure changed, migrate old fields to new ones
            // if (loadedData.oldPlayerStats) { loadedData.player = loadedData.oldPlayerStats; delete loadedData.oldPlayerStats; }

            // Deep merge might be safer than Object.assign for nested objects if structure is complex.
            // Using Object.assign for simplicity here. If issues arise, consider a deep merge utility.
            // Store known skill IDs before overwriting gameState
            const knownSkillIds = loadedData.knownSkills || ['special_strike', 'quick_slash']; // Default if not saved
            delete loadedData.knownSkills; // Remove from loadedData before assigning

            Object.assign(gameState, loadedData);

            console.log("Game loaded successfully.");

            // --- Restore Known Skills ---
            PLAYER_SKILLS = []; // Clear current skills
            // Combine default skills from gameData and potentially learned skills from shopData
            const allPossibleSkills = [
                 ...gameData.shopItems.skills.map(item => ({ // Skills from shop
                     id: item.id,
                     name: item.name,
                     description: item.description,
                     color: '#4fc3f7', // Assign default or get from shop data if available
                     sfx: 'special.wav', // Assign default or get from shop data
                     effect: (enemy, player) => { // Define a basic effect structure based on ID or name
                         console.warn(`Effect for loaded skill '${item.name}' needs proper definition.`);
                         // Placeholder: damage based on player attack and a multiplier
                         let multiplier = 1.5;
                         if (item.id === 'crystal_burst') multiplier = 1.2; // Example differentiation
                         if (item.id === 'void_shield') return 0; // Defensive skills might return 0 damage
                         const baseDmg = calculateDamage(player, enemy, multiplier);
                         // Add specific effects like debuffs here if needed
                         if (item.id === 'crystal_burst' && enemy) {
                            enemy.defense = Math.max(0, enemy.defense - 2); // Example: lower defense
                            addToBattleLog(`${enemy.name}'s defense lowered!`, 'system');
                         }
                         return baseDmg;
                     }
                 })),
                 // Manually add default skills if they aren't in the shop list
                 { id: 'special_strike', name: 'Special Strike', description: 'A powerful attack that ignores some enemy defense.', color: '#ff9800', sfx: 'special.wav', effect: (enemy, player) => { const damage = calculateDamage(player, enemy, 1.5); return Math.max(1, Math.floor(damage * 1.2)); } },
                 { id: 'quick_slash', name: 'Quick Slash', description: 'A fast attack dealing moderate damage.', color: '#2196f3', sfx: 'attack.wav', effect: (enemy, player) => calculateDamage(player, enemy, 1.0) }
            ];

            // Filter all possible skills based on loaded knownSkillIds
             knownSkillIds.forEach(id => {
                 const skillData = allPossibleSkills.find(s => s.id === id);
                 if (skillData && !PLAYER_SKILLS.some(ps => ps.id === id)) { // Add if found and not already added
                     PLAYER_SKILLS.push(skillData);
                 }
             });
             // Ensure at least the default skills are present if loading failed somehow
             if (!PLAYER_SKILLS.some(ps => ps.id === 'special_strike')) {
                const defaultSkill1 = allPossibleSkills.find(s => s.id === 'special_strike');
                if(defaultSkill1) PLAYER_SKILLS.push(defaultSkill1);
             }
             if (!PLAYER_SKILLS.some(ps => ps.id === 'quick_slash')) {
                 const defaultSkill2 = allPossibleSkills.find(s => s.id === 'quick_slash');
                 if(defaultSkill2) PLAYER_SKILLS.push(defaultSkill2);
             }


            // --- Post-load adjustments ---
            ensureBossStatusInitialized(); // IMPORTANT: Ensure boss status format is correct after loading

            // Reset transient battle state for stability
            if (!gameState.battle) gameState.battle = {}; // Ensure battle obj exists
            gameState.battle.playerTurn = true;
            gameState.battle.playerDefending = false;
            gameState.battle.enemyAction = null;
            // Reset temporary effects on load
            if (gameState.player) {
                gameState.player.temporaryEffects = { attackBonus: 0, defenseBonus: 0, speedBonus: 0, poisonTurns: 0, stunTurns: 0 };
            }
             if (gameState.enemy) { // Reset enemy effects too if resuming mid-battle wasn't intended
                 // Let's clear the enemy on load to avoid inconsistent state from saved battle
                 gameState.enemy = null;
             }

            // Recalculate derived stats if necessary (e.g., if total stats depend on equipment)
            // applyEquipmentStats(); // Example function call

            // Sync achievements after loading
            syncAllAchievements();

        } catch (e) {
            console.error('Failed to parse saved game data:', e);
            // Option 1: Remove corrupted save data
            localStorage.removeItem('shadowRealmSave_v2');
            // Use a more user-friendly way to notify than battle log if possible
            alert("Failed to load save data. The corrupted save file has been removed. Starting a fresh game.");
            // Option 2: Load default state
            initializeDefaultGameState(); // Reset state
            syncAllAchievements();
        }
    } else {
        console.log("No saved game found (v2). Starting fresh.");
        initializeDefaultGameState(); // Ensure default state if no save exists
        syncAllAchievements();
    }
}


// --- Initialize Game --- (Revised)
function initGame() {
    // Load saved game if exists
    loadGame(); // Moved loadGame call here, handles initialization if no save exists

    // Update UI with loaded/default data
    updatePlayerStats();
    ensureBossStatusInitialized(); // Ensure status is consistent after load
    updateBossIndicator(); // Call after stats/boss status are loaded

    // Initialize dynamic content areas
    initShop();
    initAchievements(); // Initialize based on loaded/default state
    renderSkillBar(); // Render skill bar based on loaded/default known skills

    // Set up event listeners
    setupEventListeners(); // Must be called after elements are assigned in DOMContentLoaded

    // Initialize audio and apply settings
    initAudio(); // Sets initial volumes
    applySettings(); // Apply loaded settings like dark mode, also updates UI controls

    // Spawn initial enemy or show appropriate screen based on loaded state
    // Switch screen first based on loaded state
    switchScreen(gameState.currentScreen || 'battle'); // Default to battle if undefined

    if (gameState.currentScreen === 'battle' && !gameState.enemy) {
        // Only spawn if on battle screen and no enemy was loaded/persisted
        spawnEnemy();
    } else if (gameState.enemy) {
        // If an enemy was loaded (though we clear it now), update its display just in case
        updateEnemyHpDisplay();
        // Ensure battle buttons reflect turn state if resuming mid-battle was intended (now defaults to player turn)
        setBattleButtonsState(gameState.battle?.playerTurn || true);
    }


    console.log("Game Initialized.");
    // Music start deferred to user interaction handled by ensureBgmStart
}

// --- Event Listeners --- (Revised)
function setupEventListeners() {
    console.log("Setting up event listeners..."); // Keep console log for debugging setup issues

    // Navigation (Add null checks)
    if (elements.battleBtn) elements.battleBtn.addEventListener('click', () => switchScreen('battle'));
    if (elements.shopBtn) elements.shopBtn.addEventListener('click', () => switchScreen('shop'));
    if (elements.achievementsBtn) elements.achievementsBtn.addEventListener('click', () => switchScreen('achievements'));
    if (elements.settingsBtn) elements.settingsBtn.addEventListener('click', () => switchScreen('settings'));

    // Battle Actions (Add null checks and correct function calls)
    if (elements.attackBtn) elements.attackBtn.addEventListener('click', () => performAttack('basic'));
    if (elements.specialBtn) elements.specialBtn.addEventListener('click', () => performAttack('special'));
    if (elements.defendBtn) elements.defendBtn.addEventListener('click', () => performDefend()); // Corrected: Call performDefend

    // Shop (Add null check)
    if (elements.shopCategories) {
        elements.shopCategories.forEach(category => {
            category.addEventListener('click', (e) => {
                // Ensure click is on the button itself or its child, get dataset from button
                const button = e.target.closest('.shop-category');
                if (button) {
                    const selectedCategory = button.dataset.category;
                    if (selectedCategory) { // Check if category exists before switching
                        switchShopCategory(selectedCategory);
                    }
                }
            });
        });
    }

    // Settings (Add null checks)
    if (elements.musicVolume) elements.musicVolume.addEventListener('input', updateMusicVolume);
    if (elements.sfxVolume) elements.sfxVolume.addEventListener('input', updateSfxVolume);
    if (elements.darkMode) elements.darkMode.addEventListener('change', toggleDarkMode);

    // Modals (Add null checks and ensure functions exist)
    if (elements.claimReward) elements.claimReward.addEventListener('click', claimReward); // Linked to achievement system now
    if (elements.continueBtn) elements.continueBtn.addEventListener('click', closeModal); // General close for level-up etc.
    if (elements.fightBossBtn) elements.fightBossBtn.addEventListener('click', startBossFight);
    if (elements.declineBossBtn) elements.declineBossBtn.addEventListener('click', declineBossFight); // Added listener
    if (elements.continueAfterBossBtn) elements.continueAfterBossBtn.addEventListener('click', continueAfterBossVictory);

    console.log("Event listeners setup complete."); // Confirmation log
}

// --- Switch Screen --- (Revised)
function switchScreen(screenName) {
    console.log("Switching screen to:", screenName); // Log screen switching
    // Hide all screens (Add null checks)
    if (elements.battleScreen) elements.battleScreen.classList.remove('active');
    if (elements.shopScreen) elements.shopScreen.classList.remove('active');
    if (elements.achievementsScreen) elements.achievementsScreen.classList.remove('active');
    if (elements.settingsScreen) elements.settingsScreen.classList.remove('active');

    // Remove active class from all buttons (Add null checks)
    if (elements.battleBtn) elements.battleBtn.classList.remove('active');
    if (elements.shopBtn) elements.shopBtn.classList.remove('active');
    if (elements.achievementsBtn) elements.achievementsBtn.classList.remove('active');
    if (elements.settingsBtn) elements.settingsBtn.classList.remove('active');

    // Show selected screen and activate button
    let targetScreen = null;
    let targetBtn = null;

    switch (screenName) {
        case 'battle':
            targetScreen = elements.battleScreen;
            targetBtn = elements.battleBtn;
            break;
        case 'shop':
            targetScreen = elements.shopScreen;
            targetBtn = elements.shopBtn;
            break;
        case 'achievements':
            targetScreen = elements.achievementsScreen;
            targetBtn = elements.achievementsBtn;
            break;
        case 'settings':
            targetScreen = elements.settingsScreen;
            targetBtn = elements.settingsBtn;
            break;
        default:
            console.warn("Unknown screen name:", screenName, ". Defaulting to battle.");
            targetScreen = elements.battleScreen;
            targetBtn = elements.battleBtn;
            screenName = 'battle'; // Correct the state if defaulting
    }

    if (targetScreen) targetScreen.classList.add('active');
    else console.error("Target screen element not found for:", screenName);

    if (targetBtn) targetBtn.classList.add('active');
    else console.error("Target button element not found for:", screenName);

    gameState.currentScreen = screenName;
    saveGame(); // Save state when screen changes
    if (bgmStarted) playCorrectMusic(); // Play music appropriate for the new screen

    // --- FIX: Always spawn an enemy if on battle screen and none exists ---
    if (screenName === 'battle' && !gameState.enemy) {
        spawnEnemy();
    }
}

// --- Player Stats Update --- (Revised)
function updatePlayerStats() {
    if (!gameState || !gameState.player) {
        console.error("Cannot update player stats: gameState or player is missing.");
        return;
    }
    // Add null checks for each element being updated
    if (elements.gems) elements.gems.textContent = gameState.player.gems;
    if (elements.level) elements.level.textContent = gameState.player.level;

    // Calculate effective stats (base + equipment + temporary effects) - Define applyEquipmentStats if needed
    // For now, just display base stats, assuming purchaseItem modifies them directly
    if (elements.attack) elements.attack.textContent = gameState.player.attack;
    if (elements.defense) elements.defense.textContent = gameState.player.defense;
    if (elements.speed) elements.speed.textContent = gameState.player.speed;


    // Update XP bar (Add null checks and percentage calculation)
    if (elements.xpFill && gameState.player.xpToNextLevel > 0) {
        const xpPercentage = Math.min(100, Math.max(0, (gameState.player.xp / gameState.player.xpToNextLevel) * 100));
        elements.xpFill.style.width = `${xpPercentage}%`;
        // Update XP Text (assuming an element exists)
        const xpText = document.getElementById('xp-text');
        if (xpText) {
            xpText.textContent = `${gameState.player.xp} / ${gameState.player.xpToNextLevel}`;
        }
    } else if (elements.xpFill) {
        elements.xpFill.style.width = '0%'; // Handle case where xpToNextLevel might be 0 or undefined
        const xpText = document.getElementById('xp-text');
        if (xpText) xpText.textContent = `0 / 0`; // Or "Max Level"
    }


    // Call function to update player HP display
    updatePlayerHpDisplay();
}

// --- Player HP Bar Display Function --- (Revised)
function updatePlayerHpDisplay() {
    if (!elements.healthFill) {
        // console.warn("Player health bar element ('health-fill') not found."); // Reduce noise
        return;
    }
    try {
        const currentHealth = Math.max(0, Number(gameState.player.health) || 0); // Ensure non-negative
        const maxHealth = Number(gameState.player.maxHealth) || 1; // Avoid division by zero
        const healthPercentage = Math.max(0, Math.min(100, (currentHealth / maxHealth) * 100));

        elements.healthFill.style.width = `${healthPercentage}%`;

        // Update HP Text (e.g., "85 / 100")
        const hpText = document.getElementById('player-hp-text');
        if (hpText) {
             hpText.textContent = `${Math.round(currentHealth)} / ${Math.round(maxHealth)}`;
        }

        // Update HP % text (Optional, if element exists)
        const hpPercentElem = elements.playerHpPercent; // Use cached element
        if (hpPercentElem) {
            hpPercentElem.textContent = `${Math.round(healthPercentage)}%`;
            // Optional: Change color based on health
            hpPercentElem.style.color = healthPercentage < 30 ? '#ff416c' : '#fff';
            elements.healthFill.style.background = healthPercentage < 30 ? 'linear-gradient(90deg, #ff416c, #e63946)' : 'linear-gradient(90deg, #a8e063, #56ab2f)';
        }
    } catch (error) {
        console.error("Error updating player HP display:", error);
    }
}

// --- Enemy HP Bar Display Function --- (Revised)
function updateEnemyHpDisplay() {
    const bar = elements.enemyHpBarFill; // Use cached element
    const percent = elements.enemyHpBarPercent; // Use cached element

    if (!bar || !percent) {
        // console.warn("Enemy HP bar elements not found."); // Reduce noise
        return;
    }

    if (gameState.enemy && gameState.enemy.maxHealth > 0) {
        try {
            const currentHealth = Math.max(0, Number(gameState.enemy.health) || 0); // Ensure non-negative
            const maxHealth = Number(gameState.enemy.maxHealth) || 1; // Avoid division by zero
            const hpPerc = Math.max(0, Math.min(100, (currentHealth / maxHealth) * 100));

            bar.style.width = hpPerc + '%';
            percent.textContent = Math.round(hpPerc) + '%'; // Round percentage for cleaner display

             // Update HP Text (e.g., "150 / 200")
            const hpText = document.getElementById('enemy-hp-text');
            if (hpText) {
                 hpText.textContent = `${Math.round(currentHealth)} / ${Math.round(maxHealth)}`;
            }

            // Update background color based on percentage
            if (hpPerc > 60) {
                bar.style.background = 'linear-gradient(90deg, #4caf50 0%, #8bc34a 100%)';
            } else if (hpPerc > 30) {
                bar.style.background = 'linear-gradient(90deg, #ff9800 0%, #ffc107 100%)';
            } else {
                bar.style.background = 'linear-gradient(90deg, #ff416c 0%, #ff4b2b 100%)';
            }
        } catch (error) {
            console.error("Error updating enemy HP display:", error);
            bar.style.width = '0%';
            percent.textContent = 'ERR';
            bar.style.background = '#555';
            const hpText = document.getElementById('enemy-hp-text');
            if (hpText) hpText.textContent = 'Error';
        }
    } else {
        // Handle cases where enemy is null or maxHealth is invalid (e.g., between battles)
        bar.style.width = '0%';
        percent.textContent = '--%'; // Indicate no enemy
        bar.style.background = '#555'; // Default grey background
        const hpText = document.getElementById('enemy-hp-text');
        if (hpText) hpText.textContent = '-- / --';
    }
}

// --- ENEMY GROWTH PER TURN --- (Removed - This wasn't used in battle logic, potentially unbalanced)
// function growEnemy(enemy) { ... }

// --- Sound Effect Hook --- (Revised)
// Cache for Audio objects
const sfxCache = {};
function playSfx(name) {
    if (!name || typeof name !== 'string') return; // Don't try to play if name is invalid
    if (gameState.settings.sfxVolume === 0) return; // Don't play if volume is 0
    // Check if file exists in assets/audio before playing
    const validSfx = [
        'attack.wav','special.wav','buff.wav','heal.wav','boss.wav','hydra_roar.wav','time_warp.wav','colossus_step.wav',
        'boss_victory.wav','victory_fanfare.wav','level_up.wav','move_indicator.wav','enemy_attack.wav','damage.wav','defend.wav'
    ];
    if (!validSfx.includes(name)) {
        console.warn(`SFX ${name} not found in assets/audio.`);
        return;
    }
    try {
        let audio = sfxCache[name];
        if (!audio) {
             audio = new Audio(`assets/audio/${name}`);
             sfxCache[name] = audio;
        }
        if (!audio.paused) {
            audio.pause();
            audio.currentTime = 0;
        }
        audio.volume = (gameState.settings.sfxVolume || 80) / 100;
        audio.play().catch(e => {
            if (e.name !== 'AbortError') {
                 console.warn(`SFX play failed for ${name}:`, e);
            }
        });
    } catch (e) {
        console.error(`Error playing SFX ${name}:`, e);
    }
}

// --- Particle Effects --- (Revised)
function spawnParticles(targetElem, color = '#fff', count = 18, type = 'burst') {
    // Ensure targetElem exists and is part of the DOM tree with an offsetParent
    if (!targetElem || !targetElem.offsetParent || !document.body.contains(targetElem)) {
        // console.warn("Cannot spawn particles: target element not found or not in DOM.", targetElem);
        return;
    }

    const rect = targetElem.getBoundingClientRect();
    const parentRect = targetElem.offsetParent.getBoundingClientRect();
    // Calculate center relative to the offsetParent
    const baseX = rect.left + rect.width / 2 - parentRect.left;
    const baseY = rect.top + rect.height / 2 - parentRect.top;

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle'; // Use class for base styles
        particle.style.position = 'absolute';
        // Start slightly offset from center for better visual
        particle.style.left = (baseX + (Math.random() - 0.5) * 10) + 'px';
        particle.style.top = (baseY + (Math.random() - 0.5) * 10) + 'px';
        particle.style.background = color;
        // Add glow via box-shadow
        particle.style.boxShadow = `0 0 6px 1px ${color}`;

        const angle = Math.random() * Math.PI * 2; // Random direction
        const dist = 30 + Math.random() * 40; // Spread distance
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist;

        // Use Web Animations API for better performance
        particle.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${dx}px, ${dy}px) scale(0.3)`, opacity: 0 } // Fade out and shrink
        ], {
            duration: 500 + Math.random() * 300, // Faster duration
            easing: 'cubic-bezier(0.1, 0.8, 0.7, 1)' // Ease out quad
        });

        // Remove particle after animation finishes
        setTimeout(() => particle.remove(), 800); // Adjust timing based on animation duration
        targetElem.offsetParent.appendChild(particle); // Append to the parent that handles positioning
    }
}

// --- Shop Logic --- (Revised)
// Enchantment system
const ENCHANTMENTS = {
    SHARP: { name: 'Sharp', attackBonus: 5 },
    STURDY: { name: 'Sturdy', defenseBonus: 5 },
    SWIFT: { name: 'Swift', speedBonus: 2 },
    VITAL: { name: 'Vital', healthBonus: 20 },
    ELEMENTAL: { name: 'Elemental', elementalBonus: 0.2 }
};

function enchantItem(item, enchantment) {
    if (!item.enchantments) item.enchantments = [];
    item.enchantments.push(enchantment);
    
    // Apply enchantment bonuses to item effects
    if (!item.effect) item.effect = {};
    if (enchantment.attackBonus) item.effect.attack = (item.effect.attack || 0) + enchantment.attackBonus;
    if (enchantment.defenseBonus) item.effect.defense = (item.effect.defense || 0) + enchantment.defenseBonus;
    if (enchantment.speedBonus) item.effect.speed = (item.effect.speed || 0) + enchantment.speedBonus;
    if (enchantment.healthBonus) item.effect.maxHealth = (item.effect.maxHealth || 0) + enchantment.healthBonus;
    
    return item;
}

function purchaseItem(item, category) {
    // Basic implementation: deduct gems, add item/skill, apply effects
    if (!item || typeof item.price !== 'number') {
        console.error("Invalid item passed to purchaseItem:", item);
        addToBattleLog('Error purchasing item.', 'system');
        return false; // Indicate failure
    }

    if (gameState.player.gems < item.price) {
        addToBattleLog('Not enough gems!', 'system'); // Use 'system' for shop messages maybe?
        return false; // Indicate failure
    }
    gameState.player.gems -= item.price;
    gameState.player.gems = Math.floor(gameState.player.gems); // Prevent float errors

    let purchased = false;
    if (category === 'skills') {
        // Check if skill is already known
        if (PLAYER_SKILLS.some(s => s.id === item.id)) {
            addToBattleLog(`Skill ${item.name} already known.`, 'system');
            gameState.player.gems += item.price; // Refund gems
            return false;
        }
        // Find the skill definition from gameData.shopItems to add it correctly
        const shopSkillData = gameData.shopItems.skills.find(si => si.id === item.id);
        if (shopSkillData) {
            // Define the actual effect function here based on skill ID or other data
             let skillEffectFunc = (enemy, player) => {
                 console.warn(`Effect for purchased skill '${shopSkillData.name}' not fully implemented.`);
                 // Placeholder: damage based on player attack and a multiplier
                  let multiplier = 1.5;
                  if (item.id === 'crystal_burst') multiplier = 1.2;
                  if (item.id === 'void_shield') {
                     // Apply a defense buff effect
                     if (!player.temporaryEffects) player.temporaryEffects = {};
                     player.temporaryEffects.defenseBonus = (player.temporaryEffects.defenseBonus || 0) + (player.defense * 0.5); // Example: +50% defense next turn? Needs turn handling.
                     addToBattleLog('Void Shield enhances your defense!', 'player');
                     return 0; // No direct damage
                  }
                  if (item.id === 'hydra_frenzy') {
                    let total = 0;
                    for (let i = 0; i < 3; i++) {
                        total += Math.floor(calculateDamage(player, enemy, 0.4)); // Reduced from 0.6 to 0.4
                    }
                    addToBattleLog('Hydra Frenzy strikes 3 times with reduced power!', 'player');
                    return total;
                }
                if (item.id === 'lunar_blessing') {
                    const heal = Math.floor(player.maxHealth * 0.3);
                    player.health = Math.min(player.maxHealth, player.health + heal);
                    addToBattleLog(`Lunar Blessing heals you for ${heal} HP!`, 'player');
                    updatePlayerHpDisplay();
                    return 0;
                }
                if (item.id === 'time_warp') {
                    player.temporaryEffects.extraTurn = true;
                    addToBattleLog('Time Warp: You will get an extra turn!', 'player');
                    return calculateDamage(player, enemy, 1.0);
                }
                  const baseDmg = calculateDamage(player, enemy, multiplier);
                   // Add specific effects like debuffs here if needed
                  if (item.id === 'crystal_burst' && enemy) {
                     enemy.defense = Math.max(0, enemy.defense - 2); // Example: lower defense
                     addToBattleLog(`${enemy.name}'s defense lowered!`, 'system');
                  }
                 return baseDmg;
             };

            PLAYER_SKILLS.push({
                id: shopSkillData.id,
                name: shopSkillData.name,
                description: shopSkillData.description,
                color: '#4fc3f7', // Default or get from data if available
                sfx: 'special.wav', // Default or get from data
                effect: skillEffectFunc // Assign the defined effect
            });
            addToBattleLog(`Skill Unlocked: ${item.name}!`, 'system');
            purchased = true;
            renderSkillBar(); // Update skill bar immediately
        } else {
            console.error("Could not find shop data for skill:", item.id);
            gameState.player.gems += item.price; // Refund gems if skill data is missing
            addToBattleLog(`Error unlocking skill ${item.name}.`, 'system');
            return false;
        }

    } else if (category === 'potions') {
        // Apply immediate effects for specific potions
        if (item.effect?.health) { // Use optional chaining
             const healAmount = Math.min(item.effect.health, gameState.player.maxHealth - gameState.player.health);
             if (healAmount > 0) {
                 gameState.player.health += healAmount;
                 addToBattleLog(`Used ${item.name}, restored ${healAmount} HP.`, 'system');
                 updatePlayerHpDisplay(); // Update health bar immediately
                 purchased = true;
             } else {
                 addToBattleLog(`${item.name} had no effect (already at full health).`, 'system');
                  gameState.player.gems += item.price; // Refund if no effect
                 return false;
             }
         } else if (item.effect?.maxHealth) {
             gameState.player.maxHealth += item.effect.maxHealth;
             gameState.player.health += item.effect.maxHealth; // Also heal the increased amount
             addToBattleLog(`Used ${item.name}, permanently increased Max HP by ${item.effect.maxHealth}.`, 'system');
             purchased = true;
         } else if (item.effect?.tempAttack) {
             // How to handle temp effects? Store a flag/value in gameState.player.temporaryEffects?
             // This needs to be applied at the start of the next battle.
              if (!gameState.player.temporaryEffects) gameState.player.temporaryEffects = {};
              gameState.player.temporaryEffects.attackBonus = (gameState.player.temporaryEffects.attackBonus || 0) + item.effect.tempAttack;
              addToBattleLog(`Used ${item.name}. Attack will be boosted by ${item.effect.tempAttack} in the next battle.`, 'system');
              purchased = true;
         } else {
             // Add other potion types or add to inventory if they are usable items
             gameState.player.inventory.push({ ...item, type: 'potion' }); // Store in inventory
             addToBattleLog(`Purchased ${item.name}. Check inventory to use.`, 'system');
             purchased = true; // Assume successful purchase even if just added to inventory
         }

    } else if (category === 'weapons' || category === 'armor') {
        // Equip directly for simplicity, unequip old item first
        const itemType = category === 'weapons' ? 'weapon' : 'armor';
        const currentItem = gameState.player.equipment[itemType];

        // Unequip previous item first and remove its stats
        if (currentItem && currentItem.effect) {
            Object.keys(currentItem.effect).forEach(stat => {
                if (stat in gameState.player && typeof gameState.player[stat] === 'number') {
                    gameState.player[stat] -= currentItem.effect[stat];
                } else if (stat === 'maxHealth') {
                    gameState.player.maxHealth -= currentItem.effect[stat];
                }
                // Ensure stats don't go below base minimums after unequipping?
                gameState.player.attack = Math.max(1, gameState.player.attack);
                gameState.player.defense = Math.max(0, gameState.player.defense);
                gameState.player.speed = Math.max(1, gameState.player.speed);
                gameState.player.maxHealth = Math.max(1, gameState.player.maxHealth);
            });
             // Ensure health doesn't exceed new maxHealth after unequipping
            gameState.player.health = Math.min(gameState.player.health, gameState.player.maxHealth);
        }
        // Equip new item
        gameState.player.equipment[itemType] = item;
        // Apply new item stats
        if (item.effect) {
            Object.keys(item.effect).forEach(stat => {
                if (stat in gameState.player && typeof gameState.player[stat] === 'number') {
                    gameState.player[stat] += item.effect[stat];
                } else if (stat === 'maxHealth') {
                    gameState.player.maxHealth += item.effect[stat];
                    // Heal the amount of max health gained when equipping for QoL
                    gameState.player.health += item.effect[stat];
                }
            });
        }
        addToBattleLog(`Equipped ${item.name}!`, 'system');
        purchased = true;

    } else {
        // Generic item purchase - add to inventory
        gameState.player.inventory.push(item);
        addToBattleLog(`Purchased ${item.name}. Added to inventory.`, 'system');
        purchased = true;
    }

    if (purchased) {
        updatePlayerStats(); // Update display after any successful purchase/equip/use
        // --- Update achievements for shopaholic and skill_collector ---
        if (category === 'skills') {
            updateAchievementProgress('skill_collector', PLAYER_SKILLS.length);
        }
        // Count all items bought (inventory + equipped + skills - 2 default skills)
        let itemsBought = (gameState.player.inventory?.length || 0) + (gameState.player.equipment.weapon ? 1 : 0) + (gameState.player.equipment.armor ? 1 : 0) + (PLAYER_SKILLS.length - 2);
        updateAchievementProgress('shopaholic', itemsBought);
        saveGame();
        return true; // Indicate success
    } else {
        // If purchase failed somehow (e.g., skill data missing, refund handled above), ensure gems were refunded if necessary
        return false;
    }
}


// --- Audio Logic --- (Revised)
function playBattleMusic() {
    // Add null checks and catch playback errors
    if (elements.backgroundMusic) elements.backgroundMusic.pause();
    if (elements.bossMusic) elements.bossMusic.pause();
    if (elements.battleMusic) {
        // Only restart if it's not already playing the battle theme
        if (elements.battleMusic.paused) {
             elements.battleMusic.currentTime = 0;
        }
        elements.battleMusic.volume = (gameState.settings.musicVolume || 70) / 100;
        elements.battleMusic.loop = true; // Ensure looping
        elements.battleMusic.play().catch(e => console.warn("Battle music playback failed:", e));
    } else {
        console.warn("Battle music element not found.");
    }
}
function playBackgroundMusic() {
    // Add null checks and catch playback errors
    if (elements.battleMusic) elements.battleMusic.pause();
    if (elements.bossMusic) elements.bossMusic.pause();
    if (elements.backgroundMusic) {
         if (elements.backgroundMusic.paused) {
            elements.backgroundMusic.currentTime = 0;
        }
        elements.backgroundMusic.volume = (gameState.settings.musicVolume || 70) / 100;
        elements.backgroundMusic.loop = true; // Ensure looping
        elements.backgroundMusic.play().catch(e => console.warn("Background music playback failed:", e));
    } else {
        console.warn("Background music element not found.");
    }
}
function playBossMusic() { // Specific function for boss music
    if (elements.backgroundMusic) elements.backgroundMusic.pause();
    if (elements.battleMusic) elements.battleMusic.pause();
    if (elements.bossMusic) {
         if (elements.bossMusic.paused) {
            elements.bossMusic.currentTime = 0;
        }
        elements.bossMusic.volume = (gameState.settings.musicVolume || 70) / 100;
        elements.bossMusic.loop = true;
        elements.bossMusic.play().catch(e => console.warn("Boss music playback failed:", e));
    } else {
        console.warn("Boss music element not found.");
    }
}

// --- Reliable BGM Start --- (Revised)
let bgmStarted = false;
function playCorrectMusic() {
    if (!bgmStarted) {
        console.log("BGM start deferred until user interaction.");
        return; // Don't play yet
    }
    // console.log("Playing correct music for screen:", gameState.currentScreen, " Enemy is boss?", gameState.enemy?.isBoss);

    // Determine which music should play
    let musicToPlay = null;
    let currentMusic = null; // Track currently playing music

    // Find currently playing music
     if(elements.backgroundMusic && !elements.backgroundMusic.paused) currentMusic = elements.backgroundMusic;
     else if(elements.battleMusic && !elements.battleMusic.paused) currentMusic = elements.battleMusic;
     else if(elements.bossMusic && !elements.bossMusic.paused) currentMusic = elements.bossMusic;


    if (gameState.currentScreen === 'battle') {
        // Check if the current enemy is a boss
        if (gameState.enemy && gameState.enemy.isBoss) {
            musicToPlay = elements.bossMusic;
        } else {
            musicToPlay = elements.battleMusic;
        }
    } else {
        // Play background music for shop, achievements, settings etc.
        musicToPlay = elements.backgroundMusic;
    }

    // Only switch if the target music is different from current or if nothing is playing
    if (musicToPlay && musicToPlay !== currentMusic) {
        // Pause all music first
        if (elements.backgroundMusic) elements.backgroundMusic.pause();
        if (elements.battleMusic) elements.battleMusic.pause();
        if (elements.bossMusic) elements.bossMusic.pause();

        // Play the correct one if found
        musicToPlay.volume = (gameState.settings.musicVolume || 70) / 100;
        if (musicToPlay.paused) musicToPlay.currentTime = 0; // Restart if paused
        musicToPlay.loop = true;
        musicToPlay.play().catch(e => console.warn("Music playback failed:", e));
         console.log("Switched music to:", musicToPlay.id);
    } else if (!currentMusic && musicToPlay) {
         // If nothing was playing, start the correct music
         musicToPlay.volume = (gameState.settings.musicVolume || 70) / 100;
         if (musicToPlay.paused) musicToPlay.currentTime = 0;
         musicToPlay.loop = true;
         musicToPlay.play().catch(e => console.warn("Music playback failed:", e));
         console.log("Started music:", musicToPlay.id);
    }
    // else { console.log("Correct music already playing or no music element found."); }
}
function ensureBgmStart() {
    if (!bgmStarted) {
        console.log("User interaction detected, enabling BGM.");
        bgmStarted = true;
        // Try to play the correct music immediately
        playCorrectMusic();
        // Remove the listeners after first interaction to avoid multiple triggers
        document.removeEventListener('click', ensureBgmStart);
        document.removeEventListener('keydown', ensureBgmStart);
    }
}
// Add listeners to detect first user interaction for audio autoplay policies
document.addEventListener('click', ensureBgmStart, { once: true });
document.addEventListener('keydown', ensureBgmStart, { once: true });

// --- Get Selected Skill --- (Revised)
function getSelectedSkill() {
    // Check if PLAYER_SKILLS is populated and selectedSkill is valid within it
    if (!Array.isArray(PLAYER_SKILLS) || PLAYER_SKILLS.length === 0) {
        console.warn("PLAYER_SKILLS array is empty or invalid.");
        selectedSkill = null; // No skills available
        renderSkillBar(); // Update display to show no skills
        return null;
    }
    // Check if selectedSkill is currently valid (exists in the PLAYER_SKILLS array)
    if (!selectedSkill || !PLAYER_SKILLS.find(s => s.id === selectedSkill.id)) {
        // If not valid, default to the first skill in the current list
        selectedSkill = PLAYER_SKILLS[0];
        console.log("Selected skill was invalid or missing, reset to:", selectedSkill ? selectedSkill.name : 'None');
        renderSkillBar(); // Re-render the bar to show the reset selection
    }
    return selectedSkill;
}

// --- Move Indicator --- (Revised)
function showMoveIndicator(targetElem, moveName, color) {
    if (!targetElem || !targetElem.offsetParent || !document.body.contains(targetElem)) return;
    playSfx('move_indicator.wav');
    const indicator = document.createElement('div');
    indicator.textContent = moveName;
    indicator.className = 'move-indicator';
    indicator.style.position = 'absolute';
    indicator.style.left = '50%';
    indicator.style.top = '0%';
    indicator.style.transform = 'translate(-50%, -150%)';
    indicator.style.background = color || '#23234a';
    indicator.style.opacity = '0';
    targetElem.offsetParent.appendChild(indicator);
    requestAnimationFrame(() => {
        indicator.style.transform = 'translate(-50%, -110%)';
        indicator.style.opacity = '1';
    });
    setTimeout(() => {
        indicator.style.transform = 'translate(-50%, -80%)';
        indicator.style.opacity = '0';
    }, 800);
    setTimeout(() => {
        indicator.remove();
    }, 1400);
}


// --- Damage Formula Rework --- (Revised)
// Combat combo tracking
let comboCount = 0;
let lastAttackTime = 0;
const COMBO_WINDOW = 2000; // 2 seconds to maintain combo

// Elemental system
const ELEMENTS = {
    NEUTRAL: 'neutral',
    FIRE: 'fire',
    ICE: 'ice',
    LIGHTNING: 'lightning',
    SHADOW: 'shadow',
    LIGHT: 'light'
};

const ELEMENT_ADVANTAGES = {
    [ELEMENTS.FIRE]: ELEMENTS.ICE,
    [ELEMENTS.ICE]: ELEMENTS.LIGHTNING,
    [ELEMENTS.LIGHTNING]: ELEMENTS.SHADOW,
    [ELEMENTS.SHADOW]: ELEMENTS.LIGHT,
    [ELEMENTS.LIGHT]: ELEMENTS.FIRE
};

function calculateDamage(attacker, defender, movePower = 1) {
    if (!attacker || !defender) {
        console.error("Invalid attacker or defender provided to calculateDamage");
        return 1; // Return minimal damage on error
    }

    // Combo system
    const now = Date.now();
    if (now - lastAttackTime <= COMBO_WINDOW) {
        comboCount++;
        if (comboCount > 1) {
            movePower *= (1 + (comboCount * 0.1)); // 10% more damage per combo
            showMoveIndicator(elements.playerAvatar, `Combo x${comboCount}!`, '#ff9800');
        }
    } else {
        comboCount = 1;
    }
    lastAttackTime = now;

    // Elemental advantage calculation
    const attackerElement = attacker.element || ELEMENTS.NEUTRAL;
    const defenderElement = defender.element || ELEMENTS.NEUTRAL;
    if (ELEMENT_ADVANTAGES[attackerElement] === defenderElement) {
        movePower *= 1.5;
        showMoveIndicator(elements.enemyAvatar, "Super Effective!", '#4caf50');
    }
    // Ensure temporary effects objects exist
     if (!attacker.temporaryEffects) attacker.temporaryEffects = {};
     if (!defender.temporaryEffects) defender.temporaryEffects = {};

    // Use base stats + temporary effects
    const attackerAttack = (attacker.attack || 0) + (attacker.temporaryEffects?.attackBonus || 0);
    const defenderDefense = (defender.defense || 0) + (defender.temporaryEffects?.defenseBonus || 0);
    const defenderMaxHealth = defender.maxHealth || 100; // Default if maxHealth is missing

    // Soft cap for attack: after 50, each point is worth less (using sqrt)
    const softCap = 50;
    let effectiveAttack = attackerAttack <= softCap
        ? attackerAttack
        : softCap + Math.sqrt(attackerAttack - softCap);

    // Defense effectiveness (slightly increased base effectiveness)
    let effectiveDefense = defenderDefense * 1.1;
    // Check for defense state
    if (defender === gameState.player && gameState.battle?.playerDefending) {
        effectiveDefense *= 1.5; // Player is defending
    }
    // Add similar check for enemy defending if applicable (needs gameState.battle.enemyDefending)
    // else if (defender === gameState.enemy && gameState.battle?.enemyDefending) { effectiveDefense *= 1.5; }


    // Base damage calculation (ensure non-negative result before scaling)
    const base = Math.max(1, (effectiveAttack * movePower) - (effectiveDefense * 0.85));

    // Logarithmic scaling factor (adjusted, ensures scale >= 1)
    const logScale = Math.log2(1 + Math.max(0, effectiveAttack - effectiveDefense) + 1) * 0.9 + 1;

    let dmg = Math.floor(base * logScale);

    // Minimum and Maximum damage (percentage of defender's MAX health)
    const minDmg = Math.max(1, Math.floor(defenderMaxHealth * 0.02)); // Min 1 damage or 2% max HP
    const maxDmg = Math.max(minDmg + 1, Math.floor(defenderMaxHealth * 0.30)); // Max 30% max HP (but always more than min)

    // Apply variance (e.g., +/- 10%) for less predictable damage
    const variance = (Math.random() * 0.2) - 0.1; // -0.1 to +0.1
    dmg = Math.floor(dmg * (1 + variance));

    // Clamp final damage between min and max
    dmg = Math.max(minDmg, Math.min(maxDmg, dmg));

    // Final check ensure damage is at least 1
    dmg = Math.max(1, dmg);

    return dmg;
}

// --- BOSS STATUS TRACKER --- (Revised - Integrated into init/load/save)
function ensureBossStatusInitialized() {
    // Ensure gameState.bossStatus exists
    if (!gameState.bossStatus) {
        gameState.bossStatus = {};
    }

     // Check if migration from old `defeatedBosses` array is needed (only on first load potentially)
     if (gameState.defeatedBosses && Array.isArray(gameState.defeatedBosses)) {
         console.log("Migrating old defeatedBosses array to new bossStatus object.");
         (gameData.bosses || []).forEach(boss => {
             if (gameState.defeatedBosses.includes(boss.id) && gameState.bossStatus[boss.id] !== 'defeated') {
                 gameState.bossStatus[boss.id] = 'defeated';
             }
         });
         delete gameState.defeatedBosses; // Remove old array after migration
     }

     // Ensure all bosses defined in gameData have an entry (pending, declined, or defeated)
     (gameData.bosses || []).forEach(boss => {
        if (!(boss.id in gameState.bossStatus)) {
            console.warn(`Boss ${boss.id} missing from bossStatus, initializing as 'pending'.`);
            gameState.bossStatus[boss.id] = 'pending';
        }
    });
}

// --- Boss Intro / Victory Modals --- (Revised)
function showBossIntro(boss) {
    // Ensure modal element exists
    if (!elements.bossIntroModal) {
        console.error("Boss Intro Modal element not found!");
        startBossFight(); // Auto-start fight as fallback if modal missing? Risky.
        return;
    }
    console.log("Showing intro for boss:", boss.name);
    // Populate modal content (add null checks for content elements)
    if (elements.bossName) elements.bossName.textContent = boss.name;
    if (elements.bossAvatar) elements.bossAvatar.style.backgroundImage = `url('${boss.image}')`;
    if (elements.bossDescription) elements.bossDescription.textContent = boss.description || 'A fearsome foe approaches!';
    // Display the modal
    elements.bossIntroModal.classList.add('active');
    // Ensure fight/decline buttons are visible/enabled if needed
    if (elements.fightBossBtn) elements.fightBossBtn.disabled = false;
    if (elements.declineBossBtn) elements.declineBossBtn.disabled = false;
}

function showBossVictoryModal(boss) {
    const modal = elements.bossVictoryModal;
    if (!modal) {
        console.error("Boss Victory Modal element not found!");
        continueAfterBossVictory();
        return;
    }
    console.log("Showing victory modal for boss:", boss.name);
    if (elements.bossVictoryAvatar) elements.bossVictoryAvatar.style.backgroundImage = `url('${boss.image || ''}')`;
    if (elements.bossVictoryReward) elements.bossVictoryReward.textContent = `Reward: +${boss.gems || 0} Gems, +${boss.xp || 0} XP!`;
    if (elements.bossMusic) elements.bossMusic.pause();
    // Play boss victory SFX
    if (sfxCache['boss_victory.wav']) playSfx('boss_victory.wav');
    else playSfx('victory_fanfare.wav');
    modal.classList.add('active');
}

// --- Decline Boss Button Logic --- (Revised)
function declineBossFight() {
    if (!elements.bossIntroModal) {
        console.error("Boss Intro Modal not found for declining.");
        return;
    }
    elements.bossIntroModal.classList.remove('active');
    const boss = gameState.enemy; // Assumes the boss is currently set as the enemy in the intro phase
    if (boss && boss.isBoss) {
        console.log("Player declined boss fight:", boss.name);
        ensureBossStatusInitialized(); // Make sure status object exists
        gameState.bossStatus[boss.id] = 'declined'; // Mark as declined
        addToBattleLog(`You cautiously retreat from ${boss.name}... for now.`, 'system');
        updateBossIndicator(); // Update indicator to show next available boss
        gameState.enemy = null; // Clear the boss enemy state as we are not fighting it now

        // Spawn a regular enemy instead after a short delay
        setBattleButtonsState(false); // Disable buttons during transition
        setTimeout(() => {
            spawnEnemy(true); // Pass flag to force regular enemy spawn
            // spawnEnemy should set playerTurn and enable buttons
        }, 1000);
        saveGame();
        playCorrectMusic(); // Switch back to regular music if needed
    } else {
        console.warn("Decline button clicked, but no boss was active in gameState.enemy during intro.");
        // Fallback: Ensure an enemy is present if something went wrong
        spawnEnemy(true); // Force regular spawn
    }
}


// --- Update Next Boss Indicator --- (Revised)
function updateBossIndicator() {
    let indicator = document.getElementById('boss-indicator');
    if (!indicator) {
        const header = document.querySelector('header'); // Find header element
        if (!header) {
             console.warn("Header element not found for boss indicator creation.");
             return; // Cannot add indicator if header is missing
        }
        indicator = document.createElement('div');
        indicator.id = 'boss-indicator';
        // Apply styles via CSS classes preferably, but fallback to inline for now
        // Use CSS for styles: .boss-indicator { ... } .boss-indicator.pending { ... } etc.
        indicator.className = 'boss-indicator'; // Base class
        header.appendChild(indicator);
    }

    ensureBossStatusInitialized(); // Make sure status is set

    // Find the next boss based on unlock level and status (pending > declined > defeated)
    let nextBoss = null;
    let nextBossLevel = Infinity;
    let nextBossStatus = '';

     // Iterate through bosses in defined order
     for (const boss of gameData.bosses) {
         const status = gameState.bossStatus[boss.id];
         if (status !== 'defeated') {
             // Found a non-defeated boss, this is potentially the next one
             nextBoss = boss;
             nextBossLevel = boss.unlockLevel;
             nextBossStatus = status; // Store 'pending' or 'declined'
             break; // Stop at the first non-defeated boss in the list
         }
     }

    // Update indicator text and style based on the found boss
    indicator.classList.remove('available', 'pending', 'declined', 'defeated'); // Clear old status classes

    if (!nextBoss) {
        indicator.textContent = `All Bosses Defeated!`;
        indicator.classList.add('defeated');
    } else if (gameState.player.level < nextBossLevel) {
        indicator.textContent = `Next Boss: Lvl ${nextBossLevel} (${nextBossLevel - gameState.player.level} levels)`;
        indicator.classList.add('pending');
    } else {
        // Player level is high enough for the next available boss
        const statusText = nextBossStatus === 'declined' ? ' (Declined - Ready!)' : ' (Ready!)';
        indicator.textContent = `Boss Available: ${nextBoss.name}${statusText}`;
        indicator.classList.add('available');
        if (nextBossStatus === 'declined') {
            indicator.classList.add('declined'); // Add extra class for declined styling if needed
        }
    }
}


// --- BATTLE LOGIC --- (Revised with Turn Structure)

// Helper to enable/disable battle action buttons
function setBattleButtonsState(enabled) {
    if(elements.attackBtn) elements.attackBtn.disabled = !enabled;
    if(elements.specialBtn) elements.specialBtn.disabled = !enabled;
    if(elements.defendBtn) elements.defendBtn.disabled = !enabled;
}

// Revised Battle Log
function addToBattleLog(message, who = 'system') {
    const turnBox = elements.pokemonTurnBox; // Use cached element
    if (turnBox) {
        // Simple update for now, can add animations later
        turnBox.innerHTML = `<span class="turn-message ${who}">${message}</span>`;
        // Add class to trigger CSS animation
        turnBox.classList.remove('turn-updated'); // Remove class to allow re-triggering
        void turnBox.offsetWidth; // Trigger reflow
        turnBox.classList.add('turn-updated'); // Add class for animation
    } else {
        // Fallback to console logging if the element isn't found
        console.log(`[BattleLog][${who}]`, message);
    }

    // Optional: Keep a history in the old battle log if it still exists
    const oldLog = elements.battleLog; // Assuming elements.battleLog is the old scrollable log
    if (oldLog) {
        const msgDiv = document.createElement('div');
        // Add timestamp and source for clarity in the old log
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit'});
        msgDiv.innerHTML = `<span>[${time}]</span> <span class="log-${who}">${message}</span>`;
        oldLog.appendChild(msgDiv);
        oldLog.scrollTop = oldLog.scrollHeight; // Auto-scroll
    }
}


function performAttack(attackType) {
    try {
        if (!gameState.battle?.playerTurn || !gameState.enemy || gameState.enemy.health <= 0) {
            console.log("Cannot attack: Not player's turn, no enemy, or enemy defeated.");
            return;
        }

        // Add attack animation class
        if (elements.playerAvatar) {
            elements.playerAvatar.classList.add('attack-flash');
            setTimeout(() => elements.playerAvatar.classList.remove('attack-flash'), 300);
        }

        // Update UI to show action is happening
        if (elements.battleInfo) {
            elements.battleInfo.textContent = "Attacking...";
            elements.battleInfo.classList.add('attacking');
        }
    console.log(`Player performs ${attackType} attack.`);
    setBattleButtonsState(false); // Disable buttons during action
    gameState.battle.playerDefending = false; // Reset defense state

    let playerDamage = 0;
    let logMessage = "";
    let particleColor = '#ff416c'; // Default attack particle color

    if (attackType === 'basic') {
        playerDamage = calculateDamage(gameState.player, gameState.enemy, 1.0); // Basic power = 1.0
        logMessage = `You attack ${gameState.enemy.name} for ${playerDamage} damage!`;
        playSfx('attack.wav');
    } else if (attackType === 'special') {
        selectedSkill = getSelectedSkill(); // Ensure skill is valid before using
        if (!selectedSkill) {
            addToBattleLog("No special skill selected or available!", 'system');
            setBattleButtonsState(true); // Re-enable buttons if skill failed
            return; // Exit early
        }
        logMessage = `You use ${selectedSkill.name} on ${gameState.enemy.name}!`;
        playSfx(selectedSkill.sfx || 'special.wav'); // Play skill sound
        particleColor = selectedSkill.color || '#ff9800'; // Use skill color for particles

        // Execute skill effect
        if (typeof selectedSkill.effect === 'function') {
            const skillResult = selectedSkill.effect(gameState.enemy, gameState.player);
            // Assuming effects return damage number or handle state changes directly
            if (typeof skillResult === 'number') {
                playerDamage = Math.max(1, Math.floor(skillResult)); // Ensure positive integer damage
                logMessage += ` Deals ${playerDamage} damage!`;
            } else {
                // Skill might apply buffs/debuffs, log message handled within effect (like void shield example)
            }
        } else {
            // Fallback if effect isn't a function (e.g., old structure or error)
            console.error(`Skill '${selectedSkill.name}' has no valid effect function.`);
            playerDamage = calculateDamage(gameState.player, gameState.enemy, 1.5); // Default special multiplier as fallback
             logMessage += ` Deals ${playerDamage} damage! (Fallback calculation)`;
        }
    }

    if (logMessage) addToBattleLog(logMessage, 'player');

    // Apply damage if any
    if (playerDamage > 0) {
        gameState.enemy.health -= playerDamage;
        playSfx('damage.wav');
        updateEnemyHpDisplay();
        if (elements.enemyAvatar) spawnParticles(elements.enemyAvatar, particleColor, 20);
    }
    renderTurnOrderBar(); // Update turn order bar after action
    if (gameState.enemy.health <= 0) {
        handleEnemyDefeat(gameState.enemy);
    } else {
        gameState.battle.playerTurn = false;
        if (elements.battleInfo) {
            elements.battleInfo.textContent = `${gameState.enemy.name}'s Turn`;
             elements.battleInfo.className = 'battle-info enemy-turn';
        }
        setTimeout(enemyTurn, 1200);
    }
}

function performDefend() {
     if (!gameState.battle?.playerTurn || !gameState.enemy || gameState.enemy.health <= 0) {
        console.log("Cannot defend: Not player's turn, no enemy, or enemy defeated.");
        return;
    }
    console.log("Player defends.");
    setBattleButtonsState(false); // Disable buttons during action resolution (enemy turn follows)
    gameState.battle.playerDefending = true; // Set defense state
    playSfx('defend.wav');
    addToBattleLog("You brace yourself for the next attack!", 'player');
    // Add visual indicator? (e.g., small shield icon near player health bar)
    const playerAvatar = document.getElementById('player-avatar');
    if(playerAvatar) spawnParticles(playerAvatar, '#4caf50', 12); // Defense particles

    // Switch to enemy's turn after a shorter delay than attack
    gameState.battle.playerTurn = false;
     if (elements.battleInfo) {
        elements.battleInfo.textContent = `${gameState.enemy.name}'s Turn`;
         elements.battleInfo.className = 'battle-info enemy-turn';
     }
    setTimeout(enemyTurn, 1000);
    renderTurnOrderBar(); // Update turn order bar after defend
}

function enemyTurn() {
    // Ensure it's actually the enemy's turn and they exist/are alive
    if (gameState.battle?.playerTurn || !gameState.enemy || gameState.enemy.health <= 0) {
        console.log("Enemy turn skipped (Not enemy turn, enemy missing, or enemy defeated).");
        // If conditions aren't met, potentially reset turn state safely
        if (!gameState.battle?.playerTurn && (!gameState.enemy || gameState.enemy.health <= 0)) {
             // Ensure turn returns to player if enemy was defeated but turn didn't switch
             gameState.battle.playerTurn = true;
             setBattleButtonsState(true);
             if (elements.battleInfo) {
                elements.battleInfo.textContent = "Your Turn";
                 elements.battleInfo.className = 'battle-info player-turn';
             }
        }
        return;
    }
    console.log("Enemy's turn:", gameState.enemy.name);

    // Choose an enemy move
    const possibleMoves = ENEMY_MOVES[gameState.enemy.id] || ENEMY_MOVES['shadow_minion']; // Fallback moves
    if (!possibleMoves || possibleMoves.length === 0) {
        console.error(`No moves defined for enemy id: ${gameState.enemy.id}`);
        addToBattleLog(`${gameState.enemy.name} hesitates, unsure what to do...`, 'enemy');
        // Return turn to player to avoid softlock
        finishEnemyTurn(); // Use helper to switch turn back
        return;
    }
    // Basic random choice - could be smarter (e.g., don't heal at full HP, use buffs early)
    const move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

    // Store the chosen move (optional, for state tracking)
    gameState.battle.enemyAction = move;

    let enemyDamage = 0;
    let logMessage = `${gameState.enemy.name} uses ${move.name}!`;
    let targetElementForParticles = document.getElementById('player-avatar') || elements.healthFill?.parentElement; // Target player visually for attacks/debuffs
    let particleColor = '#ff416c'; // Default enemy attack color

    // Execute move based on type
    switch (move.type) {
        case 'attack':
            particleColor = move.color || '#ff416c';
            enemyDamage = calculateDamage(gameState.enemy, gameState.player, move.power || 1);
            logMessage += ` Deals ${enemyDamage} damage!`;
            if (gameState.battle.playerDefending) {
                logMessage += " (Defended)";
            }
            if (targetElementForParticles) spawnParticles(targetElementForParticles, particleColor);
            playSfx('enemy_attack.wav');
            break;
        case 'buff':
             particleColor = move.color || '#4caf50';
            targetElementForParticles = elements.enemyAvatar; // Target enemy for buffs
            if (move.stat && typeof move.amount === 'number') {
                if (!gameState.enemy.temporaryEffects) gameState.enemy.temporaryEffects = {};
                // Apply buff to temporary effect bonus
                gameState.enemy.temporaryEffects[move.stat + 'Bonus'] = (gameState.enemy.temporaryEffects[move.stat + 'Bonus'] || 0) + move.amount;
                // OR modify base stats directly if buffs are permanent for the battle (less common)
                // gameState.enemy[move.stat] = (gameState.enemy[move.stat] || 0) + move.amount;
                logMessage += ` Its ${move.stat} increased!`;
                if (targetElementForParticles) spawnParticles(targetElementForParticles, particleColor);
                // Update enemy stat display if relevant elements exist (not currently standard)
            }
            break;
        case 'heal':
             particleColor = move.color || '#4caf50';
             targetElementForParticles = elements.enemyAvatar;
             if (typeof move.amount === 'number') {
                const healedAmount = Math.min(move.amount, gameState.enemy.maxHealth - gameState.enemy.health); // Don't overheal
                 if (healedAmount > 0) {
                    gameState.enemy.health += healedAmount;
                    logMessage += ` It heals for ${healedAmount} HP!`;
                     if (targetElementForParticles) spawnParticles(targetElementForParticles, particleColor, 20); // Healing particles
                    updateEnemyHpDisplay(); // Update health bar after heal
                 } else {
                     logMessage += ` ...but its health is already full!`;
                 }
             }
            break;
         case 'debuff':
             particleColor = move.color || '#a3ffae'; // Default debuff color
             if (!gameState.player.temporaryEffects) gameState.player.temporaryEffects = { poisonTurns: 0, stunTurns: 0 };
             if (move.stat === 'poison' && typeof move.amount === 'number') {
                 gameState.player.temporaryEffects.poisonTurns = Math.max(gameState.player.temporaryEffects.poisonTurns || 0, move.amount);
                 logMessage += ` You are poisoned for ${move.amount} turns!`;
                 if (targetElementForParticles) spawnParticles(targetElementForParticles, particleColor);
                 // Add visual indicator for poison?
             } else if (move.stat === 'stun' && typeof move.amount === 'number') {
                  particleColor = move.color || '#ffeb3b'; // Stun color
                 gameState.player.temporaryEffects.stunTurns = Math.max(gameState.player.temporaryEffects.stunTurns || 0, move.amount);
                 logMessage += ` You are stunned for ${move.amount} turns!`;
                 if (targetElementForParticles) spawnParticles(targetElementForParticles, particleColor);
             }
             // Add other debuff types (attack down, defense down etc.)
             /* else if (move.stat === 'defense' && move.amount < 0) { ... } */
            break;
        // Add cases for other move types (multi-hit, telegraph, etc.)
        default:
            logMessage += " ...but nothing happened?"; // Fallback for unhandled move types
            break;
    }

    if (move.sfx) playSfx(move.sfx); // Play move sound effect
    if (elements.enemyAvatar) showMoveIndicator(elements.enemyAvatar, move.name, move.color); // Show move name visually

    addToBattleLog(logMessage, 'enemy');

    // Apply damage to player if any
    if (enemyDamage > 0) {
        gameState.player.health -= enemyDamage;
        playSfx('damage.wav');
        updatePlayerHpDisplay(); // Update player HP bar
    }

    // Check for player defeat *after* direct damage/effects
    if (gameState.player.health <= 0) {
        // addToBattleLog('You have been defeated!', 'system'); // Moved to handler
        handlePlayerDefeat(); // Centralize defeat logic
        // Don't proceed further if player is defeated
    } else {
         // Apply End-of-Turn Effects (Poison, Stun decay) for BOTH player and enemy
         applyEndOfTurnEffects();

         // Check again if player was defeated by effects (like poison)
        if (gameState.player.health <= 0) {
             // addToBattleLog('You succumbed to your wounds!', 'system'); // Moved to handler
             handlePlayerDefeat();
        } else {
            // Check if player is stunned AFTER effects resolved
             if (gameState.player.temporaryEffects?.stunTurns > 0) {
                 addToBattleLog("You are stunned and cannot act!", 'system');
                 // Skip player's next turn - enemy attacks again after a delay
                 gameState.battle.playerTurn = false; // Keep it enemy's turn
                 // Reset player defense state even if stunned
                 gameState.battle.playerDefending = false;
                  if (elements.battleInfo) {
                     elements.battleInfo.textContent = `${gameState.enemy.name}'s Turn (Player Stunned)`;
                     elements.battleInfo.className = 'battle-info enemy-turn';
                  }
                 setTimeout(enemyTurn, 1200); // Another enemy turn
             } else {
                 // Return turn to player if not defeated or stunned
                 finishEnemyTurn(); // Use helper
             }
        }
    }
    // Update stats display after potential changes (like poison taking effect)
    updatePlayerStats(); // Update player stats display in case effects changed something relevant
    // Enemy stats don't have a dedicated display area other than HP bar currently
    renderTurnOrderBar(); // Update turn order bar after enemy action
}

// --- NEW: Helper to finish enemy turn and switch back to player ---
function finishEnemyTurn() {
    gameState.battle.playerTurn = true;
    gameState.battle.playerDefending = false; // Reset defense status for next player turn
    setBattleButtonsState(true); // Re-enable player buttons
    if (elements.battleInfo) {
        elements.battleInfo.textContent = "Your Turn";
        elements.battleInfo.className = 'battle-info player-turn';
    }
    console.log("Turn returns to player.");
}


// --- NEW: End of Turn Effects ---
function applyEndOfTurnEffects() {
    console.log("Applying end-of-turn effects...");
    let playerHpChanged = false;
    let enemyHpChanged = false;

    // --- Player Effects ---
    if (gameState.player && gameState.player.temporaryEffects) {
        // Apply poison damage
        if (gameState.player.temporaryEffects.poisonTurns > 0) {
            const poisonDamage = Math.max(1, Math.floor(gameState.player.maxHealth * 0.05)); // Example: 5% max HP damage
            gameState.player.health -= poisonDamage;
            gameState.player.temporaryEffects.poisonTurns--;
            addToBattleLog(`Poison deals you ${poisonDamage} damage! (${gameState.player.temporaryEffects.poisonTurns} turns left)`, 'system');
            playerHpChanged = true;
            const playerAvatar = document.getElementById('player-avatar');
             if(playerAvatar) spawnParticles(playerAvatar, '#a3ffae', 8); // Fewer particles for tick
        }

        // Decrement stun turns
        if (gameState.player.temporaryEffects.stunTurns > 0) {
            gameState.player.temporaryEffects.stunTurns--;
             if (gameState.player.temporaryEffects.stunTurns === 0) {
                 addToBattleLog("You are no longer stunned.", 'system');
                 // Remove stun visual indicator if any
             }
        }
         // Decrement player buff/debuff durations (e.g., attackBonusDuration)
         // Example: if (gameState.player.temporaryEffects.attackBonusDuration > 0) { gameState.player.temporaryEffects.attackBonusDuration--; if (gameState.player.temporaryEffects.attackBonusDuration === 0) { remove attack bonus } }
         // Reset temporary stat bonuses if they were meant for one turn only?
         // gameState.player.temporaryEffects.attackBonus = 0; // Example: Reset per turn if not duration based
         // gameState.player.temporaryEffects.defenseBonus = 0;
    }

     // --- Enemy Effects ---
     if (gameState.enemy && gameState.enemy.temporaryEffects) {
         // Apply enemy poison tick
         if (gameState.enemy.temporaryEffects.poisonTurns > 0) {
             const enemyPoisonDamage = Math.max(1, Math.floor(gameState.enemy.maxHealth * 0.05));
             gameState.enemy.health -= enemyPoisonDamage;
             gameState.enemy.temporaryEffects.poisonTurns--;
             addToBattleLog(`${gameState.enemy.name} takes ${enemyPoisonDamage} poison damage! (${gameState.enemy.temporaryEffects.poisonTurns} turns left)`, 'system');
             enemyHpChanged = true;
              if(elements.enemyAvatar) spawnParticles(elements.enemyAvatar, '#a3ffae', 8);
         }
         // Decrement enemy stun turns
         if (gameState.enemy.temporaryEffects.stunTurns > 0) {
            gameState.enemy.temporaryEffects.stunTurns--;
              if (gameState.enemy.temporaryEffects.stunTurns === 0) {
                 addToBattleLog(`${gameState.enemy.name} is no longer stunned.`, 'system');
             }
         }
         // Decrement enemy buff/debuff durations
         // gameState.enemy.temporaryEffects.attackBonus = 0; // Example: Reset per turn
         // gameState.enemy.temporaryEffects.defenseBonus = 0;
     }

     // Update health displays only if they changed
     if (playerHpChanged) updatePlayerHpDisplay();
     if (enemyHpChanged) updateEnemyHpDisplay();
}


// --- Centralized Defeat Handlers --- (Revised)
function handleEnemyDefeat(defeatedEnemy) {
    console.log(`Handling defeat of: ${defeatedEnemy.name}`);
    addToBattleLog(`You defeated ${defeatedEnemy.name}!`, 'system'); // Log defeat message here

    // Award XP and Gems
    const xpGained = defeatedEnemy.xp || 0;
    const gemsGained = defeatedEnemy.gems || 0;
    gameState.player.xp += xpGained;
    gameState.player.gems += gemsGained;

    // Update game progress stats
    gameState.gameProgress.enemiesDefeated++;
    gameState.gameProgress.gemsCollected += gemsGained;
    gameState.gameProgress.highestLevel = Math.max(gameState.gameProgress.highestLevel, gameState.player.level);

    // Update specific enemy defeat counts for achievements if needed
    updateAchievementProgress('first_blood', 1); // Increment first blood counter
    if (defeatedEnemy.id === 'shadow_minion') {
        updateAchievementProgress('shadow_hunter', 1); // Increment shadow hunter counter
    }
    // Update total gems collected achievement
    updateAchievementProgress('gem_collector', gameState.gameProgress.gemsCollected);


    addToBattleLog(`Gained ${xpGained} XP and ${gemsGained} Gems.`, 'system');

    // Clear the defeated enemy reference *before* potential modals/spawns
    const wasBoss = defeatedEnemy.isBoss;
    const bossId = defeatedEnemy.id;
    gameState.enemy = null; // Clear defeated enemy

    // Update stats display and check for level up (might show level up modal)
    updatePlayerStats();
    checkLevelUp(); // Check immediately after gaining XP

    // Handle boss-specific defeat logic
    if (wasBoss) {
        console.log("Defeated enemy was a boss.");
        ensureBossStatusInitialized();
        gameState.bossStatus[bossId] = 'defeated';
        gameState.gameProgress.bossesDefeated++;
        updateAchievementProgress('boss_slayer', 1); // Increment first boss defeat counter

        showBossVictoryModal(defeatedEnemy); // Show victory screen (uses data passed in)
        updateBossIndicator();
        saveGame();
        // Don't spawn next enemy yet, wait for modal confirmation (handled by continueAfterBossVictory)
        setBattleButtonsState(false); // Keep buttons disabled until player continues
    } else {
        // Regular enemy defeated, spawn next one after a short delay
        console.log("Regular enemy defeated, spawning next.");
        setBattleButtonsState(false); // Disable buttons during spawn transition
        setTimeout(() => {
            spawnEnemy(); // Spawn next enemy
            // spawnEnemy will re-enable buttons and set turn state
        }, 1500); // Delay before next enemy appears
        saveGame(); // Save progress after regular defeat resolution
    }

}

function handlePlayerDefeat() {
    // Game Over Logic
    console.error("Player Defeated! Implement Game Over logic.");
    addToBattleLog("You have fallen in battle... Game Over!", "system");
    setBattleButtonsState(false); // Disable controls

    // Options:
    // - Show a Game Over screen/modal with options (Retry from last save?, Main Menu)
    // - Reset player progress (or partial progress like losing gems/XP)
    // - Return to a main menu or checkpoint

    // For now, just stop music and log.
    if (elements.backgroundMusic) elements.backgroundMusic.pause();
    if (elements.battleMusic) elements.battleMusic.pause();
    if (elements.bossMusic) elements.bossMusic.pause();
    // playSfx('defeat.wav'); // Add if available

    // Simple Game Over screen (replace with modal later)
    const gameOverDiv = document.createElement('div');
    gameOverDiv.id = 'game-over-screen';
    gameOverDiv.innerHTML = `
        <h1>GAME OVER</h1>
        <p>You were defeated in the Shadow Realm.</p>
        <button onclick="location.reload()">Retry (Reload)</button>
    `;
    gameOverDiv.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.85); color: #ff416c; z-index: 1000;
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        text-align: center; font-family: 'Audiowide', sans-serif;
    `;
    gameOverDiv.querySelector('button').style.cssText = `
        padding: 1rem 2rem; font-size: 1.2rem; margin-top: 2rem; cursor: pointer;
        background: #ff416c; color: white; border: none; border-radius: 8px;
    `;
    document.body.appendChild(gameOverDiv);

    // Potentially clear save data? Or allow loading? For now, reload starts over or loads last save.
}


// --- Check Level Up --- (Revised)
function checkLevelUp() {
    let leveledUp = false; // Flag to check if *any* level up occurred
    // Loop in case of multiple level ups from one XP gain
    while (gameState.player.xp >= gameState.player.xpToNextLevel && gameState.player.xpToNextLevel > 0) {
        leveledUp = true;
        const remainingXp = gameState.player.xp - gameState.player.xpToNextLevel;
        gameState.player.level++;
        gameState.player.xp = remainingXp;
        // Increase XP needed for the next level (e.g., 30% increase, ensures it grows)
        gameState.player.xpToNextLevel = Math.max(10, Math.floor(gameState.player.xpToNextLevel * 1.3));

        // Grant stat increases on level up
        const attackGain = Math.floor(Math.random() * 2) + 2; // +2 or +3 attack
        const defenseGain = Math.floor(Math.random() * 2) + 1; // +1 or +2 defense
        const healthGain = 10 + Math.floor(gameState.player.level / 2); // +10 base, +1 every 2 levels
        const speedGain = (gameState.player.level % 4 === 0) ? 1 : 0; // +1 speed every 4 levels

        gameState.player.attack += attackGain;
        gameState.player.defense += defenseGain;
        gameState.player.maxHealth += healthGain;
        gameState.player.health = gameState.player.maxHealth; // Full heal on level up
        gameState.player.speed += speedGain;

        addToBattleLog(`Level Up! Reached Level ${gameState.player.level}! Stats Increased!`, 'system');
        playSfx('level_up.wav');

        // Show Level Up Modal (Ensure elements exist)
        if (elements.levelUpModal && elements.newLevel && elements.levelUpRewards && elements.continueBtn) {
            elements.newLevel.textContent = gameState.player.level;
             elements.levelUpRewards.innerHTML = `
                 <li><i class="fas fa-fist-raised"></i> +${attackGain} Attack</li>
                 <li><i class="fas fa-shield-alt"></i> +${defenseGain} Defense</li>
                 <li><i class="fas fa-heart"></i> +${healthGain} Max Health (Fully Healed!)</li>
                 ${speedGain > 0 ? `<li><i class="fas fa-running"></i> +${speedGain} Speed</li>` : ''}
             `;
            elements.levelUpModal.classList.add('active');
            setBattleButtonsState(false); // Disable battle buttons while modal is up
            // Listener for continue button is in setupEventListeners, calls closeModal
        } else {
            // If modal doesn't exist, just log stats and continue
            addToBattleLog(`Stats: +${attackGain} Atk, +${defenseGain} Def, +${healthGain} Max HP${speedGain > 0 ? `, +${speedGain} Spd` : ''}`, 'system');
        }

        // Update achievement progress for level (provide the new level)
        updateAchievementProgress('master_of_shadows', gameState.player.level);
    }

    if (leveledUp) {
        updatePlayerStats(); // Update display after all level ups are processed
        updateBossIndicator(); // Check if new boss is available
        saveGame();
        renderTurnOrderBar(); // Update turn order bar after level up
    }
}

// --- Close Modal --- (NEW - General purpose)
function closeModal() {
    console.log("Closing active modals...");
    let battleShouldResume = false; // Flag to re-enable buttons only if closing level-up modal

    // Add all modals that might use a generic close button
    if (elements.rewardModal && elements.rewardModal.classList.contains('active')) {
        elements.rewardModal.classList.remove('active');
    }
    if (elements.levelUpModal && elements.levelUpModal.classList.contains('active')) {
        elements.levelUpModal.classList.remove('active');
        battleShouldResume = true; // Closing level up should resume battle
    }
    // Note: Boss Intro and Boss Victory have specific buttons/flows handled elsewhere

    // Re-enable battle buttons if they were disabled by a modal being closed now
    // Only re-enable if it's the player's turn and there's an enemy (or preparing for one)
     if (battleShouldResume && gameState.battle?.playerTurn) {
        // Check if an enemy exists or if we are waiting for the next spawn after regular defeat
        const enemyExists = gameState.enemy && gameState.enemy.health > 0;
        // const waitingForSpawn = !gameState.enemy && !wasBoss; // Need wasBoss context here... tricky.
        // Let's simplify: re-enable if it's player's turn and an enemy exists. Spawn logic handles enabling otherwise.
        if (enemyExists) {
             setBattleButtonsState(true);
        }
    }
}


// --- Scale Enemy Stats --- (Revised)
function scaleEnemyStats(baseEnemy, playerLevel) {
    // Ensure baseEnemy and playerLevel are valid
    if (!baseEnemy || typeof playerLevel !== 'number' || playerLevel < 1) {
        console.error("Invalid input for scaleEnemyStats", baseEnemy, playerLevel);
        return { ...baseEnemy, health: baseEnemy?.health || 10, maxHealth: baseEnemy?.health || 10 }; // Return base or default
    }

    // More controlled scaling: Adjust multipliers as needed for balance
    const levelFactor = Math.max(0, playerLevel - 1); // Number of levels past 1
    const statMultiplier = 1 + 0.10 * levelFactor; // 10% Atk/Def increase per level past 1
    const healthMultiplier = 1 + 0.18 * levelFactor; // 18% health increase
    const rewardMultiplier = 1 + 0.12 * levelFactor; // 12% XP/Gem increase

    const scaledHealth = Math.max(10, Math.floor((baseEnemy.health || 10) * healthMultiplier));

    return {
        // Keep original ID, name, image, abilities etc. from baseEnemy
        health: scaledHealth, // Start with full scaled health
        maxHealth: scaledHealth,
        attack: Math.max(1, Math.floor((baseEnemy.attack || 1) * statMultiplier)),
        defense: Math.max(0, Math.floor((baseEnemy.defense || 0) * statMultiplier)),
        speed: baseEnemy.speed || 1, // Speed usually doesn't scale as much, provide default
        xp: Math.max(5, Math.floor((baseEnemy.xp || 5) * rewardMultiplier)), // Scale XP reward
        gems: Math.max(1, Math.floor((baseEnemy.gems || 1) * rewardMultiplier)) // Scale gem reward
    };
}

// --- Spawn Enemy --- (Revised)
let isSpawning = false; // Prevent concurrent spawns

function spawnEnemy(forceRegular = false) {
    if (isSpawning) {
        console.warn("Spawn already in progress, skipping.");
        return;
    }
    isSpawning = true;
    console.log("Spawning new enemy...", forceRegular ? "(Forcing regular)" : "");
    ensureBossStatusInitialized(); // Ensure boss status is available

    // Determine if a boss should spawn
    let eligibleBoss = null;
    if (!forceRegular) {
         // Find the first boss in gameData order that meets level req and is 'pending' or 'declined'
        for (const boss of gameData.bosses) {
            const status = gameState.bossStatus[boss.id];
            if (gameState.player.level >= boss.unlockLevel && (status === 'pending' || status === 'declined')) {
                eligibleBoss = boss;
                break; // Found the next available boss
            }
        }
    }

    // Reset battle state for the new encounter
    if (!gameState.battle) gameState.battle = {}; // Ensure battle state exists
    gameState.battle.playerTurn = true; // Player always starts turn against new enemy/boss
    gameState.battle.playerDefending = false;
    gameState.battle.enemyAction = null;
    // Reset player temporary effects at start of each battle
    // Keep attack bonus from elixir across battles? Needs specific handling if so.
    const attackBonusFromPotion = gameState.player.temporaryEffects?.attackBonus || 0; // Preserve potion bonus
    gameState.player.temporaryEffects = { attackBonus: attackBonusFromPotion, defenseBonus: 0, speedBonus: 0, poisonTurns: 0, stunTurns: 0 };


    // --- ENEMY SPAWN ---
    if (eligibleBoss) {
        console.log("Eligible boss found:", eligibleBoss.name);
        // Set the boss as the current enemy *before* showing intro
        gameState.enemy = {
            ...eligibleBoss, // Base boss stats
            health: eligibleBoss.health, // Reset health to max
            maxHealth: eligibleBoss.health,
            isBoss: true,
            temporaryEffects: {} // Reset boss temp effects
        };
        // Update UI for the boss *before* showing modal
        if (elements.enemyAvatar) {
             elements.enemyAvatar.style.backgroundImage = `url('${eligibleBoss.image}')`;
             elements.enemyAvatar.classList.add('boss-aura'); // Add visual cue for boss
        }
        if (elements.enemyName) elements.enemyName.textContent = eligibleBoss.name;
        updateEnemyHpDisplay(); // Show boss HP bar

        // Now show the intro modal
        showBossIntro(eligibleBoss);
        setBattleButtonsState(false); // Disable battle buttons until player chooses from modal (Fight/Decline)
        if (elements.battleInfo) elements.battleInfo.textContent = "Boss Encounter!"; // Update info
    } else {
        console.log("Spawning regular enemy.");
        // Filter available enemies (e.g., based on level, area, etc. - simple for now)
        const availableEnemies = gameData.enemies.filter(enemy => true); // No restrictions currently

        if (availableEnemies.length === 0) {
            console.error("No available regular enemies found!");
            addToBattleLog("Error: No enemies available to fight!", "system");
            gameState.enemy = null; // Clear enemy state
            setBattleButtonsState(false); // Disable buttons if no enemy
            isSpawning = false;
            return;
        }

        const randomIndex = Math.floor(Math.random() * availableEnemies.length);
        const baseEnemy = availableEnemies[randomIndex];
        const scaledEnemyStats = scaleEnemyStats(baseEnemy, gameState.player.level); // Scale stats

        gameState.enemy = {
            ...baseEnemy, // Get ID, name, image, abilities etc.
            ...scaledEnemyStats, // Apply scaled health, attack, defense, xp, gems
            isBoss: false,
            temporaryEffects: {} // Reset temp effects
        };

        console.log("Spawned:", gameState.enemy.name, "HP:", gameState.enemy.health, "Atk:", gameState.enemy.attack);
        // Update UI for regular enemy
        if (elements.enemyAvatar) {
             elements.enemyAvatar.style.backgroundImage = `url('${gameState.enemy.image}')`;
             elements.enemyAvatar.classList.remove('boss-aura'); // Ensure boss aura is removed
        }
        if (elements.enemyName) elements.enemyName.textContent = gameState.enemy.name;
        addToBattleLog(`A wild ${gameState.enemy.name} appears!`, 'system');
        updateEnemyHpDisplay();
        setBattleButtonsState(true); // Enable battle buttons for regular fights
        // Update turn indicator
        if (elements.battleInfo) {
             elements.battleInfo.textContent = "Your Turn";
              elements.battleInfo.className = 'battle-info player-turn';
        }
    }
    updatePlayerStats(); // Refresh player display (might show potion buff)
    playCorrectMusic(); // Ensure correct music plays for the new encounter
    isSpawning = false; // Allow next spawn
    renderTurnOrderBar(); // Update turn order bar after enemy spawns
}


// --- Shop / Achievement Init --- (Revised)
function initShop() {
    // Basic setup - show default category (ensure elements exist)
    if (!elements.shopItems || !elements.shopCategories) {
         console.warn("Shop elements missing, cannot initialize shop.");
         return;
     }
    // Find the first category button and trigger a click or call switch directly
    const firstCategoryBtn = elements.shopCategories[0];
    if (firstCategoryBtn && firstCategoryBtn.dataset.category) {
        switchShopCategory(firstCategoryBtn.dataset.category);
    } else {
        switchShopCategory('weapons'); // Fallback default
    }
}

function initAchievements() {
    // Basic setup - render achievements list
     if (!elements.achievementsList) {
         console.warn("Achievements list element missing.");
         return;
     }
     elements.achievementsList.innerHTML = ''; // Clear existing list

     // Use gameState.achievements which should be initialized/loaded correctly
     const achievementsToDisplay = gameState.achievements || [];

     if (achievementsToDisplay.length === 0) {
         elements.achievementsList.innerHTML = '<p>No achievements defined or loaded.</p>';
         return;
     }

     achievementsToDisplay.forEach(ach => {
         // Calculate progress percentage safely
         const progress = Number(ach.progress) || 0;
         const target = Number(ach.target) || 1; // Avoid division by zero
         const progressPercent = target > 0 ? Math.min(100, Math.max(0, (progress / target) * 100)) : (ach.unlocked ? 100 : 0);

         const achDiv = document.createElement('div');
         achDiv.className = 'achievement' + (ach.unlocked ? ' unlocked' : '') + (ach.claimed ? ' claimed' : '');
         achDiv.innerHTML = `
             <div class="achievement-icon"><i class="fas ${ach.unlocked ? 'fa-trophy' : 'fa-lock'}"></i></div>
             <div class="achievement-details">
                 <div class="achievement-name">${ach.name || 'Unnamed Achievement'}</div>
                 <div class="achievement-desc">${ach.description || ''}</div>
                 <div class="achievement-progress">
                     <div class="achievement-progress-fill" style="width:${progressPercent}%"></div>
                     <span class="achievement-progress-text">${progress} / ${target}</span>
                 </div>
                 ${ach.reward ? `<div class="achievement-reward">Reward: ${formatReward(ach.reward)}</div>` : ''}
             </div>
             <button class="claim-achievement-button" data-ach-id="${ach.id}" ${(!ach.unlocked || ach.claimed) ? 'disabled' : ''}>
                 ${ach.claimed ? 'Claimed' : (ach.unlocked ? 'Claim Reward' : 'Locked')}
             </button>
         `;

          // Add claim button listener IF the button should be enabled
         const claimBtn = achDiv.querySelector('.claim-achievement-button');
         if (claimBtn && ach.unlocked && !ach.claimed) {
            claimBtn.addEventListener('click', () => claimAchievementReward(ach.id));
         }

         elements.achievementsList.appendChild(achDiv);
     });
}

// Helper to format reward object for display
function formatReward(reward) {
    if (!reward) return '';
    let parts = [];
    if (reward.gems) parts.push(`<i class="fas fa-gem"></i> ${reward.gems}`);
    if (reward.xp) parts.push(`<i class="fas fa-star"></i> ${reward.xp} XP`);
    if (reward.attack) parts.push(`<i class="fas fa-fist-raised"></i> +${reward.attack} Atk`);
    if (reward.defense) parts.push(`<i class="fas fa-shield-alt"></i> +${reward.defense} Def`);
    // Add other potential rewards
    return parts.join(', ');
}

// Function to handle claiming achievement rewards
function claimAchievementReward(achievementId) {
     const achievement = gameState.achievements.find(ach => ach.id === achievementId);
     if (achievement && achievement.unlocked && !achievement.claimed) {
         console.log(`Claiming reward for achievement: ${achievement.name}`);
         let rewardMsg = "Reward: ";
         // Apply reward
         if (achievement.reward) {
             if (achievement.reward.gems) { gameState.player.gems += achievement.reward.gems; rewardMsg += `+${achievement.reward.gems} Gems `; }
             if (achievement.reward.xp) { gameState.player.xp += achievement.reward.xp; rewardMsg += `+${achievement.reward.xp} XP `; }
             if (achievement.reward.attack) { gameState.player.attack += achievement.reward.attack; rewardMsg += `+${achievement.reward.attack} Atk `; }
             if (achievement.reward.defense) { gameState.player.defense += achievement.reward.defense; rewardMsg += `+${achievement.reward.defense} Def `; }
             // Apply other rewards...
             addToBattleLog(`Claimed ${achievement.name}! ${rewardMsg}`, 'system'); // Use system log? Or a modal?
         }
         achievement.claimed = true; // Mark as claimed
         updatePlayerStats();
         checkLevelUp(); // Check for level up from XP reward
         initAchievements(); // Re-render achievements list to update button state
         saveGame();
     } else {
         console.warn(`Could not claim reward for achievement ID: ${achievementId}. Already claimed or not unlocked.`);
         // Optionally disable button again just in case
         const button = elements.achievementsList.querySelector(`button[data-ach-id="${achievementId}"]`);
         if (button) button.disabled = true;
     }
}


// Update achievement progress (Revised)
const MILESTONE_REWARDS = {
    ENEMIES_DEFEATED: [
        { count: 10, reward: { gems: 50, attack: 2 } },
        { count: 50, reward: { gems: 200, attack: 5 } },
        { count: 100, reward: { gems: 500, attack: 10 } }
    ],
    BOSSES_DEFEATED: [
        { count: 1, reward: { gems: 100, defense: 3 } },
        { count: 3, reward: { gems: 300, defense: 8 } },
        { count: 5, reward: { gems: 1000, defense: 15 } }
    ],
    GEMS_COLLECTED: [
        { count: 1000, reward: { maxHealth: 20 } },
        { count: 5000, reward: { maxHealth: 50 } },
        { count: 10000, reward: { maxHealth: 100 } }
    ]
};

function checkMilestoneRewards(type, value) {
    const milestones = MILESTONE_REWARDS[type];
    if (!milestones) return;

    milestones.forEach(milestone => {
        if (value >= milestone.count && !milestone.claimed) {
            milestone.claimed = true;
            // Apply rewards
            Object.entries(milestone.reward).forEach(([stat, amount]) => {
                gameState.player[stat] += amount;
            });
            addToBattleLog(`Milestone Reward: Reached ${milestone.count} ${type}!`, 'system');
            showMoveIndicator(elements.playerAvatar, 'Milestone!', '#4caf50');
        }
    });
}

function updateAchievementProgress(achievementId, value) {
    // Find achievement in gameState
    const achievement = gameState.achievements.find(ach => ach.id === achievementId);
    if (achievement && !achievement.unlocked) { // Only update if not already unlocked
         let shouldUpdateRender = false; // Flag to re-render only if progress changed

        // Handle different progress types
        if (achievementId === 'master_of_shadows') { // Tracks current level
            // Always sync to current level
            if (value !== achievement.progress) {
                achievement.progress = value;
                shouldUpdateRender = true;
            }
        } else if (achievementId === 'gem_collector') { // Tracks total gems collected
             if (value > achievement.progress) { // Only update if total increased
                 achievement.progress = value;
                 shouldUpdateRender = true;
             }
        } else { // Assumes incremental progress (enemies defeated, etc.)
            achievement.progress = (achievement.progress || 0) + value;
            shouldUpdateRender = true;
        }

        // Ensure progress doesn't exceed target visually (can happen if value jumps past target)
         achievement.progress = Math.min(achievement.progress, achievement.target);

        // Check if target is met
        if (achievement.progress >= achievement.target) {
            achievement.unlocked = true;
            addToBattleLog(`Achievement Unlocked: ${achievement.name}!`, 'system');
            playSfx('heal.wav');
            showAchievementUnlockedModal(achievement); // Show popup
            shouldUpdateRender = true;
            saveGame();
            // Always re-render achievements list so claim button is enabled immediately
            initAchievements();
        }

        // Re-render achievements list if progress changed or unlocked
        if (shouldUpdateRender && gameState.currentScreen === 'achievements') {
             initAchievements();
        }
         // Save progress even if not unlocked yet
         saveGame();
    }
}


// Switch Shop Category (Revised)
function switchShopCategory(category) {
    if (!elements.shopItems || !gameData.shopItems || !category) {
        console.error("Shop elements, data, or category missing.", category);
        return;
    }
    elements.shopItems.innerHTML = ''; // Clear current items

    // Update active category button style
    if (elements.shopCategories) {
        elements.shopCategories.forEach(btn => {
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // Get items for the selected category
    const items = gameData.shopItems[category] || [];

    // Filter items based on unlock level
     const availableItems = items.filter(item => !item.unlockLevel || gameState.player.level >= item.unlockLevel);


    if (availableItems.length === 0) {
         elements.shopItems.innerHTML = `<p>No items available in this category${items.length > 0 ? ' at your level' : ''}.</p>`;
         return;
     }

    availableItems.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'shop-item';
        // Use integer gems for comparison and display
        const playerGems = Math.floor(gameState.player.gems);
        const canAfford = playerGems >= item.price;
        // Check if skill is known only for the skills category
        const isSkillKnown = category === 'skills' && PLAYER_SKILLS.some(s => s.id === item.id);
        // Check if weapon/armor is currently equipped
        let isEquipped = false;
        if (category === 'weapons' && gameState.player.equipment.weapon?.id === item.id) isEquipped = true;
        if (category === 'armor' && gameState.player.equipment.armor?.id === item.id) isEquipped = true;


        let buttonText = 'Buy';
        let buttonDisabled = !canAfford || isSkillKnown || isEquipped;

        if (isSkillKnown) buttonText = 'Known';
        else if (isEquipped) buttonText = 'Equipped';
        else if (!canAfford) buttonText = 'Too Expensive';

        // Add special class if item is equipped
        if(isEquipped) itemDiv.classList.add('equipped');

        itemDiv.innerHTML = `
            <div class="item-image" style="background-image: url('${item.image || 'assets/images/placeholder.png'}')"></div>
            <div class="item-details">
                <div class="item-name">${item.name || 'Unknown Item'}</div>
                <div class="item-description">${item.description || ''}</div>
                 ${item.effect ? `<div class="item-effect">Effect: ${formatEffect(item.effect)}</div>` : ''}
                <div class="item-price"><i class="fas fa-gem"></i> ${item.price || '?'}</div>
                <button class="buy-button" ${buttonDisabled ? 'disabled' : ''}>${buttonText}</button>
            </div>
        `;
        // Add event listener to the buy button
        const buyBtn = itemDiv.querySelector('.buy-button');
        if (buyBtn && !buttonDisabled) { // Only add listener if button is not disabled initially
            buyBtn.addEventListener('click', () => {
                if (purchaseItem(item, category)) {
                    // If purchase is successful, refresh the shop view for this category
                    // This will update gem counts and button states
                    switchShopCategory(category); // Re-render the current category
                }
                // purchaseItem handles logging failure messages
            });
        }
        elements.shopItems.appendChild(itemDiv);
    });
}


// --- Audio Settings --- (Revised)
function initAudio() {
    // Set initial volume based on saved settings
    applySettings(); // ApplySettings handles volume now
    console.log("Audio initialized with volumes from settings.");
}

function updateMusicVolume(event) {
    // Use event value if available, otherwise use gameState value (for direct calls)
    const volume = event ? event.target.value : gameState.settings.musicVolume;
    gameState.settings.musicVolume = Number(volume); // Ensure it's a number
    // Apply volume change to currently potentially playing music
    if (elements.backgroundMusic) elements.backgroundMusic.volume = gameState.settings.musicVolume / 100;
    if (elements.battleMusic) elements.battleMusic.volume = gameState.settings.musicVolume / 100;
    if (elements.bossMusic) elements.bossMusic.volume = gameState.settings.musicVolume / 100;
    saveGame(); // Save settings change
}

function updateSfxVolume(event) {
    const volume = event ? event.target.value : gameState.settings.sfxVolume;
    gameState.settings.sfxVolume = Number(volume);
    // Play a test sound effect at the new volume
    playSfx('attack.wav'); // Play a common sound as feedback
    saveGame();
}

function toggleDarkMode(event) {
    const enabled = event ? event.target.checked : gameState.settings.darkMode;
    gameState.settings.darkMode = Boolean(enabled);
    if (enabled) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    // Save the preference
    saveGame();
    
    // Play toggle sound
    playSfx('special.wav');
}

// Add critical hit chance
function calculateDamage(attacker, defender, movePower = 1) {
    let damage = /* existing damage calculation */;
    
    // 10% chance for critical hit
    if (Math.random() < 0.1) {
        damage *= 1.5;
        // Visual effect for crit
        const targetElem = defender === gameState.player ? elements.playerAvatar : elements.enemyAvatar;
        if (targetElem) {
            targetElem.style.animation = 'criticalHit 0.3s ease';
            setTimeout(() => targetElem.style.animation = '', 300);
            addToBattleLog('Critical Hit!', 'system');
            playSfx('special.wav');
        }
    }
    
    return Math.floor(damage);
}

function applySettings() {
    console.log("Applying settings...", gameState.settings);
    // Apply loaded settings on init or when changed
    applyDarkMode(); // Apply dark mode visual change
    // Update UI controls to reflect loaded settings (ensure elements exist first)
    if(elements.musicVolume) elements.musicVolume.value = gameState.settings.musicVolume;
    if(elements.sfxVolume) elements.sfxVolume.value = gameState.settings.sfxVolume;
    if(elements.darkMode) elements.darkMode.checked = gameState.settings.darkMode;
    // Apply music volume immediately (needed if called before music plays)
    updateMusicVolume(); // Call without event to apply current gameState value
    // SFX volume is applied dynamically in playSfx based on gameState.settings.sfxVolume
}

function applyDarkMode() {
     if (gameState.settings.darkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

// --- Placeholder for claimReward --- (Now linked to achievement system)
function claimReward() {
    console.warn("claimReward function called directly but should be handled by achievement buttons.");
    // This was likely tied to an old generic reward modal, now achievements have specific claims
    closeModal(); // Close reward modal if it was somehow opened
}

// --- Boss Fight Start/Continue Logic --- (Revised)
function startBossFight() {
    if (!elements.bossIntroModal) return;
    elements.bossIntroModal.classList.remove('active');
    if (gameState.enemy && gameState.enemy.isBoss) {
        addToBattleLog(`The battle against ${gameState.enemy.name} begins!`, 'system');
        gameState.battle.playerTurn = true; // Ensure player starts
        setBattleButtonsState(true); // Enable battle buttons
        playBossMusic(); // Start boss music
         if (elements.battleInfo) {
            elements.battleInfo.textContent = "Your Turn";
             elements.battleInfo.className = 'battle-info player-turn';
         }
    } else {
        console.error("Tried to start boss fight, but no boss enemy is set in gameState.");
        // Fallback: Try to spawn a regular enemy if boss state is inconsistent
        spawnEnemy(true); // Force regular spawn
    }
}

function continueAfterBossVictory() {
     const modal = elements.bossVictoryModal;
    if (modal) modal.classList.remove('active');
    console.log("Continuing after boss victory.");
    // Spawn a regular enemy next (forceRegular flag ensures no immediate boss respawn)
    spawnEnemy(true);
    // spawnEnemy handles setting turn state and enabling buttons
    // playCorrectMusic() called within spawnEnemy
}


// --- Initialization --- (Revised DOMContentLoaded)
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed.");

    // Assign elements now that the DOM is ready (ensure all IDs exist in HTML)
    elements.gems = document.getElementById('gems');
    elements.level = document.getElementById('level');
    elements.xpFill = document.getElementById('xp-fill');
    elements.healthFill = document.getElementById('health-fill');
    elements.attack = document.getElementById('attack');
    elements.defense = document.getElementById('defense');
    elements.speed = document.getElementById('speed');
    elements.battleBtn = document.getElementById('btn-battle');
    elements.shopBtn = document.getElementById('btn-shop');
    elements.achievementsBtn = document.getElementById('btn-achievements');
    elements.settingsBtn = document.getElementById('btn-settings');
    elements.battleScreen = document.getElementById('battle-screen');
    elements.shopScreen = document.getElementById('shop-screen');
    elements.achievementsScreen = document.getElementById('achievements-screen');
    elements.settingsScreen = document.getElementById('settings-screen');
    elements.enemyAvatar = document.getElementById('enemy-avatar');
    elements.enemyName = document.getElementById('enemy-name');
    elements.attackBtn = document.getElementById('attack-btn');
    elements.specialBtn = document.getElementById('special-btn');
    elements.defendBtn = document.getElementById('defend-btn');
    elements.battleLog = document.getElementById('battle-log'); // Old scrollable log
    elements.pokemonTurnBox = document.getElementById('pokemon-turn-box'); // New turn display
    elements.shopItems = document.getElementById('shop-items');
    elements.shopCategories = document.querySelectorAll('.shop-category');
    elements.achievementsList = document.getElementById('achievements-list');
    elements.musicVolume = document.getElementById('music-volume');
    elements.sfxVolume = document.getElementById('sfx-volume');
    elements.darkMode = document.getElementById('dark-mode');
    elements.rewardModal = document.getElementById('reward-modal'); // General reward modal (if used)
    elements.rewardDetails = document.getElementById('reward-details');
    elements.claimReward = document.getElementById('claim-reward'); // Button for general reward modal
    elements.levelUpModal = document.getElementById('level-up-modal');
    elements.newLevel = document.getElementById('new-level');
    elements.levelUpRewards = document.getElementById('level-up-rewards');
    elements.continueBtn = document.getElementById('continue-btn'); // For level up modal
    elements.bossIntroModal = document.getElementById('boss-intro-modal');
    elements.bossName = document.getElementById('boss-name');
    elements.bossAvatar = document.getElementById('boss-avatar');
    elements.bossDescription = document.getElementById('boss-description');
    elements.fightBossBtn = document.getElementById('fight-boss-btn');
    elements.declineBossBtn = document.getElementById('decline-boss-btn'); // Added for completeness
    elements.bossVictoryModal = document.getElementById('boss-victory-modal');
    // These might need querySelector inside the modal if IDs aren't unique globally
    elements.bossVictoryAvatar = document.getElementById('boss-victory-avatar'); // Use direct ID if unique
    elements.bossVictoryReward = document.getElementById('boss-victory-reward'); // Use direct ID if unique
    elements.continueAfterBossBtn = document.getElementById('continue-after-boss'); // For boss victory modal
    elements.backgroundMusic = document.getElementById('background-music');
    elements.battleMusic = document.getElementById('battle-music');
    elements.bossMusic = document.getElementById('boss-music');
    elements.skillBar = document.getElementById('skill-bar');
    elements.playerHpPercent = document.getElementById('player-hp-percent'); // Optional HP % display
    elements.enemyHpBarFill = document.getElementById('enemy-hpbar-fill');
    elements.enemyHpBarPercent = document.getElementById('enemy-hpbar-percent'); // Optional Enemy HP %
    elements.battleInfo = document.getElementById('battle-info'); // Turn indicator text

     // Check if all crucial elements were found
     let missingElements = false;
     for (const key in elements) {
         if (elements[key] === null && !['playerHpPercent', 'enemyHpBarPercent', 'battleLog'].includes(key)) { // Allow optional elements
             // Exclude NodeLists like shopCategories
             if (!(elements[key] instanceof NodeList) && !key.endsWith('Btn')) { // Be more specific about essential elements
                 console.error(`Crucial DOM element not found: ${key} (Expected ID: ${key.replace(/([A-Z])/g, '-$1').toLowerCase()})`);
                 // missingElements = true; // Decide if game should halt
             } else if (elements[key] instanceof NodeList && elements[key].length === 0 && key === 'shopCategories') {
                  console.warn(`DOM element NodeList is empty: ${key}`);
             } else if(elements[key] === null && key.endsWith('Btn')) {
                 console.warn(`Button element not found: ${key}`);
             }
         }
     }
     // Optional: Halt game init if crucial elements are missing
     // if(missingElements) { alert("Error: Game interface elements missing. Cannot start game."); return; }


    // Call initialization function AFTER elements are assigned
    initGame();
});

// --- Achievement Unlock Popup ---
function showAchievementUnlockedModal(achievement) {
    // Reuse the reward modal for achievement unlocks, or create a new one if needed
    let modal = document.getElementById('reward-modal');
    let details = document.getElementById('reward-details');
    let claimBtn = document.getElementById('claim-reward');
    if (!modal || !details || !claimBtn) {
        // Fallback: create a simple modal if not present
        modal = document.createElement('div');
        modal.id = 'reward-modal';
        modal.className = 'modal active';
        details = document.createElement('div');
        details.id = 'reward-details';
        claimBtn = document.createElement('button');
        claimBtn.id = 'claim-reward';
        claimBtn.textContent = 'OK';
        modal.appendChild(details);
        modal.appendChild(claimBtn);
        document.body.appendChild(modal);
    }
    details.innerHTML = `<h2>Achievement Unlocked!</h2><div><b>${achievement.name}</b></div><div>${achievement.description}</div><div style='margin-top:0.7em;'>Reward: ${formatReward(achievement.reward)}</div>`;
    claimBtn.textContent = 'OK';
    claimBtn.onclick = () => {
        modal.classList.remove('active');
    };
    modal.classList.add('active');
}

// --- Sync All Achievements on Load ---
function syncAllAchievements() {
    // Always sync master_of_shadows to current level
    updateAchievementProgress('master_of_shadows', gameState.player.level);
    // Sync gem_collector to total gems collected
    updateAchievementProgress('gem_collector', gameState.gameProgress.gemsCollected);
    // Sync skill_collector to number of unlocked skills
    updateAchievementProgress('skill_collector', PLAYER_SKILLS.length);
    // Sync shopaholic to number of items bought (count inventory + equipped + skills - 2 default skills)
    let itemsBought = (gameState.player.inventory?.length || 0) + (gameState.player.equipment.weapon ? 1 : 0) + (gameState.player.equipment.armor ? 1 : 0) + (PLAYER_SKILLS.length - 2);
    updateAchievementProgress('shopaholic', itemsBought);
    // Sync other achievements if needed (e.g., boss kills, etc.)
    // shadow_hunter: defeated shadow minions
    // This is only incremented on defeat, so can't sync unless you track total somewhere
    // boss_slayer: first boss defeated (handled on defeat)
    // hydra_slayer, chronomancer_vanquished: handled on defeat
}

// --- Turn Order Bar Logic ---
function getTurnOrderQueue(numTurns = 6) {
    // For now, assume only one player and one enemy, but allow for future expansion
    // Use speed to determine order: higher speed acts first. Alternate if equal.
    const queue = [];
    let player = {
        type: 'player',
        name: 'You',
        avatar: 'assets/images/player.png',
        speed: gameState.player.speed || 1
    };
    let enemy = null;
    if (gameState.enemy) {
        enemy = {
            type: 'enemy',
            name: gameState.enemy.name,
            avatar: gameState.enemy.image,
            speed: gameState.enemy.speed || 1
        };
    }
    if (!enemy) return [player];
    // Simulate turn order for next N turns
    let turnSim = [];
    let pDelay = 0, eDelay = 0;
    let pSpeed = Math.max(1, player.speed);
    let eSpeed = Math.max(1, enemy.speed);
    let t = 0;
    for (let i = 0; i < numTurns; i++) {
        if (pDelay <= eDelay) {
            turnSim.push({...player});
            pDelay += 100 / pSpeed;
        } else {
            turnSim.push({...enemy});
            eDelay += 100 / eSpeed;
        }
    }
    // If you want to show queued enemies (future), add them here
    return turnSim;
}

function renderTurnOrderBar() {
    const bar = document.getElementById('turn-order-bar');
    if (!bar) return;
    bar.innerHTML = '';
    const queue = getTurnOrderQueue(6);
    queue.forEach((turn, idx) => {
        const iconDiv = document.createElement('div');
        iconDiv.className = 'turn-order-icon' + (idx === 0 ? ' current-turn' : '');
        const img = document.createElement('img');
        img.src = turn.avatar;
        img.alt = turn.name;
        iconDiv.appendChild(img);
        const label = document.createElement('div');
        label.className = 'turn-order-label';
        label.textContent = turn.type === 'player' ? 'You' : turn.name;
        bar.appendChild(iconDiv);
        bar.appendChild(label);
    });
}
// --- Call renderTurnOrderBar after every action, enemy spawn, or speed change ---
// Add to these functions:
// - performAttack, performDefend, enemyTurn, spawnEnemy, checkLevelUp, etc.
// ... existing code ...
// Example: after updating turn state in performAttack, add:
// renderTurnOrderBar();
// ... existing code ...
