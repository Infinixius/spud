import fs from "fs"

const get_file = (path) => {
	return fs.readFileSync(`./shattered-pixel-dungeon/${path}`, "utf-8")
}

if (!fs.existsSync("./shattered-pixel-dungeon")) throw `Please ensure that there's a folder called "shattered-pixel-dungeon" in the same directory as this script.`

/* Metadata */

const SUPPORTED_GAME_VERSION = get_file("build.gradle").match(/appVersionCode = (.*)/)[1]
let ERRORS = []

/* Items */

let ITEMS = []
let GENERIC_ITEMS = [] // ex: Scroll of ISAZ, Amethyst Ring, Crimson Potion, etc

get_file("core/src/main/assets/messages/items/items.properties").matchAll(/items\.(.*).name\=(.*)\n/g).forEach(item => {
	const item_id = item[1].replace(/_/g, " ")
	const item_name = item[2].toLowerCase()

	if (
		item_id.includes("curses") ||
		item_id.includes("glyphs") ||
		item_id.includes("enchantments") ||
		item_id.includes("ability") ||
		item_id.includes("pasty.") ||
		item_id.includes(".staff") ||
		item_id.includes("$")
	) return

	ITEMS.push({
		id: item_id,
		name: item_name
	})
})

get_file("core/src/main/assets/messages/plants/plants.properties").matchAll(/(plants\..*)\$seed\.name=(.*)/g).forEach(plant => {
	const item_id = plant[1].replace(/_/g, " ")
	const item_name = plant[2]

	ITEMS.push({
		id: item_id,
		name: item_name,
		seed: true
	})
})

ITEMS.map(item => item.id).forEach(item_id => {
	let item_path = item_id.replace(/\./g, "/").split("/").slice(0,-1).join("/")
	let item_name = item_id.replace(/'S/g, "s").replace(/'/g, "").replace(/ /g, "").split(".").pop()

	if (item_path.includes("plants")) return
	fs.readdirSync(`./shattered-pixel-dungeon/core/src/main/java/com/shatteredpixel/shatteredpixeldungeon/items/${item_path}`)
		.filter(file => file.endsWith(".java"))
		.forEach(file => {
			// We have to check every file because the item name is lowercase and the file names are capitalized
			if (file.toLowerCase().replace(".java", "") == item_name) {
				let data = fs.readFileSync(`./shattered-pixel-dungeon/core/src/main/java/com/shatteredpixel/shatteredpixeldungeon/items/${item_path}/${file}`, "utf-8")
				let spritesheet_id = data.match(/image = ItemSpriteSheet\.(.*);/)
					spritesheet_id = spritesheet_id ? spritesheet_id[1] : null
				let spritesheet_icon_id = data.match(/icon = ItemSpriteSheet\.Icons\.(.*);/)
					spritesheet_icon_id = spritesheet_icon_id ? spritesheet_icon_id[1] : null

				let item = ITEMS.find(item => item.id == item_id)
				if (!item) throw "Item not found: " + item_id

				item.game_id = (
					"com.shatteredpixel.shatteredpixeldungeon.items." +
					item_id.split(".").slice(0,-1).join(".") + "." + file.replace(".java", "")
				).replace("..", ".")
				
				item.sprite = {
					id: spritesheet_id,
					pos: null,
					clip: null,
					icon: {
						id: spritesheet_icon_id,
						pos: null,
						clip: null
					}
				}
			}
		})
})

fs.readdirSync(`./shattered-pixel-dungeon/core/src/main/java/com/shatteredpixel/shatteredpixeldungeon/plants`)
	.filter(file => file.endsWith(".java"))
	.forEach(file => {
		if (file == "Plant.java") return
		if (file == "BlandfruitBush.java") return
		let data = get_file(`core/src/main/java/com/shatteredpixel/shatteredpixeldungeon/plants/${file}`)
		let spritesheet_id = data.match(/image = ItemSpriteSheet\.(.*);/)
			spritesheet_id = spritesheet_id ? spritesheet_id[1] : null

		if (spritesheet_id) {
			const item_id = `plants.${spritesheet_id.replace("SEED_", "").toLowerCase()}`

			let item = ITEMS.find(item => item.id == item_id)
			if (!item) throw "Item not found: " + item_id
			
			item.game_id = (
				"com.shatteredpixel.shatteredpixeldungeon." +
				item_id.split(".").slice(0,-1).join(".") + "." + file.replace(".java", "") +
				"$Seed"
			)
			
			item.sprite = {
				id: spritesheet_id,
				pos: null,
				clip: null,
				icon: {
					id: null,
					pos: null,
					clip: null
				}
			}
		} else {
			ERRORS.push(`Item sprite for plant ${file} not found. This might be a new plant or a bug.`)
		}
	})

