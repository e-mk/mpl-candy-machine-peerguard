
Markdown
# PeerGuard

PeerGuard is a custom candy guard for the Metaplex Candy Machine, designed to mint NFTs by confirming payment through a Stripe transaction ID. This innovative approach streamlines the minting process by integrating traditional payment systems with blockchain technology.

## Table of Contents

* [Prerequisites](#prerequisites)
* [Installation](#installation)
* [Usage](#usage)
* [Commands](#commands)
* [License](#license)
* [Contributing](#contributing)

## Prerequisites

Before you begin, ensure you have the following installed:

* Node.js
* Solana CLI
* Stripe Account
* Metaplex CLI

## Installation

1. Clone the repository:

```bash
git clone [https://github.com/yourusername/PeerGuard.git](https://github.com/yourusername/PeerGuard.git)
cd PeerGuard

Install the required dependencies:
Bash
npm install

Usage
To start using PeerGuard, you need to set up the Solana test validator and deploy the necessary programs. Refer to the Commands section for specific instructions.

Commands
Copy NFT Metadata Program and Candy Machine Program into Local Network for Solana Test Validator
Bash
solana program dump -u m metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s metadata.so
solana program dump -u CndyV3LdqHUfDLmE5naZjVN8rBZz4tqhdefbAnjHG3JR candy_machine.so

This command will copy the NFT metadata and candy machine programs to your local network, enabling you to test the functionality of PeerGuard.

Run the Solana Test Validator
Bash
solana-test-validator -r --bpf-program metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s metadata.so --bpf-program CndyV3LdqHUfDLmE5naZjVN8rBZz4tqhdefbAnjHG3JR candy_machine.so

Start the Solana test validator with the NFT metadata and candy machine programs loaded.

Run Tests Using Anchor
Bash
anchor test --skip-validator

This command will run your tests while skipping the validator step.

License
This project is licensed under the MIT License - see the LICENSE file for details.

Contributing
Contributions are welcome! Please see CONTRIBUTING.md for more details.
