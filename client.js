var net = require('net');
var s = undefined;
var c = undefined;

const options = {
    name: '',
    shouldSave: false,
    server: {
        host: '127.0.0.1',
        port: 3000
    },
    client: {
        host: '127.0.0.1',
        port: 6969
    },
    CMD: [
        {exit: 'exit'}
    ]
}

console.log("Inserire il nome:");

_getInput().then(d => {
    options.name = d;
    console.log("\nInserire l'host:");
    _getInput().then(h => {
        //options.client.host = h;
        options.client.host = '127.0.0.1';

        let p1 = createServer();
        let p2 = connectClient();

        Promise.all([p1, p2]).then(_ => { 
            init();
        });
    });
});



function init() {
    console.log("");
    console.log("====== STARTING ======");
    console.log("");

    _write();
}


function _write() {
    process.stdout.write(options.name+"@"+options.server.host+"> ");
    _getInput().then(d => {
        options.shouldSave && _save(d);

        if (!isCMD(d)) {
            c.write(d);
            _write();
        }
    });
}

function _save(data) {}

function isCMD(d) {
    options.CMD.forEach((obj, i) => {
        for (let prop in obj) {
            if (prop == d) {
                console.log("TROVATO COMANDO; eseguo ", obj[prop]);
                return true;
            }
        }
    });
    return false;
}


function _onClientData(data) {
    //console.log("daje", data.toString().trim());
    //this.write("EDDAJEFORTE");
}
function _onServerData(data) {
    console.log("daje2", data.toString().trim());
}


function _getInput() {
    return new Promise((resolve) => {
        var stdin = process.openStdin();
        stdin.addListener("data", function(d) {
            resolve(d.toString().trim());
        });
    })
}

function createServer() {
    return new Promise((resolve) => {
        net.createServer(function(sock) {
            sock.on('data', _onServerData);
        }).listen(options.server.port, options.server.host, () => {
            s = this;
            resolve();
        });

        console.log('');
        console.log('[Log] Server created ' + options.server.host + ':' + options.server.port);
    });
}

function connectClient() {
    return new Promise((resolve) => {
        var client = new net.Socket();
        client.connect(options.client.port, options.client.host, function() {
            console.log('[Log] Connected to client ' + options.client.host + ':' + options.client.port);

            //client.write('Test');
            c = this;
            resolve();
        });

        client.on('data', _onClientData);

        client.on('close', function() {
            console.log('Connection closed');
        });
    });
}