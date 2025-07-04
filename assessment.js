{
  `path`: `assessment_complete.js`,
  `content`: `// 検査管理モジュール（聖隷式嚥下質問紙追加版）
class AssessmentManager {
  constructor() {
    this.currentAssessment = null;
    this.assessmentStatus = {
      tci: false,
      dryness: false,
      biteForce: false,
      oralDiadochokinesis: false,
      tonguePressure: false,
      mastication: false,
      swallowing: false
    };
    this.eat10Scores = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.seireiScores = []; // 聖隷式嚥下質問紙用
    console.log('AssessmentManager が初期化されました');
  }

  // 検査開始（修正版）
  startAssessment() {
    console.log('AssessmentManager.startAssessment() 開始');
    
    // 患者選択の確認
    if (!window.patientManager || !patientManager.currentPatient) {
      console.error('患者が選択されていません');
      alert('患者を選択してください');
      return;
    }
    
    console.log('選択中の患者:', patientManager.currentPatient);
    
    try {
      // 新しい検査セッションを開始
      this.currentAssessment = {
        patient_id: patientManager.currentPatient.id,
        assessment_date: new Date().toISOString().split('T')[0]
      };
      
      // 検査状態をリセット
      this.assessmentStatus = {
        tci: false,
        dryness: false,
        biteForce: false,
        oralDiadochokinesis: false,
        tonguePressure: false,
        mastication: false,
        swallowing: false
      };
      
      this.eat10Scores = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      this.seireiScores = []; // 聖隷式嚥下質問紙用リセット
      
      console.log('検査データ初期化完了');
      
      // 検査コンテンツを読み込み
      this.loadAssessmentContent();
      console.log('検査コンテンツ読み込み完了');
      
      // 検査タブに移動
      if (window.app) {
        app.openTab('assessment');
        console.log('検査タブに移動完了');
      } else {
        console.error('app オブジェクトが見つかりません');
        // 直接タブを切り替え
        this.directTabSwitch('assessment');
      }
      
    } catch (error) {
      console.error('検査開始処理エラー:', error);
      alert('検査の開始に失敗しました: ' + error.message);
    }
  }

  // 直接タブ切り替え（app オブジェクトが利用できない場合の代替手段）
  directTabSwitch(tabName) {
    try {
      console.log('直接タブ切り替えを実行:', tabName);
      
      // すべてのタブコンテンツを非表示
      const tabContents = document.querySelectorAll('.tab-content');
      tabContents.forEach(content => {
        content.classList.remove('active');
      });
      
      // すべてのタブを非アクティブ
      const tabs = document.querySelectorAll('.tab');
      tabs.forEach(tab => {
        tab.classList.remove('active');
      });
      
      // 指定されたタブを表示
      const targetTab = document.getElementById(tabName);
      if (targetTab) {
        targetTab.classList.add('active');
        console.log('タブ表示完了:', tabName);
      } else {
        console.error('対象タブが見つかりません:', tabName);
      }
      
      // 対応するタブボタンをアクティブ化
      const tabButton = document.querySelector(`.tab[onclick*=\"${tabName}\"]`);
      if (tabButton) {
        tabButton.classList.add('active');
        console.log('タブボタンアクティブ化完了');
      }
      
    } catch (error) {
      console.error('直接タブ切り替えエラー:', error);
    }
  }

  // 検査コンテンツの読み込み（聖隷式嚥下質問紙追加版）
  loadAssessmentContent() {
    console.log('検査コンテンツ読み込み開始');
    
    const content = document.getElementById('assessment-content');
    
    if (!content) {
      console.error('assessment-content 要素が見つかりません');
      return;
    }
    
    if (!patientManager.currentPatient) {
      content.innerHTML = '<p>患者を選択してから検査を開始してください。</p>';
      return;
    }

    console.log('検査画面HTML生成開始');
    
    content.innerHTML = `
      <p>患者: ${patientManager.currentPatient.name} (ID: ${patientManager.currentPatient.patient_id})</p>
      <p>各項目の評価を行ってください。3項目以上が基準値を下回る場合、口腔機能低下症と診断されます。</p>

      <div class=\"progress-bar-container\">
        <div id=\"assessment-progress\" class=\"progress-bar\" style=\"width: 0%;\">0/7項目完了</div>
      </div>

      <!-- 1. 口腔衛生状態不良の評価 -->
      <div class=\"summary-card\">
        <h3>① 口腔衛生状態不良の評価 (TCI)</h3>
        
        <div>
          <p>舌表面を9分割し、それぞれのエリアに対して舌苔の付着程度を評価します。</p>
          <p>0：舌苔なし、1：薄い舌苔あり、2：厚い舌苔あり</p>
         
          <div class=\"tci-grid\">
            <div class=\"tci-cell score-0\" data-score=\"0\" onclick=\"assessmentManager.setTCIScore(this, 0)\">0</div>
            <div class=\"tci-cell score-0\" data-score=\"0\" onclick=\"assessmentManager.setTCIScore(this, 1)\">0</div>
            <div class=\"tci-cell score-0\" data-score=\"0\" onclick=\"assessmentManager.setTCIScore(this, 2)\">0</div>
            <div class=\"tci-cell score-0\" data-score=\"0\" onclick=\"assessmentManager.setTCIScore(this, 3)\">0</div>
            <div class=\"tci-cell score-0\" data-score=\"0\" onclick=\"assessmentManager.setTCIScore(this, 4)\">0</div>
            <div class=\"tci-cell score-0\" data-score=\"0\" onclick=\"assessmentManager.setTCIScore(this, 5)\">0</div>
            <div class=\"tci-cell score-0\" data-score=\"0\" onclick=\"assessmentManager.setTCIScore(this, 6)\">0</div>
            <div class=\"tci-cell score-0\" data-score=\"0\" onclick=\"assessmentManager.setTCIScore(this, 7)\">0</div>
            <div class=\"tci-cell score-0\" data-score=\"0\" onclick=\"assessmentManager.setTCIScore(this, 8)\">0</div>
          </div>
         
          <p>TCI値: <span id=\"tci-value\">0</span>% (基準値: 50%以上)</p>
          <div class=\"result-box\" id=\"tci-result\">
            判定結果: まだ評価されていません
          </div>
        </div>
      </div>

      <!-- 2. 口腔乾燥の評価 -->
      <div class=\"summary-card\">
        <h3>② 口腔乾燥の評価</h3>
        
        <div class=\"form-group\">
          <label>評価方法の選択:</label>
          <select id=\"dryness-method\" onchange=\"assessmentManager.toggleDrynessMethod()\">
            <option value=\"\">選択してください</option>
            <option value=\"moisture\">口腔粘膜湿潤度</option>
            <option value=\"saliva\">唾液量（サクソンテスト）</option>
          </select>
        </div>
        
        <div id=\"moisture-method\" style=\"display:none;\">
          <p>口腔水分計（ムーカス）または口腔湿潤計を使用して計測します。</p>
          <div class=\"form-group\">
            <label for=\"moisture-value\">口腔粘膜湿潤度:</label>
            <div class=\"input-group\">
              <input type=\"number\" id=\"moisture-value\" step=\"0.1\" min=\"0\" placeholder=\"例：25.5\">
              <button onclick=\"assessmentManager.evaluateMoisture()\">評価</button>
            </div>
            <p>基準値: 27.0未満</p>
          </div>
          <div class=\"result-box\" id=\"moisture-result\">
            判定結果: まだ評価されていません
          </div>
        </div>
        
        <div id=\"saliva-method\" style=\"display:none;\">
          <p>サクソンテストによる唾液量の計測です。</p>
          <div class=\"form-group\">
            <label for=\"saliva-value\">唾液量 (2分間の重量増加):</label>
            <div class=\"input-group\">
              <input type=\"number\" id=\"saliva-value\" step=\"0.1\" min=\"0\" placeholder=\"例：1.8\">
              <span class=\"input-group-append\">g</span>
              <button onclick=\"assessmentManager.evaluateSaliva()\">評価</button>
            </div>
            <p>基準値: 2g/2分以下</p>
          </div>
          <div class=\"result-box\" id=\"saliva-result\">
            判定結果: まだ評価されていません
          </div>
        </div>
      </div>

      <!-- 3. 咬合力低下の評価 -->
      <div class=\"summary-card\">
        <h3>③ 咬合力低下の評価</h3>
        
        <div class=\"form-group\">
          <label>評価方法の選択:</label>
          <select id=\"bite-force-method\" onchange=\"assessmentManager.toggleBiteForceMethod()\">
            <option value=\"\">選択してください</option>
            <option value=\"force\">咬合力検査</option>
            <option value=\"teeth\">残存歯数</option>
          </select>
        </div>
        
        <div id=\"force-method\" style=\"display:none;\">
          <div class=\"form-group\">
            <label for=\"force-value\">咬合力:</label>
            <div class=\"input-group\">
              <input type=\"number\" id=\"force-value\" min=\"0\" placeholder=\"例：300\">
              <span class=\"input-group-append\">N</span>
              <button onclick=\"assessmentManager.evaluateBiteForce()\">評価</button>
            </div>
            <p>基準値: 350N未満</p>
          </div>
          <div class=\"result-box\" id=\"force-result\">
            判定結果: まだ評価されていません
          </div>
        </div>
        
        <div id=\"teeth-method\" style=\"display:none;\">
          <div class=\"form-group\">
            <label for=\"teeth-count\">残存歯数:</label>
            <div class=\"input-group\">
              <input type=\"number\" id=\"teeth-count\" min=\"0\" max=\"32\" placeholder=\"例：18\">
              <span class=\"input-group-append\">本</span>
              <button onclick=\"assessmentManager.evaluateTeethCount()\">評価</button>
            </div>
            <p>基準値: 20本未満</p>
          </div>
          <div class=\"result-box\" id=\"teeth-result\">
            判定結果: まだ評価されていません
          </div>
        </div>
      </div>

      <!-- 4. 舌口唇運動機能低下の評価 -->
      <div class=\"summary-card\">
        <h3>④ 舌口唇運動機能低下の評価</h3>
        
        <p>「パ」「タ」「カ」それぞれを5秒間できるだけ速く繰り返し発音してもらい、1秒あたりの回数を計測します。</p>
        
        <div class=\"grid-container\">
          <div class=\"form-group\">
            <label for=\"pa-value\">「パ」の回数:</label>
            <div class=\"input-group\">
              <input type=\"number\" id=\"pa-value\" step=\"0.1\" min=\"0\" placeholder=\"例：5.8\">
              <span class=\"input-group-append\">回/秒</span>
            </div>
          </div>
          
          <div class=\"form-group\">
            <label for=\"ta-value\">「タ」の回数:</label>
            <div class=\"input-group\">
              <input type=\"number\" id=\"ta-value\" step=\"0.1\" min=\"0\" placeholder=\"例：5.5\">
              <span class=\"input-group-append\">回/秒</span>
            </div>
          </div>
          
          <div class=\"form-group\">
            <label for=\"ka-value\">「カ」の回数:</label>
            <div class=\"input-group\">
              <input type=\"number\" id=\"ka-value\" step=\"0.1\" min=\"0\" placeholder=\"例：5.2\">
              <span class=\"input-group-append\">回/秒</span>
            </div>
          </div>
        </div>
        
        <button onclick=\"assessmentManager.evaluateOralDiadochokinesis()\">評価する</button>
        
        <div class=\"result-box\" id=\"oral-diadochokinesis-result\">
          判定結果: まだ評価されていません
        </div>
      </div>

      <!-- 5. 低舌圧の評価 -->
      <div class=\"summary-card\">
        <h3>⑤ 低舌圧の評価</h3>
        
        <p>舌圧測定器（JMS舌圧測定器など）を使用して、最大舌圧を計測します。</p>
        
        <div class=\"form-group\">
          <label for=\"tongue-pressure\">舌圧:</label>
          <div class=\"input-group\">
            <input type=\"number\" id=\"tongue-pressure\" step=\"0.1\" min=\"0\" placeholder=\"例：28.5\">
            <span class=\"input-group-append\">kPa</span>
            <button onclick=\"assessmentManager.evaluateTonguePressure()\">評価</button>
          </div>
          <p>基準値: 30kPa未満</p>
        </div>
        
        <div class=\"result-box\" id=\"tongue-pressure-result\">
          判定結果: まだ評価されていません
        </div>
      </div>

      <!-- 6. 咀嚼機能低下の評価 -->
      <div class=\"summary-card\">
        <h3>⑥ 咀嚼機能低下の評価</h3>
        
        <div class=\"form-group\">
          <label>評価方法の選択:</label>
          <select id=\"mastication-method\" onchange=\"assessmentManager.toggleMasticationMethod()\">
            <option value=\"\">選択してください</option>
            <option value=\"glucose\">咀嚼能力検査（グルコース溶出量）</option>
            <option value=\"score\">咀嚼能率スコア法</option>
          </select>
        </div>
        
        <div id=\"glucose-method\" style=\"display:none;\">
          <div class=\"form-group\">
            <label for=\"glucose-value\">グルコース濃度:</label>
            <div class=\"input-group\">
              <input type=\"number\" id=\"glucose-value\" min=\"0\" placeholder=\"例：85\">
              <span class=\"input-group-append\">mg/dL</span>
              <button onclick=\"assessmentManager.evaluateGlucose()\">評価</button>
            </div>
            <p>基準値: 100mg/dL未満</p>
          </div>
          <div class=\"result-box\" id=\"glucose-result\">
            判定結果: まだ評価されていません
          </div>
        </div>
        
        <div id=\"score-method\" style=\"display:none;\">
          <div class=\"form-group\">
            <label for=\"mastication-score\">咀嚼能率スコア:</label>
            <select id=\"mastication-score\">
              <option value=\"\">選択してください</option>
              <option value=\"0\">スコア0（粉砕なし）</option>
              <option value=\"1\">スコア1（わずかに粉砕）</option>
              <option value=\"2\">スコア2（粉砕あり）</option>
              <option value=\"3\">スコア3（半分程度粉砕）</option>
              <option value=\"4\">スコア4（大部分粉砕）</option>
              <option value=\"5\">スコア5（完全に粉砕）</option>
            </select>
            <button onclick=\"assessmentManager.evaluateMasticationScore()\" style=\"margin-top: 10px;\">評価</button>
          </div>
          <p>基準値: スコア2以下</p>
          <div class=\"result-box\" id=\"mastication-score-result\">
            判定結果: まだ評価されていません
          </div>
        </div>
      </div>

      <!-- 7. 嚥下機能低下の評価 -->
      <div class=\"summary-card\">
        <h3>⑦ 嚥下機能低下の評価</h3>
        
        <div class=\"form-group\">
          <label>評価方法の選択:</label>
          <select id=\"swallowing-method\" onchange=\"assessmentManager.toggleSwallowingMethod()\">
            <option value=\"\">選択してください</option>
            <option value=\"eat10\">嚥下スクリーニング検査（EAT-10）</option>
            <option value=\"seirei\">聖隷式嚥下質問紙</option>
          </select>
        </div>
        
        <div id=\"eat10-method\" style=\"display:none;\">
          <p>嚥下スクリーニング質問紙（EAT-10）による評価です。</p>
          <p>各質問に対して、「0: 問題なし」から「4: ひどく問題」の5段階で回答してください。</p>
          
          ${this.generateEAT10Questions()}
          
          <div class=\"result-box\" id=\"eat10-result\" style=\"margin-top: 20px;\">
            判定結果: まだ評価されていません
          </div>
        </div>
        
        <div id=\"seirei-method\" style=\"display:none;\">
          <p>聖隷式嚥下質問紙による評価です。ここ2，3年のことについてお答えください。</p>
          <p>各質問に対して、「A: 繰り返す/しばしば/たいへん/明らかに」「B: 一度だけ/ときどき/わずかに」「C: なし」から選択してください。</p>
          
          ${this.generateSeireiQuestions()}
          
          <div class=\"result-box\" id=\"seirei-result\" style=\"margin-top: 20px;\">
            判定結果: まだ評価されていません
          </div>
        </div>
      </div>

      <div style=\"margin-top: 30px; text-align: center;\">
        <button onclick=\"assessmentManager.completeAssessment()\" class=\"btn-success\">検査完了・診断へ</button>
      </div>
    `;
    
    console.log('検査画面HTML生成完了');
  }

  // EAT-10質問項目を生成
  generateEAT10Questions() {
    const questions = [
      \"飲み込むときに、むせることがある。\",
      \"のどに食べ物がひっかかる感じがする。\",
      \"食事中によだれがでる。\",
      \"口から食べ物がこぼれる。\",
      \"唾を飲み込むのがむずかしい。\",
      \"固形物を飲み込むのがむずかしい。\",
      \"錠剤を飲み込むのがむずかしい。\",
      \"飲み込むことが苦痛である。\",
      \"飲食時にせきがでる。\",
      \"飲み込み後、声がかすれる。\"
    ];

    let html = '';
    questions.forEach((question, index) => {
      html += `
        <div class=\"eat-10-question\">
          <p>${index + 1}. ${question}</p>
          <div class=\"eat-10-options\">
            <div class=\"eat-10-option\" data-value=\"0\" onclick=\"assessmentManager.selectEAT10Option(this, ${index})\">0：問題なし</div>
            <div class=\"eat-10-option\" data-value=\"1\" onclick=\"assessmentManager.selectEAT10Option(this, ${index})\">1</div>
            <div class=\"eat-10-option\" data-value=\"2\" onclick=\"assessmentManager.selectEAT10Option(this, ${index})\">2</div>
            <div class=\"eat-10-option\" data-value=\"3\" onclick=\"assessmentManager.selectEAT10Option(this, ${index})\">3</div>
            <div class=\"eat-10-option\" data-value=\"4\" onclick=\"assessmentManager.selectEAT10Option(this, ${index})\">4：ひどく問題</div>
          </div>
        </div>
      `;
    });

    return html;
  }

  // 聖隷式嚥下質問紙の質問項目を生成（新規追加）
  generateSeireiQuestions() {
    const questions = [
      { text: \"肺炎と診断されたことがありますか？\", options: [\"C.なし\", \"B.一度だけ\", \"A.繰り返す\"] },
      { text: \"やせてきましたか？\", options: [\"C.なし\", \"B.わずかに\", \"A.明らかに\"] },
      { text: \"物が飲み込みにくいと感じることがありますか？\", options: [\"C.なし\", \"B.ときどき\", \"A.しばしば\"] },
      { text: \"食事中にむせることがありますか？\", options: [\"C.なし\", \"B.ときどき\", \"A.しばしば\"] },
      { text: \"お茶を飲むときにむせることがありますか？\", options: [\"C.なし\", \"B.ときどき\", \"A.しばしば\"] },
      { text: \"食事中や食後、それ以外の時にのどがゴロゴロ（痰がからんだ感じ）することがありますか？\", options: [\"C.なし\", \"B.ときどき\", \"A.しばしば\"] },
      { text: \"のどに食べ物が残る感じがすることがありますか？\", options: [\"C.なし\", \"B.ときどき\", \"A.しばしば\"] },
      { text: \"食べるのが遅くなりましたか？\", options: [\"C.なし\", \"B.わずかに\", \"A.たいへん\"] },
      { text: \"硬いものが食べにくくなりましたか？\", options: [\"C.なし\", \"B.わずかに\", \"A.たいへん\"] },
      { text: \"口から食べ物がこぼれることがありますか？\", options: [\"C.なし\", \"B.ときどき\", \"A.しばしば\"] },
      { text: \"口の中に食べ物が残ることがありますか？\", options: [\"C.なし\", \"B.ときどき\", \"A.しばしば\"] },
      { text: \"食物や酸っぱい液が胃からのどに戻ってくることがありますか？\", options: [\"C.なし\", \"B.ときどき\", \"A.しばしば\"] },
      { text: \"胸に食べ物が残ったり、つまった感じがすることがありますか？\", options: [\"C.なし\", \"B.ときどき\", \"A.しばしば\"] },
      { text: \"夜、咳で眠れなかったり目覚めることがありますか？\", options: [\"C.なし\", \"B.ときどき\", \"A.しばしば\"] },
      { text: \"声がかすれてきましたか？（がらがら声、かすれ声など）\", options: [\"C.なし\", \"B.わずかに\", \"A.たいへん\"] }
    ];

    let html = '';
    questions.forEach((question, index) => {
      html += `
        <div class=\"seirei-question\">
          <p>${index + 1}. ${question.text}</p>
          <div class=\"seirei-options\">
            ${question.options.map((option, optIndex) => {
              const value = option.charAt(0); // A, B, C を取得
              return `<div class=\"seirei-option\" data-value=\"${value}\" onclick=\"assessmentManager.selectSeireiOption(this, ${index})\">${option}</div>`;
            }).join('')}
          </div>
        </div>
      `;
    });

    return html;
  }

  // 進捗バー更新
  updateProgress() {
    const completedItems = Object.values(this.assessmentStatus).filter(status => status).length;
    const progressPercent = (completedItems / 7) * 100;
    
    const progressBar = document.getElementById('assessment-progress');
    if (progressBar) {
      progressBar.style.width = `${progressPercent}%`;
      progressBar.textContent = `${completedItems}/7項目完了`;
    }
  }

  // TCI評価
  setTCIScore(cell, index) {
    const currentScore = parseInt(cell.getAttribute('data-score'));
    let newScore = 0;
    
    if (currentScore === 0) {
      newScore = 1;
      cell.classList.remove('score-0');
      cell.classList.add('score-1');
    } else if (currentScore === 1) {
      newScore = 2;
      cell.classList.remove('score-1');
      cell.classList.add('score-2');
    } else if (currentScore === 2) {
      newScore = 0;
      cell.classList.remove('score-2');
      cell.classList.add('score-0');
    }
    
    cell.setAttribute('data-score', newScore);
    cell.textContent = newScore;
    
    this.calculateTCI();
  }

  calculateTCI() {
    const cells = document.querySelectorAll('.tci-cell');
    let totalScore = 0;
    
    cells.forEach(cell => {
      totalScore += parseInt(cell.getAttribute('data-score'));
    });
    
    const tciValue = Math.round((totalScore / 18) * 100);
    const tciValueElement = document.getElementById('tci-value');
    if (tciValueElement) {
      tciValueElement.textContent = tciValue;
    }
    
    const resultElement = document.getElementById('tci-result');
    if (resultElement) {
      if (tciValue >= 50) {
        resultElement.innerHTML = `<p class=\"red-text\">判定結果: 口腔衛生状態不良あり（TCI値: ${tciValue}%）</p>`;
        resultElement.classList.add('result-positive');
        resultElement.classList.remove('result-negative');
        this.assessmentStatus.tci = true;
      } else {
        resultElement.innerHTML = `<p class=\"green-text\">判定結果: 口腔衛生状態不良なし（TCI値: ${tciValue}%）</p>`;
        resultElement.classList.add('result-negative');
        resultElement.classList.remove('result-positive');
        this.assessmentStatus.tci = false;
      }
    }
    
    if (this.currentAssessment) {
      this.currentAssessment.tci_value = tciValue;
      this.currentAssessment.tci_status = this.assessmentStatus.tci;
    }
    
    this.updateProgress();
  }

  // 口腔乾燥評価
  toggleDrynessMethod() {
    const method = document.getElementById('dryness-method').value;
    
    if (method === 'moisture') {
      document.getElementById('moisture-method').style.display = 'block';
      document.getElementById('saliva-method').style.display = 'none';
    } else if (method === 'saliva') {
      document.getElementById('moisture-method').style.display = 'none';
      document.getElementById('saliva-method').style.display = 'block';
    } else {
      document.getElementById('moisture-method').style.display = 'none';
      document.getElementById('saliva-method').style.display = 'none';
    }
  }

  evaluateMoisture() {
    const value = parseFloat(document.getElementById('moisture-value').value);
    const resultElement = document.getElementById('moisture-result');
    
    if (isNaN(value)) {
      alert('数値を入力してください');
      return;
    }
    if (value < 27.0) {
      resultElement.innerHTML = `<p class=\"red-text\">判定結果: 口腔乾燥あり（${value}）</p>`;
      resultElement.classList.add('result-positive');
      resultElement.classList.remove('result-negative');
      this.assessmentStatus.dryness = true;
    } else {
      resultElement.innerHTML = `<p class=\"green-text\">判定結果: 口腔乾燥なし（${value}）</p>`;
      resultElement.classList.add('result-negative');
      resultElement.classList.remove('result-positive');
      this.assessmentStatus.dryness = false;
    }
    
    if (this.currentAssessment) {
      this.currentAssessment.moisture_value = value;
      this.currentAssessment.dryness_status = this.assessmentStatus.dryness;
    }
    
    this.updateProgress();
  }

  evaluateSaliva() {
    const value = parseFloat(document.getElementById('saliva-value').value);
    const resultElement = document.getElementById('saliva-result');
    
    if (isNaN(value)) {
      alert('数値を入力してください');
      return;
    }
    
    if (value <= 2.0) {
      resultElement.innerHTML = `<p class=\"red-text\">判定結果: 口腔乾燥あり（${value}g/2分）</p>`;
      resultElement.classList.add('result-positive');
      resultElement.classList.remove('result-negative');
      this.assessmentStatus.dryness = true;
    } else {
      resultElement.innerHTML = `<p class=\"green-text\">判定結果: 口腔乾燥なし（${value}g/2分）</p>`;
      resultElement.classList.add('result-negative');
      resultElement.classList.remove('result-positive');
      this.assessmentStatus.dryness = false;
    }
    
    if (this.currentAssessment) {
      this.currentAssessment.saliva_value = value;
      this.currentAssessment.dryness_status = this.assessmentStatus.dryness;
    }
    
    this.updateProgress();
  }

  // 咬合力評価
  toggleBiteForceMethod() {
    const method = document.getElementById('bite-force-method').value;
    
    if (method === 'force') {
      document.getElementById('force-method').style.display = 'block';
      document.getElementById('teeth-method').style.display = 'none';
    } else if (method === 'teeth') {
      document.getElementById('force-method').style.display = 'none';
      document.getElementById('teeth-method').style.display = 'block';
    } else {
      document.getElementById('force-method').style.display = 'none';
      document.getElementById('teeth-method').style.display = 'none';
    }
  }

  evaluateBiteForce() {
    const value = parseFloat(document.getElementById('force-value').value);
    const resultElement = document.getElementById('force-result');
    
    if (isNaN(value)) {
      alert('数値を入力してください');
      return;
    }
    
    if (value < 350) {
      resultElement.innerHTML = `<p class=\"red-text\">判定結果: 咬合力低下あり（${value}N）</p>`;
      resultElement.classList.add('result-positive');
      resultElement.classList.remove('result-negative');
      this.assessmentStatus.biteForce = true;
    } else {
      resultElement.innerHTML = `<p class=\"green-text\">判定結果: 咬合力低下なし（${value}N）</p>`;
      resultElement.classList.add('result-negative');
      resultElement.classList.remove('result-positive');
      this.assessmentStatus.biteForce = false;
    }
    
    if (this.currentAssessment) {
      this.currentAssessment.bite_force_value = value;
      this.currentAssessment.bite_force_status = this.assessmentStatus.biteForce;
    }
    
    this.updateProgress();
  }

  evaluateTeethCount() {
    const count = parseInt(document.getElementById('teeth-count').value);
    const resultElement = document.getElementById('teeth-result');
    
    if (isNaN(count)) {
      alert('数値を入力してください');
      return;
    }
    
    if (count < 20) {
      resultElement.innerHTML = `<p class=\"red-text\">判定結果: 咬合力低下あり（残存歯数: ${count}本）</p>`;
      resultElement.classList.add('result-positive');
      resultElement.classList.remove('result-negative');
      this.assessmentStatus.biteForce = true;
    } else {
      resultElement.innerHTML = `<p class=\"green-text\">判定結果: 咬合力低下なし（残存歯数: ${count}本）</p>`;
      resultElement.classList.add('result-negative');
      resultElement.classList.remove('result-positive');
      this.assessmentStatus.biteForce = false;
    }
    
    if (this.currentAssessment) {
      this.currentAssessment.teeth_count = count;
      this.currentAssessment.bite_force_status = this.assessmentStatus.biteForce;
    }
    
    this.updateProgress();
  }

  // オーラルディアドコキネシス評価
  evaluateOralDiadochokinesis() {
    const paValue = parseFloat(document.getElementById('pa-value').value);
    const taValue = parseFloat(document.getElementById('ta-value').value);
    const kaValue = parseFloat(document.getElementById('ka-value').value);
    const resultElement = document.getElementById('oral-diadochokinesis-result');
    
    if (isNaN(paValue) || isNaN(taValue) || isNaN(kaValue)) {
      alert('すべての数値を入力してください');
      return;
    }
    
    const hasLowFunction = paValue < 6 || taValue < 6 || kaValue < 6;
    
    if (hasLowFunction) {
      let lowValues = [];
      if (paValue < 6) lowValues.push(`「パ」: ${paValue}回/秒`);
      if (taValue < 6) lowValues.push(`「タ」: ${taValue}回/秒`);
      if (kaValue < 6) lowValues.push(`「カ」: ${kaValue}回/秒`);
      
      resultElement.innerHTML = `<p class=\"red-text\">判定結果: 舌口唇運動機能低下あり（${lowValues.join('、')}）</p>`;
      resultElement.classList.add('result-positive');
      resultElement.classList.remove('result-negative');
      this.assessmentStatus.oralDiadochokinesis = true;
    } else {
      resultElement.innerHTML = `<p class=\"green-text\">判定結果: 舌口唇運動機能低下なし（「パ」: ${paValue}回/秒、「タ」: ${taValue}回/秒、「カ」: ${kaValue}回/秒）</p>`;
      resultElement.classList.add('result-negative');
      resultElement.classList.remove('result-positive');
      this.assessmentStatus.oralDiadochokinesis = false;
    }
    
    if (this.currentAssessment) {
      this.currentAssessment.pa_value = paValue;
      this.currentAssessment.ta_value = taValue;
      this.currentAssessment.ka_value = kaValue;
      this.currentAssessment.oral_diadochokinesis_status = this.assessmentStatus.oralDiadochokinesis;
    }
    
    this.updateProgress();
  }

  // 舌圧評価
  evaluateTonguePressure() {
    const pressure = parseFloat(document.getElementById('tongue-pressure').value);
    const resultElement = document.getElementById('tongue-pressure-result');
    
    if (isNaN(pressure)) {
      alert('数値を入力してください');
      return;
    }
    
    if (pressure < 30) {
      resultElement.innerHTML = `<p class=\"red-text\">判定結果: 低舌圧あり（${pressure}kPa）</p>`;
      resultElement.classList.add('result-positive');
      resultElement.classList.remove('result-negative');
      this.assessmentStatus.tonguePressure = true;
    } else {
      resultElement.innerHTML = `<p class=\"green-text\">判定結果: 低舌圧なし（${pressure}kPa）</p>`;
      resultElement.classList.add('result-negative');
      resultElement.classList.remove('result-positive');
      this.assessmentStatus.tonguePressure = false;
    }
    
    if (this.currentAssessment) {
      this.currentAssessment.tongue_pressure_value = pressure;
      this.currentAssessment.tongue_pressure_status = this.assessmentStatus.tonguePressure;
    }
    
    this.updateProgress();
  }

  // 咀嚼機能評価
  toggleMasticationMethod() {
    const method = document.getElementById('mastication-method').value;
    
    if (method === 'glucose') {
      document.getElementById('glucose-method').style.display = 'block';
      document.getElementById('score-method').style.display = 'none';
    } else if (method === 'score') {
      document.getElementById('glucose-method').style.display = 'none';
      document.getElementById('score-method').style.display = 'block';
    } else {
      document.getElementById('glucose-method').style.display = 'none';
      document.getElementById('score-method').style.display = 'none';
    }
  }

  evaluateGlucose() {
    const value = parseFloat(document.getElementById('glucose-value').value);
    const resultElement = document.getElementById('glucose-result');
    
    if (isNaN(value)) {
      alert('数値を入力してください');
      return;
    }
    
    if (value < 100) {
      resultElement.innerHTML = `<p class=\"red-text\">判定結果: 咀嚼機能低下あり（${value}mg/dL）</p>`;
      resultElement.classList.add('result-positive');
      resultElement.classList.remove('result-negative');
      this.assessmentStatus.mastication = true;
    } else {
      resultElement.innerHTML = `<p class=\"green-text\">判定結果: 咀嚼機能低下なし（${value}mg/dL）</p>`;
      resultElement.classList.add('result-negative');
      resultElement.classList.remove('result-positive');
      this.assessmentStatus.mastication = false;
    }
    
    if (this.currentAssessment) {
      this.currentAssessment.glucose_value = value;
      this.currentAssessment.mastication_status = this.assessmentStatus.mastication;
    }
    
    this.updateProgress();
  }

  evaluateMasticationScore() {
    const score = document.getElementById('mastication-score').value;
    const resultElement = document.getElementById('mastication-score-result');
    
    if (score === '') {
      alert('スコアを選択してください');
      return;
    }
    
    const scoreValue = parseInt(score);
    
    if (scoreValue <= 2) {
      resultElement.innerHTML = `<p class=\"red-text\">判定結果: 咀嚼機能低下あり（スコア${scoreValue}）</p>`;
      resultElement.classList.add('result-positive');
      resultElement.classList.remove('result-negative');
      this.assessmentStatus.mastication = true;
    } else {
      resultElement.innerHTML = `<p class=\"green-text\">判定結果: 咀嚼機能低下なし（スコア${scoreValue}）</p>`;
      resultElement.classList.add('result-negative');
      resultElement.classList.remove('result-positive');
      this.assessmentStatus.mastication = false;
    }
    
    if (this.currentAssessment) {
      this.currentAssessment.mastication_score = scoreValue;
      this.currentAssessment.mastication_status = this.assessmentStatus.mastication;
    }
    
    this.updateProgress();
  }

  // 嚥下機能評価（聖隷式嚥下質問紙対応版）
  toggleSwallowingMethod() {
    const method = document.getElementById('swallowing-method').value;
    
    if (method === 'eat10') {
      document.getElementById('eat10-method').style.display = 'block';
      document.getElementById('seirei-method').style.display = 'none';
    } else if (method === 'seirei') {
      document.getElementById('eat10-method').style.display = 'none';
      document.getElementById('seirei-method').style.display = 'block';
    } else {
      document.getElementById('eat10-method').style.display = 'none';
      document.getElementById('seirei-method').style.display = 'none';
    }
  }

  selectEAT10Option(element, questionIndex) {
    const options = element.parentElement.querySelectorAll('.eat-10-option');
    options.forEach(option => {
      option.classList.remove('selected');
    });
    
    element.classList.add('selected');
    this.eat10Scores[questionIndex] = parseInt(element.getAttribute('data-value'));
    
    this.evaluateEAT10();
  }

  evaluateEAT10() {
    const totalScore = this.eat10Scores.reduce((sum, score) => sum + score, 0);
    const resultElement = document.getElementById('eat10-result');
    
    if (resultElement) {
      if (totalScore >= 3) {
        resultElement.innerHTML = `<p class=\"red-text\">判定結果: 嚥下機能低下あり（EAT-10スコア: ${totalScore}点）</p>`;
        resultElement.classList.add('result-positive');
        resultElement.classList.remove('result-negative');
        this.assessmentStatus.swallowing = true;
      } else {
        resultElement.innerHTML = `<p class=\"green-text\">判定結果: 嚥下機能低下なし（EAT-10スコア: ${totalScore}点）</p>`;
        resultElement.classList.add('result-negative');
        resultElement.classList.remove('result-positive');
        this.assessmentStatus.swallowing = false;
      }
    }
    
    if (this.currentAssessment) {
      this.currentAssessment.eat10_score = totalScore;
      this.currentAssessment.swallowing_method = 'eat10';
      this.currentAssessment.swallowing_status = this.assessmentStatus.swallowing;
    }
    
    this.updateProgress();
  }

  // 聖隷式嚥下質問紙の選択処理（新規追加）
  selectSeireiOption(element, questionIndex) {
    const options = element.parentElement.querySelectorAll('.seirei-option');
    options.forEach(option => {
      option.classList.remove('selected');
    });
    
    element.classList.add('selected');
    
    // 配列のサイズを15に調整
    while (this.seireiScores.length < 15) {
      this.seireiScores.push(null);
    }
    
    this.seireiScores[questionIndex] = element.getAttribute('data-value');
    
    this.evaluateSeirei();
  }

  // 聖隷式嚥下質問紙の評価処理（新規追加）
  evaluateSeirei() {
    const answeredQuestions = this.seireiScores.filter(score => score !== null && score !== undefined);
    const aCount = this.seireiScores.filter(score => score === 'A').length;
    const resultElement = document.getElementById('seirei-result');
    
    if (resultElement) {
      if (answeredQuestions.length === 15) {
        if (aCount >= 1) {
          resultElement.innerHTML = `<p class=\"red-text\">判定結果: 嚥下機能低下あり（Aの回答: ${aCount}個）</p>`;
          resultElement.classList.add('result-positive');
          resultElement.classList.remove('result-negative');
          this.assessmentStatus.swallowing = true;
        } else {
          resultElement.innerHTML = `<p class=\"green-text\">判定結果: 嚥下機能低下なし（Aの回答: ${aCount}個）</p>`;
          resultElement.classList.add('result-negative');
          resultElement.classList.remove('result-positive');
          this.assessmentStatus.swallowing = false;
        }
        
        if (this.currentAssessment) {
          this.currentAssessment.seirei_a_count = aCount;
          this.currentAssessment.seirei_scores = JSON.stringify(this.seireiScores);
          this.currentAssessment.swallowing_method = 'seirei';
          this.currentAssessment.swallowing_status = this.assessmentStatus.swallowing;
        }
        
        this.updateProgress();
      } else {
        resultElement.innerHTML = `<p>すべての質問に回答してください（${answeredQuestions.length}/15問完了）</p>`;
        resultElement.classList.remove('result-positive', 'result-negative');
      }
    }
  }

  // 検査完了
  async completeAssessment() {
    if (!this.currentAssessment) {
      alert('検査データがありません');
      return;
    }

    const completedItems = Object.values(this.assessmentStatus).filter(status => status).length;
    const diagnosis = completedItems >= 3;
    
    this.currentAssessment.diagnosis_result = diagnosis;
    this.currentAssessment.affected_items_count = completedItems;

    try {
      const savedAssessment = await db.createAssessment(this.currentAssessment);
      this.currentAssessment.id = savedAssessment.id;
      alert('検査結果が保存されました');
      
      this.loadDiagnosisContent();
      
      // タブ切り替え
      if (window.app) {
        app.openTab('diagnosis');
      } else {
        this.directTabSwitch('diagnosis');
      }
    } catch (error) {
      console.error('検査結果保存エラー:', error);
      alert('保存に失敗しました');
    }
  }

  // 診断結果の表示（聖隷式嚥下質問紙対応版）
  loadDiagnosisContent() {
    if (!this.currentAssessment) return;

    const content = document.getElementById('diagnosis-content');
    const completedItems = this.currentAssessment.affected_items_count;
    const diagnosis = this.currentAssessment.diagnosis_result;

    let html = `
      <div class=\"summary-card\">
        <h3>患者情報</h3>
        <p>患者名: ${patientManager.currentPatient.name} (ID: ${patientManager.currentPatient.patient_id})</p>
        <p>検査日: ${this.currentAssessment.assessment_date}</p>
      </div>

      <div class=\"summary-card\">
        <div class=\"result-box ${diagnosis ? 'result-positive' : 'result-negative'}\">
          <h3>診断結果: ${diagnosis ? '口腔機能低下症' : '口腔機能低下症ではありません'}</h3>
          <p>7項目中${completedItems}項目が基準値を下回っています${diagnosis ? '' : '（3項目未満）'}。</p>
        </div>
      </div>

      <div class=\"summary-card\">
        <h3>評価項目の詳細</h3>
        <table>
          <thead>
            <tr>
              <th>評価項目</th>
              <th>検査値</th>
              <th>基準値</th>
              <th>判定</th>
            </tr>
          </thead>
          <tbody>
    `;

    // 各項目の詳細を追加
    if (this.currentAssessment.tci_value !== undefined) {
      html += `
        <tr>
          <td>① 口腔衛生状態不良</td>
          <td>TCI値: ${this.currentAssessment.tci_value}%</td>
          <td>50%以上</td>
          <td>${this.currentAssessment.tci_status ? '<span class=\"red-text\">該当</span>' : '<span class=\"green-text\">非該当</span>'}</td>
        </tr>
      `;
    }

    if (this.currentAssessment.moisture_value !== undefined || this.currentAssessment.saliva_value !== undefined) {
      let value = '';
      if (this.currentAssessment.moisture_value !== undefined) {
        value = `湿潤度: ${this.currentAssessment.moisture_value}`;
      } else if (this.currentAssessment.saliva_value !== undefined) {
        value = `唾液量: ${this.currentAssessment.saliva_value}g/2分`;
      }
      
      html += `
        <tr>
          <td>② 口腔乾燥</td>
          <td>${value}</td>
          <td>湿潤度27.0未満または唾液量2g/2分以下</td>
          <td>${this.currentAssessment.dryness_status ? '<span class=\"red-text\">該当</span>' : '<span class=\"green-text\">非該当</span>'}</td>
        </tr>
      `;
    }

    if (this.currentAssessment.bite_force_value !== undefined || this.currentAssessment.teeth_count !== undefined) {
      let value = '';
      if (this.currentAssessment.bite_force_value !== undefined) {
        value = `咬合力: ${this.currentAssessment.bite_force_value}N`;
      } else if (this.currentAssessment.teeth_count !== undefined) {
        value = `残存歯数: ${this.currentAssessment.teeth_count}本`;
      }
      
      html += `
        <tr>
          <td>③ 咬合力低下</td>
          <td>${value}</td>
          <td>咬合力350N未満または残存歯数20本未満</td>
          <td>${this.currentAssessment.bite_force_status ? '<span class=\"red-text\">該当</span>' : '<span class=\"green-text\">非該当</span>'}</td>
        </tr>
      `;
    }

    if (this.currentAssessment.pa_value !== undefined && this.currentAssessment.ta_value !== undefined && this.currentAssessment.ka_value !== undefined) {
      html += `
        <tr>
          <td>④ 舌口唇運動機能低下</td>
          <td>パ: ${this.currentAssessment.pa_value}回/秒, タ: ${this.currentAssessment.ta_value}回/秒, カ: ${this.currentAssessment.ka_value}回/秒</td>
          <td>いずれかが6回/秒未満</td>
          <td>${this.currentAssessment.oral_diadochokinesis_status ? '<span class=\"red-text\">該当</span>' : '<span class=\"green-text\">非該当</span>'}</td>
        </tr>
      `;
    }

    if (this.currentAssessment.tongue_pressure_value !== undefined) {
      html += `
        <tr>
          <td>⑤ 低舌圧</td>
          <td>${this.currentAssessment.tongue_pressure_value}kPa</td>
          <td>30kPa未満</td>
          <td>${this.currentAssessment.tongue_pressure_status ? '<span class=\"red-text\">該当</span>' : '<span class=\"green-text\">非該当</span>'}</td>
        </tr>
      `;
    }

    if (this.currentAssessment.glucose_value !== undefined || this.currentAssessment.mastication_score !== undefined) {
      let value = '';
      if (this.currentAssessment.glucose_value !== undefined) {
        value = `グルコース濃度: ${this.currentAssessment.glucose_value}mg/dL`;
      } else if (this.currentAssessment.mastication_score !== undefined) {
        value = `咀嚼能率スコア: ${this.currentAssessment.mastication_score}`;
      }
      
      html += `
        <tr>
          <td>⑥ 咀嚼機能低下</td>
          <td>${value}</td>
          <td>グルコース濃度100mg/dL未満またはスコア2以下</td>
          <td>${this.currentAssessment.mastication_status ? '<span class=\"red-text\">該当</span>' : '<span class=\"green-text\">非該当</span>'}</td>
        </tr>
      `;
    }

    // 嚥下機能評価結果の表示（聖隷式嚥下質問紙対応）
    if (this.currentAssessment.eat10_score !== undefined || this.currentAssessment.seirei_a_count !== undefined) {
      let value = '';
      let criteria = '';
      
      if (this.currentAssessment.swallowing_method === 'eat10') {
        value = `EAT-10スコア: ${this.currentAssessment.eat10_score}点`;
        criteria = '3点以上';
      } else if (this.currentAssessment.swallowing_method === 'seirei') {
        value = `聖隷式嚥下質問紙（Aの回答: ${this.currentAssessment.seirei_a_count}個）`;
        criteria = 'Aが1つ以上';
      }
      
      html += `
        <tr>
          <td>⑦ 嚥下機能低下</td>
          <td>${value}</td>
          <td>${criteria}</td>
          <td>${this.currentAssessment.swallowing_status ? '<span class=\"red-text\">該当</span>' : '<span class=\"green-text\">非該当</span>'}</td>
        </tr>
      `;
    }

    html += `
          </tbody>
        </table>
      </div>

      <div style=\"margin-top: 30px;\">
        <button onclick=\"createManagementPlan()\" class=\"btn-success\">管理計画書作成</button>
        <button onclick=\"patientManager.showExistingManagementPlans()\" class=\"btn-secondary\">既存の管理計画書</button>
        <button onclick=\"openTab('patient-history')\" class=\"btn-secondary\">履歴確認</button>
      </div>
    `;

    content.innerHTML = html;
  }

  // 検査詳細表示
  async viewAssessmentDetails(assessmentId) {
    try {
      const assessments = await db.getAssessments();
      const assessment = assessments.find(a => a.id === assessmentId);
      
      if (assessment) {
        this.currentAssessment = assessment;
        this.loadDiagnosisContent();
        
        if (window.app) {
          app.openTab('diagnosis');
        } else {
          this.directTabSwitch('diagnosis');
        }
      }
    } catch (error) {
      console.error('検査詳細表示エラー:', error);
      alert('検査詳細の表示に失敗しました');
    }
  }
}

// グローバルインスタンス（即座に初期化）
const assessmentManager = new AssessmentManager();

// ウィンドウオブジェクトに登録（他のファイルからアクセス可能にする）
window.assessmentManager = assessmentManager;

console.log('assessment.js 読み込み完了');
`
}