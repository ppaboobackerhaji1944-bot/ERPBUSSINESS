import { useState } from "react";
import {
  LayoutDashboard, Building2, Users, Package, ShoppingCart, Truck,
  FileText, Wallet, BarChart3, Settings, Search, Bell, Plus,
  ArrowUpRight, ArrowDownRight, Menu, X, ChevronDown, IndianRupee,
  Boxes, ClipboardList, ShieldCheck
} from "lucide-react";

const nav = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Businesses", icon: Building2 },
  { label: "Customers", icon: Users },
  { label: "Inventory", icon: Package },
  { label: "Sales", icon: ShoppingCart },
  { label: "Purchases", icon: Truck },
  { label: "Invoices", icon: FileText },
  { label: "Finance", icon: Wallet },
  { label: "Reports", icon: BarChart3 }
];

const metrics = [
  { label: "Total revenue", value: "₹ 8,42,650", change: "+12.8%", up: true, icon: IndianRupee, tone: "blue" },
  { label: "Total orders", value: "1,284", change: "+8.2%", up: true, icon: ShoppingCart, tone: "violet" },
  { label: "Active customers", value: "846", change: "+5.4%", up: true, icon: Users, tone: "green" },
  { label: "Low stock items", value: "18", change: "-3.1%", up: false, icon: Boxes, tone: "orange" }
];

const transactions = [
  ["INV-2026-1048", "Malabar Traders", "Today, 10:42 AM", "₹ 24,500", "Paid"],
  ["INV-2026-1047", "Green Leaf Stores", "Today, 09:18 AM", "₹ 18,200", "Pending"],
  ["INV-2026-1046", "City Mart", "Yesterday", "₹ 42,750", "Paid"],
  ["INV-2026-1045", "A One Distributors", "Yesterday", "₹ 9,800", "Overdue"]
];

