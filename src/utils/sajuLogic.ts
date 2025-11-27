// 천간 (天干)
const CHEONGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const CHEONGAN_KOR = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];

// 지지 (地支)
const JIJI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const JIJI_KOR = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

// 오행
const OHAENG: { [key: string]: string } = {
    '甲': '木', '乙': '木',
    '丙': '火', '丁': '火',
    '戊': '土', '己': '土',
    '庚': '金', '辛': '金',
    '壬': '水', '癸': '水',
    '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
    '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
};

// 십성 이름
const SIPSEONG_NAMES: { [key: string]: string } = {
    '比肩': '비견', '劫財': '겁재',
    '食神': '식신', '傷官': '상관',
    '偏財': '편재', '正財': '정재',
    '偏官': '편관', '正官': '정관',
    '偏印': '편인', '正印': '정인'
};

// 인터페이스 정의
export interface Ganji {
    cheongan: string;
    jiji: string;
    cheonganKor: string;
    jijiKor: string;
}

export interface SajuData {
    year: Ganji;
    month: Ganji;
    day: Ganji;
    hour: Ganji;
}

export interface BirthInfo {
    year: number;
    month: number;
    day: number;
    hour: number;
    gender: 'male' | 'female';
}

export interface OhaengCount {
    '木': number;
    '火': number;
    '土': number;
    '金': number;
    '水': number;
}

export interface DaewoonInfo {
    age: number;
    cheongan: string;
    jiji: string;
    cheonganKor: string;
    jijiKor: string;
    analysis: string;
}

export interface MonthlyFortune {
    month: number;
    ganji: string;
    ganjiKor: string;
    love: string;
    career: string;
    study: string;
    wealth: string;
    health: string;
    children: string;
    relationship: string;
    travel: string;
}

export interface YearlyFortune {
    year: number;
    summary: string;
    monthly: MonthlyFortune[];
}

export interface TodayFortune {
    date: string;
    ganji: string;
    ganjiKor: string;
    overall: string;
    luckyColor: string[];
    luckyDirection: string;
    luckyTime: string[];
    caution: string;
}

export interface SajuAnalysis {
    ohaengCount: OhaengCount;
    ilganAnalysis: string;
    personalityAnalysis: string;
    sipseongAnalysis: string;
    daewoon: DaewoonInfo[];
    elementAnalysis: string;
    yearlyFortune: YearlyFortune;
    lottoNumbers: number[];
}

// 년주 계산
export function getYearGanji(year: number): Ganji {
    const base = 1984;
    const diff = year - base;
    
    const cheonganIdx = (diff % 10 + 10) % 10;
    const jijiIdx = (diff % 12 + 12) % 12;
    
    return {
        cheongan: CHEONGAN[cheonganIdx],
        jiji: JIJI[jijiIdx],
        cheonganKor: CHEONGAN_KOR[cheonganIdx],
        jijiKor: JIJI_KOR[jijiIdx]
    };
}

// 월주 계산
export function getMonthGanji(year: number, month: number): Ganji {
    const monthJiji = ['丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子'];
    
    return {
        cheongan: CHEONGAN[month % 10],
        jiji: monthJiji[month - 1],
        cheonganKor: CHEONGAN_KOR[month % 10],
        jijiKor: JIJI_KOR[JIJI.indexOf(monthJiji[month - 1])]
    };
}

// 일주 계산
export function getDayGanji(year: number, month: number, day: number): Ganji {
    const baseDate = new Date(2000, 0, 1);
    const targetDate = new Date(year, month - 1, day);
    const diffDays = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const cheonganIdx = ((diffDays % 10) + 10) % 10;
    const jijiIdx = ((diffDays % 12) + 12) % 12;
    
    return {
        cheongan: CHEONGAN[cheonganIdx],
        jiji: JIJI[jijiIdx],
        cheonganKor: CHEONGAN_KOR[cheonganIdx],
        jijiKor: JIJI_KOR[jijiIdx]
    };
}

// 시주 계산
export function getHourGanji(dayCheongan: string, hour: number): Ganji {
    const hourInt = parseInt(hour.toString());
    let jijiIdx = Math.floor((hourInt + 1) / 2) % 12;
    
    return {
        cheongan: CHEONGAN[hourInt % 10],
        jiji: JIJI[jijiIdx],
        cheonganKor: CHEONGAN_KOR[hourInt % 10],
        jijiKor: JIJI_KOR[jijiIdx]
    };
}

// 오행 개수 세기
export function countOhaeng(saju: SajuData): OhaengCount {
    const count: OhaengCount = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
    
    [saju.year, saju.month, saju.day, saju.hour].forEach(pillar => {
        count[OHAENG[pillar.cheongan] as keyof OhaengCount]++;
        count[OHAENG[pillar.jiji] as keyof OhaengCount]++;
    });
    
    return count;
}

