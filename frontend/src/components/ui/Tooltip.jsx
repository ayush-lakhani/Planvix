import { useState } from 'react';
import { useFloating, autoUpdate, offset, flip, shift, useHover, useFocus, useDismiss, useRole, useInteractions } from '@floating-ui/react';

export default function Tooltip({ children, content, placement = 'top' }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(8),
      flip({ fallbackAxisSideDirection: 'start' }),
      shift({ padding: 8 })
    ]
  });

  const hover = useHover(context, { move: false, delay: { open: 150 }});
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover, focus, dismiss, role
  ]);

  if (!content) return <>{children}</>;

  return (
    <>
      <div ref={refs.setReference} {...getReferenceProps()} className="inline-flex shrink-0">
        {children}
      </div>
      {isOpen && (
        <div
          ref={refs.setFloating}
          style={{...floatingStyles, zIndex: 9999}}
          {...getFloatingProps()}
          className="bg-slate-900 dark:bg-slate-800 text-slate-100 text-xs px-3 py-2 rounded-lg shadow-xl shadow-black/20 animate-fade-in pointer-events-none max-w-xs"
        >
          {content}
        </div>
      )}
    </>
  );
}
