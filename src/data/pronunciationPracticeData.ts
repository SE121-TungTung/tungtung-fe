// Dữ liệu ngân hàng từ điển phát âm phong phú, hỗ trợ US & UK IPA chuẩn xác

export interface PracticeItem {
    text: string
    targetType: 'word' | 'sentence' | 'paragraph'
    ipaUS: string
    ipaUK: string
    hint?: string
}

export interface RoadmapGroup {
    title: string
    items: PracticeItem[]
    targetType: 'word' | 'sentence' | 'paragraph'
}

export interface RoadmapLevel {
    id: number
    title: string
    subtitle: string
    description: string
    groups: RoadmapGroup[]
}

export interface PhonemeGroup {
    symbol: string
    name: string
    type: 'vowel' | 'consonant'
    description: string
    exampleWord: string
    words: PracticeItem[]
}

export interface DailyChallengeItem {
    id: string
    type: 'word' | 'sentence' | 'paragraph'
    label: string
    text: string
    ipaUS: string
    ipaUK: string
    hint: string
}

// 1. KHO TỪ ĐIỂN TỪ ĐƠN (WORDS DICTIONARY BANK)
export const DICTIONARY_WORDS: PracticeItem[] = [
    {
        text: 'comfortable',
        targetType: 'word',
        ipaUS: 'kˈʌmftəbəl',
        ipaUK: 'kˈʌmftəbəl',
        hint: 'Trọng âm rơi vào âm tiết đầu /kˈʌm/',
    },
    {
        text: 'architecture',
        targetType: 'word',
        ipaUS: 'ˈɑːrkɪtektʃər',
        ipaUK: 'ˈɑːkɪtektʃə',
        hint: 'US có âm /r/ uốn lưỡi, UK đọc âm /ə/ cuối',
    },
    {
        text: 'schedule',
        targetType: 'word',
        ipaUS: 'skˈɛdʒuːl',
        ipaUK: 'ʃˈɛdjuːl',
        hint: 'Khác biệt lớn: US bắt đầu bằng /sk/, UK bắt đầu bằng /ʃ/',
    },
    {
        text: 'water',
        targetType: 'word',
        ipaUS: 'wˈɔːɾɚ',
        ipaUK: 'wˈɔːtə',
        hint: 'US dùng Flap T /ɾ/, UK bật rõ /t/ và không có âm r',
    },
    {
        text: 'environment',
        targetType: 'word',
        ipaUS: 'ɪnˈvaɪrənmənt',
        ipaUK: 'ɪnˈvaɪərənmənt',
        hint: 'Trọng âm rơi vào âm tiết thứ hai',
    },
    {
        text: 'phenomenon',
        targetType: 'word',
        ipaUS: 'fəˈnɑːmɪnɑːn',
        ipaUK: 'fəˈnɒmɪnən',
        hint: 'US phát âm /ɑː/, UK phát âm /ɒ/',
    },
    {
        text: 'development',
        targetType: 'word',
        ipaUS: 'dɪˈvɛləpmənt',
        ipaUK: 'dɪˈvɛləpmənt',
        hint: 'Nhấn trọng âm vào âm thứ hai -vel-',
    },
    {
        text: 'technology',
        targetType: 'word',
        ipaUS: 'tɛkˈnɑːlədʒi',
        ipaUK: 'tɛkˈnɒlədʒi',
        hint: 'Âm ch đọc là /k/, trọng âm âm 2',
    },
    {
        text: 'pronunciation',
        targetType: 'word',
        ipaUS: 'prəˌnʌnsiˈeɪʃən',
        ipaUK: 'prəˌnʌnsiˈeɪʃən',
        hint: 'Chú ý là -nun- /nʌn/ chứ không phải -noun-',
    },
    {
        text: 'vocabulary',
        targetType: 'word',
        ipaUS: 'voʊˈkæbjəˌlɛri',
        ipaUK: 'vəˈkæbjʊləri',
        hint: 'US kết thúc bằng /-lɛri/, UK bằng /-ləri/',
    },
    {
        text: 'advertisement',
        targetType: 'word',
        ipaUS: 'ˌædvərˈtaɪzmənt',
        ipaUK: 'ədˈvɜːtɪsmənt',
        hint: 'Khác biệt trọng âm: US nhấn âm 1 và 3, UK nhấn âm 2',
    },
    {
        text: 'privacy',
        targetType: 'word',
        ipaUS: 'ˈpraɪvəsi',
        ipaUK: 'ˈprɪvəsi',
        hint: 'US đọc /praɪ/, UK đọc /prɪ/',
    },
    {
        text: 'neither',
        targetType: 'word',
        ipaUS: 'ˈniːðər',
        ipaUK: 'ˈnaɪðə',
        hint: 'US thường đọc /niː/, UK thường đọc /naɪ/',
    },
    {
        text: 'either',
        targetType: 'word',
        ipaUS: 'ˈiːðər',
        ipaUK: 'ˈaɪðə',
        hint: 'US thường đọc /iː/, UK thường đọc /aɪ/',
    },
    {
        text: 'tomato',
        targetType: 'word',
        ipaUS: 'təˈmeɪtoʊ',
        ipaUK: 'təˈmɑːtəʊ',
        hint: 'US đọc /meɪ/, UK đọc /mɑː/',
    },
    {
        text: 'banana',
        targetType: 'word',
        ipaUS: 'bəˈnænə',
        ipaUK: 'bəˈnɑːnə',
        hint: 'US đọc /næn/, UK đọc /nɑːn/',
    },
    {
        text: 'laboratory',
        targetType: 'word',
        ipaUS: 'ˈlæbrətɔːri',
        ipaUK: 'ləˈbɒrətəri',
        hint: 'US nhấn âm 1, UK nhấn âm 2',
    },
    {
        text: 'education',
        targetType: 'word',
        ipaUS: 'ˌɛdʒəˈkeɪʃən',
        ipaUK: 'ˌɛdjʊˈkeɪʃən',
        hint: 'US biến âm /dʒ/, UK giữ âm /dj/',
    },
    {
        text: 'enthusiasm',
        targetType: 'word',
        ipaUS: 'ɪnˈθuːziˌæzəm',
        ipaUK: 'ɪnˈθjuːziˌæzəm',
        hint: 'Luyện âm /θ/ thổi hơi',
    },
    {
        text: 'particularly',
        targetType: 'word',
        ipaUS: 'pərˈtɪkjələrli',
        ipaUK: 'pəˈtɪkjʊləli',
        hint: 'Từ nhiều âm tiết, chú ý uốn lưỡi',
    },
    {
        text: 'strengths',
        targetType: 'word',
        ipaUS: 'strɛŋkθs',
        ipaUK: 'strɛŋθs',
        hint: 'Cụm phụ âm cuối /ŋθs/ phức tạp',
    },
    {
        text: 'clothes',
        targetType: 'word',
        ipaUS: 'kloʊðz',
        ipaUK: 'kləʊðz',
        hint: 'Đọc nối /ðz/, không đọc thành hai âm tiết',
    },
    {
        text: 'months',
        targetType: 'word',
        ipaUS: 'mʌnθs',
        ipaUK: 'mʌnθs',
        hint: 'Bật âm /θ/ rồi xì /s/',
    },
    {
        text: 'breathes',
        targetType: 'word',
        ipaUS: 'briːðz',
        ipaUK: 'briːðz',
        hint: 'Động từ: âm /iː/ dài và /ðz/ rung',
    },
    {
        text: 'breath',
        targetType: 'word',
        ipaUS: 'brɛθ',
        ipaUK: 'brɛθ',
        hint: 'Danh từ: âm /ɛ/ ngắn và /θ/ thổi',
    },
    {
        text: 'sheep',
        targetType: 'word',
        ipaUS: 'ʃiːp',
        ipaUK: 'ʃiːp',
        hint: 'Âm /iː/ kéo dài, chu môi /ʃ/',
    },
    {
        text: 'ship',
        targetType: 'word',
        ipaUS: 'ʃɪp',
        ipaUK: 'ʃɪp',
        hint: 'Âm /ɪ/ ngắn và dứt khoát',
    },
    {
        text: 'think',
        targetType: 'word',
        ipaUS: 'θɪŋk',
        ipaUK: 'θɪŋk',
        hint: 'Lưỡi kẹp giữa răng, kết thúc bằng /ŋk/',
    },
    {
        text: 'sink',
        targetType: 'word',
        ipaUS: 'sɪŋk',
        ipaUK: 'sɪŋk',
        hint: 'Răng khép xì hơi /s/',
    },
    {
        text: 'bad',
        targetType: 'word',
        ipaUS: 'bæd',
        ipaUK: 'bæd',
        hint: 'Hạ hàm sâu âm a bẹt /æ/',
    },
    {
        text: 'bed',
        targetType: 'word',
        ipaUS: 'bɛd',
        ipaUK: 'bɛd',
        hint: 'Mở miệng vừa phải âm /ɛ/',
    },
]