// 일간 해석
export function getIlganAnalysis(ilgan: string): string {
    const analyses: { [key: string]: string } = {
        '甲': `갑목(甲木) - 큰 나무의 기상\n\n당신은 갑목(甲木) 일간으로, 큰 나무와 같은 성품을 지니고 있습니다. 갑목은 대지에 뿌리를 깊이 내리고 하늘을 향해 곧게 뻗어 나가는 대목(大木)의 특성을 가지고 있어, 강직하고 곧은 성품과 흔들리지 않는 의지력을 타고났습니다.\n\n🌳 성격적 특징:\n• 강인한 의지력과 추진력을 가지고 있어 한번 시작한 일은 끝까지 해내는 끈기가 있습니다\n• 정의감이 강하고 불의를 보면 참지 못하는 성격으로, 주변 사람들의 신뢰를 받습니다\n• 리더십이 뛰어나 자연스럽게 사람들을 이끄는 역할을 맡게 됩니다\n• 자존심이 강하고 굴복하지 않는 성격이지만, 때로는 고집이 세다는 평가를 받기도 합니다\n\n🎯 인생의 과제:\n갑목은 성장과 발전을 위해 적절한 토양(토)과 물(수)이 필요합니다. 너무 강한 바람(목)이나 과도한 햇빛(화)은 오히려 성장을 방해할 수 있으므로, 균형잡힌 오행의 조화가 중요합니다.`,
        
        '乙': `을목(乙木) - 부드러운 풀꽃의 지혜\n\n당신은 을목(乙木) 일간으로, 부드럽고 유연한 풀과 꽃의 성품을 지니고 있습니다. 을목은 바람에 흔들리지만 꺾이지 않는 유연성과, 계절의 변화에 따라 아름답게 피어나는 적응력을 가진 소목(小木)의 특성을 나타냅니다.\n\n🌸 성격적 특징:\n• 섬세하고 예민한 감성을 가지고 있어 예술적 재능이 뛰어납니다\n• 상황에 따라 유연하게 대처하는 적응력이 뛰어나며, 조화를 중시합니다\n• 배려심이 깊고 타인의 마음을 잘 헤아리는 공감 능력이 높습니다\n• 완벽주의적 성향이 있어 세밀한 작업을 잘 해내지만, 때로는 우유부단할 수 있습니다\n\n🎯 인생의 과제:\n을목은 안정적인 뿌리(토)와 적절한 수분(수)이 있을 때 가장 아름답게 피어납니다. 너무 강한 금기운은 상처를 줄 수 있으므로, 자신을 보호하면서도 본연의 아름다움을 발휘하는 것이 중요합니다.`,
        
        '丙': `병화(丙火) - 태양의 열정\n\n당신은 병화(丙火) 일간으로, 태양과 같은 밝고 뜨거운 에너지를 지니고 있습니다. 병화는 모든 생명체에게 빛과 열을 주는 태양의 특성을 가져, 주변 사람들을 밝게 만들고 희망을 주는 존재입니다.\n\n☀️ 성격적 특징:\n• 밝고 활발한 성격으로 어디서든 분위기 메이커 역할을 합니다\n• 열정적이고 적극적인 성격으로 새로운 도전을 두려워하지 않습니다\n• 관대하고 너그러운 마음으로 베풀기를 좋아하며, 리더십이 뛰어납니다\n• 자신감이 넘치고 당당하지만, 때로는 성급하고 변덕이 심할 수 있습니다\n\n🎯 인생의 과제:\n병화는 타오르는 성질이 강하므로 적절한 연료(목)와 통제(수)가 필요합니다. 너무 과열되지 않도록 주의하고, 지속가능한 에너지 관리가 중요합니다.`,
        
        '丁': `정화(丁火) - 촛불의 온기\n\n당신은 정화(丁火) 일간으로, 촛불이나 등불과 같은 따뜻하고 섬세한 빛을 지니고 있습니다. 정화는 작지만 꺼지지 않는 불꽃으로, 어둠 속에서도 희망의 빛이 되어주는 특별한 존재입니다.\n\n🕯️ 성격적 특징:\n• 섬세하고 예민한 감수성을 가지고 있어 예술적 재능이 뛰어납니다\n• 깊이 있는 사고력과 통찰력을 가지고 있어 사물의 본질을 꿰뚫어 봅니다\n• 온화하고 배려심이 깊어 주변 사람들에게 위로가 되어줍니다\n• 완벽주의적 성향이 강하고 신중하지만, 때로는 소심하고 걱정이 많을 수 있습니다\n\n🎯 인생의 과제:\n정화는 꺼지지 않는 작은 불꽃이므로 바람(목)으로부터 보호받고, 적당한 연료 공급이 필요합니다. 자신만의 고유한 빛을 꾸준히 발산하는 것이 중요합니다.`,
        
        '戊': `무토(戊土) - 대지의 포용\n\n당신은 무토(戊土) 일간으로, 높은 산이나 넓은 대지와 같은 웅장하고 안정적인 기운을 지니고 있습니다. 무토는 모든 것을 품어주는 대지의 특성을 가져, 든든하고 믿음직한 존재입니다.\n\n🏔️ 성격적 특징:\n• 포용력이 크고 너그러운 성격으로 많은 사람들의 의지가 됩니다\n• 책임감이 강하고 신뢰할 수 있어 중요한 일을 맡기기 좋은 사람입니다\n• 현실적이고 실용적인 사고를 하며, 안정을 추구합니다\n• 인내심이 강하고 꾸준하지만, 때로는 변화를 싫어하고 고집이 셀 수 있습니다\n\n🎯 인생의 과제:\n무토는 너무 메마르지 않도록 적절한 수분(수)이 필요하고, 생명력을 기르기 위해 식물(목)이 자랄 수 있는 환경을 만드는 것이 중요합니다.`,
        
        '己': `기토(己土) - 기름진 밭의 온화함\n\n당신은 기토(己土) 일간으로, 기름진 밭이나 정원과 같은 부드럽고 생산적인 땅의 성품을 지니고 있습니다. 기토는 모든 것을 키워내는 어머니 대지의 특성을 가져, 온화하고 배려심 깊은 존재입니다.\n\n🌾 성격적 특징:\n• 온화하고 부드러운 성격으로 사람들이 편안함을 느낍니다\n• 세심하고 배려심이 깊어 타인을 잘 돌보는 성격입니다\n• 실용적이고 현실적인 사고를 하며, 꼼꼼하고 성실합니다\n• 협조적이고 조화를 추구하지만, 때로는 우유부단하고 소극적일 수 있습니다\n\n🎯 인생의 과제:\n기토는 적절한 관리와 보살핌을 받을 때 최고의 결실을 맺습니다. 자신의 가치를 인정받고, 꾸준한 노력으로 성과를 이루는 것이 중요합니다.`,
        
        '庚': `경금(庚金) - 쇠의 강인함\n\n당신은 경금(庚金) 일간으로, 강철이나 쇠와 같은 강인하고 날카로운 기운을 지니고 있습니다. 경금은 단단하고 굽히지 않는 의지력과 정의로운 마음을 가진 존재입니다.\n\n⚔️ 성격적 특징:\n• 강인한 의지력과 굽히지 않는 정신력을 가지고 있습니다\n• 정의감이 강하고 불의를 보면 참지 못하는 성격입니다\n• 결단력이 뛰어나고 추진력이 강해 일을 빠르게 처리합니다\n• 솔직하고 직설적이지만, 때로는 너무 날카롭고 융통성이 부족할 수 있습니다\n\n🎯 인생의 과제:\n경금은 불(화)의 단련을 통해 더욱 강해지고, 적절한 연마를 통해 유용한 도구가 됩니다. 너무 딱딱하지 않도록 유연성을 기르는 것이 중요합니다.`,
        
        '辛': `신금(辛金) - 보석의 우아함\n\n당신은 신금(辛金) 일간으로, 보석이나 귀금속과 같은 아름답고 세련된 기운을 지니고 있습니다. 신금은 정교하고 완벽한 아름다움을 추구하는 존재입니다.\n\n💎 성격적 특징:\n• 세련되고 우아한 취향을 가지고 있어 미적 감각이 뛰어납니다\n• 완벽주의적 성향이 강하고 세밀한 작업을 잘 해냅니다\n• 예민하고 섬세한 감수성을 가지고 있어 예술적 재능이 있습니다\n• 품격 있고 고상하지만, 때로는 까다롭고 신경질적일 수 있습니다\n\n🎯 인생의 과제:\n신금은 정교한 세공을 통해 진정한 가치를 발휘합니다. 자신만의 고유한 아름다움을 발견하고 발전시키는 것이 중요합니다.`,
        
        '壬': `임수(壬水) - 큰 강의 활력\n\n당신은 임수(壬水) 일간으로, 큰 강이나 바다와 같은 광활하고 역동적인 물의 기운을 지니고 있습니다. 임수는 모든 것을 포용하고 흘러가는 큰 물의 특성을 가진 존재입니다.\n\n🌊 성격적 특징:\n• 활달하고 자유분방한 성격으로 구속받기를 싫어합니다\n• 포용력이 크고 너그러운 마음으로 많은 사람들을 품어줍니다\n• 지혜롭고 융통성이 있어 어려운 상황을 잘 헤쳐나갑니다\n• 적응력이 뛰어나고 변화를 두려워하지 않지만, 때로는 일정하지 못할 수 있습니다\n\n🎯 인생의 과제:\n임수는 흐르는 물의 특성상 방향을 잡아주는 것이 중요합니다. 자신의 에너지를 올바른 방향으로 집중시키는 것이 성공의 열쇠입니다.`,
        
        '癸': `계수(癸水) - 이슬의 지혜\n\n당신은 계수(癸水) 일간으로, 이슬이나 빗물과 같은 순수하고 맑은 물의 기운을 지니고 있습니다. 계수는 조용하지만 깊은 지혜와 직관력을 가진 존재입니다.\n\n💧 성격적 특징:\n• 섬세하고 예민한 감수성을 가지고 있어 직감이 뛰어납니다\n• 지적이고 사려깊은 성격으로 깊이 있는 사고를 합니다\n• 순수하고 깨끗한 마음을 가지고 있어 사람들이 신뢰합니다\n• 조용하고 내성적이지만, 때로는 소극적이고 우유부단할 수 있습니다\n\n🎯 인생의 과제:\n계수는 작지만 소중한 물이므로 자신의 가치를 인정받고, 적절한 위치에서 자신의 능력을 발휘하는 것이 중요합니다.`
    };
    
    return analyses[ilgan] || '일간 해석 정보가 없습니다.';
}

