# Deployment Guide

## Quick Deploy to Vercel

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit - Dayflow HRMS"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Deploy on Vercel**
- Go to [vercel.com](https://vercel.com)
- Click "Import Project"
- Select your GitHub repository
- Add environment variables:
  - `MONGODB_URI` - Your MongoDB connection string
  - `SESSION_SECRET` - Random secure string

3. **Setup MongoDB Atlas**
- Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Create free cluster
- Create database user
- Get connection string
- Replace `<password>` with your password
- Update in Vercel environment variables

4. **Seed Production Database**
```bash
# Set production MongoDB URI locally
export MONGODB_URI="mongodb+srv://..."
npm run seed
```

## Docker Deployment

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/dayflow
      - SESSION_SECRET=your-secret-key
    depends_on:
      - mongo
  
  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Run:
```bash
docker-compose up -d
```

## Environment Variables Reference

### Required
- `MONGODB_URI` - MongoDB connection string
- `SESSION_SECRET` - Secret key for sessions (min 32 chars)

### Optional
- `NODE_ENV` - `development` or `production`
- `PORT` - Default: 3000

## Post-Deployment

1. **Seed the database**
```bash
npm run seed
```

2. **Setup cron job for auto-checkout**

Add to Vercel cron (`vercel.json`):
```json
{
  "crons": [
    {
      "path": "/api/attendance/auto-checkout",
      "schedule": "0 18 * * *"
    }
  ]
}
```

3. **Test with demo credentials**
- Admin: admin@dayflow.com / admin123
- Employee: john@dayflow.com / password123

## Security Checklist

- [ ] Change SESSION_SECRET to random string
- [ ] Use MongoDB Atlas with IP whitelist
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Review CORS settings if needed
- [ ] Monitor audit logs regularly
