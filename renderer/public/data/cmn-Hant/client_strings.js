// @ts-check
/** @type{import('../../../src/assets/data/interfaces').TranslationDict} */
export default {
  RARITY_NORMAL: '普通',
  RARITY_MAGIC: '魔法',
  RARITY_RARE: '稀有',
  RARITY_UNIQUE: '傳奇',
  RARITY_GEM: '寶石',
  RARITY_CURRENCY: '通貨',
  RARITY_DIVCARD: '命運卡',
  RARITY_QUEST: '任務',
  MAP_TIER: '地圖階級: ',
  RARITY: '稀有度: ',
  ITEM_CLASS: '物品種類: ',
  ITEM_LEVEL: '物品等級: ',
  CORPSE_LEVEL: '屍體等級: ',
  TALISMAN_TIER: '魔符階級: ',
  GEM_LEVEL: '等級: ',
  STACK_SIZE: '堆疊數量: ',
  SOCKETS: '插槽: ',
  QUALITY: '品質: ',
  PHYSICAL_DAMAGE: '物理傷害: ',
  ELEMENTAL_DAMAGE: '元素傷害: ',
  CRIT_CHANCE: '暴擊率: ',
  ATTACK_SPEED: '每秒攻擊次數: ',
  MEMORY_STRANDS: 'Memory Strands: ',
  STORED_EXPERIENCE: 'Stored Experience: ',
  ARMOUR: '護甲: ',
  EVASION: '閃避值: ',
  ENERGY_SHIELD: '能量護盾: ',
  TAG_WARD: '保護: ',
  BLOCK_CHANCE: '格擋率: ',
  CORRUPTED: '已汙染',
  UNIDENTIFIED: '未鑑定',
  ITEM_SUPERIOR: /^精良的 (.*)$/,
  MAP_BLIGHTED: /^凋落的 (.*)$/,
  MAP_BLIGHT_RAVAGED: /^凋落蔓延的 (.*)$/,
  INFLUENCE_SHAPER: '塑者之物',
  INFLUENCE_ELDER: '尊師之物',
  INFLUENCE_CRUSADER: '聖戰軍王物品',
  INFLUENCE_HUNTER: '狩獵者物品',
  INFLUENCE_REDEEMER: '救贖者物品',
  INFLUENCE_WARLORD: '總督軍物品',
  SECTION_SYNTHESISED: '追憶之物',
  ITEM_SYNTHESISED: /^追憶之 (.*)$/,
  VEILED_PREFIX: '隱匿前綴',
  VEILED_SUFFIX: '隱匿後綴',
  FLASK_CHARGES: /^目前有 \d+ 充能次數$/,
  METAMORPH_HELP: '在塔恩的鍊金室將此與其他四個不同的樣本合成。',
  BEAST_HELP: '點擊右鍵將此加入你的獸獵寓言。',
  VOIDSTONE_HELP: '放置於此以提升你輿圖全部地圖的階級。',
  METAMORPH_BRAIN: /^.* 腦髓$/,
  METAMORPH_EYE: /^.* 眼睛$/,
  METAMORPH_LUNG: /^.* 肺臟$/,
  METAMORPH_HEART: /^.* 心臟$/,
  METAMORPH_LIVER: /^.* 肝臟$/,
  CANNOT_USE_ITEM: '你無法使用這項裝備，它的數值將被忽略',
  QUALITY_ANOMALOUS: /^異常的 (.*)$/,
  QUALITY_DIVERGENT: /^相異的 (.*)$/,
  QUALITY_PHANTASMAL: /^幻影的 (.*)$/,
  AREA_LEVEL: '地區等級: ',
  HEIST_WINGS_REVEALED: '已揭露側廂: ',
  HEIST_TARGET: '劫盜目標：',
  HEIST_BLUEPRINT_ENCHANTS: '附魔裝備',
  HEIST_BLUEPRINT_TRINKETS: '盜賊的飾品或通貨',
  HEIST_BLUEPRINT_GEMS: '不尋常寶石',
  HEIST_BLUEPRINT_REPLICAS: '贗品或實驗性物品',
  MIRRORED: '已複製',
  MODIFIER_LINE: /^(?<type>[^"]+)(?:\s+"(?<name>[^"]+)")?(?:\s*\(階層：(?<tier>\d+)\))?(?:\s*\(階級：(?<rank>\d+)\))?$/,
  PREFIX_MODIFIER: '前綴',
  SUFFIX_MODIFIER: '後綴',
  CRAFTED_PREFIX: '大師工藝前綴',
  CRAFTED_SUFFIX: '大師工藝後綴',
  UNSCALABLE_VALUE: ' — 無法使用的值',
  CORRUPTED_IMPLICIT: '已汙染固定詞綴',
  MODIFIER_INCREASED: /^增加 (.+?)%$/,
  INCURSION_OPEN: '開啟房間：',
  INCURSION_OBSTRUCTED: '受阻的房間：',
  EATER_IMPLICIT: /^吞噬天地固定詞綴 \((?<rank>.+)\)$/,
  EXARCH_IMPLICIT: /^灼烙總督固定詞綴 \((?<rank>.+)\)$/,
  ELDRITCH_MOD_R1: '低階',
  ELDRITCH_MOD_R2: '高階',
  ELDRITCH_MOD_R3: '宏偉',
  ELDRITCH_MOD_R4: '卓越',
  ELDRITCH_MOD_R5: '精緻',
  ELDRITCH_MOD_R6: '完美',
  SENTINEL_CHARGE: '充能: ',
  SHAPER_MODS: ['塑者之', '塑者的'],
  ELDER_MODS: ['尊師之', '尊師的'],
  CRUSADER_MODS: ['聖戰士的', '聖戰士之'],
  HUNTER_MODS: ['狩獵者的', '狩獵者之', '狩獵之'],
  REDEEMER_MODS: ['救贖者之', '救贖者的', '救贖之'],
  WARLORD_MODS: ['督軍的', '總督軍的', '征服之'],
  DELVE_MODS: ['地下的', '地下之', '地底之'],
  VEILED_MODS: ['被選召的', '教團之'],
  INCURSION_MODS: ['瓜特利斯的', '柔派克的', '塔普塔特的', '特卡蒂的', '麥塔爾的', '麥塔爾之', '希特克拉多的', '希特克拉多之', '特卡蒂之', '瓜特利斯之', '普希瓦爾之'],
  FOIL_UNIQUE: '貼模傳奇',
  UNMODIFIABLE: '不可調整的',
  // ---
  CHAT_SYSTEM: /^: (?<body>.+)$/,
  CHAT_TRADE: /^\$(?:<(?<guild_tag>.+?)> )?(?<char_name>.+?): (?<body>.+)$/,
  CHAT_GLOBAL: /^#(?:<(?<guild_tag>.+?)> )?(?<char_name>.+?): (?<body>.+)$/,
  CHAT_PARTY: /^%(?:<(?<guild_tag>.+?)> )?(?<char_name>.+?): (?<body>.+)$/,
  CHAT_GUILD: /^&(?:<(?<guild_tag>.+?)> )?(?<char_name>.+?): (?<body>.+)$/,
  CHAT_WHISPER_TO: /^@向 (?<char_name>.+?): (?<body>.+)$/,
  CHAT_WHISPER_FROM: /^@來自 (?:<(?<guild_tag>.+?)> )?(?<char_name>.+?): (?<body>.+)$/,
  CHAT_WEBTRADE_GEM: /^等級 (?<gem_lvl>\d+) (?<gem_qual>\d+)% (?<gem_name>.+)$/
}
