import { Injectable } from '@nestjs/common';

export interface AiWorkingSessionState {
  sessionId: string;
  activeGoal?: string;
  currentDecision?: string;
  previousRecommendations: string[];
  pendingApprovals: Array<{ id: string; action: string; args: any }>;
  waitingQuestions: string[];
  updatedAt: Date;
}

@Injectable()
export class AiSessionStateService {
  private readonly sessionStates: Map<string, AiWorkingSessionState> = new Map();

  getSessionState(sessionId: string): AiWorkingSessionState {
    if (!this.sessionStates.has(sessionId)) {
      this.sessionStates.set(sessionId, {
        sessionId,
        previousRecommendations: [],
        pendingApprovals: [],
        waitingQuestions: [],
        updatedAt: new Date(),
      });
    }
    return this.sessionStates.get(sessionId)!;
  }

  updateActiveGoal(sessionId: string, goal: string) {
    const state = this.getSessionState(sessionId);
    state.activeGoal = goal;
    state.updatedAt = new Date();
  }

  addRecommendation(sessionId: string, recommendation: string) {
    const state = this.getSessionState(sessionId);
    state.previousRecommendations.push(recommendation);
    state.updatedAt = new Date();
  }

  addPendingApproval(sessionId: string, approval: { id: string; action: string; args: any }) {
    const state = this.getSessionState(sessionId);
    state.pendingApprovals.push(approval);
    state.updatedAt = new Date();
  }
}
