/*jshint node: true*/
var exec = require( 'child_process' ).exec;

// TODO: error handling maybe?

function isScreenlocked( callback ) {
	'use strict';

	// easier test for screen lock based on https://gist.github.com/OmgImAlexis/1519cc5fa1ac392fb2d1
	// more info on using CGSessionCopyCurrentDictionary http://stackoverflow.com/questions/11505255/osx-check-if-the-screen-is-locked
	// but this seems sufficient so far
	exec( 'python -c \'import sys,Quartz; d=Quartz.CGSessionCopyCurrentDictionary(); print d.get("CGSSessionScreenIsLocked")\'', function ( error, stdout, stderr ) {
		// response = True / None
		if ( error ) console.error( error );

		if ( stdout.trim() == 'True' ) callback( true );
		else callback( false );
	});
}


module.exports = isScreenlocked;