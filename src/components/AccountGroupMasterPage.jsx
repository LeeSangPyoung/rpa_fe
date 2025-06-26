import React, { useState, useEffect } from 'react'
import { Search, LogOut, Settings, ChevronLeft, ChevronRight } from 'lucide-react'

const PAGE_SIZE = 10

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

const AccountGroupMasterPage = ({ username, onLogout }) => {
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState({
    groupName: '',
  })

  useEffect(() => {
    // 샘플 데이터 생성
    const sampleData = Array.from({ length: 27 }, (_, idx) => {
      const base = Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000
      return {
        no: idx + 1,
        groupName: `그룹${idx + 1}`,
        accountCount: Math.floor(Math.random() * 10) + 1,
        desc: idx % 3 === 0 ? '기본 그룹' : idx % 3 === 1 ? '특수 그룹' : '외부 연동',
        regUser: `user${(idx % 5) + 1}`,
        regDate: formatDate(base - Math.random() * 30 * 24 * 60 * 60 * 1000),
        modUser: `user${(idx % 5) + 1}`,
        modDate: formatDate(base - Math.random() * 10 * 24 * 60 * 60 * 1000),
      }
    })
    setData(sampleData)
    setFilteredData(sampleData)
  }, [])

  // 검색 필터링
  const handleSearch = () => {
    let filtered = data.filter(item => {
      if (search.groupName && !item.groupName.toLowerCase().includes(search.groupName.toLowerCase())) return false
      return true
    })
    setFilteredData(filtered)
    setPage(1)
  }

  // 초기화
  const handleReset = () => {
    setSearch({ groupName: '' })
    setFilteredData(data)
    setPage(1)
  }

  // 페이징 처리
  const pageCount = Math.ceil(filteredData.length / PAGE_SIZE)
  const pagedData = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">계정 그룹 마스터 관리</h1>
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
              <label className="block text-xs font-medium text-gray-600 mb-1">그룹명칭</label>
              <input
                type="text"
                value={search.groupName}
                onChange={e => setSearch(s => ({ ...s, groupName: e.target.value }))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                placeholder="그룹명칭 입력"
              />
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
                <th className="px-2 py-2 text-center">그룹명칭</th>
                <th className="px-2 py-2 text-center">등록된 계정수</th>
                <th className="px-2 py-2 text-center">비고</th>
                <th className="px-2 py-2 text-center">등록자</th>
                <th className="px-2 py-2 text-center">등록일자</th>
                <th className="px-2 py-2 text-center">수정자</th>
                <th className="px-2 py-2 text-center">수정일자</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pagedData.map((item) => (
                <tr key={item.no} className="hover:bg-blue-50 cursor-pointer">
                  <td className="px-2 py-2 text-center">{item.no}</td>
                  <td className="px-2 py-2 text-center">{item.groupName}</td>
                  <td className="px-2 py-2 text-center">{item.accountCount}</td>
                  <td className="px-2 py-2 text-center">{item.desc}</td>
                  <td className="px-2 py-2 text-center">{item.regUser}</td>
                  <td className="px-2 py-2 text-center">{item.regDate}</td>
                  <td className="px-2 py-2 text-center">{item.modUser}</td>
                  <td className="px-2 py-2 text-center">{item.modDate}</td>
                </tr>
              ))}
              {pagedData.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-400">검색 결과가 없습니다</td>
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

export default AccountGroupMasterPage 