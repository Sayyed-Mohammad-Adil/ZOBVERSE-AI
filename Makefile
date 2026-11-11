.PHONY: up down build migrate makemigrations shell

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build

migrate:
	docker compose run --rm backend alembic upgrade head

makemigrations:
	docker compose run --rm backend alembic revision --autogenerate -m "$(m)"

shell:
	docker compose run --rm backend python -m app.main
