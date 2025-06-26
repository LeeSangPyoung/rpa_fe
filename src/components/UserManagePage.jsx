import React, { useState } from 'react'
import { Plus, Edit, Trash2, X } from 'lucide-react'
import ConfirmDialog from './ConfirmDialog'

const PAGE_SIZE = 10
const INIT_USERS = [
  { id: 1, account: 'admin', name: '관리자', password: 'adminpw', phone: '010-1111-2222', email: 'admin@company.com', role: 'admin', locked: false },
  { id: 2, account: 'user1', name: '홍길동', password: 'pw1', phone: '010-2222-3333', email: 'user1@company.com', role: '일반', locked: false },
  { id: 3, account: 'user2', name: '김철수', password: 'pw2', phone: '010-3333-4444', email: 'user2@company.com', role: '일반', locked: true },
]

const UserManagePage = () => {
  const [users, setUsers] = useState(INIT_USERS)
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [form, setForm] = useState({ account: '', name: '', password: '', phone: '', email: '', role: '일반' })
  const [search, setSearch] = useState({ account: '', name: '' })
  const [selected, setSelected] = useState([])
  const [allChecked, setAllChecked] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState([])
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false)
  const [confirmLockOpen, setConfirmLockOpen] = useState(false)
  const [confirmUnlockOpen, setConfirmUnlockOpen] = useState(false)
  const [confirmPasswordResetOpen, setConfirmPasswordResetOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState({ type: '', users: [] })

  // 검색 필터링
  const filteredUsers = users.filter(u => {
    if (search.account && !u.account.toLowerCase().includes(search.account.toLowerCase())) return false
    if (search.name && !u.name.toLowerCase().includes(search.name.toLowerCase())) return false
    return true
  })
  const pageCount = Math.ceil(filteredUsers.length / PAGE_SIZE)
  const pagedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // 체크박스
  const handleCheckAll = (e) => {
    setAllChecked(e.target.checked)
    if (e.target.checked) {
      setSelected(pagedUsers.map(u => u.id))
    } else {
      setSelected([])
    }
  }
  const handleCheck = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }
  React.useEffect(() => {
    setAllChecked(pagedUsers.length > 0 && pagedUsers.every(u => selected.includes(u.id)))
  }, [pagedUsers, selected])

  // 모달
  const openModal = (user = null) => {
    setEditUser(user)
    setForm(user ? { ...user } : { account: '', name: '', password: '', phone: '', email: '', role: '일반' })
    setShowModal(true)
  }
  const closeModal = () => {
    setShowModal(false)
    setEditUser(null)
  }
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }
  const handleSave = () => {
    if (!form.account || !form.password || !form.name) return
    if (editUser) {
      setUsers(users.map(u => u.id === editUser.id ? { ...form, id: editUser.id } : u))
    } else {
      setUsers([...users, { ...form, id: users.length ? Math.max(...users.map(u => u.id)) + 1 : 1 }])
    }
    closeModal()
  }
  const handleSaveClick = () => setConfirmSaveOpen(true)
  const handleConfirmSave = () => {
    handleSave()
    setConfirmSaveOpen(false)
  }
  const handleCancelSave = () => setConfirmSaveOpen(false)
  const handleDelete = (ids) => {
    setUsers(users.filter(u => !ids.includes(u.id)))
    setSelected([])
  }
  // 검색/초기화
  const handleSearch = (e) => {
    e && e.preventDefault()
    setPage(1)
  }
  const handleReset = () => {
    setSearch({ account: '', name: '' })
    setPage(1)
  }
  const handleDeleteClick = () => {
    setPendingDelete(selected)
    setConfirmOpen(true)
  }
  const handleConfirmDelete = () => {
    handleDelete(pendingDelete)
    setConfirmOpen(false)
  }
  const handleCancelDelete = () => {
    setConfirmOpen(false)
  }

  // 계정 잠금/해제 핸들러
  const handleAccountLock = () => {
    setPendingAction({ type: 'lock', users: selected })
    setConfirmLockOpen(true)
  }

  const handleAccountUnlock = () => {
    setPendingAction({ type: 'unlock', users: selected })
    setConfirmUnlockOpen(true)
  }

  const handleConfirmLock = () => {
    setUsers(users.map(u => 
      pendingAction.users.includes(u.id) ? { ...u, locked: true } : u
    ))
    setSelected([])
    setConfirmLockOpen(false)
  }

  const handleConfirmUnlock = () => {
    setUsers(users.map(u => 
      pendingAction.users.includes(u.id) ? { ...u, locked: false } : u
    ))
    setSelected([])
    setConfirmUnlockOpen(false)
  }

  const handleCancelLock = () => setConfirmLockOpen(false)
  const handleCancelUnlock = () => setConfirmUnlockOpen(false)

  // 패스워드 초기화 핸들러
  const handlePasswordReset = () => {
    setPendingAction({ type: 'passwordReset', users: selected })
    setConfirmPasswordResetOpen(true)
  }

  const handleConfirmPasswordReset = () => {
    setUsers(users.map(u => 
      pendingAction.users.includes(u.id) ? { ...u, password: '1234' } : u
    ))
    setSelected([])
    setConfirmPasswordResetOpen(false)
  }

  const handleCancelPasswordReset = () => setConfirmPasswordResetOpen(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">사용자 마스터 관리</h1>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        {/* 검색조건: 테이블 위 */}
        <div className="bg-white rounded shadow-sm border border-gray-200 p-4 mb-2">
          <form className="flex gap-2 items-center mb-0" onSubmit={handleSearch}>
            <input
              type="text"
              value={search.account}
              onChange={e => setSearch(s => ({ ...s, account: e.target.value }))}
              className="w-40 px-2 py-1 border border-gray-300 rounded text-xs"
              placeholder="계정 입력"
            />
            <input
              type="text"
              value={search.name}
              onChange={e => setSearch(s => ({ ...s, name: e.target.value }))}
              className="w-40 px-2 py-1 border border-gray-300 rounded text-xs"
              placeholder="이름 입력"
            />
            <button className="flex-shrink-0 px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 flex items-center gap-2 text-xs font-medium" type="button" onClick={handleReset}>초기화</button>
            <button className="flex-shrink-0 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 text-xs font-medium" type="submit">검색</button>
          </form>
        </div>
        {/* 버튼 row */}
        <div className="flex justify-end items-center mb-2 gap-2">
          <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 text-xs font-medium" onClick={() => openModal()}>
            <Plus className="h-4 w-4" />새 사용자
          </button>
          <button
            className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 flex items-center gap-2 text-xs font-medium disabled:opacity-50"
            onClick={handleAccountLock}
            disabled={selected.length === 0}
          >
            계정 잠금
          </button>
          <button
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2 text-xs font-medium disabled:opacity-50"
            onClick={handleAccountUnlock}
            disabled={selected.length === 0}
          >
            계정 해제
          </button>
          <button
            className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-2 text-xs font-medium disabled:opacity-50"
            onClick={handlePasswordReset}
            disabled={selected.length === 0}
          >
            패스워드 초기화
          </button>
          <button
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2 text-xs font-medium disabled:opacity-50"
            onClick={handleDeleteClick}
            disabled={selected.length === 0}
          >
            <Trash2 className="h-4 w-4" />삭제
          </button>
        </div>
        <div className="bg-white rounded shadow-sm border border-gray-200 p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 text-center w-8">
                    <input type="checkbox" checked={allChecked} onChange={handleCheckAll} />
                  </th>
                  <th className="px-2 py-2 text-center">NO</th>
                  <th className="px-2 py-2 text-center">계정</th>
                  <th className="px-2 py-2 text-center">이름</th>
                  <th className="px-2 py-2 text-center">패스워드</th>
                  <th className="px-2 py-2 text-center">전화번호</th>
                  <th className="px-2 py-2 text-center">이메일</th>
                  <th className="px-2 py-2 text-center">권한</th>
                  <th className="px-2 py-2 text-center">계정상태</th>
                  <th className="px-2 py-2 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pagedUsers.map((u, i) => (
                  <tr key={u.id} className="hover:bg-blue-50 cursor-pointer" onDoubleClick={e => { if (e.target.type !== 'checkbox') openModal(u) }}>
                    <td className="px-2 py-2 text-center">
                      <input type="checkbox" checked={selected.includes(u.id)} onChange={e => { e.stopPropagation(); handleCheck(u.id) }} />
                    </td>
                    <td className="px-2 py-2 text-center">{(page - 1) * PAGE_SIZE + i + 1}</td>
                    <td className="px-2 py-2 text-center">{u.account}</td>
                    <td className="px-2 py-2 text-center">{u.name}</td>
                    <td className="px-2 py-2 text-center">{u.password}</td>
                    <td className="px-2 py-2 text-center">{u.phone}</td>
                    <td className="px-2 py-2 text-center">{u.email}</td>
                    <td className="px-2 py-2 text-center">{u.role}</td>
                    <td className="px-2 py-2 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${u.locked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {u.locked ? '잠금' : '정상'}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-center"></td>
                  </tr>
                ))}
                {pagedUsers.length === 0 && (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-gray-400">사용자가 없습니다</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* 페이징 */}
        <div className="flex justify-center items-center gap-2 mt-4">
          <button className="px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 text-xs" onClick={() => setPage(page - 1)} disabled={page === 1}>&lt;</button>
          {Array.from({ length: pageCount }, (_, i) => (
            <button key={i} className={`px-3 py-1 rounded text-xs ${page === i + 1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
          ))}
          <button className="px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 text-xs" onClick={() => setPage(page + 1)} disabled={page === pageCount}>&gt;</button>
        </div>
      </div>
      {/* 등록/수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={closeModal}><X className="w-5 h-5" /></button>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{editUser ? '사용자 수정' : '새 사용자 등록'}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">계정</label>
                <input name="account" value={form.account} onChange={handleChange} className="w-full px-2 py-1 border border-gray-300 rounded text-xs" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">이름</label>
                <input name="name" value={form.name} onChange={handleChange} className="w-full px-2 py-1 border border-gray-300 rounded text-xs" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">패스워드</label>
                <input name="password" value={form.password} onChange={handleChange} className="w-full px-2 py-1 border border-gray-300 rounded text-xs" type="password" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">전화번호</label>
                <input name="phone" value={form.phone} onChange={handleChange} className="w-full px-2 py-1 border border-gray-300 rounded text-xs" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">이메일</label>
                <input name="email" value={form.email} onChange={handleChange} className="w-full px-2 py-1 border border-gray-300 rounded text-xs" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">권한</label>
                <select name="role" value={form.role} onChange={handleChange} className="w-full px-2 py-1 border border-gray-300 rounded text-xs">
                  <option value="admin">admin</option>
                  <option value="일반">일반</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium" onClick={handleSaveClick}>{editUser ? '수정' : '등록'}</button>
              <button className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-xs font-medium" onClick={closeModal}>취소</button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={confirmOpen}
        message="삭제하시겠습니까?"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <ConfirmDialog
        open={confirmSaveOpen}
        message="저장하시겠습니까?"
        onConfirm={handleConfirmSave}
        onCancel={handleCancelSave}
      />

      <ConfirmDialog
        open={confirmLockOpen}
        message="선택한 계정을 잠금 처리하시겠습니까?"
        onConfirm={handleConfirmLock}
        onCancel={handleCancelLock}
      />

      <ConfirmDialog
        open={confirmUnlockOpen}
        message="선택한 계정을 해제 처리하시겠습니까?"
        onConfirm={handleConfirmUnlock}
        onCancel={handleCancelUnlock}
      />

      <ConfirmDialog
        open={confirmPasswordResetOpen}
        message="선택한 계정의 패스워드를 초기화하시겠습니까? (초기화된 패스워드: 1234)"
        onConfirm={handleConfirmPasswordReset}
        onCancel={handleCancelPasswordReset}
      />
    </div>
  )
}

export default UserManagePage 