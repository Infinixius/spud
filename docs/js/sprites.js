const DEFAULT_SPRITE = "width: 8px; height: 14px;filter: invert(100);"

const rxy = (n) => [((n % 16) + 1), (Math.floor(n / 16) + 1)];

const get_item_sprite = (item_id) => {
	const item_schema = ITEMS.find((item) => item.sprite && item.id == item_id)
	if (!item_schema) return DEFAULT_SPRITE

	let [x, y] = [0, 0]
	let [clip_x, clip_y] = [16, 16]

	console.log(item_schema)

	if ((item_schema.id.startsWith("potions.") || item_schema.id.startsWith("scrolls.") || item_schema.id.startsWith("rings.")) && (!item_schema.id.includes("brews") && !item_schema.id.includes("elixir"))) {
		var icon_type = item_schema.id.split(".")[0].toUpperCase().slice(0, -1)
		
		// Gets the color/icon of the ring/potion/scroll for the current save file
		var icon_color = SAVE_FILE[`${item_schema.game_id.split(".").pop()}_label`] ||
			SAVE_FILE[`${ITEMS.find(item => item.id == item_schema.regular_id).game_id.split(".").pop()}_label`] // Handle exotic variants

			console.log(icon_color)

		if (icon_color) {
			let generic_item = GENERIC_ITEMS.find((item) => item.id == `${icon_type}_${icon_color.toUpperCase()}`)

			if (generic_item) {
				if (generic_item.sprite.pos) {
					[x, y] = [generic_item.sprite.pos.x, generic_item.sprite.pos.y]
				}
				if (generic_item.sprite.clip) {
					[clip_x, clip_y] = [generic_item.sprite.clip.x, generic_item.sprite.clip.y]
				}
			}
		}
	} else {
		if (item_schema.sprite.pos) {
			[x, y] = [item_schema.sprite.pos.x, item_schema.sprite.pos.y]
		}
		if (item_schema.sprite.clip) {
			[clip_x, clip_y] = [item_schema.sprite.clip.x, item_schema.sprite.clip.y]
		}
	}

	if (item_schema.id.includes("exotic.")) y += 1

	let style_string = ""

	style_string += `background-position: -${(x * 16) - 16}px -${(y * 16) - 16}px;`
	style_string += `width: ${clip_x}px;`
	style_string += `height: ${clip_y}px;`

	return style_string
}

const get_item_small_sprite = (item_id) => {
	let item_schema = ITEMS.find((item) => item.id == item_id)

	if ((item_schema.id.startsWith("potions.") || item_schema.id.startsWith("scrolls.") || item_schema.id.startsWith("rings.")) && (!item_schema.id.includes("brews") && !item_schema.id.includes("elixir"))) {
		let icon = item_schema.sprite.icon

		if (icon !== null) {
			let [x, y] = [icon.pos.x, icon.pos.y]
			let [clip_x, clip_y] = [icon.clip.x, icon.clip.y]

			if (item_schema.id.startsWith("rings.")) y = 1 // Fixes a weird bug with rings

			let style_string = `background-position: -${(x * 8) - 8}px -${(y * 8) - 8}px;`
			style_string += `width: ${clip_x}px;`
			style_string += `height: ${clip_y}px;`

			return style_string
		} else {
			return "display: none;"
		}
	} else {
		return "display: none;"
	}
}

const get_enchantments = (item_id, current_enchantment) => {
	let output = `<option value="none" selected>None</option>`

	if (item_id.includes("weapon")) {
		ENCHANTMENTS.forEach(enchant => {
			if (enchant.includes("curse") && !output.includes("<hr>")) {
				output += `<hr>`
			}

			output += `<option value="${enchant}" ${enchant == current_enchantment ? "selected" : ""}>${enchant.split(".").pop()}</option>`
		})
	} else if (item_id.includes("armor")) {
		GLYPHS.forEach(glyph => {
			if (glyph.includes("curse") && !output.includes("<hr>")) {
				output += `<hr>`
			}

			output += `<option value="${glyph}" ${glyph == current_enchantment ? "selected" : ""}>${glyph.split(".").pop()}</option>`
		})
	} else {
		return `<option value="none" selected>N/A</option>`
	}

	return output
}