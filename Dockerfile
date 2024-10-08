# Use Node.js official base image
FROM node:18

# Set the working directory in the container
WORKDIR /backend

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Command to start the application
CMD ["npm", "start"]
