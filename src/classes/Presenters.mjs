export default class DataPresenters {
  static presentSongMetadata (songInfo) {
    return {
      id: songInfo.path || null,
      type: 'song',
      attributes: {
        album: songInfo.album || null,
        albumArtist: songInfo.albumArtist || null,
        artist: songInfo.artist || null,
        date: songInfo.date || null,
        genre: songInfo.genre || null,
        position: songInfo.position ?? null,
        duration: songInfo.duration ?? 0,
        title: songInfo.title || null,
      },
    }
  }

  static presentWSMessage (action, data, restMeta) {
    if (typeof action !== 'string' || !data) {
      throw new TypeError('Action must be string and data must exist')
    }
    return {
      data,
      meta: {
        action,
        ...restMeta,
      },
    }
  }
}
