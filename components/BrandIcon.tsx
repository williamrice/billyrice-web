import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGithub,
  faGitlab,
  faGoogle,
  faLinkedin,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";

const brandIcons = {
  github: faGithub,
  gitlab: faGitlab,
  google: faGoogle,
  linkedin: faLinkedin,
  x: faXTwitter,
} as const;

export type BrandName = keyof typeof brandIcons;

export default function BrandIcon({
  brand,
  className = "",
}: {
  brand: BrandName;
  className?: string;
}) {
  return (
    <FontAwesomeIcon
      icon={brandIcons[brand]}
      className={className}
      aria-hidden="true"
    />
  );
}
