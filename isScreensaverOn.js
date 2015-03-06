var applescript = require( 'applescript' );

// TODO: error handling

var detectScript =
	'tell application "System Events"\n\
		if name of every process contains "ScreenSaverEngine" then\n\
			return "on"\n\
		else\n\
			return "off"\n\
		end if\n\
	end tell';

function isScreensaverOn( callback ) {
    'use strict';
	applescript.execString( detectScript, function ( err, rtn ) {
		callback( rtn == 'on' );
	});
}

module.exports = isScreensaverOn;