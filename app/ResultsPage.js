import React from 'react';
import { useLocation, Link } from 'react-router-dom'; // ◀◀ インポート
import styled from 'styled-components';

// (InputForm.jsからResultsContainerとSectionのスタイル定義をコピー)
const Section = styled.div`
  margin-bottom: 30px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const ResultsContainer = styled(Section)`
  max-width: 900px;
  margin: 40px auto;
  border-top: 4px solid #007bff;

  h1 {
    margin-top: 0;
    color: #007bff;
    text-align: center;
  }
  
  p {
    font-size: 18px;
    line-height: 1.6;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #eee;
    padding: 10px 0;
  }

  span {
    font-weight: bold;
    font-size: 20px;
    color: #333;
  }

  .rank-A { color: #4CAF50; }
  .rank-B { color: #FFC107; }
  .rank-C { color: #F44336; }
`;

const BackLink = styled(Link)`
  display: block;
  text-align: center;
  margin-top: 30px;
  font-size: 16px;
  color: #007bff;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

function ResultsPage() {
  const location = useLocation();
  const simulationResult = location.state?.result; // InputFormから渡された結果データ

  // もし結果データがなければ、入力画面に戻るように促す
  if (!simulationResult) {
    return (
      <ResultsContainer>
        <h1>結果がありません</h1>
        <p>シミュレーションデータが見つかりません。入力画面から再度実行してください。</p>
        <BackLink to="/">入力画面に戻る</BackLink>
      </ResultsContainer>
    );
  }

  return (
    <ResultsContainer>
      <h1>うちなー収益物件シミュレーター 結果</h1>
      <p>表面利回り: <span>{simulationResult.surface_yield} %</span></p>
      <p>実質利回り: <span>{simulationResult.net_yield} %</span></p>
      <p>年間キャッシュフロー: <span>{simulationResult.cash_flow.toLocaleString()} 万円</span></p>
      <p>DSCR: <span>{simulationResult.dscr}</span></p>
      <p>LTV: <span>{simulationResult.ltv} %</span></p>
      <p>スコア: <span>{simulationResult.score} 点</span></p>
      <p>総合ランク: <span className={`rank-${simulationResult.rank}`}>{simulationResult.rank}</span></p>
      <BackLink to="/">別の物件でシミュレーションする</BackLink>
    </ResultsContainer>
  );
}

export default ResultsPage;