"use strict";

// Thanks to https://github.com/iliakan/detect-node/blob/master/index.js
var isNode = module.exports = 'object' === typeof process &&
            Object.prototype.toString.call(process) === '[object process]'
var fs
if (isNode) {
  fs = require('fs')
}

var CATEGORY_ALL = '[all]'
var levels = [CATEGORY_ALL, 'trace', 'debug', 'info', 'warn', 'error', 'fatal', 'off']

var defaultDateFormat = 'YYYY-MM-DD HH:mm:ssZ'

var configFile = null
var lastModified = null
var watchTimer = null

// string to index value
function getLevelValue(level) {
  if (level && typeof level === 'string') {
    var ix = levels.indexOf(level.toLowerCase())
    return ix === -1 ? levels.length : ix
  }
  return levels.length
}

function fmtLevel(s) {
  return '[' + s.toUpperCase() + ']'
}

// index to string value
function getLevelString(val) {
  if (val >= 0 && val < levels.length) return levels[val]
  return 'off'
}

function getLevelForCategory(category) {
  var level = config.level
  if (config.levels && config.levels[category]) {
    level = config.levels[category]
  }
  return level
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function fileExists(path) {
  if (!isNode) return false
  try {
    var stats = fs.lstatSync(path)
    return stats.isFile()
  }
  catch (err) {
    return false
  }
}

function getMTime() {
  if (!isNode) return null
  try {
    if (!configFile) return null
    return fs.statSync(configFile).mtime;
  }
  catch (e) {
    return null
  }
}

function watchConfigFile() {
  if (!isNode) return
  if (process.env.NODE_ENV === 'production') {
    watchTimer = setTimeout(watchConfigFile, config.watchInterval*1000)
    var mtime =  getMTime()
    if (!mtime) return

    if (!lastModified) {
      lastModified = new Date()
      return
    }

    if (mtime > lastModified) {
      lastModified = null
      configureFromFile(configFile)
    }
  }
  else {
    fs.watch(configFile, function (event) {
      if (event === 'change') {
        configureFromFile(configFile)
      }
    })
  }
}

function readSync(fileName) {
  if (!isNode) return null
  try {
    var buf = fs.readFileSync(fileName)
    var obj = JSON.parse(buf)
    return obj
  }
  catch(err) {
    console.error('Error reading ' + fileName + ': ' + err)
    return null
  }
}

//------------------------------------------------------------------------------
// Configuration
//------------------------------------------------------------------------------

// current configuration settings
var config = {}

function resetConfig() {
  // remove any watches / timers
  if (configFile && config.watch) fs.unwatchFile(configFile)
  if (watchTimer) { clearTimeout(watchTimer); watchTimer = null }

  config.level = getLevelValue('info')
  config.watch = false
  config.watchInterval = 60 // default 1 minute
  config.dateFormat = defaultDateFormat
  config.levels = {}
  config.loggingFunction = console.log.bind(console)
  config.dateFormatter = null;
}
resetConfig() // first time initialization

function getTimestamp() {
  return '';
}

function configureFromFile(path) {
  fs.readFile(path, function (err, content) {
    if (err) return console.error('Could not load ' + path + ': ' + err)
    try {
      var obj = JSON.parse(content)
      configFile = path
      configure(obj)
      if (config.watch) watchConfigFile()
    }
    catch (err) {
      console.error('Error parsing JSON configuration: ' + err)
    }
  })
}

function configure(obj) {
  if (!obj) return;
  if (typeof obj === 'string') return configureFromFile(obj)

  resetConfig() // restore defaults and clear any watches

  if (obj.level) {
    config.level = getLevelValue(obj.level)
    defaultLogger.level = config.level
  }
  if (obj.watchInterval && typeof obj.watchInterval === 'number') {
    if (obj.watchInterval < 10) {
      console.error('watchInterval less than 10 seconds, setting to 10')
      config.watchInterval = 10
    }
    else {
      config.watchInterval = obj.watchInterval
    }
  }
  if (obj.levels) {
    Object.keys(obj.levels).forEach(function (cat) {
      var levelValue = getLevelValue(obj.levels[cat])
      if (cat === CATEGORY_ALL) {
        config.level = levelValue
        defaultLogger.level = levelValue
      }
      else {
        config.levels[cat] = levelValue
      }
    })
  }
  if (typeof obj.loggingFunction === 'function') {
    config.loggingFunction = obj.loggingFunction
  }
  if (obj.watch) {
    config.watch = true
  }

  // update all loggers
  Object.keys(loggers).forEach(function (cat) {
    var log = loggers[cat]
    log.level = getLevelForCategory(cat)
  })
}

//------------------------------------------------------------------------------
// Logger
//------------------------------------------------------------------------------
function Logger(name) {
  this.level = getLevelForCategory(name); // This gets updated on each config change

  this.category = name ? ' ' + name : '';

  this.getLevel = function () {
    return getLevelString(this.level)
  }
}
// Add a function for each level that logs at that level value
levels.forEach(function (value) {
  if (value === 'off') return
  var logLevel = getLevelValue(value) // log level for this function
  Logger.prototype['is' + capitalize(value) + 'Enabled'] = function () {
    return (this.level <= logLevel)
  }
  Logger.prototype[value] = function () {
    if (!arguments.length) return
    if (!(this.level <= logLevel)) return

    // enabled, call log function with the level value inserted in front
    // of all other arguments
    var slevel = fmtLevel(value)
    var ts = getTimestamp()
    var args = [ts + slevel + this.category + ' - ' + arguments[0]]
    for (var ix = 1; ix < arguments.length; ix++) args.push(arguments[ix])
    config.loggingFunction.apply(null, args)
  }
})

var loggers = {}

function getLogger(name) {
  if (!name) return defaultLogger
  var logger = loggers[name]
  if (!logger) {
    logger = new Logger(name)
    loggers[name] = logger
  }
  return logger
}
var defaultLogger = new Logger()

//------------------------------------------------------------------------------
// Expose the default logger directly
//------------------------------------------------------------------------------

var useDefaultLogger = {}
levels.forEach(function (level) {
  if (level === 'off') return
  useDefaultLogger[level] = function () {
    defaultLogger[level].apply(defaultLogger, arguments)
  }
})
useDefaultLogger.configure = configure;
useDefaultLogger.getLogger = getLogger;
 useDefaultLogger.getLevel = function () {
  return getLevelString(config.level)
},
useDefaultLogger.getCategoryLevel = function (category) {
  return getLevelString(getLevelForCategory(category))
},
useDefaultLogger.getCategories = function () {
  return config.levels
}

module.exports = useDefaultLogger
