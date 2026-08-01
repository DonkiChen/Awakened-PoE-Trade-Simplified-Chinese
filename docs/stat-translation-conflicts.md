---
title: Stat Translation Conflicts
---

# Stat Translation Conflicts

This document records localized matcher and item-name collisions found in the
current `zh_CN` generated data. These entries are intentionally not changed
automatically. Some may reflect the game's actual data model or intended
aliases and require confirmation before changing a translation or adding a
merge rule.

## Stat Matchers

| Localized matcher | English refs | Current data |
| --- | --- | --- |
| `+#% 最大元素抗性` | `# total Elemental Resistances`; `+#% total Elemental Resistance`; `+#% total to all Elemental Resistances` | `stats.ndjson:88,2382,2384` |
| `若你近期内有击败敌人，则效果区域缩小 #%` | `#% increased Area of Effect if you've Killed Recently`; `#% increased Area of Effect per Enemy killed recently, up to 25%`; `#% increased Area of Effect per Enemy killed recently, up to 50%` | `stats.ndjson:477,484` |
| `每个狂怒球使攻击速度加快 #%` / `每个狂怒球使攻击速度减慢 #%` | `#% increased Attack Speed per Frenzy Charge`; `#% reduced Attack and Cast Speed per Frenzy Charge` | `stats.ndjson:557,1570` |
| `禁断之血上有匹配的词缀则配置 暗影` | `Allocates Assassin if you have the matching modifier on Forbidden Flame`; `Allocates Opportunistic if you have the matching modifier on Forbidden Flame` | `stats.ndjson:2986,3453` |
| `禁断之肉上有匹配的词缀则配置 暗影` | `Allocates Assassin if you have the matching modifier on Forbidden Flesh`; `Allocates Opportunistic if you have the matching modifier on Forbidden Flesh` | `stats.ndjson:2987,3454` |
| `配置 破坏者` | `Allocates Saboteur`; `Allocates Destroyer` | `stats.ndjson:3539,8365` |
| `怪物生命总增 #%` / `怪物生命总降 #%` | `Monsters have #% more Life`; `#% more Monster Life` | `stats.ndjson:5486,8215` |
| `配置 毒蛇之牙` | `Allocates Adder's Touch`; `Allocates Fangs of the Viper` | `stats.ndjson:8243,8415` |
| `配置 电能之击` | `Allocates Arcing Blows`; `Allocates Static Blows` | `stats.ndjson:8263,8645` |
| `配置 汲血者` | `Allocates Blood Drinker`; `Allocates Lust for Carnage` | `stats.ndjson:8295,8518` |
| `配置 毁灭装置` | `Allocates Destructive Apparatus`; `Allocates Devastating Devices` | `stats.ndjson:8366,8367` |
| `配置 复仇` | `Allocates Retaliation`; `Allocates Vengeance` | `stats.ndjson:8591,8686` |

The following same-group duplicates are already handled by an explicit
resolver and are not listed as unresolved semantic conflicts:

- Spell block chance: `stats.ndjson:208`
- Vulnerability percentage/value merge: `stats.ndjson:238`
- Flask Charge percentage/value merge: `stats.ndjson:262`
- Physical damage and no physical damage: `stats.ndjson:1198`

## Item Names

These localized names currently map to different English refs:

- `羊人萨满`: `Alpine Shaman`; `Goatman Shaman`
- `污泥食腐虫`: `Bleached Crawler`; `Scum Crawler`
- `触铬巨人`: `Chrome-infused Goliath`; `Chrome-touched Goliath`
- `扎洛卡`: `Adherent of Zarokh`; `Imperfect Adherent of Zarokh`; `Perfect Adherent of Zarokh`
- `召集法杖`: `Convening Wand`; `Convoking Wand`
- `龙骨细剑`: `Dragonbone Rapier`; `Wyrmbone Rapier`
- `丝绸手套`: `Fingerless Silk Gloves`; `Silk Gloves`
- `重矢箭袋`: `Heavy Arrow Quiver`; `Heavy Quiver`
- `丝绒手套`: `Velour Gloves`; `Velvet Gloves`

No entry in this document should be changed until the corresponding game-data
semantics have been confirmed.
