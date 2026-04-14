import { View, type ViewProps } from 'react-native';

type Props = ViewProps & {
  className?: string;
};

export function Card({ style, className, ...rest }: Props) {
  return (
    <View
      className={`rounded-2xl border border-border bg-surface p-4 ${className ?? ''}`}
      style={style}
      {...rest}
    />
  );
}
