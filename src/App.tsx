import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Clock3,
  Crown, Gem, Instagram, LockKeyhole, LogIn, Menu, MessageCircle, Phone, Search,
  Send, ShieldCheck, Sparkles, Star, UserRound, X, Zap, CreditCard, Bell, Settings,
  Upload, Pencil, Trash2, CheckCircle2, XCircle, RotateCcw, LayoutDashboard, Users,
  BarChart3, LogOut, MapPin, Mail, Plus, Minus, SlidersHorizontal
} from 'lucide-react'
import type { AppData, Booking, BookingStatus, Service, SiteSettings, User } from './types'
import { loadData, saveData, getUser, setUser, isAdmin, setAdmin, id, sha256, bookingId, confirmedCount, addHistory, pushNotification, resetData } from './store'

const gold = '#d6b36a'
const navItems = [
  ['Home', 'home'], ['Services', 'services'], ['Portfolio', 'portfolio'], ['Jewellery', 'jewellery'], ['Reviews', 'reviews']
] as const

const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`
const today = () => new Date().toISOString().slice(0, 10)

function useHashRoute() {
  const get = () => window.location.hash.replace(/^#/, '') || '/'
  const [route, setRoute] = useState(get)
  useEffect(() => {
    const fn = () => setRoute(get())
    window.addEventListener('hashchange', fn)
    return () => window.removeEventListener('hashchange', fn)
  }, [])
  const navigate = (path: string) => {
    window.location.hash = path.startsWith('/') ? path : `/${path}`
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  return [route, navigate] as const
}

function App() {
  const [route, navigate] = useHashRoute()
  const [data, setData] = useState<AppData>(() => loadData())
  const [user, setUserState] = useState<User | null>(() => getUser())
  const [admin, setAdminState] = useState(isAdmin())
  const [menuOpen, setMenuOpen] = useState(false)
  const [toast, setToast] = useState('')

  const refresh = () => {
    setData(loadData())
    setUserState(getUser())
    setAdminState(isAdmin())
  }
  const save = (next: AppData) => { saveData(next); setData(next) }
  const showToast = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 2600) }
  const logout = () => { setUser(null); setAdmin(false); setUserState(null); setAdminState(false); navigate('/'); showToast('Signed out successfully.') }

  useEffect(() => {
    const saved = getUser()
    setUserState(saved)
    setAdminState(isAdmin())
  }, [])

  const isAdminRoute = route.startsWith('/admin101')
  const isDashboardRoute = route.startsWith('/dashboard')

  return (
    <div className="app-shell">
      {!isAdminRoute && <Header user={user} onNavigate={navigate} menuOpen={menuOpen} setMenuOpen={setMenuOpen} onLogout={logout} />}
      <AnimatePresence mode="wait">
        <motion.main key={route} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .32 }}>
          {route === '/' && <Home data={data} onNavigate={navigate} />}
          {route === '/services' && <Services data={data} onNavigate={navigate} />}
          {route === '/portfolio' && <Portfolio data={data} />}
          {route === '/jewellery' && <Jewellery data={data} />}
          {route === '/reviews' && <Reviews data={data} onSave={save} user={user} onToast={showToast} />}
          {route === '/about' && <About onNavigate={navigate} />}
          {route === '/bridal' && <Bridal data={data} onNavigate={navigate} />}
          {route === '/pre-bridal' && <PreBridal data={data} onNavigate={navigate} />}
          {route === '/makeup' && <Services data={data} onNavigate={navigate} filter="Makeup" />}
          {route === '/contact' && <Contact data={data} onSave={save} onToast={showToast} />}
          {route === '/bridal-enquiry' && <BridalEnquiry data={data} onSave={save} onToast={showToast} />}
          {route === '/check-date' && <CheckDate data={data} />}
          {route === '/booking-status' && <BookingStatus data={data} />}
          {route === '/book' && <Booking data={data} user={user} onSave={save} onLogin={() => navigate('/login')} onToast={showToast} />}
          {route === '/login' && <Login data={data} onSave={save} onSuccess={() => { refresh(); navigate('/dashboard'); showToast('Welcome back.') }} />}
          {route === '/register' && <Register data={data} onSave={save} onSuccess={() => { refresh(); navigate('/dashboard'); showToast('Account created.') }} />}
          {route === '/dashboard' && <Dashboard data={data} user={user} onSave={save} onLogout={logout} onNavigate={navigate} onToast={showToast} />}
          {route === '/privacy-policy' && <Legal title="Privacy Policy" />}
          {route === '/terms' && <Legal title="Terms & Conditions" />}
          {route === '/cancellation-policy' && <Legal title="Cancellation Policy" />}
          {route === '/booking-policy' && <Legal title="Booking Policy" />}
          {isAdminRoute && <AdminShell data={data} admin={admin} onSave={save} onLogin={() => { setAdmin(true); setAdminState(true); showToast('Admin session started.') }} onLogout={logout} onNavigate={navigate} onToast={showToast} route={route} />}
          {isDashboardRoute && route !== '/dashboard' && <Dashboard data={data} user={user} onSave={save} onLogout={logout} onNavigate={navigate} onToast={showToast} />}
        </motion.main>
      </AnimatePresence>
      {!isAdminRoute && !isDashboardRoute && <Footer data={data} onNavigate={navigate} />}
      <AnimatePresence>
        {toast && <motion.div className="toast" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}>{toast}</motion.div>}
      </AnimatePresence>
      <div className="floating-actions">
        <a className="float-btn whatsapp" href={`https://wa.me/${data.settings.whatsapp}?text=${encodeURIComponent('Hello Riya Luxury Makeup Studio, I would like to enquire about a makeup booking.')}`} target="_blank" rel="noreferrer"><MessageCircle size={20}/><span>WhatsApp</span></a>
        <a className="float-btn call" href={`tel:${data.settings.phone}`}><Phone size={19}/><span>Call</span></a>
      </div>
    </div>
  )
}

function Header({ user, onNavigate, menuOpen, setMenuOpen, onLogout }: { user: User | null; onNavigate: (p: string) => void; menuOpen: boolean; setMenuOpen: (v:boolean)=>void; onLogout: ()=>void }) {
  return <header className="site-header glass">
    <div className="container nav-wrap">
      <button className="brand" onClick={() => onNavigate('/')} aria-label="Riya Luxury Makeup Studio">
        <img src="./rs-logo.png" alt="RS Luxury Makeup Studio logo" />
        <span><b>RIYA</b><small>LUXURY MAKEUP STUDIO</small></span>
      </button>
      <nav className={`desktop-nav ${menuOpen ? 'open' : ''}`}>
        {navItems.map(([label, path]) => <button key={path} onClick={() => {onNavigate(`/${path}`);setMenuOpen(false)}}>{label}</button>)}
        <button onClick={() => {onNavigate('/booking-status');setMenuOpen(false)}}>Check Booking</button>
        <button className="nav-book" onClick={() => {onNavigate('/book');setMenuOpen(false)}}>Book Now <ArrowRight size={15}/></button>
        {user ? <button className="icon-link" onClick={() => {onNavigate('/dashboard');setMenuOpen(false)}}><UserRound size={17}/>Dashboard</button> : <button className="icon-link" onClick={() => {onNavigate('/login');setMenuOpen(false)}}><LogIn size={17}/>Login</button>}
      </nav>
      <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">{menuOpen ? <X/> : <Menu/>}</button>
    </div>
  </header>
}

function Hero({ onNavigate }: { onNavigate: (p: string) => void }) {
  return <section className="hero section-pad">
    <div className="hero-noise" />
    <div className="hero-orb orb-one"/><div className="hero-orb orb-two"/>
    <div className="container hero-grid">
      <div className="hero-copy">
        <div className="eyebrow"><Sparkles size={15}/> BY RIYA SENGAR</div>
        <h1>Your dream.<br/><em>Your big day.</em><br/>Your bridal glow.</h1>
        <p>Luxury bridal artistry, signature makeup and a beautifully organized booking experience — crafted for your most photographed moments.</p>
        <div className="hero-actions"><button className="btn btn-gold" onClick={() => onNavigate('/book')}>Book your appointment <ArrowRight size={17}/></button><button className="btn btn-outline" onClick={() => onNavigate('/portfolio')}>Explore portfolio <ChevronRight size={17}/></button></div>
        <div className="hero-trust"><span><Check size={15}/> Open 7 days</span><span><Check size={15}/> 9 AM – 9 PM</span><span><Check size={15}/> Bridal + Occasion</span></div>
      </div>
      <div className="hero-stage">
        <div className="hero-frame">
          <div className="hero-image-wrap">
            <img src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=88" alt="Luxury beauty editorial portrait" />
            <div className="image-overlay"/>
            <div className="hero-badge"><Crown size={15}/><div><b>Signature Bridal</b><span>HD / Signature • ₹10,000</span></div></div>
          </div>
          <div className="gold-corner c1"/><div className="gold-corner c2"/>
        </div>
        <div className="floating-card fc-top"><span className="mini-icon"><Gem size={16}/></span><div><small>LUXURY RENTAL</small><b>Jewellery ₹2K–₹3K</b></div></div>
        <div className="floating-card fc-bottom"><div className="stars">★★★★★</div><b>Glow that feels like you.</b><span>Personalized looks • refined finish</span></div>
        <div className="hero-ring ring-one"/><div className="hero-ring ring-two"/>
      </div>
    </div>
  </section>
}

