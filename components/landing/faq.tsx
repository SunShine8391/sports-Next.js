"use client";

import { useParams } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { useEffect, useRef } from "react";

const faqs = [
  {
    question: "How do I enter my predictions?",
    answer:
      "You can enter your predictions either on the homepage or the Dashboard page. Make sure you submit your scores before the first match begins!",
  },
  {
    question: "Is there a fee to participate in the competition?",
    answer:
      "Yes, to join the competition and be eligible for the prize pot, you need to pay a small entry fee. You can choose to predict without paying the fee but you'll miss out on some great prizes!",
  },
  {
    question: "How is the winner determined?",
    answer:
      "The participant with the most accurate predictions, accumulating the highest points based on match outcomes, will be declared the winner. Check your points regularly to track your progress.",
  },
  {
    question: "When will the competition winners be announced?",
    answer:
      "Winners will be announced shortly after the conclusion of the last match in the matchday week. Stay tuned for updates and notifications within the website. Winners will be contacted via the email they used to log in.",
  },
  {
    question: "Can I change my predictions after submitting them?",
    answer:
      "Once predictions are submitted, they are final. Make sure to review your entries carefully before confirming to ensure accuracy.",
  },
  {
    question: "How is the prize pot distributed in case of ties?",
    answer:
      "In the event of a tie, the prize pot is typically split evenly among the participants who share the same score. Refer to the competition rules for specific tie-breaker details.",
  },
  {
    question: "What happens if a match is cancelled or postponed?",
    answer:
      "In the case of match cancellations or postponements, we will provide updates and the competition rules will specify how these situations are handled in terms of scoring and potential refunds. Most of the time we will remove these matches from the current matchday and add them to the matchday they will take place.",
  },
  // Add more FAQs as needed
];

const FAQ = () => {
  const params = useParams();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && window.location.hash == "#faq") {
      ref.current.scrollIntoView({
        block: "start",
        behavior: "smooth",
        inline: "start",
      });
    }
  }, [params]);

  return (
    <section ref={ref} className="max-w-4xl mx-auto">
      <div className="text-wrap pt-12 flex flex-col items-center justify-center text-center">
        <h2 className="uppercase font-gothic-regular text-7xl md:text-[6rem] font-black tracking-wider text-white md:max-w-5xl">
          FAQS
        </h2>
        <p className="text-base md:text-lg max-w-2xl my-4">
          We&apos;ve gathered answers to the most frequently asked questions to
          ensure your experience with us is as smooth and delightful as
          possible!
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-2 my-8">
        {faqs.map((faq, i) => (
          <AccordionItem
            key={i}
            value={faq.question}
            className="border-b-[0.5px] border-muted-foreground"
          >
            <AccordionTrigger className="hover:no-underline text-left gap-2">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-white/60">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};

export default FAQ;