// 성격 분석
export function getPersonalityAnalysis(saju: SajuData, ohaengCount: OhaengCount): string {
    const maxOhaeng = Object.keys(ohaengCount).reduce((a, b) => 
        ohaengCount[a as keyof OhaengCount] > ohaengCount[b as keyof OhaengCount] ? a : b
    ) as keyof OhaengCount;
    
    const minOhaeng = Object.keys(ohaengCount).reduce((a, b) => 
        ohaengCount[a as keyof OhaengCount] < ohaengCount[b as keyof OhaengCount] ? a : b
    ) as keyof OhaengCount;
    
    const ilgan = saju.day.cheongan;
    const ilganOhaeng = OHAENG[ilgan];
    
    let analysis = `성격 분석\n\n`;
    
    // 오행 비중 분석
    const totalElements = Object.values(ohaengCount).reduce((sum, count) => sum + count, 0);
    const elementPercentages = Object.entries(ohaengCount).map(([element, count]) => ({
        element,
        count,
        percentage: Math.round((count / totalElements) * 100)
    }));
    
    analysis += `🌍 오행 구성비:\n`;
    elementPercentages.forEach(({ element, count, percentage }) => {
        const elementName = {
            '木': '목(木)',
            '火': '화(火)',
            '土': '토(土)',
            '金': '금(金)',
            '水': '수(水)'
        }[element] || element;
        
        analysis += `• ${elementName}: ${count}개 (${percentage}%)\n`;
    });
    
    analysis += `\n`;
    
    // 주도적 오행 분석
    const dominantAnalysis: { [key: string]: string } = {
        '木': `목 기운이 강하여 성장과 발전을 추구하는 진취적인 성격입니다. 늘 새로운 것에 도전하고 싶어하며, 창의적이고 이상주의적 성향이 강합니다. 단, 너무 성급하거나 인내심이 부족할 수 있어 차분함을 기르는 것이 좋습니다.`,
        '火': `화 기운이 강하여 열정적이고 활동적인 성격입니다. 에너지가 넘치고 리더십이 강하며, 소통 능력이 뛰어납니다. 밝고 긍정적인 에너지로 주변을 활기차게 만들지만, 때로는 성급하고 감정적일 수 있어 신중함이 필요합니다.`,
        '土': `토 기운이 강하여 안정적이고 신뢰감 있는 성격입니다. 책임감이 강하고 현실적이며, 인내심이 많고 꾸준합니다. 사람들이 의지하고 싶어하는 든든한 존재이지만, 때로는 변화를 싫어하고 고집이 셀 수 있습니다.`,
        '金': `금 기운이 강하여 강인하고 의지가 굳은 성격입니다. 명예심이 강하고 정의로우며, 결단력과 실행력이 뛰어납니다. 명확한 기준과 원칙을 가지고 있으며 질서를 중시하지만, 때로는 너무 완고하고 융통성이 부족할 수 있습니다.`,
        '水': `수 기운이 강하여 지혜롭고 융통성 있는 성격입니다. 적응력이 뛰어나고 직관력이 좋으며, 포용력이 크고 변화에 능동적으로 대응합니다. 깊이 있는 사고력을 가지고 있지만, 때로는 우유부단하거나 일관성이 부족할 수 있습니다.`
    };
    
    analysis += `💫 주도적 성향:\n${dominantAnalysis[maxOhaeng]}\n\n`;
    
    // 부족한 오행 분석
    const lackingAnalysis: { [key: string]: string } = {
        '木': `목 기운이 부족하여 때로는 성장 동력이나 창의력이 부족할 수 있습니다. 새로운 시도를 두려워하거나 변화에 소극적일 수 있으니, 자연과 가까이 하고 독서나 학습을 통해 목 기운을 보충하는 것이 좋습니다.`,
        '火': `화 기운이 부족하여 때로는 활력이나 추진력이 부족할 수 있습니다. 소극적이거나 표현력이 부족할 수 있으니, 운동이나 사교활동을 통해 화 기운을 보충하는 것이 좋습니다.`,
        '土': `토 기운이 부족하여 때로는 안정감이나 집중력이 부족할 수 있습니다. 계획성이 부족하거나 꾸준함이 부족할 수 있으니, 규칙적인 생활과 명상을 통해 토 기운을 보충하는 것이 좋습니다.`,
        '金': `금 기운이 부족하여 때로는 결단력이나 실행력이 부족할 수 있습니다. 우유부단하거나 원칙이 부족할 수 있으니, 명확한 목표 설정과 규칙적인 운동을 통해 금 기운을 보충하는 것이 좋습니다.`,
        '水': `수 기운이 부족하여 때로는 지혜나 유연성이 부족할 수 있습니다. 경직되거나 적응력이 부족할 수 있으니, 독서나 명상을 통해 수 기운을 보충하는 것이 좋습니다.`
    };
    
    if (ohaengCount[minOhaeng] === 0) {
        analysis += `⚠️ 보완이 필요한 부분:\n${lackingAnalysis[minOhaeng]}\n\n`;
    }
    
    // 일간과 오행의 조화 분석
    const harmony = analyzeElementHarmony(saju, ohaengCount);
    analysis += `🎯 오행 조화도:\n${harmony}\n\n`;
    
    // 인생 조언
    analysis += `💡 인생 조언:\n`;
    analysis += getLifeAdvice(ilgan, maxOhaeng, minOhaeng, ohaengCount);
    
    return analysis;
}

