import { getCategoryIconDef } from '@/utils/categoryIcons';
import { colors } from '@/theme';
import { Path, Svg } from 'react-native-svg';

type Props = {
  name: string;
  size?: number;
  accentColor?: string | null;
  color?: string;
};

export function CategoryGlyph({ name, size = 26, accentColor, color }: Props) {
  const def = getCategoryIconDef(name);
  if (!def) {
    return null;
  }
  const stroke =
    accentColor && /^#[0-9A-Fa-f]{6}$/.test(accentColor) ? accentColor : color ?? colors.primaryBright;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {def.paths.map((d, i) => (
        <Path
          key={i}
          d={d}
          stroke={stroke}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
}