function Home({ data, onNavigate }: { data: AppData; onNavigate: (p: string)=>void }) {
  return <>
    <Hero onNavigate={onNavigate}/>
    <section className="section-pad intro-section"><div className="container two-col"><div><span className="eyebrow">THE RS EXPERIENCE</span><h2>Luxury beauty, thoughtfully <em>organized.</em></h2></div><p className="lead">From your first enquiry to your final glow, every touchpoint is designed to feel polished, personal and effortless.</p></div></section>
    <ServiceHighlights data={data} onNavigate={onNavigate}/>
    <PortfolioPreview data={data} onNavigate={onNavigate}/>
    <BeforeAfter data={data}/>
    <section className="section-pad dark-panel"><div className="container split-banner"><div><span className="eyebrow">BRIDAL PRE-PACKAGES</span><h2>Make your glow a <em>ritual.</em></h2><p>Choose the Gold or Premium pre-bridal ritual and arrive at your big day feeling polished from head to toe.</p></div><button className="btn btn-gold" onClick={()=>onNavigate('/pre-bridal')}>Explore packages <ArrowRight size={17}/></button></div></section>
    <JewelleryPreview data={data} onNavigate={onNavigate}/>
    <ReviewPreview data={data} onNavigate={onNavigate}/>
    <CTASection onNavigate={onNavigate}/>
  </>
}

function ServiceHighlights({ data, onNavigate }: { data:AppData; onNavigate:(p:string)=>void }) {
  const featured = data.services.filter(s => s.featured || s.category !== 'Makeup').slice(0, 4)
  return <section className="section-pad"><div className="container"><SectionHeading eyebrow="SIGNATURE SERVICES" title="Looks made for your <em>moment.</em>" action="View all services" onAction={()=>onNavigate('/services')}/><div className="service-grid">{featured.map((s,i)=><motion.article key={s.id} className={`service-card ${i===0?'feature':''}`} whileHover={{y:-6}}>{i===0 && <span className="ribbon">SIGNATURE</span>}<div className="service-number">0{i+1}</div><div className="service-icon"><Sparkles size={21}/></div><span className="service-category">{s.category}</span><h3>{s.name}</h3><p>{s.description}</p><div className="service-foot"><b>{formatCurrency(s.price)}</b><button onClick={()=>onNavigate('/book')}>Book <ArrowRight size={14}/></button></div></motion.article>)}</div></div></section>
}

function PortfolioPreview({ data, onNavigate }: {data:AppData; onNavigate:(p:string)=>void}) {
  const items=data.portfolio.filter(p=>p.featured).slice(0,4)
  return <section className="section-pad light-soft"><div className="container"><SectionHeading eyebrow="THE PORTFOLIO" title="A gallery of <em>glow.</em>" action="See all work" onAction={()=>onNavigate('/portfolio')}/><div className="portfolio-mosaic">{items.map((p,i)=><button key={p.id} className={`portfolio-tile tile-${i+1}`} onClick={()=>onNavigate('/portfolio')}><img src={p.image} alt={p.title}/><div className="tile-caption"><small>{p.category}</small><b>{p.title}</b></div></button>)}</div></div></section>
}

function BeforeAfter({ data }: {data:AppData}) {
  const item=data.portfolio.find(p=>p.category==='Before & After') ?? data.portfolio[0]
  return <section className="section-pad before-section"><div className="container before-grid"><div className="before-copy"><span className="eyebrow">BEFORE / AFTER</span><h2>See the <em>difference.</em></h2><p>Use the slider to explore how thoughtful makeup can lift, balance and illuminate a look while keeping the person at the center.</p><div className="before-stats"><div><b>01</b><span>Skin-focused prep</span></div><div><b>02</b><span>Refined definition</span></div><div><b>03</b><span>Camera-ready finish</span></div></div></div><BeforeAfterSlider image={item.image}/></div></section>
}

function BeforeAfterSlider({ image }: { image:string }) {
  const [value,setValue]=useState(50)
  return <div className="ba-wrap"><img className="ba-img base" src={image} alt="Beauty transformation"/><div className="ba-clip" style={{width:`${value}%`}}><img className="ba-img top" src={image} alt="Beauty transformation after"/></div><div className="ba-label before">BEFORE</div><div className="ba-label after">AFTER</div><div className="ba-handle" style={{left:`${value}%`}}><span/></div><input className="ba-input" type="range" min="0" max="100" value={value} onChange={e=>setValue(Number(e.target.value))} aria-label="Before after slider"/></div>
}

function JewelleryPreview({ data, onNavigate }: {data:AppData;onNavigate:(p:string)=>void}) {
  return <section className="section-pad"><div className="container"><SectionHeading eyebrow="BRIDAL JEWELLERY" title="The final <em>sparkle.</em>" action="Browse rental" onAction={()=>onNavigate('/jewellery')}/><div className="jewel-grid">{data.jewellery.map(j=><article className="jewel-card" key={j.id}><div className="jewel-image"><img src={j.image} alt={j.name}/><span>{j.available?'Available':'Booked'}</span></div><div className="jewel-body"><small>{j.category}</small><h3>{j.name}</h3><p>Rental {formatCurrency(j.rental)} • Deposit {formatCurrency(j.deposit)}</p><button onClick={()=>onNavigate('/book')}>Enquire <ArrowRight size={14}/></button></div></article>)}</div></div></section>
}

function ReviewPreview({ data,onNavigate }:{data:AppData;onNavigate:(p:string)=>void}) {
  const list=data.reviews.filter(r=>r.approved).slice(0,3)
  return <section className="section-pad light-soft"><div className="container"><SectionHeading eyebrow="REVIEWS" title="Words after the <em>glow.</em>" action="Read all" onAction={()=>onNavigate('/reviews')}/><div className="review-grid">{list.map(r=><article className="review-card" key={r.id}><div className="stars">{'★'.repeat(r.rating)}</div><p>“{r.text}”</p><b>{r.name}</b><span>{r.service}</span></article>)}</div></div></section>
}

function CTASection({ onNavigate }:{onNavigate:(p:string)=>void}) {
  return <section className="section-pad final-cta"><div className="container cta-card"><div className="cta-glow"/><span className="eyebrow">YOUR BIG DAY STARTS HERE</span><h2>Ready for your <em>luxury glow?</em></h2><p>Tell us your date, choose your look and let the studio take care of the details.</p><div className="hero-actions"><button className="btn btn-dark" onClick={()=>onNavigate('/book')}>Book now <ArrowRight size={17}/></button><button className="btn btn-outline dark-outline" onClick={()=>onNavigate('/check-date')}>Check my date</button></div></div></section>
}

function SectionHeading({ eyebrow,title,action,onAction }:{eyebrow:string;title:string;action?:string;onAction?:()=>void}) {
  return <div className="section-heading"><div><span className="eyebrow">{eyebrow}</span><h2 dangerouslySetInnerHTML={{__html:title}}/></div>{action&&<button className="link-btn" onClick={onAction}>{action} <ArrowRight size={15}/></button>}</div>
}

function Services({data,onNavigate,filter}:{data:AppData;onNavigate:(p:string)=>void;filter?:string}) {
  const [cat,setCat]=useState(filter || 'All')
  const categories=['All','Bridal','Pre-Bridal','Makeup']
  const list=data.services.filter(s=>cat==='All'||s.category===cat)
  return <><PageHero title="Services" subtitle="Choose a look, then choose a date. Your booking journey stays simple." />
    <section className="section-pad"><div className="container"><div className="filter-row">{categories.map(c=><button key={c} className={cat===c?'active':''} onClick={()=>setCat(c)}>{c}</button>)}</div><div className="service-grid wide">{list.map((s,i)=><article className="service-card" key={s.id}><div className="service-number">0{i+1}</div><div className="service-icon"><Sparkles size={21}/></div><span className="service-category">{s.category}</span><h3>{s.name}</h3><p>{s.description}</p><ul className="mini-list">{s.inclusions.slice(0,4).map(x=><li key={x}><Check size={14}/>{x}</li>)}</ul><div className="service-foot"><b>{formatCurrency(s.price)}</b><button onClick={()=>onNavigate('/book')}>Book <ArrowRight size={14}/></button></div></article>)}</div></div></section><PackageStrip data={data} onNavigate={onNavigate}/></>
}

function PackageStrip({data,onNavigate}:{data:AppData;onNavigate:(p:string)=>void}) {
  const ps=data.services.filter(s=>s.category==='Pre-Bridal')
  return <section className="section-pad dark-panel"><div className="container"><SectionHeading eyebrow="PRE-BRIDAL" title="Preparation is part of the <em>glow.</em>"/><div className="package-grid">{ps.map(p=><article key={p.id} className="package-card"><span>{p.name}</span><h3>{formatCurrency(p.price)}</h3><ul>{p.inclusions.map(x=><li key={x}><Check size={14}/>{x}</li>)}</ul><button className="btn btn-gold" onClick={()=>onNavigate('/book')}>Enquire <ArrowRight size={15}/></button></article>)}</div></div></section>
}

function Portfolio({data}:{data:AppData}) {
  const [cat,setCat]=useState('All'); const [light,setLight]=useState<string|null>(null)
  const cats=['All', ...Array.from(new Set(data.portfolio.map(p=>p.category)))]
  const items=data.portfolio.filter(p=>cat==='All'||p.category===cat)
  return <><PageHero title="Portfolio" subtitle="A visual library for the kinds of looks you can explore with the studio."/><section className="section-pad"><div className="container"><div className="filter-row">{cats.map(c=><button key={c} className={cat===c?'active':''} onClick={()=>setCat(c)}>{c}</button>)}</div><div className="gallery-grid">{items.map(p=><button key={p.id} className="gallery-item" onClick={()=>setLight(p.id)}><img src={p.image} alt={p.title}/><div><small>{p.category}</small><b>{p.title}</b></div></button>)}</div></div></section>{light && <Lightbox item={items.find(p=>p.id===light)!} onClose={()=>setLight(null)}/>}</>
}

function Lightbox({item,onClose}:{item:any;onClose:()=>void}) { return <div className="modal-backdrop" onClick={onClose}><motion.div className="lightbox" initial={{scale:.95,opacity:0}} animate={{scale:1,opacity:1}} onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={onClose}><X/></button><img src={item.image} alt={item.title}/><div className="lightbox-copy"><small>{item.category}</small><h3>{item.title}</h3><p>{item.caption}</p></div></motion.div></div> }

