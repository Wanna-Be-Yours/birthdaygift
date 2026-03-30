import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// SUPABASE CONFIG — ganti dengan kredensial kamu
// ============================================================
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase REST helper (tanpa library tambahan)
const supabase = {
  async getLetters() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/letters?order=year.asc`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (!res.ok) throw new Error("Gagal fetch letters");
    return res.json();
  },
  async addLetter(data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/letters`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Gagal simpan letter");
    return res.json();
  },
  async getSongs() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/songs?order=created_at.desc`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (!res.ok) throw new Error("Gagal fetch songs");
    return res.json();
  },
  async logVisit() {
    await fetch(`${SUPABASE_URL}/rest/v1/visits`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ visited_at: new Date().toISOString() }),
    });
  },
};

// ============================================================
// FALLBACK DATA (dipakai jika Supabase belum dikonfigurasi)
// ============================================================
const FALLBACK_LETTERS = [
  {
    id: 1,
    year: 2024,
    from_label: "Dari Seseorang Pada Tahun 2024",
    content: `Happy BirthDay Hanifah Dzikra Rabbani..

Surat ini aku tulis ditanggal 28 Maret 2024 ketika bulan puasa, ntah apa yang ngebikin aku bikin surat ini sekarang, aku cuman pengen ngucapin happy birthday yaa... walaupun kecepetan 2 hari tapi aku pengen aja ngucapin duluan, semoga di tahun 2024 kamu dipenuhi sama orang orang baik, orang orang yang bisa ngertiin kamu, selalu bereaksi dengan apapun yang kamu lakuin, dengerin keluh kesah kamu, dan lebih terbuka lagi ke orang itu, semoga waktu nanti keterima juga di SMA pilihan kamu itu, walaupun yaa aku ga bakal bisa liat kamu lagi... tapi jujur si aga percuma juga ngeliat kamu sama temen deket aku sendiri haha, jujur aja surat ini gatau bisa aku kirim ke kamu, atau surat ini cuman bisa jadi catatan doang, semoga aja bisa ke kirim.`,
  },
  {
    id: 2,
    year: 2025,
    from_label: "Dari Seseorang Pada Tahun 2025",
    content: `Happy BirthDay lagi ya Hanifah Dzikra Rabbani..

