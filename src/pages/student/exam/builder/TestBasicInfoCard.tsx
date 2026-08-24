import Card from '@/components/common/card/Card'
import InputField from '@/components/common/input/InputField'
import { SelectField } from '@/components/common/input/SelectField'
import { TestType } from '@/types/test.types'
import type { TestBasicInfo } from './types'
import s from '../CreateTestPage.module.css'

interface TestBasicInfoCardProps {
    basicInfo: TestBasicInfo
    onChange: (data: Partial<TestBasicInfo>) => void
}

export default function TestBasicInfoCard({
    basicInfo,
    onChange,
}: TestBasicInfoCardProps) {
    return (
        <Card title="Thông tin cơ bản" variant="outline">
            <div className={s.formGrid}>
                <InputField
                    label="Tiêu đề"
                    required={true}
                    type="text"
                    value={basicInfo.title}
                    onChange={(e) => onChange({ title: e.target.value })}
                    placeholder="VD: IELTS Reading Practice Test 1"
                />

                <SelectField
                    label="Loại bài thi"
                    value={basicInfo.testType || ''}
                    onChange={(e) =>
                        onChange({
                            testType: (e.target.value as TestType) || null,
                        })
                    }
                    options={Object.values(TestType).map((type) => ({
                        label: type
                            .toLowerCase()
                            .replace(/_/g, ' ')
                            .replace(/\b\w/g, (char) => char.toUpperCase()),
                        value: type,
                    }))}
                />

                <InputField
                    label="Thời gian (phút)"
                    type="number"
                    value={basicInfo.timeLimitMinutes}
                    onChange={(e) =>
                        onChange({
                            timeLimitMinutes: parseInt(e.target.value) || 0,
                        })
                    }
                    min="1"
                />

                <InputField
                    label="Điểm đạt (%)"
                    type="number"
                    value={basicInfo.passingScore}
                    onChange={(e) =>
                        onChange({
                            passingScore: parseInt(e.target.value) || 0,
                        })
                    }
                    min="0"
                    max="100"
                />

                <InputField
                    label="Số lần làm tối đa"
                    type="number"
                    value={basicInfo.maxAttempts}
                    onChange={(e) =>
                        onChange({
                            maxAttempts: parseInt(e.target.value) || 1,
                        })
                    }
                    min="1"
                />

                <InputField
                    label="Thời gian mở"
                    type="datetime-local"
                    value={basicInfo.startTime}
                    onChange={(e) => onChange({ startTime: e.target.value })}
                />

                <InputField
                    label="Thời gian đóng"
                    type="datetime-local"
                    value={basicInfo.endTime}
                    onChange={(e) => onChange({ endTime: e.target.value })}
                />

                <InputField
                    label="Mô tả"
                    multiline={true}
                    value={basicInfo.description}
                    onChange={(e) => onChange({ description: e.target.value })}
                    placeholder="Mô tả về bài thi..."
                />

                <InputField
                    label="Hướng dẫn"
                    multiline={true}
                    enableMarkdown={true}
                    value={basicInfo.instructions}
                    onChange={(e) => onChange({ instructions: e.target.value })}
                    placeholder="Hướng dẫn làm bài..."
                />

                <div className={s.checkboxField}>
                    <label className={s.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={basicInfo.randomizeQuestions}
                            onChange={(e) =>
                                onChange({
                                    randomizeQuestions: e.target.checked,
                                })
                            }
                        />
                        <span>Xáo trộn thứ tự câu hỏi</span>
                    </label>
                </div>

                <div className={s.checkboxField}>
                    <label className={s.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={basicInfo.showResultsImmediately}
                            onChange={(e) =>
                                onChange({
                                    showResultsImmediately: e.target.checked,
                                })
                            }
                        />
                        <span>Hiển thị kết quả ngay</span>
                    </label>
                </div>

                <div className={s.checkboxField}>
                    <label className={s.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={basicInfo.aiGradingEnabled}
                            onChange={(e) =>
                                onChange({
                                    aiGradingEnabled: e.target.checked,
                                })
                            }
                        />
                        <span>Bật chấm điểm AI (Essay/Speaking)</span>
                    </label>
                </div>
            </div>
        </Card>
    )
}
