import React, { useState, useEffect } from 'react'
import { Search, Filter, Plus, LogOut, Settings, ChevronLeft, ChevronRight, Trash2, Play } from 'lucide-react'

const PAGE_SIZE = 10

// 24시간제 날짜 포맷 함수
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

const crons = [
  '0 0 * * *',
  '0 12 * * 1',
  '*/5 * * * *',
  '0 9-18 * * 1-5',
  '0 0 1 * *',
  '****1',
  '0 6,18 * * *',
]

const statusList = ['전체', '대기', '진행중', '성공', '실패']
const repeatList = ['전체', 'Y', 'N']

const GridPage = ({ onItemSelect, onLogout, username, onNewAction }) => {
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState([])
  const [allChecked, setAllChecked] = useState(false)

  // 검색 조건 상태
  const [search, setSearch] = useState({
    rpaName: '',
    status: '전체',
    startAtFrom: '',
    startAtTo: '',
    endAtFrom: '',
    endAtTo: '',
    regUser: '',
    repeat: '전체',
  })

  // 샘플 데이터 생성
  useEffect(() => {
    const sampleData = Array.from({ length: 37 }, (_, index) => {
      const base = Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000
      return {
        no: index + 1,
        rpaName: `RPA 작업 ${index + 1}`,
        scheduling: crons[index % crons.length],
        nextRun: formatDate(base + Math.random() * 7 * 24 * 60 * 60 * 1000),
        status: ['대기', '진행중', '성공', '실패'][Math.floor(Math.random() * 4)],
        repeat: Math.random() > 0.5 ? 'Y' : 'N',
        startAt: formatDate(base),
        endAt: formatDate(base + Math.random() * 10 * 60 * 60 * 1000),
        description: `이것은 RPA 작업 ${index + 1}의 설명입니다.`,
        regUser: `user${(index % 5) + 1}`,
        regDate: formatDate(base - Math.random() * 30 * 24 * 60 * 60 * 1000),
        modUser: `user${(index % 5) + 1}`,
        modDate: formatDate(base - Math.random() * 10 * 24 * 60 * 60 * 1000),
        id: `action-${index + 1}`,
      }
    })
    setData(sampleData)
    setFilteredData(sampleData)
  }, [])

  // 검색 필터링
  const handleSearch = () => {
    let filtered = data.filter(item => {
      // RPA명
      if (search.rpaName && !item.rpaName.toLowerCase().includes(search.rpaName.toLowerCase())) return false
      // 상태
      if (search.status !== '전체' && item.status !== search.status) return false
      // 반복유무
      if (search.repeat !== '전체' && item.repeat !== search.repeat) return false
      // 시작일시
      if (search.startAtFrom && item.startAt < search.startAtFrom) return false
      if (search.startAtTo && item.startAt > search.startAtTo) return false
      // 종료일시
      if (search.endAtFrom && item.endAt < search.endAtFrom) return false
      if (search.endAtTo && item.endAt > search.endAtTo) return false
      // 등록자
      if (search.regUser && !item.regUser.toLowerCase().includes(search.regUser.toLowerCase())) return false
      return true
    })
    setFilteredData(filtered)
    setPage(1)
  }

  // 초기화
  const handleReset = () => {
    setSearch({
      rpaName: '',
      status: '전체',
      startAtFrom: '',
      startAtTo: '',
      endAtFrom: '',
      endAtTo: '',
      regUser: '',
      repeat: '전체',
    })
    setFilteredData(data)
    setPage(1)
  }

  // 페이징 처리
  const pageCount = Math.ceil(filteredData.length / PAGE_SIZE)
  const pagedData = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // 체크박스 핸들러
  const handleCheckAll = (e) => {
    setAllChecked(e.target.checked)
    if (e.target.checked) {
      setSelected(pagedData.map(item => item.id))
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
    setAllChecked(
      pagedData.length > 0 && pagedData.every(item => selected.includes(item.id))
    )
  }, [pagedData, selected])

  // 삭제/수동실행 버튼 핸들러(샘플)
  const handleDelete = () => {
    if (selected.length === 0) return
    setFilteredData(prev => prev.filter(item => !selected.includes(item.id)))
    setSelected([])
  }
  const handleManualRun = () => {
    if (selected.length === 0) return
    alert('수동 실행: ' + selected.join(', '))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ACTION 마스터 관리</h1>
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
              <label className="block text-xs font-medium text-gray-600 mb-1">RPA명</label>
              <input
                type="text"
                value={search.rpaName}
                onChange={e => setSearch(s => ({ ...s, rpaName: e.target.value }))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                placeholder="RPA명 입력"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">상태</label>
              <select
                value={search.status}
                onChange={e => setSearch(s => ({ ...s, status: e.target.value }))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
              >
                {statusList.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">시작일시(From)</label>
              <input
                type="datetime-local"
                value={search.startAtFrom}
                onChange={e => setSearch(s => ({ ...s, startAtFrom: e.target.value }))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">시작일시(To)</label>
              <input
                type="datetime-local"
                value={search.startAtTo}
                onChange={e => setSearch(s => ({ ...s, startAtTo: e.target.value }))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">종료일시(From)</label>
              <input
                type="datetime-local"
                value={search.endAtFrom}
                onChange={e => setSearch(s => ({ ...s, endAtFrom: e.target.value }))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">종료일시(To)</label>
              <input
                type="datetime-local"
                value={search.endAtTo}
                onChange={e => setSearch(s => ({ ...s, endAtTo: e.target.value }))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">등록자</label>
              <input
                type="text"
                value={search.regUser}
                onChange={e => setSearch(s => ({ ...s, regUser: e.target.value }))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                placeholder="등록자 입력"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">반복유무</label>
              <select
                value={search.repeat}
                onChange={e => setSearch(s => ({ ...s, repeat: e.target.value }))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
              >
                {repeatList.map(opt => <option key={opt} value={opt}>{opt}</option>)}
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
            <button
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 text-xs"
              onClick={onNewAction}
            >
              <Plus className="h-4 w-4" />
              새 ACTION
            </button>
            <button
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2 text-xs"
              onClick={handleDelete}
              disabled={selected.length === 0}
            >
              <Trash2 className="h-4 w-4" />
              삭제
            </button>
            <button
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2 text-xs"
              onClick={handleManualRun}
              disabled={selected.length === 0}
            >
              <Play className="h-4 w-4" />
              수동실행
            </button>
          </div>
        </div>

        {/* 테이블 */}
        <div className="bg-white rounded shadow-sm border border-gray-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-center">
                  <input type="checkbox" checked={allChecked} onChange={handleCheckAll} />
                </th>
                <th className="px-2 py-2 font-semibold text-gray-700 whitespace-nowrap">NO</th>
                <th className="px-2 py-2 font-semibold text-gray-700 whitespace-nowrap">RPA명</th>
                <th className="px-2 py-2 font-semibold text-gray-700 whitespace-nowrap">스케줄링</th>
                <th className="px-2 py-2 font-semibold text-gray-700 whitespace-nowrap">다음실행일시</th>
                <th className="px-2 py-2 font-semibold text-gray-700 whitespace-nowrap">상태</th>
                <th className="px-2 py-2 font-semibold text-gray-700 whitespace-nowrap">반복유무</th>
                <th className="px-2 py-2 font-semibold text-gray-700 whitespace-nowrap">시작일시</th>
                <th className="px-2 py-2 font-semibold text-gray-700 whitespace-nowrap">종료일시</th>
                <th className="px-2 py-2 font-semibold text-gray-700 whitespace-nowrap">설명</th>
                <th className="px-2 py-2 font-semibold text-gray-700 whitespace-nowrap">등록자</th>
                <th className="px-2 py-2 font-semibold text-gray-700 whitespace-nowrap">등록일시</th>
                <th className="px-2 py-2 font-semibold text-gray-700 whitespace-nowrap">수정자</th>
                <th className="px-2 py-2 font-semibold text-gray-700 whitespace-nowrap">수정일시</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pagedData.map((item) => (
                <tr key={item.no} className={`hover:bg-blue-50 cursor-pointer ${item.status === '진행중' ? 'bg-yellow-100' : ''}`}>
                  <td className="px-2 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={selected.includes(item.id)}
                      onChange={() => handleCheck(item.id)}
                      onClick={e => e.stopPropagation()}
                    />
                  </td>
                  <td className="px-2 py-2 text-center">{item.no}</td>
                  <td className="px-2 py-2 truncate max-w-[10rem]" title={item.rpaName} onClick={() => onItemSelect(item)}>{item.rpaName}</td>
                  <td className="px-2 py-2 truncate max-w-[8rem]" title={item.scheduling} onClick={() => onItemSelect(item)}>{item.scheduling}</td>
                  <td className="px-2 py-2 truncate max-w-[11rem]" title={item.nextRun} onClick={() => onItemSelect(item)}>{item.nextRun}</td>
                  <td className={`px-2 py-2 truncate max-w-[6rem] ${item.status === '실패' ? 'text-red-600' : item.status === '성공' ? 'text-blue-600' : ''}`} title={item.status} onClick={() => onItemSelect(item)}>{item.status}</td>
                  <td className="px-2 py-2 text-center" onClick={() => onItemSelect(item)}>{item.repeat}</td>
                  <td className="px-2 py-2 truncate max-w-[11rem]" title={item.startAt} onClick={() => onItemSelect(item)}>{item.startAt}</td>
                  <td className="px-2 py-2 truncate max-w-[11rem]" title={item.endAt} onClick={() => onItemSelect(item)}>{item.endAt}</td>
                  <td className="px-2 py-2 truncate max-w-[12rem]" title={item.description} onClick={() => onItemSelect(item)}>{item.description}</td>
                  <td className="px-2 py-2 truncate max-w-[7rem]" title={item.regUser} onClick={() => onItemSelect(item)}>{item.regUser}</td>
                  <td className="px-2 py-2 truncate max-w-[11rem]" title={item.regDate} onClick={() => onItemSelect(item)}>{item.regDate}</td>
                  <td className="px-2 py-2 truncate max-w-[7rem]" title={item.modUser} onClick={() => onItemSelect(item)}>{item.modUser}</td>
                  <td className="px-2 py-2 truncate max-w-[11rem]" title={item.modDate} onClick={() => onItemSelect(item)}>{item.modDate}</td>
                </tr>
              ))}
              {pagedData.length === 0 && (
                <tr>
                  <td colSpan={14} className="text-center py-8 text-gray-400">검색 결과가 없습니다</td>
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
    </div>
  )
}

export default GridPage 