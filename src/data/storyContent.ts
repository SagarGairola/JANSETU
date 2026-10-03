import type { StoryContent } from '../types/experience';

export const storyContent: StoryContent = {
  opening: {
    lines: [
      'WAIT.',
      "Don't close this yet.",
      'JANSETU is submitted.',
      'PPT is done.',
      'Demo is done.',
      'Deadline is over.',
      'So technically...',
      "we're done.",
      '...',
      'right?'
    ],
    hintText: 'Tap to continue'
  },

  sgQuestion: {
    question: 'Did you actually like having SG as your teammate?',
    yesLabel: 'YES ❤️',
    yesSubtext: 'Wow, kitna accha insaan hain 🥹',
    noLabel: 'NO 💀',
    noSubtext: 'Chii pagal, serious insaan 💀',
    noReactions: [
      'Arey seriously? 😭',
      'Ek baar aur soch lo... 👀',
      'Itna bhi sach nahi bolna tha 💀',
      'Kya dushmani hai yaar 😭',
      'Ab bhi NO?!',
      'Okay, this is getting personal.',
      'Main yaad rakhunga. 👀',
      'Respectfully... why?',
      'NO ke liye itni mehnat?'
    ],
    noMovingReactions: [
      'Pakad ke dikhao 😭',
      'Almost! 💀',
      'Arre bas bhi karo 😭',
      'Itni dedication NO ke liye? 💀'
    ],
    noDisappearedMessage: 'Ab seedha YES dabao. 😌'
  },

  yesPath: {
    initialReaction: 'Ohhh, look at you being nice. 🥹',
    needEvidence: 'But I need some evidence.',
    traitQuestion: 'What did you like most about having me on the team?',
    traits: [
      { id: 'ideas', emoji: '🧠', label: 'Ideas' },
      { id: 'coding', emoji: '💻', label: 'Coding' },
      { id: 'getting_done', emoji: '🎯', label: 'Getting things done' },
      { id: 'leadership', emoji: '🗣️', label: 'Leadership' },
      { id: 'chaos', emoji: '😂', label: 'Chaos' },
      { id: 'everything', emoji: '🤷', label: 'Somehow everything' }
    ],
    traitConfirmation: 'Interesting choice.',
    allowIt: "I'll allow it.",
    complimentPrompt: 'Give me ONE compliment.',
    complimentPlaceholder: 'Type something nice (or reluctantly true)...',
    saveButtonText: 'SAVE IT',
    complimentSaved: 'Saved.',
    warningText: 'This evidence may be used against you later. 👀',
    suspiciousNice: [
      'Okay.',
      'That was suspiciously nice. Moving on before this gets awkward. 😌'
    ],
    continueButton: 'Continue 👉'
  },

  teamQuestions: {
    introLines: [
      'Okay, enough about me.',
      "Let's talk about us."
    ],
    question: 'Would you survive another hackathon with this exact team?',
    choiceAlways: {
      label: 'ABSOLUTELY 🫡',
      subtext: 'Through every merge conflict & all-nighter',
      reaction: [
        'Bold.',
        'You clearly forgot what happened last time. 💀'
      ]
    },
    choiceNever: {
      label: 'NEVER AGAIN 💀',
      subtext: 'My mental peace comes first',
      reaction: [
        'Understandable.',
        'Your honesty has been recorded.'
      ]
    },
    compatibilityCheck: {
      checkingText: 'Team compatibility check...',
      resultLabel: 'Result:',
      resultText: 'Somehow still functioning.',
      leadIn: "Okay. Let's remember what actually happened."
    }
  },

  memoryMontage: {
    rapidWords: [
      'IDEA',
      'JANSETU',
      'PPT PANIC',
      'CODING',
      'BUGS',
      'WHY IS THIS NOT WORKING?!',
      'DEADLINE',
      'DEMO',
      'SUBMITTED'
    ],
    annotations: {
      'IDEA': 'Yeah, this could work.',
      'PPT PANIC': 'How many slides?',
      'CODING': 'Okay, now we actually build.',
      'BUGS': '...',
      'WHY IS THIS NOT WORKING?!': 'Literally 3 AM.',
      'DEADLINE': 'Oh.',
      'DEMO': 'Please work.',
      'SUBMITTED': 'We survived.'
    },
    pauseLines: [
      'And somehow...',
      'we made it.'
    ],
    payoff: {
      title: 'JANSETU',
      lines: [
        "That wasn't just a project.",
        'It was a lot of late decisions.',
        'A lot of fixing things that broke.',
        "A lot of 'what are we even doing?'",
        'And somehow...',
        'we kept going.'
      ]
    },
    actionPrompt: 'Continue into quiet'
  },

  emotional: {
    introLines: [
      'Okay.',
      'No jokes for a few seconds.'
    ],
    question: 'Was this team actually worth it?',
    yesLabel: 'YES ❤️',
    responseLines: [
      'Yeah.',
      'I think so too.',
      'We started with an idea.',
      'We ended with something we actually built together.'
    ],
    teamBadge: 'TEAM JANSETU ❤️',
    climaxLines: [
      'Whatever happens next...',
      'this part was ours.'
    ]
  },

  comedyCut: {
    lines: [
      'Okay.',
      'ENOUGH EMOTIONAL DAMAGE. 💀',
      'Go drink water.',
      'Seriously.'
    ],
    signature: '— SG',
    proceedButton: 'Remember this 💫'
  },

  ending: {
    jansetuTitle: 'JANSETU',
    submittedBadge: 'SUBMITTED.',
    resultIntro: [
      'Okay.',
      'So...',
      'we got the result.'
    ],
    resultHeadline: "JANSETU wasn't selected.",
    shiftLines: [
      'That kinda hurts.',
      'Not gonna lie.',
      'But...',
      'before the result, there was everything we did to get here.'
    ],
    memoryFragments: [
      'IDEA',
      'PPT',
      'CODING',
      'BUGS',
      'DEADLINE',
      'DEMO',
      'SUBMITTED'
    ],
    emotionalLines: [
      'We had an idea.',
      'We built it.',
      'We made it together.'
    ],
    thatPartIsOurs: 'That part is ours.',
    teamBadge: 'TEAM JANSETU ❤️',
    comedyReturn: {
      lines: [
        'Okay.',
        'Enough emotional damage.',
        "Obviously we're disappointed.",
        "But we're not deleting the group chat."
      ],
      finalWord: '...yet.'
    },
    creditWords: [
      'IDEAS',
      'CHAOS',
      'DEADLINES',
      'BUGS',
      'PPT',
      'CODE',
      'PANIC',
      'LAUGHTER',
      'JANSETU',
      'TEAM'
    ],
    creditsPayoff: [
      "Maybe JANSETU didn't make it to the next stage.",
      'But it made it here.',
      'To us.'
    ],
    finalMessage: [
      'Whatever we build next...',
      'I hope we remember this one.',
      'TEAM JANSETU',
      '2026',
      '— SG'
    ],
    finalScreen: {
      jansetu: 'JANSETU',
      notSelected: 'Not selected.',
      stillOurs: 'But still ours.',
      replayButton: 'Replay ↻',
      footerNote: 'Made after the deadline. Obviously.'
    }
  }
};
