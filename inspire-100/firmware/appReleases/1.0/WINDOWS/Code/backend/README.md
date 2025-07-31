# Firmware Installation Backend (Express)

This is a Node.js/Express backend application that manages firmware installation records with system UIDs and timestamps.

## Build Scripts

### Quick Build (Recommended)
```bash
# Windows
build.bat

# Linux/macOS
chmod +x build.sh
./build.sh

# Or using npm
npm run build
```

### Manual Build Steps
```bash
# Clean and setup
npm run clean
npm run setup

# Install dependencies
npm run install-deps

# Security check
npm run security-check

# Build for production
npm run build
```

## Setup

1. Create a MySQL database named `firmware_db`
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Configure the environment variables in `.env` file:
   - Set your MySQL username and password
   - Set your database host
   - Set a secure secret key for API authentication
   - Set the desired port (default is 3000)

## Running the Application

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in .env)

## Features

### API Endpoints

#### Record Firmware Installation
- **URL**: `/api/firmware-installation`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "system_uid": "unique-system-id",
    "firmware_version": "1.0.0",
    "verification_status": true,
    "secret": "your-secret-key"
  }
  ```

#### Get Firmware Installation History
- **URL**: `/api/firmware-installation/:system_uid`
- **Method**: `GET`
- **Body**:
  ```json
  {
    "secret": "your-secret-key"
  }
  ```

#### Download Firmware Installation Data as Excel
- **URL**: `/download-excel`
- **Method**: `GET`
- **Description**: Downloads all firmware installation records as an Excel file.

### GUI Features

#### View Installations
- **URL**: `/view-installations`
- **Description**: Displays all firmware installation records in a table format. You can also download the data as an Excel file using the "Download as Excel" button.

## Security

The API is secured using a secret key that must be included in the request body. The secret key is hashed using SHA-256 and compared with the stored hash to verify the request is from an authenticated source.