import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type QuestionLang = 'en' | 'hi';

const STORAGE_KEY = '@question_language';

interface QuestionLike {
  questionText?: string;
  question?: string; // TestAttemptScreen uses this field
  options?: any[];
  explanation?: any;
  hindiVersion?: {
    questionText?: string;
    options?: { text: string }[];
    explanation?: string;
  };
}

export function useQuestionLanguage() {
  const [language, setLanguage] = useState<QuestionLang>('en');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'hi' || saved === 'en') {
        setLanguage(saved);
      }
    });
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => {
      const next: QuestionLang = prev === 'en' ? 'hi' : 'en';
      AsyncStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const getQuestionText = useCallback(
    (q: QuestionLike): string => {
      if (language === 'hi' && q.hindiVersion?.questionText) {
        return q.hindiVersion.questionText;
      }
      return q.questionText || q.question || '';
    },
    [language]
  );

  const getOptionText = useCallback(
    (q: QuestionLike, index: number): string => {
      if (language === 'hi' && q.hindiVersion?.options?.[index]?.text) {
        return q.hindiVersion.options[index].text;
      }
      const opt = q.options?.[index];
      if (!opt) return '';
      return typeof opt === 'string' ? opt : opt.text || '';
    },
    [language]
  );

  const getExplanation = useCallback(
    (q: QuestionLike): string => {
      if (language === 'hi' && q.hindiVersion?.explanation) {
        return q.hindiVersion.explanation;
      }
      if (!q.explanation) return '';
      return typeof q.explanation === 'string' ? q.explanation : q.explanation.text || '';
    },
    [language]
  );

  return { language, toggleLanguage, getQuestionText, getOptionText, getExplanation };
}