// Map exotic items to their regular counterparts

const exotic_ids = [
	...get_file("core/src/main/java/com/shatteredpixel/shatteredpixeldungeon/items/scrolls/exotic/ExoticScroll.java").matchAll(/exoToReg\.put\((.*), (.*)\);/gm),
	...get_file("core/src/main/java/com/shatteredpixel/shatteredpixeldungeon/items/potions/exotic/ExoticPotion.java").matchAll(/exoToReg\.put\((.*), (.*)\);/gm)
]

exotic_ids.forEach(exotic_id => {
	const exotic = exotic_id[1].replace(".class", "").trim()
	const regular = exotic_id[2].replace(".class", "").trim()

	let exotic_item = ITEMS.find(item => item.game_id !== undefined && item.game_id.includes(exotic))
	let regular_item = ITEMS.find(item => item.game_id !== undefined && item.game_id.includes(regular))

	if (exotic_item && regular_item) {
		exotic_item.regular_id = regular_item.id
	}
})

/* Sprites */

const xy = (x, y) => (x-1) + 16 * (y-1);
const rxy = (n) => [((n % 16) + 1), (Math.floor(n / 16) + 1)];

const ItemSpriteSheet = get_file("core/src/main/java/com/shatteredpixel/shatteredpixeldungeon/sprites/ItemSpriteSheet.java")

let CATEGORIES = {
	"SOMETHING": 0,
	"DARTS": 160 // Temporary fix: https://github.com/00-Evan/shattered-pixel-dungeon/issues/2043
}

const calculate_sprite_position_num = (pos) => {
	let [x, y] =  pos
		.match(/xy\((.*),(.*)\)/)
		.slice(1, 3)
		.map(n => parseInt(n.trim()))

	return ((x - 1) + 16 * (y - 1))
}

const calculate_position = (pos) => {
	let [category, offset] = pos.match(/(.*)\+(.*)/).slice(1,3).map(n => n.trim())
	
	let raw = CATEGORIES[category] + parseInt(offset.trim())
	let [x, y] = rxy(raw)

	return {
		x: x,
		y: y,
		raw: raw,
	}
}

ItemSpriteSheet.matchAll(/(private|public) static final int (.*)\s*=\s*(.*);/g)
	.forEach(item => {
		const is_category = item[1] == "private"
		const item_id = item[2].trim()
		const sprite_position = item[3].trim()

		if (["WIDTH", "SIZE", "SOMETHING"].includes(item_id)) return

		if (is_category) {
			// If the category already exists, we're near the end of the file which means it's an icon category
			if (CATEGORIES[item_id]) {
				CATEGORIES[`${item_id}_ICON`] = calculate_sprite_position_num(sprite_position)
			} else {
				CATEGORIES[item_id] = calculate_sprite_position_num(sprite_position)
			}
		} else {
			let item = ITEMS.find(item => item.sprite !== undefined && item.sprite.id == item_id)
			if (item) {
				item.sprite.pos = calculate_position(sprite_position)
			} else {
				let item_icon = ITEMS.find(item => item.sprite !== undefined && item.sprite.icon.id == item_id)
				if (item_icon) {
					item_icon.sprite.icon.pos = calculate_position(sprite_position)
				} else {
					if (item_id.includes("POTION_") || item_id.includes("SCROLL_") || item_id.includes("RING_") || item_id.includes("EXOTIC_")) {
						GENERIC_ITEMS.push({
							id: item_id,
							sprite: {
								id: item_id,
								pos: calculate_position(sprite_position),
								clip: null
							}
						})
					} else {
						ERRORS.push(`Item sprite for ${item_id} not found. This might be a new item or a bug.`)
					}
				}
			}
		}
	})

/* Sprite Clipping */

ItemSpriteSheet.matchAll(/assignItemRect\((.*),(.*),(.*)\);/g)
	.forEach(item_data => {
		const item_id = item_data[1].trim()
		const x = item_data[2].trim()
		const y = item_data[3].trim()

		if (item_id == "i") return // For loops, handled below

		let item = ITEMS.find(item => item.sprite !== undefined && item.sprite.id == item_id)
		if (item) {
			item.sprite.clip = {
				x: parseInt(x),
				y: parseInt(y),
			}
		} else {
			if (item_id.includes("POTION_") || item_id.includes("SCROLL_") || item_id.includes("RING_") || item_id.includes("EXOTIC_")) {
				let generic_item = GENERIC_ITEMS.find(item => item.sprite.id == item_id)

				generic_item.sprite.clip = {
					x: parseInt(x),
					y: parseInt(y),
				}
			} else {
				ERRORS.push(`Item sprite clipping for ${item_id} not found. This might be a new item or a bug.`)
			}
		}
	})

