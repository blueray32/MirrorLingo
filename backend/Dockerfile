FROM node:20-slim

WORKDIR /app

# Install system dependencies if needed (e.g., for certain npm packages)
# RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm install --only=production

# Copy the rest of the backend code
COPY . .

# Ensure the server listens on the PORT environment variable
ENV PORT=3002
EXPOSE 3002

# Run the server
CMD ["node", "local-server.js"]
