//import server from 'server/server.js';
//import client from 'client/client.js';
var net = require('net');

const options = {
    name: '',
    debug: false,
    verbose: true,
    shouldSave: false
}

const CMD = [
    {exit: 'exit'}
]

const server = {
    ref: '',
    host: '127.0.0.1',
    port: 3000,
    onCreate: (t) => {return _onServerCreate(t);},
    onData: (d) => {return _onServerData(d);},
    onClose: () => {}
}

const client = {
    ref: '',
    host: '127.0.0.1',
    port: 6969,
    onCreate: (t) => {return _onClientCreate(t);},
    onData: (d) => {return _onClientData(d);},
    onClose: () => {}
}





var p = [];
var initTask = [
    {
        fn: createServer
    },/*
    {
        fn: _getInput,
        cb: [
            (d) => {d => options.name = d}
        ]
    },
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
        let s = net.createServer(function(sock) {
            sock.on('data', server.onData);
        }).listen(server.port, server.host, () => {
            server.onCreate(s);
            resolve();
        });
    });
}
function _onServerCreate(t) {
    server.ref = t;
    options.verbose && console.log("[Log] Server created on "+server.host+":"+server.port);
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
    options.verbose && console.log("[Log] Client connected on "+client.host+":"+client.port);
    //console.log('[Log] Connected to client ' + client.host + ':' + client.port);
}
function _onClientData(data) {
    //process.stdout.write(options.name+"@"+client.host+"> ");
    process.stdout.write("response> ");
    console.log(data.toString().trim());
    //this.write("EDDAJEFORTE");
}