import React, { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import ConfirmDialog from './ConfirmDialog'

const GROUPS = [
  { id: 1, name: '기본 그룹' },
  { id: 2, name: '특수 그룹' },
  { id: 3, name: '외부 연동' },
  { id: 4, name: '테스트 그룹' },
  { id: 5, name: '관리자 그룹' },
]
const INIT_ACCOUNTS = {
  1: [ { account: 'user1', password: 'pw1' }, { account: 'user2', password: 'pw2' } ],
  2: [ { account: 'special1', password: 'pw3' } ],
  3: [ { account: 'ext1', password: 'pw4' }, { account: 'ext2', password: 'pw5' } ],
  4: [],
  5: [ { account: 'admin', password: 'adminpw' } ],
}

const AccountGroupManagePage = () => {
  const [selectedGroup, setSelectedGroup] = useState(GROUPS[0].id)
  const [accounts, setAccounts] = useState(INIT_ACCOUNTS)
  const [editRows, setEditRows] = useState(INIT_ACCOUNTS)
  const [saved, setSaved] = useState(false)
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false)

  // 그룹 선택 시 해당 계정 목록을 편집용으로 복사
  const handleGroupSelect = (id) => {
    setSelectedGroup(id)
    setEditRows(prev => ({ ...prev, [id]: accounts[id] ? [...accounts[id]] : [] }))
    setSaved(false)
  }

  // 계정 입력 변경
  const handleInputChange = (idx, key, value) => {
    setEditRows(prev => ({
      ...prev,
      [selectedGroup]: prev[selectedGroup].map((row, i) => i === idx ? { ...row, [key]: value } : row)
    }))
    setSaved(false)
  }

  // 계정 추가
  const handleAdd = () => {
    setEditRows(prev => ({
      ...prev,
      [selectedGroup]: [...(prev[selectedGroup] || []), { account: '', password: '' }]
    }))
    setSaved(false)
  }

  // 계정 삭제
  const handleDelete = (idx) => {
    setEditRows(prev => ({
      ...prev,
      [selectedGroup]: prev[selectedGroup].filter((_, i) => i !== idx)
    }))
    setSaved(false)
  }

  // 저장
  const handleSave = () => {
    setAccounts(prev => ({ ...prev, [selectedGroup]: editRows[selectedGroup] }))
    setSaved(true)
  }

  const handleSaveClick = () => setConfirmSaveOpen(true)
  const handleConfirmSave = () => {
    handleSave()
    setConfirmSaveOpen(false)
  }
  const handleCancelSave = () => setConfirmSaveOpen(false)

  const rows = editRows[selectedGroup] || []

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 좌측 그룹 목록 */}
      <aside className="w-64 min-w-[12rem] bg-white border-r border-gray-200 flex flex-col">
        <div className="px-4 py-4 text-lg font-bold text-blue-700 border-b border-gray-200">계정 그룹</div>
        <nav className="flex-1 py-2">
          {GROUPS.map(g => (
            <button
              key={g.id}
              className={`w-full text-left px-6 py-3 rounded-md mb-1 transition-colors text-sm font-medium ${selectedGroup === g.id ? 'bg-blue-50 text-blue-700 font-semibold shadow' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => handleGroupSelect(g.id)}
            >
              {g.name}
            </button>
          ))}
        </nav>
      </aside>
      {/* 우측 계정 테이블 */}
      <main className="flex-1 p-8">
        <div className="bg-white rounded shadow-sm border border-gray-200 p-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">계정 목록</h2>
            <button className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1 text-xs" onClick={handleAdd}>
              <Plus className="h-4 w-4" />추가
            </button>
          </div>
          <table className="w-full text-xs mb-4">
            <thead>
              <tr>
                <th className="bg-gray-100 text-gray-600 font-normal px-2 py-1 w-10 text-center">NO</th>
                <th className="bg-gray-100 text-gray-600 font-normal px-2 py-1 text-center">계정</th>
                <th className="bg-gray-100 text-gray-600 font-normal px-2 py-1 text-center">패스워드</th>
                <th className="bg-gray-100 text-gray-600 font-normal px-2 py-1 text-center"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td className="px-2 py-1 text-center">{i + 1}</td>
                  <td className="px-2 py-1 text-center">
                    <input className="w-full px-1 py-0.5 border border-gray-200 rounded text-xs" value={row.account} onChange={e => handleInputChange(i, 'account', e.target.value)} />
                  </td>
                  <td className="px-2 py-1 text-center">
                    <input className="w-full px-1 py-0.5 border border-gray-200 rounded text-xs" value={row.password} onChange={e => handleInputChange(i, 'password', e.target.value)} />
                  </td>
                  <td className="px-2 py-1 text-center">
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
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs" onClick={handleSaveClick}>저장</button>
            {saved && <span className="ml-4 text-green-600 text-xs self-center">저장되었습니다</span>}
          </div>
        </div>
      </main>
      <ConfirmDialog
        open={confirmSaveOpen}
        message="저장 하시겠습니까?"
        onConfirm={handleConfirmSave}
        onCancel={handleCancelSave}
      />
    </div>
  )
}

export default AccountGroupManagePage 