// 2. KHO CÂU VÀ CỤM TỪ (SENTENCES & PHRASES BANK)
export const DICTIONARY_SENTENCES: PracticeItem[] = [
    {
        text: 'Could you please tell me how to get to the station?',
        targetType: 'sentence',
        ipaUS: 'kʊd juː pliːz tɛl miː haʊ tuː ɡɛt tuː ðə ˈsteɪʃən',
        ipaUK: 'kʊd juː pliːz tɛl miː haʊ tuː ɡɛt tuː ðə ˈsteɪʃən',
        hint: 'Câu hỏi Yes/No: lên giọng nhẹ ở từ cuối station',
    },
    {
        text: 'I usually spend my free time listening to acoustic music.',
        targetType: 'sentence',
        ipaUS: 'aɪ ˈjuːʒuəli spɛnd maɪ friː taɪm ˈlɪsənɪŋ tuː əˈkuːstɪk ˈmjuːzɪk',
        ipaUK: 'aɪ ˈjuːʒʊəli spɛnd maɪ friː taɪm ˈlɪsnɪŋ tuː əˈkuːstɪk ˈmjuːzɪk',
        hint: 'Nhấn mạnh từ khóa free time, acoustic music',
    },
    {
        text: 'The weather today is much warmer than yesterday.',
        targetType: 'sentence',
        ipaUS: 'ðə ˈwɛðər təˈdeɪ ɪz mʌtʃ ˈwɔːrmər ðæn ˈjɛstərˌdeɪ',
        ipaUK: 'ðə ˈwɛðə təˈdeɪ ɪz mʌtʃ ˈwɔːmə ðæn ˈjɛstədeɪ',
        hint: 'US có âm r trong warmer và yesterday, UK thả lỏng âm ə',
    },
    {
        text: 'To be perfectly honest, I have always had a strong passion for art.',
        targetType: 'sentence',
        ipaUS: 'tuː biː ˈpɜːrfɪktli ˈɑːnɪst aɪ hæv ˈɔːlweɪz hæd ə strɔːŋ ˈpæʃən fɔːr ɑːrt',
        ipaUK: 'tuː biː ˈpɜːfɪktli ˈɒnɪst aɪ hæv ˈɔːlweɪz hæd ə strɒŋ ˈpæʃən fɔːr ɑːt',
        hint: 'Ngắt nhịp tự nhiên sau cụm perfectly honest',
    },
    {
        text: 'From my perspective, technological advancement plays a crucial role in modern life.',
        targetType: 'sentence',
        ipaUS: 'frʌm maɪ pərˈspɛktɪv ˌtɛknəˈlɑːdʒɪkəl ədˈvænsmənt pleɪz ə ˈkruːʃəl roʊl ɪn ˈmɑːdərn laɪf',
        ipaUK: 'frɒm maɪ pəˈspɛktɪv ˌtɛknəˈlɒdʒɪkəl ədˈvɑːnsmənt pleɪz ə ˈkruːʃəl rəʊl ɪn ˈmɒdən laɪf',
        hint: 'US: advancement /ædˈvæns-/, UK: advancement /ədˈvɑːns-/',
    },
    {
        text: 'I am firmly convinced that regular exercise brings tremendous health benefits.',
        targetType: 'sentence',
        ipaUS: 'aɪ æm ˈfɜːrmli kənˈvɪnst ðæt ˈrɛɡjələr ˈɛksərˌsaɪz brɪŋz trəˈmɛndəs hɛlθ ˈbɛnəfɪts',
        ipaUK: 'aɪ æm ˈfɜːmli kənˈvɪnst ðæt ˈrɛɡjʊlə ˈɛksəsaɪz brɪŋz trɪˈmɛndəs hɛlθ ˈbɛnɪfɪts',
        hint: 'Nối âm: brings_tremendous, health_benefits',
    },
    {
        text: 'Pick it up and turn off the light right now.',
        targetType: 'sentence',
        ipaUS: 'pɪk ɪt ʌp ænd tɜːrn ɔːf ðə laɪt raɪt naʊ',
        ipaUK: 'pɪk ɪt ʌp ænd tɜːn ɒf ðə laɪt raɪt naʊ',
        hint: 'Nối âm liên tục C+V: /pɪ-kɪ-tʌp/ và /tɜːr-nɔːf/',
    },
    {
        text: 'An apple a day keeps the doctor away.',
        targetType: 'sentence',
        ipaUS: 'æn ˈæpəl ə deɪ kiːps ðə ˈdɑːktər əˈweɪ',
        ipaUK: 'ən ˈæpl ə deɪ kiːps ðə ˈdɒktə əˈweɪ',
        hint: 'Nối âm chuỗi: an_apple_a_day /ə-næ-plə-deɪ/',
    },
    {
        text: 'Hold on for a second, let me check the schedule.',
        targetType: 'sentence',
        ipaUS: 'hoʊld ɑːn fɔːr ə ˈsɛkənd lɛt miː tʃɛk ðə skˈɛdʒuːl',
        ipaUK: 'həʊld ɒn fɔːr ə ˈsɛkənd lɛt miː tʃɛk ðə ʃˈɛdjuːl',
        hint: 'Nối âm hold_on; schedule: US /sk/ vs UK /ʃ/',
    },
    {
        text: 'Are you interested in learning new foreign languages?',
        targetType: 'sentence',
        ipaUS: 'ɑːr juː ˈɪntrəstɪd ɪn ˈlɜːrnɪŋ nuː ˈfɔːrən ˈlæŋɡwɪdʒɪz',
        ipaUK: 'ɑː juː ˈɪntrəstɪd ɪn ˈlɜːnɪŋ njuː ˈfɒrɪn ˈlæŋɡwɪdʒɪz',
        hint: 'Câu hỏi Yes/No: lên giọng rõ ở cuối câu languages',
    },
]