function Jewellery({data}:{data:AppData}) { return <><PageHero title="Bridal Jewellery" subtitle="A beautiful collection available on rental for your wedding look."/><section className="section-pad"><div className="container"><div className="rental-note"><Gem size={20}/><div><b>Rental ₹2,000–₹3,000</b><span>Security deposit ₹3,000–₹5,000 • Fully refundable on safe return</span></div></div><div className="jewel-grid large">{data.jewellery.map(j=><article className="jewel-card" key={j.id}><div className="jewel-image"><img src={j.image} alt={j.name}/><span>{j.available?'Available':'Booked'}</span></div><div className="jewel-body"><small>{j.category}</small><h3>{j.name}</h3><p>Rental {formatCurrency(j.rental)} • Deposit {formatCurrency(j.deposit)}</p><button onClick={()=>window.location.hash='/book'}>Enquire <ArrowRight size={14}/></button></div></article>)}</div></div></section></> }

function Reviews({data,onSave,user,onToast}:{data:AppData;onSave:(d:AppData)=>void;user:User|null;onToast:(s:string)=>void}) {
  const [name,setName]=useState(user?.name||'');const [text,setText]=useState('');const [rating,setRating]=useState(5);const [service,setService]=useState('Signature Makeup')
  const submit=()=>{if(!user){onToast('Please login to submit a review.');window.location.hash='/login';return} if(!text.trim())return; const d=JSON.parse(JSON.stringify(data)); d.reviews.unshift({id:id('rev'),name:name||user.name,rating,text,service,approved:false}); onSave(d); setText('');onToast('Review submitted for approval.')} 
  return <><PageHero title="Reviews" subtitle="Real feedback deserves real care. Reviews are published after approval."/><section className="section-pad"><div className="container review-layout"><div className="review-grid wide">{data.reviews.filter(r=>r.approved).map(r=><article className="review-card" key={r.id}><div className="stars">{'★'.repeat(r.rating)}</div><p>“{r.text}”</p><b>{r.name}</b><span>{r.service}</span></article>)}</div><aside className="review-form card-surface"><span className="eyebrow">SHARE YOUR EXPERIENCE</span><h3>Leave a review</h3><label>Name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/></label><label>Service<select value={service} onChange={e=>setService(e.target.value)}>{data.services.map(s=><option key={s.id}>{s.name}</option>)}</select></label><label>Rating<div className="rating-select">{[1,2,3,4,5].map(i=><button key={i} className={i<=rating?'on':''} onClick={()=>setRating(i)} type="button"><Star size={18} fill="currentColor"/></button>)}</div></label><label>Review<textarea value={text} onChange={e=>setText(e.target.value)} rows={5} placeholder="Tell future brides about your experience."/></label><button className="btn btn-dark full" onClick={submit}>Submit review <Send size={16}/></button></aside></div></section></>
}

function About({onNavigate}:{onNavigate:(p:string)=>void}) { return <><PageHero title="About the Studio" subtitle="A premium makeup experience built around personalization, polish and calm."/><section className="section-pad"><div className="container about-grid"><div className="about-card"><img src="./rs-logo.png" alt="RS logo"/><span className="eyebrow">RIYA SENGAR</span><h2>A luxury look should still feel like <em>you.</em></h2><p>The studio focuses on bridal and occasion makeup with an emphasis on balanced complexion, refined eyes, elegant hair and a finish that photographs beautifully.</p><button className="btn btn-gold" onClick={()=>onNavigate('/book')}>Plan your appointment <ArrowRight size={16}/></button></div><div className="about-quote"><span>“</span><p>Your dream. Your big day. Your bridal glow.</p><small>— Riya Luxury Makeup Studio</small></div></div></section></> }

