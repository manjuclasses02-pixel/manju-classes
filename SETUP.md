# Manju Classes ERP — Setup Guide

## 1. Firebase project banayein
1. https://console.firebase.google.com → **Add project** → naam dein (e.g. `manju-classes-erp`)
2. **Build → Authentication → Get Started → Sign-in method → Email/Password → Enable**
3. **Build → Firestore Database → Create database → Production mode**
4. **Project Settings (⚙️) → General → Your apps → </> (Web app)** → naam dein → config copy karein

## 2. Config file mein paste karein
`index.html` ke andar yeh block dhoondein aur apni values daalein:
```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```
Jab tak yahan `YOUR_API_KEY` likha hai, app **DEMO_MODE** mein chalega (koi backend nahi, sirf local data). Config daalte hi automatically **LIVE MODE** ho jayega.

## 3. Firestore Rules deploy karein
`firestore.rules` file ka pura content copy karke:
**Firebase Console → Firestore Database → Rules tab** → paste → **Publish**

## 4. Sirf 3 Admin users Firebase Console se manually banayein
Yeh EKLAUTI jagah hai jahan Firebase Console mein manually kaam karna hoga — sirf 3 baar, ek baar ke liye:
- **Super Admin (Owner)** — `branch: "all"` — dono branches dekh/manage kar sakta hai, Settings aur Branch Analytics bhi sirf isi ke paas
- **Branch 1 Admin** — `branch: "b1"` — sirf Branch 1 ka data dekh/manage kar sakta hai
- **Branch 2 Admin** — `branch: "b2"` — sirf Branch 2 ka data dekh/manage kar sakta hai (dusri branch bilkul access nahi — Firestore rules level pe block hai, sirf UI restriction nahi)

Steps (in 3 admins ke liye hi, teeno baar repeat karein):
1. **Authentication → Users → Add user** → email + password se account banayein (e.g. `owner@manjuclasses.in`, `branch1admin@manjuclasses.in`, `branch2admin@manjuclasses.in`)
2. Us user ka **UID copy** karein
3. **Firestore Database → Start collection → `users`** → Document ID = wahi UID → fields:
   - `name`: "Shivam Soni" (string)
   - `role`: "admin" (string)
   - `branch`: `"all"` (Super Admin) ya `"b1"` / `"b2"` (Branch Admin)

Login screen mein "Phone/User ID" field ab **email** ki tarah kaam karega (e.g. `owner@manjuclasses.in`), password wahi jo Authentication mein set kiya.

### Student ke saath Parent ka login bhi banega
Har student ke **View Student** modal mein ab **2 alag "Generate Login" buttons** hain:
- **🔑 Generate Student Login** — student khud login kar sake, apni fee/attendance/homework/tests dekh sake.
- **🔑 Generate Parent Login** — parent ka apna alag login (alag email/password), same permissions ke saath — bina student ka email/password share kiye.

Dono bilkul same tarike se kaam karte hain (app ke andar se hi, koi Firebase Console nahi), aur dono ko independently **push notifications** aur **fee receipt WhatsApp** milti hain (jab bhi Notice bheja jaye ya payment record ho).

### Student aur Teacher ke liye Firebase Console mein KUCH NAHI karna
In teeno admin ke bina ban jaane ke baad, **student aur teacher add karna aur unka login banana poora app ke andar se hi hota hai** — Firebase Console kabhi kholne ki zaroorat nahi:
1. App mein login karke **Students** ya **Teachers** page kholein → **"+ Add Student"** / **"+ Add Teacher"** se record banayein.
2. Us student/teacher ko kholkar **"🔑 Generate Login"** button dabayein — email + auto-password dikhega, chahe to edit kar sakte hain → **Create Login**.
3. App khud background mein Firebase Authentication account bana deta hai (bina admin ko logout kiye) aur `users/{uid}` document bhi khud set kar deta hai.
4. Jo email/password screen pe dikhega, wahi WhatsApp/SMS se student ya teacher ko bhej dein — password dobara app mein nahi dikhega, isliye turant note/share kar lein.

Yeh sab Firebase ke **free (Spark) plan** mein hi chal jaata hai — koi paid upgrade ya extra coding kabhi nahi chahiye.

