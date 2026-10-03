import React from 'react';

interface SceneContainerProps {
  children: React.ReactNode;
  className?: string;
  transitionType?: 'normal' | 'cinematic' | 'hard-cut' | 'pop';
  style?: React.CSSProperties;
}

export const SceneContainer: React.FC<SceneContainerProps> = ({
  children,
  className = '',
  transitionType = 'normal',
  style
}) => {
  const getAnimationClass = () => {
    switch (transitionType) {
      case 'cinematic':
        return 'animate-fade-in';
      case 'pop':
        return 'animate-pop-in';
      case 'hard-cut':
        return '';
      case 'normal':
      default:
        return 'animate-fade-in';
    }
  };

  return (
    <main
      className={`scene-container ${getAnimationClass()} ${className}`}
      style={style}
    >
      {children}
    </main>
  );
};
