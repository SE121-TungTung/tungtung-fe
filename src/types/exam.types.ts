export type QuestionType =
    | 'TFNF' // True/False/Not Given
    | 'MCQ' // Multiple Choice (single or multiple)
    | 'MatchingHeadings'
    | 'MatchingFeatures' // Nối
    | 'MatchingSentenceEndings' // Nối nửa câu
    | 'SentenceCompletion'
    | 'SummaryCompletion' // Điền vào tóm tắt (có thể có bank từ hoặc không)
    | 'DiagramLabelling' // Ghi nhãn cho sơ đồ
    | 'ShortAnswer'

export interface BaseQuestion {
    id: string
    number: number // STT
    type: QuestionType
}

export interface TfnfQuestion extends BaseQuestion {
    type: 'TFNF'
    text: string
}

export interface McqQuestion extends BaseQuestion {
    type: 'MCQ'
    text: string
    options: { value: string; text: string }[]
    allowMultiple: boolean
}

export interface MatchingBaseQuestion extends BaseQuestion {
    type: 'MatchingHeadings' | 'MatchingFeatures'
    itemText: string
}

export interface MatchingSentenceEndingsQuestion extends BaseQuestion {
    type: 'MatchingSentenceEndings'
    itemText: string
}

export interface CompletionQuestion extends BaseQuestion {
    type: 'SentenceCompletion' | 'SummaryCompletion' | 'ShortAnswer'
    // "parts" sẽ chứa các phần của câu, null là vị trí điền
    parts: (string | null)[] // Ví dụ: ["The history of glass dates back to ", null, "."]
}

export interface DiagramLabellingQuestion extends BaseQuestion {
    type: 'DiagramLabelling'
    label: string
}

export type Question =
    | TfnfQuestion
    | McqQuestion
    | MatchingBaseQuestion
    | MatchingSentenceEndingsQuestion
    | CompletionQuestion
    | DiagramLabellingQuestion

// --- Cấu trúc Nhóm Câu hỏi và Bài đọc ---

/**
 * Một nhóm câu hỏi có chung hướng dẫn
 * Ví dụ: "Questions 1-5: T/F/NG"
 */
export interface QuestionGroup {
    id: string // ID duy nhất cho nhóm, ví dụ: "g1"
    instruction: string // Hướng dẫn làm bài cho nhóm này
    questionType: QuestionType // Loại câu hỏi chính của nhóm
    questions: Question[] // Danh sách các câu hỏi trong nhóm

    // Dữ liệu bổ sung cho các dạng Matching (ví dụ: bank từ/headings)
    optionsBank?: { value: string; text: string }[]
}

/**
 * Một bài đọc (Passage)
 */
export interface Passage {
    id: string // "p1"
    title: string
    content: string // Nội dung bài đọc (plain text, \n để xuống dòng)
    questionGroups: QuestionGroup[] // Các nhóm câu hỏi thuộc bài đọc này
}

/**
 * Toàn bộ dữ liệu bài thi Reading
 */
export interface ReadingTest {
    id: string // "test-id-01"
    title: string
    passages: Passage[]
    totalTimeSeconds: number
}
