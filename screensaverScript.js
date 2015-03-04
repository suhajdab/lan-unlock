var applescript = require( 'applescript' );

var sleepScript =
	'tell application "System Events"\n\
		start current screen saver\n\
	end tell';

function screensaver ( res, callback ) {
	applescript.execString( sleepScript , function ( err, rtn ) {
		callback( res, err, rtn );
	});

}

module.exports = screensaver;