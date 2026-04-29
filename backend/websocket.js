/**
 * websocket.js
 * Shared WebSocket broadcaster singleton.
 * server.js calls init(wss) once; controllers call broadcast(data).
 */

let _wss = null;

const init = (wss) => {
    _wss = wss;
};

const broadcast = (data) => {
    if (!_wss) return;
    const msg = typeof data === 'string' ? data : JSON.stringify(data);
    _wss.clients.forEach((client) => {
        if (client.readyState === 1) {   // WebSocket.OPEN
            client.send(msg);
        }
    });
};

module.exports = { init, broadcast };
