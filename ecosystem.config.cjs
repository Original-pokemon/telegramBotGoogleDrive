module.exports = {
  apps : [{
    name: 'telegram_bot',
    script: 'index.js',
    out_file: 'telegram_bot_out.log',
    error_file: 'telegram_bot-error.log',
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    time: true,
  }, {
    instances: "max",
    exec_mode: "cluster"
  }],
};
