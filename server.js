var net = require('net');
 
var HOST = '127.0.0.1';
var PORT = 6969;
 
// Creaiamo un istanza del server, e concateniamo la funzione listen
// La funzione passata a net.createServer() diventerà l'event handler per l'evento 'connection'
// l'oggetto sock che la callback prende come parametro è univoco per ogni connessione.
net.createServer(function(sock) {
 
    // abbiamo una connessione - un oggetto è assegnato alla connessione automaticamente
    console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);
 
    // Aggiungiamo l'event handler 'data' per questa instanza di socket
    sock.on('data', function(data) {
 
        console.log('DATA ' + sock.remoteAddress + ': ' + data);
        
        // Rispondiamo al client, il client riceverà questi dati dal server.
        let response = 'You said '+data;
        console.log(response);
        sock.write(response);
 
    });
 
    // Aggiungiamo l'event handler 'close' per questa istanza di socket
    sock.on('close', function(data) {
        console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
    });
 
}).listen(PORT, HOST);
 
console.log('Server listening on ' + HOST +':'+ PORT);