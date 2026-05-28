type FAQItem = {
  question: string;
  answer: string;
};

type FAQAccordionProps = {
  items: FAQItem[];
};

export function FAQAccordion({ items }: FAQAccordionProps) {
  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <details key={item.question} className="card-surface group p-6">
          <summary className="cursor-pointer list-none text-lg font-semibold text-slate-950">
            <div className="flex items-center justify-between gap-4">
              <span>{item.question}</span>
              <span className="text-2xl text-blue-600 transition group-open:rotate-45">+</span>
            </div>
          </summary>
          <p className="mt-4 leading-7 text-slate-600">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
