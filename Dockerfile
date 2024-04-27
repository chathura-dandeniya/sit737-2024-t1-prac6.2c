# Use a specific version of node as a parent image
FROM node:16

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy both package.json AND package-lock.json
COPY package*.json ./

# Install any dependencies
RUN npm install

# Bundle the app's source code inside the Docker image
COPY server.js .

COPY public /usr/src/app/public
COPY logs /usr/src/app/logs

# Make port 3000 available outside this container
EXPOSE 3000

# Define the command to run the app
CMD [ "node", "server.js" ]
