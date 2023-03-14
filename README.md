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
npx prisma db push
```

### Teszt adatok feltöltése
 
 - mellékelt fájlok letöltése (database és uploads mappák) 
 - Bittersweet.sql elhelyezése a /backend mappába
 - uploads mappa elhelyezése a /backend mappába

```shell
Get-Content Bittersweet.sql | docker exec -i mysql-database mysql -u root -p<database-password> Bittersweet
```

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