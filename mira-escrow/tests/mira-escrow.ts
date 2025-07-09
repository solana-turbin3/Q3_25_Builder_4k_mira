import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { BN } from 'bn.js'
import { MiraEscrow } from '../target/types/mira_escrow'

describe('mira-escrow', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.local()
  anchor.setProvider(provider)

  const program = anchor.workspace.miraEscrow as Program<MiraEscrow>

  const user = provider.wallet.payer
  const [statePDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('state'), user.publicKey.toBytes()],
    program.programId
  )
  const [vaultPDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), statePDA.toBytes()],
    program.programId
  )

  console.log('statePDA', statePDA.toBase58())
  console.log('vaultPDA', vaultPDA.toBase58())

  it('Is initialized!', async () => {
    // Add your test here.
    const tx = await program.methods
      .initialize()
      .accountsPartial({
        user: user.publicKey,
        state: statePDA,
        vault: vaultPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc()

    console.log('Your transaction signature', tx)

    const account = await program.account.vault.all()
    console.log('account', account)
  })

  it('Deposit', async () => {
    console.log('Depositing 1 SOL')
    const tx = await program.methods
      .deposit(new BN(1 * anchor.web3.LAMPORTS_PER_SOL))
      .accountsPartial({
        user: user.publicKey,
        state: statePDA,
        vault: vaultPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc()

    console.log('Your transaction signature', tx)

    const account = await program.account.vault.all()
    console.log('account', account)

    const balance = await provider.connection.getBalance(vaultPDA)
    console.log('balance', balance / anchor.web3.LAMPORTS_PER_SOL)
  })

  it('Withdraw', async () => {
    console.log('Withdrawing 0.5 SOL')
    const tx = await program.methods
      .withdraw(new BN(0.5 * anchor.web3.LAMPORTS_PER_SOL))
      .accountsPartial({
        user: user.publicKey,
        state: statePDA,
        vault: vaultPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc()

    console.log('Your transaction signature', tx)

    const account = await program.account.vault.all()
    console.log('account', account)

    const balance = await provider.connection.getBalance(vaultPDA)
    console.log('balance', balance / anchor.web3.LAMPORTS_PER_SOL)
  })

  it('Close', async () => {
    console.log('Closing')
    const tx = await program.methods.close().rpc()
    console.log('Your transaction signature', tx)

    const account = await program.account.vault.all()
    console.log('account', account)

    const balance = await provider.connection.getBalance(vaultPDA)
    console.log('balance', balance / anchor.web3.LAMPORTS_PER_SOL)
  })
})
