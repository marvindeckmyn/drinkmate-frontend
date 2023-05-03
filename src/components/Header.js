import React from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import useHeaderVisibility from './hooks/useHeaderVisibility';

const Header = () => {
  const isHeaderVisible = useHeaderVisibility();

  return (
    <header className={`header ${isHeaderVisible ? 'visible' : ''}`}>
      <h1 className="title">DrinkMate</h1>
      <div className="language-switcher">
        <LanguageSwitcher />
      </div>
    </header>
  );
};

export default Header;