import React, { useState } from 'react';
import { User } from '../types/document';
import { SEED_USERS } from '../data/seedData';
import { 
  FileText, 
  ChevronDown, 
  Sun, 
  Moon, 
  Plus, 
  Upload, 
  Check, 
  ShieldCheck, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onSwitchUser: (userId: string) => void;
  onNewDocument: () => void;
  onOpenImport: () => void;
  onResetData: () => void;
  onNavigateHome: () => void;
  currentDocTitle?: string;
  isEditingDoc?: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSwitchUser,
  onNewDocument,
  onOpenImport,
  onResetData,
  onNavigateHome,
  currentDocTitle,
  isEditingDoc,
  theme,
  onToggleTheme,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
            title="Go to Document Dashboard"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs transition-transform group-hover:scale-105">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
              CollabDoc
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links / Breadcrumb (4-5 single-line clean text items) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600 dark:text-neutral-300">
          {isEditingDoc && currentDocTitle ? (
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={onNavigateHome}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap"
              >
                Documents
              </button>
              <span className="text-neutral-400">/</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 max-w-xs truncate">
                {currentDocTitle}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <button
                onClick={onNavigateHome}
                className="hover:text-neutral-900 dark:hover:text-white transition-colors whitespace-nowrap"
              >
                Workspace
              </button>
              <button
                onClick={onOpenImport}
                className="hover:text-neutral-900 dark:hover:text-white transition-colors whitespace-nowrap flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import File</span>
              </button>
              <button
                onClick={() => setResetConfirmOpen(true)}
                className="hover:text-neutral-900 dark:hover:text-white transition-colors whitespace-nowrap text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                title="Restore seeded documents and permissions"
              >
                Reset Demo
              </button>
            </div>
          )}
        </nav>

        {/* Zone 3: Primary Action & Test User Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Dark / Light Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Test User Switcher Dropdown (Crucial for fastest testing of sharing permissions) */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700/60 transition-colors shadow-2xs"
              title="Switch user to test sharing permissions"
            >
              <div
                className={`w-6 h-6 rounded-full bg-gradient-to-tr ${currentUser.avatarColor} text-white flex items-center justify-center text-2xs font-bold tracking-tight shadow-2xs`}
              >
                {currentUser.avatarText}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-3xs text-neutral-500 dark:text-neutral-400 leading-tight">
                  {currentUser.role}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {userDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800 p-2 z-50">
                  <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800 mb-1">
                    <p className="text-2xs uppercase tracking-wider font-semibold text-neutral-400 dark:text-neutral-500">
                      Simulate Test Account
                    </p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                      Switch accounts to test Owner vs Shared permissions:
                    </p>
                  </div>

                  <div className="space-y-1">
                    {SEED_USERS.map((user) => {
                      const isActive = user.id === currentUser.id;
                      return (
                        <button
                          key={user.id}
                          onClick={() => {
                            onSwitchUser(user.id);
                            setUserDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                            isActive
                              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                              : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-7 h-7 rounded-full bg-gradient-to-tr ${user.avatarColor} text-white flex items-center justify-center text-xs font-bold shadow-2xs`}
                            >
                              {user.avatarText}
                            </div>
                            <div>
                              <div className="text-xs font-medium leading-snug">
                                {user.name}
                              </div>
                              <div className="text-2xs text-neutral-500 dark:text-neutral-400">
                                {user.role} · {user.email}
                              </div>
                            </div>
                          </div>
                          {isActive && (
                            <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 px-2 flex items-center justify-between text-2xs text-neutral-400">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
                      Role-based access enforced
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* New Document Button */}
          {!isEditingDoc && (
            <button
              onClick={onNewDocument}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-white transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Doc</span>
            </button>
          )}
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-5 max-w-sm w-full border border-neutral-200 dark:border-neutral-800 shadow-xl">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Reset Demo Data?
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2">
              This will restore the original seed documents, collaborators (Alice, Bob, Charlie), and test comments.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onResetData();
                  setResetConfirmOpen(false);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
              >
                Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
