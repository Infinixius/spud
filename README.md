# spud

Online save editor for the game [Shattered Pixel Dungeon](https://github.com/00-Evan/shattered-pixel-dungeon), a roguelike dungeon crawler with pixel graphics.

You can find it at [https://infinixi.us/spud/](https://infinixi.us/spud/)!

This is a complete rewrite of the original spud from a few years ago, with many more features, and a much better UI. If you want to access the original for some reason, you can find it [here](https://infinixi.us/spud/old/index.html).

![](/web/assets/images/screenshot_1.png)
![](/web/assets/images/screenshot_2.png)

![](/web/assets/images/screenshot_3.png)
![](/web/assets/images/screenshot_4.png)

## FAQ

### Where are the save files on desktop?

- **Windows** - `AppData/Roaming/.shatteredpixel/Shattered Pixel Dungeon`
- **Windows XP** - `Application Data/.shatteredpixel/Shattered Pixel Dungeon/`
- **Mac** - `Library/Application Support/Shattered Pixel Dungeon/`
- **Linux** - `~/.local/share/.shatteredpixel/shattered-pixel-dungeon`

### Where are the save files on Android?

Unfortunately, you need root access to open the game's directory. You can find many tutorials online on how to root your device, but unless you're really desperate, I would not recommend rooting your device just to use this save editor, as you run the risk of bricking your phone or voiding the warranty.

Once you have a rooted phone, download a file explorer that supports root access (I recommend [Material Files](https://play.google.com/store/apps/details?id=me.zhanghai.android.files&hl=en)), and go to `/data/data/com.shatteredpixel.shatteredpixeldungeon`. Look for a `game.dat` file.

There are some methods to access the game's data folder without a rooted phone, but they depend on the device and Android version. Here are some I found:
- Using `adb backup` and `adb restore`
- Using `adb run-as`
- Using `adb pull` and `adb push`

I haven't tried any of these methods, so take them with a grain of salt. Do your own research if you don't have root.

### Where are the save files on iOS?

I don't own any iOS devices, so I can't help you with this. It should be much easier to find the data folder with a jailbroken phone, but as with the Android advice above, I wouldn't do that with the sole intent of using this save editor.

### On Android, my save file doesn't show up in-game after downloading it here.

First off, make sure it's in the proper directory (in the same folder as the depth.dat files).

If that doesn't work, then it's most likely a permissions issue.
For me, setting the game.dat file's permissions to this worked:
- **Owner** - `u0_a958 (10958) Shattered Pixel Dungeon`
- **Group** - `u0_a958 (10958) Shattered Pixel Dungeon`
- **Mode** - `rw------- (0600)` (Or set Owner to Read and Write and everything else to none)
- **SELinux Context** - `u:object_r:app_data_file:s0:c190,c259,c512,c768`

### I don't see an item's properties after adding it and editing its JSON.

If you add an item via the save editor, and then try to edit it's JSON, none of it's specific properties will show up. You need to first add the item, download the save file, run the game, and then re-import it here, so the game can generate the properties for us.

### After adding an item, it doesn't show up in its container.

This happens when you, for example, add a wand or throwable item. When you do this it'll show up in the main inventory instead of under the Magical Holster. Don't worry; when you launch the game with the updated save file, the game will sort it for us. This is just a limitation of the save editor.

### My save file is corrupted, or an error showed up.

This editor isn't perfect, and I wouldn't trust a really important save file with it. Always backup your files.

If your save file doesn't work in the game, or the editor, I would appreciate it if you opened an issue or sent me an [e-mail](mailto:spud@infinixi.us) with the following information:
- Game version (bottom right in the main menu)
- Original & corrupted save file
- Screenshot of the log (`Ctrl+Shift+I` -> console)
  
## License

This project is licensed under the [MIT License](https://github.com/Infinixius/spud/blob/main/LICENSE). You are free to do with the code as you please.

## Contributing

Pull requests and bug reports are greatly appreciated. Please note some parts of the codebase are particularly ugly and I wouldn't blame you if you went nowhere near them. (The icon generator function and `data.js` updater come to mind.)

If a new update to the game breaks the save editor (items missing, etc), clone the repository into a folder called `shattered-pixel-dungeon` and run `node update_game_data.js`. This should generate an updated `data.js` for the save editor to use. If the script still doesn't work after a new update, open an repository issue. I'll get to it eventually.