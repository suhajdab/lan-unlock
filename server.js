var applescript = require( 'applescript' ),
	https = require( 'https' ),
	fs = require( 'fs' ),

	index = fs.readFileSync('index.html' ),
	config = JSON.parse( fs.readFileSync( 'config.json' )),

	screensaver = require( './screensaverScript' ),
	unlock = require( './unlockScript' )( config.password );

var options = {
	key: fs.readFileSync('local.key'),
	cert: fs.readFileSync('local.cert')
};

function onRequest ( req, res ) {
	var eventName;

	if ( req.method === 'POST' ) {

		var body = '';

		req.on( 'data', function (data) {
			body += data;
			// kill large requests
			if (body.length > 1e4) {
				req.connection.destroy();
			}
		});

		req.on( 'end', function () {
			var data = JSON.parse( body );

			if ( config.pin !== data.pin ) {
				eventName = 'incorrect pin';
                sendJSON( res, { err: eventName });
			} else if ( data.unlock ) {
				unlock( res, unlockCallback );
				eventName = 'unlocked';
			} else if ( data.sleep ) {
				screensaver( res, sleepCallback );
				eventName = 'put to sleep';
			}

			logEvent( eventName, req );
		});
	} else {
		serverIndex( res );
		eventName = 'index loaded';

		logEvent( eventName, req );
	}
}

function unlockCallback ( res, err, rtn ) {
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
	var resp = {};

	if ( err ) {
		console.error( err );
		resp.err = err;
	} else {
		resp.status = "screensaver activated";
	}
	sendJSON( res, resp );
}

function serverIndex ( res ) {
	res.writeHead( 200, { 'Content-Type': 'text/html' });
	res.end( index );
}

function sendJSON ( res, resp ) {
	res.writeHead( 200, { 'Content-Type': 'application/json' });
	res.write( JSON.stringify( resp ) );
	res.end();
}

function logEvent ( eventName, req ) {
	var time = new Date().toLocaleTimeString(),
		ip = req.headers['x-forwarded-for'] ||
			req.connection.remoteAddress ||
			req.socket.remoteAddress ||
			req.connection.socket.remoteAddress,
		logEntry = [ time, eventName, 'from', ip ].join( ' ' );

	console.log( logEntry );
}

https.createServer( options, onRequest ).listen( config.port );
