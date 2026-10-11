import type { ConfirmChannel } from "amqplib";

export async function publishJSON<T>(
  ch: ConfirmChannel,
  exchange: string,
  routingKey: string,
  value: T, ): Promise<void> {
    const stringValue = JSON.stringify(value)
    const serializeValue = Buffer.from(stringValue)
    ch.publish(exchange, routingKey, serializeValue, {contentType: "application/json"})

}