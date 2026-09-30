import { Injectable } from '@nestjs/common';
import { BudgetService } from '@validpost/nestjs-libraries/ai/governance/budget.service';

@Injectable()
export class AiDesignerBudgetGuard {
  constructor(private readonly _budget: BudgetService) {}

  async checkStartBudget(orgId: string): Promise<{ allowed: boolean; reason?: string }> {
    return this._budget.checkBudget('agent', orgId);
  }
}
