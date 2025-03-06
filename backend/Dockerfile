FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy app source code
COPY . .

# Create uploads directory structure
RUN mkdir -p uploads/bills uploads/incidents

EXPOSE 8000

# Start the application
CMD ["npm", "start"]