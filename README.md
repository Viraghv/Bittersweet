# Telepítési útmutató

## Előfeltételek

- Docker telepítve
- Legfrissebb Node telepítve

## Backend

### Telepítés

 - .env kitöltése .env.example alapján
 - Parancsok futtatása terminálban:

```shell
cd backend
```

```shell
npm install
```
 
```shell
docker compose build
```

```shell
docker compose up mysql-database
```

```shell
npx prisma generate
```

### Teszt adatok feltöltése
 
 - mellékelt fájlok letöltése (database és uploads mappák) 
 - Bittersweet.sql elhelyezése a /backend mappába
 - uploads mappa elhelyezése a /backend mappába

```shell
docker compose run --rm mysql-database mysql -uroot -p Bittersweet < /backend/Bittersweet.sql
```
 - adatbázis jelszó megadása (amit a .env fájlban is megadtunk)

### Futtatás

```shell
docker compose up mysql-database
```

```shell
npm run start:prod
```

## Frontend

### Telepítés

- .env kitöltése .env.example alapján
- Parancsok futtatása terminálban:

```shell
cd frontend
```

```shell
npm install
```

### Futtatás

 - futtatás lokálisan:

```shell
npm run start
```

- futtatás lokális hálózaton:

```shell
npm run host
```

- build-elés:

```shell
npm run build
```