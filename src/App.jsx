import { useState, useEffect, useCallback, createContext, useContext, useMemo } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, ResponsiveContainer } from "recharts";
// Import bộ icon hiện đại từ lucide-react
import { 
  LayoutDashboard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Target, 
  BarChart3, 
  Sparkles, 
  Wallet, 
  LogOut, 
  Plus, 
  Trash2, 
  TrendingUp, 
  Calendar,
  DollarSign
} from "lucide-react";

// ─── THEME ──────────────────────────────────────────────────────────────────
const COLORS = {
  mint: "#4ECFB0",
  mintDim: "#2BA88C",
  purple: "#A78BFA",
  purpleDim: "#7C5FD6",
  bg: "#0D0F14",
  surface: "#161922",
  card: "#1E2330",
  border: "#2A3040",
  text: "#F0F4FF",
  muted: "#8A95B0",
  danger: "#F87171",
  warning: "#FBBF24",
  success: "#34D399",
};

const PIE_COLORS = ["#4ECFB0","#A78BFA","#F87171","#FBBF24","#60A5FA","#F472B6","#34D399","#FB923C"];

// ─── DEMO DATA ───────────────────────────────────────────────────────────────
const DEMO_INCOMES = [
  { id:"i1", amount:3000000, category:"ba_me_gui", note:"Tháng 5", date:"2025-05-01" },
  { id:"i2", amount:1200000, category:"part_time", note:"Phục vụ quán", date:"2025-05-10" },
  { id:"i3", amount:500000, category:"freelance", note:"Thiết kế logo", date:"2025-05-14" },
];
const DEMO_EXPENSES = [
  { id:"e1", amount:45000, category:"an_uong", note:"Cơm tấm bì", date:"2025-05-01" },
  { id:"e2", amount:35000, category:"cafe", note:"Phúc Long", date:"2025-05-02" },
  { id:"e3", amount:55000, category:"tra_sua", note:"Gong Cha", date:"2025-05-03" },
  { id:"e4", amount:600000, category:"tien_phong", note:"Tiền nhà tháng 5", date:"2025-05-01" },
  { id:"e5", amount:120000, category:"xang", note:"Đổ xăng xe", date:"2025-05-05" },
  { id:"e6", amount:85000, category:"an_uong", note:"Bún bò + trà đá", date:"2025-05-06" },
  { id:"e7", amount:299000, category:"shopping", note:"Áo vintage Shopee", date:"2025-05-07" },
  { id:"e8", amount:45000, category:"tra_sua", note:"Tocotoco vừa đường", date:"2025-05-08" },
  { id:"e9", amount:150000, category:"giai_tri", note:"Xem phim + bắp rang", date:"2025-05-09" },
  { id:"e10", amount:65000, category:"an_uong", note:"Bánh mì + nước", date:"2025-05-10" },
  { id:"e11", amount:180000, category:"hoc_tap", note:"In tài liệu + sách", date:"2025-05-11" },
  { id:"e12", amount:35000, category:"cafe", note:"Highlands", date:"2025-05-12" },
  { id:"e13", amount:55000, category:"tra_sua", note:"Tiger Sugar", date:"2025-05-13" },
  { id:"e14", amount:200000, category:"shopping", note:"Tai nghe dây", date:"2025-05-14" },
];
const DEMO_BUDGETS = {
  tra_sua: 500000, cafe: 400000, an_uong: 1500000,
  shopping: 500000, giai_tri: 300000, xang: 200000,
};
const DEMO_GOALS = [
  { id:"g1", name:"Laptop Gaming", target:15000000, saved:4500000, icon:"💻", color:"#4ECFB0" },
  { id:"g2", name:"Du lịch Đà Lạt", target:3000000, saved:800000, icon:"✈️", color:"#A78BFA" },
  { id:"g3", name:"Tai nghe AirPods", target:4500000, saved:4500000, icon:"🎧", color:"#F87171" },
];

