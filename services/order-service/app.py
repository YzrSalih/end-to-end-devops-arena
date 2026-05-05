import logging
import os
import uuid
from datetime import datetime, timezone

from flask import Flask, jsonify, request

import broker
import tracing

logging.basicConfig(
    level=logging.INFO,
    format='{"time":"%(asctime)s","level":"%(levelname)s","message":"%(message)s"}',
)
logger = logging.getLogger(__name__)

QUEUE_NAME = os.environ.get("QUEUE_NAME", "order_events")


def create_app():
    app = Flask(__name__)
    tracing.init_tracing(app)

    @app.get("/health")
    def health():
        return jsonify({"status": "ok"})

    @app.post("/orders")
    def create_order():
        data = request.get_json(silent=True)
        if not data:
            return jsonify({"error": "request body required"}), 400

        product_id = data.get("product_id")
        quantity = data.get("quantity")
        customer_email = data.get("customer_email")

        if not product_id or not quantity or not customer_email:
            return jsonify({"error": "product_id, quantity and customer_email are required"}), 400

        if not isinstance(quantity, int) or quantity < 1:
            return jsonify({"error": "quantity must be a positive integer"}), 400

        order_id = str(uuid.uuid4())
        message = {
            "order_id": order_id,
            "product_id": str(product_id),
            "quantity": quantity,
            "customer_email": customer_email,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

        try:
            broker.publish(QUEUE_NAME, message)
        except Exception as e:
            logger.error("failed to publish order message error=%s", e)
            return jsonify({"error": "could not queue order"}), 503

        return jsonify({"order_id": order_id, "status": "queued"}), 202

    return app


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    create_app().run(host="0.0.0.0", port=port)