// 오행 조화 분석
function analyzeElementHarmony(saju: SajuData, ohaengCount: OhaengCount): string {
    const ilganElement = OHAENG[saju.day.cheongan];
    const strongElements = Object.entries(ohaengCount)
        .filter(([_, count]) => count >= 3)
        .map(([element, _]) => element);
        
    const weakElements = Object.entries(ohaengCount)
        .filter(([_, count]) => count === 0)
        .map(([element, _]) => element);
    
    let harmonyScore = 50; // 기본 점수
    let analysis = '';
    
    // 일간과 강한 오행의 관계 분석
    if (strongElements.includes(ilganElement)) {
        harmonyScore += 20;
        analysis += '일간과 강한 오행이 일치하여 자신감이 있고 본연의 능력을 잘 발휘합니다. ';
    }
    
    // 오행의 균형도 체크
    const balance = Math.max(...Object.values(ohaengCount)) - Math.min(...Object.values(ohaengCount));
    if (balance <= 2) {
        harmonyScore += 15;
        analysis += '오행이 비교적 균형잡혀 있어 안정적이고 조화로운 성격을 가지고 있습니다. ';
    } else if (balance >= 4) {
        harmonyScore -= 10;
        analysis += '오행의 편중이 심하여 극단적인 성향을 보일 수 있으니 균형을 맞추는 것이 중요합니다. ';
    }
    
    // 상생관계 체크
    const hasWoodFire = ohaengCount['木'] > 0 && ohaengCount['火'] > 0;
    const hasFireEarth = ohaengCount['火'] > 0 && ohaengCount['土'] > 0;
    const hasEarthMetal = ohaengCount['土'] > 0 && ohaengCount['金'] > 0;
    const hasMetalWater = ohaengCount['金'] > 0 && ohaengCount['水'] > 0;
    const hasWaterWood = ohaengCount['水'] > 0 && ohaengCount['木'] > 0;
    
    const mutualGeneration = [hasWoodFire, hasFireEarth, hasEarthMetal, hasMetalWater, hasWaterWood]
        .filter(Boolean).length;
    
    if (mutualGeneration >= 3) {
        harmonyScore += 10;
        analysis += '오행 간 상생 관계가 잘 이루어져 있어 순환적이고 발전적인 에너지를 가지고 있습니다.';
    }
    
    return `조화점수: ${Math.min(100, Math.max(0, harmonyScore))}점\n${analysis}`;
}

// 인생 조언
function getLifeAdvice(ilgan: string, maxOhaeng: keyof OhaengCount, minOhaeng: keyof OhaengCount, ohaengCount: OhaengCount): string {
    let advice = '';
    
    // 일간별 기본 조언
    const ilganAdvice: { [key: string]: string } = {
        '甲': '큰 나무의 기상을 가진 당신은 꾸준한 성장과 발전을 추구하세요. 리더십을 발휘하되 독단적이지 않도록 주의하고, 다른 사람의 의견도 경청하는 자세가 필요합니다.',
        '乙': '유연한 풀꽃의 지혜를 가진 당신은 적응력을 강점으로 활용하세요. 예술적 재능을 개발하고, 때로는 더 확고한 자신만의 주관을 가지는 것이 도움이 됩니다.',
        '丙': '태양의 열정을 가진 당신은 밝은 에너지를 주변에 전파하세요. 리더십을 발휘하되 너무 성급하지 않도록 주의하고, 지속가능한 에너지 관리가 중요합니다.',
        '丁': '촛불의 온기를 가진 당신은 섬세한 감성을 잘 활용하세요. 예술이나 상담 분야에서 재능을 발휘할 수 있으며, 자신감을 기르는 것이 중요합니다.',
        '戊': '대지의 포용력을 가진 당신은 안정감을 바탕으로 사람들의 중심이 되세요. 변화에 대한 두려움을 줄이고 새로운 도전도 받아들이는 자세가 필요합니다.',
        '己': '기름진 밭의 온화함을 가진 당신은 배려심을 바탕으로 조화로운 관계를 만드세요. 때로는 더 적극적이고 주도적인 모습을 보이는 것이 도움이 됩니다.',
        '庚': '강철의 의지를 가진 당신은 정의로운 마음으로 세상에 기여하세요. 융통성을 기르고 다른 사람의 감정도 헤아리는 능력을 개발하는 것이 중요합니다.',
        '辛': '보석의 우아함을 가진 당신은 완벽함을 추구하되 너무 까다롭지 않도록 주의하세요. 자신만의 독특한 아름다움을 발견하고 발전시키는 데 집중하세요.',
        '壬': '큰 강의 활력을 가진 당신은 포용력과 지혜를 바탕으로 많은 사람들을 이끄세요. 목표를 명확히 하고 꾸준함을 기르는 것이 성공의 열쇠입니다.',
        '癸': '이슬의 지혜를 가진 당신은 직관력과 섬세함을 강점으로 활용하세요. 자신감을 기르고 더 적극적으로 자신을 표현하는 것이 중요합니다.'
    };
    
    advice += ilganAdvice[ilgan] || '';
    advice += '\n\n';
    
    // 오행 균형 맞추기 조언
    advice += '🌟 오행 균형 맞추기:\n';
    
    if (ohaengCount[minOhaeng] === 0) {
        const supplementAdvice: { [key: string]: string } = {
            '木': '• 녹색 계열의 옷이나 소품 활용\n• 식물 기르기, 산책이나 등산\n• 독서나 새로운 학습 시작',
            '火': '• 빨간색이나 주황색 계열 활용\n• 운동이나 사교활동 참여\n• 따뜻한 남쪽 방향에서 활동',
            '土': '• 노란색이나 갈색 계열 활용\n• 명상이나 요가로 마음 안정\n• 규칙적인 생활 패턴 유지',
            '金': '• 흰색이나 금색 계열 활용\n• 정리정돈과 체계적인 계획\n• 서쪽 방향에서의 활동',
            '水': '• 검은색이나 파란색 계열 활용\n• 충분한 수분 섭취와 휴식\n• 북쪽 방향에서의 명상이나 독서'
        };
        
        advice += supplementAdvice[minOhaeng] || '';
    }
    
    return advice;
}

// 십성 분석
export function getSipseongAnalysis(saju: SajuData): string {
    return '사주에 나타난 십성을 분석한 결과입니다. 각 십성의 특성에 따라 성격과 운세가 결정됩니다.';
}

// 대운 계산
export function calculateDaewoon(year: number, month: number, gender: 'male' | 'female'): DaewoonInfo[] {
    const daewoonList: DaewoonInfo[] = [];
    
    for (let i = 0; i < 8; i++) {
        const age = 10 + (i * 10);
        daewoonList.push({
            age: age,
            cheongan: CHEONGAN[i % 10],
            jiji: JIJI[i % 12],
            cheonganKor: CHEONGAN_KOR[i % 10],
            jijiKor: JIJI_KOR[i % 12],
            analysis: `${age}세부터 ${age + 9}세까지의 대운 시기입니다.`
        });
    }
    
    return daewoonList;
}

