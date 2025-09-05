import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How do I earn rewards by paying bills?",
    answer: "Simply add your bills to our platform and pay them through our secure system. You'll automatically earn points for every payment, which can be redeemed for cash back, gift cards, or exclusive rewards."
  },
  {
    question: "Is my financial information secure?",
    answer: "Absolutely. We use bank-level encryption and security measures to protect your data. Your payment information is never stored on our servers, and all transactions are processed through secure, encrypted channels."
  },
  {
    question: "What types of bills can I pay through the platform?",
    answer: "You can pay virtually any recurring bill including utilities, credit cards, rent, insurance, phone bills, subscriptions, and more. Our system supports most major billers and payment types."
  },
  {
    question: "How do rewards points work?",
    answer: "You earn points for every bill payment made through our platform. Points can be redeemed for cash back, gift cards, travel rewards, or exclusive experiences. The more you pay, the more you earn!"
  },
  {
    question: "Can I set up automatic bill payments?",
    answer: "Yes! You can enable auto-pay for any of your bills. We'll automatically pay your bills on the due date and send you notifications. You'll still earn rewards on all auto-pay transactions."
  },
  {
    question: "What happens if a payment fails?",
    answer: "If a payment fails, we'll immediately notify you via email and app notification. You can retry the payment or update your payment method. We also provide grace periods to help you avoid late fees."
  },
  {
    question: "Are there any fees for using the service?",
    answer: "Our basic bill tracking and reminder service is free. Premium features like instant rewards redemption and priority customer support are available with our paid plans starting at $4.99/month."
  },
  {
    question: "How quickly are rewards credited to my account?",
    answer: "Rewards are typically credited within 24-48 hours of a successful payment. For some premium accounts, rewards may be credited instantly upon payment confirmation."
  },
  {
    question: "Can I invite friends and family to join?",
    answer: "Yes! Our referral program rewards you when friends and family join using your referral code. You'll both receive bonus points that can be redeemed for rewards."
  },
  {
    question: "How do I redeem my rewards?",
    answer: "You can redeem rewards directly from your dashboard. Choose from cash back (deposited to your bank account), gift cards from popular retailers, or exclusive experiences and offers."
  }
];

const FAQSection = () => {
  return (
    <section className="py-16 px-4 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4 leading-9">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about managing bills and earning rewards
          </p>
        </div>
        
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="border border-border/50 rounded-lg px-6 bg-card/50 backdrop-blur-sm"
            >
              <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        
        <div className="text-center mt-12 p-8 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border border-border/50">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Still have questions?
          </h3>
          <p className="text-muted-foreground mb-4">
            Our customer support team is here to help you 24/7
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:support@billrewards.com" 
              className="inline-flex items-center justify-center px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Email Support
            </a>
            <a 
              href="tel:1-800-REWARDS" 
              className="inline-flex items-center justify-center px-6 py-2 border border-border text-foreground rounded-lg hover:bg-muted/50 transition-colors font-medium"
            >
              Call Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;