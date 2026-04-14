"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ── Sample Data: NYC ──────────────────────────────────────────────────────────
const PLACES = [
  // Coffee
  { id: 1, name: "Joe Coffee", category: "coffee", price: 3.5, lat: 40.7282, lng: -73.9942, badge: "underrated", score: 91, tag: "Quiet right now · Underrated gem", minutes: 2 },
  { id: 2, name: "Blank Street Coffee", category: "coffee", price: 4.0, lat: 40.7195, lng: -74.0001, badge: "best", score: 95, tag: "Trending · Best espresso nearby", minutes: 5 },
  { id: 3, name: "Devoción", category: "coffee", price: 5.5, lat: 40.7214, lng: -73.9596, badge: "underrated", score: 88, tag: "Hidden roastery · Worth the detour", minutes: 8 },
  { id: 4, name: "Café Regular du Nord", category: "coffee", price: 3.75, lat: 40.6782, lng: -73.9442, badge: "cheap", score: 84, tag: "Cheapest in area · Great drip", minutes: 12 },
  { id: 5, name: "Prodigy Coffee", category: "coffee", price: 4.25, lat: 40.7489, lng: -73.9680, badge: "best", score: 93, tag: "Not crowded now · Top rated", minutes: 6 },
  { id: 6, name: "Partners Coffee", category: "coffee", price: 4.5, lat: 40.7614, lng: -73.9776, badge: "underrated", score: 87, tag: "Cozy · Underrated · Seats open", minutes: 4 },
  { id: 7, name: "Sweetleaf Coffee", category: "coffee", price: 3.5, lat: 40.7422, lng: -73.9524, badge: "cheap", score: 82, tag: "Budget friendly · Good oat milk", minutes: 9 },
  { id: 8, name: "Butler", category: "coffee", price: 5.0, lat: 40.7248, lng: -74.0030, badge: "best", score: 96, tag: "Best right now · Minimal wait", minutes: 3 },
  // Beer / Bars
  { id: 9, name: "Raines Law Room", category: "beer", price: 16.0, lat: 40.7431, lng: -73.9956, badge: "best", score: 97, tag: "Low key tonight · Worth every $", minutes: 7 },
  { id: 10, name: "Attaboy", category: "beer", price: 14.0, lat: 40.7208, lng: -73.9896, badge: "underrated", score: 90, tag: "No line right now · Hidden", minutes: 11 },
  { id: 11, name: "The Dead Rabbit", category: "beer", price: 17.0, lat: 40.7033, lng: -74.0140, badge: "best", score: 94, tag: "Iconic · Worth the price", minutes: 15 },
  { id: 12, name: "Pouring Ribbons", category: "beer", price: 13.0, lat: 40.7282, lng: -73.9742, badge: "cheap", score: 85, tag: "Cheapest craft cocktails nearby", minutes: 5 },
  { id: 13, name: "Amor y Amargo", category: "beer", price: 12.0, lat: 40.7295, lng: -73.9856, badge: "underrated", score: 89, tag: "Tiny · Underrated · Bitters focus", minutes: 3 },
  { id: 14, name: "Holiday Cocktail Lounge", category: "beer", price: 8.0, lat: 40.7265, lng: -73.9942, badge: "cheap", score: 86, tag: "Divey · Legendary · Very cheap", minutes: 6 },
  { id: 15, name: "Mother's Ruin", category: "beer", price: 11.0, lat: 40.7225, lng: -74.0020, badge: "best", score: 92, tag: "Chill vibe · Not packed tonight", minutes: 8 },
  // Food
  { id: 16, name: "Xi'an Famous Foods", category: "food", price: 9.0, lat: 40.7158, lng: -73.9970, badge: "cheap", score: 94, tag: "Best value in Manhattan", minutes: 4 },
  { id: 17, name: "Superiority Burger", category: "food", price: 8.5, lat: 40.7285, lng: -73.9842, badge: "underrated", score: 91, tag: "Underrated · Veg · Incredible", minutes: 7 },
  { id: 18, name: "Lucali", category: "food", price: 25.0, lat: 40.6782, lng: -73.9822, badge: "best", score: 98, tag: "Best pizza in NYC · Go now", minutes: 22 },
  { id: 19, name: "Di Fara Pizza", category: "food", price: 5.0, lat: 40.6245, lng: -73.9614, badge: "cheap", score: 90, tag: "Legendary · Cheapest slice", minutes: 30 },
  { id: 20, name: "Momofuku Noodle Bar", category: "food", price: 18.0, lat: 40.7282, lng: -73.9900, badge: "best", score: 93, tag: "No wait right now · Top 5 in city", minutes: 5 },
  { id: 21, name: "Cafe Mogador", category: "food", price: 14.0, lat: 40.7255, lng: -73.9813, badge: "underrated", score: 88, tag: "Underrated · Perfect shakshuka", minutes: 6 },
  { id: 22, name: "Ivan Ramen", category: "food", price: 16.0, lat: 40.7226, lng: -74.0052, badge: "best", score: 95, tag: "Best ramen nearby · Seats open", minutes: 9 },
  { id: 23, name: "Los Tacos No. 1", category: "food", price: 6.0, lat: 40.7580, lng: -74.0029, badge: "cheap", score: 92, tag: "Cheapest · Fastest · Incredible", minutes: 2 },
  { id: 24, name: "Katz's Delicatessen", category: "food", price: 22.0, lat: 40.7223, lng: -73.9874, badge: "best", score: 96, tag: "NYC icon · Best pastrami ever", minutes: 8 },
];

