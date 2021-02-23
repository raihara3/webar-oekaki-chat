import { createMocks } from 'node-mocks-http'
import createRoomHandler from '../createRoom'
import RoomRepositoryMock from '../../../core/repository/room/__mocks__/RoomRepository.mock'
import CreateRoomService from '../../../core/service/room/CreateRoomService'

jest.mock('../createRoom')
const createRoomHandlerMock = createRoomHandler as jest.Mock

createRoomHandlerMock.mockImplementation(() => {
  const { res } = createMocks()
  const roomRepositoryMock = new RoomRepositoryMock()
  const roomID = new CreateRoomService(roomRepositoryMock).execute()

  res.status(200).json({roomID: roomID})
  res.end()
  return res
})

export default createRoomHandlerMock