// 월별 운세
export function analyzeMonthlyFortune(month: number, ilgan: string, currentYear: number): MonthlyFortune {
    const monthGanji = getMonthGanji(currentYear, month);
    
    // 월별 기본 운세 패턴
    const monthlyBaseAnalysis: { [key: number]: any } = {
        1: {
            theme: "새로운 시작의 달",
            generalTone: "긍정적",
            keyEvents: ["새해 계획", "목표 설정", "인간관계 정리"]
        },
        2: {
            theme: "인내와 준비의 달",
            generalTone: "신중함",
            keyEvents: ["기반 다지기", "학습과 성장", "관계 발전"]
        },
        3: {
            theme: "성장과 발전의 달",
            generalTone: "활동적",
            keyEvents: ["새로운 도전", "사업 확장", "만남의 기회"]
        },
        4: {
            theme: "조화와 균형의 달",
            generalTone: "안정적",
            keyEvents: ["관계 개선", "건강 관리", "재정 점검"]
        },
        5: {
            theme: "열정과 활력의 달",
            generalTone: "역동적",
            keyEvents: ["적극적 추진", "여행 계획", "창조적 활동"]
        },
        6: {
            theme: "성과와 결실의 달",
            generalTone: "성취감",
            keyEvents: ["목표 달성", "성과 확인", "보상과 휴식"]
        },
        7: {
            theme: "휴식과 재충전의 달",
            generalTone: "여유로움",
            keyEvents: ["휴가 계획", "자기 돌봄", "취미 활동"]
        },
        8: {
            theme: "변화와 전환의 달",
            generalTone: "변동적",
            keyEvents: ["방향 전환", "새로운 기회", "도전 과제"]
        },
        9: {
            theme: "수확과 감사의 달",
            generalTone: "만족감",
            keyEvents: ["성과 정리", "감사 표현", "미래 계획"]
        },
        10: {
            theme: "안정과 정착의 달",
            generalTone: "차분함",
            keyEvents: ["기반 정리", "장기 계획", "관계 심화"]
        },
        11: {
            theme: "성찰과 준비의 달",
            generalTone: "내성적",
            keyEvents: ["자기 반성", "계획 수정", "내면 성장"]
        },
        12: {
            theme: "마무리와 정리의 달",
            generalTone: "정리하는",
            keyEvents: ["연말 정리", "감사 인사", "새해 준비"]
        }
    };
    
    const baseInfo = monthlyBaseAnalysis[month];
    
    // 일간별 맞춤 운세
    const personalizedByIlgan = getPersonalizedMonthlyFortune(ilgan, month, baseInfo);
    
    return {
        month: month,
        ganji: `${monthGanji.cheongan}${monthGanji.jiji}`,
        ganjiKor: `${monthGanji.cheonganKor}${monthGanji.jijiKor}`,
        love: personalizedByIlgan.love,
        career: personalizedByIlgan.career,
        study: personalizedByIlgan.study,
        wealth: personalizedByIlgan.wealth,
        health: personalizedByIlgan.health,
        children: personalizedByIlgan.children,
        relationship: personalizedByIlgan.relationship,
        travel: personalizedByIlgan.travel
    };
}

// 일간별 맞춤 월별 운세
function getPersonalizedMonthlyFortune(ilgan: string, month: number, baseInfo: any) {
    const ilganElement = OHAENG[ilgan];
    const seasonElement = getSeasonElement(month);
    
    // 기본 템플릿 (모든 일간에 적용)
    const getBasicFortune = () => ({
        love: [
            `${month}월은 진정성 있는 마음으로 상대방에게 다가가기 좋은 시기입니다. 자연스러운 만남을 기대해보세요.`,
            `감정 표현을 솔직하게 하는 것이 관계 발전에 도움이 됩니다. 마음을 열고 대화해보세요.`,
            `서로를 이해하려는 노력이 더욱 깊은 유대감을 만들어낼 것입니다.`,
            `새로운 만남이나 기존 관계의 발전 가능성이 높은 시기입니다. 열린 마음으로 임하세요.`
        ],
        career: [
            `${month}월은 ${baseInfo.theme}로, 업무에서 ${baseInfo.generalTone} 접근이 필요합니다.`,
            `새로운 기회나 도전을 통해 성장할 수 있는 시기입니다. 적극적으로 임하세요.`,
            `동료들과의 협력이 좋은 결과를 가져올 것입니다. 소통을 늘려보세요.`,
            `전문성을 발휘할 수 있는 기회가 찾아올 것입니다. 준비된 자세로 임하세요.`
        ],
        wealth: [
            `재정 관리에 신중함을 기하는 것이 좋습니다. 계획적인 지출을 하세요.`,
            `새로운 수익 기회를 찾아보되, 위험성을 충분히 검토해보세요.`,
            `장기적인 관점에서 투자 계획을 세우는 것이 바람직합니다.`,
            `안정적인 자산 관리로 재정 기반을 튼튼히 하는 시기입니다.`
        ]
    });
    
    // 일간별 특화 운세
    const ilganSpecificFortune: { [key: string]: any } = {
        '甲': {
            love: [
                "직진하는 성격으로 상대방에게 진심을 전할 좋은 시기입니다. 솔직한 마음을 표현해보세요.",
                "리더십 있는 모습이 매력적으로 다가가는 시기입니다. 데이트에서 주도권을 잡아보세요.",
                "성장하는 모습을 보여줄 때 연인의 관심이 높아집니다. 자기계발에 힘써보세요.",
                "당당한 자신감이 매력 포인트가 되는 시기입니다. 자연스럽게 어필해보세요."
            ],
            career: [
                "새로운 프로젝트나 업무에 도전하기 좋은 시기입니다. 적극적으로 나서보세요.",
                "리더십을 발휘할 기회가 찾아옵니다. 팀을 이끄는 역할을 맡아보세요.",
                "혁신적인 아이디어가 인정받을 수 있는 시기입니다. 창의적 사고를 발휘하세요.",
                "추진력과 결단력이 성과로 이어지는 시기입니다. 목표를 향해 전진하세요."
            ]
        },
        '乙': {
            love: [
                "섬세한 배려가 상대방의 마음을 움직이는 시기입니다. 작은 선물이나 메시지를 전해보세요.",
                "예술적 감성을 공유할 수 있는 데이트가 효과적입니다. 전시회나 공연을 함께 즐겨보세요.",
                "유연한 소통으로 갈등을 해결할 수 있는 시기입니다. 대화의 시간을 늘려보세요.",
                "부드러운 매력이 빛을 발하는 시기입니다. 자연스러운 모습으로 다가가세요."
            ],
            career: [
                "협력과 조화로 좋은 성과를 낼 수 있는 시기입니다. 팀워크를 중시하세요.",
                "창의적이고 예술적인 업무에서 두각을 나타낼 수 있습니다.",
                "부드러운 소통으로 업무 관계를 개선할 수 있는 시기입니다.",
                "섬세한 분석력이 문제 해결의 열쇠가 될 것입니다."
            ]
        },
        '丙': {
            love: [
                "밝고 긍정적인 에너지로 상대방을 매료시킬 수 있는 시기입니다.",
                "활발한 야외 데이트나 스포츠 활동을 함께 즐겨보세요.",
                "열정적인 표현이 관계에 활력을 불어넣을 것입니다.",
                "자신감 넘치는 모습이 매력적으로 어필되는 시기입니다."
            ],
            career: [
                "에너지 넘치는 추진력으로 큰 성과를 이룰 수 있는 시기입니다.",
                "프레젠테이션이나 발표에서 빛을 발할 것입니다.",
                "팀의 분위기 메이커 역할로 인정받을 수 있습니다.",
                "새로운 도전과 혁신을 주도하기 좋은 시기입니다."
            ]
        }
        // 다른 일간들도 유사하게 추가 가능
    };
    
    const basicFortune = getBasicFortune();
    const specificFortune = ilganSpecificFortune[ilgan];
    
    // 특화 운세가 있으면 사용하고, 없으면 기본 운세 사용
    const selectedLove = specificFortune?.love || basicFortune.love;
    const selectedCareer = specificFortune?.career || basicFortune.career;
    const selectedWealth = specificFortune?.wealth || basicFortune.wealth;
    
    // 계절과 오행의 조화를 고려한 운세 조정
    const seasonBonus = calculateSeasonBonus(ilganElement, seasonElement);
    
    return {
        love: selectedLove[month % selectedLove.length] + (seasonBonus.love || ""),
        career: selectedCareer[month % selectedCareer.length] + (seasonBonus.career || ""),
        study: `${month}월은 학습과 성장에 ${baseInfo.generalTone} 에너지가 흐릅니다. 꾸준한 노력이 결실을 맺을 것입니다.${seasonBonus.study || ''}`,
        wealth: selectedWealth[month % selectedWealth.length] + (seasonBonus.wealth || ""),
        health: `${baseInfo.theme}에 맞는 건강 관리가 필요합니다. 규칙적인 생활과 적절한 운동을 하세요.${seasonBonus.health || ''}`,
        children: `자녀와의 소통을 늘리고 함께하는 시간을 만드는 것이 좋습니다. 교육에 관심을 가져보세요.`,
        relationship: `${baseInfo.generalTone} 분위기로 인간관계가 ${month}월의 ${baseInfo.theme}에 맞게 발전할 것입니다.`,
        travel: `${baseInfo.keyEvents}과 관련된 여행이나 나들이가 좋은 에너지를 가져다줄 것입니다.`
    };
}