function Bridal({data,onNavigate}:{data:AppData;onNavigate:(p:string)=>void}) { const s=data.services.find(x=>x.id==='bridal-signature')!; return <><PageHero title="Signature Bridal" subtitle="HD / Signature — ₹10,000 • Makeup done by Riya Sengar personally."/><section className="section-pad"><div className="container bridal-detail"><div className="bridal-visual"><img src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1200&q=88" alt="Bridal beauty"/></div><div><span className="eyebrow">BRIDAL INCLUSIONS</span><h2>Everything you need for a <em>complete look.</em></h2><ul className="feature-list">{s.inclusions.map(x=><li key={x}><span><Check size={15}/></span>{x}</li>)}</ul><div className="exclusion"><b>Exclusion</b><span>Hair Flowers / Gajra</span><small>Brides are requested to bring their own Gajra or preferred hair flowers.</small></div><button className="btn btn-dark" onClick={()=>onNavigate('/book')}>Book bridal makeup <ArrowRight size={17}/></button></div></div></section></> }

function PreBridal({data,onNavigate}:{data:AppData;onNavigate:(p:string)=>void}) { const ps=data.services.filter(s=>s.category==='Pre-Bridal'); return <><PageHero title="Bridal Pre-Packages" subtitle="Pamper yourself before your big day for the perfect bridal glow."/><section className="section-pad"><div className="container package-grid large">{ps.map(p=><article key={p.id} className="package-card light"><span>{p.name}</span><h3>{formatCurrency(p.price)}</h3><ul>{p.inclusions.map(x=><li key={x}><Check size={14}/>{x}</li>)}</ul><button className="btn btn-dark" onClick={()=>onNavigate('/book')}>Choose package <ArrowRight size={15}/></button></article>)}</div></section></> }

function Contact({data,onSave,onToast}:{data:AppData;onSave:(d:AppData)=>void;onToast:(s:string)=>void}) { const [form,setForm]=useState({name:'',email:'',phone:'',message:''}); const submit=()=>{if(!form.name||!form.phone||!form.message){onToast('Please complete the required fields.');return}const d=JSON.parse(JSON.stringify(data)); d.contacts.unshift({id:id('contact'),...form,status:'NEW',createdAt:new Date().toISOString()}); onSave(d);setForm({name:'',email:'',phone:'',message:''});onToast('Your message has been sent.')}; return <><PageHero title="Contact" subtitle="Tell us what you are planning and we will guide you from there."/><section className="section-pad"><div className="container contact-grid"><div className="contact-info card-surface"><span className="eyebrow">VISIT OR CONNECT</span><div className="contact-line"><Phone/><div><small>Call</small><a href={`tel:${data.settings.phone}`}>{data.settings.phone}</a></div></div><div className="contact-line"><Mail/><div><small>Email</small><a href={`mailto:${data.settings.email}`}>{data.settings.email}</a></div></div><div className="contact-line"><MapPin/><div><small>Studio</small><span>{data.settings.address}</span></div></div><a className="btn btn-gold full" href={data.settings.googleMapsUrl||'#'} target="_blank" rel="noreferrer"><MapPin size={16}/> Open location</a></div><div className="card-surface"><span className="eyebrow">SEND A MESSAGE</span><div className="form-grid"><label>Name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Phone<input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label><label>Email<input value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label><label>Message<textarea rows={6} value={form.message} onChange={e=>setForm({...form,message:e.target.value})}/></label></div><button className="btn btn-dark" onClick={submit}>Send enquiry <Send size={16}/></button></div></div></section></> }

function BridalEnquiry({data,onSave,onToast}:{data:AppData;onSave:(d:AppData)=>void;onToast:(s:string)=>void}) { const [f,setF]=useState({name:'',phone:'',email:'',eventDate:'',functionType:'Wedding',preferredService:'Signature Bridal Makeup',preferredTime:'10:00',functions:1,message:''}); const submit=()=>{if(!f.name||!f.phone||!f.eventDate){onToast('Please complete name, phone and event date.');return} const d=JSON.parse(JSON.stringify(data));d.enquiries.unshift({id:id('enq'),...f,status:'NEW',createdAt:new Date().toISOString()});onSave(d);setF({...f,name:'',phone:'',email:'',message:''});onToast('Bridal enquiry received.')}; return <><PageHero title="Bridal Enquiry" subtitle="Share your wedding details and we will help you plan the right look."/><section className="section-pad"><div className="container form-shell card-surface"><div className="form-grid two"><label>Name<input value={f.name} onChange={e=>setF({...f,name:e.target.value})}/></label><label>Phone<input value={f.phone} onChange={e=>setF({...f,phone:e.target.value})}/></label><label>Email<input value={f.email} onChange={e=>setF({...f,email:e.target.value})}/></label><label>Wedding/Event date<input type="date" value={f.eventDate} onChange={e=>setF({...f,eventDate:e.target.value})}/></label><label>Function type<select value={f.functionType} onChange={e=>setF({...f,functionType:e.target.value})}><option>Wedding</option><option>Engagement</option><option>Reception</option><option>Haldi</option><option>Mehendi</option><option>Other</option></select></label><label>Preferred service<select value={f.preferredService} onChange={e=>setF({...f,preferredService:e.target.value})}>{data.services.filter(s=>s.category!=='Pre-Bridal').map(s=><option key={s.id}>{s.name}</option>)}</select></label><label>Preferred time<input type="time" value={f.preferredTime} onChange={e=>setF({...f,preferredTime:e.target.value})}/></label><label>Number of functions<input type="number" min={1} value={f.functions} onChange={e=>setF({...f,functions:Number(e.target.value)})}/></label><label className="full-span">Additional details<textarea rows={6} value={f.message} onChange={e=>setF({...f,message:e.target.value})}/></label></div><button className="btn btn-dark" onClick={submit}>Send bridal enquiry <ArrowRight size={16}/></button></div></section></> }

function CheckDate({data}:{data:AppData}) { const [date,setDate]=useState(today()); const [time,setTime]=useState('10:00'); const count=confirmedCount(data,date,time); const state=data.unavailableDates.includes(date)?'CLOSED':data.unavailableSlots.includes(`${date}|${time}`)?'CLOSED':count>=data.settings.maxBookingsPerSlot?'FULL':count===data.settings.maxBookingsPerSlot-1?'LIMITED':'AVAILABLE'; return <><PageHero title="Check My Date" subtitle="See live slot capacity before you start your booking."/><section className="section-pad"><div className="container check-date-shell card-surface"><div className="form-grid two"><label>Date<input type="date" value={date} min={today()} onChange={e=>setDate(e.target.value)}/></label><label>Preferred time<select value={time} onChange={e=>setTime(e.target.value)}>{timeSlots(data.settings).map(x=><option key={x}>{x}</option>)}</select></label></div><div className={`availability-result ${state.toLowerCase()}`}><span>{state==='AVAILABLE'?<Check/>:state==='LIMITED'?<Clock3/>:<XCircle/>}</span><div><small>LIVE AVAILABILITY</small><h3>{state}</h3><p>{count}/{data.settings.maxBookingsPerSlot} confirmed bookings at {time}</p></div></div><p className="muted">Availability is informational until your booking is reviewed and confirmed.</p></div></section></> }

function BookingStatus({data}:{data:AppData}) { const [bid,setBid]=useState('');const [phone,setPhone]=useState('');const [result,setResult]=useState<Booking|null>(null);const submit=()=>{const b=data.bookings.find(x=>x.id.toLowerCase()===bid.trim().toLowerCase() && x.phone.replace(/\D/g,'').endsWith(phone.replace(/\D/g,'').slice(-6)));setResult(b||null)};return <><PageHero title="Check Booking Status" subtitle="Enter your Booking ID and phone details to view your latest status."/><section className="section-pad"><div className="container status-shell card-surface"><div className="form-grid two"><label>Booking ID<input value={bid} onChange={e=>setBid(e.target.value)} placeholder="RLS-260928-1234"/></label><label>Phone (last 6 digits)<input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="123456"/></label></div><button className="btn btn-dark" onClick={submit}><Search size={16}/> Check status</button>{result?<BookingStatusCard booking={result}/>:bid&&phone?<p className="status-error"><XCircle size={16}/> No matching booking found.</p>:null}</div></section></> }

function BookingStatusCard({booking}:{booking:Booking}) { const stages:BookingStatus[]=['PENDING','CONFIRMED','COMPLETED']; const current=booking.status==='RESCHEDULED'?'RESCHEDULED':booking.status; return <div className="status-card"><div className="status-head"><div><small>BOOKING ID</small><b>{booking.id}</b></div><StatusPill status={booking.status}/></div><div className="status-meta"><span><CalendarDays size={15}/> {booking.date}</span><span><Clock3 size={15}/> {booking.time}</span><span><CreditCard size={15}/> {booking.paymentStatus.replaceAll('_',' ')}</span></div><div className="timeline">{(current==='REJECTED'||current==='CANCELLED'||current==='RESCHEDULED'?['PENDING',current] as string[]:stages).map((s,i)=><div key={s} className="timeline-step"><span className={i<=1||current==='COMPLETED'?'done':''}>{i<=1||current==='COMPLETED'?<Check size={13}/>:i+1}</span><b>{s}</b></div>)}</div>{booking.adminNote&&<div className="admin-note"><small>Studio note</small><p>{booking.adminNote}</p></div>}</div> }

function Booking({data,user,onSave,onLogin,onToast}:{data:AppData;user:User|null;onSave:(d:AppData)=>void;onLogin:()=>void;onToast:(s:string)=>void}) {
  const [step,setStep]=useState(1)
  const [serviceId,setServiceId]=useState(data.services[0]?.id||'')
  const [date,setDate]=useState(today())
  const [time,setTime]=useState('10:00')
  const [form,setForm]=useState({name:user?.name||'',email:user?.email||'',phone:user?.phone||'',notes:''})
  const service=data.services.find(s=>s.id===serviceId)!
  const count=confirmedCount(data,date,time)
  const capacity=count>=data.settings.maxBookingsPerSlot
  const closed=data.unavailableDates.includes(date)||data.unavailableSlots.includes(`${date}|${time}`)
  const validDate=date>=today()&&!closed&&!capacity
  const submit=()=>{
    if(!user){onToast('Please login or register before booking.');onLogin();return}
    if(!validDate){onToast('That slot is unavailable. Please choose another.');return}
    const d=JSON.parse(JSON.stringify(data)) as AppData
    const bid=bookingId(date)
    const booking:Booking={
      id:bid,userId:user.id,serviceId,serviceName:service.name,
      customerName:form.name||user.name,email:form.email||user.email,phone:form.phone,
      date,time,status:'PENDING',paymentStatus:'ADVANCE_PENDING',total:service.price,
      advance:0,remaining:service.price,notes:form.notes,createdAt:new Date().toISOString(),
      updatedAt:new Date().toISOString(),history:[]
    }
    addHistory(booking,'PENDING','Booking request received.')
    d.bookings.unshift(booking)
    pushNotification(d,user.id,'Booking request received',`Your booking ${bid} is pending review.`)
    onSave(d)
    setStep(6)
  }
  return <>
    <PageHero title="Book an Appointment" subtitle="A guided booking flow designed to keep your date, time and service clear."/>
    <section className="section-pad"><div className="container booking-layout">
      <div className="booking-main card-surface">
        <div className="steps"><span className="active">01 Service</span><span className={step>=2?'active':''}>02 Date</span><span className={step>=3?'active':''}>03 Time</span><span className={step>=4?'active':''}>04 Details</span><span className={step>=5?'active':''}>05 Review</span></div>
        {step===1 && <div><h2>Choose your <em>service.</em></h2><div className="select-grid">
          {data.services.map(s=><button key={s.id} className={serviceId===s.id?'selected':''} onClick={()=>setServiceId(s.id)}><span>{s.category}</span><b>{s.name}</b><small>{formatCurrency(s.price)}</small></button>)}
        </div><button className="btn btn-dark" onClick={()=>setStep(2)}>Continue <ArrowRight size={16}/></button></div>}
        {step===2 && <div><h2>Choose your <em>date.</em></h2><label className="big-field">Event date<input type="date" min={today()} value={date} onChange={e=>setDate(e.target.value)}/></label><div className="availability-chip"><span className={`dot ${capacity||closed?'off':'on'}`}/>{capacity||closed?'This date/time needs another slot.':'Date is open — select your preferred time next.'}</div><div className="wizard-actions"><button className="btn btn-outline dark-outline" onClick={()=>setStep(1)}>Back</button><button className="btn btn-dark" disabled={date<today()} onClick={()=>setStep(3)}>Continue <ArrowRight size={16}/></button></div></div>}
        {step===3 && <div><h2>Choose your <em>time.</em></h2><div className="slot-grid">
          {timeSlots(data.settings).map(x=>{const c=confirmedCount(data,date,x);const full=c>=data.settings.maxBookingsPerSlot||data.unavailableSlots.includes(`${date}|${x}`);return <button key={x} className={`${time===x?'selected':''} ${full?'full':''}`} onClick={()=>!full&&setTime(x)} disabled={full}><span>{x}</span><small>{full?'Full':`${c}/${data.settings.maxBookingsPerSlot} booked`}</small></button>})}
        </div><div className="wizard-actions"><button className="btn btn-outline dark-outline" onClick={()=>setStep(2)}>Back</button><button className="btn btn-dark" onClick={()=>setStep(4)}>Continue <ArrowRight size={16}/></button></div></div>}
        {step===4 && <div><h2>Your <em>details.</em></h2><div className="form-grid two"><label>Full name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Phone<input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label><label>Email<input value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label><label>Notes<input value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Optional"/></label></div><div className="wizard-actions"><button className="btn btn-outline dark-outline" onClick={()=>setStep(3)}>Back</button><button className="btn btn-dark" onClick={()=>setStep(5)}>Review <ArrowRight size={16}/></button></div></div>}
        {step===5 && <div><h2>Review your <em>booking.</em></h2><div className="review-booking"><div><small>SERVICE</small><b>{service.name}</b></div><div><small>DATE & TIME</small><b>{date} • {time}</b></div><div><small>TOTAL</small><b>{formatCurrency(service.price)}</b></div><div><small>PAYMENT</small><b>Advance discussed on call</b></div></div><div className="notice"><ShieldCheck size={18}/><span>Your booking is a request until the studio confirms it. Advance is collected manually by the owner on call.</span></div><div className="wizard-actions"><button className="btn btn-outline dark-outline" onClick={()=>setStep(4)}>Back</button><button className="btn btn-gold" onClick={submit}>Submit booking <Check size={16}/></button></div></div>}
        {step===6 && <BookingSuccess data={data} onNavigate={(p)=>{onToast('Booking saved.');window.location.hash=p}}/>}
      </div>
      <aside className="booking-side"><div className="sticky-card"><span className="eyebrow">YOUR SELECTION</span><h3>{service.name}</h3><p>{service.description}</p><div className="summary-line"><span>Price</span><b>{formatCurrency(service.price)}</b></div><div className="summary-line"><span>Date</span><b>{date}</b></div><div className="summary-line"><span>Time</span><b>{time}</b></div><div className="summary-line"><span>Capacity</span><b>{Math.min(count,data.settings.maxBookingsPerSlot)}/{data.settings.maxBookingsPerSlot}</b></div><div className="summary-note"><ShieldCheck size={16}/> Advance is collected manually after the studio calls you.</div></div></aside>
    </div></section>
  </>
}

function BookingSuccess({data,onNavigate}:{data:AppData;onNavigate:(p:string)=>void}) { const b=data.bookings[0]; return <div className="success-panel"><div className="success-icon"><Check size={28}/></div><span className="eyebrow">BOOKING REQUEST RECEIVED</span><h2>You’re on the <em>list.</em></h2><p>Your request has been saved. Keep this booking ID safe and check your status anytime.</p><div className="booking-id-box"><small>BOOKING ID</small><b>{b?.id||'RLS-PENDING'}</b></div><div className="success-actions"><button className="btn btn-dark" onClick={()=>onNavigate('/booking-status')}>Check status <Search size={15}/></button><button className="btn btn-outline dark-outline" onClick={()=>onNavigate('/dashboard')}>Open dashboard</button></div></div> }

function Login({data,onSave,onSuccess}:{data:AppData;onSave:(d:AppData)=>void;onSuccess:()=>void}) { const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [mode,setMode]=useState<'password'|'otp'>('password');const [otp,setOtp]=useState('');const [sent,setSent]=useState(false);const [error,setError]=useState('');const submit=async()=>{setError('');if(mode==='otp'&&!sent){setSent(true);return}if(mode==='otp'){setError(otp==='123456'?'':'For local demo mode, use OTP 123456.');if(otp!=='123456')return;const u=data.users.find(x=>x.email===email);if(!u){setError('Create an account first.');return}setUser(u.id);onSuccess();return}const u=data.users.find(x=>x.email===email);if(!u){setError('Account not found. Please register.');return}const hash=await sha256(password);if(u.password!==hash){setError('Incorrect password.');return}setUser(u.id);onSuccess()};return <AuthShell title="Welcome back" subtitle="Sign in to manage your appointments and booking history."><div className="auth-tabs"><button className={mode==='password'?'active':''} onClick={()=>setMode('password')}>Email + Password</button><button className={mode==='otp'?'active':''} onClick={()=>setMode('otp')}>Mobile OTP</button></div>{mode==='password'?<><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} /></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} /></label></>:<><label>Account email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} /></label>{sent&&<label>Demo OTP<input value={otp} onChange={e=>setOtp(e.target.value)} placeholder="123456"/></label>}</>} {error&&<div className="form-error">{error}</div>}<button className="btn btn-dark full" onClick={submit}>{mode==='otp'?(sent?'Verify OTP':'Send OTP'):'Login'} <ArrowRight size={16}/></button><p className="auth-switch">New here? <a onClick={()=>window.location.hash='/register'}>Create an account</a></p><small className="demo-hint">Demo mode: phone OTP is simulated. Production phone OTP should be connected to a real SMS provider through Supabase/Firebase.</small></AuthShell> }

