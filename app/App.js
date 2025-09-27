import React from 'react';
import { Routes, Route } from 'react-router-dom'; // ◀◀ インポート
import InputForm from './InputForm'; // InputFormをインポート
import ResultsPage from './ResultsPage'; // ResultsPageをインポート

function App() {
  return (
    <div>
      {/* ▼▼▼ ページの定義をここに追加 ▼▼▼ */}
      <Routes>
        {/* ルートURL ("/") ではInputFormを表示 */}
        <Route path="/" element={<InputForm />} />

        {/* "/results" というURLではResultsPageを表示 */}
        <Route path="/results" element={<ResultsPage />} />
      </Routes>
    </div>
  );
}

export default App;