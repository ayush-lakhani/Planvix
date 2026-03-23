import { useState } from 'react';
import { 
  useFloating, autoUpdate, offset, flip, shift, useClick, useDismiss, 
  useRole, useInteractions, FloatingFocusManager, FloatingPortal 
} from '@floating-ui/react';

export default function Dropdown({ trigger, children, placement = 'bottom-end', className = '' }) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [ offset(8), flip(), shift({ padding: 8 }) ]
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click, dismiss, role
  ]);

  return (
    <>
      <div 
        ref={refs.setReference} 
        className="inline-flex cursor-pointer"
        {...getReferenceProps({
          onClick(event) {
            event.stopPropagation();
          }
        })} 
      >
        {trigger}
      </div>
      {isOpen && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false} initialFocus={-1}>
            <div
              ref={refs.setFloating}
              style={{...floatingStyles, zIndex: 9998}}
              {...getFloatingProps()}
              className="outline-none"
            >
              <div
                className={`bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-2xl animate-slide-up overflow-hidden ${className}`}
                onClick={(e) => {
                  // E.g. close after clicking inside
                  if (e.target.tagName !== 'INPUT') {
                    setIsOpen(false);
                  }
                }}
              >
                {children}
              </div>
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
}
