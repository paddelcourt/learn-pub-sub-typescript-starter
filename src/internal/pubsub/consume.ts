import amqp from "amqplib";


export enum SimpleQueueType {
  Durable,
  Transient,
}

export async function declareAndBind(
  conn: amqp.ChannelModel,
  exchange: string,
  queueName: string,
  key: string,
  queueType: SimpleQueueType): Promise<[amqp.Channel, amqp.Replies.AssertQueue]> {
    
    let queue: amqp.Replies.AssertQueue;
    const channel = await conn.createChannel()
    if (queueType === 0) {
        queue = await channel.assertQueue(queueName, {durable: true, autoDelete: false, exclusive: false})
    }
    else {
        queue = await channel.assertQueue(queueName, {durable: false, autoDelete: true, exclusive: true})
    }
    return [channel, queue]

}

export async function subscribeJSON<T>(
  conn: amqp.ChannelModel,
  exchange: string,
  queueName: string,
  key: string,
  queueType: SimpleQueueType,
  handler: (data: T) => void,
): Promise<void> {
  const [channel, queue] = await declareAndBind(conn, exchange, queueName, key, queueType)
  function callbackFunction(message: amqp.ConsumeMessage | null)  {
    if (message === null) {
      return 
    }
    const messageJSON = JSON.parse(message.content.toString())
    handler(messageJSON)
    channel.ack(message)
    }
  channel.consume(queue.queue , callbackFunction)
  }
