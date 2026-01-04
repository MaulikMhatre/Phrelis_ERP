"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Stethoscope, 
  LineChart, 
  Activity, 
  Settings, 
  Clock,
  Network,
  Users
} from 'lucide-react';

const Navbar = () => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Analytics', href: '/predictions', icon: LineChart },
    { name: 'Triage', href: '/triage', icon: Stethoscope },
    { name: 'Admin', href: '/admin', icon: Settings },
    { name: 'History', href: '/history', icon: Clock },
    { name: 'Staff', href: '/staff', icon: Users },
    { name: 'Sentinel', href: '/sentinel', icon: Network },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl text-white border-b border-white/5 shadow-2xl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Section */}
          <div className="flex items-center gap-4 group cursor-pointer pr-8 border-r border-white/10">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-[0_0_15px_rgba(79,70,229,0.5)] group-hover:shadow-[0_0_25px_rgba(79,70,229,0.8)] transition-all duration-300">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tighter uppercase leading-none">
                Phrelis <span className="text-indigo-500">OS</span>
              </span>
              <span className="text-[9px] font-bold text-slate-500 tracking-[0.3em] uppercase">
                v2.4.0
              </span>
            </div>
          </div>
          
          {/* Navigation Items */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-200 group/link ${
                    isActive 
                      ? 'text-white bg-white/10 border border-white/5' 
                      : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-600 group-hover/link:text-indigo-400'} transition-colors`} />
                  <span>{item.name}</span>
                  
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-500 rounded-full translate-y-2 shadow-[0_0_10px_#6366f1]"></span>
                  )}
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