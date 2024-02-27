<p align="center">
  <a href="https://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# API Mini-games

A simple API service for mini games.

## Table of contents

- [Create a Database](#create-a-database)
- [Environment variables](#environment-variables)
- [Local server](#local-server)
- [Deploy to Render](#deploy-to-render)
- [Endpoints](#endpoints)
- [Github OAuth2](#github-oauth2)
- [Testing](#testing)

## Create a Database[⬆](#table-of-contents)

1. Create an account in [MongoDB Atlas](https://www.mongodb.com/atlas/database/)

2. Go to the `"Database Deployments"` section in the left menu and Choose Create a Shared Cluster:
![image](https://github.com/Boffin-ux/mini-games-api/assets/65894984/49762ec0-c0a6-4f66-ad64-1495eace1d44)

3. Choose a free trial plan and click `"Create cluster"`:
![image](https://github.com/Boffin-ux/mini-games-api/assets/65894984/887461a3-54cc-4b93-8700-bd59d66329a6)

4. Wait for the cluster to be created and go to the `"Database Access"` section in the menu on the left.

5. Click `"Add New Database User"`.

6. Enter the username and password for the new user and click `"Add User"`:
![image](https://github.com/Boffin-ux/mini-games-api/assets/65894984/f5c197d0-4e72-4fe2-81d7-5ca6419e6644)

7. Go to the `"Network Access"` section in the menu on the left and Click `"Add IP Address"`.

8. In the menu that appears, allow access from anywhere (for educational purposes), or configure it according to your needs:
![image](https://github.com/Boffin-ux/mini-games-api/assets/65894984/aebee0b7-60db-448c-8c1b-91da20977469)

9. Return to the Database section and click `"Connect"` in your cluster menu:
![image](https://github.com/Boffin-ux/mini-games-api/assets/65894984/1df15e42-a76b-4460-af01-62a00f93671c)

10. In the menu that appears, select `"Connect your application"` and copy your connection string:
![image](https://github.com/Boffin-ux/mini-games-api/assets/65894984/acca10f2-4d66-4d2b-b228-794ff979ddc0)

11. Your line should look something like this:

    ```text
    mongodb+srv://<your-username>:<password>@cluster0.<your-tag>.mongodb.net/<dbname>?retryWrites=true&w=majority
    ```

12. Replace `<password>` with the password of the user you created and `<dbname>` with the name you want.

## Environment variables[⬆](#table-of-contents)

Before running the application, set the environment variables in the .env or server settings (see `.env.example`):

1. Required variables:

```bash
# Database connection URL.
DATABASE_URL='YOUR_DATABASE_URL'

# JWT access token secret key.
JWT_SECRET_KEY='YOUR_SECRET_KEY'

# JWT refresh token secret key.
JWT_REFRESH_SECRET_KEY='YOUR_REFRESH_SECRET_KEY'

# Get data from Github Developer settings
GITHUB_CLIENT_ID='YOUR_CLIENT_ID'
GITHUB_CLIENT_SECRET='YOUR_CLIENT_SECRET'
GITHUB_CALLBACK_URL='YOUR_DOMAIN/api/auth/github/redirect'
```

**Important!** To create a user account with the Administrator role, you need to add the credentials of at least one of your OAuth2 providers: 

- [Github Developer settings](https://github.com/settings/applications/new) ([Follow these steps](#github-oauth2-provider⬆))
    - `GITHUB_CLIENT_ID` - Client ID from Github Developer settings.
    - `GITHUB_CLIENT_SECRET` - Client secret from Github Developer settings.
    - `GITHUB_CALLBACK_URL` - Redirect URI 'YOUR_DOMAIN/api/auth/github/redirect'.

- [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
    - `GOOGLE_CLIENT_ID` - Client ID from Google Cloud Console.
    - `GOOGLE_SECRET` - Client secret from Google Cloud Console.
    - `GOOGLE_CALLBACK_URL` - Redirect URI 'YOUR_DOMAIN/api/auth/google/redirect'.

- [Yandex ID](https://oauth.yandex.ru/client/new/id/)
    - `YANDEX_CLIENT_ID` - Client ID from Yandex ID.
    - `YANDEX_CLIENT_SECRET` - Client secret from Yandex ID.
    - `YANDEX_CALLBACK_URL` - Redirect URI 'YOUR_DOMAIN/api/auth/yandex/redirect'.

***

2. Optional Variables:

```bash
# JWT access token expiration time. Default is '1h'
EXP_TOKEN='1h'

# JWT refresh token expiration time. Default is '48h'
EXP_REFRESH_TOKEN='48h'

# Preferred port for the server. Default is 5100.
PORT=5100

# Cache Time to live (TTL) for get requests. Default is 5000 milliseconds.
CACHE_TTL=30000

# Directory for uploading images. Defaults to 'uploads'.
UPLOAD_LOCATION='uploads'
```

## Local server[⬆](#table-of-contents)

### Prerequisites

- Git - [Download & Install Git](https://git-scm.com/downloads).
- Node.js - [Download & Install Node.js](https://nodejs.org/en/download/) and the npm package manager.

### Downloading

```bash
git clone https://github.com/Boffin-ux/mini-games-api.git
```

### Install app

```bash
npm install && npm run init:prisma
```

### Launch app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Deploy to Render[⬆](#table-of-contents)

1. Create an account in [render.com](https://render.com/).

2. Create a new Web Service (Build and deploy from a Git repository):
![image](https://github.com/Boffin-ux/mini-games-api/assets/65894984/bbebe33f-e385-4979-908b-717065c54e06)

3. Connect your repository to Render:
![image](https://github.com/Boffin-ux/mini-games-api/assets/65894984/b53b8864-1245-4667-9f0b-9bfbe0db05e8)
![image](https://github.com/Boffin-ux/mini-games-api/assets/65894984/9058f37f-2fb8-44f2-8637-3a8fdcf24d47)

4. Enter a name for the web service:
![image](https://github.com/Boffin-ux/mini-games-api/assets/65894984/d6d298b0-a6c2-4927-962a-932abbd8d59a)

5. Specify build and start commands:
![image](https://github.com/Boffin-ux/mini-games-api/assets/65894984/ad859461-9e48-408d-8268-2d204ef494f4)

    - Build Command:

      ```bash
      npm install && npm run build && npm run init:prisma
      ```

    - Start Command:

      ```bash
      npm run start:prod
      ```

6. Specify environment variables ([Environment Variables](#environment-variables⬆)) and click `"Create Web Service"`:
![image](https://github.com/Boffin-ux/mini-games-api/assets/65894984/69b22b62-63de-4fd0-b259-5d13add0987a)

#### Server activity

- Render spins down a Free web service that goes 15 minutes without receiving inbound traffic and goes into sleep mode, and the wake-up time becomes very long [docs.render.com](https://docs.render.com/free#spinning-down-on-idle).

- You can create a cron job on [cron-job.org](https://cron-job.org/) that will check your server from time to time and keep it awake:
![image](https://github.com/Boffin-ux/mini-games-api/assets/65894984/5b100a95-fbca-4489-8633-ecdb118e0ab8)


## Endpoints[⬆](#table-of-contents)
**BASE_URL**: `{your-domain}/api`

After starting the app you can open in your browser OpenAPI documentation by typing `${BASE_URL}/docs/`. More information about [OpenAPI/Swagger](https://swagger.io/).

The following resources are available:

- docs: used for API documentation..
- auth: used for user authentication and authorization.
- users: used for CRUD operations on the user.
- files: used to get/post/delete user avatar.
- products: used for CRUD operations on the product.
- stats: used to get/post/delete user statistics.

Important! If you have added your OAuth2 providers credentials to your [Environment variables](#environment-variables), the following routes are available to you:

  - `${BASE_URL}/auth/github/redirect`
  - `${BASE_URL}/auth/google/redirect`
  - `${BASE_URL}/auth/yandex/redirect`

Important! The following routes are only available for accounts with the `administrator role`:

  - `GET` `${BASE_URL}/users`
  - `PATCH` `${BASE_URL}/users/{userId}`
  - `POST` `${BASE_URL}/products`
  - `PUT` `${BASE_URL}/products/{productId}`
  - `DELETE` `${BASE_URL}/products/{productId}`
  - `GET` `${BASE_URL}/stats`

## Github OAuth2[⬆](#table-of-contents)
1. Go to the [Github Developer settings](https://github.com/settings/applications/new).

2. If you have a Github account, log in; otherwise, create an account.

3. If you are using a local server, enter the following information:
![image](https://github.com/Boffin-ux/mini-games-api/assets/65894984/e1fe47f6-46c2-4b9b-88cd-279c532b1f37) 

4. If you are using a Render web-server, enter the following information:
![image](https://github.com/Boffin-ux/mini-games-api/assets/65894984/eefbccdc-daac-49fd-995b-aad1fff19545)

5. Click `"Register application"`.

6. Click `"Generate a new client secret"`.
![image](https://github.com/Boffin-ux/mini-games-api/assets/65894984/9a4ed3a7-1f44-4440-8942-ecfcfb62b4d1)

7. Copy your `Client secret` and `Client ID`.

8. Click `"Update application"`.  
![image](https://github.com/Boffin-ux/mini-games-api/assets/65894984/f5e9b674-4e33-42f9-9031-3a3191849cda)

## Testing[⬆](#testing)

### Unit tests
 - Run all tests:

  ```bash
  npm run test
  ```

 - Run all tests with coverage report:

  ```bash
  npm run test:cov
  ```

 - Run only one of all test suites:

  ```bash
  npm run test -- <path to suite>
  ```

### End-to-End tests
**Attention!** After running End-to-End tests, the database will be cleared

 - Run all tests:

  ```bash
  npm run test:e2e
  ```

 - Run all tests with coverage report:
   
  ```
  npm run test:e2e:cov
  ```
