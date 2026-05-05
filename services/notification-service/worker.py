import json
import logging
import os
import time

import pika
from opentelemetry import trace

import tracing

logging.basicConfig(
    level=logging.INFO,
    format='{"time":"%(asctime)s","level":"%(levelname)s","message":"%(message)s"}',
)
logger = logging.getLogger(__name__)

RABBITMQ_URL = os.environ["RABBITMQ_URL"]
QUEUE_NAME = os.environ.get("QUEUE_NAME", "order_events")


def get_connection():
    params = pika.URLParameters(RABBITMQ_URL)
    params.heartbeat = 60

    for attempt in range(10):
        try:
            return pika.BlockingConnection(params)
        except Exception as e:
            logger.warning("rabbitmq not ready, retrying... attempt=%d error=%s", attempt + 1, e)
            time.sleep(3)

    raise RuntimeError("could not connect to RabbitMQ after 10 attempts")


def send_email(order: dict) -> None:
    """Simulates sending a notification email."""
    logger.info(
        "email sent to=%s order_id=%s product_id=%s quantity=%d",
        order.get("customer_email"),
        order.get("order_id"),
        order.get("product_id"),
        order.get("quantity", 0),
    )


def on_message(channel, method, properties, body):
    try:
        order = json.loads(body)
        send_email(order)
        channel.basic_ack(delivery_tag=method.delivery_tag)
    except json.JSONDecodeError as e:
        logger.error("invalid message format error=%s body=%s", e, body)
        channel.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
    except Exception as e:
        logger.error("failed to process message error=%s", e)
        channel.basic_nack(delivery_tag=method.delivery_tag, requeue=True)


def main():
    tracer = tracing.init_tracing()
    logger.info("notification-service starting queue=%s", QUEUE_NAME)

    connection = get_connection()
    channel = connection.channel()
    channel.queue_declare(queue=QUEUE_NAME, durable=True)
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue=QUEUE_NAME, on_message_callback=on_message)

    logger.info("waiting for messages...")
    channel.start_consuming()


if __name__ == "__main__":
    main()
