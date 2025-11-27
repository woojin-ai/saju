import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { BirthInfo } from '@/utils/sajuLogic';

interface SajuFormProps {
  onSubmit: (birthInfo: BirthInfo) => void;
  isLoading: boolean;
}

const SajuForm: React.FC<SajuFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    year: '',
    month: '',
    day: '',
    hour: '',
    gender: 'male' as 'male' | 'female'
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    const year = parseInt(formData.year);
    const month = parseInt(formData.month);
    const day = parseInt(formData.day);
    const hour = parseInt(formData.hour);

    if (!formData.year || year < 1900 || year > new Date().getFullYear()) {
      newErrors.year = '올바른 년도를 입력해주세요 (1900-현재)';
    }

    if (!formData.month || month < 1 || month > 12) {
      newErrors.month = '올바른 월을 입력해주세요 (1-12)';
    }

    if (!formData.day || day < 1 || day > 31) {
      newErrors.day = '올바른 일을 입력해주세요 (1-31)';
    }

    if (!formData.hour || hour < 0 || hour > 23) {
      newErrors.hour = '올바른 시간을 입력해주세요 (0-23)';
    }

    // 월일 유효성 검사
    if (month && day) {
      const daysInMonth = new Date(year || 2024, month, 0).getDate();
      if (day > daysInMonth) {
        newErrors.day = `${month}월은 ${daysInMonth}일까지 있습니다`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const birthInfo: BirthInfo = {
      year: parseInt(formData.year),
      month: parseInt(formData.month),
      day: parseInt(formData.day),
      hour: parseInt(formData.hour),
      gender: formData.gender
    };

    onSubmit(birthInfo);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 생년월일 */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            년도
          </label>
          <input
            type="number"
            value={formData.year}
            onChange={(e) => handleChange('year', e.target.value)}
            placeholder="예: 1990"
            className={`input-oriental ${errors.year ? 'border-red-500' : ''}`}
            min="1900"
            max={new Date().getFullYear()}
          />
          {errors.year && (
            <p className="text-red-500 text-sm mt-1">{errors.year}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            월
          </label>
          <select
            value={formData.month}
            onChange={(e) => handleChange('month', e.target.value)}
            className={`input-oriental ${errors.month ? 'border-red-500' : ''}`}
          >
            <option value="">선택</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}월
              </option>
            ))}
          </select>
          {errors.month && (
            <p className="text-red-500 text-sm mt-1">{errors.month}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            일
          </label>
          <select
            value={formData.day}
            onChange={(e) => handleChange('day', e.target.value)}
            className={`input-oriental ${errors.day ? 'border-red-500' : ''}`}
          >
            <option value="">선택</option>
            {Array.from({ length: 31 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}일
              </option>
            ))}
          </select>
          {errors.day && (
            <p className="text-red-500 text-sm mt-1">{errors.day}</p>
          )}
        </div>
      </div>

      {/* 시간 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          태어난 시간
        </label>
        <select
          value={formData.hour}
          onChange={(e) => handleChange('hour', e.target.value)}
          className={`input-oriental ${errors.hour ? 'border-red-500' : ''}`}
        >
          <option value="">시간 선택</option>
          {Array.from({ length: 24 }, (_, i) => (
            <option key={i} value={i}>
              {i.toString().padStart(2, '0')}시 ({i === 0 ? '자정' : i === 12 ? '정오' : i < 12 ? '오전' : '오후'})
            </option>
          ))}
        </select>
        {errors.hour && (
          <p className="text-red-500 text-sm mt-1">{errors.hour}</p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          * 정확한 태어난 시간을 모르시면 12시(정오)로 설정하세요
        </p>
      </div>

      {/* 성별 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          성별
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="male"
              checked={formData.gender === 'male'}
              onChange={(e) => handleChange('gender', e.target.value)}
              className="mr-2 text-primary-600 focus:ring-primary-500"
            />
            남성
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="female"
              checked={formData.gender === 'female'}
              onChange={(e) => handleChange('gender', e.target.value)}
              className="mr-2 text-primary-600 focus:ring-primary-500"
            />
            여성
          </label>
        </div>
      </div>

      {/* 제출 버튼 */}
      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={{ scale: isLoading ? 1 : 1.02 }}
        whileTap={{ scale: isLoading ? 1 : 0.98 }}
        className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-200 ${
          isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'btn-oriental'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            사주 계산 중...
          </div>
        ) : (
          '사주팔자 보기'
        )}
      </motion.button>

      {/* 안내 문구 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <h3 className="font-medium text-blue-800 mb-2">💡 정확한 사주 해석을 위한 안내</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 양력(신력) 기준으로 입력해주세요</li>
          <li>• 태어난 시간이 정확할수록 더 정밀한 해석이 가능합니다</li>
          <li>• 음력생일이시라면 양력으로 변환 후 입력해주세요</li>
          <li>• 해외 출생의 경우 한국 시간 기준으로 입력해주세요</li>
        </ul>
      </div>
    </form>
  );
};

export default SajuForm;
