import React, { useState } from 'react'
import LoginPage from './components/LoginPage'
import GridPage from './components/GridPage'
import DetailPage from './components/DetailPage'
import StepDetailPage from './components/StepDetailPage'
import Menu from './components/Menu'
import ActionHistoryPage from './components/ActionHistoryPage'
import AccountGroupMasterManagePage from './components/AccountGroupMasterManagePage'
import UserManagePage from './components/UserManagePage'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [selectedAction, setSelectedAction] = useState(null)
  const [selectedStep, setSelectedStep] = useState(null)
  const [currentPage, setCurrentPage] = useState('login') // 'login', 'grid', 'detail', 'step'
  const [currentMenu, setCurrentMenu] = useState('action') // 메뉴 선택 상태

  const handleLogin = (user) => {
    setUsername(user)
    setIsLoggedIn(true)
    setCurrentPage('grid')
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUsername('')
    setSelectedAction(null)
    setSelectedStep(null)
    setCurrentPage('login')
  }

  const handleActionSelect = (action) => {
    setSelectedAction(action)
    setCurrentPage('detail')
  }

  const handleBackToGrid = () => {
    setSelectedAction(null)
    setSelectedStep(null)
    setCurrentPage('grid')
  }

  const handleStepSelect = (step) => {
    setSelectedStep(step)
    setCurrentPage('step')
  }

  const handleBackToDetail = () => {
    setSelectedStep(null)
    setCurrentPage('detail')
  }

  const handleNewAction = () => {
    setSelectedAction(null) // 새 ACTION이므로 기존 선택된 ACTION 초기화
    setCurrentPage('detail')
  }

  const handleStepEdit = (step) => {
    // STEP 편집 로직 (모달 또는 별도 페이지로 구현 가능)
    console.log('Edit step:', step)
  }

  // 메뉴 클릭 시 (현재는 페이지 이동 없이 메뉴만 강조)
  const handleMenuSelect = (menuKey) => {
    setCurrentMenu(menuKey)
    if (menuKey === 'action') setCurrentPage('grid')
    // 메뉴에 따라 페이지 이동이 필요하면 여기에 추가
    // 예: if (menuKey === 'action') setCurrentPage('grid')
  }

  // 페이지 렌더링
  const renderPage = () => {
    if (currentMenu === 'history') {
      return <ActionHistoryPage username={username} onLogout={handleLogout} />
    }
    if (currentMenu === 'account') {
      return <AccountGroupMasterManagePage username={username} onLogout={handleLogout} />
    }
    if (currentMenu === 'user') {
      return <UserManagePage />
    }
    switch (currentPage) {
      case 'login':
        return <LoginPage onLogin={handleLogin} />
      
      case 'grid':
        return (
          <GridPage 
            onItemSelect={handleActionSelect} 
            onLogout={handleLogout}
            username={username}
            onNewAction={handleNewAction}
          />
        )
      
      case 'detail':
        return (
          <DetailPage 
            item={selectedAction} 
            onBack={handleBackToGrid}
            onStepSelect={handleStepSelect}
            username={username}
            onLogout={handleLogout}
            isNewAction={!selectedAction}
          />
        )
      
      case 'step':
        return (
          <StepDetailPage 
            step={selectedStep}
            action={selectedAction}
            onBack={handleBackToDetail}
            onEdit={handleStepEdit}
          />
        )
      
      default:
        return <LoginPage onLogin={handleLogin} />
    }
  }

  return (
    <div className="App min-h-screen flex bg-gray-50">
      {isLoggedIn && currentPage !== 'login' && (
        <Menu selected={currentMenu} onSelect={handleMenuSelect} />
      )}
      <div className="flex-1">
        {renderPage()}
      </div>
    </div>
  )
}

export default App 