// Hero Showcase - Interactive 4-mode code demo
// This is an Astro island component (client:visible)

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface DemoMode {
  label: string;
  icon: string;
  badge: string;
  file: string;
  prompt: string;
  lang: string;
  code: [string, string][][];
  agentTitle: string;
  agentStatus: string;
  statusColor: string;
  agentMsg: string;
  props: [string, string][];
  terminal: string[];
  termColors: string[];
}

const DEMO_ORDER: (keyof typeof PREVIEW_MODES)[] = ['automode', 'omnimode', 'teachmode', 'agents'];

const PREVIEW_MODES: Record<string, DemoMode> = {
  automode: {
    label: 'AutoMode',
    icon: '⚡',
    badge: 'Autonomous + Approval Gate',
    file: 'backend/agent_runner.py',
    prompt: 'Add permission gate before shell execution',
    lang: 'python',
    code: [
      [['kw-blue', 'async '], ['kw-purple', 'def '], ['kw-amber', 'execute_step'], ['kw-muted', '(task_id: '], ['kw-type', 'str'], ['kw-muted', ', tool_call: '], ['kw-type', 'ToolCall'], ['kw-muted', '):']],
      [['kw-muted', '    policy = '], ['kw-blue', 'await '], ['kw-muted', 'permissions.check(tool_call.name)']],
      [['kw-blue', '    if '], ['kw-muted', 'policy.requires_approval:']],
      [['kw-muted', '        '], ['kw-blue', 'await '], ['kw-muted', 'ws.emit_approval_request(task_id, tool_call)']],
      [['kw-muted', '        decision = '], ['kw-blue', 'await '], ['kw-muted', 'ws.wait_for_user(task_id)']],
      [['kw-blue', '        if not '], ['kw-muted', 'decision.approved:']],
      [['kw-blue', '            return '], ['kw-green', 'ToolResult'], ['kw-muted', '(status='], ['kw-string', '"blocked"'], ['kw-muted', ')']],
      [['kw-blue', '    return await '], ['kw-muted', 'tool_runner.run(tool_call)']],
    ],
    agentTitle: 'AutoMode · Task #42',
    agentStatus: 'Awaiting Approval',
    statusColor: 'text-amber border-amber/30 bg-amberSoft',
    agentMsg: 'Staged edit on backend/agent_runner.py (+4 / -1). Requesting approval to run pytest.',
    props: [['Mode', 'AutoMode'], ['Gate', 'Ask on shell_exec'], ['Backend', 'FastAPI + SQLite'], ['Diff', '+4 / -1 lines']],
    terminal: ['$ omnidev agent --mode auto "Add permission gate"', '[agent] Analyzing FastAPI tool runner…', '[diff]  Staged patch on agent_runner.py', '[gate]  WAITING: approve pytest?'],
    termColors: ['text-textDim', 'text-blue-400', 'text-green-400', 'text-amber'],
  },
  omnimode: {
    label: 'OmniMode',
    icon: '🌐',
    badge: 'Multi-Provider Orchestration',
    file: 'src/providers/router.ts',
    prompt: 'Route local-only tasks to Ollama',
    lang: 'typescript',
    code: [
      [['kw-blue', 'export function '], ['kw-amber', 'routeProvider'], ['kw-muted', '(task: '], ['kw-type', 'WorkspaceTask'], ['kw-muted', '): '], ['kw-type', 'ProviderConfig'], ['kw-muted', ' {']],
      [['kw-blue', '  if '], ['kw-muted', '(task.privacy === '], ['kw-string', '"local-only"'], ['kw-muted', ') {']],
      [['kw-blue', '    return '], ['kw-muted', '{ provider: '], ['kw-string', '"ollama"'], ['kw-muted', ', model: '], ['kw-string', '"qwen2.5-coder:7b"'], ['kw-muted', ' };']],
      [['kw-muted', '  }']],
      [['kw-blue', '  return '], ['kw-muted', '{']],
      [['kw-muted', '    provider: task.preferredProvider ?? '], ['kw-string', '"openai"'], ['kw-muted', ',']],
      [['kw-muted', '    fallback: '], ['kw-string', '"anthropic"']],
      [['kw-muted', '  };']],
      [['kw-muted', '}']],
    ],
    agentTitle: 'OmniMode · Router',
    agentStatus: 'Synced',
    statusColor: 'text-success border-success/30 bg-successSoft',
    agentMsg: 'Connected Ollama (local) + cloud fallbacks. Project memory synced across 142 symbols.',
    props: [['Mode', 'OmniMode'], ['Local', 'Ollama (11434)'], ['Memory', '142 symbols'], ['Shell', 'Tauri 2 PTY']],
    terminal: ['$ omnidev status --providers', '[ok] ollama     localhost:11434  active', '[ok] sqlite     .omnidev/memory.db  142', '[ok] terminal   PTY session ready'],
    termColors: ['text-textDim', 'text-green-400', 'text-green-400', 'text-green-400'],
  },
  teachmode: {
    label: 'Teach Mode',
    icon: '📖',
    badge: 'Guided Step-by-Step Walkthrough',
    file: 'src/components/ProjectLauncherModal.tsx',
    prompt: 'Explain workspace hydration flow',
    lang: 'tsx',
    code: [
      [['kw-blue', 'export function '], ['kw-amber', 'ProjectLauncherModal'], ['kw-muted', '({ onSelect }: '], ['kw-type', 'Props'], ['kw-muted', ') {']],
      [['kw-blue', '  const '], ['kw-muted', '[projects, setProjects] = '], ['kw-green', 'useState'], ['kw-muted', '<'], ['kw-type', 'Project'], ['kw-muted', '[]>([]);']],
      [['kw-muted', '  // '], ['kw-purple', 'Step 1: Load recent workspaces from SQLite']],
      [['kw-green', '  useEffect'], ['kw-muted', '(() => {']],
      [['kw-muted', '    projectService.'], ['kw-amber', 'listRecent'], ['kw-muted', '().then(setProjects);']],
      [['kw-muted', '  }, []);']],
      [['kw-blue', '  return '], ['kw-muted', '<'], ['kw-green', 'WorkspaceList'], ['kw-muted', ' items={projects} onPick={onSelect} />;']],
      [['kw-muted', '}']],
    ],
    agentTitle: 'Teach Mode · Walkthrough',
    agentStatus: 'Step 2/3',
    statusColor: 'text-purple border-purple/30 bg-purpleSoft',
    agentMsg: 'useEffect hydrates recent workspaces once on mount without blocking the Tauri window paint.',
    props: [['Mode', 'Teach Mode'], ['Step', '2 / 3'], ['Topic', 'React + IPC'], ['Target', 'ProjectLauncher']],
    terminal: ['$ omnidev teach src/components/ProjectLauncherModal.tsx', '[step 1/3] State initialization with TypeScript generics', '[step 2/3] Async SQLite fetch via FastAPI bridge', '[step 3/3] Interactive checkpoint ready'],
    termColors: ['text-textDim', 'text-textMuted', 'text-purple', 'text-blue-400'],
  },
  agents: {
    label: 'AI Agents',
    icon: '🤖',
    badge: 'Persistent Memory & Tool Pool',
    file: 'backend/memory/store.py',
    prompt: 'Persist conversation turns to SQLite',
    lang: 'python',
    code: [
      [['kw-blue', 'class '], ['kw-green', 'ProjectMemoryStore'], ['kw-muted', ':']],
      [['kw-blue', '    def '], ['kw-amber', 'save_turn'], ['kw-muted', '(self, project_id: '], ['kw-type', 'str'], ['kw-muted', ', role: '], ['kw-type', 'str'], ['kw-muted', ', content: '], ['kw-type', 'str'], ['kw-muted', '):']],
      [['kw-muted', '        self.db.execute(']],
      [['kw-muted', '            '], ['kw-string', '"INSERT INTO conversations"']],
      [['kw-muted', '            '], ['kw-string', '"(project_id, role, content)"']],
      [['kw-muted', '            '], ['kw-string', '"VALUES (?, ?, ?)"'], ['kw-muted', ',']],
      [['kw-muted', '            (project_id, role, content)']],
      [['kw-muted', '        )']],
      [['kw-muted', '        self.db.commit()']],
    ],
    agentTitle: 'Agent Pool · 2 Active',
    agentStatus: 'Running',
    statusColor: 'text-success border-success/30 bg-successSoft',
    agentMsg: 'Planner Agent mapped 3 subtasks. Verifier queued typecheck + build verification.',
    props: [['Mode', 'AI Agents'], ['Active', '2 Agents'], ['Store', 'SQLite WAL'], ['Queue', '1 verification']],
    terminal: ['$ omnidev tasks list', '[done]   #101  Scaffold SQLite schema', '[active] #102  Wire Tauri IPC commands', '[queued] #103  Run npm build && pytest'],
    termColors: ['text-textDim', 'text-green-400', 'text-blue-400', 'text-textMuted'],
  },
};

