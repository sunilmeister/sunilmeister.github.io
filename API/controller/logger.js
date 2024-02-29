const {createLogger, transports, format} = require('winston')

//--------logerFunction------

const messageLogger = createLogger({
    transports:[
        new transports.File({
            filename: 'messages.log',
            level:'info',
            format: format.combine(format.timestamp(),format.json())
        }),

        new transports.File({
                filename:'messages-debug.log',
                level:'debug',
                format: format.combine(format.timestamp(),format.json())
        })
    ]
})

module.exports = {messageLogger}