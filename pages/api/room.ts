import { Server } from 'socket.io'
import redis from 'redis'
import UserRepository from '../../core/repository/user/redis'
import MeshRepository from '../../core/repository/mesh/redis'
import UserService from '../../core/service/UserService'
import AddUserService from '../../core/service/AddUserService'

const roomHandler = (_, res) => {
  // TODO: change to the RoomID
  const roomID = 'testRoom'

  if(res.socket.server.io) {
    console.log('socket.io already running')
  }else {
    console.log('*First use, starting socket.io')
    const client = redis.createClient()
    const userRepository = new UserRepository(client)
    const meshRepository = new MeshRepository(client)
    const userService = new UserService(userRepository, meshRepository)
    const io = new Server(res.socket.server)

    io.on('connect', socket => {
      socket.join(roomID)
      socket.on('addUser', () => {
        new AddUserService(userRepository, meshRepository).execute(socket, roomID)
      })

      socket.on('sendMesh', data => {
        meshRepository.add(roomID, JSON.stringify(data))
        socket.broadcast.emit('getMesh', [data])
      })

      socket.on('disconnect', () => {
        console.log(`disconnect: ${socket.id}`)
        const hasActiveMember = socket.adapter.rooms.has(roomID)
        userService.remove(roomID, socket.id, hasActiveMember)
      })
    })
    res.socket.server.io = io
  }
  res.end()
}

export const config = {
  api: {
    bodyParser: false
  }
}

export default roomHandler
