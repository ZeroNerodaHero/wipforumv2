FROM node:latest
# Set the working directory in the container
WORKDIR /app
# Copy package.json and package-lock.json to the container
COPY package*.json ./
# Install app dependencies
RUN npm install
# Copy the rest of the application source code to the container
COPY . .
# Expose the port your app runs on
EXPOSE 3001
# Define the command to run your application
CMD [ "node", "app.js" ]
