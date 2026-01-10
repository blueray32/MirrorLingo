FROM node:20-slim

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend code
COPY . .

# Expose the local server port
EXPOSE 3002

# Run the local mock server
CMD ["node", "local-server.js"]
