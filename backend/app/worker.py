"""Background worker — entry point for async jobs (email ingest, RSS polling, digest generation)."""
import asyncio
import logging
from redis import Redis
from rq import Worker, Queue
from app.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def main():
    conn = Redis.from_url(settings.redis_url)
    queues = [Queue("default", connection=conn), Queue("ingest", connection=conn)]
    worker = Worker(queues, connection=conn)
    logger.info("Worker started, listening on queues: %s", [q.name for q in queues])
    worker.work()


if __name__ == "__main__":
    main()