// Tra cứu nhanh IPA (US và UK) cho một câu hoặc từ bất kỳ
export function findIpaForText(text: string): { us: string; uk: string } {
    if (!text) return { us: '', uk: '' }

    const clean = text.trim().toLowerCase()

    // 1. Tìm trong kho từ đơn
    const foundWord = DICTIONARY_WORDS.find(
        (w) => w.text.toLowerCase() === clean
    )
    if (foundWord) return { us: foundWord.ipaUS, uk: foundWord.ipaUK }

    // 2. Tìm trong kho câu
    const foundSentence = DICTIONARY_SENTENCES.find(
        (s) => s.text.toLowerCase() === clean
    )
    if (foundSentence)
        return { us: foundSentence.ipaUS, uk: foundSentence.ipaUK }

    // 3. Fallback ghép IPA từ các từ đơn nếu có
    const words = clean.split(/\s+/)
    if (words.length > 1) {
        const usList: string[] = []
        const ukList: string[] = []
        for (const w of words) {
            const m = DICTIONARY_WORDS.find(
                (dw) => dw.text.toLowerCase() === w.replace(/[^a-z']/g, '')
            )
            if (m) {
                usList.push(m.ipaUS)
                ukList.push(m.ipaUK)
            } else {
                usList.push(w)
                ukList.push(w)
            }
        }
        return { us: usList.join(' '), uk: ukList.join(' ') }
    }

    return { us: text, uk: text }
}

// Lấy một mẻ từ ngẫu nhiên hoàn toàn mới từ kho từ điển (Đổi cả list)
export function getRandomDictionaryBatch(
    type: 'word' | 'sentence' | 'paragraph',
    count = 10
): PracticeItem[] {
    const pool = type === 'sentence' ? DICTIONARY_SENTENCES : DICTIONARY_WORDS
    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, Math.min(count, pool.length))
}

// Lấy danh sách từ theo âm vị có shuffle
export function getRandomPhonemeWords(
    symbol: string,
    count = 10
): PracticeItem[] {
    const group = PHONEME_GROUPS.find((g) => g.symbol === symbol)
    if (!group) return DICTIONARY_WORDS.slice(0, count)

    const shuffled = [...group.words].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
}

// 3. DANH SÁCH LỘ TRÌNH 4 CẤP ĐỘ
export const ROADMAP_LEVELS: RoadmapLevel[] = [
    {
        id: 1,
        title: 'Cấp 1: Chuẩn Hóa 44 Âm IPA',
        subtitle: 'Cặp âm đối lập dễ nhầm lẫn (Minimal Pairs)',
        description:
            'Luyện chuẩn các âm nguyên âm ngắn/dài và phụ âm đặc thù trong tiếng Anh.',
        groups: [
            {
                title: 'Nguyên âm /iː/ (dài) vs /ɪ/ (ngắn)',
                targetType: 'word',
                items: [
                    {
                        text: 'sheep',
                        targetType: 'word',
                        ipaUS: 'ʃiːp',
                        ipaUK: 'ʃiːp',
                    },
                    {
                        text: 'ship',
                        targetType: 'word',
                        ipaUS: 'ʃɪp',
                        ipaUK: 'ʃɪp',
                    },
                    {
                        text: 'green',
                        targetType: 'word',
                        ipaUS: 'ɡriːn',
                        ipaUK: 'ɡriːn',
                    },
                    {
                        text: 'clean',
                        targetType: 'word',
                        ipaUS: 'kliːn',
                        ipaUK: 'kliːn',
                    },
                    {
                        text: 'fit',
                        targetType: 'word',
                        ipaUS: 'fɪt',
                        ipaUK: 'fɪt',
                    },
                    {
                        text: 'sit',
                        targetType: 'word',
                        ipaUS: 'sɪt',
                        ipaUK: 'sɪt',
                    },
                ],
            },
            {
                title: 'Nguyên âm /e/ vs /æ/ (bẹt)',
                targetType: 'word',
                items: [
                    {
                        text: 'bed',
                        targetType: 'word',
                        ipaUS: 'bɛd',
                        ipaUK: 'bɛd',
                    },
                    {
                        text: 'bad',
                        targetType: 'word',
                        ipaUS: 'bæd',
                        ipaUK: 'bæd',
                    },
                    {
                        text: 'pen',
                        targetType: 'word',
                        ipaUS: 'pɛn',
                        ipaUK: 'pɛn',
                    },
                    {
                        text: 'pan',
                        targetType: 'word',
                        ipaUS: 'pæn',
                        ipaUK: 'pæn',
                    },
                ],
            },
            {
                title: 'Phụ âm /θ/ vs /s/',
                targetType: 'word',
                items: [
                    {
                        text: 'think',
                        targetType: 'word',
                        ipaUS: 'θɪŋk',
                        ipaUK: 'θɪŋk',
                    },
                    {
                        text: 'sink',
                        targetType: 'word',
                        ipaUS: 'sɪŋk',
                        ipaUK: 'sɪŋk',
                    },
                    {
                        text: 'three',
                        targetType: 'word',
                        ipaUS: 'θriː',
                        ipaUK: 'θriː',
                    },
                    {
                        text: 'tree',
                        targetType: 'word',
                        ipaUS: 'triː',
                        ipaUK: 'triː',
                    },
                ],
            },
        ],
    },
    {
        id: 2,
        title: 'Cấp 2: Trọng Âm Từ & Nhịp Điệu (Word Stress)',
        subtitle: 'Làm chủ trọng âm 2, 3, 4 âm tiết trong IELTS',
        description:
            'Nâng cao độ chính xác khi phát âm từ học thuật nhiều âm tiết.',
        groups: [
            {
                title: 'Từ 2 âm tiết (Danh từ vs Động từ)',
                targetType: 'word',
                items: [
                    {
                        text: 'record',
                        targetType: 'word',
                        ipaUS: 'ˈrɛkərd',
                        ipaUK: 'ˈrɛkɔːd',
                    },
                    {
                        text: 'present',
                        targetType: 'word',
                        ipaUS: 'ˈprɛzənt',
                        ipaUK: 'ˈprɛznt',
                    },
                    {
                        text: 'contrast',
                        targetType: 'word',
                        ipaUS: 'ˈkɑːntræst',
                        ipaUK: 'ˈkɒntrɑːst',
                    },
                    {
                        text: 'increase',
                        targetType: 'word',
                        ipaUS: 'ˈɪnkriːs',
                        ipaUK: 'ˈɪnkriːs',
                    },
                ],
            },
            {
                title: 'Từ 3-4+ âm tiết học thuật IELTS',
                targetType: 'word',
                items: [
                    {
                        text: 'comfortable',
                        targetType: 'word',
                        ipaUS: 'kˈʌmftəbəl',
                        ipaUK: 'kˈʌmftəbəl',
                    },
                    {
                        text: 'architecture',
                        targetType: 'word',
                        ipaUS: 'ˈɑːrkɪtektʃər',
                        ipaUK: 'ˈɑːkɪtektʃə',
                    },
                    {
                        text: 'environment',
                        targetType: 'word',
                        ipaUS: 'ɪnˈvaɪrənmənt',
                        ipaUK: 'ɪnˈvaɪərənmənt',
                    },
                    {
                        text: 'phenomenon',
                        targetType: 'word',
                        ipaUS: 'fəˈnɑːmɪnɑːn',
                        ipaUK: 'fəˈnɒmɪnən',
                    },
                    {
                        text: 'development',
                        targetType: 'word',
                        ipaUS: 'dɪˈvɛləpmənt',
                        ipaUK: 'dɪˈvɛləpmənt',
                    },
                ],
            },
        ],
    },
    {
        id: 3,
        title: 'Cấp 3: Nối Âm & Biến Âm (Connected Speech)',
        subtitle: 'Phát âm trôi chảy và tự nhiên như người bản xứ',
        description:
            'Quy tắc nối phụ âm - nguyên âm (C+V), âm chèn và nuốt âm.',
        groups: [
            {
                title: 'Nối phụ âm sang nguyên âm (Consonant to Vowel)',
                targetType: 'sentence',
                items: [
                    {
                        text: 'pick it up',
                        targetType: 'sentence',
                        ipaUS: 'pɪk ɪt ʌp',
                        ipaUK: 'pɪk ɪt ʌp',
                    },
                    {
                        text: 'an apple a day',
                        targetType: 'sentence',
                        ipaUS: 'æn ˈæpəl ə deɪ',
                        ipaUK: 'ən ˈæpl ə deɪ',
                    },
                    {
                        text: 'hold on a second',
                        targetType: 'sentence',
                        ipaUS: 'hoʊld ɑːn ə ˈsɛkənd',
                        ipaUK: 'həʊld ɒn ə ˈsɛkənd',
                    },
                    {
                        text: 'turn off the television',
                        targetType: 'sentence',
                        ipaUS: 'tɜːrn ɔːf ðə ˈtɛləˌvɪʒən',
                        ipaUK: 'tɜːn ɒf ðə ˈtɛlɪˌvɪʒn',
                    },
                ],
            },
        ],
    },
    {
        id: 4,
        title: 'Cấp 4: Ngữ Điệu & Chia Nhịp IELTS Speaking',
        subtitle: 'Chinh phục Band 7.0+ Pronunciation & Fluency',
        description:
            'Luyện ngắt nhịp (Chunking), trọng âm câu và ngữ điệu câu hỏi.',
        groups: [
            {
                title: 'Ngữ điệu câu hỏi & Cụm diễn đạt điểm cao',
                targetType: 'sentence',
                items: [
                    {
                        text: 'Could you please tell me how to get to the station?',
                        targetType: 'sentence',
                        ipaUS: 'kʊd juː pliːz tɛl miː haʊ tuː ɡɛt tuː ðə ˈsteɪʃən',
                        ipaUK: 'kʊd juː pliːz tɛl miː haʊ tuː ɡɛt tuː ðə ˈsteɪʃən',
                    },
                    {
                        text: 'To be perfectly honest, I have always had a strong passion for art.',
                        targetType: 'sentence',
                        ipaUS: 'tuː biː ˈpɜːrfɪktli ˈɑːnɪst aɪ hæv ˈɔːlweɪz hæd ə strɔːŋ ˈpæʃən fɔːr ɑːrt',
                        ipaUK: 'tuː biː ˈpɜːfɪktli ˈɒnɪst aɪ hæv ˈɔːlweɪz hæd ə strɒŋ ˈpæʃən fɔːr ɑːt',
                    },
                    {
                        text: 'From my perspective, technological advancement plays a crucial role in modern life.',
                        targetType: 'sentence',
                        ipaUS: 'frʌm maɪ pərˈspɛktɪv ˌtɛknəˈlɑːdʒɪkəl ədˈvænsmənt pleɪz ə ˈkruːʃəl roʊl ɪn ˈmɑːdərn laɪf',
                        ipaUK: 'frɒm maɪ pəˈspɛktɪv ˌtɛknəˈlɒdʒɪkəl ədˈvɑːnsmənt pleɪz ə ˈkruːʃəl rəʊl ɪn ˈmɒdən laɪf',
                    },
                ],
            },
        ],
    },
]

// 4. DANH SÁCH ÂM VỊ & KHO TỪ KÈM US & UK IPA
export const PHONEME_GROUPS: PhonemeGroup[] = [
    {
        symbol: '/θ/',
        name: 'Âm Th thổi (Voiceless TH)',
        type: 'consonant',
        description:
            'Đặt đầu lưỡi giữa hai hàm răng và đẩy luồng hơi ra, không rung dây thanh quản.',
        exampleWord: 'think',
        words: [
            { text: 'think', targetType: 'word', ipaUS: 'θɪŋk', ipaUK: 'θɪŋk' },
            { text: 'thank', targetType: 'word', ipaUS: 'θæŋk', ipaUK: 'θæŋk' },
            { text: 'three', targetType: 'word', ipaUS: 'θriː', ipaUK: 'θriː' },
            {
                text: 'through',
                targetType: 'word',
                ipaUS: 'θruː',
                ipaUK: 'θruː',
            },
            { text: 'bath', targetType: 'word', ipaUS: 'bæθ', ipaUK: 'bɑːθ' },
            { text: 'mouth', targetType: 'word', ipaUS: 'maʊθ', ipaUK: 'maʊθ' },
            {
                text: 'healthy',
                targetType: 'word',
                ipaUS: 'ˈhɛlθi',
                ipaUK: 'ˈhɛlθi',
            },
            {
                text: 'author',
                targetType: 'word',
                ipaUS: 'ˈɔːθər',
                ipaUK: 'ˈɔːθə',
            },
        ],
    },
    {
        symbol: '/ð/',
        name: 'Âm Th rung (Voiced TH)',
        type: 'consonant',
        description:
            'Đặt đầu lưỡi giữa hai hàm răng, đẩy hơi ra và rung mạnh dây thanh quản.',
        exampleWord: 'this',
        words: [
            { text: 'this', targetType: 'word', ipaUS: 'ðɪs', ipaUK: 'ðɪs' },
            { text: 'that', targetType: 'word', ipaUS: 'ðæt', ipaUK: 'ðæt' },
            { text: 'these', targetType: 'word', ipaUS: 'ðiːz', ipaUK: 'ðiːz' },
            { text: 'those', targetType: 'word', ipaUS: 'ðoʊz', ipaUK: 'ðəʊz' },
            {
                text: 'weather',
                targetType: 'word',
                ipaUS: 'ˈwɛðər',
                ipaUK: 'ˈwɛðə',
            },
            {
                text: 'together',
                targetType: 'word',
                ipaUS: 'təˈɡɛðər',
                ipaUK: 'təˈɡɛðə',
            },
            {
                text: 'breathe',
                targetType: 'word',
                ipaUS: 'briːð',
                ipaUK: 'briːð',
            },
            {
                text: 'smooth',
                targetType: 'word',
                ipaUS: 'smuːð',
                ipaUK: 'smuːð',
            },
        ],
    },
    {
        symbol: '/iː/',
        name: 'Nguyên âm e dài (Long E)',
        type: 'vowel',
        description:
            'Môi kéo sang hai bên như cười nhẹ, giữ âm căng và ngân dài.',
        exampleWord: 'sheep',
        words: [
            { text: 'sheep', targetType: 'word', ipaUS: 'ʃiːp', ipaUK: 'ʃiːp' },
            {
                text: 'green',
                targetType: 'word',
                ipaUS: 'ɡriːn',
                ipaUK: 'ɡriːn',
            },
            {
                text: 'clean',
                targetType: 'word',
                ipaUS: 'kliːn',
                ipaUK: 'kliːn',
            },
            {
                text: 'beach',
                targetType: 'word',
                ipaUS: 'biːtʃ',
                ipaUK: 'biːtʃ',
            },
            { text: 'peace', targetType: 'word', ipaUS: 'piːs', ipaUK: 'piːs' },
            {
                text: 'receive',
                targetType: 'word',
                ipaUS: 'rɪˈsiːv',
                ipaUK: 'rɪˈsiːv',
            },
        ],
    },
    {
        symbol: '/ɪ/',
        name: 'Nguyên âm i ngắn (Short I)',
        type: 'vowel',
        description: 'Môi thư giãn, mở hờ, phát âm dứt khoát nửa i nửa ê.',
        exampleWord: 'ship',
        words: [
            { text: 'ship', targetType: 'word', ipaUS: 'ʃɪp', ipaUK: 'ʃɪp' },
            { text: 'sit', targetType: 'word', ipaUS: 'sɪt', ipaUK: 'sɪt' },
            { text: 'fit', targetType: 'word', ipaUS: 'fɪt', ipaUK: 'fɪt' },
            { text: 'live', targetType: 'word', ipaUS: 'lɪv', ipaUK: 'lɪv' },
            {
                text: 'minute',
                targetType: 'word',
                ipaUS: 'ˈmɪnɪt',
                ipaUK: 'ˈmɪnɪt',
            },
            {
                text: 'business',
                targetType: 'word',
                ipaUS: 'ˈbɪznɪs',
                ipaUK: 'ˈbɪznɪs',
            },
        ],
    },
    {
        symbol: '/æ/',
        name: 'Nguyên âm a bẹt (Ash)',
        type: 'vowel',
        description:
            'Hạ hàm dưới xuống sâu, miệng mở rộng hết cỡ sang hai bên.',
        exampleWord: 'bad',
        words: [
            { text: 'bad', targetType: 'word', ipaUS: 'bæd', ipaUK: 'bæd' },
            { text: 'cat', targetType: 'word', ipaUS: 'kæt', ipaUK: 'kæt' },
            {
                text: 'apple',
                targetType: 'word',
                ipaUS: 'ˈæpəl',
                ipaUK: 'ˈæpl',
            },
            {
                text: 'action',
                targetType: 'word',
                ipaUS: 'ˈækʃən',
                ipaUK: 'ˈækʃn',
            },
            {
                text: 'family',
                targetType: 'word',
                ipaUS: 'ˈfæməli',
                ipaUK: 'ˈfæməli',
            },
            {
                text: 'practice',
                targetType: 'word',
                ipaUS: 'ˈpræktɪs',
                ipaUK: 'ˈpræktɪs',
            },
        ],
    },
]

// 5. THỬ THÁCH HÀNG NGÀY (DAILY PRACTICE GENERATOR)
export function getDailyChallenge(seedOffset = 0): DailyChallengeItem[] {
    const today = new Date()
    const dayOfYear =
        Math.floor(
            (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
                1000 /
                60 /
                60 /
                24
        ) + seedOffset

    const wordList = DICTIONARY_WORDS
    const sentenceList = DICTIONARY_SENTENCES

    const w = wordList[Math.abs(dayOfYear) % wordList.length]
    const p = sentenceList[Math.abs(dayOfYear + 1) % sentenceList.length]
    const s = sentenceList[Math.abs(dayOfYear + 3) % sentenceList.length]

    return [
        {
            id: `daily_word_${w.text}`,
            type: 'word',
            label: 'Từ vựng âm vị hôm nay',
            text: w.text,
            ipaUS: w.ipaUS,
            ipaUK: w.ipaUK,
            hint: w.hint || 'Chú ý phát âm rõ trọng âm và phụ âm cuối.',
        },
        {
            id: `daily_phrase_${p.text}`,
            type: 'sentence',
            label: 'Cụm từ nối âm hôm nay',
            text: p.text,
            ipaUS: p.ipaUS,
            ipaUK: p.ipaUK,
            hint: p.hint || 'Chú ý nối phụ âm sang nguyên âm (C+V).',
        },
        {
            id: `daily_sentence_${s.text}`,
            type: 'sentence',
            label: 'Câu phản xạ IELTS hôm nay',
            text: s.text,
            ipaUS: s.ipaUS,
            ipaUK: s.ipaUK,
            hint: s.hint || 'Chú ý trọng âm câu và ngữ điệu lên/xuống.',
        },
    ]
}
