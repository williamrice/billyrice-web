import { ContactForm } from "@/components/contact-form/ContactForm";
import Header from "@/components/Header";

export default function ContactPage() {
  return (
    <>
      <Header>
        <h1>Let&apos;s solve something consequential.</h1>
      </Header>
      <section className="section-block">
        <div className="site-shell grid gap-12 lg:grid-cols-[.7fr_1.3fr] lg:gap-20">
          <div>
            <p className="eyebrow mb-7">Start a conversation</p>
            <h2 className="text-3xl font-medium tracking-[-.035em] sm:text-4xl">
              Bring the difficult part.
            </h2>
            <p className="mt-6 max-w-md leading-7 text-muted-foreground">
              Tell me about the system, the constraint, or the team challenge.
              I&apos;m especially interested in implementation, applied AI,
              architecture, and technical leadership work.
            </p>
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