const BADGES: Record<string, { label: string; color: string }> = {
  best: { label: "🔥 Best Right Now", color: "#FF6B35" },
  underrated: { label: "💎 Underrated", color: "#6366F1" },
  cheap: { label: "💸 Cheapest", color: "#10B981" },
};

const ICONS: Record<string, string> = { coffee: "☕", beer: "🍺", food: "🍔" };

// ── Mini Map Engine ───────────────────────────────────────────────────────────
function MiniMap({ places, filter, selectedId, onSelectPin }: {
  places: typeof PLACES;
  filter: string;
  selectedId: number | null;
  onSelectPin: (place: typeof PLACES[0] | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const project = useCallback((lat: number, lng: number, w: number, h: number) => {
    const minLat = 40.60, maxLat = 40.82;
    const minLng = -74.08, maxLng = -73.88;
    const x = ((lng - minLng) / (maxLng - minLng)) * w;
    const y = ((maxLat - lat) / (maxLat - minLat)) * h;
    return { x, y };
  }, []);

  const filteredPlaces = filter === "all" ? places : places.filter(p => p.category === filter);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#F0EDE8");
    bg.addColorStop(1, "#E8E4DC");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath(); ctx.moveTo(0, (H / 8) * i + 30); ctx.lineTo(W, (H / 8) * i + 30); ctx.stroke();
    }
    for (let i = 0; i < 6; i++) {
      ctx.beginPath(); ctx.moveTo((W / 6) * i + 25, 0); ctx.lineTo((W / 6) * i + 25, H); ctx.stroke();
    }

    filteredPlaces.forEach(place => {
      const { x, y } = project(place.lat, place.lng, W, H);
      const isSelected = place.id === selectedId;
      const badge = BADGES[place.badge];
      const bw = isSelected ? 68 : 56;
      const bh = isSelected ? 26 : 22;

      ctx.shadowColor = isSelected ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.15)";
      ctx.shadowBlur = isSelected ? 12 : 6;
      ctx.shadowOffsetY = isSelected ? 4 : 2;

      ctx.fillStyle = isSelected ? "#1A1A1A" : "#FFFFFF";
      ctx.beginPath();
      (ctx as any).roundRect(x - bw / 2, y - bh / 2, bw, bh, 99);
      ctx.fill();
      ctx.shadowColor = "transparent";

      const icon = ICONS[place.category];
      const priceStr = `${icon} $${place.price.toFixed(2)}`;
      ctx.font = `${isSelected ? "600" : "500"} ${isSelected ? "11px" : "10px"} -apple-system, sans-serif`;
      ctx.fillStyle = isSelected ? "#FFFFFF" : "#1A1A1A";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(priceStr, x, y);

      ctx.fillStyle = badge.color;
      ctx.beginPath();
      ctx.arc(x + bw / 2 - 5, y - bh / 2 + 5, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [filteredPlaces, selectedId, project]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    const W = canvas.width, H = canvas.height;

    let hit: typeof PLACES[0] | null = null;
    filteredPlaces.forEach(place => {
      const { x, y } = project(place.lat, place.lng, W, H);
      if (mx > x - 34 && mx < x + 34 && my > y - 14 && my < y + 14) hit = place;
    });
    onSelectPin(hit);
  }, [filteredPlaces, project, onSelectPin]);

  const filteredPlaces2 = filter === "all" ? places : places.filter(p => p.category === filter);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={900}
      onClick={handleClick}
      style={{ width: "100%", height: "100%", display: "block", cursor: "pointer" }}
    />
  );
}

