var exec = require( 'child_process' ).exec;

// TODO: error handling maybe?

var CPSRegex = /CurrentPowerState"=(\d)/;

function getCurrentPowerState( callback ) {
    'use strict';
	exec( 'ioreg -n IODisplayWrangler |grep -i IOPowerManagement', function ( error, stdout, stderr ) {
		// response ex: "IOPowerManagement" = {"DevicePowerState"=4,"CapabilityFlags"=32832,"CurrentPowerState"=4,"MaxPowerState"=4}\n'
		var CPSmatch = stdout.match( CPSRegex );
		onGotCurrentPowerState( CPSmatch[ 1 ], callback );
	});
}

function isDisplayOff ( callback ) {
	getCurrentPowerState( callback );
}

function onGotCurrentPowerState( state, callback ) {
	if ( state === 0 ) callback( true );
	else callback( false );
}


module.exports = isDisplayOff;