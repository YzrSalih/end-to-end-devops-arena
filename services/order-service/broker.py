import json
import os
import time
import logging
import pika

logger = logging.getLogger(__name__)


def get_connection():
    url = os.environ["RABBITMQ_URL"]
    params = pika.URLParameters(url)
    params.heartbeat = 60
    params.blocked_connection_timeout = 30

    for attempt in range(10):
        try:
            return pika.BlockingConnection(params)
        except Exception as e:
            logger.warning("rabbitmq not ready, retrying... attempt=%d error=%s", attempt + 1, e)
            time.sleep(3)

    raise RuntimeError("could not connect to RabbitMQ after 10 attempts")


def publish(queue: str, message: dict) -> None:
    connection = get_connection()
    channel = connection.channel()
    channel.queue_declare(queue=queue, durable=True)
    channel.basic_publish(
        exchange="",
        routing_key=queue,
        body=json.dumps(message),
        properties=pika.BasicProperties(
            delivery_mode=pika.DeliveryMode.Persistent,
            content_type="application/json",
        ),
    )
    connection.close()
    logger.info("published message to queue=%s order_id=%s", queue, message.get("order_id"))
