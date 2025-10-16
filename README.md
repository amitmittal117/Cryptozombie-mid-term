# CryptoZombies DApp - Interactive Zombie Game

A decentralized application (DApp) that allows users to create and manage zombies that can feed on cryptographic kitties. This project demonstrates the integration of Ethereum smart contracts with a modern React frontend.

## Features

- **Zombie Creation**: Create zombies with custom names
- **Kitty Creation**: Create test kitties with custom genes
- **Zombie Leveling**: Level up zombies by spending ETH (0.001 ETH per level)
- **Feeding System**: Zombies can feed on kitties to create new zombies
- **MetaMask Integration**: Full Web3 wallet integration for transactions
- **Dynamic Updates**: Real-time updates of zombie and kitty states
- **Ownership Tracking**: Complete ownership system for both zombies and kitties

## Technical Stack

- **Frontend**: React.js
- **Blockchain Integration**: Web3.js
- **Smart Contracts**: Solidity
- **Development Network**: Ganache
- **Wallet Integration**: MetaMask
- **Contract Framework**: Truffle

## Smart Contract Features

### ZombieFactory
- Create random zombies with unique DNA
- Generate random zombie characteristics
- Track zombie ownership

### ZombieFeeding
- Feed zombies with kitties
- Cooldown system for feeding
- Generate new zombies from feeding

### ZombieHelper
- Level up system
- Name modification features
- Access control based on zombie level

### ZombieOwnership (ERC721)
- Full NFT implementation
- Transfer zombies between owners
- Track ownership history

### KittyCore
- Create test kitties
- Store kitty genes and characteristics
- Track kitty ownership

## Setup Instructions

1. Clone the repository

2. Install dependencies:
```bash
cd cryptozombies-frontend
npm install
```

3. Configure Ganache:
- Start Ganache
- Import the truffle-config.js
- Add the workspace to Ganache

4. Deploy contracts:
```bash
truffle compile
truffle migrate
```

5. Configure MetaMask:
- Connect to Ganache network (usually http://localhost:7545)
- Import at least one account from Ganache
- Ensure you have enough test ETH

6. Start the frontend:
```bash
npm run dev
```

## Usage Guide

1. **Connect Wallet**
   - Click "Connect Wallet" button
   - Approve MetaMask connection

2. **Create Your First Zombie**
   - Enter a name in the "Zombie name" field
   - Click "Create Random Zombie"
   - Confirm transaction in MetaMask

3. **Create Test Kitties**
   - Enter genes (optional) in the "Kitty genes" field
   - Click "Create Test Kitty"
   - Confirm transaction in MetaMask

4. **Level Up Zombies**
   - Find your zombie in "Your Zombies" section
   - Click "Level Up (0.001 ETH)"
   - Confirm transaction in MetaMask

5. **Feed on Kitties**
   - Select a zombie
   - Click "Feed on Kitty"
   - Choose a kitty from the available list
   - Confirm transaction in MetaMask

## Key Components

### Frontend Components
- Main App component with Web3 integration
- Zombie and Kitty management interfaces
- Real-time state updates
- Transaction handling and error management

### Smart Contract Integration
- Direct contract method calls
- Event handling
- Transaction management
- Gas optimization

### User Interface Features
- Clean, intuitive design
- Real-time updates
- Clear error messages
- Transaction status feedback

## Error Handling

The application includes comprehensive error handling for:
- Failed transactions
- Network issues
- Contract errors
- Wallet connection problems
- Ownership verification
- Cooldown period enforcement

## Security Features

- Ownership verification for all actions
- Cooldown period enforcement
- Transaction validation
- Contract access control
- Secure wallet integration

## Limitations

- Requires MetaMask wallet
- Must be connected to correct network
- Requires ETH for transactions
- One zombie per account initially
- Cooldown period between actions

## Development and Testing

This project was developed using:
- Truffle for contract deployment
- Ganache for local blockchain
- Web3.js for blockchain interaction
- React for frontend development

## Contributing

Feel free to submit issues and enhancement requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.