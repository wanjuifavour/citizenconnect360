FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci
RUN npm install -g ts-node typescript
RUN npx tsc

# Copy app source code
COPY . .

# Create uploads directory structure
RUN mkdir -p uploads/bills uploads/incidents

EXPOSE 8000

# Start the application
CMD ["npm", "start"]