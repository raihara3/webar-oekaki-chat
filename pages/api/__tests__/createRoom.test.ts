import createRoomHandlerMock from '../__mocks__/createRoom.mock'

describe('api/createRoom', () => {
  test('Database connection error', async () => {
    const res = await new createRoomHandlerMock()
    expect(res._getStatusCode()).toBe(500)
    expect(JSON.parse(res._getData()).roomID).toBeUndefined()
  })

  test('Successfully get RoomID', async () => {
    const res = await new createRoomHandlerMock()
    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData()).roomID).toHaveLength(10)
  })
})