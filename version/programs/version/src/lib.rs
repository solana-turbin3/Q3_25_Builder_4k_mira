use anchor_lang::prelude::*;

declare_id!("Cz87zESR1kntSv66YmkYCGwqcknDA3ZC1MErUQwB73AC");

#[program]
pub mod version {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
