import { UserSettingsForm } from "@/components/user-settings/UserSettingsForm";
import Header from "@/components/Header";

const AccountSettingsPage = () => {
  return (
    <>
      <Header><h1>Account settings.</h1></Header>
      <section className="section-block">
        <div className="site-shell max-w-4xl"><UserSettingsForm /></div>
      </section>
    </>
  );
};

export default AccountSettingsPage;