// 계절별 오행 에너지
function getSeasonElement(month: number): string {
    if (month >= 3 && month <= 5) return '木'; // 봄
    if (month >= 6 && month <= 8) return '火'; // 여름
    if (month >= 9 && month <= 11) return '金'; // 가을
    return '水'; // 겨울 (12, 1, 2월)
}

// 계절 보너스 계산
function calculateSeasonBonus(ilganElement: string, seasonElement: string): any {
    const bonusMessages = {
        love: {
            same: " 계절의 기운이 당신의 매력을 한층 더 돋보이게 합니다.",
            supportive: " 계절의 에너지가 연애운을 상승시켜줍니다.",
            neutral: "",
            challenging: " 계절의 변화에 따라 감정 기복이 있을 수 있으니 안정감을 유지하세요."
        },
        career: {
            same: " 이 시기는 당신의 능력이 최대한 발휘될 수 있는 최적의 타이밍입니다.",
            supportive: " 계절의 에너지가 업무 추진력을 높여줍니다.",
            neutral: "",
            challenging: " 계절적 영향으로 조금 더 신중한 접근이 필요할 수 있습니다."
        },
        study: {
            same: " 집중력과 학습 능력이 최고조에 달하는 시기입니다.",
            supportive: " 새로운 지식 흡수가 원활한 시기입니다.",
            neutral: "",
            challenging: " 꾸준한 노력으로 어려움을 극복할 수 있습니다."
        },
        wealth: {
            same: " 재정 관리와 투자에 최적의 타이밍입니다.",
            supportive: " 금전적 기회가 찾아올 가능성이 높습니다.",
            neutral: "",
            challenging: " 지출 관리에 더욱 신경 쓰시기 바랍니다."
        },
        health: {
            same: " 체력과 면역력이 강화되는 시기입니다.",
            supportive: " 건강 증진에 좋은 시기입니다.",
            neutral: "",
            challenging: " 건강 관리에 더욱 주의가 필요한 시기입니다."
        }
    };
    
    // 오행 상생상극 관계 확인
    let relationship = 'neutral';
    
    if (ilganElement === seasonElement) {
        relationship = 'same';
    } else {
        // 상생 관계 체크
        const mutualGeneration = {
            '木': '火',
            '火': '土',
            '土': '金',
            '金': '水',
            '水': '木'
        };
        
        if (mutualGeneration[ilganElement] === seasonElement || mutualGeneration[seasonElement] === ilganElement) {
            relationship = 'supportive';
        }
        
        // 상극 관계 체크
        const mutualDestruction = {
            '木': '土',
            '火': '金',
            '土': '水',
            '金': '木',
            '水': '火'
        };
        
        if (mutualDestruction[ilganElement] === seasonElement || mutualDestruction[seasonElement] === ilganElement) {
            relationship = 'challenging';
        }
    }
    
    return {
        love: bonusMessages.love[relationship],
        career: bonusMessages.career[relationship],
        study: bonusMessages.study[relationship],
        wealth: bonusMessages.wealth[relationship],
        health: bonusMessages.health[relationship]
    };
}

// 올해 운세
export function analyzeYearlyFortune(saju: SajuData, birthYear: number): YearlyFortune {
    const currentYear = new Date().getFullYear();
    const monthlyFortunes: MonthlyFortune[] = [];
    
    for (let month = 1; month <= 12; month++) {
        monthlyFortunes.push(analyzeMonthlyFortune(month, saju.day.cheongan, currentYear));
    }
    
    // 연운 총평 생성
    const yearSummary = generateYearSummary(saju, currentYear, birthYear);
    
    return {
        year: currentYear,
        summary: yearSummary,
        monthly: monthlyFortunes
    };
}

// 연운 총평 생성
function generateYearSummary(saju: SajuData, currentYear: number, birthYear: number): string {
    const age = currentYear - birthYear + 1;
    const ilgan = saju.day.cheongan;
    const ilganElement = OHAENG[ilgan];
    const yearGanji = getYearGanji(currentYear);
    const yearElement = OHAENG[yearGanji.cheongan];
    
    let summary = `${currentYear}년 (만 ${age - 1}세) 운세 총평\n\n`;
    
    // 연간 기본 분석
    summary += `🎆 **올해의 키워드**\n`;
    const yearKeywords = getYearKeywords(currentYear, ilgan, age);
    summary += yearKeywords.join(', ') + '\n\n';
    
    // 일간과 연간의 조화 분석
    const harmony = analyzeYearHarmony(ilganElement, yearElement);
    summary += `🎯 **연간 조화도**: ${harmony.score}점\n`;
    summary += harmony.description + '\n\n';
    
    // 나이대별 특징
    const ageAnalysis = getAgeSpecificAnalysis(age);
    summary += `📅 **인생 단계**: ${ageAnalysis.stage}\n`;
    summary += ageAnalysis.description + '\n\n';
    
    // 연간 운세 전망
    const yearForecast = getDetailedYearForecast(ilgan, yearElement, age, currentYear);
    summary += `🔮 **${currentYear}년 전망**\n`;
    summary += yearForecast + '\n\n';
    
    // 주요 주의사항
    const cautions = getYearCautions(ilgan, age, currentYear);
    summary += `⚠️ **주의사항**\n`;
    summary += cautions.join('\n') + '\n\n';
    
    // 추천 사항
    const recommendations = getYearRecommendations(ilgan, yearElement, age);
    summary += `🌟 **올해 추천 사항**\n`;
    summary += recommendations.join('\n');
    
    return summary;
}

