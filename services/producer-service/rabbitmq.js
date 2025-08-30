const amqp = require("amqplib");

class RabbitMQService {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.isConnected = false;
    }

    async connect() {
        try {
            const rabbitMQUrl =
                process.env.RABBITMQ_URL || "amqp://localhost:5672";
            this.connection = await amqp.connect(rabbitMQUrl);
            this.channel = await this.connection.createChannel();

            const exchange =
                process.env.RABBITMQ_EXCHANGE || "analytics_exchange";
            const queue = process.env.RABBITMQ_QUEUE || "analytics_events";

            // Declare exchange and queue
            await this.channel.assertExchange(exchange, "direct", {
                durable: true,
            });
            await this.channel.assertQueue(queue, { durable: true });
            await this.channel.bindQueue(
                queue,
                exchange,
                process.env.RABBITMQ_ROUTING_KEY || "analytics.events"
            );

            this.isConnected = true;
            console.log("✅ Connected to RabbitMQ");

            // Handle connection errors
            this.connection.on("error", (err) => {
                console.error("❌ RabbitMQ connection error:", err);
                this.isConnected = false;
            });

            this.connection.on("close", () => {
                console.log("🔌 RabbitMQ connection closed");
                this.isConnected = false;
                // Attempt to reconnect after 5 seconds
                setTimeout(() => this.connect(), 5000);
            });
        } catch (error) {
            console.error("❌ Failed to connect to RabbitMQ:", error);
            this.isConnected = false;
            // Retry connection after 5 seconds
            setTimeout(() => this.connect(), 5000);
        }
    }

    async publishMessage(message) {
        if (!this.isConnected || !this.channel) {
            throw new Error("RabbitMQ is not connected");
        }

        try {
            const exchange =
                process.env.RABBITMQ_EXCHANGE || "analytics_exchange";
            const routingKey =
                process.env.RABBITMQ_ROUTING_KEY || "analytics.events";

            const messageBuffer = Buffer.from(JSON.stringify(message));

            return this.channel.publish(exchange, routingKey, messageBuffer, {
                persistent: true,
                timestamp: Date.now(),
                messageId: require("uuid").v4(),
            });
        } catch (error) {
            console.error("❌ Failed to publish message:", error);
            throw error;
        }
    }

    async close() {
        if (this.connection) {
            await this.connection.close();
            this.isConnected = false;
            console.log("🔌 RabbitMQ connection closed");
        }
    }

    isHealthy() {
        return this.isConnected;
    }
}

module.exports = new RabbitMQService();
