"use client";

import axios from "axios";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import styled from "styled-components";

// --- styled-componentsの定義 ---

const TooltipWrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
`;

// ▼▼▼ 変更点：「？」マークのデザインを画像に合わせて修正 ▼▼▼
const TooltipIcon = styled.span`
  cursor: help;
  background-color: #fff;
  color: #007bff;
  border: 1px solid #007bff;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: 14px;
  user-select: none;
  line-height: 1;
`;
// ▲▲▲ ここまで ▲▲▲

const TooltipText = styled.div`
  visibility: hidden;
  width: 280px;
  background-color: #333;
  color: #fff;
  text-align: left;
  border-radius: 6px;
  padding: 10px;
  position: absolute;
  z-index: 1;
  bottom: 150%;
  left: 50%;
  margin-left: -140px;
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 14px;
  line-height: 1.6;

  &::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #333 transparent transparent transparent;
  }

  ${TooltipWrapper}:hover & {
    visibility: visible;
    opacity: 1;
  }
`;
const LabelWithTooltip = ({ htmlFor, label, tooltipText }) => (
  <Label htmlFor={htmlFor} style={{ display: 'flex', alignItems: 'center' }}>
    {label}
    {tooltipText && (
      <TooltipWrapper>
        <TooltipIcon>?</TooltipIcon>
        <TooltipText>{tooltipText}</TooltipText>
      </TooltipWrapper>
    )}
  </Label>
);

const FormContainer = styled.div`
  max-width: 900px;
  margin: 40px auto;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #f9f9f9;
`;
const Section = styled.div`
  margin-bottom: 30px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;
const InputGroup = styled.div`
  margin-bottom: 24px;
`;
const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #333;
`;
const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid ${(props) => (props.$hasError ? "#d32f2f" : "#ddd")};
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 16px;
  color: #000 !important; 
  &:focus {
    outline: none;
    border-color: ${(props) => (props.$hasError ? "#d32f2f" : "#007bff")};
    box-shadow: 0 0 0 2px
      ${(props) =>
        props.$hasError ? "rgba(211, 47, 47, 0.2)" : "rgba(0, 123, 255, 0.2)"};
  }
`;
const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid ${(props) => (props.$hasError ? "#d32f2f" : "#ddd")};
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 16px;
  background-color: white;
  color: #000 !important;
  &:focus {
    outline: none;
    border-color: ${(props) => (props.$hasError ? "#d32f2f" : "#007bff")};
    box-shadow: 0 0 0 2px
      ${(props) =>
        props.$hasError ? "rgba(211, 47, 47, 0.2)" : "rgba(0, 123, 255, 0.2)"};
  }
`;
const Button = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover {
    background-color: #0056b3;
  }
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;
const DemoButton = styled(Button)`
  background-color: #28a745;
  &:hover {
    background-color: #218838;
  }
  margin-top: 15px;
`;
const SectionTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 20px;
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
  color: #007bff;
`;
const ErrorMessage = styled.span`
  color: #d32f2f;
  font-size: 14px;
  display: block;
  margin-top: 5px;
`;
const AppDescription = styled(Section)`
  background-color: #e7f3ff;
  border-left: 5px solid #007bff;
  color: #333;
  p, ul {
    margin-bottom: 10px;
    line-height: 1.6;
  }
  h4 {
    font-size: 1.2em;
    font-weight: bold;
    color: #0056b3;
    margin-bottom: 10px;
  }
`;
const Footer = styled.footer`
  margin-top: 40px;
  text-align: left;
  font-size: 14px;
  color: #666;
  p {
    margin-bottom: 10px;
  }
  a {
    color: #007bff;
  }
`;

function InputForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm();

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const addressValue = watch("address");

  useEffect(() => {
    if (!addressValue) return;
    const getRegionFromAddress = (address) => {
      const chunanbuCities = ["浦添", "宜野湾", "沖縄市", "うるま", "糸満", "豊見城", "南城", "西原", "中城", "北中城", "北谷", "嘉手納", "読谷", "与那原", "八重瀬"];
      const hokubuCities = ["名護", "国頭", "大宜味", "東村", "今帰仁", "本部", "恩納", "宜野座", "金武", "伊江", "伊平屋", "伊是名", "久米島", "渡名喜", "粟国", "渡嘉敷", "座間味", "南大東", "北大東", "宮古島", "多良間", "石垣", "竹富", "与那国"];
      if (address.includes("那覇")) return "Naha";
      if (chunanbuCities.some(city => address.includes(city))) return "Chunanbu";
      if (hokubuCities.some(city => address.includes(city))) return "Hokubu";
      return "";
    };
    const region = getRegionFromAddress(addressValue);
    setValue("region", region, { shouldValidate: true });
  }, [addressValue, setValue]);

  const handleDemoData = () => {
    reset({
      address: "沖縄市泡瀬4丁目", rent: 2304, rooms: 24, buildingCost: 25650, landCost: 8000, loanAmount: 30000, loanTerm: 35, interestRate: 2.3, structure: "RC", buildingAge: 0, buildingArea: 1080, landArea: 600, hasElevator: "yes", region: "Chunanbu",
    });
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await axios.post("/api/simulate", data, {
        headers: { "Content-Type": "application/json" },
      });
      
      if (response.data) {
        try {
          sessionStorage.setItem('simulationResult', JSON.stringify(response.data));
          sessionStorage.setItem('simulationInputs', JSON.stringify(data));
          router.push('/results');
        } catch (e) {
          console.error("結果の保存またはページ遷移に失敗:", e);
          alert("結果の表示に失敗しました。");
        }
      } else {
        alert("サーバーから有効な結果を取得できませんでした。");
      }
    } catch (error) {
      console.error("サーバー通信エラー:", error);
      const errorMessage = error.response
        ? error.response.data.detail?.error || `サーバーエラー: ${error.response.status}`
        : "サーバーとの通信に失敗しました。";
      alert(`エラーが発生しました: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormContainer>
      <h1 style={{ fontSize: '2.5em', textAlign: 'center', color: '#007bff', marginBottom: '30px', fontWeight: 700 }}>
        うちなー収益物件シミュレーター
      </h1>
      
      <AppDescription>
        <h4>1. 対象となる方</h4>
        <p>
          ・ これから沖縄でアパート・マンション・外人住宅などを購入して家賃収入を得たい方<br/>
          ・ 物件購入のために、銀行からの借入（アパートローン）を検討している方
        </p>

        <h4>2. このアプリでシミュレーションできること</h4>
        <p>
          検討中の物件が<strong>優良物件かどうか（投資すべきか）</strong>を判断し、<strong>いくらまでなら銀行から借入ができそうか</strong>を瞬時にシミュレーションします。
        </p>

        <h4>3. シミュレーションで分かる具体的な指標</h4>
        <p>
          単なる利回りだけでなく、元銀行員のノウハウを詰め込んだ以下の指標を算出します。
        </p>
        <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
          <li><strong>予想収益：</strong>年間でいくら儲かるのか（キャッシュフロー）</li>
          <li><strong>銀行評価額：</strong>銀行目線での土地・建物の評価額と、販売価格との差額</li>
          <li><strong>損益分岐点：</strong>最低何部屋入居すれば赤字にならないか（損益分岐点入居率）</li>
        </ul>
      </AppDescription>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Section>
          <SectionTitle>物件情報</SectionTitle>
          <InputGroup>
            <LabelWithTooltip htmlFor="address" label="物件の所在地" tooltipText="「那覇市おもろまち4丁目」のように、市町村名から入力してください。入力された市町村名をもとに、土地評価額の算出に必要な「エリア」を自動で判定します。" />
            <Input id="address" placeholder="例：那覇市おもろまち4丁目" $hasError={!!errors.address} {...register("address", { required: "物件の所在地は必須です" })} />
            {errors.address && <ErrorMessage>{errors.address.message}</ErrorMessage>}
          </InputGroup>
          <input type="hidden" {...register("region", { required: "エリアが特定できませんでした" })} />
          {errors.region && <ErrorMessage>{errors.region.message}</ErrorMessage>}
          <InputGroup>
            <LabelWithTooltip htmlFor="rent" label="年間家賃収入（万円）" tooltipText="満室時を想定した1年間の家賃収入の合計額です。（例：家賃8万円の部屋が10戸なら 8×10×12ヶ月=960万円）" />
            <Input id="rent" type="number" step="0.01" $hasError={!!errors.rent} {...register("rent", { required: "年間家賃収入は必須です", valueAsNumber: true, min: { value: 0, message: "0以上の値を入力してください" }, })} />
            {errors.rent && <ErrorMessage>{errors.rent.message}</ErrorMessage>}
          </InputGroup>
          <InputGroup>
            <LabelWithTooltip htmlFor="rooms" label="総戸数" tooltipText="賃貸に出す部屋の総数です。例えば、アパート1棟で16部屋あれば「16」、外人向け住宅（戸建て）1棟であれば「1」と入力してください。" />
            <Input id="rooms" type="number" $hasError={!!errors.rooms} {...register("rooms", { required: "総戸数は必須です", valueAsNumber: true, min: { value: 1, message: "1以上の値を入力してください" }, })} />
            {errors.rooms && <ErrorMessage>{errors.rooms.message}</ErrorMessage>}
          </InputGroup>
          <InputGroup>
            <LabelWithTooltip htmlFor="structure" label="構造" tooltipText="建物の主要な構造を選択してください。物件の資料（登記簿謄本など）で確認できます。この情報は建物の評価額や耐用年数に影響します。" />
            <Select id="structure" $hasError={!!errors.structure} {...register("structure", { required: "構造を選択してください" })} >
              <option value="">選択してください</option> <option value="RC">鉄筋コンクリート</option> <option value="Wood">木造</option> <option value="RC_Block">鉄筋コンクリートブロック</option> <option value="Steel">鉄骨</option>
            </Select>
            {errors.structure && <ErrorMessage>{errors.structure.message}</ErrorMessage>}
          </InputGroup>
          <InputGroup>
            <LabelWithTooltip htmlFor="buildingAge" label="築年数" tooltipText="建物が建てられてからの年数です。新築の場合は「0」と入力してください。銀行の融資可能期間に大きく影響します。" />
            <Input id="buildingAge" type="number" placeholder="新築は0" $hasError={!!errors.buildingAge} {...register("buildingAge", { required: "築年数は必須です", valueAsNumber: true, min: { value: 0, message: "0以上の値を入力してください" }, })} />
            {errors.buildingAge && <ErrorMessage>{errors.buildingAge.message}</ErrorMessage>}
          </InputGroup>
          <InputGroup>
            <LabelWithTooltip htmlFor="buildingArea" label="建物延床面積（㎡）" tooltipText="建物の各階の床面積を合計した面積です。容積率の計算や建物の評価額算出に利用します。" />
            <Input id="buildingArea" type="number" step="0.01" $hasError={!!errors.buildingArea} {...register("buildingArea", { required: "建物面積は必須です", valueAsNumber: true, min: { value: 0, message: "0以上の値を入力してください" }, })} />
            {errors.buildingArea && <ErrorMessage>{errors.buildingArea.message}</ErrorMessage>}
          </InputGroup>
          <InputGroup>
            <LabelWithTooltip htmlFor="landArea" label="土地面積（㎡）" tooltipText="物件が建っている土地全体の面積です。土地の評価額算出に利用します。" />
            <Input id="landArea" type="number" step="0.01" $hasError={!!errors.landArea} {...register("landArea", { required: "土地面積は必須です", valueAsNumber: true, min: { value: 0, message: "0以上の値を入力してください" }, })} />
            {errors.landArea && <ErrorMessage>{errors.landArea.message}</ErrorMessage>}
          </InputGroup>
          <InputGroup>
            <Label>エレベーターの有無</Label>
            <div>
              <input type="radio" id="elevatorYes" value="yes" {...register("hasElevator", { required: "選択は必須です" })} /> <label htmlFor="elevatorYes" style={{ marginRight: "20px" }}>あり</label>
              <input type="radio" id="elevatorNo" value="no" {...register("hasElevator", { required: "選択は必須です" })} /> <label htmlFor="elevatorNo">なし</label>
            </div>
            {errors.hasElevator && <ErrorMessage>{errors.hasElevator.message}</ErrorMessage>}
          </InputGroup>
        </Section>
        <Section>
          <SectionTitle>費用・価格情報</SectionTitle>
          <InputGroup>
            <LabelWithTooltip htmlFor="buildingCost" label="建物価格（万円）" tooltipText="物件全体の価格のうち、建物部分の価格です。売買契約書に記載されている場合や、固定資産税評価額から按分して算出します。" />
            <Input id="buildingCost" type="number" step="0.01" $hasError={!!errors.buildingCost} {...register("buildingCost", { required: "建物価格は必須です", valueAsNumber: true, min: { value: 0, message: "0以上の値を入力してください" }, })} />
            {errors.buildingCost && <ErrorMessage>{errors.buildingCost.message}</ErrorMessage>}
          </InputGroup>
          <InputGroup>
            <LabelWithTooltip htmlFor="landCost" label="土地価格（万円）" tooltipText="物件全体の価格のうち、土地部分の価格です。不明な場合は、総額から建物価格を引いた額を入力してください。" />
            <Input id="landCost" type="number" step="0.01" $hasError={!!errors.landCost} {...register("landCost", { required: "土地価格は必須です", valueAsNumber: true, min: { value: 0, message: "0以上の値を入力してください" }, })} />
            {errors.landCost && <ErrorMessage>{errors.landCost.message}</ErrorMessage>}
          </InputGroup>
        </Section>
        <Section>
          <SectionTitle>借入情報</SectionTitle>
          <InputGroup>
            <LabelWithTooltip htmlFor="loanAmount" label="借入希望額（万円）" tooltipText="物件購入のために、銀行から借りたい金額です。物件価格と諸費用（登記費用、仲介手数料など）の合計から、自己資金額を引いた額が一般的です。" />
            <Input id="loanAmount" type="number" step="0.01" $hasError={!!errors.loanAmount} {...register("loanAmount", { required: "借入希望額は必須です", valueAsNumber: true, min: { value: 0, message: "0以上の値を入力してください" }, })} />
            {errors.loanAmount && <ErrorMessage>{errors.loanAmount.message}</ErrorMessage>}
          </InputGroup>
          <InputGroup>
            <LabelWithTooltip htmlFor="loanTerm" label="借入期間（年）" tooltipText="ローンを返済する期間です。一般的に、建物の法定耐用年数から築年数を引いた年数が上限となります。最長35年です。" />
            <Input id="loanTerm" type="number" $hasError={!!errors.loanTerm} {...register("loanTerm", { required: "借入期間は必須です", valueAsNumber: true, max: { value: 35, message: "35年以内で入力してください" }, min: { value: 1, message: "1年以上の値を入力してください" }, })} />
            {errors.loanTerm && <ErrorMessage>{errors.loanTerm.message}</ErrorMessage>}
          </InputGroup>
          <InputGroup>
            <LabelWithTooltip htmlFor="interestRate" label="金利（%）" tooltipText="借入金の利率（年利）です。金融機関や個人の信用情報によって異なりますが、沖縄のアパートローンでは2.0%〜2.5%が一つの目安です。" />
            <Input id="interestRate" type="number" step="0.001" placeholder="例：2.3" $hasError={!!errors.interestRate} {...register("interestRate", { required: "金利は必須です", valueAsNumber: true, min: { value: 0, message: "0%以上の値を入力してください" }, })} />
            {errors.interestRate && <ErrorMessage>{errors.interestRate.message}</ErrorMessage>}
          </InputGroup>
        </Section>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "計算中..." : "シミュレーション実行"}
        </Button>
        <DemoButton type="button" onClick={handleDemoData}>
          デモ用データを自動入力
        </DemoButton>
      </form>
      <Footer>
        <p>
          免責事項：本シミュレーションはあくまで概算値であり、実際の投資結果を保証するものではありません。投資の最終判断はご自身の責任において行ってください。
        </p>
        <p style={{ textAlign: "center" }}>
          <a href="https://github.com/k213009/uchina-investment-sim" target="_blank" rel="noopener noreferrer">
            GitHubリポジトリ
          </a>
        </p>
      </Footer>
    </FormContainer>
  );
}

export default InputForm;

