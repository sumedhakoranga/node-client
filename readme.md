# Node Client

This Node.js client connects to Beta Crew server, retrieves stock trading packets, processes them, and saves the result to a `stockData.json` file. It handles missing packets and requests them from the server as needed.

## Features

- Connects to a TCP server using the `net` module.
- Requests all stock trading packets from the server.
- Detects and requests missing packets based on sequence numbers.
- Parses stock trading packets that include:
  - Stock Symbol: 4 bytes (ASCII)
  - Buy/Sell Indicator: 1 byte (ASCII)
  - Quantity: 4 bytes (Int)
  - Price: 4 bytes (Int)
  - Packet Sequence Number: 4 bytes (Int)
  - The total packet size is 17 bytes.
- Writes the processed stock packets into a `stockData.json` file once the connection ends.


## Installation

1. Clone the repository.

    ```bash
    git clone git@github.com:sumedhakoranga/node-client.git
    ```

2. Run the following command to install any dependencies:

    ```bash
    npm install
    ```

3. Run The server
    ```bash
      node main.js
      node nodeClient.js
    ```

4. Check the ```stockData.json``` File