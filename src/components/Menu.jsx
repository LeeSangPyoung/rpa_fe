import React from 'react'
import { ListChecks, Clock, KeyRound, Users } from 'lucide-react'

const menus = [
  { key: 'action', label: 'ACTION 마스터 관리', icon: <ListChecks className="h-5 w-5" /> },
  { key: 'history', label: 'ACTION 실행이력', icon: <Clock className="h-5 w-5" /> },
  { key: 'account', label: '계정 그룹 관리', icon: <KeyRound className="h-5 w-5" /> },
  { key: 'user', label: '사용자 마스터 관리', icon: <Users className="h-5 w-5" /> },
]

const Menu = ({ selected, onSelect }) => {
  return (
    <aside className="h-screen bg-white border-r border-gray-200 shadow-sm flex flex-col w-56 min-w-[12rem] box-border">
      <div className="flex items-center h-16 px-4 text-xl font-bold text-blue-700 tracking-tight select-none border-b border-gray-200 box-border">RPA 시스템</div>
      <nav className="flex-1 py-4">
        {menus.map(menu => (
          <button
            key={menu.key}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm rounded-md mb-1 transition-colors overflow-hidden` +
              ` ${selected === menu.key ? 'bg-blue-50 text-blue-700 font-semibold shadow' : 'text-gray-700 hover:bg-gray-100'}`}
            onClick={() => onSelect(menu.key)}
          >
            {menu.icon}
            <span className="overflow-hidden whitespace-nowrap text-ellipsis">{menu.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}

export default Menu 