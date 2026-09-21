import React, { useState, useEffect } from 'react';

interface HoveredElementBox {
  x: number;
  y: number;
  width: number;
  height: number;
  tagName: string;
  id: string;
  componentName: string;
}

interface ElementInspectorOverlayProps {
  isEnabled: boolean;
  onSelectElement: (info: { id: string; name: string }) => void;
}

export const ElementInspectorOverlay: React.FC<ElementInspectorOverlayProps> = ({
  isEnabled,
  onSelectElement
}) => {
  const [box, setBox] = useState<HoveredElementBox | null>(null);

  useEffect(() => {
    if (!isEnabled) {
      setBox(null);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      if (!target) return;

      // Find nearest meaningful container with an ID or a card
      const inspectTarget = target.closest('[id]') as HTMLElement | null;
      if (inspectTarget && !inspectTarget.closest('#inspect-drawer-backdrop') && !inspectTarget.closest('#inspect-floating-trigger-container')) {
        const rect = inspectTarget.getBoundingClientRect();
        const id = inspectTarget.id;
        
        let componentName = "UI Element";
        if (id.includes('bento-card-time')) componentName = "Time Tracked Card (Lime)";
        else if (id.includes('bento-card-projects')) componentName = "Projects Card (Peach)";
        else if (id.includes('bento-card-add')) componentName = "Add Widget Card";
        else if (id.includes('bento-card-go-premium')) componentName = "Go Premium Card";
        else if (id.includes('bento-card-spline')) componentName = "Spline Activity Tracker";
        else if (id.includes('bento-card-completed')) componentName = "Completed Statistics Card";
        else if (id.includes('bento-card-last-notes')) componentName = "Last Notes Table";
        else if (id.includes('main-sidebar')) componentName = "Sidebar Navigation";
        else if (id.includes('main-app-header')) componentName = "Header Bar";
        else if (id.includes('bottom-floating')) componentName = "Floating Bottom Pill Nav";
        else if (id.includes('schedule')) componentName = "Schedule Component";
        else if (id.includes('fin-')) componentName = "Financial Component";

        setBox({
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
          tagName: inspectTarget.tagName.toLowerCase(),
          id: id,
          componentName: componentName
        });
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!isEnabled) return;
      const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      if (!target) return;
      
      const inspectTarget = target.closest('[id]') as HTMLElement | null;
      if (inspectTarget && !inspectTarget.closest('#inspect-drawer-backdrop') && !inspectTarget.closest('#inspect-floating-trigger-container')) {
        e.preventDefault();
        e.stopPropagation();
        onSelectElement({
          id: inspectTarget.id,
          name: inspectTarget.id
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick, true);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick, true);
    };
  }, [isEnabled, onSelectElement]);

  if (!isEnabled || !box) return null;

  return (
    <div
      id="visual-inspector-active-box"
      className="fixed pointer-events-none z-50 border-2 border-[#e4fc65] bg-[#e4fc65]/10 rounded-2xl transition-all duration-75 shadow-lg"
      style={{
        left: `${box.x}px`,
        top: `${box.y}px`,
        width: `${box.width}px`,
        height: `${box.height}px`
      }}
    >
      <div className="absolute -top-7 left-0 bg-[#14151b] text-white text-[10px] font-mono px-2 py-0.5 rounded shadow flex items-center gap-1.5 border border-[#e4fc65]/30 whitespace-nowrap">
        <span className="text-[#e4fc65] font-bold">&lt;{box.tagName}&gt;</span>
        <span className="text-slate-300 font-semibold">#{box.id}</span>
        <span className="text-[9px] text-slate-400">({Math.round(box.width)} × {Math.round(box.height)}px)</span>
      </div>
    </div>
  );
};
