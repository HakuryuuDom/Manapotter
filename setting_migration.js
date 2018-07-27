'use strict'

const DefaultSettings = {
	"enabled": true
}
module.exports = function MigrateSettings(from_ver, to_ver, settings) {
	if(from_ver === undefined) {
		return Object.assign(Object.assign({}, DefaultSettings), settings);
	} else if(from_ver === null) {
			return DefaultSettings;
	} else { console.log('wat???') }
}