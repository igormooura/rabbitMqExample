var amqp = require('amqplib/callback_api')

amqp.connect('amqp://localhost', function(error0, connection){
    if(error0){
        throw error0;
    }

    connection.createChannel(function(error1, channel){
        if(error1){
            throw error1;
        }

        // "ponto de distribuição" para as mensagens
        var exchange = 'direct_logs';
        
        var args = process.argv.slice(2);
        var msg = args.slice(1).join(' ') || "Sem mensagem"

        // O 'severity' é a chave de roteamento que define o tipo da mensagem
        // Pode ser 'info', 'warning', 'error', etc.
        // Se não houver um 'severity' passado, ele assume 'info' como padrão
        var severity = (args.length > 0) ? args[0]: 'info';


        // Declara o exchange dizendo que ele é do tipo 'direct'
        // Um exchange 'direct' envia mensagens para as filas com base na chave de roteamento (o 'severity')

        channel.assertExchange(exchange, 'direct', {
            durable: false
        })

        channel.publish(exchange, severity, Buffer.from(msg));
        console.log("Sent: ", severity, msg)
    });

    setTimeout(function() {
        connection.close();
        process.exit(0)
      }, 500);
})