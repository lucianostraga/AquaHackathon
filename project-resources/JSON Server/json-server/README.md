# Hackathon JSON Server

A Dockerized JSON server for serving REST API endpoints from a JSON database file.

## Prerequisites

- [Docker](https://www.docker.com/get-started) installed on your system

## Building the Docker Image

To build the Docker image, run the following command in the project directory:

```bash
docker build -t hackathon-json-server .
```

## Running the Container

Once the image is built, you can run it with:

```bash
docker run -d -p 3000:3000 --name json-server hackathon-json-server
```

This command:
- Runs the container in detached mode (`-d`)
- Maps port 3000 from the container to port 3000 on your host machine (`-p 3000:3000`)
- Names the container `json-server` (`--name json-server`)

## Accessing the API

After the container is running, the JSON server will be available at:

- **API Base URL**: `http://localhost:3000`

You can access your data endpoints based on the keys in your `db.json` file. For example:
- `http://localhost:3000/Calls` - Access the Calls collection
- `http://localhost:3000/Calls/{id}` - Access a specific call by ID
```

## Notes

- The json-server runs in watch mode, so changes to the database file will be reflected (though changes inside the container won't persist unless you use volume mounts)
- The server is accessible from any network interface (`0.0.0.0`) inside the container
- Default port is 3000, but you can change the host port mapping if needed (e.g., `-p 8080:3000` to access via port 8080)

