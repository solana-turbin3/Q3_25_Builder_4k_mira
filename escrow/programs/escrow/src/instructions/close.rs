use anchor_lang::{
    prelude::*,
    system_program::{transfer, Transfer},
};

use crate::Vault;

#[derive(Accounts)]
pub struct Close<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        close = user,
        seeds = [b"state", user.key().as_ref()],
        bump = state.state_bump,
    )]
    pub state: Account<'info, Vault>,

    #[account(
        mut,
        seeds = [b"vault", state.key().as_ref()],
        bump = state.vault_bump,
    )]
    pub vault: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> Close<'info> {
    pub fn close(&mut self) -> Result<()> {
        let lamports = self.vault.lamports();
        if lamports > 0 {
            let cpi_program = self.system_program.to_account_info();
            let accounts = Transfer {
                from: self.vault.to_account_info(),
                to: self.user.to_account_info(),
            };

            let seeds = self.state.key();
            let signer_seeds: &[&[&[u8]]] =
                &[&[b"vault", seeds.as_ref(), &[self.state.vault_bump]]];

            let cpi_context = CpiContext::new_with_signer(cpi_program, accounts, signer_seeds);

            transfer(cpi_context, lamports)?;
        }
        Ok(())
    }
}
