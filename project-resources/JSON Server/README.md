# 🧩 Hackathon Mock API Setup Guide

Welcome to the Hackathon!  
This guide will help you set up the mock API environments required for your local development.  
You’ll be provided with a **Postman collection (Hackaton Collection.postman_collection)** that includes all available endpoints and detailed explanations.

---

## 📦 Overview

There are two separate mock API environments:

1. **.NET Mock API** — packaged as a Docker image.  
2. **JSON Server Mock API** — a Node.js project using the `json-server` library.

Both provide endpoints that simulate real API responses for your hackathon project.

---

## 🧰 Prerequisites

Make sure you have the following installed on your local machine:

- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Visual Studio Code (recommended)](https://code.visualstudio.com/)
- [Node.js and npm](https://nodejs.org/)
- [Postman](https://www.postman.com/)

---

## 🚀 Setup Instructions

### 1. Run the .NET Mock API using Docker

1. Start the Docker Desktop application.
2. Open your terminal or command prompt.
3. Pull and run the Docker image using the following command:

   ```bash
   docker run -d -p 8080:8080 kevinricar24/api-core-ai:latest
   ```

4. Once the command is executed, open **Docker Desktop** and confirm that the image  
   `kevinricar24/api-core-ai` appears in your container list.
5. Click **Start** to run the container.  
   Your .NET mock endpoints will now be available locally.

---

### 2. Run the JSON Server Mock API

1. Locate the folder named **`jsonServer`** in the shared resources package.  
   This folder contains all dependencies and configurations.
2. Open the folder in your preferred IDE (we recommend **Visual Studio Code**).
3. In the project’s root directory, open a terminal and execute:
   
   ```bash
   npm install -g json-server
   ```

4. In the project’s root directory, use the terminal and execute:

   ```bash
   json-server --watch db.json
   ```

4. This command will start a local mock server and expose additional endpoints for testing and development.

---

### 3. Use the Postman Collection

1. Import the provided **Postman collection (Hackaton Collection.postman_collection)** into your Postman workspace.  
2. Each request includes:
   - The endpoint URL  
   - HTTP method (GET, POST, PUT, DELETE, etc.)  
   - Sample payloads and responses  
   - A short description of the operation

---

## ✅ Summary

After completing the steps above, you’ll have:
- The **.NET mock API** running via Docker on port **8080**
- The **JSON Server mock API** running locally via `json-server`
- A **Postman collection** to test and explore the endpoints

You’re now ready to start building and integrating with the mock services for the hackathon!

---

### 💡 Tips
- If a port conflict occurs, you can change the Docker port mapping, for example:
  ```bash
  docker run -d -p 8081:8080 kevinricar24/api-core-ai:latest
  ```
- To stop the container:
  ```bash
  docker ps
  docker stop <container_id>
  ```

---

Happy hacking! 💻🎯
