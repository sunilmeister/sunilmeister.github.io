import requests
import hashlib
import serial
import time  # Import the time module for delays
from src.utils.utils import find_port  # Import the find_port function


def deprecate_previous_uid(old_system_uid):
    """
    Deprecate previous UID records by setting verification_status to False.

    Args:
        old_system_uid (str): The old UID to deprecate

    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Define the backend API endpoint
        api_url = "http://3.111.22.212:5000/api/deprecate-uid"

        # Generate the hashed secret key
        secret_key = (
            "801587F3C649A37E22782EEA77B2F3D9"  # Replace with the actual secret key
        )
        hashed_secret = hashlib.sha256(secret_key.encode()).hexdigest()

        # Payload to send to the backend
        payload = {
            "old_system_uid": old_system_uid,
            "secret": hashed_secret,
        }

        # Send a POST request to the backend
        response = requests.post(api_url, json=payload)

        # Check if the request was successful
        if response.status_code == 200:
            result = response.json()
            print(f"Successfully deprecated UID: {old_system_uid}")
            print(f"Deprecated {result.get('deprecated_records', 0)} record(s)")
            return True
        else:
            print(f"Failed to deprecate UID. Status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False

    except requests.RequestException as e:
        print(f"Error while deprecating UID: {e}")
        return False
    except Exception as e:
        print(f"An unexpected error occurred while deprecating UID: {e}")
        return False


def get_device_info():
    """
    Retrieve the system UID and firmware version from the connected Arduino Mega board.
    Returns:
        tuple: (system_uid, firmware_version) if successful, otherwise (None, None).
    """
    # Find the connected Arduino Mega board
    port = find_port()
    if not port:
        print("No Arduino Mega board found.")
        return None, None

    try:
        # Open a serial connection with the correct baud rate
        with serial.Serial(port, 115200, timeout=2) as ser:
            # Allow the system to initialize
            print("Waiting for the system to initialize...")
            time.sleep(10)  # Wait for 10 seconds

            # Step 1: Send "H" to handshake
            ser.write(b"H")
            time.sleep(0.5)  # Small delay to allow the system to respond

            # Read and process the response
            while True:
                response = (
                    ser.read(ser.in_waiting or 1)
                    .decode("utf-8", errors="ignore")
                    .strip()
                )
                print(f"Received: {response}")  # Debugging output
                if "H" in response:
                    print("Handshake successful.")
                    break  # Exit the loop when "H" is received
                time.sleep(0.5)  # Wait before reading again

            # Step 2: Send "U" to get the system UID
            ser.write(b"U")
            time.sleep(0.5)  # Small delay to allow the system to respond
            system_uid = (
                ser.read(ser.in_waiting or 1).decode("utf-8", errors="ignore").strip()
            )
            if not system_uid:
                print("Failed to retrieve system UID.")
                return None, None

            # Step 3: Send "V" to get the firmware version
            ser.write(b"V")
            time.sleep(0.5)  # Small delay to allow the system to respond
            firmware_version = (
                ser.read(ser.in_waiting or 1).decode("utf-8", errors="ignore").strip()
            )
            if not firmware_version:
                print("Failed to retrieve firmware version.")
                return None, None

            return system_uid, firmware_version

    except serial.SerialException as e:
        print(f"Error communicating with the Arduino: {e}")
        return None, None
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None, None


def register_firmware_completion():
    """
    Retrieve the system UID and firmware version, and notify the backend that the firmware installation is complete.
    Returns:
        tuple: (system_uid, firmware_version) if successful, otherwise (None, None).
    """
    # Find the connected Arduino Mega board
    port = find_port()
    if not port:
        print("No Arduino Mega board found.")
        return None, None

    try:
        # Open a serial connection with the correct baud rate
        with serial.Serial(port, 115200, timeout=2) as ser:
            # Allow the system to initialize
            print("Waiting for the system to initialize...")
            time.sleep(10)  # Wait for 10 seconds

            # Step 1: Send "H" to handshake
            ser.write(b"H")
            time.sleep(0.5)  # Small delay to allow the system to respond

            # Read and process the response
            while True:
                response = (
                    ser.read(ser.in_waiting or 1)
                    .decode("utf-8", errors="ignore")
                    .strip()
                )
                print(f"Received: {response}")  # Debugging output
                if "H" in response:
                    print("Handshake successful.")
                    break  # Exit the loop when "H" is received
                time.sleep(0.5)  # Wait before reading again

            # Step 2: Send "U" to get the system UID
            ser.write(b"U")
            time.sleep(0.5)  # Small delay to allow the system to respond
            system_uid = (
                ser.read(ser.in_waiting or 1).decode("utf-8", errors="ignore").strip()
            )
            if not system_uid:
                print("Failed to retrieve system UID.")
                return None, None

            # Step 3: Send "V" to get the firmware version
            ser.write(b"V")
            time.sleep(0.5)  # Small delay to allow the system to respond
            firmware_version = (
                ser.read(ser.in_waiting or 1).decode("utf-8", errors="ignore").strip()
            )
            if not firmware_version:
                print("Failed to retrieve firmware version.")
                return None, None

            # Define the backend API endpoint
            api_url = "http://3.111.22.212:5000/api/firmware-installation"  # Update with the actual backend URL if different

            # Generate the hashed secret key
            secret_key = (
                "801587F3C649A37E22782EEA77B2F3D9"  # Replace with the actual secret key
            )
            hashed_secret = hashlib.sha256(secret_key.encode()).hexdigest()

            # Payload to send to the backend
            payload = {
                "system_uid": system_uid,
                "firmware_version": firmware_version,
                "verification_status": True,  # Set to True if the installation was verified
                "secret": hashed_secret,
            }

            try:
                # Send a POST request to the backend
                response = requests.post(api_url, json=payload)

                # Check if the request was successful
                if response.status_code == 201:
                    print("Firmware completion registered successfully.")
                else:
                    print(
                        f"Failed to register firmware completion. Status code: {response.status_code}"
                    )
                    print(f"Response: {response.text}")
            except requests.RequestException as e:
                print(f"Error while registering firmware completion: {e}")
                return None, None

            # Step 4: Send "X" to restart the system
            ser.write(b"X")
            time.sleep(
                0.5
            )  # Small delay to allow the system to process the restart command

            # Return the system UID and firmware version
            return system_uid, firmware_version

    except serial.SerialException as e:
        print(f"Error communicating with the Arduino: {e}")
        return None, None
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None, None
