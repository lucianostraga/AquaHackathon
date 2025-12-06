# Use a lightweight Node.js base image
FROM node:alpine
# Set the working directory inside the container
WORKDIR /app
# Install json-server globally
RUN npm install -g json-server
# Copy your JSON data file into the container
# Replace 'db.json' with the actual name of your JSON file
COPY db.json /data/db.json
# Expose the port json-server will run on (default is 3000)
EXPOSE 3000
# Command to run json-server when the container starts
CMD ["json-server", "--watch", "/data/db.json", "--host", "0.0.0.0", "--port", "3000"]