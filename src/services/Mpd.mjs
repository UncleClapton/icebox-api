import mpcJs from 'mpc-js'





import AdvMath from '../classes/AdvMath'
import EventBuffer from '../classes/EventBuffer'
import DataPresenters from '../classes/Presenters'





const mpdBuffer = new EventBuffer()
const DEFAULT_MINPLAYLISTLENGTH = 5




export default class Mpd {
  library = []
  socket = null
  mpc = null

  async getClientPayload () {
    const { state } = await this.mpc.status.status()
    const playlistInfo = await this.mpc.currentPlaylist.playlistInfo()

    const payload = {
      state,
      currentSong: {},
      playlist: playlistInfo.map(DataPresenters.presentSongMetadata),
    }

    if (payload.state !== 'stop') {
      payload.currentSong = DataPresenters.presentSongMetadata(await this.mpc.status.currentSong())
    }

    return payload
  }

  async handleNewSocketConnection (client) {
    const curData = await this.getClientPayload()
    client.sendMessage('update', curData)
  }


  @mpdBuffer.asListener('mpd/player')
  async updatePlayer () {
    const nextPayload = await this.getClientPayload()
    this.socket.broadcast(nextPayload)
  }


  @mpdBuffer.asListener('mpd/playlist')
  async updatePlaylist () {
    const currentPlaylist = await this.mpc.currentPlaylist.playlistInfo()
    let playlistDeficit = (this.config?.minPlaylistLength ?? DEFAULT_MINPLAYLISTLENGTH) - currentPlaylist.length

    const newSongs = []

    while (playlistDeficit > 0) {
      // Get next song
      const nextSongPos = AdvMath.getBiasedRandom(0, this.library.length)
      const nextSong = this.library[nextSongPos]

      // Add song to our playlist
      newSongs.push(this.mpc.currentPlaylist.add(nextSong))

      // push song to the back of the library list
      this.library = this.library.slice(nextSongPos + 1)
      this.library.push(nextSong)

      // decrement deficit
      playlistDeficit -= 1
    }

    // Wait for all songs to be added, then update the player and return.
    await Promise.all(newSongs)
    await this.updatePlayer()
  }


  @mpdBuffer.asListener('mpd/database')
  async updateDatabase () {
    const listAllResponse = await this.mpc.sendCommand('listAll')
    this.library = AdvMath.shuffleArray(listAllResponse.reduce((acc, line) => {
      if (line.startsWith('file')) {
        acc.push(line.substring(line.indexOf(':') + 2))
      }
      return acc
    }, []))

    await this.updatePlaylist()
  }

  connect () {
    return new Promise((resolve, reject) => {
      this.mpc.once('ready', async () => {
        await this.mpc.connection.password(this.config.password)
        console.log('[MPDC]     MPDC Connected - Gathering database info')
        await this.updateDatabase()
        resolve()
      })

      this.mpc.once('socket-error', (error) => {
        reject(error)
      })

      this.mpc.connectTCP(this.config.hostname, this.config.port)
    })
  }

  constructor (socket, config) {
    this.config = config
    this.socket = socket
    this.mpc = new mpcJs.MPC()

    socket.on('connection', this.handleNewSocketConnection)

    this.mpc.on('changed-player', () => {
      mpdBuffer.dispatch({ type: 'mpd/player' })
    })

    this.mpc.on('changed-playlist', () => {
      mpdBuffer.dispatch({ type: 'mpd/playlist' })
    })

    this.mpc.on('changed-update', () => {
      mpdBuffer.dispatch({ type: 'mpd/database' })
    })
  }
}