Agar Firebase config abhi tak nahi bhara (Preview Mode), tab bhi login screen ka book-flip portal (Cover → Branch 1 → Branch 2 → Super Admin) dikhega — koi bhi role-tile choose karke kuch bhi ID/password daal ke seedha us role mein preview ke taur par login ho jaata hai, taaki Firebase connect karne se pehle bhi UI test kiya ja sake.

## 5. Netlify pe deploy karein
**Option A — Drag & drop (sabse aasan):**
1. https://app.netlify.com → login/signup
2. "Add new site" → "Deploy manually" → poora folder drag-drop karein — **`index.html`, `manifest.json`, `service-worker.js`, `icon.svg`, `firestore.rules` (yeh sirf reference ke liye, deploy nahi hoti) sab ek hi folder mein hone chahiye**
3. Netlify turant ek live URL de dega (e.g. `manju-erp.netlify.app`)

**Option B — Netlify CLI:**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

⚠️ **Zaroori:** Firebase Authentication mein **Settings → Authorized domains** ke andar apna Netlify domain (e.g. `manju-erp.netlify.app`) add karna hoga, warna login fail hoga.

## 5b. PWA — Mobile pe "Install App" jaisa kaam karega
- `manifest.json` + `service-worker.js` already app ke saath hain — jab HTTPS pe deploy (Netlify automatically HTTPS deta hai) hoga, phone ke browser mein **"Add to Home Screen" / "Install App"** option apne aap aayega.
- App ke andar **Settings → App Info → "📲 Install App"** button se bhi seedha install prompt aa sakta hai.
- Offline support: app shell (login, navigation) internet band hone par bhi khulega — lekin live data (Firebase) ke liye internet zaroori hai.

## 6. Firestore data model (Phase 1–3 tak)
| Collection     | Purpose                          | branch-isolated? |
|----------------|-----------------------------------|-------------------|
| `users`        | login role/branch mapping         | —                 |
| `students`     | student profiles                  | ✅                |
| `teachers`     | teacher profiles                  | ✅                |
| `enquiries`    | admissions pipeline               | staff-only        |
| `batches`      | class/batch definitions           | ✅                |
| `timetable`    | weekly schedule                   | ✅                |
| `attendance`   | daily attendance records          | ✅                |
| `homework`     | homework assignments              | ✅                |
| `material`     | study material                    | ✅                |

Aage ki phases (Fees/Payments, Expenses, Salary, Tests, Notifications, Activity Log) inhi collections ke pattern follow karenge — rules file mein already stub bana diya hai.

## 7. Branch Analytics (Super Admin only)
Sidebar mein **🏆 Branch Analytics** naam ka naya section hai, jo sirf Super Admin (`branch: "all"`) ko dikhta hai. Yeh dono branches ka side-by-side comparison dikhata hai:
- Revenue, Expenses, Salary Cost, Net Profit
- Students, Teachers, Attendance %, Fee Collection Rate, Avg Revenue/Student
- Kaunsi branch zyada profitable hai aur **kis wajah se** (zyada revenue, kam kharcha, behtar attendance/collection, etc.) — automatically calculate hoke top pe dikhaya jaata hai.

Yeh data live mode mein Firestore se (`payments`, `expenses`, `salaries`, `students`, `teachers`, `attendance` collections) aur demo mode mein local demo data se aata hai.

## 8. Digital Receipt + Shareable Link + WhatsApp (koi setup nahi chahiye — already ready hai)
Jaise hi owner **Fees & Payments → Record Payment** save karta hai:
1. Receipt turant screen par khul jaata hai.
2. Usi receipt ka ek **unique link** automatically ban jaata hai — receipt modal mein "Shareable Receipt Link" field mein dikhega, "📋 Copy" button se copy kar sakte hain.
3. **"📱 Send WhatsApp"** button dabate hi WhatsApp khulta hai, ek professional pre-filled message ke saath (Institute name, receipt no., amount, aur receipt ka link) — student ka WhatsApp number pehle se bhara hota hai, bas **Send** dabana hai.