// 연간 키워드 생성
function getYearKeywords(year: number, ilgan: string, age: number): string[] {
    const baseKeywords = {
        '甲': ['성장', '도전', '리더십', '혁신'],
        '乙': ['유연성', '예술', '협력', '조화'],
        '丙': ['열정', '활력', '변화', '전진'],
        '丁': ['섬세함', '완벽', '예술', '깊이'],
        '戊': ['안정', '신뢰', '견고함', '포용'],
        '己': ['온화', '배려', '수확', '다산'],
        '庚': ['정의', '강인', '원칙', '결단'],
        '辛': ['완벽', '세련', '예술', '우아'],
        '壬': ['지혜', '포용', '변화', '유동'],
        '癸': ['직관', '섬세', '지성', '심층']
    };
    
    const ageKeywords = {
        young: ['학습', '건강', '미래준비'],
        adult: ['성취', '책임', '리더십'],
        middle: ['안정', '성숙', '지혜'],
        senior: ['경험', '여유', '반성']
    };
    
    let keywords = [...(baseKeywords[ilgan] || ['성장', '발전'])];
    
    if (age < 30) keywords.push(...ageKeywords.young);
    else if (age < 45) keywords.push(...ageKeywords.adult);
    else if (age < 60) keywords.push(...ageKeywords.middle);
    else keywords.push(...ageKeywords.senior);
    
    // 연도별 특수 키워드
    const lastDigit = year % 10;
    const cycleKeywords = {
        0: ['시작', '기초'],
        1: ['발전', '성장'],
        2: ['안정', '고민'],
        3: ['변화', '도전'],
        4: ['완성', '성취'],
        5: ['전환', '변화'],
        6: ['조화', '균형'],
        7: ['내실', '성찰'],
        8: ['발전', '전진'],
        9: ['완성', '마무리']
    };
    
    keywords.push(...(cycleKeywords[lastDigit] || []));
    
    return keywords.slice(0, 6); // 최대 6개
}

// 연간 조화도 분석
function analyzeYearHarmony(ilganElement: string, yearElement: string): { score: number, description: string } {
    let score = 50;
    let description = '';
    
    if (ilganElement === yearElement) {
        score = 85;
        description = '일간과 연간의 오행이 일치하여 자신의 본성을 최대한 발휘할 수 있는 해입니다. 원래 가진 장점이 한층 더 빛을 발하고, 자신감이 높아지는 시기입니다.';
    } else {
        // 상생 관계 체크
        const mutualGeneration = {
            '木': '火', '火': '土', '土': '金', '金': '水', '水': '木'
        };
        
        if (mutualGeneration[ilganElement] === yearElement) {
            score = 75;
            description = '일간이 연간을 생하는 관계로, 적극적으로 행동할 때 좋은 결과를 얻을 수 있는 해입니다. 노력한 만큼 성과가 따르는 시기입니다.';
        } else if (mutualGeneration[yearElement] === ilganElement) {
            score = 80;
            description = '연간이 일간을 도와주는 관계로, 외부의 도움이나 기회가 많이 찾아오는 해입니다. 주변의 지원을 잘 활용하면 큰 발전을 이룰 수 있습니다.';
        } else {
            // 상극 관계 체크
            const mutualDestruction = {
                '木': '土', '火': '金', '土': '水', '金': '木', '水': '火'
            };
            
            if (mutualDestruction[ilganElement] === yearElement) {
                score = 35;
                description = '일간이 연간을 극하는 관계로, 과도한 힘 쓰기보다는 신중한 접근이 필요한 해입니다. 무리하지 말고 차근차근 진행하세요.';
            } else if (mutualDestruction[yearElement] === ilganElement) {
                score = 30;
                description = '연간이 일간을 제압하는 관계로, 도전적인 상황이 많을 수 있는 해입니다. 인내심을 갖고 꾸준히 노력하면 역경을 극복할 수 있습니다.';
            } else {
                score = 60;
                description = '일간과 연간이 비교적 중립적인 관계로, 자신의 노력에 따라 결과가 달라지는 해입니다. 주도적으로 계획을 세우고 실행하세요.';
            }
        }
    }
    
    return { score, description };
}

// 나이대별 분석
function getAgeSpecificAnalysis(age: number): { stage: string, description: string } {
    if (age < 20) {
        return {
            stage: '성장기 (19세 이하)',
            description: '꿈과 이상을 키우는 시기입니다. 다양한 경험을 통해 자신만의 방향을 찾아가세요. 학습과 건강 관리에 집중하는 것이 중요합니다.'
        };
    } else if (age < 30) {
        return {
            stage: '청년기 (20-29세)',
            description: '인생의 기초를 다지는 중요한 시기입니다. 진로 결정과 인간관계 형성에 집중하고, 미래를 위한 준비를 탄탄히 하세요.'
        };
    } else if (age < 40) {
        return {
            stage: '성장기 (30-39세)',
            description: '본격적인 사회 활동과 성취를 이루는 시기입니다. 책임감이 늘어나지만 그만큼 성과도 클 수 있습니다. 균형잡힌 생활을 유지하세요.'
        };
    } else if (age < 50) {
        return {
            stage: '중견기 (40-49세)',
            description: '경험과 실력이 조화를 이루는 전성기입니다. 리더십을 발휘하고 후진 양성에도 관심을 가져보세요. 건강 관리도 중요합니다.'
        };
    } else if (age < 60) {
        return {
            stage: '성숙기 (50-59세)',
            description: '지혜와 여유가 생기는 시기입니다. 경험을 바탕으로 한 조언과 멘토링이 빛을 발할 것입니다. 내면의 풍요로움을 추구하세요.'
        };
    } else {
        return {
            stage: '원숙기 (60세 이상)',
            description: '인생의 결실을 맺고 여유를 즐기는 시기입니다. 건강과 가족, 취미 생활에 중점을 두고 풍요로운 노후를 설계하세요.'
        };
    }
}

// 상세 연간 전망
function getDetailedYearForecast(ilgan: string, yearElement: string, age: number, year: number): string {
    const ilganElement = OHAENG[ilgan];
    
    let forecast = '';
    
    // 전반적 흐름
    forecast += `전반적으로 ${year}년은 `;
    
    if (ilganElement === yearElement) {
        forecast += '자신의 능력을 마음껏 발휘할 수 있는 해입니다. 적극적인 도전과 새로운 시도가 좋은 결과로 이어질 것입니다.';
    } else {
        forecast += '변화와 성장의 기회가 많은 해입니다. 새로운 환경이나 상황에 적응하며 한 단계 성숙해질 수 있습니다.';
    }
    
    forecast += '\n\n';
    
    // 상반기/하반기 전망
    forecast += '**상반기 (1-6월)**\n';
    forecast += '새로운 계획을 세우고 기반을 다지는 시기입니다. 인간관계의 변화나 새로운 만남이 있을 수 있으며, 학습이나 자기개발에 투자하면 좋은 결과를 얻을 수 있습니다.\n\n';
    
    forecast += '**하반기 (7-12월)**\n';
    forecast += '상반기에 뿌린 씨앗의 결실을 맺는 시기입니다. 그동안의 노력이 구체적인 성과로 나타나며, 새로운 목표를 설정하고 미래를 준비하는 시간이 됩니다.';
    
    return forecast;
}

