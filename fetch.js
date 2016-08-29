var http = require('http');
var env = require('./lib/envato/env');
var auth = require('./lib/envato/auth');


auth.requestAccess();

if (auth.hasAccess()) {
    console.log('💕 WE GOT ACCESS!');
} else {
    console.log('🙈  I haven\'t got access yet.');
}

function route(req, res) {
    console.log('Incoming path request: ' + req.url);

    if (req.url.indexOf('/auth-confirm') === 0) {
        // User is redirected after approving Envato API access
        auth.receiveUserPermissionApproval(req, res);
    } else {
        if (auth.hasAccess()) {
            res.write('ACCESS GRANTED');
            res.end();
        } else {
            auth.displayStart(req, res);
        }
    }
}

var server = http.createServer(route);
server.listen(auth.getLocalPort());

console.log('Visit ' + env.client.url + ' to approve API access to Envato.');