// ─── CATEGORIES ──────────────────────────────────────────────────────────────
const INCOME_CATS = {
  ba_me_gui:  { label:"Ba mẹ gửi", icon:"💰" },
  part_time:  { label:"Part-time", icon:"💼" },
  hoc_bong:   { label:"Học bổng", icon:"🏆" },
  freelance:  { label:"Freelance", icon:"💻" },
  khac:       { label:"Khác", icon:"📦" },
};
const EXPENSE_CATS = {
  an_uong:    { label:"Ăn uống", icon:"🍜" },
  cafe:       { label:"Cafe", icon:"☕" },
  tra_sua:    { label:"Trà sữa", icon:"🧋" },
  xang:       { label:"Xăng xe", icon:"⛽" },
  shopping:   { label:"Shopping", icon:"🛍️" },
  giai_tri:   { label:"Giải trí", icon:"🎮" },
  hoc_tap:    { label:"Học tập", icon:"📚" },
  tien_phong: { label:"Tiền phòng", icon:"🏠" },
  khac:       { label:"Khác", icon:"📦" },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat("vi-VN").format(Math.round(n)) + "đ";
const now = new Date("2025-05-19");
const daysLeft = () => {
  const end = new Date(now.getFullYear(), now.getMonth()+1, 0);
  return end.getDate() - now.getDate();
};
const thisMonth = (arr) => arr.filter(x => x.date?.startsWith("2025-05"));
const ls = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
const ls_set = (k, v) => localStorage.setItem(k, JSON.stringify(v));

// ─── CONTEXT ─────────────────────────────────────────────────────────────────
const AppCtx = createContext(null);
const useApp = () => useContext(AppCtx);

function AppProvider({ children }) {
  const [user, setUser] = useState(() => ls("vsv_user") || { name: "Minh", email: "minh@student.edu.vn", avatar: "MI" });
  const [incomes, setIncomes] = useState(() => ls("vsv_incomes") || DEMO_INCOMES);
  const [expenses, setExpenses] = useState(() => ls("vsv_expenses") || DEMO_EXPENSES);
  const [budgets, setBudgets] = useState(() => ls("vsv_budgets") || DEMO_BUDGETS);
  const [goals, setGoals] = useState(() => ls("vsv_goals") || DEMO_GOALS);
  const [page, setPage] = useState("dashboard");

  useEffect(() => { ls_set("vsv_user", user); }, [user]);
  useEffect(() => { ls_set("vsv_incomes", incomes); }, [incomes]);
  useEffect(() => { ls_set("vsv_expenses", expenses); }, [expenses]);
  useEffect(() => { ls_set("vsv_budgets", budgets); }, [budgets]);
  useEffect(() => { ls_set("vsv_goals", goals); }, [goals]);

  const totalIncome = useMemo(() => thisMonth(incomes).reduce((s,x)=>s+x.amount,0), [incomes]);
  const totalExpense = useMemo(() => thisMonth(expenses).reduce((s,x)=>s+x.amount,0), [expenses]);
  const balance = totalIncome - totalExpense;
  const perDay = daysLeft() > 0 ? balance / daysLeft() : balance;

  const login = useCallback((name, email) => {
    const u = { name, email, avatar: name.slice(0,2).toUpperCase() };
    setUser(u); setPage("dashboard");
  }, []);
  const logout = useCallback(() => { setUser(null); setPage("landing"); }, []);

  const addIncome = useCallback((item) => {
    setIncomes(p => [...p, { ...item, id: "i"+Date.now() }]);
  }, []);
  const deleteIncome = useCallback((id) => setIncomes(p => p.filter(x=>x.id!==id)), []);
  const addExpense = useCallback((item) => {
    setExpenses(p => [...p, { ...item, id: "e"+Date.now() }]);
  }, []);
  const deleteExpense = useCallback((id) => setExpenses(p => p.filter(x=>x.id!==id)), []);
  const updateBudget = useCallback((cat, val) => setBudgets(p => ({...p, [cat]: val})), []);
  const addGoal = useCallback((g) => setGoals(p => [...p, { ...g, id:"g"+Date.now() }]), []);
  const updateGoalSaved = useCallback((id, amt) => {
    setGoals(p => p.map(g => g.id===id ? {...g, saved: Math.min(g.saved+amt, g.target)} : g));
  }, []);
  const deleteGoal = useCallback((id) => setGoals(p => p.filter(g=>g.id!==id)), []);

  return (
    <AppCtx.Provider value={{
      user, page, setPage, login, logout,
      incomes, expenses, budgets, goals,
      totalIncome, totalExpense, balance, perDay,
      addIncome, deleteIncome, addExpense, deleteExpense,
      updateBudget, addGoal, updateGoalSaved, deleteGoal,
    }}>
      {children}
    </AppCtx.Provider>
  );
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────
function Avatar({ name, size=36 }) {
  return (
    <div style={{
      width:size, height:size, borderRadius:"50%",
      background:`linear-gradient(135deg, ${COLORS.mint}, ${COLORS.purple})`,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:size*0.38, fontWeight:700, color:"#fff", flexShrink:0,
    }}>{name?.slice(0,2).toUpperCase()}</div>
  );
}

function Card({ children, style={}, glow=false }) {
  return (
    <div style={{
      background: COLORS.card,
      border: `1px solid ${COLORS.border}`,
      borderRadius:16,
      padding:"20px 22px",
      boxShadow: glow ? `0 0 32px ${COLORS.mint}18` : "none",
      ...style,
    }}>{children}</div>
  );
}

function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom:14 }}>
      {label && <div style={{fontSize:12, color:COLORS.muted, marginBottom:6, fontWeight:600}}>{label}</div>}
      <input {...props} style={{
        width:"100%", background:COLORS.surface, border:`1px solid ${COLORS.border}`,
        borderRadius:10, padding:"10px 14px", color:COLORS.text, fontSize:14,
        outline:"none", boxSizing:"border-box", ...props.style,
      }} />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div style={{ marginBottom:14 }}>
      {label && <div style={{fontSize:12, color:COLORS.muted, marginBottom:6, fontWeight:600}}>{label}</div>}
      <select {...props} style={{
        width:"100%", background:COLORS.surface, border:`1px solid ${COLORS.border}`,
        borderRadius:10, padding:"10px 14px", color:COLORS.text, fontSize:14,
        outline:"none", boxSizing:"border-box", ...props.style,
      }}>{children}</select>
    </div>
  );
}