function Register({data,onSave,onSuccess}:{data:AppData;onSave:(d:AppData)=>void;onSuccess:()=>void}) { const [f,setF]=useState({name:'',email:'',phone:'',password:''});const [error,setError]=useState('');const submit=async()=>{if(!f.name||!f.email||!f.password||!f.phone){setError('Complete all fields.');return}if(data.users.some(u=>u.email.toLowerCase()===f.email.toLowerCase())){setError('An account with this email already exists.');return}const d=JSON.parse(JSON.stringify(data));const u={id:id('user'),name:f.name,email:f.email,phone:f.phone,password:await sha256(f.password),createdAt:new Date().toISOString()};d.users.unshift(u);onSave(d);setUser(u.id);onSuccess()};return <AuthShell title="Create your account" subtitle="Keep every booking, update and payment note in one place."><div className="form-grid"><label>Full name<input value={f.name} onChange={e=>setF({...f,name:e.target.value})}/></label><label>Email<input type="email" value={f.email} onChange={e=>setF({...f,email:e.target.value})}/></label><label>Phone<input value={f.phone} onChange={e=>setF({...f,phone:e.target.value})}/></label><label>Password<input type="password" value={f.password} onChange={e=>setF({...f,password:e.target.value})}/></label></div>{error&&<div className="form-error">{error}</div>}<button className="btn btn-dark full" onClick={submit}>Create account <ArrowRight size={16}/></button><p className="auth-switch">Already have an account? <a onClick={()=>window.location.hash='/login'}>Login</a></p></AuthShell> }

