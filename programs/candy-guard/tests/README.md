
Markdown
# PeerGuard

PeerGuard is a custom candy guard for the Metaplex Candy Machine that enables minting NFTs upon receiving transaction ID confirmation from Stripe, allowing users to purchase NFTs with traditional payment methods.

## Table of Contents

* [Prerequisites](#prerequisites)
* [Usage](#usage)
* [Commands](#commands)

## Prerequisites

Before you begin, ensure you have the following installed:

* Node.js
* Anchor
* Rust
* Solana CLI

## Usage
To start using PeerGuard, you need to set up the Solana test validator and deploy the necessary programs. Refer to the Commands section for specific instructions.
You also need to replace your @metaplex-foundation/mpl-candy-machine node module with a [custom generated mpl-candy-machine module that includes PeerGuard](../../../modified_node_modules/mpl-candy-machine).

# Commands
1. Copy NFT Metadata Program and Candy Machine Program for Solana Test Validator
This command will copy the NFT metadata and candy machine programs to your local network, enabling you to test the functionality of PeerGuard.
```bash
solana program dump -u m metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s metadata.so
&&
solana program dump -u CndyV3LdqHUfDLmE5naZjVN8rBZz4tqhdefbAnjHG3JR candy_machine.so
```
2. Run the Solana Test Validator
Start the Solana test validator with the NFT metadata and candy machine programs loaded.
```bash
solana-test-validator -r --bpf-program metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s metadata.so --bpf-program CndyV3LdqHUfDLmE5naZjVN8rBZz4tqhdefbAnjHG3JR candy_machine.so
```

3. Run Tests Using Anchor
This command will run your tests while skipping the validator step.

```bash
anchor test --skip-validator
```

