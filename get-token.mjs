import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// Firebase設定
const firebaseConfig = {
  apiKey: "AIzaSyC4k3LPJVrPWc80lzEPmUXrRfLrHMW7EdA",
  authDomain: "grumble-test.firebaseapp.com",
  projectId: "grumble-test",
  storageBucket: "grumble-test.firebasestorage.app",
  messagingSenderId: "133984607999",
  appId: "1:133984607999:web:7442eec6f5152d809536ca",
};

// Firebaseアプリの初期化
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const email = "sarayuuki12300513@gmail.com";
const password = "0513Yuuki";

async function getToken() {
  try {
    console.log("ログイン中...");
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log("ログイン成功!");
    console.log("ユーザーID:", user.uid);
    console.log("メールアドレス:", user.email);

    // IDトークンを取得
    const token = await user.getIdToken();
    console.log("\n=== Firebase ID Token ===");
    console.log(token);
    console.log("========================\n");

    process.exit(0);
  } catch (error) {
    console.error("エラーが発生しました:", error.message);
    process.exit(1);
  }
}

getToken();
