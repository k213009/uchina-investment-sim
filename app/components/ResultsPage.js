"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styled, { keyframes } from 'styled-components';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// --- グローバルヘルパー関数 ---
const getRankComment = (rank) => {
  switch (rank) {
    case 'A': return { text: '投資すべき優良物件です', color: '#a7d7a9' };
    case 'B': return { text: '採算ラインはクリア。十分に投資を検討できる物件です', color: '#fde29f' };
    case 'C': return { text: '収益性に懸念あり。条件改善（価格交渉など）を検討すべき物件です', color: '#fecba0' };
    case 'D': return { text: '投資すべきではない物件です', color: '#f7c6c9' };
    default: return { text: '判定不能', color: '#e0e0e0' };
  }
};

const safeGet = (obj, path, defaultValue = 0) => {
    if (!obj) return defaultValue;
    const keys = Array.isArray(path) ? path : path.split('.');
    const result = keys.reduce((acc, key) => (acc && acc[key] !== undefined) ? acc[key] : undefined, obj);
    return result !== undefined ? result : defaultValue;
};

// --- MetricWithTooltip Component Definition ---
const TooltipWrapper = styled.div`position: relative; display: inline-flex; align-items: center; margin-left: ${props => props.noLeftMargin ? '0' : '8px'};`;
const TooltipIcon = styled.span`cursor: help; color: #007bff; border: 1px solid #007bff; border-radius: 50%; width: 20px; height: 20px; display: inline-flex; justify-content: center; align-items: center; font-size: 14px; font-weight: bold; line-height: 1;`;
const TooltipText = styled.div`visibility: hidden; width: 280px; background-color: #333; color: #fff; text-align: left; border-radius: 6px; padding: 10px; position: absolute; z-index: 10; bottom: 125%; left: 50%; margin-left: -140px; opacity: 0; transition: opacity 0.3s; font-size: 14px; line-height: 1.5; &::after { content: ""; position: absolute; top: 100%; left: 50%; margin-left: -5px; border-width: 5px; border-style: solid; border-color: #333 transparent transparent transparent; } ${TooltipWrapper}:hover & { visibility: visible; opacity: 1; }`;
const MetricWithTooltip = ({ label, tooltipText, noLeftMargin }) => (<TooltipWrapper noLeftMargin={noLeftMargin}> {label} <TooltipIcon>?</TooltipIcon> <TooltipText>{tooltipText}</TooltipText> </TooltipWrapper>);


