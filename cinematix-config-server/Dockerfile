FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy rest of the application
COPY . .

# Create data directory for persistence
RUN mkdir -p /app/data

# Expose port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]