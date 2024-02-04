import { Kafka, Producer } from 'kafkajs';
import fs from 'fs';
import path from 'path';
import prismaClient from './prisma';

const kafka = new Kafka({
    brokers: ['kafka-chat-next-node-chat-app.a.aivencloud.com:18579'],
    ssl: {
        ca: [fs.readFileSync(path.resolve('./kafka-ca.pem'), 'utf-8')]
    },
    sasl: {
        username: 'avnadmin',
        password: 'AVNS_MVXqdYz12p_jsn1GVH5',
        mechanism: 'plain',

    }
})


let producer: Producer | null = null;
export async function createProducer() {
    if (producer) return producer;

    const _producer = kafka.producer();
    await _producer.connect();
    producer = _producer;
    return producer;
}

export async function produceMessage(message: string) {
    const producer = await createProducer();
    await producer.send({
        messages: [{ key: `message-${Date.now()}`, value: message }],
        topic: 'MESSAGES'
    })
}

export async function startMessageConsumer() {
    console.log('Consumer is running.');

    const consumer = kafka.consumer({ groupId: 'default' });
    await consumer.connect();
    await consumer.subscribe({ topic: 'MESSAGES', fromBeginning: true });

    await consumer.run({
        autoCommit: true,
        eachMessage: async ({ message, pause }) => {
            console.log('kafka consumer: Message message recv...');
            if (!message.value) return;
            try {
                await prismaClient.message.create({
                    data: {
                        text: message.value?.toString(),
                    }
                })
            } catch (err) {
                console.log('Something went wrong!');
                pause();
                setTimeout(() => consumer.resume([{ topic: 'MESSAGES' }]), 60 * 1000);

            }

        }
    })



}
export default kafka;