const Command = require('command');
const GameState = require('tera-game-state'); //Requires Caali's proxy :)
const Vec3 = require('tera-vec3');

module.exports = function Manapotter(dispatch) {
	const game = GameState(dispatch);
	const command = Command(dispatch);

	let cid = null,
		player = '',
		cooldown = false,
		enabled = true,
		battleground,
		incontract,
		inbattleground,
		alive,
		inCombat,
		playerLocation,
		playerAngle,
		currentMp,
		maxMp
		
	// #############
	// ### Magic ###
	// #############
	
	
	dispatch.hook('S_START_COOLTIME_ITEM', 1, event => { 
		let item = event.item
		let thiscooldown = event.cooldown
		
		if(item == 6562) { // has 10 seconds cooldown
			cooldown = true
			setTimeout(() => {
				cooldown = false
			}, thiscooldown*1000)
		}
	})
	
	dispatch.hook('S_PLAYER_CHANGE_MP', 1, event => {
		currentMp = event.currentMp
		maxMp = event.maxMp
		
		if(!cooldown && event.target.equals(game.me.gameId) && (currentMp <= maxMp/2)) {
			//command.message('trying to use item');
			useItem();

		}
	})

	dispatch.hook('C_PLAYER_LOCATION', 5, event => {
		playerLocation = event.loc;
		playerAngle = event.w;
	})
	command.add('mpdebug', () => {
		console.log(game.me.alive);
		console.log(inCombat);
		console.log(game.me.mountId);
		console.log(incontract);
		console.log(inbattleground);
		
	})
	function useItem() {
		if (!enabled) return
		if(game.me.alive && inCombat && game.me.mountId == null && !incontract && !inbattleground) {
			command.message('using pot.')
			dispatch.toServer('C_USE_ITEM', 3, {
				gameId: game.me.gameId,
				id: 6562, // 6562: Prime Replenishment Potable, 184659: Everful Nostrum
				dbid: 0,
				target: 0,
				amount: 1,
				dest: 0,
				loc: new Vec3(playerLocation),
				w: playerAngle,
				unk1: 0,
				unk2: 0,
				unk3: 0,
				unk4: true
			});
		}
	}
	
	// ##############
	// ### Checks ###
	// ##############
	
	dispatch.hook('S_BATTLE_FIELD_ENTRANCE_INFO', 1, event => { battleground = event.zone })
	dispatch.hook('S_LOAD_TOPO', 3, event => {
		//onmount = false
		incontract = false
		inbattleground = event.zone == battleground
	})
	
	dispatch.hook('S_USER_STATUS', 1, event => { 
		if(event.target.equals(game.me.gameId)) {
			if(event.status == 1) {
				inCombat = true
			}
			else inCombat = false
		}
	})

	//dispatch.hook('S_MOUNT_VEHICLE', 1, event => { if(event.target.equals(cid)) onmount = true })
	//dispatch.hook('S_UNMOUNT_VEHICLE', 1, event => { if(event.target.equals(cid)) onmount = false })

	dispatch.hook('S_REQUEST_CONTRACT', 1, event => { incontract = true })
	dispatch.hook('S_ACCEPT_CONTRACT', 1, event => { incontract = false })
	dispatch.hook('S_REJECT_CONTRACT', 1, event => { incontract = false })
	dispatch.hook('S_CANCEL_CONTRACT', 1, event => { incontract = false })
	
	// #################
	// ### Chat Hook ###
	// #################
	command.add('mppot', () => {
		if(enabled) {
			enabled = false;
			command.message('Manapotter disabled.');
		}
		else if(!enabled) {
			enabled = true;
			command.message('Manapotter Enabled.');
		}
	});
	this.destructor = () => { command.remove('mppot') };
	this.destructor = () => { command.remove('mpdebug') };
};