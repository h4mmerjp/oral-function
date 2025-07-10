// 最終修正版患者管理モジュール
class PatientManager {
  constructor() {
    this.currentPatient = null;
    this.selectedManagementOptions = {};
    console.log('PatientManager が初期化されました');
  }

  // 患者一覧の読み込み
  async loadPatients() {
    try {
      const patients = await db.getPatients();
      this.displayPatients(patients);
    } catch (error) {
      console.error('患者一覧読み込みエラー:', error);
      this.displayPatients([]);
    }
  }

  // 患者一覧を表示
  async displayPatients(patients) {
    const container = document.getElementById('patients-grid');
    
    if (!patients || patients.length === 0) {
      container.innerHTML = `
        <div class="no-patients">
          <p>登録された患者がありません。</p>
          <button onclick="showAddPatientModal()" class="btn-success">最初の患者を登録</button>
        </div>
      `;
      return;
    }

    let html = '';
    for (const patient of patients) {
      const age = this.calculateAge(patient.birthdate);
      
      // 各患者に対して個別に検査データを取得
      const latestAssessment = await db.getLatestAssessment(patient.id);
      const status = this.getPatientStatus(latestAssessment);
      
      console.log(`患者 ${patient.name} (ID: ${patient.id}) の検査データ:`, latestAssessment);
      
      html += `
        <div class="patient-card ${status.class}" onclick="selectPatient(${patient.id})" data-patient-id="${patient.id}">
          <div class="patient-name">${patient.name}</div>
          <div class="patient-info">
            <div>ID: ${patient.patient_id}</div>
            <div>年齢: ${age}歳 (${patient.gender === 'male' ? '男性' : patient.gender === 'female' ? '女性' : '未指定'})</div>
            <div>最終検査: ${latestAssessment ? new Date(latestAssessment.assessment_date).toLocaleDateString() : '未実施'}</div>
            <div class="status-badge status-${status.class}">${status.text}</div>
          </div>
          <div style="margin-top: 10px;">
            <button onclick="event.stopPropagation(); editPatient(${patient.id})" class="btn-secondary" style="margin: 2px; padding: 5px 10px;">編集</button>
            <button onclick="event.stopPropagation(); deletePatient(${patient.id})" class="btn-danger" style="margin: 2px; padding: 5px 10px;">削除</button>
          </div>
        </div>
      `;
    }
    
    container.innerHTML = html;
  }

