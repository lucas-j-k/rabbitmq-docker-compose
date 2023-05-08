# Docker-compose + RabbitMQ + Node

2 Node services connected through a rabbit queue. Setup in docker-compose with MySQL DB.

## To start
### With Tilt
- `tilt up`  :  runs Tilt interface on top of Docker-compose to make it easier to see container logs and statuses


# Migrating DB
- Uses Golang Goose to migrate. Migration tasks defined in Taskfile.

