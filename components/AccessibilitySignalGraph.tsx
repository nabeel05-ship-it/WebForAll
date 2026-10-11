'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Sparkles, CheckCircle2, AlertTriangle, Layers, Eye, ShieldCheck, Terminal, Code2 } from 'lucide-react';

/**
 * AccessibilitySignalGraph
 * 
 * An original, bespoke vector visualization communicating how WebForAll
 * inspects DOM hierarchies, traces semantic relationships, and validates
 * accessibility checkpoints against WCAG 2.1 AA.
 * 
 * Features:
 * - Dynamic SVG node-and-tree structure representing HTML landmarks & controls (<header>, <main>, <nav>, <button>, <img>, <form>)
 * - Signal pulse animations along conductive trace lines
 * - Interactive hover states on checkpoint nodes with informative diagnostic tooltips
 * - Full prefers-reduced-motion support (stops looping pulses, preserves static visual clarity)
 */
export default function AccessibilitySignalGraph() {
  const shouldReduceMotion = useReducedMotion();
  const [activeNode, setActiveNode] = useState<string | null>(null);

  // Checkpoint nodes in the DOM tree
  const nodes = [
    {
      id: 'doc',
      name: '<html>:lang="en"',
      role: 'Document Root',
      type: 'root',
      x: 300,
      y: 40,
      status: 'pass',
      rule: 'html-has-lang',
      description: 'Document language defined; screen readers use correct pronunciation rules.',
    },
    {
      id: 'header',
      name: '<header role="banner">',
      role: 'Landmark',
      type: 'landmark',
      x: 130,
      y: 115,
      status: 'pass',
      rule: 'landmark-banner',
      description: 'Top-level banner landmark enables instant skip navigation.',
    },
    {
      id: 'nav',
      name: '<nav aria-label="Main">',
      role: 'Navigation',
      type: 'landmark',
      x: 80,
      y: 195,
      status: 'pass',
      rule: 'unique-landmark',
      description: 'Discernible label distinguishes main navigation from secondary menus.',
    },
    {
      id: 'main',
      name: '<main id="content">',
      role: 'Primary Landmark',
      type: 'landmark',
      x: 300,
      y: 125,
      status: 'pass',
      rule: 'landmark-one-main',
      description: 'Single top-level main region contains primary page content.',
    },
    {
      id: 'img',
      name: '<img alt="Hero chart">',
      role: 'Informative Media',
      type: 'control',
      x: 230,
      y: 215,
      status: 'pass',
      rule: 'image-alt',
      description: 'Alternative text conveys meaningful information to non-sighted users.',
    },
    {
      id: 'button',
      name: '<button aria-label="Submit">',
      role: 'Interactive Action',
      type: 'control',
      x: 370,
      y: 215,
      status: 'pass',
      rule: 'button-name',
      description: 'Action has discernible accessible name and visible keyboard focus ring.',
    },
    {
      id: 'form',
      name: '<form aria-labelledby="f-h">',
      role: 'Form Region',
      type: 'landmark',
      x: 480,
      y: 125,
      status: 'pass',
      rule: 'form-landmark',
      description: 'Grouped interactive inputs with programmatic legend binding.',
    },
    {
      id: 'input',
      name: '<input id="email" required>',
      role: 'Form Control',
      type: 'control',
      x: 480,
      y: 215,
      status: 'pass',
      rule: 'label-bound',
      description: 'Explicit <label for="email"> binding guarantees speech-input access.',
    },
  ];

  // Connecting conductive lines between parent and child DOM nodes
  const connections = [
    { from: 'doc', to: 'header' },
    { from: 'doc', to: 'main' },
    { from: 'doc', to: 'form' },
    { from: 'header', to: 'nav' },
    { from: 'main', to: 'img' },
    { from: 'main', to: 'button' },
    { from: 'form', to: 'input' },
  ];

  const currentNode = nodes.find((n) => n.id === activeNode);

  return (
    <div className="w-full max-w-4xl mx-auto my-6 p-4 sm:p-6 bg-surface/80 backdrop-blur-md rounded-3xl border-2 border-border-ink shadow-card">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-teal animate-pulse" aria-hidden="true" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-ink font-mono">
            DOM Structure & Accessibility Checkpoint Signal Matrix
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-ink-muted">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-soft text-teal border border-teal/30">
            <CheckCircle2 className="w-3 h-3" />
            WCAG 2.1 AA
          </span>
          <span className="hidden sm:inline">&bull;</span>
          <span className="text-[11px] font-mono">Hover nodes to inspect rules</span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full aspect-[600/280] max-h-[340px] mt-2 select-none">
        <svg
          viewBox="0 0 600 280"
          className="w-full h-full overflow-visible"
          role="img"
          aria-label="Interactive DOM hierarchy visualization illustrating accessibility checkpoint validation"
        >
          <defs>
            {/* Linear Gradients for Conductive Traces */}
            <linearGradient id="traceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3157E8" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#6B46D9" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#19A89A" stopOpacity="0.5" />
            </linearGradient>

            {/* Signal Pulse Glow */}
            <filter id="nodeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#3157E8" floodOpacity="0.2" />
            </filter>
          </defs>

          {/* Connection Lines (Conductive DOM Traces) */}
          {connections.map((conn, idx) => {
            const source = nodes.find((n) => n.id === conn.from)!;
            const target = nodes.find((n) => n.id === conn.to)!;
            const isHighlighted = activeNode === conn.from || activeNode === conn.to;

            return (
              <g key={`conn-${idx}`}>
                <line
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke={isHighlighted ? '#3157E8' : '#C9D0DD'}
                  strokeWidth={isHighlighted ? 2.5 : 1.5}
                  strokeDasharray={isHighlighted ? 'none' : '4 3'}
                  className="transition-colors duration-200"
                />

                {/* Animated Signal Pulse traveling along trace */}
                {!shouldReduceMotion && (
                  <motion.circle
                    r={2.5}
                    fill={isHighlighted ? '#F25C4D' : '#3157E8'}
                    animate={{
                      cx: [source.x, target.x],
                      cy: [source.y, target.y],
                      opacity: [0, 0.9, 0],
                    }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      delay: idx * 0.35,
                      ease: 'easeInOut',
                    }}
                  />
                )}
              </g>
            );
          })}

          {/* Checkpoint Nodes */}
          {nodes.map((node) => {
            const isHovered = activeNode === node.id;
            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer transition-transform"
                onMouseEnter={() => setActiveNode(node.id)}
                onMouseLeave={() => setActiveNode(null)}
                tabIndex={0}
                role="button"
                aria-label={`${node.name} node: ${node.rule}`}
                onFocus={() => setActiveNode(node.id)}
                onBlur={() => setActiveNode(null)}
              >
                {/* Node Outer Halo */}
                <circle
                  r={isHovered ? 20 : 14}
                  fill={isHovered ? '#E3EAFF' : '#FFFFFF'}
                  stroke={isHovered ? '#3157E8' : '#C9D0DD'}
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  className="transition-all duration-200"
                  filter="url(#nodeGlow)"
                />

                {/* Node Inner Status Dot */}
                <circle
                  r={isHovered ? 7 : 5}
                  fill={isHovered ? '#3157E8' : '#19A89A'}
                  className="transition-all duration-200"
                />

                {/* Node Label Text */}
                <text
                  y={isHovered ? 34 : 26}
                  textAnchor="middle"
                  className={`text-[11px] font-mono font-bold select-none transition-all ${
                    isHovered ? 'fill-[#18233A] font-extrabold text-[12px]' : 'fill-[#58677D]'
                  }`}
                >
                  {node.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Dynamic Diagnostic Tooltip / Status readout */}
        <div className="mt-2 min-h-[52px] p-3 rounded-xl bg-canvas border border-border-ink flex items-center justify-between text-xs transition-all">
          {currentNode ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-electric bg-surface px-2 py-0.5 rounded border border-border-ink">
                  {currentNode.name}
                </span>
                <span className="text-ink font-semibold">
                  Rule <code className="font-mono text-ink-muted">{currentNode.rule}</code>:
                </span>
                <span className="text-ink-muted hidden md:inline font-medium">
                  {currentNode.description}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 font-bold text-teal bg-teal-soft px-2 py-0.5 rounded-md self-start sm:self-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Valid Checkpoint
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full text-ink-muted font-medium">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-golden" />
                <span>Move your cursor or focus over any node to inspect semantic validation and WCAG rules.</span>
              </span>
              <span className="font-mono text-[11px] text-ink-muted hidden sm:inline">
                8 Checkpoints Evaluated
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
