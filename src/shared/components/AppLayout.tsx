import type { ReactNode } from 'react';
import { NavLink } from 'react-router';

import styles from './AppLayout.module.css';

const LINKS = [
  { to: '/', label: 'Fila' },
  { to: '/nova', label: 'Nova ocorrência' },
  { to: '/painel', label: 'Painel' },
];

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <span className={styles.brand}>Central de Ocorrências · Elevadores</span>
        <nav aria-label="Principal">
          <ul className={styles.nav}>
            {LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end
                  className={({ isActive }) => (isActive ? styles.active : styles.link)}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
