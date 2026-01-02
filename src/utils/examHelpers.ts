import {
    type Test,
    type TestSection,
    type TestSectionPart,
    type QuestionGroup,
    type Question,
} from '@/types/test.types'

export interface EnhancedQuestion extends Question {
    globalNumber: number
}

export interface EnhancedQuestionGroup
    extends Omit<QuestionGroup, 'questions'> {
    questions: EnhancedQuestion[]
}

export interface EnhancedPart extends Omit<TestSectionPart, 'questionGroups'> {
    questionGroups: EnhancedQuestionGroup[]
}

export interface EnhancedSection extends Omit<TestSection, 'parts'> {
    parts: EnhancedPart[]
}

export interface EnhancedTest extends Omit<Test, 'sections'> {
    sections: EnhancedSection[]
}

export const enhanceTestWithQuestionNumbers = (
    testData: Test
): EnhancedTest => {
    let globalCount = 0

    const sections = testData.sections.map((section) => ({
        ...section,
        parts: section.parts.map((part) => ({
            ...part,
            questionGroups: part.questionGroups.map((group) => ({
                ...group,
                questions: group.questions.map((q) => {
                    globalCount++
                    return { ...q, globalNumber: globalCount }
                }),
            })),
        })),
    }))

    return { ...testData, sections }
}
