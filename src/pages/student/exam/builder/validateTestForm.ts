import { SkillArea } from '@/types/test.types'
import type { TestSectionCreatePayload } from '@/types/test.types'
import type { TestBasicInfo } from './types'

export function validateTestForm(
    basicInfo: TestBasicInfo,
    sections: TestSectionCreatePayload[],
    alertFn: (msg: string) => void
): boolean {
    if (!basicInfo.title.trim()) {
        alertFn('Vui lòng nhập tiêu đề bài thi')
        return false
    }

    if (sections.length === 0) {
        alertFn('Vui lòng thêm ít nhất 1 section')
        return false
    }

    for (const section of sections) {
        if (section.parts.length === 0) {
            alertFn(`Section "${section.name}" chưa có part nào`)
            return false
        }

        for (const part of section.parts) {
            if (!part.passage?.text_content?.trim()) {
                alertFn(`Part "${part.name}" chưa có nội dung passage`)
                return false
            }

            if (
                section.skill_area === SkillArea.LISTENING &&
                !part.passage?.audio_url?.trim()
            ) {
                alertFn(`Part "${part.name}" (Listening) chưa có audio URL`)
                return false
            }

            if (part.question_groups.length === 0) {
                alertFn(`Part "${part.name}" chưa có question group nào`)
                return false
            }

            for (const group of part.question_groups) {
                if (group.questions.length === 0) {
                    alertFn(
                        `Question group "${group.name}" chưa có câu hỏi nào`
                    )
                    return false
                }

                for (const question of group.questions) {
                    if (!question.question_text.trim()) {
                        alertFn(
                            `Có câu hỏi chưa nhập nội dung trong group "${group.name}"`
                        )
                        return false
                    }
                }
            }
        }
    }

    return true
}
