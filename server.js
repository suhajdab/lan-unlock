var applescript = require( 'applescript' ),
	https = require( 'https' ),
	fs = require( 'fs' ),

	index = fs.readFileSync('index.html' ),
	config = JSON.parse( fs.readFileSync( 'config.json' ));

var options = {
	key: fs.readFileSync('local.key'),
	cert: fs.readFileSync('local.cert')
};


var unlockScript =
	'tell application "System Events"\n\
		if name of every process contains "ScreenSaverEngine" then \n\
			tell application "ScreenSaverEngine"\n\
				quit\n\
			end tell\n\
			delay 0.2\n\
 		else \n\
		tell application "Terminal"\n\
			do shell script "caffeinate -u -t 1"\n\
			end tell\n\
			delay 0.5\n\
		end if\n\
		tell application "System Events" to tell process "loginwindow"\n\
			tell window "Login Panel"\n\
				keystroke "' + config.password + '"\n\
				keystroke return\n\
			end tell\n\
		end tell\n\
	end tell';

var sleepScript =
	'tell application "System Events"\n\
		start current screen saver\n\
	end tell';

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
				unlock( res );
				eventName = 'unlocked';
			} else if ( data.sleep ) {
				sleep( res );
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

function serverIndex ( res ) {
	res.writeHead( 200, { 'Content-Type': 'text/html' });
	res.end( index );
}

function sendJSON ( res, resp ) {
	res.writeHead( 200, { 'Content-Type': 'application/json' });
	res.write( JSON.stringify( resp ) );
	res.end();
}

function unlock ( res ) {
	applescript.execString( unlockScript, function( err, rtn ) {
		var resp = {};
		if ( err ) {
			console.error( err );
			resp.err = err;
		} else {
			resp.status = 'unlocked';
		}
		sendJSON( res, resp );
	});
}

function sleep ( res ) {
	applescript.execString( sleepScript , function( err, rtn ) {
		var resp = {};
		if ( err ) {
			console.error( err );
			resp.err = err;
		} else {
			resp.status = "screensaver activated";
		}
		sendJSON( res, resp );
	});

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
