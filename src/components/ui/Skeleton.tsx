import { View, type ViewProps } from 'react-native';

type Props = ViewProps & {
  className?: string;
};

export function Skeleton({ style, className, ...rest }: Props) {
  return <View className={`overflow-hidden rounded-lg bg-surface2 ${className ?? ''}`} style={style} {...rest} />;
}