function AuthShell({children,title,subtitle}:{children:ReactNode;title:string;subtitle:string}) { return <section className="auth-page"><div className="auth-art"><div className="auth-sheen"/><img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=88" alt="Luxury beauty editorial"/><div className="auth-overlay"><img src="./rs-logo.png" alt="RS logo"/><span className="eyebrow">RIYA LUXURY MAKEUP STUDIO</span><h1>Your beauty, <em>beautifully organized.</em></h1></div></div><div className="auth-card"><span className="eyebrow">WELCOME</span><h2>{title}</h2><p>{subtitle}</p>{children}</div></section> }

function Dashboard({data,user,onSave,onLogout,onNavigate,onToast}:{data:AppData;user:User|null;onSave:(d:AppData)=>void;onLogout:()=>void;onNavigate:(p:string)=>void;onToast:(s:string)=>void}) { if(!user){return <RedirectNotice onNavigate={onNavigate} text="Please login to access your customer dashboard." path="/login"/>} const bookings=data.bookings.filter(b=>b.userId===user.id);const notifs=data.notifications.filter(n=>n.userId===user.id); const upcoming=bookings.filter(b=>['PENDING','CONFIRMED','RESCHEDULED'].includes(b.status)); const active=upcoming[0]; const markRead=(idn:string)=>{const d=JSON.parse(JSON.stringify(data));const n=d.notifications.find((x:any)=>x.id===idn);if(n)n.read=true;onSave(d)}; const requestChange=(type:'Cancellation'|'Rescheduling')=>{if(!active){onToast('No active booking.');return}const d=JSON.parse(JSON.stringify(data)); active.notes = `${active.notes||''} | ${type} requested by customer`; active.updatedAt=new Date().toISOString(); const b=d.bookings.find((x:any)=>x.id===active.id); b.notes=active.notes;b.updatedAt=active.updatedAt;onSave(d);onToast(`${type} request sent to the studio.`)}; return <section className="dashboard-page"><div className="container"><div className="dash-top"><div><span className="eyebrow">CUSTOMER DASHBOARD</span><h1>Hi, <em>{user.name.split(' ')[0]}</em>.</h1><p>Everything about your appointments, in one calm place.</p></div><button className="btn btn-outline dark-outline" onClick={onLogout}><LogOut size={15}/> Sign out</button></div><div className="dash-grid"><div className="dash-main"><div className="dash-card hero-dash"><div><small>CURRENT BOOKING</small><h3>{active?.serviceName||'No upcoming booking'}</h3>{active?<div className="status-row"><StatusPill status={active.status}/><span>{active.date} • {active.time}</span></div>:<p>Start by choosing a service and date.</p>}</div><div className="dash-actions">{active?<><button className="btn btn-dark" onClick={()=>onNavigate('/booking-status')}>Track status <ArrowRight size={15}/></button><button className="mini-action" onClick={()=>requestChange('Rescheduling')}><RotateCcw size={15}/> Reschedule</button><button className="mini-action danger" onClick={()=>requestChange('Cancellation')}><XCircle size={15}/> Cancel request</button></>:<button className="btn btn-gold" onClick={()=>onNavigate('/book')}>Book now <ArrowRight size={15}/></button>}</div></div><div className="dash-card"><div className="dash-section-title"><div><small>BOOKING HISTORY</small><h3>Your appointments</h3></div><button className="link-btn" onClick={()=>onNavigate('/booking-status')}>Check status <ArrowRight size={15}/></button></div><div className="booking-list">{bookings.length?bookings.map(b=><div className="booking-row" key={b.id}><div><b>{b.serviceName}</b><span>{b.date} • {b.time}</span><small>{b.id}</small></div><div className="booking-row-right"><StatusPill status={b.status}/><b>{formatCurrency(b.total)}</b></div></div>):<div className="empty">No bookings yet.</div>}</div></div></div><aside className="dash-side"><div className="dash-card"><div className="dash-section-title"><div><small>NOTIFICATIONS</small><h3>Stay updated</h3></div><Bell size={18}/></div>{notifs.length?notifs.slice(0,6).map(n=><button className={`notif ${n.read?'':'unread'}`} key={n.id} onClick={()=>markRead(n.id)}><span>{n.read?'•':'●'}</span><div><b>{n.title}</b><p>{n.message}</p><small>{new Date(n.createdAt).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</small></div></button>):<div className="empty">No notifications.</div>}</div><div className="dash-card"><small>PAYMENT SUMMARY</small><div className="pay-big">{formatCurrency(bookings.reduce((s,b)=>s+b.advance,0))}</div><p className="muted">Advance recorded across your saved bookings.</p></div><div className="dash-card"><small>PROFILE</small><div className="profile-mini"><div className="avatar">{user.name.slice(0,1).toUpperCase()}</div><div><b>{user.name}</b><span>{user.email}</span><span>{user.phone}</span></div></div></div></aside></div></div></section> }

function RedirectNotice({onNavigate,text,path}:{onNavigate:(p:string)=>void;text:string;path:string}) {return <section className="empty-page"><ShieldCheck size={36}/><h2>{text}</h2><button className="btn btn-dark" onClick={()=>onNavigate(path)}>Continue <ArrowRight size={16}/></button></section>}

function AdminShell({data,admin,onSave,onLogin,onLogout,onNavigate,onToast,route}:{data:AppData;admin:boolean;onSave:(d:AppData)=>void;onLogin:()=>void;onLogout:()=>void;onNavigate:(p:string)=>void;onToast:(s:string)=>void;route:string}) { if(!admin) return <AdminLogin data={data} onLogin={onLogin} onSave={onSave}/>; const sub=route.replace('/admin101','')||'/dashboard'; return <div className="admin-shell"><aside className="admin-sidebar"><div className="admin-brand"><img src="./rs-logo.png" alt="RS logo"/><div><b>RIYA</b><span>ADMIN</span></div></div>{[['dashboard','Dashboard',LayoutDashboard],['bookings','Bookings',CalendarDays],['availability','Availability',SlidersHorizontal],['customers','Customers',Users],['payments','Payments',CreditCard],['enquiries','Enquiries',Mail],['portfolio','Portfolio',Upload],['jewellery','Jewellery',Gem],['reviews','Reviews',Star],['social','Social',Instagram],['settings','Settings',Settings],['security','Security',LockKeyhole]].map(([slug,label,Icon])=><button key={String(slug)} className={sub===`/${slug}`||slug==='dashboard'&&sub==='/'?'active':''} onClick={()=>onNavigate(`/admin101/${slug}`)}><Icon size={16}/>{label}</button>)}<button className="admin-logout" onClick={onLogout}><LogOut size={16}/>Logout</button></aside><main className="admin-content"><div className="admin-mobile-head"><button onClick={()=>onNavigate('/')}><img src="./rs-logo.png" alt="RS"/></button><span>ADMIN / {sub.replace('/','').toUpperCase()||'DASHBOARD'}</span></div>{sub==='/dashboard'||sub==='/'?<AdminDashboard data={data}/>:sub==='/bookings'?<AdminBookings data={data} onSave={onSave} onToast={onToast}/>:sub==='/availability'?<AdminAvailability data={data} onSave={onSave} onToast={onToast}/>:sub==='/customers'?<AdminCustomers data={data}/>:sub==='/payments'?<AdminPayments data={data} onSave={onSave}/>:sub==='/enquiries'?<AdminEnquiries data={data} onSave={onSave}/>:sub==='/portfolio'?<AdminPortfolio data={data} onSave={onSave}/>:sub==='/jewellery'?<AdminJewellery data={data} onSave={onSave}/>:sub==='/reviews'?<AdminReviews data={data} onSave={onSave}/>:sub==='/social'?<AdminSocial data={data} onSave={onSave}/>:sub==='/settings'?<AdminSettings data={data} onSave={onSave} onToast={onToast}/>:sub==='/security'?<AdminSecurity data={data} onSave={onSave} onToast={onToast}/>:<AdminDashboard data={data}/>}</main></div> }

function AdminLogin({data,onLogin,onSave}:{data:AppData;onLogin:()=>void;onSave:(d:AppData)=>void}) { const [username,setUsername]=useState('');const [password,setPassword]=useState('');const [confirm,setConfirm]=useState(false);const [error,setError]=useState('');const first=!data.admin.initialized;const submit=async()=>{setError('');if(first&&!confirm){if(!username||!password||password.length<8){setError('Choose an admin ID and a password of at least 8 characters.');return}const d=JSON.parse(JSON.stringify(data));d.admin={username,passwordHash:await sha256(password),initialized:true};onSave(d);onLogin();return}const hash=await sha256(password);if(username!==data.admin.username||hash!==data.admin.passwordHash){setError('Invalid admin ID or password.');return}onLogin()};return <section className="admin-login"><div className="admin-login-card"><img src="./rs-logo.png" alt="RS logo"/><span className="eyebrow">SECURE ADMIN AREA</span><h1>{first?'Set up admin access':'Admin sign in'}</h1><p>{first?'Create your private admin ID and password on first use. This demo stores a hash locally; for production use the included Supabase/RLS setup.':'Enter the private credentials configured for this admin panel.'}</p><label>Admin ID<input value={username} onChange={e=>setUsername(e.target.value)} autoComplete="username"/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password"/></label>{first&&<label className="check"><input type="checkbox" checked={confirm} onChange={e=>setConfirm(e.target.checked)}/><span>I understand this local demo must be connected to a secure backend before public use.</span></label>}{error&&<div className="form-error">{error}</div>}<button className="btn btn-gold full" onClick={submit}>{first?'Initialize admin':'Sign in'} <LockKeyhole size={16}/></button><button className="back-link" onClick={()=>window.location.hash='/'}>← Back to website</button></div></section> }

function AdminDashboard({data}:{data:AppData}) { const count=(s:string)=>data.bookings.filter(b=>b.status===s).length;const revenue=data.bookings.reduce((s,b)=>s+b.advance,0);return <div className="admin-page"><div className="admin-heading"><div><span className="eyebrow">ADMIN OVERVIEW</span><h1>Good evening. <em>Let’s run it.</em></h1></div><div className="admin-date"><CalendarDays size={16}/> {new Date().toLocaleDateString('en-IN',{weekday:'short',day:'2-digit',month:'short',year:'numeric'})}</div></div><div className="metric-grid"><Metric title="Today" value={data.bookings.filter(b=>b.date===today()).length} icon={CalendarDays}/><Metric title="Pending" value={count('PENDING')} icon={Clock3}/><Metric title="Confirmed" value={count('CONFIRMED')} icon={CheckCircle2}/><Metric title="Revenue" value={formatCurrency(revenue)} icon={CreditCard}/></div><div className="admin-dashboard-grid"><div className="admin-card"><div className="dash-section-title"><div><small>BOOKING PIPELINE</small><h3>Latest requests</h3></div></div>{data.bookings.slice(0,8).map(b=><div className="admin-row" key={b.id}><div><b>{b.customerName}</b><span>{b.serviceName}</span><small>{b.date} • {b.time} • {b.id}</small></div><StatusPill status={b.status}/></div>)}</div><div className="admin-card"><div className="dash-section-title"><div><small>CAPACITY</small><h3>Today’s slots</h3></div></div>{timeSlots(data.settings).slice(0,8).map(t=><div className="capacity-row" key={t}><span>{t}</span><div className="capacity-bar"><i style={{width:`${Math.min(100,(confirmedCount(data,today(),t)/data.settings.maxBookingsPerSlot)*100)}%`}}/></div><b>{confirmedCount(data,today(),t)}/{data.settings.maxBookingsPerSlot}</b></div>)}</div></div></div> }
function Metric({title,value,icon:Icon}:{title:string;value:any;icon:any}){return <div className="metric"><span className="metric-icon"><Icon size={18}/></span><small>{title}</small><b>{value}</b></div>}

function AdminBookings({data,onSave,onToast}:{data:AppData;onSave:(d:AppData)=>void;onToast:(s:string)=>void}) {
  const [filter,setFilter]=useState('ALL')
  const [q,setQ]=useState('')
  const [selected,setSelected]=useState<string|null>(null)
  const filters=['ALL','PENDING','APPROVED','REJECTED','RESCHEDULED','CANCELLED','COMPLETED']
  const list=data.bookings.filter(b=>
    (filter==='ALL'||(filter==='APPROVED'?b.status==='CONFIRMED':b.status===filter)) &&
    (!q||`${b.id} ${b.customerName} ${b.phone} ${b.email}`.toLowerCase().includes(q.toLowerCase()))
  )
  const act=(bid:string,action:BookingStatus)=>{
    const d=JSON.parse(JSON.stringify(data)) as AppData
    const b=d.bookings.find(x=>x.id===bid)
    if(!b)return
    if(action==='CONFIRMED' && !['CONFIRMED','RESCHEDULED'].includes(b.status)) {
      const occupied=confirmedCount(d,b.date,b.time)
      if(occupied>=d.settings.maxBookingsPerSlot){onToast('This slot already has the maximum confirmed bookings.');return}
    }
    b.status=action
    addHistory(b,action,`Admin changed status to ${action}.`)
    pushNotification(d,b.userId,`Booking ${action.toLowerCase()}`,`${b.serviceName} • ${b.date} • ${b.time}`)
    onSave(d)
    onToast(`Booking ${bid} updated.`)
  }
  const resched=(bid:string)=>{
    const current=data.bookings.find(b=>b.id===bid)
    if(!current)return
    const nd=prompt('New date (YYYY-MM-DD)',current.date); if(!nd)return
    const nt=prompt('New time (HH:MM)',current.time||'10:00'); if(!nt)return
    const d=JSON.parse(JSON.stringify(data)) as AppData
    const b=d.bookings.find(x=>x.id===bid); if(!b)return
    const occupied=d.bookings.filter(x=>x.id!==bid && x.date===nd && x.time===nt && ['CONFIRMED','RESCHEDULED'].includes(x.status)).length
    if(occupied>=d.settings.maxBookingsPerSlot){onToast('Selected slot is already full.');return}
    const oldDate=b.date,oldTime=b.time
    b.date=nd;b.time=nt;b.status='RESCHEDULED'
    addHistory(b,'RESCHEDULED','Admin rescheduled the booking.',{oldDate,newDate:nd,oldTime,newTime:nt})
    pushNotification(d,b.userId,'Booking rescheduled',`New time: ${nd} • ${nt}`)
    onSave(d);onToast('Booking rescheduled.')
  }
  return <div className="admin-page">
    <AdminHeader title="Bookings" subtitle="Approve, reject, reschedule and track every booking."/>
    <div className="admin-card">
      <div className="filter-toolbar"><div className="searchbox"><Search size={15}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search booking, customer, phone…"/></div><div className="filter-scroll">{filters.map(f=><button key={f} className={filter===f?'active':''} onClick={()=>setFilter(f)}>{f}</button>)}</div></div>
      <div className="table-wrap"><table><thead><tr><th>Booking</th><th>Customer</th><th>Date</th><th>Status</th><th>Payment</th><th>Actions</th></tr></thead><tbody>
        {list.map(b=><tr key={b.id}><td><b>{b.id}</b><span>{b.serviceName}</span></td><td><b>{b.customerName}</b><span>{b.phone}</span></td><td><b>{b.date}</b><span>{b.time}</span></td><td><StatusPill status={b.status}/></td><td><span>{b.paymentStatus.replaceAll('_',' ')}</span><b>{formatCurrency(b.advance)} paid</b></td><td><div className="row-actions"><button title="Approve" onClick={()=>act(b.id,'CONFIRMED')}><Check/></button><button title="Reject" onClick={()=>act(b.id,'REJECTED')}><XCircle/></button><button title="Reschedule" onClick={()=>resched(b.id)}><RotateCcw/></button><button title="Complete" onClick={()=>act(b.id,'COMPLETED')}><CheckCircle2/></button><button title="Details" onClick={()=>setSelected(selected===b.id?null:b.id)}><ChevronDown/></button></div></td></tr>)}
        {!list.length&&<tr><td colSpan={6}><div className="empty">No bookings found.</div></td></tr>}
      </tbody></table></div>
      {selected&&<BookingAdminDetail booking={data.bookings.find(b=>b.id===selected)!} data={data} onSave={onSave}/>} 
    </div>
  </div>
}

function BookingAdminDetail({booking,data,onSave}:{booking:Booking;data:AppData;onSave:(d:AppData)=>void}) { const [advance,setAdvance]=useState(booking.advance.toString());const [note,setNote]=useState(booking.adminNote||'');const save=()=>{const d=JSON.parse(JSON.stringify(data));const b=d.bookings.find((x:any)=>x.id===booking.id);if(!b)return;b.advance=Math.max(0,Math.min(Number(advance)||0,b.total));b.remaining=b.total-b.advance;b.paymentStatus=b.advance===0?'ADVANCE_PENDING':b.advance>=b.total?'FULLY_PAID':'PARTIALLY_PAID';b.adminNote=note;b.updatedAt=new Date().toISOString();onSave(d)};return <div className="detail-panel"><div><small>DETAILS</small><h3>{booking.id}</h3><p>{booking.customerName} • {booking.email} • {booking.phone}</p></div><div className="detail-grid"><div><small>Service</small><b>{booking.serviceName}</b></div><div><small>Date</small><b>{booking.date} • {booking.time}</b></div><label><small>Advance paid</small><input value={advance} onChange={e=>setAdvance(e.target.value)}/></label><label><small>Admin note</small><textarea value={note} onChange={e=>setNote(e.target.value)} rows={3}/></label></div><button className="btn btn-dark" onClick={save}>Save booking details <Check size={15}/></button></div> }

function AdminAvailability({data,onSave,onToast}:{data:AppData;onSave:(d:AppData)=>void;onToast:(s:string)=>void}) { const [date,setDate]=useState(today());const [time,setTime]=useState('10:00');const unavailable=data.unavailableDates.includes(date); const toggleDate=()=>{const d=JSON.parse(JSON.stringify(data));d.unavailableDates=d.unavailableDates.includes(date)?d.unavailableDates.filter((x:string)=>x!==date):[...d.unavailableDates,date];onSave(d);onToast(unavailable?'Date reopened.':'Date blocked.')} ; const toggleSlot=()=>{const key=`${date}|${time}`;const d=JSON.parse(JSON.stringify(data));d.unavailableSlots=d.unavailableSlots.includes(key)?d.unavailableSlots.filter((x:string)=>x!==key):[...d.unavailableSlots,key];onSave(d);onToast('Slot availability updated.')} ;return <div className="admin-page"><AdminHeader title="Availability" subtitle="Control dates and time slots; capacity is limited to two confirmed bookings."/><div className="availability-admin"><div className="admin-card"><span className="eyebrow">DATE CONTROL</span><label>Date<input type="date" min={today()} value={date} onChange={e=>setDate(e.target.value)}/></label><button className={`btn ${unavailable?'btn-outline dark-outline':'btn-dark'}`} onClick={toggleDate}>{unavailable?'Open date':'Block date'}</button></div><div className="admin-card"><span className="eyebrow">SLOT CONTROL</span><label>Time<select value={time} onChange={e=>setTime(e.target.value)}>{timeSlots(data.settings).map(x=><option key={x}>{x}</option>)}</select></label><div className="slot-status"><b>{confirmedCount(data,date,time)}/{data.settings.maxBookingsPerSlot}</b><span>confirmed bookings</span></div><button className="btn btn-dark" onClick={toggleSlot}>{data.unavailableSlots.includes(`${date}|${time}`)?'Open slot':'Block slot'}</button></div></div><div className="admin-card"><div className="dash-section-title"><div><small>DAILY CAPACITY</small><h3>{date}</h3></div><div className="legend"><span><i className="dot on"/>Open</span><span><i className="dot off"/>Full/closed</span></div></div><div className="capacity-grid">{timeSlots(data.settings).map(t=>{const c=confirmedCount(data,date,t);const full=c>=data.settings.maxBookingsPerSlot||data.unavailableSlots.includes(`${date}|${t}`);return <button className={`capacity-chip ${full?'full':''}`} key={t} onClick={()=>setTime(t)}><b>{t}</b><span>{full?'FULL':`${c}/${data.settings.maxBookingsPerSlot}`}</span></button>})}</div></div></div> }

function AdminCustomers({data}:{data:AppData}) { return <div className="admin-page"><AdminHeader title="Customers" subtitle="Customer accounts and booking history."/><div className="admin-card"><div className="table-wrap"><table><thead><tr><th>Customer</th><th>Phone</th><th>Created</th><th>Bookings</th></tr></thead><tbody>{data.users.map(u=><tr key={u.id}><td><b>{u.name}</b><span>{u.email}</span></td><td>{u.phone}</td><td>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td><td>{data.bookings.filter(b=>b.userId===u.id).length}</td></tr>)}</tbody></table></div></div></div> }
function AdminPayments({data,onSave}:{data:AppData;onSave:(d:AppData)=>void}) { const [sel,setSel]=useState<string|null>(null); const total=data.bookings.reduce((s,b)=>s+b.total,0),paid=data.bookings.reduce((s,b)=>s+b.advance,0);const full=data.bookings.filter(b=>b.paymentStatus==='FULLY_PAID').length;return <div className="admin-page"><AdminHeader title="Payments" subtitle="Manual advance and balance tracking."/><div className="metric-grid"><Metric title="Booked value" value={formatCurrency(total)} icon={BarChart3}/><Metric title="Advance paid" value={formatCurrency(paid)} icon={CreditCard}/><Metric title="Fully paid" value={full} icon={CheckCircle2}/></div><div className="admin-card"><div className="table-wrap"><table><thead><tr><th>Booking</th><th>Customer</th><th>Total</th><th>Advance</th><th>Remaining</th><th>Status</th></tr></thead><tbody>{data.bookings.map(b=><tr key={b.id} onClick={()=>setSel(b.id)} className="clickable"><td><b>{b.id}</b><span>{b.serviceName}</span></td><td>{b.customerName}</td><td>{formatCurrency(b.total)}</td><td>{formatCurrency(b.advance)}</td><td>{formatCurrency(b.remaining)}</td><td>{b.paymentStatus.replaceAll('_',' ')}</td></tr>)}</tbody></table></div>{sel&&<BookingAdminDetail booking={data.bookings.find(b=>b.id===sel)!} data={data} onSave={onSave}/>}</div></div> }
function AdminEnquiries({data,onSave}:{data:AppData;onSave:(d:AppData)=>void}) { const update=(idn:string,status:any)=>{const d=JSON.parse(JSON.stringify(data));const e=d.enquiries.find((x:any)=>x.id===idn);if(e)e.status=status;onSave(d)};return <div className="admin-page"><AdminHeader title="Enquiries" subtitle="Bridal and general enquiries from the site."/><div className="admin-list">{data.enquiries.map(e=><div className="enquiry-card admin-card" key={e.id}><div><small>{e.createdAt.slice(0,10)}</small><h3>{e.name}</h3><span>{e.phone} • {e.email}</span><p>{e.functionType} • {e.eventDate} • {e.preferredService}</p><p>{e.message}</p></div><div className="row-actions"><button onClick={()=>update(e.id,'CONTACTED')}><Check/></button><button onClick={()=>update(e.id,'CLOSED')}><XCircle/></button></div></div>)}{!data.enquiries.length&&<div className="admin-card empty">No enquiries yet.</div>}</div></div> }
function AdminPortfolio({data,onSave}:{data:AppData;onSave:(d:AppData)=>void}) { const [title,setTitle]=useState('');const [url,setUrl]=useState('');const [category,setCategory]=useState('Bridal');const add=()=>{if(!title||!url)return;const d=JSON.parse(JSON.stringify(data));d.portfolio.unshift({id:id('p'),title,category,image:url,featured:false});onSave(d);setTitle('');setUrl('')};const del=(idn:string)=>{const d=JSON.parse(JSON.stringify(data));d.portfolio=d.portfolio.filter((x:any)=>x.id!==idn);onSave(d)};return <div className="admin-page"><AdminHeader title="Portfolio" subtitle="Manage the gallery and replace temporary images as your own work grows."/><div className="admin-card"><div className="form-grid three"><label>Title<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Look name"/></label><label>Image URL<input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://…"/></label><label>Category<select value={category} onChange={e=>setCategory(e.target.value)}><option>Bridal</option><option>HD Makeup</option><option>Signature</option><option>Normal Makeup</option><option>Hairstyling</option><option>Before & After</option><option>Bridal Jewellery</option><option>Beauty Looks</option><option>Makeup Details</option></select></label></div><button className="btn btn-dark" onClick={add}><Plus size={15}/> Add portfolio item</button></div><div className="admin-card"><div className="gallery-admin-grid">{data.portfolio.map(p=><div className="admin-image-card" key={p.id}><img src={p.image} alt={p.title}/><div><b>{p.title}</b><span>{p.category}</span><button onClick={()=>del(p.id)}><Trash2 size={14}/></button></div></div>)}</div></div></div> }
function AdminJewellery({data,onSave}:{data:AppData;onSave:(d:AppData)=>void}) { const [name,setName]=useState('');const [image,setImage]=useState('');const [rental,setRental]=useState('2000');const [deposit,setDeposit]=useState('3000');const add=()=>{if(!name||!image)return;const d=JSON.parse(JSON.stringify(data));d.jewellery.unshift({id:id('j'),name,category:'Bridal Set',image,rental:Number(rental),deposit:Number(deposit),available:true});onSave(d);setName('');setImage('')};const del=(idn:string)=>{const d=JSON.parse(JSON.stringify(data));d.jewellery=d.jewellery.filter((x:any)=>x.id!==idn);onSave(d)};return <div className="admin-page"><AdminHeader title="Jewellery" subtitle="Manage rental pieces, deposits and availability."/><div className="admin-card"><div className="form-grid four"><label>Name<input value={name} onChange={e=>setName(e.target.value)}/></label><label>Image URL<input value={image} onChange={e=>setImage(e.target.value)}/></label><label>Rental<input value={rental} onChange={e=>setRental(e.target.value)}/></label><label>Deposit<input value={deposit} onChange={e=>setDeposit(e.target.value)}/></label></div><button className="btn btn-dark" onClick={add}><Plus size={15}/> Add jewellery</button></div><div className="admin-card"><div className="jewel-grid">{data.jewellery.map(j=><div key={j.id} className="jewel-card"><div className="jewel-image"><img src={j.image} alt={j.name}/></div><div className="jewel-body"><b>{j.name}</b><p>{formatCurrency(j.rental)} rental • {formatCurrency(j.deposit)} deposit</p><button onClick={()=>del(j.id)}><Trash2 size={14}/> Delete</button></div></div>)}</div></div></div> }
function AdminReviews({data,onSave}:{data:AppData;onSave:(d:AppData)=>void}) { const action=(idn:string,approve:boolean)=>{const d=JSON.parse(JSON.stringify(data));const r=d.reviews.find((x:any)=>x.id===idn);if(r)r.approved=approve;onSave(d)};return <div className="admin-page"><AdminHeader title="Reviews" subtitle="Approve feedback before it appears publicly."/><div className="admin-list">{data.reviews.map(r=><div className="admin-card enquiry-card" key={r.id}><div><div className="stars">{'★'.repeat(r.rating)}</div><h3>{r.name}</h3><span>{r.service}</span><p>{r.text}</p></div><div className="row-actions">{!r.approved&&<button onClick={()=>action(r.id,true)}><Check/></button>}<button onClick={()=>action(r.id,false)}><XCircle/></button></div></div>)}</div></div> }
function AdminSocial({data,onSave}:{data:AppData;onSave:(d:AppData)=>void}) { const [instagram,setInstagram]=useState(data.settings.instagram);const [maps,setMaps]=useState(data.settings.googleMapsUrl);const save=()=>{const d=JSON.parse(JSON.stringify(data));d.settings.instagram=instagram;d.settings.googleMapsUrl=maps;onSave(d)};return <div className="admin-page"><AdminHeader title="Social & Links" subtitle="Keep your public links current as the brand grows."/><div className="admin-card"><div className="form-grid two"><label>Instagram<input value={instagram} onChange={e=>setInstagram(e.target.value)}/></label><label>Google Maps URL<input value={maps} onChange={e=>setMaps(e.target.value)} placeholder="Add your exact Maps link later"/></label></div><button className="btn btn-dark" onClick={save}>Save links <Check size={15}/></button></div></div> }
function AdminSettings({data,onSave,onToast}:{data:AppData;onSave:(d:AppData)=>void;onToast:(s:string)=>void}) { const [f,setF]=useState<SiteSettings>(JSON.parse(JSON.stringify(data.settings)));const save=()=>{onSave({...data,settings:f});onToast('Settings saved.')} ;return <div className="admin-page"><AdminHeader title="Settings" subtitle="Business details and booking rules."/><div className="admin-card"><div className="form-grid two"><label>Business name<input value={f.businessName} onChange={e=>setF({...f,businessName:e.target.value})}/></label><label>Founder<input value={f.founder} onChange={e=>setF({...f,founder:e.target.value})}/></label><label>Email<input value={f.email} onChange={e=>setF({...f,email:e.target.value})}/></label><label>Phone<input value={f.phone} onChange={e=>setF({...f,phone:e.target.value})}/></label><label className="full-span">Address<textarea value={f.address} onChange={e=>setF({...f,address:e.target.value})}/></label><label>Opening time<input type="time" value={f.workingStart} onChange={e=>setF({...f,workingStart:e.target.value})}/></label><label>Closing time<input type="time" value={f.workingEnd} onChange={e=>setF({...f,workingEnd:e.target.value})}/></label><label>Slot minutes<input type="number" min={15} value={f.slotMinutes} onChange={e=>setF({...f,slotMinutes:Number(e.target.value)})}/></label><label>Max confirmed / slot<input type="number" min={1} max={4} value={f.maxBookingsPerSlot} onChange={e=>setF({...f,maxBookingsPerSlot:Number(e.target.value)})}/></label></div><button className="btn btn-dark" onClick={save}>Save settings <Check size={15}/></button></div><div className="admin-card"><div className="notice"><ShieldCheck size={18}/><span>Google Maps is intentionally blank until you provide the exact studio pin. Never invent location data.</span></div></div></div> }
function AdminSecurity({data,onSave,onToast}:{data:AppData;onSave:(d:AppData)=>void;onToast:(s:string)=>void}) { const [username,setUsername]=useState(data.admin.username);const [newPass,setNewPass]=useState('');const save=async()=>{if(!username||newPass.length<8){onToast('Use an admin ID and an 8+ character password.');return}const d=JSON.parse(JSON.stringify(data));d.admin.username=username;d.admin.passwordHash=await sha256(newPass);d.admin.initialized=true;onSave(d);setNewPass('');onToast('Admin credentials updated.')} ;const factory=()=>{const ok=confirm('Reset all local demo data? This cannot be undone.');if(ok){resetData();location.reload()}};return <div className="admin-page"><AdminHeader title="Security" subtitle="Local demo security controls and safe credential practices."/><div className="admin-card"><div className="form-grid two"><label>Admin ID<input value={username} onChange={e=>setUsername(e.target.value)}/></label><label>New password<input type="password" value={newPass} onChange={e=>setNewPass(e.target.value)} placeholder="Leave blank to keep current"/></label></div><div className="notice"><LockKeyhole size={18}/><span>In this static/local build, the admin hash is stored in local storage. For real public deployment, use the included Supabase schema/RLS setup and create the admin as a secure auth user. Never embed the production password in frontend code.</span></div><button className="btn btn-dark" onClick={save}>Save admin credentials <ShieldCheck size={15}/></button></div><div className="admin-card danger-card"><h3>Reset demo data</h3><p>Use only while testing locally. This removes local demo users, bookings and settings.</p><button className="btn btn-danger" onClick={factory}>Reset demo</button></div></div> }
function AdminHeader({title,subtitle}:{title:string;subtitle:string}){return <div className="admin-heading"><div><span className="eyebrow">ADMIN PANEL</span><h1>{title}</h1><p>{subtitle}</p></div><div className="admin-secure"><ShieldCheck size={15}/> Secure session</div></div>}
function StatusPill({status}:{status:BookingStatus}){return <span className={`status-pill ${status.toLowerCase()}`}>{status.replaceAll('_',' ')}</span>}
function PageHero({title,subtitle}:{title:string;subtitle:string}){return <section className="page-hero section-pad"><div className="hero-orb small-orb"/><div className="container"><span className="eyebrow">RIYA LUXURY MAKEUP STUDIO</span><h1>{title}</h1><p>{subtitle}</p></div></section>}
function Footer({data,onNavigate}:{data:AppData;onNavigate:(p:string)=>void}){return <footer className="footer"><div className="container footer-grid"><div><img src="./rs-logo.png" alt="RS logo" className="footer-logo"/><span className="eyebrow">RIYA LUXURY MAKEUP STUDIO</span><p>Luxury bridal artistry and a beautifully organized booking experience.</p></div><div><small>Explore</small><button onClick={()=>onNavigate('/services')}>Services</button><button onClick={()=>onNavigate('/portfolio')}>Portfolio</button><button onClick={()=>onNavigate('/jewellery')}>Jewellery</button><button onClick={()=>onNavigate('/reviews')}>Reviews</button></div><div><small>Book</small><button onClick={()=>onNavigate('/book')}>Book appointment</button><button onClick={()=>onNavigate('/check-date')}>Check my date</button><button onClick={()=>onNavigate('/booking-status')}>Check booking</button><button onClick={()=>onNavigate('/contact')}>Contact</button></div><div><small>Studio</small><span>{data.settings.address}</span><a href={`mailto:${data.settings.email}`}>{data.settings.email}</a><a href={`tel:${data.settings.phone}`}>{data.settings.phone}</a><a href={data.settings.instagram} target="_blank" rel="noreferrer"><Instagram size={15}/> Instagram</a></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} Riya Luxury Makeup Studio. All rights reserved.</span><div><button onClick={()=>onNavigate('/privacy-policy')}>Privacy</button><button onClick={()=>onNavigate('/terms')}>Terms</button></div></div></footer> }
function Legal({title}:{title:string}){return <><PageHero title={title} subtitle="Please review the studio policies before placing a booking."/><section className="section-pad"><div className="container policy card-surface"><h2>{title}</h2><p>This website is a presentation and booking interface for Riya Luxury Makeup Studio. Business-specific policy text should be finalized by the owner before publishing as a legal document.</p><p>Do not use this demo text as legal advice. Replace it with the studio’s final, reviewed policy wording.</p></div></section></>}
function PackageShell(){return null}
function timeSlots(settings:SiteSettings){const [sh,sm]=settings.workingStart.split(':').map(Number);const [eh,em]=settings.workingEnd.split(':').map(Number);const minutes=(h:number,m:number)=>h*60+m;const start=minutes(sh,sm),end=minutes(eh,em);const out:string[]=[];for(let t=start;t<end;t+=settings.slotMinutes){const h=Math.floor(t/60),m=t%60;out.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`)}return out}

export default App
