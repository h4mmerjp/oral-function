// 管理計画モジュール（完全修正版）
class ManagementManager {
  constructor() {
    this.selectedManagementOptions = {};
    console.log('ManagementManager が初期化されました');
  }

  // 管理計画書作成
  createManagementPlan() {
    console.log('管理計画書作成が呼び出されました');
    
    if (!window.patientManager || !patientManager.currentPatient || 
        !window.assessmentManager || !assessmentManager.currentAssessment) {
      alert('患者情報と検査結果が必要です');
      return;
    }

    console.log('必要なデータが揃っています');
    this.loadManagementPlanContent();
    
    // タブ切り替え
    if (window.app) {
      app.openTab('management-plan');
    } else {
      this.directTabSwitch('management-plan');
    }
    
    console.log('管理計画書作成完了');
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
      const tabButton = document.querySelector(`.tab[onclick*="${tabName}"]`);
      if (tabButton) {
        tabButton.classList.add('active');
        console.log('タブボタンアクティブ化完了');
      }
      
    } catch (error) {
      console.error('直接タブ切り替えエラー:', error);
    }
  }

  // 管理計画書コンテンツの読み込み（修正版）
  loadManagementPlanContent() {
    const content = document.getElementById('management-plan-content');
    
    if (!content) {
      console.error('management-plan-content 要素が見つかりません');
      return;
    }
    
    const assessment = assessmentManager.currentAssessment;
    
    content.innerHTML = `
      <div class="summary-card">
        <h3>患者情報</h3>
        <p>患者名: ${patientManager.currentPatient.name} (ID: ${patientManager.currentPatient.patient_id})</p>
        <p>診断結果: ${assessment.diagnosis_result ? '口腔機能低下症' : '口腔機能低下症ではありません'}</p>
        <p>該当項目数: ${assessment.affected_items_count}/7項目</p>
      </div>

      <div class="summary-card">
        <h3>管理方針の設定</h3>
        <p>各口腔機能について管理方針を選択してください。</p>
        
        <table>
          <thead>
            <tr>
              <th>項目</th>
              <th>現在の状態</th>
              <th>管理方針</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>① 口腔衛生状態</td>
              <td>${assessment.tci_status ? '<span class="red-text">低下あり</span>' : '<span class="green-text">正常</span>'}</td>
              <td>
                <div class="rating-options">
                  <div class="rating-option" onclick="managementManager.selectManagementOption(this, 'hygiene')" data-value="1">問題なし</div>
                  <div class="rating-option" onclick="managementManager.selectManagementOption(this, 'hygiene')" data-value="2">機能維持</div>
                  <div class="rating-option" onclick="managementManager.selectManagementOption(this, 'hygiene')" data-value="3">機能向上</div>
                </div>
              </td>
            </tr>
            <tr>
              <td>② 口腔乾燥</td>
              <td>${assessment.dryness_status ? '<span class="red-text">低下あり</span>' : '<span class="green-text">正常</span>'}</td>
              <td>
                <div class="rating-options">
                  <div class="rating-option" onclick="managementManager.selectManagementOption(this, 'dryness')" data-value="1">問題なし</div>
                  <div class="rating-option" onclick="managementManager.selectManagementOption(this, 'dryness')" data-value="2">機能維持</div>
                  <div class="rating-option" onclick="managementManager.selectManagementOption(this, 'dryness')" data-value="3">機能向上</div>
                </div>
              </td>
            </tr>
            <tr>
              <td>③ 咬合力低下</td>
              <td>${assessment.bite_force_status ? '<span class="red-text">低下あり</span>' : '<span class="green-text">正常</span>'}</td>
              <td>
                <div class="rating-options">
                  <div class="rating-option" onclick="managementManager.selectManagementOption(this, 'bite')" data-value="1">問題なし</div>
                  <div class="rating-option" onclick="managementManager.selectManagementOption(this, 'bite')" data-value="2">機能維持</div>
                  <div class="rating-option" onclick="managementManager.selectManagementOption(this, 'bite')" data-value="3">機能向上</div>
                </div>
              </td>
            </tr>
            <tr>
              <td>④ 舌口唇運動機能低下</td>
              <td>${assessment.oral_diadochokinesis_status ? '<span class="red-text">低下あり</span>' : '<span class="green-text">正常</span>'}</td>
              <td>
                <div class="rating-options">
                  <div class="rating-option" onclick="managementManager.selectManagementOption(this, 'oral-motor')" data-value="1">問題なし</div>
                  <div class="rating-option" onclick="managementManager.selectManagementOption(this, 'oral-motor')" data-value="2">機能維持</div>
                  <div class="rating-option" onclick="managementManager.selectManagementOption(this, 'oral-motor')" data-value="3">機能向上</div>
                </div>
              </td>
            </tr>
            <tr>
              <td>⑤ 低舌圧</td>
              <td>${assessment.tongue_pressure_status ? '<span class="red-text">低下あり</span>' : '<span class="green-text">正常</span>'}</td>
              <td>
                <div class="rating-options">
                  <div class="rating-option" onclick="managementManager.selectManagementOption(this, 'tongue-pressure')" data-value="1">問題なし</div>
                  <div class="rating-option" onclick="managementManager.selectManagementOption(this, 'tongue-pressure')" data-value="2">機能維持</div>
                  <div class="rating-option" onclick="managementManager.selectManagementOption(this, 'tongue-pressure')" data-value="3">機能向上</div>
                </div>
              </td>
            </tr>
            <tr>
              <td>⑥ 咀嚼機能低下</td>
              <td>${assessment.mastication_status ? '<span class="red-text">低下あり</span>' : '<span class="green-text">正常</span>'}</td>
              <td>
                <div class="rating-options">
                  <div class="rating-option" onclick="managementManager.selectManagementOption(this, 'mastication')" data-value="1">問題なし</div>
                  <div class="rating-option" onclick="managementManager.selectManagementOption(this, 'mastication')" data-value="2">機能維持</div>
                  <div class="rating-option" onclick="managementManager.selectManagementOption(this, 'mastication')" data-value="3">機能向上</div>
                </div>
              </td>
            </tr>
            <tr>
              <td>⑦ 嚥下機能低下</td>
              <td>${assessment.swallowing_status ? '<span class="red-text">低下あり</span>' : '<span class="green-text">正常</span>'}</td>
              <td>
                <div class="rating-options">
                  <div class="rating-option" onclick="managementManager.selectManagementOption(this, 'swallowing')" data-value="1">問題なし</div>
                  <div class="rating-option" onclick="managementManager.selectManagementOption(this, 'swallowing')" data-value="2">機能維持</div>
                  <div class="rating-option" onclick="managementManager.selectManagementOption(this, 'swallowing')" data-value="3">機能向上</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="summary-card">
        <h3>管理目標・計画</h3>
        <div class="form-group">
          <label for="management-goals">管理方針・目標（ゴール）・治療予定等</label>
          <textarea id="management-goals" rows="8" placeholder="管理方針や目標、治療予定などを記入してください">${this.generateDefaultGoals()}</textarea>
        </div>
        
        <div class="form-group">
          <label for="reevaluation-period">再評価の時期</label>
          <div class="input-group">
            <span>約</span>
            <input type="number" id="reevaluation-period" min="1" value="6" style="width: 80px; margin: 0 10px;">
            <span>か月後</span>
          </div>
        </div>
      </div>

      <div style="margin-top: 30px;">
        <button onclick="managementManager.saveManagementPlan()" class="btn-success">管理計画書を保存</button>
        <button onclick="managementManager.printManagementPlan()" class="btn-secondary">印刷</button>
        <button onclick="managementManager.loadProgressRecordForm()" class="btn-secondary">管理指導記録へ</button>
      </div>
    `;

    // デフォルトの管理方針を自動選択
    this.setDefaultManagementOptions();
  }

  // デフォルトの管理目標を生成
  generateDefaultGoals() {
    const assessment = assessmentManager.currentAssessment;
    
    let goals = `【管理方針】\n`;
    goals += `・口腔機能の維持・向上を目指し、個別の機能訓練プログラムを実施します\n`;
    goals += `・定期的な評価とフィードバックによる継続的な管理を行います\n`;
    goals += `・専門的口腔ケアと自己管理の指導を組み合わせて実施します\n\n`;
    
    goals += `【目標（ゴール）】\n`;
    goals += `・短期（1-3ヶ月）：セルフケア習慣の確立と基本的な口腔機能訓練の習得\n`;
    goals += `・中期（3-6ヶ月）：口腔機能評価項目の改善を目指す\n`;
    goals += `・長期（6ヶ月以上）：継続的な口腔機能の維持・向上\n\n`;
    
    goals += `【治療・訓練計画】\n`;
    
    if (assessment.tci_status) {
      goals += `・口腔衛生管理：専門的口腔ケアと患者指導\n`;
    }
    
    if (assessment.dryness_status) {
      goals += `・口腔乾燥対策：唾液腺マッサージ、保湿剤指導\n`;
    }
    
    if (assessment.bite_force_status) {
      goals += `・咬合機能改善：義歯調整、咀嚼指導\n`;
    }
    
    if (assessment.oral_diadochokinesis_status) {
      goals += `・舌口唇運動訓練：パタカラ体操、構音訓練\n`;
    }
    
    if (assessment.tongue_pressure_status) {
      goals += `・舌機能訓練：舌圧訓練、抵抗訓練\n`;
    }
    
    if (assessment.mastication_status) {
      goals += `・咀嚼機能訓練：段階的食事指導、咀嚼訓練\n`;
    }
    
    if (assessment.swallowing_status) {
      goals += `・嚥下機能訓練：嚥下体操、安全な摂食指導\n`;
    }
    
    return goals;
  }

  // デフォルトの管理方針を設定
  setDefaultManagementOptions() {
    const assessment = assessmentManager.currentAssessment;
    
    // 低下がある項目は「機能向上」、正常な項目は「機能維持」を自動選択
    const options = {
      'hygiene': assessment.tci_status ? 3 : 2,
      'dryness': assessment.dryness_status ? 3 : 2,
      'bite': assessment.bite_force_status ? 3 : 2,
      'oral-motor': assessment.oral_diadochokinesis_status ? 3 : 2,
      'tongue-pressure': assessment.tongue_pressure_status ? 3 : 2,
      'mastication': assessment.mastication_status ? 3 : 2,
      'swallowing': assessment.swallowing_status ? 3 : 2
    };

    // 各オプションを自動選択（少し遅延して実行）
    setTimeout(() => {
      Object.entries(options).forEach(([type, value]) => {
        const option = document.querySelector(`.rating-option[onclick*="${type}"][data-value="${value}"]`);
        if (option) {
          option.click();
        }
      });
    }, 100);
  }

  // 管理オプション選択
  selectManagementOption(element, type) {
    const options = element.parentElement.querySelectorAll('.rating-option');
    options.forEach(option => {
      option.classList.remove('selected');
    });
    
    element.classList.add('selected');
    const value = parseInt(element.getAttribute('data-value'));
    this.selectedManagementOptions[type] = value;
  }

  // 管理計画書保存
  async saveManagementPlan() {
    if (!patientManager.currentPatient || !assessmentManager.currentAssessment) {
      alert('患者情報と検査結果が必要です');
      return;
    }

    const goals = document.getElementById('management-goals').value;
    const reevaluationPeriod = parseInt(document.getElementById('reevaluation-period').value);

    const managementPlan = {
      patient_id: patientManager.currentPatient.id,
      assessment_id: assessmentManager.currentAssessment.id,
      plan_date: new Date().toISOString().split('T')[0],
      hygiene_plan: this.selectedManagementOptions.hygiene || null,
      dryness_plan: this.selectedManagementOptions.dryness || null,
      bite_plan: this.selectedManagementOptions.bite || null,
      lip_plan: this.selectedManagementOptions['oral-motor'] || null,
      tongue_tip_plan: this.selectedManagementOptions['oral-motor'] || null,
      back_tongue_plan: this.selectedManagementOptions['oral-motor'] || null,
      tongue_pressure_plan: this.selectedManagementOptions['tongue-pressure'] || null,
      mastication_plan: this.selectedManagementOptions.mastication || null,
      swallowing_plan: this.selectedManagementOptions.swallowing || null,
      goals: goals,
      reevaluation_period: reevaluationPeriod
    };

    try {
      await db.createManagementPlan(managementPlan);
      alert('管理計画書が保存されました');
    } catch (error) {
      console.error('管理計画書保存エラー:', error);
      alert('保存に失敗しました');
    }
  }

  // 管理計画書印刷
  printManagementPlan() {
    window.print();
  }

  // 管理計画書の表示機能を追加
  async viewManagementPlan(planId) {
    try {
      const plans = await db.getManagementPlans(patientManager.currentPatient.id);
      const plan = plans.find(p => p.id === planId);
      
      if (plan) {
        this.displayManagementPlanDetails(plan);
        
        // タブ切り替え
        if (window.app) {
          app.openTab('management-plan');
        } else {
          this.directTabSwitch('management-plan');
        }
      }
    } catch (error) {
      console.error('管理計画書詳細表示エラー:', error);
      alert('詳細の表示に失敗しました');
    }
  }

  // 管理計画書詳細の表示（新規追加）
  displayManagementPlanDetails(plan) {
    const content = document.getElementById('management-plan-content');
    
    if (!content) {
      console.error('management-plan-content 要素が見つかりません');
      return;
    }
    
    const getPlanText = (value) => {
      switch(value) {
        case 1: return '問題なし';
        case 2: return '機能維持';
        case 3: return '機能向上';
        default: return '設定なし';
      }
    };

    content.innerHTML = `
      <div class="summary-card">
        <h3>管理計画書詳細</h3>
        <p>患者名: ${patientManager.currentPatient.name}</p>
        <p>計画作成日: ${new Date(plan.plan_date).toLocaleDateString()}</p>
        <p>再評価予定: ${plan.reevaluation_period}ヶ月後</p>
      </div>

      <div class="summary-card">
        <h3>管理方針</h3>
        <table>
          <thead>
            <tr>
              <th>項目</th>
              <th>管理方針</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>① 口腔衛生状態</td>
              <td>${getPlanText(plan.hygiene_plan)}</td>
            </tr>
            <tr>
              <td>② 口腔乾燥</td>
              <td>${getPlanText(plan.dryness_plan)}</td>
            </tr>
            <tr>
              <td>③ 咬合力低下</td>
              <td>${getPlanText(plan.bite_plan)}</td>
            </tr>
            <tr>
              <td>④ 舌口唇運動機能低下</td>
              <td>${getPlanText(plan.lip_plan)}</td>
            </tr>
            <tr>
              <td>⑤ 低舌圧</td>
              <td>${getPlanText(plan.tongue_pressure_plan)}</td>
            </tr>
            <tr>
              <td>⑥ 咀嚼機能低下</td>
              <td>${getPlanText(plan.mastication_plan)}</td>
            </tr>
            <tr>
              <td>⑦ 嚥下機能低下</td>
              <td>${getPlanText(plan.swallowing_plan)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="summary-card">
        <h3>管理目標・計画</h3>
        <div style="white-space: pre-wrap; background: #f9f9f9; padding: 15px; border-radius: 4px;">
          ${plan.goals || '記載なし'}
        </div>
      </div>

      <div style="margin-top: 30px;">
        <button onclick="managementManager.createManagementPlan()" class="btn-secondary">新規計画作成</button>
        <button onclick="managementManager.printManagementPlan()" class="btn-secondary">印刷</button>
        <button onclick="managementManager.loadProgressRecordForm()" class="btn-success">管理指導記録へ</button>
      </div>
    `;
  }

  // 管理指導記録フォームの読み込み
  loadProgressRecordForm() {
    if (!patientManager.currentPatient) {
      alert('患者を選択してください');
      return;
    }

    const content = document.getElementById('progress-record-content');
    
    if (!content) {
      console.error('progress-record-content 要素が見つかりません');
      return;
    }
    
    content.innerHTML = `
      <div class="summary-card">
        <h3>患者情報</h3>
        <p>患者名: ${patientManager.currentPatient.name} (ID: ${patientManager.currentPatient.patient_id})</p>
      </div>

      <div class="form-group">
        <label for="record-date">記録日</label>
        <input type="date" id="record-date" value="${new Date().toISOString().split('T')[0]}">
      </div>
      
      <div class="summary-card">
        <h3>評価項目</h3>
        <table>
          <thead>
            <tr>
              <th>評価項目</th>
              <th>評価（1：改善・2：著変なし・3：悪化）</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>栄養・体重</td>
              <td>
                <div class="rating-options">
                  <div class="rating-option" onclick="managementManager.selectRating(this, 'nutrition')" data-value="1">1：改善</div>
                  <div class="rating-option" onclick="managementManager.selectRating(this, 'nutrition')" data-value="2">2：著変なし</div>
                  <div class="rating-option" onclick="managementManager.selectRating(this, 'nutrition')" data-value="3">3：悪化</div>
                </div>
              </td>
            </tr>
            <tr>
              <td>口腔衛生</td>
              <td>
                <div class="rating-options">
                  <div class="rating-option" onclick="managementManager.selectRating(this, 'hygiene')" data-value="1">1：改善</div>
                  <div class="rating-option" onclick="managementManager.selectRating(this, 'hygiene')" data-value="2">2：著変なし</div>
                  <div class="rating-option" onclick="managementManager.selectRating(this, 'hygiene')" data-value="3">3：悪化</div>
                </div>
              </td>
            </tr>
            <tr>
              <td>口腔乾燥</td>
              <td>
                <div class="rating-options">
                  <div class="rating-option" onclick="managementManager.selectRating(this, 'dryness')" data-value="1">1：改善</div>
                  <div class="rating-option" onclick="managementManager.selectRating(this, 'dryness')" data-value="2">2：著変なし</div>
                  <div class="rating-option" onclick="managementManager.selectRating(this, 'dryness')" data-value="3">3：悪化</div>
                </div>
              </td>
            </tr>
            <tr>
              <td>咬合・義歯</td>
              <td>
                <div class="rating-options">
                  <div class="rating-option" onclick="managementManager.selectRating(this, 'bite')" data-value="1">1：改善</div>
                  <div class="rating-option" onclick="managementManager.selectRating(this, 'bite')" data-value="2">2：著変なし</div>
                  <div class="rating-option" onclick="managementManager.selectRating(this, 'bite')" data-value="3">3：悪化</div>
                </div>
              </td>
            </tr>
            <tr>
              <td>口唇機能</td>
              <td>
                <div class="rating-options">
                  <div class="rating-option" onclick="managementManager.selectRating(this, 'lip')" data-value="1">1：改善</div>
                  <div class="rating-option" onclick="managementManager.selectRating(this, 'lip')" data-value="2">2：著変なし</div>
                  <div class="rating-option" onclick="managementManager.selectRating(this, 'lip')" data-value="3">3：悪化</div>
                </div>
              </td>
            </tr>
            <tr>
              <td>舌機能</td>
              <td>
                <div class="rating-options">
                  <div class="rating-option" onclick="managementManager.selectRating(this, 'tongue')" data-value="1">1：改善</div>
                  <div class="rating-option" onclick="managementManager.selectRating(this, 'tongue')" data-value="2">2：著変なし</div>
                  <div class="rating-option" onclick="managementManager.selectRating(this, 'tongue')" data-value="3">3：悪化</div>
                </div>
              </td>
            </tr>
            <tr>
              <td>咀嚼機能</td>
              <td>
                <div class="rating-options">
                  <div class="rating-option" onclick="managementManager.selectRating(this, 'mastication')" data-value="1">1：改善</div>
                  <div class="rating-option" onclick="managementManager.selectRating(this, 'mastication')" data-value="2">2：著変なし</div>
                  <div class="rating-option" onclick="managementManager.selectRating(this, 'mastication')" data-value="3">3：悪化</div>
                </div>
              </td>
            </tr>
            <tr>
              <td>嚥下機能</td>
              <td>
                <div class="rating-options">
                  <div class="rating-option" onclick="managementManager.selectRating(this, 'swallowing')" data-value="1">1：改善</div>
                  <div class="rating-option" onclick="managementManager.selectRating(this, 'swallowing')" data-value="2">2：著変なし</div>
                  <div class="rating-option" onclick="managementManager.selectRating(this, 'swallowing')" data-value="3">3：悪化</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="summary-card">
        <h3>所見</h3>
        <div class="form-group">
          <label for="findings-general">全身状態</label>
          <textarea id="findings-general" style="width: 100%; height: 100px;" placeholder="全身状態に関する所見を記入してください"></textarea>
        </div>
        <div class="form-group">
          <label for="findings-oral">口腔機能</label>
          <textarea id="findings-oral" style="width: 100%; height: 100px;" placeholder="口腔機能に関する所見を記入してください"></textarea>
        </div>
        <div class="form-group">
          <label for="findings-other">その他</label>
          <textarea id="findings-other" style="width: 100%; height: 100px;" placeholder="その他の所見を記入してください"></textarea>
        </div>
      </div>
      
      <div class="summary-card">
        <h3>管理内容</h3>
        <textarea id="management-content" style="width: 100%; height: 150px;" placeholder="実施した管理内容について記入してください"></textarea>
      </div>
      
      <div style="margin-top: 30px;">
        <button onclick="managementManager.saveProgressRecord()" class="btn-success">管理指導記録を保存</button>
        <button onclick="managementManager.printProgressRecord()" class="btn-secondary">印刷</button>
      </div>
    `;

    // タブ切り替え
    if (window.app) {
      app.openTab('progress-record');
    } else {
      this.directTabSwitch('progress-record');
    }
  }

  // 評価選択
  selectRating(element, type) {
    const options = element.parentElement.querySelectorAll('.rating-option');
    options.forEach(option => {
      option.classList.remove('selected');
    });
    
    element.classList.add('selected');
  }

  // 管理指導記録の保存
  async saveProgressRecord() {
    if (!patientManager.currentPatient) {
      alert('患者を選択してください');
      return;
    }

    const recordData = {
      patient_id: patientManager.currentPatient.id,
      record_date: document.getElementById('record-date').value,
      nutrition_rating: this.getSelectedRating('nutrition'),
      hygiene_rating: this.getSelectedRating('hygiene'),
      dryness_rating: this.getSelectedRating('dryness'),
      bite_rating: this.getSelectedRating('bite'),
      lip_rating: this.getSelectedRating('lip'),
      tongue_rating: this.getSelectedRating('tongue'),
      mastication_rating: this.getSelectedRating('mastication'),
      swallowing_rating: this.getSelectedRating('swallowing'),
      findings_general: document.getElementById('findings-general').value,
      findings_oral: document.getElementById('findings-oral').value,
      findings_other: document.getElementById('findings-other').value,
      management_content: document.getElementById('management-content').value
    };

    try {
      await db.createProgressRecord(recordData);
      alert('管理指導記録が保存されました');
    } catch (error) {
      console.error('管理指導記録保存エラー:', error);
      alert('保存に失敗しました');
    }
  }

  // 選択された評価を取得
  getSelectedRating(type) {
    const selected = document.querySelector(`.rating-option.selected[onclick*="${type}"]`);
    return selected ? parseInt(selected.getAttribute('data-value')) : null;
  }

  // 管理指導記録の印刷
  printProgressRecord() {
    window.print();
  }

  // 管理指導記録の詳細表示（修正版）
  async viewProgressRecord(recordId) {
    try {
      const records = await db.getProgressRecords(patientManager.currentPatient.id);
      const record = records.find(r => r.id === recordId);
      
      if (record) {
        this.displayProgressRecordDetails(record);
        
        // タブ切り替えを追加
        if (window.app) {
          app.openTab('progress-record');
        } else {
          this.directTabSwitch('progress-record');
        }
      }
    } catch (error) {
      console.error('管理指導記録詳細表示エラー:', error);
      alert('詳細の表示に失敗しました');
    }
  }

  // 管理指導記録詳細の表示
  displayProgressRecordDetails(record) {
    const content = document.getElementById('progress-record-content');
    
    if (!content) {
      console.error('progress-record-content 要素が見つかりません');
      return;
    }
    
    const ratingText = (value) => {
      switch(value) {
        case 1: return '改善';
        case 2: return '著変なし';
        case 3: return '悪化';
        default: return '未評価';
      }
    };

    content.innerHTML = `
      <div class="summary-card">
        <h3>管理指導記録詳細</h3>
        <p>患者名: ${patientManager.currentPatient.name}</p>
        <p>記録日: ${new Date(record.record_date).toLocaleDateString()}</p>
      </div>

      <div class="summary-card">
        <h3>評価結果</h3>
        <table>
          <thead>
            <tr>
              <th>評価項目</th>
              <th>評価</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>栄養・体重</td>
              <td>${ratingText(record.nutrition_rating)}</td>
            </tr>
            <tr>
              <td>口腔衛生</td>
              <td>${ratingText(record.hygiene_rating)}</td>
            </tr>
            <tr>
              <td>口腔乾燥</td>
              <td>${ratingText(record.dryness_rating)}</td>
            </tr>
            <tr>
              <td>咬合・義歯</td>
              <td>${ratingText(record.bite_rating)}</td>
            </tr>
            <tr>
              <td>口唇機能</td>
              <td>${ratingText(record.lip_rating)}</td>
            </tr>
            <tr>
              <td>舌機能</td>
              <td>${ratingText(record.tongue_rating)}</td>
            </tr>
            <tr>
              <td>咀嚼機能</td>
              <td>${ratingText(record.mastication_rating)}</td>
            </tr>
            <tr>
              <td>嚥下機能</td>
              <td>${ratingText(record.swallowing_rating)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="summary-card">
        <h3>所見</h3>
        <div class="form-group">
          <label>全身状態</label>
          <p>${record.findings_general || '記載なし'}</p>
        </div>
        <div class="form-group">
          <label>口腔機能</label>
          <p>${record.findings_oral || '記載なし'}</p>
        </div>
        <div class="form-group">
          <label>その他</label>
          <p>${record.findings_other || '記載なし'}</p>
        </div>
      </div>

      <div class="summary-card">
        <h3>管理内容</h3>
        <p>${record.management_content || '記載なし'}</p>
      </div>

      <div style="margin-top: 30px;">
        <button onclick="managementManager.loadProgressRecordForm()" class="btn-secondary">新規記録作成</button>
        <button onclick="managementManager.printProgressRecord()" class="btn-secondary">印刷</button>
      </div>
    `;
  }
}

// グローバルインスタンス（即座に初期化）
const managementManager = new ManagementManager();

// ウィンドウオブジェクトに登録（他のファイルからアクセス可能にする）
window.managementManager = managementManager;

console.log('management.js 読み込み完了');