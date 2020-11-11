const minecraft = require('minecraft-protocol')
const colors = require('colors')
const { server_ip, version, email , password } = require('../config.json')

const server = minecraft.createServer({
    'online-mode' : 'true',
    host : '0.0.0.0',
    port : 25565,
    keepAlive : false,
    version : version
})

console.log(`[ Welcome to NuxgeEngine ! ]\n\n`.rainbow)
console.log(`Game version : ${version}\nServer adress: ${server_ip}\n\n\n[ LOGS ]\n`.yellow)

server.on('login', client => {
    let playerID
    let playerUUID = client.uuid
    console.log(`[ + ] Connected : ${client.profile.name} (id: ${client.profile.id})`.green)
    
    const target = minecraft.createClient({
        host : server_ip,
        port : 25565,
        username : email,
        password: password,
        keepAlive : false,
        version : version
    })
    
    client.on('packet', (data, meta) => {
        if (target.state === minecraft.states.PLAY && meta.state === minecraft.states.PLAY)
            target.write(meta.name, data)
    })
    
    target.on('packet', (data, meta) => {
        if (meta.state === minecraft.states.PLAY && client.state === minecraft.states.PLAY) {
            if (meta.name === 'login')
                playerID = data.entityId
            if (meta.name === 'set_compression')
                client.compressionThreshold = data.threshold
            else if (meta.name === 'entity_velocity' && data.entityId === playerID)
                client.write('entity_velocity', { entityId: data.entityId, velocityX: data.velocityX/3, velocityY: data.velocityY, velocityZ: data.velocityZ/3 })
            else
                client.write(meta.name, data)
        }
    })
    
    target.on('end', () => {
        console.log('[ - ] Disconnected.'.red)
    })
    
    target.on('error', err => {
        console.error(err.stack)
    })
})