function Btn({ children, variant="primary", onClick, style={} }) {
  const bg = variant==="primary" ? `linear-gradient(135deg, ${COLORS.mint}, ${COLORS.mintDim})`
           : variant==="purple" ? `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.purpleDim})`
           : variant==="ghost" ? "transparent"
           : COLORS.surface;
  return (
    <button onClick={onClick} style={{
      background: bg, color: variant==="ghost" ? COLORS.muted : "#fff",
      border: variant==="ghost" ? `1px solid ${COLORS.border}` : "none",
      borderRadius:10, padding:"11px 20px", fontSize:14, fontWeight:700,
      cursor:"pointer", whiteSpace:"nowrap", ...style,
    }}>{children}</button>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center", padding:16,
    }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:COLORS.card, border:`1px solid ${COLORS.border}`,
        borderRadius:20, padding:24, width:"100%", maxWidth:420, maxHeight:"85vh", overflowY:"auto",
      }}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20}}>
          <span style={{fontSize:18, fontWeight:700, color:COLORS.text}}>{title}</span>
          <button onClick={onClose} style={{
            background:"none", border:"none", color:COLORS.muted, fontSize:22, cursor:"pointer",
          }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────
function Landing() {
  const { login } = useApp();
  return (
    <div style={{ minHeight:"100vh", background:COLORS.bg, color:COLORS.text, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <Btn onClick={()=>login("Minh", "minh@student.edu.vn")} style={{ padding:"14px 32px", fontSize:16 }}>🚀 Vào Dashboard Trực Tiếp</Btn>
    </div>
  );
}

// ─── LAYOUT ───────────────────────────────────────────────────────────────────
// Đổi icon chuỗi emoji sang Component Icon của Lucide
const NAV_ITEMS = [
  { id:"dashboard", icon: <LayoutDashboard size={18} />, label:"Tổng quan" },
  { id:"expenses", icon: <ArrowDownLeft size={18} />, label:"Chi tiêu" },
  { id:"incomes", icon: <ArrowUpRight size={18} />, label:"Thu nhập" },
  { id:"budget", icon: <Target size={18} />, label:"Ngân sách" },
  { id:"charts", icon: <BarChart3 size={18} />, label:"Biểu đồ" },
  { id:"goals", icon: <Sparkles size={18} />, label:"Mục tiêu" },
];

function AppLayout({ children }) {
  const { user, page, setPage, logout, addExpense } = useApp();
  const [addOpen, setAddOpen] = useState(false);
  const [quickAmt, setQuickAmt] = useState("");
  const [quickCat, setQuickCat] = useState("an_uong");

  const handleQuickAdd = () => {
    if (!quickAmt) return;
    addExpense({ amount:+quickAmt, category:quickCat, note:"Thêm nhanh", date:"2025-05-19" });
    setQuickAmt(""); setAddOpen(false);
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:COLORS.bg, color:COLORS.text }}>
      <aside style={{ width:220, background:COLORS.surface, borderRight:`1px solid ${COLORS.border}`, display:"flex", flexDirection:"column", padding:"24px 0", position:"sticky", top:0, height:"100vh", flexShrink:0 }}>
        <div style={{ padding:"0 20px 24px", borderBottom:`1px solid ${COLORS.border}`, display:"flex", alignItems:"center", gap:10 }}>
          <Wallet size={24} style={{ color: COLORS.mint }} />
          <div style={{fontSize:20, fontWeight:800}}><span style={{color:COLORS.mint}}>Ví</span> SV</div>
        </div>
        <nav style={{ flex:1, padding:"16px 12px" }}>
          {NAV_ITEMS.map(item=>(
            <button key={item.id} onClick={()=>setPage(item.id)} style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"12px 14px", borderRadius:10, border:"none", cursor:"pointer", background: page===item.id ? `${COLORS.mint}18` : "transparent", color: page===item.id ? COLORS.mint : COLORS.muted, fontSize:14, fontWeight: page===item.id ? 700 : 500, marginBottom:4, textAlign:"left", transition:"all 0.2s" }}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding:"16px 20px", borderTop:`1px solid ${COLORS.border}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <Avatar name={user?.name} size={34} />
            <div style={{fontSize:13, fontWeight:700}}>{user?.name}</div>
          </div>
          <button onClick={logout} style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:8, background:"transparent", border:`1px solid ${COLORS.border}`, borderRadius:10, padding:"10px", color:COLORS.muted, cursor:"pointer", fontSize:13, fontWeight:600 }}>
            <LogOut size={14} /> Đăng xuất
          </button>
        </div>
      </aside>

      <main style={{ flex:1, padding:"28px 28px" }}>{children}</main>

      <button onClick={()=>setAddOpen(true)} style={{ position:"fixed", bottom:28, right:28, width:56, height:56, borderRadius:"50%", background:`linear-gradient(135deg, ${COLORS.mint}, ${COLORS.mintDim})`, border:"none", fontSize:28, cursor:"pointer", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 4px 20px ${COLORS.mint}44` }}>
        <Plus size={24} />
      </button>

      {addOpen && (
        <Modal title="⚡ Thêm chi tiêu nhanh" onClose={()=>setAddOpen(false)}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:16 }}>
            {Object.entries(EXPENSE_CATS).map(([k,v])=>(
              <button key={k} onClick={()=>setQuickCat(k)} style={{ background: quickCat===k ? `${COLORS.mint}22` : COLORS.surface, border:`1px solid ${quickCat===k ? COLORS.mint : COLORS.border}`, borderRadius:10, padding:"10px 4px", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                <span style={{fontSize:18}}>{v.icon}</span><span style={{fontSize:11, color:COLORS.text}}>{v.label}</span>
              </button>
            ))}
          </div>
          <Input label="Số tiền" type="number" value={quickAmt} onChange={e=>setQuickAmt(e.target.value)} />
          <Btn onClick={handleQuickAdd} style={{width:"100%"}}>Thêm ngay ⚡</Btn>
        </Modal>
      )}
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
// Thêm icon chỉ thị vào từng Thẻ thống kê chính
function Dashboard() {
  const { totalIncome, totalExpense, balance, perDay, expenses } = useApp();
  const pct = totalIncome > 0 ? (totalExpense/totalIncome)*100 : 0;

  const tsCount = thisMonth(expenses).filter(e=>e.category==="tra_sua").length;
  const topCat = Object.entries(thisMonth(expenses).reduce((acc,e)=>({...acc,[e.category]:(acc[e.category]||0)+e.amount}),{})).sort((a,b)=>b[1]-a[1])[0];

  return (
    <div>
      <h2 style={{fontSize:24, fontWeight:800, marginBottom:20, display:"flex", alignItems:"center", gap:10}}>
        Tổng quan ví tháng này <BarChart3 style={{color:COLORS.mint}} />
      </h2>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:16, marginBottom:20 }}>
        <Card style={{ position:"relative", overflow:"hidden" }}>
          <div style={{color:COLORS.muted, fontSize:12, fontWeight:600}}>SỐ DƯ HIỆN TẠI</div>
          <div style={{fontSize:24, fontWeight:800, color:COLORS.mint, marginTop:6}}>{fmt(balance)}</div>
          <Wallet size={40} style={{ position:"absolute", right:-10, bottom:-10, color:COLORS.mint, opacity:0.1 }} />
        </Card>
        <Card style={{ position:"relative", overflow:"hidden" }}>
          <div style={{color:COLORS.muted, fontSize:12, fontWeight:600}}>TỔNG THU NHẬP</div>
          <div style={{fontSize:24, fontWeight:800, color:COLORS.success, marginTop:6}}>{fmt(totalIncome)}</div>
          <ArrowUpRight size={40} style={{ position:"absolute", right:-10, bottom:-10, color:COLORS.success, opacity:0.1 }} />
        </Card>
        <Card style={{ position:"relative", overflow:"hidden" }}>
          <div style={{color:COLORS.muted, fontSize:12, fontWeight:600}}>TỔNG CHI TIÊU</div>
          <div style={{fontSize:24, fontWeight:800, color:COLORS.danger, marginTop:6}}>{fmt(totalExpense)}</div>
          <ArrowDownLeft size={40} style={{ position:"absolute", right:-10, bottom:-10, color:COLORS.danger, opacity:0.1 }} />
        </Card>
        <Card style={{ position:"relative", overflow:"hidden" }}>
          <div style={{color:COLORS.muted, fontSize:12, fontWeight:600}}>NÊN TIÊU / NGÀY</div>
          <div style={{fontSize:24, fontWeight:800, color:COLORS.purple, marginTop:6}}>{perDay > 0 ? fmt(perDay) : "0đ"}</div>
          <Calendar size={40} style={{ position:"absolute", right:-10, bottom:-10, color:COLORS.purple, opacity:0.1 }} />
        </Card>
      </div>

      <Card style={{marginBottom:20}}>
        <div style={{display:"flex", justifyContent:"space-between", marginBottom:8, fontSize:14, fontWeight:600}}>
          <span style={{display:"flex", alignItems:"center", gap:6}}><TrendingUp size={16} style={{color:COLORS.mint}} /> Mức độ dùng ví dòng tiền</span>
          <span>{Math.round(pct)}%</span>
        </div>
        <div style={{background:COLORS.surface, height:12, borderRadius:6, overflow:"hidden"}}>
          <div style={{width:`${Math.min(pct, 100)}%`, background:COLORS.mint, height:"100%", transition:"width 0.3s"}} />
        </div>
      </Card>

      <Card>
        <div style={{fontWeight:700, marginBottom:10, display:"flex", alignItems:"center", gap:8}}>
          <Sparkles size={16} style={{color:COLORS.warning}} /> Phân tích thông minh:
        </div>
        <div style={{fontSize:14, color:COLORS.muted, lineHeight:"1.6"}}>
          • Chiến thần trà sữa: Bạn đã uống hết <strong>{tsCount} cốc trà sữa</strong> tháng này rồi.<br />
          • Hạng mục chi nhiều nhất: <strong>{topCat ? EXPENSE_CATS[topCat[0]]?.label : "Chưa có"}</strong>.
        </div>
      </Card>
    </div>
  );
}