// 연간 주의사항
function getYearCautions(ilgan: string, age: number, year: number): string[] {
    const cautions: string[] = [];
    
    // 일간별 주의사항
    const ilganCautions = {
        '甲': '너무 성급하게 추진하지 말고 단계적으로 접근하세요.',
        '乙': '우유부단함을 줄이고 때로는 확고한 결정을 내리세요.',
        '丙': '감정적 기복을 조절하고 지속가능한 에너지 관리를 하세요.',
        '丁': '완벽주의 성향을 적당히 조절하고 스트레스 관리에 신경 쓰세요.',
        '戊': '고집을 부리지 말고 변화에 유연하게 대응하세요.',
        '己': '소극적 태도를 버리고 때로는 적극적으로 나서보세요.',
        '庚': '너무 직설적인 표현을 자제하고 상대방 입장을 고려하세요.',
        '辛': '지나친 완벽주의로 인한 스트레스를 줄이세요.',
        '壬': '일관성을 유지하고 변덕스러운 모습을 보이지 마세요.',
        '癸': '자신감을 기르고 더 적극적으로 자신을 표현하세요.'
    };
    
    cautions.push(`• ${ilganCautions[ilgan] || '균형잡힌 생활을 유지하세요.'}`);
    
    // 나이대별 주의사항
    if (age < 30) {
        cautions.push('• 미래를 위한 기초를 탄탄히 다지되, 현재도 소홀히 하지 마세요.');
    } else if (age < 50) {
        cautions.push('• 과도한 스트레스와 업무 부담을 피하고 건강 관리에 신경 쓰세요.');
    } else {
        cautions.push('• 건강 관리를 최우선으로 하고 무리한 일정은 피하세요.');
    }
    
    // 공통 주의사항
    cautions.push('• 중요한 결정은 충분한 검토 후에 내리세요.');
    cautions.push('• 인간관계에서 소통을 중시하고 오해를 줄이도록 노력하세요.');
    
    return cautions;
}

// 연간 추천사항
function getYearRecommendations(ilgan: string, yearElement: string, age: number): string[] {
    const recommendations: string[] = [];
    
    // 일간별 추천사항
    const ilganRecommendations = {
        '甲': '새로운 도전과 학습 기회를 적극적으로 찾아보세요.',
        '乙': '예술이나 창작 활동을 통해 감성을 기르세요.',
        '丙': '사교 활동이나 네트워킹을 통해 인맥을 넓히세요.',
        '丁': '깊이 있는 연구나 전문성 개발에 집중하세요.',
        '戊': '안정적인 기반 구축과 장기 계획을 세우세요.',
        '己': '타인을 돕는 일이나 봉사 활동에 참여해보세요.',
        '庚': '정의롭고 원칙있는 행동으로 신뢰를 쌓으세요.',
        '辛': '품격있는 취미나 문화 활동을 즐기세요.',
        '壬': '여행이나 새로운 경험을 통해 견문을 넓히세요.',
        '癸': '명상이나 독서를 통해 내면의 성장을 추구하세요.'
    };
    
    recommendations.push(`• ${ilganRecommendations[ilgan] || '자기계발에 힘써보세요.'}`);
    
    // 연간 오행별 추천사항
    const yearElementRecommendations = {
        '木': '새로운 시작이나 성장 관련 활동에 집중하세요.',
        '火': '활발한 활동과 인간관계 확장에 노력하세요.',
        '土': '안정적인 기반 마련과 신뢰 구축에 힘쓰세요.',
        '金': '체계적인 계획과 정리 정돈에 집중하세요.',
        '水': '학습과 지혜 축적, 유연한 사고에 중점을 두세요.'
    };
    
    recommendations.push(`• ${yearElementRecommendations[yearElement] || '균형잡힌 발전을 추구하세요.'}`);
    
    // 나이대별 추천사항
    if (age < 30) {
        recommendations.push('• 다양한 경험을 쌓고 자신만의 방향을 찾아가세요.');
    } else if (age < 50) {
        recommendations.push('• 전문성을 기르고 리더십을 발휘할 기회를 찾으세요.');
    } else {
        recommendations.push('• 경험을 나누고 여유있는 삶을 즐기세요.');
    }
    
    recommendations.push('• 정기적인 건강 검진과 운동으로 건강을 관리하세요.');
    recommendations.push('• 가족과의 시간을 소중히 하고 인간관계를 깊이 있게 발전시키세요.');
    
    return recommendations;
}

// 로또 번호 추천
export function recommendLottoNumbers(saju: SajuData, birthInfo: BirthInfo): number[] {
    const numbers: number[] = [];
    
    for (let i = 0; i < 6; i++) {
        let num = (birthInfo.year + birthInfo.month + birthInfo.day + i * 7) % 45 + 1;
        while (numbers.includes(num)) {
            num = num % 45 + 1;
        }
        numbers.push(num);
    }
    
    return numbers.sort((a, b) => a - b);
}

// 오늘의 운세
export function analyzeTodayFortune(saju: SajuData): TodayFortune {
    const today = new Date();
    
    return {
        date: `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`,
        ganji: '甲子',
        ganjiKor: '갑자',
        overall: '오늘은 전반적으로 좋은 날입니다. 긍정적인 마음가짐으로 하루를 시작하세요.',
        luckyColor: ['파란색', '흰색'],
        luckyDirection: '북쪽',
        luckyTime: ['자시 (23:00-01:00)', '오시 (11:00-13:00)'],
        caution: '급한 결정은 피하고 신중하게 행동하세요.'
    };
}

// 오늘 간지 정보
export function getTodayGanji() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    
    return {
        date: `${year}년 ${month}월 ${day}일`,
        year: getYearGanji(year),
        month: getMonthGanji(year, month),
        day: getDayGanji(year, month, day)
    };
}

// 사주 계산
export function calculateSaju(birthInfo: BirthInfo): SajuData {
    const { year, month, day, hour } = birthInfo;
    
    const yearGanji = getYearGanji(year);
    const monthGanji = getMonthGanji(year, month);
    const dayGanji = getDayGanji(year, month, day);
    const hourGanji = getHourGanji(dayGanji.cheongan, hour);
    
    return {
        year: yearGanji,
        month: monthGanji,
        day: dayGanji,
        hour: hourGanji
    };
}

// 사주 분석
export function analyzeSaju(saju: SajuData, birthInfo: BirthInfo): SajuAnalysis {
    const ohaengCount = countOhaeng(saju);
    const ilganAnalysis = getIlganAnalysis(saju.day.cheongan);
    const personalityAnalysis = getPersonalityAnalysis(saju, ohaengCount);
    const sipseongAnalysis = getSipseongAnalysis(saju);
    const daewoonList = calculateDaewoon(birthInfo.year, birthInfo.month, birthInfo.gender);
    const yearlyFortune = analyzeYearlyFortune(saju, birthInfo.year);
    const lottoNumbers = recommendLottoNumbers(saju, birthInfo);
    
    const elementAnalysisText = `사주팔자의 오행은 총 8개로 구성됩니다. 목(${ohaengCount['木']}개), 화(${ohaengCount['火']}개), 토(${ohaengCount['土']}개), 금(${ohaengCount['金']}개), 수(${ohaengCount['水']}개)로 이루어져 있습니다.`;
    
    return {
        ohaengCount,
        ilganAnalysis,
        personalityAnalysis,
        sipseongAnalysis,
        daewoon: daewoonList,
        elementAnalysis: elementAnalysisText,
        yearlyFortune,
        lottoNumbers
    };
}

// 내보내기
export { OHAENG, JIJI, CHEONGAN, CHEONGAN_KOR, JIJI_KOR };
