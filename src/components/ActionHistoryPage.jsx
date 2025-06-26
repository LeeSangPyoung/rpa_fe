import React, { useState, useEffect } from 'react'
import { Search, LogOut, Settings, ChevronLeft, ChevronRight } from 'lucide-react'
import ResultLogModal from './ResultLogModal'

const PAGE_SIZE = 10
const rpaStatusList = ['전체', '성공', '실패']
const ACTIONS = [
  { key: 'action1', label: 'RPA 작업 1' },
  { key: 'action2', label: 'RPA 작업 2' },
  { key: 'action3', label: 'RPA 작업 3' },
]
const STEPS = {
  action1: [1, 2, 3],
  action2: [1, 2, 3],
  action3: [1, 2, 3],
}

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

const ActionHistoryPage = ({ username, onLogout }) => {
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState({
    actionKey: '',
    step: '',
    actionStatus: '전체',
    execFrom: '',
    execTo: '',
  })
  const [resultModalOpen, setResultModalOpen] = useState(false)
  const [resultModalData, setResultModalData] = useState({})

  // 샘플 데이터 생성: ACTION 3개, 각 ACTION별 STEP 3개, 각 STEP별 계정 3개
  useEffect(() => {
    const sampleData = []
    let rowNo = 1
    
    // ACTION별 STEP 결과를 추적하기 위한 객체
    const actionStepResults = {}
    
    for (const action of ACTIONS) {
      const actionName = action.label
      actionStepResults[action.key] = []
      
      for (let stepOrder = 1; stepOrder <= 3; stepOrder++) {
        // STEP별 RPA 실행결과 생성
        const rpaResults = []
        for (let accountIdx = 1; accountIdx <= 3; accountIdx++) {
          const execAccount = `account${accountIdx}`
          const rpaResult = Math.random() > 0.2 ? '성공' : '실패'
          const base = Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000
          const execStart = base
          const execEnd = base + Math.random() * 2 * 60 * 60 * 1000
          rpaResults.push({
            execAccount,
            rpaResult,
            execStart: formatDate(execStart),
            execEnd: formatDate(execEnd),
          })
        }
        // STEP 실행결과: 모든 RPA가 성공이면 성공
        const stepResult = rpaResults.every(r => r.rpaResult === '성공') ? '성공' : '실패'
        actionStepResults[action.key].push(stepResult)
        
        for (const rpaRow of rpaResults) {
          sampleData.push({
            no: rowNo++,
            actionKey: action.key,
            actionName,
            stepOrder,
            stepResult,
            execAccount: rpaRow.execAccount,
            rpaResult: rpaRow.rpaResult,
            execStart: rpaRow.execStart,
            execEnd: rpaRow.execEnd,
          })
        }
      }
    }
    
    // ACTION 실행결과 계산: 모든 STEP이 성공이면 성공
    sampleData.forEach(item => {
      const actionSteps = actionStepResults[item.actionKey]
      item.actionResult = actionSteps.every(stepResult => stepResult === '성공') ? '성공' : '실패'
    })
    
    setData(sampleData)
    setFilteredData(sampleData)
  }, [])

  // 검색 필터링
  const handleSearch = () => {
    let filtered = data.filter(item => {
      if (search.actionKey && item.actionKey !== search.actionKey) return false
      if (search.step && String(item.stepOrder) !== String(search.step)) return false
      if (search.actionStatus !== '전체' && item.actionResult !== search.actionStatus) return false
      if (search.execFrom && item.execStart < search.execFrom) return false
      if (search.execTo && item.execEnd > search.execTo) return false
      return true
    })
    setFilteredData(filtered)
    setPage(1)
  }

  // 초기화
  const handleReset = () => {
    setSearch({
      actionKey: '',
      step: '',
      actionStatus: '전체',
      execFrom: '',
      execTo: '',
    })
    setFilteredData(data)
    setPage(1)
  }

  // 페이징 처리
  const pageCount = Math.ceil(filteredData.length / PAGE_SIZE)
  const pagedData = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // STEP 드롭박스 옵션
  const stepOptions = search.actionKey ? STEPS[search.actionKey] : []

  // 테이블 row 클릭 핸들러
  const handleRowClick = (item) => {
    setResultModalData({
      log: `샘플 RESULT LOG\n---------------------\n${item.actionName} / STEP ${item.stepOrder} / ${item.execAccount}\n실행결과: ${item.rpaResult}\n\n로그 내용이 길게 들어갈 수 있습니다.\n에러/성공 메시지, 상세 트레이스, 기타 정보 등...\n\n[INFO] 작업 시작\n[INFO] 중간 처리\n[ERROR] 예외 발생 (예시)\n[INFO] 작업 종료`,
      inputParams: [
        { param: 'url', value: 'https://example.com' },
        { param: 'timeout', value: '30' },
      ],
      outputParams: [
        { param: 'result', value: item.rpaResult },
        { param: 'message', value: item.rpaResult === '성공' ? 'OK' : '에러 발생' },
      ],
    })
    setResultModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ACTION 실행이력 조회</h1>
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

      <div className="container mx-auto px-4 py-8">
        {/* 검색 및 필터 */}
        <div className="bg-white rounded shadow-sm p-6 mb-6">
          <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4" onSubmit={e => {e.preventDefault(); handleSearch()}}>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">ACTION</label>
              <select
                value={search.actionKey}
                onChange={e => setSearch(s => ({ ...s, actionKey: e.target.value, step: '' }))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
              >
                <option value="">전체</option>
                {ACTIONS.map(a => <option key={a.key} value={a.key}>{a.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">STEP</label>
              <select
                value={search.step}
                onChange={e => setSearch(s => ({ ...s, step: e.target.value }))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                disabled={!search.actionKey}
              >
                <option value="">전체</option>
                {stepOptions.map(step => <option key={step} value={step}>{step}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">실행일시(From)</label>
              <input
                type="datetime-local"
                value={search.execFrom}
                onChange={e => setSearch(s => ({ ...s, execFrom: e.target.value }))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">실행일시(To)</label>
              <input
                type="datetime-local"
                value={search.execTo}
                onChange={e => setSearch(s => ({ ...s, execTo: e.target.value }))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">ACTION 실행결과</label>
              <select
                value={search.actionStatus}
                onChange={e => setSearch(s => ({ ...s, actionStatus: e.target.value }))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
              >
                {rpaStatusList.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </form>
          <div className="flex justify-end gap-2 mb-2">
            <button
              className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 flex items-center gap-2 text-xs"
              onClick={handleReset}
            >
              초기화
            </button>
            <button
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 text-xs"
              onClick={handleSearch}
            >
              <Search className="h-4 w-4" />검색
            </button>
          </div>
        </div>

        {/* 테이블 */}
        <div className="bg-white rounded shadow-sm border border-gray-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-center">NO</th>
                <th className="px-2 py-2 text-center">ACTION명</th>
                <th className="px-2 py-2 text-center">ACTION 실행결과</th>
                <th className="px-2 py-2 text-center">STEP 순번</th>
                <th className="px-2 py-2 text-center">STEP 실행결과</th>
                <th className="px-2 py-2 text-center">실행계정</th>
                <th className="px-2 py-2 text-center">RPA실행결과</th>
                <th className="px-2 py-2 text-center">실행시작시간</th>
                <th className="px-2 py-2 text-center">실행종료시간</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pagedData.map((item) => (
                <tr key={item.no} className="hover:bg-blue-50 cursor-pointer" onClick={() => handleRowClick(item)}>
                  <td className="px-2 py-2 text-center">{item.no}</td>
                  <td className="px-2 py-2 truncate max-w-[10rem]" title={item.actionName}>{item.actionName}</td>
                  <td className={`px-2 py-2 text-center font-semibold ${item.actionResult === '성공' ? 'text-blue-600' : 'text-red-600'}`}>{item.actionResult}</td>
                  <td className="px-2 py-2 text-center">{item.stepOrder}</td>
                  <td className={`px-2 py-2 text-center font-semibold ${item.stepResult === '성공' ? 'text-blue-600' : 'text-red-600'}`}>{item.stepResult}</td>
                  <td className="px-2 py-2 text-center">{item.execAccount}</td>
                  <td className={`px-2 py-2 text-center font-semibold ${item.rpaResult === '성공' ? 'text-blue-600' : 'text-red-600'}`}>{item.rpaResult}</td>
                  <td className="px-2 py-2 text-center" title={item.execStart}>{item.execStart}</td>
                  <td className="px-2 py-2 text-center" title={item.execEnd}>{item.execEnd}</td>
                </tr>
              ))}
              {pagedData.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-gray-400">검색 결과가 없습니다</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 페이징 */}
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            className="px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 text-xs"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              className={`px-3 py-1 rounded text-xs ${page === i + 1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'}`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 text-xs"
            onClick={() => setPage(page + 1)}
            disabled={page === pageCount}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* RESULT LOG 팝업 */}
      <ResultLogModal
        open={resultModalOpen}
        onClose={() => setResultModalOpen(false)}
        log={resultModalData.log || ''}
        inputParams={resultModalData.inputParams || []}
        outputParams={resultModalData.outputParams || []}
      />
    </div>
  )
}

export default ActionHistoryPage 