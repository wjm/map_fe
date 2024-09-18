
## Getting Started

First, clone project and edit .env for env variables
```ini
AUTH_SECRET = # Added by `npx auth`. Read more: https://cli.authjs.dev
API_URL = #backend api url
MAPGL = #MapGL Token
WS_URL = #backend websocket endpoint
```

```bash
#install dependecies
npm i 
#run the project
npm run
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## build docker

```bash
docker build -t NAME .
```

## structure

 - /  Root/Dashboard
     - /map/{uuid} map
     - /login Login Page
     - /register Register Page



