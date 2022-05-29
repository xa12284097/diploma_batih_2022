const { info: infoLog, error: errorLog } = require('debugjs-wrapper').all('parser_process'),
  ytdl = require('ytdl-core'),
  fs = require('fs'),
  ffmpeg = require('ffmpeg'),
  { pipeline } = require('stream/promises')

const FRAMES = 10

const STATUSES = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE' 
}

const METADATA_FIELDS = {
  title: 'title',
  description: 'description',
  lengthSeconds: 'lengthSeconds',
  ownerProfileUrl: 'ownerProfileUrl',
  isFamilySafe: 'isFamilySafe',
  availableCountries: 'availableCountries',
  viewCount: 'viewCount',
  category: 'category',
  publishDate: 'publishDate',
  ownerChannelName: 'ownerChannelName',
  uploadDate: 'uploadDate',
  videoId: 'videoId',
  keywords: 'keywords',
  author: 'author',
  isLiveContent: 'isLiveContent',
  isPrivate: 'isPrivate',
  likes: 'likes',
  age_restricted: 'age_restricted',
  video_url: 'video_url'
}

let status = STATUSES.NOT_STARTED,
  metadata

const getMetadata = () => metadata

const parseMetadata = meta => {
  const finalMetadata = {}
  for (key in meta) {
    if (METADATA_FIELDS[key]) {
      finalMetadata[key] = meta[key]
    }
  }
  finalMetadata.author = {
    name: meta.author.name,
    user_url: meta.author.user_url,
    verified: meta.author.verified,
    subscriber_count: meta.author.subscriber_count
  }
  return finalMetadata
}

const extract = async () => {
  const fmpg = new ffmpeg('video.mp4')

  const video = await fmpg

  try {
    await new Promise((resolve, reject) => {
      video.fnExtractFrameToJPG('./frames', {
        number: FRAMES,
        frame_rate: 1/Math.floor(Number(metadata.lengthSeconds)/FRAMES)
      }, err => {
        if (err) {
          reject(err)
          return
        }
        resolve()
      })
    })
  } catch (err) {
    errorLog('Failed extracting frames from video', err)
    throw err
  }

  infoLog('Extracted frames from video')
}

const download = async url => {
  try {
    const info = await ytdl.getBasicInfo(url)
    metadata = parseMetadata(info.videoDetails)
  } catch (err) {
    error('Failed downloading metadata', err)
    throw err
  }

  infoLog('Metadata downloaded')

  try {
    await pipeline(
      ytdl(url),
      fs.createWriteStream('video.mp4')
    )
  } catch (err) {
    errorLog('Failed downloading video', err)
    throw err
  }

  infoLog('Video downloaded')
}

const processAsync = async url => {
  await new Promise((resolve, reject) => {
    fs.rm('frames', {recursive: true, force: true}, err => {
      if (err) {
        reject(err)
        return
      }
      resolve()
    })
  })
  await new Promise((resolve, reject) => {
    fs.unlink('video.mp4', err => {
      if (err?.code !== 'ENOENT') {
        reject(err)
        return
      }
      resolve()
    })
  })
  await download(url)
  await extract()
}

const process = url => {
  if (status === STATUSES.IN_PROGRESS) {
    throw new Error('Already in progress')
  }

  infoLog('Starting processing video with url', url)

  status = STATUSES.IN_PROGRESS
  metadata = null

  processAsync(url)
    .then(() => {
      status = STATUSES.DONE
      fs.unlink('video.mp4', () => {})
    })
    .catch(err => {
      errorLog('Failed processing video', err)
      fs.unlink('video.mp4', () => {})
    })
}

module.exports = {
  process,
  getMetadata,
  FRAMES
}