//import server from 'server/server.js';
//import client from 'client/client.js';
var net = require('net');
var readline = require('readline');

const options = {
    debug: false,
    verbose: true,
    shouldSave: false,
    retries: 0,
    waitTime: 1
}

const CMD = [
    {exit: 'exit'}
]

const server = {
    ref: '',
    host: '',
    port: 3000,
    name: "",
    isConfigured: false,
    hasResponse: false,
    response: [],
    onCreate: _onServerCreate,
    onData: _onServerData,
    onError: _onServerError,
    onClose: () => {}
}

const client = {
    ref: '',
    host: '127.0.0.1',
    port: 6969,
    name: "",
    onCreate: _onClientCreate,
    onData: _onClientData,
    onError: _onClientError,
    onClose: () => {}
}


var p = [];
var initTask = [
    {
        fn: createServer
    },
    {
        fn: connectClient
    }
];


if (process.argv.length !== 3) {
    console.log("Usage: " + __filename + " name@host");
    process.exit(-1);
}

let argv = process.argv[2].split("@");
client.name = argv[0];
client.host = argv[1];


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

    _config();
    _write();
}
function _config() {
    let obj = {
        'type': 'config',
        'data': {
            'name': client.name
        }
    }

    client.ref.write(JSON.stringify(obj));
}
function _write() {
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(client.name+"@"+client.host+"> ");

    _getInput().then(d => {
        options.shouldSave && _save(d);

        if (!isCMD(d)) {
            let obj = {
                'type': 'message',
                'data': {
                    'message': d
                }
            }

            client.ref.write(JSON.stringify(obj));
            setTimeout(_write, 200);
        }
    });
}
function isCMD(d) {
    CMD.forEach((obj, i) => {
        for (let prop in obj) {
            if (prop == d) {
                console.log("TROVATO COMANDO; eseguo ", obj[prop]);
                //obj[prop]();
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
            sock.on('error', server.onError);
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
function _onServerError(e) {
    switch(e.code) {
        case 'ECONNRESET':
            break;
        case 'ECONNREFUSED':
            break;
    }
}
function _onServerInitialConfig(resObj) {
    server.name = resObj.data.name;
}






function connectClient() {
    return new Promise((resolve) => {
        var c = new net.Socket();

        c.on('data', client.onData);
        c.on('error', client.onError);
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
}
function _onClientData(data) {
    //process.stdout.write(client.name+"@"+client.host+"> ");
    let res = JSON.parse(data.toString().trim());

    server.hasResponse = true;
    server.response = res;
    //server.response.push(res);

    _renderResponse();
}
function _onClientError(e) {
    switch(e.code) {
        case 'ECONNRESET':
            break;
        case 'ECONNREFUSED':
            options.retries++;
            console.log("[ERROR] Cannot connect to client. Retrying in %ds ...", options.waitTime*options.retries);
            setTimeout(connectClient, options.waitTime*options.retries*1000);
            break;
    }
}
function _renderResponse() {
    if (server.hasResponse) {
        let res = server.response;

        switch(res.type) {
            case 'config':
                _onServerInitialConfig(res);
                break;
            case 'message':
                readline.cursorTo(process.stdout, 0);
                console.log(server.name+"@"+server.host+"> "+res.data.message);
                break;
        }

        server.hasResponse = false;
        server.response = [];
    }
}