Yeh link kaise kaam karta hai: poori receipt detail us link ke andar hi (encoded) hoti hai, isliye link kholte hi turant receipt dikh jaata hai — koi login, koi extra database read, koi cost nahi. Student us page se **Print / Save as PDF** bhi kar sakta hai.
⚠️ Chhoti si baat: chunki link mein hi data hota hai, agar future mein payment details edit ho jayein to purana bheja hua link update nahi hoga (naya receipt banayenge to naya link milega) — normal use case (fee collect karna) ke liye yeh koi dikkat nahi karta.

## 9. Push Notifications — Firebase Cloud Messaging + Netlify Function (free, Blaze plan nahi chahiye)
Iska poora kaam ho chuka hai code mein — bas neeche diye steps ek baar follow karne hain.

### 9a. Firebase Console mein VAPID key banayein
1. **Firebase Console → Project Settings (⚙️) → Cloud Messaging tab**
2. "Web configuration" section mein **"Generate key pair"** dabayein — ek key milegi (lambi string).
3. Yeh key **do jagah** paste karni hai:
   - `public/index.html` mein: `const FCM_VAPID_KEY = "YOUR_VAPID_KEY";` — yahan apni key daalein.
   - `public/firebase-messaging-sw.js` ke top pe jo `firebase.initializeApp({...})` block hai, usme apna **wahi firebaseConfig** bharein jo `index.html` mein bhara tha (dono jagah same values).

### 9b. Service Account key nikaalein (server ke liye)
1. **Firebase Console → Project Settings → Service Accounts tab → "Generate new private key"** — ek `.json` file download hogi.
2. Yeh file kholke poora content copy kar lein (pura JSON, `{` se `}` tak).

### 9c. Netlify pe deploy karein (ab drag-drop se nahi — GitHub se, kyunki function ke liye ek library install karni padti hai)
Ab project mein 3 nayi cheezein hain: `netlify.toml`, `package.json`, aur `netlify/functions/send-notification.js` — inhe kaam karne ke liye Netlify ko ek chhota "build" step chalana padta hai, isliye is baar deploy GitHub ke through karenge (bilkul free, coding nahi lagegi):
1. https://github.com par account banayein (agar nahi hai) → **New repository** → naam dein (e.g. `manju-classes-erp`) → **Create repository**.
2. Us repo ke page par **"uploading an existing file"** link dabayein → poora project folder (sab files/folders — `public`, `netlify`, `netlify.toml`, `package.json`, `firestore.rules`) drag-drop karke **Commit changes** dabayein.
3. https://app.netlify.com → **Add new site → Import an existing project → GitHub** → apna repo select karein → Deploy settings automatically `netlify.toml` se aa jayengi → **Deploy**.
4. Deploy hone se pehle ek zaroori step: **Site settings → Environment variables → Add a variable**:
   - Key: `FIREBASE_SERVICE_ACCOUNT`
   - Value: wahi poora JSON paste karein jo Service Account se download kiya tha (step 9b)
   - Save karke site ko **redeploy** karein (Deploys tab → Trigger deploy).
5. ⚠️ Firebase Authentication → Settings → Authorized domains mein yeh naya Netlify domain add karna na bhoolein (jaisa step 5 mein bataya gaya tha).

### 9d. Test kaise karein
1. App mein login karein (Live Mode mein) → browser "Allow Notifications" ka popup poochega → **Allow** karein. (Ya Settings → Notification Settings → "🔔 Enable Notifications" button se manually bhi kar sakte hain.)
2. Admin **Notifications** page se ek Notice banayein → us Notice card ke neeche **"🔔 Send Push Notification"** button dabayein.
3. Jin devices ne notification allow kiya hai, unke phone/browser par turant pop-up aa jayega — app band ho ya background mein ho, tab bhi.

**Cost:** Netlify Functions free tier mein 125,000 requests/month milte hain (itni ek chhoti coaching institute ke liye kaafi zyada hai), aur FCM khud bhi hamesha free hai. Firebase Blaze plan kahin bhi nahi lagta, kyunki hum Firebase Cloud Functions use nahi kar rahe — sending Netlify ke apne server se ho rahi hai.

## 10. Login Screen — Book-Flip Access Portal
Login page ab ek "book" ki tarah kaam karta hai — role-tabs ki jagah 4 pages hain jo flip hoke khulte hain:
1. **Cover** — "Manju Classes" branding
2. **Branch 1** — is branch ke Admin/Teacher/Student/Parent role-tiles
3. **Branch 2** — is branch ke Admin/Teacher/Student/Parent role-tiles
4. **Super Admin** — seedha Super Admin login

