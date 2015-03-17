/*jshint node: true*/

// TODO: modularize!

var https = require( 'https' ),
	fs = require( 'fs' ),

	index = fs.readFileSync( 'index.html' ),
	config = JSON.parse( fs.readFileSync( 'config.json' )),

	// state switches can take time, so must keep track
	currentState, awaitedState,
	maxTries = 20, tries = 0, retryDelay = 500,

	isScreenlocked = require( './isScreenlocked' ),
	screensaver = require( './screensaverScript' ),
	unlock = require( './unlockScript' )( config.password );

var options = {
	key: fs.readFileSync( 'local.key' ),
	cert: fs.readFileSync( 'local.cert' )
};

function onRequest ( req, res ) {
    'use strict';

	var eventName;

	if ( req.method === 'POST' ) {

		var body = '';

		req.on( 'data', function ( data ) {
			body += data;
			// kill large requests
			if ( body.length > 1e4 ) {
				req.connection.destroy();
			}
		});

		req.on( 'end', function () {
			var data = JSON.parse( body );

			if ( config.pin !== data.pin ) {
				eventName = 'incorrect pin';
                sendJSON( res, { err: eventName });

			} else if ( data.cmd === 'unlock' ) {

				isScreenlocked( function ( isLocked ) {
					if ( isLocked ) {
						awaitedState = 'unlocked';
						currentState = undefined;
						unlock( res, unlockCallback );
					} else {
						sendJSON( res, {});
					}
				});

				eventName = 'unlocked';

			} else if ( data.cmd === 'lock' ) {

				isScreenlocked( function ( isLocked ) {
					if ( !isLocked ) {
						awaitedState = 'locked';
						currentState = undefined;
						screensaver( res, sleepCallback );
					} else {
						sendJSON( res, {});
					}
				});
				eventName = 'locked';
			}

			logRequest( eventName, req );
		});

	} else if ( req.url == '/' ) {
		serveIndex( res );
		eventName = '"' + req.url + '" requested';

		logRequest( eventName, req );

	} else if ( req.url == '/state' ) {
		awaitAndSendState( res );
    }
}

function awaitAndSendState ( res ) {
	'use strict';

	if ( tries >= maxTries ) {
		var err = "Waiting for host to become '" + awaitedState + "' timed out after " + (tries * retryDelay / 1000 ) + " seconds. (current state: " + currentState + ")";
		log( err );
		tries = 0;
		sendJSON( res, { err: err });
		return;
	}
	setTimeout(function () {
		isScreenlocked( function ( isLocked ) {
			currentState = isLocked ? 'locked' : 'unlocked';
			if ( !awaitedState || currentState === awaitedState ) {
				tries = 0;
				awaitedState = false;
				sendJSON( res, { state: currentState });
			}
			else awaitAndSendState( res );
		});
	}, retryDelay );
	tries ++;
}

function unlockCallback ( res, err, rtn ) {
    'use strict';
	var resp = {};

	if ( err ) {
		console.error( err );
		resp.err = err;
	} else {
		resp.status = 'unlocked';
	}
	sendJSON( res, resp );
}

function sleepCallback ( res, err, rtn ) {
    'use strict';
	var resp = {};

	if ( err ) {
		console.error( err );
		resp.err = err;
	} else {
		resp.status = "screensaver activated";
	}
	sendJSON( res, resp );
}

function serveIndex ( res ) {
    'use strict';

	res.writeHead( 200, { 'Content-Type': 'text/html' });
	res.end( index );
}

function sendJSON ( res, resp ) {
    'use strict';

	res.writeHead( 200, { 'Content-Type': 'application/json' });
	res.write( JSON.stringify( resp ));
	res.end();
}

function logRequest ( eventName, req ) {
	'use strict';

	var ip = req.headers['x-forwarded-for'] ||
		req.connection.remoteAddress ||
		req.socket.remoteAddress ||
		req.connection.socket.remoteAddress,
	logEntry = [ eventName, 'from', ip ].join( ' ' );

	log( logEntry );
}

function log ( logEntry ) {
    'use strict';

	var now = new Date(),
		time = now.getFullYear() + '/' + ( now.getMonth() + 1 ) + '/' + now.getDate() + ' ' + now.toTimeString(),
		logEntry = [ time, logEntry ].join( ' ' );

	console.log( logEntry );
}

https.createServer( options, onRequest ).listen( config.port );
