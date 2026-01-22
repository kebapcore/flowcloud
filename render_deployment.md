# Render Deployment Guide

To deploy this Flowstate Cloud application on Render, follow these steps:

## 1. Prepare Your Repository
Ensure your code is pushed to a GitHub or GitLab repository.

## 2. Create a Web Service on Render
1. Go to the [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your repository.

## 3. Configure Build and Start Commands
- **Runtime**: Node
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

## 4. Environment Variables
Add the following environment variables in the **Environment** tab:
- `DATABASE_URL`: Your PostgreSQL connection string (Render provides a managed PostgreSQL service you can use).
- `ACCESS_KEY`: Your secret access key (e.g., `444`).
- `NODE_ENV`: `production`

## 5. Persistent Storage (Important)
Since this app manages files in `client/public/src/files`, Render's native disk is ephemeral (files will be deleted on every deploy).
- To keep files permanently, you should add a **Render Disk** and mount it to `client/public/src/files`.
- Alternatively, for a production-grade setup, you should modify the storage logic to use **AWS S3** or **Google Cloud Storage** instead of the local filesystem.

## 6. Database Push
After the first deploy, you might need to run the database migrations:
- You can run `npx drizzle-kit push` locally pointing to your Render DB, or add it to your build command (e.g., `npm run build && npx drizzle-kit push`).