"◀ Back" / "Next ▶" buttons se pages flip hote hain (asli page-turn jaisi animation ke saath). Kisi bhi page pe role-tile dabate hi login form (email + password) niche khul jaata hai — baaki sab pehle jaisa hi kaam karta hai (Live Mode mein Firebase Auth se, Demo Mode mein seedha andar).

## 11. Student Profile Photo (private — sirf student, teacher, admin ko dikhti hai)
Har student ab apna profile photo khud laga sakta hai:
1. Student login karke **"My Profile"** (sidebar mein sabse upar) khole.
2. **"📷 Change Photo"** dabakar apni photo select kare — app usko automatically chhota/compress kar deta hai (upload se pehle hi browser mein) taaki storage ka size kam rahe.
3. Yeh photo save hoke ek **alag `studentPhotos` collection** mein jaati hai (students collection mein nahi), aur login karte hi ek baar mein load ho jaati hai (dobara-dobara fetch nahi karni padti). Ek chhota coaching institute Firestore ki free 50,000 reads/day limit ke aas-paas bhi kabhi nahi pahunchega, isliye simple "load at login" approach rakha gaya hai.
4. **Kaun dekh sakta hai:** sirf wahi student (khud), uske Teacher, aur Admin (apni branch ke) — koi doosra student ya Parent nahi. Yeh Firestore rules level pe enforce hai (`studentPhotos` collection ki rule dekhein), sirf UI restriction nahi.
5. Admin/Teacher `Students → [student par click]` karke bhi wahi photo dekh sakte hain (login karte hi apni branch ki saari photos ek saath load ho chuki hoti hain, isliye yahan turant dikhti hain).

⚠️ Agar aap "Student Login" pehle se generate kar chuke hain (Phase 4 se), unke liye ab dobara "Generate Student Login" karne ki zaroorat NAHI hai — sirf naye students ke liye login banate waqt photo feature automatically kaam karega (kyunki naya login create karte waqt studentId link ho jaata hai). Purane logins (jo is update se pehle bane the) ke liye login ek baar **Reset** kar dena — usse `studentId` link ho jaayega aur photo upload turant kaam karega.

## 12. Go-Live Testing Checklist (Firebase + Netlify deploy ke baad)
Ek baar aapne real Firebase project connect kar diya (firebaseConfig bhar diya, 3 admin accounts bana diye, Firestore rules publish kar diye) aur Netlify pe deploy kar diya — neeche diye order mein test karein. Har step ek chhoti cheez check karta hai, isliye order follow karna aasaan rahega.

### Step 1 — Basic access check
1. Apni Netlify URL browser mein kholein (e.g. `https://yoursite.netlify.app`).
2. Login screen "book" khulna chahiye — "Manju Classes" cover page dikhega. **"Next ▶"** dabakar Branch 1 → Branch 2 → Super Admin tak flip karke dekhein.
3. **Super Admin** tile dabakar apna email/password daalein jo Firebase Console mein banaya tha → Login karein.
4. Login hone ke baad top bar mein apna naam/role sahi dikhna chahiye, aur Settings mein tag **"🟢 Live Mode"** dikhna chahiye (agar "🟡 Preview Mode" dikhe, iska matlab firebaseConfig sahi se bhara nahi hai — SETUP.md Section 1-3 dobara check karein).

### Step 2 — Branch isolation check
1. Logout karke **Branch 1 Admin** se login karein.
2. Students/Fees/Teachers page kholein — sirf Branch 1 ka data dikhna chahiye, Branch 2 ka kuch bhi nahi.
3. Isi tarah **Branch 2 Admin** se login karke verify karein — sirf Branch 2 ka data dikhe.
4. Yeh sabse zaroori security check hai — agar galti se doosri branch ka data dikh raha ho, turant firestore.rules dobara publish karein (Firebase Console → Firestore Database → Rules tab → poora `firestore.rules` file ka content paste karke Publish).

