
import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.css';

export default function Header(){
  return (
    <header className={styles.wrapper}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="MemoLink Home">
          <Image src="/logo.png" alt="MemoLink logo" width={224} height={56} className={styles.logo} priority />
        </Link>
        <nav className={styles.nav}>
          <Link href="/admin">Admin</Link>
          <Link href="/a">My Tasks</Link>
          <Link href="/api/report">Reports</Link>
        </nav>
      </div>
    </header>
  );
}