// --- styled-components ---
const fadeIn = keyframes`from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); }`;
const PageContainer = styled.div`background-color: #f0f2f5; padding: 20px; font-family: 'Helvetica Neue', Arial, sans-serif; color: #333;`;
const ResultsContainer = styled.div`max-width: 900px; margin: 20px auto; animation: ${fadeIn} 0.6s ease-out;`;
const Section = styled.div`margin-bottom: 20px; padding: 25px; background-color: #fff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);`;
const Header = styled.div`text-align: center; margin-bottom: 30px; h1 { margin-top: 0; color: #007bff; font-weight: 600; font-size: 2.5rem; }`;
const PrerequisiteSection = styled.div`text-align: center; font-size: 1.1rem; color: #555; background-color: #e9ecef; padding: 10px; border-radius: 8px; margin-bottom: 20px;`;
const VerdictSection = styled(Section)`text-align: center; padding-top: 20px; padding-bottom: 20px;`;
const VerdictRank = styled.p`font-size: 1.5rem; font-weight: bold; color: #333; margin: 0 0 5px 0; span { font-size: 2.5rem; color: ${props => props.rank === 'B' ? '#000' : '#fff'}; background-color: ${props => getRankComment(props.rank).color}; padding: 2px 10px; border-radius: 8px; }`;
const VerdictText = styled.p`font-size: 1.5rem; margin: 15px 0; line-height: 1.4;`;
const VerdictBox = styled.div`margin-top: 20px; background-color: #f8f9fa; padding: 15px; border-radius: 8px; color: #333;`;
const BoxTitle = styled.div`font-size: 1.1rem; color: #555; display: flex; align-items: center; justify-content: center; margin-bottom: 5px;`;
const BoxValue = styled.div`font-weight: bold; color: #007bff; font-size: 1.8rem;`;
const ARankGoalBox = styled(VerdictBox)`display: flex; flex-direction: column; align-items: center; gap: 10px;`;
const ARankHorizontalGroup = styled.div`display: flex; justify-content: center; flex-wrap: wrap; gap: 20px 40px; width: 100%;`;
const ARankItemGroup = styled.div``;
const ARankValue = styled(BoxValue)`color: #28a745;`;
const ARankSubText = styled.div`font-size: 0.9rem; color: #555; margin-top: 2px;`;
const BankAppraisalBox = styled(VerdictBox)``;
const BankAppraisalValue = styled(BoxValue)`font-size: 1.8rem; small { font-size: 0.9rem; font-weight: normal; color: #666; display: block; margin-top: 5px; }`;
const MatrixContainer = styled.div`display: flex; align-items: center; justify-content: center; margin-top: 20px; overflow-x: auto;`;
const MatrixAxisY = styled.div`writing-mode: vertical-rl; margin-right: 15px; font-weight: bold; color: #555; font-size: 0.9rem; white-space: nowrap;`;
const MatrixTableWrapper = styled.div`position: relative; padding-top: 30px;`;
const MatrixAxisX = styled.div`position: absolute; top: 0; left: 50%; transform: translateX(-50%); font-weight: bold; color: #555; font-size: 0.9rem; white-space: nowrap;`;
const MatrixExplanation = styled.div`font-size: 0.9rem; color: #555; background-color: #f8f9fa; padding: 10px; border-radius: 6px; margin-bottom: 15px; p { margin: 5px 0; }`;
const ScoreMatrixTable = styled.table`border-collapse: collapse; text-align: center; font-size: 1rem; th, td { border: 1px solid #dee2e6; padding: 10px 14px; min-width: 70px; } th { background-color: #f8f9fa; font-weight: 600; } td { color: #333; font-weight: bold; } .highlight { outline: 3px solid #0d6efd; box-shadow: 0 0 15px rgba(0, 123, 255, 0.4); } .rank-A { background-color: #a7d7a9; } .rank-B { background-color: #fde29f; } .rank-C { background-color: #fecba0; } .rank-D { background-color: #f7c6c9; }`;
const SectionTitle = styled.h2`margin-top: 0; color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; font-weight: 600; font-size: 20px; margin-bottom: 20px;`;
const SectionSubTitle = styled.p`text-align: center; margin-top: -15px; color: #555; font-size: 0.9rem;`;
const BackLink = styled(Link)`display: block; text-align: center; margin: 40px auto 0; padding: 12px; font-size: 18px; color: #007bff; text-decoration: none; border-radius: 8px; border: 1px solid #007bff; max-width: 400px; transition: background-color 0.2s, color 0.2s; &:hover { background-color: #007bff; color: #fff; }`;
const DetailsTable = styled.div`p { font-size: 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding: 12px 5px; margin: 0; } p:last-child { border-bottom: none; } span { font-weight: bold; } div { display: flex; align-items: center; }`;
const ExpenseDetails = styled.div`display: flex; flex-direction: column; padding-left: ${props => (props.isSubItem ? '10px' : '20px')}; border-left: 3px solid #eee; margin: 10px 0; max-height: ${props => (props.isOpen ? '500px' : '0')}; overflow: hidden; transition: max-height 0.5s ease-in-out;`;
const ExpenseItem = styled.div`color: #666; font-size: 15px; padding: 8px 5px; display: flex; justify-content: space-between; border-bottom: 1px dotted #f0f0f0; width: 100%; &:last-child { border-bottom: none; }`;
const DetailsToggle = styled.button`background: none; border: 1px solid #007bff; color: #007bff; padding: 2px 8px; border-radius: 12px; font-size: 12px; cursor: pointer; margin-left: 15px; &:hover { background: #007bff; color: #fff; }`;
const FundingPlanGrid = styled.div`display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px; padding: 10px 0;`;
const FundingDetails = styled.div`h4 { margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 8px; color: #555; } p { font-size: 16px; display: flex; justify-content: space-between; padding: 8px 0; margin: 0; border: none; } hr { border: none; border-top: 2px solid #333; margin: 10px 0; } strong { font-size: 18px; }`;
const FundingComment = styled.div`background-color: #e7f3ff; border-left: 5px solid #007bff; padding: 15px; margin-bottom: 20px; border-radius: 8px; font-size: 1rem; color: #333; strong { color: #0056b3; }`;
const NotesSection = styled.div`margin-top: 25px; padding: 15px; background-color: #fafafa; border-radius: 6px; font-size: 14px; color: #555; h4 { margin-top: 0; font-size: 15px; color: #333; } ul { padding-left: 20px; margin: 0; } li { margin-bottom: 8px; line-height: 1.6; }`;
const DisclaimerSection = styled(Section)`margin-top: 40px; background-color: #fff8f8; border-left: 5px solid #d32f2f; h2 { font-weight: 700; color: #d32f2f !important; } p { font-size: 16px; margin-bottom: 15px; color: #333; } ul { list-style-type: none; padding-left: 0; } li { margin-bottom: 10px; font-size: 15px; color: #555; line-height: 1.6; }`;
const ChartWrapper = styled.div`position: relative; width: 100%;`;

