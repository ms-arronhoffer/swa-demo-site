import os
from azure.cosmos import CosmosClient, PartitionKey, exceptions

_client: CosmosClient | None = None
_container = None


def get_container():
    global _client, _container
    if _container is not None:
        return _container

    conn_str = os.environ["COSMOS_CONNECTION_STRING"]
    db_name = os.environ.get("COSMOS_DATABASE", "demosite")
    container_name = os.environ.get("COSMOS_CONTAINER", "demos")

    _client = CosmosClient.from_connection_string(conn_str)
    database = _client.create_database_if_not_exists(db_name)
    _container = database.create_container_if_not_exists(
        id=container_name,
        partition_key=PartitionKey(path="/category"),
        offer_throughput=400,
    )
    return _container


def query_items(query: str, parameters: list | None = None) -> list[dict]:
    container = get_container()
    items = container.query_items(
        query=query,
        parameters=parameters or [],
        enable_cross_partition_query=True,
    )
    return list(items)


def get_item(item_id: str, partition_key: str) -> dict | None:
    try:
        container = get_container()
        return container.read_item(item=item_id, partition_key=partition_key)
    except exceptions.CosmosResourceNotFoundError:
        return None


def upsert_item(doc: dict) -> dict:
    container = get_container()
    return container.upsert_item(doc)


def delete_item(item_id: str, partition_key: str) -> None:
    container = get_container()
    container.delete_item(item=item_id, partition_key=partition_key)


def patch_item(item_id: str, partition_key: str, operations: list) -> dict:
    container = get_container()
    return container.patch_item(
        item=item_id,
        partition_key=partition_key,
        patch_operations=operations,
    )
