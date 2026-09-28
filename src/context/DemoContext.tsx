import React, { useState, useMemo, useCallback } from 'react';
import { DemoContext } from './DemoContextInstance';
import { SAMPLE_SCHEMES } from '../data/mockSchemes';
import type { CitizenProfileAnswers } from '../types';
import { SAMPLE_APPLICANT_PRESETS } from '../utils/eligibilityEvaluator';
import { understandCitizenNeed } from '../services/needEngine';
import { mergeClarificationAnswer } from '../services/clarificationEngine';

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userNeed, setUserNeed] = useState<string>('I want financial support for my higher education.');
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('post-matric-scholarship');
  const [answers, setAnswers] = useState<CitizenProfileAnswers>(
    SAMPLE_APPLICANT_PRESETS['post-matric-scholarship'] || {}
  );
  const [blockerInput, setBlockerInput] = useState<string>(
    'Application rejected: "Income Certificate issued prior to current financial year is invalid."'
  );

  const [documentStatuses, setDocumentStatuses] = useState<
    Record<string, Record<string, 'available' | 'missing' | 'needs_verification'>>
  >({});

  const [clarificationAnswers, setClarificationAnswers] = useState<Record<string, string>>({});

  const needProfile = useMemo(() => {
    let profile = understandCitizenNeed(userNeed);
    for (const [field, answer] of Object.entries(clarificationAnswers)) {
      profile = mergeClarificationAnswer(profile, field, answer);
    }
    return profile;
  }, [userNeed, clarificationAnswers]);

  const submitClarificationAnswer = useCallback((field: string, answer: string) => {
    setClarificationAnswers((prev) => ({
      ...prev,
      [field]: answer,
    }));
  }, []);

  const currentScheme = useMemo(() => {
    return (
      SAMPLE_SCHEMES.find((s) => s.id === selectedSchemeId) || SAMPLE_SCHEMES[0]
    );
  }, [selectedSchemeId]);

  const updateAnswer = useCallback((field: keyof CitizenProfileAnswers, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const updateDocumentStatus = useCallback(
    (docId: string, status: 'available' | 'missing' | 'needs_verification') => {
      setDocumentStatuses((prev) => ({
        ...prev,
        [selectedSchemeId]: {
          ...(prev[selectedSchemeId] || {}),
          [docId]: status,
        },
      }));
    },
    [selectedSchemeId]
  );

  const resetDocumentStatuses = useCallback(() => {
    setDocumentStatuses((prev) => {
      const next = { ...prev };
      delete next[selectedSchemeId];
      return next;
    });
  }, [selectedSchemeId]);

  const setSampleApplicant = useCallback(() => {
    const preset = SAMPLE_APPLICANT_PRESETS[selectedSchemeId] || {};
    setAnswers(preset);
  }, [selectedSchemeId]);

  const resetDemo = useCallback(() => {
    setUserNeed('I want financial support for my higher education.');
    setSelectedSchemeId('post-matric-scholarship');
    setAnswers(SAMPLE_APPLICANT_PRESETS['post-matric-scholarship'] || {});
    setBlockerInput(
      'Application rejected: "Income Certificate issued prior to current financial year is invalid."'
    );
    setDocumentStatuses({});
    setClarificationAnswers({});
  }, []);

  const value = useMemo(
    () => ({
      userNeed,
      setUserNeed,
      selectedSchemeId,
      setSelectedSchemeId,
      schemes: SAMPLE_SCHEMES,
      currentScheme,
      answers,
      updateAnswer,
      setSampleApplicant,
      blockerInput,
      setBlockerInput,
      documentStatuses,
      updateDocumentStatus,
      resetDocumentStatuses,
      resetDemo,
      needProfile,
      clarificationAnswers,
      submitClarificationAnswer,
    }),
    [
      userNeed,
      selectedSchemeId,
      currentScheme,
      answers,
      updateAnswer,
      setSampleApplicant,
      blockerInput,
      documentStatuses,
      updateDocumentStatus,
      resetDocumentStatuses,
      resetDemo,
      needProfile,
      clarificationAnswers,
      submitClarificationAnswer,
    ]
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
};
