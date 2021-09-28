# spud

Online save editor for the game [Shattered Pixel Dungeon](https://github.com/00-Evan/shattered-pixel-dungeon), a roguelike dungeon crawler with pixel graphics.

You can find it at [https://infinixius.github.io/spud](https://infinixius.github.io/spud)!

![image](https://user-images.githubusercontent.com/68125679/135179631-7fc570df-fd9a-409a-9a3c-6b715cc4b333.png)
![image](https://user-images.githubusercontent.com/68125679/135179638-4073daa5-5cc9-432a-a440-305b4851dfed.png)

## FAQ

### Where are the save files on desktop?

- **Windows** - `AppData/Roaming/.shatteredpixel/Shattered Pixel Dungeon`
- **Windows XP** - `Application Data/.shatteredpixel/Shattered Pixel Dungeon/`
- **Mac** - `Library/Application Support/Shattered Pixel Dungeon/`
- **Linux** - `.shatteredpixel/shattered-pixel-dungeon/`

### How do I edit my inventory with this?

Inventory editing is a bit convoluted at the moment. After importing a save, scroll down to the Inventory section and you'll see a list of items.

The first box is the ID of the item, not the name. For example, if you wanted a Wand of Lighting, set it to `wands.WandOfLightning`. If you wanted a Battle Axe, set it to `weapon.melee.BattleAxe`. A potion of healing would be `potions.PotionOfHealing`, so on and so forth. You can view all the items in the game [here](https://github.com/00-Evan/shattered-pixel-dungeon/tree/master/core/src/main/java/com/shatteredpixel/shatteredpixeldungeon/items).

The second box is the quantity of the item, and the third is the level.

### How am I suppose to get my save file on iOS?

iOS is naturally a very locked down operating system so unless you're jailbroken, good luck.
If you are jailbroken, I'm sure you could find a way to get access to app data through a file manager of some sort.

I don't own any iOS devices so take this with a grain of salt.

### How am I suppose to get my save file on Android?

Unfortunately, you are going to need root access to access the game's directory.
You can find many root tutorials online for every device, model, or version possible. Unless you're really desperate, I wouldn't recommend rooting your device for the sole purpose of editing your save as you run the risk of bricking your phone or voiding your warranty.

Once you've got a rooted phone, download yourself a file explorer that supports root access, and head to `data/data/com.shatteredpixel.shatteredpixeldungeon` and look for a game.dat file.

Another idea I had would be to mod the game's APK itself to allow you to export the save files, but I'm not experienced in Android development and don't even know if this would be possible. If it is possible I think it's be really cool for someone to make that one day or even for the developer to implement it themselves!

You could also try ADB to access the game's directory without root using `adb shell` or `adb backup`, but I'm not sure if this works. 

### On Android, my save file doesn't show up in-game after downloading it here.

First off, make sure it's in the proper directory (in the same folder as the depth.dat files).

If that doesn't work, then it's most likely a permissions issue.
For me, setting the game.dat file's permissions to this worked:
- **Owner** - `u0_a958 (10958) Shattered Pixel Dungeon`
- **Group** - `u0_a958 (10958) Shattered Pixel Dungeon`
- **Mode** - `rw------- (0600)` (Or set Owner to Read and Write and everything else to none)
- **SELinux Context** - `u:object_r:app_data_file:s0:c190,c259,c512,c768 `

### How do I edit challenges?

Unfortunately, it's a bit complicated.
Challenges are stored in a "bitmask". Here's a list of all challenges along with their numerical id:
- **On Diet** - 1
- **Faith is my Armor** - 2
- **Pharmacophobia** - 4
- **Barren Land** - 8
- **Swarm Intelligence** - 16
- **Into Darkness** - 32
- **Forbidden Runes** - 64
- **Hostile Champions** - 128
- **Badder Bosses** - 256

Essentially, if you wanted to enable Swarm Intelligence and Forbidden Runes, you would want to add 16 and 64 to get 80. If you only wanted Into Darkness, you would set the challenge to 32. If you wanted to enable every challenge, you would use 511, so on and so forth.

Even I don't know how to extract challenge data from a bitmask, but I do plan on implementing a much easier way to modify challenges in the future when I figure out how they work.

### How does this even work?

The only reason this is even possible is thanks to the geniuses who work on [browserify](https://www.npmjs.com/package/browserify) and more specifically [browserify-zlib](https://www.npmjs.com/package/browserify-zlib).

Essentially, use Node.js' zlib module (from browserify-zlib) and use `gzip` and `gunzip` to mimic the game reading and writing save files. Then just throw the JSON from the unzipped save into a couple of HTML inputs and boom.

## Disclaimer

Please note that nobody except you is responsible for any harm you cause to your save or device, and you should backup your saves before using this tool anyway.
