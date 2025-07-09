use anchor_lang::{
    prelude::*,
    system_program::{transfer, Transfer},
};

use crate::Vault;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        payer = user,
        space = 8 + Vault::INIT_SPACE,
        seeds = [b"state", user.key().as_ref()],
        bump,
    )]
    pub state: Account<'info, Vault>,

    #[account(
        mut,
        seeds = [b"vault", state.key().as_ref()],
        bump,
    )]
    pub vault: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> Initialize<'info> {
    pub fn initialize(&mut self, bumps: InitializeBumps) -> Result<()> {
        self.state.state_bump = bumps.state;
        self.state.vault_bump = bumps.vault;

        let rent = Rent::get()?.minimum_balance(self.vault.to_account_info().data_len());
        let cpi_program = self.system_program.to_account_info();
        let accounts = Transfer {
            from: self.user.to_account_info(),
            to: self.vault.to_account_info(),
        };
        let cpi_context = CpiContext::new(cpi_program, accounts);

        transfer(cpi_context, rent)?;

        Ok(())
    }
}
