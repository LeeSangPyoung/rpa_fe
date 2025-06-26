import React, { useState, useEffect } from 'react'
import { Search, LogOut, Settings, Plus, Minus } from 'lucide-react'
import ConfirmDialog from './ConfirmDialog'

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

const INIT_ACCOUNTS = {}

const AccountGroupMasterManagePage = ({ username, onLogout }) => {
  const [groups, setGroups] = useState([])
  const [filteredGroups, setFilteredGroups] = useState([])
  const [groupPage, setGroupPage] = useState(1)
  const [groupSearch, setGroupSearch] = useState('')
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [accounts, setAccounts] = useState(INIT_ACCOUNTS)
  const [editRows, setEditRows] = useState(INIT_ACCOUNTS)
  const [saved, setSaved] = useState(false)
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false)

  // 그룹 샘플 데이터 생성
  useEffect(() => {
    const sampleGroups = Array.from({ length: 27 }, (_, idx) => {
      const base = Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000
      return {
        id: idx + 1,
        groupName: `그룹${idx + 1}`,
        accountCount: Math.floor(Math.random() * 10) + 1,
        desc: idx % 3 === 0 ? '기본 그룹' : idx % 3 === 1 ? '특수 그룹' : '외부 연동',
        regUser: `user${(idx % 5) + 1}`,
        regDate: formatDate(base - Math.random() * 30 * 24 * 60 * 60 * 1000),
        modUser: `user${(idx % 5) + 1}`,
        modDate: formatDate(base - Math.random() * 10 * 24 * 60 * 60 * 1000),
      }
    })
    setGroups(sampleGroups)
    setFilteredGroups(sampleGroups)
    setSelectedGroup(sampleGroups[0])
    // 계정 샘플 데이터
    const accs = {}
    sampleGroups.forEach(g => {
      accs[g.id] = Array.from({ length: g.accountCount }, (_, i) => ({ account: `user${i + 1}`, password: `pw${i + 1}` }))
    })
    setAccounts(accs)
    setEditRows(accs)
  }, [])

  // 그룹 검색 필터링
  const handleGroupSearch = () => {
    let filtered = groups.filter(item => {
      if (groupSearch && !item.groupName.toLowerCase().includes(groupSearch.toLowerCase())) return false
      return true
    })
    setFilteredGroups(filtered)
    setGroupPage(1)
    if (filtered.length > 0) setSelectedGroup(filtered[0])
    else setSelectedGroup(null)
  }

  // 그룹 초기화
  const handleGroupReset = () => {
    setGroupSearch('')
    setFilteredGroups(groups)
    setGroupPage(1)
    setSelectedGroup(groups[0] || null)
  }

  // 그룹 페이징
  const groupPageCount = Math.ceil(filteredGroups.length / PAGE_SIZE)
  const pagedGroups = filteredGroups.slice((groupPage - 1) * PAGE_SIZE, groupPage * PAGE_SIZE)

  // 그룹 선택
  const handleGroupSelect = (g) => {
    setSelectedGroup(g)
    setEditRows(prev => ({ ...prev, [g.id]: accounts[g.id] ? [...accounts[g.id]] : [] }))
    setSaved(false)
  }

  // 계정 입력 변경
  const handleInputChange = (idx, key, value) => {
    setEditRows(prev => ({
      ...prev,
      [selectedGroup.id]: prev[selectedGroup.id].map((row, i) => i === idx ? { ...row, [key]: value } : row)
    }))
    setSaved(false)
  }

  // 계정 추가
  const handleAdd = () => {
    setEditRows(prev => ({
      ...prev,
      [selectedGroup.id]: [...(prev[selectedGroup.id] || []), { account: '', password: '' }]
    }))
    setSaved(false)
  }

  // 계정 삭제
  const handleDelete = (idx) => {
    setEditRows(prev => ({
      ...prev,
      [selectedGroup.id]: prev[selectedGroup.id].filter((_, i) => i !== idx)
    }))
    setSaved(false)
  }

  // 저장
  const handleSave = () => {
    setAccounts(prev => ({ ...prev, [selectedGroup.id]: editRows[selectedGroup.id] }))
    setSaved(true)
  }

  const handleSaveClick = () => setConfirmSaveOpen(true)
  const handleConfirmSave = () => {
    handleSave()
    setConfirmSaveOpen(false)
  }
  const handleCancelSave = () => setConfirmSaveOpen(false)

  const rows = selectedGroup ? (editRows[selectedGroup.id] || []) : []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">계정 그룹 관리</h1>
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
      <div className="flex w-full h-[calc(100vh-64px)] bg-gray-50 gap-6 px-6 py-6">
        {/* 좌측: 그룹 마스터 목록 */}
        <section className="flex flex-col flex-1 basis-1/2 w-1/2 h-full bg-white border-r border-gray-200 shadow-sm overflow-y-auto p-6">
          <div className="text-base font-bold text-blue-700 mb-4">그룹 마스터</div>
          <form className="flex gap-2 mb-3 items-center" onSubmit={e => {e.preventDefault(); handleGroupSearch()}}>
            <input
              type="text"
              value={groupSearch}
              onChange={e => setGroupSearch(e.target.value)}
              className="w-48 px-2 py-1 border border-gray-300 rounded text-xs"
              placeholder="그룹명칭 입력"
            />
            <button className="flex-shrink-0 px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 flex items-center gap-2 text-xs font-medium" onClick={handleGroupReset}>초기화</button>
            <button className="flex-shrink-0 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 text-xs font-medium" onClick={handleGroupSearch}><Search className="h-4 w-4" />검색</button>
          </form>
          <div className="flex-1 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs bg-white border border-gray-200">
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
                {pagedGroups.map((item) => (
                  <tr key={item.id} className={`hover:bg-blue-50 cursor-pointer ${selectedGroup && selectedGroup.id === item.id ? 'bg-blue-100' : ''}`} onClick={() => handleGroupSelect(item)}>
                    <td className="px-2 py-2 text-center">{item.id}</td>
                    <td className="px-2 py-2 text-center">{item.groupName}</td>
                    <td className="px-2 py-2 text-center">{item.accountCount}</td>
                    <td className="px-2 py-2 text-center">{item.desc}</td>
                    <td className="px-2 py-2 text-center">{item.regUser}</td>
                    <td className="px-2 py-2 text-center">{item.regDate}</td>
                    <td className="px-2 py-2 text-center">{item.modUser}</td>
                    <td className="px-2 py-2 text-center">{item.modDate}</td>
                  </tr>
                ))}
                {pagedGroups.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-400">검색 결과가 없습니다</td>
                  </tr>
                )}
              </tbody>
            </table>
            {/* 페이징 */}
            <div className="flex justify-center items-center gap-2 mt-4 mb-2">
              <button
                className="px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 text-xs"
                onClick={() => setGroupPage(groupPage - 1)}
                disabled={groupPage === 1}
              >
                &lt;
              </button>
              {Array.from({ length: groupPageCount }, (_, i) => (
                <button
                  key={i}
                  className={`px-3 py-1 rounded text-xs ${groupPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'}`}
                  onClick={() => setGroupPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 text-xs"
                onClick={() => setGroupPage(groupPage + 1)}
                disabled={groupPage === groupPageCount}
              >
                &gt;
              </button>
            </div>
          </div>
        </section>
        {/* 우측: 계정 관리 */}
        <section className="flex flex-col flex-1 basis-1/2 w-1/2 h-full bg-white shadow-sm overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">계정 목록 {selectedGroup ? `- ${selectedGroup.groupName}` : ''}</h2>
            <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 text-xs font-medium" onClick={handleAdd} disabled={!selectedGroup}>
              <Plus className="h-4 w-4" />추가
            </button>
          </div>
          <table className="w-full text-xs mb-4 bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="bg-gray-50 text-gray-600 font-normal px-2 py-2 w-10 text-center">NO</th>
                <th className="bg-gray-50 text-gray-600 font-normal px-2 py-2 text-center">계정</th>
                <th className="bg-gray-50 text-gray-600 font-normal px-2 py-2 text-center">패스워드</th>
                <th className="bg-gray-50 text-gray-600 font-normal px-2 py-2 text-center"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td className="px-2 py-2 text-center">{i + 1}</td>
                  <td className="px-2 py-2 text-center">
                    <input className="w-full px-2 py-1 border border-gray-200 rounded text-xs" value={row.account} onChange={e => handleInputChange(i, 'account', e.target.value)} />
                  </td>
                  <td className="px-2 py-2 text-center">
                    <input className="w-full px-2 py-1 border border-gray-200 rounded text-xs" value={row.password} onChange={e => handleInputChange(i, 'password', e.target.value)} />
                  </td>
                  <td className="px-2 py-2 text-center">
                    <button className="text-red-500 hover:text-red-700" onClick={e => { e.preventDefault(); handleDelete(i) }}><Minus className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400">계정이 없습니다</td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex justify-end">
            <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium" onClick={handleSaveClick} disabled={!selectedGroup}>저장</button>
            {saved && <span className="ml-4 text-green-600 text-xs self-center">저장되었습니다</span>}
          </div>
        </section>
      </div>
      <ConfirmDialog
        open={confirmSaveOpen}
        message="저장 하시겠습니까?"
        onConfirm={handleConfirmSave}
        onCancel={handleCancelSave}
      />
    </div>
  )
}

export default AccountGroupMasterManagePage 