ItemSpriteSheet.matchAll(/assignIconRect\((.*),(.*),(.*)\);/g)
	.forEach(item_data => {
		const item_id = item_data[1].trim()
		const x = item_data[2].trim()
		const y = item_data[3].trim()

		if (item_id == "i") return // For loops, handled below

		let item = ITEMS.find(item => item.sprite !== undefined && item.sprite.icon.id == item_id)
		if (item) {
			item.sprite.icon.clip = {
				x: parseInt(x),
				y: parseInt(y),
			}
		} else {
			ERRORS.push(`Icon sprite clipping for ${item_id} not found. This might be a new item or a bug.`)
		}
	})

// Handle for loops
ItemSpriteSheet.matchAll(/for \(int i = (.*); i < (.*)\+(.*); i\+\+\)\s*assignItemRect\(i, (.*), (.*)\);/g)
	.forEach(item_data => {
		const item_id = item_data[1]
		const item_id_regex = `public static final int (.*)= (${item_data[1] == "BREWS" ? "ELIXIRS|BREWS" : item_id})\+(.*);` // Fixes a bug with elixirs
		const x = item_data[4].trim()
		const y = item_data[5].trim()
	
		ItemSpriteSheet.matchAll(item_id_regex)
			.forEach(item_fr => {
				const item_id = item_fr[1].trim()

				let item = ITEMS.find(item => item.sprite !== undefined && item.sprite.id == item_id)

				if (item) {
					item.sprite.clip = {
						x: parseInt(x),
						y: parseInt(y),
					}
				} else {
					if (item_id.includes("POTION_") || item_id.includes("SCROLL_") || item_id.includes("RING_") || item_id.includes("EXOTIC_")) {
						let generic_item = GENERIC_ITEMS.find(item => item.sprite !== undefined && item.sprite.id == item_id)

						if (generic_item) {
							generic_item.sprite.clip = {
								x: parseInt(x),
								y: parseInt(y),
							}
						} else {
							ERRORS.push(`Generic item sprite clipping for ${item_id} not found. This might be a new item or a bug.`)
						}
					} else {
						ERRORS.push(`Item sprite clipping for ${item_id} not found. This might be a new item or a bug.`)
					}
				}
			})
	})

/* Enchantments / Glyphs */

let ENCHANTMENTS = [
	...fs.readdirSync("./shattered-pixel-dungeon/core/src/main/java/com/shatteredpixel/shatteredpixeldungeon/items/weapon/enchantments")
		.map(file => `weapon.enchantments.${file.replace(".java", "")}`),
	...fs.readdirSync("./shattered-pixel-dungeon/core/src/main/java/com/shatteredpixel/shatteredpixeldungeon/items/weapon/curses")
		.map(file => `weapon.curses.${file.replace(".java", "")}`),
]

let GLYPHS = [
	...fs.readdirSync("./shattered-pixel-dungeon/core/src/main/java/com/shatteredpixel/shatteredpixeldungeon/items/armor/glyphs")
		.map(file => `armor.glyphs.${file.replace(".java", "")}`),
	...fs.readdirSync("./shattered-pixel-dungeon/core/src/main/java/com/shatteredpixel/shatteredpixeldungeon/items/armor/curses")
		.map(file => `armor.curses.${file.replace(".java", "")}`),
]

/* Export */

console.log("// This file was automatically generated by update_game_data.js. Do not edit it manually.")
console.log(`// Generated on ${new Date().toLocaleString()}`)

console.log()

console.log(`const SUPPORTED_GAME_VERSION = ${SUPPORTED_GAME_VERSION};`)

console.log()

console.log(`const GENERIC_ITEMS = ${JSON.stringify(GENERIC_ITEMS, null, 2)};`)
console.log(`const ITEMS = ${JSON.stringify(ITEMS, null, 2)};`)

console.log()

console.log(`const ENCHANTMENTS = ${JSON.stringify(ENCHANTMENTS, null, 2)};`)
console.log(`const GLYPHS = ${JSON.stringify(GLYPHS, null, 2)};`)

console.log()

console.log(`const ERRORS = ${JSON.stringify(ERRORS, null, 2)};`)