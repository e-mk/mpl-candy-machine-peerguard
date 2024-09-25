import {
    percentAmount,
    createSignerFromKeypair,
    generateSigner,
    some,
    signerIdentity,
    publicKey,
} from '@metaplex-foundation/umi';
import { TokenStandard, createNft } from '@metaplex-foundation/mpl-token-metadata';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import {
    mplCandyMachine,
    create,
    addConfigLines,
    mintV2,
    fetchCandyMachine,
} from '@metaplex-foundation/mpl-candy-machine';
import { ComputeBudgetProgram, Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import * as anchor from "@coral-xyz/anchor";
import {
    SYSVAR_INSTRUCTIONS_PUBKEY,
    Ed25519Program,
    Transaction,
    Keypair,
} from "@solana/web3.js";
import { fromWeb3JsKeypair, toWeb3JsInstruction, toWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters';
import base58 from "bs58";
import assert from 'assert';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';

/**
 * Confirms the transaction and waits for confirmation.
 */
const confirmTx = async (signature: string) => {
    const latestBlockhash = await anchor.getProvider().connection.getLatestBlockhash();
    await anchor.getProvider().connection.confirmTransaction({
        signature,
        ...latestBlockhash,
    });
    return signature;
};

/**
 * Logs the transaction signature with a link to the Solana Explorer.
 */
const log = async (signature: string): Promise<string> => {
    console.log(
        `Your transaction signature: https://explorer.solana.com/transaction/${signature}?cluster=custom&customUrl=${anchor.getProvider().connection.rpcEndpoint}`
    );
    return signature.toString();
};

async function getTokenAccountBalance(
    connection: Connection,
    pk: PublicKey
): Promise<bigint> {
    let amount = (await connection.getTokenAccountBalance(pk)).value.amount;
    return BigInt(amount);
}

describe("PeerGuard Tests", () => {
    const umi = createUmi('http://localhost:8899').use(mplCandyMachine());
    const keypairJs = anchor.web3.Keypair.generate();
    const keypair = fromWeb3JsKeypair(keypairJs);
    const adminKeypairJs = anchor.web3.Keypair.generate();
    const adminKeypair = fromWeb3JsKeypair(adminKeypairJs);
    const signer = createSignerFromKeypair(umi, keypair);
    const collectionMint = generateSigner(umi);
    const candyMachine = generateSigner(umi);
    const candyMachinePk = candyMachine.publicKey;

    umi.use(signerIdentity(signer));

    const connection = new Connection("http://localhost:8899", 'confirmed');
    const provider = new anchor.AnchorProvider(connection, new NodeWallet(keypairJs), anchor.AnchorProvider.defaultOptions());
    anchor.setProvider(provider);

    /**
     * Test airdropping SOL to keypairs.
     */
    it("Airdrops SOL to accounts", async () => {
        await Promise.all(
            [adminKeypairJs, keypairJs].map(async (account) => {
                await provider.connection
                    .requestAirdrop(account.publicKey, 15 * LAMPORTS_PER_SOL)
                    .then(confirmTx);
            })
        );
        // Wait for the airdrop to be confirmed
        await new Promise(f => setTimeout(f, 15000));
    });

    /**
     * Test creating a collection NFT.
     */
    it("Creates collection NFT", async () => {
        try {
            const createCollectionTx = await createNft(umi, {
                mint: collectionMint,
                authority: signer,
                name: 'PeerGuard Test NFT',
                uri: "",
                sellerFeeBasisPoints: percentAmount(9.99, 2), // 9.99% fee
                isCollection: true,
            }).sendAndConfirm(umi);

            const signature = base58.encode(createCollectionTx.signature);
            console.log(`Collection NFT Minted! TX: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
        } catch (e) {
            console.error(`Error creating collection NFT: ${e}`);
        }
    });

    /**
     * Test creating a Candy Machine with PeerGuard.
     */
    it("Creates candy machine with peer guard", async () => {
        try {
            const createCandyMachine = await create(umi, {
                candyMachine: candyMachine,
                collectionMint: collectionMint.publicKey,
                collectionUpdateAuthority: signer,
                tokenStandard: TokenStandard.NonFungible,
                sellerFeeBasisPoints: percentAmount(25, 2), // 25% fee
                itemsAvailable: 3,
                sysvarInstructions: publicKey(SYSVAR_INSTRUCTIONS_PUBKEY.toString()),
                guards: {
                    peerGuard: {
                        authority: adminKeypair.publicKey,
                    },
                },
                creators: [
                    {
                        address: umi.identity.publicKey,
                        verified: true,
                        percentageShare: 100,
                    },
                ],
                configLineSettings: some({
                    prefixName: '',
                    nameLength: 32,
                    prefixUri: '',
                    uriLength: 200,
                    isSequential: false,
                }),
            });

            const signature = base58.encode((await createCandyMachine.sendAndConfirm(umi)).signature);
            console.log(`Candy Machine Created! TX: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
            console.log(`Candy Machine PublicKey: ${candyMachinePk}`);
        } catch (e) {
            console.error(`Error creating candy machine: ${e}`);
        }
    });

    /**
     * Test inserting items into the Candy Machine.
     */
    it("Inserts items into candy machine", async () => {
        try {
            const insertItems = await addConfigLines(umi, {
                candyMachine: candyMachinePk,
                index: 0,
                configLines: [
                    { name: 'TEST NFT #1', uri: '' },
                    { name: 'TEST NFT #2', uri: '' },
                    { name: 'TEST NFT #3', uri: '' },
                ],
            }).sendAndConfirm(umi);

            const signature = base58.encode(insertItems.signature);
            assert.equal((await fetchCandyMachine(umi, candyMachinePk)).itemsLoaded, 3, "Candy Machine should have 3 items loaded");

            console.log(`Items Inserted! TX: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
        } catch (e) {
            console.error(`Error inserting items: ${e}`);
        }
    });

    /**
     * Test minting an NFT with PeerGuard.
     */
    it("Mints an NFT with PeerGuard", async () => {
        const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({ units: 1000000 });
        const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1 });
        const transactionId = Array.from({ length: 28 }, () => Math.random().toString(36)[2]).join('');
        let idMsg = anchor.utils.bytes.utf8.encode(transactionId);
        let transactionIdPda = PublicKey.findProgramAddressSync([idMsg], new PublicKey("3tvCcjNW6iQHhb5muybaB1i14FcR57t9CacG7pMBMG53"))[0];
        const ed25519Ix = Ed25519Program.createInstructionWithPrivateKey({ privateKey: adminKeypair.secretKey, message: idMsg });
        const nftMint = generateSigner(umi);
        const mintV2Instructions = mintV2(umi, {
            candyMachine: candyMachinePk,
            nftMint,
            collectionMint: collectionMint.publicKey,
            collectionUpdateAuthority: signer.publicKey,
            tokenStandard: TokenStandard.NonFungible,
            mintArgs: {
                peerGuard: {
                    transactionPda: publicKey(transactionIdPda.toString()),
                },
            },
        }).getInstructions();

        const tx = new Transaction();
        tx.add(ed25519Ix);
        mintV2Instructions.forEach(instruction => tx.add(toWeb3JsInstruction(instruction)).add(modifyComputeUnits).add(addPriorityFee));

        const nftMintSigner = Keypair.fromSecretKey(nftMint.secretKey);
        await provider.sendAndConfirm(tx, [nftMintSigner]).then(confirmTx).then(log);

        const nftAta = await getAssociatedTokenAddress(toWeb3JsPublicKey(nftMint.publicKey), keypairJs.publicKey);
        const tokenBalance = await getTokenAccountBalance(connection, nftAta);
        assert.equal(tokenBalance.toString(), "1", "Candy Machine Should Have Minted 1 NFT");
    });
});
