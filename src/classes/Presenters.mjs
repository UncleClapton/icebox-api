export default class DataPresenters {
  static presentSongMetadata (songInfo) {
    return {
      id: songInfo.path || 'N/A',
      type: 'song',
      attributes: {
        album: songInfo.album || 'N/A',
        albumArtist: songInfo.albumArtist || 'N/A',
        artist: songInfo.artist || 'N/A',
        date: songInfo.date || 'N/A',
        file: songInfo.path || 'N/A',
        genre: songInfo.genre || 'N/A',
        position: songInfo.position || 'N/A',
        duration: songInfo.duration || 'N/A',
        title: songInfo.title || 'N/A',
      },
    }
  }
}
