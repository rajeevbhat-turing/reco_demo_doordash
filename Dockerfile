FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy dependency manifests first
COPY package.json yarn.lock ./

# Install app dependencies
RUN yarn install --frozen-lockfile

# Copy app source code
COPY . .

# Build Next.js app
RUN yarn build

# Expose port
EXPOSE 3000

# Run app using yarn which correctly resolves "next"
CMD ["yarn", "start"]
