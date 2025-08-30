const amqp = require("amqplib");

class RabbitMQConsumer {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.isConnected = false;
        this.isConsuming = false;
        this.retryAttempts = 0;
        this.maxRetryAttempts =
            parseInt(process.env.RABBITMQ_MAX_RETRY_ATTEMPTS) || 5;
        this.retryDelay = parseInt(process.env.RABBITMQ_RETRY_DELAY_MS) || 5000;
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
            const prefetchCount =
                parseInt(process.env.CONSUMER_PREFETCH_COUNT) || 10;

            // Set prefetch count for better load balancing
            await this.channel.prefetch(prefetchCount);

            // Declare exchange and queue (should already exist from producer)
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
            this.retryAttempts = 0;
            console.log("✅ Connected to RabbitMQ as consumer");

            // Handle connection errors
            this.connection.on("error", (err) => {
                console.error("❌ RabbitMQ connection error:", err);
                this.isConnected = false;
                this.isConsuming = false;
            });

            this.connection.on("close", () => {
                console.log("🔌 RabbitMQ connection closed");
                this.isConnected = false;
                this.isConsuming = false;
                this.handleReconnection();
            });
        } catch (error) {
            console.error("❌ Failed to connect to RabbitMQ:", error);
            this.isConnected = false;
            this.handleReconnection();
        }
    }

    async handleReconnection() {
        if (this.retryAttempts < this.maxRetryAttempts) {
            this.retryAttempts++;
            console.log(
                `🔄 Attempting to reconnect to RabbitMQ (${this.retryAttempts}/${this.maxRetryAttempts}) in ${this.retryDelay}ms`
            );

            setTimeout(() => {
                this.connect();
            }, this.retryDelay);
        } else {
            console.error(
                "❌ Max RabbitMQ reconnection attempts reached. Exiting..."
            );
            process.exit(1);
        }
    }

    async startConsuming(messageHandler) {
        if (!this.isConnected || !this.channel) {
            throw new Error("RabbitMQ is not connected");
        }

        try {
            const queue = process.env.RABBITMQ_QUEUE || "analytics_events";
            const autoAck = process.env.CONSUMER_AUTO_ACK === "true";

            console.log(`🎯 Starting to consume messages from queue: ${queue}`);
            console.log(`📋 Auto-acknowledge: ${autoAck}`);

            await this.channel.consume(
                queue,
                async (message) => {
                    if (message) {
                        await this.processMessage(
                            message,
                            messageHandler,
                            autoAck
                        );
                    }
                },
                { noAck: autoAck }
            );

            this.isConsuming = true;
            console.log("✅ Consumer started successfully");
        } catch (error) {
            console.error("❌ Failed to start consuming:", error);
            throw error;
        }
    }

    async processMessage(message, messageHandler, autoAck) {
        const startTime = Date.now();
        let messageData = null;

        try {
            // Parse message content
            const messageContent = message.content.toString();
            messageData = JSON.parse(messageContent);

            // Add message metadata
            const enrichedMessage = {
                ...messageData,
                messageId: message.properties.messageId,
                receivedAt: new Date(),
                deliveryTag: message.fields.deliveryTag,
            };

            console.log(
                `📨 Processing message: ${enrichedMessage.type} for website ${enrichedMessage.websiteId}`
            );

            // Call the message handler
            await messageHandler(enrichedMessage);

            // Acknowledge message if not auto-ack
            if (!autoAck) {
                this.channel.ack(message);
            }

            const processingTime = Date.now() - startTime;
            console.log(
                `✅ Message processed successfully in ${processingTime}ms`
            );
        } catch (error) {
            const processingTime = Date.now() - startTime;
            console.error(
                `❌ Error processing message after ${processingTime}ms:`,
                error
            );

            // Handle message processing failure
            await this.handleMessageError(message, error, messageData, autoAck);
        }
    }

    async handleMessageError(message, error, messageData, autoAck) {
        try {
            if (!autoAck) {
                // Check if we should retry or reject the message
                const retryCount =
                    message.properties.headers?.["x-retry-count"] || 0;
                const maxRetries = parseInt(process.env.RETRY_ATTEMPTS) || 3;

                if (retryCount < maxRetries) {
                    // Reject and requeue for retry
                    console.log(
                        `🔄 Requeuing message for retry (${
                            retryCount + 1
                        }/${maxRetries})`
                    );

                    // Add retry count to headers
                    const headers = {
                        ...message.properties.headers,
                        "x-retry-count": retryCount + 1,
                    };

                    // Republish with updated headers
                    const exchange =
                        process.env.RABBITMQ_EXCHANGE || "analytics_exchange";
                    const routingKey =
                        process.env.RABBITMQ_ROUTING_KEY || "analytics.events";

                    await this.channel.publish(
                        exchange,
                        routingKey,
                        message.content,
                        {
                            ...message.properties,
                            headers,
                        }
                    );

                    // Acknowledge original message
                    this.channel.ack(message);
                } else {
                    // Max retries reached - send to dead letter queue or reject
                    console.error(
                        `💀 Max retries reached for message. Rejecting without requeue.`
                    );
                    this.channel.nack(message, false, false);

                    // Optionally log to dead letter queue or error tracking system
                    await this.logFailedMessage(messageData, error);
                }
            }
        } catch (handleError) {
            console.error("❌ Error handling message failure:", handleError);
            // As last resort, nack without requeue to prevent infinite loops
            if (!autoAck) {
                this.channel.nack(message, false, false);
            }
        }
    }

    async logFailedMessage(messageData, error) {
        // Log failed message for debugging/monitoring
        console.error("💀 Failed message details:", {
            messageData,
            error: error.message,
            timestamp: new Date().toISOString(),
        });

        // TODO: Implement proper dead letter queue or error tracking
        // This could be sending to a monitoring service, logging to file, etc.
    }

    async close() {
        this.isConsuming = false;
        if (this.connection) {
            await this.connection.close();
            this.isConnected = false;
            console.log("🔌 RabbitMQ consumer connection closed");
        }
    }

    isHealthy() {
        return this.isConnected && this.isConsuming;
    }

    getStatus() {
        return {
            connected: this.isConnected,
            consuming: this.isConsuming,
            retryAttempts: this.retryAttempts,
        };
    }
}

module.exports = new RabbitMQConsumer();
