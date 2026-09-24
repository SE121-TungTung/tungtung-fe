import type { IPAPhonemeInfo } from '@/types/pronunciation.types'

export const IPA_PHONEMES: IPAPhonemeInfo[] = [
    // -------------------------------------------------------------------------
    // 1. NGUYÊN ÂM ĐƠN (12 MONOPHTHONGS)
    // -------------------------------------------------------------------------
    {
        symbol: 'iː',
        ipa: '/iː/',
        category: 'monophthong',
        name: 'Long i',
        sampleWord: 'sheep',
        sampleTranscription: '/ʃiːp/',
        voicing: 'vowel',
        mouthGuide: {
            lips: 'Môi bè rộng sang hai bên như đang cười mỉm',
            tongue: 'Thân lưỡi nâng cao về phía vòm họng trước, đầu lưỡi chạm chân răng dưới',
            jaw: 'Hàm trên và hàm dưới khép gần sát nhau',
            technique: 'Phát âm ngân dài gấp đôi âm /ɪ/, thanh quản rung rõ.',
        },
        mouthDiagramType: 'close_front',
        commonMistakes:
            'Phát âm quá ngắn hoặc mở hàm quá rộng khiến âm biến thành /ɪ/.',
    },
    {
        symbol: 'ɪ',
        ipa: '/ɪ/',
        category: 'monophthong',
        name: 'Short i',
        sampleWord: 'ship',
        sampleTranscription: '/ʃɪp/',
        voicing: 'vowel',
        mouthGuide: {
            lips: 'Môi thư giãn tự nhiên, hơi mở nhẹ',
            tongue: 'Thân lưỡi hơi nâng nhẹ nhưng thấp hơn âm /iː/',
            jaw: 'Hàm hạ thấp hơn so với âm /iː/',
            technique:
                'Bật hơi dứt khoát, âm phát ra ngắn và dứt khoát (khoảng nửa giây).',
        },
        mouthDiagramType: 'close_front',
        commonMistakes:
            'Kéo dài âm giống /iː/ hoặc phát âm giống hẳn âm "i" tiếng Việt.',
    },
    {
        symbol: 'ʊ',
        ipa: '/ʊ/',
        category: 'monophthong',
        name: 'Short u',
        sampleWord: 'good',
        sampleTranscription: '/ɡʊd/',
        voicing: 'vowel',
        mouthGuide: {
            lips: 'Môi hơi tròn nhẹ, thư giãn, không chu quá mức',
            tongue: 'Cuống lưỡi nâng nhẹ về phía sau vòm họng mềm',
            jaw: 'Hàm mở vừa phải, thoải mái',
            technique: 'Phát âm ngắn, gọn và dứt khoát từ sâu trong cổ họng.',
        },
        mouthDiagramType: 'close_back',
        commonMistakes:
            'Chu môi quá chặt làm thành âm /uː/ hoặc đọc thành âm "u" tiếng Việt.',
    },
    {
        symbol: 'uː',
        ipa: '/uː/',
        category: 'monophthong',
        name: 'Long u',
        sampleWord: 'shoot',
        sampleTranscription: '/ʃuːt/',
        voicing: 'vowel',
        mouthGuide: {
            lips: 'Môi chu tròn rõ rệt về phía trước tạo thành vòng tròn nhỏ',
            tongue: 'Cuống lưỡi nâng cao tối đa về phía vòm miệng gà sau',
            jaw: 'Hàm nâng cao, miệng khép gần như hoàn toàn',
            technique: 'Đẩy hơi liên tục, kéo dài âm /u/ sâu trong cổ họng.',
        },
        mouthDiagramType: 'close_back',
        commonMistakes:
            'Không chu môi tròn đủ chặt khiến âm bị nông và thiếu chiều sâu.',
    },
    {
        symbol: 'e',
        ipa: '/e/',
        category: 'monophthong',
        name: 'Short e',
        sampleWord: 'bed',
        sampleTranscription: '/bed/',
        voicing: 'vowel',
        mouthGuide: {
            lips: 'Môi mở rộng vừa phải, hơi bè sang hai bên',
            tongue: 'Thân lưỡi đặt ở vị trí trung bình, giữa vòm miệng',
            jaw: 'Hàm hạ vừa phải, mở rộng hơn âm /ɪ/',
            technique: 'Phát âm dứt khoát, ngắn gọn, tự nhiên như âm "e" nhẹ.',
        },
        mouthDiagramType: 'close_front',
        commonMistakes:
            'Hạ hàm quá sâu làm nhầm sang âm /æ/, hoặc khép miệng quá hẹp.',
    },
    {
        symbol: 'ə',
        ipa: '/ə/',
        category: 'monophthong',
        name: 'Schwa',
        sampleWord: 'teacher',
        sampleTranscription: '/ˈtiːtʃə(r)/',
        voicing: 'vowel',
        mouthGuide: {
            lips: 'Môi thả lỏng hoàn toàn, không chu cũng không bè',
            tongue: 'Lưỡi đặt thả lỏng tự nhiên ở giữa khoang miệng',
            jaw: 'Hàm mở tự nhiên, hoàn toàn thư giãn',
            technique:
                'Âm phổ biến nhất tiếng Anh, luôn không nhận trọng âm, đọc rất nhẹ và lướt.',
        },
        mouthDiagramType: 'mid_central',
        commonMistakes:
            'Nhấn mạnh vào âm schwa hoặc phát âm rõ thành "ơ" hay "a".',
    },
    {
        symbol: 'ɜː',
        ipa: '/ɜː/',
        category: 'monophthong',
        name: 'Long er / ir',
        sampleWord: 'bird',
        sampleTranscription: '/bɜːd/',
        voicing: 'vowel',
        mouthGuide: {
            lips: 'Môi mở hẹp, hơi mở tự nhiên',
            tongue: 'Thân lưỡi nâng nhẹ ở giữa vòm miệng, đầu lưỡi hơi cong nhẹ (nếu phát âm giọng Mỹ)',
            jaw: 'Hàm mở hẹp',
            technique:
                'Ngân dài âm đều đặn, hơi phát ra từ vòm họng trung tâm.',
        },
        mouthDiagramType: 'mid_central',
        commonMistakes:
            'Phát âm ngắn hoặc không giữ ổn định vị trí lưỡi suốt âm.',
    },
    {
        symbol: 'ɔː',
        ipa: '/ɔː/',
        category: 'monophthong',
        name: 'Long aw / or',
        sampleWord: 'door',
        sampleTranscription: '/dɔː(r)/',
        voicing: 'vowel',
        mouthGuide: {
            lips: 'Môi tròn rõ rệt, hơi nhô ra phía trước',
            tongue: 'Cuống lưỡi hạ thấp và co nhẹ về phía sau cuống họng',
            jaw: 'Hàm hạ xuống trung bình',
            technique: 'Phát âm ngân dài âm "o" sâu, thanh quản rung đều đặn.',
        },
        mouthDiagramType: 'open_back',
        commonMistakes:
            'Không tròn môi hoặc phát âm quá ngắn giống âm "o" tiếng Việt.',
    },
    {
        symbol: 'æ',
        ipa: '/æ/',
        category: 'monophthong',
        name: 'Short a (cat)',
        sampleWord: 'cat',
        sampleTranscription: '/kæt/',
        voicing: 'vowel',
        mouthGuide: {
            lips: 'Môi mở rộng hết cỡ cả về chiều ngang lẫn chiều dọc',
            tongue: 'Lưỡi ép dẹp thấp xuống sàn miệng, đầu lưỡi tì vào mặt trong răng dưới',
            jaw: 'Hàm hạ xuống thấp nhất có thể',
            technique:
                'Kết hợp giữa âm "a" và "e", phát âm dứt khoát từ khoang miệng mở rộng.',
        },
        mouthDiagramType: 'open_front',
        commonMistakes:
            'Không mở hàm đủ rộng, dẫn đến đọc thành âm /e/ ("két" thay vì "cat").',
    },
    {
        symbol: 'ʌ',
        ipa: '/ʌ/',
        category: 'monophthong',
        name: 'Short u (cup)',
        sampleWord: 'up',
        sampleTranscription: '/ʌp/',
        voicing: 'vowel',
        mouthGuide: {
            lips: 'Môi mở tự nhiên, hơi mở hình bầu dục',
            tongue: 'Thân lưỡi hơi nâng nhẹ ở phía sau trung tâm',
            jaw: 'Hàm hạ vừa phải, mở rộng hơn âm /ə/',
            technique: 'Bật hơi ngắn, dứt khoát từ đáy họng.',
        },
        mouthDiagramType: 'mid_central',
        commonMistakes: 'Đọc thành "á" hoặc "ớ" tiếng Việt quá nặng nề.',
    },
    {
        symbol: 'ɑː',
        ipa: '/ɑː/',
        category: 'monophthong',
        name: 'Long ah (car)',
        sampleWord: 'far',
        sampleTranscription: '/fɑː(r)/',
        voicing: 'vowel',
        mouthGuide: {
            lips: 'Miệng mở rộng tròn tự nhiên',
            tongue: 'Lưỡi đặt thấp phẳng dưới đáy miệng, cuống lưỡi lùi về sau',
            jaw: 'Hàm hạ xuống rất sâu',
            technique:
                'Ngân dài âm "a" trầm từ sâu trong lồng ngực và cổ họng.',
        },
        mouthDiagramType: 'open_back',
        commonMistakes:
            'Mở miệng hẹp hoặc kết thúc âm quá nhanh không đủ trường độ.',
    },
    {
        symbol: 'ɒ',
        ipa: '/ɒ/',
        category: 'monophthong',
        name: 'Short o (hot)',
        sampleWord: 'on',
        sampleTranscription: '/ɒn/',
        voicing: 'vowel',
        mouthGuide: {
            lips: 'Môi hơi tròn nhẹ, mở rộng',
            tongue: 'Phần sau của lưỡi hạ thấp nhất ở đáy miệng',
            jaw: 'Hàm hạ sâu xuống',
            technique: 'Phát âm ngắn, dứt khoát, âm thoát ra nhanh.',
        },
        mouthDiagramType: 'open_back',
        commonMistakes: 'Kéo dài thành /ɔː/ hoặc chu môi quá mức.',
    },

    // -------------------------------------------------------------------------
    // 2. NGUYÊN ÂM ĐÔI (8 DIPHTHONGS)
    // -------------------------------------------------------------------------
    {
        symbol: 'ɪə',
        ipa: '/ɪə/',
        category: 'diphthong',
        name: 'Ear diphthong',
        sampleWord: 'here',
        sampleTranscription: '/hɪə(r)/',
        voicing: 'vowel',
        mouthGuide: {
            lips: 'Bắt đầu từ vị trí /ɪ/ (môi hơi bè), sau đó lướt nhẹ về /ə/ (môi thư giãn)',
            tongue: 'Lưỡi từ vị trí trước nâng nhẹ chuyển dần về trung tâm',
            jaw: 'Hàm mở dần khi chuyển từ /ɪ/ sang /ə/',
            technique:
                'Âm đầu /ɪ/ phát âm dài và rõ hơn (chiếm 70%), âm sau /ə/ lướt nhẹ.',
        },
        mouthDiagramType: 'mid_central',
        commonMistakes:
            'Đọc thành 2 âm tách biệt "i - ơ" thay vì lướt mượt mà.',
    },
    {
        symbol: 'eɪ',
        ipa: '/eɪ/',
        category: 'diphthong',
        name: 'Ay diphthong',
        sampleWord: 'wait',
        sampleTranscription: '/weɪt/',
        voicing: 'vowel',
        mouthGuide: {
            lips: 'Bắt đầu từ âm /e/ mở vừa, sau đó trượt môi bè dần sang hai bên thành /ɪ/',
            tongue: 'Lưỡi di chuyển từ giữa lên cao phía trước',
            jaw: 'Hàm từ vị trí mở vừa từ từ khép lại',
            technique:
                'Lướt âm mượt mà từ /e/ sang /ɪ/, trọng âm rơi vào âm /e/.',
        },
        mouthDiagramType: 'close_front',
        commonMistakes: 'Đọc thành âm "ê" cụt trong tiếng Việt.',
    },
    {
        symbol: 'ʊə',
        ipa: '/ʊə/',
        category: 'diphthong',
        name: 'Ure diphthong',
        sampleWord: 'tourist',
        sampleTranscription: '/ˈtʊərɪst/',
        voicing: 'vowel',
        mouthGuide: {
            lips: 'Môi từ tròn nhẹ /ʊ/ mở thư giãn tự nhiên chuyển sang /ə/',
            tongue: 'Lưỡi từ cuống nâng cao trượt về vị trí trung tâm',
            jaw: 'Hàm mở nhẹ ra khi chuyển âm',
            technique: 'Phát âm /ʊ/ rõ hơn và lướt mượt về /ə/.',
        },
        mouthDiagramType: 'close_back',
        commonMistakes: 'Đọc thành "ua" tiếng Việt.',
    },
    {
        symbol: 'ɔɪ',
        ipa: '/ɔɪ/',
        category: 'diphthong',
        name: 'Oy diphthong',
        sampleWord: 'boy',
        sampleTranscription: '/bɔɪ/',
        voicing: 'vowel',
        mouthGuide: {
            lips: 'Bắt đầu tròn môi với /ɔː/, sau đó bè ngang miệng sang hai bên khi lên /ɪ/',
            tongue: 'Lưỡi từ vị trí sau thấp trượt vọt lên trước cao',
            jaw: 'Hàm từ mở rộng chuyển sang khép dần',
            technique: 'Trọng âm rơi vào /ɔː/ và lướt mượt vào âm /ɪ/.',
        },
        mouthDiagramType: 'open_back',
        commonMistakes: 'Đọc thành "oi" tiếng Việt cứng nhắc.',
    },
    {
        symbol: 'əʊ',
        ipa: '/əʊ/',
        category: 'diphthong',
        name: 'Oh diphthong',
        sampleWord: 'show',
        sampleTranscription: '/ʃəʊ/',
        voicing: 'vowel',
        mouthGuide: {
            lips: 'Bắt đầu môi mở tự nhiên /ə/, sau đó chúm tròn dần về phía trước thành /ʊ/',
            tongue: 'Lưỡi từ vị trí trung tâm nâng cuống về phía sau',
            jaw: 'Hàm khép lại một chút',
            technique: 'Lướt mềm mại từ /ə/ sang /ʊ/, không dừng ngắt.',
        },
        mouthDiagramType: 'mid_central',
        commonMistakes: 'Đọc thành âm "âu" hoặc "ô" thuần tiếng Việt.',
    },
    {
        symbol: 'eə',
        ipa: '/eə/',
        category: 'diphthong',
        name: 'Air diphthong',
        sampleWord: 'hair',
        sampleTranscription: '/heə(r)/',
        voicing: 'vowel',
        mouthGuide: {
            lips: 'Bắt đầu môi mở vừa /e/, sau đó mở tự nhiên thả lỏng sang /ə/',
            tongue: 'Lưỡi từ trước trượt nhẹ về trung tâm',
            jaw: 'Hàm mở hơi rộng hơn ở cuối âm',
            technique: 'Ngân rõ âm /e/ và lướt nhẹ sang /ə/.',
        },
        mouthDiagramType: 'close_front',
        commonMistakes: 'Đọc thành "e-e" hoặc nuốt mất đuôi schwa.',
    },
    {
        symbol: 'aɪ',
        ipa: '/aɪ/',
        category: 'diphthong',
        name: 'Eye diphthong',
        sampleWord: 'my',
        sampleTranscription: '/maɪ/',
        voicing: 'vowel',
        mouthGuide: {
            lips: 'Miệng mở rộng tối đa với /a/, rồi khép dần và bè miệng sang hai bên thành /ɪ/',
            tongue: 'Lưỡi từ đáy miệng nâng vọt lên cao phía trước',
            jaw: 'Hàm di chuyển từ mở rất rộng sang khép hẹp',
            technique: 'Phát âm /a/ dài, to rõ và lướt vuốt nhanh về /ɪ/.',
        },
        mouthDiagramType: 'open_front',
        commonMistakes: 'Đọc thành "ai" tiếng Việt cụt ngủn.',
    },
    {
        symbol: 'aʊ',
        ipa: '/aʊ/',
        category: 'diphthong',
        name: 'Ow diphthong',
        sampleWord: 'cow',
        sampleTranscription: '/kaʊ/',
        voicing: 'vowel',
        mouthGuide: {
            lips: 'Bắt đầu miệng mở rất rộng, sau đó chu tròn môi dần về phía trước thành /ʊ/',
            tongue: 'Lưỡi từ vị trí thấp trượt lùi về sau và nâng cao',
            jaw: 'Hàm chuyển động từ mở sâu sang khép hẹp',
            technique:
                'Độ mở hàm thay đổi rõ rệt nhất trong các nguyên âm đôi.',
        },
        mouthDiagramType: 'open_back',
        commonMistakes: 'Đọc thành "ao" tiếng Việt không chu môi ở cuối âm.',
    },

    // -------------------------------------------------------------------------
    // 3. PHỤ ÂM VÔ THANH (9 VOICELESS CONSONANTS)
    // -------------------------------------------------------------------------
    {
        symbol: 'p',
        ipa: '/p/',
        category: 'voiceless_consonant',
        name: 'Voiceless P',
        sampleWord: 'pen',
        sampleTranscription: '/pen/',
        voicing: 'voiceless',
        mouthGuide: {
            lips: 'Hai môi mím chặt chặn hoàn toàn luồng hơi trong miệng',
            tongue: 'Lưỡi thả lỏng tự nhiên',
            jaw: 'Khép nhẹ',
            technique:
                'Bật mở hai môi đột ngột để luồng khí nén thoát ra mạnh mẽ. Dây thanh quản KHÔNG rung.',
        },
        mouthDiagramType: 'bilabial',
        commonMistakes:
            'Không bật đủ luồng hơi hoặc làm rung dây thanh quản giống âm /b/.',
    },
    {
        symbol: 't',
        ipa: '/t/',
        category: 'voiceless_consonant',
        name: 'Voiceless T',
        sampleWord: 'tea',
        sampleTranscription: '/tiː/',
        voicing: 'voiceless',
        mouthGuide: {
            lips: 'Môi mở tự nhiên',
            tongue: 'Đầu lưỡi ép chặt vào nướu răng cửa hàm trên chặn luồng khí',
            jaw: 'Hàm khép nhẹ',
            technique:
                'Hạ nhanh đầu lưỡi để luồng hơi bật ra dứt khoát. Dây thanh quản KHÔNG rung.',
        },
        mouthDiagramType: 'alveolar',
        commonMistakes:
            'Đọc như chữ "t" tiếng Việt (đầu lưỡi chạm răng thay vì nướu trên).',
    },
    {
        symbol: 'tʃ',
        ipa: '/tʃ/',
        category: 'voiceless_consonant',
        name: 'Voiceless CH',
        sampleWord: 'cheese',
        sampleTranscription: '/tʃiːz/',
        voicing: 'voiceless',
        mouthGuide: {
            lips: 'Môi hơi chu tròn và mở nhẹ về phía trước',
            tongue: 'Đầu lưỡi chạm nướu trên chặn khí rồi lùi nhẹ giải phóng khí qua khe hẹp',
            jaw: 'Hàm khép gần sát',
            technique:
                'Bật kết hợp giữa /t/ và /ʃ/, luồng hơi ma sát mạnh, không rung thanh quản.',
        },
        mouthDiagramType: 'postalveolar',
        commonMistakes:
            'Đọc thành âm "ch" tiếng Việt nhẹ nhàng không có hơi bật ma sát.',
    },
    {
        symbol: 'k',
        ipa: '/k/',
        category: 'voiceless_consonant',
        name: 'Voiceless K',
        sampleWord: 'cat',
        sampleTranscription: '/kæt/',
        voicing: 'voiceless',
        mouthGuide: {
            lips: 'Môi mở tự nhiên theo nguyên âm đi kèm',
            tongue: 'Phần cuống lưỡi nâng cao chạm vòm họng mềm (ngạc mềm) chặn hơi',
            jaw: 'Hàm mở vừa phải',
            technique:
                'Hạ cuống lưỡi đột ngột để luồng hơi bật mạnh từ cổ họng ra ngoài. Không rung thanh quản.',
        },
        mouthDiagramType: 'velar',
        commonMistakes: 'Đọc nhẹ như chữ "c/k" tiếng Việt không bật hơi.',
    },
    {
        symbol: 'f',
        ipa: '/f/',
        category: 'voiceless_consonant',
        name: 'Voiceless F',
        sampleWord: 'fish',
        sampleTranscription: '/fɪʃ/',
        voicing: 'voiceless',
        mouthGuide: {
            lips: 'Răng cửa hàm trên chạm nhẹ vào mặt trong của môi dưới',
            tongue: 'Lưỡi thả lỏng',
            jaw: 'Hàm khép vừa phải',
            technique:
                'Đẩy luồng hơi thoát ra qua khe giữa răng trên và môi dưới tạo tiếng xì gió.',
        },
        mouthDiagramType: 'labiodental',
        commonMistakes: 'Mím cả 2 môi vào nhau hoặc đọc thành âm "ph" quá nhẹ.',
    },
    {
        symbol: 'θ',
        ipa: '/θ/',
        category: 'voiceless_consonant',
        name: 'Voiceless TH',
        sampleWord: 'think',
        sampleTranscription: '/θɪŋk/',
        voicing: 'voiceless',
        mouthGuide: {
            lips: 'Môi mở tự nhiên',
            tongue: 'Đầu lưỡi đặt nhẹ giữa răng cửa trên và răng cửa dưới',
            jaw: 'Hàm mở hẹp',
            technique:
                'Đẩy luồng hơi đi qua khe giữa lưỡi và răng trên. Dây thanh quản KHÔNG rung.',
        },
        mouthDiagramType: 'dental',
        commonMistakes:
            'Thụt lưỡi vào trong và đọc thành âm "th", "t" hoặc "s" tiếng Việt.',
    },
    {
        symbol: 's',
        ipa: '/s/',
        category: 'voiceless_consonant',
        name: 'Voiceless S',
        sampleWord: 'see',
        sampleTranscription: '/siː/',
        voicing: 'voiceless',
        mouthGuide: {
            lips: 'Môi hơi hé mở, khóe môi kéo nhẹ sang hai bên',
            tongue: 'Đầu lưỡi đặt gần sát chân răng trên nhưng KHÔNG chạm vào',
            jaw: 'Hai hàm răng khép gần sát nhau',
            technique:
                'Đẩy luồng khí liên tục qua rãnh hẹp của lưỡi tạo âm xì gió sắc nét.',
        },
        mouthDiagramType: 'alveolar',
        commonMistakes:
            'Đầu lưỡi chạm răng gây tắc hơi, hoặc không xì âm cuối từ.',
    },
    {
        symbol: 'ʃ',
        ipa: '/ʃ/',
        category: 'voiceless_consonant',
        name: 'Voiceless SH',
        sampleWord: 'shall',
        sampleTranscription: '/ʃæl/',
        voicing: 'voiceless',
        mouthGuide: {
            lips: 'Môi chu tròn rõ rệt và hơi cong viền môi ra ngoài',
            tongue: 'Thân lưỡi nâng cao hướng về phía ngạc cứng sau chân răng',
            jaw: 'Hai hàm răng khép gần sát',
            technique:
                'Đẩy luồng khí qua bề mặt lưỡi rộng tạo âm xì trầm và dày như tiếng "suỵt".',
        },
        mouthDiagramType: 'postalveolar',
        commonMistakes:
            'Không chu tròn môi dẫn đến phát âm nhầm sang âm /s/ nhẹ.',
    },
    {
        symbol: 'h',
        ipa: '/h/',
        category: 'voiceless_consonant',
        name: 'Voiceless H',
        sampleWord: 'hat',
        sampleTranscription: '/hæt/',
        voicing: 'voiceless',
        mouthGuide: {
            lips: 'Môi mở tự nhiên theo nguyên âm theo sau',
            tongue: 'Lưỡi thư giãn tự nhiên ở đáy miệng',
            jaw: 'Hàm mở tự nhiên',
            technique:
                'Thở luồng hơi nhẹ nhàng từ sâu trong thanh quản ra ngoài miệng như tiếng thở dài.',
        },
        mouthDiagramType: 'glottal',
        commonMistakes:
            'Thắt chặt thanh quản quá mức hoặc đọc quá mạnh thành âm có ma sát.',
    },

    // -------------------------------------------------------------------------
    // 4. PHỤ ÂM HỮU THANH (15 VOICED CONSONANTS)
    // -------------------------------------------------------------------------
    {
        symbol: 'b',
        ipa: '/b/',
        category: 'voiced_consonant',
        name: 'Voiced B',
        sampleWord: 'boat',
        sampleTranscription: '/bəʊt/',
        voicing: 'voiced',
        mouthGuide: {
            lips: 'Hai môi mím chặt chặn luồng hơi',
            tongue: 'Lưỡi thả lỏng',
            jaw: 'Khép nhẹ',
            technique:
                'Bật mở hai môi giải phóng hơi đồng thời LÀM RUNG DÂY THANH QUẢN trong cổ họng.',
        },
        mouthDiagramType: 'bilabial',
        commonMistakes:
            'Không làm rung dây thanh quản khiến âm nghe giống âm /p/.',
    },
    {
        symbol: 'd',
        ipa: '/d/',
        category: 'voiced_consonant',
        name: 'Voiced D',
        sampleWord: 'dog',
        sampleTranscription: '/dɒɡ/',
        voicing: 'voiced',
        mouthGuide: {
            lips: 'Môi mở nhẹ tự nhiên',
            tongue: 'Đầu lưỡi chạm nướu trên chặn khí',
            jaw: 'Khép nhẹ',
            technique:
                'Hạ nhanh đầu lưỡi để hơi bật ra đồng thời RUNG DÂY THANH QUẢN.',
        },
        mouthDiagramType: 'alveolar',
        commonMistakes:
            'Đọc giống âm "đ" tiếng Việt nặng nề ở đầu lưỡi chạm vào răng.',
    },
    {
        symbol: 'dʒ',
        ipa: '/dʒ/',
        category: 'voiced_consonant',
        name: 'Voiced J / G',
        sampleWord: 'June',
        sampleTranscription: '/dʒuːn/',
        voicing: 'voiced',
        mouthGuide: {
            lips: 'Môi hơi chu tròn hướng về phía trước',
            tongue: 'Đầu lưỡi chạm nướu trên rồi lùi nhẹ tạo khe hẹp',
            jaw: 'Hàm khép gần sát',
            technique:
                'Là phiên bản RUNG THANH QUẢN của âm /tʃ/, luồng hơi thoát ra có ma sát và giọng trầm.',
        },
        mouthDiagramType: 'postalveolar',
        commonMistakes:
            'Đọc thành âm "d" hoặc "gi" tiếng Việt không chu môi và thiếu độ ma sát nén khí.',
    },
    {
        symbol: 'ɡ',
        ipa: '/ɡ/',
        category: 'voiced_consonant',
        name: 'Voiced G',
        sampleWord: 'go',
        sampleTranscription: '/ɡəʊ/',
        voicing: 'voiced',
        mouthGuide: {
            lips: 'Môi mở tự nhiên',
            tongue: 'Cuống lưỡi nâng cao chạm vòm mềm chặn hơi',
            jaw: 'Hàm mở vừa phải',
            technique:
                'Hạ cuống lưỡi đột ngột giải phóng khí đồng thời RUNG MẠNH THANH QUẢN.',
        },
        mouthDiagramType: 'velar',
        commonMistakes:
            'Quên rung thanh quản làm thành âm /k/ hoặc đọc thành "g" tiếng Việt nhẹ.',
    },
    {
        symbol: 'v',
        ipa: '/v/',
        category: 'voiced_consonant',
        name: 'Voiced V',
        sampleWord: 'video',
        sampleTranscription: '/ˈvɪdiəʊ/',
        voicing: 'voiced',
        mouthGuide: {
            lips: 'Răng cửa trên chạm nhẹ vào mặt trong môi dưới',
            tongue: 'Lưỡi thả lỏng',
            jaw: 'Hàm khép nhẹ',
            technique:
                'Đẩy hơi qua kẽ răng và môi dưới đồng thời LÀM RUNG THANH QUẢN tạo âm rè rè.',
        },
        mouthDiagramType: 'labiodental',
        commonMistakes: 'Đọc thành âm "d" hoặc "qu" theo thói quen địa phương.',
    },
    {
        symbol: 'ð',
        ipa: '/ð/',
        category: 'voiced_consonant',
        name: 'Voiced TH (this)',
        sampleWord: 'this',
        sampleTranscription: '/ðɪs/',
        voicing: 'voiced',
        mouthGuide: {
            lips: 'Môi mở tự nhiên',
            tongue: 'Đầu lưỡi đặt giữa hai hàm răng cửa',
            jaw: 'Hàm mở hẹp',
            technique:
                'Đẩy luồng hơi qua kẽ răng đồng thời RUNG MẠNH THANH QUẢN (khác với âm /θ/).',
        },
        mouthDiagramType: 'dental',
        commonMistakes:
            'Thụt lưỡi vào trong và đọc thành âm "d" ("đít" thay vì "this").',
    },
    {
        symbol: 'z',
        ipa: '/z/',
        category: 'voiced_consonant',
        name: 'Voiced Z',
        sampleWord: 'zoo',
        sampleTranscription: '/zuː/',
        voicing: 'voiced',
        mouthGuide: {
            lips: 'Môi hé mở nhẹ, khóe môi kéo sang hai bên',
            tongue: 'Đầu lưỡi gần sát chân răng trên nhưng không chạm',
            jaw: 'Răng khép sát',
            technique:
                'Xì hơi qua khe hẹp của lưỡi kết hợp RUNG DÂY THANH QUẢN như tiếng ong kêu.',
        },
        mouthDiagramType: 'alveolar',
        commonMistakes:
            'Quên rung thanh quản biến thành âm /s/ hoặc nuốt âm đuôi.',
    },
    {
        symbol: 'ʒ',
        ipa: '/ʒ/',
        category: 'voiced_consonant',
        name: 'Voiced ZH (vision)',
        sampleWord: 'vision',
        sampleTranscription: '/ˈvɪʒn/',
        voicing: 'voiced',
        mouthGuide: {
            lips: 'Môi chu tròn về phía trước',
            tongue: 'Thân lưỡi nâng cao về phía vòm họng sau nướu',
            jaw: 'Răng khép gần sát',
            technique:
                'Là phiên bản RUNG THANH QUẢN của âm /ʃ/, tiếng xì trầm ấm và có độ rung cổ rõ.',
        },
        mouthDiagramType: 'postalveolar',
        commonMistakes: 'Đọc thành âm /z/ hoặc /dʒ/.',
    },
    {
        symbol: 'm',
        ipa: '/m/',
        category: 'voiced_consonant',
        name: 'Nasal M',
        sampleWord: 'man',
        sampleTranscription: '/mæn/',
        voicing: 'voiced',
        mouthGuide: {
            lips: 'Hai môi mím chặt hoàn toàn',
            tongue: 'Lưỡi thả lỏng tự nhiên',
            jaw: 'Hàm khép nhẹ',
            technique:
                'Luồng hơi bị chặn ở miệng và thoát hoàn toàn qua mũi, thanh quản rung đều.',
        },
        mouthDiagramType: 'bilabial',
        commonMistakes: 'Không ngân đủ độ vang khi âm /m/ đứng ở cuối từ.',
    },
    {
        symbol: 'n',
        ipa: '/n/',
        category: 'voiced_consonant',
        name: 'Nasal N',
        sampleWord: 'now',
        sampleTranscription: '/naʊ/',
        voicing: 'voiced',
        mouthGuide: {
            lips: 'Môi hơi hé mở tự nhiên',
            tongue: 'Đầu và viền lưỡi ép chặt vào nướu răng hàm trên chặn toàn bộ hơi ở miệng',
            jaw: 'Hàm mở nhẹ',
            technique:
                'Luồng hơi thoát ra qua đường mũi, rung thanh quản tạo âm vang mũi.',
        },
        mouthDiagramType: 'alveolar',
        commonMistakes:
            'Đầu lưỡi không bám chặt vào nướu trên khi phát âm ending sound /n/.',
    },
    {
        symbol: 'ŋ',
        ipa: '/ŋ/',
        category: 'voiced_consonant',
        name: 'Nasal NG',
        sampleWord: 'sing',
        sampleTranscription: '/sɪŋ/',
        voicing: 'voiced',
        mouthGuide: {
            lips: 'Miệng mở tự nhiên',
            tongue: 'Cuống lưỡi nâng cao áp sát ngạc mềm chặn hoàn toàn đường miệng',
            jaw: 'Hàm mở vừa phải',
            technique:
                'Toàn bộ hơi thoát qua khoang mũi, tạo âm vang sâu trong vòm họng mũi.',
        },
        mouthDiagramType: 'velar',
        commonMistakes:
            'Bật thêm âm /g/ ở cuối từ (vd: "sing-g" thay vì "sing").',
    },
    {
        symbol: 'l',
        ipa: '/l/',
        category: 'voiced_consonant',
        name: 'Lateral L',
        sampleWord: 'leg',
        sampleTranscription: '/leɡ/',
        voicing: 'voiced',
        mouthGuide: {
            lips: 'Môi mở thư giãn',
            tongue: 'Đầu lưỡi chạm chắc vào nướu răng cửa trên, hai bên rìa lưỡi hạ xuống',
            jaw: 'Hàm mở nhẹ',
            technique:
                'Hơi đi vòng qua hai bên rìa lưỡi thoát ra ngoài. Thanh quản rung.',
        },
        mouthDiagramType: 'alveolar',
        commonMistakes:
            'Không uốn cong đầu lưỡi chạm nướu trên khi âm /l/ đứng cuối từ (dark L).',
    },
    {
        symbol: 'r',
        ipa: '/r/',
        category: 'voiced_consonant',
        name: 'Approximant R',
        sampleWord: 'red',
        sampleTranscription: '/red/',
        voicing: 'voiced',
        mouthGuide: {
            lips: 'Môi hơi tròn nhẹ',
            tongue: 'Đầu lưỡi uốn cong về phía sau vòm miệng nhưng KHÔNG chạm vào bất kỳ đâu',
            jaw: 'Hàm mở vừa phải',
            technique:
                'Luồng hơi đi qua khe giữa lưỡi cong và vòm họng mà không gây ma sát bật hơi.',
        },
        mouthDiagramType: 'postalveolar',
        commonMistakes:
            'Để đầu lưỡi chạm vào vòm miệng hoặc rung lưỡi như tiếng Việt/Tây Ban Nha.',
    },
    {
        symbol: 'w',
        ipa: '/w/',
        category: 'voiced_consonant',
        name: 'Glide W',
        sampleWord: 'wet',
        sampleTranscription: '/wet/',
        voicing: 'voiced',
        mouthGuide: {
            lips: 'Môi chu thật tròn và nhỏ như đang huýt sáo',
            tongue: 'Cuống lưỡi nâng cao về phía ngạc mềm',
            jaw: 'Hàm khép gần sát rồi mở nhanh sang nguyên âm tiếp theo',
            technique:
                'Chuyển động môi mở nhanh đột ngột sang nguyên âm sau. Dây thanh quản rung.',
        },
        mouthDiagramType: 'bilabial',
        commonMistakes: 'Đọc thành âm "qu" hoặc không chu tròn môi đủ độ nén.',
    },
    {
        symbol: 'j',
        ipa: '/j/',
        category: 'voiced_consonant',
        name: 'Glide Y',
        sampleWord: 'yes',
        sampleTranscription: '/jes/',
        voicing: 'voiced',
        mouthGuide: {
            lips: 'Môi hơi kéo dẹt sang hai bên',
            tongue: 'Thân lưỡi nâng rất cao sát ngạc cứng vòm miệng trên',
            jaw: 'Hàm mở hẹp',
            technique:
                'Lướt âm rất nhanh từ vị trí gần giống /iː/ sang nguyên âm tiếp theo.',
        },
        mouthDiagramType: 'palatal',
        commonMistakes: 'Đọc thành âm "d" hoặc "gi" cứng trong tiếng Việt.',
    },
]
