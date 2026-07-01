import { useLocation } from "wouter";

const IconHome = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V10.5z"/>
    <path d="M9 21V12h6v9"/>
  </svg>
);
const IconRun = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="14" cy="3.5" r="1.5"/>
    <path d="M9 18l2.5-5.5L14 15l2-3.5 2.5 4.5"/>
    <path d="M6.5 11l2.5-4.5 4 1.5 3-3"/>
  </svg>
);
const IconCalendar = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="3"/>
    <path d="M16 2v4M8 2v4M3 10h18"/>
    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
  </svg>
);
const IconHeart = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 20.9l8.84-8.61a5.5 5.5 0 0 0 0-7.68z"/>
  </svg>
);
const IconForce = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4v6a6 6 0 0 0 12 0V4"/>
    <line x1="6" y1="10" x2="4" y2="10"/>
    <line x1="18" y1="10" x2="20" y2="10"/>
    <line x1="12" y1="16" x2="12" y2="20"/>
    <line x1="9" y1="20" x2="15" y2="20"/>
  </svg>
);

type NavTab = "home" | "weekly" | "checkin" | "workout" | "forca";

interface BottomNavProps {
  active: NavTab;
}

export function BottomNav({ active }: BottomNavProps) {
  const [, navigate] = useLocation();

  const tabs: Array<{ id: NavTab; label: string; icon: React.ReactNode; path: string }> = [
    { id: "home",    label: "Painel",   icon: <IconHome />,     path: "/dashboard" },
    { id: "weekly",  label: "Semana",   icon: <IconCalendar />, path: "/weekly" },
    { id: "checkin", label: "Check-in", icon: <IconHeart />,    path: "/checkin" },
    { id: "workout", label: "Treino",   icon: <IconRun />,      path: "/workout" },
    { id: "forca",   label: "Força",    icon: <IconForce />,    path: "/forca" },
  ];

  return (
    <nav className="nav-bar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`nav-item${active === tab.id ? " active" : ""}`}
          onClick={() => navigate(tab.path)}
        >
          {tab.icon}
          <span className="nav-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