// ─── SUB-PAGES COMPONENT ──────────────────────────────────────────────────────
function ExpensesPage() {
  const { expenses, deleteExpense, addExpense } = useApp();
  const [amt, setAmt] = useState("");
  const [cat, setCat] = useState("an_uong");
  const [note, setNote] = useState("");

  return (
    <div>
      <h2 style={{fontSize:22, fontWeight:800, marginBottom:16}}>Quản lý Chi tiêu 💸</h2>
      <Card style={{marginBottom:20}}>
        <h3 style={{fontSize:15, marginBottom:12}}>Thêm khoản chi mới</h3>
        <div style={{display:"flex", gap:12, flexWrap:"wrap"}}>
          <Input placeholder="Số tiền" type="number" value={amt} onChange={e=>setAmt(e.target.value)} style={{marginBottom:0}} />
          <Select value={cat} onChange={e=>setCat(e.target.value)} style={{marginBottom:0}}>
            {Object.entries(EXPENSE_CATS).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
          </Select>
          <Input placeholder="Ghi chú (ví dụ: cơm trưa)" value={note} onChange={e=>setNote(e.target.value)} style={{marginBottom:0}} />
          <Btn onClick={() => { if(!amt)return; addExpense({amount:+amt, category:cat, note, date:"2025-05-19"}); setAmt(""); setNote(""); }}>Thêm</Btn>
        </div>
      </Card>
      <Card>
        <table style={{width:"100%", textAlign:"left", borderCollapse:"collapse"}}>
          <thead><tr style={{color:COLORS.muted}}><th style={{padding:12}}>Danh mục</th><th style={{padding:12}}>Số tiền</th><th style={{padding:12}}>Ghi chú</th><th style={{padding:12, textAlign:"right"}}>Hành động</th></tr></thead>
          <tbody>
            {expenses.map(e=>(
              <tr key={e.id} style={{borderTop:`1px solid ${COLORS.border}`}}>
                <td style={{padding:12}}>{EXPENSE_CATS[e.category]?.icon} {EXPENSE_CATS[e.category]?.label}</td>
                <td style={{padding:12, color:COLORS.danger, fontWeight:600}}>-{fmt(e.amount)}</td>
                <td style={{padding:12, color:COLORS.muted}}>{e.note}</td>
                <td style={{padding:12, textAlign:"right"}}>
                  <button onClick={()=>deleteExpense(e.id)} style={{background:"none", border:"none", color:COLORS.danger, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:4}}>
                    <Trash2 size={14} /> Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function IncomesPage() {
  const { incomes, deleteIncome, addIncome } = useApp();
  const [amt, setAmt] = useState("");
  const [cat, setCat] = useState("ba_me_gui");
  const [note, setNote] = useState("");

  return (
    <div>
      <h2 style={{fontSize:22, fontWeight:800, marginBottom:16}}>Khoản Thu Nhập 💰</h2>
      <Card style={{marginBottom:20}}>
        <h3 style={{fontSize:15, marginBottom:12}}>Thêm khoản thu nhập</h3>
        <div style={{display:"flex", gap:12, flexWrap:"wrap"}}>
          <Input placeholder="Số tiền" type="number" value={amt} onChange={e=>setAmt(e.target.value)} />
          <Select value={cat} onChange={e=>setCat(e.target.value)}>
            {Object.entries(INCOME_CATS).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
          </Select>
          <Input placeholder="Ghi chú" value={note} onChange={e=>setNote(e.target.value)} />
          <Btn onClick={() => { if(!amt)return; addIncome({amount:+amt, category:cat, note, date:"2025-05-01"}); setAmt(""); setNote(""); }}>Thêm</Btn>
        </div>
      </Card>
      <Card>
        {incomes.map(i=>(
          <div key={i.id} style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:`1px solid ${COLORS.border}`}}>
            <div>{INCOME_CATS[i.category]?.icon} <strong>{INCOME_CATS[i.category]?.label}</strong> <span style={{color:COLORS.muted, marginLeft:6}}>({i.note})</span></div>
            <div style={{color:COLORS.success, fontWeight:600, display:"flex", alignItems:"center", gap:12}}>
              +{fmt(i.amount)} 
              <button onClick={()=>deleteIncome(i.id)} style={{background:"none", border:"none", color:COLORS.danger, cursor:"pointer"}}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function BudgetPage() {
  const { budgets, updateBudget, expenses } = useApp();
  return (
    <div>
      <h2 style={{fontSize:22, fontWeight:800, marginBottom:16}}>Quản lý Hạn mức Ngân sách 🎯</h2>
      <div style={{display:"flex", flexDirection:"column", gap:14}}>
        {Object.entries(EXPENSE_CATS).slice(0,6).map(([k,v])=>{
          const spent = expenses.filter(e=>e.category===k).reduce((s,x)=>s+x.amount,0);
          const limit = budgets[k] || 0;
          const bPct = limit > 0 ? (spent/limit)*100 : 0;
          return (
            <Card key={k}>
              <div style={{display:"flex", justifyContent:"space-between", marginBottom:6}}>
                <span>{v.icon} <strong>{v.label}</strong></span>
                <span style={{fontSize:13, color:COLORS.muted}}>Đã tiêu: {fmt(spent)} / Hạn mức: {fmt(limit)}</span>
              </div>
              <div style={{background:COLORS.surface, height:8, borderRadius:4, overflow:"hidden", marginBottom:10}}>
                <div style={{width:`${Math.min(bPct,100)}%`, background: bPct > 90 ? COLORS.danger : COLORS.purple, height:"100%"}} />
              </div>
              <Input type="number" placeholder="Đặt giới hạn tiêu dùng" value={limit || ""} onChange={e=>updateBudget(k, +e.target.value)} style={{maxWidth:200, marginBottom:0}} />
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ChartsPage() {
  const { expenses } = useApp();
  const chartData = useMemo(() => {
    return Object.entries(expenses.reduce((acc,e)=>({...acc,[e.category]:(acc[e.category]||0)+e.amount}),{}))
      .map(([k,v])=>({ name: EXPENSE_CATS[k]?.label || k, value: v }));
  }, [expenses]);

  return (
    <div>
      <h2 style={{fontSize:22, fontWeight:800, marginBottom:16}}>Phân tích Biểu đồ 📊</h2>
      <Card style={{height:400}}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
              {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

function GoalsPage() {
  const { goals, updateGoalSaved, addGoal, deleteGoal } = useApp();
  const [gName, setGName] = useState("");
  const [gTarget, setGTarget] = useState("");

  return (
    <div>
      <h2 style={{fontSize:22, fontWeight:800, marginBottom:16}}>Mục tiêu Tích lũy 🌟</h2>
      <Card style={{marginBottom:20}}>
        <h3 style={{fontSize:15, marginBottom:12}}>Thêm mục tiêu mới</h3>
        <div style={{display:"flex", gap:10}}>
          <Input placeholder="Tên ví dụ: Đổi điện thoại" value={gName} onChange={e=>setGName(e.target.value)} />
          <Input placeholder="Số tiền mong muốn" type="number" value={gTarget} onChange={e=>setGTarget(e.target.value)} />
          <Btn onClick={()=>{ if(!gName || !gTarget) return; addGoal({name:gName, target:+gTarget, saved:0, icon:"🎯", color:COLORS.mint}); setGName(""); setGTarget(""); }}>Thêm mục tiêu</Btn>
        </div>
      </Card>
      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))", gap:16}}>
        {goals.map(g=>{
          const gPct = (g.saved / g.target) * 100;
          return (
            <Card key={g.id}>
              <div style={{fontSize:24, marginBottom:8}}>{g.icon}</div>
              <h4 style={{margin:0}}>{g.name}</h4>
              <div style={{fontSize:13, color:COLORS.muted, margin:"6px 0"}}>Đã tích lũy: {fmt(g.saved)} / {fmt(g.target)}</div>
              <div style={{background:COLORS.surface, height:6, borderRadius:3, overflow:"hidden", marginBottom:12}}>
                <div style={{width:`${Math.min(gPct,100)}%`, background:g.color, height:"100%"}} />
              </div>
              <div style={{display:"flex", gap:8}}>
                <Btn variant="ghost" onClick={()=>updateGoalSaved(g.id, 100000)}>+100k</Btn>
                <Btn variant="ghost" onClick={()=>updateGoalSaved(g.id, 500000)}>+500k</Btn>
                <button onClick={()=>deleteGoal(g.id)} style={{background:"none", border:"none", color:COLORS.danger, marginLeft:"auto", cursor:"pointer", display:"inline-flex", alignItems:"center", gap:4}}>
                  <Trash2 size={14} /> Xóa
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAIN APP COMPONENT ───────────────────────────────────────────────────────
export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

function AppContent() {
  const { page } = useApp();

  if (page === "landing") return <Landing />;

  return (
    <AppLayout>
      {page === "dashboard" && <Dashboard />}
      {page === "expenses" && <ExpensesPage />}
      {page === "incomes" && <IncomesPage />}
      {page === "budget" && <BudgetPage />}
      {page === "charts" && <ChartsPage />}
      {page === "goals" && <GoalsPage />}
    </AppLayout>
  );
}