  // 年齢計算
  calculateAge(birthdate) {
    if (!birthdate) return '不明';
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  // 患者のステータスを取得
  getPatientStatus(assessment) {
    if (!assessment) {
      return { class: 'pending', text: '未診断' };
    }
    
    if (assessment.diagnosis_result) {
      return { class: 'diagnosed', text: '口腔機能低下症' };
    } else {
      return { class: 'normal', text: '正常' };
    }
  }

  // 患者検索
  searchPatients() {
    const searchTerm = document.getElementById('search-patients').value.toLowerCase();
    const cards = document.querySelectorAll('.patient-card');
    
    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      if (text.includes(searchTerm)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }

  // 患者フィルタ
  filterPatients() {
    const filterStatus = document.getElementById('filter-status').value;
    const cards = document.querySelectorAll('.patient-card');
    
    cards.forEach(card => {
      if (!filterStatus || card.classList.contains(filterStatus)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }

  // 患者選択（完全修正版）
  async selectPatient(patientId) {
    try {
      console.log('=== 患者選択開始 ===');
      console.log('選択された患者ID:', patientId);
      console.log('現在の患者:', this.currentPatient);
      
      // すべての関連データを完全にクリア
      this.clearAllPatientData();
      
      // 指定されたIDの患者データを新規取得
      const selectedPatient = await db.getPatient(parseInt(patientId));
      console.log('データベースから取得した患者:', selectedPatient);
      
      if (!selectedPatient) {
        console.error('患者が見つかりません:', patientId);
        alert('患者情報の取得に失敗しました');
        return;
      }
      
      // 新しい患者データを設定
      this.currentPatient = selectedPatient;
      console.log('設定された現在の患者:', this.currentPatient);
      
      // 患者情報画面を更新
      await this.loadPatientInfo();
      
      // 患者情報タブに移動
      if (window.app) {
        app.openTab('patient-info');
      } else {
        this.directTabSwitch('patient-info');
      }
      
      console.log('=== 患者選択完了 ===');
      
    } catch (error) {
      console.error('患者選択エラー:', error);
      alert('患者情報の取得に失敗しました: ' + error.message);
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
      const tabButton = document.querySelector(`.tab[onclick*="${tabName}"]`);
      if (tabButton) {
        tabButton.classList.add('active');
        console.log('タブボタンアクティブ化完了');
      }
      
    } catch (error) {
      console.error('直接タブ切り替えエラー:', error);
    }
  }

  // すべての患者関連データをクリア（修正版）
  clearAllPatientData() {
    console.log('すべての患者データをクリア中...');
    
    // 現在の患者をクリア
    this.currentPatient = null;
    
    // 検査データをクリア（安全チェック付き）
    if (window.assessmentManager) {
      assessmentManager.currentAssessment = null;
      assessmentManager.assessmentStatus = {
        tci: false,
        dryness: false,
        biteForce: false,
        oralDiadochokinesis: false,
        tonguePressure: false,
        mastication: false,
        swallowing: false
      };
      assessmentManager.eat10Scores = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      console.log('検査データクリア完了');
    } else {
      console.warn('assessmentManager が見つかりません');
    }
    
    // 管理計画データをクリア（安全チェック付き）
    if (window.managementManager) {
      managementManager.selectedManagementOptions = {};
      console.log('管理計画データクリア完了');
    } else {
      console.warn('managementManager が見つかりません');
    }
    
    // 画面のコンテンツをクリア
    const contentElements = [
      'patient-info-content',
      'assessment-content', 
      'diagnosis-content',
      'management-plan-content',
      'progress-record-content',
      'patient-history-content'
    ];
    
    contentElements.forEach(elementId => {
      const element = document.getElementById(elementId);
      if (element) {
        element.innerHTML = '<p>患者を選択してください。</p>';
      }
    });
    
    console.log('データクリア完了');
  }

  // 患者情報を読み込み（完全修正版）
  async loadPatientInfo() {
    if (!this.currentPatient) {
      console.error('currentPatient が設定されていません');
      document.getElementById('patient-info-content').innerHTML = '<p>患者を選択してください。</p>';
      return;
    }

    console.log('患者情報読み込み開始:', this.currentPatient);

    const age = this.calculateAge(this.currentPatient.birthdate);
    const content = document.getElementById('patient-info-content');
    
    if (!content) {
      console.error('patient-info-content 要素が見つかりません');
      return;
    }
    
    // 患者情報HTMLを強制的に再生成
    const patientInfoHTML = `
      <div class="summary-card">
        <h3>基本情報</h3>
        <p style="background: #e3f2fd; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
          <strong>選択中の患者:</strong> ${this.currentPatient.name} (内部ID: ${this.currentPatient.id})
        </p>
        <div class="grid-container">
          <div><strong>患者氏名:</strong> ${this.currentPatient.name}</div>
          <div><strong>患者ID:</strong> ${this.currentPatient.patient_id}</div>
          <div><strong>フリガナ:</strong> ${this.currentPatient.name_kana || '未入力'}</div>
          <div><strong>生年月日:</strong> ${this.currentPatient.birthdate || '未入力'}</div>
          <div><strong>年齢:</strong> ${age}歳</div>
          <div><strong>性別:</strong> ${this.currentPatient.gender === 'male' ? '男性' : this.currentPatient.gender === 'female' ? '女性' : '未指定'}</div>
          <div><strong>電話番号:</strong> ${this.currentPatient.phone || '未入力'}</div>
          <div><strong>住所:</strong> ${this.currentPatient.address || '未入力'}</div>
        </div>
        <div style="margin-top: 20px;">
          <button onclick="editPatient(${this.currentPatient.id})" class="btn-secondary">編集</button>
          <button onclick="startAssessment()" class="btn-success">検査開始</button>
          <button onclick="patientManager.openPatientHistory()" class="btn-secondary">履歴確認</button>
        </div>
      </div>

      <div class="summary-card">
        <h3>全身の状態</h3>
        <div id="general-conditions-form-${this.currentPatient.id}">
          <div class="grid-container">
            <div class="form-group">
              <label>基礎疾患</label>
              <div class="checkbox-container">
                <label class="checkbox-item">
                  <input type="checkbox" name="disease-${this.currentPatient.id}" value="heart"> 心疾患
                </label>
                <label class="checkbox-item">
                  <input type="checkbox" name="disease-${this.currentPatient.id}" value="hepatitis"> 肝炎
                </label>
                <label class="checkbox-item">
                  <input type="checkbox" name="disease-${this.currentPatient.id}" value="diabetes"> 糖尿病
                </label>
                <label class="checkbox-item">
                  <input type="checkbox" name="disease-${this.currentPatient.id}" value="hypertension"> 高血圧症
                </label>
                <label class="checkbox-item">
                  <input type="checkbox" name="disease-${this.currentPatient.id}" value="stroke"> 脳血管疾患
                </label>
                <label class="checkbox-item">
                  <input type="checkbox" name="disease-${this.currentPatient.id}" value="other"> その他
                </label>
              </div>
            </div>
            
            <div class="form-group">
              <label for="medication-status-${this.currentPatient.id}">服用薬剤</label>
              <select id="medication-status-${this.currentPatient.id}" onchange="patientManager.toggleMedicationDetails()">
                <option value="no">なし</option>
                <option value="yes">あり</option>
              </select>
              <div id="medication-details-${this.currentPatient.id}" style="margin-top: 10px; display: none;">
                <textarea id="medication-list-${this.currentPatient.id}" placeholder="薬剤名をご記入ください"></textarea>
              </div>
            </div>
            
            <div class="form-group">
              <label for="pneumonia-history-${this.currentPatient.id}">肺炎の既往</label>
              <select id="pneumonia-history-${this.currentPatient.id}">
                <option value="no">なし</option>
                <option value="yes">あり</option>
                <option value="repeated">繰り返しあり</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="height-${this.currentPatient.id}">身長 (cm)</label>
              <input type="number" id="height-${this.currentPatient.id}" placeholder="例：165">
            </div>
            
            <div class="form-group">
              <label for="weight-${this.currentPatient.id}">体重 (kg)</label>
              <input type="number" id="weight-${this.currentPatient.id}" placeholder="例：60">
            </div>
            
            <div class="form-group">
              <label for="bmi-${this.currentPatient.id}">BMI</label>
              <div class="input-group">
                <input type="text" id="bmi-${this.currentPatient.id}" readonly>
                <div class="input-group-append">
                  <button type="button" onclick="patientManager.calculateBMI()">計算</button>
                </div>
              </div>
            </div>
          </div>
          
          <button onclick="patientManager.saveGeneralConditions()" class="btn-success">全身状態を保存</button>
        </div>
      </div>
    `;

    // HTMLを設定
    content.innerHTML = patientInfoHTML;

    // 現在の患者の既存の全身状態データを読み込み
    await this.loadGeneralConditions();
    
    console.log('患者情報読み込み完了');
  }

  // 履歴タブを開く（修正版）
  openPatientHistory() {
    if (window.app) {
      app.openTab('patient-history');
    } else {
      this.directTabSwitch('patient-history');
    }
  }

  // 服用薬剤の詳細表示切り替え（修正版）
  toggleMedicationDetails() {
    if (!this.currentPatient) return;
    
    const medicationStatus = document.getElementById(`medication-status-${this.currentPatient.id}`);
    const medicationDetails = document.getElementById(`medication-details-${this.currentPatient.id}`);
    
    if (medicationStatus && medicationDetails) {
      if (medicationStatus.value === 'yes') {
        medicationDetails.style.display = 'block';
      } else {
        medicationDetails.style.display = 'none';
      }
    }
  }

  // BMI計算（修正版）
  calculateBMI() {
    if (!this.currentPatient) return;
    
    const heightElement = document.getElementById(`height-${this.currentPatient.id}`);
    const weightElement = document.getElementById(`weight-${this.currentPatient.id}`);
    const bmiElement = document.getElementById(`bmi-${this.currentPatient.id}`);
    
    if (!heightElement || !weightElement || !bmiElement) return;
    
    const height = parseFloat(heightElement.value) / 100;
    const weight = parseFloat(weightElement.value);
    
    if (height > 0 && weight > 0) {
      const bmi = (weight / (height * height)).toFixed(1);
      bmiElement.value = bmi;
    } else {
      alert('身長と体重を正しく入力してください');
    }
  }

  // 全身状態の保存（修正版）
  async saveGeneralConditions() {
    if (!this.currentPatient) return;

    const diseases = Array.from(document.querySelectorAll(`input[name="disease-${this.currentPatient.id}"]:checked`)).map(cb => cb.value);
    const medicationStatus = document.getElementById(`medication-status-${this.currentPatient.id}`).value;
    const medicationList = document.getElementById(`medication-list-${this.currentPatient.id}`).value;
    
    const generalCondition = {
      patient_id: this.currentPatient.id,
      height: parseFloat(document.getElementById(`height-${this.currentPatient.id}`).value) || null,
      weight: parseFloat(document.getElementById(`weight-${this.currentPatient.id}`).value) || null,
      bmi: parseFloat(document.getElementById(`bmi-${this.currentPatient.id}`).value) || null,
      diseases: JSON.stringify(diseases),
      medications: medicationStatus === 'yes' ? medicationList : '',
      pneumonia_history: document.getElementById(`pneumonia-history-${this.currentPatient.id}`).value,
      assessment_date: new Date().toISOString().split('T')[0]
    };

    try {
      await db.createGeneralCondition(generalCondition);
      alert('全身状態が保存されました');
    } catch (error) {
      console.error('全身状態保存エラー:', error);
      alert('保存に失敗しました');
    }
  }

  // 全身状態の読み込み（修正版）
  async loadGeneralConditions() {
    if (!this.currentPatient) {
      console.warn('currentPatient が設定されていません');
      return;
    }

    try {
      console.log('全身状態読み込み - 患者ID:', this.currentPatient.id);
      
      // 現在の患者の最新の全身状態データを取得
      const condition = await db.getLatestGeneralCondition(this.currentPatient.id);
      console.log('取得した全身状態データ:', condition);
      
      if (condition) {
        this.fillGeneralConditionsForm(condition);
      } else {
        console.log('全身状態データが見つかりませんでした');
        this.clearGeneralConditionsForm();
      }
    } catch (error) {
      console.error('全身状態読み込みエラー:', error);
    }
  }

  // 全身状態フォームのクリア（修正版）
  clearGeneralConditionsForm() {
    if (!this.currentPatient) return;
    
    // チェックボックスをクリア
    const checkboxes = document.querySelectorAll(`input[name="disease-${this.currentPatient.id}"]`);
    checkboxes.forEach(checkbox => {
      checkbox.checked = false;
    });
    
    // 選択肢をリセット
    const medicationStatus = document.getElementById(`medication-status-${this.currentPatient.id}`);
    if (medicationStatus) {
      medicationStatus.value = 'no';
      this.toggleMedicationDetails();
    }
    
    const pneumoniaHistory = document.getElementById(`pneumonia-history-${this.currentPatient.id}`);
    if (pneumoniaHistory) {
      pneumoniaHistory.value = 'no';
    }
    
    // 数値フィールドをクリア
    const numericFields = [`height-${this.currentPatient.id}`, `weight-${this.currentPatient.id}`, `bmi-${this.currentPatient.id}`];
    numericFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.value = '';
      }
    });
    
    // テキストエリアをクリア
    const medicationList = document.getElementById(`medication-list-${this.currentPatient.id}`);
    if (medicationList) {
      medicationList.value = '';
    }
  }

  // 全身状態フォームの入力（修正版）
  fillGeneralConditionsForm(condition) {
    if (!this.currentPatient) return;
    
    // まずフォームをクリア
    this.clearGeneralConditionsForm();
    
    // データがある場合のみ入力
    if (condition.height) {
      const heightElement = document.getElementById(`height-${this.currentPatient.id}`);
      if (heightElement) heightElement.value = condition.height;
    }
    
    if (condition.weight) {
      const weightElement = document.getElementById(`weight-${this.currentPatient.id}`);
      if (weightElement) weightElement.value = condition.weight;
    }
    
    if (condition.bmi) {
      const bmiElement = document.getElementById(`bmi-${this.currentPatient.id}`);
      if (bmiElement) bmiElement.value = condition.bmi;
    }
    
    if (condition.diseases) {
      try {
        const diseases = JSON.parse(condition.diseases);
        diseases.forEach(disease => {
          const checkbox = document.querySelector(`input[name="disease-${this.currentPatient.id}"][value="${disease}"]`);
          if (checkbox) checkbox.checked = true;
        });
      } catch (error) {
        console.error('疾患データの解析エラー:', error);
      }
    }
    
    if (condition.medications) {
      const medicationStatus = document.getElementById(`medication-status-${this.currentPatient.id}`);
      const medicationList = document.getElementById(`medication-list-${this.currentPatient.id}`);
      
      if (medicationStatus && medicationList) {
        medicationStatus.value = 'yes';
        medicationList.value = condition.medications;
        this.toggleMedicationDetails();
      }
    }
    
    if (condition.pneumonia_history) {
      const pneumoniaHistory = document.getElementById(`pneumonia-history-${this.currentPatient.id}`);
      if (pneumoniaHistory) pneumoniaHistory.value = condition.pneumonia_history;
    }
  }

  // モーダル関連
  showAddPatientModal() {
    document.getElementById('modal-title').textContent = '新規患者登録';
    document.getElementById('patient-form').reset();
    document.getElementById('edit-patient-id').value = '';
    document.getElementById('addPatientModal').style.display = 'block';
  }

  closeAddPatientModal() {
    document.getElementById('addPatientModal').style.display = 'none';
  }

  async editPatient(patientId) {
    try {
      const patient = await db.getPatient(patientId);
      if (patient) {
        this.fillPatientForm(patient);
        document.getElementById('modal-title').textContent = '患者情報編集';
        document.getElementById('addPatientModal').style.display = 'block';
      }
    } catch (error) {
      console.error('患者情報取得エラー:', error);
      alert('患者情報の取得に失敗しました');
    }
  }

  fillPatientForm(patient) {
    document.getElementById('edit-patient-id').value = patient.id;
    document.getElementById('modal-patient-name').value = patient.name;
    document.getElementById('modal-patient-id').value = patient.patient_id;
    document.getElementById('modal-patient-kana').value = patient.name_kana || '';
    document.getElementById('modal-birthdate').value = patient.birthdate || '';
    document.getElementById('modal-gender').value = patient.gender || '';
    document.getElementById('modal-phone').value = patient.phone || '';
    document.getElementById('modal-address').value = patient.address || '';
  }

  async deletePatient(patientId) {
    if (!confirm('本当にこの患者を削除しますか？関連するすべてのデータも削除されます。')) {
      return;
    }

    try {
      await db.deletePatient(patientId);
      alert('患者が削除されました');
      this.loadPatients();
      
      // 現在選択中の患者が削除された場合
      if (this.currentPatient && this.currentPatient.id === patientId) {
        this.clearAllPatientData();
      }
    } catch (error) {
      console.error('患者削除エラー:', error);
      alert('削除に失敗しました');
    }
  }

  // 患者フォーム送信処理
  async handlePatientFormSubmit(event) {
    event.preventDefault();
    
    const editId = document.getElementById('edit-patient-id').value;
    const patientData = {
      name: document.getElementById('modal-patient-name').value,
      patient_id: document.getElementById('modal-patient-id').value,
      name_kana: document.getElementById('modal-patient-kana').value,
      birthdate: document.getElementById('modal-birthdate').value,
      gender: document.getElementById('modal-gender').value,
      phone: document.getElementById('modal-phone').value,
      address: document.getElementById('modal-address').value
    };

    try {
      let updatedPatient;
      
      if (editId) {
        // 更新
        updatedPatient = await db.updatePatient(parseInt(editId), patientData);
        alert('患者情報が更新されました');
        
        // 現在選択中の患者が更新された場合
        if (this.currentPatient && this.currentPatient.id === parseInt(editId)) {
          this.currentPatient = updatedPatient;
          await this.loadPatientInfo();
        }
      } else {
        // 新規登録
        updatedPatient = await db.createPatient(patientData);
        alert('患者が登録されました');
      }
      
      this.closeAddPatientModal();
      await this.loadPatients();
      
    } catch (error) {
      console.error('患者保存エラー:', error);
      alert('保存に失敗しました: ' + error.message);
    }
  }

  // 履歴表示（管理計画書の履歴表示機能を追加）
  async loadPatientHistory() {
    if (!this.currentPatient) return;

    const content = document.getElementById('patient-history-content');

    try {
      const assessments = await db.getAssessments(this.currentPatient.id);
      const progressRecords = await db.getProgressRecords(this.currentPatient.id);
      const managementPlans = await db.getManagementPlans(this.currentPatient.id);

      this.displayPatientHistory(assessments, progressRecords, managementPlans);
    } catch (error) {
      console.error('履歴読み込みエラー:', error);
      content.innerHTML = '<p>履歴の読み込みに失敗しました。</p>';
    }
  }

  // 履歴表示（管理計画書セクションを追加）
  displayPatientHistory(assessments, progressRecords, managementPlans) {
    const content = document.getElementById('patient-history-content');

    let html = `
      <div class="summary-card">
        <h3>患者情報</h3>
        <p>患者名: ${this.currentPatient.name} (ID: ${this.currentPatient.patient_id})</p>
      </div>

      <div class="summary-card">
        <h3>検査履歴</h3>
    `;

    if (assessments.length === 0) {
      html += '<p>検査履歴がありません。</p>';
    } else {
      html += `
        <table>
          <thead>
            <tr>
              <th>検査日</th>
              <th>診断結果</th>
              <th>該当項目数</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
      `;

      assessments.forEach(assessment => {
        html += `
          <tr>
            <td>${new Date(assessment.assessment_date).toLocaleDateString()}</td>
            <td>
              <span class="status-badge ${assessment.diagnosis_result ? 'status-diagnosed' : 'status-normal'}">
                ${assessment.diagnosis_result ? '口腔機能低下症' : '正常'}
              </span>
            </td>
            <td>${assessment.affected_items_count}/7項目</td>
            <td>
              <button onclick="assessmentManager.viewAssessmentDetails(${assessment.id})" class="btn-secondary" style="padding: 5px 10px;">詳細</button>
            </td>
          </tr>
        `;
      });

      html += '</tbody></table>';
    }

    html += '</div>';

    // 【新規追加】管理計画書履歴セクション
    html += `
      <div class="summary-card">
        <h3>管理計画書履歴</h3>
    `;

    if (managementPlans.length === 0) {
      html += '<p>管理計画書がありません。</p>';
    } else {
      html += `
        <table>
          <thead>
            <tr>
              <th>作成日</th>
              <th>対象検査</th>
              <th>再評価予定</th>
              <th>管理項目</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
      `;

      managementPlans.forEach(plan => {
        // 管理項目のカウント
        const managementItems = [
          plan.hygiene_plan,
          plan.dryness_plan,
          plan.bite_plan,
          plan.lip_plan,
          plan.tongue_pressure_plan,
          plan.mastication_plan,
          plan.swallowing_plan
        ].filter(item => item !== null && item !== undefined).length;

        // 再評価予定日の計算
        const planDate = new Date(plan.plan_date);
        const reevaluationDate = new Date(planDate);
        reevaluationDate.setMonth(reevaluationDate.getMonth() + (plan.reevaluation_period || 6));

        html += `
          <tr>
            <td>${new Date(plan.plan_date).toLocaleDateString()}</td>
            <td>検査ID: ${plan.assessment_id || 'N/A'}</td>
            <td>${reevaluationDate.toLocaleDateString()}</td>
            <td>${managementItems}項目</td>
            <td>
              <button onclick="patientManager.viewManagementPlanDetails(${plan.id})" class="btn-secondary" style="padding: 5px 10px;">詳細</button>
            </td>
          </tr>
        `;
      });

      html += '</tbody></table>';
    }

    html += '</div>';

    html += `
      <div class="summary-card">
        <h3>管理指導記録</h3>
    `;

    if (progressRecords.length === 0) {
      html += '<p>管理指導記録がありません。</p>';
    } else {
      html += `
        <table>
          <thead>
            <tr>
              <th>記録日</th>
              <th>全体評価</th>
              <th>所見</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
      `;

      progressRecords.forEach(record => {
        const ratings = [
          record.nutrition_rating, record.hygiene_rating, record.dryness_rating,
          record.bite_rating, record.lip_rating, record.tongue_rating,
          record.mastication_rating, record.swallowing_rating
        ].filter(r => r !== null && r !== undefined);
        
        const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 'N/A';

        html += `
          <tr>
            <td>${new Date(record.record_date).toLocaleDateString()}</td>
            <td>平均: ${avgRating}</td>
            <td>${record.findings_oral ? '所見あり' : '所見なし'}</td>
            <td>
              <button onclick="managementManager.viewProgressRecord(${record.id})" class="btn-secondary" style="padding: 5px 10px;">詳細</button>
            </td>
          </tr>
        `;
      });

      html += '</tbody></table>';
    }

    html += '</div>';

    content.innerHTML = html;
  }

  // 【新規追加】管理計画書詳細表示
  async viewManagementPlanDetails(planId) {
    try {
      const managementPlans = await db.getManagementPlans(this.currentPatient.id);
      const plan = managementPlans.find(p => p.id === planId);
      
      if (plan) {
        this.displayManagementPlanDetails(plan);
      }
    } catch (error) {
      console.error('管理計画書詳細表示エラー:', error);
      alert('詳細の表示に失敗しました');
    }
  }

  // 【新規追加】管理計画書詳細の表示
  displayManagementPlanDetails(plan) {
    const content = document.getElementById('management-plan-content');
    
    if (!content) {
      console.error('management-plan-content 要素が見つかりません');
      return;
    }

    // 管理方針のテキスト変換
    const managementText = (value) => {
      switch(value) {
        case 1: return '問題なし';
        case 2: return '機能維持';
        case 3: return '機能向上';
        default: return '未設定';
      }
    };

    // 再評価予定日の計算
    const planDate = new Date(plan.plan_date);
    const reevaluationDate = new Date(planDate);
    reevaluationDate.setMonth(reevaluationDate.getMonth() + (plan.reevaluation_period || 6));

    content.innerHTML = `
      <div class="summary-card">
        <h3>管理計画書詳細</h3>
        <p>患者名: ${this.currentPatient.name}</p>
        <p>作成日: ${new Date(plan.plan_date).toLocaleDateString()}</p>
        <p>再評価予定: ${reevaluationDate.toLocaleDateString()} (${plan.reevaluation_period || 6}か月後)</p>
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
              <td>${managementText(plan.hygiene_plan)}</td>
            </tr>
            <tr>
              <td>② 口腔乾燥</td>
              <td>${managementText(plan.dryness_plan)}</td>
            </tr>
            <tr>
              <td>③ 咬合力低下</td>
              <td>${managementText(plan.bite_plan)}</td>
            </tr>
            <tr>
              <td>④ 舌口唇運動機能低下</td>
              <td>${managementText(plan.lip_plan)}</td>
            </tr>
            <tr>
              <td>⑤ 低舌圧</td>
              <td>${managementText(plan.tongue_pressure_plan)}</td>
            </tr>
            <tr>
              <td>⑥ 咀嚼機能低下</td>
              <td>${managementText(plan.mastication_plan)}</td>
            </tr>
            <tr>
              <td>⑦ 嚥下機能低下</td>
              <td>${managementText(plan.swallowing_plan)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="summary-card">
        <h3>管理目標・計画</h3>
        <div style="white-space: pre-wrap; background: #f9f9f9; padding: 15px; border-radius: 4px; border: 1px solid #ddd;">
${plan.goals || '記載なし'}
        </div>
      </div>

      <div style="margin-top: 30px;">
        <button onclick="patientManager.openPatientHistory()" class="btn-secondary">履歴に戻る</button>
        <button onclick="window.print()" class="btn-secondary">印刷</button>
        <button onclick="managementManager.loadProgressRecordForm()" class="btn-success">管理指導記録作成</button>
      </div>
    `;

    // 管理計画書タブに移動
    if (window.app) {
      app.openTab('management-plan');
    } else {
      this.directTabSwitch('management-plan');
    }
  }
}

// グローバルインスタンス（即座に初期化）
const patientManager = new PatientManager();

// ウィンドウオブジェクトに登録（他のファイルからアクセス可能にする）
window.patientManager = patientManager;

console.log('patients.js 読み込み完了');
