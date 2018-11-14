const client = {
    ref: '',
    host: '127.0.0.1',
    port: 6969,
    onCreate: (t) => {return _onClientCreate(t);},
    onData: () => {return _onClientData();},
    onClose: () => {}
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

function _onClientClose() {
    console.log("Client closed");
    //_destroyClient();
}

export default client;