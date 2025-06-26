import React, { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Plus, Trash2, Minus, X, LogOut, Settings } from 'lucide-react'
import ConfirmDialog from './ConfirmDialog'
import ResultLogModal from './ResultLogModal'

const STEP_TYPES = ['PLAYWRIGHT', 'ROBOT']

function randomDate(base, offset = 0) {
  const d = new Date(base + offset)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`
}

// 24시간제 날짜 포맷 함수 추가
function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`
}

const PARAMS_SAMPLE = [
  { param: 'url', value: 'https://example.com' },
  { param: 'timeout', value: '30' },
]

const ACCOUNT_GROUPS = [
  { no: 1, name: '그룹1', desc: '기본 그룹' },
  { no: 2, name: '그룹2', desc: '특수 계정 그룹' },
  { no: 3, name: '그룹3', desc: '외부 연동 그룹' },
]

const DetailPage = ({ item, onBack, username, onLogout, isNewAction = false }) => {
  // 새 ACTION 모드일 때 더미 아이템 생성
  const displayItem = isNewAction ? {
    rpaName: '',
    scheduling: '',
    nextRun: '-',
    status: '대기',
    repeat: 'Y',
    startAt: '',
    endAt: '',
    description: '',
    regUser: username,
    regDate: '',
    modUser: username,
    modDate: '',
    no: 'NEW'
  } : item

  // STEP 샘플 데이터 (ACTION별 1~5개)
  const [steps, setSteps] = useState([])
  const [selected, setSelected] = useState([])
  const [allChecked, setAllChecked] = useState(false)
  const [selectedStep, setSelectedStep] = useState(null)
  const [stepParams, setStepParams] = useState({})
  const [stepPage, setStepPage] = useState(1)
  const STEP_PAGE_SIZE = 10

  // Action 상세 수정 가능한 필드
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const [repeat, setRepeat] = useState('Y')

  const [showGroupModal, setShowGroupModal] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  const [activeTab, setActiveTab] = useState('detail')
  
  // RPA 실행결과 관련 상태 추가
  const [executionResults, setExecutionResults] = useState([])
  const [selectedStepForResults, setSelectedStepForResults] = useState(null)
  
  // ResultLogModal 관련 상태 추가
  const [resultModalOpen, setResultModalOpen] = useState(false)
  const [resultModalData, setResultModalData] = useState({})
  
  // 컬럼 리사이즈 관련 상태 추가
  const [columnWidths, setColumnWidths] = useState({
    no: 60,
    order: 60,
    type: 100,
    scriptPath: 200,
    scriptFile: 150,
    accountGroup: 120,
    repeatByAccount: 120,
    scriptGenPath: 200,
    parallel: 80,
    status: 80,
    lastStartAt: 140,
    lastEndAt: 140,
    regUser: 80,
    regDate: 140,
    modUser: 80,
    modDate: 140
  })
  const [resizing, setResizing] = useState(null)

  const isInitialized = useRef(false)

  useEffect(() => {
    if (isNewAction) {
      // 새 ACTION 모드: 빈 데이터로 초기화
      setSteps([])
      setSelected([])
      setSelectedStep(null)
      setStartAt('')
      setEndAt('')
      setRepeat('Y')
      setStepParams({})
      setExecutionResults([])
      setSelectedStepForResults(null)
    } else if (displayItem && displayItem.no !== 'NEW') {
      // 기존 ACTION 모드: 기존 로직 유지
      const base = Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000
      const count = 3 // 항상 3개
      const sampleSteps = Array.from({ length: count }, (_, idx) => {
        return {
          id: `step-${idx + 1}`,
          no: idx + 1,
          order: idx + 1,
          type: STEP_TYPES[idx % STEP_TYPES.length],
          scriptPath: `/scripts/action${displayItem.no}/step${idx + 1}/`,
          scriptFile: `script${idx + 1}.js`,
          accountGroup: `그룹${(idx % 3) + 1}`,
          repeatByAccount: Math.random() > 0.5,
          scriptGenPath: `/gen/action${displayItem.no}/step${idx + 1}/`,
          parallel: Math.random() > 0.5,
          status: displayItem.status === '진행중' ? '진행중' : ['진행중', '성공', '실패'][Math.floor(Math.random() * 3)],
          lastStartAt: formatDate(base - Math.random() * 5 * 24 * 60 * 60 * 1000),
          lastEndAt: formatDate(base - Math.random() * 2 * 24 * 60 * 60 * 1000),
          regUser: `user${(idx % 5) + 1}`,
          regDate: randomDate(base - Math.random() * 5 * 24 * 60 * 60 * 1000),
          modUser: `user${(idx % 5) + 1}`,
          modDate: randomDate(base - Math.random() * 2 * 24 * 60 * 60 * 1000),
        }
      })
      setSteps(sampleSteps)
      setSelected([])
      setSelectedStep(null)
      setStartAt(displayItem.startAt ? displayItem.startAt.replace(' ', 'T').slice(0, 16) : '')
      setEndAt(displayItem.endAt ? displayItem.endAt.replace(' ', 'T').slice(0, 16) : '')
      setRepeat(displayItem.repeat || 'Y')
      // STEP별 파라미터 샘플 생성
      const paramObj = {}
      sampleSteps.forEach(s => {
        paramObj[s.id] = PARAMS_SAMPLE.map((p, i) => ({ no: i + 1, ...p }))
      })
      setStepParams(paramObj)
      // ACTION 변경 시 실행결과 초기화
      setExecutionResults([])
      setSelectedStepForResults(null)
    }
  }, [isNewAction])

  // selectedStep 변경 시 실행결과 자동 로드
  useEffect(() => {
    if (selectedStep && selectedStep.id) {
      loadExecutionResults(selectedStep)
    }
  }, [selectedStep])

  // 체크박스 핸들러
  const handleCheckAll = (e) => {
    setAllChecked(e.target.checked)
    if (e.target.checked) {
      setSelected(steps.map(s => s.id))
    } else {
      setSelected([])
    }
  }
  const handleCheck = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }
  useEffect(() => {
    setAllChecked(steps.length > 0 && steps.every(s => selected.includes(s.id)))
  }, [steps, selected])

  // 삭제 버튼
  const handleDelete = () => {
    if (selected.length === 0) return
    setSteps(prev => prev.filter(s => !selected.includes(s.id)))
    setSelected([])
    // 삭제된 STEP이 현재 선택된 실행결과 STEP인 경우 초기화
    if (selectedStepForResults && selected.includes(selectedStepForResults.id)) {
      setExecutionResults([])
      setSelectedStepForResults(null)
    }
  }

  // STEP 상세 파라미터 조작
  const handleParamChange = (idx, key, value) => {
    if (!selectedStep) return
    setStepParams(prev => {
      const arr = [...(prev[selectedStep.id] || [])]
      arr[idx][key] = value
      return { ...prev, [selectedStep.id]: arr }
    })
  }
  const handleParamAdd = () => {
    if (!selectedStep) return
    setStepParams(prev => {
      const arr = [...(prev[selectedStep.id] || [])]
      arr.push({ no: arr.length + 1, param: '', value: '' })
      return { ...prev, [selectedStep.id]: arr }
    })
  }
  const handleParamDelete = (idx) => {
    if (!selectedStep) return
    setStepParams(prev => {
      let arr = [...(prev[selectedStep.id] || [])]
      arr.splice(idx, 1)
      arr = arr.map((p, i) => ({ ...p, no: i + 1 }))
      return { ...prev, [selectedStep.id]: arr }
    })
  }

  // STEP 목록 페이징 처리
  const stepPageCount = Math.ceil(steps.length / STEP_PAGE_SIZE)
  const pagedSteps = steps.slice((stepPage - 1) * STEP_PAGE_SIZE, stepPage * STEP_PAGE_SIZE)

  const handleStepSave = () => {
    // 실제 저장 로직 (예시)
    setSelectedStep(null)
  }
  const handleStepSaveClick = () => setConfirmSaveOpen(true)
  const handleConfirmSave = () => {
    handleStepSave()
    setConfirmSaveOpen(false)
  }
  const handleCancelSave = () => setConfirmSaveOpen(false)

  // STEP별 RPA 실행결과 로드 함수
  const loadExecutionResults = (step) => {
    const base = Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000
    const results = [
      {
        no: 1,
        account: `user${step.no}01`,
        result: step.status === '진행중' ? '진행중' : '성공',
        startTime: formatDate(base - Math.random() * 5 * 24 * 60 * 60 * 1000),
        endTime: step.status === '진행중' ? '-' : formatDate(base - Math.random() * 2 * 24 * 60 * 60 * 1000)
      },
      {
        no: 2,
        account: `user${step.no}02`,
        result: '실패',
        startTime: formatDate(base - Math.random() * 3 * 24 * 60 * 60 * 1000),
        endTime: formatDate(base - Math.random() * 1 * 24 * 60 * 60 * 1000)
      },
      {
        no: 3,
        account: `user${step.no}03`,
        result: step.status === '진행중' ? '진행중' : '성공',
        startTime: formatDate(base - Math.random() * 1 * 24 * 60 * 60 * 1000),
        endTime: step.status === '진행중' ? '-' : formatDate(base - Math.random() * 0.5 * 24 * 60 * 60 * 1000)
      }
    ]
    setExecutionResults(results)
    setSelectedStepForResults(step)
  }

  // 조회 버튼 클릭 핸들러
  const handleSearchResults = () => {
    if (selectedStepForResults) {
      loadExecutionResults(selectedStepForResults)
    }
  }

  // RPA 실행결과 더블클릭 핸들러
  const handleResultRowDoubleClick = (result) => {
    setResultModalData({
      log: `STEP ${selectedStepForResults?.no} 실행결과 로그\n---------------------\n실행계정: ${result.account}\nRPA실행결과: ${result.result}\n실행시작일시: ${result.startTime}\n실행종료일시: ${result.endTime}\n\n로그 내용이 길게 들어갈 수 있습니다.\n에러/성공 메시지, 상세 트레이스, 기타 정보 등...\n\n[INFO] STEP ${selectedStepForResults?.no} 작업 시작\n[INFO] ${selectedStepForResults?.type} 스크립트 실행\n[INFO] 중간 처리 진행\n${result.result === '실패' ? '[ERROR] 예외 발생\n[ERROR] 스크립트 실행 중 오류' : '[INFO] 정상 처리 완료'}\n[INFO] 작업 종료`,
      inputParams: [
        { param: 'stepNo', value: selectedStepForResults?.no || '' },
        { param: 'account', value: result.account },
        { param: 'scriptPath', value: selectedStepForResults?.scriptPath || '' },
        { param: 'scriptFile', value: selectedStepForResults?.scriptFile || '' },
      ],
      outputParams: [
        { param: 'result', value: result.result },
        { param: 'startTime', value: result.startTime },
        { param: 'endTime', value: result.endTime },
        { param: 'message', value: result.result === '성공' ? '정상 처리 완료' : '실행 중 오류 발생' },
      ],
    })
    setResultModalOpen(true)
  }

  // 컬럼 리사이즈 핸들러들
  const handleResizeStart = (e, column) => {
    e.preventDefault()
    e.stopPropagation()
    setResizing(column)
    
    const handleMouseMove = (moveEvent) => {
      if (!resizing) return
      
      const table = document.querySelector('.step-table')
      if (!table) return
      
      const rect = table.getBoundingClientRect()
      const tableLeft = rect.left
      const newWidth = moveEvent.clientX - tableLeft
      
      setColumnWidths(prev => ({
        ...prev,
        [column]: Math.max(50, newWidth)
      }))
    }
    
    const handleMouseUp = () => {
      setResizing(null)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleResizeMove = (e) => {
    if (!resizing) return
    
    const table = e.target.closest('table')
    if (!table) return
    
    const rect = table.getBoundingClientRect()
    const newWidth = e.clientX - rect.left
    
    setColumnWidths(prev => ({
      ...prev,
      [resizing]: Math.max(50, newWidth)
    }))
  }

  const handleResizeEnd = () => {
    setResizing(null)
    document.removeEventListener('mousemove', handleResizeMove)
    document.removeEventListener('mouseup', handleResizeEnd)
  }

  const handleStepAdd = () => {
    console.log('handleStepAdd called')
    const newStep = {
      id: `step-${Date.now()}`,
      no: '',
      order: '',
      type: '',
      scriptPath: '',
      scriptFile: '',
      accountGroup: '',
      repeatByAccount: false,
      scriptGenPath: '',
      parallel: false,
      status: '',
      lastStartAt: '',
      lastEndAt: '',
      regUser: username,
      regDate: formatDate(new Date()),
      modUser: username,
      modDate: formatDate(new Date()),
    }
    console.log('New step:', newStep)
    setSteps(prev => {
      console.log('Previous steps:', prev)
      const newSteps = [...prev, newStep]
      console.log('New steps:', newSteps)
      return newSteps
    })
    setStepParams(prev => ({ ...prev, [newStep.id]: [{ no: 1, param: '', value: '' }] }))
    setSelectedStep(newStep)
    // 새 STEP 추가 시 RPA 실행결과 완전 초기화
    setExecutionResults([])
    setSelectedStepForResults(null)
    // 새 STEP이 추가될 페이지 계산
    const newStepPage = Math.ceil((steps.length + 1) / STEP_PAGE_SIZE)
    setStepPage(newStepPage)
  }

  const handleDeleteClick = () => setConfirmDeleteOpen(true)
  const handleConfirmDelete = () => {
    handleDelete()
    setConfirmDeleteOpen(false)
  }
  const handleCancelDelete = () => setConfirmDeleteOpen(false)

  if (!item && !isNewAction) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">ACTION을 찾을 수 없습니다</h2>
          <button onClick={onBack} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            목록으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isNewAction ? 'ACTION 마스터 신규' : 'ACTION 마스터 관리'}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">환영합니다, {username}님</span>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="h-5 w-5" />
              </button>
              <button 
                onClick={onLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4" />
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action 상세 정보 (compact) */}
      <div className="container mx-auto px-4 pt-4 pb-2">
        <div className="flex justify-end mb-2">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-700 hover:underline px-2 py-1"
          >
            <ArrowLeft className="h-4 w-4" />
            ACTION 마스터 목록으로 돌아가기
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="text-base font-semibold text-gray-900 mb-2">ACTION 마스터 상세</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 items-center text-xs">
            <div>
              <label className="block text-gray-500">RPA명</label>
              <input 
                className="w-full px-2 py-1 border border-gray-200 rounded text-xs" 
                value={isNewAction ? '' : displayItem.rpaName} 
                readOnly={!isNewAction}
                placeholder={isNewAction ? "RPA명 입력" : ""}
              />
            </div>
            <div>
              <label className="block text-gray-500">스케줄링</label>
              <input 
                className="w-full px-2 py-1 border border-gray-200 rounded text-xs" 
                value={isNewAction ? '' : displayItem.scheduling} 
                readOnly={!isNewAction}
                placeholder={isNewAction ? "스케줄링 입력" : ""}
              />
            </div>
            <div>
              <label className="block text-gray-500">다음실행시간</label>
              <input className="w-full px-2 py-1 border border-gray-100 rounded text-xs bg-gray-100" value={isNewAction ? '-' : displayItem.nextRun} readOnly disabled />
            </div>
            <div>
              <label className="block text-gray-500">상태</label>
              <input className="w-full px-2 py-1 border border-gray-100 rounded text-xs bg-gray-100" value={isNewAction ? '대기' : displayItem.status} readOnly disabled />
            </div>
            <div>
              <label className="block text-gray-500">반복유무</label>
              <select
                className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                value={repeat}
                onChange={e => setRepeat(e.target.value)}
              >
                <option value="Y">Y</option>
                <option value="N">N</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-500">시작일시</label>
              <input
                type="datetime-local"
                className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                value={startAt}
                onChange={e => setStartAt(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-500">종료일시</label>
              <input
                type="datetime-local"
                className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                value={endAt}
                onChange={e => setEndAt(e.target.value)}
              />
            </div>
            <div className="md:col-span-2 lg:col-span-4">
              <label className="block text-gray-500">설명</label>
              <textarea 
                className="w-full px-2 py-1 border border-gray-200 rounded text-xs" 
                value={isNewAction ? '' : displayItem.description} 
                readOnly={!isNewAction}
                placeholder={isNewAction ? "설명 입력" : ""}
                rows={1} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* STEP 테이블 */}
      <div className="container mx-auto px-4 pb-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-base font-semibold text-gray-900">STEP 목록</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 text-xs" onClick={handleStepAdd}>
                <Plus className="h-4 w-4" />새 STEP
              </button>
              <button
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2 text-xs"
                onClick={handleDeleteClick}
                disabled={selected.length === 0}
              >
                <Trash2 className="h-4 w-4" />삭제
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="step-table min-w-full divide-y divide-gray-200 text-xs" style={{ tableLayout: 'fixed', minWidth: 'max-content' }}>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 text-center relative" style={{ width: '40px' }}>
                    <input type="checkbox" checked={allChecked} onChange={handleCheckAll} />
                  </th>
                  <th className="px-2 py-2 relative whitespace-nowrap" style={{ width: `${columnWidths.no}px` }}>
                    NO
                    <div 
                      className="absolute top-0 right-0 w-0.5 h-full bg-transparent hover:bg-blue-400 cursor-col-resize"
                      onMouseDown={(e) => handleResizeStart(e, 'no')}
                    />
                  </th>
                  <th className="px-2 py-2 relative whitespace-nowrap" style={{ width: `${columnWidths.order}px` }}>
                    순서
                    <div 
                      className="absolute top-0 right-0 w-0.5 h-full bg-transparent hover:bg-blue-400 cursor-col-resize"
                      onMouseDown={(e) => handleResizeStart(e, 'order')}
                    />
                  </th>
                  <th className="px-2 py-2 relative whitespace-nowrap" style={{ width: `${columnWidths.type}px` }}>
                    RPA구분
                    <div 
                      className="absolute top-0 right-0 w-0.5 h-full bg-transparent hover:bg-blue-400 cursor-col-resize"
                      onMouseDown={(e) => handleResizeStart(e, 'type')}
                    />
                  </th>
                  <th className="px-2 py-2 relative whitespace-nowrap" style={{ width: `${columnWidths.scriptPath}px` }}>
                    실행스크립트위치
                    <div 
                      className="absolute top-0 right-0 w-0.5 h-full bg-transparent hover:bg-blue-400 cursor-col-resize"
                      onMouseDown={(e) => handleResizeStart(e, 'scriptPath')}
                    />
                  </th>
                  <th className="px-2 py-2 relative whitespace-nowrap" style={{ width: `${columnWidths.scriptFile}px` }}>
                    실행스크립트파일명
                    <div 
                      className="absolute top-0 right-0 w-0.5 h-full bg-transparent hover:bg-blue-400 cursor-col-resize"
                      onMouseDown={(e) => handleResizeStart(e, 'scriptFile')}
                    />
                  </th>
                  <th className="px-2 py-2 relative whitespace-nowrap" style={{ width: `${columnWidths.accountGroup}px` }}>
                    계정그룹명
                    <div 
                      className="absolute top-0 right-0 w-0.5 h-full bg-transparent hover:bg-blue-400 cursor-col-resize"
                      onMouseDown={(e) => handleResizeStart(e, 'accountGroup')}
                    />
                  </th>
                  <th className="px-2 py-2 relative whitespace-nowrap" style={{ width: `${columnWidths.repeatByAccount}px` }}>
                    계정별반복유무
                    <div 
                      className="absolute top-0 right-0 w-0.5 h-full bg-transparent hover:bg-blue-400 cursor-col-resize"
                      onMouseDown={(e) => handleResizeStart(e, 'repeatByAccount')}
                    />
                  </th>
                  <th className="px-2 py-2 relative whitespace-nowrap" style={{ width: `${columnWidths.scriptGenPath}px` }}>
                    실행스크립트생성위치
                    <div 
                      className="absolute top-0 right-0 w-0.5 h-full bg-transparent hover:bg-blue-400 cursor-col-resize"
                      onMouseDown={(e) => handleResizeStart(e, 'scriptGenPath')}
                    />
                  </th>
                  <th className="px-2 py-2 relative whitespace-nowrap" style={{ width: `${columnWidths.parallel}px` }}>
                    병렬처리
                    <div 
                      className="absolute top-0 right-0 w-0.5 h-full bg-transparent hover:bg-blue-400 cursor-col-resize"
                      onMouseDown={(e) => handleResizeStart(e, 'parallel')}
                    />
                  </th>
                  <th className="px-2 py-2 relative whitespace-nowrap" style={{ width: `${columnWidths.status}px` }}>
                    진행상태
                    <div 
                      className="absolute top-0 right-0 w-0.5 h-full bg-transparent hover:bg-blue-400 cursor-col-resize"
                      onMouseDown={(e) => handleResizeStart(e, 'status')}
                    />
                  </th>
                  <th className="px-2 py-2 relative whitespace-nowrap" style={{ width: `${columnWidths.lastStartAt}px` }}>
                    실행시작일시
                    <div 
                      className="absolute top-0 right-0 w-0.5 h-full bg-transparent hover:bg-blue-400 cursor-col-resize"
                      onMouseDown={(e) => handleResizeStart(e, 'lastStartAt')}
                    />
                  </th>
                  <th className="px-2 py-2 relative whitespace-nowrap" style={{ width: `${columnWidths.lastEndAt}px` }}>
                    실행종료일시
                    <div 
                      className="absolute top-0 right-0 w-0.5 h-full bg-transparent hover:bg-blue-400 cursor-col-resize"
                      onMouseDown={(e) => handleResizeStart(e, 'lastEndAt')}
                    />
                  </th>
                  <th className="px-2 py-2 relative whitespace-nowrap" style={{ width: `${columnWidths.regUser}px` }}>
                    등록자
                    <div 
                      className="absolute top-0 right-0 w-0.5 h-full bg-transparent hover:bg-blue-400 cursor-col-resize"
                      onMouseDown={(e) => handleResizeStart(e, 'regUser')}
                    />
                  </th>
                  <th className="px-2 py-2 relative whitespace-nowrap" style={{ width: `${columnWidths.regDate}px` }}>
                    등록일시
                    <div 
                      className="absolute top-0 right-0 w-0.5 h-full bg-transparent hover:bg-blue-400 cursor-col-resize"
                      onMouseDown={(e) => handleResizeStart(e, 'regDate')}
                    />
                  </th>
                  <th className="px-2 py-2 relative whitespace-nowrap" style={{ width: `${columnWidths.modUser}px` }}>
                    수정자
                    <div 
                      className="absolute top-0 right-0 w-0.5 h-full bg-transparent hover:bg-blue-400 cursor-col-resize"
                      onMouseDown={(e) => handleResizeStart(e, 'modUser')}
                    />
                  </th>
                  <th className="px-2 py-2 relative whitespace-nowrap" style={{ width: `${columnWidths.modDate}px` }}>
                    수정일시
                    <div 
                      className="absolute top-0 right-0 w-0.5 h-full bg-transparent hover:bg-blue-400 cursor-col-resize"
                      onMouseDown={(e) => handleResizeStart(e, 'modDate')}
                    />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pagedSteps.map((step) => (
                  <tr key={step.id} className={`hover:bg-blue-50 cursor-pointer ${selectedStep && selectedStep.id === step.id ? 'bg-blue-100' : ''} ${step.status === '진행중' ? 'bg-yellow-100' : ''}`}
                    onClick={() => {
                      setSelectedStep(step)
                      loadExecutionResults(step)
                    }}>
                    <td className="px-2 py-2 text-center" style={{ width: '40px' }}>
                      <input
                        type="checkbox"
                        checked={selected.includes(step.id)}
                        onChange={() => handleCheck(step.id)}
                        onClick={e => e.stopPropagation()}
                      />
                    </td>
                    <td className="px-2 py-2 text-center" style={{ width: `${columnWidths.no}px` }}>{step.no}</td>
                    <td className="px-2 py-2 text-center" style={{ width: `${columnWidths.order}px` }}>{step.order}</td>
                    <td className="px-2 py-2 text-center" style={{ width: `${columnWidths.type}px` }}>{step.type}</td>
                    <td className="px-2 py-2 truncate" style={{ width: `${columnWidths.scriptPath}px` }} title={step.scriptPath}>{step.scriptPath}</td>
                    <td className="px-2 py-2 truncate" style={{ width: `${columnWidths.scriptFile}px` }} title={step.scriptFile}>{step.scriptFile}</td>
                    <td className="px-2 py-2 text-center" style={{ width: `${columnWidths.accountGroup}px` }}>{step.accountGroup}</td>
                    <td className="px-2 py-2 text-center" style={{ width: `${columnWidths.repeatByAccount}px` }}>
                      <input type="checkbox" checked={step.repeatByAccount} readOnly disabled />
                    </td>
                    <td className="px-2 py-2 truncate" style={{ width: `${columnWidths.scriptGenPath}px` }} title={step.scriptGenPath}>{step.scriptGenPath}</td>
                    <td className="px-2 py-2 text-center" style={{ width: `${columnWidths.parallel}px` }}>
                      <input type="checkbox" checked={step.parallel} readOnly disabled />
                    </td>
                    <td className={`px-2 py-2 text-center font-semibold ${step.status === '성공' ? 'text-blue-600' : step.status === '실패' ? 'text-red-600' : ''}`} style={{ width: `${columnWidths.status}px` }}>{step.status}</td>
                    <td className="px-2 py-2 text-center" style={{ width: `${columnWidths.lastStartAt}px` }}>{step.lastStartAt}</td>
                    <td className="px-2 py-2 text-center" style={{ width: `${columnWidths.lastEndAt}px` }}>{step.lastEndAt}</td>
                    <td className="px-2 py-2 text-center" style={{ width: `${columnWidths.regUser}px` }}>{step.regUser}</td>
                    <td className="px-2 py-2 text-center" style={{ width: `${columnWidths.regDate}px` }}>{step.regDate}</td>
                    <td className="px-2 py-2 text-center" style={{ width: `${columnWidths.modUser}px` }}>{step.modUser}</td>
                    <td className="px-2 py-2 text-center" style={{ width: `${columnWidths.modDate}px` }}>{step.modDate}</td>
                  </tr>
                ))}
                {pagedSteps.length === 0 && (
                  <tr>
                    <td colSpan={17} className="text-center py-8 text-gray-400">
                      {isNewAction ? '새 STEP을 추가해주세요' : 'STEP이 없습니다'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* STEP 목록 페이징 UI */}
          <div className="flex justify-center items-center gap-2 mt-4">
            <button
              className="px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 text-xs"
              onClick={() => setStepPage(stepPage - 1)}
              disabled={stepPage === 1}
            >
              이전
            </button>
            {Array.from({ length: stepPageCount }, (_, i) => (
              <button
                key={i}
                className={`px-3 py-1 rounded text-xs ${stepPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'}`}
                onClick={() => setStepPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 text-xs"
              onClick={() => setStepPage(stepPage + 1)}
              disabled={stepPage === stepPageCount}
            >
              다음
            </button>
          </div>
        </div>
      </div>

      {/* STEP 상세 (하단) */}
      {selectedStep && (
        <div className="container mx-auto px-4 pb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mt-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-base font-semibold text-gray-900">STEP 마스터 관리</span>
              {activeTab === 'detail' && (
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs" onClick={handleStepSaveClick}>저장</button>
                  <button className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-xs">취소</button>
                </div>
              )}
            </div>
            
            {/* 탭 네비게이션 - 더 명확하게 보이도록 개선 */}
            <div className="bg-gray-50 rounded-t-lg border border-gray-200 mb-0">
              <nav className="flex">
                <button
                  className={`px-6 py-3 font-medium text-sm rounded-t-lg transition-colors ${
                    activeTab === 'detail' 
                      ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('detail')}
                >
                  STEP 상세
                </button>
                <button
                  className={`px-6 py-3 font-medium text-sm rounded-t-lg transition-colors ${
                    activeTab === 'result' 
                      ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('result')}
                >
                  RPA 실행결과
                </button>
              </nav>
            </div>

            {/* 탭 컨텐츠 */}
            <div className="bg-white border border-gray-200 border-t-0 rounded-b-lg p-4">
              {activeTab === 'detail' && (
                <div className="flex flex-col md:flex-row gap-6">
                  {/* 왼쪽: STEP 상세내용 (compact grid, 일부 체크박스/한줄 배치) */}
                  <div className="flex-1 min-w-[250px]">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 items-center text-xs">
                      <div>
                        <label className="block text-gray-500">순서</label>
                        <input className="w-full px-2 py-1 border border-gray-200 rounded text-xs" value={selectedStep.order} onChange={e => setSelectedStep(s => ({ ...s, order: e.target.value }))} />
                      </div>
                      <div>
                        <label className="block text-gray-500">RPA구분</label>
                        <select className="w-full px-2 py-1 border border-gray-200 rounded text-xs" value={selectedStep.type} onChange={e => setSelectedStep(s => ({ ...s, type: e.target.value }))}>
                          {STEP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col">
                        <label className="block text-gray-500 mb-1">병렬처리</label>
                        <input type="checkbox" className="h-4 w-4" checked={selectedStep.parallel} onChange={e => setSelectedStep(s => ({ ...s, parallel: e.target.checked }))} />
                      </div>
                      <div className="flex flex-col">
                        <label className="block text-gray-500 mb-1">계정별반복유무</label>
                        <input type="checkbox" className="h-4 w-4" checked={selectedStep.repeatByAccount} onChange={e => setSelectedStep(s => ({ ...s, repeatByAccount: e.target.checked }))} />
                      </div>
                      {/* 실행스크립트위치/파일명 한 줄 배치 */}
                      <div className="md:col-span-2 lg:col-span-4 flex gap-2 items-center">
                        <div className="flex-1">
                          <label className="block text-gray-500">실행스크립트위치</label>
                          <input className="w-full px-2 py-1 border border-gray-200 rounded text-xs" value={selectedStep.scriptPath} onChange={e => setSelectedStep(s => ({ ...s, scriptPath: e.target.value }))} />
                        </div>
                        <div className="flex-1">
                          <label className="block text-gray-500">실행스크립트파일명</label>
                          <input className="w-full px-2 py-1 border border-gray-200 rounded text-xs" value={selectedStep.scriptFile} onChange={e => setSelectedStep(s => ({ ...s, scriptFile: e.target.value }))} />
                        </div>
                      </div>
                      <div className="md:col-span-2 lg:col-span-4">
                        <label className="block text-gray-500">실행스크립트생성위치</label>
                        <input className="w-full px-2 py-1 border border-gray-200 rounded text-xs" value={selectedStep.scriptGenPath} onChange={e => setSelectedStep(s => ({ ...s, scriptGenPath: e.target.value }))} />
                      </div>
                      <div>
                        <label className="block text-gray-500">계정그룹명</label>
                        <input className="w-full px-2 py-1 border border-gray-200 rounded text-xs" value={selectedStep.accountGroup} readOnly />
                      </div>
                      <div className="flex items-end h-full">
                        <button type="button" className="h-8 px-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs" onClick={() => setShowGroupModal(true)}>계정그룹 설정</button>
                      </div>
                    </div>
                  </div>
                  {/* 오른쪽: 파라미터 테이블 (기존 구조, border 없음) */}
                  <div className="flex-1 min-w-[250px]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900 text-xs">파라미터 목록</span>
                      <button className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1 text-xs" onClick={handleParamAdd}>
                        <Plus className="h-3 w-3" />추가
                      </button>
                    </div>
                    <table className="w-full text-xs mb-2">
                      <thead>
                        <tr>
                          <th className="bg-gray-100 text-gray-600 font-normal px-2 py-1 w-10 text-center">NO</th>
                          <th className="bg-gray-100 text-gray-600 font-normal px-2 py-1 text-center">파라미터</th>
                          <th className="bg-gray-100 text-gray-600 font-normal px-2 py-1 text-center">값</th>
                          <th className="bg-gray-100 text-gray-600 font-normal px-2 py-1 text-center"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {(stepParams[selectedStep.id] || []).map((param, idx) => (
                          <tr key={idx}>
                            <td className="px-2 py-1 text-center">{param.no}</td>
                            <td className="px-2 py-1"><input className="w-full px-1 py-0.5 border border-gray-200 rounded text-xs" value={param.param} onChange={e => handleParamChange(idx, 'param', e.target.value)} /></td>
                            <td className="px-2 py-1"><input className="w-full px-1 py-0.5 border border-gray-200 rounded text-xs" value={param.value} onChange={e => handleParamChange(idx, 'value', e.target.value)} /></td>
                            <td className="px-2 py-1 text-center">
                              <button className="text-red-500 hover:text-red-700" onClick={e => { e.preventDefault(); handleParamDelete(idx) }}><Minus className="h-3 w-3" /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'result' && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-base font-semibold text-gray-900">RPA 실행결과 목록</span>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs" onClick={handleSearchResults}>
                      조회
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-xs">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 py-2 text-center">NO</th>
                          <th className="px-2 py-2 text-center">실행계정</th>
                          <th className="px-2 py-2 text-center">RPA실행결과</th>
                          <th className="px-2 py-2 text-center">실행시작일시</th>
                          <th className="px-2 py-2 text-center">실행종료일시</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {executionResults.map((result, idx) => (
                          <tr key={idx} className={`hover:bg-blue-50 cursor-pointer ${result.result === '진행중' ? 'bg-yellow-100' : ''}`}
                            onDoubleClick={() => handleResultRowDoubleClick(result)}>
                            <td className="px-2 py-2 text-center">{result.no}</td>
                            <td className="px-2 py-2 text-center">{result.account}</td>
                            <td className={`px-2 py-2 text-center font-semibold ${
                              result.result === '성공' ? 'text-blue-600' : 
                              result.result === '실패' ? 'text-red-600' : ''
                            }`}>
                              {result.result}
                            </td>
                            <td className="px-2 py-2 text-center">{result.startTime}</td>
                            <td className="px-2 py-2 text-center">{result.endTime}</td>
                          </tr>
                        ))}
                        {executionResults.length === 0 && (
                          <tr>
                            <td colSpan={5} className="text-center py-8 text-gray-400">
                              {isNewAction ? '새 ACTION 등록 후 실행결과가 표시됩니다' : 'STEP을 선택하면 실행결과가 표시됩니다'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 계정 그룹 설정 모달 */}
      {showGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowGroupModal(false)}><X className="w-5 h-5" /></button>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">계정 그룹 설정</h2>
            <table className="w-full text-xs mb-4">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-center">선택</th>
                  <th className="px-2 py-1 text-center">NO</th>
                  <th className="px-2 py-1 text-center">계정 그룹 명</th>
                  <th className="px-2 py-1 text-center">비고</th>
                </tr>
              </thead>
              <tbody>
                {ACCOUNT_GROUPS.map(g => (
                  <tr key={g.no} className="hover:bg-blue-50">
                    <td className="px-2 py-1 text-center">
                      <input type="radio" name="accountGroup" checked={selectedGroup === g.name} onChange={() => setSelectedGroup(g.name)} />
                    </td>
                    <td className="px-2 py-1 text-center">{g.no}</td>
                    <td className="px-2 py-1 text-center">{g.name}</td>
                    <td className="px-2 py-1 text-center">{g.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs" onClick={() => {
                if (selectedGroup) {
                  setSelectedStep(s => ({ ...s, accountGroup: selectedGroup }))
                  setShowGroupModal(false)
                }
              }}>확인</button>
              <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-xs" onClick={() => setShowGroupModal(false)}>취소</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmSaveOpen}
        message="저장 하시겠습니까?"
        onConfirm={handleConfirmSave}
        onCancel={handleCancelSave}
      />

      <ConfirmDialog
        open={confirmDeleteOpen}
        message="삭제하시겠습니까?"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <ResultLogModal
        open={resultModalOpen}
        onClose={() => setResultModalOpen(false)}
        log={resultModalData.log}
        inputParams={resultModalData.inputParams}
        outputParams={resultModalData.outputParams}
      />
    </div>
  )
}

export default DetailPage 