Aku gatau surat ini bisa kesampein ke kamu atau engga, aku kurang yakin bisa kirim ini ke kamu karna surat sebelumnya aja cuman ada di file hp kesimpen rapih. Semoga di tahun ini dan kedepannya kamu bisa menjadi seseorang yang selalu bahagia, selalu di pertemukan dengan hal-hal yang baik, inget selalu jaga kesehatannya hanii, jangan ga pedulian sama kesehatan, mungkin kamu selalu ngira itu sepele cuman bagi seseorang kesehatan kamu itu beneran berharga, semoga di tahun ini juga harapan sama semua keingan kamu bisa terkabul.`,
  },
  {
    id: 3,
    year: 2025,
    from_label: "Tambahan — Dari Seseorang Pada Tahun 2025",
    content: `Ntah apa yang aku pikirin sampe aku bikin ini setiap tahun dan aku ga pernah kirim ini ke kamu, rasa bersalah aku ke kamu gabisa aku ilangin, jujur aku takut banget ngobrol sama kamu, aku takut bikin kamu risih kalo ngobrol sama aku, jujur aku juga selalu pengen ngobrol sama kamu tapi gengsi buat ngobrolnya, aku benci sama diri aku yang ga berani buat ngobrol sesuatu sama kamu.`,
  },
  {
    id: 4,
    year: 2026,
    from_label: "Dari Seseorang Pada Tahun 2026",
    content: `DAMNNN TAUNN INI UDAA 17??? wkakakaka yang dulu nya cuman bocil sekarang udaa nyampe 17 taun ajaa, aku harap kamu selalu bertahan di setiap kondisi selalu jaga kesehatannya, semmoga kedepannya semakin di kelilingin sama orang orang baik, aku kangen. I miss everything what we had before, banyak hal yang selalu aku pengen aku obrolin ke kamu, banyak banget ungkapan ungkapan yang pengen aku bilang ke kamu, sekali aja aku pengen ngobrol lagi. mungkin kamu lupa semua nya tapi aku masi pengen ngebahas beberapa hal. anw happpyy birthdayy yangg ke 17 yaa, makasii udaa bacaa. oiya aku juga udaa ngasii gift kecil buat kamu semoga suka, aku gatau apa yang kamu suka sekarang tapi aku harap kamu masi suka hal hal yang aku kasi itu.`,
  },
];

// ============================================================
// CONFETTI ENGINE
// ============================================================
function ConfettiCanvas() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#f49ac2", "#fbc6dc", "#a8e6cf", "#ffd3b6", "#ffaaa5", "#fff5ba", "#c7ceea"];
    const shapes = ["circle", "rect", "triangle"];

    for (let i = 0; i < 180; i++) {
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: -Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 3 + 1,
        size: Math.random() * 10 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 6,
        opacity: 1,
        life: 1,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current = particlesRef.current.filter((p) => p.life > 0);

      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        if (p.y > canvas.height) p.life = 0;

        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.moveTo(0, -p.size / 2);
          ctx.lineTo(p.size / 2, p.size / 2);
          ctx.lineTo(-p.size / 2, p.size / 2);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      });

      if (particlesRef.current.length > 0) {
        animRef.current = requestAnimationFrame(draw);
      }
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 999,
      }}
    />
  );
}

// ============================================================
// FLOATING PARTICLES (background ambiance)
// ============================================================
function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    emoji: ["🌸", "✨", "💕", "🌷", "⭐", "💫"][i % 6],
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 8 + Math.random() * 6,
    size: 16 + Math.random() * 16,
  }));

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
      {particles.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            bottom: "-40px",
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            animation: `floatUp ${p.duration}s ${p.delay}s infinite linear`,
            opacity: 0.6,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}

// ============================================================
// MUSIC PLAYER
// ============================================================
function MusicPlayer({ songs }) {
  const [playing, setPlaying] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [volume, setVolume] = useState(0.4);
  const [expanded, setExpanded] = useState(false);
  const audioRef = useRef(null);

  const currentSong = songs[currentIdx] || null;

  useEffect(() => {
    if (!audioRef.current || !currentSong) return;
    audioRef.current.volume = volume;
    if (playing) {
      audioRef.current.play().catch(() => setPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }, [playing, currentIdx, volume]);

  const toggle = () => setPlaying((p) => !p);
  const next = () => setCurrentIdx((i) => (i + 1) % songs.length);
  const prev = () => setCurrentIdx((i) => (i - 1 + songs.length) % songs.length);

  if (!currentSong) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 100,
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(16px)",
        borderRadius: expanded ? "20px" : "50px",
        boxShadow: "0 8px 32px rgba(244,154,194,0.35)",
        padding: expanded ? "16px 20px" : "10px 18px",
        transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
        minWidth: expanded ? "260px" : "auto",
        border: "1.5px solid rgba(244,154,194,0.3)",
        cursor: "pointer",
        fontFamily: "'Georgia', serif",
      }}
    >
      {currentSong.url && (
        <audio
          ref={audioRef}
          src={currentSong.url}
          loop={songs.length === 1}
          onEnded={next}
        />
      )}

      {/* Collapsed: just note icon + song name */}
      {!expanded && (
        <div
          onClick={() => setExpanded(true)}
          style={{ display: "flex", alignItems: "center", gap: "10px" }}
        >
          <span style={{ fontSize: "20px", animation: playing ? "spin 3s linear infinite" : "none" }}>
            🎵
          </span>
          <span style={{ fontSize: "13px", color: "#c06090", fontWeight: 600, maxWidth: "120px", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
            {currentSong.title}
          </span>
        </div>
      )}

      {/* Expanded player */}
      {expanded && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "13px", color: "#999" }}>Now Playing</span>
            <button onClick={() => setExpanded(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#c06090" }}>✕</button>
          </div>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#c06090", marginBottom: "4px", textAlign: "center" }}>
            {currentSong.title}
          </div>
          <div style={{ fontSize: "12px", color: "#999", textAlign: "center", marginBottom: "14px" }}>
            {currentSong.artist || "Unknown Artist"}
          </div>

          {/* Controls */}
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "12px" }}>
            <button onClick={prev} style={btnStyle}>⏮</button>
            <button onClick={toggle} style={{ ...btnStyle, background: "#f49ac2", color: "white", width: "42px", height: "42px", fontSize: "18px" }}>
              {playing ? "⏸" : "▶"}
            </button>
            <button onClick={next} style={btnStyle}>⏭</button>
          </div>

          {/* Volume */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px" }}>🔈</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(+e.target.value)}
              style={{ flex: 1, accentColor: "#f49ac2" }}
            />
            <span style={{ fontSize: "12px" }}>🔊</span>
          </div>
        </div>
      )}
    </div>
  );
}

const btnStyle = {
  background: "rgba(244,154,194,0.15)",
  border: "none",
  borderRadius: "50%",
  width: "36px",
  height: "36px",
  fontSize: "16px",
  cursor: "pointer",
  color: "#c06090",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background 0.2s",
};

// ============================================================
// LETTER CARD
// ============================================================
function LetterCard({ letter, index, visible }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.88)",
        borderRadius: "20px",
        boxShadow: "0 8px 32px rgba(244,154,194,0.18)",
        border: "1.5px solid rgba(244,154,194,0.25)",
        overflow: "hidden",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(50px) scale(0.95)",
        transition: `all 0.7s cubic-bezier(0.34,1.3,0.64,1) ${index * 0.18}s`,
        fontFamily: "'Georgia', serif",
        cursor: "pointer",
      }}
      onClick={() => setOpen((o) => !o)}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #fbc6dc, #f8e1f4)",
          padding: "18px 22px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: "11px", color: "#c06090", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>
            📮 {letter.year || ""}
          </div>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#8b3a62" }}>
            {letter.from_label}
          </div>
        </div>
        <span
          style={{
            fontSize: "20px",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
            display: "block",
          }}
        >
          💌
        </span>
      </div>

      {/* Body — accordion */}
      <div
        style={{
          maxHeight: open ? "800px" : "0",
          overflow: "hidden",
          transition: "max-height 0.6s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div
          style={{
            padding: "20px 22px",
            fontSize: "14.5px",
            lineHeight: "1.85",
            color: "#555",
            whiteSpace: "pre-line",
          }}
        >
          {letter.content}
        </div>
      </div>

      {/* Peek */}
      {!open && (
        <div style={{ padding: "10px 22px 14px", fontSize: "13px", color: "#aaa", fontStyle: "italic" }}>
          Ketuk untuk membuka surat... 💌
        </div>
      )}
    </div>
  );
}

// ============================================================
// WRITE MESSAGE FORM
// ============================================================
function WriteForm({ onClose, onSaved }) {
  const [form, setForm] = useState({ year: new Date().getFullYear(), from_label: "", content: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!form.from_label.trim() || !form.content.trim()) return;
    setLoading(true);
    try {
      await supabase.addLetter(form);
      setDone(true);
      setTimeout(() => {
        onSaved();
        onClose();
      }, 1500);
    } catch {
      alert("Gagal menyimpan surat. Cek konfigurasi Supabase-mu ya.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(8px)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "white",
          borderRadius: "24px",
          padding: "32px",
          width: "100%",
          maxWidth: "520px",
          boxShadow: "0 24px 80px rgba(244,154,194,0.3)",
          animation: "popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)",
          fontFamily: "'Georgia', serif",
        }}
      >
        {done ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "52px", marginBottom: "16px" }}>💌</div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "#c06090" }}>Surat tersimpan!</div>
          </div>
        ) : (
          <>
            <h3 style={{ margin: "0 0 24px", color: "#8b3a62", fontSize: "20px" }}>✍️ Tulis Surat Baru</h3>

            <label style={labelStyle}>Tahun</label>
            <input
              type="number"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: +e.target.value })}
              style={inputStyle}
            />

            <label style={labelStyle}>Dari (label)</label>
            <input
              type="text"
              placeholder="cth: Dari Seseorang Pada Tahun 2027"
              value={form.from_label}
              onChange={(e) => setForm({ ...form, from_label: e.target.value })}
              style={inputStyle}
            />

            <label style={labelStyle}>Isi Surat</label>
            <textarea
              placeholder="Tulis perasaanmu di sini..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={8}
              style={{ ...inputStyle, resize: "vertical", minHeight: "160px" }}
            />

            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <button onClick={onClose} style={{ ...actionBtn, background: "#eee", color: "#666", flex: 1 }}>
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{ ...actionBtn, background: "linear-gradient(135deg,#f49ac2,#e06ba0)", color: "white", flex: 2 }}
              >
                {loading ? "Menyimpan..." : "💌 Simpan Surat"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const labelStyle = { display: "block", fontSize: "12px", fontWeight: 700, color: "#c06090", marginBottom: "6px", letterSpacing: "0.05em", textTransform: "uppercase" };
const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: "12px", border: "1.5px solid #fbc6dc", fontSize: "14px", marginBottom: "16px", outline: "none", fontFamily: "'Georgia', serif", boxSizing: "border-box", background: "#fff9fc", color: "#555" };
const actionBtn = { padding: "12px", borderRadius: "12px", border: "none", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "'Georgia', serif", transition: "opacity 0.2s" };

// ============================================================
// COUNTDOWN + CAKE SECTION
// ============================================================
function CountdownSection({ onBlown }) {
  const [count, setCount] = useState(3);
  const [showCake, setShowCake] = useState(false);
  const [flameVisible, setFlameVisible] = useState(true);
  const [blown, setBlown] = useState(false);

  useEffect(() => {
    if (count <= 0) { setShowCake(true); return; }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count]);

  const blowCandle = () => {
    if (blown) return;
    setBlown(true);
    setFlameVisible(false);
    setTimeout(onBlown, 800);
  };

  return (
    <div style={{ textAlign: "center", fontFamily: "'Georgia', serif" }}>
      {!showCake && (
        <div
          style={{
            fontSize: "clamp(5rem,18vw,10rem)",
            fontWeight: 900,
            color: "#f49ac2",
            textShadow: "0 4px 20px rgba(244,154,194,0.4)",
            animation: "pulse 0.5s ease",
            lineHeight: 1,
          }}
        >
          {count}
        </div>
      )}

      {showCake && (
        <div style={{ animation: "fadeInUp 0.6s ease" }}>
          {/* SVG Cake */}
          <svg width="220" height="200" viewBox="0 0 220 200" style={{ overflow: "visible" }}>
            {/* Plate */}
            <ellipse cx="110" cy="185" rx="90" ry="10" fill="#fce4ec" />

            {/* Bottom tier */}
            <rect x="30" y="120" width="160" height="65" rx="14" fill="#f48fb1" />
            <rect x="30" y="120" width="160" height="18" rx="14" fill="#f06292" />

            {/* Frosting drips bottom */}
            {[45, 70, 95, 120, 145, 165].map((x, i) => (
              <ellipse key={i} cx={x} cy="126" rx="10" ry="8" fill="white" opacity="0.8" />
            ))}

            {/* Top tier */}
            <rect x="55" y="65" width="110" height="58" rx="12" fill="#f8bbd0" />
            <rect x="55" y="65" width="110" height="16" rx="12" fill="#f48fb1" />

            {/* Frosting drips top */}
            {[70, 92, 114, 136].map((x, i) => (
              <ellipse key={i} cx={x} cy="70" rx="9" ry="7" fill="white" opacity="0.8" />
            ))}

            {/* Decorations */}
            <circle cx="80" cy="148" r="5" fill="#fff9c4" />
            <circle cx="110" cy="155" r="5" fill="#b2ebf2" />
            <circle cx="140" cy="148" r="5" fill="#fff9c4" />
            <text x="85" y="100" fontSize="22" textAnchor="middle">🎂</text>

            {/* Candle */}
            <rect x="103" y="25" width="14" height="42" rx="5" fill="#fff9c4" stroke="#f9a825" strokeWidth="1" />

            {/* Flame */}
            {flameVisible && (
              <g>
                <ellipse cx="110" cy="20" rx="8" ry="11" fill="#ff8f00" opacity="0.9">
                  <animate attributeName="ry" values="11;13;11" dur="0.3s" repeatCount="indefinite" />
                </ellipse>
                <ellipse cx="110" cy="21" rx="5" ry="7" fill="#ffff00" opacity="0.9">
                  <animate attributeName="ry" values="7;9;7" dur="0.3s" repeatCount="indefinite" />
                </ellipse>
              </g>
            )}
            {!flameVisible && (
              <text x="110" y="18" textAnchor="middle" fontSize="14">💨</text>
            )}
          </svg>

          <p style={{ fontSize: "15px", color: "#888", margin: "16px 0 0", fontStyle: "italic" }}>
            Klik kue untuk matiin apinya 🎂
          </p>

          <div
            onClick={blowCandle}
            style={{
              display: "inline-block",
              marginTop: "16px",
              padding: "12px 32px",
              background: "linear-gradient(135deg,#f49ac2,#e06ba0)",
              color: "white",
              borderRadius: "50px",
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(244,154,194,0.5)",
              transition: "transform 0.2s",
              fontFamily: "'Georgia', serif",
              userSelect: "none",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            🎂 Tiup Lilinnya!
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// TIME SINCE COUNTER
// ============================================================
function TimeSince() {
  const [str, setStr] = useState("");

  useEffect(() => {
    const update = () => {
      const start = new Date("2009-03-30T00:00:00");
      let diff = Math.floor((new Date() - start) / 1000);
      const years = Math.floor(diff / (60 * 60 * 24 * 365));
      diff %= 60 * 60 * 24 * 365;
      const days = Math.floor(diff / (60 * 60 * 24));
      diff %= 60 * 60 * 24;
      const hours = Math.floor(diff / 3600);
      diff %= 3600;
      const minutes = Math.floor(diff / 60);
      const seconds = diff % 60;
      setStr(`${years} tahun ${days} hari ${hours} jam ${minutes} menit ${seconds} detik`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(10px)",
        borderRadius: "16px",
        padding: "14px 24px",
        fontSize: "14px",
        color: "#888",
        fontFamily: "'Georgia', serif",
        fontStyle: "italic",
        margin: "0 auto 32px",
        maxWidth: "580px",
        border: "1px solid rgba(244,154,194,0.3)",
      }}
    >
      ⏳ Sudah <strong style={{ color: "#c06090" }}>{str}</strong> sejak kelahiran wanita tercantik dan termanis kedua setelah ibuku.
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function BirthdayApp() {
  const [phase, setPhase] = useState("countdown"); // countdown | letters
  const [showConfetti, setShowConfetti] = useState(false);
  const [letters, setLetters] = useState(FALLBACK_LETTERS);
  const [songs, setSongs] = useState([]);
  const [cardsVisible, setCardsVisible] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Load data
  useEffect(() => {
    supabase.getLetters().then(setLetters).catch(() => setLetters(FALLBACK_LETTERS));
    supabase.getSongs().then(setSongs).catch(() => {});
    supabase.logVisit().catch(() => {});
  }, []);

  const handleBlown = useCallback(() => {
    setShowConfetti(true);
    setPhase("letters");
    setTimeout(() => setCardsVisible(true), 300);
    setTimeout(() => setShowConfetti(false), 6000);
  }, []);

  const refreshLetters = () => {
    supabase.getLetters().then(setLetters).catch(() => {});
  };

  return (
    <>
      {/* Global styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lora:ital@0;1&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        @keyframes floatUp {
          from { transform: translateY(0) rotate(0deg); opacity: 0.7; }
          to { transform: translateY(-110vh) rotate(360deg); opacity: 0; }
        }
        @keyframes pulse {
          0% { transform: scale(1.4); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0%,100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #f49ac2; border-radius: 99px; }
      `}</style>

      {/* Background */}
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(160deg, #fde8f3 0%, #fef3fb 40%, #e8f3fd 100%)",
          fontFamily: "'Playfair Display', 'Georgia', serif",
          position: "relative",
        }}
      >
        <FloatingParticles />
        {showConfetti && <ConfettiCanvas />}
        {songs.length > 0 && <MusicPlayer songs={songs} />}

        {/* ── COUNTDOWN / CAKE PHASE ── */}
        {phase === "countdown" && (
          <div
            style={{
              minHeight: "100vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              zIndex: 1,
              padding: "40px 20px",
            }}
          >
            <CountdownSection onBlown={handleBlown} />
          </div>
        )}

        {/* ── LETTERS PHASE ── */}
        {phase === "letters" && (
          <div
            style={{
              position: "relative",
              zIndex: 1,
              maxWidth: "760px",
              margin: "0 auto",
              padding: "60px 20px 100px",
            }}
          >
            {/* Header */}
            <div
              style={{
                textAlign: "center",
                marginBottom: "48px",
                opacity: cardsVisible ? 1 : 0,
                transform: cardsVisible ? "translateY(0)" : "translateY(-20px)",
                transition: "all 0.8s ease",
              }}
            >
              <div style={{ fontSize: "52px", marginBottom: "8px", animation: "shimmer 2s ease infinite" }}>🎂</div>
              <h1
                style={{
                  fontSize: "clamp(2rem,6vw,3.5rem)",
                  fontWeight: 900,
                  color: "#c06090",
                  margin: "0 0 8px",
                  textShadow: "0 4px 16px rgba(244,154,194,0.4)",
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                Happy Birthday!
              </h1>
              <p style={{ color: "#b080a0", fontSize: "16px", fontStyle: "italic", margin: 0 }}>
                Hanifah Dzikra Rabbani
              </p>
            </div>

            {/* Time since */}
            <div
              style={{
                opacity: cardsVisible ? 1 : 0,
                transition: "opacity 1s ease 0.3s",
              }}
            >
              <TimeSince />
            </div>

            {/* Letters */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "40px" }}>
              {letters.map((letter, i) => (
                <LetterCard key={letter.id || i} letter={letter} index={i} visible={cardsVisible} />
              ))}
            </div>

            {/* Write button */}
            <div
              style={{
                textAlign: "center",
                opacity: cardsVisible ? 1 : 0,
                transition: "opacity 1s ease 0.8s",
              }}
            >
              <button
                onClick={() => setShowForm(true)}
                style={{
                  background: "linear-gradient(135deg,#f49ac2,#e06ba0)",
                  color: "white",
                  border: "none",
                  borderRadius: "50px",
                  padding: "14px 36px",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 6px 24px rgba(244,154,194,0.45)",
                  fontFamily: "'Georgia', serif",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 32px rgba(244,154,194,0.55)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 6px 24px rgba(244,154,194,0.45)"; }}
              >
                ✍️ Tulis Surat Baru
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Write form modal */}
      {showForm && (
        <WriteForm
          onClose={() => setShowForm(false)}
          onSaved={refreshLetters}
        />
      )}
    </>
  );
}