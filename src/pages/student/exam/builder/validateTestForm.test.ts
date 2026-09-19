import { describe, it, expect, vi } from 'vitest'
import { validateTestForm } from './validateTestForm'
import {
    SkillArea,
    QuestionType,
    type TestSectionCreatePayload,
} from '@/types/test.types'
import type { TestBasicInfo } from './types'

describe('validateTestForm', () => {
    const validBasicInfo: TestBasicInfo = {
        title: 'IELTS Academic Reading & Listening',
        description: 'Test Description',
        instructions: '',
        testType: null,
        timeLimitMinutes: 60,
        passingScore: 50,
        maxAttempts: 1,
        randomizeQuestions: false,
        showResultsImmediately: true,
        aiGradingEnabled: false,
        startTime: '',
        endTime: '',
    }

    const createValidSection = (
        skill: SkillArea = SkillArea.READING
    ): TestSectionCreatePayload => ({
        name: 'Section 1',
        skill_area: skill,
        time_limit_minutes: 60,
        order_number: 0,
        parts: [
            {
                name: 'Part 1',
                order_number: 0,
                passage: {
                    title: 'Passage 1',
                    content_type:
                        skill === SkillArea.LISTENING
                            ? 'listening_audio'
                            : 'reading_passage',
                    text_content: 'Some passage content here...',
                    audio_url:
                        skill === SkillArea.LISTENING
                            ? 'https://cdn.example.com/audio.mp3'
                            : undefined,
                },
                question_groups: [
                    {
                        name: 'Group 1',
                        instructions: 'Choose True/False/Not Given',
                        question_type: QuestionType.TRUE_FALSE_NOT_GIVEN,
                        order_number: 0,
                        questions: [
                            {
                                title: 'Q1',
                                question_text: 'Is the passage about history?',
                                question_type:
                                    QuestionType.TRUE_FALSE_NOT_GIVEN,
                                skill_area: skill,
                                options: [],
                            },
                        ],
                    },
                ],
            },
        ],
    })

    it('fails when title is empty or only whitespace', () => {
        const alertFn = vi.fn()
        const result = validateTestForm(
            { ...validBasicInfo, title: '   ' },
            [createValidSection()],
            alertFn
        )

        expect(result).toBe(false)
        expect(alertFn).toHaveBeenCalledWith('Vui lòng nhập tiêu đề bài thi')
    })

    it('fails when there are no sections in the test', () => {
        const alertFn = vi.fn()
        const result = validateTestForm(validBasicInfo, [], alertFn)

        expect(result).toBe(false)
        expect(alertFn).toHaveBeenCalledWith('Vui lòng thêm ít nhất 1 section')
    })

    it('fails when a section has no parts', () => {
        const alertFn = vi.fn()
        const sectionWithoutParts: TestSectionCreatePayload = {
            name: 'Empty Section',
            skill_area: SkillArea.READING,
            time_limit_minutes: 30,
            order_number: 0,
            parts: [],
        }

        const result = validateTestForm(
            validBasicInfo,
            [sectionWithoutParts],
            alertFn
        )

        expect(result).toBe(false)
        expect(alertFn).toHaveBeenCalledWith(
            'Section "Empty Section" chưa có part nào'
        )
    })

    it('fails when a part has missing passage text', () => {
        const alertFn = vi.fn()
        const section = createValidSection()
        section.parts[0].passage = {
            title: 'Empty Passage',
            content_type: 'reading_passage',
            text_content: '  ',
        }

        const result = validateTestForm(validBasicInfo, [section], alertFn)

        expect(result).toBe(false)
        expect(alertFn).toHaveBeenCalledWith(
            'Part "Part 1" chưa có nội dung passage'
        )
    })

    it('fails when Listening section part is missing audio URL', () => {
        const alertFn = vi.fn()
        const listeningSection = createValidSection(SkillArea.LISTENING)
        listeningSection.parts[0].passage!.audio_url = ''

        const result = validateTestForm(
            validBasicInfo,
            [listeningSection],
            alertFn
        )

        expect(result).toBe(false)
        expect(alertFn).toHaveBeenCalledWith(
            'Part "Part 1" (Listening) chưa có audio URL'
        )
    })

    it('fails when a part has no question groups', () => {
        const alertFn = vi.fn()
        const section = createValidSection()
        section.parts[0].question_groups = []

        const result = validateTestForm(validBasicInfo, [section], alertFn)

        expect(result).toBe(false)
        expect(alertFn).toHaveBeenCalledWith(
            'Part "Part 1" chưa có question group nào'
        )
    })

    it('fails when a question group has no questions', () => {
        const alertFn = vi.fn()
        const section = createValidSection()
        section.parts[0].question_groups[0].questions = []

        const result = validateTestForm(validBasicInfo, [section], alertFn)

        expect(result).toBe(false)
        expect(alertFn).toHaveBeenCalledWith(
            'Question group "Group 1" chưa có câu hỏi nào'
        )
    })

    it('fails when a question is missing question text', () => {
        const alertFn = vi.fn()
        const section = createValidSection()
        section.parts[0].question_groups[0].questions[0].question_text = '   '

        const result = validateTestForm(validBasicInfo, [section], alertFn)

        expect(result).toBe(false)
        expect(alertFn).toHaveBeenCalledWith(
            'Có câu hỏi chưa nhập nội dung trong group "Group 1"'
        )
    })

    it('succeeds and returns true when form data is completely valid', () => {
        const alertFn = vi.fn()
        const section = createValidSection()

        const result = validateTestForm(validBasicInfo, [section], alertFn)

        expect(result).toBe(true)
        expect(alertFn).not.toHaveBeenCalled()
    })
})
