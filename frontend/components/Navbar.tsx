"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Stethoscope, 
  LineChart, 
  Activity, 
  Settings, 
  Clock 
} from 'lucide-react';

const Navbar = () => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Triage Portal', href: '/triage', icon: Stethoscope },
    { name: 'Analytics', href: '/predictions', icon: LineChart },
    { name: 'ERP Admin', href: '/admin', icon: Settings },
    { name: 'History', href: '/history', icon: Clock }, // ADDED: History Route
  ];

  return (
    <nav className="sticky top-0 z-40 bg-black/80 backdrop-blur-md text-white border-b border-white/10 shadow-2xl supports-[backdrop-filter]:bg-black/60">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300 group-hover:scale-105">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Phrelis <span className="text-indigo-400">OS</span>
              </span>
              <p className="text-[10px] font-bold text-slate-500 tracking-[0.2em] -mt-1 uppercase group-hover:text-indigo-400 transition-colors">
                Enterprise ERP
              </p>
            </div>
          </div>
          
          {/* Navigation Items */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 overflow-hidden group/link ${
                    isActive 
                      ? 'text-white' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <span className="absolute inset-0 bg-indigo-600/20 border border-indigo-500/50 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.3)]" />
                  )}
                  <span className={`absolute inset-0 bg-white/5 opacity-0 group-hover/link:opacity-100 transition-opacity rounded-full ${isActive ? 'hidden' : ''}`} />
                  
                  <Icon className={`w-4 h-4 relative z-10 transition-transform duration-300 group-hover/link:scale-110 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover/link:text-indigo-400'}`} />
                  <span className="relative z-10">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* System Status Indicator */}
          <div className="hidden md:flex items-center gap-4 pl-8 border-l border-white/10">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Status</span>
              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-2 tracking-wide">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Cloud Sync Active
              </span>
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;