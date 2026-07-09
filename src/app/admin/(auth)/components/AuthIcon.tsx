type Props = {
  src: string;
};

export default function AuthIcon({ src }: Props) {
  return <span className="auth-icon" aria-hidden="true"><img src={src} alt="" /></span>;
}
