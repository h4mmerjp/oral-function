// Firebase設定とSDK初期化
// 既存のローカルデータベースは温存し、Firebase機能を段階的に追加

// Firebase SDKをCDNから読み込み（index.htmlに追加する必要があります）
// <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>

class FirebaseManager {
  constructor() {
    this.app = null;
    this.auth = null;
    this.firestore = null;
    this.currentUser = null;
    this.isInitialized = false;
    
    console.log('FirebaseManager 初期化開始');
  }

  // Firebase初期化
  async initialize() {
    try {
      // Firebase設定（画面から取得した情報を使用）
      const firebaseConfig = {
        apiKey: "AIzaSyCo_020s7GZp1VkGq6_sK6VqDjI3tHE8k",
        authDomain: "oral-health-diagnosis-ap-b3592.firebaseapp.com",
        projectId: "oral-health-diagnosis-ap-b3592",
        storageBucket: "oral-health-diagnosis-ap-b3592.firebasestorage.app",
        messagingSenderId: "33807354146z",
        appId: "1:33807354146z:web:f481281cfd471b6e77947"
      };

      // Firebase初期化
      if (!firebase.apps.length) {
        this.app = firebase.initializeApp(firebaseConfig);
        console.log('Firebase アプリ初期化完了');
      } else {
        this.app = firebase.app();
      }

      // サービス初期化
      this.auth = firebase.auth();
      this.firestore = firebase.firestore();
      
      // 認証状態の監視
      this.setupAuthListener();
      
      this.isInitialized = true;
      console.log('Firebase 初期化完了');
      
      return true;
    } catch (error) {
      console.error('Firebase 初期化エラー:', error);
      // エラーが発生してもアプリは継続動作（ローカルデータベースを使用）
      return false;
    }
  }

  // 認証状態監視
  setupAuthListener() {
    this.auth.onAuthStateChanged((user) => {
      console.log('認証状態変更:', user ? `ログイン: ${user.email}` : 'ログアウト');
      this.currentUser = user;
      
      if (user) {
        this.onUserLogin(user);
      } else {
        this.onUserLogout();
      }
    });
  }

  // ユーザーログイン時の処理
  async onUserLogin(user) {
    try {
      // ユーザー情報をFirestoreに保存/更新
      await this.ensureUserDocument(user);
      
      // UI更新
      this.updateAuthUI(true, user);
      
      // 既存のローカルデータとの同期（将来実装）
      // await this.syncLocalDataToCloud();
      
    } catch (error) {
      console.error('ログイン処理エラー:', error);
    }
  }

  // ユーザーログアウト時の処理
  onUserLogout() {
    // UI更新
    this.updateAuthUI(false, null);
    
    // ローカルデータベースに切り替え（既存の動作を維持）
    console.log('ローカルデータベースモードに切り替え');
  }

  // ユーザードキュメントの作成/確認
  async ensureUserDocument(user) {
    try {
      const userRef = this.firestore.collection('users').doc(user.uid);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        // 新規ユーザーの場合、基本情報を作成
        const userData = {
          email: user.email,
          name: user.displayName || user.email.split('@')[0],
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          subscription: {
            plan: 'free',
            startDate: firebase.firestore.FieldValue.serverTimestamp(),
            endDate: null,
            patientLimit: 5
          },
          usage: {
            patientCount: 0,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
          }
        };
        
        await userRef.set(userData);
        console.log('新規ユーザー作成:', user.email);
      } else {
        console.log('既存ユーザー:', user.email);
      }
    } catch (error) {
      console.error('ユーザードキュメント作成エラー:', error);
    }
  }

  // Google認証でログイン
  async signInWithGoogle() {
    try {
      if (!this.isInitialized) {
        throw new Error('Firebase が初期化されていません');
      }

      const provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await this.auth.signInWithPopup(provider);
      console.log('Google認証成功:', result.user.email);
      
      return result.user;
    } catch (error) {
      console.error('Google認証エラー:', error);
      
      // エラーメッセージの日本語化
      let errorMessage = 'ログインに失敗しました';
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'ログインがキャンセルされました';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'ネットワークエラーが発生しました';
      }
      
      throw new Error(errorMessage);
    }
  }

  // ログアウト
  async signOut() {
    try {
      await this.auth.signOut();
      console.log('ログアウト完了');
    } catch (error) {
      console.error('ログアウトエラー:', error);
      throw error;
    }
  }

  // 認証UI更新
  updateAuthUI(isLoggedIn, user) {
    // ヘッダーに認証状態を表示
    let authContainer = document.getElementById('auth-container');
    
    if (!authContainer) {
      // 認証コンテナが存在しない場合は作成
      authContainer = document.createElement('div');
      authContainer.id = 'auth-container';
      authContainer.style.cssText = `
        position: absolute;
        top: 10px;
        right: 20px;
        background: white;
        padding: 10px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 1000;
      `;
      
      const header = document.querySelector('header');
      if (header) {
        header.style.position = 'relative';
        header.appendChild(authContainer);
      }
    }
    
    if (isLoggedIn && user) {
      authContainer.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="${user.photoURL || ''}" alt="プロフィール" style="width: 32px; height: 32px; border-radius: 50%;" onerror="this.style.display='none'">
          <div>
            <div style="font-size: 14px; font-weight: bold;">${user.displayName || user.email}</div>
            <div style="font-size: 12px; color: #666;">無料プラン (5人まで)</div>
          </div>
          <button onclick="firebaseManager.signOut()" class="btn-secondary" style="padding: 5px 10px; font-size: 12px;">ログアウト</button>
        </div>
      `;
    } else {
      authContainer.innerHTML = `
        <div style="text-align: center;">
          <div style="font-size: 14px; margin-bottom: 8px;">ローカルモード</div>
          <button onclick="firebaseManager.signInWithGoogle()" class="btn-success" style="padding: 8px 16px; font-size: 12px;">Googleでログイン</button>
        </div>
      `;
    }
  }

  // 患者数制限チェック
  async checkPatientLimit() {
    try {
      if (!this.currentUser) {
        // ログインしていない場合はローカル制限なし
        return { allowed: true, isLocal: true };
      }

      const userRef = this.firestore.collection('users').doc(this.currentUser.uid);
      const userDoc = await userRef.get();
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        const subscription = userData.subscription || {};
        const usage = userData.usage || {};
        
        const limit = subscription.patientLimit || 5;
        const current = usage.patientCount || 0;
        
        return {
          allowed: current < limit,
          current: current,
          limit: limit,
          plan: subscription.plan || 'free',
          isLocal: false
        };
      }
      
      return { allowed: true, isLocal: true };
    } catch (error) {
      console.error('患者数制限チェックエラー:', error);
      // エラー時はローカルモードとして動作
      return { allowed: true, isLocal: true };
    }
  }

  // 使用量更新
  async updatePatientCount(count) {
    try {
      if (!this.currentUser) return;
      
      const userRef = this.firestore.collection('users').doc(this.currentUser.uid);
      await userRef.update({
        'usage.patientCount': count,
        'usage.lastUpdated': firebase.firestore.FieldValue.serverTimestamp()
      });
      
    } catch (error) {
      console.error('使用量更新エラー:', error);
    }
  }

  // Firebase利用可能かチェック
  isAvailable() {
    return this.isInitialized && window.firebase;
  }

  // 現在のユーザー情報取得
  getCurrentUser() {
    return this.currentUser;
  }
}

// グローバルインスタンス
const firebaseManager = new FirebaseManager();

// ウィンドウオブジェクトに登録
window.firebaseManager = firebaseManager;

console.log('firebase-config.js 読み込み完了');
