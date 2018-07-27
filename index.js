module.exports = function Manapotter(mod) {
	mod.game.initialize('contract');

	let cooldown = false,
		playerLocation,
		playerAngle;
		
	// #############
	// ### Magic ###
	// #############
	
	
	mod.hook('S_START_COOLTIME_ITEM', 1, event => { 
		if(event.item == 6562) { // has 10 seconds cooldown
			cooldown = true;

			setTimeout(() => {
				cooldown = false
			}, event.cooldown*1000);
		};
	});

	mod.hook('S_PLAYER_CHANGE_MP', 1, event => {
		currentMp = event.currentMp;
		maxMp = event.maxMp;
		
		if(!cooldown && mod.game.me.is(event.target) && (currentMp <= maxMp/2)) {
			//command.message('trying to use item');
			useItem();

		};
	});

	mod.hook('C_PLAYER_LOCATION', 5, event => {
		playerLocation = event.loc;
		playerAngle = event.w;
	});
	
	function useItem() {
		if (!mod.settings.enabled) return;
		if(mod.game.me.alive && mod.game.me.inCombat && !mod.game.me.mounted && !mod.game.contract.active && !mod.game.me.inBattleground) {
			//command.message('using pot.')
			mod.toServer('C_USE_ITEM', 3, {
				gameId: mod.game.me.gameId,
				id: 6562, // 6562: Prime Replenishment Potable, 184659: Everful Nostrum
				dbid: 0,
				target: 0,
				amount: 1,
				dest: 0,
				loc: playerLocation,
				w: playerAngle,
				unk1: 0,
				unk2: 0,
				unk3: 0,
				unk4: true
			});
		};
	};

	mod.command.add('mppot', () => {
		mod.settings.enabled = !mod.settings.enabled;
		//niceName is broken qq
		mod.command.message('[ManaPotter] Module ' + (mod.settings.enabled ? 'en' : 'dis') + 'abled');

	});
	this.destructor = () => { mod.command.remove('mppot') };
};