import { useId, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface AccordionItem {
  question: string;
  answer: ReactNode;
}

const AccordionRow = ({ item }: { item: AccordionItem }) => {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className="border-b border-line last:border-b-0">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          id={`${id}-button`}
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center justify-between gap-4 py-4 text-left text-base font-semibold text-fg"
        >
          {item.question}
          <ChevronDown size={20} aria-hidden="true" className={cn('shrink-0 text-muted transition-transform duration-300', open && 'rotate-180')} />
        </button>
      </h3>
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-button`}
        hidden={!open}
        className="pb-4 text-sm leading-relaxed text-muted"
      >
        {item.answer}
      </div>
    </div>
  );
};

export const Accordion = ({ items }: { items: AccordionItem[] }) => (
  <div>
    {items.map((item) => (
      <AccordionRow key={item.question} item={item} />
    ))}
  </div>
);
