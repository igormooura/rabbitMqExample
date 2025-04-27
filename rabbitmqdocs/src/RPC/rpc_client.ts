var amqp = require('amqplib/callback_api');

var args = process.argv.slice(2); // Ex: npm run rpc_client 5

if (args.length == 0) {
  console.log("Usage: rpc_client.js num");
  process.exit(1);
}

amqp.connect('amqp://localhost', function(error0, connection) {
  if (error0) {
    throw error0; 
  }

  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1; 
    }

    // Declara uma fila anônima (sem nome) e exclusiva para este cliente (ela será deletada quando a conexão fechar)
    channel.assertQueue('', {
      exclusive: true // A fila será usada apenas por essa conexão
    }, function(error2, q) {
      if (error2) {
        throw error2; 
      }

      var correlationId = generateUuid(); // Gera um ID único para identificar a resposta correspondente
      var num = parseInt(args[0]); 

      console.log(' [x] Requesting fib(%d)', num);

      // Escuta mensagens da fila anônima (a resposta será enviada para cá)
      channel.consume(q.queue, function(msg) {
        if (msg.properties.correlationId == correlationId) {
          console.log(' [.] Got %s', msg.content.toString()); // Imprime o resultado da operação recebida
          setTimeout(function() {
            connection.close(); // Fecha a conexão após um pequeno delay
            process.exit(0);
          }, 500);
        }
      }, {
        noAck: true // Define que a mensagem não precisa de confirmação de recebimento
      });

      // Envia a requisição para a fila 'rpc_queue' com o número desejado
      channel.sendToQueue('rpc_queue',
        Buffer.from(num.toString()), { // Corpo da mensagem é o número convertido em buffer
          correlationId: correlationId, // ID único para rastrear a resposta
          replyTo: q.queue // Indica a fila onde a resposta deve ser enviada
        });
    });
  });
});

// Função para gerar um ID único (correlationId)
function generateUuid() {
  return Math.random().toString() +
         Math.random().toString() +
         Math.random().toString();
}
