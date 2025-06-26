import React from 'react'
import { ArrowLeft, Edit, Trash2, Play, Pause, Settings, Clock, Calendar, Tag } from 'lucide-react'

const StepDetailPage = ({ step, action, onBack, onEdit }) => {
  if (!step) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">STEP을 찾을 수 없습니다</h2>
          <button onClick={onBack} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            목록으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case '대기중': return 'bg-yellow-100 text-yellow-800'
      case '실행중': return 'bg-blue-100 text-blue-800'
      case '완료': return 'bg-green-100 text-green-800'
      case '오류': return 'bg-red-100 text-red-800'
      case '건너뛰기': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case '클릭': return 'bg-blue-100 text-blue-800'
      case '입력': return 'bg-green-100 text-green-800'
      case '대기': return 'bg-yellow-100 text-yellow-800'
      case '조건': return 'bg-purple-100 text-purple-800'
      case '반복': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              {action?.name || 'ACTION'} 상세로 돌아가기
            </button>
          </div>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{step.name}</h1>
              <p className="text-gray-600 text-lg">{step.description}</p>
              {action && (
                <p className="text-sm text-gray-500 mt-1">소속 ACTION: {action.name}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                <Play className="h-4 w-4" />
                실행
              </button>
              <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2">
                <Pause className="h-4 w-4" />
                일시정지
              </button>
              <button 
                onClick={() => onEdit(step)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                편집
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                설정
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* STEP 정보 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Tag className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">STEP ID</p>
                <p className="font-medium text-lg">#{step.id}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <div className="w-5 h-5 bg-yellow-600 rounded"></div>
              </div>
              <div>
                <p className="text-sm text-gray-500">상태</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(step.status)}`}>
                  {step.status}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">소요시간</p>
                <p className="font-medium">{step.duration}초</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">생성일</p>
                <p className="font-medium">{step.createdAt}</p>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 상세 정보 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 기본 정보 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">STEP 명칭</label>
                <p className="text-gray-900 font-medium">{step.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                <p className="text-gray-900">{step.description}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">STEP 유형</label>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(step.type)}`}>
                  {step.type}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">실행 순서</label>
                <p className="text-gray-900">#{step.order}</p>
              </div>
            </div>
          </div>

          {/* 실행 정보 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">실행 정보</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">현재 상태</label>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(step.status)}`}>
                  {step.status}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">예상 소요시간</label>
                <p className="text-gray-900">{step.duration}초</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">실행 조건</label>
                <p className="text-gray-900">이전 STEP 완료 후 실행</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">오류 처리</label>
                <p className="text-gray-900">오류 발생 시 다음 STEP으로 진행</p>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 설정 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">STEP 설정</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">실행 옵션</h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">실행 시 로그 기록</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-gray-700">실행 전 확인</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">오류 시 재시도</span>
                </label>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">고급 설정</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">타임아웃 (초)</label>
                  <input 
                    type="number" 
                    defaultValue="30"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">재시도 횟수</label>
                  <input 
                    type="number" 
                    defaultValue="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 실행 이력 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">실행 이력</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">성공</span>
                <span className="text-xs text-gray-500">2024.01.15 14:30:25</span>
              </div>
              <span className="text-xs text-gray-500">2.3초</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium">오류</span>
                <span className="text-xs text-gray-500">2024.01.14 16:45:12</span>
              </div>
              <span className="text-xs text-gray-500">5.1초</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">성공</span>
                <span className="text-xs text-gray-500">2024.01.13 09:15:33</span>
              </div>
              <span className="text-xs text-gray-500">1.8초</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StepDetailPage 