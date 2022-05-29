const express = require('express'),
  path = require('path'),
  { info: infoLog, error: errorLog } = require('debugjs-wrapper').all('parser_index'),
  { process, getMetadata, FRAMES } = require('./process'),
  PORT = process.env.PORT || 3000

const app = express()

app.use(express.urlencoded())


app.use('/frames', express.static(`${__dirname}/frames`))

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  infoLog('Sending home HTML')

  res.render('index')
})

app.get('/result', (req, res) => {
  infoLog('Sending result HTML')

  res.render('result', { metadata: getMetadata(), FRAMES })
})

app.post('/', (req, res) => {
  infoLog('Got video request', req.body)

  const { url } = req.body

  if (!url) {
    res.render('error', { error: 'URL is missing' })
    return
  }

  if (!/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/gi.test(url)) {
    res.status(400).render('error', { error: 'Invalid URL format' })
    return
  }

  try {
    process(url)
  } catch (err) {
    errorLog('Failed processing', err)
    res.status(500).render('error', { error: err.message })
    return
  }
  
  res.render('started')
})

app.listen(PORT, () => {
  infoLog(`Server is running at localhost:${PORT}`)
})