function renderCodeLine(segments: [string, string][]) {
  return segments.map(([cls, txt]) => (
    <span key={cls + txt} className={cls}>{txt}</span>
  ));
}

export default function HeroShowcase() {
  const [previewMode, setPreviewMode] = useState<keyof typeof PREVIEW_MODES>('automode');
  const [demoPlaying, setDemoPlaying] = useState(true);
  const [demoProgress, setDemoProgress] = useState(0);
  const [demoStepIdx, setDemoStepIdx] = useState(0);

  const frameRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Demo loop
  useEffect(() => {
    if (!demoPlaying) return;

    const interval = setInterval(() => {
      setDemoProgress((prev) => {
        const next = prev + 1.6;
        if (next >= 100) {
          setDemoStepIdx((idx) => (idx + 1) % DEMO_ORDER.length);
          setPreviewMode(DEMO_ORDER[(demoStepIdx + 1) % DEMO_ORDER.length]);
          return 0;
        }
        return next;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [demoPlaying, demoStepIdx]);

  // GSAP animations
  useEffect(() => {
    if (!frameRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.hero-anim', {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.09,
        ease: 'power3.out',
        clearProps: 'all',
      });

      gsap.fromTo(
        frameRef.current,
        { rotateX: 6, scale: 0.97, y: 24 },
        {
          rotateX: 0,
          scale: 1,
          y: 0,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: frameRef.current,
            start: 'top 88%',
            end: 'top 30%',
            scrub: 0.5,
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  const p = PREVIEW_MODES[previewMode];

  return (
    <div className="showcase-perspective">
      <div id="hero-showcase-frame" ref={frameRef} className="rounded-2xl border border-borderStrong/80 bg-surface/90 overflow-hidden shadow-glow-blue-lg">
        <div id="showcase-window-inner">
          {/* Top bar */}
          <div className="px-4 py-2.5 bg-elevated/80 border-b border-border flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="w-2.5 h-2.5 rounded-full bg-danger/60"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber/60"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-success/60"></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-textMuted text-[11px]">{p.file}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg border border-border text-textDim font-mono">.{p.lang}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center bg-bg border border-border rounded-lg p-0.5 gap-0.5">
                {DEMO_ORDER.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setPreviewMode(key as keyof typeof PREVIEW_MODES);
                      setDemoStepIdx(DEMO_ORDER.indexOf(key));
                      setDemoProgress(0);
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                      previewMode === key ? 'bg-accent text-white shadow-sm' : 'text-textDim hover:text-textMain'
                    }`}
                  >
                    {PREVIEW_MODES[key].icon} {PREVIEW_MODES[key].label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setDemoPlaying(!demoPlaying)}
                className="px-2.5 py-1 rounded-md bg-bg border border-border hover:border-borderStrong text-[11px] font-mono text-textMuted hover:text-textMain transition-all"
              >
                {demoPlaying ? '⏸ Pause' : '▶ Play'}
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-0.5 progress-track">
            <div
              ref={progressBarRef}
              id="demo-progress-bar"
              className="h-full bg-gradient-to-r from-accent to-blue-400 transition-all duration-75"
              style={{ width: `${demoProgress}%` }}
            ></div>
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 text-left min-h-[300px]">
            {/* Sidebar */}
            <div className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-border p-4 bg-bg/60">
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-textDim mb-2 font-semibold">Workspace</div>
                  <div className="px-2.5 py-2 rounded-md bg-elevated border border-border text-[11px] text-textMuted font-mono leading-relaxed">
                    <span className="text-accent">{'> '}</span>{p.prompt}<span className="typing-cursor"></span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-textDim mb-2 font-semibold">Repository</div>
                  <div className="font-mono space-y-0.5 text-[11px]">
                    <div className="text-textDim px-1">src/</div>
                    <div className={`pl-4 py-0.5 rounded cursor-pointer transition-colors ${
                      previewMode === 'teachmode' ? 'bg-accentSoft text-accent' : 'text-textDim hover:text-textMuted'
                    }`}>
                      ProjectLauncherModal.tsx
                    </div>
                    <div className={`pl-4 py-0.5 rounded cursor-pointer transition-colors ${
                      previewMode === 'omnimode' ? 'bg-accentSoft text-accent' : 'text-textDim hover:text-textMuted'
                    }`}>
                      providers/router.ts
                    </div>
                    <div className="text-textDim px-1 mt-1">backend/</div>
                    <div className={`pl-4 py-0.5 rounded cursor-pointer transition-colors ${
                      previewMode === 'automode' ? 'bg-accentSoft text-accent' : 'text-textDim hover:text-textMuted'
                    }`}>
                      agent_runner.py
                    </div>
                    <div className={`pl-4 py-0.5 rounded cursor-pointer transition-colors ${
                      previewMode === 'agents' ? 'bg-accentSoft text-accent' : 'text-textDim hover:text-textMuted'
                    }`}>
                      memory/store.py
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Editor + Terminal */}
            <div className="lg:col-span-6 border-b lg:border-b-0 lg:border-r border-border flex flex-col">
              <div className="p-4 bg-bg/80 font-mono text-[12px] leading-relaxed overflow-x-auto code-scroll flex-1 min-h-[180px]">
                {p.code.map((segs, i) => (
                  <div key={i} className="flex gap-3 hover:bg-white/[0.02] rounded px-1 -mx-1 group">
                    <span className="text-textDim select-none w-5 text-right shrink-0 group-hover:text-textMuted transition-colors">{i + 1}</span>
                    <span className="whitespace-pre">{renderCodeLine(segs)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border bg-surface/80 p-3.5 font-mono text-[11px] space-y-1">
                <div className="text-[10px] uppercase tracking-widest text-textDim mb-1.5 font-semibold">Terminal</div>
                {p.terminal.map((t, i) => (
                  <div key={i} className={p.termColors[i] || 'text-textMuted'}>{t}</div>
                ))}
              </div>
            </div>

            {/* Agent Inspector */}
            <div className="lg:col-span-3 p-4 bg-surface/50 flex flex-col gap-4">
              <div className="space-y-3 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-textMain leading-tight">{p.agentTitle}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${p.statusColor}`}>{p.agentStatus}</span>
                </div>
                <div className="p-3 rounded-lg bg-bg/80 border border-border text-xs text-textMuted leading-relaxed">
                  {p.agentMsg}
                </div>
                <div className="pt-2 border-t border-border space-y-2">
                  <div className="text-[10px] uppercase tracking-widest text-textDim font-semibold">Properties</div>
                  {p.props.map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between text-xs">
                      <span className="text-textDim">{k}</span>
                      <span className="font-mono text-textMain text-[11px]">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <a
                href="/docs"
                className="w-full py-2 rounded-lg bg-elevated border border-borderStrong hover:border-accent/50 text-xs font-semibold text-textSub transition-all hover:text-textMain text-center"
              >
                Read {p.label} Guide →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}