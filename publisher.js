
const redis = require('redis');

let HOST = '127.0.0.1';
let PORT = 6379;
let CHANNEL = 'from-etherpad-redis-channel';

const strategy = function(options) {
  if (options.error && options.error.code === 'ECONNREFUSED') {
    // End reconnecting on a specific error and flush all commands with
    // a individual error
    return new Error('The server refused the connection');
  }
  if (options.total_retry_time > 1000 * 60 * 60) {
    // End reconnecting after a specific timeout and flush all commands
    // with a individual error
    return new Error('Retry time exhausted');
  }
  if (options.attempt > 10) {
    // End reconnecting with built in error
    return undefined;
  }
  // reconnect after
  return Math.min(options.attempt * 100, 3000);
};

let params = {
  host: HOST,
  port: PORT,
  retry_strategy: strategy
};

const publisher = redis.createClient(params);

const buildEnvelope = function(name) {
  return { name: name, routing: 'etherpad' };
};

const buildCore = function(name, content) {
  const timestamp = (new Date()).getTime();
  const header = { name: name };
  const body = content;
  body['timestamp'] = timestamp;

  return { header: header, body: body };
};

const buildPadCreateSysMsg = function(args) {
  const name = 'PadCreateSysMsg';
  const envelope = buildEnvelope(name);
  const core = buildCore(name, args);

  return { envelope: envelope, core: core };
};

const buildPadUpdateSysMsg = function(args) {
  const name = 'PadUpdateSysMsg';
  const envelope = buildEnvelope(name);
  const core = buildCore(name, args);

  return { envelope: envelope, core: core };
};

const buildPadRemoveSysMsg = function(args) {
  const name = 'PadRemoveSysMsg';
  const envelope = buildEnvelope(name);
  const core = buildCore(name, args);

  return { envelope: envelope, core: core };
};

const buildMessage = function(hook_name, args) {
  let message;
  switch (hook_name) {
    case 'padCreate':
      message = buildPadCreateSysMsg(args);
      break;
    case 'padUpdate':
      message = buildPadUpdateSysMsg(args);
      break;
    case 'padRemove':
      message = buildPadRemoveSysMsg(args);
      break;
    default:
      console.warn('Unhandled hook:', hook_name);
      return;
  }
  if (message) {
    return JSON.stringify(message);
  } else {
    console.error('Empty message for:', hook_name);
    return null;
  }
};

exports.padCreate = function(hook_name, args, cb) {
  if (publisher) {
    const message = buildMessage(hook_name, args);
    if (message) {
      publisher.publish(CHANNEL, message);
    }
  }
  return cb();
};

exports.padUpdate = function(hook_name, args, cb) {
  if (publisher) {
    const message = buildMessage(hook_name, args);
    if (message) {
      publisher.publish(CHANNEL, message);
    }
  }
  return cb();
};

exports.padRemove = function(hook_name, args, cb) {
  if (publisher) {
    const message = buildMessage(hook_name, args);
    if (message) {
      publisher.publish(CHANNEL, message);
    }
  }
  return cb();
};
