//import server from 'server/server.js';
//import client from 'client/client.js';
var net = require('net');

const options = {
    name: '',
    shouldSave: false,
    debug: false
}

const CMD = [
    {exit: 'exit'}
]

const server = {
    ref: '',
    host: '127.0.0.1',
    port: 3000,
    onCreate: (t) => {return _onServerCreate(t);},
    onData: () => {return _onServerData();},
    onClose: () => {}
}

const client = {
    ref: '',
    host: '127.0.0.1',
    port: 6969,
    onCreate: (t) => {return _onClientCreate(t);},
    onData: () => {return _onClientData();},
    onClose: () => {}
}





var p = [];
var initTask = [
    {
        fn: createServer,
        cb: [
            () => {console.log("a1")},
        ]
    },
    {
        fn: _getInput,
        cb: [
            (d) => {d => options.name = d}
        ]
    }/*,
    {
        fn: _getInput,
        cb: [
            (d) => {
                //client.host = d;
                client.host = '127.0.0.1';
            }
        ]
    }
    */
    ,
    {
        fn: connectClient
    }
];


initTask.forEach((obj, i) => {
    p.push(new Promise((resolve) => {
        options.debug && console.log("Executing fn ", i+1);
        obj['fn'] && typeof obj['fn'] === 'function' && obj['fn']().then(d => {
            obj['cb'] && obj['cb'].forEach((cb, j) => {
                options.debug && console.log("Executing cb ", i+1, j+1);
                typeof cb === 'function' && cb(d);
            });
            resolve();
        });
    }));
});

Promise.all(p).then ( _ => {
    console.log("[Log] Init tasks completed");
    init();
});


function init() {
    console.log("");
    console.log("====== STARTING ======");
    console.log("");

    _write();
}
function _write() {
    process.stdout.write(options.name+"@"+server.host+"> ");
    _getInput().then(d => {
        options.shouldSave && _save(d);

        if (!isCMD(d)) {
            client.ref.write(d);
            _write();
        }
    });
}
function isCMD(d) {
    CMD.forEach((obj, i) => {
        for (let prop in obj) {
            if (prop == d) {
                console.log("TROVATO COMANDO; eseguo ", obj[prop]);
                return true;
            }
        }
    });
    return false;
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
            sock.on('data', server.onData);
        }).listen(server.port, server.host, () => {
            server.onCreate(this);
            resolve();
        });
    });
}
function _onServerCreate(t) {
    server.ref = t;
    console.log("test server created");
    //console.log('');
    //console.log('[Log] Server created ' + options.server.host + ':' + options.server.port);
}
function _onServerData(data) {
    console.log("daje2", data.toString().trim());
}





function connectClient() {
    return new Promise((resolve) => {
        var c = new net.Socket();

        c.on('data', client.onData);
        c.on('close', client.onClose);

        c.connect(client.port, client.host, function() {
            client.onCreate(this);
            resolve();
        });
        
    });
}
function _onClientCreate(t) {
    client.ref = t;
    console.log("test client created");
    //console.log('[Log] Connected to client ' + client.host + ':' + client.port);
}
function _onClientData(data) {
    console.log("daje", data.toString().trim());
    //this.write("EDDAJEFORTE");
}