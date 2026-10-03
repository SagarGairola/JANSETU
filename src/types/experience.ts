export type SceneState =
  | 'OPENING'
  | 'SG_QUESTION'
  | 'SG_YES_PATH'
  | 'TEAM_QUESTIONS'
  | 'MEMORY_MONTAGE'
  | 'EMOTIONAL'
  | 'COMEDY_CUT'
  | 'ENDING';

export interface UserResponses {
  initialLikeSg: boolean | null;
  noClickCount: number;
  sgLikedTrait: string | null;
  compliment: string;
  surviveHackathon: 'ABSOLUTELY' | 'NEVER_AGAIN' | null;
  teamWorthIt: boolean | null;
}

export interface StoryContent {
  opening: {
    lines: string[];
    hintText: string;
  };
  sgQuestion: {
    question: string;
    yesLabel: string;
    yesSubtext: string;
    noLabel: string;
    noSubtext: string;
    noReactions: string[];
    noMovingReactions: string[];
    noDisappearedMessage: string;
  };
  yesPath: {
    initialReaction: string;
    needEvidence: string;
    traitQuestion: string;
    traits: Array<{ id: string; emoji: string; label: string }>;
    traitConfirmation: string;
    allowIt: string;
    complimentPrompt: string;
    complimentPlaceholder: string;
    saveButtonText: string;
    complimentSaved: string;
    warningText: string;
    suspiciousNice: [string, string];
    continueButton: string;
  };
  teamQuestions: {
    introLines: [string, string];
    question: string;
    choiceAlways: { label: string; subtext: string; reaction: [string, string] };
    choiceNever: { label: string; subtext: string; reaction: [string, string] };
    compatibilityCheck: {
      checkingText: string;
      resultLabel: string;
      resultText: string;
      leadIn: string;
    };
  };
  memoryMontage: {
    rapidWords: string[];
    annotations: Record<string, string>;
    pauseLines: [string, string];
    payoff: {
      title: string;
      lines: string[];
    };
    actionPrompt: string;
  };
  emotional: {
    introLines: string[];
    question: string;
    yesLabel: string;
    responseLines: string[];
    teamBadge: string;
    climaxLines: string[];
  };
  comedyCut: {
    lines: string[];
    signature: string;
    proceedButton: string;
  };
  ending: {
    jansetuTitle: string;
    submittedBadge: string;
    resultIntro: string[];
    resultHeadline: string;
    shiftLines: string[];
    memoryFragments: string[];
    emotionalLines: string[];
    thatPartIsOurs: string;
    teamBadge: string;
    comedyReturn: {
      lines: string[];
      finalWord: string;
    };
    creditWords: string[];
    creditsPayoff: string[];
    finalMessage: string[];
    finalScreen: {
      jansetu: string;
      notSelected: string;
      stillOurs: string;
      replayButton: string;
      footerNote: string;
    };
  };
}
