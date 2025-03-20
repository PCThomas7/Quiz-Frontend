import { atom } from 'recoil'

export const quizQuestionsState = atom({
  key: 'quizQuestionsState',
  default: []
})

export const currentQuestionState = atom({
  key: 'currentQuestionState',
  default: 0
})

export const scoreState = atom({
  key: 'scoreState',
  default: 0
})