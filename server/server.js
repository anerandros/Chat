const server = {
    ref: '',
    host: '127.0.0.1',
    port: 3000,
    onCreate: (t) => {return _onServerCreate(t);},
    onData: () => {return _onServerData();},
    onClose: () => {}
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

function _onServerClose() {
	console.log("Server closed");
	//_destroyServer();
}

export default server;