function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState(null);
  const [inputs, setInputs] = useState(null);
  const [showExpenses, setShowExpenses] = useState(false);
  const [showFundingExpenses, setShowFundingExpenses] = useState(true);

  useEffect(() => {
    const storedData = sessionStorage.getItem('simulationResult');
    const storedInputs = sessionStorage.getItem('simulationInputs');
    if (storedData && storedInputs) {
      setResult(JSON.parse(storedData));
      setInputs(JSON.parse(storedInputs));
    } else {
      alert('表示するシミュレーションデータがありません。入力画面から再度実行してください。');
      router.push('/');
    }
    window.scrollTo(0, 0);
  }, [router]);

  if (!result || !inputs) { return (<PageContainer><ResultsContainer><Header><h1>結果を読み込んでいます...</h1></Header></ResultsContainer></PageContainer>); }

  const rankInfo = getRankComment(result.rank);

  const getDscrCategory = (dscr) => {
    if (dscr >= 1.4) return 0; if (dscr >= 1.3) return 1; if (dscr >= 1.2) return 2; if (dscr >= 1.1) return 3; if (dscr >= 1.0) return 4; if (dscr >= 0.9) return 5; if (dscr >= 0.8) return 6; return 7;
  };
  const getLtvCategory = (ltv) => {
    if (ltv <= 60) return 0; if (ltv <= 80) return 1; if (ltv <= 100) return 2; if (ltv <= 120) return 3; return 4;
  };
  const dscrIndex = getDscrCategory(result.dscr);
  const ltvIndex = getLtvCategory(result.ltv);
  
  // ▼▼▼ 修正点：バックエンドのロジックと完全に一致するマトリクスに変更 ▼▼▼
  const scoreMatrix = {
    rows: ['1.4~', '1.3~', '1.2~', '1.1~', '1.0~', '0.9~', '0.8~', '0.8未満'],
    cols: ['~60%', '~80%', '~100%', '~120%', '120%~'],
    scores: [
        ['A', 'A', 'A', 'A', 'B'],
        ['A', 'A', 'A', 'A', 'B'],
        ['A', 'A', 'B', 'B', 'B'],
        ['A', 'B', 'B', 'B', 'C'],
        ['B', 'B', 'B', 'B', 'C'],
        ['B', 'B', 'B', 'C', 'C'],
        ['B', 'B', 'C', 'C', 'C'],
        ['B', 'C', 'C', 'C', 'D']
    ]
  };
  // ▲▲▲ ここまで ▲▲▲

  const roomsNeeded = Math.ceil(inputs.rooms * (result.break_even_occupancy / 100));
  const additionalEquity = Math.max(0, result.required_equity - (result.market_price - inputs.loanAmount));

  const projectionData = result.long_term_projection || [];
  const labels = projectionData.map(d => `${d.year}年目`);
  const chartData = { labels, datasets: [ { label: '年間キャッシュフロー (万円)', data: projectionData.map(d => d.cash_flow), borderColor: 'rgb(53, 162, 235)', backgroundColor: 'rgba(53, 162, 235, 0.5)', yAxisID: 'y', }, { label: 'ローン残高 (万円)', data: projectionData.map(d => d.loan_balance), borderColor: 'rgb(255, 99, 132)', backgroundColor: 'rgba(255, 99, 132, 0.5)', yAxisID: 'y1', }, { label: '保全価格 (万円)', data: projectionData.map(d => d.collateral_value), borderColor: 'rgb(75, 192, 192)', backgroundColor: 'rgba(75, 192, 192, 0.5)', yAxisID: 'y1', }, { label: 'キャッシュフロー累積 (万円)', data: projectionData.map(d => d.cumulative_cash_flow), borderColor: 'rgb(255, 206, 86)', backgroundColor: 'rgba(255, 206, 86, 0.5)', yAxisID: 'y1', } ], };
  const chartOptions = { responsive: true, interaction: { mode: 'index', intersect: false }, plugins: { legend: { position: 'bottom', }, }, scales: { y: { type: 'linear', display: true, position: 'left', title: { display: true, text: '年間キャッシュフロー (万円)' }}, y1: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'ローン残高 / 評価額 / CF累積 (万円)' }, grid: { drawOnChartArea: false }}, }, };

  return (
    <PageContainer>
      <ResultsContainer>
        <Header><h1>うちなー収益物件シミュレーター 結果</h1></Header>
        <PrerequisiteSection><p><strong>シミュレーションの前提条件：</strong> 借入希望額 <strong>{safeGet(result, 'user_loan_amount', 0).toLocaleString()}</strong> 万円で試算</p></PrerequisiteSection>
        <VerdictSection>
          <VerdictRank rank={result.rank}>総合ランク： <span>{result.rank}</span></VerdictRank>
          <VerdictText>{rankInfo.text}</VerdictText>
          <VerdictBox>
            <BoxTitle>
                初年度の年間キャッシュフロー（税引前）
                <MetricWithTooltip label="" tooltipText="家賃収入から全ての経費とローン返済を差し引いた後、1年間で最終的に手元に残る現金（お小遣い）のことです。" noLeftMargin />
            </BoxTitle>
            <BoxValue>{safeGet(result, 'cash_flow', 0).toLocaleString()} 万円</BoxValue>
          </VerdictBox>
          <VerdictBox>
            <BoxTitle>損益分岐点</BoxTitle>
            <BoxValue>{inputs.rooms}部屋中 {roomsNeeded}部屋</BoxValue>
            が埋まれば黒字になります
          </VerdictBox>
          {result.rank !== 'A' && additionalEquity >= 0 && (
            <ARankGoalBox>
                <ARankHorizontalGroup>
                    <ARankItemGroup>
                        <BoxTitle>借入可能額</BoxTitle>
                        <ARankValue>{result.estimated_loan_amount.toLocaleString()} 万円</ARankValue>
                    </ARankItemGroup>
                    <ARankItemGroup>
                        <BoxTitle>必要自己資金</BoxTitle>
                        <ARankValue>{result.required_equity.toLocaleString()} 万円</ARankValue>
                    </ARankItemGroup>
                </ARankHorizontalGroup>
                <ARankSubText>※Aランク評価の目安</ARankSubText>
            </ARankGoalBox>
          )}
          
          <BankAppraisalBox>
              <BoxTitle>銀行評価額</BoxTitle>
              <BankAppraisalValue>
                {result.bank_appraisal_value.toLocaleString()} 万円<br/>
                <small>（土地: {result.cost_approach_breakdown.land.toLocaleString()}万円, 建物: {result.cost_approach_breakdown.building.toLocaleString()}万円）</small>
              </BankAppraisalValue>
          </BankAppraisalBox>
          
        </VerdictSection>
        <Section>
          <SectionTitle>総合ランクの評価根拠</SectionTitle>
          <MatrixExplanation>
            <p><strong>DSCR (ローン返済の安全性)：</strong>家賃収入でローンをどれだけカバーできるかを示す指標。数値が高いほど安全です。</p>
            <p><strong>LTV (借入金の健全性)：</strong>物件の担保価値に対する借入金の割合。数値が低いほど健全です。</p>
          </MatrixExplanation>
          <MatrixContainer>
            <MatrixAxisY>DSCR (安全性)</MatrixAxisY>
            <MatrixTableWrapper>
                <MatrixAxisX>LTV (健全性)</MatrixAxisX>
                <ScoreMatrixTable>
                <thead><tr><th>↓</th>{scoreMatrix.cols.map(col => <th key={col}>{col}</th>)}</tr></thead>
                <tbody>
                    {scoreMatrix.rows.map((row, rIndex) => (
                    <tr key={row}><th>{row}</th>
                        {scoreMatrix.scores[rIndex].map((score, cIndex) => (
                        <td key={cIndex} className={`${(rIndex === dscrIndex && cIndex === ltvIndex) ? 'highlight' : ''} rank-${score}`}>{score}</td>
                        ))}
                    </tr>
                    ))}
                </tbody>
                </ScoreMatrixTable>
            </MatrixTableWrapper>
          </MatrixContainer>
        </Section>
        <Section>
           <SectionTitle>Aランクを目指す場合の資金計画（目安）</SectionTitle>
            {result.rank !== 'A' && additionalEquity > 0 && (
                <FundingComment>
                    Aランクを目指すには、自己資金をあと <strong>{additionalEquity.toLocaleString()}万円</strong> 増やすことを検討しましょう。
                </FundingComment>
            )}
           <FundingPlanGrid><FundingDetails><h4>【費用】</h4><p><span>建物価格:</span><span>{safeGet(result, 'funding_plan.building_cost', 0).toLocaleString()} 万円</span></p><p><span>土地価格:</span><span>{safeGet(result, 'funding_plan.land_cost', 0).toLocaleString()} 万円</span></p><p><div><span>諸費用合計:</span><DetailsToggle onClick={() => setShowFundingExpenses(!showFundingExpenses)}>{showFundingExpenses ? '隠す' : '詳細'}</DetailsToggle></div><span>{safeGet(result, 'funding_plan.other_costs_details.total', 0).toLocaleString()} 万円</span></p><ExpenseDetails isOpen={showFundingExpenses} isSubItem={true}><ExpenseItem><div>仲介手数料:</div><div>{safeGet(result, 'funding_plan.other_costs_details.brokerage_fee', 0).toLocaleString()} 万円</div></ExpenseItem><ExpenseItem><div>印紙代:</div><div>{safeGet(result, 'funding_plan.other_costs_details.stamp_duty', 0).toLocaleString()} 万円</div></ExpenseItem><ExpenseItem><div>登記費用:</div><div>{safeGet(result, 'funding_plan.other_costs_details.registration_tax', 0).toLocaleString()} 万円</div></ExpenseItem><ExpenseItem><div>不動産取得税:</div><div>{safeGet(result, 'funding_plan.other_costs_details.property_acquisition_tax', 0).toLocaleString()} 万円</div></ExpenseItem></ExpenseDetails><hr /><p><strong>総費用合計</strong><strong>{safeGet(result, 'market_price', 0).toLocaleString()} 万円</strong></p></FundingDetails><FundingDetails><h4>【調達】</h4><p><MetricWithTooltip label="借入可能額（目安）" tooltipText="総合ランクがAとなる、借入額の上限の目安です。この金額であれば、銀行から資金調達できる可能性が高いと判断できます。" /><span>{safeGet(result, 'estimated_loan_amount', 0).toLocaleString()} 万円</span></p><p><MetricWithTooltip label="必要自己資金額（目安）" tooltipText="物件の総費用合計から、上記の借入可能額を差し引いた金額です。最低限この程度の自己資金が必要になる可能性があります。" /><span>{safeGet(result, 'required_equity', 0).toLocaleString()} 万円</span></p><hr /><p><strong>調達資金合計</strong><strong>{(safeGet(result, 'estimated_loan_amount', 0) + safeGet(result, 'required_equity', 0)).toLocaleString()} 万円</strong></p></FundingDetails></FundingPlanGrid>
        </Section>
        <Section>
          <SectionTitle>物件評価額の比較</SectionTitle>
          <DetailsTable><p><MetricWithTooltip label="市場価格（購入価格）" tooltipText="あなたが入力した、この物件の市場での取引価格です。全ての利回りは、この価格を基準に計算されます。" /><span>{safeGet(result, 'market_price', 0).toLocaleString()} 万円</span></p><p><MetricWithTooltip label="積算価格" tooltipText={`${safeGet(result, 'land_price_source', '近傍基準地データが見つかりませんでした')}。建物は再調達原価から築年数に応じた減価を差し引いて算出しています。`} /><span>{safeGet(result, 'cost_approach_value', 0).toLocaleString()} 万円</span></p><ExpenseDetails isOpen={true} isSubItem={true} style={{paddingLeft: '10px'}}><ExpenseItem><div>土地(評価):</div><div>{safeGet(result, 'cost_approach_breakdown.land', 0).toLocaleString()} 万円</div></ExpenseItem><ExpenseItem><div>建物(評価):</div><div>{safeGet(result, 'cost_approach_breakdown.building', 0).toLocaleString()} 万円</div></ExpenseItem></ExpenseDetails><p><MetricWithTooltip label="収益価格" tooltipText="この物件の年間の収益力から逆算した価値です。" /><span>{safeGet(result, 'income_approach_value', 0).toLocaleString()} 万円</span></p><p><MetricWithTooltip label="銀行採用評価額" tooltipText="積算価格(70%)と収益価格(30%)を加味した、銀行が融資判断のベースとする評価額です。" /><span>{safeGet(result, 'bank_appraisal_value', 0).toLocaleString()} 万円</span></p><p><MetricWithTooltip label="保全価格" tooltipText="銀行採用評価額に、さらに保守的な掛け目（80%）を乗じた、最終的な担保評価額です。" /><span>{safeGet(result, 'collateral_value', 0).toLocaleString()} 万円</span></p></DetailsTable>
        </Section>
        <Section>
          <SectionTitle>初年度収支詳細</SectionTitle>
          <DetailsTable>
            <p><strong>家賃収入</strong><span>{safeGet(result, 'yearly_revenue', 0).toLocaleString()} 万円</span></p>
            <p><div><strong>経費合計</strong><DetailsToggle onClick={() => setShowExpenses(!showExpenses)}>{showExpenses ? '隠す' : '詳細'}</DetailsToggle></div><span>- {safeGet(result, 'year1_expenses.total', 0).toLocaleString()} 万円</span></p>
            <ExpenseDetails isOpen={showExpenses}><ExpenseItem><div>管理手数料:</div><div>{safeGet(result, 'year1_expenses.management_fee', 0).toLocaleString()} 万円</div></ExpenseItem><ExpenseItem><div>固定資産税:</div><div>{safeGet(result, 'year1_expenses.property_tax', 0).toLocaleString()} 万円</div></ExpenseItem><ExpenseItem><div>修繕費:</div><div>{safeGet(result, 'year1_expenses.repair_cost', 0).toLocaleString()} 万円</div></ExpenseItem><ExpenseItem><div>資本的支出(大規模修繕積立):</div><div>{safeGet(result, 'year1_expenses.capital_expenditure', 0).toLocaleString()} 万円</div></ExpenseItem><ExpenseItem><div>火災保険料:</div><div>{safeGet(result, 'year1_expenses.fire_insurance', 0).toLocaleString()} 万円</div></ExpenseItem><ExpenseItem><div>共用電気水道料:</div><div>{safeGet(result, 'year1_expenses.utilities', 0).toLocaleString()} 万円</div></ExpenseItem>{safeGet(result, 'year1_expenses.elevator_cost', 0) > 0 && <ExpenseItem><div>エレベーター維持費:</div><div>{result.year1_expenses.elevator_cost.toLocaleString()} 万円</div></ExpenseItem>}<ExpenseItem><div>貯水槽清掃費:</div><div>{safeGet(result, 'year1_expenses.water_tank_cost', 0).toLocaleString()} 万円</div></ExpenseItem></ExpenseDetails>
            <p><strong>ローン返済額</strong><span>- {safeGet(result, 'yearly_loan_payment', 0).toLocaleString()} 万円</span></p>
            <hr style={{border: 'none', borderBottom: '1px solid #ccc', margin: '5px 0'}}/><p><strong>年間キャッシュフロー</strong><span>{safeGet(result, 'cash_flow', 0).toLocaleString()} 万円</span></p>
          </DetailsTable>
        </Section>
        <Section>
            <SectionTitle>最低限知るべき指標</SectionTitle>
            <SectionSubTitle>投資判断を行う上で、最低限確認しておきたい基本的な指標です。</SectionSubTitle>
            <DetailsTable>
                <p><MetricWithTooltip label="表面利回り" tooltipText="物件価格に対する年間家賃収入の割合。経費は考慮しない大まかな指標です。沖縄では新築なら5%以上、中古なら6%以上が一つの目安とされます。" /><span>{safeGet(result, 'surface_yield', 0)} %</span></p>
                <p><MetricWithTooltip label="実質利回り" tooltipText="経費を差し引いた後の、より現実に近い利回りです。この数値が高いほど収益性が高いと言えます。" /><span>{safeGet(result, 'net_yield', 0)} %</span></p>
                <p><MetricWithTooltip label="損益分岐点入居率" tooltipText="最低限どれくらいの入居率があれば赤字にならないかを示す割合。この数値が低いほど、空室に強い物件と言えます。" /><span>{safeGet(result, 'break_even_occupancy', 0)} %</span></p>
            </DetailsTable>
        </Section>
        <Section>
            <SectionTitle>銀行が確認している指標</SectionTitle>
            <DetailsTable>
                <p><MetricWithTooltip label="DSCR" tooltipText="ローン返済の安全性を測る指標。家賃収入でローンをどれだけカバーできるかを示します。銀行融資では1.1以上が求められることが多いです。" /><span>{safeGet(result, 'dscr', 0)}</span></p>
                <p><MetricWithTooltip label="LTV（対保全価格）" tooltipText="銀行の最終的な担保評価である「保全価格」に対する借入金の割合。銀行はこの指標を重視し、100%以下であることが望ましいです。" /><span>{safeGet(result, 'ltv', 0)} %</span></p>
                <p><MetricWithTooltip label="担保充足率" tooltipText="借入金額を保全価格でどれだけカバーできているかを示す割合。100%以上であれば、物件の担保価値だけで借入金をカバーできていることを意味します。" /><span>{safeGet(result, 'collateral_coverage_ratio', 0)} %</span></p>
                <p><MetricWithTooltip label="無担保額" tooltipText="借入金額のうち、保全価格でカバーしきれていない部分の金額。この金額が少ないほど、融資審査上有利になります。" /><span>{safeGet(result, 'unsecured_amount', 0).toLocaleString()} 万円</span></p>
            </DetailsTable>
        </Section>
        <Section>
          <SectionTitle>長期収支シミュレーション (35年)</SectionTitle>
          <ChartWrapper><Line options={chartOptions} data={chartData} /></ChartWrapper>
          <NotesSection>
            <h4>【シミュレーションの前提条件】</h4>
            <ul>
              <li>① キャッシュフローは、所得税・住民税といった税金や、会計上の減価償却費を考慮していない<strong>税引前の数値</strong>です。</li>
              <li>② 長期シミュレーションでは、<strong>経費は初年度の金額で35年間一定</strong>とし、<strong>家賃収入のみが築10年目以降、5年ごとに1%ずつ下落</strong>するモデルで計算しています。</li>
              <li>③ この長期シミュレーションは多くの仮定に基づいた簡易的な予測であり、将来の収益を保証するものではありません。<strong>あくまで参考としてご活用ください。</strong></li>
            </ul>
          </NotesSection>
        </Section>
        <DisclaimerSection>
            <h2 style={{ color: '#d32f2f', borderBottom: '2px solid #ffcdd2', paddingBottom: '10px' }}>⚠️ 免責事項（本ツール利用上の注意）</h2>
            <p><strong>本アプリケーションで表示される評価額や融資可能額は、お客様が入力したデータと、一般公開された【概算の計算式】に基づいています。</strong></p>
            <ul>
              <li>実際の金融機関の審査や担保評価は、物件の個別状況や融資先の信用状況など、<strong>より多くの要因</strong>で決定されます。</li>
              <li>本ツールはあくまで参考情報としてご利用ください。<strong>実際の融資判断や投資の最終決定は、必ず専門家にご相談の上、ご自身の責任において行ってください。</strong></li>
            </ul>
        </DisclaimerSection>
        <BackLink href="/">別の物件でシミュレーションする</BackLink>
      </ResultsContainer>
    </PageContainer>
  );
}

export default ResultsPage;

