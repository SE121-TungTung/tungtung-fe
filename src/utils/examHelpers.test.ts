import { describe, it, expect } from 'vitest'
import { enhanceTestWithQuestionNumbers } from './examHelpers'
import {
    type Test,
    SkillArea,
    QuestionType,
    TestStatus,
} from '@/types/test.types'

describe('examHelpers: enhanceTestWithQuestionNumbers', () => {
    it('correctly assigns sequential globalNumber across multiple sections, parts, and groups', () => {
        const mockTest: Test = {
            id: 'test-1',
            title: 'IELTS Practice Test 1',
            description: 'Sample description',
            instructions: null,
            testType: null,
            timeLimitMinutes: 90,
            totalPoints: 40,
            passingScore: 50,
            maxAttempts: 1,
            randomizeQuestions: false,
            showResultsImmediately: true,
            startTime: null,
            endTime: null,
            status: TestStatus.PUBLISHED,
            aiGradingEnabled: false,
            sections: [
                {
                    id: 'sec-1',
                    name: 'Listening',
                    skillArea: SkillArea.LISTENING,
                    timeLimitMinutes: 30,
                    orderNumber: 0,
                    instructions: null,
                    parts: [
                        {
                            id: 'part-1',
                            name: 'Part 1',
                            orderNumber: 0,
                            instructions: null,
                            passage: null,
                            audioUrl: null,
                            imageUrl: null,
                            minQuestions: 2,
                            maxQuestions: 2,
                            questionGroups: [
                                {
                                    id: 'qg-1',
                                    name: 'Questions 1-2',
                                    instructions: 'Answer questions',
                                    questionType: QuestionType.MULTIPLE_CHOICE,
                                    orderNumber: 0,
                                    imageUrl: null,
                                    questions: [
                                        {
                                            id: 'q-1',
                                            title: null,
                                            questionText: 'Question 1 text',
                                            questionType:
                                                QuestionType.MULTIPLE_CHOICE,
                                            difficultyLevel: null,
                                            skillArea: SkillArea.LISTENING,
                                            options: [],
                                            imageUrl: null,
                                            audioUrl: null,
                                            points: 1,
                                            tags: [],
                                            metadata: null,
                                        },
                                        {
                                            id: 'q-2',
                                            title: null,
                                            questionText: 'Question 2 text',
                                            questionType:
                                                QuestionType.MULTIPLE_CHOICE,
                                            difficultyLevel: null,
                                            skillArea: SkillArea.LISTENING,
                                            options: [],
                                            imageUrl: null,
                                            audioUrl: null,
                                            points: 1,
                                            tags: [],
                                            metadata: null,
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                {
                    id: 'sec-2',
                    name: 'Reading',
                    skillArea: SkillArea.READING,
                    timeLimitMinutes: 60,
                    orderNumber: 1,
                    instructions: null,
                    parts: [
                        {
                            id: 'part-2',
                            name: 'Passage 1',
                            orderNumber: 0,
                            instructions: null,
                            passage: null,
                            audioUrl: null,
                            imageUrl: null,
                            minQuestions: 2,
                            maxQuestions: 2,
                            questionGroups: [
                                {
                                    id: 'qg-2',
                                    name: 'Questions 3-4',
                                    instructions: 'Choose True/False',
                                    questionType:
                                        QuestionType.TRUE_FALSE_NOT_GIVEN,
                                    orderNumber: 0,
                                    imageUrl: null,
                                    questions: [
                                        {
                                            id: 'q-3',
                                            title: null,
                                            questionText: 'Question 3 text',
                                            questionType:
                                                QuestionType.TRUE_FALSE_NOT_GIVEN,
                                            difficultyLevel: null,
                                            skillArea: SkillArea.READING,
                                            options: [],
                                            imageUrl: null,
                                            audioUrl: null,
                                            points: 1,
                                            tags: [],
                                            metadata: null,
                                        },
                                        {
                                            id: 'q-4',
                                            title: null,
                                            questionText: 'Question 4 text',
                                            questionType:
                                                QuestionType.TRUE_FALSE_NOT_GIVEN,
                                            difficultyLevel: null,
                                            skillArea: SkillArea.READING,
                                            options: [],
                                            imageUrl: null,
                                            audioUrl: null,
                                            points: 1,
                                            tags: [],
                                            metadata: null,
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        }

        const enhanced = enhanceTestWithQuestionNumbers(mockTest)

        const sec1Part1Q1 =
            enhanced.sections[0].parts[0].questionGroups[0].questions[0]
        const sec1Part1Q2 =
            enhanced.sections[0].parts[0].questionGroups[0].questions[1]
        const sec2Part2Q3 =
            enhanced.sections[1].parts[0].questionGroups[0].questions[0]
        const sec2Part2Q4 =
            enhanced.sections[1].parts[0].questionGroups[0].questions[1]

        expect(sec1Part1Q1.globalNumber).toBe(1)
        expect(sec1Part1Q2.globalNumber).toBe(2)
        expect(sec2Part2Q3.globalNumber).toBe(3)
        expect(sec2Part2Q4.globalNumber).toBe(4)
    })

    it('handles tests with no sections correctly', () => {
        const emptyTest: Test = {
            id: 'empty-test',
            title: 'Empty Test',
            description: null,
            instructions: null,
            testType: null,
            timeLimitMinutes: null,
            totalPoints: 0,
            passingScore: 0,
            maxAttempts: 1,
            randomizeQuestions: false,
            showResultsImmediately: true,
            startTime: null,
            endTime: null,
            status: TestStatus.DRAFT,
            aiGradingEnabled: false,
            sections: [],
        }

        const result = enhanceTestWithQuestionNumbers(emptyTest)
        expect(result.sections).toEqual([])
    })
})
