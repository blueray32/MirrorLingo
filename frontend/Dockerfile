FROM node:20-slim

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Expose the Next.js development port
EXPOSE 3001

# Start the Next.js development server
CMD ["npm", "run", "dev", "--", "-p", "3001"]