### Step 3 — Student/Teacher/Parent login banana
1. Super Admin ya Branch Admin se ek naya **Student add** karein (Students → + Add Student).
2. Us student ko kholkar **"Generate Student Login"** aur **"Generate Parent Login"** dono try karein — dono ek email/password dikhayenge, note kar lein.
3. Logout karke us student ke email/password se login karein — sirf apna data (My Profile, apni fee, apna attendance) dikhna chahiye.
4. Isi tarah parent ke login se bhi try karein.
5. Ek **Teacher add** karke uska bhi login generate/test karein.

### Step 4 — Fee Receipt + WhatsApp
1. Admin se **Fees & Payments → Record Payment** karein.
2. Receipt screen pe khulna chahiye, usme **"Shareable Receipt Link"** dikhna chahiye.
3. **"📋 Copy"** dabakar link kisi doosre browser tab (ya apne phone) mein khol kar dekhein — receipt turant khulni chahiye, bina login ke.
4. **"📱 Send WhatsApp"** dabayein — WhatsApp khulna chahiye, message pre-filled ho, receipt link uske andar ho.

### Step 5 — Push Notifications
1. Jis bhi device/browser se test kar rahe hain, us par login karke **Settings → Notification Settings → "🔔 Enable Notifications"** dabayein → browser ka "Allow" popup aayega, **Allow** karein.
2. Admin se **Notifications → + Send Notice** se ek test notice banayein.
3. Us notice ke neeche **"🔔 Send Push Notification"** dabayein.
4. Us device par notification pop-up aana chahiye — ek baar app band karke (ya doosre tab pe jaake) bhi try karein, tab bhi aana chahiye.
5. Agar notification nahi aaye: SETUP.md Section 9 dobara check karein — VAPID key, Service Account env variable, aur "Authorized domains" mein Netlify domain add hai ya nahi.

### Step 6 — Branch Analytics (Super Admin only)
1. Super Admin se login karke **🏆 Branch Analytics** kholein.
2. Dono branches ka comparison aur "zyada profitable" reasoning dikhna chahiye.
3. Branch Admin se login karke verify karein ki yeh option unhe bilkul nahi dikhta.

### Step 7 — Profile Photo privacy check
1. Student login se photo upload karein (My Profile → Change Photo).
2. Admin/Teacher se us student ka detail kholkar verify karein ki photo dikh rahi hai.
3. Ek doosre student ke login se verify karein ki unhe pehle student ki photo kahin nahi dikhti.

### Step 8 — Install as an app (PWA)
1. Phone ke Chrome mein Netlify URL kholein → menu (⋮) → **"Add to Home Screen"** ya **"Install App"**.
2. Home screen se icon dabakar kholein — ek normal app jaisa full-screen khulna chahiye, browser address bar nahi dikhni chahiye.

### Step 9 — Cost/usage sanity check
1. Firebase Console → **Usage and billing** tab kholein.
2. Reads/writes/deletes ka count dekhein — ek chhote institute ke roz-marra use mein yeh free (Spark) plan ki limit (50,000 reads/day) se bahut kam rahega.
3. Netlify Dashboard → **Functions** tab mein bhi invocations count dekh sakte hain (free tier: 125,000/month).

Sab steps pass ho jaayein to app production-ready hai — asli students/teachers/parents ko login credentials generate karke share kar sakte hain.

