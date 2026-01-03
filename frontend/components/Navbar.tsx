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
    <nav className="bg-slate-900 text-white shadow-xl border-b border-slate-800">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tighter uppercase">
                Phrelis <span className="text-blue-500">OS</span>
              </span>
              <p className="text-[10px] font-bold text-slate-500 tracking-[0.2em] -mt-1 uppercase">
                Enterprise ERP
              </p>
            </div>
          </div>
          
          {/* Navigation Items */}
          <div className="flex items-center space-x-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-105' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* System Status Indicator */}
          <div className="hidden md:flex items-center gap-4 pl-6 border-l border-slate-800">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-500 uppercase">System Status</span>
              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
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