// ── AI Worth It explanation ───────────────────────────────────────────────────
async function getWorthItExplanation(place: typeof PLACES[0]) {
  const resp = await fetch("/api/worth-it", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ place }),
  });
  const data = await resp.json();
  return data.text || place.tag;
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function WorthIt() {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<typeof PLACES[0] | null>(null);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [listView, setListView] = useState(false);

  const handleSelect = useCallback(async (place: typeof PLACES[0] | null) => {
    if (!place) { setSheetOpen(false); setSelected(null); return; }
    setSelected(place);
    setSheetOpen(true);
    setAiText("");
    setAiLoading(true);
    try {
      const text = await getWorthItExplanation(place);
      setAiText(text);
    } catch {
      setAiText(place.tag);
    }
    setAiLoading(false);
  }, []);

  const closeSheet = () => { setSheetOpen(false); setSelected(null); };
  const badge = selected ? BADGES[selected.badge] : null;
  const sortedFiltered = [...(filter === "all" ? PLACES : PLACES.filter(p => p.category === filter))].sort((a, b) => b.score - a.score);

  return (
    <div style={{
      fontFamily: "-apple-system, 'Helvetica Neue', sans-serif",
      background: "#F5F2ED",
      minHeight: "100vh",
      maxWidth: 430,
      margin: "0 auto",
      position: "relative",
      overflow: "hidden",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
    }}>

      {/* Header */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 20,
        padding: "16px 20px 12px",
        background: "linear-gradient(to bottom, rgba(245,242,237,0.98) 80%, transparent)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px", color: "#1A1A1A" }}>Worth It</div>
            <div style={{ fontSize: 11, color: "#999", letterSpacing: "0.5px", marginTop: 1 }}>NEW YORK CITY</div>
          </div>
          <button
            onClick={() => setListView(!listView)}
            style={{
              background: listView ? "#1A1A1A" : "white",
              border: "none", borderRadius: 20,
              padding: "8px 14px", fontSize: 12, fontWeight: 600,
              color: listView ? "white" : "#1A1A1A",
              cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            {listView ? "Map" : "List"}
          </button>
        </div>

        {/* Filter Pills */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
          {[
            { key: "all", label: "✦ All" },
            { key: "coffee", label: "☕ Coffee" },
            { key: "beer", label: "🍺 Beer" },
            { key: "food", label: "🍔 Food" },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => { setFilter(f.key); closeSheet(); }}
              style={{
                flexShrink: 0,
                background: filter === f.key ? "#1A1A1A" : "white",
                color: filter === f.key ? "white" : "#1A1A1A",
                border: "none", borderRadius: 20,
                padding: "8px 16px", fontSize: 13, fontWeight: 600,
                cursor: "pointer",
                boxShadow: filter === f.key ? "0 2px 12px rgba(0,0,0,0.2)" : "0 1px 4px rgba(0,0,0,0.08)",
                transition: "all 0.2s ease",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map View */}
      {!listView && (
        <div style={{ flex: 1, position: "relative" }}>
          <MiniMap
            places={PLACES}
            filter={filter}
            selectedId={selected?.id ?? null}
            onSelectPin={handleSelect}
          />
          <div style={{
            position: "absolute", bottom: sheetOpen ? 220 : 24, right: 16,
            background: "white", borderRadius: 12, padding: "10px 12px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)", fontSize: 11,
            transition: "bottom 0.35s cubic-bezier(0.32,0.72,0,1)",
          }}>
            {Object.entries(BADGES).map(([key, val]) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: val.color }} />
                <span style={{ color: "#555", fontWeight: 500 }}>{val.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List View */}
      {listView && (
        <div style={{ flex: 1, overflowY: "auto", paddingTop: 120, paddingBottom: 32, paddingLeft: 16, paddingRight: 16 }}>
          <div style={{ fontSize: 12, color: "#999", fontWeight: 600, letterSpacing: "0.8px", marginBottom: 12 }}>
            {sortedFiltered.length} PLACES · SORTED BY SCORE
          </div>
          {sortedFiltered.map(place => {
            const b = BADGES[place.badge];
            return (
              <div
                key={place.id}
                onClick={() => handleSelect(place)}
                style={{
                  background: "white", borderRadius: 16, padding: "14px 16px",
                  marginBottom: 10, cursor: "pointer",
                  boxShadow: selected?.id === place.id
                    ? "0 0 0 2px #1A1A1A, 0 4px 20px rgba(0,0,0,0.12)"
                    : "0 2px 8px rgba(0,0,0,0.07)",
                  transition: "all 0.2s ease",
                  display: "flex", alignItems: "center", gap: 12,
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: "#F5F2ED", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 20, flexShrink: 0,
                }}>
                  {ICONS[place.category]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#1A1A1A", marginBottom: 2 }}>{place.name}</div>
                  <div style={{ fontSize: 12, color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{place.tag}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#1A1A1A" }}>${place.price}</div>
                  <div style={{ fontSize: 10, color: b.color, fontWeight: 700, marginTop: 2 }}>{b.label.split(" ").slice(0, 2).join(" ")}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Sheet */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        background: "white",
        borderRadius: "24px 24px 0 0",
        boxShadow: "0 -4px 40px rgba(0,0,0,0.12)",
        transform: sheetOpen ? "translateY(0)" : "translateY(110%)",
        transition: "transform 0.35s cubic-bezier(0.32,0.72,0,1)",
        zIndex: 30,
        padding: "0 20px 36px",
        minHeight: 200,
      }}>
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 8px" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "#E0DDD8" }} />
        </div>

        {selected && badge && (
          <>
            <button
              onClick={closeSheet}
              style={{
                position: "absolute", top: 16, right: 20,
                background: "#F5F2ED", border: "none", borderRadius: "50%",
                width: 32, height: 32, cursor: "pointer", fontSize: 16,
                display: "flex", alignItems: "center", justifyContent: "center", color: "#666",
              }}
            >✕</button>

            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: badge.color + "18", borderRadius: 20,
              padding: "5px 12px", marginBottom: 12,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: badge.color }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: badge.color }}>{badge.label}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#1A1A1A", letterSpacing: "-0.4px", maxWidth: "68%" }}>
                {selected.name}
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#1A1A1A" }}>${selected.price}</div>
            </div>

            <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: "#888", fontWeight: 500 }}>📍 {selected.minutes} min away</span>
              <span style={{ fontSize: 13, color: "#888", fontWeight: 500 }}>{ICONS[selected.category]} {selected.category}</span>
              <span style={{ fontSize: 13, color: "#888", fontWeight: 500 }}>⭐ {selected.score}/100</span>
            </div>

            <div style={{ background: "#F5F2ED", borderRadius: 16, padding: "14px 16px", marginBottom: 16, minHeight: 72 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#999", letterSpacing: "0.8px", marginBottom: 6 }}>WHY IT'S WORTH IT</div>
              {aiLoading ? (
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 6, height: 6, borderRadius: "50%", background: "#CCC",
                      animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                  ))}
                  <style>{`@keyframes pulse{0%,100%{opacity:0.3;transform:scale(1)}50%{opacity:1;transform:scale(1.2)}}`}</style>
                </div>
              ) : (
                <div style={{ fontSize: 14, color: "#333", lineHeight: 1.5 }}>{aiText || selected.tag}</div>
              )}
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "#999", fontWeight: 600 }}>Worth It Score</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#1A1A1A" }}>{selected.score}</span>
              </div>
              <div style={{ height: 6, background: "#F0EDE8", borderRadius: 3, overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${selected.score}%`,
                  background: `linear-gradient(to right, ${badge.color}88, ${badge.color})`,
                  borderRadius: 3, transition: "width 0.5s ease",
                }} />
              </div>
            </div>

            <button
              style={{
                width: "100%", padding: "16px", borderRadius: 16,
                background: "#1A1A1A", color: "white", border: "none",
                fontSize: 15, fontWeight: 700, cursor: "pointer",
              }}
              onClick={() => window.open(`https://maps.google.com/?q=${selected.lat},${selected.lng}`, "_blank")}
            >
              Get Directions →
            </button>
          </>
        )}
      </div>
    </div>
  );
}