function App() {
  const [active, setActive] = useState("Overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [business, setBusiness] = useState("Salahudheen Trading Co.");
  const [showBusiness, setShowBusiness] = useState(false);
  const [search, setSearch] = useState("");

  return <div className="app-shell">
    <aside className={menuOpen ? "sidebar open" : "sidebar"}>
      <div className="brand"><div className="brand-mark"><Boxes size={22}/></div><div><strong>ERP<span>BUSINESS</span></strong><small>BUSINESS SUITE</small></div><button className="mobile-close" onClick={() => setMenuOpen(false)}><X/></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <button className="business-switch" onClick={() => setShowBusiness(!showBusiness)}><span className="business-avatar">S</span><span className="business-info"><b>{business}</b><small>Administrator</small></span><ChevronDown size={16}/></button>
      {showBusiness && <div className="business-menu"><button onClick={() => {setBusiness("Salahudheen Trading Co.");setShowBusiness(false)}}>Salahudheen Trading Co.</button><button onClick={() => {setBusiness("New business");setShowBusiness(false)}}>+ Add business</button></div>}
      <div className="nav-label">MAIN MENU</div>
      <nav>{nav.map(item => <button key={item.label} className={active === item.label ? "nav-item selected" : "nav-item"} onClick={() => {setActive(item.label);setMenuOpen(false)}}><item.icon size={18}/><span>{item.label}</span>{item.label === "Inventory" && <i className="nav-count">18</i>}</button>)}</nav>
      <div className="nav-label tools-label">MANAGEMENT</div>
      <nav><button className="nav-item" onClick={() => setActive("Team & access")}><ShieldCheck size={18}/><span>Team & access</span></button><button className="nav-item" onClick={() => setActive("Settings")}><Settings size={18}/><span>Settings</span></button></nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><ClipboardList size={18}/></div><b>Need a hand?</b><p>Explore guides to get more from your ERP.</p><button onClick={() => setActive("Help centre")}>Visit help centre ↗</button></div><div className="profile"><div className="profile-avatar">PP</div><div><b>Administrator</b><small>admin@erpbusiness.in</small></div><button aria-label="Profile menu"><ChevronDown size={16}/></button></div></div>
    </aside>
    {menuOpen && <button className="scrim" aria-label="Close menu" onClick={() => setMenuOpen(false)}/>}
    <main className="main-area">
      <header className="topbar"><div className="topbar-left"><button className="mobile-menu" onClick={() => setMenuOpen(true)}><Menu/></button><span className="breadcrumb">Workspace</span><span className="crumb-divider">/</span><b>{active}</b></div><div className="topbar-right"><label className="searchbox"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search anything..."/><kbd>⌘ K</kbd></label><button className="icon-button notification"><Bell size={19}/><i/></button><div className="top-avatar">PP</div></div></header>
      <div className="content">
        <div className="welcome-row"><div><div className="eyebrow">WEDNESDAY, 26 NOVEMBER 2026</div><h1>{active === "Overview" ? "Good morning, Administrator" : active}</h1><p>Here's what's happening with your business today.</p></div><button className="primary-btn" onClick={() => setActive("Create new")}><Plus size={17}/> Create new</button></div>
        <div className="filter-row"><div className="period-select"> <span className="period-dot"/> All businesses <ChevronDown size={15}/></div><div className="period-select">Last 30 days <ChevronDown size={15}/></div><span className="updated">Last updated just now</span></div>
        <section className="metric-grid">{metrics.map((m) => <article className="metric-card" key={m.label}><div className="metric-top"><span>{m.label}</span><span className={"metric-icon " + m.tone}><m.icon size={19}/></span></div><div className="metric-value">{m.value}</div><div className="metric-foot"><span className={m.up ? "trend positive" : "trend negative"}>{m.up ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>} {m.change}</span><span>vs. last month</span></div></article>)}</section>
        <section className="middle-grid"><article className="panel revenue-panel"><div className="panel-heading"><div><h2>Revenue overview</h2><p>Track your business performance</p></div><button className="select-button">This year <ChevronDown size={14}/></button></div><div className="revenue-total"><strong>₹ 32,84,500</strong><span className="trend positive"><ArrowUpRight size={14}/> 18.6%</span></div><div className="chart"><div className="chart-y"><span>₹8L</span><span>₹6L</span><span>₹4L</span><span>₹2L</span><span>₹0</span></div><div className="chart-area"><div className="grid-lines"><i/><i/><i/><i/><i/></div><svg viewBox="0 0 700 190" preserveAspectRatio="none" role="img" aria-label="Revenue trend chart"><defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#5268e8" stopOpacity=".22"/><stop offset="100%" stopColor="#5268e8" stopOpacity="0"/></linearGradient></defs><path d="M0 150 C35 140 42 115 78 125 S130 143 155 105 S210 115 233 90 S285 104 310 80 S360 110 388 70 S440 80 465 62 S520 88 545 48 S600 64 620 35 S675 50 700 16 L700 190 L0 190Z" fill="url(#fill)"/><path d="M0 150 C35 140 42 115 78 125 S130 143 155 105 S210 115 233 90 S285 104 310 80 S360 110 388 70 S440 80 465 62 S520 88 545 48 S600 64 620 35 S675 50 700 16" fill="none" stroke="#5268e8" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round"/></svg><div className="chart-x"><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span></div></div></div></article>
          <article className="panel breakdown-panel"><div className="panel-heading"><div><h2>Business snapshot</h2><p>Across all business units</p></div><button className="more-btn">···</button></div><div className="snapshot"><div className="snapshot-ring"><div><b>4</b><small>Businesses</small></div></div><div className="snapshot-legend"><div><i className="legend blue-bg"/><span>Retail</span><b>2</b></div><div><i className="legend violet-bg"/><span>Wholesale</span><b>1</b></div><div><i className="legend green-bg"/><span>Services</span><b>1</b></div></div></div><div className="snapshot-footer"><span>All business units</span><b>View details <ArrowUpRight size={14}/></b></div></article></section>
        <section className="panel transactions-panel"><div className="panel-heading"><div><h2>Recent transactions</h2><p>Your latest sales invoices and payments</p></div><button className="view-all" onClick={() => setActive("Invoices")}>View all <ArrowUpRight size={15}/></button></div><div className="table-wrap"><table><thead><tr><th>INVOICE</th><th>CUSTOMER</th><th>DATE</th><th>AMOUNT</th><th>STATUS</th><th></th></tr></thead><tbody>{transactions.filter(row => row.join(" ").toLowerCase().includes(search.toLowerCase())).map(row => <tr key={row[0]}><td className="invoice-id">{row[0]}</td><td>{row[1]}</td><td className="muted-cell">{row[2]}</td><td className="amount-cell">{row[3]}</td><td><span className={"status " + row[4].toLowerCase()}>{row[4]}</span></td><td><button className="row-more">···</button></td></tr>)}</tbody></table></div></section>
        <footer className="footer"><span>© 2026 ERPBUSSINESS. All rights reserved.</span><span>Made for growing businesses <span className="heart">♥</span></span></footer>
      </div>
    </main>
  </div>;
}

export default App;
