import React from 'react'

const getLongLog = (log) => {
  if (!log) return ''
  // 20줄 이상이 아니면 샘플 로그를 추가로 채움
  const lines = log.split('\n')
  if (lines.length >= 20) return log
  const filler = Array.from({ length: 25 - lines.length }, (_, i) => `[DEBUG] 추가 로그 라인 ${i + 1}`).join('\n')
  return log + '\n' + filler
}

const ResultLogModal = ({ open, onClose, log, inputParams, outputParams }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 relative">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">RESULT 상세</h2>
        <div className="mb-6">
          <div className="text-xs font-semibold text-gray-700 mb-1">RESULT LOG</div>
          <div className="border rounded bg-gray-50 p-3 text-xs font-mono max-h-128 overflow-y-scroll whitespace-pre-wrap text-gray-800">
            {getLongLog(log)}
          </div>
        </div>
        <div className="flex gap-4 mb-6">
          {/* INPUT PARAMETER */}
          <div className="flex-1">
            <div className="text-xs font-semibold text-gray-700 mb-2">INPUT PARAMETER</div>
            <div className="max-h-40 overflow-y-scroll">
              <table className="w-full text-xs mb-2">
                <thead>
                  <tr>
                    <th className="bg-gray-100 text-gray-600 font-normal px-2 py-1 w-10 text-center">NO</th>
                    <th className="bg-gray-100 text-gray-600 font-normal px-2 py-1 text-center">파라미터</th>
                    <th className="bg-gray-100 text-gray-600 font-normal px-2 py-1 text-center">VALUE</th>
                  </tr>
                </thead>
                <tbody>
                  {inputParams.map((p, i) => (
                    <tr key={i}>
                      <td className="px-2 py-1 text-center">{i + 1}</td>
                      <td className="px-2 py-1 text-center">{p.param}</td>
                      <td className="px-2 py-1 text-center">{p.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* OUTPUT PARAMETER */}
          <div className="flex-1">
            <div className="text-xs font-semibold text-gray-700 mb-2">OUTPUT PARAMETER</div>
            <div className="max-h-40 overflow-y-scroll">
              <table className="w-full text-xs mb-2">
                <thead>
                  <tr>
                    <th className="bg-gray-100 text-gray-600 font-normal px-2 py-1 w-10 text-center">NO</th>
                    <th className="bg-gray-100 text-gray-600 font-normal px-2 py-1 text-center">파라미터</th>
                    <th className="bg-gray-100 text-gray-600 font-normal px-2 py-1 text-center">VALUE</th>
                  </tr>
                </thead>
                <tbody>
                  {outputParams.map((p, i) => (
                    <tr key={i}>
                      <td className="px-2 py-1 text-center">{i + 1}</td>
                      <td className="px-2 py-1 text-center">{p.param}</td>
                      <td className="px-2 py-1 text-center">{p.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs" onClick={onClose}>확인</button>
        </div>
      </div>
    </div>
  )
}

export default ResultLogModal 