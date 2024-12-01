# Use the latest Ubuntu image as the base image
FROM ubuntu:latest

# Update and install Node.js
RUN apt-get update && apt-get install -y nodejs npm

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files from the root directory to the container
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the backend application to the container
COPY . .

# Expose the port on which the app will run
EXPOSE 3001

# Command to run the application
CMD ["npm", "run", "dev"]
