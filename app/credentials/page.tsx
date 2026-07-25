import Header from "@/components/Header";
import BadgeCard from "@/components/BadgeCard";

export interface Badge {
  title: string;
  type: "image" | "credly";
  imageUrl?: string;
  viewUrl?: string;
  badgeId?: string;
}

const badges: Badge[] = [
  { title: "Back-End Developer", type: "image", imageUrl: "https://api.badgr.io/public/assertions/I1tehUi7Q2qXPbbGHxknKg/image", viewUrl: "https://api.badgr.io/public/assertions/I1tehUi7Q2qXPbbGHxknKg?identity__email=wrice22%40wgu.edu" },
  { title: "Front-End Developer", type: "image", imageUrl: "https://api.badgr.io/public/assertions/MfpzNtt0QH2D2nP2PSNr8w/image", viewUrl: "https://api.badgr.io/public/assertions/MfpzNtt0QH2D2nP2PSNr8w?identity__email=wrice22%40wgu.edu" },
  { title: "Capstone Excellence Award", type: "image", imageUrl: "https://api.badgr.io/public/assertions/nYyjsdcHTUOAySpCBig09g/image", viewUrl: "https://api.badgr.io/public/assertions/nYyjsdcHTUOAySpCBig09g?identity__email=wrice22%40wgu.edu" },
  { title: "AWS Certified Cloud Practitioner", type: "credly", badgeId: "20acc96e-29fd-4e65-9fb4-7623a80b1be1" },
  { title: "CompTIA Project+", type: "credly", badgeId: "755b3863-f406-4856-8826-648adbd2290b" },
  { title: "CCNA: Introduction to Networks", type: "credly", badgeId: "c14dd41a-037b-4570-9b96-21e642cc90fa" },
];

export default function CredentialsPage() {
  return (
    <>
      <Header><h1>Credentials behind the practice.</h1></Header>
      <section className="section-block">
        <div className="site-shell">
          <div className="section-heading">
            <p className="eyebrow mb-7">Continued development</p>
            <h2>Learning, verified.</h2>
            <p>Graduate education, professional certifications, and achievements that support a broad implementation practice.</p>
          </div>
          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {badges.map((badge) => <BadgeCard key={badge.title} {...badge} />)}
          </div>
        </div>
      </section>
    </>
  );
}