## 13. Recent Fixes & Additions (this update)
1. **Refresh (F5) logout bug fixed** — session ab properly persist hoti hai. Login karne ke baad page refresh karne se ab dobara login screen pe nahi jayenge.
2. **Native browser popups hata diye** — saare "site says..." alert/confirm boxes ki jagah ab ek clean in-app toast (top-right notification) aur custom confirm dialog use hote hain.
3. **Missing Edit buttons fix kiye** — Students, Teachers, Batches, Payments mein pehle sirf "Add" tha, "Edit" tha hi nahi. Ab sabme Edit hai.
4. **Delete button har jagah add kiya** — Students, Teachers, Batches, Homework, Study Material, Payments, Expenses, Salaries, Tests, Timetable slots, Notifications, Enquiries — sabko delete kar sakte hain ab (confirmation ke saath, accidental delete se bachne ke liye).
5. **Dummy/sample data poori tarah hata di** — app ab khaali start hota hai, jab tak aap khud data add na karein. Dashboard bhi ab real data se calculate hota hai (Total Students, Active Teachers, Pending Fees, Today's Attendance).
6. **Push notification permission bug fix** — pehle "Enable Notifications" button sirf Admin ko Settings mein dikhta tha, Teacher/Student/Parent ke paas koi tarika hi nahi tha. Ab top bar mein ek **🔔 bell icon sabko** dikhta hai — usse koi bhi role notifications on/off kar sakta hai. Bell hara ho jaata hai jab enabled ho.
7. Login page ka wording aur baaki bacha hua Hinglish text clean kiya.

⚠️ **Deploy karne ke baad**: agar aapke paas pehle se koi test/demo data Firestore mein bhara hua tha, wo waisa hi rahega (yeh update sirf app ke code se hardcoded dummy data hata hai, aapke Firestore database ko touch nahi karta). Agar aap Firestore se bhi purana test data hatana chahte hain, Firebase Console → Firestore Database mein jaake manually delete kar sakte hain, ya ab app ke andar se hi har record ke "🗑️ Delete" button se ek-ek karke hata sakte hain.

## 14. App se Delete karne par Firestore se bhi turant delete hota hai
Har "🗑️ Delete" button (Students, Teachers, Batches, Payments, Homework, Material, Expenses, Salaries, Tests, Timetable, Notifications, Enquiries — sabme) ab is order mein kaam karta hai:
1. Pehle Firestore se delete try hota hai
2. Wahi successful ho, tabhi screen se hataya jaata hai
3. Agar Firestore delete fail ho (jaise internet chala jaye), ek red toast dikhega aur item screen pe hi rahega — accidental "delete dikha lekin data wapas aa gaya" wali confusion ab nahi hogi

## 15. Real Logo + Icons
Aapka bheja hua Manju Classes logo ab poori app mein use ho raha hai:
- Login screen ka gol badge, sidebar/topbar ka chhota icon
- PWA install icon (home screen pe yahi logo dikhega)
- Naye icon files: `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` (Android ke liye), `apple-touch-icon.png` (iPhone ke liye), `favicon.png`
- Purani generic "MC" text-badge aur SVG icon hata di gayi

## 16. PWA Install Fix — ⚠️ Zaroori: sirf deployed URL pe kaam karega
Pehle icon SVG format mein tha jo Apple/iOS aur kai Android checks mein properly kaam nahi karta — ab standard PNG sizes use ho rahi hain, jo installability requirements poori karti hain.
**Lekin sabse zaroori baat**: PWA install (aur push notifications, dono) sirf **HTTPS pe deployed site** (jaise `https://yoursite.netlify.app`) par kaam karte hain — agar aap file ko seedha double-click karke browser mein khol rahe hain (`file:///C:/Users/.../index.html` jaisa URL address bar mein dikhega), to browser install feature ko jaan-boojhkar disable rakhta hai (yeh security requirement hai, humara bug nahi). Install test karne ke liye hamesha Netlify wali asli URL use karein.

## 17. Dashboard ab role ke hisaab se alag hai
Pehle Admin, Teacher, aur Student — sabko EK JAISA dashboard dikhta tha, jisme institute ka poora financial data (Today's Collection, Total Revenue, etc.) sabko dikh jaata tha. Ab teen alag dashboards hain:
- **Admin**: poora institute-wide data — students, teachers, pending fees, collections, revenue, net income
- **Teacher**: sirf apni assigned batches, apne students, aaj ki attendance, apna homework/tests count — koi financial data nahi
- **Student/Parent**: sirf apna khud ka fee due, apni attendance %, apna homework/tests — kisi aur ka ya institute ka data bilkul nahi

Isi tarah **Fees section** bhi ab role-aware hai: Student/Parent ko sirf apni khud ki payment history dikhti hai (poori branch ka ledger nahi), aur unhe "Record Payment"/"Edit"/"Delete" jaisे admin-only buttons bhi nahi dikhte.

## 18. Student/Parent Login — ab Phone Number se (Email nahi)
Student aur Parent ka login ab **phone number** se hota hai, email se nahi (Teacher/Admin waise hi email se rehta hai, unke liye nahi badla).
- Admin jab "Generate Login" dabata hai, ab email ki jagah **phone number** poochega — wahi unki Login ID banegi.
- **Ek hi phone number se 2-4 students ka login** ban sakta hai (siblings ke liye) — jab wo login karenge, agar ek se zyada account milein, ek chhota sa "Kaun login kar raha hai?" wala popup dikhega jisme naam se select karna hoga.
- Login banate hi **WhatsApp automatically khul jaata hai** ek Welcome message ke saath — jisme Login ID (phone), Password, Student ka naam/ID/class/batch/branch, aur ek shareable "Welcome" link hota hai jo student/parent kabhi bhi dobara khol sakta hai apne details dekhne ke liye.
- Password random generate hota hai, lekin chahe to Generate Login screen pe khud bhi type kar sakte hain.

⚠️ Naya `phoneDirectory` collection add hui hai (firestore.rules mein already shamil hai) — yeh sirf naam+role+internal-login-handle store karta hai (kabhi password nahi), aur login screen ko yeh dhoondhne mein madad karta hai ki ek phone number se kaun se accounts bane hain — login se PEHLE hi yeh check karna padta hai, isliye yeh collection bina sign-in ke bhi read ho sakti hai (lekin likhna sirf Admin kar sakta hai).

## 19. Fee Due — ab Cumulative aur Automatic
- Student add karte waqt ab **Monthly Fee** bhi ek saath set hoti hai.
- Partial payment ka hisaab sahi rehta hai: fee ₹500 hai, ₹400 pay kiya, to ₹100 due reh jaata hai.
- **Har naye mahine automatically** us mahine ki fee purane due mein add ho jaati hai (₹100 purana + ₹500 naya mahina = ₹600 total due) — yeh Admin ke login karte hi background mein check hota hai, kisi extra button ki zaroorat nahi.
- Dashboard mein ab "Recent Activity" ki jagah **"⏳ Due in Next 3 Days"** aur **"🔴 Already Overdue"** do alag sections hain, jo har student ke "Fee Due Day" (admission date se set hota hai, Edit Student se badal bhi sakte hain) ke hisaab se calculate hote hain.
- Receipt (in-app, print, aur WhatsApp link — teeno) mein ab "Remaining Due" bhi dikhta hai.

## 20. File Upload — Homework aur Study Material
Ab dono jagah **real file upload** hai (pehle sirf "type" dropdown tha, koi actual file select nahi hoti thi):
- Photo automatically compress ho jaati hai (chhoti size, kam storage)
- PDF seedha upload hoti hai, lekin ek size limit hai (~900KB) — Firestore documents 1MB se zyada nahi ho sakte, isliye bahut badi PDF/photo allow nahi hogi (error message dikhega agar file badi ho)
- Study Material mein "Video Link" type select karne par file ki jagah ek URL field aa jaata hai (YouTube/Drive link ke liye)

## 21. Is Round Ke Bug Fixes (line-by-line audit)
1. **Bada Payment bug** — payment save hote waqt date galat format mein save ho rahi thi ("8 Sep" jaisi), jabki Dashboard "2026-09-08" format se match karta tha — isliye **"Today's Collection" hamesha ₹0 dikhta tha**, chahe kitni bhi payment record ho. Ab date sahi format mein save hoti hai, display ke liye alag se friendly format mein dikhayi jaati hai (jaise "8 Sep 2026"). Purane records jo galat format mein save ho chuke hain, unke liye display mein koi dikkat nahi aayegi (bas unki Dashboard-count thodi der se update hogi jab tak naya payment record na ho).
2. **Notifications** mein bacha hua Hinglish text (Netlify function ke error/note messages, jo seedha app mein dikhte hain) English mein kiya.
3. Notification broadcast ka ek warning-type message galti se "error" (laal) rang mein dikhta tha, jabki actually WhatsApp successfully khul chuka hota tha — ab sahi "info" type mein hai.
4. Do jagah SETUP.md ka galat section-number reference tha ("Phase 2" ki jagah "Section 9" hona chahiye tha) — fix kiya.
5. Settings mein "Version: Phase 1–7 build" jaisa confusing internal label tha — ab simple "1.0" hai.
6. **Absent-alert WhatsApp feature verify kiya** — yeh pehle se bana hua tha (Attendance save karne par automatically absentees ki list + "📱 Alert" button dikhta hai), lekin `saveAttendance()` crash hone ki wajah se pehle kabhi chalta hi nahi tha. Ab crash fix ho chuka hai, isliye yeh feature turant kaam karega.
