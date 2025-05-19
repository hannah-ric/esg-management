# Stage 1: Build the application
FROM node:lts-alpine AS builder
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
# Install all dependencies (including devDependencies for the build)
RUN npm install
COPY . .
# Run the build script (tsc ; vite build)
RUN npm run build

# Stage 2: Serve the application
FROM node:lts-alpine
WORKDIR /usr/src/app
ENV NODE_ENV=production
# Copy package.json and package-lock.json to install production dependencies including 'serve'
COPY --from=builder /usr/src/app/package.json /usr/src/app/package.json
COPY --from=builder /usr/src/app/package-lock.json* /usr/src/app/package-lock.json*

# Install production dependencies and 'serve'
RUN npm install --production serve

# Copy built assets from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 8080
# Create a non-root user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
# Ensure the app directory and its contents are owned by the new user
RUN chown -R appuser:appgroup /usr/src/app
USER appuser

CMD ["npm", "start"]
