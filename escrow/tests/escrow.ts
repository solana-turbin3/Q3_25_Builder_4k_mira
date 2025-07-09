import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Escrow } from '../target/types/escrow'

describe('escrow', async () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)

  const program = anchor.workspace.escrow as Program<Escrow>
  const user = provider.wallet.payer

  const statePDA = await anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('state'), user.publicKey.toBuffer()],
    program.programId
  )[0]
  console.log('State PDA', statePDA.toBase58())

  const vaultPDA = await anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), statePDA.toBuffer()],
    program.programId
  )[0]
  console.log('Vault PDA', vaultPDA.toBase58())

  it('Is initialized!', async () => {
    console.log('Initializing...')
    // Add your test here.
    const tx = await program.methods
      .initialize()
      .accountsPartial({
        state: statePDA,
        vault: vaultPDA,
        user: user.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc()
    console.log('Your transaction signature', tx)

    const state = await program.account.vault.all()
    console.log('State', state)
  })

  it('Deposit', async () => {
    console.log('Depositing...')
    const tx = await program.methods
      .deposit(new anchor.BN(1 * anchor.web3.LAMPORTS_PER_SOL))
      .accountsPartial({
        state: statePDA,
        vault: vaultPDA,
        user: user.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc()
    console.log('Your transaction signature', tx)

    const state = await program.account.vault.all()
    console.log('State', state)
  })

  it('Withdraw', async () => {
    console.log('Withdrawing...')
    const tx = await program.methods
      .withdraw(new anchor.BN(0.5 * anchor.web3.LAMPORTS_PER_SOL))
      .accountsPartial({
        state: statePDA,
        vault: vaultPDA,
        user: user.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc()
    console.log('Your transaction signature', tx)

    const state = await program.account.vault.all()
    console.log('State', state)
  })

  it('Close', async () => {
    console.log('Closing...')
    const tx = await program.methods
      .close()
      .accountsPartial({
        state: statePDA,
        vault: vaultPDA,
        user: user.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc()

    console.log('Your transaction signature', tx)

    const state = await program.account.vault.all()
    console.log('State', state)
  })
})
