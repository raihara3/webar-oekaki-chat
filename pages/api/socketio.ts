import { Server } from 'socket.io'
import {
  redisHandler,
  onAddUser,
  onRemoveUser,
  onAddMesh,
  onRemoveAllMesh,
  onGetScene
} from './redis'

// TODO: change to the RoomID
const roomID = 'testRoom'

const ioHandler = (_, res) => {
  if (!res.socket.server.io) {
    console.log('*First use, starting socket.io')

    redisHandler()

    const io = new Server(res.socket.server)
    io.on('connection', async socket => {

      socket.join(roomID)

      const rooms = await io.allSockets()

      socket.on('add user', async () => {
        socket.broadcast.emit('add user', socket.id)
        socket.emit('join', socket.id)

        const scene: Array<string> = await onGetScene(roomID)
        socket.emit('get scene', scene.map(mesh => JSON.parse(mesh)))

        onAddUser(roomID, socket.id)

        const ownerId = rooms.values().next().value
        if(ownerId !== socket.id) {
          io.to(ownerId).emit('copy scene', socket.id)
        }
      })

      socket.on('send three mesh', data => {
        socket.broadcast.emit('get three mesh', data)
        onAddMesh(roomID, JSON.stringify(data))
      })

      socket.on('disconnect', () => {
        onRemoveUser(roomID, socket.id)
        if(!socket.adapter.rooms.has(roomID)) {
          onRemoveAllMesh(roomID)
        }
      })
    })

    res.socket.server.io = io
  } else {
    console.log('socket.io already running')
  }
  res.end()
}

export const config = {
  api: {
    bodyParser: false
  }
}

export default ioHandler
