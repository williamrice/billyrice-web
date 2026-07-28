import Header from "@/components/Header";
import SecretMessageForm from "@/components/SecretMessageForm";

const SecretMessagePage = () => {
  return (
    <div>
      <Header>
        <div className="h-full flex flex-col items-center justify-center">
          <h1 className="lg:text-6xl text-4xl font-bold text-center text-white">
            Secret Message
          </h1>
        </div>
      </Header>
      <div className="site-shell py-20 sm:py-28">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 border border-border bg-card/50 p-6 sm:p-8">
            <h2 className="mb-4 text-2xl font-medium tracking-tight text-foreground">
              About This Feature
            </h2>
            <div className="space-y-4 leading-7 text-muted-foreground">
              <p>
                I built this secret message feature for myself using C# .NET on
                the backend. It allows you to create encrypted messages that are
                stored securely at rest.
              </p>
              <p>
                When you create a message, it generates a unique link. Once this
                link is viewed, the message is permanently deleted - gone
                forever. Perfect for sharing sensitive information that should
                only be seen once.
              </p>
            </div>
          </div>
          <SecretMessageForm />
        </div>
      </div>
    </div>
  );
};

export default SecretMessagePage;
