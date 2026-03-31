import { Link } from 'react-router-dom';

export function Brand({ className = 'cedfc72fd', titleClassName = 'c23c5dad0' }: { className?: string; titleClassName?: string }) {
  return (
    <Link className={`link-reset ${className}`.trim()} to="/">
      <div className="c9599f3c7">
        <img src="/assets/food-stand.png" alt="Sizzle" width="18" height="18" style={{ filter: 'brightness(0) invert(1)' }} />
      </div>
      <div className={titleClassName}>Sizzle</div>
    </Link>
  );
}
