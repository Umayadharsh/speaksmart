const WaveAnimation = ({ active = true, color = '#4A90E2', bars = 10, height = 60 }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      height,
    }}>
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 5,
            minHeight: 8,
            borderRadius: 4,
            background: `linear-gradient(180deg, ${color} 0%, ${color}88 100%)`,
            animation: active ? `wave 1.2s ease-in-out infinite` : 'none',
            animationDelay: `${i * 0.08}s`,
            height: active ? undefined : 8,
            transition: 'height 0.3s ease',
          }}
        />
      ))}
    </div>
  );
};

export default WaveAnimation;
