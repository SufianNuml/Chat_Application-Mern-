// socketService.js
import io from 'socket.io-client';

class SocketService {
  constructor() {
    if (!SocketService.instance) {
      this.socket = io("http://localhost:5000");
      SocketService.instance = this;
    }

    return SocketService.instance;
  }

  getSocket() {
    return this.socket;
  }
}

const instance = new SocketService();
Object.freeze(instance);

export default instance;
