const log = require('debug');

/**
 * Log level logs
 * 
 * @param {*} namespace 
 */
const debug = (namespace) => {
    const debugLog = log(namespace);
    debugLog.log = console.log.bind(console)
    return debugLog
}

/**Info level logs
 * 
 * @param {*} namespace 
 */
const info = (namespace) => {
    const debugLog = log(namespace);
    debugLog.log = console.info.bind(console)
    return debugLog
}


/**Error level logs
 * 
 * @param {*} namespace 
 */
const error = (namespace) => {
    const debugLog = log(namespace);
    debugLog.log = console.error.bind(console)
    return debugLog
}

const all  = (namespace) => {
    const err = error(`${namespace}:error`)
    const dbg = debug(namespace)
    const inf = info(namespace)
    return {error:err,debug:dbg, info:inf}
}

const debugObj = {
    debug,
    info,
    error,
    all
}

module.exports = debugObj
