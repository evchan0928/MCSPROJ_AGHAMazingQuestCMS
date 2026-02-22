# Starting the AGHAMazingQuestCMS Server with Network Access

## Quick Start

To start the Django development server accessible from your local network:

```bash
./start_network_server.sh
```

## What This Does

1. Loads your environment variables from the `.env` file
2. Activates your Python virtual environment
3. Starts the Django development server bound to all network interfaces (0.0.0.0:8000)
4. Shows you the local IP address to access the server from other devices

## Accessing the API

Once the server is running, you can access:

- **API Documentation (Swagger UI)**: `http://<your-ip-address>:8000/api/`
- **Django Admin**: `http://<your-ip-address>:8000/admin/`
- **API Endpoints**: `http://<your-ip-address>:8000/api/<endpoint>/`

The script will display your local IP address when it starts. Look for a message like:
```
Server will be accessible from other devices on your local network at: http://<your-ip-address>:8000
```

## Stopping the Server

Press `Ctrl+C` in the terminal where the server is running to stop it.

## Connecting from Other Devices

On other devices on your local network:

1. Open a web browser
2. Navigate to `http://<your-machine-ip>:8000/api/` to access the API documentation
3. Or use the API endpoints directly from applications

## Troubleshooting

- If you cannot access the server from other devices, check your firewall settings
- Make sure your devices are on the same network
- If the IP address shown doesn't work, try using `hostname -I` command in a terminal to find your machine's IP address
- If the server won't start, ensure your port 8000 is not in use by another application

## Security Note

This configuration is intended for development and testing purposes. Do not use the development server in production environments.