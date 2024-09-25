# PeerGuard

PeerGuard is a custom candy guard for the Metaplex Candy Machine that enables minting NFTs upon receiving transaction ID confirmation from Stripe, allowing users to purchase NFTs  with traditional payment methods.

# Features
 * Fiat Payment Integration: Mints NFTs after confirming transaction IDs from Stripe.
 * ED25519 Instruction: Ensures secure cryptographic signing for transaction validation.
 * Easy Integration: Designed to work effortlessly with the Metaplex Candy Machine.

# Getting Started
To get started with PeerGuard, clone the repository and follow the installation instructions in the documentation.

## Programs

This project contains the following programs:

- [Candy Machine Core](./programs/candy-machine-core/README.md) `CndyV3LdqHUfDLmE5naZjVN8rBZz4tqhdefbAnjHG3JR`
- [Candy Guard Program with Custom Peer Guard Candy Guard](./programs/candy-guard/README.md) `3tvCcjNW6iQHhb5muybaB1i14FcR57t9CacG7pMBMG53`

You will need a Rust version compatible with BPF to compile the program, currently we recommend using Rust 1.68.0.
